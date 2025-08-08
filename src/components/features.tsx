import { motion } from "framer-motion";
import {
  PhoneCall,
  MessageSquare,
  Calendar,
  BarChart,
  Clock,
  Globe
} from "lucide-react";

const features = [
  {
    icon: <PhoneCall className="h-8 w-8 text-blue-400" />,
    title: "Voice Support",
    description: "Natural-sounding AI agents handle customer calls with human-like conversation"
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-violet-400" />,
    title: "Lead Qualification",
    description: "Pre-qualify leads before they reach your sales team to increase efficiency"
  },
  {
    icon: <Calendar className="h-8 w-8 text-indigo-400" />,
    title: "Appointment Booking",
    description: "Schedule meetings automatically with calendar integration"
  },
  {
    icon: <BarChart className="h-8 w-8 text-sky-400" />,
    title: "Analytics Dashboard",
    description: "Track performance with detailed call analytics and insights"
  },
  {
    icon: <Clock className="h-8 w-8 text-fuchsia-400" />,
    title: "24/7 Availability",
    description: "Never miss a call with agents that work around the clock"
  },
  {
    icon: <Globe className="h-8 w-8 text-cyan-400" />,
    title: "Multilingual Support",
    description: "Engage with customers in their preferred language"
  },
];

export function Features() {
  return (
    <section className="py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Advanced Voice Agent Capabilities</h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Our AI agents transform how businesses handle calls with advanced voice technology
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-800 hover:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="bg-gray-800/50 p-3 rounded-xl w-fit mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
