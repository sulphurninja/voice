"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useMotionTemplate } from "framer-motion";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart2, PieChart, LineChart, Users, Activity, BarChart,
  Layers, Radio, Sparkles, Zap, Cpu, BrainCircuit, Wand2,
  MessageSquare, Server
} from "lucide-react";
import { useTheme } from "@/components/theme-provider"; // Import useTheme

// Dashboard tabs for preview with enhanced data
const dashboardTabs = [
  {
    id: "analytics",
    label: "Analytics",
    icon: <BarChart2 className="h-4 w-4" />,
    image: "/demo/analytics.png",
    description: "Monitor real-time performance metrics of your AI voice agents",
    color: "blue"
  },
  {
    id: "calls",
    label: "Call Logs",
    icon: <Activity className="h-4 w-4" />,
    image: "/demo/call-logs.png",
    description: "Review call transcripts with sentiment analysis and key insights",
    color: "green"
  },
  {
    id: "agents",
    label: "Agent Builder",
    icon: <BrainCircuit className="h-4 w-4" />,
    image: "/demo/sales.png",
    description: "Design and train your AI voice personas with advanced customization",
    color: "purple"
  },
  {
    id: "reporting",
    label: "Insights",
    icon: <PieChart className="h-4 w-4" />,
    image: "/demo/campaigns.png",
    description: "Generate detailed reports on agent performance and ROI metrics",
    color: "indigo"
  }
];

// Floating particle effect component with increased visibility
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-400 blur-sm"
          style={{
            height: Math.random() * 8 + 3,
            width: Math.random() * 8 + 3,
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [null, `-${Math.random() * 200 + 50}%`],
            opacity: [0, 0.7, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            delay: Math.random() * 20,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

// Animated grid background with increased visibility
const GridBackground = () => {
  const { theme } = useTheme(); // Access the theme
  const isDark = theme === "dark"; // Determine if the theme is dark

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className={`h-full w-full ${isDark
          ? "bg-[linear-gradient(to_right,rgba(140,140,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(140,140,255,0.15)_1px,transparent_1px)]"
          : "bg-[linear-gradient(to_right,rgba(120,130,145,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,130,145,0.1)_1px,transparent_1px)]"
          } bg-[size:24px_24px]`}
      ></div>
      <div
        className={`absolute bottom-0 left-0 right-0 h-1/3 ${isDark ? "bg-gradient-to-t from-black to-transparent" : "bg-gradient-to-t from-white to-transparent"
          }`}
      ></div>
    </div>
  );
};

// 3D Rotating cube for visual interest with higher contrast
const RotatingCube = ({ color = "blue" }) => {
  // Convert color name to actual color value for better control
  const colorMap = {
    blue: "rgba(59, 130, 246, 0.8)",
    violet: "rgba(139, 92, 246, 0.8)",
    indigo: "rgba(99, 102, 241, 0.8)",
    green: "rgba(34, 197, 94, 0.8)",
    borderBlue: "rgba(59, 130, 246, 1)",
    borderViolet: "rgba(139, 92, 246, 1)",
    borderIndigo: "rgba(99, 102, 241, 1)",
    borderGreen: "rgba(34, 197, 94, 1)"
  };

  const bgColor = colorMap[color as keyof typeof colorMap] || colorMap.blue;
  const borderColor = colorMap[`border${color.charAt(0).toUpperCase() + color.slice(1)}` as keyof typeof colorMap] || colorMap.borderBlue;

  return (
    <div className="perspective-[800px] h-24 w-24">
      <motion.div
        className="relative h-full w-full transform-style-3d"
        animate={{ rotateX: 360, rotateY: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {/* Front face */}
        <div className="absolute inset-0 backdrop-blur-sm transform-3d translate-z-[40px]"
          style={{ backgroundColor: bgColor, borderColor: borderColor, borderWidth: '2px' }}></div>
        {/* Back face */}
        <div className="absolute inset-0 backdrop-blur-sm transform-3d translate-z-[-40px] rotate-y-180"
          style={{ backgroundColor: bgColor, borderColor: borderColor, borderWidth: '2px' }}></div>
        {/* Right face */}
        <div className="absolute inset-0 backdrop-blur-sm transform-3d translate-x-[40px] rotate-y-90"
          style={{ backgroundColor: bgColor, borderColor: borderColor, borderWidth: '2px' }}></div>
        {/* Left face */}
        <div className="absolute inset-0 backdrop-blur-sm transform-3d translate-x-[-40px] rotate-y-[-90deg]"
          style={{ backgroundColor: bgColor, borderColor: borderColor, borderWidth: '2px' }}></div>
        {/* Top face */}
        <div className="absolute inset-0 backdrop-blur-sm transform-3d translate-y-[-40px] rotate-x-90"
          style={{ backgroundColor: bgColor, borderColor: borderColor, borderWidth: '2px' }}></div>
        {/* Bottom face */}
        <div className="absolute inset-0 backdrop-blur-sm transform-3d translate-y-[40px] rotate-x-[-90deg]"
          style={{ backgroundColor: bgColor, borderColor: borderColor, borderWidth: '2px' }}></div>
      </motion.div>
    </div>
  );
};

// Futuristic data visualization component with higher contrast
const DataViz = () => {
  return (
    <div className="flex items-center gap-1 h-14">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full opacity-100"
          style={{
            background: "linear-gradient(to top, #3b82f6, #8b5cf6)"
          }}
          animate={{
            height: ["20%", "100%", "60%", "90%", "40%", "80%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Terminal-like component with brighter text
const AIConsole = () => {
  const [text, setText] = useState('');
  const fullText = ">> Analyzing user behavior patterns\n>> Processing voice sentiment data\n>> Optimizing agent responses\n>> AI model training complete";

  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      if (i < fullText.length) {
        setText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typing);
      }
    }, 50);

    return () => clearInterval(typing);
  }, []);

  return (
    <div className="bg-black/90 p-3 rounded-lg font-mono  text-xs text-green-400 max-w-[240px] h-[140px] border border-green-500/50 overflow-hidden shadow-lg shadow-green-500/20">
      <pre className="whitespace-pre-wrap">
        {text}
        <motion.span
          animate={{ opacity: [0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        >_</motion.span>
      </pre>
    </div>
  );
};

export function DashboardPreview() {
  const { theme } = useTheme(); // Access the theme
  const isDark = theme === "dark"; // Determine if the theme is dark
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("analytics");
  const { scrollYProgress } = useScroll();
  // Increased visibility by adjusting the opacity range
  const opacity = useTransform(scrollYProgress, [0.2, 0.4], [0.3, 1]);
  const scale = useTransform(scrollYProgress, [0.2, 0.4], [0.95, 1]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Handle mouse move for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    };

    const element = containerRef.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      return () => element.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Mouse spotlight effect with increased intensity
  const spotlightX = useMotionTemplate`${mousePosition.x}px`;
  const spotlightY = useMotionTemplate`${mousePosition.y}px`;

  // Dashboard features with enhanced colors
  const features = [
    {
      title: "Real-time Analytics",
      description: "Monitor calls, conversions, and performance with live updating metrics",
      icon: <BarChart className="h-6 w-6 text-blue-400" />,
      color: "blue",
      accentIcon: <Zap className="h-5 w-5 text-blue-300" />,
      bgGradient: "from-blue-900/40 to-blue-800/30",
      borderColor: "border-blue-500/50"
    },
    {
      title: "Voice Customization",
      description: "Create custom AI voice personas with accent and tone controls",
      icon: <Radio className="h-6 w-6 text-violet-400" />,
      color: "violet",
      accentIcon: <Wand2 className="h-5 w-5 text-violet-300" />,
      bgGradient: "from-violet-900/40 to-violet-800/30",
      borderColor: "border-violet-500/50"
    },
    {
      title: "Sentiment Analysis",
      description: "Analyze caller emotions and adjust agent responses in real-time",
      icon: <MessageSquare className="h-6 w-6 text-indigo-400" />,
      color: "indigo",
      accentIcon: <BrainCircuit className="h-5 w-5 text-indigo-300" />,
      bgGradient: "from-indigo-900/40 to-indigo-800/30",
      borderColor: "border-indigo-500/50"
    },
    {
      title: "Automated Training",
      description: "Self-improving AI models that learn from each interaction",
      icon: <Cpu className="h-6 w-6 text-green-400" />,
      color: "green",
      accentIcon: <Server className="h-5 w-5 text-green-300" />,
      bgGradient: "from-green-900/40 to-green-800/30",
      borderColor: "border-green-500/50"
    }
  ];

  return (
    <section
      id="dashboard"
      className={`py-32 relative overflow-hidden transition-colors duration-300 ${isDark ?
        "bg-black" :
        "bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-200"
        }`}
      ref={containerRef}
    >
      {/* Enhanced background with more vibrant colors */}
      <div className="absolute inset-0 z-0">
        <div
          className={`absolute top-1/3 right-1/4 w-[600px] h-[600px] ${isDark ? "bg-blue-600/20" : "bg-blue-300/10"
            } rounded-full blur-[100px]`}
        />
        <div
          className={`absolute bottom-1/3 left-1/4 w-[600px] h-[600px] ${isDark ? "bg-purple-600/20" : "bg-purple-300/10"
            } rounded-full blur-[100px]`}
        />
        <GridBackground />
        <FloatingParticles />

        {/* Interactive spotlight effect with increased brightness */}
        <motion.div
          className="pointer-events-none absolute -inset-px z-10 opacity-0 transition duration-300 lg:opacity-40"
          style={{
            background: `radial-gradient(600px circle at ${spotlightX} ${spotlightY}, rgba(111, 76, 255, 0.3), transparent 40%)`,
          }}
        />
      </div>

      <motion.div
        className="container max-w-6xl mx-auto relative z-10"
        style={{ scale, opacity }}
      >
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-violet-300 bg-violet-500/30 border border-violet-500/50 mb-6 shadow-lg shadow-violet-500/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Sparkles className="h-4 w-4" />
            <span className={`text-sm font-medium ${isDark ? "text-white" : "text-black"}`}>AI-Powered Interface</span>
          </motion.div>

          <motion.h2
            className={`text-4xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"
              }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <span
              className={`bg-clip-text text-transparent bg-gradient-to-r ${isDark ? "from-blue-400 to-violet-400" : "from-blue-600 to-violet-600"
                }`}
            >
              Mission Control
            </span>{" "}
            <span>For Your Voice AI</span>
          </motion.h2>

          <motion.p
            className={`text-xl leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"
              }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Manage all your AI voice agents from a single intuitive interface with advanced analytics, real-time monitoring, and powerful customization tools.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="md:col-span-2 relative"
          >
            {/* 3D-styled decorative elements */}
            <div className="absolute -left-16 -top-12 opacity-80 hidden xl:block">
              <RotatingCube color={
                activeTab === "analytics" ? "blue" :
                  activeTab === "calls" ? "green" :
                    activeTab === "agents" ? "purple" : "indigo"
              } />
            </div>

            <div className="absolute -right-16 -bottom-12 opacity-80 hidden xl:block">
              <RotatingCube color={
                activeTab === "analytics" ? "indigo" :
                  activeTab === "calls" ? "blue" :
                    activeTab === "agents" ? "green" : "purple"
              } />
            </div>

            <Tabs
              defaultValue="analytics"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList
                className={`flex justify-center max-w-fit mx-auto mb-6 p-1.5 rounded-xl 
              backdrop-blur-sm border shadow-lg
              ${isDark ? "bg-black/30 border-white/20" : "bg-white/30 border-gray-200/30"}`}
              >
                {dashboardTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-violet-600 data-[state=active]:text-white rounded-lg px-5 py-3 text-gray-300"
                  >
                    <div className={`flex items-center gap-2 ${isDark ? "text-white" : "text-black"}`}>
                      {tab.icon}
                      <span>{tab.label}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              <AnimatePresence mode="wait">
                {dashboardTabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="mt-0 relative">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Glowing border effect with increased intensity */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/50 to-violet-500/50 rounded-2xl blur-md"></div>

                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-gray-900/90">
                        {/* Terminal window in corner for effect */}
                        <div className="absolute  top-6 right-6 z-20">
                          <AIConsole />
                        </div>
                        <Image
                          src={tab.image}
                          alt={`${tab.label} dashboard view`}
                          fill
                          className="object-cover opacity-90"
                        />

                        {/* Holographic overlay with adjusted opacity */}
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 via-transparent to-gray-900/70"></div>

                        {/* Grid overlay with increased visibility */}
                        <div className="absolute inset-0 opacity-30"
                          style={{ backgroundImage: 'url("/grid-pattern.svg")', backgroundSize: '50px 50px' }}></div>

                        <div className="absolute inset-0 flex items-end">
                          <div className="p-8 w-full">
                            <motion.div
                              className="bg-black/80 backdrop-blur-xl rounded-xl p-5 border border-white/20 max-w-lg shadow-lg"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <h3 className="text-2xl font-bold mb-3 flex items-center gap-3 text-white">
                                <div className={`p-2 rounded-lg bg-${tab.color}-500/30 border border-${tab.color}-500/50 shadow-md shadow-${tab.color}-500/20`}>
                                  {tab.icon}
                                </div>
                                <span>{tab.label}</span>
                              </h3>
                              <p className="text-gray-300">{tab.description}</p>
                            </motion.div>
                          </div>
                        </div>

                        {/* Live status indicator with brighter colors */}
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-2 rounded-full border border-white/20 shadow-lg">
                          <div className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                          </div>
                          <span className="text-xs font-medium text-white">Live Data</span>
                        </div>
                        {/* Data visualization element with increased size */}
                        <div className="absolute bottom-24 left-8 bg-black/70 backdrop-blur-md p-3 rounded-xl border border-white/20 hidden md:block shadow-lg">
                          {/* <DataViz /> */}
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>
                ))}
              </AnimatePresence>
            </Tabs>
          </motion.div>

          <div className="flex flex-col gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`relative rounded-2xl p-6 border ${isDark
                    ? `bg-gray-900/90 border-gray-700/50 text-white`
                    : `bg-white border-gray-200/50 text-gray-900`
                  } shadow-lg`}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                whileHover={{
                  scale: 1.03,
                  boxShadow: `0 0 20px 0 rgba(${feature.color === 'blue' ? '56, 189, 248' :
                    feature.color === 'violet' ? '139, 92, 246' :
                      feature.color === 'indigo' ? '99, 102, 241' : '34, 197, 94'}, 0.25)`
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-xl p-3.5 flex-shrink-0 border ${feature.color === "blue"
                      ? "border-blue-500/50 bg-blue-500/10"
                      : feature.color === "violet"
                        ? "border-violet-500/50 bg-violet-500/10"
                        : feature.color === "indigo"
                          ? "border-indigo-500/50 bg-indigo-500/10"
                          : "border-green-500/50 bg-green-500/10"
                    } shadow-sm`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold mb-2`}>
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Minimal accent icon */}
                <motion.div
                  className={`absolute -right-3 -bottom-3 h-10 w-10 rounded-full flex items-center justify-center ${feature.color === "blue"
                      ? "bg-blue-500/20 border-blue-500/50"
                      : feature.color === "violet"
                        ? "bg-violet-500/20 border-violet-500/50"
                        : feature.color === "indigo"
                          ? "bg-indigo-500/20 border-indigo-500/50"
                          : "bg-green-500/20 border-green-500/50"
                    }`}
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 4, -4, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 1,
                  }}
                >
                  {feature.accentIcon}
                </motion.div>

                {/* Subtle highlight on hover */}
                {hoveredFeature === index && (
                  <motion.div
                    className={`absolute inset-0 border-2 rounded-2xl pointer-events-none ${feature.color === "blue"
                        ? "border-blue-400/50"
                        : feature.color === "violet"
                          ? "border-violet-400/50"
                          : feature.color === "indigo"
                            ? "border-indigo-400/50"
                            : "border-green-400/50"
                      }`}
                    layoutId="featureHighlight"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.div>
            ))}
          </div>

        </div>

        {/* Mobile preview with enhanced effects and brightness */}
        <div className="flex justify-center">
          <motion.div
            className="relative max-w-[300px]"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, type: "spring" }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
          >
            {/* Holo effect behind phone with increased brightness */}
            <div className="absolute -inset-3 bg-gradient-to-r from-blue-600/40 to-violet-600/40 rounded-[40px] blur-lg opacity-80 animate-pulse-slow"></div>

            {/* Orbit elements with increased size and brightness */}
            <motion.div
              className="absolute h-5 w-5 rounded-full bg-blue-500 blur-sm"
              animate={{
                x: [0, 100, 0, -100, 0],
                y: [0, 100, 200, 100, 0],
                opacity: [1, 0.8, 0.6, 0.8, 1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            <motion.div
              className="absolute h-4 w-4 rounded-full bg-violet-500 blur-sm right-0"
              animate={{
                x: [0, -70, 0, 70, 0],
                y: [0, 70, 140, 70, 0],
                opacity: [1, 0.7, 0.5, 0.7, 1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative h-[400px]">
              <Image
                src="/phone-mockup.png"
                alt="Mobile dashboard"
                width={300}
                height={600}
                className="relative h-[620px] z-10"
              />
              <div className="absolute top-[6%] h-[580px] w-[265px] left-[6%] right-[11%] bottom-[12%] overflow-hidden rounded-[22px] z-[100]">
                <Image
                  src="/mobile.png"
                  alt="Mobile interface"
                  fill
                  className="object-cover h-[] object-center"
                />

                {/* Scanner effect animation with increased brightness */}
                <motion.div
                  className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-blue-500/40 to-transparent blur-sm"
                  animate={{ top: ["100%", "0%", "100%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
                />

                {/* Overlay effects with reduced opacity */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
                <div className="absolute inset-0 opacity-40"
                  style={{ backgroundImage: 'url("/grid-pattern.svg")', backgroundSize: '15px 15px' }}></div>

                {/* Live status indicator with increased contrast */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20 scale-75 shadow-md">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  <span className="text-xs font-medium text-white">Live</span>
                </div>

                {/* Interface elements with increased contrast */}
                <div className="absolute bottom-24 left-4 right-4">
                  <div className="bg-black/80 backdrop-blur-md rounded-lg p-2.5 border border-white/20 shadow-lg">
                    <div className="flex justify-between items-center">
                      <div className="text-xs">
                        <div className="font-medium text-white">Call Analytics</div>
                        <div className="text-green-400 text-[10px] font-medium">+32% this week</div>
                      </div>
                      <div className="h-10 w-16">
                        <DataViz />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glowing dot on home button with increased brightness */}
              <div className="absolute bottom-[6%] left-1/2 transform -translate-x-1/2 h-3 w-3 bg-blue-400 rounded-full animate-pulse shadow-md shadow-blue-500/50 z-20"></div>
            </div>

            <div className="relative flex  justify-center mt-56">
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white bg-black/70 mb-4 backdrop-blur-md border border-white/20 text-xs shadow-lg"
                animate={{
                  boxShadow: ['0 0 0 rgba(0, 0, 255, 0)', '0 0 15px rgba(90, 60, 255, 0.5)', '0 0 0 rgba(0, 0, 255, 0)']
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Radio className="h-3 w-3 text-blue-400" />
                <span>Control your AI voice agents anywhere</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

      </motion.div>
    </section>
  );
}
