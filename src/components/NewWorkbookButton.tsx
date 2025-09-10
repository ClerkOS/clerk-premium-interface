import { useCallback, useState } from 'react';
import { FileSpreadsheet, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ApiService, withRetry } from '@/lib/api';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';

interface NewWorkbookButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function NewWorkbookButton({ className, variant = 'default' }: NewWorkbookButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { setWorkbook, setLoading, setError } = useSpreadsheetStore();

  const createNewWorkbook = useCallback(async () => {
    setIsCreating(true);
    setLoading(true);
    setError(null);

    try {
      // Try backend creation first
      try {
        const result = await withRetry(async () => {
          return await ApiService.createWorkbook({
            name: 'New Workbook',
            sheets: [{
              name: 'Sheet 1',
              data: []
            }]
          });
        });

        if (result.success && result.data) {
          setWorkbook(result.data);
          toast({
            title: "New workbook created",
            description: "Start building your spreadsheet from scratch!",
          });
          return;
        }
      } catch (error) {
        console.warn('Backend creation failed, falling back to client-side creation:', error);
      }

      // Fallback to client-side creation
      const newWorkbook = {
        id: `workbook-${Date.now()}`,
        name: 'New Workbook',
        sheets: [
          {
            id: 'sheet-1',
            name: 'Sheet 1',
            rows: Array.from({ length: 100 }, (_, rowIndex) => ({
              id: `row-${rowIndex}`,
              cells: Array.from({ length: 26 }, (_, colIndex) => ({
                id: `cell-${rowIndex}-${colIndex}`,
                value: '',
                type: 'text',
                row: rowIndex,
                column: colIndex,
              })),
            })),
            columns: Array.from({ length: 26 }, (_, index) => ({
              id: `col-${index}`,
              name: String.fromCharCode(65 + index),
              width: 120,
              type: 'text',
            })),
            selectedCells: [],
            activeCell: null,
          },
        ],
        activeSheetId: 'sheet-1',
        createdAt: new Date(),
        modifiedAt: new Date(),
      };

      setWorkbook(newWorkbook);
      
      toast({
        title: "New workbook created",
        description: "Start building your spreadsheet from scratch!",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create workbook';
      setError(message);
      toast({
        title: "Creation failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
      setLoading(false);
    }
  }, [setWorkbook, setLoading, setError]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <Button
        onClick={createNewWorkbook}
        variant={variant}
        disabled={isCreating}
        className={className}
      >
        <AnimatePresence mode="wait">
          {isCreating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating...</span>
            </motion.div>
          ) : (
            <motion.div
              key="create"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Workbook</span>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
