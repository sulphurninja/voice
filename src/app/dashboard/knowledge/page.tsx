"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  Search,
  Plus,
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
  MessageCircle,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Globe,
  Lock,
  Link,
  Users,
  ExternalLink
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function KnowledgePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newItemType, setNewItemType] = useState("text");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    url: "",
    category: "",
    tags: "",
    isGlobal: false,
  });

  const router = useRouter();

  const { data: knowledgeData, error, mutate } = useSWR("/api/knowledge", fetcher);

  const documents = knowledgeData?.documents || [];
  const stats = knowledgeData?.stats || {
    total_items: 0,
    active_items: 0,
    global_items: 0,
    total_usage: 0
  };

  // Add this state near the top with other state declarations
  const [existingKnowledge, setExistingKnowledge] = useState<any[]>([]);

  // Add this useEffect to load existing knowledge documents
  useEffect(() => {
    const fetchKnowledgeDocuments = async () => {
      try {
        const response = await fetch('/api/knowledge');
        if (response.ok) {
          const data = await response.json();
          setExistingKnowledge(data.documents || []);
        }
      } catch (error) {
        console.error('Error fetching knowledge documents:', error);
      }
    };

    fetchKnowledgeDocuments();
  }, []);

  const filteredDocuments = documents.filter((doc: any) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesType = selectedType === "all" || doc.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = [...new Set(documents.map((doc: any) => doc.category).filter(Boolean))];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text": return <FileText className="h-4 w-4" />;
      case "url": return <Link className="h-4 w-4" />;
      case "file": return <Upload className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleCreateDocument = async () => {
    try {
      setCreating(true);

      const payload = {
        name: formData.name,
        type: newItemType,
        description: formData.description,
        content: newItemType === 'text' ? formData.content : undefined,
        url: newItemType === 'url' ? formData.url : undefined,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        isGlobal: formData.isGlobal,
      };

      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      toast.success('Knowledge document created successfully');
      setShowCreateDialog(false);
      setFormData({
        name: "",
        description: "",
        content: "",
        url: "",
        category: "",
        tags: "",
        isGlobal: false,
      });
      mutate();
    } catch (error) {
      toast.error('Failed to create document');
      console.error('Error creating document:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/knowledge/${documentToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      toast.success('Document deleted successfully');
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      mutate();
    } catch (error) {
      toast.error('Failed to delete document');
      console.error('Error deleting document:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`/api/knowledge/${id}/download`);

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = response.headers.get('content-disposition')?.split('filename=')[1] || 'document.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Document downloaded successfully');
    } catch (error) {
      toast.error('Failed to download document');
      console.error('Error downloading document:', error);
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
                <div className="gap-2 flex">
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Knowledge
                      </Button>

                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Knowledge Item</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="item-type">Type</Label>
                            <Select value={newItemType} onValueChange={setNewItemType}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text Content</SelectItem>
                                <SelectItem value="url">Website URL</SelectItem>
                                <SelectItem value="file">Upload File</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              placeholder="Enter document name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Brief description of the knowledge item"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                          />
                        </div>

                        {newItemType === 'text' && (
                          <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                              id="content"
                              placeholder="Enter the text content..."
                              value={formData.content}
                              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                              rows={6}
                            />
                          </div>
                        )}

                        {newItemType === 'url' && (
                          <div className="space-y-2">
                            <Label htmlFor="url">Website URL</Label>
                            <Input
                              id="url"
                              placeholder="https://example.com"
                              value={formData.url}
                              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="category">Category (Optional)</Label>
                            <Input
                              id="category"
                              placeholder="e.g., Customer Service"
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tags">Tags (Optional)</Label>
                            <Input
                              id="tags"
                              placeholder="tag1, tag2, tag3"
                              value={formData.tags}
                              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="global"
                            checked={formData.isGlobal}
                            onCheckedChange={(checked) => setFormData({ ...formData, isGlobal: checked })}
                          />
                          <Label htmlFor="global">Make available to all agents by default</Label>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={handleCreateDocument}
                            disabled={creating || !formData.name || (newItemType === 'text' && !formData.content) || (newItemType === 'url' && !formData.url)}
                            className="flex-1"
                          >
                            {creating ? "Creating..." : "Create Item"}
                          </Button>
                          <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/knowledge/sync', {
                          method: 'POST',
                        });

                        if (response.ok) {
                          const result = await response.json();
                          toast.success(`Synced ${result.result.totalSynced} documents to ${result.result.agentsSynced} agents`);
                          mutate(); // Refresh the data
                        } else {
                          throw new Error('Sync failed');
                        }
                      } catch (error) {
                        toast.error('Failed to sync global documents');
                      }
                    }}
                    className="gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    Sync Global Docs
                  </Button>
                </div>
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
                        <p className="text-sm font-medium text-muted-foreground">AI Ready</p>
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
                        <p className="text-sm font-medium text-muted-foreground">Global Items</p>
                        <p className="text-2xl font-bold">{stats.global_items}</p>
                      </div>
                      <Globe className="h-8 w-8 text-purple-500" />
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
                  <TabsTrigger value="urls">URLs</TabsTrigger>
                  <TabsTrigger value="global">Global</TabsTrigger>
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

                  {categories.length > 0 && (
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="file">File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="all" className="space-y-4">
                <div className="grid gap-4">
                  {filteredDocuments.map((doc: any) => (
                    <Card key={doc._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                {getTypeIcon(doc.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">{doc.name}</h3>
                                  {doc.isGlobal && <Globe className="h-4 w-4 text-blue-500" />}
                                  {doc.elevenLabsDocumentId ? (
                                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                      AI Ready
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                      Processing
                                    </Badge>
                                  )}
                                </div>
                                {doc.description && (
                                  <p className="text-muted-foreground text-sm mb-2">{doc.description}</p>
                                )}
                                {doc.type === 'text' && doc.content && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {doc.content.substring(0, 150)}...
                                  </p>
                                )}
                                {doc.type === 'url' && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <ExternalLink className="h-3 w-3" />
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                      {doc.url}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            {doc.tags && doc.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {doc.tags.map((tag: string) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(doc.uploadedAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Activity className="h-3 w-3" />
                                  {doc.usageCount} downloads
                                </div>
                                {doc.category && (
                                  <div className="flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    {doc.category}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleDownload(doc._id)}>
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/knowledge/${doc._id}`)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/knowledge/${doc._id}/edit`)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <Separator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => {
                                        setDocumentToDelete(doc._id);
                                        setDeleteDialogOpen(true);
                                      }}
                                    >
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

                {filteredDocuments.length === 0 && !error && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        {searchTerm || selectedCategory !== 'all' || selectedType !== 'all'
                          ? 'No matching documents found'
                          : 'No knowledge documents yet'
                        }
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || selectedCategory !== 'all' || selectedType !== 'all'
                          ? "Try adjusting your search terms or filters"
                          : "Get started by adding your first knowledge document"
                        }
                      </p>
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Knowledge Document
                      </Button>

                    </CardContent>
                  </Card>
                )}

                {/* Existing Knowledge Base */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Available Knowledge Documents</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/dashboard/knowledge')}
                      className="gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      Manage Knowledge Base
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground mb-3">
                    Global knowledge documents are automatically included. You can also add specific documents for this agent.
                  </div>

                  {existingKnowledge.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-green-600">Global Documents (Auto-included)</h5>
                      <div className="grid gap-2">
                        {existingKnowledge.filter(doc => doc.isGlobal).map((doc: any) => (
                          <div key={doc._id} className="flex items-center gap-2 p-2 border rounded bg-green-50 dark:bg-green-950/20">
                            {doc.type === 'text' && <FileText className="h-4 w-4 text-green-600" />}
                            {doc.type === 'url' && <Link className="h-4 w-4 text-green-600" />}
                            {doc.type === 'file' && <Upload className="h-4 w-4 text-green-600" />}
                            <span className="text-sm">{doc.name}</span>
                            <Globe className="h-3 w-3 text-green-600 ml-auto" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />
                {error && (
                  <Card className="border-destructive">
                    <CardContent className="p-12 text-center">
                      <h3 className="text-lg font-medium mb-2 text-destructive">Error Loading Documents</h3>
                      <p className="text-muted-foreground mb-4">Failed to load knowledge documents</p>
                      <Button variant="outline" onClick={() => mutate()}>
                        Retry
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="grid gap-4">
                  {filteredDocuments.filter((doc: any) => doc.type === 'text' || doc.type === 'file').map((doc: any) => (
                    <Card key={doc._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                {getTypeIcon(doc.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">{doc.name}</h3>
                                  {doc.isGlobal && <Globe className="h-4 w-4 text-blue-500" />}
                                </div>
                                {doc.description && (
                                  <p className="text-muted-foreground text-sm mb-2">{doc.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="urls" className="space-y-4">
                <div className="grid gap-4">
                  {filteredDocuments.filter((doc: any) => doc.type === 'url').map((doc: any) => (
                    <Card key={doc._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                <Link className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">{doc.name}</h3>
                                  {doc.isGlobal && <Globe className="h-4 w-4 text-blue-500" />}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                  <ExternalLink className="h-3 w-3" />
                                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                    {doc.url}
                                  </a>
                                </div>
                                {doc.description && (
                                  <p className="text-muted-foreground text-sm">{doc.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="global" className="space-y-4">
                <div className="grid gap-4">
                  {filteredDocuments.filter((doc: any) => doc.isGlobal).map((doc: any) => (
                    <Card key={doc._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                {getTypeIcon(doc.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">{doc.name}</h3>
                                  <Globe className="h-4 w-4 text-blue-500" />
                                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                                    Global
                                  </Badge>
                                </div>
                                {doc.description && (
                                  <p className="text-muted-foreground text-sm">{doc.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this knowledge document. This action cannot be undone.
              Any agents using this document will lose access to it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Document"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
