import { motion } from 'framer-motion';
import { PricingCard } from './PricingCard';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export function PricingSection() {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  const pricingPlans = [
    {
      title: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        '10 AI generations per month',
        'Basic workflow templates',
        'Standard AI models',
        'Community support',
        'Export up to 720p',
      ],
      ctaText: 'Get Started',
      ctaAction: () => navigate('/login?mode=signup'),
    },
    {
      title: 'Pro',
      monthlyPrice: 29,
      annualPrice: 24,
      description: 'For serious creators',
      features: [
        'Unlimited AI generations',
        'Advanced workflow builder',
        'Premium AI models',
        'Priority support',
        'Export up to 4K',
        'Collaboration tools',
        'Custom branding',
      ],
      ctaText: 'Start Free Trial',
      ctaAction: () => navigate('/login?mode=signup'),
      popular: true,
    },
    {
      title: 'Enterprise',
      monthlyPrice: 99,
      annualPrice: 79,
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Custom AI model integration',
        'Dedicated support',
        'Advanced analytics',
        'SSO & team management',
        'SLA guarantee',
        'Custom contracts',
      ],
      ctaText: 'Contact Sales',
      ctaAction: () => window.open('mailto:sales@wzrd.studio', '_blank'),
    },
  ];

  return (
    <section className="py-24 px-4 bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#8b5cf6]/5 to-transparent pointer-events-none" />
      
      {/* Floating orbs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#8b5cf6]/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#7c3aed]/20 blur-3xl" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
            <span className="text-sm font-medium text-white/80">Pricing</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9] bg-clip-text text-transparent mb-4">
            Choose your plan
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
            Built for creators, designers, and builders. Start creating today.
          </p>

          {/* Monthly/Annual Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-4 p-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm w-fit mx-auto"
          >
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !isAnnual ? 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/25' : 'text-white/60 hover:text-white/80'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
                isAnnual ? 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/25' : 'text-white/60 hover:text-white/80'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                Save 20%
              </span>
            </button>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={plan.title}
              {...plan}
              isAnnual={isAnnual}
              delay={index * 0.1}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-white/60">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
