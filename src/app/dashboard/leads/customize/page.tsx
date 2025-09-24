"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  ArrowLeft,
  Settings,
  Trash2,
  Edit,
  GripVertical,
  Save,
  Palette,
  Star,
  StarOff,
  Copy,
  Eye,
  EyeOff,
  MoreHorizontal,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types
type Stage = {
  _id: string;
  name: string;
  color: string;
  order: number;
  isDefault?: boolean;
};

type Pipeline = {
  _id: string;
  name: string;
  description?: string;
  stages: Stage[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

// Form schemas
const pipelineSchema = z.object({
  name: z.string().min(2, "Pipeline name must be at least 2 characters"),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const stageSchema = z.object({
  name: z.string().min(2, "Stage name must be at least 2 characters"),
  color: z.string().min(4, "Please select a color"),
});

// Predefined colors
const stageColors = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Red", value: "#ef4444" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Yellow", value: "#eab308" },
  { name: "Rose", value: "#f43f5e" },
];

// Default pipeline templates
const pipelineTemplates = [
  {
    name: "Sales Pipeline",
    description: "Standard sales process from lead to close",
    stages: [
      { name: "New Lead", color: "#3b82f6" },
      { name: "Qualified", color: "#10b981" },
      { name: "Proposal", color: "#f59e0b" },
      { name: "Negotiation", color: "#8b5cf6" },
      { name: "Closed Won", color: "#059669" },
      { name: "Closed Lost", color: "#ef4444" },
    ],
  },
  {
    name: "Customer Support",
    description: "Support ticket resolution pipeline",
    stages: [
      { name: "New Ticket", color: "#3b82f6" },
      { name: "In Progress", color: "#f59e0b" },
      { name: "Waiting", color: "#8b5cf6" },
      { name: "Resolved", color: "#10b981" },
      { name: "Closed", color: "#6b7280" },
    ],
  },
  {
    name: "Recruitment",
    description: "Candidate hiring process",
    stages: [
      { name: "Applied", color: "#3b82f6" },
      { name: "Screening", color: "#f59e0b" },
      { name: "Interview", color: "#8b5cf6" },
      { name: "Reference Check", color: "#06b6d4" },
      { name: "Offer", color: "#10b981" },
      { name: "Hired", color: "#059669" },
      { name: "Rejected", color: "#ef4444" },
    ],
  },
];

export default function CustomizePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [showCreatePipeline, setShowCreatePipeline] = useState(false);
  const [showCreateStage, setShowCreateStage] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'pipeline' | 'stage', id: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const pipelineForm = useForm<z.infer<typeof pipelineSchema>>({
    resolver: zodResolver(pipelineSchema),
    defaultValues: {
      name: "",
      description: "",
      isDefault: false,
    },
  });

  const stageForm = useForm<z.infer<typeof stageSchema>>({
    resolver: zodResolver(stageSchema),
    defaultValues: {
      name: "",
      color: "#3b82f6",
    },
  });

  // Fetch pipelines
  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/pipelines");
      if (response.ok) {
        const data = await response.json();
        setPipelines(data.pipelines);

        // Select first pipeline by default
        if (data.pipelines.length > 0 && !selectedPipeline) {
          setSelectedPipeline(data.pipelines[0]);
        }
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

  const handleCreatePipeline = async (data: z.infer<typeof pipelineSchema>) => {
    try {
      setSaving(true);
      const response = await fetch("/api/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          stages: [
            { name: "New", color: "#3b82f6" }
          ],
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPipelines(prev => [...prev, result.pipeline]);
        setSelectedPipeline(result.pipeline);
        setShowCreatePipeline(false);
        pipelineForm.reset();
        toast({
          title: "Success",
          description: "Pipeline created successfully",
        });
      }
    } catch (error) {
      console.error("Error creating pipeline:", error);
      toast({
        title: "Error",
        description: "Failed to create pipeline",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFromTemplate = async (template: typeof pipelineTemplates[0]) => {
    try {
      setSaving(true);
      const response = await fetch("/api/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          stages: template.stages,
          isDefault: false,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPipelines(prev => [...prev, result.pipeline]);
        setSelectedPipeline(result.pipeline);
        setShowTemplates(false);
        toast({
          title: "Success",
          description: `Pipeline "${template.name}" created from template`,
        });
      }
    } catch (error) {
      console.error("Error creating pipeline from template:", error);
      toast({
        title: "Error",
        description: "Failed to create pipeline from template",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePipeline = async (data: z.infer<typeof pipelineSchema>) => {
    if (!editingPipeline) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/pipelines/${editingPipeline._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setPipelines(prev =>
          prev.map(p => p._id === editingPipeline._id ? result.pipeline : p)
        );
        setSelectedPipeline(result.pipeline);
        setEditingPipeline(null);
        pipelineForm.reset();
        toast({
          title: "Success",
          description: "Pipeline updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating pipeline:", error);
      toast({
        title: "Error",
        description: "Failed to update pipeline",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddStage = async (data: z.infer<typeof stageSchema>) => {
    if (!selectedPipeline) return;

    try {
      setSaving(true);
      const newStage = {
        ...data,
        order: selectedPipeline.stages.length,
      };

      const response = await fetch(`/api/pipelines/${selectedPipeline._id}/stages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStage),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedPipeline = { ...selectedPipeline, stages: result.stages };
        setSelectedPipeline(updatedPipeline);
        setPipelines(prev =>
          prev.map(p => p._id === selectedPipeline._id ? updatedPipeline : p)
        );
        setShowCreateStage(false);
        stageForm.reset();
        toast({
          title: "Success",
          description: "Stage added successfully",
        });
      }
    } catch (error) {
      console.error("Error adding stage:", error);
      toast({
        title: "Error",
        description: "Failed to add stage",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStage = async (data: z.infer<typeof stageSchema>) => {
    if (!editingStage || !selectedPipeline) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/pipelines/${selectedPipeline._id}/stages/${editingStage._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedPipeline = { ...selectedPipeline, stages: result.stages };
        setSelectedPipeline(updatedPipeline);
        setPipelines(prev =>
          prev.map(p => p._id === selectedPipeline._id ? updatedPipeline : p)
        );
        setEditingStage(null);
        stageForm.reset();
        toast({
          title: "Success",
          description: "Stage updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating stage:", error);
      toast({
        title: "Error",
        description: "Failed to update stage",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReorderStages = async (result: DropResult) => {
    if (!result.destination || !selectedPipeline) return;

    const items = Array.from(selectedPipeline.stages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedStages = items.map((stage, index) => ({ ...stage, order: index }));

    // Update local state immediately for better UX
    const updatedPipeline = { ...selectedPipeline, stages: updatedStages };
    setSelectedPipeline(updatedPipeline);

    try {
      const response = await fetch(`/api/pipelines/${selectedPipeline._id}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stages: updatedStages }),
      });

      if (response.ok) {
        setPipelines(prev =>
          prev.map(p => p._id === selectedPipeline._id ? updatedPipeline : p)
        );
      } else {
        // Revert on error
        setSelectedPipeline(selectedPipeline);
        toast({
          title: "Error",
          description: "Failed to reorder stages",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error reordering stages:", error);
      setSelectedPipeline(selectedPipeline);
    }
  };

  const handleDeletePipeline = async (pipelineId: string) => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPipelines(prev => prev.filter(p => p._id !== pipelineId));
        if (selectedPipeline?._id === pipelineId) {
          const remaining = pipelines.filter(p => p._id !== pipelineId);
          setSelectedPipeline(remaining[0] || null);
        }
        setDeleteConfirm(null);
        toast({
          title: "Success",
          description: "Pipeline deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting pipeline:", error);
      toast({
        title: "Error",
        description: "Failed to delete pipeline",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!selectedPipeline) return;

    try {
      const response = await fetch(`/api/pipelines/${selectedPipeline._id}/stages/${stageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const result = await response.json();
        const updatedPipeline = { ...selectedPipeline, stages: result.stages };
        setSelectedPipeline(updatedPipeline);
        setPipelines(prev =>
          prev.map(p => p._id === selectedPipeline._id ? updatedPipeline : p)
        );
        setDeleteConfirm(null);
        toast({
          title: "Success",
          description: "Stage deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting stage:", error);
      toast({
        title: "Error",
        description: "Failed to delete stage",
        variant: "destructive",
      });
    }
  };

  const handleSetDefaultPipeline = async (pipelineId: string) => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/default`, {
        method: "PATCH",
      });

      if (response.ok) {
        setPipelines(prev =>
          prev.map(p => ({ ...p, isDefault: p._id === pipelineId }))
        );
        if (selectedPipeline?._id === pipelineId) {
          setSelectedPipeline({ ...selectedPipeline, isDefault: true });
        }
        toast({
          title: "Success",
          description: "Default pipeline updated",
        });
      }
    } catch (error) {
      console.error("Error setting default pipeline:", error);
      toast({
        title: "Error",
        description: "Failed to set default pipeline",
        variant: "destructive",
      });
    }
  };

  const handleEditPipeline = (pipeline: Pipeline) => {
    setEditingPipeline(pipeline);
    pipelineForm.reset({
      name: pipeline.name,
      description: pipeline.description || "",
      isDefault: pipeline.isDefault,
    });
  };

  const handleEditStage = (stage: Stage) => {
    setEditingStage(stage);
    stageForm.reset({
      name: stage.name,
      color: stage.color,
    });
  };

  // Animation variants
  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-foreground flex">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <DashboardHeader />
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading pipelines...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground flex">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto bg-background">
        <DashboardHeader />

        <div className="p-6">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
            className="mb-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/leads')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Leads
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Pipeline Customization</h1>
                <p className="text-muted-foreground mt-1">
                  Create and customize your sales pipelines and stages
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplates(true)}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Use Template
                </Button>

                <Button
                  onClick={() => setShowCreatePipeline(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Pipeline
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Pipeline List */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariant}
              className="lg:col-span-1"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pipelines</CardTitle>
                  <CardDescription>
                    Select a pipeline to customize
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {pipelines.map((pipeline) => (
                      <motion.div
                        key={pipeline._id}
                        whileHover={{ x: 4 }}
                        className={cn(
                          "flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                          selectedPipeline?._id === pipeline._id && "bg-primary/10 border-r-2 border-primary"
                        )}
                        onClick={() => setSelectedPipeline(pipeline)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {pipeline.name}
                            </p>
                            {pipeline.isDefault && (
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {pipeline.stages.length} stages
                          </p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPipeline(pipeline);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Pipeline
                            </DropdownMenuItem>
                            {!pipeline.isDefault && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetDefaultPipeline(pipeline._id);
                                }}
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Set as Default
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm({ type: 'pipeline', id: pipeline._id });
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Pipeline
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pipeline Editor */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariant}
              className="lg:col-span-3"
            >
              {selectedPipeline ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle>{selectedPipeline.name}</CardTitle>
                          {selectedPipeline.isDefault && (
                            <Badge variant="outline" className="gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <CardDescription>
                          {selectedPipeline.description || "No description"}
                        </CardDescription>
                      </div>

                      <Button
                        onClick={() => setShowCreateStage(true)}
                        size="sm"
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Stage
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <DragDropContext onDragEnd={handleReorderStages}>
                      <Droppable droppableId="stages">
                        {(provided) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            variants={staggerChildren}
                            initial="hidden"
                            animate="visible"
                            className="space-y-3"
                          >
                            {selectedPipeline.stages
                              .sort((a, b) => a.order - b.order)
                              .map((stage, index) => (
                                <Draggable
                                  key={stage._id}
                                  draggableId={stage._id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <motion.div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      variants={fadeInUpVariant}
                                      className={cn(
                                        "flex items-center gap-4 p-4 bg-card border rounded-lg transition-all duration-200",
                                        snapshot.isDragging && "shadow-lg rotate-1"
                                      )}
                                    >
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-move text-muted-foreground hover:text-foreground"
                                      >
                                        <GripVertical className="h-4 w-4" />
                                      </div>

                                      <div
                                        className="w-4 h-4 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: stage.color }}
                                      />

                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium">{stage.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Position {stage.order + 1}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleEditStage(stage)}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>

                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive hover:text-destructive"
                                          onClick={() => setDeleteConfirm({ type: 'stage', id: stage._id })}
                                          disabled={selectedPipeline.stages.length === 1}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </motion.div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </motion.div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    {selectedPipeline.stages.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium mb-2">No Stages</h3>
                        <p className="text-muted-foreground mb-4">
                          Add stages to define your pipeline workflow
                        </p>
                        <Button onClick={() => setShowCreateStage(true)} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Stage
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Pipeline Selected</h3>
                    <p className="text-muted-foreground text-center mb-6 max-w-md">
                      Select a pipeline from the list to customize its stages, or create a new one
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowTemplates(true)}
                      >
                        Use Template
                      </Button>
                      <Button onClick={() => setShowCreatePipeline(true)}>
                        Create Pipeline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Create/Edit Pipeline Dialog */}
      <Dialog
        open={showCreatePipeline || !!editingPipeline}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreatePipeline(false);
            setEditingPipeline(null);
            pipelineForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPipeline ? "Edit Pipeline" : "Create New Pipeline"}
            </DialogTitle>
            <DialogDescription>
              {editingPipeline
                ? "Update your pipeline details"
                : "Create a new sales pipeline to organize your leads"}
            </DialogDescription>
          </DialogHeader>

          <Form {...pipelineForm}>
            <form
              onSubmit={pipelineForm.handleSubmit(
                editingPipeline ? handleUpdatePipeline : handleCreatePipeline
              )}
              className="space-y-4"
            >
              <FormField
                control={pipelineForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pipeline Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sales Pipeline" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={pipelineForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the purpose of this pipeline..."
                        className="resize-none h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreatePipeline(false);
                    setEditingPipeline(null);
                    pipelineForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      {editingPipeline ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingPipeline ? "Update Pipeline" : "Create Pipeline"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Stage Dialog */}
      <Dialog
        open={showCreateStage || !!editingStage}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateStage(false);
            setEditingStage(null);
            stageForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStage ? "Edit Stage" : "Add New Stage"}
            </DialogTitle>
            <DialogDescription>
              {editingStage
                ? "Update the stage details"
                : "Add a new stage to your pipeline"}
            </DialogDescription>
          </DialogHeader>

          <Form {...stageForm}>
            <form
              onSubmit={stageForm.handleSubmit(
                editingStage ? handleUpdateStage : handleAddStage
              )}
              className="space-y-4"
            >
              <FormField
                control={stageForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Qualified Lead" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={stageForm.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage Color</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="grid grid-cols-5 gap-2">
                          {stageColors.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={cn(
                                "w-10 h-10 rounded-full border-2 transition-all",
                                field.value === color.value
                                  ? "border-foreground scale-110"
                                  : "border-transparent hover:scale-105"
                              )}
                              style={{ backgroundColor: color.value }}
                              onClick={() => field.onChange(color.value)}
                              title={color.name}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: field.value }}
                          />
                          <span className="text-sm text-muted-foreground">
                            Selected Color
                          </span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateStage(false);
                    setEditingStage(null);
                    stageForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      {editingStage ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingStage ? "Update Stage" : "Add Stage"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Pipeline Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Pipeline Templates</DialogTitle>
            <DialogDescription>
              Choose from pre-built pipeline templates to get started quickly
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 max-h-[400px] overflow-y-auto">
            {pipelineTemplates.map((template, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => handleCreateFromTemplate(template)}
              >
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {template.stages.map((stage, stageIndex) => (
                      <div
                        key={stageIndex}
                        className="flex items-center gap-2 px-2 py-1 bg-card border rounded text-xs"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        {stage.name}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplates(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.type === 'pipeline'
                ? "This will permanently delete the pipeline and all associated leads. This action cannot be undone."
                : "This will permanently delete the stage. Any leads in this stage will be moved to the first stage. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
         <AlertDialogAction
              onClick={() => {
                if (deleteConfirm?.type === 'pipeline') {
                  handleDeletePipeline(deleteConfirm.id);
                } else if (deleteConfirm?.type === 'stage') {
                  handleDeleteStage(deleteConfirm.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
