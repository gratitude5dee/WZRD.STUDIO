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
    <div className="relative h-8 bg-[#0a0a0a] border-b border-[#2a2a2a] text-xs text-white/50 select-none">
      <div className="absolute inset-0 flex items-center px-4">
        {marks.map((mark, idx) => {
          const seconds = parseInt(mark.label.split(':')[1]);
          const isMajor = idx % 5 === 0;
          return (
            <div 
              key={mark.label} 
              className="absolute flex flex-col items-center"
              style={{ left: `${mark.left}px` }}
            >
              {isMajor ? (
                <>
                  <span className="text-xs text-white/50 tabular-nums">{seconds}s</span>
                  <div className="w-px h-2 bg-white/10 mt-0.5" />
                </>
              ) : (
                <div className="w-px h-2 bg-white/5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
