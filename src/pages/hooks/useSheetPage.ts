import { useMemo } from 'react';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';

export const useSheetPage = () => {
  const { workbook, isLoading } = useSpreadsheetStore();

  const sheetCountLabel = useMemo(() => {
    if (!workbook) return '';
    const count = workbook.sheets.length;
    return `${count} sheet${count !== 1 ? 's' : ''}`;
  }, [workbook]);

  const workbookName = workbook?.name || 'Clerk';

  return {
    workbook,
    isLoading,
    sheetCountLabel,
    workbookName,
  };
};


