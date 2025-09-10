import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { FileParser } from '@/lib/parsers';
import { ApiService, withRetry } from '@/lib/api';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';

interface UploadButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function UploadButton({ className, variant = 'default' }: UploadButtonProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { setWorkbook, setLoading, setError } = useSpreadsheetStore();

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setLoading(true);
    setError(null);

    try {
      // Try backend import first
      try {
        const result = await withRetry(async () => {
          return await ApiService.importWorkbook(file);
        });

        if (result.success && result.data) {
          setWorkbook(result.data);
          toast({
            title: "File uploaded successfully",
            description: `${file.name} has been imported with ${result.data.sheets.length} sheet(s).`,
          });
          return;
        }
      } catch (error) {
        console.warn('Backend import failed, falling back to client-side parsing:', error);
      }

      // Fallback to client-side parsing
      const result = await FileParser.parseFile(file);
      
      if (result.success && result.workbook) {
        setWorkbook(result.workbook);
        toast({
          title: "File uploaded successfully",
          description: `${file.name} has been loaded with ${result.workbook.sheets.length} sheet(s).`,
        });

        // Show AI suggestions if available
        if (result.suggestions && result.suggestions.length > 0) {
          setTimeout(() => {
            toast({
              title: "AI Suggestions Available",
              description: result.suggestions![0],
            });
          }, 1000);
        }
      } else {
        setError(result.error || 'Failed to parse file');
        toast({
          title: "Upload failed",
          description: result.error || 'Failed to parse file',
          variant: "destructive",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setError(message);
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  }, [setWorkbook, setLoading, setError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFile(file);
      }
    };
    input.click();
  }, [handleFile]);

  return (
    <motion.div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      animate={{ scale: isDragging ? 1.02 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <Button
        onClick={handleClick}
        variant={variant}
        disabled={isUploading}
        className={className}
      >
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading...</span>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              {isDragging ? (
                <FileSpreadsheet className="w-4 h-4" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>
                {isDragging ? 'Drop here' : 'Upload CSV/Excel'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}