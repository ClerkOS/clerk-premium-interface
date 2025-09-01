// Core types for the AI Spreadsheet application

export interface Cell {
  id: string;
  value: string | number | boolean | null;
  formula?: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'formula';
  row: number;
  column: number;
  style?: CellStyle;
}

export interface CellStyle {
  backgroundColor?: string;
  textColor?: string;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  border?: string;
}

export interface Row {
  id: string;
  cells: Cell[];
  height?: number;
}

export interface Column {
  id: string;
  name: string;
  width: number;
  type: 'text' | 'number' | 'date' | 'boolean';
}

export interface Sheet {
  id: string;
  name: string;
  rows: Row[];
  columns: Column[];
  selectedCells: string[];
  activeCell: string | null;
}

export interface Workbook {
  id: string;
  name: string;
  sheets: Sheet[];
  activeSheetId: string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface Insight {
  id: string;
  type: 'summary' | 'correlation' | 'anomaly' | 'trend' | 'pattern';
  title: string;
  description: string;
  value?: string | number;
  confidence: number;
  sourceColumns?: string[];
  sourceRows?: number[];
  chartType?: 'bar' | 'line' | 'scatter' | 'pie';
  chartData?: any[];
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'scatter' | 'pie' | 'area';
  data: any[];
  xAxis?: string;
  yAxis?: string;
  title?: string;
  color?: string;
}

export interface AICommand {
  id: string;
  command: string;
  type: 'ask' | 'summarize' | 'chart' | 'insights' | 'clean' | 'transform';
  parameters?: Record<string, any>;
  timestamp: Date;
}

export interface AIResponse {
  id: string;
  commandId: string;
  response: string;
  insights?: Insight[];
  charts?: ChartConfig[];
  suggestions?: string[];
  actions?: any[];
  timestamp: Date;
}

export interface UploadResult {
  success: boolean;
  workbook?: Workbook;
  error?: string;
  suggestions?: string[];
}

export interface Statistics {
  count: number;
  sum?: number;
  mean?: number;
  median?: number;
  min?: number;
  max?: number;
  stdDev?: number;
  nullCount: number;
  uniqueCount: number;
}

export interface ColumnStats {
  columnName: string;
  columnType: string;
  stats: Statistics;
  topValues?: Array<{ value: any; count: number }>;
  correlations?: Array<{ column: string; correlation: number }>;
}