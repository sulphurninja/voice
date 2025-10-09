'use client';

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  PhoneCall,
  Headphones,
  CalendarClock,
  Layers,
  Database,
} from "lucide-react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/footer";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const solutions = [
  {
    icon: <PhoneCall className="w-8 h-8 text-blue-500" />,
    title: "Sales Outreach",
    description:
      "Automate lead qualification and follow-ups using intelligent AI voice agents that engage customers 24/7.",
    features: [
      "CRM Integration",
      "Personalized conversations",
      "Real-time analytics",
    ],
  },
  {
    icon: <Headphones className="w-8 h-8 text-green-500" />,
    title: "Customer Support",
    description:
      "Handle common support queries with instant voice responses, freeing your agents for complex cases.",
    features: [
      "Natural language understanding",
      "Escalation logic",
      "Sentiment detection",
    ],
  },
  {
    icon: <CalendarClock className="w-8 h-8 text-purple-500" />,
    title: "Appointment Scheduling",
    description:
      "Let your voice AI schedule, confirm, or reschedule appointments — synced directly to your calendar.",
    features: [
      "Calendar integration",
      "Custom reminders",
      "Multi-language support",
    ],
  },
  {
    icon: <CheckCircle2 className="w-8 h-8 text-indigo-500" />,
    title: "AI Agents",
    description:
      "Manage your intelligent voice AI assistants and monitor their activity.",
    features: [
      "Multi-assistant support",
      "Activity tracking",
      "Smart AI recommendations",
    ],
  },
  {
    icon: <Layers className="w-8 h-8 text-orange-500" />,
    title: "Call History",
    description:
      "View call transcripts and logs to track performance and insights.",
    features: [
      "Full transcript access",
      "Search & filter calls",
      "Export logs",
    ],
  },
  {
    icon: <Database className="w-8 h-8 text-teal-500" />,
    title: "Leads & CRM",
    description: "Manage your leads and sales pipeline efficiently.",
    features: [
      <span className="flex items-center gap-2" key="leads">
        Leads{" "}
        <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
          NEW
        </span>
      </span>,
      "Pipeline management",
      "Customer database",
    ],
  },
];

const SolutionsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section>
      <Header />
      <div
        className={cn(
          "min-h-screen transition-colors duration-300 relative overflow-hidden",
          isDark
            ? "bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 text-white"
            : "bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100 text-gray-900"
        )}
      >
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={cn(
              "absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px]",
              isDark ? "bg-cyan-500/6" : "bg-cyan-500/5"
            )}
          />
          <div
            className={cn(
              "absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]",
              isDark ? "bg-purple-500/6" : "bg-purple-500/5"
            )}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,255,0.02),transparent_70%)]" />
        </div>

        {/* Hero Section */}
        <section className="text-center py-20 px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold mb-4"
          >
            AI Voice Agent Solutions
          </motion.h1>
          <p className={cn(
            "max-w-2xl mx-auto text-lg mb-8",
            isDark ? "text-gray-300" : "text-gray-800"
          )}>
            Power your business with intelligent, customizable AI voice solutions
            for every use case — from sales to support.
          </p>
        </section>

        <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 px-6 lg:px-20 py-10">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className={cn(
                "relative border rounded-2xl p-6 shadow-lg hover:shadow-blue-500/20 transition backdrop-blur-xl",
                isDark
                  ? "bg-[linear-gradient(to_right,rgba(75,85,99,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(75,85,99,0.3)_1px,transparent_1px)] border-gray-700/50"
                  : "bg-[linear-gradient(to_right,rgba(156,163,175,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(156,163,175,0.3)_1px,transparent_1px)] border-gray-200/70"
              )}
            >
              <div className="mb-4">{solution.icon}</div>
              <h3 className={cn(
                "text-2xl font-semibold mb-2",
                isDark ? "text-white" : "text-gray-900"
              )}>
                {solution.title}
              </h3>
              <p className={cn(
                "mb-4",
                isDark ? "text-gray-300" : "text-gray-800"
              )}>
                {solution.description}
              </p>
              <ul className="space-y-2">
                {solution.features.map((feature, i) => (
                  <li
                    key={i}
                    className={cn(
                      "flex items-center gap-2",
                      isDark ? "text-gray-300" : "text-gray-900"
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className={cn(
            "text-center py-20 border-t transition-colors",
            isDark
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          )}
        >
          <h2 className={cn("text-3xl font-semibold mb-4", isDark ? "text-white" : "text-gray-900")}>
            Ready to Automate Your Conversations?
          </h2>
          <p className={cn("max-w-xl mx-auto mb-8", isDark ? "text-gray-400" : "text-gray-700")}>
            Experience the next generation of customer engagement with AI voice
            agents built to perform, scale, and adapt.
          </p>
        </motion.section>
      </div>
      <Footer />
    </section>
  );
};

export default SolutionsPage;
