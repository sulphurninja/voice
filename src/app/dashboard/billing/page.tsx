"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  Wallet,
  BarChart3,
  DownloadCloud,
  Plus,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Loader2,
  PhoneCall,
  Clock,
  Radio
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Form schema for wallet recharge
const rechargeSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(val => !isNaN(parseInt(val)), "Amount must be a number")
    .refine(val => parseInt(val) >= 500, "Minimum recharge amount is ₹500"),
});

// Placeholder transaction data - would be fetched from API
const transactions = [
  {
    id: "txn_001",
    date: "2023-06-15",
    description: "Wallet recharge",
    amount: 100000, // ₹1000 in paise
    type: "credit",
    status: "completed",
  },
  {
    id: "txn_002",
    date: "2023-06-10",
    description: "Call to John Doe",
    amount: 1200, // ₹12 in paise
    type: "debit",
    status: "completed",
  },
  {
    id: "txn_003",
    date: "2023-06-01",
    description: "Plan upgrade: Starter to Growth",
    amount: 599900, // ₹5999 in paise
    type: "debit",
    status: "completed",
  },
];

// Plan data
const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    minutes: 0,
    agents: 0,
    extraMinuteRate: null,
    features: [
      "Limited access to features",
      "No calling capabilities",
      "Perfect for exploration",
      "Basic support",
    ],
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: 2499,
    minutes: 300,
    agents: 1,
    extraMinuteRate: null, // No extra minutes for starter
    features: [
      "300 minutes included",
      "1 AI agent",
      "Basic voice selection",
      "Standard support",
    ],
    popular: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: 5999,
    minutes: 800,
    agents: 3,
    extraMinuteRate: 550, // ₹5.50 per minute
    features: [
      "800 minutes included",
      "3 AI agents",
      "Standard voice selection",
      "Priority email support",
      "Purchase Extra Minutes",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 11999,
    minutes: 1800,
    agents: 7,
    extraMinuteRate: 500, // ₹5.00 per minute
    features: [
      "1,800 minutes included",
      "7 AI agents",
      "Premium voice selection",
      "Priority support",
      "Team collaboration",
      "Purchase Extra Minutes",
    ],
    popular: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null, // Custom pricing
    minutes: "5,000+",
    agents: "15+",
    extraMinuteRate: 450, // ₹4.50 per minute
    features: [
      "5,000+ minutes included",
      "15+ AI agents",
      "All premium voices",
      "Dedicated account manager",
      "Custom integrations",
      "Purchase Extra Minutes",
    ],
    popular: false,
  },
];

export default function BillingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoadingRazorpay, setIsLoadingRazorpay] = useState(false);
  const [isRecharging, setIsRecharging] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showRechargeDialog, setShowRechargeDialog] = useState(false);
  const [usageData, setUsageData] = useState({
    minutesUsed: 0,
    totalMinutes: 0,
    walletBalance: 0
  });

  const usagePercentage = usageData.totalMinutes > 0
    ? Math.min(Math.round((usageData.minutesUsed / usageData.totalMinutes) * 100), 100)
    : 0;

  const rechargeForm = useForm<z.infer<typeof rechargeSchema>>({
    resolver: zodResolver(rechargeSchema),
    defaultValues: {
      amount: "1000",
    },
  });

  // Function to load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Fetch initial data
  useEffect(() => {
    // We'll use user data from AuthContext, but in a real app
    // you might want to fetch the latest wallet data
    if (user) {
      setUsageData({
        minutesUsed: user.minutesUsed || 0,
        totalMinutes: user.totalMinutes || 0,
        walletBalance: user.walletBalance || 0
      });
    }
  }, [user]);

  // Handle wallet recharge
  const onRechargeWallet = async (data: z.infer<typeof rechargeSchema>) => {
    try {
      setIsRecharging(true);

      // 1. Load Razorpay if not already loaded
      if (!window.Razorpay) {
        setIsLoadingRazorpay(true);
        const res = await loadRazorpayScript();
        if (!res) {
          throw new Error("Razorpay SDK failed to load");
        }
        setIsLoadingRazorpay(false);
      }

      // 2. Create an order on the server
      const orderResponse = await fetch("/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: parseInt(data.amount) }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const { order } = await orderResponse.json();

      // 3. Open Razorpay payment dialog
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "VoiceFlow AI",
        description: "Wallet Recharge",
        order_id: order.id,
        handler: async function (response: any) {
          // 4. Verify payment on successful completion
          const verifyResponse = await fetch("/api/wallet", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: order.amount,
            }),
          });

          if (!verifyResponse.ok) {
            throw new Error("Payment verification failed");
          }

          const verifyData = await verifyResponse.json();

          // 5. Update UI with new wallet balance
          setUsageData(prev => ({
            ...prev,
            walletBalance: verifyData.walletBalance
          }));

          // 6. Show success message and close dialog
          toast({
            title: "Wallet recharged successfully",
            description: `₹${parseInt(data.amount)} has been added to your wallet.`,
            variant: "default",
          });

          setShowRechargeDialog(false);
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#6366F1",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error("Recharge error:", error);
      toast({
        title: "Recharge failed",
        description: error.message || "An error occurred while processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsRecharging(false);
    }
  };

  // Handle plan upgrade
  // Handle plan upgrade
  const handlePlanUpgrade = async (planId: string) => {
    try {
      setIsUpgrading(true);

      // 1. Load Razorpay if not already loaded
      if (!window.Razorpay) {
        setIsLoadingRazorpay(true);
        const res = await loadRazorpayScript();
        if (!res) {
          throw new Error("Razorpay SDK failed to load");
        }
        setIsLoadingRazorpay(false);
      }

      // 2. Create an order on the server
      const orderResponse = await fetch("/api/billing/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const responseData = await orderResponse.json();

      if (!orderResponse.ok) {
        // Check if it's an enterprise plan that requires contacting sales
        if (responseData.contactSales) {
          toast({
            title: "Enterprise Plan",
            description: "Please contact our sales team for Enterprise plan options",
            variant: "default",
          });
          return;
        }

        throw new Error(responseData.message || "Failed to create order");
      }

      const { order, plan } = responseData;

      // 3. Open Razorpay payment dialog
      const options = {
        key: process.env.RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Wow AI",
        description: `Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
        order_id: order.id,
        handler: async function (response: any) {
          // 4. Verify payment on successful completion
          const verifyResponse = await fetch("/api/billing/upgrade", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan
            }),
          });

          if (!verifyResponse.ok) {
            throw new Error("Payment verification failed");
          }

          const verifyData = await verifyResponse.json();

          // 5. Update UI and state with new plan details
          if (user) {
            // Update auth context - this is simplified, you might need to properly update your auth context
            user.plan = plan;
            user.totalMinutes = verifyData.totalMinutes;
            user.agentsAllowed = verifyData.agentsAllowed;
            user.extraMinuteRate = verifyData.extraMinuteRate;
            user.minutesUsed = 0; // Reset as per the code in your API

            // Update local state
            setUsageData(prev => ({
              ...prev,
              minutesUsed: 0,
              totalMinutes: verifyData.totalMinutes
            }));
          }

          // 6. Show success message
          toast({
            title: "Plan upgraded successfully",
            description: `You have been upgraded to the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.`,
            variant: "default",
          });

          // 7. Refresh the page to ensure all data is updated
          router.refresh();
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#6366F1",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error("Plan upgrade error:", error);
      toast({
        title: "Upgrade failed",
        description: error.message || "An error occurred while processing your upgrade",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };
  // Animation variants
  const fadeInVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  };

  // Get current plan
  const currentPlan = plans.find(plan => plan.id === user?.plan) || plans[0];
  const getPlanLabel = (planId: string) => {
    if (planId === 'free') return "Free";
    if (planId === user?.plan) return "Current";

    // For upgrading/downgrading logic
    const currentPlanIndex = plans.findIndex(p => p.id === user?.plan);
    const targetPlanIndex = plans.findIndex(p => p.id === planId);

    if (currentPlanIndex === -1 || targetPlanIndex === -1) return "Select";

    return targetPlanIndex > currentPlanIndex ? "Upgrade" : "Downgrade";
  };

  // Determine if a plan can be selected
  const canSelectPlan = (planId: string) => {
    // Can't select current plan
    if (planId === user?.plan) return false;

    // Enterprise needs special handling
    if (planId === 'enterprise') return true;

    // Can't downgrade from paid to free directly
    if (planId === 'free' && user?.plan !== 'free') return false;

    return true;
  };


  return (
    <div className="min-h-screen text-foreground flex">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto h-fit max-h-screen bg-background">
        <DashboardHeader />

        <div className="container mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInVariant}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold">Usage & Billing</h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscription, wallet balance, and billing details
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInVariant}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 max-w-md mb-6">
                <TabsTrigger value="overview">
                  <BarChart3 className="h-4 w-4 mr-2" /> Overview
                </TabsTrigger>
                <TabsTrigger value="subscription">
                  <CreditCard className="h-4 w-4 mr-2" /> Subscription
                </TabsTrigger>
                <TabsTrigger value="transactions">
                  <Wallet className="h-4 w-4 mr-2" /> Transactions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Current Plan Card */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Current Plan</CardTitle>
                      <CardDescription>Your active subscription details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
                        <div>
                          <h3 className="font-medium text-xl">{currentPlan.name} Plan</h3>
                          <p className="text-muted-foreground">
                            {currentPlan.id !== 'enterprise'
                              ? `₹${currentPlan.price}/month`
                              : "Custom Pricing"}
                          </p>
                        </div>
                        <Badge className="mt-2 sm:mt-0" variant="outline">Active</Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Usage Stats */}
                        <div>
                          <h3 className="text-sm font-medium mb-2">Usage Statistics</h3>

                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm">Plan Minutes</span>
                                <span className="text-xs text-muted-foreground">
                                  {usageData.minutesUsed} / {usageData.totalMinutes} min
                                </span>
                              </div>
                              <Progress value={usagePercentage} className="h-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Remaining</p>
                                <p className="font-medium">
                                  {Math.max(usageData.totalMinutes - usageData.minutesUsed, 0)} min
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Plan Limits</p>
                                <p className="font-medium">
                                  {currentPlan.agents} Agents
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Wallet Details */}
                        <div>
                          <h3 className="text-sm font-medium mb-2">Wallet Details</h3>

                          <div className="rounded-lg border p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm">Balance</span>
                              <span className="font-medium">
                                {formatCurrency(usageData.walletBalance / 100)}
                              </span>
                            </div>

                            <div className="mb-3">
                              <p className="text-xs text-muted-foreground">Extra Minutes Rate</p>
                              <p className="font-medium">
                                {currentPlan.extraMinuteRate
                                  ? `₹${(currentPlan.extraMinuteRate / 100).toFixed(2)}/min`
                                  : "Not Available"}
                              </p>
                            </div>

                            <Button
                              className="w-full"
                              variant="outline"
                              disabled={!currentPlan.extraMinuteRate}
                              onClick={() => setShowRechargeDialog(true)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Recharge Wallet
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-4 bg-muted/30">
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("subscription")}>
                        Manage Plan
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("transactions")}>
                        View Transactions
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Quick Actions Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common billing operations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setShowRechargeDialog(true)}
                        disabled={!currentPlan.extraMinuteRate}
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Recharge Wallet
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setActiveTab("transactions")}
                      >
                        <DownloadCloud className="h-4 w-4 mr-2" />
                        Download Invoices
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="subscription">
                <div className="grid grid-cols-1 gap-6">
                  {/* Current Subscription */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Subscription</CardTitle>
                      <CardDescription>
                        Your active plan and next billing date
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
                        <div>
                          <h3 className="font-medium text-xl">{currentPlan.name} Plan</h3>
                          <p className="text-muted-foreground">
                            {currentPlan.id !== 'enterprise'
                              ? `₹${currentPlan.price}/month`
                              : "Custom Pricing"}
                          </p>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="bg-primary/10 text-primary text-xs border-primary/20">
                              Active
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="mt-3 sm:mt-0"
                        >
                          Cancel Subscription
                        </Button>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Plan Features</h3>
                          <ul className="space-y-2">
                            {currentPlan.features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Separator />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Available Plans */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Plans</CardTitle>
                      <CardDescription>
                        Choose the right plan for your needs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {plans.map((plan) => (
                          <div
                            key={plan.id}
                            className={cn(
                              "border rounded-lg p-4 transition-colors relative",
                              plan.id === user?.plan
                                ? "border-primary bg-primary/5"
                                : "hover:border-primary/50"
                            )}
                          >
                            {plan.popular && (
                              <div className="absolute -top-3 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                                Popular
                              </div>
                            )}

                            <div className="mb-4">
                              <h3 className="font-medium text-lg">{plan.name}</h3>
                              <p className="text-xl font-bold mt-2">
                                {plan.id !== 'enterprise'
                                  ? `₹${plan.price}/mo`
                                  : "Custom"}
                              </p>
                            </div>

                            <ul className="space-y-2 mb-6">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start text-sm">
                                  <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>

                            <Button
                              variant={plan.id === user?.plan ? "secondary" : "default"}
                              className="w-full"
                              disabled={!canSelectPlan(plan.id) || isUpgrading}
                              onClick={() => plan.id === 'enterprise'
                                ? handlePlanUpgrade(plan.id)
                                : handlePlanUpgrade(plan.id)}
                            >
                              {isUpgrading && plan.id === user?.plan ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : plan.id === user?.plan ? (
                                "Current Plan"
                              ) : plan.id === 'enterprise' ? (
                                "Contact Sales"
                              ) : (
                                getPlanLabel(plan.id)
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          Need a custom solution?{" "}
                          <Button variant="link" className="p-0 h-auto">Contact our sales team</Button>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="transactions">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                      Recent billing activity and payment history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                <div className="font-medium">{transaction.date}</div>
                              </TableCell>
                              <TableCell>{transaction.description}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    transaction.status === 'completed'
                                      ? "bg-success/10 text-success border-success/20"
                                      : "bg-warning/10 text-warning border-warning/20"
                                  )}
                                >
                                  {transaction.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={cn(
                                  "font-medium",
                                  transaction.type === 'credit'
                                    ? "text-success"
                                    : "text-foreground"
                                )}>
                                  {transaction.type === 'credit' ? '+' : '-'}
                                  {formatCurrency(transaction.amount / 100)}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <Button variant="outline" size="sm" disabled>
                        Previous
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Page 1 of 1
                      </p>
                      <Button variant="outline" size="sm" disabled>
                        Next
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/30 flex justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing last 3 transactions
                    </p>
                    <Button variant="outline" size="sm">
                      <DownloadCloud className="h-4 w-4 mr-2" />
                      Download CSV
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      {/* Wallet Recharge Dialog */}
      <Dialog open={showRechargeDialog} onOpenChange={setShowRechargeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recharge Wallet</DialogTitle>
            <DialogDescription>
              Add funds to your wallet for using services beyond your plan limits.
            </DialogDescription>
          </DialogHeader>

          <Form {...rechargeForm}>
            <form onSubmit={rechargeForm.handleSubmit(onRechargeWallet)} className="space-y-6">
              <FormField
                control={rechargeForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                        <Input className="pl-8" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Minimum recharge amount is ₹500
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowRechargeDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isRecharging || isLoadingRazorpay}>
                  {isLoadingRazorpay ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading Payment...
                    </>
                  ) : isRecharging ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
