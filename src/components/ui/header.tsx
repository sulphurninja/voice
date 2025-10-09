"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Integrations } from "@/components/integrations";
import {
  MenuIcon,
  X,
  Sun,
  Moon,
  Brain,
  BarChart,
  Globe,
  Zap,
  ArrowRight,
  Code,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/products",
    label: "Solutions",
    icon: <Brain className="h-4 w-4" />,
    description: "AI-powered voice solutions",
  },
  {
    href: "/platform",
    label: "Platform",
    icon: <BarChart className="h-4 w-4" />,
    description: "Complete voice AI platform",
  },
  {
    href: "/integrations",
    label: "Integrations",
    icon: <Globe className="h-4 w-4" />,
    description: "Connect with your tools",
  },
  {
    href: "/pricing",
    label: "Pricing",
    icon: <Zap className="h-4 w-4" />,
    description: "Simple, transparent pricing",
  },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl",
        scrolled
          ? isDark
            ? "bg-gray-950/80 border-b border-gray-700/30 shadow-lg shadow-black/20"
            : "bg-white/80 border-b border-gray-200/30 shadow-lg shadow-black/5"
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
              className={cn(
                "relative h-8 w-8 rounded-lg flex items-center justify-center",
                isDark
                  ? "bg-gradient-to-br from-blue-400 to-violet-500"
                  : "bg-gradient-to-br from-blue-600 to-violet-600"
              )}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Code className="h-4 w-4 text-white" />
            </motion.div>
            <span
              className={cn(
                "text-xl font-bold bg-clip-text text-transparent",
                isDark
                  ? "bg-gradient-to-r from-white via-gray-300 to-blue-300"
                  : "bg-gradient-to-r from-gray-900 via-gray-700 to-blue-600"
              )}
            >
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
                    "flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200",
                    "group",
                    isDark
                      ? "text-gray-300 hover:text-white hover:bg-gray-800/50"
                      : "text-gray-700 hover:text-white hover:bg-blue-600/20"
                  )}
                >
                  <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
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
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={cn(
                "h-9 w-9 rounded-full transition-colors",
                isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
              )}
            >
              {isDark ? <Sun className="h-4 w-4 text-white" /> : <Moon className="h-4 w-4 text-gray-700" />}
            </Button>

            {/* Auth Buttons */}
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "border-2 rounded-2xl transition-all hover:scale-105",
                  isDark
                    ? "border-blue-500 text-white hover:bg-blue-900/30 hover:border-blue-400"
                    : "border-blue-500 text-gray-900 hover:bg-blue-100 hover:border-blue-600"
                )}
              >
                Sign In
              </Button>
            </Link>

            <Link href="/signup">
              <Button
                size="sm"
                className={cn(
                  "rounded-2xl text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-105",
                  isDark
                    ? "bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400"
                    : "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                )}
              >
                Get Started <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "md:hidden h-9 w-9 rounded-full transition-colors",
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                )}
              >
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className={cn(
                "w-full sm:w-80 backdrop-blur-xl border-l border-gray-200 dark:border-gray-800 transition-colors",
                isDark ? "bg-gray-950/95" : "bg-white/95"
              )}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <Link href="/" className="flex items-center space-x-2">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center",
                        isDark ? "bg-gradient-to-br from-blue-400 to-violet-500" : "bg-gradient-to-br from-blue-600 to-violet-600"
                      )}
                    >
                      <Code className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xl font-bold">XSeize</span>
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
                          className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-blue-600/20 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">{item.icon}</div>
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
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
                      onClick={() => setTheme(isDark ? "light" : "dark")}
                      className="h-8 w-16 rounded-full"
                    >
                      {isDark ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                    </Button>
                  </div>

                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full" size="sm">
                      Sign In
                    </Button>
                  </Link>

                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      className={cn(
                        "w-full rounded-2xl text-white",
                        isDark
                          ? "bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400"
                          : "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                      )}
                      size="sm"
                    >
                      Get Started <ArrowRight className="ml-2 h-3 w-3" />
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
