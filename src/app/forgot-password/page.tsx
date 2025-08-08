"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, ArrowRight,
  Mail, AlertCircle, Sparkles,
  BrainCircuit, KeyRound, ArrowLeftCircle
} from "lucide-react";
import { toast } from "sonner";

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

// Form schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Clear form error when form changes
  useEffect(() => {
    const subscription = form.watch(() => setFormError(null));
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    setIsLoading(true);
    setFormError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      if (response.ok) {
        setEmailSent(true);
        toast.success('If your email is registered, you will receive reset instructions.');
      } else {
        const responseData = await response.json();
        setFormError(responseData.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setFormError('An error occurred. Please try again later.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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

  // Render success state
  if (emailSent) {
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
                <Image
                  src="/logo.png"
                  alt="Wow AI"
                  width={48}
                  height={48}
                  className="h-10 w-auto relative z-10"
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
              Email Sent
            </motion.h1>
            <p className="text-muted-foreground mt-2">Check your inbox for reset instructions</p>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="relative border border-primary/20 shadow-xl backdrop-blur-sm bg-black/30">
              {/* Decorative gradient accents */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/30 to-transparent rounded-full filter blur-2xl opacity-20 -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-500/30 to-transparent rounded-full filter blur-2xl opacity-20 -z-10 transform -translate-x-1/2 translate-y-1/2"></div>

              <CardContent className="pt-8 pb-6 px-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Check your email</h3>
                <p className="text-muted-foreground mb-6">
                  We've sent password reset instructions to{" "}
                  <span className="text-foreground font-medium">{form.getValues().email}</span>
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => router.push('/login')}
                    className="w-full relative overflow-hidden group"
                    variant="outline"
                  >
                    <ArrowLeftCircle className="mr-2 h-4 w-4" />
                    Return to login
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp} className="text-center text-sm text-muted-foreground">
            <p>Didn't receive an email? Check your spam folder or try again.</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Render form state
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
              <Image
                src="/logo.png"
                alt="Wow AI"
                width={48}
                height={48}
                className="h-10 w-auto relative z-10"
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
            Reset Your Password
          </motion.h1>
          <p className="text-muted-foreground mt-2">We'll send you a link to reset your password</p>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="relative border border-primary/20 shadow-xl backdrop-blur-sm bg-black/30">
            {/* Decorative gradient accents */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/30 to-transparent rounded-full filter blur-2xl opacity-20 -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-500/30 to-transparent rounded-full filter blur-2xl opacity-20 -z-10 transform -translate-x-1/2 translate-y-1/2"></div>

            <CardHeader className="space-y-1 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" />
                  <span>Forgot Password</span>
                </CardTitle>
              </div>
              <CardDescription>
                Enter your email to receive a reset link
              </CardDescription>
            </CardHeader>

            <CardContent>
              {formError && (
                <Alert variant="destructive" className="mb-6 border-red-500/20 bg-red-500/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
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

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full relative overflow-hidden group bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500"
                      disabled={isLoading}
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
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <div className="flex items-center">
                          <span>Send Reset Link</span>
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
                Remember your password?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline hover:text-primary/80 transition-colors">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp} className="text-center text-sm text-muted-foreground">
          <div className="mt-2">
            Need an account?{" "}
            <Link href="/register" className="text-primary hover:underline transition-colors">
              Sign up
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
