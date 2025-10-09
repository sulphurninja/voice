"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { PhoneCall, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useTheme } from "@/components/theme-provider"; // Import useTheme

export function CTASection() {
  const { theme } = useTheme(); // Access the theme
  const isDark = theme === "dark"; // Determine if the theme is dark
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0.7, 0.9], [0, 1]);
  const y = useTransform(scrollYProgress, [0.7, 0.9], [60, 0]);

  return (
    <section
      className={`py-28 relative overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-black" : "bg-gradient-to-bl from-blue-50 via-blue-100 to-cyan-100"
      }`}
    >
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 z-0">
        <div
          className={`absolute top-0 right-0 w-3/4 h-full ${
            isDark
              ? "bg-gradient-to-bl from-blue-500/10 via-purple-500/10 to-transparent"
              : "bg-gradient-to-bl from-blue-300/10 via-purple-300/10 to-transparent"
          } rounded-[100px] blur-[120px]`}
        />
        <div
          className={`absolute bottom-0 left-0 w-3/4 h-2/3 ${
            isDark
              ? "bg-gradient-to-tr from-violet-600/10 via-indigo-500/10 to-transparent"
              : "bg-gradient-to-tr from-violet-300/10 via-indigo-300/10 to-transparent"
          } rounded-[100px] blur-[120px]`}
        />
      </div>
      <motion.div
        className="container mx-auto relative z-10"
        style={{ opacity, y }}
      >
        <div
          className={`bg-gradient-to-b ${
            isDark
              ? "from-blue-900/30 to-violet-900/30 "
              : "from-blue-300/30 to-violet-300/30"
          } rounded-[32px] overflow-hidden backdrop-blur-sm shadow-2xl shadow-purple-500/10`}
        >
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-16 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                    isDark
                      ? "text-blue-300 bg-blue-500/10 "
                      : "text-blue-600 bg-blue-300/10 "
                  } mb-4`}
                >
                  <PhoneCall className="h-4 w-4" />
                  <span className="text-sm font-medium">Setup in minutes</span>
                </div>
                <h2
                  className={`text-4xl md:text-5xl font-bold mb-6 leading-tight ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Experience the Future of{" "}
                  <span
                    className={`bg-clip-text text-transparent bg-gradient-to-r ${
                      isDark ? "from-blue-400 to-violet-400" : "from-blue-600 to-violet-600"
                    }`}
                  >
                    Voice AI
                  </span>
                </h2>
                <p
                  className={`text-xl mb-8 leading-relaxed ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Join hundreds of forward-thinking companies using our AI voice agents
                  to scale their operations and deliver exceptional experiences.
                </p>
                <div className="space-y-5 mb-10">
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-violet-500 p-0.5 rounded-full">
                      <div className="bg-black rounded-full p-1">
                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                      </div>
                    </div>
                    <span>14-day free trial, no credit card required</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-violet-500 p-0.5 rounded-full">
                      <div className="bg-black rounded-full p-1">
                        <CheckCircle2 className="h-4 w-4 text-violet-400" />
                      </div>
                    </div>
                    <span>Set up in minutes, not days or weeks</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-violet-500 p-0.5 rounded-full">
                      <div className="bg-black rounded-full p-1">
                        <CheckCircle2 className="h-4 w-4 text-purple-400" />
                      </div>
                    </div>
                    <span>Cancel anytime with no long-term contracts</span>
                  </motion.div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 py-6 px-8 rounded-xl text-base font-medium shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 group">
                      <span>Start Free Trial</span>
                      <Sparkles className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
                    </Button>
                  </Link>
                  {/* <Link href="/demo">
                    <Button variant="outline" size="lg" className="border-gray-500 text-gray-300 hover:bg-white/5 py-6 px-8 rounded-xl backdrop-blur-sm text-base font-medium group">
                      Request Demo
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link> */}
                </div>
              </motion.div>
            </div>
            <motion.div
              className="relative m-4 h-full rounded-2xl min-h-[500px]"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Image
                src="/demo/insights.png"
                alt="AI Voice Agent in action"
                fill
                className="object-cover rounded-2xl"
              />
              <motion.div
                className={`absolute top-8 right-8 ${
                  isDark
                    ? "bg-black/60 "
                    : "bg-white/60 "
                } backdrop-blur-xl p-5 rounded-2xl max-w-[240px]`}
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`h-10 w-10 rounded-xl ${
                      isDark
                        ? "bg-gradient-to-r from-green-400 to-green-500"
                        : "bg-gradient-to-r from-green-300 to-green-400"
                    } flex items-center justify-center shadow-lg`}
                  >
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div
                    className={`font-medium text-lg ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Call Successful
                  </div>
                </div>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Meeting scheduled with prospect for tomorrow at 2 PM
                </p>
              </motion.div>
              <motion.div
                className="absolute bottom-8 left-8 bg-black/60 backdrop-blur-xl  p-5 rounded-2xl max-w-[240px] hidden md:block"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="mb-3">
                  <span className="text-sm text-gray-400">Daily Calls</span>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">128</span>
                    <span className="text-green-400 text-sm font-medium">+24%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full animate-pulse"></div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
