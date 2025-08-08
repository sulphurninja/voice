"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  Play,
  Pause,
  StopCircle,
  Edit,
  Users,
  Loader2,
  PhoneCall,
  CheckCircle,
  XCircle,
  AlertCircle,
  VolumeX,
  ChevronRight,
  PlayCircle,
  Info,
  Bot,
  Settings,
  FileText,
  BarChart3,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCall, setSelectedCall] = useState<any>(null);

  // Fetch campaign details
  const { data, error, mutate } = useSWR<{ campaign: any, contacts: any[], calls: any[] }>(
    `/api/campaigns/${params.id}`,
    fetcher
  );

  const campaign = data?.campaign;
  const contacts = data?.contacts || [];
  const calls = data?.calls || [];
  const isLoading = !data && !error;

  // Update only the handleControlCampaign function

  const handleControlCampaign = async (action: string) => {
    try {
      console.log(`Attempting to ${action} campaign ${params.id}`);

      // Show loading toast
      const loadingId = toast.loading(`${action === 'start' ? 'Starting' : action === 'pause' ? 'Pausing' : action === 'resume' ? 'Resuming' : 'Cancelling'} campaign...`);

      const response = await fetch(`/api/campaigns/${params.id}/control`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();

      // Dismiss loading toast
      toast.dismiss(loadingId);

      if (!response.ok) {
        throw new Error(result.message || `Failed to ${action} campaign`);
      }

      console.log(`Campaign ${action} result:`, result);

      // Show details about calls if available
      if (result.callDetails) {
        const { initiated, failed } = result.callDetails;
        if (initiated > 0 || failed > 0) {
          toast.success(
            <div>
              <p>{result.message || `Campaign ${action}ed successfully`}</p>
              <p className="text-sm mt-1">
                {initiated > 0 ? `${initiated} calls initiated. ` : ''}
                {failed > 0 ? `${failed} calls failed.` : ''}
              </p>
            </div>
          );
        } else {
          toast.success(result.message || `Campaign ${action}ed successfully`);
        }
      } else {
        toast.success(result.message || `Campaign ${action}ed successfully`);
      }

      // Refresh the data
      await mutate();
    } catch (error: any) {
      console.error(`Error ${action}ing campaign:`, error);

      // Show error toast
      toast.error(`Failed to ${action} campaign: ${error.message || 'Unknown error'}`);
    }
  };

  // Helper function for status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            Draft
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-500 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800">
            Scheduled
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-500 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
            In Progress
          </Badge>
        );
      case "paused":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-500 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800">
            Paused
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
    }
  };

  // Helper function for call status badges
  const getCallStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="h-3 w-3 mr-1" /> Failed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <PlayCircle className="h-3 w-3 mr-1" /> In Progress
          </Badge>
        );
      case "queued":
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="h-3 w-3 mr-1" /> Queued
          </Badge>
        );
      case "initiated":
        return (
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Initiated
          </Badge>
        );
      case "no-answer":
        return (
          <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted/20">
            <AlertCircle className="h-3 w-3 mr-1" /> No Answer
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted/20">
            {status}
          </Badge>
        );
    }
  };

  // Calculate campaign statistics
  const calculateStats = () => {
    if (!campaign) return { progress: 0, totalCalls: 0, completed: 0, failed: 0, inProgress: 0, queued: 0 };

    const totalCalls = calls.length;
    const completed = calls.filter(call => call.status === 'completed').length;
    const failed = calls.filter(call => call.status === 'failed' || call.status === 'no-answer').length;
    const inProgress = calls.filter(call => call.status === 'in-progress' || call.status === 'initiated').length;
    const queued = calls.filter(call => call.status === 'queued').length;

    const progress = campaign.totalContacts > 0
      ? Math.round(((completed + failed) / campaign.totalContacts) * 100)
      : 0;

    return { progress, totalCalls, completed, failed, inProgress, queued };
  };

  const stats = calculateStats();

  // Animation variants
  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen text-foreground flex">
        <DashboardSidebar />
        <main className="flex-1 flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen text-foreground flex">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col items-center justify-center bg-background">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Campaign Not Found</h2>
            <p className="text-muted-foreground mb-6">The campaign you're looking for doesn't exist or was deleted.</p>
            <Button onClick={() => router.push('/dashboard/campaigns')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </div>
        </main>
      </div>
    );
  }

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
          >
            {/* Header with back button and campaign title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard/campaigns')}
                  className="h-9 w-9 p-0 rounded-full mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{campaign.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>Created {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}</span>
                    <span>•</span>
                    {getStatusBadge(campaign.status)}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {/* Control buttons based on campaign status */}
                {campaign.status === 'draft' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/dashboard/campaigns/${params.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Campaign
                    </Button>
                    <Button onClick={() => handleControlCampaign('start')}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Campaign
                    </Button>
                  </>
                )}

                {campaign.status === 'in-progress' && (
                  <Button onClick={() => handleControlCampaign('pause')}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Campaign
                  </Button>
                )}

                {campaign.status === 'paused' && (
                  <Button onClick={() => handleControlCampaign('resume')}>
                    <Play className="h-4 w-4 mr-2" />
                    Resume Campaign
                  </Button>
                )}

                {['in-progress', 'paused', 'scheduled'].includes(campaign.status) && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this campaign? This action cannot be undone.')) {
                        handleControlCampaign('cancel');
                      }
                    }}
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    Cancel Campaign
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Campaign description */}
          {campaign.description && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariant}
              className="mb-6"
            >
              <p className="text-muted-foreground">{campaign.description}</p>
            </motion.div>
          )}

          {/* Main content tabs */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="overview">
                  <BarChart3 className="h-4 w-4 mr-2" /> Overview
                </TabsTrigger>
                <TabsTrigger value="contacts">
                  <Users className="h-4 w-4 mr-2" /> Contacts
                </TabsTrigger>
                <TabsTrigger value="calls">
                  <PhoneCall className="h-4 w-4 mr-2" /> Calls
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Progress card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Progress</CardTitle>
                    <CardDescription>
                      Overall progress and statistics for this campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Progress chart */}
                      <div className="w-full md:w-2/5">
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="relative flex items-center justify-center mb-4">
                            <svg className="w-40 h-40" viewBox="0 0 100 100">
                              <circle
                                className="text-muted stroke-current"
                                strokeWidth="8"
                                fill="transparent"
                                r="40"
                                cx="50"
                                cy="50"
                              />
                              <circle
                                className="text-primary stroke-current"
                                strokeWidth="8"
                                strokeLinecap="round"
                                fill="transparent"
                                r="40"
                                cx="50"
                                cy="50"
                                strokeDasharray={`${stats.progress * 2.51} 251`}
                                strokeDashoffset="0"
                                transform="rotate(-90 50 50)"
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                              <span className="text-4xl font-bold">{stats.progress}%</span>
                              <span className="text-sm text-muted-foreground">Completed</span>
                            </div>
                          </div>

                          <div className="text-center mt-2">
                            <p className="text-sm text-muted-foreground">
                              {campaign.completedCalls || 0} of {campaign.totalContacts} contacts called
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stats breakdown */}
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Completed</p>
                              <p className="text-2xl font-semibold">{stats.completed}</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-success" />
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Failed</p>
                              <p className="text-2xl font-semibold">{stats.failed}</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                              <XCircle className="h-4 w-4 text-destructive" />
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">In Progress</p>
                              <p className="text-2xl font-semibold">{stats.inProgress}</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <PlayCircle className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Queued</p>
                              <p className="text-2xl font-semibold">{stats.queued}</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-warning" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Campaign details card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Agent</h3>
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{campaign.agentId?.name || "Unknown Agent"}</span>
                          </div>
                        </div>

                        {campaign.scheduledStartTime && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Scheduled Start</h3>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{format(new Date(campaign.scheduledStartTime), "PPp")}</span>
                            </div>
                          </div>
                        )}

                        {campaign.dailyStartTime && campaign.dailyEndTime && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Daily Calling Hours</h3>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{campaign.dailyStartTime} - {campaign.dailyEndTime}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {campaign.maxConcurrentCalls && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Max Concurrent Calls</h3>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{campaign.maxConcurrentCalls}</span>
                            </div>
                          </div>
                        )}

                        {campaign.callsBetweenPause && campaign.pauseDuration && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Pacing</h3>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>Pause for {campaign.pauseDuration} minutes after every {campaign.callsBetweenPause} calls</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {campaign.customMessage && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Custom Message</h3>
                        <div className="p-4 bg-muted rounded-md text-sm">
                          {campaign.customMessage}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contacts Tab */}
              <TabsContent value="contacts" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact List</CardTitle>
                    <CardDescription>
                      {campaign.totalContacts} contacts in this campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {contacts.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Phone Number</TableHead>
                              <TableHead>Call Status</TableHead>
                              <TableHead>Last Called</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {contacts.map((contact) => {
                              // Find the most recent call for this contact
                              const latestCall = calls.find(call =>
                                call.contactId === contact._id || call.phoneNumber === contact.phoneNumber
                              );

                              return (
                                <TableRow key={contact._id}>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center">
                                      <Avatar className="h-8 w-8 mr-2">
                                        <AvatarFallback className="text-xs">
                                          {contact.name?.charAt(0) || 'C'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>{contact.name || "Unnamed Contact"}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{contact.phoneNumber}</TableCell>
                                  <TableCell>
                                    {latestCall ? (
                                      getCallStatusBadge(latestCall.status)
                                    ) : (
                                      <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
                                        Not Called
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {latestCall?.startTime ? (
                                      format(new Date(latestCall.startTime), "MMM d, h:mm a")
                                    ) : (
                                      "—"
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">No contacts found in this campaign</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Calls Tab */}
              <TabsContent value="calls" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Call History</CardTitle>
                    <CardDescription>
                      All calls made as part of this campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {calls.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Contact</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Start Time</TableHead>
                              <TableHead>End Time</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {calls.map((call) => (
                              <TableRow key={call._id}>
                                <TableCell>
                                  <div className="font-medium">{call.contactName || "Unknown"}</div>
                                  <div className="text-xs text-muted-foreground">{call.phoneNumber}</div>
                                </TableCell>
                                <TableCell>{getCallStatusBadge(call.status)}</TableCell>
                                <TableCell>
                                  {call.duration ? (
                                    `${Math.floor(call.duration / 60)}m ${call.duration % 60}s`
                                  ) : (
                                    "—"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {call.startTime ? (
                                    format(new Date(call.startTime), "MMM d, h:mm a")
                                  ) : (
                                    "—"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {call.endTime ? (
                                    format(new Date(call.endTime), "MMM d, h:mm a")
                                  ) : (
                                    "—"
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedCall(call)}
                                  >
                                    View Details
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">No calls have been made yet for this campaign</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Settings</CardTitle>
                    <CardDescription>
                      Manage campaign configuration and control
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Campaign Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {['draft', 'scheduled'].includes(campaign.status) && (
                            <Card className="border-2 border-primary/20">
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="font-medium">Start Campaign</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Begin making calls to all contacts in this campaign
                                    </p>
                                  </div>
                                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Play className="h-5 w-5 text-primary" />
                                  </div>
                                </div>
                                <Button
                                  className="w-full"
                                  onClick={() => handleControlCampaign('start')}
                                >
                                  Start Now
                                </Button>
                              </CardContent>
                            </Card>
                          )}

                          {campaign.status === 'in-progress' && (
                            <Card className="border-2 border-yellow-200 dark:border-yellow-800">
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="font-medium">Pause Campaign</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Temporarily stop making new calls
                                    </p>
                                  </div>
                                  <div className="h-9 w-9 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                                    <Pause className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  className="w-full border-yellow-200 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-950"
                                  onClick={() => handleControlCampaign('pause')}
                                >
                                  Pause Campaign
                                </Button>
                              </CardContent>
                            </Card>
                          )}

                          {campaign.status === 'paused' && (
                            <Card className="border-2 border-primary/20">
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="font-medium">Resume Campaign</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Continue making calls where you left off
                                    </p>
                                  </div>
                                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Play className="h-5 w-5 text-primary" />
                                  </div>
                                </div>
                                <Button
                                  className="w-full"
                                  onClick={() => handleControlCampaign('resume')}
                                >
                                  Resume Campaign
                                </Button>
                              </CardContent>
                            </Card>
                          )}

                          {['in-progress', 'paused', 'scheduled'].includes(campaign.status) && (
                            <Card className="border-2 border-destructive/20">
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="font-medium">Cancel Campaign</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Stop all current and future calls for this campaign
                                    </p>
                                  </div>
                                  <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <StopCircle className="h-5 w-5 text-destructive" />
                                  </div>
                                </div>
                                <Button
                                  variant="destructive"
                                  className="w-full"
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to cancel this campaign? This action cannot be undone.')) {
                                      handleControlCampaign('cancel');
                                    }
                                  }}
                                >
                                  Cancel Campaign
                                </Button>
                              </CardContent>
                            </Card>
                          )}

                          {campaign.status === 'draft' && (
                            <Card>
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="font-medium">Edit Campaign</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Modify campaign details and settings
                                    </p>
                                  </div>
                                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                                    <Edit className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => router.push(`/dashboard/campaigns/${params.id}/edit`)}
                                >
                                  Edit Campaign
                                </Button>
                              </CardContent>
                            </Card>
                          )}

                          {['draft', 'completed', 'cancelled'].includes(campaign.status) && (
                            <Card>
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="font-medium">Delete Campaign</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Permanently remove this campaign
                                    </p>
                                  </div>
                                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                                    <Trash2 className="h-5 w-5 text-destructive" />
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
                                      fetch(`/api/campaigns/${params.id}`, {
                                        method: 'DELETE'
                                      }).then(() => {
                                        router.push('/dashboard/campaigns');
                                      }).catch(err => {
                                        console.error('Error deleting campaign:', err);
                                        alert('Failed to delete campaign');
                                      });
                                    }
                                  }}
                                >
                                  Delete Campaign
                                </Button>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-medium mb-4">Campaign Information</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Campaign ID</p>
                              <p className="font-mono text-xs mt-1">{campaign._id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Created</p>
                              <p className="text-sm mt-1">{format(new Date(campaign.createdAt), "PPpp")}</p>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <p className="text-sm text-muted-foreground">Total Contacts</p>
                            <p className="text-sm mt-1">{campaign.totalContacts}</p>
                          </div>

                          <Separator />

                          <div>
                            <p className="text-sm text-muted-foreground">Campaign Stats</p>
                            <div className="grid grid-cols-4 gap-2 mt-2">
                              <div className="border rounded p-2 text-center">
                                <p className="text-xs text-muted-foreground">Completed</p>
                                <p className="font-medium">{stats.completed}</p>
                              </div>
                              <div className="border rounded p-2 text-center">
                                <p className="text-xs text-muted-foreground">Failed</p>
                                <p className="font-medium">{stats.failed}</p>
                              </div>
                              <div className="border rounded p-2 text-center">
                                <p className="text-xs text-muted-foreground">In Progress</p>
                                <p className="font-medium">{stats.inProgress}</p>
                              </div>
                              <div className="border rounded p-2 text-center">
                                <p className="text-xs text-muted-foreground">Queued</p>
                                <p className="font-medium">{stats.queued}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Call Details Dialog */}
        <Dialog open={!!selectedCall} onOpenChange={(open) => !open && setSelectedCall(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Call Details</DialogTitle>
              <DialogDescription>
                Complete information about this call
              </DialogDescription>
            </DialogHeader>
            {selectedCall && (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-4 pb-2">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {(selectedCall.contactName?.charAt(0) || 'C')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-lg">{selectedCall.contactName || "Unknown"}</h3>
                    <p className="text-muted-foreground">{selectedCall.phoneNumber}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div>{getCallStatusBadge(selectedCall.status)}</div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Agent</p>
                    <p className="font-medium text-sm">{campaign.agentId?.name || "—"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Start Time</p>
                    <p className="text-sm">
                      {selectedCall.startTime
                        ? format(new Date(selectedCall.startTime), "MMM d, yyyy h:mm a")
                        : "—"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm">
                      {selectedCall.duration
                        ? `${Math.floor(selectedCall.duration / 60)}m ${selectedCall.duration % 60}s`
                        : "—"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="text-sm">₹{selectedCall.cost?.toFixed(2) || "0.00"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Call ID</p>
                    <p className="text-sm font-mono text-xs">{selectedCall._id?.substring(0, 8) || "—"}</p>
                  </div>
                </div>

                {selectedCall.notes && (
                  <div className="space-y-1 pt-2">
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {selectedCall.notes}
                    </div>
                  </div>
                )}

                {selectedCall.summary && (
                  <div className="space-y-1 pt-2">
                    <p className="text-xs text-muted-foreground">Summary</p>
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {selectedCall.summary}
                    </div>
                  </div>
                )}

                {selectedCall.transcription && (
                  <div className="space-y-1 pt-2">
                    <p className="text-xs text-muted-foreground">Transcription</p>
                    <div className="max-h-40 overflow-y-auto p-3 bg-muted rounded-md text-sm">
                      {selectedCall.transcription}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Implement initiating a new call to this contact
                      router.push(`/dashboard/calls?contactId=${selectedCall.contactId}&phoneNumber=${selectedCall.phoneNumber}&name=${selectedCall.contactName}`);
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Again
                  </Button>
                  <Button onClick={() => setSelectedCall(null)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
