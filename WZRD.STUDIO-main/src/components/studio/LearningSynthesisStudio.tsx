import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { PortalHeader } from '@/components/ui/portal-header';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import {
  Brain,
  Users,
  Sparkles,
  Zap,
  Orbit,
  Mic,
  Video,
  Share2,
  Plus,
  MessageCircle,
  Eye,
  Layers,
  Atom,
  Star,
  GitBranch,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  status: 'active' | 'away' | 'thinking';
  cursor?: { x: number; y: number };
  lastSeen: string;
}

interface SynthesisSession {
  id: string;
  title: string;
  description: string;
  participants: Participant[];
  concepts: string[];
  connections: Array<{ from: string; to: string; strength: number }>;
  insights: string[];
  createdAt: string;
  updatedAt: string;
}

interface LearningSynthesisStudioProps {
  sessionId?: string;
  className?: string;
}

export const LearningSynthesisStudio: React.FC<LearningSynthesisStudioProps> = ({ 
  sessionId, 
  className 
}) => {
  const { user } = useAuth();
  const [session, setSession] = useState<SynthesisSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [synthesisMode, setSynthesisMode] = useState<'explore' | 'connect' | 'create'>('explore');
  const [insights, setInsights] = useState<string[]>([]);
  const [isAIAssisting, setIsAIAssisting] = useState(false);

  // Real-time presence tracking
  useEffect(() => {
    if (!sessionId || !user) return;

    const channel = supabase.channel(`synthesis-session-${sessionId}`)
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const participantList = Object.values(newState).flat().filter(Boolean) as any[];
        const participants = participantList.map(p => ({
          id: p.id || 'unknown',
          name: p.name || 'Anonymous',
          status: p.status || 'active',
          lastSeen: p.lastSeen || new Date().toISOString()
        })) as Participant[];
        setParticipants(participants);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        toast.success(`${newPresences[0]?.name} joined the synthesis session`);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        toast.info(`${leftPresences[0]?.name} left the synthesis session`);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: user.id,
            name: user.email?.split('@')[0] || 'Unknown',
            status: 'active',
            lastSeen: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, user]);

  // Real-time session updates
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel('session-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'synthesis_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Session updated:', payload);
          if (payload.new) {
            setSession(payload.new as SynthesisSession);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const handleConceptSynthesis = useCallback(async () => {
    if (selectedConcepts.length < 2) {
      toast.error('Select at least 2 concepts to synthesize');
      return;
    }

    setIsAIAssisting(true);
    try {
      // Call AI synthesis function
      const { data, error } = await supabase.functions.invoke('ai-synthesis', {
        body: {
          concepts: selectedConcepts,
          mode: synthesisMode,
          context: session?.description
        }
      });

      if (error) throw error;

      const newInsight = data.insight;
      setInsights(prev => [...prev, newInsight]);
      toast.success('New insight synthesized!');

    } catch (error) {
      console.error('Synthesis error:', error);
      toast.error('Failed to synthesize concepts');
    } finally {
      setIsAIAssisting(false);
    }
  }, [selectedConcepts, synthesisMode, session]);

  const toggleVoiceChat = useCallback(() => {
    setIsVoiceActive(!isVoiceActive);
    toast.info(isVoiceActive ? 'Voice chat disabled' : 'Voice chat enabled');
  }, [isVoiceActive]);

  const toggleVideoChat = useCallback(() => {
    setIsVideoActive(!isVideoActive);
    toast.info(isVideoActive ? 'Video chat disabled' : 'Video chat enabled');
  }, [isVideoActive]);

  return (
    <div className={`h-full w-full bg-cosmic-void relative overflow-hidden ${className}`}>
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-nebula-field opacity-20 pointer-events-none" />
      <div className="absolute inset-0 particle-field opacity-15 pointer-events-none" />
      
      {/* Synthesis Studio Header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <PortalHeader 
          title="Synthesis Studio" 
          subtitle="Collaborative knowledge creation space"
          cosmic={true}
          actions={
            <div className="flex space-x-2">
              <GlassButton 
                variant={isVoiceActive ? "stellar" : "ghost"} 
                size="sm"
                onClick={toggleVoiceChat}
              >
                <Mic className="w-4 h-4" />
                Voice
              </GlassButton>
              <GlassButton 
                variant={isVideoActive ? "stellar" : "ghost"} 
                size="sm"
                onClick={toggleVideoChat}
              >
                <Video className="w-4 h-4" />
                Video
              </GlassButton>
              <GlassButton variant="cosmic" size="sm">
                <Share2 className="w-4 h-4" />
                Share
              </GlassButton>
            </div>
          }
        />
      </div>

      {/* Main Studio Layout */}
      <div className="pt-32 pb-8 px-4 h-full flex gap-4">
        
        {/* Left Panel - Participants & Tools */}
        <div className="w-80 space-y-4">
          {/* Active Participants */}
          <GlassCard variant="nebula" depth="medium" glow="subtle" className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-5 h-5 text-cosmic-nebula" />
              <h3 className="font-semibold glow-text-secondary">Active Minds</h3>
              <span className="text-xs bg-cosmic-nebula/20 text-cosmic-nebula px-2 py-1 rounded-full">
                {participants.length}
              </span>
            </div>
            
            <div className="space-y-2">
              {participants.map((participant) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-cosmic-void/30"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cosmic-stellar to-cosmic-plasma flex items-center justify-center">
                      <span className="text-xs font-bold text-cosmic-void">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-cosmic-void ${
                      participant.status === 'active' ? 'bg-cosmic-quantum' :
                      participant.status === 'thinking' ? 'bg-cosmic-temporal animate-pulse' : 'bg-muted'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{participant.name}</p>
                    <p className="text-xs text-muted-foreground">{participant.status}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Synthesis Tools */}
          <GlassCard variant="stellar" depth="medium" glow="subtle" className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Atom className="w-5 h-5 text-cosmic-stellar animate-spin" style={{ animationDuration: '4s' }} />
              <h3 className="font-semibold glow-text-primary">Synthesis Tools</h3>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <GlassButton 
                  variant={synthesisMode === 'explore' ? 'stellar' : 'ghost'}
                  size="sm"
                  onClick={() => setSynthesisMode('explore')}
                  className="flex-col h-16"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">Explore</span>
                </GlassButton>
                <GlassButton 
                  variant={synthesisMode === 'connect' ? 'stellar' : 'ghost'}
                  size="sm"
                  onClick={() => setSynthesisMode('connect')}
                  className="flex-col h-16"
                >
                  <GitBranch className="w-4 h-4" />
                  <span className="text-xs">Connect</span>
                </GlassButton>
                <GlassButton 
                  variant={synthesisMode === 'create' ? 'stellar' : 'ghost'}
                  size="sm"
                  onClick={() => setSynthesisMode('create')}
                  className="flex-col h-16"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-xs">Create</span>
                </GlassButton>
              </div>
              
              <GlassButton 
                variant="cosmic" 
                onClick={handleConceptSynthesis}
                disabled={selectedConcepts.length < 2 || isAIAssisting}
                className="w-full"
                particle={isAIAssisting}
              >
                {isAIAssisting ? (
                  <>
                    <Orbit className="w-4 h-4 animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    AI Synthesis
                  </>
                )}
              </GlassButton>
            </div>
          </GlassCard>
        </div>

        {/* Center Panel - Synthesis Canvas */}
        <div className="flex-1">
          <GlassCard variant="cosmic" depth="deep" glow="medium" className="h-full p-6">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Layers className="w-6 h-6 text-cosmic-plasma" />
                  <h3 className="text-xl font-bold glow-text-cosmic">Synthesis Canvas</h3>
                </div>
                <div className="flex space-x-2">
                  <GlassButton variant="void" size="sm">
                    <Plus className="w-4 h-4" />
                    Add Concept
                  </GlassButton>
                  <GlassButton variant="cosmic" size="sm">
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </GlassButton>
                </div>
              </div>
              
              {/* Interactive Canvas Area */}
              <div className="flex-1 relative bg-cosmic-void/20 rounded-lg border border-cosmic-plasma/20 overflow-hidden">
                <div className="absolute inset-0 bg-quantum-flow opacity-10" />
                
                {/* Concept Nodes Visualization */}
                <div className="relative h-full p-8">
                  {selectedConcepts.map((concept, index) => (
                    <motion.div
                      key={concept}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`absolute w-24 h-24 rounded-full bg-gradient-to-br from-cosmic-stellar to-cosmic-temporal flex items-center justify-center cursor-pointer transform transition-all duration-300 hover:scale-110`}
                      style={{
                        left: `${20 + index * 15}%`,
                        top: `${30 + (index % 2) * 20}%`,
                      }}
                    >
                      <span className="text-xs font-bold text-cosmic-void text-center px-2">
                        {concept}
                      </span>
                    </motion.div>
                  ))}
                  
                  {/* Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {selectedConcepts.map((_, index) => 
                      selectedConcepts.slice(index + 1).map((_, nextIndex) => (
                        <motion.line
                          key={`${index}-${nextIndex}`}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          x1={`${20 + index * 15}%`}
                          y1={`${30 + (index % 2) * 20}%`}
                          x2={`${20 + (index + nextIndex + 1) * 15}%`}
                          y2={`${30 + ((index + nextIndex + 1) % 2) * 20}%`}
                          stroke="hsl(var(--cosmic-plasma))"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          className="animate-pulse"
                        />
                      ))
                    )}
                  </svg>
                  
                  {/* Placeholder when empty */}
                  {selectedConcepts.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <Atom className="w-16 h-16 text-cosmic-plasma/50 mx-auto animate-spin" style={{ animationDuration: '8s' }} />
                        <p className="text-muted-foreground">Select concepts to begin synthesis</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Panel - Insights & Chat */}
        <div className="w-80 space-y-4">
          {/* Synthesis Insights */}
          <GlassCard variant="quantum" depth="medium" glow="subtle" className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-5 h-5 text-cosmic-quantum animate-pulse" />
              <h3 className="font-semibold glow-text-secondary">Insights</h3>
              <span className="text-xs bg-cosmic-quantum/20 text-cosmic-quantum px-2 py-1 rounded-full">
                {insights.length}
              </span>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <AnimatePresence>
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-3 rounded-lg bg-cosmic-quantum/10 border border-cosmic-quantum/20"
                  >
                    <p className="text-sm">{insight}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">AI Generated</span>
                      <Star className="w-3 h-3 text-cosmic-quantum" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {insights.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 text-cosmic-quantum/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Insights will appear here</p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Collaboration Chat */}
          <GlassCard variant="void" depth="medium" glow="subtle" className="p-4 flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <MessageCircle className="w-5 h-5 text-cosmic-temporal" />
              <h3 className="font-semibold">Live Chat</h3>
            </div>
            
            <div className="space-y-3">
              <div className="h-32 bg-cosmic-void/30 rounded-lg p-3 text-center flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Chat interface ready</p>
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Share your thoughts..."
                  className="flex-1 glass-input text-sm py-2 px-3 rounded-lg"
                />
                <GlassButton variant="stellar" size="sm">
                  Send
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};