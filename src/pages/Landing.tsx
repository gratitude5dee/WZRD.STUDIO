import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { ProductShowcase } from '@/components/landing/ProductShowcase';
import { MetricsSection } from '@/components/landing/MetricsSection';
import { UseCasesSection } from '@/components/landing/UseCasesSection';
import { PricingCard } from '@/components/landing/PricingCard';
import { MatrixIntroAnimation } from '@/components/landing/MatrixIntroAnimation';
const Landing = () => {
  const navigate = useNavigate();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const handleGetStarted = () => {
    navigate('/login');
  };
  return <>
      {/* Matrix Intro Animation */}
      {showIntro && <MatrixIntroAnimation onComplete={() => setShowIntro(false)} />}

      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        {/* Clean Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-800 backdrop-blur-xl bg-black/80">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AnimatedLogo size="lg" showVersion={false} />
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              {[{
                href: '#workflow',
                label: 'Platform'
              }, {
                href: '#solutions',
                label: 'Solutions'
              }, {
                href: '#pricing',
                label: 'Pricing'
              }, {
                href: '#enterprise',
                label: 'Enterprise'
              }].map(link => <a key={link.href} href={link.href} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-150">
                  {link.label}
                </a>)}
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/login')} className="text-zinc-400 hover:text-white">
                Sign In
              </Button>
              <Button onClick={handleGetStarted} className="bg-white text-black hover:bg-zinc-200">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center relative pt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-black" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Value Proposition */}
          <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            ease: [0.22, 0.61, 0.36, 1]
          }} className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">Generative Media Production Studio</h1>
              
              <p className="text-xl text-zinc-400 leading-relaxed max-w-xl">
                From concept to final cut. Create broadcast-quality video content in minutes with AI-assisted workflows trusted by leading media companies.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={handleGetStarted} className="bg-white text-black hover:bg-zinc-200 text-base group">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button size="lg" variant="outline" onClick={() => setIsVideoModalOpen(true)} className="text-white border-zinc-700 hover:bg-zinc-900 text-base">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </div>
            
            {/* Trust Signals */}
            <div className="flex items-center gap-6 pt-4 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>50K+ creators</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>1M+ videos created</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>SOC 2 compliant</span>
              </div>
            </div>
          </motion.div>
          
          {/* Right: Product Preview */}
          <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }} className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 overflow-hidden">
              <video className="w-full h-auto" autoPlay loop muted playsInline>
                <source src="/bgvid.mp4" type="video/mp4" />
              </video>
              
              <button onClick={() => setIsVideoModalOpen(true)} className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-110 transition-transform duration-200">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <div id="workflow">
        <ProductShowcase />
      </div>

      {/* Metrics Section */}
      <div id="enterprise">
        <MetricsSection />
      </div>

      {/* Use Cases Section */}
      <div id="solutions">
        <UseCasesSection />
      </div>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5
          }} className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Choose the plan that fits your production needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard title="Starter" price="Free" description="Perfect for trying out the platform" features={['5 projects per month', '720p export quality', 'Basic AI features', 'Community support']} ctaText="Get Started" ctaAction={handleGetStarted} delay={0} />

            <PricingCard title="Professional" price="$49" description="For serious creators and small teams" features={['Unlimited projects', '4K export quality', 'Advanced AI features', 'Priority support', 'Team collaboration', 'Custom branding']} ctaText="Start Free Trial" ctaAction={handleGetStarted} popular={true} delay={0.1} />

            <PricingCard title="Enterprise" price="Custom" description="For large organizations and studios" features={['Everything in Professional', 'Dedicated account manager', 'SLA guarantee', 'SSO & advanced security', 'Custom integrations', 'Volume discounts']} ctaText="Contact Sales" ctaAction={() => navigate('/login')} delay={0.2} />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 to-black" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5
          }} className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Ready to transform your production workflow?
            </h2>
            <p className="text-xl text-zinc-400">
              Join thousands of creators shipping better content faster.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="bg-white text-black hover:bg-zinc-200 text-base">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="text-white border-zinc-700 hover:bg-zinc-900 text-base">
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <AnimatedLogo size="md" showVersion={false} />
              <p className="mt-4 text-sm text-zinc-500">
                Professional video production platform powered by AI.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="#workflow" className="hover:text-white transition-colors">Platform</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#enterprise" className="hover:text-white transition-colors">Enterprise</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-zinc-900 text-center text-sm text-zinc-600">
            <p>&copy; 2025 WZRD.STUDIO. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {isVideoModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setIsVideoModalOpen(false)}>
          <div className="relative w-full max-w-5xl mx-4">
            <button onClick={() => setIsVideoModalOpen(false)} className="absolute -top-12 right-0 text-white hover:text-zinc-400 transition-colors">
              Close
            </button>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video className="w-full h-full" controls autoPlay>
                <source src="/bgvid.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>}
      </div>
    </>;
};
export default Landing;