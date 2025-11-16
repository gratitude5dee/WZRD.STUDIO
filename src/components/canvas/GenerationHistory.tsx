import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, X, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { generationService } from '@/services/generationService'
import { useCanvasStore } from '@/lib/stores/canvas-store'
import { toast } from 'sonner'

interface GenerationHistoryProps {
  isOpen: boolean
  onClose: () => void
}

export function GenerationHistory({ isOpen, onClose }: GenerationHistoryProps) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { addObject, viewport } = useCanvasStore()

  useEffect(() => {
    if (isOpen) {
      loadHistory()
    }
  }, [isOpen])

  const loadHistory = async () => {
    setIsLoading(true)
    try {
      const data = await generationService.getGenerationHistory()
      setHistory(data)
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCanvas = (item: any) => {
    if (!item.output_image_url) return

    const canvasObject = generationService.createCanvasObject(
      {
        id: item.id,
        url: item.output_image_url,
        width: 1024,
        height: 1024,
        prompt: item.prompt,
        model: item.model,
        status: 'completed',
      },
      {
        x: -viewport.x / viewport.scale + 400,
        y: -viewport.y / viewport.scale + 300,
      }
    )

    addObject(canvasObject)
    toast.success('Added to canvas!')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[400px] bg-card border-l border-border shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Generation History</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="h-[calc(100vh-73px)]">
              <div className="p-4 space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-muted-foreground">Loading...</div>
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="w-12 h-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No generation history yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Generate your first image to see it here
                    </p>
                  </div>
                ) : (
                  history.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-accent/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors"
                    >
                      {/* Thumbnail */}
                      {item.output_image_url && (
                        <div className="relative mb-2 rounded-md overflow-hidden bg-muted">
                          <img
                            src={item.output_image_url}
                            alt={item.prompt}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        </div>
                      )}

                      {/* Info */}
                      <p className="text-xs text-foreground mb-2 line-clamp-2">{item.prompt}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>{item.model?.split('/').pop()}</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          item.status === 'completed' 
                            ? 'bg-green-500/10 text-green-500'
                            : item.status === 'failed'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      {/* Actions */}
                      {item.status === 'completed' && item.output_image_url && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleAddToCanvas(item)}
                            className="flex-1"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Add to Canvas
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
