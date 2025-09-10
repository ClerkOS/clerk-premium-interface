import { motion, AnimatePresence } from 'framer-motion';
import { FileText, MessageSquare, X, PanelLeft, PanelLeftClose } from 'lucide-react';
import { SpreadsheetGrid } from '@/components/SpreadsheetGrid';
import { FormulaBar } from '@/components/FormulaBar';
import { SheetTabs } from '@/components/SheetTabs';
import { UploadButton } from '@/components/UploadButton';
import { NewWorkbookButton } from '@/components/NewWorkbookButton';
import { FABInsights } from '@/components/FABInsights';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HelpCommands } from '@/components/HelpCommands';
import { Button } from '@/components/ui/button';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { useState, useEffect } from 'react';

// AI Chat Sidebar Component
function AiChatSidebar({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const suggestions = [
    {
      id: 1,
      title: "Create a formula",
      description: "Calculate totals, averages, or complex formulas",
      icon: "∑"
    },
    {
      id: 2,
      title: "Analyze data",
      description: "Find patterns, trends, and insights",
      icon: "🔍"
    },
    {
      id: 3,
      title: "Format cells",
      description: "Apply styling, colors, and formatting",
      icon: "🎨"
    },
    {
      id: 4,
      title: "Generate charts",
      description: "Create visualizations from your data",
      icon: "📈"
    },
    {
      id: 5,
      title: "Help",
      description: "Show commands and shortcuts guide",
      icon: "❓"
    }
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Check if user is asking for help
    if (inputValue.toLowerCase().includes('help')) {
      setShowHelp(true);
      setInputValue('');
      setShowSuggestions(false);
      return;
    }
    
    setInputValue('');
    setShowSuggestions(false);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai',
        content: 'I understand your request. Let me analyze the data and provide insights...',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleInputClick = () => {
    setShowSuggestions(true);
    setIsInputFocused(true);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (e.target.value.length > 0) {
      setShowSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    // Delay to allow clicking on suggestions
    setTimeout(() => {
      setIsInputFocused(false);
      if (inputValue.length === 0) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.title + ": ");
    setShowSuggestions(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-30 flex flex-col shadow-xl"
        >
          {/* Sidebar Header - Just Close Button */}
          <div className="flex justify-end p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-7 h-7 p-0 hover:bg-accent"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
            {showHelp ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Help & Commands</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHelp(false)}
                    className="w-6 h-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <HelpCommands />
              </motion.div>
             ) : (
               messages.map((message) => (
                 <motion.div
                   key={message.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-2"
                 >
                   {message.type === 'user' ? (
                     <div className="flex justify-end">
                       <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-primary text-primary-foreground">
                         <p className="leading-relaxed">{message.content}</p>
                         <p className="text-xs mt-1.5 opacity-60">
                           {message.timestamp}
                         </p>
                       </div>
                     </div>
                   ) : (
                     <div className="w-full">
                       <div className="text-xs text-muted-foreground mb-1">
                         AI Assistant • {message.timestamp}
                       </div>
                       <div className="bg-muted/50 rounded-lg p-3 text-sm leading-relaxed">
                         <p className="whitespace-pre-wrap">{message.content}</p>
                       </div>
                     </div>
                   )}
                 </motion.div>
               ))
             )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-border bg-card/30">
            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-3 border-b border-border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-3 font-medium">What would you like to do?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {suggestions.map((suggestion, index) => (
                        <motion.button
                          key={suggestion.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="p-2 text-left bg-background border border-border rounded-md hover:bg-accent hover:border-primary/50 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{suggestion.icon}</span>
                            <span className="text-xs font-medium text-foreground group-hover:text-primary">
                              {suggestion.title}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-tight">
                            {suggestion.description}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onClick={handleInputClick}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about your data..."
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors cursor-text"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  size="sm"
                  className="px-3 py-2 h-8"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SheetPage() {
  const { workbook, isLoading } = useSpreadsheetStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+F on Mac, Ctrl+F on Windows/Linux
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      
      // Escape to close search
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* AI Chat Sidebar */}
      <AiChatSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main content with conditional margin */}
      <motion.div 
        animate={{ 
          marginLeft: isSidebarOpen ? '320px' : '0px' 
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="flex flex-col min-h-screen"
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                {workbook?.name || 'Clerk'}
              </h1>
              {workbook && (
                <p className="text-sm text-muted-foreground">
                  {workbook.sheets.length} sheet{workbook.sheets.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {workbook && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeft className="w-4 h-4" />
                )}
              </Button>
            )}
            {!workbook && <NewWorkbookButton />}
            <ThemeToggle />
          </div>
        </motion.header>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {workbook ? (
            <>
              {/* Formula bar */}
              <FormulaBar />
              
              {/* Spreadsheet grid */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-4"
                style={{ height: 'calc(100vh - 200px)' }}
              >
                <SpreadsheetGrid className="h-full" />
              </motion.div>

              {/* Sheet tabs */}
              <SheetTabs />
            </>
          ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex items-center justify-center p-8"
          >
            <div className="text-center max-w-md">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FileText className="w-12 h-12 text-primary" />
              </motion.div>
              
              <h2 className="text-2xl font-semibold mb-3">
                Welcome to the Clerk Prototype
              </h2>
              <p className="text-muted-foreground mb-8">
                Upload your CSV or Excel files to get started with AI-powered spreadsheet analysis.
              </p>
              
              <UploadButton className="w-full" />
              
              <div className="mt-6 text-sm text-muted-foreground">
                <p>Supports CSV, XLSX, and XLS files</p>
                <p className="mt-1">Drag and drop files anywhere to upload</p>
              </div>
            </div>
          </motion.div>
          )}
        </div>

        {/* FAB */}
        <FABInsights />

        {/* Loading overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Search Dialog - Simple inline version */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsSearchOpen(false)}
            />
            
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4 z-50"
            >
              <div className="bg-card border border-border rounded-lg shadow-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search across all sheets..."
                    className="flex-1 border-0 bg-transparent focus:outline-none text-lg"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsSearchOpen(false);
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(false)}
                    className="w-8 h-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-center text-muted-foreground py-8">
                  <p>Search functionality coming soon!</p>
                  <p className="text-xs mt-1">Press Cmd+F to open, Escape to close</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}