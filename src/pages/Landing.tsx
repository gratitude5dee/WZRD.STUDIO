import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Play, 
  ChevronDown, 
  Zap, 
  Wallet, 
  Library,
  Clock,
  DollarSign,
  Shield,
  Eye,
  Heart
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

// Radar dial SVG component
const RadarDial = () => (
  <div className="relative w-32 h-32 md:w-48 md:h-48">
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
      <defs>
        <linearGradient id="copperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(32 55% 75%)" />
          <stop offset="50%" stopColor="hsl(32 55% 65%)" />
          <stop offset="100%" stopColor="hsl(32 55% 55%)" />
        </linearGradient>
        <linearGradient id="wedgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(40 40% 94%)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(32 55% 65%)" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="none" stroke="url(#copperGradient)" strokeWidth="1.5" opacity="0.4" />
      <circle cx="100" cy="100" r="70" fill="none" stroke="url(#copperGradient)" strokeWidth="1.5" opacity="0.5" />
      <circle cx="100" cy="100" r="50" fill="none" stroke="url(#copperGradient)" strokeWidth="1.5" opacity="0.6" />
      <circle cx="100" cy="100" r="30" fill="none" stroke="url(#copperGradient)" strokeWidth="1.5" opacity="0.7" />
      <circle cx="100" cy="100" r="10" fill="url(#copperGradient)" />
      
      <path
        d="M100,100 L100,10 A90,90 0 0,1 177.78,55 Z"
        fill="url(#wedgeGradient)"
        className="animate-spin-slow origin-center"
      />
      
      <line x1="100" y1="100" x2="100" y2="15" stroke="url(#copperGradient)" strokeWidth="2" />
      <line x1="100" y1="100" x2="170" y2="60" stroke="url(#copperGradient)" strokeWidth="1.5" opacity="0.6" />
    </svg>
  </div>
);

// Testimonial card component
const TestimonialCard = ({ quote, name, role, offset = "" }: { quote: string; name: string; role: string; offset?: string }) => (
  <div className={`bg-landing-cream border border-landing-beige rounded-2xl p-6 shadow-sm ${offset}`}>
    <p className="text-landing-charcoal text-sm leading-relaxed mb-4">"{quote}"</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-landing-copper to-landing-violet" />
      <div>
        <p className="text-landing-charcoal font-medium text-sm">{name}</p>
        <p className="text-landing-charcoal/60 text-xs">{role}</p>
      </div>
    </div>
  </div>
);

// Value prop card component
const ValuePropCard = ({ icon: Icon, title, description, gradient }: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  gradient: string;
}) => (
  <div className="bg-white rounded-3xl p-8 shadow-lg border border-landing-beige">
    <div className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center mb-6`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="font-playfair text-xl text-landing-charcoal mb-3">{title}</h3>
    <p className="text-landing-charcoal/70 leading-relaxed text-sm">{description}</p>
  </div>
);

// Stat card component
const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <p className="text-3xl md:text-4xl font-semibold text-landing-copper mb-1">{value}</p>
    <p className="text-landing-charcoal/60 text-sm">{label}</p>
  </div>
);

export default function Landing() {
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-landing-beige">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-landing-beige/90 backdrop-blur-sm border-b border-landing-charcoal/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-playfair font-semibold text-landing-charcoal tracking-wide">
            EARTON<span className="inline-block scale-x-[-1]">E</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" className="text-landing-charcoal hover:bg-landing-charcoal/10 font-medium">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          {/* Large Wordmark */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-semibold text-landing-charcoal tracking-tight mb-6">
            EARTON<span className="inline-block scale-x-[-1]">E</span>
          </h1>

          {/* Tagline with Radar Dial */}
          <div className="flex items-center justify-center gap-4 md:gap-8 mb-8">
            <span className="font-playfair italic text-landing-violet text-lg md:text-2xl">a signal</span>
            <RadarDial />
            <span className="font-playfair italic text-landing-violet text-lg md:text-2xl">in the noise.</span>
          </div>

          {/* Hero Headline */}
          <h2 className="text-2xl md:text-4xl font-playfair text-landing-charcoal mb-4 max-w-3xl mx-auto">
            Every stream pays creators <span className="text-landing-copper italic">instantly</span>
          </h2>
          
          {/* Subheadline */}
          <p className="text-landing-charcoal/70 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            100% of streaming revenue goes directly to artists. No middlemen, no delays, no platform fees.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/auth">
              <Button className="bg-landing-violet hover:bg-landing-violet/90 text-white px-8 py-6 text-base font-medium rounded-xl">
                Start Streaming
              </Button>
            </Link>
            <Link to="/auth">
              <Button 
                variant="outline" 
                className="border-landing-charcoal/30 text-landing-charcoal hover:bg-landing-charcoal/5 px-8 py-6 text-base font-medium rounded-xl"
              >
                I'm a Creator
              </Button>
            </Link>
          </div>

          {/* Brand Tagline */}
          <p className="text-landing-charcoal/50 text-sm tracking-wider">
            Content. Music. Media. <span className="text-landing-copper font-medium">CULTURE.</span>
          </p>
        </div>
      </section>

      {/* Value Proposition - 3 Pillars */}
      <section id="features" className="py-20 px-4 bg-landing-cream/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-landing-violet text-sm font-medium uppercase tracking-widest mb-2">How it works</p>
            <h2 className="font-playfair text-3xl md:text-4xl text-landing-charcoal">
              Stream. Pay. Own.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <ValuePropCard 
              icon={Play}
              title="Discover & Stream"
              description="Access premium music, videos, and written content from independent creators who put quality first. Curated culture, not algorithmic noise."
              gradient="bg-gradient-to-br from-landing-violet to-landing-violet/80"
            />
            <ValuePropCard 
              icon={Zap}
              title="Pay Per Stream"
              description="Pay fractions of a cent per stream — no subscriptions required. Each purchase unlocks 24 hours of unlimited access. Transparent, fair, instant."
              gradient="bg-gradient-to-br from-landing-copper to-landing-copper/80"
            />
            <ValuePropCard 
              icon={Library}
              title="Own Your Library"
              description="Your listening history and purchases live on-chain. Portable, verifiable, and truly yours. Take your library anywhere, forever."
              gradient="bg-gradient-to-br from-landing-teal to-landing-teal/80"
            />
          </div>
        </div>
      </section>

      {/* For Creators Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-landing-violet text-sm font-medium uppercase tracking-widest mb-2">For Creators</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-landing-charcoal mb-6">
                Keep 100% of what you earn. <span className="italic text-landing-copper">Finally.</span>
              </h2>
              <p className="text-landing-charcoal/70 leading-relaxed mb-6">
                Traditional platforms take 30-70% of your revenue and pay months later. EARTONE is different. 
                Every stream triggers an instant payment directly to your wallet. No advances to pay back, 
                no mysterious deductions, no waiting 90 days for royalty statements. Set your own prices, 
                reach your audience directly, and watch earnings arrive in real-time.
              </p>
              <p className="text-landing-charcoal/70 leading-relaxed mb-8">
                This is what the creator economy should have been from the start.
              </p>
              <Link to="/auth">
                <Button className="bg-landing-charcoal hover:bg-landing-charcoal/90 text-white px-6 py-5 text-sm font-medium rounded-xl">
                  Start Uploading Today
                </Button>
              </Link>
            </div>
            
            {/* Stats Block */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-landing-beige">
              <div className="grid grid-cols-2 gap-8">
                <StatCard value="100%" label="Revenue to creators" />
                <StatCard value="<1s" label="Payment settlement" />
                <StatCard value="$0" label="Platform fees" />
                <StatCard value="24hr" label="Access windows" />
              </div>
              <div className="mt-8 pt-6 border-t border-landing-beige">
                <div className="flex items-center gap-2 text-sm text-landing-charcoal/60">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span>Creators earned $2.4M+ this month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-landing-violet via-landing-violet to-landing-violet/90">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-2">Built Different</p>
            <h2 className="font-playfair text-3xl md:text-4xl text-white">
              Enterprise-grade infrastructure
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Monad Block */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-playfair text-2xl text-white mb-4">Powered by Monad</h3>
              <p className="text-white/80 leading-relaxed">
                Built on a high-performance blockchain capable of 10,000+ transactions per second with 
                sub-second finality. This means your payments settle instantly — not in minutes, not in hours, 
                but the moment you press play. Enterprise-grade reliability meets creator-first economics.
              </p>
            </div>
            
            {/* Thirdweb Block */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-playfair text-2xl text-white mb-4">Seamless with Thirdweb</h3>
              <p className="text-white/80 leading-relaxed">
                Sign in with Google, Apple, or your existing wallet — no crypto experience required. 
                Industry-leading wallet infrastructure handles the complexity so you can focus on what matters: 
                the music, the content, the culture. Web3 benefits without the web3 friction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Consumers Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-landing-violet text-sm font-medium uppercase tracking-widest mb-2">For Fans</p>
            <h2 className="font-playfair text-3xl md:text-4xl text-landing-charcoal mb-6">
              Support artists you love. <span className="italic text-landing-copper">Directly.</span>
            </h2>
            <p className="text-landing-charcoal/70 leading-relaxed max-w-2xl mx-auto">
              Every stream you make sends money straight to the creator. No corporate middlemen, 
              no mysterious algorithms deciding who gets paid. Your support matters and you can see exactly where it goes.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 bg-white rounded-2xl p-6 shadow-sm border border-landing-beige">
              <div className="w-10 h-10 rounded-xl bg-landing-violet/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-landing-violet" />
              </div>
              <div>
                <h4 className="font-medium text-landing-charcoal mb-1">Pay only for what you consume</h4>
                <p className="text-landing-charcoal/60 text-sm">No monthly subscriptions. Stream what you want, when you want.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white rounded-2xl p-6 shadow-sm border border-landing-beige">
              <div className="w-10 h-10 rounded-xl bg-landing-copper/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-landing-copper" />
              </div>
              <div>
                <h4 className="font-medium text-landing-charcoal mb-1">24-hour unlimited access</h4>
                <p className="text-landing-charcoal/60 text-sm">One small payment unlocks a full day of unlimited streams.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white rounded-2xl p-6 shadow-sm border border-landing-beige">
              <div className="w-10 h-10 rounded-xl bg-landing-teal/10 flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-landing-teal" />
              </div>
              <div>
                <h4 className="font-medium text-landing-charcoal mb-1">Transparent, verifiable payments</h4>
                <p className="text-landing-charcoal/60 text-sm">Every payment is recorded on-chain. See exactly where your money goes.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white rounded-2xl p-6 shadow-sm border border-landing-beige">
              <div className="w-10 h-10 rounded-xl bg-landing-coral/10 flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-landing-coral" />
              </div>
              <div>
                <h4 className="font-medium text-landing-charcoal mb-1">Direct artist connection</h4>
                <p className="text-landing-charcoal/60 text-sm">Your support goes directly to creators, not corporate shareholders.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof Section */}
      <section className="py-20 px-4 bg-landing-cream/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-landing-violet text-sm font-medium uppercase tracking-widest mb-2">What creators are saying</p>
            <h2 className="font-playfair text-3xl md:text-4xl text-landing-charcoal">
              Trusted by independents
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard 
              quote="I made more in my first month on EARTONE than six months of Spotify streams. And I got paid the same day — not 90 days later."
              name="Marcus Chen"
              role="Independent Musician"
              offset="md:mt-0"
            />
            <TestimonialCard 
              quote="Finally, a platform that treats my short films as valuable content, not just filler between ads. The direct payment model is a game changer."
              name="Amara Okafor"
              role="Filmmaker & Director"
              offset="md:mt-8"
            />
            <TestimonialCard 
              quote="EARTONE represents the future of creator compensation — transparent, instant, and fair. The streaming industry should take notes."
              name="The Creator Report"
              role="Industry Publication"
              offset="md:mt-4"
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-landing-charcoal to-landing-charcoal/95">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-playfair text-3xl md:text-5xl text-white mb-4">
            The future of streaming is <span className="italic text-landing-copper">direct</span>
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of creators and fans building a fairer creative economy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button className="bg-white hover:bg-white/90 text-landing-charcoal px-8 py-6 text-base font-medium rounded-xl">
                Start Streaming
              </Button>
            </Link>
            <Link to="/auth">
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base font-medium rounded-xl"
              >
                Upload as Creator
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-landing-charcoal/10 bg-landing-beige">
        <div className="container mx-auto text-center">
          <p className="font-playfair text-xl text-landing-charcoal mb-2">
            EARTON<span className="inline-block scale-x-[-1]">E</span>
          </p>
          <p className="text-landing-charcoal/50 text-sm mb-1">
            Content. Music. Media. CULTURE.
          </p>
          <p className="text-landing-charcoal/40 text-xs">
            Powered by Thirdweb
          </p>
        </div>
      </footer>
    </div>
  );
}
