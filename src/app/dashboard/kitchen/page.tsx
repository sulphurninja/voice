"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertCircle,
  Timer,
  Users,
  Utensils,
  Flame,
  Check,
  ArrowRight,
  MapPin,
} from "lucide-react";

type OrderItem = {
  name: string;
  quantity: number;
  specialInstructions?: string;
};

type KitchenOrder = {
  _id: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  tableNumber?: number;
  estimatedTime: number;
  placedAt: string;
  confirmedAt?: string;
  notes?: string;
};

export default function KitchenPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("active");

  useEffect(() => {
    fetchKitchenOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchKitchenOrders, 30000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchKitchenOrders = async () => {
    try {
      setLoading(true);
      const statusQuery = statusFilter === "active" 
        ? "status=confirmed&status=preparing" 
        : `status=${statusFilter}`;
      
      const response = await fetch(`/api/orders?${statusQuery}&limit=50`);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching kitchen orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchKitchenOrders();
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      confirmed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle, label: "Confirmed" },
      preparing: { color: "bg-orange-100 text-orange-800", icon: Flame, label: "Preparing" },
      ready: { color: "bg-green-100 text-green-800", icon: Check, label: "Ready" },
    };

    const config = configs[status as keyof typeof configs];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'dine_in':
        return <Utensils className="h-4 w-4" />;
      case 'takeaway':
        return <Users className="h-4 w-4" />;
      case 'delivery':
        return <MapPin className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getUrgencyLevel = (placedAt: string, estimatedTime: number) => {
    const orderTime = new Date(placedAt).getTime();
    const now = Date.now();
    const elapsed = (now - orderTime) / (1000 * 60); // minutes
    const estimatedMinutes = estimatedTime;

    if (elapsed > estimatedMinutes + 15) {
      return { level: "overdue", color: "border-red-500 bg-red-50" };
    } else if (elapsed > estimatedMinutes) {
      return { level: "urgent", color: "border-orange-500 bg-orange-50" };
    } else if (elapsed > estimatedMinutes * 0.8) {
      return { level: "warning", color: "border-yellow-500 bg-yellow-50" };
    }
    return { level: "normal", color: "border-gray-200" };
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'confirmed':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return 'delivered';
      default:
        return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case 'confirmed':
        return 'Start Preparing';
      case 'preparing':
        return 'Mark Ready';
      case 'ready':
        return 'Mark Delivered';
      default:
        return null;
    }
  };

  const activeOrders = orders.filter(o => ['confirmed', 'preparing'].includes(o.status));
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="min-h-screen flex">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <DashboardHeader />
        
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <ChefHat className="h-8 w-8" />
                  Kitchen Operations
                </h1>
                <p className="text-muted-foreground mt-2">
                  Real-time order management for kitchen staff
                </p>
              </div>
              
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active Orders</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={fetchKitchenOrders} variant="outline">
                  Refresh
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeOrders.length}</p>
                    <p className="text-sm text-muted-foreground">Active Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Flame className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {orders.filter(o => o.status === 'preparing').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Preparing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{readyOrders.length}</p>
                    <p className="text-sm text-muted-foreground">Ready</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {orders.filter(o => {
                        const urgency = getUrgencyLevel(o.placedAt, o.estimatedTime);
                        return urgency.level === 'overdue';
                      }).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : orders.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No orders in kitchen queue</h3>
                <p className="text-muted-foreground">
                  Orders will appear here when customers place them via AI calls
                </p>
              </div>
            ) : (
              orders.map((order) => {
                const urgency = getUrgencyLevel(order.placedAt, order.estimatedTime);
                const nextStatus = getNextStatus(order.status);
                const nextStatusLabel = getNextStatusLabel(order.status);

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={`${urgency.color} border-2`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg font-mono">
                              {order.orderNumber}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              {getOrderTypeIcon(order.orderType)}
                              <span className="text-sm font-medium">
                                {order.customerName}
                              </span>
                              {order.tableNumber && (
                                <Badge variant="outline" className="text-xs">
                                  Table {order.tableNumber}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(order.status)}
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(order.placedAt), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Order Items */}
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{item.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    ×{item.quantity}
                                  </Badge>
                                </div>
                                {item.specialInstructions && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Note: {item.specialInstructions}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {order.notes && (
                          <div className="p-2 bg-muted/50 rounded-md">
                            <p className="text-sm text-muted-foreground">
                              <strong>Order Notes:</strong> {order.notes}
                            </p>
                          </div>
                        )}

                        {/* Timing Info */}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            Est. Time: {order.estimatedTime}m
                          </span>
                          {urgency.level !== 'normal' && (
                            <Badge 
                              className={
                                urgency.level === 'overdue' 
                                  ? 'bg-red-100 text-red-800' 
                                  : urgency.level === 'urgent'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {urgency.level === 'overdue' ? 'OVERDUE' : 
                               urgency.level === 'urgent' ? 'URGENT' : 'WARNING'}
                            </Badge>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {nextStatus && (
                            <Button
                              onClick={() => updateOrderStatus(order._id, nextStatus)}
                              className="flex-1"
                              variant={
                                order.status === 'confirmed' ? 'default' :
                                order.status === 'preparing' ? 'default' : 'outline'
                              }
                            >
                              {nextStatusLabel}
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                          
                          {order.status === 'ready' && (
                            <Button
                              onClick={() => updateOrderStatus(order._id, 'delivered')}
                              variant="outline"
                              className="flex-1"
                            >
                              Complete Order
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}