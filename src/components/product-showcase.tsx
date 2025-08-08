"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneCall, Users, Calendar, Briefcase, Award, ArrowRight, Radio, Shield, Zap, MoveRight, Sparkles, CheckCircle, BarChart2, Bot, BrainCircuit, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

// Define the different AI agent products with enhanced data
const products = [
  {
    id: "sales-agent",
    name: "Sales Qualifier",
    icon: <Briefcase className="h-6 w-6" />,
    description: "Convert more leads with AI agents that qualify prospects and book meetings for your sales team.",
    features: [
      "Pre-qualify leads 24/7",
      "Book meetings directly in your calendar",
      "Collect key prospect information",
      "Route qualified leads to sales reps",
      "Follow up with leads automatically"
    ],
    stats: [
      { label: "Conversion Rate", value: "+43%", trend: "up" },
      { label: "Call Volume", value: "3x", trend: "up" },
      { label: "Cost Reduction", value: "60%", trend: "down" }
    ],
    image: "/demo/sales.png",
    accentColor: "blue",
    lightColor: "#3b82f6",   // Blue-500
    darkColor: "#60a5fa",    // Blue-400
    lightBgClass: "bg-blue-50",
    darkBgClass: "dark:bg-blue-950/30",
    lightBorderClass: "border-blue-200",
    darkBorderClass: "dark:border-blue-800/40",
    lightTextClass: "text-blue-700",
    darkTextClass: "dark:text-blue-300"
  },
  {
    id: "support-agent",
    name: "Support Center",
    icon: <PhoneCall className="h-6 w-6" />,
    description: "Handle customer inquiries 24/7 with AI agents that resolve issues and escalate when needed.",
    features: [
      "Answer common questions instantly",
      "Troubleshoot technical problems",
      "Process returns and refunds",
      "Escalate to human agents when needed",
      "Multilingual support capabilities"
    ],
    stats: [
      { label: "Resolution Rate", value: "76%", trend: "up" },
      { label: "Response Time", value: "Instant", trend: "down" },
      { label: "Customer Satisfaction", value: "4.7/5", trend: "up" }
    ],
    image: "/demo/support.png",
    accentColor: "purple",
    lightColor: "#8b5cf6",   // Purple-500
    darkColor: "#a78bfa",    // Purple-400
    lightBgClass: "bg-purple-50",
    darkBgClass: "dark:bg-purple-950/30",
    lightBorderClass: "border-purple-200",
    darkBorderClass: "dark:border-purple-800/40",
    lightTextClass: "text-purple-700",
    darkTextClass: "dark:text-purple-300"
  },
  {
    id: "booking-agent",
    name: "Appointment Manager",
    icon: <Calendar className="h-6 w-6" />,
    description: "Reduce no-shows and fill your calendar with AI agents that handle scheduling and reminders.",
    features: [
      "Schedule appointments 24/7",
      "Handle rescheduling seamlessly",
      "Send automated reminders",
      "Integrate with all major calendars",
      "Collect pre-appointment information"
    ],
    stats: [
      { label: "Scheduling Time", value: "-85%", trend: "down" },
      { label: "No-shows", value: "-64%", trend: "down" },
      { label: "Calendar Utilization", value: "+37%", trend: "up" }
    ],
    image: "/demo/appointment.png",
    accentColor: "indigo",
    lightColor: "#6366f1",   // Indigo-500
    darkColor: "#818cf8",    // Indigo-400
    lightBgClass: "bg-indigo-50",
    darkBgClass: "dark:bg-indigo-950/30",
    lightBorderClass: "border-indigo-200",
    darkBorderClass: "dark:border-indigo-800/40",
    lightTextClass: "text-indigo-700",
    darkTextClass: "dark:text-indigo-300"
  },
  {
    id: "outreach-agent",
    name: "Outreach Pro",
    icon: <Users className="h-6 w-6" />,
    description: "Proactively reach potential customers with personalized calls that convert at scale.",
    features: [
      "Automated outbound calling",
      "Personalized conversations",
      "Lead scoring and qualification",
      "Seamless CRM integration",
      "Campaign performance analytics"
    ],
    stats: [
      { label: "Contact Rate", value: "+210%", trend: "up" },
      { label: "Outreach Capacity", value: "10x", trend: "up" },
      { label: "Cost Per Lead", value: "-72%", trend: "down" }
    ],
    image: "/demo/analytics.png",
    accentColor: "green",
    lightColor: "#10b981",   // Green-500
    darkColor: "#34d399",    // Green-400
    lightBgClass: "bg-green-50",
    darkBgClass: "dark:bg-green-950/30",
    lightBorderClass: "border-green-200",
    darkBorderClass: "dark:border-green-800/40",
    lightTextClass: "text-green-700",
    darkTextClass: "dark:text-green-300"
  }
];

// 3D floating element animation
const Floating3DElement = ({ accentColor, icon, label, className }: { accentColor: string, icon: React.ReactNode, label: string, className?: string }) => {
  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl shadow-lg",
        "bg-white/90 dark:bg-gray-900/80",
        "border border-gray-200/70 dark:border-gray-700/40",
        className
      )}
      whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <div
        className="rounded-full h-7 w-7 flex items-center justify-center"
        style={{
          backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
          color: accentColor
        }}
      >
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
    </motion.div>
  );
};

// Interactive particle effect component with proper light/dark adaptability
const ParticleField = ({ color }: { color: string }) => {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';

  // Adjust opacity based on theme
  const particleColor = color;
  const particleOpacity = isDarkTheme ? "0.3" : "0.15";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            backgroundColor: particleColor,
            width: Math.random() * 5 + 2,
            height: Math.random() * 5 + 2,
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            opacity: particleOpacity,
            filter: isDarkTheme ? "blur(0.5px)" : "blur(1px)"
          }}
          animate={{
            y: [null, `-${Math.random() * 300 + 100}px`],
            opacity: [0, parseFloat(particleOpacity), 0]
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            delay: Math.random() * 20
          }}
        />
      ))}
    </div>
  );
};

// Sound wave animation component with theme adaptability
const SoundWave = ({ color = "#60a5fa" }: { color?: string }) => {
  return (
    <div className="flex items-center gap-0.5 h-4">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full"
          style={{ background: color }}
          animate={{
            height: ["30%", "100%", "60%", "90%", "40%"],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

// Feature item with theme-adaptive styling
const FeatureItem = ({ feature, index, color }: { feature: string, index: number, color: string }) => (
  <motion.li
    className={cn(
      "flex items-start gap-3 px-3 py-2 rounded-lg transition-colors",
      "hover:bg-gray-50 dark:hover:bg-gray-800/30",
    )}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ x: 5 }}
  >
    <div
      className="h-6 w-6 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 border"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      <CheckCircle style={{ color: color }} className="h-4 w-4" />
    </div>
    <span className="text-gray-800 dark:text-gray-200">{feature}</span>
  </motion.li>
);

// Stat card with properly themed styling
const StatCard = ({ stat, index, color }: { stat: { label: string, value: string, trend: string }, index: number, color: string }) => (
  <motion.div
    className={cn(
      "backdrop-blur-sm border rounded-2xl p-4 text-center transition-all",
      "bg-white/70 dark:bg-gray-900/40",
      "border-gray-200/50 dark:border-gray-700/30",
      "shadow-sm hover:shadow-md"
    )}
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 + index * 0.1 }}
  >
    <div className="flex justify-center items-center gap-1.5 mb-1">
      <p className="text-2xl font-bold" style={{ color }}>{stat.value}</p>
      {stat.trend === "up" && <svg className="h-4 w-4 text-green-500 dark:text-green-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>}
      {stat.trend === "down" && <svg className="h-4 w-4 text-green-500 dark:text-green-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 7L7 17M7 17H16M7 17V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>}
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
  </motion.div>
);

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState("sales-agent");
  const activeProduct = products.find(p => p.id === activeTab) || products[0];
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Handle mouse move for spotlight effect
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(event.clientX - rect.left);
      mouseY.set(event.clientY - rect.top);
    };

    containerRef.current?.addEventListener('mousemove', handleMouseMove);
    return () => containerRef.current?.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Create spotlight effect templates
  const spotlightX = useMotionTemplate`${mouseX}px`;
  const spotlightY = useMotionTemplate`${mouseY}px`;

  // Determine colors based on the theme
  const activeColor = isDark ? activeProduct.darkColor : activeProduct.lightColor;

  return (
    <section
      id="products"
      className="py-32 relative overflow-hidden"
      ref={containerRef}
    >
      {/* Spotlight effect follows cursor */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition duration-300 lg:opacity-100"
        style={{
          background: isDark
            ? `radial-gradient(500px circle at ${spotlightX} ${spotlightY}, ${activeProduct.darkColor}10, transparent 40%)`
            : `radial-gradient(500px circle at ${spotlightX} ${spotlightY}, ${activeProduct.lightColor}10, transparent 40%)`
        }}
      />

      {/* Enhanced background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute left-0 w-1/2 h-full bg-gradient-to-r from-blue-500/5 dark:from-blue-500/10 to-transparent rounded-full blur-[150px]" />
        <div className="absolute right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/5 dark:from-purple-500/10 to-transparent rounded-full blur-[150px]" />
        <ParticleField color={activeColor} />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm mb-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            style={{
              backgroundColor: isDark ? "rgba(30, 58, 138, 0.3)" : "rgba(239, 246, 255, 0.8)",
              borderColor: isDark ? "rgba(37, 99, 235, 0.4)" : "rgba(191, 219, 254, 1)"
            }}
          >
            <Radio className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Versatile AI Voice Solutions</span>
          </motion.div>

          <motion.h2
            className="text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
              One Platform
            </span>
            {" "}
            <span className="text-gray-800 dark:text-white">Multiple AI Agents</span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Choose the AI voice agents that match your business needs or combine them for a complete solution.
          </motion.p>
        </div>

        <Tabs
          defaultValue="sales-agent"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <div className="relative flex justify-center mb-16">
            {/* Animated highlight background that follows active tab */}
            <div className="absolute inset-0 flex justify-center">
              <motion.div
                className="absolute h-full top-0 rounded-full blur-md"
                animate={{
                  left: `calc(${products.findIndex(p => p.id === activeTab) * 25}% - 2%)`,
                  width: '27%'
                }}
                transition={{ duration: 0.5 }}
                style={{
                  background: isDark
                    ? `linear-gradient(to right, ${activeProduct.darkColor}20, ${products.find(p => p.id === "support-agent")?.darkColor}20)`
                    : `linear-gradient(to right, ${activeProduct.lightColor}10, ${products.find(p => p.id === "support-agent")?.lightColor}10)`
                }}
              />
            </div>

            <TabsList
              className="p-1.5 rounded-2xl backdrop-blur-sm flex-wrap shadow-lg relative z-10 border"
              style={{
                backgroundColor: isDark ? "rgba(17, 24, 39, 0.4)" : "rgba(255, 255, 255, 0.4)",
                borderColor: isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(229, 231, 235, 0.5)"
              }}
            >
              {products.map((product) => (
                <TabsTrigger
                  key={product.id}
                  value={product.id}
                  className={cn(
                    "data-[state=active]:text-white px-6 py-3 rounded-xl",
                    "text-gray-700 dark:text-gray-300"
                  )}
                  style={
                    product.id === activeTab
                      ? { background: `linear-gradient(to right, ${product.lightColor}, #8b5cf6)` }
                      : {}
                  }
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1.5 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: product.id === activeTab
                          ? "rgba(255, 255, 255, 0.2)"
                          : isDark
                            ? `rgba(${product.accentColor === 'blue' ? '59, 130, 246' : product.accentColor === 'purple' ? '139, 92, 246' : product.accentColor === 'indigo' ? '99, 102, 241' : '34, 197, 94'}, 0.2)`
                            : `rgba(${product.accentColor === 'blue' ? '59, 130, 246' : product.accentColor === 'purple' ? '139, 92, 246' : product.accentColor === 'indigo' ? '99, 102, 241' : '34, 197, 94'}, 0.1)`
                      }}
                    >
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
              <TabsContent key={product.id} value={product.id} className="mt-0 flex justify-center">
                <motion.div
                  className="grid md:grid-cols-2 max-w-6xl gap-16 items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="space-y-8">
                    <motion.div
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm",
                        product.lightBgClass, product.darkBgClass,
                        product.lightBorderClass, product.darkBorderClass,
                        product.lightTextClass, product.darkTextClass
                      )}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {product.icon}
                      <span className="text-sm font-medium">{product.name}</span>
                    </motion.div>

                    <motion.h3
                      className="text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      Transform your {product.id.split('-')[0]} process with{" "}
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                        AI Voice
                      </span>
                    </motion.h3>

                    <motion.p
                      className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      {product.description}
                    </motion.p>

                    <ul className="space-y-1">
                      {product.features.map((feature, index) => (
                        <FeatureItem
                          key={index}
                          feature={feature}
                          index={index}
                          color={isDark ? product.darkColor : product.lightColor}
                        />
                      ))}
                    </ul>
                    <div className="grid grid-cols-3 gap-4">
                      {product.stats.map((stat, index) => (
                        <StatCard
                          key={index}
                          stat={stat}
                          index={index}
                          color={isDark ? product.darkColor : product.lightColor}
                        />
                      ))}
                    </div>

                    <div className="flex gap-4 pt-2">
                      <Link href={`/products/${product.id}`}>
                        <Button
                          className="rounded-xl px-6 py-6 text-base shadow-lg group text-white"
                          style={{
                            background: `linear-gradient(to right, ${isDark ? product.darkColor : product.lightColor}, #8b5cf6)`,
                            boxShadow: `0 10px 15px -3px ${isDark ? product.darkColor : product.lightColor}15, 0 4px 6px -4px ${isDark ? product.darkColor : product.lightColor}20`
                          }}
                        >
                          <span>Try {product.name}</span>
                          <Zap className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                        </Button>
                      </Link>
                      <Link href={`/docs/${product.id}`}>
                        <Button
                          variant="outline"
                          className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-xl px-6 py-6 text-base backdrop-blur-sm group"
                        >
                          Learn More
                          <MoveRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                    {/* Glowing effect around the image with proper theme colors */}
                    <div
                      className="absolute -inset-1 rounded-3xl blur-lg opacity-70"
                      style={{
                        background: isDark
                          ? `linear-gradient(to right, ${product.darkColor}30, #8b5cf640)`
                          : `linear-gradient(to right, ${product.lightColor}30, #8b5cf640)`
                      }}
                    ></div>

                    <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl z-10">
                      {/* Adaptive border color based on theme */}
                      <div className="absolute inset-0 border-2 rounded-3xl z-20 pointer-events-none"
                           style={{
                             borderColor: isDark ? "rgba(55, 65, 81, 0.5)" : "rgba(255, 255, 255, 0.2)"
                           }}></div>

                      <Image
                        src={product.image}
                        alt={`${product.name} dashboard`}
                        fill
                        className="object-cover"
                      />

                      {/* Overlay with noise texture and gradient */}
                      <div
                        className="absolute inset-0 mix-blend-overlay"
                        style={{
                          background: isDark
                            ? "linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2))"
                            : "linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1))"
                        }}
                      ></div>
                      <div className="absolute inset-0 opacity-20 dark:opacity-30"
                          style={{ backgroundImage: 'url("/noise.png")', backgroundRepeat: 'repeat' }}></div>

                      {/* Floating badge */}
                      {product.id === "sales-agent" && (
                        <div
                          className="absolute top-4 right-4 text-white text-sm px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 backdrop-blur-sm shadow-lg"
                          style={{
                            backgroundColor: isDark ? "rgba(34, 197, 94, 0.9)" : "rgba(22, 163, 74, 0.9)"
                          }}
                        >
                          <Award className="h-4 w-4" />
                          <span>Most Popular</span>
                        </div>
                      )}

                      {/* Status indicator with proper theme colors */}
                      <div className="absolute bottom-4 left-4 bg-black/60 dark:bg-black/80 backdrop-blur-md text-sm px-4 py-3 rounded-xl font-medium flex items-center gap-3 border shadow-lg"
                           style={{
                             borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.1)"
                           }}>
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 dark:bg-blue-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 dark:bg-blue-600"></span>
                        </div>
                        <span className="text-white">Active Agent</span>
                        <SoundWave color={isDark ? "#60a5fa" : "#3b82f6"} />
                      </div>
                    </div>


                  </motion.div>
                </motion.div>
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>

        {/* New section: AI capabilities showcase */}
        <motion.div
          className="mt-32 rounded-3xl  overflow-hidden border backdrop-blur-md relative"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          style={{
            backgroundColor: isDark ? "rgba(17, 24, 39, 0.4)" : "rgba(255, 255, 255, 0.6)",
            borderColor: isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(229, 231, 235, 0.8)"
          }}
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-20 opacity-10"></div>
            <div className="absolute -top-24 -right-20 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-32 -left-20 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[80px]"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-8 md:p-10 relative z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm"
                   style={{
                     backgroundColor: isDark ? "rgba(30, 58, 138, 0.3)" : "rgba(239, 246, 255, 0.8)",
                     borderColor: isDark ? "rgba(37, 99, 235, 0.4)" : "rgba(191, 219, 254, 1)",
                     color: isDark ? "rgb(147, 197, 253)" : "rgb(29, 78, 216)"
                   }}>
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Core Technology</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Powered by Advanced{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                  Conversational AI
                </span>
              </h3>

              <p className="text-gray-600 dark:text-gray-300">
                Our AI voice agents leverage state-of-the-art natural language processing and emotional intelligence to create human-like conversations that build rapport and drive results.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                {[
                  {
                    title: "Natural Language",
                    description: "Understands context, nuance, and industry-specific terminology",
                    icon: <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  },
                  {
                    title: "Accent Detection",
                    description: "Adapts to caller accents and speech patterns in real-time",
                    icon: <Globe className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  },
                  {
                    title: "Emotional IQ",
                    description: "Detects and responds to customer emotions appropriately",
                    icon: <BrainCircuit className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  },
                  {
                    title: "Continuous Learning",
                    description: "Improves with every conversation via machine learning",
                    icon: <BarChart2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="p-4 rounded-xl border"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    style={{
                      backgroundColor: isDark ? "rgba(31, 41, 55, 0.5)" : "rgba(255, 255, 255, 0.8)",
                      borderColor: isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(229, 231, 235, 0.8)"
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg"
                           style={{
                             backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(239, 246, 255, 0.8)",
                           }}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative h-[300px] md:h-auto">
              {/* Futuristic code visualization */}
              <motion.div
                className="absolute top-0 right-0 bottom-0 left-0 md:right-10 md:left-10 rounded-xl overflow-hidden border shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                style={{
                  backgroundColor: isDark ? "rgba(17, 24, 39, 0.9)" : "rgba(15, 23, 42, 0.95)",
                  borderColor: isDark ? "rgba(55, 65, 81, 0.5)" : "rgba(31, 41, 55, 0.5)"
                }}
              >
                <div className="flex h-9 items-center gap-2 border-b px-4"
                     style={{
                       borderColor: isDark ? "rgba(55, 65, 81, 0.5)" : "rgba(31, 41, 55, 0.5)"
                     }}>
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-gray-400">ai-voice-agent.js</p>
                  </div>
                </div>

                <div className="p-4 font-mono text-sm">
                  <CodeAnimation />
                </div>
              </motion.div>

              {/* Floating elements for visual appeal */}
              <motion.div
                className="absolute -top-5 -right-5 md:-right-10 h-20 w-20 md:h-28 md:w-28 rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200, delay: 0.5 }}
                viewport={{ once: true }}
                style={{
                  background: isDark
                    ? "conic-gradient(from 180deg at 50% 50%, #3b82f680 0deg, #8b5cf680 180deg, #10b98180 360deg)"
                    : "conic-gradient(from 180deg at 50% 50%, #3b82f650 0deg, #8b5cf650 180deg, #10b98150 360deg)"
                }}
              >
                <div className="absolute inset-1 rounded-full backdrop-blur-sm flex items-center justify-center"
                     style={{
                       backgroundColor: isDark ? "rgba(17, 24, 39, 0.7)" : "rgba(255, 255, 255, 0.7)"
                     }}>
                  <BrainCircuit className="h-10 w-10 text-violet-500 dark:text-violet-400" />
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-0 -left-5 md:-left-10 h-16 w-16 md:h-24 md:w-24 rounded-lg"
                initial={{ opacity: 0, scale: 0, rotate: -10 }}
                whileInView={{ opacity: 1, scale: 1, rotate: -10 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200, delay: 0.7 }}
                viewport={{ once: true }}
                style={{
                  backgroundColor: isDark ? "rgba(17, 24, 39, 0.7)" : "rgba(255, 255, 255, 0.7)",
                  borderWidth: 1,
                  borderColor: isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(229, 231, 235, 0.8)"
                }}

              >
                <Radio className="h-8 w-8 text-blue-500 dark:text-blue-400" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Animated code typing effect component
const CodeAnimation = () => {
  const [text, setText] = useState('');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const codeSnippet = `class AIVoiceAgent {
  constructor() {
    this.naturalLanguage = new NLP();
    this.emotionalIQ = new EmotionDetection();
    this.voiceSynthesis = new VoiceModel();
    this.learningModel = new MachineLearning();
  }

  async handleCall(customerData) {
    // Initialize conversation
    await this.voiceSynthesis.speak(
      this.generateGreeting(customerData)
    );

    // Active listening loop
    while(this.conversation.active) {
      const response = await this.naturalLanguage
        .process(this.listener.getCurrentInput());

      const emotion = this.emotionalIQ
        .analyze(response);

      await this.voiceSynthesis.speak(
        this.generateResponse(response, emotion)
      );

      // Update learning model
      this.learningModel.update(response, emotion);
    }
  }
}`;

  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      if (i < codeSnippet.length) {
        setText(codeSnippet.slice(0, i+1));
        i++;
      } else {
        clearInterval(typing);
      }
    }, 30);

    return () => clearInterval(typing);
  }, [codeSnippet]);

  // Function to add syntax highlighting
  const highlightCode = (code: string) => {
    // Simple highlighting, could be more sophisticated
    const keywords = ['class', 'constructor', 'new', 'this', 'const', 'async', 'await', 'while'];
    const methods = ['handleCall', 'speak', 'process', 'analyze', 'generateGreeting', 'generateResponse', 'update'];
    const properties = ['naturalLanguage', 'emotionalIQ', 'voiceSynthesis', 'learningModel', 'conversation', 'active', 'listener'];
    const strings = ['"', "'"];
    const comments = ['// Initialize conversation', '// Active listening loop', '// Update learning model'];

    let highlightedCode = code;

    // Highlight keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlightedCode = highlightedCode.replace(regex, `<span style="color: ${isDark ? '#ff79c6' : '#d946ef'}">${keyword}</span>`);
    });

    // Highlight methods
    methods.forEach(method => {
      const regex = new RegExp(`\\b${method}\\b`, 'g');
      highlightedCode = highlightedCode.replace(regex, `<span style="color: ${isDark ? '#50fa7b' : '#10b981'}">${method}</span>`);
    });

    // Highlight properties
    properties.forEach(prop => {
      const regex = new RegExp(`\\b${prop}\\b`, 'g');
      highlightedCode = highlightedCode.replace(regex, `<span style="color: ${isDark ? '#8be9fd' : '#3b82f6'}">${prop}</span>`);
    });

    // Highlight comments
    comments.forEach(comment => {
      highlightedCode = highlightedCode.replace(comment, `<span style="color: ${isDark ? '#6272a4' : '#6b7280'}">${comment}</span>`);
    });

    return highlightedCode;
  };

  return (
    <div className="text-green-400 dark:text-green-300 whitespace-pre-wrap overflow-auto max-h-[calc(100%-2.25rem)]">
      <div dangerouslySetInnerHTML={{ __html: highlightCode(text) }} />
      <motion.span
        animate={{ opacity: [0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
      >▋</motion.span>
    </div>
  );
};
