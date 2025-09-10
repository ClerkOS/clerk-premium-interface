import { AICommand, AIResponse, Insight, ChartConfig } from '@/types';
import { ApiService, withRetry } from './api';

// AI service with backend integration
export class AIService {
  static async processCommand(command: AICommand, workbookId?: string, sheetName?: string): Promise<AIResponse> {
    // If we have backend connection, use real API
    if (workbookId && sheetName) {
      try {
        const result = await withRetry(async () => {
          return await ApiService.chatCompletion({
            workbookId,
            sheet: sheetName,
            prompt: command.command,
          });
        });

        if (result.success && result.data) {
          return {
            id: `response-${Date.now()}`,
            commandId: command.id,
            response: result.data.response || 'AI response received',
            insights: result.data.insights || [],
            charts: result.data.charts || [],
            suggestions: result.data.suggestions || [],
            actions: result.data.actions || [],
            timestamp: new Date(),
          };
        }
      } catch (error) {
        console.warn('Backend AI service failed, falling back to mock:', error);
      }
    }

    // Fallback to mock responses
    return this.generateMockResponse(command);
  }

  static async naturalLanguageToFormula(
    prompt: string, 
    workbookId: string, 
    sheetName: string
  ): Promise<string> {
    try {
      const result = await withRetry(async () => {
        return await ApiService.naturalLanguageToFormula({
          workbookId,
          sheet: sheetName,
          prompt,
        });
      });

      if (result.success && result.data) {
        return result.data;
      }
    } catch (error) {
      console.warn('Backend NL2F service failed, falling back to mock:', error);
    }

    // Fallback to mock formula generation
    return this.generateMockFormula(prompt);
  }

  static async generateDataSummary(workbookId: string, sheetName: string): Promise<string> {
    try {
      const result = await withRetry(async () => {
        return await ApiService.generateSummary(workbookId, sheetName);
      });

      if (result.success && result.data) {
        return result.data;
      }
    } catch (error) {
      console.warn('Backend summary service failed, falling back to mock:', error);
    }

    // Fallback to mock summary
    return 'Data summary: 1,250 rows with 8 columns. Key metrics show 23% growth trend.';
  }

  private static generateMockResponse(command: AICommand): AIResponse {
    // Simulate processing delay
    const delay = 1000 + Math.random() * 2000;
    
    const response: AIResponse = {
      id: `response-${Date.now()}`,
      commandId: command.id,
      response: '',
      insights: [],
      charts: [],
      suggestions: [],
      actions: [],
      timestamp: new Date(),
    };
    
    switch (command.type) {
      case 'ask':
        response.response = this.generateAskResponse(command.command);
        break;
        
      case 'summarize':
        response.response = 'Data summary: 1,250 rows with 8 columns. Key metrics show 23% growth trend.';
        response.insights = this.generateSummaryInsights();
        break;
        
      case 'chart':
        response.response = 'Generated charts based on your data patterns.';
        response.charts = this.generateCharts();
        break;
        
      case 'insights':
        response.response = 'Discovered 5 key insights and 2 anomalies in your data.';
        response.insights = this.generateInsights();
        break;
        
      case 'clean':
        response.response = 'Data cleaning suggestions identified.';
        response.suggestions = [
          'Remove 23 duplicate rows',
          'Standardize date formats in column C',
          'Fill missing values in Revenue column'
        ];
        break;
        
      default:
        response.response = 'Command processed successfully.';
    }
    
    return response;
  }

  private static generateMockFormula(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('sum') || lowerPrompt.includes('total')) {
      return '=SUM(A1:A10)';
    } else if (lowerPrompt.includes('average') || lowerPrompt.includes('mean')) {
      return '=AVERAGE(A1:A10)';
    } else if (lowerPrompt.includes('count')) {
      return '=COUNT(A1:A10)';
    } else if (lowerPrompt.includes('max')) {
      return '=MAX(A1:A10)';
    } else if (lowerPrompt.includes('min')) {
      return '=MIN(A1:A10)';
    } else if (lowerPrompt.includes('if')) {
      return '=IF(A1>B1,"Yes","No")';
    } else if (lowerPrompt.includes('vlookup')) {
      return '=VLOOKUP(A1,Sheet2!A:B,2,FALSE)';
    }
    
    return '=SUM(A1:A10)'; // Default formula
  }
  
  private static generateAskResponse(question: string): string {
    const responses = [
      'Based on your data, the average revenue per quarter is $124,500 with a 15% growth rate.',
      'The correlation between marketing spend and sales is 0.73, indicating a strong positive relationship.',
      'Your data shows seasonal patterns with peaks in Q4 and Q1.',
      'Top performing products account for 67% of total revenue.',
      'Customer retention rate has improved by 12% over the last 6 months.'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  private static generateSummaryInsights(): Insight[] {
    return [
      {
        id: 'insight-1',
        type: 'summary',
        title: 'Revenue Growth',
        description: 'Revenue has grown consistently by 23% over the period',
        value: '23%',
        confidence: 0.92,
        sourceColumns: ['Revenue', 'Date'],
      },
      {
        id: 'insight-2',
        type: 'anomaly',
        title: 'Unusual Spike',
        description: 'Detected unusual spike in sales on March 15th',
        confidence: 0.87,
        sourceColumns: ['Sales', 'Date'],
        sourceRows: [45],
      }
    ];
  }
  
  private static generateCharts(): ChartConfig[] {
    return [
      {
        type: 'line',
        title: 'Revenue Trend',
        data: Array.from({ length: 12 }, (_, i) => ({
          month: `Month ${i + 1}`,
          revenue: 10000 + Math.random() * 5000,
        })),
        xAxis: 'month',
        yAxis: 'revenue',
        color: 'hsl(var(--primary))',
      },
      {
        type: 'bar',
        title: 'Sales by Category',
        data: [
          { category: 'Electronics', sales: 45000 },
          { category: 'Clothing', sales: 32000 },
          { category: 'Books', sales: 18000 },
          { category: 'Home', sales: 27000 },
        ],
        xAxis: 'category',
        yAxis: 'sales',
        color: 'hsl(var(--primary))',
      }
    ];
  }
  
  private static generateInsights(): Insight[] {
    return [
      {
        id: 'insight-3',
        type: 'correlation',
        title: 'Strong Correlation',
        description: 'Marketing spend and revenue show strong correlation (r=0.73)',
        confidence: 0.89,
        sourceColumns: ['Marketing Spend', 'Revenue'],
      },
      {
        id: 'insight-4',
        type: 'trend',
        title: 'Seasonal Pattern',
        description: 'Sales show clear seasonal patterns with Q4 peaks',
        confidence: 0.94,
        sourceColumns: ['Sales', 'Quarter'],
      },
      {
        id: 'insight-5',
        type: 'pattern',
        title: 'Customer Segments',
        description: 'Three distinct customer segments identified by purchase behavior',
        confidence: 0.78,
        sourceColumns: ['Customer ID', 'Purchase Amount', 'Frequency'],
      }
    ];
  }
  
  static recognizeTokens(input: string): string[] {
    const tokens = [
      'sum', 'average', 'mean', 'median', 'count', 'max', 'min',
      'growth', 'trend', 'correlation', 'anomaly', 'pattern',
      'revenue', 'sales', 'profit', 'customer', 'product',
      'chart', 'graph', 'plot', 'visualize'
    ];
    
    return tokens.filter(token => 
      input.toLowerCase().includes(token.toLowerCase())
    );
  }
}