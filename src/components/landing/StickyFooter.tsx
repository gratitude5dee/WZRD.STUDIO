import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { motion } from 'framer-motion';

export function StickyFooter() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('Subscribe email:', email);
    setEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black border-t border-white/10 py-12 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#8b5cf6]/10 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-[#7c3aed]/10 blur-3xl" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Newsletter Section */}
        <div className="bg-gradient-to-br from-[#8b5cf6]/10 to-[#7c3aed]/5 rounded-2xl p-8 mb-12 border border-[#8b5cf6]/20">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Stay Updated</h3>
            <p className="text-white/60 mb-6">Get the latest AI workflow tips and updates</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#8b5cf6]"
                required
              />
              <Button 
                type="submit"
                className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] shadow-lg shadow-[#8b5cf6]/25"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-white font-bold text-xl tracking-tight bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] bg-clip-text text-transparent">
                WZRD.STUDIO
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              AI-powered creative workflows for the next generation of creators.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-white/60 hover:text-white transition-colors text-sm">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-white/60 hover:text-white transition-colors text-sm">
                  Pricing
                </a>
              </li>
              <li>
                <Link to="/demo" className="text-white/60 hover:text-white transition-colors text-sm">
                  Demo
                </Link>
              </li>
              <li>
                <a href="#faq" className="text-white/60 hover:text-white transition-colors text-sm">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  Careers
                </a>
              </li>
              <li>
                <a href="mailto:contact@wzrd.studio" className="text-white/60 hover:text-white transition-colors text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} WZRD.STUDIO. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@wzrd.studio"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
            
            {/* Back to Top Button */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 text-[#8b5cf6] hover:bg-[#8b5cf6]/30 transition-all"
              aria-label="Back to top"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}
