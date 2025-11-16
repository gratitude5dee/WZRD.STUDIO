import { motion } from 'framer-motion';
import { Shield, Lock, Server, Database } from 'lucide-react';

export const SecureInfrastructureVisual = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  const orbitIcons = [
    { Icon: Shield, angle: 0, color: 'text-purple-400' },
    { Icon: Lock, angle: 90, color: 'text-pink-400' },
    { Icon: Server, angle: 180, color: 'text-blue-400' },
    { Icon: Database, angle: 270, color: 'text-green-400' },
  ];

  return (
    <div className="relative w-full h-96 flex items-center justify-center overflow-hidden">
      {/* Central sphere */}
      <div className="relative w-48 h-48 z-10">
        {/* Main sphere */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/30 via-purple-500/20 to-transparent border border-orange-500/50 backdrop-blur-sm"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/40 to-purple-500/40 blur-2xl animate-pulse" />
        
        {/* Inner glow */}
        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-orange-400/50 to-pink-500/50 blur-xl" />
        
        {/* Shield icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="w-16 h-16 text-orange-400" />
          </motion.div>
        </div>
      </div>

      {/* Orbiting icons */}
      {orbitIcons.map(({ Icon, angle, color }, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            width: 300,
            height: 300,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
            delay: index * 0.5,
          }}
        >
          <div
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transform: `rotate(${angle}deg) translateX(150px) translateY(-50%)`,
            }}
          >
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className={`w-12 h-12 rounded-full bg-black/50 border border-white/20 backdrop-blur-sm flex items-center justify-center ${color}`}
            >
              <Icon className="w-6 h-6" />
            </motion.div>
          </div>
        </motion.div>
      ))}

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full bg-orange-400/50"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Large "Secure Infrastructure" text overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-400 to-pink-400 opacity-10">
            Secure
          </h3>
        </motion.div>
      </div>
    </div>
  );
};
