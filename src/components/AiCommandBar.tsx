import { useState, useCallback, useEffect } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AIService } from '@/lib/ai';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { toast } from '@/hooks/use-toast';

interface AiCommandBarProps {
  className?: string;
}

export function AiCommandBar({ className }: AiCommandBarProps) {
  const [input, setInput] = useState('');
  const [recognizedTokens, setRecognizedTokens] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const { isAiProcessing, addAiCommand, addAiResponse, setAiProcessing } = useSpreadsheetStore();

  // Recognize semantic tokens as user types
  useEffect(() => {
    if (input.trim()) {
      const tokens = AIService.recognizeTokens(input);
      setRecognizedTokens(tokens);
    } else {
      setRecognizedTokens([]);
    }
  }, [input]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim() || isAiProcessing) return;

    const commandType = input.startsWith('/ask') ? 'ask' 
      : input.startsWith('/summarize') ? 'summarize'
      : input.startsWith('/chart') ? 'chart'
      : input.startsWith('/insights') ? 'insights'
      : input.startsWith('/clean') ? 'clean'
      : 'ask';

    const command = {
      id: `cmd-${Date.now()}`,
      command: input,
      type: commandType as any,
      timestamp: new Date(),
    };

    addAiCommand(command);
    setAiProcessing(true);
    setInput('');

    try {
      const response = await AIService.processCommand(command);
      addAiResponse(response);
      
      toast({
        title: "AI Response",
        description: response.response,
      });
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Failed to process command",
        variant: "destructive",
      });
    } finally {
      setAiProcessing(false);
    }
  }, [input, isAiProcessing, addAiCommand, addAiResponse, setAiProcessing]);

  const suggestions = [
    { command: '/ask', description: 'Ask questions about your data' },
    { command: '/summarize', description: 'Get data summary and statistics' },
    { command: '/chart', description: 'Generate charts and visualizations' },
    { command: '/insights', description: 'Discover patterns and anomalies' },
  ];

  return (
    <motion.div
      className={className}
      animate={{ scale: isFocused ? 1.02 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <Card className={`p-3 transition-all duration-200 ${isFocused ? 'command-glow' : ''}`}>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pr-20 md:pr-24">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask AI about your data or use commands like /summarize, /chart..."
              className="pl-10 pr-4"
              disabled={isAiProcessing}
            />
          </div>
          <Button 
            type="submit" 
            size="sm" 
            disabled={!input.trim() || isAiProcessing}
          >
            {isAiProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>

        {/* Recognized tokens */}
        <AnimatePresence>
          {recognizedTokens.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-1 mt-2"
            >
              {recognizedTokens.map((token, index) => (
                <motion.div
                  key={token}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: { delay: index * 0.05 }
                  }}
                >
                  <Badge 
                    variant="outline" 
                    className="token-highlight text-xs animate-pulse-glow"
                  >
                    {token}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Command suggestions when focused and empty */}
        <AnimatePresence>
          {isFocused && !input && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-1"
            >
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion.command}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: index * 0.05 }
                  }}
                  onClick={() => setInput(suggestion.command + ' ')}
                  className="flex items-center gap-2 w-full p-2 text-left text-sm rounded-md hover:bg-accent transition-colors"
                >
                  <Badge variant="secondary" className="text-xs">
                    {suggestion.command}
                  </Badge>
                  <span className="text-muted-foreground">
                    {suggestion.description}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}