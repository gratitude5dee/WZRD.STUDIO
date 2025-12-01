
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  title: string;
  price?: string;
  monthlyPrice?: number;
  annualPrice?: number;
  description: string;
  features: string[];
  ctaText: string;
  ctaAction: () => void;
  popular?: boolean;
  delay?: number;
  isAnnual?: boolean;
}

export const PricingCard = ({ 
  title, 
  price,
  monthlyPrice,
  annualPrice, 
  description, 
  features, 
  ctaText, 
  ctaAction,
  popular = false,
  delay = 0,
  isAnnual = false
}: PricingCardProps) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6,
        delay 
      } 
    }
  };

  // Calculate display price
  const displayPrice = price || (monthlyPrice && annualPrice 
    ? `$${isAnnual ? annualPrice : monthlyPrice}` 
    : '$0');
  const priceLabel = price ? '' : isAnnual ? '/year' : '/month';

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      className="relative z-10"
    >
      {popular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <div className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </div>
        </div>
      )}
      
      <div className={cn(
        "glass-card p-6 rounded-xl shadow-lg flex flex-col h-full border",
        popular ? "border-purple-500/50" : "border-white/10"
      )}>
        <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
        <div className="mb-4">
          <span className="text-3xl font-bold text-white">{displayPrice}</span>
          {priceLabel && <span className="text-zinc-400 ml-1">{priceLabel}</span>}
        </div>
        <p className="text-zinc-400 mb-6">{description}</p>
        
        <ul className="mb-8 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 mb-3">
              <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <span className="text-zinc-300">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={ctaAction}
          className={cn(
            "w-full",
            popular 
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-glow-purple-sm" 
              : "bg-white/10 hover:bg-white/20 text-white"
          )}
          size="lg"
        >
          {ctaText}
        </Button>
      </div>
    </motion.div>
  );
};

export default PricingCard;
