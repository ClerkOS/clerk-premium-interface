import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, MessageSquare, Sparkles, Plus, MoreVertical, Share, Download, RefreshCw, ChevronRight, TrendingUp, AlertTriangle, CheckCircle, Code2, Send, Zap, Eye, BookOpen, BarChart3, X, Maximize2, Minimize2, Filter, Settings, Bell, User, HelpCircle, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PremiumCursorInsights = () => {
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chartHovered, setChartHovered] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const chartRef = useRef(null);
  const sidebarRef = useRef(null);
  const notificationRef = useRef(null);

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

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Enhanced insights data with more interactive elements
  const insights = [
    {
      id: 1,
      title: "High debt-to-equity ratios in Technology sector",
      confidence: "94%",
      type: "warning",
      description: "Technology companies show D/E of 2.31x, 44% above industry benchmark of 1.6x. This affects 23 companies worth $2.3M in exposure.",
      impact: "High",
      trend: "+12%",
      affected: 23,
      value: "$2.3M",
      risk: "Elevated",
      recommendation: "Consider debt restructuring or equity infusion",
      sql: `SELECT 
  sector, 
  ROUND(AVG(debt/equity), 2) as avg_de_ratio,
  COUNT(*) as company_count,
  SUM(total_value) as total_exposure
FROM financials 
WHERE sector = 'Technology'
GROUP BY sector
HAVING AVG(debt/equity) > 1.6;`,
      chart: "bar",
      data: [
        { name: 'Technology', value: 2.31, benchmark: 1.6, count: 23, risk: 'high' },
        { name: 'Healthcare', value: 1.82, benchmark: 1.6, count: 18, risk: 'medium' },
        { name: 'Finance', value: 1.45, benchmark: 1.6, count: 31, risk: 'low' },
        { name: 'Manufacturing', value: 1.73, benchmark: 1.6, count: 15, risk: 'medium' }
      ]
    },
    {
      id: 2,
      title: "Foreign currency concentration risk",
      confidence: "91%",
      type: "insight",
      description: "64% of operations use non-USD currencies. EUR exposure represents 35% of foreign transactions, creating concentration risk worth $2.1M.",
      impact: "Medium",
      trend: "+8%",
      affected: 89,
      value: "$2.1M",
      risk: "Moderate",
      recommendation: "Implement currency hedging strategies",
      sql: `SELECT 
  foreign_currency, 
  COUNT(*) as transaction_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage,
  SUM(total_value) as exposure_value
FROM financials 
WHERE foreign_currency != 'USD'
GROUP BY foreign_currency
ORDER BY exposure_value DESC;`,
      chart: "pie",
      data: [
        { name: 'EUR', value: 35, exposure: 850000, color: '#3B82F6', risk: 'high' },
        { name: 'GBP', value: 25, exposure: 720000, color: '#10B981', risk: 'medium' },
        { name: 'JPY', value: 18, exposure: 480000, color: '#F59E0B', risk: 'medium' },
        { name: 'CAD', value: 15, exposure: 250000, color: '#EF4444', risk: 'low' },
        { name: 'Other', value: 7, exposure: 200000, color: '#8B5CF6', risk: 'low' }
      ]
    },
    {
      id: 3,
      title: "Long-term cycles correlate with equity strength",
      confidence: "89%",
      type: "positive",
      description: "Companies with business cycles >36 months show 23% higher equity ratios (avg 0.71 vs 0.58). 31 companies exhibit this pattern.",
      impact: "Medium",
      trend: "+23%",
      affected: 31,
      value: "0.71x",
      risk: "Low",
      recommendation: "Leverage long-term planning for equity optimization",
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
      chart: "line",
      data: [
        { months: '12', equity: 0.45, count: 23, volatility: 0.12, trend: 'declining' },
        { months: '24', equity: 0.52, count: 34, volatility: 0.09, trend: 'stable' },
        { months: '36', equity: 0.58, count: 28, volatility: 0.08, trend: 'improving' },
        { months: '48', equity: 0.67, count: 19, volatility: 0.06, trend: 'strong' },
        { months: '60+', equity: 0.71, count: 12, volatility: 0.04, trend: 'excellent' }
      ]
    }
  ];

  const currentInsight = insights[selectedInsight];

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setChatInput('');
    }, 2000);
  };

  const handleCopyQuery = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentInsight.sql);
      // Show success feedback
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
        // Enter fullscreen
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
        // Exit fullscreen
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
      // Fallback: just toggle the state
      setIsFullscreen(!isFullscreen);
    }
  }, [isFullscreen]);

  const filteredInsights = insights.filter(insight => {
    const matchesFilter = filterType === 'all' || insight.type === filterType;
    return matchesFilter;
  });

  const InsightCard = ({ insight, isActive, onClick, index }) => (
    <div 
      ref={sidebarRef}
      className={`relative p-4 border rounded-xl cursor-pointer transition-all duration-700 ease-out transform ${
        isActive 
          ? 'bg-primary/8 border-primary/60 shadow-2xl shadow-primary/20 scale-[1.02]' 
          : 'bg-card/50 border-border hover:bg-card/80 hover:border-primary/30 hover:scale-[1.01]'
      } ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
      style={{ 
        transitionDelay: `${index * 150}ms`,
        backdropFilter: 'blur(20px)',
        transform: isActive ? 'perspective(1000px) rotateX(2deg)' : 'perspective(1000px) rotateX(0deg)',
      }}
      onClick={onClick}
      onMouseEnter={() => setHoveredCard(index)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      {/* Enhanced gradient overlay with parallax effect */}
      <div className={`absolute inset-0 rounded-xl transition-all duration-500 ${
        isActive ? 'opacity-100' : 'opacity-0'
      }`} style={{
        background: `linear-gradient(135deg, 
          hsl(var(--primary) / 0.08) 0%, 
          hsl(var(--primary) / 0.03) 50%, 
          hsl(var(--primary) / 0.01) 100%)`,
        transform: hoveredCard === index ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }} />
      
      {/* Floating particles effect */}
      {isActive && (
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      )}
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl transition-all duration-500 ${
              insight.type === 'warning' ? 'bg-warning/15 text-warning shadow-lg shadow-warning/20' :
              insight.type === 'positive' ? 'bg-success/15 text-success shadow-lg shadow-success/20' :
              'bg-primary/15 text-primary shadow-lg shadow-primary/20'
            } ${hoveredCard === index ? 'scale-125 rotate-3' : 'scale-100 rotate-0'}`}>
              {insight.type === 'warning' && <AlertTriangle size={18} />}
              {insight.type === 'positive' && <CheckCircle size={18} />}
              {insight.type === 'insight' && <TrendingUp size={18} />}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-300 ${
                  insight.impact === 'High' ? 'bg-destructive/15 text-destructive border border-destructive/30' :
                  insight.impact === 'Medium' ? 'bg-warning/15 text-warning border border-warning/30' :
                  'bg-muted text-muted-foreground border border-border'
                }`}>
                  {insight.impact} Impact
                </span>
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">{insight.confidence}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                  {insight.affected} companies
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-warning rounded-full animate-pulse"></div>
                  {insight.value} exposure
                </span>
                <span className={`flex items-center gap-1 ${insight.trend.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${insight.trend.startsWith('+') ? 'bg-success' : 'bg-destructive'}`}></div>
                  {insight.trend}
                </span>
              </div>
          </div>
          </div>
        </div>

        <h3 className="font-medium text-foreground mb-2 text-sm leading-relaxed transition-all duration-300">
          {insight.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed transition-all duration-300">
          {insight.description}
        </p>
        
        {/* Risk indicator */}
        <div className="mt-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            insight.risk === 'High' ? 'bg-destructive animate-pulse' :
            insight.risk === 'Moderate' ? 'bg-warning' :
            'bg-success'
          }`}></div>
          <span className="text-xs text-muted-foreground">{insight.risk} Risk</span>
        </div>
        
        {isActive && (
          <div className="mt-4 pt-4 border-t border-border animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Code2 size={12} className="animate-pulse" />
                <span>SQL query ready</span>
              </div>
              <ChevronRight size={14} className="text-muted-foreground/70 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderChart = () => {
    if (!currentInsight) return null;

    const chartProps = {
      style: { 
        filter: chartHovered ? 'drop-shadow(0 8px 32px rgba(59, 130, 246, 0.3))' : 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.15))',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }
    };

    switch (currentInsight.chart) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={currentInsight.data} 
              {...chartProps}
              onMouseEnter={() => setChartHovered(true)}
              onMouseLeave={() => setChartHovered(false)}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6B7280" stopOpacity={0.7}/>
                  <stop offset="100%" stopColor="#6B7280" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '16px',
                  color: 'hsl(var(--popover-foreground))',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                }}
                cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
              />
              <Bar 
                dataKey="value" 
                fill="url(#barGradient)" 
                radius={[8, 8, 0, 0]}
                animationDuration={2000}
                animationBegin={0}
              />
              <Bar 
                dataKey="benchmark" 
                fill="url(#benchmarkGradient)" 
                radius={[8, 8, 0, 0]}
                animationDuration={2000}
                animationBegin={300}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart 
              {...chartProps}
              onMouseEnter={() => setChartHovered(true)}
              onMouseLeave={() => setChartHovered(false)}
            >
              <defs>
                {currentInsight.data.map((entry, index) => (
                  <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={0.9}/>
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.5}/>
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={currentInsight.data}
                cx="50%"
                cy="50%"
                outerRadius={chartHovered ? 90 : 85}
                innerRadius={45}
                paddingAngle={3}
                dataKey="value"
                animationDuration={2000}
                animationBegin={0}
              >
                {currentInsight.data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#pieGradient-${index})`}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  color: '#F9FAFB',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                }}
                formatter={(value, name) => [`${value}%`, name]}
              />
            </PieChart>
              </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={currentInsight.data} 
              {...chartProps}
              onMouseEnter={() => setChartHovered(true)}
              onMouseLeave={() => setChartHovered(false)}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="months" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '16px',
                  color: 'hsl(var(--popover-foreground))',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                }}
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="equity" 
                stroke="hsl(var(--primary))" 
                strokeWidth={4}
                dot={{ 
                  fill: '#3B82F6', 
                  strokeWidth: 3, 
                  r: chartHovered ? 7 : 5, 
                  filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))'
                }}
                activeDot={{ 
                  r: 9, 
                  fill: '#1D4ED8', 
                  filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4))',
                  stroke: '#ffffff',
                  strokeWidth: 2
                }}
                animationDuration={2000}
                animationBegin={0}
              />
            </LineChart>
              </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="h-screen bg-background text-foreground flex overflow-hidden"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Left Sidebar */}
        <motion.div
        ref={sidebarRef}
        className={`${sidebarCollapsed ? 'w-20' : 'w-80'} bg-gradient-to-b from-card to-background border-r border-border flex flex-col transition-all duration-700 ease-out`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-6">
            <button 
              className="p-2 hover:bg-muted rounded-lg transition-all duration-300 group"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={18} className="text-muted-foreground group-hover:text-foreground transition-transform duration-300" />
            </button>
            {!sidebarCollapsed && (
              <div className="overflow-hidden transition-all duration-500">
                <h1 className="font-semibold text-foreground text-lg">Insights</h1>
                <p className="text-xs text-muted-foreground">Clerk financials.xlsx • 3 sheets</p>
              </div>
            )}
          </div>
          
          {!sidebarCollapsed && (
            <button className="w-full flex items-center justify-center gap-3 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl border border-primary/30 transition-all duration-500 group backdrop-blur-sm hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20">
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-sm font-medium">Generate New Insight</span>
            </button>
          )}
        </div>

        {/* Filters */}
        {!sidebarCollapsed && (
          <div className="px-6 pb-4 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-300 ${
                  filterType === 'all' 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('warning')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-300 ${
                  filterType === 'warning' 
                    ? 'bg-warning/20 text-warning border border-warning/30' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border'
                }`}
              >
                Warnings
              </button>
              <button
                onClick={() => setFilterType('positive')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-300 ${
                  filterType === 'positive' 
                    ? 'bg-success/20 text-success border border-success/30' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border'
                }`}
              >
                Positive
              </button>
                    </div>
                      </div>
                    )}
                    
        {/* Insights List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredInsights.map((insight, index) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              isActive={selectedInsight === index}
              onClick={() => setSelectedInsight(index)}
              index={index}
            />
          ))}
        </div>

        {/* AI Chat */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask AI about your data..."
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:bg-muted placeholder-muted-foreground transition-all duration-300 backdrop-blur-sm"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Sparkles size={14} className="text-yellow-400/60 animate-pulse" />
                </div>
              </div>
              <button 
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isGenerating}
                className="px-3 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted rounded-lg transition-all duration-300 flex items-center justify-center min-w-[44px] backdrop-blur-sm border border-primary/30 disabled:border-border hover:scale-105"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        )}
              </motion.div>

      {/* Main Content */}
      <motion.div 
        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Top Bar */}
        <div className="p-4 border-b border-border flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full shadow-lg transition-all duration-500 ${
              currentInsight.type === 'warning' ? 'bg-warning shadow-warning/30' :
              currentInsight.type === 'positive' ? 'bg-success shadow-success/30' : 
              'bg-primary shadow-primary/30'
            }`}></div>
            <h2 className="font-semibold text-lg">{currentInsight.title}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 bg-muted text-muted-foreground rounded-full border border-border">
                {currentInsight.confidence}
              </span>
              <span className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20">
                AI Generated
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {[
              { icon: RefreshCw, tooltip: 'Refresh', action: () => window.location.reload(), loading: false },
              { icon: Eye, tooltip: 'View Raw Data', action: () => alert('Viewing raw data for: ' + currentInsight.title), loading: false },
              { icon: Download, tooltip: 'Export', action: handleExport, loading: isExporting },
              { icon: Share, tooltip: 'Share', action: () => {
                if (navigator.share) {
                  navigator.share({
                    title: currentInsight.title,
                    text: currentInsight.description,
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }, loading: false },
              { icon: isFullscreen ? Minimize2 : Maximize2, tooltip: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen', action: handleFullscreen, loading: false },
              { icon: MoreVertical, tooltip: 'More', action: () => setShowNotifications(!showNotifications), loading: false }
            ].map(({ icon: Icon, tooltip, action, loading }, index) => (
              <button 
                key={tooltip}
                onClick={action}
                disabled={loading}
                className="p-2.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all duration-300 group hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                title={tooltip}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>
                ) : (
                  <Icon size={16} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-4 grid grid-cols-3 gap-4">
          {/* Chart - Takes 2 columns */}
          <div 
            ref={chartRef}
            className="col-span-2 bg-gradient-to-br from-card to-background border border-border rounded-xl p-4 backdrop-blur-sm transition-all duration-700 ease-out hover:border-primary/30 hover:bg-card/80 hover:shadow-2xl hover:shadow-primary/10 group"
            onMouseEnter={() => setChartHovered(true)}
            onMouseLeave={() => setChartHovered(false)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 group">
                <BarChart3 size={18} className="text-primary group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-medium text-base group-hover:text-primary transition-colors duration-300">Visualization</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap size={12} className="text-warning animate-pulse" />
                <span className="group-hover:text-warning transition-colors duration-300">Auto-generated</span>
              </div>
            </div>
            <div className="h-64 transition-all duration-500">
              {renderChart()}
            </div>
          </div>

                      {/* Analysis Panel */}
            <div className="space-y-4">
              {/* Key Metrics */}
              <div className="bg-gradient-to-br from-card to-background border border-border rounded-xl p-4 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:bg-card/80 group">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-success group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:text-success transition-colors duration-300">Key Metrics</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">Companies Affected</span>
                    <span className="font-medium group-hover:scale-110 transition-transform duration-300">{currentInsight.affected}</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">Total Exposure</span>
                    <span className="font-medium text-warning group-hover:scale-110 transition-transform duration-300">{currentInsight.value}</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">Trend</span>
                    <span className={`font-medium group-hover:scale-110 transition-transform duration-300 ${currentInsight.trend.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                      {currentInsight.trend}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <span className="text-xs font-medium">{currentInsight.confidence}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-2000 ease-out"
                        style={{ width: currentInsight.confidence }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact Assessment */}
              <div className="bg-gradient-to-br from-card to-background border border-border rounded-xl p-4 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:bg-card/80 group">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-warning group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:text-warning transition-colors duration-300">Impact Assessment</span>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {currentInsight.description}
                </p>
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  currentInsight.impact === 'High' ? 'bg-destructive/15 text-destructive border border-destructive/30' :
                  currentInsight.impact === 'Medium' ? 'bg-warning/15 text-warning border border-warning/30' :
                  'bg-muted text-muted-foreground border border-border'
                }`}>
                  <span>{currentInsight.impact} Priority</span>
                </div>
                
                {/* Recommendation */}
                <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-xs text-primary font-medium mb-1">Recommendation</p>
                  <p className="text-xs text-primary/80">{currentInsight.recommendation}</p>
                </div>
              </div>
            </div>

          {/* SQL Query - Full width */}
          <div className="col-span-3 bg-gradient-to-br from-card to-background border border-border rounded-xl backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-primary/30 hover:bg-card/80 group">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-3">
                <Code2 size={18} className="text-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:text-primary transition-colors duration-300">Generated SQL Query</span>
                <span className="text-xs px-2 py-1 bg-success/10 text-success rounded border border-success/20 group-hover:bg-success/20 transition-colors duration-300">
                  Optimized
                </span>
              </h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCopyQuery}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-sm rounded-lg border border-border transition-all duration-300 flex items-center gap-2 hover:scale-105 hover:shadow-lg hover:shadow-muted/20 group"
                >
                  <Copy size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                  Copy
                </button>
                <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm rounded-lg transition-all duration-300 flex items-center gap-2 border border-primary/30 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 group">
                  <BookOpen size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                  Run Query
                </button>
              </div>
            </div>
            <div className="p-4 bg-muted/20 max-h-64 overflow-y-auto sql-scrollbar border border-border/20 rounded-lg">
              <pre className="text-sm font-mono text-foreground/80 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                <code>{currentInsight.sql}</code>
              </pre>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications Panel */}
      {showNotifications && (
        <motion.div 
          ref={notificationRef}
          className="fixed top-4 right-4 w-80 bg-card/90 border border-border rounded-2xl backdrop-blur-xl p-4 space-y-3"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Notifications</h4>
            <button 
              onClick={() => setShowNotifications(false)}
              className="p-1 hover:bg-muted rounded-lg transition-colors duration-200"
            >
              <X size={16} />
            </button>
          </div>
          <div className="space-y-2">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-xs text-primary">New insight generated for Technology sector</p>
            </div>
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-xs text-warning">Risk level increased for 3 companies</p>
            </div>
          </div>
        </motion.div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
        
        /* SQL Query scrollbar styling */
        .sql-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        .sql-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 5px;
          border: 1px solid hsl(var(--border) / 0.3);
        }
        
        .sql-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.4);
          border-radius: 5px;
          border: 1px solid hsl(var(--border) / 0.2);
        }
        
        .sql-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.6);
        }
        
        .sql-scrollbar::-webkit-scrollbar-corner {
          background: hsl(var(--muted));
        }
        
        /* Firefox scrollbar styling */
        .sql-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--primary) / 0.4) hsl(var(--muted));
        }
        
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-from-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-in {
          animation: animate-in 0.3s ease-out;
        }
        
        .slide-in-from-right {
          animation: slide-in-from-right 0.5s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </motion.div>
  );
};

export { PremiumCursorInsights as InsightsPage };