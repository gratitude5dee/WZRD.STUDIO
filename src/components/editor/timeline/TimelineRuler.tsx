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
    <div className="relative h-10 bg-[#0A0D16] border-b border-[#1D2130] text-xs text-[#8E94A8]">
      {marks.map((mark) => (
        <div key={mark.label} className="absolute" style={{ left: `${mark.left}px` }}>
          <div className="h-4 w-px bg-[#1D2130]" />
          <div className="mt-1">{mark.label}</div>
        </div>
      ))}
    </div>
  );
}
