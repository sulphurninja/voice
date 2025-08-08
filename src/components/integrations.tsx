"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Puzzle, ArrowRight, Code, Zap, Layers } from "lucide-react";

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
  const { scrollYProgress } = useScroll();
  const xLeft = useTransform(scrollYProgress, [0.5, 0.7], [-100, 0]);
  const xRight = useTransform(scrollYProgress, [0.5, 0.7], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);

  return (
    <section id="integrations" className="py-32 relative overflow-hidden">
      {/* Enhanced background effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-2/3 right-1/3 w-96 h-96 bg-violet-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2   gap-20 items-center">
          <motion.div
            style={{ opacity, x: xLeft }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-blue-400 bg-blue-500/10 border border-blue-500/20">
              <Puzzle className="h-4 w-4" />
              <span className="text-sm font-medium">Seamless Integrations</span>
            </div>

            <h2 className="text-4xl font-bold space-y-2">
              <span>Connect With Your</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400 inline-block">
                Favorite Tools
              </span>
            </h2>

            <p className="text-lg text-gray-300 leading-relaxed">
              Our AI voice agents integrate with your existing workflow. Connect with your CRM, helpdesk, calendar, and other tools for a seamless experience.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <motion.div
                className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:border-blue-500/30 transition-colors"
                whileHover={{ scale: 1.03 }}
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 mb-4">
                  <Zap className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2">No-Code Setup</h3>
                <p className="text-sm text-gray-400">Connect your tools without writing a single line of code</p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-violet-900/30 to-violet-800/10 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:border-violet-500/30 transition-colors"
                whileHover={{ scale: 1.03 }}
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20 mb-4">
                  <Layers className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="font-bold text-lg mb-2">Bidirectional Sync</h3>
                <p className="text-sm text-gray-400">Data flows seamlessly between all your platforms</p>
              </motion.div>
            </div>

            {/* <Link href="/integrations">
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-white/5 rounded-xl px-6 py-5 text-base group">
                View All Integrations
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link> */}
          </motion.div>

          <motion.div
            style={{ opacity, x: xRight }}
            className="relative"
          >
            {/* Floating orbs in background */}
            <div className="absolute -left-10 top-1/4 w-20 h-20 bg-blue-500/10 rounded-full blur-[30px] animate-pulse-slow"></div>
            <div className="absolute -right-5 bottom-1/4 w-16 h-16 bg-violet-500/10 rounded-full blur-[25px] animate-pulse-slow animation-delay-2000"></div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 relative">
              {integrations.map((integration, index) => (
                <motion.div
                  key={integration.name}
                  className="flex items-center justify-center h-20 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-500/30 hover:bg-white/10 transition-all backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  viewport={{ once: true }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(125, 125, 255, 0.15)"
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

        <motion.div
          className="mt-24 bg-gradient-to-br from-gray-900/70 to-black/70 p-8 md:p-12 rounded-3xl border border-gray-800/80 max-w-5xl mx-auto backdrop-blur-md"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 mb-2">
                <Code className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold">Need a Custom Integration?</h3>
              <p className="text-gray-300 leading-relaxed">
                Don't see your tool? We offer custom integrations for enterprise customers.
                Our API allows you to connect with any platform or build your own integration.
              </p>
              <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-xl px-6 py-6 text-base shadow-lg shadow-blue-500/10">
                Request Custom Integration
              </Button>
            </div>

            <div className="bg-black/60 rounded-2xl p-6 font-mono text-sm border border-gray-800 overflow-hidden shadow-inner">
              <div className="flex gap-2 mb-3">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <pre className="text-gray-300 overflow-x-auto">
                <code>
                  <span className="text-blue-400">POST</span> /api/agents/call<br />
                  <br />
                  <span className="text-gray-500">// Request body</span><br />
                  <span className="text-purple-400">{`{`}</span><br />
                  <span className="text-gray-300">{`  `}</span><span className="text-blue-300">"agent_id"</span><span className="text-gray-300">: </span><span className="text-green-300">"sales_qualifier"</span>,<br />
                  <span className="text-gray-300">{`  `}</span><span className="text-blue-300">"phone_number"</span><span className="text-gray-300">: </span><span className="text-green-300">"+1234567890"</span>,<br />
                  <span className="text-gray-300">{`  `}</span><span className="text-blue-300">"custom_data"</span><span className="text-gray-300">: </span><span className="text-purple-400">{`{`}</span><br />
                  <span className="text-gray-300">{`    `}</span><span className="text-blue-300">"name"</span><span className="text-gray-300">: </span><span className="text-green-300">"John Doe"</span>,<br />
                  <span className="text-gray-300">{`    `}</span><span className="text-blue-300">"company"</span><span className="text-gray-300">: </span><span className="text-green-300">"Acme Inc"</span><br />
                  <span className="text-gray-300">{`  `}</span><span className="text-purple-400">{`}`}</span><br />
                  <span className="text-purple-400">{`}`}</span>
                </code>
              </pre>

              {/* Adding a blinking cursor for effect */}
              <div className="h-4 w-2 bg-blue-400 inline-block animate-pulse mt-1"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
