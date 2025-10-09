"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionTemplate, useSpring } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  PlayCircle,
  BarChart3,
  Bot,
  Globe,
  Headphones,
  PhoneCall,
  Wand2,
  LucideIcon,
  Brain,
  ZapIcon,
  BadgeCheck,
  Sparkles,
  ArrowRight,
  Star,
  Users,
  Clock,
  Shield,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

// Feature badge component for the hero section
interface FeatureBadgeProps {
  icon: LucideIcon;
  text: string;
  gradient: string;
  delay?: number;
  className?: string;
}

const FeatureBadge = ({ icon: Icon, text, gradient, delay = 0, className }: FeatureBadgeProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay + 1.2, duration: 0.5 }}
    className={cn(
      "flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-md border shadow-lg hover:scale-105 transition-transform cursor-pointer group",
      "border-white/10 dark:border-gray-700/30",
      gradient,
      className
    )}
  >
    <Icon className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
    <span className="text-sm font-medium text-white">{text}</span>
  </motion.div>
);

// Audio wave animation component
const AudioWave = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-1 h-8", className)}>
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-blue-500 to-violet-400 rounded-full"
          animate={{
            height: ["20%", "80%", "40%", "90%", "30%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

// Floating particle animation
const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating geometric shapes */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/60 rounded-full"
        animate={{
          y: [-20, 20, -20],
          x: [-10, 10, -10],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/3 right-1/3 w-1 h-1 bg-violet-400/60 rounded-full"
        animate={{
          y: [20, -20, 20],
          x: [10, -10, 10],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-cyan-400/60 rounded-full"
        animate={{
          y: [-15, 15, -15],
          opacity: [0.4, 0.9, 0.4]
        }}
        transition={{ duration: 7, repeat: Infinity }}
      />
    </div>
  );
};

export function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Spring animation for smooth cursor following
  const mouseX = useSpring(0, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 300, damping: 30 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCursorPosition({ x, y });
        mouseX.set(x);
        mouseY.set(y);
      }
    };

    const element = heroRef.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      return () => element.removeEventListener('mousemove', handleMouseMove);
    }
  }, [mouseX, mouseY]);

  const spotlightX = useMotionTemplate`${mouseX}px`;
  const spotlightY = useMotionTemplate`${mouseY}px`;

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <section
      ref={heroRef}
      className={cn(
        "relative min-h-screen pt-12 flex items-center overflow-hidden transition-colors duration-300",
        isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950"
          : "bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100"
      )}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className={cn(
          "absolute inset-0 bg-[size:60px_60px] opacity-30",
          isDark
          ? "bg-[linear-gradient(to_right,rgba(75,85,99,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(75,85,99,0.3)_1px,transparent_1px)]"
          : "bg-[linear-gradient(to_right,rgba(120,130,145,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,130,145,0.4)_1px,transparent_1px)]"
        

        )} />

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/20 to-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-violet-400/20 to-pink-500/20 rounded-full blur-3xl" />

        {/* Interactive spotlight effect */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 lg:opacity-100"
          style={{
            background: isDark
              ? `radial-gradient(600px circle at ${spotlightX} ${spotlightY}, rgba(59, 130, 246, 0.1), transparent 40%)`
              : `radial-gradient(600px circle at ${spotlightX} ${spotlightY}, rgba(59, 130, 246, 0.05), transparent 40%)`
          }}
        />

        <FloatingElements />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm transition-colors",
                  isDark
                  ? "bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950"
                  : "bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100"
                )}
              >
                <Wand2 className={cn("h-4 w-4", isDark ? "text-blue-400" : "text-blue-600")} />
                <span className={cn("text-sm font-medium", isDark ? "text-blue-300" : "text-blue-700")}>
                  Revolutionary AI Technology
                </span>
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>

              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="space-y-4"
              >
                <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
                  <span className={cn("transition-colors", isDark ? "text-white" : "text-gray-900")}>
                    Voice AI That
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 dark:from-blue-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent relative">
                    Feels Human
                    <motion.div
                      className="absolute -top-2 -right-4 flex items-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, type: "spring" }}
                    >
                      <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </div>
                    </motion.div>
                  </span>
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className={cn(
                    "text-xl leading-relaxed max-w-lg transition-colors",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  Deploy intelligent voice agents that handle calls, qualify leads, and support customers with conversations so natural, they're indistinguishable from humans.
                </motion.p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white py-6 px-8 rounded-2xl text-lg shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-105 border-0 group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      Start Free Trial
                      <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-violet-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    "py-6 px-8 rounded-2xl text-lg backdrop-blur-sm transition-all hover:scale-105 group border-2",
                    isDark
                        ? "border-blue-500 text-white bg-gradient-to-r from-blue-800/70 via-violet-800/60 to-blue-900/70 hover:from-blue-700 hover:via-violet-700 hover:to-blue-800"
                        : "border-blue-500 text-white bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-600"
                  )}
                  onClick={() => setIsPlaying(true)}
                >
                  <PlayCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className={cn(
                  "flex items-center gap-6 text-sm transition-colors",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>10,000+ users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>5min setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>SOC2 compliant</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Visual */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {/* Main Demo Video/Image */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />

                <div className={cn(
                  "relative aspect-video rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl transition-colors",
                  isDark
                    ? "border border-gray-800/40 bg-gray-900/50"
                    : "border border-white/20 bg-white/10"
                )}>
                  {isPlaying ? (
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                      title="XSeize AI Voice Agent Demo"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <Image
                        src="/dashboard.png"
                        alt="XSeize AI Voice Agent Dashboard"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 flex items-center justify-center cursor-pointer group" onClick={() => setIsPlaying(true)}>
                        <motion.div
                          className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 transition-transform"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <PlayCircle className="h-10 w-10 text-white" />
                        </motion.div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Floating Stats Cards */}
              <motion.div
                className={cn(
                  "absolute -top-6 -right-6 backdrop-blur-xl p-4 rounded-2xl shadow-xl transition-colors",
                  isDark
                    ? "bg-gray-900/90 border border-gray-700/50"
                    : "bg-white/90 border border-gray-200/50"
                )}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center",
                    isDark ? "bg-green-900/30" : "bg-green-100"
                  )}>
                    <TrendingUp className={cn("h-5 w-5", isDark ? "text-green-400" : "text-green-600")} />
                  </div>
                  <div>
                    <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
                      Conversion Rate
                    </p>
                    <p className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>
                      +47%
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className={cn(
                  "absolute -bottom-6 -left-6 backdrop-blur-xl p-4 rounded-2xl shadow-xl transition-colors",
                  isDark
                    ? "bg-gray-900/90 border border-gray-700/50"
                    : "bg-white/90 border border-gray-200/50"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                whileHover={{ y: 5 }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center",
                    isDark ? "bg-blue-900/30" : "bg-blue-100"
                  )}>
                    <MessageSquare className={cn("h-5 w-5", isDark ? "text-blue-400" : "text-blue-600")} />
                  </div>
                  <div>
                    <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
                      Live Calls
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>
                        324
                      </span>
                      <AudioWave />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Feature Badges */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            <FeatureBadge
              icon={PhoneCall}
              text="24/7 Availability"
              gradient="bg-gradient-to-r from-blue-500/90 to-cyan-500/90"
              delay={0.1}
            />
            <FeatureBadge
              icon={Bot}
              text="Human-like Voice"
              gradient="bg-gradient-to-r from-indigo-500/90 to-purple-500/90"
              delay={0.2}
            />
            <FeatureBadge
              icon={Globe}
              text="20+ Languages"
              gradient="bg-gradient-to-r from-violet-500/90 to-pink-500/90"
              delay={0.3}
            />
            <FeatureBadge
              icon={BadgeCheck}
              text="99.8% Accuracy"
              gradient="bg-gradient-to-r from-green-500/90 to-emerald-500/90"
              delay={0.4}
            />
          </motion.div>

          {/* Company Logos */}
          <motion.div
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            <p className={cn(
              "text-sm font-medium mb-8 transition-colors",
              isDark ? "text-gray-400" : "text-gray-500"
            )}>
              TRUSTED BY INNOVATIVE COMPANIES
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {['Google', 'Microsoft', 'Amazon', 'Salesforce', 'Slack'].map((company, i) => (
                <motion.div
                  key={company}
                  className="relative h-8 w-24 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.7 + i * 0.1 }}
                >
                  <div className={cn(
                    "h-8 w-24 rounded opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-medium",
                    isDark
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-300 text-gray-600"
                  )}>
                    {company}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
