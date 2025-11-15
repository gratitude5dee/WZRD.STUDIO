import { motion } from 'framer-motion';
import { TestimonialCard } from './TestimonialCard';

const testimonials = [
  {
    quote: "WZRDFLOW has completely transformed how we create content. The AI-powered workflows save us hours every day.",
    author: "Sarah Chen",
    title: "Creative Director at PixelPerfect",
  },
  {
    quote: "The visual workflow builder is intuitive and powerful. We've been able to automate our entire content pipeline.",
    author: "Marcus Rodriguez",
    title: "Lead Designer at BrandCraft",
  },
  {
    quote: "Best investment we've made this year. The quality of AI-generated content is consistently impressive.",
    author: "Emily Watson",
    title: "Founder of CreativeHub",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#e78a53]/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Loved by Creators
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Join thousands of creators who trust WZRDFLOW for their creative workflows
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
