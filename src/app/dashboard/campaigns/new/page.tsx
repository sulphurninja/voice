"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Upload,
  Check,
  ChevronRight,
  Clock,
  Calendar,
  Bot,
  Settings,
  Phone,
  Users,
  MessageSquare,
  Loader2,
  Info,
  AlertCircle,
  CheckCircle,
  Download,
  Filter,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then(r => r.json());

// Define the form schema
const campaignSchema = z.object({
  name: z.string().min(3, "Campaign name must be at least 3 characters"),
  description: z.string().optional(),
  agentId: z.string().min(1, "Please select an agent"),
  customMessage: z.string().optional(),
  useScheduling: z.boolean().default(false),
  scheduledStartTime: z.string().optional(),
  dailyStartTime: z.string().optional(),
  dailyEndTime: z.string().optional(),
  maxConcurrentCalls: z.string().transform((val) => parseInt(val) || 1),
  usePacing: z.boolean().default(false),
  callsBetweenPause: z.string().optional(),
  pauseDuration: z.string().optional(),
});

export default function NewCampaignPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedContacts, setUploadedContacts] = useState<any[]>([]);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Add this state near the top of your component
  const [selectedAgentId, setSelectedAgentId] = useState("");
  // Fetch agents

  // Add this function at the top level of your component
  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      if (!response.ok) {
        throw new Error("Failed to fetch agents");
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching agents:", error);
      return { agents: [] };
    }
  };
  // Then update your SWR call
  const { data: agentsData } = useSWR<{ agents: any[] }>("/api/agents", fetchAgents);
  const agents = agentsData?.agents?.filter(a => !a.disabled) || [];
  const [selectedContactDetails, setSelectedContactDetails] = useState<any[]>([]);
  // Initialize form
  const form = useForm<z.infer<typeof campaignSchema>>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      description: "",
      customMessage: "",
      useScheduling: false,
      maxConcurrentCalls: "1",
      usePacing: false,
    }
  });



  useEffect(() => {
    // Check if we arrived from an import in the calls page
    const contactsJson = localStorage.getItem('campaignContacts');
    const agentId = localStorage.getItem('campaignAgentId');

    if (contactsJson && agentId) {
      try {
        const contacts = JSON.parse(contactsJson);
        if (Array.isArray(contacts) && contacts.length > 0) {
          setUploadedContacts(contacts);
          form.setValue("agentId", agentId);
          setCurrentStep(2); // Skip to step 2
        }
      } catch (e) {
        console.error("Error parsing imported contacts:", e);
      }
      // Clear localStorage values to prevent reuse
      localStorage.removeItem('campaignContacts');
      localStorage.removeItem('campaignAgentId');
    }
  }, []);

  // Add these state variables
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Add a function to fetch contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      let url = `/api/contacts?page=${currentPage}&limit=50`;

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      if (selectedTag) {
        url += `&tag=${encodeURIComponent(selectedTag)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      setContacts(data.contacts);
      setTotalPages(data.pagination.pages);

      // Extract unique tags from contacts
      const tags = new Set<string>();
      data.contacts.forEach((contact: any) => {
        if (contact.tags && contact.tags.length > 0) {
          contact.tags.forEach((tag: string) => tags.add(tag));
        }
      });
      setAvailableTags(Array.from(tags));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contacts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  // Add a function to fetch contact details when moving to step 3
  // Add this function to prepare contact details from the contacts array
  const prepareSelectedContactDetails = () => {
    if (selectedContacts.length === 0) return [];

    const details = selectedContacts
      .map(id => contacts.find(contact => contact._id === id))
      .filter(Boolean);

    return details;
  };

  // Modify the existing effect to update selectedContactDetails when step changes
  useEffect(() => {
    if (currentStep === 1) {
      fetchContacts();
    } else if (currentStep === 3) {
      const details = prepareSelectedContactDetails();
      setSelectedContactDetails(details);
    }
  }, [currentStep, searchTerm, selectedTag, currentPage]);
  // Add functions to handle contact selection
  const handleToggleSelectContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact._id));
    }
  };

  // Add an effect to fetch contacts
  useEffect(() => {
    if (currentStep === 1) {
      fetchContacts();
    } else if (currentStep === 3) {
      const details = prepareSelectedContactDetails();
      setSelectedContactDetails(details);
    }
  }, [currentStep, searchTerm, selectedTag, currentPage]);

  // Add a function to get the MongoDB _id from the agent_id
  const getMongoAgentId = (agentId: string) => {
    const agent = agents.find(a => a.agent_id === agentId);
    if (!agent) return null;

    // Try to use a database ID if available in the agent object
    // This will depend on what's actually returned from your API
    return agent.id || agent._id || agent.databaseId || null;
  };

  // In the onSubmit function, use the MongoDB _id directly
  const onSubmit = async (values: z.infer<typeof campaignSchema>) => {
    try {
      setIsSubmitting(true);

      if (selectedContacts.length === 0) {
        toast('No contacts selected');
        return;
      }

      // Use the MongoDB _id directly
      const agentId = values.agentId;

      // Prepare campaign data
      const campaignData = {
        ...values,
        contacts: selectedContacts,
        agentId: agentId,
        totalContacts: selectedContacts.length,
        // Convert scheduled time to proper format if provided
        scheduledStartTime: values.useScheduling && values.scheduledStartTime ?
          new Date(values.scheduledStartTime).toISOString() : undefined,
        // Include pacing settings only if enabled
        callsBetweenPause: values.usePacing && values.callsBetweenPause ?
          parseInt(values.callsBetweenPause) : undefined,
        pauseDuration: values.usePacing && values.pauseDuration ?
          parseInt(values.pauseDuration) : undefined,
      };

      // Create campaign
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create campaign");
      }

      const result = await response.json();
      console.log("Campaign created:", result);

      // Show success message
      toast({
        title: 'Campaign created',
        description: 'Your campaign has been created successfully',
        variant: 'success',
      });

      // Redirect to campaign details page
      router.push(`/dashboard/campaigns/${result.campaign._id}`);
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: 'Error',
        description: `Failed to create campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
        <div className=" px-4 sm:px-6 py-8 mx-auto ">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
          >
            <div className="flex items-center gap-2 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/campaigns')}
                className="h-9 w-9 p-0 rounded-full mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">New Campaign</h1>
                <p className="text-muted-foreground">
                  Create a new AI voice calling campaign
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stepper Component */}
          <div className="mb-8">
            <div className="hidden sm:flex items-center w-full max-w-3xl mx-auto">
              {/* Step indicators with connecting lines */}
              <div className={`flex items-center justify-center h-10 w-10 rounded-full
                ${currentStep >= 1 ? 'bg-primary' : 'bg-muted'}
                text-primary-foreground text-sm font-medium`}>
                {currentStep > 1 ? <Check className="h-5 w-5" /> : '1'}
              </div>
              <div className={`flex-1 h-1 ${currentStep > 1 ? 'bg-primary' : 'bg-muted'}`}></div>

              <div className={`flex items-center justify-center h-10 w-10 rounded-full
                ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}
                text-primary-foreground text-sm font-medium`}>
                {currentStep > 2 ? <Check className="h-5 w-5" /> : '2'}
              </div>
              <div className={`flex-1 h-1 ${currentStep > 2 ? 'bg-primary' : 'bg-muted'}`}></div>

              <div className={`flex items-center justify-center h-10 w-10 rounded-full
                ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}
                text-primary-foreground text-sm font-medium`}>
                3
              </div>
            </div>

            {/* Step labels */}
            <div className="hidden sm:flex justify-between max-w-3xl mx-auto mt-2">
              <span className={`text-sm font-medium
                ${currentStep >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                Import Contacts
              </span>
              <span className={`text-sm font-medium
                ${currentStep >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
                Campaign Settings
              </span>
              <span className={`text-sm font-medium
                ${currentStep >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                Review & Launch
              </span>
            </div>

            {/* Mobile stepper */}
            <div className="sm:hidden flex items-center justify-center mt-4">
              <Badge variant="outline" className="px-3 py-1">
                Step {currentStep} of 3
              </Badge>
            </div>
          </div>

          {/* Step 1: Import Contacts */}

          {currentStep === 1 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariant}
              className="max-w-3xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Select Contacts</CardTitle>
                  <CardDescription>
                    Choose contacts for your campaign
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
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedAgentId(value);
                              }}
                              defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an agent" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {agents.length > 0 ? (
                                  agents.map(agent => (
                                    <SelectItem key={agent.agent_id} value={agent._id}>
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
                              This agent will handle all conversations for contacts in your campaign
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Contact Selection */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-medium">Select Contacts</h3>
                            <p className="text-sm text-muted-foreground">
                              Choose contacts to include in this campaign
                            </p>
                          </div>

                          {/* Search and filter controls */}
                          <div className="flex items-center gap-2">
                            {/* <Input
                              placeholder="Search contacts..."
                              className="w-[200px]"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            /> */}
                            <DropdownMenu>
                              {/* <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Filter className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger> */}
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by tag</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {availableTags.map(tag => (
                                  <DropdownMenuItem
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    className="cursor-pointer"
                                  >
                                    {tag}
                                  </DropdownMenuItem>
                                ))}
                                {selectedTag && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => setSelectedTag(null)}
                                      className="cursor-pointer text-destructive"
                                    >
                                      Clear filter
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Loading state */}
                        {loading ? (
                          <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="flex items-center p-3 border rounded-md">
                                <Skeleton className="h-4 w-4 mr-3 rounded" />
                                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                                <div className="flex-1">
                                  <Skeleton className="h-4 w-1/3 mb-2" />
                                  <Skeleton className="h-3 w-1/4" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            {/* Contact selection list */}
                            <div className="border rounded-lg overflow-hidden">
                              <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
                                <div className="flex items-center">
                                  <Checkbox
                                    id="select-all"
                                    checked={contacts.length > 0 && selectedContacts.length === contacts.length}
                                    onCheckedChange={handleSelectAllContacts}
                                  />
                                  <label htmlFor="select-all" className="ml-2 text-sm font-medium">
                                    Select all
                                  </label>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {selectedContacts.length} of {contacts.length} selected
                                </div>
                              </div>

                              <ScrollArea className="h-[300px]">
                                {contacts.length === 0 ? (
                                  <div className="py-12 text-center">
                                    <Users className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                                    <h3 className="text-lg font-medium mb-1">No contacts found</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                      {searchTerm || selectedTag
                                        ? "Try adjusting your search filters"
                                        : "Add contacts to start creating campaigns"}
                                    </p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => router.push('/dashboard/contacts')}
                                    >
                                      <UserPlus className="h-4 w-4 mr-2" />
                                      Manage Contacts
                                    </Button>
                                  </div>
                                ) : (
                                  <div>
                                    {contacts.map(contact => (
                                      <div
                                        key={contact._id}
                                        className="flex items-center p-3 hover:bg-muted/50 border-b last:border-0"
                                      >
                                        <Checkbox
                                          id={`contact-${contact._id}`}
                                          checked={selectedContacts.includes(contact._id)}
                                          onCheckedChange={() => handleToggleSelectContact(contact._id)}
                                          className="mr-3"
                                        />
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                          <span className="font-medium text-primary text-sm">
                                            {contact.name.charAt(0).toUpperCase()}
                                          </span>
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-medium text-sm">{contact.name}</div>
                                          <div className="text-xs text-muted-foreground">{contact.phoneNumber}</div>
                                        </div>
                                        {contact.company && (
                                          <Badge variant="outline" className="mr-2">{contact.company}</Badge>
                                        )}
                                        {contact.tags && contact.tags.length > 0 && (
                                          <div className="flex gap-1">
                                            {contact.tags.map(tag => (
                                              <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </ScrollArea>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/campaigns')}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={selectedContacts.length === 0 || !selectedAgentId}
                    onClick={() => setCurrentStep(2)}
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Campaign Settings */}
          {currentStep === 2 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariant}
              className="max-w-3xl mx-auto"
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(() => {
                  // Prepare contact details before moving to step 3
                  const details = prepareSelectedContactDetails();
                  setSelectedContactDetails(details);
                  setCurrentStep(3);
                })} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Details</CardTitle>
                      <CardDescription>
                        Basic information about your campaign
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter campaign name" {...field} />
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
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter campaign description or notes"
                                className="min-h-[80px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A brief description of the purpose of this campaign
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Message (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter custom instructions for your AI agent to follow during calls"
                                className="min-h-[100px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Custom instructions or script for your AI agent to follow during calls
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Call Scheduling</CardTitle>
                      <CardDescription>
                        Configure when and how calls should be made
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="useScheduling"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Schedule Campaign
                              </FormLabel>
                              <FormDescription>
                                Set a specific start time for this campaign
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

                      {form.watch("useScheduling") && (
                        <div className="space-y-4 pl-4 border-l-2 border-muted">
                          <FormField
                            control={form.control}
                            name="scheduledStartTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date & Time</FormLabel>
                                <FormControl>
                                  <Input
                                    type="datetime-local"
                                    {...field}
                                    min={new Date().toISOString().slice(0, 16)}
                                  />
                                </FormControl>
                                <FormDescription>
                                  When should the campaign start making calls
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="dailyStartTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Daily Start Time</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="time"
                                      defaultValue="09:00"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Start making calls each day at this time
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="dailyEndTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Daily End Time</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="time"
                                      defaultValue="17:00"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Stop making calls each day at this time
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}

                      <Separator />

                      <FormField
                        control={form.control}
                        name="maxConcurrentCalls"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Concurrent Calls</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum number of simultaneous calls (1-10)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="usePacing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Enable Call Pacing
                              </FormLabel>
                              <FormDescription>
                                Add pauses between batches of calls
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

                      {form.watch("usePacing") && (
                        <div className="space-y-4 pl-4 border-l-2 border-muted">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="callsBetweenPause"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Calls Between Pauses</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      defaultValue="5"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Number of calls to make before pausing
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="pauseDuration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pause Duration (minutes)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      defaultValue="10"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    How long to pause between batches
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <Button type="submit">
                      Continue <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}

          {/* Step 3: Review & Launch */}
          {currentStep === 3 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariant}
              className="max-w-3xl mx-auto space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Review Campaign</CardTitle>
                  <CardDescription>
                    Review your campaign settings before launching
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-lg bg-muted/30 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">Campaign Details</h3>
                      {currentStep === 3 && (
                        <Badge className="bg-primary/10 text-primary border-primary/30 px-3">
                          Ready to Launch
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Campaign Name</p>
                        <p className="font-medium">{form.getValues("name")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Agent</p>
                        <p className="font-medium flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-success mr-2" />
                          {agents.find(a => a._id === form.getValues("agentId"))?.name || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Contacts</p>
                        <p className="font-medium">{selectedContacts.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Max Concurrent Calls</p>
                        <p className="font-medium">{form.getValues("maxConcurrentCalls") || 1}</p>
                      </div>
                    </div>

                    {form.getValues("description") && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-1">Campaign Description</p>
                        <p className="text-sm">{form.getValues("description")}</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-md font-medium">Schedule Details</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-3">
                        <div className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Start Time</p>
                            <p className="font-medium">
                              {form.getValues("useScheduling") && form.getValues("scheduledStartTime")
                                ? format(new Date(form.getValues("scheduledStartTime")), "PPp")
                                : "Immediately"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-3">
                        <div className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Daily Hours</p>
                            <p className="font-medium">
                              {form.getValues("dailyStartTime") || "09:00"} - {form.getValues("dailyEndTime") || "17:00"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {form.getValues("usePacing") && (
                      <div className="border rounded-lg p-3">
                        <div className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <Settings className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Pacing Strategy</p>
                            <p className="font-medium">
                              Pause for {form.getValues("pauseDuration") || "10"} minutes after every {form.getValues("callsBetweenPause") || "5"} calls
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {form.getValues("customMessage") && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h3 className="text-md font-medium">Custom Instructions</h3>
                        <div className="p-3 bg-muted rounded-md text-sm">
                          {form.getValues("customMessage")}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* In Step 3, replace the existing contacts table with this */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Contact List Preview
                  </CardTitle>
                  <CardDescription>
                    {selectedContacts.length} contacts will be called
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone Number</TableHead>
                          <TableHead className="hidden md:table-cell">Company</TableHead>
                          <TableHead className="hidden md:table-cell">Tags</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedContactDetails.length > 0 ? (
                          <>
                            {selectedContactDetails.slice(0, 5).map(contact => (
                              <TableRow key={contact._id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                      <span className="text-xs font-medium text-primary">
                                        {contact.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <span>{contact.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{contact.phoneNumber}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {contact.company || "-"}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <div className="flex flex-wrap gap-1">
                                    {contact.tags && contact.tags.length > 0 ? (
                                      contact.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {selectedContactDetails.length > 5 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-2">
                                  + {selectedContactDetails.length - 5} more contacts
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-20 text-center">
                              {selectedContacts.length > 0 ? (
                                <div className="flex flex-col items-center justify-center">
                                  <CheckCircle className="h-6 w-6 text-primary mb-2" />
                                  <p className="text-sm font-medium">{selectedContacts.length} contacts ready</p>
                                  <p className="text-xs text-muted-foreground">Your campaign is ready to launch</p>
                                </div>
                              ) : (
                                <div className="text-muted-foreground">
                                  No contacts selected
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Info className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Important Information</h3>
                      <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
                        <li>Calls will be charged according to your billing plan</li>
                        <li>You're responsible for complying with all applicable call regulations</li>
                        <li>Campaigns can be paused or cancelled at any time</li>
                        <li>Call reports and analytics will be available in the campaign dashboard</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard/campaigns')}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="relative"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Create Campaign
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
