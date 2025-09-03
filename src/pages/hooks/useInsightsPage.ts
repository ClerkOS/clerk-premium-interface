import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type Insight = {
  id: number;
  title: string;
  confidence: string;
  type: 'warning' | 'insight' | 'positive';
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  trend: string;
  affected: number;
  value: string;
  risk: string;
  recommendation: string;
  sql: string;
  chart: 'bar' | 'pie' | 'line';
  data: any[];
};

export const useInsightsPage = () => {
  const navigate = useNavigate();

  // UI state
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'warning' | 'positive' | 'insight'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chartHovered, setChartHovered] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Refs
  const chartRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Check if fullscreen API is available
    console.log('Fullscreen API check:');
    console.log('- Standard requestFullscreen:', !!document.documentElement.requestFullscreen);
    console.log('- Webkit requestFullscreen:', !!(document.documentElement as any).webkitRequestFullscreen);
    console.log('- MS requestFullscreen:', !!(document.documentElement as any).msRequestFullscreen);
    console.log('- Document fullscreenElement:', document.fullscreenElement);

    document.addEventListener('fullscreenchange', handleFullscreenChange as EventListener);
    document.addEventListener('webkitfullscreenchange' as any, handleFullscreenChange as any);
    document.addEventListener('msfullscreenchange' as any, handleFullscreenChange as any);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange as EventListener);
      document.removeEventListener('webkitfullscreenchange' as any, handleFullscreenChange as any);
      document.removeEventListener('msfullscreenchange' as any, handleFullscreenChange as any);
    };
  }, []);

  // Insights data
  const insights: Insight[] = useMemo(() => [
    {
      id: 1,
      title: 'High debt-to-equity ratios in Technology sector',
      confidence: '94%',
      type: 'warning',
      description:
        'Technology companies show D/E of 2.31x, 44% above industry benchmark of 1.6x. This affects 23 companies worth $2.3M in exposure.',
      impact: 'High',
      trend: '+12%',
      affected: 23,
      value: '$2.3M',
      risk: 'Elevated',
      recommendation: 'Consider debt restructuring or equity infusion',
      sql: `SELECT 
  sector, 
  ROUND(AVG(debt/equity), 2) as avg_de_ratio,
  COUNT(*) as company_count,
  SUM(total_value) as total_exposure
FROM financials 
WHERE sector = 'Technology'
GROUP BY sector
HAVING AVG(debt/equity) > 1.6;`,
      chart: 'bar',
      data: [
        { name: 'Technology', value: 2.31, benchmark: 1.6, count: 23, risk: 'high' },
        { name: 'Healthcare', value: 1.82, benchmark: 1.6, count: 18, risk: 'medium' },
        { name: 'Finance', value: 1.45, benchmark: 1.6, count: 31, risk: 'low' },
        { name: 'Manufacturing', value: 1.73, benchmark: 1.6, count: 15, risk: 'medium' },
      ],
    },
    {
      id: 2,
      title: 'Foreign currency concentration risk',
      confidence: '91%',
      type: 'insight',
      description:
        '64% of operations use non-USD currencies. EUR exposure represents 35% of foreign transactions, creating concentration risk worth $2.1M.',
      impact: 'Medium',
      trend: '+8%',
      affected: 89,
      value: '$2.1M',
      risk: 'Moderate',
      recommendation: 'Implement currency hedging strategies',
      sql: `SELECT 
  foreign_currency, 
  COUNT(*) as transaction_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage,
  SUM(total_value) as exposure_value
FROM financials 
WHERE foreign_currency != 'USD'
GROUP BY foreign_currency
ORDER BY exposure_value DESC;`,
      chart: 'pie',
      data: [
        { name: 'EUR', value: 35, exposure: 850000, color: '#3B82F6', risk: 'high' },
        { name: 'GBP', value: 25, exposure: 720000, color: '#10B981', risk: 'medium' },
        { name: 'JPY', value: 18, exposure: 480000, color: '#F59E0B', risk: 'medium' },
        { name: 'CAD', value: 15, exposure: 250000, color: '#EF4444', risk: 'low' },
        { name: 'Other', value: 7, exposure: 200000, color: '#8B5CF6', risk: 'low' },
      ],
    },
    {
      id: 3,
      title: 'Long-term cycles correlate with equity strength',
      confidence: '89%',
      type: 'positive',
      description:
        'Companies with business cycles >36 months show 23% higher equity ratios (avg 0.71 vs 0.58). 31 companies exhibit this pattern.',
      impact: 'Medium',
      trend: '+23%',
      affected: 31,
      value: '0.71x',
      risk: 'Low',
      recommendation: 'Leverage long-term planning for equity optimization',
      sql: `SELECT 
  CASE 
    WHEN no_of_months <= 24 THEN 'Short (≤24m)'
    WHEN no_of_months <= 36 THEN 'Medium (25-36m)'
    ELSE 'Long (>36m)'
  END as cycle_category,
  ROUND(AVG(equity), 3) as avg_equity_ratio,
  COUNT(*) as company_count,
  ROUND(STDDEV(equity), 3) as equity_volatility
FROM financials
GROUP BY cycle_category
ORDER BY avg_equity_ratio DESC;`,
      chart: 'line',
      data: [
        { months: '12', equity: 0.45, count: 23, volatility: 0.12, trend: 'declining' },
        { months: '24', equity: 0.52, count: 34, volatility: 0.09, trend: 'stable' },
        { months: '36', equity: 0.58, count: 28, volatility: 0.08, trend: 'improving' },
        { months: '48', equity: 0.67, count: 19, volatility: 0.06, trend: 'strong' },
        { months: '60+', equity: 0.71, count: 12, volatility: 0.04, trend: 'excellent' },
      ],
    },
  ], []);

  const currentInsight = insights[selectedInsight];

  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setChatInput('');
    }, 2000);
  }, [chatInput]);

  const handleCopyQuery = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentInsight.sql);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }, [currentInsight]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  }, []);

  const handleFullscreen = useCallback(async () => {
    console.log('Fullscreen button clicked! Current state:', isFullscreen);
    try {
      if (!isFullscreen) {
        console.log('Attempting to enter fullscreen...');
        if (document.documentElement.requestFullscreen) {
          console.log('Using standard requestFullscreen');
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          console.log('Using webkit requestFullscreen');
          await (document.documentElement as any).webkitRequestFullscreen();
        } else if ((document.documentElement as any).msRequestFullscreen) {
          console.log('Using ms requestFullscreen');
          await (document.documentElement as any).msRequestFullscreen();
        }
        console.log('Fullscreen entered successfully');
        setIsFullscreen(true);
      } else {
        console.log('Attempting to exit fullscreen...');
        if (document.exitFullscreen) {
          console.log('Using standard exitFullscreen');
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          console.log('Using webkit exitFullscreen');
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          console.log('Using ms exitFullscreen');
          await (document as any).msExitFullscreen();
        }
        console.log('Fullscreen exited successfully');
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      setIsFullscreen(!isFullscreen);
    }
  }, [isFullscreen]);

  const filteredInsights = useMemo(
    () =>
      insights.filter((insight) => {
        const matchesFilter = filterType === 'all' || insight.type === filterType;
        return matchesFilter;
      }),
    [insights, filterType]
  );

  const goHome = useCallback(() => navigate('/'), [navigate]);

  return {
    // state
    chatInput,
    setChatInput,
    isGenerating,
    selectedInsight,
    setSelectedInsight,
    isLoaded,
    hoveredCard,
    setHoveredCard,
    isFullscreen,
    setIsFullscreen,
    filterType,
    setFilterType,
    isExporting,
    showNotifications,
    setShowNotifications,
    chartHovered,
    setChartHovered,
    sidebarCollapsed,
    setSidebarCollapsed,

    // refs
    chartRef,
    sidebarRef,
    notificationRef,

    // data
    insights,
    currentInsight,
    filteredInsights,

    // handlers
    handleSendMessage,
    handleCopyQuery,
    handleExport,
    handleFullscreen,
    goHome,
  };
};
