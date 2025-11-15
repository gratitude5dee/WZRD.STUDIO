import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatrixLoaderProps {
  onComplete: () => void;
}

export function MatrixLoader({ onComplete }: MatrixLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadingText, setLoadingText] = useState('INITIALIZING SYSTEM');
  const [phase, setPhase] = useState(0); // 0 = matrix rain, 1 = logo reveal
  const [progress, setProgress] = useState(0);

  const asciiArt = `                                                                                                                                      
                                              @@@@@@@@@@                                                              
                                     @@@@@#**#*%@@@+. :*@@@@@@#@@                                                     
                               @@@@@@@@@@@@@@*-::=#@%+:.:#@@@@@#::--=*#                                               
                            @@@@@@%%@@@@%=     .:*@@%@%-. .:--:..::=#:-=%@                                            
                        @+==#@@@%%#+++++++====.=++++++*###*=:-:: ... ....:++*%                                        
                      #++++%%%%**+=======--=-++=+===-=-:.  ::      .*-... .=-=+#                                      
                   @*==:-=*#####*+++=++=-::--::------::+%*-.      :%#=        -==*%                                   
                 @#=. -*#%*++*+*+==--=----=::::::-:.:. : .      :%@-            :--=#                                 
                =   :+%%%%%#*+-======+===-:--:=-::           -==@#:            ::.:-=+#                               
              -   .+###%%%%##*++=---=+------:--:.                     :          ===-:-*#                             
             :   =@+*%%%#%##%%+:--=-=-----::-: :-                   .           +:=+=:  =%                            
           .  ==:   -***#**#+---=-=-----::::=*+:                   *+    :#         -*%%#-:+                          
          -:**::   .-=*++*#+-++--=++--::::::          .      .           =#=     -: =%#@@@##=                         
        :.        : ::-+=+*+==:  -=:+*--+-:  -:              : :            .:      -##%@@%@%%                        
       =         *:  -=#*+=--=. *@@+*## : .  +:     *                          :=-  =%@@@%@@@%%                       
       :         ==   ===:-=+-:+@@*=++::.:==+-.    :-             :              - .#@@@@@@@@@%%                      
      :  .-     + :    .::-+%@@@@%=%#+:.     .+=::===:::                .::        :@@@%%%%@@@%#@                     
     :                :-+%@@@@@@%+++=-=:..                ..:                       #@##*#*#@@@##                     
                   :*@@@@@@@@@@:. :=*+-:.           :=.       ::  :--             +%@@#%@%@%%@@##@                    
    #              -#@@@%%%@%=.  :+=--==-==-. ::=+-+=-:.        =%*=:++            +#%@%%%@@#%@@*#                    
              =@   @      :+++-:+@@@+   ..*@@@= .#@@@@@@@@@%::-@@@@@@@@@@#-::.:#@@@@@@@@*       *@=   *= -*##+#@#+#                   
    @ @#*++ -@*- + = #@#= :%@#-  +@@%- :-=@@@*  .*@@*:::::-*. -@@@=::::*@@@+*+%@@@-.:-*@=      =@@@-     -%@@-+*+-=@   @+:.=+*        
+##+   =@%+  %@%=  . #@%= :%@%-  .#@@#: -#@@*:  .*@@%:       *-@@@#    :@@@**=%@@%     .-     -%@@@#     -%@@-=-::.-  :   =%@:   .+##+
-@@+   =@@+  %@@@+.  #@%= :@@#-   :%@@*:*@@#-   :*@@@%%@%-   +-@@@#-==-#@@%++:=@@@@@*-  :     #@@#@@+    -%@@::=:. - :   :*@@=   :+@@:
-@@+   =@@=  #@%@@@- #@%- :@@#-    :%@@*@@%+  :*=#@@@@@@%-   +=@@@@@@@@@@#--+. :=#@@@@@@=    *@@%=%@@-   -%@@. ... -=   .=@@@%   :+@@-
-@@=   +@@=  %@:=@@@*%@%- :@@#:     =@@@@@+  -=%+#@@#:  :- =*#=%@@*-+%@%- :#*-     .:*@@@+  =@@@=:*@@#.  -%@@      :=   :%@@+@+   +@@-
-@@=   +@@=  %@*  *@@@@#- :@@#:      *@@@#:    :-#@@@-     :---@@@* .-%@@=**+=@#+:   =@@@#.-@@@@@@@@@@*: -%@@      .   .+@@#=%#   +@@:
-@@=   +@@=  #@#.  :%@@#- :@@*:       *@%-  :.-::#@@@@@@@@@%:-=%@@*: .=%@@+##=@@@@@@@@@@%=:#@@#---==#@@- -%@@    - :  .-%@@--*@-  +@@:
-@@*:  *@@=  #@#:    +@#- -@@*:       :#+       :##%%#######::=*+**-: :+++#+--=:=%@@@@#+:.*@%@-     =@@# -%@@@@@@@%-+@@-@@%@@@@%  =@@:
-%@@%##@@+.  #@#:     .+- :===-        :                     :   .:--.     .      ...    . ..:.     --:---+--==+*%: +#*=@+   .+@= =@@:
::*@@@%=-     .-:                                    .:.           ..     ..:                                         .  .   .=** =@@:
 @=.                                                                                                                              .  .
      @+:::-+     -                                                                                                     #=:.. :::--===
                                                                                                                   -                  
                   -                                        .:          .:........     ..:.                       .                   
                                                             :=-.        .-:-===-------=---                       @                   
                                                               :==:.         :=++++++++++=::                     =                    
                                                                .-=*-.       -+=+*##***+=:-:                     =                    
                                                                 :-+=:        -=######*-::.        :            *                     
                                                                 .-:-:.   ...:-#%%%%%+:          :-           :*                      
                       =                                         :-.-:.....:::-+#%%%#.          :            :-                       
                        :                                        :-:--::::::::-*%%%*:                       :+                        
                          :                                      -=--::::-:.-::#%*=.                       -                          
                           :          :                          -=:=:--==: =::=-.                        -                           
                             :        --                  :=-: :***======:...-.        %.               :@                            
                              -.       +=.           .:  -%*.+#@@@#====::-:-:                          :@                             
                                +==.     :*.           :++*--%***+-===---::                          :#                               
                                  #==      :-                 :-++-=++-                            .@                                 
                                    #+.       .=: ..           .--=++-       -                   :-                                   
                                      @=         +#-           :-:=+:       :..:.        .     =                                      
                                         *=-    :-:=*#*+        -=-:      +#@%:     .-==:::.:                                         
                                             *  .:----+**#%*:    ::.:  .-:=*-   :++++=--*@                                            
                                                @++*+++****####%%%%#**#+-:----:   -==*@                                               
                                                       @--:::-===++==-::    .=%@`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas not supported');
      setTimeout(onComplete, 1000);
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const asciiLines = asciiArt.split('\n');
    const fontSize = window.innerWidth < 768 ? 4 : 6;
    const charWidth = fontSize * 0.6;
    const uniqueChars = [...new Set(asciiArt)].filter(c => c !== '\n' && c !== ' ');
    
    const columns = Math.floor(canvas.width / charWidth);
    const drops = new Array(columns).fill(1);
    const speeds = new Array(columns).fill(0).map(() => 0.5 + Math.random() * 1);
    
    let phaseStartTime = Date.now();
    let animationId: number;

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      if (phase === 0) {
        // Matrix rain phase
        for (let i = 0; i < drops.length; i++) {
          const char = uniqueChars[Math.floor(Math.random() * uniqueChars.length)];
          const brightness = Math.random() * 255;
          ctx.fillStyle = `rgb(0, ${brightness}, 0)`;
          ctx.fillText(char, i * charWidth, drops[i] * fontSize);

          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i] += speeds[i];
        }
      } else if (phase === 1) {
        // Logo reveal phase
        const startX = (canvas.width - (140 * charWidth)) / 2;
        const startY = (canvas.height - (asciiLines.length * fontSize)) / 2;
        const revealProgress = (Date.now() - phaseStartTime) / 3000;
        
        asciiLines.forEach((line, y) => {
          for (let x = 0; x < line.length; x++) {
            const char = line[x];
            if (char !== ' ') {
              const charProgress = (y / asciiLines.length + x / line.length) / 2;
              if (charProgress < revealProgress) {
                const brightness = 150 + Math.sin(Date.now() / 200 + x + y) * 100;
                ctx.fillStyle = `rgb(0, ${brightness}, 0)`;
                ctx.fillText(char, startX + x * charWidth, startY + y * fontSize);
              }
            }
          }
        });
      }

      animationId = requestAnimationFrame(draw);
    }

    draw();

    // Phase transition
    const phaseTimer = setTimeout(() => {
      setPhase(1);
      phaseStartTime = Date.now();
    }, 4000);

    // Loading text sequence
    const messages = [
      'INITIALIZING SYSTEM',
      'LOADING AI MODELS',
      'ESTABLISHING NEURAL LINKS',
      'CALIBRATING ALGORITHMS',
      'SYSTEM READY'
    ];
    
    let currentMsg = 0;
    const msgInterval = setInterval(() => {
      currentMsg++;
      if (currentMsg < messages.length) {
        setLoadingText(messages[currentMsg]);
      }
    }, 1300);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 60);

    // Complete sequence
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 6500);

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(phaseTimer);
      clearTimeout(completeTimer);
      clearInterval(msgInterval);
      clearInterval(progressInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [onComplete, phase]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 z-[100] bg-black"
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 2 }}
            className="text-center space-y-8 z-10"
          >
            {/* Logo Image */}
            <motion.img
              src="/lovable-uploads/wzrdtechlogo.png"
              alt="WZRD.TECH Logo"
              className="max-w-[500px] w-[90vw] h-auto mx-auto"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(0, 255, 0, 0.5))'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                filter: [
                  'drop-shadow(0 0 30px rgba(0, 255, 0, 0.5))',
                  'drop-shadow(0 0 50px rgba(0, 255, 0, 0.8))',
                  'drop-shadow(0 0 30px rgba(0, 255, 0, 0.5))'
                ]
              }}
              transition={{ 
                opacity: { delay: 3, duration: 2 },
                scale: { delay: 3, duration: 2 },
                filter: { delay: 5, duration: 3, repeat: Infinity }
              }}
            />
            
            {/* Loading Text */}
            <motion.div
              className="text-[#0f0] text-xl md:text-2xl tracking-[0.3rem] uppercase font-mono"
              style={{ textShadow: '0 0 10px #0f0' }}
              animate={{
                opacity: [1, 0.5, 1],
                x: [0, -2, 0]
              }}
              transition={{
                opacity: { duration: 1, repeat: Infinity },
                x: { duration: 0.1, repeat: Infinity, repeatDelay: 5 }
              }}
            >
              {loadingText}
            </motion.div>
            
            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5, duration: 1 }}
              className="w-[300px] mx-auto"
            >
              <div className="h-1 bg-[#0f0]/20 rounded-full overflow-hidden backdrop-blur-lg border border-[#0f0]/30">
                <motion.div
                  className="h-full bg-[#0f0] rounded-full"
                  style={{
                    width: `${progress}%`,
                    boxShadow: '0 0 10px #0f0'
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </motion.div>
            
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5.5, duration: 2 }}
              className="text-[#0f0] text-base md:text-lg font-mono"
              style={{ textShadow: '0 0 5px #0f0' }}
            >
              Your All-in-One Generative Media Studio
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
