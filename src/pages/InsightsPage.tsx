import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, BarChart3, PieChart, Brain, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { StatsCalculator } from '@/lib/stats';
import { ThemeToggle } from '@/components/ThemeToggle';

export function InsightsPage() {
  const navigate = useNavigate();
  const { workbook, aiResponses } = useSpreadsheetStore();

  const activeSheet = workbook?.sheets.find(s => s.id === workbook.activeSheetId);

  // Generate sample insights if we have data
  const insights = useMemo(() => {
    if (!activeSheet || !activeSheet.rows.length) return [];

    const sampleInsights = [
      {
        id: 'insight-1',
        type: 'summary' as const,
        title: 'Data Overview',
        description: `Your dataset contains ${activeSheet.rows.length} rows and ${activeSheet.columns.length} columns`,
        value: `${activeSheet.rows.length} rows`,
        confidence: 0.95,
        icon: BarChart3,
      },
      {
        id: 'insight-2',
        type: 'trend' as const,
        title: 'Growth Pattern',
        description: 'Detected consistent upward trend in your numeric data',
        confidence: 0.87,
        icon: TrendingUp,
      },
      {
        id: 'insight-3',
        type: 'anomaly' as const,
        title: 'Data Quality',
        description: 'Found 3 potential outliers that may need attention',
        confidence: 0.73,
        icon: AlertTriangle,
      },
    ];

    return sampleInsights;
  }, [activeSheet]);

  // Generate sample statistics
  const statistics = useMemo(() => {
    if (!activeSheet) return [];

    return [
      { label: 'Total Rows', value: activeSheet.rows.length, trend: '+12%' },
      { label: 'Columns', value: activeSheet.columns.length, trend: 'stable' },
      { label: 'Non-empty Cells', value: Math.floor(activeSheet.rows.length * activeSheet.columns.length * 0.7), trend: '+5%' },
      { label: 'Data Quality', value: '87%', trend: '+3%' },
    ];
  }, [activeSheet]);

  // Generate sample chart data
  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: `Month ${i + 1}`,
      value: Math.floor(Math.random() * 1000) + 500,
      category: Math.random() > 0.5 ? 'A' : 'B',
    }));
  }, []);

  const pieData = [
    { name: 'Category A', value: 400, color: 'hsl(var(--primary))' },
    { name: 'Category B', value: 300, color: 'hsl(var(--secondary))' },
    { name: 'Category C', value: 200, color: 'hsl(var(--accent))' },
    { name: 'Category D', value: 100, color: 'hsl(var(--muted))' },
  ];

  if (!workbook) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">No Data Available</h1>
          <p className="text-muted-foreground mb-6">Upload a spreadsheet to view insights</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Data Insights</h1>
            <p className="text-sm text-muted-foreground">
              AI-powered analysis of {workbook.name}
            </p>
          </div>
        </div>

        <ThemeToggle />
      </motion.header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {statistics.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <Badge 
                      variant={stat.trend.startsWith('+') ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {stat.trend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trend Analysis
              </CardTitle>
              <CardDescription>
                Data trends over time showing growth patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Category Breakdown
              </CardTitle>
              <CardDescription>
                Distribution of data across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Insights
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <insight.icon className="w-5 h-5 text-primary" />
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{insight.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    
                    {insight.value && (
                      <div className="text-lg font-semibold text-primary">
                        {insight.value}
                      </div>
                    )}
                    
                    <Progress 
                      value={insight.confidence * 100} 
                      className="mt-3 h-1"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}