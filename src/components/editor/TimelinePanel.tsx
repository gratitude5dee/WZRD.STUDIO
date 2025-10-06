
import React, { useState, useRef, useEffect } from 'react';
import { useVideoEditor } from '@/providers/VideoEditorProvider';
import { ScrollArea } from '@/components/ui/scroll-area';
import TimelineClip from './TimelineClip';
import TimelineConnectionLines from './TimelineConnectionLines';
import TimelinePlayhead from './TimelinePlayhead';
import TimelineTrack from './TimelineTrack';

const TimelinePanel = () => {
  const { 
    mediaItems, 
    currentTime, 
    duration,
    selectedMediaIds,
    selectMediaItem,
    clipConnections,
    activeConnection,
    addClipConnection,
    setActiveConnection,
    updateActiveConnectionCursor,
  } = useVideoEditor();

  const [clipRefs, setClipRefs] = useState<Map<string, { x: number; y: number; width: number; height: number }>>(new Map());
  const timelineRef = useRef<HTMLDivElement>(null);
  const pixelsPerSecond = 100;

  const handleConnectionPointClick = (clipId: string, point: 'left' | 'right', e: React.MouseEvent) => {
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;

    setActiveConnection({
      sourceId: clipId,
      sourcePoint: point,
      cursorX: e.clientX - rect.left,
      cursorY: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!activeConnection || !timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    updateActiveConnectionCursor(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!activeConnection) return;

    // Check if we're over a connection point (this would require more sophisticated hit detection)
    // For now, we'll just clear the active connection
    setActiveConnection(null);
  };

  const getConnectedPoints = (clipId: string): Array<'left' | 'right'> => {
    const points: Array<'left' | 'right'> = [];
    clipConnections.forEach(conn => {
      if (conn.sourceId === clipId) points.push(conn.sourcePoint);
      if (conn.targetId === clipId) points.push(conn.targetPoint);
    });
    return points;
  };

  // Update clip positions for connection line rendering
  useEffect(() => {
    const newClipRefs = new Map();
    mediaItems.forEach(item => {
      const startX = (item.startTime || 0) * pixelsPerSecond;
      const width = ((item.endTime || item.duration || 5) - (item.startTime || 0)) * pixelsPerSecond;
      
      // Determine track position
      let y = 0;
      if (item.type === 'video' || item.type === 'image') y = 0;
      if (item.type === 'audio') y = 64;
      
      newClipRefs.set(item.id, { x: startX, y, width, height: 48 });
    });
    setClipRefs(newClipRefs);
  }, [mediaItems, pixelsPerSecond]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Timeline Header */}
      <div className="flex-none bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-800/40 p-3 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-200">Timeline</span>
        <div className="text-xs text-zinc-400">
          {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div 
          ref={timelineRef}
          className="min-h-[200px] relative"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Timeline Ruler */}
          <div className="h-8 border-b border-zinc-800/40 bg-gradient-to-b from-zinc-900/50 to-transparent backdrop-blur-sm flex sticky top-0 z-10">
            {Array.from({ length: Math.ceil(duration || 10) }).map((_, i) => (
              <div 
                key={i} 
                className="flex-none w-[100px] border-r border-zinc-800/30 text-[10px] font-medium text-zinc-500 flex items-center pl-2"
              >
                {i}:00
              </div>
            ))}
          </div>
          
          {/* Playhead */}
          <TimelinePlayhead 
            currentTime={currentTime}
            duration={duration}
            pixelsPerSecond={pixelsPerSecond}
          />
          
          {/* Connection Lines */}
          <TimelineConnectionLines 
            connections={clipConnections}
            clipRefs={clipRefs}
          />
          
          {/* Preview Connection Line */}
          {activeConnection && timelineRef.current && (
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 40 }}>
              <defs>
                <linearGradient id="timeline-preview-gradient">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              
              <line
                x1={clipRefs.get(activeConnection.sourceId)?.x || 0}
                y1={(clipRefs.get(activeConnection.sourceId)?.y || 0) + 24}
                x2={activeConnection.cursorX}
                y2={activeConnection.cursorY}
                stroke="url(#timeline-preview-gradient)"
                strokeWidth="2.5"
                strokeDasharray="8 4"
                strokeLinecap="round"
                style={{ animation: 'dash 20s linear infinite' }}
              />
              
              <circle 
                cx={activeConnection.cursorX} 
                cy={activeConnection.cursorY} 
                r="5" 
                fill="#60a5fa"
              />
            </svg>
          )}
          
          {/* Tracks */}
          <div className="flex flex-col">
            {/* Video Track */}
            <TimelineTrack type="video" label="Video">
              {mediaItems
                .filter(item => item.type === 'video' || item.type === 'image')
                .map(item => (
                  <TimelineClip
                    key={item.id}
                    clip={item}
                    isSelected={selectedMediaIds.includes(item.id)}
                    onSelect={() => selectMediaItem(item.id)}
                    onConnectionPointClick={handleConnectionPointClick}
                    connectedPoints={getConnectedPoints(item.id)}
                    pixelsPerSecond={pixelsPerSecond}
                  />
                ))
              }
            </TimelineTrack>
            
            {/* Audio Track */}
            <TimelineTrack type="audio" label="Audio">
              {mediaItems
                .filter(item => item.type === 'audio')
                .map(item => (
                  <TimelineClip
                    key={item.id}
                    clip={item}
                    isSelected={selectedMediaIds.includes(item.id)}
                    onSelect={() => selectMediaItem(item.id)}
                    onConnectionPointClick={handleConnectionPointClick}
                    connectedPoints={getConnectedPoints(item.id)}
                    pixelsPerSecond={pixelsPerSecond}
                  />
                ))
              }
            </TimelineTrack>
            
            {/* Effects Track */}
            <TimelineTrack type="effects" label="Effects">
              {/* Empty track for future effects */}
            </TimelineTrack>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default TimelinePanel;
