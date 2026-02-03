import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';

interface Metric {
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
}

const metrics: Metric[] = [
  { value: 400, suffix: 'ms', label: 'Shot Streaming Latency', prefix: '<' },
  { value: 200, suffix: 'ms', label: 'Interaction Response Time', prefix: '<' },
  { value: 99.9, suffix: '%', label: 'Platform Uptime' },
  { value: 50, suffix: 'K+', label: 'Active Creators' }
];

const AnimatedCounter = ({ value, suffix, prefix = '' }: { value: number; suffix: string; prefix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 1.5,
        ease: 'easeOut',
        onUpdate(latest) {
          setCount(parseFloat(latest.toFixed(1)));
        }
      });
      return controls.stop;
    }
  }, [isInView, value]);

  return (
    <span ref={ref} className="text-5xl lg:text-7xl font-bold text-white">
      {prefix}{count}{suffix}
    </span>
  );
};

export const MetricsSection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Enterprise-Grade Performance
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Built for scale. Optimized for speed. Engineered for reliability.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="mb-4">
                <AnimatedCounter 
                  value={metric.value} 
                  suffix={metric.suffix}
                  prefix={metric.prefix}
                />
              </div>
              <p className="text-sm text-zinc-500 uppercase tracking-wider font-medium">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
