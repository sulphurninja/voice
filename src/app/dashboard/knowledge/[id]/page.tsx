"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Download,
  Trash2,
  Calendar,
  User,
  Activity,
  Globe,
  Lock,
  FileText,
  Link,
  Upload,
  ExternalLink,
  Tag,
  Eye,
  Brain,
  Users,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function KnowledgeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/knowledge/${params.id}`);

        if (!response.ok) {
          throw new Error('Document not found');
        }

        const data = await response.json();
        setDocument(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [params.id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/knowledge/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      toast.success('Document deleted successfully');
      router.push('/dashboard/knowledge');
    } catch (error) {
      toast.error('Failed to delete document');
      console.error('Error deleting document:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/knowledge/${params.id}/download`);

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text": return <FileText className="h-5 w-5" />;
      case "url": return <Link className="h-5 w-5" />;
      case "file": return <Upload className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "text": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "url": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "file": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-foreground flex">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto h-fit max-h-screen bg-background">
          <DashboardHeader />
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-8 w-48" />
              </div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen text-foreground flex">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto h-fit max-h-screen bg-background">
          <DashboardHeader />
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="max-w-4xl mx-auto">
              <Button
                variant="ghost"
                className="mb-4 -ml-2"
                onClick={() => router.push("/dashboard/knowledge")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Knowledge Base
              </Button>
              <Card className="border-destructive">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-destructive">Document Not Found</h3>
                  <p className="text-muted-foreground mb-4">{error || 'The requested document could not be found.'}</p>
                  <Button variant="outline" onClick={() => router.push('/dashboard/knowledge')}>
                    Return to Knowledge Base
                  </Button>
                </CardContent>
              </Card>
            </div>
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
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                className="-ml-2"
                onClick={() => router.push("/dashboard/knowledge")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Knowledge Base
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/knowledge/${params.id}/edit`)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Document Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-lg", getTypeColor(document.type))}>
                      {getTypeIcon(document.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl font-bold">{document.name}</h1>
                        {document.isGlobal && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                            <Globe className="h-3 w-3 mr-1" />
                            Global
                          </Badge>
                        )}
                        <Badge variant="outline" className={getTypeColor(document.type)}>
                          {document.type.toUpperCase()}
                        </Badge>
                        {document.elevenLabsDocumentId ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            AI Ready
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                            <Clock className="h-3 w-3 mr-1" />
                            Processing
                          </Badge>
                        )}
                      </div>
                      {document.description && (
                        <p className="text-muted-foreground">{document.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {document.type === 'text' && document.content ? (
                      <ScrollArea className="h-96 w-full rounded border p-4">
                        <pre className="whitespace-pre-wrap text-sm">{document.content}</pre>
                      </ScrollArea>
                    ) : document.type === 'url' && document.url ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/30">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={document.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex-1 break-all"
                          >
                            {document.url}
                          </a>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          This document references external content from the URL above.
                        </p>
                      </div>
                    ) : document.type === 'file' ? (
                      <div className="text-center py-8">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          File content preview not available. Use download to access the file.
                        </p>
                        {document.fileName && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Filename: {document.fileName}
                          </p>
                        )}
                        {document.fileSize && (
                          <p className="text-sm text-muted-foreground">
                            Size: {(document.fileSize / 1024).toFixed(2)} KB
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No content available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tags */}
                {document.tags && document.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {document.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Created</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Last Modified</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(document.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Downloads</p>
                        <p className="text-sm text-muted-foreground">
                          {document.usageCount}
                        </p>
                      </div>
                    </div>

                    {document.category && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Category</p>
                          <p className="text-sm text-muted-foreground">
                            {document.category}
                          </p>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">AI Training Status</p>
                        <p className="text-sm text-muted-foreground">
                          {document.elevenLabsDocumentId ? 'Trained' : 'Pending'}
                        </p>
                      </div>
                    </div>
{/*
                    {document.elevenLabsDocumentId && (
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-sm font-medium">ElevenLabs ID</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {document.elevenLabsDocumentId}
                          </p>
                        </div>
                      </div>
                    )} */}
                  </CardContent>
                </Card>

                {/* Agent Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Agent Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {document.isGlobal ? (
                      <div className="text-center py-4">
                        <Globe className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Available to all agents
                        </p>
                      </div>
                    ) : document.agentIds && document.agentIds.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Used by {document.agentIds.length} agent(s)
                        </p>
                        {/* You could fetch and display agent names here */}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          Not used by any agents
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{document?.name}" and remove it from all agents that use it.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Document"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div >
  );
}
