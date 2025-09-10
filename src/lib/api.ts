import { Workbook, Sheet, Cell, AICommand, AIResponse } from '@/types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Types for API requests/responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface CreateWorkbookRequest {
  name: string;
  sheets?: Array<{
    name: string;
    data?: any[][];
  }>;
}

interface ImportWorkbookRequest {
  file: File;
}

interface SetCellRequest {
  workbookId: string;
  sheet: string;
  address: string;
  value?: string | number;
  formula?: string;
}

interface BatchSetCellsRequest {
  workbookId: string;
  sheet: string;
  cells: Array<{
    address: string;
    value?: string | number;
    formula?: string;
  }>;
}

interface ChatRequest {
  workbookId: string;
  prompt: string;
  sheet: string;
}

interface NL2FormulaRequest {
  workbookId: string;
  prompt: string;
  sheet: string;
  context?: string;
}

// API Service Class
export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Workbook Management
  static async createWorkbook(request: CreateWorkbookRequest): Promise<ApiResponse<Workbook>> {
    return this.request<Workbook>('/workbook/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  static async getWorkbook(workbookId: string): Promise<ApiResponse<Workbook>> {
    return this.request<Workbook>(`/workbook/${workbookId}`);
  }

  static async importWorkbook(file: File): Promise<ApiResponse<Workbook>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<Workbook>('/workbook/import', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  // Sheet Operations
  static async getSheet(workbookId: string, sheetName: string): Promise<ApiResponse<Sheet>> {
    return this.request<Sheet>(`/sheet/get/${workbookId}/${encodeURIComponent(sheetName)}`);
  }

  static async listSheets(workbookId: string): Promise<ApiResponse<string[]>> {
    return this.request<string[]>(`/sheet/list/${workbookId}`);
  }

  static async addSheet(workbookId: string, sheetName: string): Promise<ApiResponse<Sheet>> {
    return this.request<Sheet>(`/sheet/${workbookId}`, {
      method: 'POST',
      body: JSON.stringify({ name: sheetName }),
    });
  }

  static async deleteSheet(workbookId: string, sheetName: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/sheet/${workbookId}/${encodeURIComponent(sheetName)}`, {
      method: 'DELETE',
    });
  }

  // Cell Operations
  static async getCell(
    workbookId: string,
    sheetName: string,
    address: string
  ): Promise<ApiResponse<Cell>> {
    return this.request<Cell>(
      `/cell/${workbookId}/${encodeURIComponent(sheetName)}/${encodeURIComponent(address)}`
    );
  }

  static async setCell(request: SetCellRequest): Promise<ApiResponse<Cell>> {
    return this.request<Cell>(`/cell/${request.workbookId}`, {
      method: 'POST',
      body: JSON.stringify({
        sheet: request.sheet,
        address: request.address,
        value: request.value,
        formula: request.formula,
      }),
    });
  }

  static async batchSetCells(request: BatchSetCellsRequest): Promise<ApiResponse<Cell[]>> {
    return this.request<Cell[]>(`/cell/batch/${request.workbookId}`, {
      method: 'POST',
      body: JSON.stringify({
        sheet: request.sheet,
        cells: request.cells,
      }),
    });
  }

  static async addNamedRange(
    workbookId: string,
    sheetName: string,
    name: string,
    range: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/cell/add/named-range/${workbookId}/${encodeURIComponent(sheetName)}`, {
      method: 'POST',
      body: JSON.stringify({ name, range }),
    });
  }

  // AI & Natural Language
  static async chatCompletion(request: ChatRequest): Promise<ApiResponse<AIResponse>> {
    return this.request<AIResponse>(`/chat/completion/${request.workbookId}`, {
      method: 'POST',
      body: JSON.stringify({
        prompt: request.prompt,
        sheet: request.sheet,
      }),
    });
  }

  static async naturalLanguageToFormula(request: NL2FormulaRequest): Promise<ApiResponse<string>> {
    return this.request<string>(`/natlang/nl2f/${request.workbookId}`, {
      method: 'POST',
      body: JSON.stringify({
        prompt: request.prompt,
        sheet: request.sheet,
        context: request.context,
      }),
    });
  }

  static async generateSummary(workbookId: string, sheetName: string): Promise<ApiResponse<string>> {
    return this.request<string>(`/natlang/summary/${workbookId}`, {
      method: 'POST',
      body: JSON.stringify({ sheet: sheetName }),
    });
  }

  static async formulaToNaturalLanguage(
    workbookId: string,
    formula: string,
    sheetName: string
  ): Promise<ApiResponse<string>> {
    return this.request<string>(`/natlang/f2nl/${workbookId}`, {
      method: 'POST',
      body: JSON.stringify({
        formula,
        sheet: sheetName,
      }),
    });
  }

  static async generateCode(
    workbookId: string,
    prompt: string,
    sheetName: string
  ): Promise<ApiResponse<string>> {
    return this.request<string>(`/natlang/codegen/${workbookId}`, {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        sheet: sheetName,
      }),
    });
  }
}

// Utility functions for common operations
export const ApiUtils = {
  // Convert frontend workbook format to API format
  workbookToApi: (workbook: Workbook) => ({
    id: workbook.id,
    name: workbook.name,
    sheets: workbook.sheets.map(sheet => ({
      name: sheet.name,
      data: sheet.rows.map(row => 
        row.cells.map(cell => cell.value)
      ),
    })),
  }),

  // Convert API response to frontend format
  apiToWorkbook: (apiData: any): Workbook => {
    // This would convert the API response format to our frontend Workbook type
    // Implementation depends on the exact API response structure
    return apiData as Workbook;
  },

  // Generate cell address from row/column indices
  getCellAddress: (row: number, col: number): string => {
    const colLetter = String.fromCharCode(65 + col);
    return `${colLetter}${row + 1}`;
  },

  // Parse cell address to row/column indices
  parseCellAddress: (address: string): { row: number; col: number } => {
    const match = address.match(/^([A-Z]+)(\d+)$/);
    if (!match) throw new Error(`Invalid cell address: ${address}`);
    
    const colStr = match[1];
    const rowStr = match[2];
    
    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 64);
    }
    col -= 1; // Convert to 0-based index
    
    const row = parseInt(rowStr) - 1; // Convert to 0-based index
    
    return { row, col };
  },
};

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Retry mechanism for failed requests
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError!;
};
