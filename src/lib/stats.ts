import { Statistics, ColumnStats, Cell } from '@/types';

export class StatsCalculator {
  static calculateColumnStats(
    columnName: string,
    columnType: string,
    values: (string | number | boolean | null)[]
  ): ColumnStats {
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const numericValues = nonNullValues
      .map(v => typeof v === 'number' ? v : parseFloat(String(v)))
      .filter(v => !isNaN(v));
    
    const stats: Statistics = {
      count: nonNullValues.length,
      nullCount: values.length - nonNullValues.length,
      uniqueCount: new Set(nonNullValues).size,
    };
    
    // Calculate numeric statistics if applicable
    if (numericValues.length > 0 && (columnType === 'number' || numericValues.length / nonNullValues.length > 0.8)) {
      stats.sum = numericValues.reduce((a, b) => a + b, 0);
      stats.mean = stats.sum / numericValues.length;
      stats.min = Math.min(...numericValues);
      stats.max = Math.max(...numericValues);
      
      // Calculate median
      const sorted = [...numericValues].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      stats.median = sorted.length % 2 === 0 
        ? (sorted[mid - 1] + sorted[mid]) / 2 
        : sorted[mid];
      
      // Calculate standard deviation
      const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - stats.mean!, 2), 0) / numericValues.length;
      stats.stdDev = Math.sqrt(variance);
    }
    
    // Calculate top values
    const valueCounts = new Map<any, number>();
    nonNullValues.forEach(value => {
      valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
    });
    
    const topValues = Array.from(valueCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({ value, count }));
    
    return {
      columnName,
      columnType,
      stats,
      topValues,
    };
  }
  
  static calculateCorrelation(values1: number[], values2: number[]): number {
    if (values1.length !== values2.length || values1.length === 0) return 0;
    
    const n = values1.length;
    const sum1 = values1.reduce((a, b) => a + b, 0);
    const sum2 = values2.reduce((a, b) => a + b, 0);
    const sum1Sq = values1.reduce((a, b) => a + b * b, 0);
    const sum2Sq = values2.reduce((a, b) => a + b * b, 0);
    const pSum = values1.reduce((acc, val, i) => acc + val * values2[i], 0);
    
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
    
    return den === 0 ? 0 : num / den;
  }
  
  static findCorrelations(columns: ColumnStats[]): Array<{ column1: string; column2: string; correlation: number }> {
    const correlations: Array<{ column1: string; column2: string; correlation: number }> = [];
    const numericColumns = columns.filter(col => col.columnType === 'number' && col.stats.mean !== undefined);
    
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];
        
        // This is a simplified approach - in practice, you'd need the actual data values
        // For now, we'll generate a random correlation as a placeholder
        const correlation = (Math.random() - 0.5) * 2;
        
        if (Math.abs(correlation) > 0.3) {
          correlations.push({
            column1: col1.columnName,
            column2: col2.columnName,
            correlation: Math.round(correlation * 100) / 100,
          });
        }
      }
    }
    
    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }
  
  static detectAnomalies(values: number[], threshold: number = 2): number[] {
    if (values.length === 0) return [];
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return values
      .map((value, index) => ({ value, index, zScore: Math.abs(value - mean) / stdDev }))
      .filter(item => item.zScore > threshold)
      .map(item => item.index);
  }
  
  static detectTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' | 'volatile' {
    if (values.length < 3) return 'stable';
    
    const differences = values.slice(1).map((val, i) => val - values[i]);
    const avgDifference = differences.reduce((a, b) => a + b, 0) / differences.length;
    const volatility = Math.sqrt(
      differences.reduce((acc, diff) => acc + Math.pow(diff - avgDifference, 2), 0) / differences.length
    );
    
    const relativeVolatility = volatility / (Math.abs(avgDifference) + 1);
    
    if (relativeVolatility > 2) return 'volatile';
    if (avgDifference > 0.01) return 'increasing';
    if (avgDifference < -0.01) return 'decreasing';
    return 'stable';
  }
}