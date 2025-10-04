"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Filter,
  Settings,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Building,
  User,
  Clock,
  Target,
  TrendingUp,
  Users,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  X,
  RefreshCw,
  Upload,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
  Star,
  MapPin,
  Briefcase,
  Tag,
  Activity,
  Globe,
  Zap,
  PieChart,
  BarChart3,
  ChevronDown,
  SlidersHorizontal,
  Grid3X3,
  List,
  Columns,
  FileSpreadsheet,
  Download,
  PlayCircle,
  PauseCircle,
  StopCircle,
  AlertTriangle,
  TrendingDown,
  Award,
  Sparkles,
  CloudLightning
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, formatDistanceToNow, isThisWeek, isToday } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Types
type Stage = {
  _id: string;
  name: string;
  color: string;
  order: number;
};

type Pipeline = {
  _id: string;
  name: string;
  description?: string;
  stages: Stage[];
  isDefault: boolean;
};

type Lead = {
  _id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  company?: string;
  jobTitle?: string;
  value?: number;
  source?: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  tags?: string[];
  assignedTo?: any;
  lastActivity?: string;
  expectedCloseDate?: string;
  pipelineId: string;
  stageId: string;
  createdAt: string;
  updatedAt: string;
  campaignId?: string;
  callStatus?: 'pending' | 'calling' | 'completed' | 'failed';
  lastCalled?: string;
};

type Campaign = {
  _id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'in-progress' | 'completed' | 'paused' | 'cancelled';
  totalContacts: number;
  completedCalls: number;
  successfulCalls: number;
  failedCalls: number;
  createdAt: string;
};

// Form schemas
const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email().optional().or(z.literal("")),
  phoneNumber: z.string().min(7, "Phone number is required"),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  value: z.number().min(0).optional(),
  source: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  pipelineId: z.string().min(1, "Pipeline is required"),
  stageId: z.string().min(1, "Stage is required"),
  expectedCloseDate: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  createContact: z.boolean().optional(),
});

const importSchema = z.object({
  file: z.any().refine((file) => file instanceof File, "File is required"),
  pipelineId: z.string().min(1, "Pipeline is required"),
  stageId: z.string().min(1, "Stage is required"),
  agentId: z.string().min(1, "Agent is required"),
  campaignName: z.string().min(2, "Campaign name is required"),
  autoLaunch: z.boolean().default(true),
});

const priorityConfig = {
  low: {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
    icon: "bg-emerald-500",
    label: "Low Priority"
  },
  medium: {
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    icon: "bg-amber-500",
    label: "Medium Priority"
  },
  high: {
    color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300",
    icon: "bg-rose-500",
    label: "High Priority"
  },
};

const sourceOptions = [
  "Website",
  "Social Media",
  "Referral",
  "Email Campaign",
  "Cold Call",
  "Trade Show",
  "Advertisement",
  "Partner",
  "Other"
];

function LeadsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // State
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddLead, setShowAddLead] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isMovingLead, setIsMovingLead] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [importProgress, setImportProgress] = useState({
    stage: 'idle' as 'idle' | 'uploading' | 'processing' | 'countdown' | 'launching' | 'complete',
    progress: 0,
    countdown: 0,
    message: '',
    processedData: null as any,
    campaignId: null as string | null,
  });

  // Filters
  const [filters, setFilters] = useState({
    priority: [] as string[],
    source: [] as string[],
    assignedTo: [] as string[],
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month',
    valueRange: { min: 0, max: 1000000 },
    campaignStatus: [] as string[]
  });

  const [showFilters, setShowFilters] = useState(false);

  const form = useForm<z.infer<typeof leadSchema>>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      priority: 'medium',
      createContact: true,
    },
  });

  const importForm = useForm<z.infer<typeof importSchema>>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      autoLaunch: true,
    },
  });

  const selectedPipelineId = form.watch("pipelineId");
  const importPipelineId = importForm.watch("pipelineId");

  // Fetch data
  useEffect(() => {
    fetchPipelines();
    fetchAgents();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedPipeline) {
      fetchLeads(selectedPipeline._id);
    }
  }, [selectedPipeline]);

  useEffect(() => {
    const pipelineParam = searchParams.get('pipeline');
    if (pipelineParam && pipelines.length > 0) {
      const pipeline = pipelines.find(p => p._id === pipelineParam);
      if (pipeline) {
        setSelectedPipeline(pipeline);
      }
    }
  }, [searchParams, pipelines]);

  const fetchPipelines = async () => {
    try {
      const response = await fetch("/api/pipelines");
      if (response.ok) {
        const data = await response.json();
        setPipelines(data.pipelines);
        const defaultPipeline = data.pipelines.find((p: Pipeline) => p.isDefault);
        setSelectedPipeline(defaultPipeline || data.pipelines[0]);
      }
    } catch (error) {
      console.error("Error fetching pipelines:", error);
      toast({
        title: "Error",
        description: "Failed to load pipelines",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/campaigns?limit=50");
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const fetchLeads = async (pipelineId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leads?pipelineId=${pipelineId}&limit=100`);
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads);
      } else {
        toast({
          title: "Error",
          description: "Failed to load leads",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        title: "Error",
        description: "Failed to load leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (data: z.infer<typeof leadSchema>) => {
    try {
      const payload = {
        ...data,
        value: data.value || 0,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        expectedCloseDate: data.expectedCloseDate || null,
      };

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setLeads(prev => [...prev, result.lead]);
        setShowAddLead(false);
        form.reset();
        toast({
          title: "Success",
          description: "Lead created successfully",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to create lead",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating lead:", error);
      toast({
        title: "Error",
        description: "Failed to create lead",
        variant: "destructive",
      });
    }
  };

  const handleFileImport = async (data: z.infer<typeof importSchema>) => {
    try {
      setImportProgress({
        stage: 'uploading',
        progress: 0,
        countdown: 0,
        message: 'Uploading file...',
        processedData: null,
        campaignId: null,
      });

      // Upload and process file
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('agentId', data.agentId);

      const uploadResponse = await fetch('/api/calls', {
        method: 'PUT',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const uploadResult = await uploadResponse.json();

      setImportProgress(prev => ({
        ...prev,
        stage: 'processing',
        progress: 30,
        message: 'Processing contacts...',
      }));

      // Create leads from contacts
      const leads = [];
      let processed = 0;
      for (const contactId of uploadResult.uploadedContacts) {
        try {
          const response = await fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contactId,
              pipelineId: data.pipelineId,
              stageId: data.stageId,
              createContact: false,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            leads.push(result.lead);
          }
          processed++;
          setImportProgress(prev => ({
            ...prev,
            progress: 30 + (processed / uploadResult.uploadedContacts.length) * 40,
          }));
        } catch (error) {
          console.error('Error creating lead:', error);
        }
      }

      // Create campaign
      setImportProgress(prev => ({
        ...prev,
        stage: 'processing',
        progress: 70,
        message: 'Creating campaign...',
      }));

      const campaignResponse = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.campaignName,
          agentId: data.agentId,
          contacts: uploadResult.uploadedContacts,
          maxConcurrentCalls: 3,
        }),
      });

      if (!campaignResponse.ok) {
        throw new Error('Failed to create campaign');
      }

      const campaign = await campaignResponse.json();

      setImportProgress(prev => ({
        ...prev,
        progress: 100,
        processedData: {
          campaign: campaign.campaign,
          leads,
          contacts: uploadResult.uploadedContacts.length,
        },
        campaignId: campaign.campaign._id,
      }));

      // Auto-launch countdown if enabled
      if (data.autoLaunch) {
        setImportProgress(prev => ({
          ...prev,
          stage: 'countdown',
          countdown: 5,
          message: 'Launching campaign in...',
        }));

        // Countdown
        for (let i = 5; i > 0; i--) {
          setImportProgress(prev => ({
            ...prev,
            countdown: i,
          }));
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Launch campaign
        setImportProgress(prev => ({
          ...prev,
          stage: 'launching',
          message: 'Starting campaign...',
        }));

        const launchResponse = await fetch(`/api/campaigns/${campaign.campaign._id}/control`, {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: 'start' }),
        });

        if (launchResponse.ok) {
          setImportProgress(prev => ({
            ...prev,
            stage: 'complete',
            message: 'Campaign launched successfully!',
          }));

          // Refresh data
          setTimeout(() => {
            fetchLeads(selectedPipeline?._id || '');
            fetchCampaigns();
            setShowImport(false);
            setImportProgress({
              stage: 'idle',
              progress: 0,
              countdown: 0,
              message: '',
              processedData: null,
              campaignId: null,
            });
          }, 2000);
        }
      } else {
        setImportProgress(prev => ({
          ...prev,
          stage: 'complete',
          message: 'Import completed successfully!',
        }));
      }

      toast({
        title: "Success",
        description: `Imported ${leads.length} leads and created campaign "${data.campaignName}"`,
      });

    } catch (error) {
      console.error("Error importing file:", error);
      setImportProgress(prev => ({
        ...prev,
        stage: 'idle',
        message: 'Import failed',
      }));
      toast({
        title: "Error",
        description: "Failed to import leads",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || !selectedPipeline) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      setIsMovingLead(true);

      const draggedLead = leads.find(lead => lead._id === draggableId);
      if (draggedLead) {
        const updatedLeads = leads.map(lead =>
          lead._id === draggableId
            ? { ...lead, stageId: destination.droppableId }
            : lead
        );
        setLeads(updatedLeads);
      }

      const newStageId = destination.droppableId;

      const response = await fetch(`/api/leads/${draggableId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStageId,
          newPipelineId: selectedPipeline._id,
        }),
      });

      if (!response.ok) {
        setLeads(leads);
        throw new Error('Failed to move lead');
      }

      toast({
        title: "Success",
        description: "Lead moved successfully",
      });
    } catch (error) {
      console.error("Error moving lead:", error);
      toast({
        title: "Error",
        description: "Failed to move lead",
        variant: "destructive",
      });
    } finally {
      setIsMovingLead(false);
    }
  };

  // Filtered leads based on search and filters
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          lead.name.toLowerCase().includes(searchLower) ||
          lead.company?.toLowerCase().includes(searchLower) ||
          lead.email?.toLowerCase().includes(searchLower) ||
          lead.phoneNumber.includes(searchTerm) ||
          lead.tags?.some(tag => tag.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;
      }

      if (filters.priority.length > 0 && !filters.priority.includes(lead.priority)) {
        return false;
      }

      if (filters.source.length > 0 && lead.source && !filters.source.includes(lead.source)) {
        return false;
      }

      if (filters.dateRange !== 'all') {
        const leadDate = new Date(lead.createdAt);
        const now = new Date();

        switch (filters.dateRange) {
          case 'today':
            if (!isToday(leadDate)) return false;
            break;
          case 'week':
            if (!isThisWeek(leadDate)) return false;
            break;
          case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            if (leadDate < monthStart) return false;
            break;
        }
      }

      const leadValue = lead.value || 0;
      if (leadValue < filters.valueRange.min || leadValue > filters.valueRange.max) {
        return false;
      }

      return true;
    });
  }, [leads, searchTerm, filters]);

  // Group leads by stage
  const leadsByStage = selectedPipeline
    ? selectedPipeline.stages.reduce((acc, stage) => {
      acc[stage._id] = filteredLeads.filter(lead => lead.stageId === stage._id);
      return acc;
    }, {} as Record<string, Lead[]>)
    : {};

  // Calculate pipeline stats
  const pipelineStats = useMemo(() => {
    const totalLeads = filteredLeads.length;
    const totalValue = filteredLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
    const avgLeadValue = totalLeads > 0 ? totalValue / totalLeads : 0;

    // Campaign stats
    const activeCampaigns = campaigns.filter(c => c.status === 'in-progress').length;
    const totalCalls = campaigns.reduce((sum, c) => sum + c.completedCalls, 0);
    const successfulCalls = campaigns.reduce((sum, c) => sum + c.successfulCalls, 0);
    const conversionRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

    const stageStats = selectedPipeline?.stages.map(stage => {
      const stageLeads = leadsByStage[stage._id] || [];
      return {
        ...stage,
        count: stageLeads.length,
        value: stageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0),
        percentage: totalLeads > 0 ? (stageLeads.length / totalLeads) * 100 : 0
      };
    }) || [];

    return {
      totalLeads,
      totalValue,
      avgLeadValue,
      activeCampaigns,
      totalCalls,
      conversionRate,
      stageStats
    };
  }, [filteredLeads, leadsByStage, selectedPipeline, campaigns]);

  const uniqueSources = [...new Set(leads.map(lead => lead.source).filter(Boolean))];

  const clearFilters = () => {
    setFilters({
      priority: [],
      source: [],
      assignedTo: [],
      dateRange: 'all',
      valueRange: { min: 0, max: 1000000 },
      campaignStatus: []
    });
    setSearchTerm("");
  };

  const hasActiveFilters = searchTerm ||
    filters.priority.length > 0 ||
    filters.source.length > 0 ||
    filters.assignedTo.length > 0 ||
    filters.dateRange !== 'all';

  // Animation variants
  const containerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const staggerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  if (loading && pipelines.length === 0) {
    return (
      <div className="min-h-screen flex">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto">
          <DashboardHeader />
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 mx-auto rounded-full border-2 border-muted flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Loading Your Pipeline</h3>
                <p className="text-muted-foreground">Setting up your lead management workspace...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <DashboardSidebar />

      <main className="flex-1 overflow-hidden">
        <DashboardHeader />

        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
            {/* Header Section */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariant}
              className="space-y-6"
            >
              {/* Title and Actions */}
              <motion.div variants={cardVariant} className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center">
                      <Target className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">
                        Lead Management
                      </h1>
                      <p className="text-muted-foreground">
                        Track, manage, and convert your sales pipeline efficiently
                      </p>
                    </div>
                  </div>

                  {/* Quick Campaign Stats */}
                  {pipelineStats.activeCampaigns > 0 && (
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="font-medium">{pipelineStats.activeCampaigns} active campaigns</span>
                      </div>
                      <div className="text-muted-foreground">
                        {pipelineStats.totalCalls} calls • {pipelineStats.conversionRate.toFixed(1)}% success rate
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
                    className="gap-2"
                  >
                    {viewMode === 'kanban' ? <List className="h-4 w-4" /> : <Columns className="h-4 w-4" />}
                    {viewMode === 'kanban' ? 'List View' : 'Board View'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowImport(true)}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Import Leads
                  </Button>

                  <Link href="/dashboard/leads/customize">
                    <Button variant="outline" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Customize
                    </Button>
                  </Link>

                  <Button onClick={() => setShowAddLead(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Lead
                  </Button>
                </div>
              </motion.div>

              {/* Enhanced Stats Dashboard */}
              <motion.div variants={staggerVariant} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div variants={cardVariant}>
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                          <p className="text-3xl font-bold">{pipelineStats.totalLeads}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            +12% from last month
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariant}>
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
                          <p className="text-3xl font-bold">₹{(pipelineStats.totalValue / 100000).toFixed(1)}L</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            +8% this week
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-emerald-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariant}>
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                          <p className="text-3xl font-bold">{pipelineStats.activeCampaigns}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {pipelineStats.totalCalls} total calls made
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <Zap className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariant}>
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                          <p className="text-3xl font-bold">{pipelineStats.conversionRate.toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {pipelineStats.conversionRate > 25 ? '+' : ''}{(pipelineStats.conversionRate - 25).toFixed(1)}% vs avg
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-amber-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Pipeline Selector and Advanced Controls */}
              <motion.div variants={cardVariant}>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Pipeline Selection */}
                      <div className="flex items-center gap-4">
                        <div className="min-w-[240px]">
                          <Select
                            value={selectedPipeline?._id || ""}
                            onValueChange={(value) => {
                              const pipeline = pipelines.find(p => p._id === value);
                              setSelectedPipeline(pipeline || null);
                              router.push(`/dashboard/leads?pipeline=${value}`, { scroll: false });
                            }}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select pipeline" />
                            </SelectTrigger>
                            <SelectContent>
                              {pipelines.map((pipeline) => (
                                <SelectItem key={pipeline._id} value={pipeline._id}>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      {pipeline.stages.slice(0, 3).map((stage, i) => (
                                        <div
                                          key={i}
                                          className="w-2 h-2 rounded-full"
                                          style={{ backgroundColor: stage.color }}
                                        />
                                      ))}
                                      {pipeline.stages.length > 3 && (
                                        <span className="text-xs text-muted-foreground">+{pipeline.stages.length - 3}</span>
                                      )}
                                    </div>
                                    <span className="font-medium">{pipeline.name}</span>
                                    {pipeline.isDefault && (
                                      <Badge variant="secondary" className="text-xs">Default</Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Pipeline Progress Indicator */}
                        {selectedPipeline && (
                          <div className="hidden lg:flex items-center gap-3">
                            {selectedPipeline.stages.map((stage, index) => (
                              <div key={stage._id} className="flex items-center gap-2">
                                <div className="text-center">
                                  <div
                                    className="w-3 h-3 rounded-full mx-auto mb-1"
                                    style={{ backgroundColor: stage.color }}
                                  />
                                  <p className="text-xs font-medium text-muted-foreground">
                                    {leadsByStage[stage._id]?.length || 0}
                                  </p>
                                </div>
                                {index < selectedPipeline.stages.length - 1 && (
                                  <div className="w-8 h-px bg-border" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Search and Filters */}
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1 lg:w-80">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search leads..."
                            className="pl-10 h-11"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          {searchTerm && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                              onClick={() => setSearchTerm("")}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        <Popover open={showFilters} onOpenChange={setShowFilters}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "gap-2 h-11 relative",
                                hasActiveFilters && "border-primary text-primary"
                              )}
                            >
                              <SlidersHorizontal className="h-4 w-4" />
                              Filters
                              {hasActiveFilters && (
                                <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full flex items-center justify-center">
                                  <div className="h-1.5 w-1.5 bg-primary-foreground rounded-full" />
                                </div>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0" align="end">
                            <div className="p-4 border-b">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">Filter Leads</h4>
                                {hasActiveFilters && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-xs h-8"
                                  >
                                    Clear All
                                  </Button>
                                )}
                              </div>
                            </div>

                            <ScrollArea className="max-h-80">
                              <div className="p-4 space-y-6">
                                {/* Priority Filter */}
                                <div className="space-y-3">
                                  <label className="text-sm font-medium">Priority</label>
                                  <div className="space-y-2">
                                    {(['high', 'medium', 'low'] as const).map((priority) => (
                                      <div key={priority} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`priority-${priority}`}
                                          checked={filters.priority.includes(priority)}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              setFilters(prev => ({
                                                ...prev,
                                                priority: [...prev.priority, priority]
                                              }));
                                            } else {
                                              setFilters(prev => ({
                                                ...prev,
                                                priority: prev.priority.filter(p => p !== priority)
                                              }));
                                            }
                                          }}
                                        />
                                        <label
                                          htmlFor={`priority-${priority}`}
                                          className="text-sm capitalize cursor-pointer flex items-center gap-2"
                                        >
                                          <div
                                            className={cn("w-2 h-2 rounded-full", priorityConfig[priority].icon)}
                                          />
                                          {priority}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Source Filter */}
                                {uniqueSources.length > 0 && (
                                  <div className="space-y-3">
                                    <label className="text-sm font-medium">Source</label>
                                    <ScrollArea className="max-h-32">
                                      <div className="space-y-2">
                                        {uniqueSources.map((source) => (
                                          <div key={source} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`source-${source}`}
                                              checked={filters.source.includes(source)}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  setFilters(prev => ({
                                                    ...prev,
                                                    source: [...prev.source, source]
                                                  }));
                                                } else {
                                                  setFilters(prev => ({
                                                    ...prev,
                                                    source: prev.source.filter(s => s !== source)
                                                  }));
                                                }
                                              }}
                                            />
                                            <label
                                              htmlFor={`source-${source}`}
                                              className="text-sm cursor-pointer"
                                            >
                                              {source}
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                )}

                                {/* Date Range Filter */}
                                <div className="space-y-3">
                                  <label className="text-sm font-medium">Created</label>
                                  <Select
                                    value={filters.dateRange}
                                    onValueChange={(value: any) =>
                                      setFilters(prev => ({ ...prev, dateRange: value }))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All Time</SelectItem>
                                      <SelectItem value="today">Today</SelectItem>
                                      <SelectItem value="week">This Week</SelectItem>
                                      <SelectItem value="month">This Month</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => fetchLeads(selectedPipeline?._id || '')}
                          className="h-11 w-11"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">Active:</span>

                          {searchTerm && (
                            <Badge variant="secondary" className="gap-1 px-2">
                              "{searchTerm}"
                              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                            </Badge>
                          )}

                          {filters.priority.map(priority => (
                            <Badge key={priority} variant="secondary" className="gap-1 px-2 capitalize">
                              <div className={cn("w-2 h-2 rounded-full", priorityConfig[priority].icon)} />
                              {priority}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => setFilters(prev => ({
                                  ...prev,
                                  priority: prev.priority.filter(p => p !== priority)
                                }))}
                              />
                            </Badge>
                          ))}

                          {filters.source.map(source => (
                            <Badge key={source} variant="secondary" className="gap-1 px-2">
                              {source}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => setFilters(prev => ({
                                  ...prev,
                                  source: prev.source.filter(s => s !== source)
                                }))}
                              />
                            </Badge>
                          ))}

                          {filters.dateRange !== 'all' && (
                            <Badge variant="secondary" className="gap-1 px-2 capitalize">
                              {filters.dateRange === 'week' ? 'This Week' :
                                filters.dateRange === 'month' ? 'This Month' :
                                  filters.dateRange}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => setFilters(prev => ({ ...prev, dateRange: 'all' }))}
                              />
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Main Content */}
            {selectedPipeline ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariant}
                className="relative"
              >
                {viewMode === 'kanban' ? (
                  // Enhanced Kanban View
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="flex gap-6 overflow-x-auto pb-6">
                      <AnimatePresence mode="popLayout">
                        {selectedPipeline.stages.map((stage) => {
                          const stageLeads = leadsByStage[stage._id] || [];
                          const stageStats = pipelineStats.stageStats.find(s => s._id === stage._id);

                          return (
                            <motion.div
                              key={stage._id}
                              variants={cardVariant}
                              layout
                              className="flex-shrink-0 w-80"
                            >
                              <Card className="h-full border-0 shadow-sm">
                                <CardHeader
                                  className="pb-4 border-l-4 bg-gradient-to-r from-muted/30 to-transparent"
                                  style={{ borderLeftColor: stage.color }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="w-3 h-3 rounded-full shadow-sm"
                                        style={{ backgroundColor: stage.color }}
                                      />
                                      <CardTitle className="text-sm font-semibold">
                                        {stage.name}
                                      </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="text-xs font-medium px-2 py-1">
                                        {stageLeads.length}
                                      </Badge>
                                      {stageStats && stageStats.value > 0 && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs text-emerald-600 border-emerald-200 font-medium px-2 py-1"
                                        >
                                          ₹{(stageStats.value / 1000).toFixed(0)}K
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Stage Progress */}
                                  {stageStats && (
                                    <div className="mt-3">
                                      <Progress
                                        value={stageStats.percentage}
                                        className="h-1.5"
                                      />
                                      <div className="flex justify-between items-center mt-1">
                                        <p className="text-xs text-muted-foreground">
                                          {stageStats.percentage.toFixed(1)}% of pipeline
                                        </p>
                                        {stageStats.value > 0 && (
                                          <p className="text-xs font-medium">
                                            ₹{(stageStats.value / 1000).toFixed(1)}K
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </CardHeader>

                                <Droppable droppableId={stage._id}>
                                  {(provided, snapshot) => (
                                    <CardContent
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={cn(
                                        "min-h-[600px] max-h-[calc(100vh-400px)] overflow-y-auto space-y-3 pt-0 pb-4",
                                        snapshot.isDraggingOver && "bg-muted/30 transition-colors duration-200"
                                      )}
                                    >
                                      <AnimatePresence mode="popLayout">
                                        {stageLeads.map((lead, index) => (
                                          <Draggable
                                            key={lead._id}
                                            draggableId={lead._id}
                                            index={index}
                                            isDragDisabled={isMovingLead}
                                          >
                                            {(provided, snapshot) => (
                                              <motion.div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                layout
                                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                                whileHover={{ y: -2 }}
                                                className={cn(
                                                  "group border rounded-xl p-4 cursor-move transition-all duration-200 shadow-sm hover:shadow-md bg-background",
                                                  snapshot.isDragging && "rotate-1 shadow-xl ring-2 ring-primary/20 bg-primary/5"
                                                )}
                                              >
                                                {/* Enhanced Lead Card Content */}
                                                <div className="space-y-3">
                                                  {/* Header with Campaign Status */}
                                                  <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                      <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                                                          {lead.name}
                                                        </h4>
                                                        {lead.campaignId && (
                                                          <div className="flex items-center gap-1">
                                                            {lead.callStatus === 'calling' && (
                                                              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                                                            )}
                                                            {lead.callStatus === 'completed' && (
                                                              <CheckCircle className="h-3 w-3 text-emerald-500" />
                                                            )}
                                                            {lead.callStatus === 'failed' && (
                                                              <AlertTriangle className="h-3 w-3 text-rose-500" />
                                                            )}
                                                          </div>
                                                        )}
                                                      </div>

                                                      {lead.company && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                          <Building className="h-3 w-3 text-muted-foreground" />
                                                          <p className="text-xs text-muted-foreground truncate">
                                                            {lead.company}
                                                          </p>
                                                        </div>
                                                      )}
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                      <Badge
                                                        className={cn(
                                                          "text-xs px-2 py-0.5 capitalize border-0",
                                                          priorityConfig[lead.priority].color
                                                        )}
                                                      >
                                                        {lead.priority}
                                                      </Badge>

                                                      <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                          <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={(e) => e.stopPropagation()}
                                                          >
                                                            <MoreHorizontal className="h-3 w-3" />
                                                          </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                          <DropdownMenuItem
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setSelectedLead(lead);
                                                            }}
                                                            className="gap-2"
                                                          >
                                                            <Eye className="h-4 w-4" />
                                                            View Details
                                                          </DropdownMenuItem>
                                                          <DropdownMenuItem className="gap-2">
                                                            <Phone className="h-4 w-4" />
                                                            Call Lead
                                                          </DropdownMenuItem>
                                                          <DropdownMenuItem className="gap-2">
                                                            <Mail className="h-4 w-4" />
                                                            Send Email
                                                          </DropdownMenuItem>
                                                          <DropdownMenuSeparator />
                                                          <DropdownMenuItem className="gap-2">
                                                            <Edit className="h-4 w-4" />
                                                            Edit Lead
                                                          </DropdownMenuItem>
                                                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete Lead
                                                          </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                      </DropdownMenu>
                                                    </div>
                                                  </div>

                                                  {/* Contact Info */}
                                                  <div className="space-y-1.5">
                                                    {lead.email && (
                                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Mail className="h-3 w-3 flex-shrink-0" />
                                                        <span className="truncate">{lead.email}</span>
                                                      </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                      <Phone className="h-3 w-3 flex-shrink-0" />
                                                      <span>{lead.phoneNumber}</span>
                                                    </div>
                                                  </div>

                                                  {/* Value and Campaign Status */}
                                                  <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                      {lead.value && lead.value > 0 && (
                                                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                                                          <DollarSign className="h-3 w-3 text-emerald-600" />
                                                          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                            ₹{lead.value.toLocaleString()}
                                                          </span>
                                                        </div>
                                                      )}

                                                      {lead.campaignId && (
                                                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                                          <CloudLightning className="h-3 w-3 text-blue-600" />
                                                          <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                                            Campaign
                                                          </span>
                                                        </div>
                                                      )}
                                                    </div>

                                                    {lead.tags && lead.tags.length > 0 && (
                                                      <div className="flex flex-wrap gap-1">
                                                        {lead.tags.slice(0, 2).map((tag) => (
                                                          <Badge
                                                            key={tag}
                                                            variant="secondary"
                                                            className="text-xs px-1.5 py-0 h-5"
                                                          >
                                                            {tag}
                                                          </Badge>
                                                        ))}
                                                        {lead.tags.length > 2 && (
                                                          <Badge
                                                            variant="secondary"
                                                            className="text-xs px-1.5 py-0 h-5"
                                                          >
                                                            +{lead.tags.length - 2}
                                                          </Badge>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Footer with Last Activity */}
                                                  <div className="flex items-center justify-between pt-2 border-t">
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                      <Clock className="h-3 w-3" />
                                                      <span>
                                                        {lead.lastCalled
                                                          ? `Called ${formatDistanceToNow(new Date(lead.lastCalled), { addSuffix: true })}`
                                                          : formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                                                      </span>
                                                    </div>

                                                    {lead.expectedCloseDate && (
                                                      <div className="flex items-center gap-1 text-xs text-orange-600">
                                                        <CalendarIcon className="h-3 w-3" />
                                                        <span>{format(new Date(lead.expectedCloseDate), 'MMM d')}</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </motion.div>
                                            )}
                                          </Draggable>
                                        ))}
                                      </AnimatePresence>
                                      {provided.placeholder}

                                      {/* Empty State for Stage */}
                                      {stageLeads.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                          <div
                                            className="h-12 w-12 rounded-full flex items-center justify-center mb-3"
                                            style={{ backgroundColor: `${stage.color}15` }}
                                          >
                                            <Target className="h-6 w-6" style={{ color: stage.color }} />
                                          </div>
                                          <p className="text-sm font-medium text-muted-foreground">
                                            No leads in {stage.name.toLowerCase()}
                                          </p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Drag leads here or create new ones
                                          </p>
                                        </div>
                                      )}
                                    </CardContent>
                                  )}
                                </Droppable>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </DragDropContext>
                ) : (
                  // Enhanced List View
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/30">
                            <tr className="border-b">
                              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Lead
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Company
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Stage
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Value
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Last Activity
                              </th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            <AnimatePresence mode="popLayout">
                              {filteredLeads.map((lead, index) => {
                                const stage = selectedPipeline?.stages.find(s => s._id === lead.stageId);
                                return (
                                  <motion.tr
                                    key={lead._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="hover:bg-muted/30 transition-colors group"
                                  >
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                            {lead.name.charAt(0).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <p className="font-semibold text-sm">{lead.name}</p>
                                            {lead.campaignId && (
                                              <div className="flex items-center gap-1">
                                                {lead.callStatus === 'calling' && (
                                                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                                                )}
                                                {lead.callStatus === 'completed' && (
                                                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                                                )}
                                                {lead.callStatus === 'failed' && (
                                                  <AlertTriangle className="h-3 w-3 text-rose-500" />
                                                )}
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                            {lead.email && (
                                              <div className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                <span>{lead.email}</span>
                                              </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                              <Phone className="h-3 w-3" />
                                              <span>{lead.phoneNumber}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div>
                                        <p className="font-medium text-sm">{lead.company || '-'}</p>
                                        {lead.jobTitle && (
                                          <p className="text-xs text-muted-foreground">{lead.jobTitle}</p>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      {stage && (
                                        <Badge
                                          variant="secondary"
                                          className="gap-2 border-0"
                                          style={{ backgroundColor: `${stage.color}15`, color: stage.color }}
                                        >
                                          <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: stage.color }}
                                          />
                                          {stage.name}
                                        </Badge>
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      {lead.value && lead.value > 0 ? (
                                        <div className="flex items-center gap-1 font-semibold text-emerald-600">
                                          <DollarSign className="h-4 w-4" />
                                          ₹{lead.value.toLocaleString()}
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          className={cn(
                                            "capitalize border-0",
                                            priorityConfig[lead.priority].color
                                          )}
                                        >
                                          {lead.priority}
                                        </Badge>
                                        {lead.campaignId && (
                                          <Badge variant="outline" className="text-xs gap-1">
                                            <Lightning className="h-3 w-3" />
                                            Campaign
                                          </Badge>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                          {lead.lastCalled
                                            ? `Called ${formatDistanceToNow(new Date(lead.lastCalled), { addSuffix: true })}`
                                            : formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setSelectedLead(lead)}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                              <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem
                                              onClick={() => setSelectedLead(lead)}
                                              className="gap-2"
                                            >
                                              <Eye className="h-4 w-4" />
                                              View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2">
                                              <Phone className="h-4 w-4" />
                                              Call Lead
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2">
                                              <Mail className="h-4 w-4" />
                                              Send Email
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="gap-2">
                                              <Edit className="h-4 w-4" />
                                              Edit Lead
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                                              <Trash2 className="h-4 w-4" />
                                              Delete Lead
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </td>
                                  </motion.tr>
                                );
                              })}
                            </AnimatePresence>
                          </tbody>
                        </table>

                        {/* Empty State for List View */}
                        {filteredLeads.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                              <Target className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No leads found</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm">
                              {hasActiveFilters
                                ? "Try adjusting your filters or search terms"
                                : "Start by creating your first lead or importing leads from a spreadsheet"}
                            </p>
                            {hasActiveFilters ? (
                              <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                              </Button>
                            ) : (
                              <div className="flex gap-3">
                                <Button onClick={() => setShowAddLead(true)} className="gap-2">
                                  <Plus className="h-4 w-4" />
                                  Add Lead
                                </Button>
                                <Button variant="outline" onClick={() => setShowImport(true)} className="gap-2">
                                  <Upload className="h-4 w-4" />
                                  Import Leads
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Loading Overlay for Lead Movement */}
                {isMovingLead && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
                    <div className="bg-card rounded-xl p-6 shadow-xl border flex items-center gap-4">
                      <div className="relative">
                        <div className="h-6 w-6 rounded-full border-2 border-muted"></div>
                        <div className="absolute top-0 left-0 h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                      </div>
                      <span className="font-medium">Moving lead...</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              // No Pipeline Selected State
              <motion.div
                initial="hidden"
                animate="visible"
                variants={cardVariant}
              >
                <Card className="border-0 shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                      <Target className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">No Pipeline Selected</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Create your first sales pipeline to start managing leads and tracking your sales process
                    </p>
                    <div className="flex gap-3">
                      <Link href="/dashboard/leads/customize">
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create Pipeline
                        </Button>
                      </Link>
                      <Button variant="outline" onClick={() => fetchPipelines()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Enhanced Import Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Leads & Launch Campaign
            </DialogTitle>
            <DialogDescription>
              Upload a spreadsheet to import leads and automatically create a calling campaign
            </DialogDescription>
          </DialogHeader>

          {importProgress.stage === 'idle' ? (
            <Form {...importForm}>
              <form onSubmit={importForm.handleSubmit(handleFileImport)} className="space-y-6">
                {/* File Upload */}
                <div className="space-y-4">
                  <FormField
                    control={importForm.control}
                    name="file"
                    render={({ field: { onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          Upload Spreadsheet
                        </FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:bg-muted/20 transition-colors">
                            <input
                              type="file"
                              accept=".csv,.xlsx,.xls"
                              onChange={(e) => onChange(e.target.files?.[0] || null)}
                              className="hidden"
                              id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                              <p className="font-medium">Click to upload or drag and drop</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                CSV, XLSX files up to 10MB
                              </p>
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                    <p className="font-medium mb-1">Required columns:</p>
                    <p>Name, Phone (or PhoneNumber), Email (optional), Company (optional)</p>
                  </div>
                </div>

                {/* Pipeline & Stage Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={importForm.control}
                    name="pipelineId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pipeline</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pipeline" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pipelines.map((pipeline) => (
                              <SelectItem key={pipeline._id} value={pipeline._id}>
                                {pipeline.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={importForm.control}
                    name="stageId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Stage</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {importPipelineId &&
                              pipelines
                                .find((p) => p._id === importPipelineId)
                                ?.stages.sort((a, b) => a.order - b.order)
                                .map((stage) => (
                                  <SelectItem key={stage._id} value={stage._id}>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: stage.color }}
                                      />
                                      {stage.name}
                                    </div>
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Campaign Configuration */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Campaign Setup</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={importForm.control}
                      name="campaignName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Q1 Lead Outreach"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={importForm.control}
                      name="agentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AI Agent</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select agent" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {agents.map((agent) => (
                                <SelectItem key={agent._id} value={agent.agent_id}>
                                  {agent.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={importForm.control}
                    name="autoLaunch"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">
                            Auto-launch Campaign
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Automatically start calling leads after import (5-second countdown)
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowImport(false);
                      importForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="gap-2"
                    disabled={importForm.formState.isSubmitting}
                  >
                    {importForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Import & Launch
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            // Import Progress Display
            <div className="py-8">
              <div className="text-center space-y-6">
                {/* Progress Indicator */}
                <div className="relative">
                  {importProgress.stage === 'countdown' ? (
                    <div className="h-24 w-24 mx-auto rounded-full border-4 border-primary flex items-center justify-center bg-primary/10">
                      <span className="text-3xl font-bold text-primary">
                        {importProgress.countdown}
                      </span>
                    </div>
                  ) : importProgress.stage === 'complete' ? (
                    <div className="h-24 w-24 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle className="h-12 w-12 text-emerald-500" />
                    </div>
                  ) : (
                    <div className="h-24 w-24 mx-auto rounded-full border-4 border-muted flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                {/* Status Message */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {importProgress.stage === 'uploading' && 'Uploading File'}
                    {importProgress.stage === 'processing' && 'Processing Leads'}
                    {importProgress.stage === 'countdown' && 'Launching Campaign'}
                    {importProgress.stage === 'launching' && 'Starting Campaign'}
                    {importProgress.stage === 'complete' && 'Import Complete'}
                  </h3>
                  <p className="text-muted-foreground">
                    {importProgress.stage === 'countdown'
                      ? `Campaign will start in ${importProgress.countdown} seconds...`
                      : importProgress.message}
                  </p>
                </div>

                {/* Progress Bar */}
                {importProgress.stage !== 'countdown' && importProgress.stage !== 'complete' && (
                  <div className="w-full max-w-sm mx-auto">
                    <Progress value={importProgress.progress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {importProgress.progress.toFixed(0)}% complete
                    </p>
                  </div>
                )}

                {/* Results Summary */}
                {importProgress.processedData && (
                  <div className="bg-muted/30 rounded-lg p-4 text-left max-w-md mx-auto">
                    <h4 className="font-medium mb-2">Import Summary</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• {importProgress.processedData.contacts} contacts processed</p>
                      <p>• {importProgress.processedData.leads.length} leads created</p>
                      <p>• Campaign "{importProgress.processedData.campaign.name}" created</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {importProgress.stage === 'complete' && (
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowImport(false);
                        setImportProgress({
                          stage: 'idle',
                          progress: 0,
                          countdown: 0,
                          message: '',
                          processedData: null,
                          campaignId: null,
                        });
                        importForm.reset();
                      }}
                    >
                      Close
                    </Button>
                    {importProgress.campaignId && (
                      <Link href={`/dashboard/campaigns/${importProgress.campaignId}`}>
                        <Button className="gap-2">
                          <Eye className="h-4 w-4" />
                          View Campaign
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Lead Dialog */}
      <Dialog open={showAddLead} onOpenChange={setShowAddLead}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">Add New Lead</DialogTitle>
            <DialogDescription>
              Create a new lead and add it to your sales pipeline
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddLead)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1 555 123 4567"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Company
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Acme Inc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Job Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Sales Manager"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pipeline Configuration */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Pipeline Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pipelineId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Pipeline *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={selectedPipeline?._id || field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pipeline" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pipelines.map((pipeline) => (
                              <SelectItem key={pipeline._id} value={pipeline._id}>
                                <div className="flex items-center gap-2">
                                  {pipeline.name}
                                  {pipeline.isDefault && (
                                    <Badge variant="outline" className="text-xs">Default</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stageId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Initial Stage *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedPipelineId &&
                              pipelines
                                .find((p) => p._id === selectedPipelineId)
                                ?.stages.sort((a, b) => a.order - b.order)
                                .map((stage) => (
                                  <SelectItem key={stage._id} value={stage._id}>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: stage.color }}
                                      />
                                      {stage.name}
                                    </div>
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Lead Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Lead Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Deal Value (₹)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50000"
                            min="0"
                            step="1000"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Priority
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(['low', 'medium', 'high'] as const).map((priority) => (
                              <SelectItem key={priority} value={priority}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "w-2 h-2 rounded-full",
                                      priorityConfig[priority].icon
                                    )}
                                  />
                                  {priorityConfig[priority].label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Lead Source
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sourceOptions.map((source) => (
                              <SelectItem key={source} value={source}>
                                {source}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expectedCloseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          Expected Close Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Tags
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="hot-lead, enterprise, referral"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Separate tags with commas
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Notes
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any notes about this lead..."
                          className="resize-none h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Options */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Options</h3>
                <FormField
                  control={form.control}
                  name="createContact"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/20">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-medium">
                          Create Contact Record
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Automatically create a contact entry for this lead in your contact database.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddLead(false);
                    form.reset();
                  }}
                  className="min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-w-[120px]"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Lead
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Enhanced Lead Details Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6 border-b">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Lead Details
            </DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-8 py-4">
              {/* Enhanced Lead Header */}
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20 border-2">
                  <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                    {selectedLead.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold">{selectedLead.name}</h3>
                        {selectedLead.campaignId && (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="gap-1 px-2">
                              <CloudLightning className="h-3 w-3" />
                              Campaign Active
                            </Badge>
                            {selectedLead.callStatus === 'calling' && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                                <span className="text-sm font-medium">Calling...</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {selectedLead.jobTitle && (
                        <p className="text-lg text-muted-foreground mb-2">{selectedLead.jobTitle}</p>
                      )}

                      {selectedLead.company && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{selectedLead.company}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={cn("capitalize", priorityConfig[selectedLead.priority].color)}>
                        {selectedLead.priority} Priority
                      </Badge>
                      {selectedPipeline && (
                        <Badge
                          variant="secondary"
                          className="gap-1"
                          style={{
                            backgroundColor: `${selectedPipeline.stages.find(s => s._id === selectedLead.stageId)?.color || '#3b82f6'}20`,
                            color: selectedPipeline.stages.find(s => s._id === selectedLead.stageId)?.color || '#3b82f6'
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: selectedPipeline.stages.find(s => s._id === selectedLead.stageId)?.color || '#3b82f6' }}
                          />
                          {selectedPipeline.stages.find(s => s._id === selectedLead.stageId)?.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-3">
                <Button className="gap-2" size="sm">
                  <Phone className="h-4 w-4" />
                  Call Lead
                </Button>
                <Button variant="outline" className="gap-2" size="sm">
                  <Mail className="h-4 w-4" />
                  Send Email
                </Button>
                <Button variant="outline" className="gap-2" size="sm">
                  <Edit className="h-4 w-4" />
                  Edit Lead
                </Button>
                <Button variant="outline" className="gap-2" size="sm">
                  <Sparkles className="h-4 w-4" />
                  Add to Campaign
                </Button>
              </div>

              {/* Campaign Status Section */}
              {selectedLead.campaignId && (
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <CloudLightning className="h-5 w-5 text-blue-600" />
                    Campaign Activity
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedLead.callStatus === 'completed' ? '✓' :
                          selectedLead.callStatus === 'calling' ? '📞' :
                            selectedLead.callStatus === 'failed' ? '✗' : '⏳'}
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {selectedLead.callStatus || 'pending'}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedLead.lastCalled ? '1' : '0'}
                      </div>
                      <p className="text-sm text-muted-foreground">Calls Made</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">85%</div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">2m 15s</div>
                      <p className="text-sm text-muted-foreground">Avg. Duration</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedLead.phoneNumber}</p>
                      </div>
                    </div>

                    {selectedLead.email && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedLead.email}</p>
                        </div>
                      </div>
                    )}

                    {selectedLead.source && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <Globe className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Source</p>
                          <p className="font-medium">{selectedLead.source}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Deal Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Deal Value</p>
                        <p className="font-bold text-emerald-600">
                          {selectedLead.value ? `₹${selectedLead.value.toLocaleString()}` : 'Not set'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Expected Close</p>
                        <p className="font-medium">
                          {selectedLead.expectedCloseDate
                            ? format(new Date(selectedLead.expectedCloseDate), 'MMM d, yyyy')
                            : 'Not set'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="font-medium">
                          {format(new Date(selectedLead.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedLead.tags && selectedLead.tags.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedLead.notes && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">Notes</h4>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedLead.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Activity Timeline */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">Activity Timeline</h4>
                <div className="space-y-3">
                  {selectedLead.lastCalled && (
                    <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Last called</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(selectedLead.lastCalled), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {selectedLead.callStatus}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Lead created</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(selectedLead.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {selectedLead.lastActivity && (
                    <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Last activity</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(selectedLead.lastActivity), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setSelectedLead(null)}
            >
              Close
            </Button>
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LeadsPageLoading() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 mx-auto rounded-full border-2 border-muted flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Loading Your Pipeline</h3>
            <p className="text-muted-foreground">Setting up your lead management workspace...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<LeadsPageLoading />}>
      <LeadsPageContent />
    </Suspense>
  );
}
