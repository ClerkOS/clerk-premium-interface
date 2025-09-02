import { useCallback } from 'react';
import { FileSpreadsheet, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';

interface NewWorkbookButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function NewWorkbookButton({ className, variant = 'default' }: NewWorkbookButtonProps) {
  const { setWorkbook, setLoading, setError } = useSpreadsheetStore();

  const createNewWorkbook = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      // Create a new empty workbook
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
        className={className}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Workbook</span>
        </motion.div>
      </Button>
    </motion.div>
  );
}
