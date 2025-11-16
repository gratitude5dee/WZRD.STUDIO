export const Scanlines = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 opacity-5">
      <div 
        className="w-full h-full"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
        }}
      />
    </div>
  );
};
