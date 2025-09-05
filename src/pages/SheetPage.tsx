import { motion, AnimatePresence } from 'framer-motion';
import { FileText, MessageSquare, X, PanelLeft, PanelLeftClose, Send, Bot, User } from 'lucide-react';
import { SpreadsheetGrid } from '@/components/SpreadsheetGrid';
import { FormulaBar } from '@/components/FormulaBar';
import { SheetTabs } from '@/components/SheetTabs';
import { UploadButton } from '@/components/UploadButton';
import { NewWorkbookButton } from '@/components/NewWorkbookButton';
import { FABInsights } from '@/components/FABInsights';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { useState } from 'react';

export function SheetPage() {
  const { workbook, isLoading } = useSpreadsheetStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I can help you analyze your spreadsheet data, create formulas, and answer questions about your data. What would you like to explore?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
      <div className="flex-1 flex">
        {workbook ? (
          <>
            {/* Left Sidebar - Chat */}
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.aside
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="border-r bg-card/50 flex flex-col"
                >
                  {/* Sidebar Header */}
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">AI Assistant</h3>
                        <p className="text-xs text-muted-foreground">Data analysis & insights</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-xl p-3 text-sm ${
                          message.type === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-accent text-accent-foreground'
                        }`}>
                          <div className="flex items-start gap-2">
                            {message.type === 'ai' && (
                              <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            )}
                            {message.type === 'user' && (
                              <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="leading-relaxed">{message.content}</p>
                              <p className={`text-xs mt-1 opacity-70`}>
                                {message.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask about your data..."
                        className="flex-1 text-sm"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        size="sm"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
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
            </div>
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
    </div>
  );
}