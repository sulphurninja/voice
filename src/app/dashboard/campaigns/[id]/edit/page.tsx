"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Trash2,
  Clock,
  CalendarClock,
  Upload,
  Users,
  Bot,
  MessageSquare,
  Settings,
  Save,
  Phone,
  PlayCircle,
  Loader2,
  PlusCircle,
  X,
  Search,
  ChevronsUpDown,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function EditCampaignPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [openAgentSelector, setOpenAgentSelector] = useState(false);
  const [openContactSelector, setOpenContactSelector] = useState(false);

  // Fetch campaign data
  const { data: campaignData, error: campaignError, mutate: refreshCampaign } = useSWR<{
    campaign: any;
    contacts: any[];
    calls: any[];
  }>(`/api/campaigns/${params.id}`, fetcher);

  // Fetch additional data needed for the form
  const { data: agentsData } = useSWR<{ agents: any[] }>('/api/agents', fetcher);
  const { data: contactsData } = useSWR<{ contacts: any[] }>('/api/contacts?limit=100', fetcher);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      agentId: "",
      customMessage: "",
      maxConcurrentCalls: 1,
      dailyStartTime: "09:00",
      dailyEndTime: "17:00",
      callsBetweenPause: 0,
      pauseDuration: 0,
      scheduledStartTime: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: any) => {
    try {
      setIsUpdating(true);

      // Prepare the data for API request
      const campaignData = {
        ...data,
        contacts: selectedContacts.map(contact => contact._id),
      };

      // Remove empty fields
      Object.keys(campaignData).forEach(key => {
        if (campaignData[key] === "" || campaignData[key] === null || campaignData[key] === undefined) {
          delete campaignData[key];
        }
      });

      // Format date strings to Date objects if provided
      if (campaignData.scheduledStartTime) {
        campaignData.scheduledStartTime = new Date(campaignData.scheduledStartTime);
      }

      // Update the campaign
      const response = await fetch(`/api/campaigns/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update campaign");
      }

      const result = await response.json();
      toast.success("Campaign updated successfully");

      // Redirect to campaign details page
      router.push(`/dashboard/campaigns/${params.id}`);
    } catch (error: any) {
      console.error("Error updating campaign:", error);
      toast.error(`Failed to update campaign: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Initialize form when data is loaded
  useEffect(() => {
    if (campaignData?.campaign) {
      const campaign = campaignData.campaign;

      // Set form values
      form.reset({
        name: campaign.name,
        description: campaign.description || "",
        agentId: campaign.agentId?._id || campaign.agentId,
        customMessage: campaign.customMessage || "",
        maxConcurrentCalls: campaign.maxConcurrentCalls || 1,
        dailyStartTime: campaign.dailyStartTime || "09:00",
        dailyEndTime: campaign.dailyEndTime || "17:00",
        callsBetweenPause: campaign.callsBetweenPause || 0,
        pauseDuration: campaign.pauseDuration || 0,
        scheduledStartTime: campaign.scheduledStartTime
          ? new Date(campaign.scheduledStartTime).toISOString().slice(0, 16)
          : "",
      });

      // Set selected agent
      if (agentsData?.agents && campaign.agentId) {
        const agent = agentsData.agents.find(a =>
          a._id === (typeof campaign.agentId === 'object' ? campaign.agentId._id : campaign.agentId)
        );
        setSelectedAgent(agent);
      }

      // Set selected contacts
      if (campaignData.contacts) {
        setSelectedContacts(campaignData.contacts);
      }
    }
  }, [campaignData, agentsData, form]);

  // Filter contacts based on search
  const filteredContacts = contactsData?.contacts?.filter(contact => {
    const searchLower = contactSearch.toLowerCase();
    return (
      !selectedContacts.some(selected => selected._id === contact._id) &&
      (contact.name?.toLowerCase().includes(searchLower) ||
       contact.phoneNumber?.includes(searchLower) ||
       contact.email?.toLowerCase().includes(searchLower))
    );
  }) || [];

  // Remove contact from selection
  const removeContact = (contactId: string) => {
    setSelectedContacts(prevSelected =>
      prevSelected.filter(contact => contact._id !== contactId)
    );
  };

  // Add contact to selection
  const addContact = (contact: any) => {
    setSelectedContacts(prev => [...prev, contact]);
    setContactSearch("");
  };

  // Check if campaign is editable
  const isEditable = campaignData?.campaign?.status === 'draft';

  // Animation variants
  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (campaignError) {
    return (
      <div className="min-h-screen text-foreground flex">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col items-center justify-center bg-background">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Campaign Not Found</h2>
            <p className="text-muted-foreground mb-6">The campaign you're looking for doesn't exist or was deleted.</p>
            <Button onClick={() => router.push('/dashboard/campaigns')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!campaignData && !campaignError) {
    return (
      <div className="min-h-screen text-foreground flex">
        <DashboardSidebar />
        <main className="flex-1 flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!isEditable) {
    return (
      <div className="min-h-screen text-foreground flex">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col items-center justify-center bg-background">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Campaign Cannot Be Edited</h2>
            <p className="text-muted-foreground mb-6">
              Only campaigns in draft status can be edited. This campaign is currently in {campaignData?.campaign?.status} status.
            </p>
            <Button onClick={() => router.push(`/dashboard/campaigns/${params.id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaign Details
            </Button>
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

        <div className="mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
          >
            {/* Header with back button and page title */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/campaigns/${params.id}`)}
                className="h-9 w-9 p-0 rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Edit Campaign</h1>
                <p className="text-muted-foreground">
                  Update your campaign settings and contacts
                </p>
              </div>
            </div>
          </motion.div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUpVariant}
              >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="basic">
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="contacts">
                      Contacts
                    </TabsTrigger>
                    <TabsTrigger value="message">
                      Message
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                      Settings
                    </TabsTrigger>
                  </TabsList>

                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="mt-6 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Campaign Details</CardTitle>
                        <CardDescription>
                          Basic information about your campaign
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Campaign Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter campaign name" {...field} />
                              </FormControl>
                              <FormDescription>
                                A descriptive name to identify this campaign
                              </FormDescription>
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
                                  placeholder="Enter a description for this campaign"
                                  className="resize-none"
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Optional details about the purpose of this campaign
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="agentId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Agent</FormLabel>
                              <FormControl>
                                <Popover open={openAgentSelector} onOpenChange={setOpenAgentSelector}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={openAgentSelector}
                                      className="w-full justify-between"
                                    >
                                      {selectedAgent
                                        ? selectedAgent.name
                                        : "Select an agent..."}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                      <CommandInput placeholder="Search agents..." />
                                      <CommandEmpty>No agents found.</CommandEmpty>
                                      <CommandGroup>
                                        {agentsData?.agents?.map((agent) => (
                                          <CommandItem
                                            key={agent._id}
                                            value={agent.name}
                                            onSelect={() => {
                                              form.setValue("agentId", agent._id);
                                              setSelectedAgent(agent);
                                              setOpenAgentSelector(false);
                                            }}
                                          >
                                            <div className="flex items-center">
                                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                                                <Bot className="h-4 w-4 text-primary" />
                                              </div>
                                              <div>
                                                <p className="font-medium">{agent.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                  {agent.description || "Voice AI Agent"}
                                                </p>
                                              </div>
                                            </div>
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              </FormControl>
                              <FormDescription>
                                The AI voice agent that will make the calls
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Contacts Tab */}
                  <TabsContent value="contacts" className="mt-6 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Campaign Contacts</CardTitle>
                        <CardDescription>
                          Add or remove contacts for this campaign
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="mb-4">
                            <Label>Selected Contacts</Label>
                            <p className="text-sm text-muted-foreground mb-2">
                              {selectedContacts.length} contacts selected for this campaign
                            </p>
                          </div>

                          {selectedContacts.length > 0 ? (
                            <ScrollArea className="h-[200px] border rounded-md">
                              <div className="p-1">
                                {selectedContacts.map((contact) => (
                                  <div
                                    key={contact._id}
                                    className="flex items-center justify-between px-3 py-2 hover:bg-muted rounded-md"
                                  >
                                    <div className="flex items-center">
                                      <Avatar className="h-8 w-8 mr-2">
                                        <AvatarFallback className="text-xs">
                                          {contact.name?.charAt(0) || 'C'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-medium">
                                          {contact.name || "Unnamed Contact"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {contact.phoneNumber}
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeContact(contact._id)}
                                      className="h-7 w-7 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          ) : (
                            <div className="h-[200px] border rounded-md flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-muted-foreground mb-2">
                                  No contacts selected
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Use the search below to add contacts
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator />

                        <div>
                          <Label htmlFor="contactSearch">Add Contacts</Label>
                          <p className="text-sm text-muted-foreground mb-2">
                            Search and add contacts to this campaign
                          </p>

                          <Popover open={openContactSelector} onOpenChange={setOpenContactSelector}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openContactSelector}
                                className="w-full justify-between"
                              >
                                <div className="flex items-center">
                                  <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span className={contactSearch ? "" : "text-muted-foreground"}>
                                    {contactSearch || "Search contacts..."}
                                  </span>
                                </div>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Search by name, phone or email..."
                                  value={contactSearch}
                                  onValueChange={setContactSearch}
                                />
                                <CommandEmpty>No contacts found. Try a different search.</CommandEmpty>
                                <CommandGroup>
                                  {filteredContacts.slice(0, 10).map((contact) => (
                                    <CommandItem
                                      key={contact._id}
                                      value={contact.name || contact.phoneNumber}
                                      onSelect={() => {
                                        addContact(contact);
                                        setOpenContactSelector(false);
                                      }}
                                    >
                                      <div className="flex items-center">
                                        <Avatar className="h-8 w-8 mr-2">
                                          <AvatarFallback className="text-xs">
                                            {contact.name?.charAt(0) || 'C'}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-medium">
                                            {contact.name || "Unnamed Contact"}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {contact.phoneNumber}
                                          </p>
                                        </div>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Message Tab */}
                  <TabsContent value="message" className="mt-6 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Custom Message</CardTitle>
                        <CardDescription>
                          Customize the initial message your agent will use
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="customMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom Starting Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Hello, this is [agent name] calling from [company]. I'm reaching out regarding..."
                                  className="resize-none"
                                  rows={5}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                This message will override the agent's default first message for this campaign.
                                Leave blank to use the agent's configured message.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="mt-6 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Campaign Settings</CardTitle>
                        <CardDescription>
                          Configure how the campaign operates
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Scheduling</h3>

                          <FormField
                            control={form.control}
                            name="scheduledStartTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Scheduled Start Time</FormLabel>
                                <FormControl>
                                  <Input
                                    type="datetime-local"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  When the campaign should automatically start. Leave blank to start manually.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="dailyStartTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Daily Start Time</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="time"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Time to start calls each day
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
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Time to stop calls each day
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Call Rate Settings</h3>

                          <FormField
                            control={form.control}
                            name="maxConcurrentCalls"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Maximum Concurrent Calls</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={20}
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(parseInt(e.target.value, 10) || 1)
                                    }
                                  />
                                </FormControl>
                                <FormDescription>
                                  How many calls can be active at the same time (1-20)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="callsBetweenPause"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Calls Between Pauses</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      placeholder="Optional"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(parseInt(e.target.value, 10) || 0)
                                      }
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Number of calls before pausing (0 = no pauses)
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
                                      min={0}
                                      placeholder="Optional"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(parseInt(e.target.value, 10) || 0)
                                      }
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Minutes to pause between batches
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUpVariant}
                className="flex justify-between mt-8"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/campaigns/${params.id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isUpdating ? "Updating..." : "Update Campaign"}
                </Button>
              </motion.div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
