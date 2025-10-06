"use client";

import { useState, useRef } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { motion } from "framer-motion";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PhoneCall, Upload, Phone, User, CalendarClock, Clock, Download, MoreHorizontal, PlayCircle, AlertCircle, CheckCircle, XCircle, Loader2, Mic, VolumeX, Plus, X, FileText, ChevronRight, HelpCircle, Info, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then(r => r.json());

const dialerSchema = z.object({
  agentId: z.string().min(1, "Please select an agent"),
  phoneNumber: z.string()
    .min(8, "Enter a valid phone number")
    .regex(/^[+\d\s()-]+$/, "Enter a valid phone number"),
  contactName: z.string().min(1, "Contact name is required"),
  customMessage: z.string().optional(),
});

export default function CallsPage() {
  const { user } = useAuth();
  const [callTab, setCallTab] = useState("dialer");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [makingCall, setMakingCall] = useState(false);
  const [dialerValue, setDialerValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  // Add these state variables
  const [showStartCallDialog, setShowStartCallDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    created: number;
    agentName: string;
    uploadedContacts: any[];
  } | null>(null);
  // Fetch agents
  const { data: agentsData } = useSWR<{ agents: any[] }>("/api/agents", fetcher);
  const agents = agentsData?.agents?.filter(a => !a.disabled) || [];

  // Fetch recent calls
  const { data: callsData, mutate: refreshCalls } =
    useSWR<{ calls: any[], pagination: any }>("/api/calls?limit=10", fetcher);
  const calls = callsData?.calls || [];

  const form = useForm<z.infer<typeof dialerSchema>>({
    resolver: zodResolver(dialerSchema),
    defaultValues: {
      contactName: "",
      phoneNumber: "",
      customMessage: "",
    }
  });



  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const agentId = form.getValues("agentId");
    if (!agentId) {
      alert("Please select an agent first");
      return;
    }

    try {
      setUploading(true);
      console.log("Starting CSV upload - processing contacts");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("agentId", agentId);

      const response = await fetch("/api/calls", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload CSV");
      }

      const data = await response.json();
      console.log("CSV upload response:", data);
      setUploadResult(data);

      // Prepare for confirmation dialog if contacts were processed
      if (data.uploadedContacts && data.uploadedContacts.length > 0) {
        const agentName = agents.find(agent => agent.agent_id === agentId)?.name || "Selected agent";
        console.log("Setting import summary and showing dialog");

        setImportSummary({
          created: data.results.created,
          agentName: agentName,
          uploadedContacts: data.uploadedContacts
        });

        // Force re-render by setting a timeout
        setTimeout(() => {
          setShowImportDialog(true);
        }, 100);
      } else {
        console.log("No contacts were uploaded or data is missing uploadedContacts array");
      }

    } catch (error) {
      console.error("Error uploading CSV:", error);
      alert(`Error uploading CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };


  // Add this function to start the calling process
  const startCallingProcess = async () => {
    if (!importSummary || !importSummary.uploadedContacts.length) {
      console.log("No contacts to call");
      setShowImportDialog(false);
      return;
    }

    try {
      console.log("Starting batch call process for", importSummary.uploadedContacts.length, "contacts");

      const startResponse = await fetch("/api/calls/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId: form.getValues("agentId"),
          contacts: importSummary.uploadedContacts
        }),
      });

      if (!startResponse.ok) {
        const errorData = await startResponse.json();
        throw new Error(errorData.message || "Failed to start calls");
      }

      const result = await startResponse.json();
      console.log("Batch call initiation result:", result);

      alert(`Successfully initiated ${result.initiated || 0} calls. You can monitor progress in the call history.`);
      refreshCalls();
    } catch (error) {
      console.error("Error starting calls:", error);
      alert(`Error starting calls: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setShowImportDialog(false);
      setImportSummary(null);
    }
  };
  // Within the onMakeCall function, update the phone formatting:

  const onMakeCall = async (formData: z.infer<typeof dialerSchema>) => {
    try {
      setMakingCall(true);

      // Format the phone number properly before sending
      let formattedPhone = formData.phoneNumber.trim();

      // Keep the original value for display
      const originalPhone = formattedPhone;

      // Get only digits from phone number
      formattedPhone = formattedPhone.replace(/\D/g, '');

      console.log("Initiating call with:", {
        agentId: formData.agentId,
        phoneNumber: formattedPhone,
        contactName: formData.contactName
      });

      const response = await fetch("/api/calls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          phoneNumber: formattedPhone // Use the cleaned phone number
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to initiate call");
      }

      const result = await response.json();
      console.log("Call initiation result:", result);

      await refreshCalls();
      form.reset({
        agentId: formData.agentId,
        phoneNumber: "",
        contactName: "",
        customMessage: "",
      });
      setDialerValue("");
    } catch (error) {
      console.error("Error making call:", error);
      alert("Error initiating call. Please check the console for details.");
    } finally {
      setMakingCall(false);
    }
  };

  // Dialer input handlers
  const handleDialerButtonClick = (value: string) => {
    if (value === 'backspace') {
      setDialerValue(prev => prev.slice(0, -1));
      form.setValue("phoneNumber", dialerValue.slice(0, -1));
    } else {
      setDialerValue(prev => prev + value);
      form.setValue("phoneNumber", dialerValue + value);
    }
  };

  const formatPhoneNumber = (number: string) => {
    if (!number) return "";

    // Basic formatting - this can be customized based on your requirements
    if (number.startsWith('+')) {
      // International format
      return number;
    } else if (number.length <= 3) {
      return number;
    } else if (number.length <= 6) {
      return `${number.slice(0, 3)}-${number.slice(3)}`;
    } else {
      return `${number.slice(0, 3)}-${number.slice(3, 6)}-${number.slice(6)}`;
    }
  };

  const getStatusBadge = (status: string) => {
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

        <div className=" mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">Call Management</h1>
            <p className="text-muted-foreground mb-8">
              Make direct calls with your AI voice agents or import contact lists for bulk outreach
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              className="lg:col-span-2"
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariant}
            >
              <Tabs value={callTab} onValueChange={setCallTab} className="w-full">
                <div className="flex gap-4 justify-between items-">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="dialer">
                      <Phone className="h-4 w-4 mr-2" /> Voice Dialer
                    </TabsTrigger>
                    <TabsTrigger value="import">
                      <Upload className="h-4 w-4 mr-2" /> Bulk Import
                    </TabsTrigger>
                  </TabsList>
                  <Link className="cursor-pointer" href='/dashboard/calls/new'>
                    <Button>
                      + New Call
                    </Button>
                  </Link>
                </div>
                <TabsContent value="dialer">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-primary" />
                            AI Voice Dialer
                          </CardTitle>
                          <CardDescription>
                            Select an agent and enter contact details to initiate a voice call
                          </CardDescription>
                        </div>
                        <Link href="/dashboard/campaigns">
                          <Button variant="outline" size="sm">
                            <LayoutGrid className="h-4 w-4 mr-2" />
                            Campaign Manager
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onMakeCall)} className="space-y-6">
                          <FormField
                            control={form.control}
                            name="agentId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Choose your AI Agent</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select an agent" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {agents.length > 0 ? (
                                      agents.map(agent => (
                                        <SelectItem key={agent.agent_id} value={agent.agent_id}>
                                          <div className="flex items-center">
                                            <span className="w-2 h-2 rounded-full bg-success mr-2" />
                                            {agent.name}
                                          </div>
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <SelectItem value="loading" disabled>
                                        Loading agents...
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  The AI agent will handle the conversation during the call
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="contactName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Smith" {...field} />
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
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="+1 555 123 4567"
                                      value={dialerValue}
                                      onChange={(e) => {
                                        setDialerValue(e.target.value);
                                        field.onChange(e.target.value);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Mobile-inspired Dialer */}
                          <div className="mt-4 p-6 bg-muted/30 rounded-lg">
                            <div className="flex justify-center mb-4">
                              <div className="text-center px-3 py-2 rounded-lg bg-card shadow-sm min-w-[200px]">
                                <p className="text-2xl font-mono tracking-wider">
                                  {formatPhoneNumber(dialerValue) || '—'}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((num) => (
                                <Button
                                  key={num}
                                  type="button"
                                  variant="outline"
                                  className="h-14 text-xl font-medium hover:bg-primary/10 hover:text-primary"
                                  onClick={() => handleDialerButtonClick(num.toString())}
                                >
                                  {num}
                                </Button>
                              ))}
                            </div>

                            <div className="flex justify-center gap-3">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="rounded-full w-12 h-12 p-0"
                                      onClick={() => handleDialerButtonClick('+')}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Add + prefix</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-primary bg-primary/10 rounded-full h-14 w-14"
                                onClick={() => form.handleSubmit(onMakeCall)()}
                                disabled={makingCall}
                              >
                                <Phone className="h-6 w-6" />
                              </Button>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="rounded-full w-12 h-12 p-0"
                                      onClick={() => handleDialerButtonClick('backspace')}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>

                          <FormField
                            control={form.control}
                            name="customMessage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Custom Instructions (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter custom instructions for your AI agent to follow during this call..."
                                    className="min-h-[80px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Specific message or instructions for your agent to deliver during this call
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
                            <Button
                              type="submit"
                              className="w-full sm:w-auto"
                              disabled={makingCall || uploading}
                            >
                              {makingCall ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Initiating Call...
                                </>
                              ) : (
                                <>
                                  <Phone className="h-4 w-4 mr-2" />
                                  Start AI Voice Call
                                </>
                              )}
                            </Button>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full sm:w-auto sm:ml-auto">
                                  <HelpCircle className="h-4 w-4 mr-2" />
                                  How it works
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>How AI Voice Calls Work</DialogTitle>
                                  <DialogDescription>
                                    Learn how our AI agents make natural-sounding calls
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                  <div className="flex gap-4 items-start">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                      <Phone className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Initiate Call</h4>
                                      <p className="text-sm text-muted-foreground">
                                        Select an AI agent, enter contact details, and press call.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex gap-4 items-start">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                      <Mic className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Natural Conversation</h4>
                                      <p className="text-sm text-muted-foreground">
                                        Our AI handles the call, speaking naturally with your contact.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex gap-4 items-start">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                      <FileText className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Get Results</h4>
                                      <p className="text-sm text-muted-foreground">
                                        Review call transcripts, summaries, and outcomes in your call history.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <DialogFooter>
                                  <Button variant="outline" className="w-full">
                                    <Link href="/dashboard/guides/voice-calls">
                                      Learn More <ChevronRight className="h-4 w-4 ml-1" />
                                    </Link>
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="import">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        Bulk Call Import
                      </CardTitle>
                      <CardDescription>
                        Upload a CSV file with contact details to schedule multiple AI voice calls
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="agentId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Choose your AI Agent</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select an agent" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {agents.length > 0 ? (
                                      agents.map(agent => (
                                        <SelectItem key={agent.agent_id} value={agent.agent_id}>
                                          <div className="flex items-center">
                                            <span className="w-2 h-2 rounded-full bg-success mr-2" />
                                            {agent.name}
                                          </div>
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <SelectItem value="loading" disabled>
                                        Loading agents...
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  This agent will handle all conversations for contacts in the uploaded file
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="border-2 border-dashed border-border/60 rounded-lg p-8 text-center">
                            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                              <Upload className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">Upload Contact List</h3>
                            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                              CSV file should include columns for name, phone number, and optional custom message
                            </p>

                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".csv"
                              onChange={handleCSVUpload}
                              className="hidden"
                            />

                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="flex-1 sm:flex-initial"
                              >
                                {uploading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Select CSV File
                                  </>
                                )}
                              </Button>

                              <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="flex-1 sm:flex-initial"
                              >
                                <a href="/templates/contacts_template.csv" download>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Template
                                </a>
                              </Button>

                            </div>
                            <div className="flex flex-col gap-2 mt-4 text-center">
                              <p className="text-sm text-muted-foreground">
                                Need to make many calls at once?
                              </p>
                              <Link href="/dashboard/campaigns/new">
                                <Button variant="link" size="sm" className="mx-auto">
                                  Create a Campaign Instead <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                              </Link>
                            </div>
                            {uploadResult && (
                              <div className="mt-6 p-4 rounded-lg bg-muted/50 text-left">
                                <p className="text-sm font-medium mb-3 flex items-center">
                                  <Info className="h-4 w-4 mr-2 text-primary" />
                                  {uploadResult.message}
                                </p>
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                  <div className="rounded-md bg-success/10 p-3 text-center">
                                    <p className="text-success font-medium">{uploadResult.results.created}</p>
                                    <p className="text-xs text-muted-foreground">Successful</p>
                                  </div>
                                  <div className="rounded-md bg-warning/10 p-3 text-center">
                                    <p className="text-warning font-medium">{uploadResult.results.skipped}</p>
                                    <p className="text-xs text-muted-foreground">Skipped</p>
                                  </div>
                                  <div className="rounded-md bg-destructive/10 p-3 text-center">
                                    <p className="text-destructive font-medium">{uploadResult.results.failed}</p>
                                    <p className="text-xs text-muted-foreground">Failed</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Form>
                    </CardContent>
                    <CardFooter className="border-t pt-6 flex flex-col gap-3">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p>
                          Calls will be queued and made in sequence. You can monitor progress and results in the call history.
                        </p>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>

            <motion.div
              className="lg:col-span-1"
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariant}
            >
              <Card className="h-fit max-h-3xl ">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-primary" />
                    Recent Calls
                  </CardTitle>
                  <CardDescription>
                    View your latest call activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {calls.length > 0 ? (
                    <ScrollArea className="h-[500px]">
                      <div className="divide-y">
                        {calls.map((call) => (
                          <div
                            key={call._id}
                            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedCall(call)}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {(call.contactName?.charAt(0) || 'U')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <p className="font-medium text-sm">{call.contactName || "Unknown"}</p>
                                  {getStatusBadge(call.status)}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{call.phoneNumber}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-muted-foreground">
                                    {call.startTime ? format(new Date(call.startTime), "MMM d, h:mm a") : "Scheduled"}
                                  </p>
                                  {call.duration && (
                                    <>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <p className="text-xs text-muted-foreground">
                                        {Math.floor(call.duration / 60)}m {call.duration % 60}s
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Dialog open={selectedCall?._id === call._id} onOpenChange={(open) => !open && setSelectedCall(null)}>
                                <DialogContent>
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
                                            {(selectedCall.contactName?.charAt(0) || 'U')}
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
                                          <div>{getStatusBadge(selectedCall.status)}</div>
                                        </div>

                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground">Agent</p>
                                          <p className="font-medium text-sm">{selectedCall.agentName || "—"}</p>
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
                                          <p className="text-xs text-muted-foreground">Call Type</p>
                                          <p className="text-sm">{selectedCall.callType || "Standard"}</p>
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

                                      {selectedCall.transcription && (
                                        <div className="space-y-1 pt-2">
                                          <p className="text-xs text-muted-foreground">Transcription</p>
                                          <ScrollArea className="h-40">
                                            <div className="p-3 bg-muted rounded-md text-sm">
                                              {selectedCall.transcription}
                                            </div>
                                          </ScrollArea>
                                        </div>
                                      )}

                                      <div className="pt-4 flex gap-3 justify-end">
                                        <Button
                                          variant="outline"
                                          onClick={() => {
                                            if (selectedCall.agentId) {
                                              form.reset({
                                                agentId: selectedCall.agentId,
                                                phoneNumber: selectedCall.phoneNumber,
                                                contactName: selectedCall.contactName || "",
                                                customMessage: ""
                                              });
                                              setDialerValue(selectedCall.phoneNumber);
                                              setCallTab("dialer");
                                              setSelectedCall(null);
                                            }
                                          }}
                                        >
                                          <Phone className="h-4 w-4 mr-2" />
                                          Call Again
                                        </Button>
                                        <DialogClose>
                                          <Button
                                            variant="default"
                                            onClick={() => setSelectedCall(null)}
                                          >
                                            Close
                                          </Button>
                                        </DialogClose>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setSelectedCall(call)}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      if (call.agentId) {
                                        form.reset({
                                          agentId: call.agentId,
                                          phoneNumber: call.phoneNumber,
                                          contactName: call.contactName || "",
                                          customMessage: ""
                                        });
                                        setDialerValue(call.phoneNumber);
                                        setCallTab("dialer");
                                      }
                                    }}
                                  >
                                    Call Again
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                        <PhoneCall className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Calls Yet</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Use the dialer or import contacts to start making AI voice calls
                      </p>
                      <Button variant="outline" onClick={() => setCallTab("dialer")} className="mx-auto">
                        <Phone className="h-4 w-4 mr-2" />
                        Make Your First Call
                      </Button>
                    </div>
                  )}

                  <CardFooter className="p-4 border-t">
                    <Link href="/dashboard/calls/history" className="w-full">
                      <Button variant="outline" className="w-full">
                        <PhoneCall className="h-4 w-4 mr-2" />
                        View Full Call History
                      </Button>
                    </Link>
                  </CardFooter>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          {/* Confirmation Dialog */}
          <Dialog
            open={showImportDialog}
            onOpenChange={(open) => {
              if (!open) {
                console.log("Dialog closed without action");
                setShowImportDialog(false);
                setImportSummary(null);
              }
            }}
          >
            <DialogContent className="h-fit max-h-screen overflow-y-auto scrollbar-hidden">
              <DialogHeader>
                <DialogTitle>Contacts Imported Successfully</DialogTitle>
                <DialogDescription>
                  Choose how you'd like to handle these contacts
                </DialogDescription>
              </DialogHeader>

              {importSummary && (
                <div className="py-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <p className="text-lg font-medium">
                      Successfully imported {importSummary.created} contacts
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg mb-4">
                    <p className="text-sm mb-2">
                      These contacts will use the agent:
                    </p>
                    <p className="font-medium">{importSummary.agentName}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <Card className="border-2 border-primary/20">
                      <CardContent className="pt-6 pb-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium">Quick Call</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Start calling all contacts immediately
                            </p>
                          </div>
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Phone className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => {
                            setShowImportDialog(false);
                            startCallingProcess();
                          }}
                        >
                          Start Calling Now
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6 pb-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium">Create Campaign</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Set up scheduling and advanced options
                            </p>
                          </div>
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                            <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            // Save data to localStorage to retrieve in campaign creation
                            localStorage.setItem('campaignContacts', JSON.stringify(importSummary.uploadedContacts));
                            localStorage.setItem('campaignAgentId', form.getValues("agentId"));
                            // Redirect to campaign creation
                            router.push('/dashboard/campaigns/new?from=import');
                            setShowImportDialog(false);
                          }}
                        >
                          Create Campaign
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              <DialogFooter className="flex justify-between gap-4">
                <DialogClose asChild>
                  <Button variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Call Stats Section */}
          <motion.div
            className="mt-8"
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Call Analytics</h2>
              <Link href="/dashboard/analytics">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Calls</p>
                      <p className="text-3xl font-bold">{calls.length}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <PhoneCall className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Progress value={75} className="h-1" />
                    <p className="text-xs text-muted-foreground mt-2">
                      75% of monthly quota used
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-3xl font-bold">
                        {calls.length > 0
                          ? Math.round((calls.filter(c => c.status === 'completed').length / calls.length) * 100)
                          : 0}%
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Completed</span>
                      <span>{calls.filter(c => c.status === 'completed').length} calls</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Avg. Duration</p>
                      <p className="text-3xl font-bold">
                        {calls.length > 0 && calls.some(c => c.duration)
                          ? Math.round(calls.reduce((sum, call) => sum + (call.duration || 0), 0) /
                            calls.filter(c => c.duration).length / 60)
                          : 0}m
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-secondary" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last 7 days</span>
                      <span>{calls.filter(c => c.startTime && new Date(c.startTime) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} calls</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Active Now</p>
                      <p className="text-3xl font-bold">
                        {calls.filter(c => c.status === 'in-progress').length}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <Mic className="h-5 w-5 text-warning" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Queued calls</span>
                      <span>{calls.filter(c => c.status === 'queued').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
