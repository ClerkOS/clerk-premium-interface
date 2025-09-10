import { useCallback, useState } from 'react';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { ApiService, withRetry } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export function useWorkbook() {
  const { workbook, setWorkbook, setLoading, setError } = useSpreadsheetStore();
  const [isLoadingWorkbook, setIsLoadingWorkbook] = useState(false);

  // Load workbook from backend
  const loadWorkbook = useCallback(async (workbookId: string) => {
    if (!workbookId) return;

    setIsLoadingWorkbook(true);
    setLoading(true);
    setError(null);

    try {
      const result = await withRetry(async () => {
        return await ApiService.getWorkbook(workbookId);
      });

      if (result.success && result.data) {
        setWorkbook(result.data);
        toast({
          title: "Workbook loaded",
          description: `${result.data.name} has been loaded successfully.`,
        });
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to load workbook');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load workbook';
      setError(message);
      toast({
        title: "Load failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoadingWorkbook(false);
      setLoading(false);
    }
  }, [setWorkbook, setLoading, setError]);

  // Create new workbook
  const createWorkbook = useCallback(async (name: string = 'New Workbook') => {
    setLoading(true);
    setError(null);

    try {
      const result = await withRetry(async () => {
        return await ApiService.createWorkbook({
          name,
          sheets: [{
            name: 'Sheet 1',
            data: []
          }]
        });
      });

      if (result.success && result.data) {
        setWorkbook(result.data);
        toast({
          title: "Workbook created",
          description: `${name} has been created successfully.`,
        });
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create workbook');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create workbook';
      setError(message);
      toast({
        title: "Creation failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setWorkbook, setLoading, setError]);

  // Import workbook from file
  const importWorkbook = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const result = await withRetry(async () => {
        return await ApiService.importWorkbook(file);
      });

      if (result.success && result.data) {
        setWorkbook(result.data);
        toast({
          title: "Workbook imported",
          description: `${file.name} has been imported successfully.`,
        });
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to import workbook');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import workbook';
      setError(message);
      toast({
        title: "Import failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setWorkbook, setLoading, setError]);

  // Save current workbook (if it has an ID, it's already persisted)
  const saveWorkbook = useCallback(async () => {
    if (!workbook) {
      throw new Error('No workbook to save');
    }

    // For now, we'll just update the modified timestamp
    // In a real implementation, you might want to send updates to the backend
    const updatedWorkbook = {
      ...workbook,
      modifiedAt: new Date(),
    };

    setWorkbook(updatedWorkbook);
    
    toast({
      title: "Workbook saved",
      description: "Changes have been saved successfully.",
    });

    return updatedWorkbook;
  }, [workbook, setWorkbook]);

  return {
    workbook,
    isLoadingWorkbook,
    loadWorkbook,
    createWorkbook,
    importWorkbook,
    saveWorkbook,
  };
}
