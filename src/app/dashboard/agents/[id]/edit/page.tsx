"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useSWR from "swr";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  Trash2,
  PlayCircle,
  PauseCircle,
  Search,
  Mic,
  Plus,
  Upload,
  FileText,
  Link,
  BookOpen,
  Bot,
  Settings,
  Volume2,
  Wrench,
  Brain,
  Globe,
  Timer,
  Calculator,
  Calendar,
  Mail,
  SearchIcon
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VariableTextarea } from "@/components/ui/variable-textarea";

const agentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  voice_id: z.string().min(1, "Please select a voice"),
  first_message: z.string().min(3, "First message is required"),
  system_prompt: z.string().min(10, "System prompt must be at least 10 characters"),
  llm_model: z.string().optional(),
  temperature: z.number().min(0).max(1).optional(),
  language: z.string().optional(),
  max_duration_seconds: z.number().min(60).max(7200).optional(),
  knowledge_documents: z.array(z.object({
    type: z.enum(['file', 'url', 'text']),
    name: z.string(),
    content: z.string().optional(),
    url: z.string().optional(),
    document_id: z.string().optional(),
  })).optional(),
  tools: z.array(z.string()).optional(),
  disabled: z.boolean().optional(),
});

const availableTools = [
  {
    id: "web_search",
    name: "Web Search",
    description: "Search the internet for current information",
    icon: SearchIcon
  },
  {
    id: "calculator",
    name: "Calculator",
    description: "Perform mathematical calculations",
    icon: Calculator
  },
  {
    id: "calendar",
    name: "Calendar",
    description: "Access calendar and scheduling functions",
    icon: Calendar
  },
  {
    id: "email",
    name: "Email",
    description: "Send and manage email communications",
    icon: Mail
  }
];

const llmModels = [
  { id: "gpt-4o-mini", name: "GPT-4O Mini (Recommended)", description: "Best for most use cases" },
  { id: "gpt-4o", name: "GPT-4O", description: "Most capable model" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Fast and capable" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Fast and cost-effective" }
];

const languages = [
  { id: "en", name: "English" },
  { id: "es", name: "Spanish" },
  { id: "fr", name: "French" },
  { id: "de", name: "German" },
  { id: "it", name: "Italian" },
  { id: "pt", name: "Portuguese" },
  { id: "hi", name: "Hindi" },
  { id: "ja", name: "Japanese" },
  { id: "ko", name: "Korean" },
  { id: "zh", name: "Chinese" }
];

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function EditAgentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: voicesData, error: voicesError, isLoading: voicesLoading } = useSWR<{ voices: { id: string, name: string, tags: string, demo: string }[] }>("/api/voices", fetcher);

  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAgent, setDeletingAgent] = useState(false);
  const [voiceSearch, setVoiceSearch] = useState("");
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [knowledgeDocuments, setKnowledgeDocuments] = useState<Array<{
    type: 'file' | 'url' | 'text';
    name: string;
    content?: string;
    url?: string;
    document_id?: string;
  }>>([]);
  const [newDocumentType, setNewDocumentType] = useState<'file' | 'url' | 'text'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allVoices = voicesData?.voices || [];
  const filteredVoices = allVoices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
      voice.tags.toLowerCase().includes(voiceSearch.toLowerCase());
    return matchesSearch;
  });

  const form = useForm<z.infer<typeof agentSchema>>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: "",
      description: "",
      voice_id: "",
      first_message: "",
      system_prompt: "",
      llm_model: "gpt-4o-mini",
      temperature: 0.3,
      language: "en",
      max_duration_seconds: 1800,
      knowledge_documents: [],
      tools: [],
      disabled: false,
    }
  });

  const selectedVoiceId = form.watch("voice_id");
  const temperature = form.watch("temperature") || 0.3;
  const maxDuration = form.watch("max_duration_seconds") || 1800;

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/agents/${params.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch agent details");
        }

        const data = await response.json();
        setAgent(data);

        // Set form values
        form.reset({
          name: data.name,
          description: data.description || "",
          voice_id: data.voice_id,
          first_message: data.conversation_config?.first_message || "",
          system_prompt: data.conversation_config?.system_prompt || "",
          llm_model: data.llm_model || "gpt-4o-mini",
          temperature: data.temperature || 0.3,
          language: data.language || "en",
          max_duration_seconds: data.max_duration_seconds || 1800,
          tools: data.tools || [],
          disabled: data.disabled || false,
        });

        // Set knowledge documents
        setKnowledgeDocuments(data.knowledge_documents || []);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching agent:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [params.id, form]);

  const handlePlayVoice = (voiceId: string, demoUrl: string) => {
    if (playingVoice === voiceId) {
      if (audioRef) {
        audioRef.pause();
      }
      setPlayingVoice(null);
    } else {
      if (audioRef) {
        audioRef.pause();
      }

      const audio = new Audio(demoUrl);
      audio.onended = () => setPlayingVoice(null);
      audio.play().catch(err => console.error("Error playing audio:", err));
      setAudioRef(audio);
      setPlayingVoice(voiceId);
    }
  };

  const addKnowledgeDocument = () => {
    if (newDocumentType === 'file') {
      fileInputRef.current?.click();
    } else {
      setKnowledgeDocuments(prev => [...prev, {
        type: newDocumentType,
        name: newDocumentType === 'url' ? 'Website URL' : 'Text Document',
        content: newDocumentType === 'text' ? '' : undefined,
        url: newDocumentType === 'url' ? '' : undefined
      }]);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setKnowledgeDocuments(prev => [...prev, {
        type: 'file',
        name: file.name,
      }]);
    }
  };

  const updateKnowledgeDocument = (index: number, field: string, value: string) => {
    setKnowledgeDocuments(prev => prev.map((doc, i) =>
      i === index ? { ...doc, [field]: value } : doc
    ));
  };

  const removeKnowledgeDocument = (index: number) => {
    setKnowledgeDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof agentSchema>) => {
    try {
      setSaving(true);

      const submissionData = {
        ...values,
        knowledge_documents: knowledgeDocuments.filter(doc => {
          if (doc.document_id) return true; // Keep existing documents
          if (doc.type === 'text') return doc.content && doc.content.trim();
          if (doc.type === 'url') return doc.url && doc.url.trim();
          return false;
        })
      };

      console.log("Updating agent with data:", submissionData);

      const response = await fetch(`/api/agents/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update agent");
      }

      router.push("/dashboard/agents");
    } catch (err: any) {
      setError(err.message);
      console.error("Error updating agent:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAgent = async () => {
    try {
      setDeletingAgent(true);
      const response = await fetch(`/api/agents/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete agent");
      }

      router.push("/dashboard/agents");
    } catch (err: any) {
      setError(err.message);
      console.error("Error deleting agent:", err);
    } finally {
      setDeletingAgent(false);
    }
  };

  // Animation variants
  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen text-foreground flex">
      <DashboardSidebar />

      <main className="flex-1 h-screen overflow-y-auto bg-background">
        <DashboardHeader />

        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <Button
              variant="ghost"
              className="mb-4 -ml-2"
              onClick={() => router.push("/dashboard/agents")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Agents
            </Button>

            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Edit Agent</h1>
                <p className="text-muted-foreground mt-1">
                  Update your AI voice assistant's configuration
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Agent
              </Button>
            </div>

            {loading ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-1/3 mb-2" />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              </div>
            ) : error ? (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Error Loading Agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{error}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUpVariant}
              >
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="behavior">Behavior</TabsTrigger>
                        <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                      </TabsList>

                      {/* Basic Configuration */}
                      <TabsContent value="basic" className="space-y-6">
                        {/* Agent Identity */}
                        <Card className="border shadow-sm pt-0 overflow-hidden">
                          <CardHeader className="border-b bg-muted/30 pt-6">
                            <div className="flex items-center gap-2">
                              <Bot className="h-5 w-5 text-primary" />
                              <CardTitle>Agent Identity</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6 space-y-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Agent Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
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
                                  <FormLabel>Description (optional)</FormLabel>
                                  <FormControl>
                                    <Textarea rows={2} {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    A brief description to identify this agent's purpose
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="disabled"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                      Disable Agent
                                    </FormLabel>
                                    <FormDescription>
                                      When disabled, this agent won't be available for calls
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

                        {/* Voice Selection */}
                        <Card className="border shadow-sm pt-0 overflow-hidden">
                          <CardHeader className="border-b bg-muted/30 pt-6">
                            <div className="flex items-center gap-2">
                              <Volume2 className="h-5 w-5 text-primary" />
                              <CardTitle>Voice Selection</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6 space-y-4">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search voices by name or attributes..."
                                className="pl-10"
                                value={voiceSearch}
                                onChange={(e) => setVoiceSearch(e.target.value)}
                              />
                            </div>

                            {selectedVoiceId && (
                              <div className="bg-primary/5 rounded-md p-3 flex items-center justify-between border border-primary/20">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Mic className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{allVoices.find(v => v.id === selectedVoiceId)?.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {allVoices.find(v => v.id === selectedVoiceId)?.tags}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => {
                                    const voice = allVoices.find(v => v.id === selectedVoiceId);
                                    if (voice) {
                                      handlePlayVoice(voice.id, voice.demo);
                                    }
                                  }}
                                >
                                  {playingVoice === selectedVoiceId ? (
                                    <>
                                      <PauseCircle className="h-4 w-4 mr-1" /> Pause
                                    </>
                                  ) : (
                                    <>
                                      <PlayCircle className="h-4 w-4 mr-1" /> Preview
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}

                            {voicesLoading ? (
                              <div className="text-center py-12">
                                <Volume2 className="h-8 w-8 mx-auto text-muted-foreground mb-3 animate-pulse" />
                                <p className="text-muted-foreground">Loading available voices...</p>
                              </div>
                            ) : filteredVoices.length === 0 ? (
                              <div className="text-center py-12">
                                <Volume2 className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                                <p className="text-muted-foreground">No voices match your search criteria</p>
                              </div>
                            ) : (
                              <FormField
                                control={form.control}
                                name="voice_id"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="grid grid-cols-1 max-h-[250px] overflow-y-auto gap-3">
                                        {filteredVoices.map(voice => (
                                          <motion.div
                                            key={voice.id}
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.2 }}
                                            className={cn(
                                              "border rounded-lg p-4 cursor-pointer transition-colors",
                                              field.value === voice.id
                                                ? "border-primary bg-primary/5"
                                                : "hover:bg-muted/50"
                                            )}
                                            onClick={() => field.onChange(voice.id)}
                                          >
                                            <div className="flex justify-between items-start">
                                              <div className="flex items-center gap-3">
                                                <div className={cn(
                                                  "h-4 w-4 rounded-full flex items-center justify-center",
                                                  field.value === voice.id
                                                    ? "border-2 border-primary"
                                                    : "border-2 border-muted"
                                                )}>
                                                  {field.value === voice.id && (
                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                  )}
                                                </div>
                                                <div>
                                                  <p className="font-medium">{voice.name}</p>
                                                  <p className="text-xs text-muted-foreground mt-1">
                                                    {voice.tags}
                                                  </p>
                                                </div>
                                              </div>

                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="icon"
                                                      className="rounded-full h-8 w-8"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePlayVoice(voice.id, voice.demo);
                                                      }}
                                                    >
                                                      {playingVoice === voice.id ? (
                                                        <PauseCircle className="h-5 w-5 text-primary" />
                                                      ) : (
                                                        <PlayCircle className="h-5 w-5" />
                                                      )}
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    {playingVoice === voice.id ? "Pause" : "Preview voice"}
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            </div>
                                          </motion.div>
                                        ))}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Behavior Configuration */}
                      <TabsContent value="behavior" className="space-y-6">
                        <Card className="border shadow-sm pt-0 overflow-hidden">
                          <CardHeader className="border-b bg-muted/30 pt-6">
                            <div className="flex items-center gap-2">
                              <Settings className="h-5 w-5 text-primary" />
                              <CardTitle>Agent Behavior</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6 space-y-5">
                            <FormField
                              control={form.control}
                              name="first_message"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Message</FormLabel>
                                  <FormControl>
                                    <VariableTextarea
                                      placeholder="Hello {contact_name}! I'm calling from [Your Company]. How can I help you today?"
                                      rows={2}
                                      {...field}
                                      className="resize-none border-muted"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    This is how your agent will begin each conversation
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="system_prompt"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>System Prompt</FormLabel>
                                  <FormControl>

                                    <VariableTextarea
                                      {...field}
                                      placeholder="You are a friendly AI assistant for [Company]. You're speaking with {contact_name}. Your goal is to..."
                                      rows={8}
                                      className="resize-none border-muted"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Define your agent's behavior, knowledge, tone, and how it handles different scenarios
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Knowledge Base */}
                      <TabsContent value="knowledge" className="space-y-6">
                        <Card className="border shadow-sm pt-0 overflow-hidden">
                          <CardHeader className="border-b bg-muted/30 pt-6">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-5 w-5 text-primary" />
                              <CardTitle>Knowledge Base</CardTitle>
                            </div>
                            <CardDescription className="mt-2">
                              Add documents, URLs, or text content to enhance your agent's knowledge
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Select value={newDocumentType} onValueChange={(value: 'file' | 'url' | 'text') => setNewDocumentType(value)}>
                                <SelectTrigger className="w-48">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      Text Content
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="url">
                                    <div className="flex items-center gap-2">
                                      <Link className="h-4 w-4" />
                                      Website URL
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="file">
                                    <div className="flex items-center gap-2">
                                      <Upload className="h-4 w-4" />
                                      Upload File
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <Button type="button" onClick={addKnowledgeDocument} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Knowledge
                              </Button>
                            </div>

                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              accept=".pdf,.doc,.docx,.txt,.md"
                              className="hidden"
                            />

                            {knowledgeDocuments.length === 0 ? (
                              <div className="text-center py-12 border border-dashed rounded-lg">
                                <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                                <p className="text-muted-foreground">No knowledge documents added yet</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Add documents to give your agent specific knowledge about your business
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {knowledgeDocuments.map((doc, index) => (
                                  <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                        {doc.type === 'file' && <Upload className="h-4 w-4 text-primary" />}
                                        {doc.type === 'url' && <Link className="h-4 w-4 text-primary" />}
                                        {doc.type === 'text' && <FileText className="h-4 w-4 text-primary" />}
                                        <Input
                                          value={doc.name}
                                          onChange={(e) => updateKnowledgeDocument(index, 'name', e.target.value)}
                                          className="font-medium border-none p-0 h-auto focus-visible:ring-0"
                                          placeholder="Document name"
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeKnowledgeDocument(index)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>

                                    {doc.type === 'url' && (
                                      <Input
                                        value={doc.url || ''}
                                        onChange={(e) => updateKnowledgeDocument(index, 'url', e.target.value)}
                                        placeholder="Enter website URL"
                                        className="mb-2"
                                      />
                                    )}

                                    {doc.type === 'text' && (
                                      <Textarea
                                        value={doc.content || ''}
                                        onChange={(e) => updateKnowledgeDocument(index, 'content', e.target.value)}
                                        placeholder="Paste your text content here..."
                                        rows={4}
                                        className="resize-none"
                                      />
                                    )}

                                    {doc.document_id && (
                                      <div className="text-sm text-muted-foreground">
                                        Existing document (ID: {doc.document_id.slice(0, 8)}...)
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Advanced Settings */}
                      <TabsContent value="advanced" className="space-y-6">
                        <Card className="border shadow-sm pt-0 overflow-hidden">
                          <CardHeader className="border-b bg-muted/30 pt-6">
                            <div className="flex items-center gap-2">
                              <Wrench className="h-5 w-5 text-primary" />
                              <CardTitle>Advanced Configuration</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6 space-y-6">
                            {/* LLM Model Selection */}
                            <FormField
                              control={form.control}
                              name="llm_model"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Language Model</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a language model" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {llmModels.map((model) => (
                                        <SelectItem key={model.id} value={model.id}>
                                          <div>
                                            <div className="font-medium">{model.name}</div>
                                            <div className="text-xs text-muted-foreground">{model.description}</div>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Choose the AI model that powers your agent's responses
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Temperature Slider */}
                            <FormField
                              control={form.control}
                              name="temperature"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center justify-between">
                                    <FormLabel>Response Creativity</FormLabel>
                                    <span className="text-sm text-muted-foreground">{temperature}</span>
                                  </div>
                                  <FormControl>
                                    <Slider
                                      min={0}
                                      max={1}
                                      step={0.1}
                                      value={[field.value || 0.3]}
                                      onValueChange={(vals) => field.onChange(vals[0])}
                                      className="w-full"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Lower values (0.1-0.3) for consistent responses, higher values (0.7-1.0) for creative responses
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Language Selection */}
                            <FormField
                              control={form.control}
                              name="language"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Primary Language</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select primary language" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {languages.map((lang) => (
                                        <SelectItem key={lang.id} value={lang.id}>
                                          {lang.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    The main language your agent will use for conversations
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Max Duration */}
                            <FormField
                              control={form.control}
                              name="max_duration_seconds"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center justify-between">
                                    <FormLabel>Max Call Duration</FormLabel>
                                    <span className="text-sm text-muted-foreground">
                                      {Math.floor(maxDuration / 60)}:{(maxDuration % 60).toString().padStart(2, '0')}
                                    </span>
                                  </div>
                                  <FormControl>
                                    <Slider
                                      min={60}
                                      max={7200}
                                      step={60}
                                      value={[field.value || 1800]}
                                      onValueChange={(vals) => field.onChange(vals[0])}
                                      className="w-full"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Maximum duration for each phone call (1 minute to 2 hours)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Tools Selection */}
                            <FormField
                              control={form.control}
                              name="tools"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Available Tools</FormLabel>
                                  <FormDescription className="mb-3">
                                    Select tools your agent can use during conversations
                                  </FormDescription>
                                  <div className="grid grid-cols-2 gap-3">
                                    {availableTools.map((tool) => {
                                      const Icon = tool.icon;
                                      return (
                                        <div
                                          key={tool.id}
                                          className={cn(
                                            "border rounded-lg p-3 cursor-pointer transition-colors",
                                            field.value?.includes(tool.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                                          )}
                                          onClick={() => {
                                            const currentTools = field.value || [];
                                            if (currentTools.includes(tool.id)) {
                                              field.onChange(currentTools.filter(t => t !== tool.id));
                                            } else {
                                              field.onChange([...currentTools, tool.id]);
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-2">
                                            <div className={cn(
                                              "h-4 w-4 rounded flex items-center justify-center",
                                              field.value?.includes(tool.id) ? "border-2 border-primary" : "border-2 border-muted"
                                            )}>
                                              {field.value?.includes(tool.id) && (
                                                <div className="h-2 w-2 rounded bg-primary" />
                                              )}
                                            </div>
                                            <Icon className="h-4 w-4" />
                                            <div>
                                              <p className="text-sm font-medium">{tool.name}</p>
                                              <p className="text-xs text-muted-foreground">{tool.description}</p>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>

                    {/* Submit Section */}
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard/agents")}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={saving}
                        className="gap-2 min-w-[160px]"
                      >
                        {saving ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="h-4 w-4 border-2 border-foreground/20 border-t-foreground/100 rounded-full"
                            />
                            Saving Changes...
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
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this agent and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingAgent}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAgent();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingAgent}
            >
              {deletingAgent ? "Deleting..." : "Delete Agent"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
