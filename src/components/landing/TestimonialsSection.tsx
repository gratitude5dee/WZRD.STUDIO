import { motion } from 'framer-motion';
import { TestimonialCard } from './TestimonialCard';

const testimonials = [
  {
    quote: "The Creator Dashboard in WZRD.STUDIO is incredible. Built for creators and designers connecting our AI models has never been this smooth.",
    author: "Sara Lin",
    handle: "@sara.codes",
    featured: true,
  },
  {
    quote: "WZRD.STUDIO's storyboard view is a game-changer. Planning narratives shot-by-shot has never been easier.",
    author: "Chloe Winters",
    handle: "@chloewinters",
    featured: true,
  },
  {
    quote: "WZRD.STUDIO is a lifesaver when deadlines are tight. Build, connect, and run AI workflows instantly.",
    author: "James Roy",
    handle: "@jamesrdev",
    featured: true,
  },
  {
    quote: "The node-based workflow is exactly what we needed. Creating complex AI pipelines has never been easier.",
    author: "Arjun Mehta",
    handle: "@arjdev",
    featured: false,
  },
  {
    quote: "Powerful AI tools that actually work. The timeline editor is smooth and the generation quality is top-tier.",
    author: "Leo Martin",
    handle: "@leobuilds",
    featured: false,
  },
  {
    quote: "Finally, a tool that makes AI content creation accessible without sacrificing quality or control.",
    author: "Monica Reeves",
    handle: "@monicareeves",
    featured: false,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 px-4 bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#e78a53]/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
            <span className="text-sm text-white/90">Testimonials</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What our users say
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            From intuitive design to powerful features, our app has become an essential tool for users around the world.
          </p>
        </motion.div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.author}
              {...testimonial}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
