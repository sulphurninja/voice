"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { useRef } from "react";
import { Puzzle, Code, Zap, Layers } from "lucide-react";
// Header and Footer are provided by the page/layout. This component should only render the integrations section.
import { useTheme } from "@/components/theme-provider";

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
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 40%"],
  });

  const xLeft = useTransform(scrollYProgress, [0, 1], [-80, 0]);
  const xRight = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <>


    <section
        id="integrations"
        ref={ref}
        className={`py-32 relative overflow-hidden transition-colors duration-500 ${
         isDark
      ?  "bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950":
      "bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100"
        }`}
      >
        {/* Background glow effects */}
        {isDark && (
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/3 left-1/4 w-[700px] h-[700px] bg-blue-500/20 rounded-full blur-[150px]" />
            <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] bg-purple-500/20 rounded-full blur-[150px]" />
            <div className="absolute top-2/3 right-1/3 w-96 h-96 bg-violet-500/20 rounded-full blur-[100px]" />
          </div>
        )}

        <div className="container max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            {/* Left content */}
            <motion.div style={{ opacity, x: xLeft }} className="space-y-8">
              <div
                className={` inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-[0_0_10px_rgba(59,130,246,0.4)] ${
                  isDark
                    ? "text-blue-300 bg-blue-500/20 border-blue-500/40"
                    : "text-blue-600 bg-blue-100 border-blue-300"
                }`}
              >
                <Puzzle className="h-4 w-4" />
                <span className="text-sm font-medium">Seamless Integrations</span>
              </div>

              <h2
                className={`text-5xl font-bold leading-tight ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Connect With Your <br />
                <span
                  className={`bg-clip-text text-transparent bg-gradient-to-r ${
                    isDark
                      ? "from-blue-400 to-violet-400"
                      : "from-blue-600 to-purple-600"
                  }`}
                >
                  Favorite Tools
                </span>
              </h2>

              <p
                className={`text-lg leading-relaxed ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Our AI voice agents integrate with your existing workflow. Connect
                with your CRM, helpdesk, calendar, and other tools for a seamless
                experience.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <motion.div
                  className={`rounded-2xl p-5 backdrop-blur-md border transition-all hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] ${
                    isDark
                      ? "bg-gradient-to-br from-blue-800/40 to-blue-700/10 border-blue-400/30 hover:border-blue-400/60"
                      : "bg-gradient-to-br from-blue-100 to-blue-50 border-blue-200 hover:border-blue-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${
                      isDark ? "bg-blue-500/30" : "bg-blue-200"
                    }`}
                  >
                    <Zap className={`h-6 w-6 ${isDark ? "text-blue-300" : "text-blue-700"}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No-Code Setup</h3>
                  <p className={isDark ? "text-gray-300" : "text-gray-600"}>
                    Connect your tools without writing a single line of code.
                  </p>
                </motion.div>

                <motion.div
                  className={`rounded-2xl p-5 backdrop-blur-md border transition-all hover:shadow-[0_0_25px_rgba(139,92,246,0.25)] ${
                    isDark
                      ? "bg-gradient-to-br from-violet-800/40 to-violet-700/10 border-violet-400/30 hover:border-violet-400/60"
                      : "bg-gradient-to-br from-purple-100 to-purple-50 border-purple-200 hover:border-purple-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${
                      isDark ? "bg-violet-500/30" : "bg-violet-200"
                    }`}
                  >
                    <Layers className={`h-6 w-6 ${isDark ? "text-violet-300" : "text-violet-700"}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Bidirectional Sync</h3>
                  <p className={isDark ? "text-gray-300" : "text-gray-600"}>
                    Data flows seamlessly between all your platforms.
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Logos grid */}
            <motion.div style={{ opacity, x: xRight }} className="relative">
              {isDark && (
                <>
                  <div className="absolute -left-10 top-1/4 w-20 h-20 bg-blue-500/20 rounded-full blur-[30px] animate-pulse"></div>
                  <div className="absolute -right-5 bottom-1/4 w-16 h-16 bg-violet-500/20 rounded-full blur-[25px] animate-pulse"></div>
                </>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 relative">
                {integrations.map((integration, index) => (
                  <motion.div
                    key={integration.name}
                    className={`flex items-center justify-center h-20 rounded-xl p-6 border backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.05)] transition-all ${
                      isDark
                        ? "bg-white/10 border-white/20 hover:border-blue-400/40 hover:bg-white/20"
                        : "bg-white border-gray-200 hover:border-blue-400/30 hover:shadow-lg"
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    viewport={{ once: true }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: isDark
                        ? "0 0 25px rgba(125, 125, 255, 0.25)"
                        : "0 0 25px rgba(59,130,246,0.2)",
                    }}
                  >
                    <Image
                      src={integration.logo}
                      alt={integration.name}
                      width={40}
                      height={40}
                      className="w-auto h-24 object-contain opacity-90 hover:opacity-100 transition-all"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Custom Integration */}
          <motion.div
            className={`mt-24 rounded-3xl border max-w-5xl mx-auto backdrop-blur-xl shadow-[0_0_30px_rgba(100,100,255,0.1)] p-8 md:p-12 ${
              isDark
                ? "bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-700/70"
                : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
            }`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-2 ${
                    isDark ? "bg-blue-500/30" : "bg-blue-200"
                  }`}
                >
                  <Code className={`h-6 w-6 ${isDark ? "text-blue-300" : "text-blue-700"}`} />
                </div>
                <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Need a Custom Integration?
                </h3>
                <p className={isDark ? "text-gray-200" : "text-gray-700"}>
                  Don't see your tool? We offer custom integrations for enterprise
                  customers. Our API allows you to connect with any platform or
                  build your own integration.
                </p>
                <Button
                  className={`rounded-xl px-6 py-6 text-base shadow-[0_0_20px_rgba(59,130,246,0.3)] ${
                    isDark
                      ? "bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400"
                      : "bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-500 hover:to-purple-400 text-white"
                  }`}
                >
                  Request Custom Integration
                </Button>
              </div>

              <div
                className={`rounded-2xl p-6 font-mono text-sm border overflow-hidden shadow-inner backdrop-blur-md ${
                  isDark
                    ? "bg-black/70 border-gray-700/80 text-gray-300"
                    : "bg-gray-100 border-gray-300 text-gray-800"
                }`}
              >
                <div className="flex gap-2 mb-3">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <pre className="overflow-x-auto">
                  <code>
                    <span className="text-blue-400">POST</span> /api/agents/call{"\n"}
                    {"\n"}
                    <span className="text-gray-500">// Request body</span>{"\n"}
                    {"{"}
                    {"\n  "}
                    <span className="text-blue-300">"agent_id"</span>:{" "}
                    <span className="text-green-300">"sales_qualifier"</span>,{"\n  "}
                    <span className="text-blue-300">"phone_number"</span>:{" "}
                    <span className="text-green-300">"+1234567890"</span>,{"\n  "}
                    <span className="text-blue-300">"custom_data"</span>: {"{"}
                    {"\n    "}
                    <span className="text-blue-300">"name"</span>:{" "}
                    <span className="text-green-300">"John Doe"</span>,{"\n    "}
                    <span className="text-blue-300">"company"</span>:{" "}
                    <span className="text-green-300">"Acme Inc"</span>{"\n  "}
                    {"}\n"}
                    {"}"}
                  </code>
                </pre>
                <div
                  className={`h-4 w-2 mt-1 inline-block animate-pulse ${
                    isDark ? "bg-blue-400" : "bg-blue-600"
                  }`}
                ></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
    </>
  );
}
