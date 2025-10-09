"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const FloatingElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/40 rounded-full"
      animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration: 6, repeat: Infinity }}
    />
    <motion.div
      className="absolute top-1/3 right-1/3 w-1 h-1 bg-violet-400/40 rounded-full"
      animate={{ y: [20, -20, 20], x: [10, -10, 10], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 8, repeat: Infinity }}
    />
    <motion.div
      className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-cyan-400/40 rounded-full"
      animate={{ y: [-15, 15, -15], opacity: [0.4, 0.9, 0.4] }}
      transition={{ duration: 7, repeat: Infinity }}
    />
  </div>
);

export function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const socialLinks = [
    { icon: Linkedin, href: "https://linkedin.com/", label: "LinkedIn" },
    { icon: Github, href: "https://github.com/", label: "GitHub" },
    { icon: Mail, href: "mailto:contact@xseize.ai", label: "Email" },
  ];

  const linkSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/pricing" },
        { name: "API", href: "/api" },
        { name: "Integrations", href: "/Integrations" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact-form" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Terms of Use", href: "/terms-of-use" },
        { name: "Security", href: "/security" },
      ],
    },
  ];

  return (
    <footer
      className={cn(
        "relative border-t transition-colors duration-300 py-14 mt-20 overflow-hidden",
        isDark
          ? "border-gray-800 bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950"
          : "border-gray-300 bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100"
      )}
    >
      {/* Floating Elements */}
      <FloatingElements />

      {/* Subtle grid overlay (like hero) */}
      <div
        className={cn(
          "absolute inset-0 bg-[size:60px_60px] opacity-20 pointer-events-none",
          isDark
            ? "bg-[linear-gradient(to_right,rgba(75,85,99,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(75,85,99,0.2)_1px,transparent_1px)]"
            : "bg-[linear-gradient(to_right,rgba(120,130,145,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,130,145,0.2)_1px,transparent_1px)]"
        )}
      />

      <div className="relative container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
          {/* Brand Section */}
          <motion.div
            className="flex flex-col items-center md:items-start text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
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

      {/* Subtle grid overlay (like hero) */}
      <div
        className={cn(
          "absolute inset-0 bg-[size:60px_60px] opacity-20 pointer-events-none",
          isDark
            ? "bg-[linear-gradient(to_right,rgba(75,85,99,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(75,85,99,0.2)_1px,transparent_1px)]"
            : "bg-[linear-gradient(to_right,rgba(120,130,145,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,130,145,0.2)_1px,transparent_1px)]"
        )}
      />

      <div className="relative container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
          {/* Brand Section */}
          <motion.div
            className="flex flex-col items-center md:items-start text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="flex items-center gap-3 mb-3">
              <Image
                src="/logo.png"
                alt="Xseize Logo"
                width={46}
                height={46}
                className="rounded-xl shadow-md"
              />
            </Link>
            <p className={cn("max-w-md", isDark ? "text-gray-400" : "text-gray-600")}>
              Transforming business communications with AI-powered voice agents that sound human.
            </p>
          </motion.div>

          {/* Links Section */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-center md:text-left">
            {linkSections.map((section) => (
              <div key={section.title}>
                <h3
                  className={cn(
                    "font-semibold mb-3 text-lg",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}
                >
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className={cn(
                          "text-sm font-medium transition-all duration-300 relative group block",
                          isDark
                            ? "text-gray-400 hover:text-violet-400"
                            : "text-gray-500 hover:text-violet-600"
                        )}
                      >
                        {link.name}
                        <span
                          className={cn(
                            "absolute left-0 -bottom-1 h-0.5 w-0 bg-violet-500 transition-all group-hover:w-full",
                            isDark ? "bg-violet-400" : "bg-violet-600"
                          )}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className={cn(
            "my-10 border-t transition-colors",
            isDark ? "border-gray-800" : "border-gray-200"
          )}
        />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
            © {new Date().getFullYear()}{" "}
            <span className={cn("font-semibold", isDark ? "text-gray-200" : "text-gray-700")}>
              XSeize
            </span>
            . All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex gap-5">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "transition-all",
                  isDark ? "text-gray-400 hover:text-violet-400" : "text-gray-500 hover:text-violet-600"
                )}
              >
                <Icon size={22} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
