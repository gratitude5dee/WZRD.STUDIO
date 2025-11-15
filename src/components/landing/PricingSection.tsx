import { motion } from 'framer-motion';
import { PricingCard } from './PricingCard';
import { useNavigate } from 'react-router-dom';

export function PricingSection() {
  const navigate = useNavigate();

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
      price: '$29',
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
      price: 'Custom',
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
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Choose the plan that fits your creative needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={plan.title}
              {...plan}
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
