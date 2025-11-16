import { motion } from "framer-motion";
import { Workflow, Sparkles, Video, Users, Download, Cloud, Zap, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
}

const features: Feature[] = [
  {
    icon: Workflow,
    title: "Node-Based Workflows",
    description: "Visually connect AI models in a drag-and-drop canvas. No coding required.",
    badge: "New",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description: "Access multiple AI models: Minimax, Hunyuan, LTX, Flux, and more.",
  },
  {
    icon: Video,
    title: "Timeline Editor",
    description: "Professional video editing with multi-track timeline and real-time preview.",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "Work together with your team on the same project simultaneously.",
    badge: "Coming Soon",
  },
  {
    icon: Download,
    title: "4K Export",
    description: "Export your creations in professional quality up to 4K resolution.",
  },
  {
    icon: Cloud,
    title: "Cloud Storage",
    description: "Secure asset management with Supabase-backed cloud storage.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance with instant previews and smooth animations.",
  },
  {
    icon: Palette,
    title: "Custom Styles",
    description: "Apply custom styles, filters, and effects to your generated content.",
  },
];

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

const FeatureCard = ({ feature, index }: FeatureCardProps) => {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
    >
      {/* Badge */}
      {feature.badge && (
        <Badge 
          variant={feature.badge === "New" ? "default" : "secondary"}
          className="absolute top-4 right-4 text-xs"
        >
          {feature.badge}
        </Badge>
      )}

      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-purple-400" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
        {feature.title}
      </h3>
      <p className="text-zinc-400 text-sm leading-relaxed">
        {feature.description}
      </p>

      {/* Hover gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:via-pink-500/10 group-hover:to-purple-500/10 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
};

export const FeaturesShowcase = () => {
  return (
    <section className="py-24 px-6 bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to Create
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Professional-grade tools powered by cutting-edge AI technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
