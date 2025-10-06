"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import {
  MenuIcon,
  X,
  Sun,
  Moon,
  ChevronDown,
  Brain,
  BarChart,
  Globe,
  Zap,
  ArrowRight,
  Sparkles,
  XCircle,
  Code
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "#products",
    label: "Solutions",
    icon: <Brain className="h-4 w-4" />,
    description: "AI-powered voice solutions"
  },
  {
    href: "#platform",
    label: "Platform",
    icon: <BarChart className="h-4 w-4" />,
    description: "Complete voice AI platform"
  },
  {
    href: "#integrations",
    label: "Integrations",
    icon: <Globe className="h-4 w-4" />,
    description: "Connect with your tools"
  },
  {
    href: "/pricing",
    label: "Pricing",
    icon: <Zap className="h-4 w-4" />,
    description: "Simple, transparent pricing"
  }
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/20 dark:border-white/10 shadow-lg shadow-black/5"
          : "bg-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-blue-300 to-black -600 dark:from-blue-500 to-black -500 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Code className="h-4 w-4 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              XSeize
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-blue-600 dark:hover:text-blue-400",
                    "text-gray-700 dark:text-gray-300 group"
                  )}
                >
                  <span className="group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === "dark" ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </motion.div>
            </Button>

            {/* Auth Buttons */}
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Sign In
              </Button>
            </Link>

            <Link href="/signup">
              <Button
                size="sm"
                className={cn(
                  "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700",
                  "dark:from-blue-500 dark:to-violet-500 dark:hover:from-blue-400 dark:hover:to-violet-400",
                  "text-white shadow-lg shadow-blue-500/25 dark:shadow-blue-900/25",
                  "hover:shadow-blue-500/40 dark:hover:shadow-blue-700/30",
                  "border-0 group relative overflow-hidden"
                )}
              >
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:w-80 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-l border-gray-200 dark:border-gray-800"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-8">
                  <Link href="/" className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xl font-bold">Xseize</span>
                  </Link>
                  <SheetClose asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetClose>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1">
                  <div className="space-y-2">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                            {item.icon}
                          </div>
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                {/* Mobile Actions */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Theme</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                      className="h-8 w-16 rounded-full"
                    >
                      {theme === "light" ? (
                        <Moon className="h-3 w-3" />
                      ) : (
                        <Sun className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full" size="sm">
                      Sign In
                    </Button>
                  </Link>

                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white"
                      size="sm"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
