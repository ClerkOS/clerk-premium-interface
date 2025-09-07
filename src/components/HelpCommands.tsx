import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  MousePointer, 
  Keyboard, 
  Upload, 
  Calculator, 
  BarChart3, 
  MessageSquare,
  Search,
  FileText
} from 'lucide-react';

interface HelpCommand {
  command: string;
  description: string;
  icon: React.ReactNode;
  category: 'navigation' | 'editing' | 'features' | 'shortcuts';
}

const helpCommands: HelpCommand[] = [
  // Navigation
  {
    command: 'Navigate cells',
    description: 'Use arrow keys to move between cells',
    icon: <MousePointer className="w-4 h-4" />,
    category: 'navigation'
  },
  {
    command: 'Select cell',
    description: 'Click on any cell to select it',
    icon: <MousePointer className="w-4 h-4" />,
    category: 'navigation'
  },
  {
    command: 'Edit cell',
    description: 'Double-click or press Enter/F2 to edit',
    icon: <Calculator className="w-4 h-4" />,
    category: 'editing'
  },

  // Features
  {
    command: 'Upload file',
    description: 'Drag & drop or click upload button',
    icon: <Upload className="w-4 h-4" />,
    category: 'features'
  },
  {
    command: 'AI Chat',
    description: 'Ask questions about your data',
    icon: <MessageSquare className="w-4 h-4" />,
    category: 'features'
  },
  {
    command: 'View Insights',
    description: 'Click the insights button for AI analysis',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'features'
  },
  {
    command: 'Search data',
    description: 'Press Cmd+F to search across sheets',
    icon: <Search className="w-4 h-4" />,
    category: 'features'
  },

  // Shortcuts
  {
    command: 'Cmd+F / Ctrl+F',
    description: 'Open search dialog',
    icon: <Search className="w-4 h-4" />,
    category: 'shortcuts'
  },
  {
    command: 'Enter / F2',
    description: 'Edit selected cell',
    icon: <Calculator className="w-4 h-4" />,
    category: 'shortcuts'
  },
  {
    command: 'Escape',
    description: 'Cancel editing or close dialogs',
    icon: <Keyboard className="w-4 h-4" />,
    category: 'shortcuts'
  },
  {
    command: 'Arrow Keys',
    description: 'Navigate between cells',
    icon: <MousePointer className="w-4 h-4" />,
    category: 'shortcuts'
  }
];

const categoryColors = {
  navigation: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  editing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  features: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  shortcuts: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
};

interface HelpCommandsProps {
  className?: string;
}

export function HelpCommands({ className }: HelpCommandsProps) {
  const categories = ['navigation', 'editing', 'features', 'shortcuts'] as const;

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-base sm:text-lg font-semibold mb-2 flex items-center justify-center gap-2">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          Quick Help Guide
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Here are the most useful commands and shortcuts
        </p>
      </div>

      {categories.map((category) => {
        const commands = helpCommands.filter(cmd => cmd.category === category);
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Badge className={`${categoryColors[category]} text-xs`}>
                  {categoryName}
                </Badge>
              </div>
              
              <div className="grid gap-1 sm:gap-2">
                {commands.map((command, index) => (
                  <motion.div
                    key={command.command}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-muted-foreground flex-shrink-0">
                      {command.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs sm:text-sm truncate">
                        {command.command}
                      </div>
                      <div className="text-xs text-muted-foreground leading-tight">
                        {command.description}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        );
      })}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center p-3 sm:p-4 bg-muted/30 rounded-lg"
      >
        <p className="text-xs sm:text-sm text-muted-foreground">
          💡 <strong>Pro tip:</strong> Type "help" in the AI chat for more detailed assistance!
        </p>
      </motion.div>
    </div>
  );
}
