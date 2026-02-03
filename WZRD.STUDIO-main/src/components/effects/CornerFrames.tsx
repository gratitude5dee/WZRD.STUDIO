export const CornerFrames = () => {
  return (
    <>
      {/* Top Left */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-cyan-400 opacity-30" />
      
      {/* Top Right */}
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-cyan-400 opacity-30" />
      
      {/* Bottom Left */}
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-cyan-400 opacity-30" />
      
      {/* Bottom Right */}
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-cyan-400 opacity-30" />
    </>
  );
};
