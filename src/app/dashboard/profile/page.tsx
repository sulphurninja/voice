"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  Building,
  CreditCard,
  LogOut,
  Shield,
  Key,
  Loader2,
  CheckCircle,
  ExternalLink,
  X,
  Badge,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { WalletBalance } from "@/components/billing/wallet-balance";
import { PlanCard } from "@/components/billing/plan-card";

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phoneNumber: z.string().optional(),
  company: z.string().optional(),
});

// Password form schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileTab, setProfileTab] = useState("account");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: "",
      company: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update the plans data in your component
  const plans = [
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

  // Inside your component, add the following handler
  const handlePlanSelect = (planId: string) => {
    if (planId === 'enterprise') {
      // Redirect to contact sales or open a dialog
      // For now, just show a toast
      toast("Enterprise Plan Seclected");
      return;
    }

    // For other plans, redirect to upgrade page or handle payment
    router.push(`/dashboard/billing?upgrade=${planId}`);
  };

  const onUpdateProfile = async (data: z.infer<typeof profileSchema>) => {
    try {
      setIsUpdatingProfile(true);

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);

    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onUpdatePassword = async (data: z.infer<typeof passwordSchema>) => {
    try {
      setIsUpdatingPassword(true);

      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update password");
      }

      passwordForm.reset();
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);

    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password. Please check your current password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      logout();
      router.push("/login");

    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account");
    }
  };

  // Animation variants
  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
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
            variants={fadeInUpVariant}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and subscription
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
          >
            <Tabs value={profileTab} onValueChange={setProfileTab} className="w-full">
              <TabsList className="grid grid-cols-3 max-w-[400px] mb-6">
                <TabsTrigger value="account">
                  <User className="h-4 w-4 mr-2" /> Account
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="h-4 w-4 mr-2" /> Security
                </TabsTrigger>
                <TabsTrigger value="billing">
                  <CreditCard className="h-4 w-4 mr-2" /> Billing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="account">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Account Information
                      </CardTitle>
                      <CardDescription>
                        Update your personal details
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
                          <div className="flex items-center gap-6 mb-6">
                            <Avatar className="h-20 w-20">
                              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                                {user?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{user?.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {user?.email}
                              </p>
                              {/* <Button
                                variant="link"
                                className="h-auto p-0 text-sm mt-1"
                                disabled
                              >
                                Change profile picture
                              </Button> */}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input className="pl-10" {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={profileForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Address</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input className="pl-10" {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={profileForm.control}
                              name="phoneNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input className="pl-10" {...field} placeholder="(Optional)" />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={profileForm.control}
                              name="company"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input className="pl-10" {...field} placeholder="(Optional)" />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            {updateSuccess && (
                              <p className="text-sm text-success flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Profile updated successfully
                              </p>
                            )}
                            <Button
                              type="submit"
                              className="ml-auto"
                              disabled={isUpdatingProfile}
                            >
                              {isUpdatingProfile ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                "Update Profile"
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          Subscription Plan
                        </CardTitle>
                        <CardDescription>
                          Your current plan and usage
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-medium text-lg">{user?.plan?.charAt(0).toUpperCase() + user?.plan?.slice(1) || "Free"} Plan</h3>
                              <p className="text-sm text-muted-foreground">Monthly billing</p>
                            </div>
                            <Badge variant="secondary" className="text-xs uppercase">Current</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {user?.plan === 'pro'
                              ? "Unlimited calls, multiple agents, premium voices"
                              : user?.plan === 'starter'
                                ? "Up to 200 calls/month, 5 agents, standard voices"
                                : "Up to 20 calls/month, 1 agent, basic voices"}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setProfileTab("billing")}
                        >
                          Manage Subscription
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-destructive border-dashed">
                      <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                          <X className="h-5 w-5" />
                          Delete Account
                        </CardTitle>
                        <CardDescription>
                          Permanently delete your account and all data
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          This action is irreversible and will permanently delete all your data,
                          including contacts, calls, and agents.
                        </p>
                        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full">
                              Delete My Account
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove all your data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteAccount}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-primary" />
                        Change Password
                      </CardTitle>
                      <CardDescription>
                        Update your account password
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-6">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormDescription>
                                  At least 6 characters
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex items-center justify-between pt-2">
                            {passwordSuccess && (
                              <p className="text-sm text-success flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Password updated successfully
                              </p>
                            )}
                            <Button
                              type="submit"
                              className="ml-auto"
                              disabled={isUpdatingPassword}
                            >
                              {isUpdatingPassword ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                "Update Password"
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col gap-6">
                    {/* <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>
                          Manage your account security
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Two-Factor Authentication</h3>
                            <p className="text-sm text-muted-foreground">
                              Add an extra layer of security
                            </p>
                          </div>
                          <Button variant="outline" size="sm" disabled>
                            Enable
                          </Button>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Active Sessions</h3>
                            <p className="text-sm text-muted-foreground">
                              Manage devices logged into your account
                            </p>
                          </div>
                          <Button variant="outline" size="sm" disabled>
                            Manage
                          </Button>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">API Access</h3>
                            <p className="text-sm text-muted-foreground">
                              Create and manage API keys
                            </p>
                          </div>
                          <Button variant="outline" size="sm" disabled>
                            Manage Keys
                          </Button>
                        </div>
                      </CardContent>
                    </Card> */}

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <LogOut className="h-5 w-5 text-primary" />
                          Sign Out
                        </CardTitle>
                        <CardDescription>
                          Sign out from your account
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Sign out from your current session or all devices.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={logout}
                          >
                            Sign Out
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={logout}
                          >
                            Sign Out From All Devices
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="billing">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Subscription Plans</CardTitle>
                        <CardDescription>
                          Choose the right plan for your needs
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {plans.map((plan) => (
                            <PlanCard
                              key={plan.id}
                              id={plan.id}
                              name={plan.name}
                              price={plan.price}
                              minutes={plan.minutes}
                              agents={plan.agents}
                              extraMinuteRate={plan.extraMinuteRate}
                              features={plan.features}
                              isCurrent={plan.id === user?.plan}
                              isPopular={plan.popular}
                              onSelectPlan={handlePlanSelect}
                            />
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-muted/30 flex justify-center">
                        <p className="text-sm text-muted-foreground">
                          Need a custom solution?{" "}
                          <Button variant="link" className="p-0 h-auto">Contact our sales team</Button>
                        </p>
                      </CardFooter>
                    </Card>
                  </div>

                  {/* Add wallet balance */}
                  <WalletBalance
                    walletBalance={user?.walletBalance || 0}
                    minutesUsed={user?.minutesUsed || 0}
                    totalMinutes={user?.totalMinutes || 0}
                    plan={user?.plan || 'starter'}
                    extraMinuteRate={user?.extraMinuteRate}
                  />
                </div>
              </TabsContent>


            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
