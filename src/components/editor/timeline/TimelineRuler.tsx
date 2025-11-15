interface TimelineRulerProps {
  zoom: number;
  scrollOffset: number;
  durationMs: number;
}

const formatSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export function TimelineRuler({ zoom, scrollOffset, durationMs }: TimelineRulerProps) {
  const totalSeconds = Math.ceil(durationMs / 1000);
  const marks = [] as { left: number; label: string }[];

  for (let second = 0; second <= totalSeconds; second++) {
    const left = second * zoom - scrollOffset;
    if (left < -50) continue;
    marks.push({ left, label: formatSeconds(second) });
  }

  return (
    <div className="relative h-12 bg-card border-b border-border text-xs text-muted-foreground select-none">
      <div className="absolute inset-0 flex items-end pb-1">
        {marks.map((mark, idx) => {
          const isMajor = mark.label.split(':')[0] !== '0' || idx % 5 === 0;
          return (
            <div 
              key={mark.label} 
              className="absolute bottom-0 flex flex-col items-center"
              style={{ left: `${mark.left}px`, transform: 'translateX(-50%)' }}
            >
              <div 
                className={`w-px ${isMajor ? 'h-6 bg-border' : 'h-3 bg-border/40'}`} 
              />
              {isMajor && (
                <div className="mt-1 text-[10px] font-medium tabular-nums">
                  {mark.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
