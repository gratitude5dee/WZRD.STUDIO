import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { PortalHeader } from '@/components/ui/portal-header';
import { LearningSynthesisStudio } from '@/components/studio/LearningSynthesisStudio';
import { CommunityCollaboration } from '@/components/studio/CommunityCollaboration';
import { KnowledgeCanvas } from '@/components/knowledge/KnowledgeCanvas';
import {
  Brain,
  Users,
  Layers,
  Sparkles,
  Atom,
  Orbit,
  Zap,
  BookOpen,
  Target,
  Lightbulb,
  MessageSquare
} from 'lucide-react';

type StudioMode = 'synthesis' | 'knowledge' | 'community' | 'overview';

const LearningStudioPage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<StudioMode>('overview');

  const renderContent = () => {
    switch (activeMode) {
      case 'synthesis':
        return <LearningSynthesisStudio sessionId="demo-session" />;
      case 'knowledge':
        return <KnowledgeCanvas />;
      case 'community':
        return <CommunityCollaboration />;
      default:
        return <StudioOverview onModeSelect={setActiveMode} />;
    }
  };

  if (activeMode !== 'overview') {
    return (
      <div className="h-screen w-screen bg-cosmic-void relative">
        {/* Back to Overview */}
        <div className="absolute top-4 left-4 z-50">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => setActiveMode('overview')}
          >
            ← Studio Overview
          </GlassButton>
        </div>
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-cosmic-void relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-nebula-field opacity-20 pointer-events-none" />
      <div className="absolute inset-0 particle-field opacity-15 pointer-events-none" />
      
      {/* Studio Overview */}
      <div className="relative z-10 h-full p-6">
        <PortalHeader 
          title="Learning Studio" 
          subtitle="Cosmic collaboration and knowledge synthesis platform"
          cosmic={true}
          actions={
            <div className="flex space-x-2">
              <GlassButton variant="stellar" size="sm">
                <BookOpen className="w-4 h-4" />
                Guide
              </GlassButton>
              <GlassButton variant="cosmic" size="sm">
                <Target className="w-4 h-4" />
                Settings
              </GlassButton>
            </div>
          }
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          
          {/* Synthesis Studio Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GlassCard 
              variant="stellar" 
              depth="deep" 
              glow="medium"
              interactive="press"
              particle
              shimmer
              className="h-full cursor-pointer"
              onClick={() => setActiveMode('synthesis')}
            >
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cosmic-stellar to-cosmic-temporal flex items-center justify-center">
                      <Brain className="w-8 h-8 text-cosmic-void" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-cosmic-quantum flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold glow-text-primary">Synthesis Studio</h3>
                    <p className="text-muted-foreground">Real-time collaborative knowledge creation</p>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-lg bg-cosmic-stellar/10 border border-cosmic-stellar/20">
                      <Atom className="w-6 h-6 text-cosmic-stellar mx-auto mb-1 animate-spin" style={{ animationDuration: '4s' }} />
                      <p className="text-xs font-medium">AI Synthesis</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-cosmic-plasma/10 border border-cosmic-plasma/20">
                      <Users className="w-6 h-6 text-cosmic-plasma mx-auto mb-1" />
                      <p className="text-xs font-medium">Live Collaboration</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-cosmic-quantum/10 border border-cosmic-quantum/20">
                      <Zap className="w-6 h-6 text-cosmic-quantum mx-auto mb-1 animate-pulse" />
                      <p className="text-xs font-medium">Instant Insights</p>
                    </div>
                  </div>

                  <div className="bg-cosmic-void/30 rounded-lg p-4 border border-cosmic-stellar/20">
                    <h4 className="font-semibold text-cosmic-stellar mb-2">Active Features</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-cosmic-quantum animate-pulse" />
                        <span>Real-time presence tracking</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-cosmic-stellar animate-pulse" />
                        <span>AI-powered concept synthesis</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-cosmic-plasma animate-pulse" />
                        <span>Interactive canvas visualization</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <GlassButton variant="stellar" className="w-full mt-4">
                  <Brain className="w-4 h-4" />
                  Enter Synthesis Studio
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>

          {/* Knowledge Canvas Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GlassCard 
              variant="cosmic" 
              depth="deep" 
              glow="medium"
              interactive="press"
              particle
              shimmer
              className="h-full cursor-pointer"
              onClick={() => setActiveMode('knowledge')}
            >
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cosmic-nebula to-cosmic-plasma flex items-center justify-center">
                      <Layers className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-cosmic-stellar flex items-center justify-center">
                      <Orbit className="w-3 h-3 text-cosmic-void animate-spin" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold glow-text-cosmic">Knowledge Canvas</h3>
                    <p className="text-muted-foreground">Interactive knowledge graph exploration</p>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-lg bg-cosmic-nebula/10 border border-cosmic-nebula/20">
                      <Orbit className="w-6 h-6 text-cosmic-nebula mx-auto mb-1 animate-spin" style={{ animationDuration: '6s' }} />
                      <p className="text-xs font-medium">Semantic Zoom</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-cosmic-plasma/10 border border-cosmic-plasma/20">
                      <Layers className="w-6 h-6 text-cosmic-plasma mx-auto mb-1" />
                      <p className="text-xs font-medium">Node Clusters</p>
                    </div>
                  </div>

                  <div className="bg-cosmic-void/30 rounded-lg p-4 border border-cosmic-nebula/20">
                    <h4 className="font-semibold text-cosmic-nebula mb-2">Canvas Features</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-cosmic-quantum animate-pulse" />
                        <span>Virtualized performance</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-cosmic-stellar animate-pulse" />
                        <span>Dynamic concept connections</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-cosmic-plasma animate-pulse" />
                        <span>AI-powered suggestions</span>
                      </li>
                    </ul>
                  </div>

                  <div className="text-center py-4">
                    <div className="inline-flex items-center space-x-2 text-sm text-cosmic-nebula">
                      <span>127 Concepts</span>
                      <div className="w-1 h-1 rounded-full bg-cosmic-nebula" />
                      <span>89 Connections</span>
                    </div>
                  </div>
                </div>

                <GlassButton variant="cosmic" className="w-full mt-4">
                  <Layers className="w-4 h-4" />
                  Explore Knowledge Canvas
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>

          {/* Community Collaboration Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="lg:col-span-2"
          >
            <GlassCard 
              variant="nebula" 
              depth="deep" 
              glow="medium"
              interactive="press"
              particle
              shimmer
              className="h-full cursor-pointer"
              onClick={() => setActiveMode('community')}
            >
              <div className="p-8 h-full flex">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cosmic-quantum to-cosmic-temporal flex items-center justify-center">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-cosmic-nebula flex items-center justify-center">
                        <MessageSquare className="w-3 h-3 text-white animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold glow-text-secondary">Community Collaboration</h3>
                      <p className="text-muted-foreground">Share insights and discover new perspectives</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-cosmic-stellar/10 border border-cosmic-stellar/20">
                      <Lightbulb className="w-6 h-6 text-cosmic-stellar mx-auto mb-1" />
                      <p className="text-xs font-medium">34 Insights</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-cosmic-plasma/10 border border-cosmic-plasma/20">
                      <MessageSquare className="w-6 h-6 text-cosmic-plasma mx-auto mb-1" />
                      <p className="text-xs font-medium">127 Discussions</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-cosmic-quantum/10 border border-cosmic-quantum/20">
                      <Users className="w-6 h-6 text-cosmic-quantum mx-auto mb-1" />
                      <p className="text-xs font-medium">89 Active</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-cosmic-temporal/10 border border-cosmic-temporal/20">
                      <Zap className="w-6 h-6 text-cosmic-temporal mx-auto mb-1 animate-pulse" />
                      <p className="text-xs font-medium">12 Trending</p>
                    </div>
                  </div>

                  <GlassButton variant="void" className="w-full">
                    <Users className="w-4 h-4" />
                    Join Community
                  </GlassButton>
                </div>

                <div className="w-px bg-gradient-to-b from-transparent via-cosmic-nebula/30 to-transparent mx-8" />

                <div className="flex-1 space-y-4">
                  <h4 className="font-semibold text-cosmic-nebula">Recent Activity</h4>
                  <div className="space-y-3">
                    {[
                      { author: 'Dr. Sarah Chen', content: 'Quantum creativity synthesis breakthrough...', time: '2h ago' },
                      { author: 'Alex Rivera', content: 'How do you handle knowledge overflow?', time: '4h ago' },
                      { author: 'Maya Patel', content: 'Biomimicry + AI = Amazing insights!', time: '6h ago' }
                    ].map((item, index) => (
                      <div key={index} className="p-3 rounded-lg bg-cosmic-void/30 border border-cosmic-nebula/20">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cosmic-stellar to-cosmic-plasma flex items-center justify-center">
                            <span className="text-xs font-bold text-cosmic-void">
                              {item.author.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-medium">{item.author}</span>
                          <span className="text-xs text-muted-foreground">{item.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{item.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Studio Overview Component
const StudioOverview: React.FC<{ onModeSelect: (mode: StudioMode) => void }> = ({ onModeSelect }) => {
  return null; // This is handled in the main component
};

export default LearningStudioPage;