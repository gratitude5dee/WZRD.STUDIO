import { motion } from 'framer-motion';
import { Sparkles, Zap, Layout, Blocks, Users, Rocket, Shield, Workflow } from 'lucide-react';
import { useState } from 'react';

export default function Features() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section id="features" className="py-24 px-4 bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#8b5cf6]/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
            <span className="text-sm font-medium text-white/80">Features</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-[#8b5cf6] to-white bg-clip-text text-transparent mb-4">
            Everything You Need to Create
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Powerful tools built for creators, designers, and builders to bring your ideas to life
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
        >
          {[
            { value: '10K+', label: 'Active Creators' },
            { value: '1M+', label: 'Generations' },
            { value: '99.9%', label: 'Uptime' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-sm"
            >
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] bg-clip-text text-transparent mb-2">
                {stat.value}
              </p>
              <p className="text-white/60 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Large Feature Card - AI Workflow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onMouseEnter={() => setHoveredCard(0)}
            onMouseLeave={() => setHoveredCard(null)}
            className="group lg:col-span-2 p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm hover:border-[#8b5cf6]/50 hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] transition-all duration-300 relative overflow-hidden"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Workflow className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">AI Workflow Builder</h3>
                  <p className="text-white/60 leading-relaxed max-w-md">
                    Create complex AI pipelines with our intuitive visual editor. Connect models, process data, and generate content seamlessly.
                  </p>
                </div>
              </div>
              
              {/* Workflow Visualization */}
              <div className="mt-8 p-6 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    {['Text Input', 'Image Input', 'Parameters'].map((item, i) => (
                      <div key={i} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <svg className="w-full h-20" viewBox="0 0 200 80">
                      {[0, 1, 2].map((i) => (
                        <motion.line
                          key={i}
                          x1="0"
                          y1={20 + i * 20}
                          x2="200"
                          y2="40"
                          stroke="url(#gradient)"
                          strokeWidth="2"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={hoveredCard === 0 ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                        />
                      ))}
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  
                  <div className="px-6 py-4 rounded-lg bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/20 border border-[#8b5cf6]/30 text-white font-medium">
                    AI Process
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <svg className="w-full h-20" viewBox="0 0 200 80">
                      {[0, 1, 2].map((i) => (
                        <motion.line
                          key={i}
                          x1="0"
                          y1="40"
                          x2="200"
                          y2={20 + i * 20}
                          stroke="url(#gradient)"
                          strokeWidth="2"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={hoveredCard === 0 ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                          transition={{ duration: 1, delay: 0.6 + i * 0.2 }}
                        />
                      ))}
                    </svg>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {['Image', 'Video', 'Text'].map((item, i) => (
                      <div key={i} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6]/10 to-[#7c3aed]/10 border border-[#8b5cf6]/30 text-white/90 text-sm font-medium">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Fast Generation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
            className="group p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm hover:border-[#8b5cf6]/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-white/60 leading-relaxed mb-6">
                Generate high-quality content in seconds with optimized AI models.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Image Generation</span>
                  <span className="text-[#8b5cf6] font-bold">~3s</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed]"
                    initial={{ width: 0 }}
                    animate={hoveredCard === 1 ? { width: '95%' } : { width: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Multiple Models */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="group p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm hover:border-[#8b5cf6]/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Blocks className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multiple AI Models</h3>
              <p className="text-white/60 leading-relaxed mb-6">
                Access various state-of-the-art AI models for different creative tasks.
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {['FLUX', 'Stable Diffusion', 'Luma', 'Custom'].map((model, i) => (
                  <div key={i} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs text-center">
                    {model}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Secure Backend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="group p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm hover:border-[#8b5cf6]/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Secure & Private</h3>
              <p className="text-white/60 leading-relaxed">
                Enterprise-grade security with encrypted API keys and secure data storage.
              </p>
            </div>
          </motion.div>

          {/* Collaboration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="group p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm hover:border-[#8b5cf6]/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Team Collaboration</h3>
              <p className="text-white/60 leading-relaxed">
                Share workflows and collaborate in real-time with your team.
              </p>
            </div>
          </motion.div>

          {/* Export Anywhere */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="group p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm hover:border-[#8b5cf6]/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Export Anywhere</h3>
              <p className="text-white/60 leading-relaxed">
                Export in multiple formats ready for any platform or workflow.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
