"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Eye, EyeOff, ArrowRight,
  Mail, Lock, AlertCircle, Mic, Sparkles,
  Waves, BrainCircuit,
  Volume
} from "lucide-react";

// UI Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Form schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, error, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isVoiceAssistActive, setIsVoiceAssistActive] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [soundWaveActive, setSoundWaveActive] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Clear form error when form changes
  useEffect(() => {
    const subscription = form.watch(() => setFormError(null));
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setFormError(err.message || "An error occurred during login");
    }
  };

  // Simulated voice assistant
  const toggleVoiceAssist = () => {
    setIsVoiceAssistActive(true);
    setSoundWaveActive(true);

    // Reset voice text
    setVoiceText("");

    // Simulate listening...
    const messages = [
      "Listening...",
      "Processing voice...",
      "I heard you want to sign in...",
      "Please proceed with your credentials."
    ];

    // Simulate typing effect
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < messages.length) {
        setVoiceText(messages[i]);
        i++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setSoundWaveActive(false);
          setTimeout(() => setIsVoiceAssistActive(false), 2000);
        }, 1000);
      }
    }, 1200);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Particle effect (simulate AI/tech particles)
  const ParticleBackground = () => {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0, 1, 0],
              scale: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 7,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    );
  };

  const SoundWave = () => {
    return (
      <div className="flex items-center justify-center gap-0.5 h-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <motion.div
            key={index}
            className="w-0.5 bg-primary rounded-full"
            animate={{
              height: soundWaveActive
                ? [4, 12 + Math.random() * 8, 4]
                : 4,
            }}
            transition={{
              duration: 0.6,
              repeat: soundWaveActive ? Infinity : 0,
              repeatType: "reverse",
              delay: index * 0.05,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background/95 to-background z-0">
        <ParticleBackground />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-[120px] opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500/20 rounded-full filter blur-[120px] opacity-50"></div>
      </div>

      <motion.div
        className="max-w-md w-full space-y-8 relative z-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="text-center">
          <Link href="/" className="inline-block">
            <motion.div
              className="flex items-center justify-center mb-4 relative"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />

            </motion.div>
          </Link>
          <motion.h1
            className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500"
            animate={{
              backgroundPosition: ['0% center', '100% center'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            style={{ backgroundSize: '200%' }}
          >
            Welcome to Wow Voice
          </motion.h1>
          <p className="text-muted-foreground mt-2">Experience the future of voice AI technology</p>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="relative border border-primary/20 shadow-xl backdrop-blur-sm bg-black/30">
            {/* Decorative gradient accents */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/30 to-transparent rounded-full filter blur-2xl opacity-20 -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-500/30 to-transparent rounded-full filter blur-2xl opacity-20 -z-10 transform -translate-x-1/2 translate-y-1/2"></div>

            <CardHeader className="space-y-1 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  <span>Sign in</span>
                </CardTitle>
                <motion.button
                  className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleVoiceAssist}
                >
                  <Mic className="h-4 w-4" />
                </motion.button>
              </div>
              <CardDescription>
                Access your AI voice dashboard
              </CardDescription>
            </CardHeader>

            {/* Voice assistant popup */}
            <AnimatePresence>
              {isVoiceAssistActive && (
                <motion.div
                  className="mx-6 mb-2"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <Waves className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Voice Assistant</span>
                    </div>
                    <p className="text-sm text-foreground/80 mb-2">{voiceText}</p>
                    <div className="flex justify-center">
                      <SoundWave />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <CardContent>
              {(error || formError) && (
                <Alert variant="destructive" className="mb-6 border-red-500/20 bg-red-500/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error || formError}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="you@example.com"
                              className="pl-10 bg-background/50 border-primary/20 focus:border-primary focus-visible:ring-1 focus-visible:ring-primary transition-all"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-foreground/80">Password</FormLabel>
                          <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/90 hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              className="pl-10 pr-10 bg-background/50 border-primary/20 focus:border-primary focus-visible:ring-1 focus-visible:ring-primary transition-all"
                              placeholder="••••••••"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:text-primary hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full relative overflow-hidden group bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500"
                      disabled={loading}
                    >
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: ['100%'] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear",
                          repeatDelay: 0.5
                        }}
                      />
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <div className="flex items-center">
                          <span>Sign in</span>
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          <Sparkles className="ml-1 h-3 w-3 opacity-70" />
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t border-primary/20 p-6 backdrop-blur-sm bg-black/10">
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary font-medium hover:underline hover:text-primary/80 transition-colors">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp} className="text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-1">
            <Volume className="h-3 w-3 text-primary/80" />
            <span>Powered by Wow&apos;s advanced voice AI technology</span>
          </div>
          <div className="mt-2">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline transition-colors">
              Privacy Policy
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating UI elements */}
      <div className="fixed bottom-4 right-4 z-20 flex items-center bg-background/30 backdrop-blur-lg border border-primary/20 rounded-full px-3 py-1.5 shadow-lg">
        <div className="animate-pulse mr-2">
          <div className="h-2 w-2 rounded-full bg-primary"></div>
        </div>
        <span className="text-xs font-medium text-foreground/70">Voice AI active</span>
      </div>
    </div>
  );
}
