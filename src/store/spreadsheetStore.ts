import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Workbook, Sheet, Cell, AICommand, AIResponse, Insight } from '@/types';

interface SpreadsheetState {
  // Core data
  workbook: Workbook | null;
  isLoading: boolean;
  error: string | null;
  
  // UI state
  selectedCells: string[];
  activeCell: string | null;
  showFormulaBar: boolean;
  gridViewport: {
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
  };
  
  // AI state
  aiCommands: AICommand[];
  aiResponses: AIResponse[];
  isAiProcessing: boolean;
  showAiSuggestions: boolean;
  
  // Actions
  setWorkbook: (workbook: Workbook) => void;
  setActiveSheet: (sheetId: string) => void;
  selectCell: (cellId: string) => void;
  selectCells: (cellIds: string[]) => void;
  updateCell: (cellId: string, value: string | number, formula?: string) => void;
  addSheet: (name: string) => void;
  removeSheet: (sheetId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // AI actions
  addAiCommand: (command: AICommand) => void;
  addAiResponse: (response: AIResponse) => void;
  setAiProcessing: (processing: boolean) => void;
  toggleAiSuggestions: () => void;
  
  // Grid actions
  setGridViewport: (viewport: { startRow: number; endRow: number; startCol: number; endCol: number }) => void;
  toggleFormulaBar: () => void;
}

export const useSpreadsheetStore = create<SpreadsheetState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    workbook: null,
    isLoading: false,
    error: null,
    selectedCells: [],
    activeCell: null,
    showFormulaBar: true,
    gridViewport: {
      startRow: 0,
      endRow: 50,
      startCol: 0,
      endCol: 20,
    },
    aiCommands: [],
    aiResponses: [],
    isAiProcessing: false,
    showAiSuggestions: false,
    
    // Actions
    setWorkbook: (workbook) => set({ workbook, error: null }),
    
    setActiveSheet: (sheetId) => set((state) => {
      if (!state.workbook) return state;
      return {
        workbook: {
          ...state.workbook,
          activeSheetId: sheetId,
        },
        selectedCells: [],
        activeCell: null,
      };
    }),
    
    selectCell: (cellId) => set({ 
      selectedCells: [cellId], 
      activeCell: cellId 
    }),
    
    selectCells: (cellIds) => set({ 
      selectedCells: cellIds,
      activeCell: cellIds[0] || null 
    }),
    
    updateCell: (cellId, value, formula) => set((state) => {
      if (!state.workbook) return state;
      
      const workbook = { ...state.workbook };
      const activeSheet = workbook.sheets.find(s => s.id === workbook.activeSheetId);
      
      if (!activeSheet) return state;
      
      // Find and update the cell
      const [rowIndex, colIndex] = cellId.split('-').slice(1).map(Number);
      const row = activeSheet.rows[rowIndex];
      
      if (row && row.cells[colIndex]) {
        row.cells[colIndex] = {
          ...row.cells[colIndex],
          value,
          formula,
          type: formula ? 'formula' : typeof value === 'number' ? 'number' : 'text',
        };
      }
      
      workbook.modifiedAt = new Date();
      
      return { workbook };
    }),
    
    addSheet: (name) => set((state) => {
      if (!state.workbook) return state;
      
      const newSheet: Sheet = {
        id: `sheet-${Date.now()}`,
        name,
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
      };
      
      const workbook = {
        ...state.workbook,
        sheets: [...state.workbook.sheets, newSheet],
        activeSheetId: newSheet.id,
        modifiedAt: new Date(),
      };
      
      return { workbook };
    }),
    
    removeSheet: (sheetId) => set((state) => {
      if (!state.workbook || state.workbook.sheets.length <= 1) return state;
      
      const sheets = state.workbook.sheets.filter(s => s.id !== sheetId);
      const activeSheetId = state.workbook.activeSheetId === sheetId 
        ? sheets[0]?.id 
        : state.workbook.activeSheetId;
      
      const workbook = {
        ...state.workbook,
        sheets,
        activeSheetId,
        modifiedAt: new Date(),
      };
      
      return { workbook };
    }),
    
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    
    // AI actions
    addAiCommand: (command) => set((state) => ({
      aiCommands: [...state.aiCommands, command]
    })),
    
    addAiResponse: (response) => set((state) => ({
      aiResponses: [...state.aiResponses, response]
    })),
    
    setAiProcessing: (isAiProcessing) => set({ isAiProcessing }),
    toggleAiSuggestions: () => set((state) => ({ 
      showAiSuggestions: !state.showAiSuggestions 
    })),
    
    // Grid actions
    setGridViewport: (gridViewport) => set({ gridViewport }),
    toggleFormulaBar: () => set((state) => ({ 
      showFormulaBar: !state.showFormulaBar 
    })),
  }))
);