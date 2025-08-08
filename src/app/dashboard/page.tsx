"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  ShoppingBag, UtensilsCrossed, Users, Calendar, Clock, 
  Plus, BarChart3, TrendingUp, TrendingDown, ArrowUp, ArrowDown,
  CheckCircle, XCircle, AlertCircle, Sparkles, ChefHat, 
  Star, DollarSign, Package, Timer, Bell, Eye, PhoneCall,
  Bot, Mic, Play, Pause, Settings, ChevronRight
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

// Restaurant-specific helpers
const getOrderStatusBadge = (status: string) => {
  const statusConfig = {
    'pending': { variant: 'secondary', icon: Clock, className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
    'preparing': { variant: 'default', icon: ChefHat, className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    'ready': { variant: 'default', icon: CheckCircle, className: 'bg-green-500/10 text-green-600 border-green-500/20' },
    'delivered': { variant: 'outline', icon: CheckCircle, className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    'cancelled': { variant: 'destructive', icon: XCircle, className: 'bg-red-500/10 text-red-600 border-red-500/20' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge className={cn("flex items-center gap-1", config.className)}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const getTimeAgo = (date: string) => {
  const now = new Date();
  const orderTime = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return format(orderTime, 'MMM d');
};

export default function RestaurantDashboard() {
  const { user } = useAuth();
  
  // Restaurant-specific data fetching
  const { data: ordersData, isLoading: isLoadingOrders } = useSWR<{
    orders: any[], 
    stats: { 
      total: number, 
      pending: number, 
      preparing: number, 
      ready: number, 
      delivered: number,
      revenue: { today: number, yesterday: number, change: number }
    }
  }>("/api/orders", fetcher);
  
  const { data: reservationsData, isLoading: isLoadingReservations } = useSWR<{
    reservations: any[],
    stats: { today: number, upcoming: number, capacity: number }
  }>("/api/reservations", fetcher);
  
  const { data: menuData } = useSWR<{ 
    items: any[],
    categories: any[],
    lowStock: any[]
  }>("/api/menu", fetcher);
  
  const { data: customersData } = useSWR<{
    totalCustomers: number,
    newToday: number,
    returningRate: number
  }>("/api/customers/stats", fetcher);

  // AI Voice System data fetching
  const { data: agentsData, isLoading: isLoadingAgents } = useSWR<{ agents: any[] }>("/api/agents", fetcher);
  const { data: callsData, isLoading: isLoadingCalls } = useSWR<{ calls: any[], pagination: any }>("/api/calls?limit=5", fetcher);

  // Extract data
  const orders = ordersData?.orders ?? [];
  const orderStats = ordersData?.stats ?? { total: 0, pending: 0, preparing: 0, ready: 0, delivered: 0, revenue: { today: 0, yesterday: 0, change: 0 } };
  const reservations = reservationsData?.reservations ?? [];
  const reservationStats = reservationsData?.stats ?? { today: 0, upcoming: 0, capacity: 0 };
  const menuItems = menuData?.items ?? [];
  const lowStockItems = menuData?.lowStock ?? [];
  const totalCustomers = customersData?.totalCustomers ?? 0;
  const newCustomersToday = customersData?.newToday ?? 0;

  // AI system data
  const agents = agentsData?.agents ?? [];
  const calls = callsData?.calls ?? [];
  const activeAgents = agents.filter(a => !a.disabled).length;
  const totalCalls = calls.length;
  const completedCalls = calls.filter(c => c.status === 'completed').length;
  const callSuccessRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

  // Calculate metrics
  const occupancyRate = reservationStats.capacity > 0 ? Math.round((reservationStats.today / reservationStats.capacity) * 100) : 0;
  const revenueChange = orderStats.revenue.change;
  const activeOrders = orderStats.pending + orderStats.preparing;

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
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'Chef'}! 👋
                </h1>
                <p className="text-muted-foreground">
                  Manage your restaurant and AI voice system from one place
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/dashboard/calls/new">
                  <Button variant="outline" className="gap-2 border-blue-500/20 text-blue-600 hover:bg-blue-500/10">
                    <PhoneCall className="h-4 w-4" />
                    Make Call
                  </Button>
                </Link>
                <Link href="/dashboard/orders/new">
                  <Button className="gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500">
                    <Plus className="h-4 w-4" />
                    New Order
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
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      revenueChange >= 0 
                        ? "bg-emerald-500/10 text-emerald-600" 
                        : "bg-red-500/10 text-red-600"
                    )}>
                      {revenueChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(revenueChange)}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Today's Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(orderStats.revenue.today)}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUpVariant}>
              <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-blue-600" />
                    </div>
                    {activeOrders > 0 && (
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        {activeOrders} active
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{orderStats.total}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUpVariant}>
              <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex items-center px-2 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
                      {occupancyRate}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Reservations</p>
                    <p className="text-2xl font-bold">{reservationStats.today}</p>
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
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                      <PhoneCall className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div className="flex items-center px-2 py-1 bg-cyan-500/10 text-cyan-600 rounded-full text-xs font-medium">
                      {callSuccessRate}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Voice Calls</p>
                    <p className="text-2xl font-bold">{totalCalls}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Alerts Section */}
          {lowStockItems.length > 0 && (
            <motion.div
              variants={fadeInUpVariant}
              initial="hidden"
              animate="visible"
              className="mb-8"
            >
              <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Low Stock Alert</h3>
                  </div>
                  <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                    {lowStockItems.length} menu items are running low on stock
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {lowStockItems.slice(0, 3).map((item, index) => (
                      <Badge key={index} variant="outline" className="border-yellow-400 text-yellow-700">
                        {item.name} ({item.stock} left)
                      </Badge>
                    ))}
                    {lowStockItems.length > 3 && (
                      <Badge variant="outline" className="border-yellow-400 text-yellow-700">
                        +{lowStockItems.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <Link href="/dashboard/menu?filter=low-stock">
                    <Button variant="outline" size="sm" className="mt-4 border-yellow-400 text-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900">
                      <Package className="h-4 w-4 mr-2" />
                      Manage Inventory
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content Tabs */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
            className="mb-8"
          >
            <Tabs defaultValue="restaurant" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-3">
                <TabsTrigger value="restaurant" className="gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  Restaurant
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

              <TabsContent value="restaurant" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* Recent Orders */}
                  <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Recent Orders</h2>
                      <Link href="/dashboard/orders">
                        <Button variant="outline" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View All
                        </Button>
                      </Link>
                    </div>

                    {isLoadingOrders ? (
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
                    ) : orders.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="p-8 text-center">
                          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
                          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Orders will appear here once customers start placing them
                          </p>
                          <Link href="/dashboard/orders/new">
                            <Button>
                              <Plus className="h-4 w-4 mr-2" /> Create Test Order
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {orders.slice(0, 5).map((order, index) => (
                          <motion.div
                            key={order.id}
                            className="bg-card rounded-xl border overflow-hidden hover:shadow-sm transition-all duration-200"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                                    <span className="text-lg font-bold text-orange-600">#{order.orderNumber}</span>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-bold">{order.customerName || 'Walk-in Customer'}</h3>
                                      {getOrderStatusBadge(order.status)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {order.items?.length || 0} items • {formatCurrency(order.total)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{getTimeAgo(order.createdAt)}</p>
                                  {order.estimatedTime && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Timer className="h-3 w-3" />
                                      {order.estimatedTime} min
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex justify-between items-center pt-4 border-t">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>Table {order.tableNumber || 'N/A'}</span>
                                  <span className="h-1 w-1 rounded-full bg-muted-foreground/60"></span>
                                  <span>{order.orderType || 'Dine-in'}</span>
                                </div>
                                <div className="flex gap-2">
                                  <Link href={`/dashboard/orders/${order.id}`}>
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

                  {/* Today's Reservations */}
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          Today's Reservations
                        </CardTitle>
                        <CardDescription>
                          {reservationStats.today} bookings scheduled
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        {isLoadingReservations ? (
                          <div className="p-6 space-y-4">
                            {[1, 2].map(i => (
                              <div key={i} className="flex gap-3 items-center">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                  <Skeleton className="h-4 w-3/4" />
                                  <Skeleton className="h-3 w-1/2" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : reservations.length === 0 ? (
                          <div className="p-8 text-center">
                            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                              <Calendar className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No Reservations</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                              No reservations scheduled for today
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y max-h-80 overflow-y-auto">
                            {reservations.filter(r => isToday(new Date(r.date))).slice(0, 4).map((reservation, index) => (
                              <motion.div
                                key={reservation.id}
                                className="p-4 hover:bg-muted/40 transition-colors"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={reservation.customerAvatar} />
                                    <AvatarFallback className="bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-600">
                                      {reservation.customerName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{reservation.customerName}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {format(new Date(reservation.time), 'h:mm a')}
                                      <span className="h-1 w-1 rounded-full bg-muted-foreground/60"></span>
                                      <Users className="h-3 w-3" />
                                      {reservation.partySize} people
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    Table {reservation.tableNumber}
                                  </Badge>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
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

                  {/* Recent Calls */}
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PhoneCall className="h-5 w-5 text-primary" />
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
                              <PhoneCall className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No Call History</h3>
                            <p className="text-muted-foreground mb-4">
                              Make your first call to see activity here
                            </p>
                            <Link href="/dashboard/calls/new">
                              <Button size="sm">
                                <PhoneCall className="h-4 w-4 mr-2" /> Make Call
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="divide-y max-h-80 overflow-y-auto">
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
                                      <PhoneCall className="h-5 w-5 text-primary" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <p className="font-medium truncate">{call.contactName || 'Unknown'}</p>
                                      <Badge className={cn(
                                        "ml-2 flex-shrink-0 text-xs",
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
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 border-t">
                        <Link href="/dashboard/calls" className="w-full">
                          <Button variant="outline" className="w-full">
                            <PhoneCall className="h-4 w-4 mr-2" />
                            View All Calls
                          </Button>
                        </Link>
                      </CardFooter>
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
                          <p className="text-muted-foreground">Track your restaurant's progress this week</p>
                        </div>
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                          5 days remaining
                        </Badge>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Revenue Goal</span>
                            <span className="text-sm text-muted-foreground">$8,500 / $10,000</span>
                          </div>
                          <Progress value={85} className="h-2" />
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            <span>85% complete - On track!</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Customer Satisfaction</span>
                            <span className="text-sm text-muted-foreground">4.6 / 5.0</span>
                          </div>
                          <Progress value={92} className="h-2" />
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Star className="h-3 w-3" />
                            <span>92% - Excellent!</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">AI Call Success Rate</span>
                            <span className="text-sm text-muted-foreground">{callSuccessRate}% / 90%</span>
                          </div>
                          <Progress value={callSuccessRate} className="h-2" />
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <PhoneCall className="h-3 w-3" />
                            <span>{callSuccessRate >= 80 ? 'Great performance!' : 'Room for improvement'}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Popular Items Today */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UtensilsCrossed className="h-5 w-5 text-primary" />
                        Popular Items Today
                      </CardTitle>
                      <CardDescription>
                        Top selling menu items based on today's orders
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { name: "Margherita Pizza", orders: 12, revenue: 180, emoji: "🍕", trend: "+15%" },
                          { name: "Caesar Salad", orders: 8, revenue: 96, emoji: "🥗", trend: "+8%" },
                          { name: "Grilled Salmon", orders: 6, revenue: 150, emoji: "🐟", trend: "+12%" },
                          { name: "Chocolate Cake", orders: 9, revenue: 108, emoji: "🍰", trend: "+20%" }
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center gap-4 p-4 rounded-lg border bg-card/50 hover:bg-card transition-all duration-200"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div className="text-2xl">{item.emoji}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.name}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{item.orders} orders</span>
                                <span>{formatCurrency(item.revenue)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                              <ArrowUp className="h-3 w-3" />
                              {item.trend}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Staff Performance & AI Agent Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Staff Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ChefHat className="h-5 w-5 text-primary" />
                        Top Staff Performance
                      </CardTitle>
                      <CardDescription>
                        Today's best performing team members
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: "Mario Chef", role: "Kitchen", metric: "23 orders completed", rating: 4.9, avatar: "MC", color: "from-yellow-500/20 to-orange-500/20 text-yellow-600" },
                        { name: "Anna Server", role: "Service", metric: "18 tables served", rating: 4.8, avatar: "AS", color: "from-blue-500/20 to-indigo-500/20 text-blue-600" },
                        { name: "Jake Barista", role: "Bar", metric: "45 drinks made", rating: 4.7, avatar: "JB", color: "from-green-500/20 to-emerald-500/20 text-green-600" }
                      ].map((staff, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={cn("bg-gradient-to-br", staff.color)}>
                              {staff.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{staff.name}</p>
                            <p className="text-sm text-muted-foreground">{staff.metric}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{staff.rating}</span>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* AI Agent Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        AI Agent Performance
                      </CardTitle>
                      <CardDescription>
                        Voice agent effectiveness and usage stats
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {agents.slice(0, 3).map((agent, index) => {
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
                      })}
                      
                      {agents.length === 0 && (
                        <div className="text-center py-8">
                          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No AI agents to analyze</p>
                          <Link href="/dashboard/agents/new">
                            <Button variant="outline" size="sm" className="mt-2">
                              Create Agent
                            </Button>
                          </Link>
                        </div>
                      )}
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
            <Card className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-200 dark:border-orange-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Link href="/dashboard/orders/new" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3 h-12">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Plus className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">New Order</div>
                        <div className="text-xs text-muted-foreground">Create manual order</div>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link href="/dashboard/calls/new" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3 h-12">
                      <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <PhoneCall className="h-4 w-4 text-violet-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Make Call</div>
                        <div className="text-xs text-muted-foreground">AI voice call</div>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link href="/dashboard/menu" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3 h-12">
                      <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <UtensilsCrossed className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Update Menu</div>
                        <div className="text-xs text-muted-foreground">Manage items & pricing</div>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link href="/dashboard/kitchen" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3 h-12">
                      <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <ChefHat className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Kitchen View</div>
                        <div className="text-xs text-muted-foreground">Monitor orders</div>
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
                  <h3 className="font-medium">System Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Restaurant System</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-green-600">Operational</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">AI Voice System</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-green-600">Online</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Payment Gateway</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-green-600">Connected</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Kitchen Display</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-green-600">Synced</span>
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
                    <p className="text-sm font-medium">Optimize AI Agent Performance</p>
                    <p className="text-xs text-muted-foreground">
                      Regularly review call transcripts and update agent responses to improve customer interactions and success rates.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Menu Engineering</p>
                    <p className="text-xs text-muted-foreground">
                      Use analytics to identify your most profitable items and promote them through strategic menu placement and AI agent recommendations.
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