import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroSection from '@/components/landing/HeroSection';
import FeatureGrid from '@/components/landing/FeatureGrid';
import { UseCasesSection } from '@/components/landing/UseCasesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { NewReleasePromo } from '@/components/landing/NewReleasePromo';
import FAQAccordion from '@/components/landing/FAQAccordion';
import { PricingSectionRedesigned } from '@/components/landing/PricingSectionRedesigned';
import { StickyFooter } from '@/components/landing/StickyFooter';
import { useAuth } from '@/providers/AuthProvider';
import wzrdLogo from '@/assets/wzrd-logo.png';
const Landing = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "system");
    root.classList.add("dark");
  }, []);

  // Handle scroll state for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const faqItems = [{
    question: 'How does WZRD handle collaboration?',
    answer: 'Invite collaborators with granular permissions, leave comments on nodes, and keep every timeline change synced in realtime.'
  }, {
    question: 'Can I bring my own assets or models?',
    answer: 'Yes. Upload existing media, connect external sources, or plug in your preferred AI models directly in the studio.'
  }, {
    question: 'What formats can I export?',
    answer: 'Export ready-to-publish video in multiple resolutions, codecs, and aspect ratios tailored to every platform.'
  }];
  const handleMobileNavClick = (elementId: string) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        const headerOffset = 120;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 100);
  };
  const handleLogout = async () => {
    const {
      supabase
    } = await import('@/integrations/supabase/client');
    await supabase.auth.signOut();
    navigate('/');
  };
  return <div className="min-h-screen w-full relative bg-black">
      {/* Pearl Mist Background with Top Glow */}
      <div className="absolute inset-0 z-0" style={{
      background: "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(226, 232, 240, 0.12), transparent 60%), #000000"
    }} />

      {/* Desktop Header */}
      <header className={`sticky top-4 z-[9999] mx-auto hidden w-full self-start rounded-full bg-black/80 md:flex backdrop-blur-sm border border-white/10 shadow-lg transition-all duration-300 ${isScrolled ? "max-w-4xl px-3" : "max-w-6xl px-6"} py-2.5`} style={{
      willChange: "transform",
      transform: "translateZ(0)",
      backfaceVisibility: "hidden"
    }}>
        <div className="flex items-center justify-between w-full gap-4">
          {/* Logo */}
          <Link to="/" onClick={e => {
          // If already on home page, scroll to top
          if (window.location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
        }} className="flex items-center justify-center gap-2 flex-shrink-0 z-50 cursor-pointer">
            <img src={wzrdLogo} alt="WZRD.tech" className="h-12 sm:h-15 w-auto" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex flex-1 flex-row items-center justify-center gap-1 text-sm font-medium text-white/60">
            <a className="relative px-3 py-2 text-white/60 hover:text-white transition-colors cursor-pointer whitespace-nowrap" onClick={e => {
            e.preventDefault();
            const element = document.getElementById("features");
            if (element) {
              const headerOffset = 120;
              const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
              const offsetPosition = elementPosition - headerOffset;
              window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
              });
            }
          }}>
              Features
            </a>
            <a className="relative px-3 py-2 text-white/60 hover:text-white transition-colors cursor-pointer whitespace-nowrap" onClick={e => {
            e.preventDefault();
            const element = document.getElementById("pricing");
            if (element) {
              const headerOffset = 120;
              const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
              const offsetPosition = elementPosition - headerOffset;
              window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
              });
            }
          }}>
              Pricing
            </a>
            <a className="relative px-3 py-2 text-white/60 hover:text-white transition-colors cursor-pointer whitespace-nowrap" onClick={e => {
            e.preventDefault();
            const element = document.getElementById("testimonials");
            if (element) {
              const headerOffset = 120;
              const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
              const offsetPosition = elementPosition - headerOffset;
              window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
              });
            }
          }}>
              Testimonials
            </a>
            <a className="relative px-3 py-2 text-white/60 hover:text-white transition-colors cursor-pointer whitespace-nowrap" onClick={e => {
            e.preventDefault();
            const element = document.getElementById("faq");
            if (element) {
              const headerOffset = 120;
              const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
              const offsetPosition = elementPosition - headerOffset;
              window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
              });
            }
          }}>
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to="/demo" className="rounded-md font-medium relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center bg-gradient-to-b from-[#8b5cf6] to-[#8b5cf6]/80 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">
              Demo
            </Link>
            {user ? <>
                <Link to="/home" className="font-medium transition-colors hover:text-white text-white/60 text-xs sm:text-sm cursor-pointer whitespace-nowrap">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="rounded-md font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center bg-gradient-to-b from-[#8b5cf6] to-[#8b5cf6]/80 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">
                  Log Out
                </button>
              </> : <>
                <Link to="/login" className="font-medium transition-colors hover:text-white text-white/60 text-xs sm:text-sm cursor-pointer whitespace-nowrap">
                  Log In
                </Link>
                <Link to="/login?mode=signup" className="rounded-md font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center bg-gradient-to-b from-[#8b5cf6] to-[#8b5cf6]/80 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">
                  Sign Up
                </Link>
              </>}
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-4 z-[9999] mx-4 flex w-auto flex-row items-center justify-between rounded-full bg-black/80 backdrop-blur-sm border border-white/10 shadow-lg md:hidden px-4 py-3">
        <Link to="/" onClick={e => {
        // If already on home page, scroll to top
        if (window.location.pathname === '/') {
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }} className="flex items-center justify-center gap-2 cursor-pointer">
          <img src={wzrdLogo} alt="WZRD.tech" className="h-7 w-auto" />
        </Link>

        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="flex items-center justify-center w-10 h-10 rounded-full bg-black/50 border border-white/10 transition-colors hover:bg-black/80" aria-label="Toggle menu">
          <div className="flex flex-col items-center justify-center w-5 h-5 space-y-1">
            <span className={`block w-4 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}></span>
            <span className={`block w-4 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}></span>
            <span className={`block w-4 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
          </div>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm md:hidden">
          <div className="absolute top-20 left-4 right-4 bg-black/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-6">
            <nav className="flex flex-col space-y-4">
              <button onClick={() => handleMobileNavClick("features")} className="text-left px-4 py-3 text-lg font-medium text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                Features
              </button>
              <button onClick={() => handleMobileNavClick("pricing")} className="text-left px-4 py-3 text-lg font-medium text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                Pricing
              </button>
              <button onClick={() => handleMobileNavClick("testimonials")} className="text-left px-4 py-3 text-lg font-medium text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                Testimonials
              </button>
              <button onClick={() => handleMobileNavClick("faq")} className="text-left px-4 py-3 text-lg font-medium text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                FAQ
              </button>
              <div className="border-t border-white/10 pt-4 mt-4 flex flex-col space-y-3">
                <Link to="/demo" className="px-4 py-3 text-lg font-bold text-center bg-gradient-to-b from-[#8b5cf6] to-[#8b5cf6]/80 text-white rounded-lg shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  Demo
                </Link>
                {user ? <>
                    <Link to="/home" className="px-4 py-3 text-lg font-medium text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10 cursor-pointer">
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="px-4 py-3 text-lg font-bold text-center bg-gradient-to-b from-[#8b5cf6] to-[#8b5cf6]/80 text-white rounded-lg shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                      Log Out
                    </button>
                  </> : <>
                    <Link to="/login" className="px-4 py-3 text-lg font-medium text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10 cursor-pointer">
                      Log In
                    </Link>
                    <Link to="/login?mode=signup" className="px-4 py-3 text-lg font-bold text-center bg-gradient-to-b from-[#8b5cf6] to-[#8b5cf6]/80 text-white rounded-lg shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                      Sign Up
                    </Link>
                  </>}
              </div>
            </nav>
          </div>
        </div>}

      {/* Hero Content from Wizard Web App - Always visible */}
      <HeroSection
        headline="Your AI Video Production Studio. No Agency Required."
        subheadline="Create scroll-stopping UGC, music videos, and ad content 10x faster. Indie labels and DTC brands use WZRD to automate what agencies charge $50K+ for."
      />

      {/* Trust Indicators Section */}
      <section className="py-16 px-4 border-y border-white/5 bg-black/40 backdrop-blur-sm">
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
      }} className="container mx-auto max-w-6xl">
            <p className="text-center text-white/40 text-sm mb-8 uppercase tracking-wider">
              Powered by Industry Leaders
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-50 hover:opacity-70 transition-opacity">
              <div className="text-white/60 font-bold text-xl">Runway 4.5</div>
              <div className="text-white/60 font-bold text-xl">Kling 2.6</div>
              <div className="text-white/60 font-bold text-xl">Google's Veo 3</div>
              <div className="text-white/60 font-bold text-xl">WAN 2.6</div>
              <div className="text-white/60 font-bold text-xl">Luma Ray 3</div>
            </div>
          </motion.div>
        </section>

        {/* Gradient Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent" />

        {/* Features Section */}
        <div id="features" className="relative">
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#8b5cf6]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#7c3aed]/20 blur-3xl pointer-events-none" />
          <FeatureGrid />
        </div>

        {/* Gradient Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent" />

        {/* Use Cases Section */}
        <div className="relative">
          <UseCasesSection />
        </div>

        {/* Gradient Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent" />

        {/* Testimonials Section */}
        <div id="testimonials" className="relative">
          <div className="absolute top-1/2 -right-20 w-60 h-60 rounded-full bg-[#8b5cf6]/10 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -left-20 w-60 h-60 rounded-full bg-[#7c3aed]/10 blur-3xl pointer-events-none" />
          <TestimonialsSection />
        </div>

        {/* Gradient Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent" />
            
        {/* New Release Promo */}
        <div className="relative">
          <NewReleasePromo />
        </div>

        {/* Gradient Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent" />

        {/* Pricing Section */}
        <div id="pricing" className="relative">
          <PricingSectionRedesigned />
        </div>

        {/* Gradient Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent" />

        {/* FAQ Section */}
        <div id="faq" className="relative">
          <FAQAccordion items={faqItems} />
        </div>

        {/* Gradient Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent" />
          
      {/* Sticky Footer */}
      <div>
        <StickyFooter />
      </div>
    </div>;
};
export default Landing;
