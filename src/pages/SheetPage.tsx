import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { SpreadsheetGrid } from '@/components/SpreadsheetGrid';
import { FormulaBar } from '@/components/FormulaBar';
import { SheetTabs } from '@/components/SheetTabs';
import { UploadButton } from '@/components/UploadButton';
import { NewWorkbookButton } from '@/components/NewWorkbookButton';
import { AiCommandBar } from '@/components/AiCommandBar';
import { FABInsights } from '@/components/FABInsights';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSheetPage } from './hooks/useSheetPage';

export function SheetPage() {
  const { workbook, isLoading, sheetCountLabel, workbookName } = useSheetPage();

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
            <h1 className="text-lg font-semibold">{workbookName}</h1>
            {workbook && (
              <p className="text-sm text-muted-foreground">
                {sheetCountLabel}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
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
              style={{ height: '400px' }}
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

      {/* AI Command Bar */}
      {workbook && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 border-t bg-card/50"
        >
          <AiCommandBar />
        </motion.div>
      )}

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