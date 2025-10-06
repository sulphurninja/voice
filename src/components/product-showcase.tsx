"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  MessageSquare,
  Calendar,
  TrendingUp,
  Zap,
  ArrowRight,
  Sparkles,
  Code,
  BarChart3,
  Globe2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

const products = [
  {
    id: "intelligence",
    name: "Voice Intelligence",
    icon: <Brain className="h-6 w-6" />,
    description: "Deploy AI agents that understand context, emotion, and intent with unprecedented accuracy.",
    features: [
      "Natural conversation flow",
      "Emotional intelligence processing",
      "Context-aware responses",
      "Multi-turn dialogue management",
      "Real-time sentiment analysis"
    ],
    stats: [
      { label: "Accuracy", value: "99.2%", trend: "up" },
      { label: "Response Time", value: "<150ms", trend: "up" },
      { label: "Languages", value: "50+", trend: "up" }
    ],
    image: "/demo/intelligence.png",
    gradient: "from-cyan-500/20 to-blue-500/20",
    border: "border-cyan-500/30",
    accent: "text-cyan-400",
    lightAccent: "text-cyan-600"
  },
  {
    id: "automation",
    name: "Process Automation",
    icon: <Code className="h-6 w-6" />,
    description: "Automate complex workflows with intelligent voice agents that adapt to your business logic.",
    features: [
      "Workflow orchestration",
      "Dynamic decision trees",
      "Integration APIs",
      "Custom logic implementation",
      "Real-time process optimization"
    ],
    stats: [
      { label: "Efficiency Gain", value: "84%", trend: "up" },
      { label: "Cost Reduction", value: "67%", trend: "down" },
      { label: "Processing Speed", value: "10x", trend: "up" }
    ],
    image: "/demo/automation.png",
    gradient: "from-purple-500/20 to-violet-500/20",
    border: "border-purple-500/30",
    accent: "text-purple-400",
    lightAccent: "text-purple-600"
  },
  {
    id: "analytics",
    name: "Intelligence Analytics",
    icon: <BarChart3 className="h-6 w-6" />,
    description: "Gain deep insights from voice interactions with advanced analytics and predictive intelligence.",
    features: [
      "Real-time performance metrics",
      "Predictive analytics",
      "Custom reporting dashboards",
      "Trend analysis",
      "ROI optimization insights"
    ],
    stats: [
      { label: "Data Points", value: "1M+", trend: "up" },
      { label: "Insights Generated", value: "Real-time", trend: "up" },
      { label: "Accuracy", value: "96.8%", trend: "up" }
    ],
    image: "/demo/analytics.png",
    gradient: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/30",
    accent: "text-emerald-400",
    lightAccent: "text-emerald-600"
  }
];

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState("intelligence");
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const activeProduct = products.find(p => p.id === activeTab) || products[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <section
      id="products"
      className={cn(
        "py-32 relative overflow-hidden transition-colors duration-300",
        isDark
          ? "bg-black"
          : "bg-gradient-to-b from-gray-50 to-white"
      )}
    >
      {/* Premium background effects */}
      <div className="absolute inset-0">
        {isDark ? (
          <>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(0,212,255,0.05),transparent_50%)]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.05),transparent_50%)]"></div>
          </>
        ) : (
          <>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.03),transparent_50%)]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.03),transparent_50%)]"></div>
          </>
        )}

        {/* Grid pattern */}
        <div className={cn(
          "absolute inset-0 bg-[size:60px_60px] opacity-20",
          isDark
            ? "bg-[linear-gradient(to_right,theme(colors.gray.800)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.gray.800)_1px,transparent_1px)]"
            : "bg-[linear-gradient(to_right,theme(colors.gray.200)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.gray.200)_1px,transparent_1px)]"
        )} />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl mb-6 transition-colors",
              isDark
                ? "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20"
                : "bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-cyan-500/10"
            )}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className={cn("h-4 w-4", isDark ? "text-cyan-400" : "text-cyan-600")} />
            <span className={cn("font-medium", isDark ? "text-white" : "text-gray-700")}>
              Complete AI Suite
            </span>
          </motion.div>

          <motion.h2
            className={cn(
              "text-5xl font-bold mb-6 transition-colors",
              isDark ? "text-white" : "text-gray-900"
            )}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            <span className={cn(
              "bg-clip-text text-transparent bg-gradient-to-r",
              isDark
                ? "from-cyan-400 to-purple-400"
                : "from-cyan-600 to-purple-600"
            )}>
              Intelligent Solutions
            </span>
            <br />
            <span>for Every Business Need</span>
          </motion.h2>

          <motion.p
            className={cn(
              "text-xl leading-relaxed transition-colors",
              isDark ? "text-gray-300" : "text-gray-600"
            )}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Transform your operations with XSeize's comprehensive suite of AI-powered voice solutions
          </motion.p>
        </div>

        <Tabs
          defaultValue="intelligence"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <div className="flex justify-center mb-16">
            <TabsList className={cn(
              "p-2 rounded-2xl backdrop-blur-xl transition-colors",
              isDark
                ? "bg-black/60 border border-white/10"
                : "bg-white/60 border border-gray-200/50"
            )}>
              {products.map((product) => (
                <TabsTrigger
                  key={product.id}
                  value={product.id}
                  className={cn(
                    "rounded-xl px-6 py-4 font-medium transition-all",
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white",
                    isDark ? "text-gray-300" : "text-gray-600"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-white/10">
                      {product.icon}
                    </div>
                    <span className="hidden md:inline">{product.name}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            {products.map((product) => (
              <TabsContent key={product.id} value={product.id} className="mt-0">
                <motion.div
                  className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="space-y-8">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl transition-colors",
                      `bg-gradient-to-r ${product.gradient} border ${product.border}`
                    )}>
                      {product.icon}
                      <span className="text-white font-medium">{product.name}</span>
                    </div>

                    <h3 className={cn(
                      "text-4xl font-bold leading-tight transition-colors",
                      isDark ? "text-white" : "text-gray-900"
                    )}>
                      {product.description}
                    </h3>

                    <ul className="space-y-4">
                      {product.features.map((feature, index) => (
                        <motion.li
                          key={index}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center",
                            `bg-gradient-to-r ${product.gradient} border ${product.border}`
                          )}>
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                          </div>
                          <span className={cn(
                            "transition-colors",
                            isDark ? "text-gray-300" : "text-gray-600"
                          )}>
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>

                    <div className="grid grid-cols-3 gap-4">
                      {product.stats.map((stat, index) => (
                        <motion.div
                          key={index}
                          className={cn(
                            "backdrop-blur-xl rounded-2xl p-4 text-center transition-all hover:scale-105",
                            isDark
                              ? "bg-black/40 border border-white/10 hover:border-cyan-500/30"
                              : "bg-white/40 border border-gray-200/30 hover:border-cyan-500/30"
                          )}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          <div className={cn(
                            "text-2xl font-bold mb-1",
                            isDark ? product.accent : product.lightAccent
                          )}>
                            {stat.value}
                          </div>
                          <div className={cn(
                            "text-sm",
                            isDark ? "text-gray-400" : "text-gray-500"
                          )}>
                            {stat.label}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <Link href={`/products/${product.id}`}>
                        <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 rounded-xl px-8 py-6 text-lg font-semibold shadow-2xl group transition-all hover:scale-105">
                          <span className="text-white">Explore {product.name}</span>
                          <Zap className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className={cn(
                      "absolute -inset-1 rounded-3xl blur-lg opacity-60",
                      `bg-gradient-to-r ${product.gradient}`
                    )}></div>

                    <div className={cn(
                      "relative aspect-video rounded-3xl overflow-hidden transition-colors",
                      isDark
                        ? "border border-white/20 bg-black/90"
                        : "border border-gray-200/50 bg-white/90"
                    )}>
                      <div className={cn(
                        "h-full w-full flex items-center justify-center text-6xl opacity-20",
                        isDark ? "text-gray-600" : "text-gray-400"
                      )}>
                        {product.icon}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>

                      {/* Live indicator */}
                      <div className={cn(
                        "absolute top-4 left-4 flex items-center gap-2 backdrop-blur-md px-3 py-2 rounded-full transition-colors",
                        isDark
                          ? "bg-black/70 border border-white/20"
                          : "bg-white/70 border border-gray-200/50"
                      )}>
                        <div className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                        </div>
                        <span className={cn(
                          "text-xs font-medium",
                          isDark ? "text-white" : "text-gray-700"
                        )}>
                          Live System
                        </span>
                      </div>

                      {/* XSeize branding watermark */}
                      <div className={cn(
                        "absolute bottom-4 right-4 text-xs font-medium opacity-60",
                        isDark ? "text-white" : "text-gray-700"
                      )}>
                        XSeize AI
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </div>
    </section>
  );
}
