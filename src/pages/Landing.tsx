import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Features from '@/components/landing/Features';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { NewReleasePromo } from '@/components/landing/NewReleasePromo';
import { FAQSection } from '@/components/landing/FAQSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { StickyFooter } from '@/components/landing/StickyFooter';
import { useAuth } from '@/providers/AuthProvider';
import { Logo } from '@/components/ui/logo';
import wzrdLogo from '@/assets/wzrd-logo.png';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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


  // Handle video autoplay (muted)
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = 0.0; // Mute the video
      video.muted = true; // Ensure muted attribute is set
      const startTime = 290; // 4:50
      
      const handleLoadedMetadata = () => {
        video.currentTime = startTime;
      };
      
      if (video.readyState >= 1) {
        video.currentTime = startTime;
      } else {
        video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      }
      
      // Try to play the video (muted videos can autoplay)
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (video.currentTime < startTime) {
              video.currentTime = startTime;
            }
            console.log('Video autoplay started (muted)');
          })
          .catch((error) => {
            console.log('Autoplay prevented, waiting for user interaction');
            const handleUserInteraction = () => {
              video.currentTime = startTime;
              video.muted = true;
              video.play().catch(console.error);
              document.removeEventListener('click', handleUserInteraction);
              document.removeEventListener('touchstart', handleUserInteraction);
            };
            document.addEventListener('click', handleUserInteraction, { once: true });
            document.addEventListener('touchstart', handleUserInteraction, { once: true });
          });
      }
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

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
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const handleLogout = async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full relative bg-black">
      {/* Pearl Mist Background with Top Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(226, 232, 240, 0.12), transparent 60%), #000000",
        }}
      />

      {/* Desktop Header */}
      <header
        className={`sticky top-4 z-[9999] mx-auto hidden w-full self-start rounded-full bg-black/80 md:flex backdrop-blur-sm border border-white/10 shadow-lg transition-all duration-300 ${
          isScrolled ? "max-w-4xl px-3" : "max-w-6xl px-6"
        } py-2.5`}
        style={{
          willChange: "transform",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        <div className="flex items-center justify-between w-full gap-4">
          {/* Logo */}
          <Link
            to="/"
            onClick={(e) => {
              // If already on home page, scroll to top
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center justify-center gap-2 flex-shrink-0 z-50 cursor-pointer"
          >
            <img src={wzrdLogo} alt="WZRD.tech" className="h-12 sm:h-15 w-auto" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex flex-1 flex-row items-center justify-center gap-1 text-sm font-medium text-white/60">
            <a
              className="relative px-3 py-2 text-white/60 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("features");
                if (element) {
                  const headerOffset = 120;
                  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                  const offsetPosition = elementPosition - headerOffset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
            >
              Features
            </a>
            <a
              className="relative px-3 py-2 text-white/60 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("pricing");
                if (element) {
                  const headerOffset = 120;
                  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                  const offsetPosition = elementPosition - headerOffset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
            >
              Pricing
            </a>
            <a
              className="relative px-3 py-2 text-white/60 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("testimonials");
                if (element) {
                  const headerOffset = 120;
                  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                  const offsetPosition = elementPosition - headerOffset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
            >
              Testimonials
            </a>
            <a
              className="relative px-3 py-2 text-white/60 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("faq");
                if (element) {
                  const headerOffset = 120;
                  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                  const offsetPosition = elementPosition - headerOffset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
            >
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/demo"
              className="rounded-md font-medium relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center bg-gradient-to-b from-[#e78a53] to-[#e78a53]/80 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap"
            >
              Demo
            </Link>
            {user ? (
              <>
                <Link
                  to="/home"
                  className="font-medium transition-colors hover:text-white text-white/60 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-md font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center bg-gradient-to-b from-[#e78a53] to-[#e78a53]/80 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-medium transition-colors hover:text-white text-white/60 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                >
                  Log In
                </Link>
                <Link
                  to="/login?mode=signup"
                  className="rounded-md font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center bg-gradient-to-b from-[#e78a53] to-[#e78a53]/80 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-4 z-[9999] mx-4 flex w-auto flex-row items-center justify-between rounded-full bg-black/80 backdrop-blur-sm border border-white/10 shadow-lg md:hidden px-4 py-3">
        <Link
          to="/"
          onClick={(e) => {
            // If already on home page, scroll to top
            if (window.location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center justify-center gap-2 cursor-pointer"
        >
          <img src={wzrdLogo} alt="WZRD.tech" className="h-7 w-auto" />
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black/50 border border-white/10 transition-colors hover:bg-black/80"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col items-center justify-center w-5 h-5 space-y-1">
            <span
              className={`block w-4 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
            ></span>
            <span
              className={`block w-4 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`block w-4 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
            ></span>
          </div>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm md:hidden">
          <div className="absolute top-20 left-4 right-4 bg-black/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-6">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => handleMobileNavClick("features")}
                className="text-left px-4 py-3 text-lg font-medium text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Features
              </button>
              <button
                onClick={() => handleMobileNavClick("pricing")}
                className="text-left px-4 py-3 text-lg font-medium text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Pricing
              </button>
              <button
                onClick={() => handleMobileNavClick("testimonials")}
                className="text-left px-4 py-3 text-lg font-medium text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Testimonials
              </button>
              <button
                onClick={() => handleMobileNavClick("faq")}
                className="text-left px-4 py-3 text-lg font-medium text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                FAQ
              </button>
              <div className="border-t border-white/10 pt-4 mt-4 flex flex-col space-y-3">
                <Link
                  to="/demo"
                  className="px-4 py-3 text-lg font-bold text-center bg-gradient-to-b from-[#e78a53] to-[#e78a53]/80 text-white rounded-lg shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  Demo
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/home"
                      className="px-4 py-3 text-lg font-medium text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10 cursor-pointer"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-3 text-lg font-bold text-center bg-gradient-to-b from-[#e78a53] to-[#e78a53]/80 text-white rounded-lg shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-3 text-lg font-medium text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10 cursor-pointer"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/login?mode=signup"
                      className="px-4 py-3 text-lg font-bold text-center bg-gradient-to-b from-[#e78a53] to-[#e78a53]/80 text-white rounded-lg shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Content from Wizard Web App - Always visible */}
      <section
        className="relative overflow-hidden min-h-screen flex flex-col bg-transparent"
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Video Background - Only in hero section */}
        <div 
          className="absolute inset-0 w-full h-full z-0"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
          }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/wzrdstudiointro1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="container mx-auto px-4 py-24 sm:py-32 relative z-10 flex-1 flex flex-col">
          <div className="mx-auto max-w-4xl text-center flex-1 flex flex-col justify-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#8b5cf6]"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                </svg>
                <span className="text-white">AI-Powered Workflow Studio</span>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <div className="flex justify-center">
                <Logo size="xl" showVersion={false} />
              </div>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mx-auto mb-12 max-w-2xl text-lg text-white/70"
            >
              Create stunning AI-generated content with our Creator Dashboard. Perfect for creators, designers, developers, and builders who want to bring their ideas to life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Decorative SVG */}
              <svg
                width="100"
                height="50"
                viewBox="0 0 100 50"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white mt-8"
              >
                <path d="M68.6958 5.40679C67.3329 12.7082 68.5287 20.1216 68.5197 27.4583C68.5189 29.5382 68.404 31.6054 68.1147 33.682C67.9844 34.592 69.4111 34.751 69.5414 33.8411C70.5618 26.5016 69.2488 19.104 69.4639 11.7325C69.5218 9.65887 69.7222 7.6012 70.0939 5.56265C70.1638 5.1949 69.831 4.81112 69.4601 4.76976C69.0891 4.72841 68.7689 5.01049 68.6958 5.40679Z"></path>
                <path d="M74.0117 26.1349C73.2662 27.1206 72.5493 28.1096 72.0194 29.235C71.5688 30.167 71.2007 31.137 70.7216 32.0658C70.4995 32.5033 70.252 32.9091 69.9475 33.3085C69.8142 33.4669 69.6779 33.654 69.5161 33.8093C69.4527 33.86 68.9199 34.2339 68.9167 34.2624C68.9263 34.1768 69.0752 34.3957 69.0055 34.2434C68.958 34.1515 68.8534 34.0531 68.8058 33.9612C68.6347 33.6821 68.4637 33.403 68.264 33.1208L67.1612 31.3512C66.3532 30.0477 65.5199 28.7126 64.7119 27.4093C64.5185 27.0699 63.9701 27.0666 63.7131 27.2979C63.396 27.5514 63.4053 27.9858 63.6018 28.2966C64.3845 29.5683 65.1956 30.8431 65.9783 32.1149L67.1572 33.9796C67.5025 34.5093 67.8225 35.2671 68.428 35.5368C69.6136 36.0446 70.7841 34.615 71.3424 33.7529C71.9992 32.786 72.4085 31.705 72.9035 30.6336C73.4842 29.3116 74.2774 28.1578 75.1306 26.9818C75.7047 26.2369 74.5573 25.3868 74.0117 26.1349ZM55.1301 12.2849C54.6936 18.274 54.6565 24.3076 55.0284 30.3003C55.1293 31.987 55.2555 33.7056 55.4419 35.4019C55.5431 36.3087 56.9541 36.0905 56.8529 35.1837C56.2654 29.3115 56.0868 23.3982 56.2824 17.4978C56.3528 15.8301 56.4263 14.1339 56.5537 12.4725C56.6301 11.5276 55.2034 11.3686 55.1301 12.2849Z"></path>
                <path d="M59.2642 30.6571C58.8264 31.475 58.36 32.2896 57.9222 33.1075C57.7032 33.5164 57.4843 33.9253 57.2369 34.3311C57.0528 34.6861 56.8656 35.0697 56.6278 35.3898C56.596 35.4152 56.5611 35.4691 56.5294 35.4944C56.4881 35.6054 56.5041 35.4627 56.5548 35.5261C56.7481 35.6055 56.8337 35.6151 56.7545 35.5484L56.6784 35.4533C56.6023 35.3581 56.5263 35.263 56.4534 35.1393C56.1778 34.7619 55.8734 34.3814 55.5946 34.0324C55.0146 33.2744 54.4315 32.545 53.8515 31.787C53.2685 31.0576 52.1584 31.945 52.7415 32.6744C53.4229 33.5592 54.1042 34.4441 54.7888 35.3004C55.1184 35.7127 55.4321 36.2677 55.8569 36.6039C56.3069 36.9719 56.884 36.9784 57.3533 36.6551C57.7624 36.3542 57.9845 35.9167 58.2067 35.4792C58.4636 34.9878 58.746 34.5282 59.003 34.0369C59.5423 33.0859 60.0563 32.1032 60.5957 31.1522C60.7765 30.8257 60.5104 30.3627 60.2092 30.2135C59.8161 30.112 59.4451 30.3305 59.2642 30.6571ZM44.5918 10.1569L42.2324 37.5406C42.0032 40.1151 41.8057 42.6641 41.5764 45.2386C41.5032 46.1549 42.9299 46.314 43.0032 45.3977L45.3626 18.014C45.5918 15.4396 45.7893 12.8905 46.0186 10.316C46.1235 9.37433 44.6968 9.21532 44.5918 10.1569Z"></path>
                <path d="M48.101 37.7616C46.7404 38.8232 45.8267 40.2814 44.9163 41.7109C44.0407 43.0866 43.1365 44.4592 41.738 45.3434C42.1247 45.5019 42.5146 45.6321 42.9014 45.7908C42.1324 41.8051 41.04 37.8699 39.6781 34.0203C39.545 33.6589 39.0695 33.5191 38.7365 33.6553C38.3719 33.817 38.2385 34.2353 38.3716 34.5969C39.7209 38.3007 40.7404 42.1121 41.4904 46.009C41.6012 46.5703 42.1877 46.7512 42.6539 46.4565C45.5462 44.6124 46.3877 40.9506 49.0169 38.8748C49.7178 38.2884 48.8304 37.1784 48.101 37.7616ZM25.9671 13.1014C25.7028 16.2497 26.0758 19.3824 26.5091 22.4929C26.9645 25.6636 27.4166 28.863 27.872 32.0337C28.1346 33.8253 28.3971 35.6167 28.631 37.4051C28.7607 38.3151 30.1717 38.0968 30.042 37.1868C29.5866 34.016 29.1281 30.8738 28.7012 27.7062C28.2647 24.6242 27.7396 21.5612 27.449 18.4666C27.2943 16.7449 27.2283 15.0042 27.3653 13.2572C27.4671 12.3442 26.0404 12.1851 25.9671 13.1014Z"></path>
                <path d="M30.5625 27.3357C29.9525 30.7343 29.3425 34.133 28.704 37.5284C29.1225 37.4018 29.5411 37.2751 29.9882 37.1516C28.6034 35.0617 27.2504 32.9465 25.8655 30.8565C25.6406 30.5425 25.1523 30.517 24.8669 30.7451C24.5497 30.9987 24.5305 31.4299 24.7555 31.7439C26.1403 33.8338 27.4933 35.9491 28.8781 38.039C29.2489 38.6003 30.0417 38.2265 30.1624 37.6621C30.7724 34.2635 31.3824 30.8648 32.0209 27.4694C32.0908 27.1016 31.758 26.7178 31.3871 26.6765C30.9559 26.6573 30.6324 26.9679 30.5625 27.3357Z"></path>
              </svg>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-4">
                <Link to="/demo" className="w-full sm:w-auto">
                  <div className="group cursor-pointer border border-white/20 bg-white/5 backdrop-blur-sm gap-2 h-[50px] sm:h-[60px] flex items-center p-[8px] sm:p-[10px] rounded-full hover:border-[#e78a53]/50 transition-all">
                    <div className="border border-white/20 bg-gradient-to-b from-[#e78a53] to-[#e78a53]/80 h-[34px] sm:h-[40px] rounded-full flex items-center justify-center text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]">
                      <p className="font-medium tracking-tight mr-2 sm:mr-3 ml-2 sm:ml-3 flex items-center gap-1.5 sm:gap-2 justify-center text-sm sm:text-base">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          className="sm:w-[18px] sm:h-[18px]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Try Demo
                      </p>
                    </div>
                    <div className="text-white/70 group-hover:ml-2 sm:group-hover:ml-4 ease-in-out transition-all size-[20px] sm:size-[24px] flex items-center justify-center rounded-full border-2 border-white/20">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        className="sm:w-[14px] sm:h-[14px] group-hover:rotate-180 ease-in-out transition-all"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </div>
                  </div>
                </Link>
                <Link to="/login?mode=signup" className="w-full sm:w-auto">
                  <div className="group cursor-pointer border border-white/20 bg-white/5 backdrop-blur-sm gap-2 h-[50px] sm:h-[60px] flex items-center p-[8px] sm:p-[10px] rounded-full hover:border-[#e78a53]/50 transition-all">
                    <div className="border border-white/20 bg-gradient-to-b from-[#e78a53] to-[#e78a53]/80 h-[34px] sm:h-[40px] rounded-full flex items-center justify-center text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]">
                      <p className="font-medium tracking-tight mr-2 sm:mr-3 ml-2 sm:ml-3 flex items-center gap-1.5 sm:gap-2 justify-center text-sm sm:text-base">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          className="sm:w-[18px] sm:h-[18px]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <line x1="19" x2="19" y1="8" y2="14"></line>
                          <line x1="22" x2="16" y1="11" y2="11"></line>
                        </svg>
                        Get Started
                      </p>
                    </div>
                    <div className="text-white/70 group-hover:ml-2 sm:group-hover:ml-4 ease-in-out transition-all size-[20px] sm:size-[24px] flex items-center justify-center rounded-full border-2 border-white/20">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        className="sm:w-[14px] sm:h-[14px] group-hover:rotate-180 ease-in-out transition-all"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Landing Page Content - Always visible */}
      <div
        className="relative bg-black"
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Features Section */}
        <div id="features">
          <Features />
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="-mt-16">
          <PricingSection />
        </div>
            
        {/* Testimonials Section */}
        <div id="testimonials">
          <TestimonialsSection />
        </div>
            
        {/* New Release Promo */}
        <div>
          <NewReleasePromo />
        </div>

        {/* FAQ Section */}
        <div id="faq">
          <FAQSection />
        </div>
          
        {/* Sticky Footer */}
        <div>
          <StickyFooter />
        </div>
      </div>
    </div>
  );
};

export default Landing;
