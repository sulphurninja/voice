"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { format, subDays, eachDayOfInterval, parseISO, isValid } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import {
  BarChart2,
  PhoneCall,
  Clock,
  Users,
  TrendingUp,
  Filter,
  DownloadCloud,
  CheckCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Mic,
  Volume2,
  Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("7d");
  const [callType, setCallType] = useState("all");
  const [loading, setLoading] = useState(true);

  // States for API data
  const [calls, setCalls] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [agents, setAgents] = useState([]);

  // Aggregated statistics
  const [callStats, setCallStats] = useState({
    totalCalls: 0,
    totalMinutes: 0,
    avgDuration: 0,
    successRate: 0,
    contactsReached: 0,
    callsPercentChange: 0,
    callOutcomes: [] as { name: string, value: number }[],
    callDuration: [] as { name: string, value: number }[],
    dailyCallData: [] as any[],
    monthlyCallData: [] as any[]
  });

  // Calculate start date based on timeRange
  const getStartDate = () => {
    const today = new Date();
    if (timeRange === "7d") return format(subDays(today, 7), "yyyy-MM-dd");
    if (timeRange === "14d") return format(subDays(today, 14), "yyyy-MM-dd");
    if (timeRange === "30d") return format(subDays(today, 30), "yyyy-MM-dd");
    if (timeRange === "90d") return format(subDays(today, 90), "yyyy-MM-dd");
    return format(subDays(today, 7), "yyyy-MM-dd");
  };

  // Fetch calls
  const fetchCalls = async () => {
    try {
      const startDate = getStartDate();
      const endDate = format(new Date(), "yyyy-MM-dd");

      const response = await fetch(
        `/api/calls?startDate=${startDate}&endDate=${endDate}&limit=1000`
      );

      if (!response.ok) throw new Error('Failed to fetch calls');

      const data = await response.json();
      setCalls(data.calls || []);
      return data.calls || [];
    } catch (error) {
      console.error("Error fetching calls:", error);
      return [];
    }
  };

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      const response = await fetch(`/api/contacts?limit=1000`);

      if (!response.ok) throw new Error('Failed to fetch contacts');

      const data = await response.json();
      setContacts(data.contacts || []);
      return data.contacts || [];
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return [];
    }
  };

  // Fetch agents
  const fetchAgents = async () => {
    try {
      const response = await fetch(`/api/agents`);

      if (!response.ok) throw new Error('Failed to fetch agents');

      const data = await response.json();
      setAgents(data.agents || []);
      return data.agents || [];
    } catch (error) {
      console.error("Error fetching agents:", error);
      return [];
    }
  };

  // Process data and calculate statistics
  const processData = (calls: any[], contacts: any[], agents: any[]) => {
    // Default empty arrays if no data
    calls = calls || [];
    contacts = contacts || [];
    agents = agents || [];

    // Calculate total calls and related stats
    const totalCalls = calls.length;

    // Calculate call durations and talk time
    // Note: This assumes you have a duration field in your calls model
    // If not, you'll need to adapt this logic based on your actual data structure
    const totalMinutes = calls.reduce((sum, call) => {
      return sum + (call.duration || 0) / 60; // Convert seconds to minutes if applicable
    }, 0);

    const avgDuration = totalCalls > 0 ? totalMinutes / totalCalls : 0;

    // Calculate call outcomes
    const callOutcomes = [
      {
        name: "Completed",
        value: calls.filter(call => call.status === "completed").length
      },
      {
        name: "No Answer",
        value: calls.filter(call => call.status === "no-answer").length
      },
      {
        name: "Busy",
        value: calls.filter(call => call.status === "busy").length
      },
      {
        name: "Failed",
        value: calls.filter(call => call.status === "failed").length
      }
    ];

    // Calculate success rate
    const successRate = totalCalls > 0
      ? (calls.filter(call => call.status === "completed").length / totalCalls) * 100
      : 0;

    // Calculate contacts reached
    const contactsReached = calls.filter(call => call.status === "completed").length;

    // Generate daily call data
    const dailyCallData = generateDailyCallData(calls);

    // Generate monthly call data
    const monthlyCallData = generateMonthlyCallData(calls);

    // Call duration distribution
    const callDuration = [
      {
        name: "<1 min",
        value: calls.filter(call => (call.duration || 0) < 60).length
      },
      {
        name: "1-2 min",
        value: calls.filter(call => (call.duration || 0) >= 60 && (call.duration || 0) < 120).length
      },
      {
        name: "2-5 min",
        value: calls.filter(call => (call.duration || 0) >= 120 && (call.duration || 0) < 300).length
      },
      {
        name: ">5 min",
        value: calls.filter(call => (call.duration || 0) >= 300).length
      }
    ];

    // Calculate percent change
    // This is a simplified version - you may want to enhance it based on your needs
    const previousPeriodCalls = 0; // Placeholder for now
    const callsPercentChange = previousPeriodCalls > 0
      ? ((totalCalls - previousPeriodCalls) / previousPeriodCalls) * 100
      : 0;

    setCallStats({
      totalCalls,
      totalMinutes,
      avgDuration,
      successRate,
      contactsReached,
      callsPercentChange,
      callOutcomes,
      callDuration,
      dailyCallData,
      monthlyCallData
    });
  };

  // Generate daily call data from actual calls
  const generateDailyCallData = (calls: any[]) => {
    const today = new Date();
    const days = eachDayOfInterval({
      start: subDays(today, 30),
      end: today,
    });

    // Initialize data structure with zero calls for each day
    const dailyData = days.map(day => ({
      date: format(day, "MMM dd"),
      rawDate: day,
      calls: 0,
      minutes: 0
    }));

    // Aggregate call data by day
    calls.forEach((call: any) => {
      if (call.createdAt) {
        const callDate = new Date(call.createdAt);

        if (isValid(callDate)) {
          const dateStr = format(callDate, "MMM dd");
          const dataPoint = dailyData.find(d => d.date === dateStr);

          if (dataPoint) {
            dataPoint.calls += 1;
            dataPoint.minutes += (call.duration || 0) / 60;
          }
        }
      }
    });

    return dailyData;
  };

  // Generate monthly call data from actual calls
  const generateMonthlyCallData = (calls: any[]) => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: format(new Date(2023, i, 1), "MMM"),
      monthIndex: i,
      calls: 0,
      minutes: 0
    }));

    // Aggregate call data by month
    calls.forEach((call: any) => {
      if (call.createdAt) {
        const callDate = new Date(call.createdAt);

        if (isValid(callDate)) {
          const monthIndex = callDate.getMonth();
          const dataPoint = monthlyData.find(d => d.monthIndex === monthIndex);

          if (dataPoint) {
            dataPoint.calls += 1;
            dataPoint.minutes += (call.duration || 0) / 60;
          }
        }
      }
    });

    return monthlyData;
  };

  // Fetch data on component mount and when timeRange changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const [callsData, contactsData, agentsData] = await Promise.all([
        fetchCalls(),
        fetchContacts(),
        fetchAgents()
      ]);

      processData(callsData, contactsData, agentsData);
      setLoading(false);
    };

    loadData();
  }, [timeRange]);

  // Filter data based on call type
  const filterDataByCallType = () => {
    if (callType === "all") return callStats.dailyCallData;

    // Implementation depends on your data structure
    // This is a placeholder. Implement actual filtering logic.
    return callStats.dailyCallData;
  };

  // Animation variants
  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const containerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  // Colors for charts
  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

  // Filter daily data based on time range
  const filteredDailyData = (() => {
    if (timeRange === "7d") return callStats.dailyCallData.slice(-7);
    if (timeRange === "14d") return callStats.dailyCallData.slice(-14);
    if (timeRange === "30d") return callStats.dailyCallData;
    return callStats.dailyCallData;
  })();

  return (
    <div className="min-h-screen text-foreground flex">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto h-fit max-h-screen bg-background">
        <DashboardHeader />

        <div className="mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
            className="mb-8"
          >
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
                <p className="text-muted-foreground mt-1">
                  Monitor your AI voice calls performance
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="14d">Last 14 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="gap-2">
                  <DownloadCloud className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading analytics data...</span>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariant}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              >
                <motion.div variants={fadeInUpVariant}>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Total Calls</p>
                          <p className="text-3xl font-bold">{callStats.totalCalls}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <PhoneCall className="h-5 w-5 text-primary" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        {callStats.callsPercentChange > 0 ? (
                          <div className="flex items-center text-success text-sm">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            {Math.abs(callStats.callsPercentChange).toFixed(1)}%
                          </div>
                        ) : (
                          <div className="flex items-center text-destructive text-sm">
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                            {Math.abs(callStats.callsPercentChange).toFixed(1)}%
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">vs previous period</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUpVariant}>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Talk Time</p>
                          <p className="text-3xl font-bold">{callStats.totalMinutes.toFixed(0)} min</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-secondary" />
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Avg. call duration</span>
                          <span>{callStats.avgDuration.toFixed(1)} min/call</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUpVariant}>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Success Rate</p>
                          <p className="text-3xl font-bold">{callStats.successRate.toFixed(1)}%</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                      </div>

                      <div className="mt-4">
                        <Progress value={callStats.successRate} className="h-1" />
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-success">
                            Completed: {callStats.successRate.toFixed(0)}%
                          </div>
                          <div className="text-xs text-destructive">
                            Failed: {(100 - callStats.successRate).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUpVariant}>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Contacts Reached</p>
                          <p className="text-3xl font-bold">{callStats.contactsReached}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-warning" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <p className="text-xs text-muted-foreground">Out of {contacts.length} total contacts</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Main Charts */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUpVariant}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
              >
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart2 className="h-5 w-5 text-primary" />
                      Call Volume
                    </CardTitle>
                    <CardDescription>
                      Call activity over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="daily">
                      <div className="flex justify-between items-center mb-4">
                        <TabsList>
                          <TabsTrigger value="daily">Daily</TabsTrigger>
                          <TabsTrigger value="monthly">Monthly</TabsTrigger>
                        </TabsList>

                        <Select value={callType} onValueChange={setCallType}>
                          <SelectTrigger className="w-[140px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Calls</SelectItem>
                            <SelectItem value="outbound">Outbound</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <TabsContent value="daily">
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredDailyData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'var(--background)',
                                  borderColor: 'var(--border)',
                                  borderRadius: '6px'
                                }}
                              />
                              <Bar
                                dataKey="calls"
                                name="Calls"
                                fill="var(--primary)"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </TabsContent>

                      <TabsContent value="monthly">
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={callStats.monthlyCallData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'var(--background)',
                                  borderColor: 'var(--border)',
                                  borderRadius: '6px'
                                }}
                              />
                              <Bar
                                dataKey="calls"
                                name="Calls"
                                fill="var(--primary)"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Call Outcomes
                    </CardTitle>
                    <CardDescription>
                      Distribution of call results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={callStats.callOutcomes}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) =>
                              percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                            }
                            labelLine={false}
                          >
                            {callStats.callOutcomes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              borderRadius: '6px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Secondary Analytics */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUpVariant}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="h-5 w-5 text-primary" />
                      Call Duration Analysis
                    </CardTitle>
                    <CardDescription>
                      Distribution of call durations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={callStats.callDuration}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            paddingAngle={1}
                            dataKey="value"
                            nameKey="name"
                            label
                          >
                            {callStats.callDuration.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              borderRadius: '6px'
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Volume2 className="h-5 w-5 text-primary" />
                      Agent Performance
                    </CardTitle>
                    <CardDescription>
                      Success rate by agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {agents.length > 0 ? (
                      <div className="space-y-4">
                        {agents.map(agent => {
                          // Calculate success rate for this agent
                          const agentCalls = calls.filter((call: any) => call.agentId === agent.id);
                          const successfulCalls = agentCalls.filter((call: any) => call.status === "completed");
                          const successRate = agentCalls.length > 0
                            ? (successfulCalls.length / agentCalls.length) * 100
                            : 0;

                          return (
                            <div key={agent.id}>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">{agent.name}</span>
                                <span className="text-sm">{successRate.toFixed(0)}%</span>
                              </div>
                              <Progress value={successRate} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-48 text-muted-foreground">
                        No agents data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
