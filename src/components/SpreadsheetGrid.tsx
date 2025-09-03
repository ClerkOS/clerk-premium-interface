import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { Input } from '@/components/ui/input';

// Virtualization constants
const CELL_WIDTH = 128; // w-32 = 128px
const CELL_HEIGHT = 32; // h-8 = 32px
const VIEWPORT_BUFFER = 5; // Extra cells to render for smooth scrolling

interface SpreadsheetGridProps {
  className?: string;
}

export function SpreadsheetGrid({ className }: SpreadsheetGridProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [scroll, setScroll] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 800, height: 400 });
  const [selectionAnchor, setSelectionAnchor] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastMouseClient = useRef<{ x: number; y: number } | null>(null);
  const autoScrollRAF = useRef<number | null>(null);
  
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { 
    workbook, 
    selectedCells, 
    activeCell, 
    selectCell, 
    updateCell,
    gridViewport,
    setGridViewport,
    selectCells,
  } = useSpreadsheetStore();

  const activeSheet = workbook?.sheets.find(s => s.id === workbook.activeSheetId);

  // Virtualization math
  // -------------------------
  
  // Number of rows/cols visible at once + buffer
  const visibleCols = Math.ceil(size.width / CELL_WIDTH) + VIEWPORT_BUFFER;
  const visibleRows = Math.ceil(size.height / CELL_HEIGHT) + VIEWPORT_BUFFER;

  // Which row/col indexes to start rendering from
  const startCol = Math.floor(scroll.x / CELL_WIDTH);
  const startRow = Math.floor(scroll.y / CELL_HEIGHT);

  // Pre-create the cell pool (reuse DOM nodes instead of creating new ones)
  const cellPool = useMemo(() => {
    const pool = [];
    for (let i = 0; i < visibleRows * visibleCols; i++) {
      pool.push({ row: 0, col: 0 });
    }
    return pool;
  }, [visibleCols, visibleRows]);

  // Update pool's actual row/col coordinates
  for (let i = 0; i < cellPool.length; i++) {
    const rowOffset = Math.floor(i / visibleCols);
    const colOffset = i % visibleCols;
    cellPool[i].row = startRow + rowOffset;
    cellPool[i].col = startCol + colOffset;
  }

  // Current raw scroll values
  const scrollX = scrollContainerRef.current?.scrollLeft ?? 0;
  const scrollY = scrollContainerRef.current?.scrollTop ?? 0;

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const scrollTop = scrollContainerRef.current.scrollTop;
      setScroll({ x: scrollLeft, y: scrollTop });
    }
  }, []);

  // Handle resize events
  const handleResize = useCallback(() => {
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    }
  }, []);

  // Set up scroll and resize listeners
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Update viewport in store when scroll changes
  useEffect(() => {
    const endCol = Math.min(startCol + visibleCols, 26);
    const endRow = Math.min(startRow + visibleRows, activeSheet?.rows.length || 100);
    
    setGridViewport({
      startRow,
      endRow,
      startCol,
      endCol,
    });
  }, [startRow, startCol, visibleRows, visibleCols, activeSheet?.rows.length, setGridViewport]);

  // Helpers for selection math
  const parseId = (cellId: string) => {
    const [r, c] = cellId.split('-').slice(1).map(Number);
    return { row: r, col: c };
  };

  const generateRangeIds = (a: string, b: string) => {
    const { row: r1, col: c1 } = parseId(a);
    const { row: r2, col: c2 } = parseId(b);
    const rowStart = Math.min(r1, r2);
    const rowEnd = Math.max(r1, r2);
    const colStart = Math.min(c1, c2);
    const colEnd = Math.max(c1, c2);
    const ids: string[] = [];
    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        ids.push(`cell-${r}-${c}`);
      }
    }
    return ids;
  };

  // Handle cell click with multi-select support
  const handleCellClick = useCallback((e: React.MouseEvent, cellId: string) => {
    setEditingCell(null);
    // Shift-click: range selection from anchor or active cell
    if (e.shiftKey && (selectionAnchor || activeCell)) {
      const anchor = selectionAnchor || activeCell!;
      const ids = generateRangeIds(anchor, cellId);
      selectCells(ids);
      return;
    }

    // Ctrl/Cmd-click: toggle individual selection
    if (e.metaKey || e.ctrlKey) {
      const exists = selectedCells.includes(cellId);
      const next = exists ? selectedCells.filter(id => id !== cellId) : [...selectedCells, cellId];
      selectCells(next);
      if (!selectionAnchor) setSelectionAnchor(cellId);
      return;
    }

    // Default: single selection and set new anchor
    selectCell(cellId);
    setSelectionAnchor(cellId);
  }, [activeCell, selectedCells, selectionAnchor, selectCell, selectCells]);

  // Compute cell id from mouse position within the scroll container
  const getCellIdFromMouseEvent = useCallback((e: React.MouseEvent | MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container || !activeSheet) return null;
    const rect = container.getBoundingClientRect();
    const x = (e as MouseEvent).clientX - rect.left + container.scrollLeft;
    const y = (e as MouseEvent).clientY - rect.top + container.scrollTop;
    const col = Math.max(0, Math.min(25, Math.floor(x / CELL_WIDTH)));
    const row = Math.max(0, Math.min((activeSheet.rows.length || 1) - 1, Math.floor(y / CELL_HEIGHT)));
    return `cell-${row}-${col}`;
  }, [activeSheet]);

  const getCellIdFromClient = useCallback((clientX: number, clientY: number) => {
    const container = scrollContainerRef.current;
    if (!container || !activeSheet) return null;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left + container.scrollLeft;
    const y = clientY - rect.top + container.scrollTop;
    const col = Math.max(0, Math.min(25, Math.floor(x / CELL_WIDTH)));
    const row = Math.max(0, Math.min((activeSheet.rows.length || 1) - 1, Math.floor(y / CELL_HEIGHT)));
    return `cell-${row}-${col}`;
  }, [activeSheet]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRAF.current) {
      cancelAnimationFrame(autoScrollRAF.current);
      autoScrollRAF.current = null;
    }
  }, []);

  const autoScrollStep = useCallback(() => {
    if (!isDragging || !lastMouseClient.current || !scrollContainerRef.current) {
      autoScrollRAF.current = null;
      return;
    }
    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    const { x: clientX, y: clientY } = lastMouseClient.current;
    const threshold = 40;

    let dx = 0;
    let dy = 0;
    if (clientX < rect.left + threshold) dx = -Math.ceil((threshold - (clientX - rect.left)) / 4);
    else if (clientX > rect.right - threshold) dx = Math.ceil((threshold - (rect.right - clientX)) / 4);
    if (clientY < rect.top + threshold) dy = -Math.ceil((threshold - (clientY - rect.top)) / 4);
    else if (clientY > rect.bottom - threshold) dy = Math.ceil((threshold - (rect.bottom - clientY)) / 4);

    if (dx !== 0 || dy !== 0) {
      container.scrollLeft = Math.max(0, Math.min(container.scrollWidth - container.clientWidth, container.scrollLeft + dx));
      container.scrollTop = Math.max(0, Math.min(container.scrollHeight - container.clientHeight, container.scrollTop + dy));
      // Update selection while autoscrolling
      if (selectionAnchor) {
        const id = getCellIdFromClient(clientX, clientY);
        if (id) {
          const ids = generateRangeIds(selectionAnchor, id);
          selectCells(ids);
        }
      }
      autoScrollRAF.current = requestAnimationFrame(autoScrollStep);
    } else {
      autoScrollRAF.current = null;
    }
  }, [getCellIdFromClient, isDragging, selectCells, selectionAnchor]);

  // Drag selection handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only left click
    if (e.button !== 0) return;
    const startId = getCellIdFromMouseEvent(e);
    if (!startId) return;
    setIsDragging(true);
    setSelectionAnchor(startId);
    selectCell(startId);
    // Prevent text selection
    e.preventDefault();
    lastMouseClient.current = { x: e.clientX, y: e.clientY };
    if (!autoScrollRAF.current) {
      autoScrollRAF.current = requestAnimationFrame(autoScrollStep);
    }
  }, [getCellIdFromMouseEvent, selectCell, autoScrollStep]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectionAnchor) return;
    const currId = getCellIdFromMouseEvent(e);
    if (!currId) return;
    const ids = generateRangeIds(selectionAnchor, currId);
    selectCells(ids);
    lastMouseClient.current = { x: e.clientX, y: e.clientY };
  }, [isDragging, selectionAnchor, getCellIdFromMouseEvent, selectCells]);

  const endDrag = useCallback(() => {
    if (isDragging) setIsDragging(false);
    stopAutoScroll();
  }, [isDragging, stopAutoScroll]);

  useEffect(() => {
    const onUp = (e: MouseEvent) => endDrag();
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, [endDrag]);

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
        if (e.shiftKey && (selectionAnchor || activeCell)) {
          const anchor = selectionAnchor || activeCell;
          const ids = generateRangeIds(anchor, newCellId);
          selectCells(ids);
        } else {
          selectCell(newCellId);
          setSelectionAnchor(newCellId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, editingCell, activeSheet, selectionAnchor, selectCell, selectCells, handleCellDoubleClick]);

  // Virtualization logic - only render visible cells
  const visibleRowsData = activeSheet?.rows.slice(
    gridViewport.startRow, 
    gridViewport.endRow
  ) || [];

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
    <div className={`overflow-hidden border-2 border-primary/20 rounded-lg bg-background shadow-sm ${className}`} ref={gridRef}>
      {/* Virtualized Column headers */}
      <div className="flex border-b bg-grid-header sticky top-0 z-10">
        {/* Corner cell */}
        <div className="w-12 h-8 border-r grid-header flex items-center justify-center">
          <div className="w-3 h-3 bg-muted-foreground/20 rounded-sm" />
        </div>
        
        {/* Virtualized Column headers */}
        <div className="flex-1 overflow-hidden relative">
          <div 
            className="flex"
            style={{ 
              width: `${26 * CELL_WIDTH}px`,
              transform: `translateX(-${scroll.x}px)`
            }}
          >
            {Array.from({ length: 26 }, (_, colIndex) => {
              const header = String.fromCharCode(65 + colIndex);
              
              return (
                <motion.div
                  key={header}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: colIndex * 0.02 }}
                  style={{
                    width: `${CELL_WIDTH}px`,
                  }}
                  className="h-8 grid-header flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-grid-hover border-r"
                >
                  {header}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Virtualized Grid Container */}
      <div className="flex">
        {/* Row Headers */}
        <div className="w-12 bg-grid-header border-r overflow-hidden virtualized-grid">
          <div 
            style={{
              height: `${(activeSheet?.rows.length || 100) * CELL_HEIGHT}px`,
              transform: `translateY(-${scroll.y}px)`
            }}
          >
            {Array.from({ length: activeSheet?.rows.length || 100 }, (_, rowIndex) => {
              return (
                <div
                  key={`row-header-${rowIndex}`}
                  style={{
                    height: `${CELL_HEIGHT}px`,
                  }}
                  className="grid-header flex items-center justify-center text-xs font-medium border-b"
                >
                  {rowIndex + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Virtualized Grid */}
        <div 
          className={`overflow-auto relative flex-1 virtualized-grid ${isDragging ? 'select-none' : ''}`}
          ref={scrollContainerRef}
          style={{
            height: `${Math.min(size.height, 400)}px`,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          {/* Total grid size for proper scrolling */}
          <div 
            style={{
              width: `${26 * CELL_WIDTH}px`,
              height: `${(activeSheet?.rows.length || 100) * CELL_HEIGHT}px`,
              position: 'relative'
            }}
          >
            {/* Render only visible cells using the cell pool */}
            {cellPool.map((cellPos, index) => {
              const { row, col } = cellPos;
              
              // Skip if outside valid range
              if (row >= (activeSheet?.rows.length || 0) || col >= 26) {
                return null;
              }

              const cell = activeSheet?.rows[row]?.cells[col];
              if (!cell) return null;

              const isSelected = selectedCells.includes(cell.id);
              const isActive = activeCell === cell.id;
              const isEditing = editingCell === cell.id;

              return (
                <div
                  key={`${row}-${col}`}
                  style={{
                    position: 'absolute',
                    left: `${col * CELL_WIDTH}px`,
                    top: `${row * CELL_HEIGHT}px`,
                    width: `${CELL_WIDTH}px`,
                    height: `${CELL_HEIGHT}px`,
                  }}
                  className={`
                    grid-cell relative cursor-pointer transition-all duration-150 border-r border-b
                    ${isSelected ? 'grid-cell-selected' : ''}
                    ${isActive ? 'ring-2 ring-primary ring-offset-1' : ''}
                  `}
                  onClick={(e) => handleCellClick(e, cell.id)}
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
          </div>
        </div>
      </div>
    </div>
  );
}