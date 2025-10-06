import { motion } from "framer-motion";
import {
  Brain,
  Zap,
  Shield,
  Globe2,
  Cpu,
  BarChart3
} from "lucide-react";

const features = [
  {
    icon: <Brain className="h-8 w-8 text-cyan-400" />,
    title: "Neural Voice Processing",
    description: "Advanced neural networks that understand context, emotion, and intent with human-level comprehension"
  },
  {
    icon: <Zap className="h-8 w-8 text-purple-400" />,
    title: "Real-Time Intelligence",
    description: "Lightning-fast processing with sub-200ms response times for seamless conversations"
  },
  {
    icon: <Shield className="h-8 w-8 text-blue-400" />,
    title: "Enterprise Security",
    description: "Bank-grade encryption and compliance with SOC2, GDPR, and HIPAA standards"
  },
  {
    icon: <Globe2 className="h-8 w-8 text-emerald-400" />,
    title: "Global Scale",
    description: "Deploy across 50+ regions with multilingual support and local data residency"
  },
  {
    icon: <Cpu className="h-8 w-8 text-indigo-400" />,
    title: "Adaptive Learning",
    description: "Self-improving AI that learns from every interaction to deliver better outcomes"
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-amber-400" />,
    title: "Advanced Analytics",
    description: "Deep insights with real-time metrics, sentiment analysis, and performance optimization"
  },
];

export function Features() {
  return (
    <section className="py-32 bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,255,0.05),transparent_70%)]"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 backdrop-blur-xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span className="text-white font-medium">Advanced Capabilities</span>
          </motion.div>

          <motion.h2
            className="text-5xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Built for the
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 block mt-2">
              Next Generation
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Xseize combines cutting-edge AI research with enterprise-grade reliability to deliver
            voice intelligence that transforms how businesses operate
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Glow effect */}
              <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>

              <div className="relative bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300 h-full">
                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-4 rounded-2xl w-fit mb-6 border border-cyan-500/20">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
