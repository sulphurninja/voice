"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { format } from "date-fns";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Calendar,
  Clock,
  Phone,
  Play,
  Pause,
  StopCircle,
  Trash2,
  Edit,
  Users,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  ChevronRight,
  Loader2,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CampaignsPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch campaigns
  const { data, error, mutate } = useSWR<{ campaigns: any[], pagination: any }>(
    "/api/campaigns?limit=50",
    fetcher
  );

  const campaigns = data?.campaigns || [];
  const isLoading = !data && !error;

  // Filter campaigns based on status and search query
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = filterStatus === "all" || campaign.status === filterStatus;
    const matchesSearch = searchQuery === "" ||
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (campaign.description && campaign.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const handleControlCampaign = async (campaignId: string, action: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/control`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${action} campaign`);
      }

      await mutate(); // Refresh data
    } catch (error) {
      console.error(`Error ${action}ing campaign:`, error);
      alert(`Error: ${error instanceof Error ? error.message : 'Something went wrong'}`);
    }
  };

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
          <Badge variant="outline" className="bg-blue-500 text-white -500 border-blue-200  dark:border-blue-800">
            Scheduled
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-green-500 text-white -500 border-green-200 ">
            In Progress
          </Badge>
        );
      case "paused":
        return (
          <Badge variant="outline" className="bg-yellow-600 text-white -500 border-yellow-200   ">
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

  // Calculate campaign progress
  const calculateProgress = (campaign: any) => {
    if (!campaign.totalContacts) return 0;
    return Math.round((campaign.completedCalls / campaign.totalContacts) * 100);
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

        <div className="mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Call Campaigns</h1>
                <p className="text-muted-foreground">
                  Manage your AI voice call campaigns and track their performance
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="default" onClick={() => router.push("/dashboard/campaigns/new")}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Tabs value={filterStatus} onValueChange={setFilterStatus}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="in-progress">Active</TabsTrigger>
                    <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                    <TabsTrigger value="draft">Draft</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                </Tabs>

                <Button variant="outline" size="icon" onClick={() => mutate()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
          >
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredCampaigns.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Contacts</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCampaigns.map((campaign) => (
                        <TableRow
                          key={campaign._id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => router.push(`/dashboard/campaigns/${campaign._id}`)}
                        >
                          <TableCell className="font-medium">
                            <div>
                              <p>{campaign.name}</p>
                              {campaign.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-xs">
                                  {campaign.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{campaign.totalContacts}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="w-32">
                              <div className="flex justify-between text-xs mb-1">
                                <span>{campaign.completedCalls || 0} calls</span>
                                <span>{calculateProgress(campaign)}%</span>
                              </div>
                              <Progress value={calculateProgress(campaign)} className="h-1.5" />
                            </div>
                          </TableCell>
                          <TableCell>
                            {campaign.agentId?.name || "Unknown Agent"}
                          </TableCell>
                          <TableCell>
                            {format(new Date(campaign.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/campaigns/${campaign._id}`);
                                }}>
                                  View Details
                                </DropdownMenuItem>

                                {campaign.status === 'draft' && (
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/dashboard/campaigns/${campaign._id}/edit`);
                                  }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Campaign
                                  </DropdownMenuItem>
                                )}

                                {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleControlCampaign(campaign._id, 'start');
                                  }}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Start Campaign
                                  </DropdownMenuItem>
                                )}

                            {campaign.status === 'in-progress' && (
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleControlCampaign(campaign._id, 'pause');
                                  }}>
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pause Campaign
                                  </DropdownMenuItem>
                                )}

                                {campaign.status === 'paused' && (
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleControlCampaign(campaign._id, 'resume');
                                  }}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Resume Campaign
                                  </DropdownMenuItem>
                                )}

                                {['in-progress', 'paused', 'scheduled'].includes(campaign.status) && (
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Are you sure you want to cancel this campaign? This cannot be undone.')) {
                                      handleControlCampaign(campaign._id, 'cancel');
                                    }
                                  }}>
                                    <StopCircle className="h-4 w-4 mr-2" />
                                    Cancel Campaign
                                  </DropdownMenuItem>
                                )}

                                {['draft', 'completed', 'cancelled'].includes(campaign.status) && (
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Are you sure you want to delete this campaign? This cannot be undone.')) {
                                      // Delete campaign API call
                                      fetch(`/api/campaigns/${campaign._id}`, {
                                        method: 'DELETE'
                                      }).then(() => {
                                        mutate();
                                      }).catch(err => {
                                        console.error('Error deleting campaign:', err);
                                        alert('Failed to delete campaign');
                                      });
                                    }
                                  }}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Campaign
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Phone className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Campaigns Found</h3>
                    <p className="text-muted-foreground text-center mb-6 max-w-md">
                      {searchQuery || filterStatus !== 'all'
                        ? "No campaigns match your current filters. Try adjusting your search or filter criteria."
                        : "You haven't created any call campaigns yet. Create your first campaign to start making bulk AI voice calls."}
                    </p>
                    <Button onClick={() => router.push('/dashboard/campaigns/new')}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Your First Campaign
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
