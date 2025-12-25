import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';

interface HeroSectionProps {
  headline: string;
  subheadline: string;
  ctaPrimary: { text: string; href: string };
  ctaSecondary: { text: string; href: string };
  demoVideoUrl?: string;
}

const TYPING_INTERVAL = 35;

export const HeroSection = ({
  headline,
  subheadline,
  ctaPrimary,
  ctaSecondary,
  demoVideoUrl,
}: HeroSectionProps) => {
  const [typedHeadline, setTypedHeadline] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = window.setInterval(() => {
      setTypedHeadline(headline.slice(0, index + 1));
      index += 1;
      if (index >= headline.length) {
        window.clearInterval(interval);
      }
    }, TYPING_INTERVAL);

    return () => window.clearInterval(interval);
  }, [headline]);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:60px_60px] opacity-40" />
        <motion.div
          className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-purple-500/30 blur-[120px]"
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-blue-500/20 blur-[120px]"
          animate={{ y: [0, -20, 0], x: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="container mx-auto px-6 pb-20 pt-28 md:pt-32">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-white/70"
            >
              Ship cinematic video in minutes
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-semibold leading-tight text-white md:text-6xl">
                <span className="glow-text block min-h-[3.5rem] md:min-h-[5rem]">
                  {typedHeadline}
                  <span className="ml-1 inline-block h-6 w-[2px] animate-pulse bg-violet-300 align-middle" />
                </span>
              </h1>
              <p className="max-w-xl text-base text-white/70 md:text-lg">{subheadline}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <motion.a
                href={ctaPrimary.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20"
              >
                {ctaPrimary.text}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </motion.a>
              <motion.a
                href={ctaSecondary.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition-colors hover:border-violet-400/60 hover:text-white"
              >
                <Play className="h-4 w-4" />
                {ctaSecondary.text}
              </motion.a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-blue-500/10" />
            {demoVideoUrl ? (
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                <source src={demoVideoUrl} type="video/mp4" />
              </video>
            ) : (
              <div className="flex h-72 items-center justify-center text-white/60">
                Live canvas preview loading...
              </div>
            )}
            <div className="absolute inset-0 border border-white/10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
