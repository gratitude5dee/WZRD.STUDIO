
import React from 'react';
import { motion } from 'framer-motion';
import { TechHighlight } from './TechHighlight';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  techBadge?: string;
}

export const FeatureCard = ({ icon, title, description, delay = 0, techBadge }: FeatureCardProps) => {
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

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      className="perspective-1000"
    >
      <div className="glass-card p-6 rounded-xl transform-style-3d hover:rotateX-3 hover:rotateY-3 hover:-translate-y-2 transition-all-std shadow-lg h-full">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-zinc-400 mb-4">{description}</p>
        {techBadge && <TechHighlight name={techBadge} />}
      </div>
    </motion.div>
  );
};

export default FeatureCard;
