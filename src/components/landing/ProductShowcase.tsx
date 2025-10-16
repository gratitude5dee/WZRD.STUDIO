import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Image, Film, Upload } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
  metrics?: string;
}

const tabs: Tab[] = [
  {
    id: 'setup',
    label: 'Project Setup',
    icon: <Wand2 className="w-5 h-5" />,
    title: 'AI-Powered Project Initialization',
    description: 'Define your vision with natural language. Our AI analyzes your concept and generates a complete production blueprint in seconds.',
    image: '/lovable-uploads/075616c6-e4fc-4662-a4b8-68b746782b65.png',
    metrics: 'Setup in <30s'
  },
  {
    id: 'storyboard',
    label: 'Storyboard',
    icon: <Image className="w-5 h-5" />,
    title: 'Intelligent Storyboard Generation',
    description: 'Transform scripts into visual narratives. Automated shot generation with adaptive composition and style consistency.',
    image: '/lovable-uploads/96cbbf8f-bdb1-4d37-9c62-da1306d5fb96.png',
    metrics: 'Generated in <2min'
  },
  {
    id: 'timeline',
    label: 'Video Editor',
    icon: <Film className="w-5 h-5" />,
    title: 'Professional Timeline Editing',
    description: 'Industry-standard editing tools with AI assistance. Real-time collaboration, automated transitions, and adaptive rendering.',
    image: '/lovable-uploads/4e20f36a-2bff-48d8-b07b-257334e35506.png',
    metrics: 'INP <200ms'
  },
  {
    id: 'export',
    label: 'Export',
    icon: <Upload className="w-5 h-5" />,
    title: 'Optimized Export Pipeline',
    description: 'Broadcast-quality output with adaptive encoding. Direct publishing to all major platforms with automatic formatting.',
    image: '/lovable-uploads/f8be561d-d5b5-49a8-adaa-dbf01721ef9f.png',
    metrics: '4K ready'
  }
];

export const ProductShowcase = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  
  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Production Workflow Reimagined
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            From concept to delivery. Accelerate every stage of video production with intelligent automation.
          </p>
        </motion.div>

        {/* Tab Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-2 border border-zinc-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300
                  flex items-center gap-2
                  ${activeTab === tab.id 
                    ? 'text-white' 
                    : 'text-zinc-500 hover:text-zinc-300'
                  }
                `}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/10 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left: Description */}
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  {currentTab.title}
                </h3>
                <p className="text-lg text-zinc-400 leading-relaxed">
                  {currentTab.description}
                </p>
              </div>
              
              {currentTab.metrics && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-sm rounded-full border border-zinc-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-zinc-300 font-medium">
                    {currentTab.metrics}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Screenshot */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 overflow-hidden">
                <img
                  src={currentTab.image}
                  alt={currentTab.title}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
