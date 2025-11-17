import { editorTheme, typography, exactMeasurements } from '@/lib/editor/theme';

interface TimelineRulerProps {
  zoom: number;
  scrollOffset: number;
  durationMs: number;
}

export function TimelineRuler({ zoom, scrollOffset, durationMs }: TimelineRulerProps) {
  const totalSeconds = Math.ceil(durationMs / 1000);
  const pixelsPerSecond = zoom;
  
  // Generate marks every second
  const marks: { position: number; time: number; isMajor: boolean }[] = [];
  for (let second = 0; second <= totalSeconds; second++) {
    const position = second * pixelsPerSecond - scrollOffset;
    marks.push({
      position,
      time: second,
      isMajor: second % 5 === 0, // Major tick every 5 seconds
    });
  }

  return (
    <div
      className="relative select-none"
      style={{
        height: `${exactMeasurements.timeline.rulerHeight}px`,
        background: editorTheme.bg.tertiary,
        borderBottom: `1px solid ${editorTheme.border.subtle}`,
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.mono,
        color: editorTheme.text.tertiary,
      }}
    >
      {marks.map((mark, idx) => (
        <div
          key={idx}
          className="absolute flex flex-col items-center justify-end"
          style={{
            left: `${mark.position}px`,
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {mark.isMajor ? (
            <>
              <span
                className="tabular-nums mb-1"
                style={{
                  fontSize: typography.fontSize.xs,
                  color: editorTheme.text.tertiary,
                }}
              >
                {mark.time}s
              </span>
              <div
                style={{
                  width: '1px',
                  height: '8px',
                  background: editorTheme.border.default,
                }}
              />
            </>
          ) : (
            <div
              style={{
                width: '1px',
                height: '4px',
                background: editorTheme.border.subtle,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
