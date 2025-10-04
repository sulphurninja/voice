"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  Save,
  FileText,
  Link,
  Upload,
  Globe,
  Tag,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const editSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().optional(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  category: z.string().optional(),
  tags: z.string().optional(),
  isGlobal: z.boolean(),
});

export default function EditKnowledgePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: "",
      description: "",
      content: "",
      url: "",
      category: "",
      tags: "",
      isGlobal: false,
    }
  });

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

        // Set form values
        form.reset({
          name: data.name,
          description: data.description || "",
          content: data.content || "",
          url: data.url || "",
          category: data.category || "",
          tags: data.tags ? data.tags.join(", ") : "",
          isGlobal: data.isGlobal || false,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [params.id, form]);

  const onSubmit = async (values: z.infer<typeof editSchema>) => {
    try {
      setSaving(true);

      const payload = {
        name: values.name,
        description: values.description,
        content: values.content,
        url: values.url,
        category: values.category,
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        isGlobal: values.isGlobal,
        lastModified: new Date(),
      };

      const response = await fetch(`/api/knowledge/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update document');
      }

      toast.success('Document updated successfully');
      router.push(`/dashboard/knowledge/${params.id}`);
    } catch (error) {
      toast.error('Failed to update document');
      console.error('Error updating document:', error);
    } finally {
      setSaving(false);
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
                onClick={() => router.push(`/dashboard/knowledge/${params.id}`)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Document
              </Button>

              <div className="flex items-center gap-2">
                <div className={cn("p-2 rounded-lg", getTypeColor(document.type))}>
                  {getTypeIcon(document.type)}
                </div>
                <Badge variant="outline" className={getTypeColor(document.type)}>
                  {document.type.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <h1 className="text-2xl font-bold">Edit Knowledge Document</h1>
              {document.isGlobal && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  <Globe className="h-3 w-3 mr-1" />
                  Global
                </Badge>
              )}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Document name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description of the document"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional description to help identify the document's purpose
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Content */}
                <Card>
                  <CardHeader>
                    <CardTitle>Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {document.type === 'text' && (
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Text Content</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter the text content..."
                                rows={12}
                                className="resize-none font-mono text-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              The text content that will be used for AI training
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {document.type === 'url' && (
                      <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com"
                                type="url"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              The URL that will be scraped for content
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {document.type === 'file' && (
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Upload className="h-4 w-4" />
                          <p className="font-medium">File Document</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          File content cannot be edited directly. To change the file content,
                          you would need to delete this document and create a new one with the updated file.
                        </p>
                        {document.fileName && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Current file: {document.fileName}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Organization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Organization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Customer Service, Products, Support"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional category to group related documents
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="tag1, tag2, tag3"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Comma-separated tags to help organize and find documents
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isGlobal"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Global Document
                            </FormLabel>
                            <FormDescription>
                              Make this document available to all agents by default
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* AI Training Status */}
                {document.elevenLabsDocumentId && (
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Training Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-green-700 dark:text-white -400">
                            Document is AI-ready
                          </p>
                          <p className="text-sm text-green-600 dark:text-white/60 -500">
                            This document has been processed and is available for AI training
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-500 mt-1 font-mono">
                            ElevenLabs ID: {document.elevenLabsDocumentId}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Submit Actions */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/knowledge/${params.id}`)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="gap-2 min-w-[120px]"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 border-2 border-foreground/20 border-t-foreground/100 rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}
