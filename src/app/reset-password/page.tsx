"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Separate the actual reset password component that accesses search params
import ResetPasswordForm from "@/components/auth/reset-password-form";

// UI Components
import { Card, CardContent } from "@/components/ui/card";

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

// Loading fallback component
const LoadingFallback = () => (
  <Card className="relative border border-primary/20 shadow-xl backdrop-blur-sm bg-black/30 w-full max-w-md">
    <CardContent className="pt-8 pb-6 px-8 text-center">
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading reset password form...</p>
      </div>
    </CardContent>
  </Card>
);

export default function ResetPasswordPage() {
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
          <p className="text-muted-foreground mt-2">Create a new secure password for your account</p>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Suspense fallback={<LoadingFallback />}>
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </motion.div>

      {/* Floating UI elements */}
      <div className="fixed bottom-4 right-4 z-20 flex items-center bg-background/30 backdrop-blur-lg border border-primary/20 rounded-full px-3 py-1.5 shadow-lg">
        <div className="animate-pulse mr-2">
          <div className="h-2 w-2 rounded-full bg-primary"></div>
        </div>
        <span className="text-xs font-medium text-foreground/70">Secure connection</span>
      </div>
    </div>
  );
}
