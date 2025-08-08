"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Pause, Play, Settings, ChevronRight, Users, PhoneCall, Calendar,
  Plus, BarChart3, Wallet, ArrowUp, ArrowDown, Phone, Clock,
  CheckCircle, XCircle, Info, Sparkles, Mic, FileText
} from "lucide-react";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const fetcher = (url: string) => fetch(url).then(r => r.json());

// badge + icon helpers
const badge = (s: "active" | "paused") =>
  <Badge variant="outline" className={s === "active"
    ? "bg-success/10 text-success hover:bg-success/20 transition-colors"
    : "bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"}>
    {s === "active" ?
      <><Mic className="h-3 w-3 mr-1 animate-pulse" /> Active</> :
      <><Pause className="h-3 w-3 mr-1" /> Paused</>}
  </Badge>;

const iconFor = (n: string) => {
  const name = n.toLowerCase();
  if (name.includes("support")) return <PhoneCall className="h-5 w-5 text-primary" />;
  if (name.includes("booking")) return <Calendar className="h-5 w-5 text-primary" />;
  if (name.includes("sales")) return <Users className="h-5 w-5 text-primary" />;
  return <Mic className="h-5 w-5 text-primary" />;
};

/* ---------------- Page ---------------- */
export default function Dashboard() {
  const { user } = useAuth();
  const { data: agentsData, isLoading: isLoadingAgents } = useSWR<{ agents: any[] }>("/api/agents", fetcher);
  const { data: callsData, isLoading: isLoadingCalls } = useSWR<{ calls: any[], pagination: any }>("/api/calls?limit=5", fetcher);
  const { data: walletData } = useSWR<{ balance: number, transactions: any[] }>("/api/wallet", fetcher);

  const agents = agentsData?.agents ?? [];
  const calls = callsData?.calls ?? [];
  const walletBalance = walletData?.balance ?? 0;

  // Generate stats based on data
  const activeAgents = agents.filter(a => !a.disabled).length;
  const totalCalls = calls.length;
  const completedCalls = calls.filter(c => c.status === 'completed').length;
  const callSuccessRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

  // Calculate minutes used percentage
  const minutesUsed = user?.minutesUsed || 0;
  const totalMinutes = user?.totalMinutes || 0; // Avoid division by zero
  const minutesUsedPercentage = Math.min(100, Math.round((minutesUsed / totalMinutes) * 100));

  // Format minutes for display
  const formatMinutes = (mins: number) => {
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours} hr${hours !== 1 ? 's' : ''}${remainingMins > 0 ? ` ${remainingMins} min` : ''}`;
    }
    return `${mins} min`;
  };

  const toggle = async (id: string, enable: boolean) => {
    await fetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disabled: !enable }),
    });
    mutate("/api/agents");
  };

  // Animation variants
  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
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
    <div className="text-foreground flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 h-screen overflow-y-auto">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">
                  Welcome back, {user?.name?.split(' ')[0] || 'User'}
                </h1>
                <p className="text-muted-foreground">
                  Here's an overview of your AI voice agents and calling activities
                </p>
              </div>
              <Link href="/dashboard/new-agent">
                <Button className="shadow-sm group">
                  <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                  Create New Agent
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUpVariant}>
              <Card className="overflow-hidden border shadow-sm hover:shadow transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <ArrowUp className="h-5 w-5 text-success" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Active Agents</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">{activeAgents}</p>
                      <p className="text-sm text-muted-foreground">of {agents.length}</p>
                    </div>
                    <Progress value={(activeAgents / Math.max(1, agents.length)) * 100} className="h-1 mt-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUpVariant}>
              <Card className="overflow-hidden border shadow-sm hover:shadow transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                      {callSuccessRate}% <CheckCircle className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Calls</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">{totalCalls}</p>
                      <p className="text-sm text-success">{completedCalls} completed</p>
                    </div>
                    <Progress value={callSuccessRate} className="h-1 mt-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUpVariant}>
              <Card className="overflow-hidden border shadow-sm hover:shadow transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium bg-primary/10 text-primary py-1 px-2 rounded-full">
                      {formatMinutes(minutesUsed)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Minutes Used</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">{formatMinutes(minutesUsed)}</p>
                      <p className="text-sm text-muted-foreground">of {formatMinutes(totalMinutes)}</p>
                    </div>
                    <Progress value={minutesUsedPercentage} className="h-1 mt-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* <motion.div variants={fadeInUpVariant}>
              <Card className="overflow-hidden border shadow-sm hover:shadow transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center px-2 py-1 bg-muted/80 text-foreground rounded-full text-xs font-medium">
                      ${walletBalance}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Wallet Balance</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">${walletBalance}</p>
                      <p className="text-sm text-muted-foreground">available</p>
                    </div>
                    <Progress value={100} className="h-1 mt-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div> */}
          </motion.div>

          {/* Quick Action Card */}
          <motion.div
            variants={fadeInUpVariant}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <Card className="border bg-muted/30">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Get Started with AI Voice Conversations</h3>
                    </div>
                    <p className="text-muted-foreground max-w-xl">
                      Your AI voice agents are ready to make calls with natural conversations and human-like interactions.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/dashboard/calls/new">
                      <Button variant="outline" className="gap-2">
                        <Phone className="h-4 w-4" /> Make a Call
                      </Button>
                    </Link>
                    <Link href="/dashboard/new-agent">
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Create Agent
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Agents Overview */}
            <motion.div
              className="lg:col-span-2"
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariant}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Your Voice Agents</h2>
                <Link href="/dashboard/new-agent">
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" /> Add Agent
                  </Button>
                </Link>
              </div>

              {isLoadingAgents ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {[1, 2].map(i => (
                        <div key={i} className="flex gap-4 items-start">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-2 w-full mt-3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : agents.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Agents Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Create your first AI voice agent to start making automated calls with natural conversations
                    </p>
                    <Link href="/dashboard/new-agent">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" /> Create Your First Agent
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {agents.slice(0, 3).map((a, index) => {
                    const enabled = !a.disabled;
                    const status = enabled ? "active" : "paused";
                    const used = a.usage_minutes ?? 0;
                    const pct = Math.min(100, Math.round((used / 2000) * 100));

                    return (
                      <motion.div
                        key={a.agent_id}
                        className="bg-card rounded-xl border overflow-hidden hover:shadow-sm transition-all duration-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center",
                                enabled ? "bg-primary/10" : "bg-muted"
                              )}>
                                {iconFor(a.name)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold">{a.name}</h3>
                                  {badge(status as any)}
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">{a.description || 'No description'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground mb-3 italic line-clamp-1">
                            <span className="text-foreground font-medium">First message:</span> {a.conversation_config?.first_message || 'Not set'}
                          </div>

                          <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Monthly usage</span>
                              <span>{used} / 2000 min</span>
                            </div>
                            <Progress value={pct} className="h-1" />
                          </div>
                        </div>

                        <div className="border-t p-4 flex justify-between items-center bg-muted/30">
                          <span className="text-sm text-muted-foreground">
                            {a.last_called_at ?
                              `Last used: ${format(new Date(a.last_called_at), "MMM d, h:mm a")}` :
                              "Never used"}
                          </span>
                          <div className="flex gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full"
                                    onClick={() => toggle(a.agent_id, !enabled)}>
                                    {enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {enabled ? 'Pause agent' : 'Activate agent'}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/dashboard/agents/${a.agent_id}`}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Settings
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <Link href={`/dashboard/agents/${a.agent_id}`}>
                              <Button variant="secondary" size="sm" className="h-8 w-8 p-0 rounded-full">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {agents.length > 0 && (
                    <Link href="/dashboard/agents" className="block">
                      <Button variant="outline" className="w-full">
                        View All Agents
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </motion.div>

            {/* Recent Calls */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariant}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Recent Calls
                  </CardTitle>
                  <CardDescription>
                    Your latest call activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingCalls ? (
                    <div className="p-6 space-y-4">
                      {[1, 2].map(i => (
                        <div key={i} className="flex gap-4 items-center">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : calls.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                        <Phone className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Call History</h3>
                      <p className="text-muted-foreground mb-2">
                        Make your first call to see activity here
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {calls.map((call, index) => (
                        <motion.div
                          key={call._id}
                          className="p-4 hover:bg-muted/40 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                              call.status === 'completed' ? "bg-success/10" :
                                call.status === 'failed' ? "bg-destructive/10" :
                                  "bg-primary/10"
                            )}>
                              {call.status === 'completed' ? (
                                <CheckCircle className="h-5 w-5 text-success" />
                              ) : call.status === 'failed' ? (
                                <XCircle className="h-5 w-5 text-destructive" />
                              ) : (
                                <Phone className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <p className="font-medium truncate">{call.contactName || 'Unknown'}</p>
                                <Badge className={cn(
                                  "ml-2 flex-shrink-0",
                                  call.status === 'completed' ? "bg-success/10 text-success border-success/20" :
                                    call.status === 'failed' ? "bg-destructive/10 text-destructive border-destructive/20" :
                                      "bg-primary/10 text-primary border-primary/20"
                                )}>
                                  {call.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{call.phoneNumber}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span>{call.startTime ? format(new Date(call.startTime), "MMM d, h:mm a") : "Scheduled"}</span>
                                {call.duration && (
                                  <>
                                    <span className="h-1 w-1 rounded-full bg-muted-foreground/60"></span>
                                    <span>{Math.floor(call.duration / 60)}m {call.duration % 60}s</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end gap-2">
                            <Link href='/dashboard/calls/new'>
                              <Button variant="ghost" size="sm" className="h-7 text-xs">
                                <Phone className="h-3 w-3 mr-1" /> Call Again
                              </Button>
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-4 border-t">
                  <Link href="/dashboard/calls" className="w-full">
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Go to Calls
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Pro Tip Card */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUpVariant}
                className="mt-6"
              >
                <Card className="bg-primary/5 border-primary/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-full h-8 w-8 bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-medium">Pro Tip</h3>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      Personalize your AI agents' voice tone and conversation style from the agent settings page to improve call engagement.
                    </p>

                    {/* <Link href="/dashboard/guides/agent-personalization">
                      <Button variant="link" className="px-0 h-auto text-primary">
                        Learn how <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link> */}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
