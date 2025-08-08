"use client";
export const dynamic = 'force-dynamic';   // skip any static prerender
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Bot, Phone, User, Upload, DownloadCloud, Check, AlertCircle,
  Loader2, ChevronRight, FileText, Info, Sparkles, CheckCircle, PlusCircle, X
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const callSchema = z.object({
  agentId: z.string().min(1, "Please select an agent"),
  phoneNumber: z.string().optional(),
  contactName: z.string().optional(),
  contactId: z.string().optional(),
  customMessage: z.string().optional(),
});

// Animation variants
const fadeInUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

// Component that uses useSearchParams (needs to be wrapped in Suspense)
function NewCallPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedAgentId = searchParams.get("agent");
  const [agents, setAgents] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [initiatingCall, setInitiatingCall] = useState(false);
  const [callResult, setCallResult] = useState<any>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [callType, setCallType] = useState("direct");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    created: number;
    agentName: string;
    uploadedContacts: string[];
  } | null>(null);

  const form = useForm<z.infer<typeof callSchema>>({
    resolver: zodResolver(callSchema),
    defaultValues: {
      agentId: preselectedAgentId || "",
      phoneNumber: "",
      contactName: "",
      customMessage: "",
    },
  });

  const selectedAgentId = form.watch("agentId");

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoadingAgents(true);
        const response = await fetch("/api/agents");

        if (!response.ok) {
          throw new Error("Failed to fetch agents");
        }

        const data = await response.json();
        const availableAgents = data.agents.filter((agent: any) => !agent.disabled);
        setAgents(availableAgents);
      } catch (err) {
        console.error("Error fetching agents:", err);
      } finally {
        setLoadingAgents(false);
      }
    };

    const fetchContacts = async () => {
      try {
        setLoadingContacts(true);
        const response = await fetch("/api/contacts");

        if (!response.ok) {
          throw new Error("Failed to fetch contacts");
        }

        const data = await response.json();
        setContacts(data.contacts || []);
      } catch (err) {
        console.error("Error fetching contacts:", err);
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchAgents();
    fetchContacts();
  }, []);

  const onSubmit = async (values: z.infer<typeof callSchema>) => {
    try {
      setInitiatingCall(true);
      setCallResult(null);
      setCallError(null);

      const payload: any = {
        agentId: values.agentId,
      };

      if (callType === "direct") {
        payload.phoneNumber = values.phoneNumber;
        payload.contactName = values.contactName || "Customer";
        payload.customMessage = values.customMessage;
      } else if (callType === "contact") {
        if (!selectedContact) {
          throw new Error("No contact selected");
        }
        payload.phoneNumber = selectedContact.phoneNumber;
        payload.contactName = selectedContact.name;
        payload.contactId = selectedContact._id;
        payload.customMessage = values.customMessage;
      }

      const response = await fetch("/api/calls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to initiate call");
      }

      const result = await response.json();
      setCallResult(result);

      // Redirect to calls list after a short delay
      setTimeout(() => {
        router.push("/dashboard/calls");
      }, 3000);
    } catch (err: any) {
      console.error("Error initiating call:", err);
      setCallError(err.message);
    } finally {
      setInitiatingCall(false);
    }
  };

  const handleContactSelect = (contactId: string) => {
    const contact = contacts.find(c => c._id === contactId);
    setSelectedContact(contact);
    form.setValue("contactId", contactId);
  };

  const handleBulkUpload = async () => {
    if (!uploadFile || !selectedAgentId) return;

    try {
      setUploadLoading(true);
      setUploadResult(null);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("agentId", selectedAgentId);
      formData.append("deferCalling", "true");

      const response = await fetch("/api/calls", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process CSV file");
      }

      const data = await response.json();

      // Prepare for confirmation dialog if contacts were processed
      if (data.uploadedContacts && data.uploadedContacts.length > 0) {
        const agentName = agents.find(agent => agent.agent_id === selectedAgentId)?.name || "Selected agent";

        setImportSummary({
          created: data.results.created,
          agentName: agentName,
          uploadedContacts: data.uploadedContacts
        });

        setShowConfirmDialog(true);
      }

      setUploadResult(data);
    } catch (err: any) {
      console.error("Error uploading CSV:", err);
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const startCallingProcess = async () => {
    if (!importSummary || !importSummary.uploadedContacts.length) {
      setShowConfirmDialog(false);
      return;
    }

    try {
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

      // Show success and redirect
      setUploadResult({
        message: `Successfully initiated ${result.initiated || 0} calls`,
        results: {
          created: result.initiated || 0,
          failed: result.failed || 0
        }
      });

      // Redirect to calls list after a short delay
      setTimeout(() => {
        router.push("/dashboard/calls");
      }, 3000);
    } catch (error) {
      console.error("Error starting calls:", error);
      setUploadError(`Error starting calls: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const selectedAgent = agents.find(agent => agent.agent_id === selectedAgentId);

  return (
    <div className="min-h-screen text-foreground flex">
      <DashboardSidebar />

      <main className="flex-1 h-fit max-h-screen overflow-y-auto bg-background">
        <DashboardHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="mb-2"
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUpVariant}
              >
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">New Voice Call</h1>
                <p className="text-muted-foreground">
                  Create and initiate AI voice calls with your configured agents
                </p>
              </motion.div>
            </div>
          </div>

          {callResult ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariant}
            >
              <Card className="border-success">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <CardTitle className="text-success">Call Initiated Successfully</CardTitle>
                      <CardDescription>Your call has been queued and will begin shortly</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-md mb-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="font-medium">Call ID:</div>
                      <div>{callResult.id || callResult.callId}</div>
                      <div className="font-medium">Status:</div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {callResult.status}
                        </Badge>
                      </div>
                      <div className="font-medium">Agent:</div>
                      <div>{selectedAgent?.name || "Selected Agent"}</div>
                      <div className="font-medium">Phone Number:</div>
                      <div>{form.getValues().phoneNumber || selectedContact?.phoneNumber}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 p-3 bg-success/5 text-success rounded-md text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Redirecting to call history...</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : uploadResult ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariant}
            >
              <Card className="border-success">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                      <Check className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <CardTitle className="text-success">Upload Processed Successfully</CardTitle>
                      <CardDescription>{uploadResult.message}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-md mb-4">
                    <div className="grid gap-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-md bg-success/10 p-3 text-center">
                          <p className="text-success font-medium">{uploadResult.results.created}</p>
                          <p className="text-xs text-muted-foreground">Processed</p>
                        </div>
                        <div className="rounded-md bg-primary/10 p-3 text-center">
                          <p className="text-primary font-medium">{uploadResult.results.created}</p>
                          <p className="text-xs text-muted-foreground">Contacts</p>
                        </div>
                        <div className="rounded-md bg-destructive/10 p-3 text-center">
                          <p className="text-destructive font-medium">{uploadResult.results.failed || 0}</p>
                          <p className="text-xs text-muted-foreground">Failed</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 p-3 bg-success/5 text-success rounded-md text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Redirecting to call history...</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : callError ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertTitle>Error initiating call</AlertTitle>
              <AlertDescription>{callError}</AlertDescription>
            </Alert>
          ) : uploadError ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertTitle>Error processing CSV</AlertTitle>
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                className="lg:col-span-2"
                initial="hidden"
                animate="visible"
                variants={fadeInUpVariant}
              >
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bot className="h-5 w-5 text-primary" />
                          Select Voice Agent
                        </CardTitle>
                        <CardDescription>
                          Choose which AI agent will handle this call
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loadingAgents ? (
                          <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        ) : agents.length === 0 ? (
                          <div className="text-center py-4">
                            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                              <Bot className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No Agents Available</h3>
                            <p className="text-muted-foreground mb-6">
                              Create or enable an agent to start making calls
                            </p>
                            <Button
                              variant="outline"
                              onClick={() => router.push("/dashboard/new-agent")}
                            >
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Create New Agent
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="agentId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <SelectTrigger className="h-14 text-base">
                                        <SelectValue placeholder="Select an agent" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {agents.map((agent) => (
                                          <SelectItem key={agent.agent_id} value={agent.agent_id}>
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-success" />
                                              {agent.name}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {selectedAgent && (
                              <div className="p-4 bg-muted/40 rounded-lg mt-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <Avatar className="h-12 w-12 border">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {selectedAgent.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-medium">{selectedAgent.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedAgent.description || "No description"}
                                    </p>
                                  </div>
                                </div>

                                {selectedAgent.conversation_config?.first_message && (
                                  <div className="mt-3 text-sm">
                                    <p className="font-medium text-muted-foreground mb-1">Opening message:</p>
                                    <p className="italic bg-background p-2 rounded-md">
                                      "{selectedAgent.conversation_config.first_message}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {selectedAgentId && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-primary" />
                            Call Configuration
                          </CardTitle>
                          <CardDescription>
                            Choose your call method and enter details
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Tabs value={callType} onValueChange={setCallType} className="w-full">
                            <TabsList className="grid grid-cols-3 mb-6">
                              <TabsTrigger value="direct" className="flex items-center">
                                <Phone className="h-4 w-4 mr-2" /> Direct Call
                              </TabsTrigger>
                              <TabsTrigger value="contact" className="flex items-center">
                                <User className="h-4 w-4 mr-2" /> From Contacts
                              </TabsTrigger>
                              <TabsTrigger value="bulk" className="flex items-center">
                                <Upload className="h-4 w-4 mr-2" /> Bulk Upload
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="direct">
                              <div className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name="phoneNumber"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Phone Number</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="+1 (555) 123-4567"
                                          {...field}
                                          className="h-12 text-base"
                                          required
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Enter the full phone number including country code
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="contactName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Contact Name</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="John Doe"
                                          {...field}
                                          className="h-12 text-base"
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Name will be available to the AI agent
                                      </FormDescription>
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="customMessage"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Custom Instructions (Optional)</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Provide specific instructions for your AI to follow during this call..."
                                          rows={4}
                                          className="resize-none"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Additional context or special instructions for this specific call
                                      </FormDescription>
                                    </FormItem>
                                  )}
                                />

                                <Button
                                  type="submit"
                                  disabled={initiatingCall || !form.getValues().phoneNumber}
                                  className="w-full mt-4"
                                >
                                  {initiatingCall ? (
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
                              </div>
                            </TabsContent>

                            <TabsContent value="contact">
                              <div className="space-y-4">
                                {loadingContacts ? (
                                  <div className="space-y-2">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-4 w-1/2" />
                                  </div>
                                ) : contacts.length === 0 ? (
                                  <div className="text-center py-6">
                                    <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                                      <User className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium mb-2">No Contacts Available</h3>
                                    <p className="text-muted-foreground mb-6">
                                      Add contacts to your address book first
                                    </p>
                                    <Button
                                      variant="outline"
                                      onClick={() => router.push("/dashboard/contacts/new")}
                                    >
                                      <PlusCircle className="h-4 w-4 mr-2" />
                                      Add New Contact
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <div>
                                      <FormLabel className="mb-2 block">Select Contact</FormLabel>
                                      <Select onValueChange={handleContactSelect}>
                                        <SelectTrigger className="h-12 text-base">
                                          <SelectValue placeholder="Choose a contact" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {contacts.map((contact) => (
                                            <SelectItem key={contact._id} value={contact._id}>
                                              <div className="flex items-center gap-2">
                                                {contact.name}
                                                <span className="text-muted-foreground text-xs">
                                                  ({contact.phoneNumber})
                                                </span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {selectedContact && (
                                      <div className="p-4 mt-4 bg-muted/40 rounded-lg border-border/60 border">
                                        <div className="flex items-center gap-3 mb-3">
                                          <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                              {selectedContact.name.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <h3 className="font-medium">{selectedContact.name}</h3>
                                            <p className="text-sm text-muted-foreground">{selectedContact.phoneNumber}</p>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                                          {selectedContact.email && (
                                            <div>
                                              <span className="font-medium text-muted-foreground">Email:</span> {selectedContact.email}
                                            </div>
                                          )}
                                          {selectedContact.company && (
                                            <div>
                                              <span className="font-medium text-muted-foreground">Company:</span> {selectedContact.company}
                                            </div>
                                          )}
                                        </div>

                                        {selectedContact.tags && selectedContact.tags.length > 0 && (
                                          <div className="flex flex-wrap items-center gap-2 mt-3">
                                            {selectedContact.tags.map((tag: string) => (
                                              <Badge key={tag} variant="secondary" className="rounded-full">
                                                {tag}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <FormField
                                      control={form.control}
                                      name="customMessage"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Custom Instructions (Optional)</FormLabel>
                                          <FormControl>
                                            <Textarea
                                              placeholder="Provide specific instructions for your AI to follow during this call..."
                                              rows={4}
                                              className="resize-none"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormDescription>
                                            Additional context or special instructions for this specific call
                                          </FormDescription>
                                        </FormItem>
                                      )}
                                    />

                                    <Button
                                      type="submit"
                                      disabled={initiatingCall || !selectedContact}
                                      className="w-full mt-4"
                                    >
                                      {initiatingCall ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Initiating Call...
                                        </>
                                      ) : (
                                        <>
                                          <Phone className="h-4 w-4 mr-2" />
                                          Call {selectedContact?.name || "Contact"}
                                        </>
                                      )}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TabsContent>

                            <TabsContent value="bulk">
                              <div className="space-y-4">
                                <div className="border-2 border-dashed border-border/60 rounded-lg p-8 text-center">
                                  <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                  <h3 className="text-lg font-medium mb-2">Upload Contact List</h3>
                                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                                    CSV file should include columns for name, phone number, and optional information
                                  </p>

                                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                                    <Input
                                      type="file"
                                      accept=".csv"
                                      className="max-w-xs mx-auto"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          setUploadFile(e.target.files[0]);
                                        }
                                      }}
                                    />
                                  </div>

                                  {uploadFile && (
                                    <div className="mt-4 bg-muted/40 rounded-md p-3 text-sm max-w-xs mx-auto">
                                      <div className="flex items-center justify-between">
                                        <div className="font-medium truncate">{uploadFile.name}</div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 rounded-full"
                                          onClick={() => setUploadFile(null)}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <div className="text-muted-foreground text-xs">
                                        {(uploadFile.size / 1024).toFixed(2)} KB
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                                  <div className="bg-muted/30 rounded-lg p-4 flex flex-col items-center">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                      <FileText className="h-4 w-4 text-primary" />
                                    </div>
                                    <h4 className="font-medium text-sm mb-1">Required Columns</h4>
                                    <p className="text-xs text-muted-foreground text-center">
                                      name, phone_number
                                    </p>
                                  </div>

                                  <div className="bg-muted/30 rounded-lg p-4 flex flex-col items-center">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                      <Info className="h-4 w-4 text-primary" />
                                    </div>
                                    <h4 className="font-medium text-sm mb-1">Optional Columns</h4>
                                    <p className="text-xs text-muted-foreground text-center">
                                      email, company, notes, tags
                                    </p>
                                  </div>

                                  <div className="bg-muted/30 rounded-lg p-4 flex flex-col items-center">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                      <DownloadCloud className="h-4 w-4 text-primary" />
                                    </div>
                                    <h4 className="font-medium text-sm mb-1">Template</h4>
                                    <a
                                      href="/templates/contacts_template.csv"
                                      download
                                      className="text-xs text-primary underline hover:no-underline"
                                    >
                                      Download CSV template
                                    </a>
                                  </div>
                                </div>
                                <Alert variant="outline" className="bg-amber-50/30 border-amber-200 text-amber-800">
                                  <Info className="h-4 w-4 text-amber-800" />
                                  <AlertTitle>Important</AlertTitle>
                                  <AlertDescription className="text-xs">
                                    Contacts will be imported and saved to your address book.
                                    You'll have a chance to review the import results
                                    before starting any calls.
                                  </AlertDescription>
                                </Alert>

                                <Button
                                  type="button"
                                  disabled={!uploadFile || uploadLoading}
                                  onClick={handleBulkUpload}
                                  className="w-full mt-4"
                                >
                                  {uploadLoading ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Processing CSV File...
                                    </>
                                  ) : (
                                    <>
                                      <DownloadCloud className="h-4 w-4 mr-2" />
                                      Upload and Process Contacts
                                    </>
                                  )}
                                </Button>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    )}
                  </form>
                </Form>
              </motion.div>

              <motion.div
                initial="hidden"
                className="h-full"
                animate="visible"
                variants={fadeInUpVariant}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Making Great AI Calls
                    </CardTitle>
                    <CardDescription>
                      Tips to optimize your voice calls
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className=" pr-4">
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <h3 className="font-medium text-base">Choose the Right Agent</h3>
                          <p className="text-sm text-muted-foreground">
                            Select an AI agent that matches your call purpose - sales, support,
                            or informational calls need different conversation styles.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-medium text-base">Provide Context</h3>
                          <p className="text-sm text-muted-foreground">
                            Add custom instructions in the call setup to give your agent specific
                            information about the call recipient and purpose.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-medium text-base">Test Before Bulk Calls</h3>
                          <p className="text-sm text-muted-foreground">
                            Make a single test call before launching a bulk campaign to ensure
                            your agent handles conversations as expected.
                          </p>
                        </div>

                        <div className="p-  rounded-lg  mt-6">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">Best Practices</h3>
                          </div>
                          <ul className="space-y-2 text-sm text-muted-foreground pl-7 list-disc">
                            <li>Ensure phone numbers include country code</li>
                            <li>Schedule calls during appropriate business hours</li>
                            <li>Review call transcripts to improve future calls</li>
                            <li>Personalize opening messages for better engagement</li>
                          </ul>
                        </div>

                        <div className="mt-4">
                          {/* <Button variant="outline" className="w-full" asChild>
                            <a href="/dashboard/guides/effective-calls" target="_blank">
                              Learn More About AI Voice Calls
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </a>
                          </Button> */}
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Confirmation Dialog for Bulk Upload */}
          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start Calling Process</DialogTitle>
                <DialogDescription>
                  Your contact import was successful
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
                      These calls will be made using the agent:
                    </p>
                    <p className="font-medium">{importSummary.agentName}</p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    No calls have been initiated yet. Would you like to start the calling process now?
                  </p>
                </div>
              )}

              <DialogFooter className="flex justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Not Now
                </Button>
                <Button
                  onClick={startCallingProcess}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Start Calling
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}

// Main page component that uses Suspense to handle the useSearchParams hook
export default function NewCallPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen text-foreground flex">
        <DashboardSidebar />
        <main className="flex-1 h-fit max-h-screen overflow-y-auto bg-background">
          <DashboardHeader />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full max-w-md" />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-full" />
                      <div className="mt-4">
                        <Skeleton className="h-32 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    }>
      <NewCallPageContent />
    </Suspense>
  );
}
