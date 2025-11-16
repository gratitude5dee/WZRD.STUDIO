import { motion } from 'framer-motion';
import { WorkflowDiagram } from './WorkflowDiagram';
import { SecureInfrastructureVisual } from './SecureInfrastructureVisual';

export function FeaturesShowcase() {
  return (
    <section id="features" className="py-24 px-4 bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#e78a53]/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to Create
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Powerful tools designed for creators, designers, and developers
          </p>
        </motion.div>

        {/* Two large feature cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Creator Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-950/50 via-teal-900/30 to-black border border-teal-500/20 p-8 hover:border-teal-500/40 transition-all duration-300"
          >
            <div className="relative z-10 mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">
                Creator Dashboard
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                Built for creators, designers, and builders. Visually connect our AI models to create stunning images and videos. 
                Build complex scenes with an intuitive interface designed for creative professionals.
              </p>
            </div>

            {/* Workflow Diagram */}
            <WorkflowDiagram />
          </motion.div>

          {/* Secure Backend Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-950/50 via-black to-black border border-purple-500/20 p-8 hover:border-purple-500/40 transition-all duration-300"
          >
            <div className="relative z-10 mb-8">
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                Secure Serverless Backend
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                Enterprise-grade security built for creators and designers. All API keys are stored securely and never exposed to the client. 
                Your projects and data are protected with industry-standard security practices, so you can focus on creating.
              </p>
            </div>

            {/* Secure Infrastructure Visual */}
            <SecureInfrastructureVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
