import { motion } from 'framer-motion';
import { Layers, Image, Video, FileText } from 'lucide-react';

interface WorkflowDiagramProps {
  className?: string;
}

export const WorkflowDiagram = ({ className = '' }: WorkflowDiagramProps) => {
  const leftNodes = [
    { id: 'text-to-image', label: 'Text-to-Image', icon: Image, color: 'from-blue-500 to-cyan-500' },
    { id: 'image-to-video', label: 'Image-to-Video', icon: Video, color: 'from-purple-500 to-pink-500' },
    { id: 'text-gen', label: 'Text Generation', icon: FileText, color: 'from-green-500 to-emerald-500' },
  ];

  const rightNodes = [
    { id: 'generated-image', label: 'Generated Image', icon: Image, color: 'from-orange-500 to-red-500' },
    { id: 'video-output', label: 'Video Output', icon: Video, color: 'from-violet-500 to-purple-500' },
    { id: 'text-result', label: 'Text Result', icon: FileText, color: 'from-teal-500 to-cyan-500' },
  ];

  return (
    <div className={`relative w-full h-80 flex items-center justify-between ${className}`}>
      {/* Left nodes */}
      <div className="flex flex-col gap-6 z-10">
        {leftNodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r ${node.color} bg-opacity-10 border border-white/10 backdrop-blur-sm`}>
              <node.icon className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white whitespace-nowrap">{node.label}</span>
            </div>
            {/* Animated dot */}
            <motion.div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"
              animate={{
                x: [0, 80, 80],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: index * 0.3,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Center node */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="relative z-20"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-purple-500/25">
          <Layers className="w-10 h-10 text-purple-400" />
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 blur-xl animate-pulse" />
      </motion.div>

      {/* Right nodes */}
      <div className="flex flex-col gap-6 z-10">
        {rightNodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="relative"
          >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r ${node.color} bg-opacity-10 border border-white/10 backdrop-blur-sm`}>
              <node.icon className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white whitespace-nowrap">{node.label}</span>
            </div>
            {/* Animated dot */}
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"
              animate={{
                x: [0, -80, -80],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: index * 0.3 + 0.5,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
        {/* Lines from left nodes to center */}
        {leftNodes.map((_, index) => (
          <motion.line
            key={`left-${index}`}
            x1="35%"
            y1={`${25 + index * 25}%`}
            x2="50%"
            y2="50%"
            stroke="rgba(139, 92, 246, 0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
          />
        ))}
        
        {/* Lines from center to right nodes */}
        {rightNodes.map((_, index) => (
          <motion.line
            key={`right-${index}`}
            x1="50%"
            y1="50%"
            x2="65%"
            y2={`${25 + index * 25}%`}
            stroke="rgba(236, 72, 153, 0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
          />
        ))}
      </svg>
    </div>
  );
};
