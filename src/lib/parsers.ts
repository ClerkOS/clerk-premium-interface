import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Workbook, Sheet, Cell, Row, Column, UploadResult } from '@/types';

export class FileParser {
  static async parseFile(file: File): Promise<UploadResult> {
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      switch (fileExtension) {
        case 'csv':
          return await this.parseCSV(file);
        case 'xlsx':
        case 'xls':
          return await this.parseExcel(file);
        default:
          return {
            success: false,
            error: 'Unsupported file format. Please upload CSV or Excel files.',
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse file',
      };
    }
  }
  
  private static async parseCSV(file: File): Promise<UploadResult> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          try {
            const workbook = this.createWorkbookFromData(
              results.data as any[],
              results.meta.fields || [],
              file.name
            );
            
            const suggestions = this.generateUploadSuggestions(results.data as any[]);
            
            resolve({
              success: true,
              workbook,
              suggestions,
            });
          } catch (error) {
            resolve({
              success: false,
              error: error instanceof Error ? error.message : 'Failed to create workbook',
            });
          }
        },
        error: (error) => {
          resolve({
            success: false,
            error: error.message,
          });
        },
      });
    });
  }
  
  private static async parseExcel(file: File): Promise<UploadResult> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const sheets: Sheet[] = [];
    
    // Parse each worksheet
    workbook.SheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, 
        defval: null 
      }) as any[][];
      
      if (jsonData.length === 0) return;
      
      // Extract headers and data
      const headers = jsonData[0] as string[];
      const data = jsonData.slice(1);
      
      // Convert to our data format
      const dataObjects = data.map(row => {
        const obj: any = {};
        headers.forEach((header, colIndex) => {
          obj[header] = row[colIndex] || null;
        });
        return obj;
      });
      
      const sheet = this.createSheetFromData(
        dataObjects,
        headers,
        sheetName || `Sheet ${index + 1}`,
        `sheet-${index}`
      );
      
      sheets.push(sheet);
    });
    
    if (sheets.length === 0) {
      return {
        success: false,
        error: 'No data found in the Excel file',
      };
    }
    
    const result: Workbook = {
      id: `workbook-${Date.now()}`,
      name: file.name,
      sheets,
      activeSheetId: sheets[0].id,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
    
    const suggestions = this.generateUploadSuggestions(
      sheets[0].rows.map(row => {
        const obj: any = {};
        row.cells.forEach((cell, index) => {
          obj[sheets[0].columns[index]?.name] = cell.value;
        });
        return obj;
      })
    );
    
    return {
      success: true,
      workbook: result,
      suggestions,
    };
  }
  
  private static createWorkbookFromData(
    data: any[],
    headers: string[],
    fileName: string
  ): Workbook {
    const sheet = this.createSheetFromData(data, headers, 'Sheet 1', 'sheet-0');
    
    return {
      id: `workbook-${Date.now()}`,
      name: fileName,
      sheets: [sheet],
      activeSheetId: sheet.id,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
  }
  
  private static createSheetFromData(
    data: any[],
    headers: string[],
    sheetName: string,
    sheetId: string
  ): Sheet {
    // Create columns
    const columns: Column[] = headers.map((header, index) => ({
      id: `col-${index}`,
      name: header,
      width: 120,
      type: this.inferColumnType(data, header),
    }));
    
    // Add empty columns to fill out the grid
    const additionalColumns = 26 - headers.length;
    for (let i = 0; i < additionalColumns; i++) {
      const colIndex = headers.length + i;
      columns.push({
        id: `col-${colIndex}`,
        name: String.fromCharCode(65 + colIndex),
        width: 120,
        type: 'text',
      });
    }
    
    // Create rows
    const rows: Row[] = data.map((rowData, rowIndex) => {
      const cells: Cell[] = [];
      
      // Data cells
      headers.forEach((header, colIndex) => {
        cells.push({
          id: `cell-${rowIndex}-${colIndex}`,
          value: rowData[header] ?? '',
          type: this.inferCellType(rowData[header]),
          row: rowIndex,
          column: colIndex,
        });
      });
      
      // Empty cells to fill out the row
      for (let colIndex = headers.length; colIndex < 26; colIndex++) {
        cells.push({
          id: `cell-${rowIndex}-${colIndex}`,
          value: '',
          type: 'text',
          row: rowIndex,
          column: colIndex,
        });
      }
      
      return {
        id: `row-${rowIndex}`,
        cells,
      };
    });
    
    // Add empty rows to fill out the grid
    const additionalRows = Math.max(0, 100 - data.length);
    for (let rowIndex = data.length; rowIndex < data.length + additionalRows; rowIndex++) {
      const cells: Cell[] = Array.from({ length: 26 }, (_, colIndex) => ({
        id: `cell-${rowIndex}-${colIndex}`,
        value: '',
        type: 'text',
        row: rowIndex,
        column: colIndex,
      }));
      
      rows.push({
        id: `row-${rowIndex}`,
        cells,
      });
    }
    
    return {
      id: sheetId,
      name: sheetName,
      rows,
      columns,
      selectedCells: [],
      activeCell: null,
    };
  }
  
  private static inferColumnType(data: any[], columnName: string): 'text' | 'number' | 'date' | 'boolean' {
    const sample = data.slice(0, 10).map(row => row[columnName]).filter(val => val != null);
    
    if (sample.length === 0) return 'text';
    
    const numberCount = sample.filter(val => typeof val === 'number' || !isNaN(Number(val))).length;
    const booleanCount = sample.filter(val => typeof val === 'boolean' || val === 'true' || val === 'false').length;
    const dateCount = sample.filter(val => !isNaN(Date.parse(val))).length;
    
    const total = sample.length;
    
    if (numberCount / total > 0.8) return 'number';
    if (booleanCount / total > 0.8) return 'boolean';
    if (dateCount / total > 0.8) return 'date';
    
    return 'text';
  }
  
  private static inferCellType(value: any): 'text' | 'number' | 'boolean' | 'date' {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value != null && !isNaN(Date.parse(value))) return 'date';
    return 'text';
  }
  
  private static generateUploadSuggestions(data: any[]): string[] {
    const suggestions: string[] = [];
    
    if (data.length > 1000) {
      suggestions.push('Large dataset detected - consider using filters for better performance');
    }
    
    // Check for empty columns
    const firstRow = data[0];
    if (firstRow) {
      const emptyColumns = Object.keys(firstRow).filter(key => 
        data.every(row => !row[key] || row[key] === '')
      );
      
      if (emptyColumns.length > 0) {
        suggestions.push(`Remove ${emptyColumns.length} empty columns`);
      }
    }
    
    // Check for missing values
    const totalCells = data.length * Object.keys(data[0] || {}).length;
    const emptyCells = data.reduce((count, row) => {
      return count + Object.values(row).filter(val => !val || val === '').length;
    }, 0);
    
    if (emptyCells / totalCells > 0.1) {
      suggestions.push('High number of missing values - consider data cleaning');
    }
    
    // General suggestions
    suggestions.push('Ask AI to summarize your data');
    suggestions.push('Generate insights and charts');
    
    return suggestions;
  }
}