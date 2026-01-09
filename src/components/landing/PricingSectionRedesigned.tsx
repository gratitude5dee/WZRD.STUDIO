import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    description: 'For creators testing the waters',
    price: { monthly: 0, annual: 0 },
    highlight: false,
    cta: 'Start Free',
    features: [
      '5 video exports/month',
      '720p resolution',
      'Basic AI models',
      'Community support',
      'Watermarked exports',
    ],
  },
  {
    name: 'Pro',
    description: 'For indie labels & solo creators',
    price: { monthly: 49, annual: 39 },
    highlight: true,
    badge: 'Most Popular',
    cta: 'Start Pro Trial',
    features: [
      '50 video exports/month',
      '1080p & 4K resolution',
      'Premium AI models',
      'Priority rendering',
      'No watermarks',
      'Brand kit & presets',
      'Email support',
    ],
  },
  {
    name: 'Business',
    description: 'For teams & agencies',
    price: { monthly: 149, annual: 119 },
    highlight: false,
    cta: 'Start Business Trial',
    features: [
      'Unlimited exports',
      '4K + HDR support',
      'All AI models',
      'Team collaboration (5 seats)',
      'Custom brand templates',
      'API access',
      'Priority support',
      'Account manager',
    ],
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: { monthly: null, annual: null },
    highlight: false,
    cta: 'Contact Sales',
    customPricing: true,
    features: [
      'Everything in Business',
      'Unlimited team seats',
      'Custom AI model training',
      'Dedicated infrastructure',
      'SLA guarantee',
      'On-premise option',
      'Custom integrations',
      '24/7 phone support',
    ],
  },
];

export function PricingSectionRedesigned() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="py-32 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Simple, Transparent Pricing
          </span>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Start Free.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
              Scale as You Grow.
            </span>
          </h2>

          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10">
            No hidden fees. No contracts. Cancel anytime.
            <br />
            Save 20% with annual billing.
          </p>

          <div className="flex items-center justify-center gap-4">
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                !isAnnual ? 'text-white' : 'text-white/50',
              )}
            >
              Monthly
            </span>

            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={cn(
                'relative w-14 h-7 rounded-full transition-colors duration-300',
                'bg-purple-500/20 border border-purple-500/30',
              )}
            >
              <motion.div
                className="absolute top-1 w-5 h-5 rounded-full bg-purple-500"
                animate={{ left: isAnnual ? '32px' : '4px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>

            <span
              className={cn(
                'text-sm font-medium transition-colors',
                isAnnual ? 'text-white' : 'text-white/50',
              )}
            >
              Annual
              <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                Save 20%
              </span>
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                'relative flex flex-col p-6 rounded-2xl',
                'border transition-all duration-300',
                plan.highlight
                  ? 'bg-gradient-to-b from-purple-500/15 to-purple-900/10 border-purple-500/40 shadow-[0_0_40px_rgba(139,92,246,0.15)]'
                  : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20',
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={cn(
                      'px-4 py-1 rounded-full text-xs font-semibold',
                      'bg-purple-500 text-white',
                      'shadow-[0_0_20px_rgba(139,92,246,0.5)]',
                    )}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-white/50">{plan.description}</p>
              </div>

              <div className="mb-6">
                {plan.customPricing ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">Custom</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      ${isAnnual ? plan.price.annual : plan.price.monthly}
                    </span>
                    {typeof plan.price.monthly === 'number' && plan.price.monthly > 0 && (
                      <span className="text-white/50">/month</span>
                    )}
                  </div>
                )}
                {typeof plan.price.monthly === 'number' &&
                  plan.price.monthly > 0 &&
                  typeof plan.price.annual === 'number' &&
                  isAnnual && (
                    <p className="text-xs text-white/40 mt-1">
                      Billed annually (${plan.price.annual * 12}/year)
                    </p>
                  )}
              </div>

              <Link
                to={plan.customPricing ? '/contact' : '/login?mode=signup'}
                className={cn(
                  'flex items-center justify-center gap-2 w-full py-3 rounded-xl',
                  'font-semibold text-sm transition-all duration-300',
                  plan.highlight
                    ? 'bg-purple-500 hover:bg-purple-400 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10',
                )}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-white/40 mt-12"
        >
          All plans include 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  );
}

export default PricingSectionRedesigned;
