import { useState, useEffect, useCallback } from 'react';
import { Calculator, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';

interface FormulaBarProps {
  className?: string;
}

export function FormulaBar({ className }: FormulaBarProps) {
  const [formula, setFormula] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { 
    workbook, 
    activeCell, 
    updateCell, 
    showFormulaBar, 
    toggleFormulaBar 
  } = useSpreadsheetStore();

  const activeSheet = workbook?.sheets.find(s => s.id === workbook.activeSheetId);
  
  // Get current cell value and formula
  const currentCell = activeSheet && activeCell ? 
    (() => {
      const [rowIndex, colIndex] = activeCell.split('-').slice(1).map(Number);
      return activeSheet.rows[rowIndex]?.cells[colIndex];
    })() : null;

  // Update formula when active cell changes
  useEffect(() => {
    if (currentCell) {
      setFormula(currentCell.formula || String(currentCell.value || ''));
    } else {
      setFormula('');
    }
  }, [currentCell]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeCell || !formula.trim()) return;

    // Determine if it's a formula (starts with =) or a value
    const isFormula = formula.trim().startsWith('=');
    const value = isFormula ? formula.trim().slice(1) : formula.trim();
    
    // For now, just update with the raw value
    // In a real implementation, you'd evaluate the formula
    updateCell(activeCell, isFormula ? 0 : value, isFormula ? formula : undefined);
  }, [activeCell, formula, updateCell]);

  const getCellReference = useCallback(() => {
    if (!activeCell) return '';
    
    const [rowIndex, colIndex] = activeCell.split('-').slice(1).map(Number);
    const columnLetter = String.fromCharCode(65 + colIndex);
    return `${columnLetter}${rowIndex + 1}`;
  }, [activeCell]);

  if (!showFormulaBar) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="flex items-center justify-between p-2 border-b bg-card"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFormulaBar}
          className="text-muted-foreground"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Show Formula Bar
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={`p-3 border-b bg-card ${className}`}
      >
        <div className="flex items-center gap-3">
          {/* Cell reference */}
          <div className="flex items-center gap-2 min-w-20">
            {activeCell && (
              <Badge variant="outline" className="font-mono text-xs">
                {getCellReference()}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFormulaBar}
              className="w-6 h-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          {/* Formula input */}
          <form onSubmit={handleSubmit} className="flex-1">
            <div className="relative">
              <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={activeCell ? "Enter formula or value..." : "Select a cell to edit"}
                className={`pl-10 font-mono transition-all duration-200 ${
                  isFocused ? 'ring-2 ring-primary/20' : ''
                }`}
                disabled={!activeCell}
              />
            </div>
          </form>

          {/* Current cell value preview */}
          {currentCell && currentCell.value && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm text-muted-foreground font-mono min-w-20 text-right"
            >
              = {String(currentCell.value)}
            </motion.div>
          )}
        </div>

        {/* Formula suggestions or help */}
        <AnimatePresence>
          {isFocused && formula.startsWith('=') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 text-xs text-muted-foreground"
            >
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">SUM(A1:A10)</Badge>
                <Badge variant="secondary">AVERAGE(A1:A10)</Badge>
                <Badge variant="secondary">COUNT(A1:A10)</Badge>
                <Badge variant="secondary">MAX(A1:A10)</Badge>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}