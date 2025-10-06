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
import { motion, AnimatePresence } from "framer-motion";
import {
  MenuIcon,
  X,
  ChevronRight,
  Globe,
  Brain,
  BarChart,
  Zap,
  ArrowRight
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Header } from "@/components/ui/header";
import ElevenLabsWidget from "@/components/ElevenLabsWidget";

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

  const navItems = [
    { href: "#products", label: "Solutions", icon: <Brain className="h-4 w-4" /> },
    { href: "#platform", label: "Platform", icon: <BarChart className="h-4 w-4" /> },
    { href: "#integrations", label: "Integrations", icon: <Globe className="h-4 w-4" /> },
    { href: "/pricing", label: "Pricing", icon: <Zap className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Premium dark background with subtle patterns */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[500px] w-[500px] rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-[150px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 blur-[120px]"></div>
      </div>
      <Header />
      <ElevenLabsWidget />
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
