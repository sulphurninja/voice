"use client";

import Image from "next/image";
import { Github, Twitter, Linkedin, Youtube } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme-provider"; // Import useTheme

export function Footer() {
  const { theme } = useTheme(); // Access the theme
  const isDark = theme === "dark"; // Determine if the theme is dark

  return (
    <footer
      className={`py-12 transition-colors duration-300 ${
        isDark ? "bg-gray-800 border-gray-800" : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 z-10">
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute -top-1 -right-1">
                  <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-600"></span>
                  </div>
                </div>
              </motion.div>

              <motion.span
                className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${
                  isDark
                    ? "from-blue-400 to-violet-400"
                    : "from-blue-600 to-violet-600"
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Xseize
              </motion.span>
            </Link>
            <p
              className={`p-4 max-w-xl text-center md:text-left ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Transforming business communications with AI-powered voice agents
              that sound human.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-3">
              <h3
                className={`font-semibold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Product
              </h3>
              <a
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Features
              </a>
              <a
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Pricing
              </a>
              <a
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                API
              </a>
              <a
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Integrations
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <h3
                className={`font-semibold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Company
              </h3>
              <a
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                About
              </a>
              <a
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Blog
              </a>
              <a
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Careers
              </a>
              <a
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Contact
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <h3
                className={`font-semibold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Legal
              </h3>
              <a
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Privacy
              </a>
              <a
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Terms
              </a>
              <a
                href="#"
                className={`hover:text-blue-500 transition-colors ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Security
              </a>
            </div>
          </div>
        </div>

        <div
          className={`flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <p
            className={`text-sm ${
              isDark ? "text-gray-500" : "text-gray-700"
            }`}
          >
            © {new Date().getFullYear()} Xseize. All rights reserved.
          </p>

          <div className="flex gap-6 mt-4 md:mt-0">
            <a
              href="#"
              className={`hover:text-blue-500 transition-colors ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <Twitter size={20} />
            </a>
            <a
              href="#"
              className={`hover:text-blue-500 transition-colors ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <Linkedin size={20} />
            </a>
            <a
              href="#"
              className={`hover:text-blue-500 transition-colors ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <Github size={20} />
            </a>
            <a
              href="#"
              className={`hover:text-blue-500 transition-colors ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <Youtube size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}