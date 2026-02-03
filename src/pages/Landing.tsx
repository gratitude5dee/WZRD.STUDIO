import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { HeroSection } from "@/components/landing/HeroSection";
import Features from "@/components/landing/Features";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { StickyFooter } from "@/components/landing/StickyFooter";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-black">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] bg-clip-text text-transparent">
              WZRD.STUDIO
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-sm text-white/60 hover:text-white transition-colors">
              Testimonials
            </a>
            <a href="#faq" className="text-sm text-white/60 hover:text-white transition-colors">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-white shadow-lg shadow-[#8b5cf6]/25">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection 
        headline="Create Stunning AI Content" 
        subheadline="Build powerful AI workflows with our visual editor. Generate images, videos, and more — all from one creative platform."
      />

      {/* Powered By Section */}
      <section className="py-16 px-4 bg-black border-y border-white/5">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-sm text-white/40 uppercase tracking-widest mb-8">
              Powered by Industry Leaders
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {[
                { name: 'Fal.ai', icon: Sparkles },
                { name: 'Luma', icon: Sparkles },
                { name: 'Kling AI', icon: Sparkles },
                { name: 'ElevenLabs', icon: Sparkles },
                { name: 'Runway', icon: Sparkles },
              ].map((partner) => (
                <motion.div
                  key={partner.name}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors"
                >
                  <partner.icon className="w-5 h-5 text-[#8b5cf6]" />
                  <span className="text-sm font-medium">{partner.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Pricing Section */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9] relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/10 blur-3xl" />
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to create something amazing?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Join thousands of creators using WZRD.STUDIO to bring their ideas to life with AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button 
                  size="lg"
                  className="bg-white text-[#7c3aed] hover:bg-white/90 shadow-2xl shadow-black/20 px-8 py-6 text-lg font-semibold"
                >
                  Start Creating Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/studio">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg"
                >
                  Explore Studio
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <StickyFooter />
    </div>
  );
}
