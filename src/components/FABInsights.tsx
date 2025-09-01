import { BarChart3, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';

export function FABInsights() {
  const navigate = useNavigate();
  const location = useLocation();
  const { workbook, aiResponses } = useSpreadsheetStore();
  
  const isOnInsights = location.pathname === '/insights';
  const hasData = workbook && workbook.sheets[0]?.rows.length > 0;
  const insightCount = aiResponses.reduce((count, response) => 
    count + (response.insights?.length || 0), 0
  );

  const handleClick = () => {
    if (isOnInsights) {
      navigate('/');
    } else {
      navigate('/insights');
    }
  };

  if (!hasData) {
    return null;
  }

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30,
        delay: 0.5 
      }}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          onClick={handleClick}
          size="lg"
          className="fab-lift w-14 h-14 rounded-full bg-fab text-fab-foreground shadow-strong hover:shadow-glow"
        >
          <motion.div
            animate={{ rotate: isOnInsights ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOnInsights ? (
              <ChevronUp className="w-6 h-6" />
            ) : (
              <BarChart3 className="w-6 h-6" />
            )}
          </motion.div>
        </Button>

        {/* Insight count badge */}
        {insightCount > 0 && !isOnInsights && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Badge className="bg-success text-success-foreground border-0 min-w-5 h-5 flex items-center justify-center text-xs">
              {insightCount}
            </Badge>
          </motion.div>
        )}
      </motion.div>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="absolute right-full top-1/2 -translate-y-1/2 mr-3 pointer-events-none"
      >
        <div className="bg-popover text-popover-foreground px-2 py-1 rounded-md text-sm whitespace-nowrap shadow-medium">
          {isOnInsights ? 'Back to Sheet' : 'View Insights'}
        </div>
      </motion.div>
    </motion.div>
  );
}