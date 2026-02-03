import { motion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface GenerationProgressProps {
  isGenerating: boolean
  progress: number
  prompt: string
}

export function GenerationProgress({ isGenerating, progress, prompt }: GenerationProgressProps) {
  if (!isGenerating) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[500px]"
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Sparkles className="w-5 h-5 text-primary" />
              <motion.div
                className="absolute inset-0"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.div>
            </div>
            <span className="text-sm font-medium text-foreground">Generating...</span>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-2 mb-3" />

        {/* Prompt */}
        <p className="text-xs text-muted-foreground line-clamp-2">{prompt}</p>
      </div>
    </motion.div>
  )
}
