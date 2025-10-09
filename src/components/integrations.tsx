"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Puzzle, ArrowRight, Code, Zap, Layers } from "lucide-react";
import { useTheme } from "@/components/theme-provider"; // Import useTheme

// Define integration partners with enhanced data
const integrations = [
  { name: "Salesforce", logo: "/logos/salesforce.webp", category: "crm" },
  { name: "HubSpot", logo: "/logos/hubspot.png", category: "crm" },
  { name: "Zendesk", logo: "/logos/zendesk.png", category: "support" },
  { name: "Intercom", logo: "/logos/intercom.png", category: "support" },
  { name: "Shopify", logo: "/logos/shopify.png", category: "ecommerce" },
  { name: "Zoom", logo: "/logos/zoom.png", category: "communication" },
  { name: "Google Calendar", logo: "/logos/google.png", category: "productivity" },
  { name: "Microsoft Teams", logo: "/logos/teams.png", category: "communication" },
  { name: "Slack", logo: "/logos/slack.png", category: "communication" },
  { name: "Zapier", logo: "/logos/zapier.png", category: "automation" },
  { name: "Twilio", logo: "/logos/twilio.png", category: "communication" },
  { name: "Pipedrive", logo: "/logos/pipedrive.png", category: "crm" },
];

export function Integrations() {
  const { theme } = useTheme(); // Access the theme
  const isDark = theme === "dark"; // Determine if the theme is dark
  const { scrollYProgress } = useScroll();
  const xLeft = useTransform(scrollYProgress, [0.5, 0.7], [-100, 0]);
  const xRight = useTransform(scrollYProgress, [0.5, 0.7], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);

  return (
    <section
      id="integrations"
      className={`py-32 relative overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-black" : "bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100"
      }`}
    >
      {/* Enhanced background effect */}
      <div className="absolute inset-0 z-0">
        <div
          className={`absolute top-1/3 left-1/4 w-[600px] h-[600px] ${
            isDark ? "bg-blue-600/10" : "bg-blue-300/10"
          } rounded-full blur-[120px]`}
        />
        <div
          className={`absolute bottom-1/3 right-1/4 w-[600px] h-[600px] ${
            isDark ? "bg-purple-600/10" : "bg-purple-300/10"
          } rounded-full blur-[120px]`}
        />
        <div
          className={`absolute top-2/3 right-1/3 w-96 h-96 ${
            isDark ? "bg-violet-600/10" : "bg-violet-300/10"
          } rounded-full blur-[80px]`}
        />
      </div>

      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <motion.div style={{ opacity, x: xLeft }} className="space-y-8">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                isDark
                  ? "text-blue-400 bg-blue-500/10 border border-blue-500/20"
                  : "text-blue-600 bg-blue-300/10 border border-blue-300/20"
              }`}
            >
              <Puzzle className="h-4 w-4" />
              <span className="text-sm font-medium">Seamless Integrations</span>
            </div>

            <h2 className={`text-4xl font-bold space-y-2 ${isDark ? "text-white" : "text-black"}`}>
              <span>Connect With Your</span>
              <br />
              <span
                className={`bg-clip-text text-transparent bg-gradient-to-r ${
                  isDark ? "from-blue-400 to-violet-400" : "from-blue-600 to-violet-600"
                } inline-block`}
              >
                Favorite Tools
              </span>
            </h2>

            <p
              className={`text-lg leading-relaxed ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Our AI voice agents integrate with your existing workflow. Connect with your
              CRM, helpdesk, calendar, and other tools for a seamless experience.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <motion.div
                className={`bg-gradient-to-br ${
                  isDark
                    ? "from-blue-900/30 to-blue-800/10 border border-white/10"
                    : "from-blue-300/30 to-blue-200/10 border border-gray-200/30"
                } rounded-2xl p-5 backdrop-blur-sm hover:border-blue-500/30 transition-colors`}
                whileHover={{ scale: 1.03 }}
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                    isDark ? "bg-blue-500/20" : "bg-blue-300/20"
                  } mb-4`}
                >
                  <Zap className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2">No-Code Setup</h3>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Connect your tools without writing a single line of code
                </p>
              </motion.div>

              <motion.div
                className={`bg-gradient-to-br ${
                  isDark
                    ? "from-violet-900/30 to-violet-800/10 border border-white/10"
                    : "from-violet-300/30 to-violet-200/10 border border-gray-200/30"
                } rounded-2xl p-5 backdrop-blur-sm hover:border-violet-500/30 transition-colors`}
                whileHover={{ scale: 1.03 }}
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                    isDark ? "bg-violet-500/20" : "bg-violet-300/20"
                  } mb-4`}
                >
                  <Layers className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="font-bold text-lg mb-2">Bidirectional Sync</h3>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Data flows seamlessly between all your platforms
                </p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div style={{ opacity, x: xRight }} className="relative">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 relative">
              {integrations.map((integration, index) => (
                <motion.div
                  key={integration.name}
                  className={`flex items-center justify-center h-20 ${
                    isDark
                      ? "bg-white/5 border border-white/10"
                      : "bg-blue-200 border border-gray-200"
                  } rounded-xl p-6 hover:border-blue-500/30 hover:bg-white/10 transition-all backdrop-blur-sm`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  viewport={{ once: true }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(125, 125, 255, 0.15)",
                  }}
                >
                  <Image
                    src={integration.logo}
                    alt={integration.name}
                    width={40}
                    height={40}
                    className="w-auto h-24 object-contain opacity-70 hover:opacity-100 transition-all"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
