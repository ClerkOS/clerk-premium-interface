// API service for communicating with the clerk-engine backend
// This service provides methods for workbook operations and includes retry logic

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Types for API requests and responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface CreateWorkbookRequest {
  name: string;
  sheets: Array<{
    name: string;
    data: any[];
  }>;
}

export interface WorkbookData {
  workbook_id: string;
  sheets: Array<{
    name: string;
    cells: Record<string, {
      value: string;
      formula: string;
      style?: any;
    }>;
  }>;
}

export interface ImportWorkbookResponse {
  workbook_id: string;
  sheets: string[];
}

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

// Utility function to calculate delay with exponential backoff
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  const delay = baseDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, maxDelay);
}

// Retry wrapper function
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error;

  for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on the last attempt
      if (attempt === finalConfig.maxRetries) {
        throw lastError;
      }

      // Don't retry on certain types of errors (4xx client errors)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw lastError;
      }

      // Wait before retrying
      const delay = calculateDelay(attempt, finalConfig.baseDelay, finalConfig.maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If we can't parse the error response, use the default message
    }
    throw new ApiError(errorMessage, response.status, response);
  }

  try {
    const data = await response.json();
    return data;
  } catch (error) {
    throw new ApiError('Failed to parse response', response.status, response);
  }
}

// API Service class
export class ApiService {
  /**
   * Create a new workbook
   */
  static async createWorkbook(request: CreateWorkbookRequest): Promise<ApiResponse<WorkbookData>> {
    return apiRequest<WorkbookData>('/workbook/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get a workbook by ID
   */
  static async getWorkbook(workbookId: string): Promise<ApiResponse<WorkbookData>> {
    return apiRequest<WorkbookData>(`/workbook/${workbookId}`, {
      method: 'GET',
    });
  }

  /**
   * Import a workbook from a file
   */
  static async importWorkbook(file: File): Promise<ApiResponse<ImportWorkbookResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/workbook/import`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If we can't parse the error response, use the default message
      }
      throw new ApiError(errorMessage, response.status, response);
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      throw new ApiError('Failed to parse response', response.status, response);
    }
  }

  /**
   * Check if the API is available
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export default instance
export default ApiService;
