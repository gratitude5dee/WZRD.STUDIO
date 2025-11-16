
import React from 'react';
import { motion } from 'framer-motion';

interface TestimonialCardProps {
  quote: string;
  author: string;
  handle: string;
  featured?: boolean;
  delay?: number;
}

export const TestimonialCard = ({ quote, author, handle, featured = false, delay = 0 }: TestimonialCardProps) => {
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

  // Generate avatar with initials
  const initials = author
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const avatarColors = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-violet-500 to-purple-500',
    'from-teal-500 to-cyan-500',
  ];
  
  const colorIndex = author.charCodeAt(0) % avatarColors.length;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      className={featured ? 'md:row-span-1' : ''}
    >
      <div className="bg-white/[0.02] border border-white/10 p-6 rounded-xl shadow-lg flex flex-col h-full hover:bg-white/[0.04] transition-all duration-300">
        {/* User info */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColors[colorIndex]} flex items-center justify-center text-white font-bold`}>
            {initials}
          </div>
          <div>
            <p className="font-semibold text-white">{author}</p>
            <p className="text-sm text-white/50">{handle}</p>
          </div>
        </div>

        {/* Quote */}
        {featured && (
          <>
            <div className="mb-3 text-purple-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.92 2L10 4C8.8 4.42 7.75 5.14 6.86 6.16C5.97 7.18 5.28 8.45 4.8 9.98C5.83 9.82 6.76 10.01 7.6 10.54C8.42 11.07 8.92 11.9 9.08 13.04C9.23 14.18 8.93 15.14 8.18 15.96C7.43 16.78 6.5 17.19 5.4 17.19C4.1 17.19 3.02 16.67 2.16 15.62C1.3 14.58 0.88 13.25 0.88 11.62C0.88 9.82 1.3 8.16 2.16 6.66C3.02 5.16 4.23 3.95 5.8 3.03C7.36 2.11 8.62 2 9.92 2ZM23.04 2L23.12 4C21.93 4.42 20.88 5.14 19.99 6.16C19.11 7.18 18.42 8.45 17.94 9.98C18.96 9.82 19.89 10.01 20.74 10.54C21.56 11.07 22.06 11.9 22.22 13.04C22.37 14.18 22.07 15.14 21.32 15.96C20.57 16.78 19.64 17.19 18.54 17.19C17.24 17.19 16.16 16.67 15.3 15.62C14.44 14.58 14.02 13.25 14.02 11.62C14.02 9.82 14.44 8.16 15.3 6.66C16.16 5.16 17.37 3.95 18.94 3.03C20.5 2.11 21.76 2 23.04 2Z" fill="currentColor"/>
              </svg>
            </div>
            <p className="text-base text-white/80 leading-relaxed">{quote}</p>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
