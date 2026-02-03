import { motion } from 'framer-motion';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  accent: 'cyan' | 'magenta' | 'green';
}

const TestimonialCard = ({ quote, author, role, accent }: TestimonialCardProps) => {
  const accentColors = {
    cyan: 'cyan-400',
    magenta: 'magenta-400',
    green: 'green-400',
  };
  
  return (
    <div className="relative group mb-6">
      {/* Glowing Border */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-${accentColors[accent]} to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition`} />
      
      <div className="relative bg-zinc-900/90 rounded-lg p-6 border border-white/10 backdrop-blur-sm">
        {/* Quote */}
        <div className="font-body text-sm text-cyan-300/80 mb-4">
          <span className="text-cyan-400">$</span> {quote}
        </div>
        
        {/* Author */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${accentColors[accent]} to-purple-500 flex items-center justify-center font-display font-bold text-black`}>
            {author[0]}
          </div>
          
          <div>
            <div className="font-tech font-semibold text-white">{author}</div>
            <div className="font-body text-xs text-cyan-400/60">{role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TestimonialStream = () => {
  const testimonials = [
    { quote: "This platform transformed our creative workflow completely", author: "Sarah Chen", role: "Creative Director", accent: 'cyan' as const },
    { quote: "The AI capabilities are mind-blowing. Saves hours of work", author: "Marcus Rodriguez", role: "Video Producer", accent: 'magenta' as const },
    { quote: "Best investment we made for our studio this year", author: "Emily Watson", role: "Studio Owner", accent: 'green' as const },
    { quote: "Intuitive interface, powerful features. Perfect combination", author: "David Kim", role: "Motion Designer", accent: 'cyan' as const },
    { quote: "Real-time collaboration changed the game for our team", author: "Lisa Zhang", role: "Product Manager", accent: 'magenta' as const },
    { quote: "Export quality is exceptional. Client satisfaction is up 40%", author: "James Miller", role: "Freelancer", accent: 'green' as const },
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-black">
      {/* Background Effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ffff0a_1px,transparent_1px),linear-gradient(to_bottom,#00ffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>
      
      <div className="container relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-display font-black text-white mb-4">
            USER_FEEDBACK
          </h2>
          <p className="text-cyan-400/60 font-body tracking-wider">
            {'>'} VOICES_FROM_THE_NETWORK
          </p>
        </motion.div>
        
        {/* Masonry-style Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <TestimonialCard {...testimonial} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
