"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users, Calendar, Clock,
  Plus, BarChart3, TrendingUp, TrendingDown, ArrowUp, ArrowDown,
  CheckCircle, XCircle, AlertCircle, Sparkles,
  Star, DollarSign, Timer, Bell, Eye, PhoneCall,
  Bot, Mic, Play, Pause, Settings, ChevronRight,
  MessageSquare, Database, Activity, Headphones,
  Target, Zap, Award, Phone
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format, isToday } from "date-fns";

const fetcher = (url: string) => fetch(url).then(r => r.json());

// AI Agent helpers
const getAgentStatusBadge = (status: "active" | "paused") => (
  <Badge variant="outline" className={status === "active"
    ? "bg-success/10 text-success hover:bg-success/20 transition-colors border-green-500/20"
    : "bg-muted text-muted-foreground hover:bg-muted/80 transition-colors border-gray-300"}>
    {status === "active" ?
      <><Mic className="h-3 w-3 mr-1 animate-pulse" /> Active</> :
      <><Pause className="h-3 w-3 mr-1" /> Paused</>}
  </Badge>
);

const getCallStatusBadge = (status: string) => {
  const statusConfig = {
    'completed': { variant: 'default', icon: CheckCircle, className: 'bg-green-500/10 text-green-600 border-green-500/20' },
    'failed': { variant: 'destructive', icon: XCircle, className: 'bg-red-500/10 text-red-600 border-red-500/20' },
    'in-progress': { variant: 'default', icon: Phone, className: 'bg-blue-500/10 text-blue-600 border-blue-500/20 animate-pulse' },
    'scheduled': { variant: 'secondary', icon: Clock, className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
  const Icon = config.icon;

  return (
    <Badge className={cn("flex items-center gap-1", config.className)}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const getTimeAgo = (date: string) => {
  const now = new Date();
  const callTime = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - callTime.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return format(callTime, 'MMM d');
};

export default function Dashboard() {
  const { user } = useAuth();

  // AI Voice System data fetching
  const { data: agentsData, isLoading: isLoadingAgents } = useSWR<{ agents: any[] }>("/api/agents", fetcher);
  const { data: callsData, isLoading: isLoadingCalls } = useSWR<{ calls: any[], pagination: any }>("/api/calls?limit=10", fetcher);
  const { data: conversationsData, isLoading: isLoadingConversations } = useSWR<{ conversations: any[] }>("/api/conversations?limit=5", fetcher);
  const { data: contactsData } = useSWR<{ contacts: any[], stats: { total: number, newToday: number } }>("/api/contacts", fetcher);
  const { data: analyticsData } = useSWR<{
    usage: { totalMinutes: number, costToday: number, costThisMonth: number },
    performance: { successRate: number, avgDuration: number }
  }>("/api/analytics", fetcher);

  // Extract data
  const agents = agentsData?.agents ?? [];
  const calls = callsData?.calls ?? [];
  const conversations = conversationsData?.conversations ?? [];
  const contacts = contactsData?.contacts ?? [];
  const contactStats = contactsData?.stats ?? { total: 0, newToday: 0 };

  // Calculate metrics
  const activeAgents = agents.filter(a => !a.disabled).length;
  const totalCalls = calls.length;
  const completedCalls = calls.filter(c => c.status === 'completed').length;
  const callSuccessRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;
  const activeCalls = calls.filter(c => c.status === 'in-progress').length;
  const todayConversations = conversations.filter(c => isToday(new Date(c.createdAt))).length;

  // Usage metrics
  const usageData = analyticsData?.usage ?? { totalMinutes: 0, costToday: 0, costThisMonth: 0 };
  const performanceData = analyticsData?.performance ?? { successRate: 0, avgDuration: 0 };

  const toggleAgent = async (id: string, enable: boolean) => {
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
          {/* Header Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'there'}! 👋
                </h1>
                <p className="text-muted-foreground">
                  Manage your AI voice agents and monitor call performance
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/dashboard/agents/new">
                  <Button variant="outline" className="gap-2 border-purple-500/20 text-purple-600 hover:bg-purple-500/10">
                    <Bot className="h-4 w-4" />
                    New Agent
                  </Button>
                </Link>
                <Link href="/dashboard/calls/new">
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500">
                    <PhoneCall className="h-4 w-4" />
                    Make Call
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUpVariant}>
              <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <PhoneCall className="h-6 w-6 text-blue-600" />
                    </div>
                    {activeCalls > 0 && (
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 animate-pulse">
                        {activeCalls} live
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Calls</p>
                    <p className="text-2xl font-bold">{totalCalls}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUpVariant}>
              <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-violet-600" />
                    </div>
                    <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20">
                      {activeAgents}/{agents.length}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">AI Agents</p>
                    <p className="text-2xl font-bold">{activeAgents}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUpVariant}>
              <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex items-center px-2 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
                      {callSuccessRate}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{callSuccessRate}%</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUpVariant}>
              <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-cyan-600" />
                    </div>
                    <Badge className="bg-cyan-500/10 text-cyan-600 border-cyan-500/20">
                      {todayConversations} today
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Conversations</p>
                    <p className="text-2xl font-bold">{conversations.length}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUpVariant}>
              <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex items-center px-2 py-1 bg-orange-500/10 text-orange-600 rounded-full text-xs font-medium">
                      Today
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Usage Cost</p>
                    <p className="text-2xl font-bold">{formatCurrency(usageData.costToday)}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
            className="mb-8"
          >
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-3">
                <TabsTrigger value="overview" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="ai-system" className="gap-2">
                  <Bot className="h-4 w-4" />
                  AI System
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* Recent Calls */}
                  <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Recent Calls</h2>
                      <Link href="/dashboard/calls">
                        <Button variant="outline" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View All
                        </Button>
                      </Link>
                    </div>

                    {isLoadingCalls ? (
                      <Card>
                        <CardContent className="p-6">
                          <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="flex gap-4 items-start">
                                <Skeleton className="h-12 w-12 rounded-xl" />
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
                    ) : calls.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="p-8 text-center">
                          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                            <PhoneCall className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">No Calls Yet</h3>
                          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Start making calls with your AI agents to see activity here
                          </p>
                          <Link href="/dashboard/calls/new">
                            <Button>
                              <PhoneCall className="h-4 w-4 mr-2" /> Make Your First Call
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {calls.slice(0, 5).map((call, index) => (
                          <motion.div
                            key={call._id}
                            className="bg-card rounded-xl border overflow-hidden hover:shadow-sm transition-all duration-200"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                    <PhoneCall className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-bold">{call.contactName || 'Unknown Contact'}</h3>
                                      {getCallStatusBadge(call.status)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {call.phoneNumber} • {call.agentName || 'AI Agent'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{getTimeAgo(call.startTime || call.createdAt)}</p>
                                  {call.duration && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Timer className="h-3 w-3" />
                                      {Math.floor(call.duration / 60)}m {call.duration % 60}s
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex justify-between items-center pt-4 border-t">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{call.direction || 'Outbound'}</span>
                                  <span className="h-1 w-1 rounded-full bg-muted-foreground/60"></span>
                                  <span>{call.category || 'General'}</span>
                                </div>
                                <div className="flex gap-2">
                                  <Link href={`/dashboard/calls/${call._id}`}>
                                    <Button variant="outline" size="sm">
                                      View Details
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Today's Performance */}
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-primary" />
                          Today's Performance
                        </CardTitle>
                        <CardDescription>
                          Real-time metrics for today
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Success Rate</span>
                            <span className="font-medium">{callSuccessRate}%</span>
                          </div>
                          <Progress value={callSuccessRate} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Active Agents</span>
                            <span className="font-medium">{activeAgents}/{agents.length}</span>
                          </div>
                          <Progress value={agents.length > 0 ? (activeAgents / agents.length) * 100 : 0} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Avg Call Duration</span>
                            <span className="font-medium">{Math.floor(performanceData.avgDuration / 60)}m {performanceData.avgDuration % 60}s</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{todayConversations}</div>
                            <div className="text-sm text-muted-foreground">Conversations Today</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai-system" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* AI Agents Overview */}
                  <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">AI Voice Agents</h2>
                      <Link href="/dashboard/agents/new">
                        <Button variant="outline" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Agent
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
                            <Bot className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">No AI Agents Yet</h3>
                          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Create your first AI voice agent to start making automated calls with natural conversations
                          </p>
                          <Link href="/dashboard/agents/new">
                            <Button>
                              <Plus className="h-4 w-4 mr-2" /> Create Your First Agent
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {agents.slice(0, 3).map((agent, index) => {
                          const enabled = !agent.disabled;
                          const status = enabled ? "active" : "paused";
                          const used = agent.usage_minutes ?? 0;
                          const pct = Math.min(100, Math.round((used / 2000) * 100));

                          return (
                            <motion.div
                              key={agent.agent_id}
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
                                      enabled ? "bg-violet-500/10" : "bg-muted"
                                    )}>
                                      <Bot className="h-5 w-5 text-violet-600" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h3 className="font-bold">{agent.name}</h3>
                                        {getAgentStatusBadge(status as any)}
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-0.5">{agent.description || 'No description'}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-xs text-muted-foreground mb-3 italic line-clamp-2">
                                  <span className="text-foreground font-medium">Voice Greeting:</span> {agent.conversation_config?.first_message || 'Not set'}
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
                                  {agent.last_called_at ?
                                    `Last used: ${format(new Date(agent.last_called_at), "MMM d, h:mm a")}` :
                                    "Never used"}
                                </span>
                                <div className="flex gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 rounded-full"
                                          onClick={() => toggleAgent(agent.agent_id, !enabled)}
                                        >
                                          {enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {enabled ? 'Pause agent' : 'Activate agent'}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <Link href={`/dashboard/agents/${agent.agent_id}`}>
                                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0 rounded-full">
                                      <Settings className="h-4 w-4" />
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
                  </div>

                  {/* System Status */}
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-primary" />
                          System Status
                        </CardTitle>
                        <CardDescription>
                          Platform health & performance
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">AI Voice System</span>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-sm font-medium text-green-600">Online</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Call Gateway</span>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-sm font-medium text-green-600">Connected</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Speech Recognition</span>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-sm font-medium text-green-600">Active</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Voice Synthesis</span>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-sm font-medium text-green-600">Running</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{usageData.totalMinutes}</div>
                            <div className="text-sm text-muted-foreground">Minutes This Month</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weekly Performance */}
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">Weekly Goals</h3>
                          <p className="text-muted-foreground">Track your AI voice platform progress</p>
                        </div>
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                          5 days remaining
                        </Badge>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Call Volume Goal</span>
                            <span className="text-sm text-muted-foreground">{totalCalls} / 100</span>
                          </div>
                          <Progress value={Math.min(100, (totalCalls / 100) * 100)} className="h-2" />
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            <span>{totalCalls >= 80 ? 'Excellent progress!' : 'Keep going!'}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Success Rate Goal</span>
                            <span className="text-sm text-muted-foreground">{callSuccessRate}% / 85%</span>
                          </div>
                          <Progress value={Math.min(100, (callSuccessRate / 85) * 100)} className="h-2" />
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Target className="h-3 w-3" />
                            <span>{callSuccessRate >= 85 ? 'Target achieved!' : 'Room for improvement'}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Agent Utilization</span>
                            <span className="text-sm text-muted-foreground">{activeAgents}/{agents.length} active</span>
                          </div>
                          <Progress value={agents.length > 0 ? (activeAgents / agents.length) * 100 : 0} className="h-2" />
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Bot className="h-3 w-3" />
                            <span>{activeAgents === agents.length ? 'All agents active!' : 'Some agents paused'}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Usage Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Usage Statistics
                      </CardTitle>
                      <CardDescription>
                        Your platform usage and costs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { label: "Total Minutes", value: usageData.totalMinutes, suffix: "min", icon: "🕒", trend: "+12%" },
                          { label: "Cost Today", value: formatCurrency(usageData.costToday), suffix: "", icon: "💰", trend: "+5%" },
                          { label: "Cost This Month", value: formatCurrency(usageData.costThisMonth), suffix: "", icon: "📊", trend: "+8%" },
                          { label: "Avg Call Duration", value: Math.floor(performanceData.avgDuration / 60), suffix: "min", icon: "⏱️", trend: "-3%" }
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center gap-4 p-4 rounded-lg border bg-card/50 hover:bg-card transition-all duration-200"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div className="text-2xl">{item.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.label}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{item.value}{item.suffix}</span>
                              </div>
                            </div>
                            <div className={cn(
                              "flex items-center gap-1 text-sm font-medium",
                              item.trend.startsWith('+') ? "text-green-600" : "text-red-600"
                            )}>
                              {item.trend.startsWith('+') ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                              {item.trend}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Agent Performance & Contact Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Performing Agents */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Top Performing Agents
                      </CardTitle>
                      <CardDescription>
                        Best AI agents by success rate
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {agents.length > 0 ? agents.slice(0, 3).map((agent, index) => {
                        const successRate = Math.floor(Math.random() * 20) + 80; // Mock success rate
                        const dailyCalls = Math.floor(Math.random() * 15) + 5; // Mock daily calls

                        return (
                          <motion.div
                            key={index}
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                              <Bot className="h-5 w-5 text-violet-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{agent.name}</p>
                              <p className="text-sm text-muted-foreground">{dailyCalls} calls today</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-green-600">{successRate}%</div>
                              <div className="text-xs text-muted-foreground">success</div>
                            </div>
                          </motion.div>
                        );
                      }) : (
                        <div className="text-center py-8">
                          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No agents to analyze</p>
                          <Link href="/dashboard/agents/new">
                            <Button variant="outline" size="sm" className="mt-2">
                              Create Agent
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contact Analytics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Contact Analytics
                      </CardTitle>
                      <CardDescription>
                        Your contact database insights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-lg border bg-card/50">
                          <div className="text-2xl font-bold text-blue-600">{contactStats.total}</div>
                          <div className="text-sm text-muted-foreground">Total Contacts</div>
                        </div>
                        <div className="text-center p-4 rounded-lg border bg-card/50">
                          <div className="text-2xl font-bold text-green-600">{contactStats.newToday}</div>
                          <div className="text-sm text-muted-foreground">New Today</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Contact Growth</span>
                          <span className="text-sm font-medium text-green-600">+12% this week</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Response Rate</span>
                          <span className="text-sm font-medium">{Math.floor(Math.random() * 20) + 70}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Avg Call Duration</span>
                          <span className="text-sm font-medium">{Math.floor(performanceData.avgDuration / 60)}m {performanceData.avgDuration % 60}s</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Quick Actions Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
            className="mb-8"
          >
            <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Link href="/dashboard/calls/new" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3 h-12">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <PhoneCall className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Make Call</div>
                        <div className="text-xs text-muted-foreground">Start AI voice call</div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/dashboard/agents/new" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3 h-12">
                      <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-violet-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Create Agent</div>
                        <div className="text-xs text-muted-foreground">New AI assistant</div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/dashboard/contacts" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3 h-12">
                      <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Manage Contacts</div>
                        <div className="text-xs text-muted-foreground">Update database</div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/dashboard/analytics" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3 h-12">
                      <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">View Analytics</div>
                        <div className="text-xs text-muted-foreground">Performance insights</div>
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Status & Tips */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
          >
            {/* System Status */}
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full h-8 w-8 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h3 className="font-medium">System Health</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">AI Voice Platform</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-green-600">Operational</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Call Processing</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Voice Recognition</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-green-600">Online</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Agent Network</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-green-600">Connected</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pro Tips */}
            <Card className="bg-primary/5 border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full h-8 w-8 bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-medium">Pro Tips</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Optimize Agent Performance</p>
                    <p className="text-xs text-muted-foreground">
                      Regularly review call transcripts and update agent responses to improve conversation quality and success rates.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Monitor Usage Costs</p>
                    <p className="text-xs text-muted-foreground">
                      Track your monthly usage and set up alerts to stay within budget while maximizing call effectiveness.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
