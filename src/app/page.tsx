'use client'
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/hero-section";
import { ProductShowcase } from "@/components/product-showcase";
import { DashboardPreview } from "@/components/dashboard/dashboard-preview";
import { Integrations } from "@/components/integrations";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import {
  MenuIcon,
  X,
  ChevronRight,
  Globe,
  Bot,
  BarChart,
  Headphones,
  Sparkles
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation items
  const navItems = [
    { href: "#products", label: "Products", icon: <Bot className="h-4 w-4" /> },
    { href: "#dashboard", label: "Dashboard", icon: <BarChart className="h-4 w-4" /> },
    // { href: "#pricing", label: "Pricing", icon: <Headphones className="h-4 w-4" /> },
    { href: "#integrations", label: "Integrations", icon: <Globe className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Futuristic animated background */}
      <div className="fixed inset-0 z-0">
        {/* Advanced grid with glow effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] dark:opacity-30"></div>

        {/* Radial gradients for depth */}
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-blue-600/10 dark:bg-blue-500/20 blur-[120px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-purple-600/10 dark:bg-purple-500/20 blur-[120px]"></div>
        <div className="absolute left-1/4 bottom-1/4 -z-10 m-auto h-[300px] w-[300px] rounded-full bg-violet-600/10 dark:bg-violet-500/20 blur-[100px]"></div>

        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-30 mix-blend-soft-light"
          style={{ backgroundImage: 'url("/noise.png")', backgroundRepeat: 'repeat' }}></div>
      </div>

      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
          ? "border-b border-border/40 bg-background/80 backdrop-blur-xl shadow-sm"
          : "border-b border-transparent bg-background/5 backdrop-blur-sm"
          }`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 z-10">
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/Wow.png"
                alt="Wow AI"
                width={44}
                height={44}
                className="h-11 w-auto"
              />
              <div className="absolute -top-1 -right-1">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-600"></span>
                </div>
              </div>
            </motion.div>

            <motion.span
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Wow Voice
            </motion.span>
          </Link>
          <motion.nav
            className="hidden md:flex items-center gap-6 lg:gap-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="relative text-sm text-muted-foreground hover:text-foreground transition-colors group flex items-center gap-1.5"
              >
                <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.icon}
                </span>
                <span>{item.label}</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </motion.nav>

          <div className="flex items-center gap-3">
            {/* <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <ThemeToggle />
            </motion.div> */}
            <div className="hidden sm:block">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg"
                  >
                    Login
                  </Button>
                </Link>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-lg shadow-md shadow-blue-500/20 dark:shadow-blue-500/10 flex items-center text-white gap-1">
                  <span>Get Started</span>
                  <Sparkles className="h-4 w-4 ml-1" />
                </Button>
              </Link>d
            </motion.div>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden bg-background/20 border border-border/40 rounded-lg"
                >
                  <MenuIcon className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-background/95 backdrop-blur-xl border-border/50 p-0 w-[85vw] sm:max-w-md"
              >
                <div className="flex flex-col h-full">
                  <div className="border-b border-border/40 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                        <div className="relative">
                          <Image
                            src="/Wow.png"
                            alt="Wow AI"
                            width={40}
                            height={40}
                            className="h-10 w-auto"
                          />
                          <div className="absolute -top-1 -right-1">
                            <div className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
                            </div>
                          </div>
                        </div>
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                          Wow AI
                        </span>
                      </Link>
                      <SheetClose className="rounded-full h-8 w-8 flex items-center justify-center transition-colors hover:bg-accent/50">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                      </SheetClose>
                    </div>
                    <p className="text-muted-foreground">
                      Revolutionary AI voice agents for your business
                    </p>
                  </div>

                  <div className="flex-1 overflow-auto py-6 px-6">
                    <nav className="flex flex-col gap-2">
                      {navItems.map((item, i) => (
                        <Link
                          key={i}
                          href={item.href}
                          className="flex items-center justify-between py-4 px-3 rounded-lg hover:bg-accent transition-colors group"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/5">
                              {item.icon}
                            </div>
                            <span className="text-base font-medium">{item.label}</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Link>
                      ))}
                    </nav>
                  </div>

                  <div className="border-t border-border/40 p-6 space-y-4">
                    <Link
                      href="/login"
                      className="flex items-center justify-center h-12 px-6 rounded-lg border border-border w-full hover:bg-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="flex items-center justify-center h-12 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-md shadow-blue-500/20 dark:shadow-blue-500/10 w-full transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <HeroSection />
        <ProductShowcase />
        <DashboardPreview />
        <Integrations />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
