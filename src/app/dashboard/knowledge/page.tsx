"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  FileText,
  Database,
  Brain,
  Upload,
  Download,
  Edit,
  Trash2,
  Eye,
  Tag,
  Calendar,
  User,
  BookOpen,
  Lightbulb,
  MessageCircle,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Globe,
  Lock,
  Users
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

const fetcher = (url: string) => fetch(url).then(r => r.json());

// Mock data for knowledge base items
const mockKnowledgeItems = [
  {
    id: "kb-1",
    title: "Customer Service Best Practices",
    description: "Comprehensive guide for handling customer inquiries and complaints",
    type: "document",
    category: "Customer Service",
    status: "active",
    visibility: "public",
    usage_count: 156,
    last_updated: "2024-01-15T10:30:00Z",
    created_by: "John Doe",
    tags: ["customer-service", "best-practices", "communication"],
    content_preview: "This document outlines the best practices for providing excellent customer service...",
    ai_training_status: "trained",
    performance_score: 92
  },
  {
    id: "kb-2",
    title: "Product Information Database",
    description: "Detailed information about all products and services",
    type: "database",
    category: "Products",
    status: "active",
    visibility: "private",
    usage_count: 89,
    last_updated: "2024-01-14T15:45:00Z",
    created_by: "Sarah Wilson",
    tags: ["products", "specifications", "pricing"],
    content_preview: "Complete product catalog with specifications, pricing, and availability...",
    ai_training_status: "training",
    performance_score: 85
  },
  {
    id: "kb-3",
    title: "FAQ Collection",
    description: "Frequently asked questions and their answers",
    type: "faq",
    category: "Support",
    status: "draft",
    visibility: "public",
    usage_count: 234,
    last_updated: "2024-01-13T09:20:00Z",
    created_by: "Mike Johnson",
    tags: ["faq", "support", "common-questions"],
    content_preview: "Q: How do I reset my password? A: You can reset your password by...",
    ai_training_status: "pending",
    performance_score: 78
  },
  {
    id: "kb-4",
    title: "Company Policies",
    description: "Internal policies and procedures",
    type: "policy",
    category: "Internal",
    status: "active",
    visibility: "private",
    usage_count: 45,
    last_updated: "2024-01-12T14:10:00Z",
    created_by: "HR Team",
    tags: ["policies", "procedures", "internal"],
    content_preview: "This document contains all company policies regarding...",
    ai_training_status: "trained",
    performance_score: 95
  }
];

export default function KnowledgePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newItemType, setNewItemType] = useState("document");
  const router = useRouter();

  // Mock SWR data
  const { data: knowledgeData } = useSWR("/api/knowledge", () => ({
    items: mockKnowledgeItems,
    stats: {
      total_items: 4,
      active_items: 3,
      trained_items: 2,
      total_usage: 524
    }
  }));

  const stats = knowledgeData?.stats || {
    total_items: 0,
    active_items: 0,
    trained_items: 0,
    total_usage: 0
  };

  const filteredItems = mockKnowledgeItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="h-4 w-4" />;
      case "database": return <Database className="h-4 w-4" />;
      case "faq": return <MessageCircle className="h-4 w-4" />;
      case "policy": return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "draft": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "archived": return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getTrainingStatusColor = (status: string) => {
    switch (status) {
      case "trained": return "bg-green-500/10 text-green-600";
      case "training": return "bg-blue-500/10 text-blue-600";
      case "pending": return "bg-yellow-500/10 text-yellow-600";
      case "failed": return "bg-red-500/10 text-red-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen text-foreground flex">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto h-fit max-h-screen bg-background">
        <DashboardHeader />
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
                  <p className="text-muted-foreground">
                    Manage your AI training data and knowledge resources
                  </p>
                </div>

                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Knowledge
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Knowledge Item</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="item-type">Type</Label>
                        <Select value={newItemType} onValueChange={setNewItemType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="document">Document</SelectItem>
                            <SelectItem value="database">Database</SelectItem>
                            <SelectItem value="faq">FAQ</SelectItem>
                            <SelectItem value="policy">Policy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="Enter knowledge item title" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Brief description of the knowledge item" />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch id="public" />
                        <Label htmlFor="public">Make publicly accessible</Label>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button className="flex-1">Create Item</Button>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                        <p className="text-2xl font-bold">{stats.total_items}</p>
                      </div>
                      <Database className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Items</p>
                        <p className="text-2xl font-bold">{stats.active_items}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">AI Trained</p>
                        <p className="text-2xl font-bold">{stats.trained_items}</p>
                      </div>
                      <Brain className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Usage</p>
                        <p className="text-2xl font-bold">{stats.total_usage}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Tabs defaultValue="all" className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <TabsList>
                  <TabsTrigger value="all">All Knowledge</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="faqs">FAQs</TabsTrigger>
                  <TabsTrigger value="training">AI Training</TabsTrigger>
                </TabsList>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search knowledge..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-[300px]"
                    />
                  </div>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Customer Service">Customer Service</SelectItem>
                      <SelectItem value="Products">Products</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                      <SelectItem value="Internal">Internal</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                    </SelectContent>
                  </Select> */}

                  {/* <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select> */}
                </div>
              </div>

              <TabsContent value="all" className="space-y-4">
                <div className="grid gap-4">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                {getTypeIcon(item.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">{item.title}</h3>
                                  {item.visibility === "private" && <Lock className="h-4 w-4 text-muted-foreground" />}
                                  <Badge variant="outline" className={getStatusColor(item.status)}>
                                    {item.status}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground text-sm mb-2">{item.description}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{item.content_preview}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {item.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {item.created_by}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(item.last_updated).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Activity className="h-3 w-3" />
                                  {item.usage_count} uses
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Badge className={getTrainingStatusColor(item.ai_training_status)}>
                                    {item.ai_training_status}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span className="text-xs">{item.performance_score}%</span>
                                  </div>
                                </div>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Download className="h-4 w-4 mr-2" />
                                      Export
                                    </DropdownMenuItem>
                                    <Separator />
                                    <DropdownMenuItem className="text-destructive">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredItems.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No knowledge items found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm ? "Try adjusting your search terms or filters" : "Get started by adding your first knowledge item"}
                      </p>
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Knowledge Item
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="documents">
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Documents View</h3>
                  <p className="text-muted-foreground">Document-specific view coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="faqs">
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">FAQs View</h3>
                  <p className="text-muted-foreground">FAQ management view coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="training">
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">AI Training View</h3>
                  <p className="text-muted-foreground">AI training management coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
