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
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

// Feature badge component for the hero section
interface FeatureBadgeProps {
  icon: LucideIcon;
  text: string;
  color: string;
  delay?: number;
  className?: string;
}

const FeatureBadge = ({ icon: Icon, text, color, delay = 0, className }: FeatureBadgeProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay + 1.2, duration: 0.5 }}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border shadow-lg",
      `bg-${color}-500/10 border-${color}-500/30 shadow-${color}-500/10 dark:bg-${color}-950/30 dark:border-${color}-800/40 dark:shadow-${color}-900/10`,
      className
    )}
  >
    <Icon className={`h-4 w-4 text-${color}-500 dark:text-${color}-400`} />
    <span className="text-sm text-foreground">{text}</span>
  </motion.div>
);

// Audio wave animation component with support for both modes
const AudioWave = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-1 h-12", className)}>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 bg-gradient-to-t from-blue-500 to-violet-500 dark:from-blue-400 dark:to-violet-400 rounded-full"
          animate={{
            height: ["40%", "90%", "60%", "100%", "50%", "70%"],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

// Particle animation for futuristic effect
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-500/60 dark:bg-blue-400/60"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            filter: "blur(1px)"
          }}
          animate={{
            y: [0, -1000],
            opacity: [0, 0.8, 0]
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

export function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Spring animation for smooth cursor following
  const mouseX = useSpring(0, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 300, damping: 30 });

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

  // Generate the spotlight gradient for both light and dark modes
  const spotlightX = useMotionTemplate`${mouseX}px`;
  const spotlightY = useMotionTemplate`${mouseY}px`;

  return (
    <section ref={heroRef} className="py-20 relative overflow-hidden">
      {/* Interactive spotlight effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition duration-300 lg:opacity-100"
        style={{
          background: isDark
            ? `radial-gradient(600px circle at ${spotlightX} ${spotlightY}, rgba(101, 125, 225, 0.15), transparent 40%)`
            : `radial-gradient(600px circle at ${spotlightX} ${spotlightY}, rgba(79, 70, 229, 0.1), transparent 40%)`
        }}
      />

      {/* Animated particles background */}
      <div className="absolute inset-0 z-0">
        <ParticleBackground />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-[120px]" />
      </div>
      <div className="container mx-auto relative z-20">
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-blue-700 dark:text-blue-300 bg-blue-600/80 dark:bg-blue-900/90 border border-blue-200 dark:border-blue-800/40 backdrop-blur-sm mb-8 shadow-sm"
          >
            <Wand2 className="h-4 w-4" />
            <span className="text-sm font-medium text-white">Revolutionary Voice AI Technology</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight"
          >
            <div className="relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                Voice AI
              </span>
              <div className="absolute -top-1 -right-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 dark:bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500 dark:bg-violet-400"></span>
                </div>
              </div>
            </div>
            <br />
            <span className="text-foreground">That Feels Human</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Deploy intelligent voice agents that handle calls, qualify leads, and support customers
            with conversations so natural, they're indistinguishable from humans.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 dark:from-blue-600 dark:to-violet-600 dark:hover:from-blue-500 dark:hover:to-violet-500 py-7 px-8 rounded-2xl text-lg shadow-lg shadow-blue-500/20 dark:shadow-blue-900/30 transition-all hover:shadow-blue-500/30 dark:hover:shadow-blue-700/40 group"
              >
                <span className="text-white">Start Free Trial</span>
                <Sparkles className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-border text-foreground bg-background/50 dark:bg-background/20 hover:bg-accent py-7 px-8 rounded-2xl text-lg backdrop-blur-sm transition-all group"
              onClick={() => setIsPlaying(true)}
            >
              <PlayCircle className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              <span>Watch Demo</span>
            </Button>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 mt-14">
            <AnimatePresence>
              <FeatureBadge
                icon={PhoneCall}
                text="24/7 Availability"
                color="blue"
                delay={0.1}
                className="hover:scale-105 transition-transform"
              />
              <FeatureBadge
                icon={Bot}
                text="Human-like Voice"
                color="indigo"
                delay={0.2}
                className="hover:scale-105 transition-transform"
              />
              <FeatureBadge
                icon={Globe}
                text="20+ Languages"
                color="violet"
                delay={0.3}
                className="hover:scale-105 transition-transform"
              />
              <FeatureBadge
                icon={BadgeCheck}
                text="99.8% Accuracy"
                color="green"
                delay={0.4}
                className="hover:scale-105 transition-transform"
              />
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className="relative mt-20 max-w-5xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Glass morphism card effect for the video player */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-violet-600/30 dark:from-blue-500/20 dark:to-violet-500/20 rounded-3xl blur-md"></div>

          <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-200/20 dark:border-white/10 shadow-2xl shadow-blue-500/10 dark:shadow-blue-900/20">
            {isPlaying ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="AI Voice Agent Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <Image
                  src="/dashboard.png"
                  alt="AI Voice Agent Dashboard"
                  fill
                  className="object-contain"
                />
                {/* Gradient overlay with futuristic grid */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 dark:from-black/60 dark:via-black/30 dark:to-black/60 group">
                  {/* Grid overlay pattern */}
                  <div className="absolute inset-0 opacity-20 dark:opacity-30"
                      style={{ backgroundImage: 'url("/grid-pattern.svg")', backgroundSize: '50px 50px' }}></div>

                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer transition-all group-hover:bg-black/20 dark:group-hover:bg-black/40"
                    onClick={() => setIsPlaying(true)}
                  >
                    <motion.div
                      className="h-24 w-24 rounded-full bg-white/10 dark:bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 transition-all group-hover:scale-110 shadow-xl"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <PlayCircle className="h-12 w-12 text-white" />
                    </motion.div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Dashboard floating elements with glass morphism */}
          <motion.div
            className="absolute -right-8 -top-8 md:top-12 bg-white/10 dark:bg-black/70 backdrop-blur-xl border border-slate-200/30 dark:border-white/10 p-5 rounded-2xl shadow-xl hidden md:block"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100/30 dark:bg-green-500/20 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white -foreground">Conversion Rate</p>
                <p className="text-lg font-bold text-white">+45%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute -left-8 -bottom-8 md:bottom-12 bg-white/10 dark:bg-black/70 backdrop-blur-xl border border-slate-200/30 dark:border-white/10 p-5 rounded-2xl shadow-xl hidden md:block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            whileHover={{ y: 5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100/30 dark:bg-blue-500/20 flex items-center justify-center">
                <Headphones className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white -foreground">256 Calls In Progress</p>
                <AudioWave />
              </div>
            </div>
          </motion.div>

          {/* Bottom floating AI brain visual */}
          {/* <motion.div
            className="absolute bottom-1/4 right-1/4 hidden xl:block"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, duration: 0.8, type: "spring" }}
          >
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full bg-violet-500/20 dark:bg-violet-500/30 animate-ping opacity-50"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/80 to-violet-500/80 dark:from-blue-400/60 dark:to-violet-500/60 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div> */}

          {/* Zap animation on left side */}
          {/* <motion.div
            className="absolute top-1/3 left-[5%] hidden xl:block"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.8, type: "spring" }}
          >
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full bg-amber-500/20 dark:bg-amber-500/30 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/80 to-orange-500/80 dark:from-amber-400/60 dark:to-orange-500/60 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <ZapIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div> */}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <p className="text-sm font-medium text-muted-foreground mb-6">TRUSTED BY INNOVATIVE COMPANIES</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {['google', 'microsoft', 'amazon', 'salesforce', 'slack'].map((company, i) => (
              <motion.div
                key={company}
                className="relative h-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7 + i * 0.1 }}
              >
                <Image
                  src={`/logos/${company}.webp`}
                  alt={company}
                  width={120}
                  height={40}
                  className="h-full w-auto object-contain opacity-60 dark:opacity-50 hover:opacity-100 dark:hover:opacity-80 transition-opacity saturate-0 hover:saturate-100"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
