import { useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { Input } from '@/components/ui/input';

interface SpreadsheetGridProps {
  className?: string;
}

export function SpreadsheetGrid({ className }: SpreadsheetGridProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);
  const { 
    workbook, 
    selectedCells, 
    activeCell, 
    selectCell, 
    updateCell,
    gridViewport,
    setGridViewport,
  } = useSpreadsheetStore();

  const activeSheet = workbook?.sheets.find(s => s.id === workbook.activeSheetId);

  // Handle cell click
  const handleCellClick = useCallback((cellId: string) => {
    selectCell(cellId);
    setEditingCell(null);
  }, [selectCell]);

  // Handle cell double-click for editing
  const handleCellDoubleClick = useCallback((cellId: string, currentValue: any) => {
    setEditingCell(cellId);
    setEditValue(String(currentValue || ''));
  }, []);

  // Handle edit submission
  const handleEditSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (editingCell) {
      updateCell(editingCell, editValue);
      setEditingCell(null);
      setEditValue('');
    }
  }, [editingCell, editValue, updateCell]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCell || editingCell) return;

      const [rowIndex, colIndex] = activeCell.split('-').slice(1).map(Number);
      let newRowIndex = rowIndex;
      let newColIndex = colIndex;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newRowIndex = Math.max(0, rowIndex - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newRowIndex = Math.min(99, rowIndex + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newColIndex = Math.max(0, colIndex - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newColIndex = Math.min(25, colIndex + 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (activeSheet) {
            const cell = activeSheet.rows[rowIndex]?.cells[colIndex];
            handleCellDoubleClick(activeCell, cell?.value);
          }
          break;
        case 'Escape':
          setEditingCell(null);
          setEditValue('');
          break;
      }

      if (newRowIndex !== rowIndex || newColIndex !== colIndex) {
        const newCellId = `cell-${newRowIndex}-${newColIndex}`;
        selectCell(newCellId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, editingCell, activeSheet, selectCell, handleCellDoubleClick]);

  // Generate column headers
  const columnHeaders = Array.from({ length: 26 }, (_, i) => 
    String.fromCharCode(65 + i)
  );

  // Virtualization logic - only render visible cells
  const visibleRows = activeSheet?.rows.slice(
    gridViewport.startRow, 
    gridViewport.endRow
  ) || [];

  const visibleColumns = columnHeaders.slice(
    gridViewport.startCol,
    gridViewport.endCol
  );

  if (!activeSheet) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">No data loaded</p>
          <p className="text-sm">Upload a CSV or Excel file to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden border rounded-lg bg-background ${className}`}>
      {/* Column headers */}
      <div className="flex border-b bg-grid-header sticky top-0 z-10">
        {/* Corner cell */}
        <div className="w-12 h-8 border-r grid-header flex items-center justify-center">
          <div className="w-3 h-3 bg-muted-foreground/20 rounded-sm" />
        </div>
        
        {/* Column headers */}
        {visibleColumns.map((header, index) => (
          <motion.div
            key={header}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            className="w-32 h-8 grid-header flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-grid-hover"
          >
            {header}
          </motion.div>
        ))}
      </div>

      {/* Grid rows */}
      <div className="overflow-auto max-h-96" ref={gridRef}>
        {visibleRows.map((row, rowIndex) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: rowIndex * 0.01 }}
            className="flex"
          >
            {/* Row header */}
            <div className="w-12 h-8 grid-header flex items-center justify-center text-xs font-medium">
              {gridViewport.startRow + rowIndex + 1}
            </div>

            {/* Row cells */}
            {row.cells.slice(gridViewport.startCol, gridViewport.endCol).map((cell, cellIndex) => {
              const isSelected = selectedCells.includes(cell.id);
              const isActive = activeCell === cell.id;
              const isEditing = editingCell === cell.id;

              return (
                <div
                  key={cell.id}
                  className={`
                    w-32 h-8 grid-cell relative cursor-pointer transition-all duration-150
                    ${isSelected ? 'grid-cell-selected' : ''}
                    ${isActive ? 'ring-2 ring-primary ring-offset-1' : ''}
                  `}
                  onClick={() => handleCellClick(cell.id)}
                  onDoubleClick={() => handleCellDoubleClick(cell.id, cell.value)}
                >
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.form
                        key="editing"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.95 }}
                        onSubmit={handleEditSubmit}
                        className="w-full h-full"
                      >
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => {
                            handleEditSubmit({ preventDefault: () => {} } as React.FormEvent);
                          }}
                          className="w-full h-full border-0 bg-transparent px-2 text-xs focus:ring-0"
                          autoFocus
                        />
                      </motion.form>
                    ) : (
                      <motion.div
                        key="display"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center px-2 h-full text-xs overflow-hidden"
                      >
                        {cell.value && (
                          <motion.span
                            key={String(cell.value)}
                            initial={{ rotateX: -90, filter: 'blur(2px)' }}
                            animate={{ rotateX: 0, filter: 'blur(0px)' }}
                            transition={{ duration: 0.3 }}
                            className="truncate"
                          >
                            {String(cell.value)}
                          </motion.span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Selection indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="active-cell"
                      className="absolute inset-0 border-2 border-primary pointer-events-none"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
              );
            })}
          </motion.div>
        ))}
      </div>
    </div>
  );
}