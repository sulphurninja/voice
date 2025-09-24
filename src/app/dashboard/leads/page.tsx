"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogTrigger,
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
  ArrowUpDown,
  X,
  RefreshCw,
  Download,
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
  Columns
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, formatDistanceToNow, isThisWeek, isToday, startOfWeek, endOfWeek } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
};

// Form schema
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

const priorityConfig = {
  low: {
    color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300",
    icon: "bg-green-500",
    label: "Low Priority"
  },
  medium: {
    color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300",
    icon: "bg-yellow-500",
    label: "Medium Priority"
  },
  high: {
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
    icon: "bg-red-500",
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

export default function LeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // State
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddLead, setShowAddLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isMovingLead, setIsMovingLead] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filters
  const [filters, setFilters] = useState({
    priority: [] as string[],
    source: [] as string[],
    assignedTo: [] as string[],
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month',
    valueRange: { min: 0, max: 1000000 }
  });

  const [showFilters, setShowFilters] = useState(false);

  const form = useForm<z.infer<typeof leadSchema>>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      priority: 'medium',
      createContact: true,
    },
  });

  const selectedPipelineId = form.watch("pipelineId");

  // Fetch pipelines
  useEffect(() => {
    fetchPipelines();
  }, []);

  // Fetch leads when pipeline changes
  useEffect(() => {
    if (selectedPipeline) {
      fetchLeads(selectedPipeline._id);
    }
  }, [selectedPipeline]);

  // Handle URL params for pipeline selection
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

        // Select default pipeline or first pipeline
        const defaultPipeline = data.pipelines.find((p: Pipeline) => p.isDefault);
        setSelectedPipeline(defaultPipeline || data.pipelines[0]);
      } else {
        toast({
          title: "Error",
          description: "Failed to load pipelines",
          variant: "destructive",
        });
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

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || !selectedPipeline) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      setIsMovingLead(true);

      // Optimistically update the UI
      const draggedLead = leads.find(lead => lead._id === draggableId);
      if (draggedLead) {
        const updatedLeads = leads.map(lead =>
          lead._id === draggableId
            ? { ...lead, stageId: destination.droppableId }
            : lead
        );
        setLeads(updatedLeads);
      }

      // Find the new stage
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
        // Revert the optimistic update on error
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
      // Search filter
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

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(lead.priority)) {
        return false;
      }

      // Source filter
      if (filters.source.length > 0 && lead.source && !filters.source.includes(lead.source)) {
        return false;
      }

      // Date range filter
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

      // Value range filter
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

    // Conversion rates by stage
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
      stageStats
    };
  }, [filteredLeads, leadsByStage, selectedPipeline]);

  // Get unique sources and assignees for filters
  const uniqueSources = [...new Set(leads.map(lead => lead.source).filter(Boolean))];
  const uniqueAssignees = [...new Set(leads.map(lead => lead.assignedTo?.name).filter(Boolean))];

  const clearFilters = () => {
    setFilters({
      priority: [],
      source: [],
      assignedTo: [],
      dateRange: 'all',
      valueRange: { min: 0, max: 1000000 }
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
      <div className="min-h-screen text-foreground flex">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <DashboardHeader />
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
    <div className="min-h-screen text-foreground flex dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
      <DashboardSidebar />

      <main className="flex-1 overflow-hidden bg-transparent">
        <DashboardHeader />

        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header Section */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariant}
              className="space-y-6"
            >
              {/* Title and Actions */}
              <motion.div variants={cardVariant} className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold  text-primary ">
                        Lead Management
                      </h1>
                      <p className="text-muted-foreground">
                        Track, manage, and convert your sales pipeline
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
                    className="gap-2 bg-white/50 backdrop-blur-sm"
                  >
                    {viewMode === 'kanban' ? <List className="h-4 w-4" /> : <Columns className="h-4 w-4" />}
                    {viewMode === 'kanban' ? 'List View' : 'Kanban View'}
                  </Button>

                  <Link href="/dashboard/leads/customize">
                    <Button variant="outline" className="gap-2 bg-white/50 backdrop-blur-sm">
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Customize Pipeline</span>
                    </Button>
                  </Link>

                  <Button onClick={() => setShowAddLead(true)} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg">
                    <Plus className="h-4 w-4" />
                    Add Lead
                  </Button>
                </div>
              </motion.div>

              {/* Pipeline Stats Dashboard */}
              <motion.div variants={staggerVariant} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div variants={cardVariant}>
                  <Card className="  backdrop-blur-sm border-white/20 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                          <p className="text-3xl font-bold">{pipelineStats.totalLeads}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariant}>
                  <Card className="  backdrop-blur-sm border-white/20 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
                          <p className="text-3xl font-bold">₹{(pipelineStats.totalValue / 1000).toFixed(1)}K</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariant}>
                  <Card className="  backdrop-blur-sm border-white/20 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avg. Deal Size</p>
                          <p className="text-3xl font-bold">₹{(pipelineStats.avgLeadValue / 1000).toFixed(1)}K</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                          <Target className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariant}>
                  <Card className=" backdrop-blur-sm border-white/20 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                          <p className="text-3xl font-bold">24.5%</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Pipeline Selector and Filters */}
              <motion.div variants={cardVariant}>
                <Card className=" backdrop-blur-sm border-white/20 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="min-w-[200px]">
                          <Select
                            value={selectedPipeline?._id || ""}
                            onValueChange={(value) => {
                              const pipeline = pipelines.find(p => p._id === value);
                              setSelectedPipeline(pipeline || null);
                              router.push(`/dashboard/leads?pipeline=${value}`, { scroll: false });
                            }}
                          >
                            <SelectTrigger className="">
                              <SelectValue placeholder="Select pipeline" />
                            </SelectTrigger>
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
                        </div>

                        {selectedPipeline && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex -space-x-1">
                              {selectedPipeline.stages.slice(0, 3).map((stage) => (
                                <div
                                  key={stage._id}
                                  className="w-3 h-3 rounded-full border-2 border-"
                                  style={{ backgroundColor: stage.color }}
                                />
                              ))}
                              {selectedPipeline.stages.length > 3 && (
                                <div className="w-3 h-3 rounded-full bg-muted border-2 border-white flex items-center justify-center">
                                  <span className="text-xs">+</span>
                                </div>
                              )}
                            </div>
                            <span>{selectedPipeline.stages.length} stages</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative flex-1 lg:w-80">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search leads, companies, emails..."
                            className="pl-10 "
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          {searchTerm && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
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
                                "gap-2",
                                hasActiveFilters && "border-blue-500 text-blue-600"
                              )}
                            >
                              <SlidersHorizontal className="h-4 w-4" />
                              Filters
                              {hasActiveFilters && (
                                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                  !
                                </Badge>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-4" align="end">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">Filters</h4>
                                {hasActiveFilters && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-xs"
                                  >
                                    Clear All
                                  </Button>
                                )}
                              </div>

                              {/* Priority Filter */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <div className="flex flex-wrap gap-2">
                                  {(['low', 'medium', 'high'] as const).map((priority) => (
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
                                        className="text-sm capitalize cursor-pointer"
                                      >
                                        {priority}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Source Filter */}
                              {uniqueSources.length > 0 && (
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Source</label>
                                  <div className="max-h-32 overflow-y-auto space-y-2">
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
                                </div>
                              )}

                              {/* Date Range Filter */}
                              <div className="space-y-2">
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
                          </PopoverContent>
                        </Popover>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchLeads(selectedPipeline?._id || '')}
                          className="gap-2 "
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {hasActiveFilters && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">Active filters:</span>

                          {searchTerm && (
                            <Badge variant="secondary" className="gap-1">
                              Search: {searchTerm}
                              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                            </Badge>
                          )}

                          {filters.priority.map(priority => (
                            <Badge key={priority} variant="secondary" className="gap-1 capitalize">
                              {priority} Priority
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
                            <Badge key={source} variant="secondary" className="gap-1">
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
                            <Badge variant="secondary" className="gap-1 capitalize">
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
                  // Kanban View
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="flex gap-6 overflow-x-auto pb-6">
                      <AnimatePresence mode="popLayout">
                        {selectedPipeline.stages.map((stage, stageIndex) => {
                          const stageLeads = leadsByStage[stage._id] || [];
                          const stageStats = pipelineStats.stageStats.find(s => s._id === stage._id);

                          return (
                            <motion.div
                              key={stage._id}
                              variants={cardVariant}
                              layout
                              className="flex-shrink-0 w-80"
                            >
                              <Card className="h-full  backdrop-blur-sm border-white/20 shadow-xl">
                                <CardHeader
                                  className="pb-4 border-l-4 "
                                  style={{ borderLeftColor: stage.color }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: stage.color }}
                                      />
                                      <CardTitle className="text-sm font-semibold">
                                        {stage.name}
                                      </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs "
                                      >
                                        {stageLeads.length}
                                      </Badge>
                                      {stageStats && stageStats.value > 0 && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs text-green-600 border-green-200"
                                        >
                                          ₹{(stageStats.value / 1000).toFixed(0)}K
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {stageStats && (
                                    <div className="mt-2">
                                      <Progress
                                        value={stageStats.percentage}
                                        className="h-1"
                                        style={{
                                          background: `${stage.color}20`,
                                        }}
                                      />
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {stageStats.percentage.toFixed(1)}% of pipeline
                                      </p>
                                    </div>
                                  )}
                                </CardHeader>

                                <Droppable droppableId={stage._id}>
                                  {(provided, snapshot) => (
                                    <CardContent
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={cn(
                                        "min-h-[500px] max-h-[calc(100vh-400px)] overflow-y-auto space-y-3 pt-0 pb-4",
                                        snapshot.isDraggingOver && "bg-blue-50/50 dark:bg-blue-950/20"
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
                                                  "group  border rounded-xl p-4 cursor-move transition-all duration-200 shadow-sm hover:shadow-md",
                                                  snapshot.isDragging && "rotate-1 shadow-xl ring-2 ring-blue-500/20 bg-blue-50 dark:bg-blue-950/20"
                                                )}
                                              >
                                                {/* Lead Card Content */}
                                                <div className="space-y-3">
                                                  {/* Header */}
                                                  <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                      <h4 className="font-semibold text-sm truncate group-hover:text-blue-600 transition-colors">
                                                        {lead.name}
                                                      </h4>
                                                      {lead.company && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                          <Building className="h-3 w-3 text-muted-foreground" />
                                                          <p className="text-xs text-muted-foreground truncate">
                                                            {lead.company}
                                                          </p>
                                                        </div>
                                                      )}
                                                      {lead.jobTitle && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                          <Briefcase className="h-3 w-3 text-muted-foreground" />
                                                          <p className="text-xs text-muted-foreground truncate">
                                                            {lead.jobTitle}
                                                          </p>
                                                        </div>
                                                      )}
</div>

                                                    <div className="flex items-center gap-1">
                                                      <Badge
                                                        className={cn(
                                                          "text-xs px-2 py-0.5 capitalize border",
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
                                                  <div className="space-y-2">
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
                                                    {lead.source && (
                                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Globe className="h-3 w-3 flex-shrink-0" />
                                                        <span className="truncate">{lead.source}</span>
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Value and Tags */}
                                                  <div className="space-y-2">
                                                    {lead.value && lead.value > 0 && (
                                                      <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                                          <DollarSign className="h-3 w-3 text-green-600" />
                                                          <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                                                            ₹{lead.value.toLocaleString()}
                                                          </span>
                                                        </div>
                                                      </div>
                                                    )}

                                                    {lead.tags && lead.tags.length > 0 && (
                                                      <div className="flex flex-wrap gap-1">
                                                        {lead.tags.slice(0, 2).map((tag) => (
                                                          <Badge
                                                            key={tag}
                                                            variant="secondary"
                                                            className="text-xs px-2 py-0 bg-slate-100 dark:bg-slate-800"
                                                          >
                                                            <Tag className="h-2 w-2 mr-1" />
                                                            {tag}
                                                          </Badge>
                                                        ))}
                                                        {lead.tags.length > 2 && (
                                                          <Badge
                                                            variant="secondary"
                                                            className="text-xs px-2 py-0 bg-slate-100 dark:bg-slate-800"
                                                          >
                                                            +{lead.tags.length - 2}
                                                          </Badge>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Footer */}
                                                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                      <Clock className="h-3 w-3" />
                                                      <span>
                                                        {lead.lastActivity
                                                          ? formatDistanceToNow(new Date(lead.lastActivity), { addSuffix: true })
                                                          : formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                                                      </span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                      {lead.expectedCloseDate && (
                                                        <div className="flex items-center gap-1 text-xs text-orange-600">
                                                          <CalendarIcon className="h-3 w-3" />
                                                          <span>{format(new Date(lead.expectedCloseDate), 'MMM d')}</span>
                                                        </div>
                                                      )}

                                                      {lead.assignedTo && (
                                                        <Avatar className="h-5 w-5">
                                                          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                            {lead.assignedTo.name?.charAt(0)}
                                                          </AvatarFallback>
                                                        </Avatar>
                                                      )}
                                                    </div>
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
                                            className="h-12 w-12 rounded-full flex items-center justify-center mb-3 opacity-50"
                                            style={{ backgroundColor: `${stage.color}20` }}
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
                  // List View
                  <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-white/20 shadow-xl">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                            <tr className="border-b border-border/50">
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
                                Priority
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
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                                  >
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                            {lead.name.charAt(0).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-semibold text-sm">{lead.name}</p>
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
                                          className="gap-2"
                                          style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
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
                                        <div className="flex items-center gap-1 font-semibold text-green-600">
                                          <DollarSign className="h-4 w-4" />
                                          ₹{lead.value.toLocaleString()}
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      <Badge
                                        className={cn(
                                          "capitalize",
                                          priorityConfig[lead.priority].color
                                        )}
                                      >
                                        {lead.priority}
                                      </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                          {lead.lastActivity
                                            ? formatDistanceToNow(new Date(lead.lastActivity), { addSuffix: true })
                                            : formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
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
                            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                              <Target className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No leads found</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm">
                              {hasActiveFilters
                                ? "Try adjusting your filters or search terms"
                                : "Start by creating your first lead to begin tracking your pipeline"}
                            </p>
                            {hasActiveFilters ? (
                              <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                              </Button>
                            ) : (
                              <Button onClick={() => setShowAddLead(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add First Lead
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Loading Overlay */}
                {isMovingLead && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl flex items-center gap-4">
                      <div className="relative">
                        <div className="h-6 w-6 rounded-full border-2 border-blue-200 dark:border-blue-800"></div>
                        <div className="absolute top-0 left-0 h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                      </div>
                      <span className="font-medium">Moving lead...</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              // Empty State - No Pipeline
              <motion.div
                initial="hidden"
                animate="visible"
                variants={cardVariant}
              >
                <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-white/20 shadow-xl">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6">
                      <Target className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">No Pipeline Selected</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Create your first sales pipeline to start managing leads and tracking your sales process
                    </p>
                    <div className="flex gap-3">
                      <Link href="/dashboard/leads/customize">
                        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500">
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

      {/* Add Lead Dialog */}
      <Dialog open={showAddLead} onOpenChange={setShowAddLead}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">Add New Lead</DialogTitle>
            <DialogDescription>
              Create a new lead and add it to your sales pipeline. This will help you track and manage potential customers.
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
                            className="bg-white dark:bg-slate-800"
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
                            className="bg-white dark:bg-slate-800"
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
                            className="bg-white dark:bg-slate-800"
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
                            className="bg-white dark:bg-slate-800"
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
                          className="bg-white dark:bg-slate-800"
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
                            <SelectTrigger className="bg-white dark:bg-slate-800">
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
                            <SelectTrigger className="bg-white dark:bg-slate-800">
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
                            className="bg-white dark:bg-slate-800"
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
                            <SelectTrigger className="bg-white dark:bg-slate-800">
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
                            <SelectTrigger className="bg-white dark:bg-slate-800">
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
                            className="bg-white dark:bg-slate-800"
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
                            className="bg-white dark:bg-slate-800"
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
                          placeholder="Add any notes about this lead, their requirements, or follow-up actions..."
                          className="resize-none h-24 bg-white dark:bg-slate-800"
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-slate-50/50 dark:bg-slate-800/50">
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
                  className="min-w-[120px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
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

      {/* Lead Details Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6 border-b">
            <DialogTitle className="text-xl font-semibold">Lead Details</DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-8 py-4">
              {/* Lead Header */}
              <div className="flex items-start gap-6">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {selectedLead.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{selectedLead.name}</h3>
                      {selectedLead.jobTitle && (
                        <p className="text-lg text-muted-foreground mt-1">{selectedLead.jobTitle}</p>
                      )}
                      {selectedLead.company && (
                        <div className="flex items-center gap-2 mt-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">{selectedLead.company}</p>
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
              <div className="grid grid-cols-3 gap-3">
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
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedLead.phoneNumber}</p>
                      </div>
                    </div>

                    {selectedLead.email && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <Mail className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedLead.email}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {selectedLead.source && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <Globe className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Source</p>
                          <p className="font-medium">{selectedLead.source}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                        <CalendarIcon className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="font-medium">{format(new Date(selectedLead.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deal Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">Deal Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Deal Value</p>
                    <p className="text-xl font-bold text-green-600">
                      {selectedLead.value ? `₹${selectedLead.value.toLocaleString()}` : 'Not set'}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl">
                    <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Stage</p>
                    <p className="text-sm font-bold text-blue-600">
                      {selectedPipeline?.stages.find(s => s._id === selectedLead.stageId)?.name || 'Unknown'}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl">
                    <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <p className="text-sm font-bold text-purple-600 capitalize">
                      {selectedLead.priority}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-xl">
                    <CalendarIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Expected Close</p>
                    <p className="text-sm font-bold text-orange-600">
                      {selectedLead.expectedCloseDate
                        ? format(new Date(selectedLead.expectedCloseDate), 'MMM d, yyyy')
                        : 'Not set'}
                    </p>
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
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
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
                  <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Lead created</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(selectedLead.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {selectedLead.lastActivity && (
                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-blue-600" />
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
