"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  HelpCircle,
  Plus,
  RefreshCw,
  Search,
  Ticket,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

// Types
type TicketPriority = "low" | "medium" | "high" | "urgent";
type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
type TicketCategory = "billing" | "technical" | "feature" | "account" | "other";

interface TicketMessage {
  _id: string;
  content: string;
  sender: "user" | "support";
  attachments?: string[];
  createdAt: string;
}

interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export default function SupportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newTicketDialog, setNewTicketDialog] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TicketStatus | "all">("all");
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "technical" as TicketCategory,
    priority: "medium" as TicketPriority,
  });

  // Fetch tickets from the API
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params for filtering
      let queryParams = '';
      if (activeFilter !== 'all') {
        queryParams = `?status=${activeFilter}`;
      }
      if (searchQuery) {
        queryParams = queryParams ? `${queryParams}&query=${searchQuery}` : `?query=${searchQuery}`;
      }

      const response = await fetch(`/api/tickets${queryParams}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err: any) {
      console.error("Error fetching tickets:", err);
      setError(err.message || "Failed to load tickets");
      toast({
        title: "Error",
        description: "Failed to load tickets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchTickets();
  }, [activeFilter, searchQuery]);

  // Function to fetch a single ticket's details
  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setSelectedTicket(data.ticket);

      // Update the ticket in the list with fresh data
      setTickets(prev => prev.map(t => t._id === data.ticket._id ? data.ticket : t));
    } catch (err: any) {
      console.error("Error fetching ticket details:", err);
      toast({
        title: "Error",
        description: "Failed to load ticket details.",
        variant: "destructive",
      });
    }
  };

  // Handle ticket selection
  const handleSelectTicket = (ticket: Ticket) => {
    // Fetch the latest version of the ticket
    fetchTicketDetails(ticket._id);
  };

  // Handle submitting a new ticket
  const handleSubmitNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTicket.title,
          description: newTicket.description,
          category: newTicket.category,
          priority: newTicket.priority,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      const data = await response.json();

      // Add new ticket to the list and select it
      setTickets(prev => [data.ticket, ...prev]);
      setSelectedTicket(data.ticket);

      // Reset form
      setNewTicket({
        title: "",
        description: "",
        category: "technical",
        priority: "medium",
      });

      setNewTicketDialog(false);

      toast({
        title: "Success",
        description: "Your support ticket has been created successfully.",
      });
    } catch (err: any) {
      console.error("Error creating ticket:", err);
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    setSendingMessage(true);

    try {
      const response = await fetch(`/api/tickets/${selectedTicket._id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Update the selected ticket and the ticket in the list
      setSelectedTicket(data.ticket);
      setTickets(prev => prev.map(t => t._id === data.ticket._id ? data.ticket : t));
      setNewMessage("");
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Update ticket status
  const handleUpdateTicketStatus = async (status: TicketStatus) => {
    if (!selectedTicket) return;

    try {
      const response = await fetch(`/api/tickets/${selectedTicket._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update ticket");
      }

      const data = await response.json();

      // Update ticket in state
      setSelectedTicket(data.ticket);
      setTickets(prev => prev.map(t => t._id === data.ticket._id ? data.ticket : t));

      toast({
        title: "Success",
        description: `Ticket status updated to ${status}.`,
      });
    } catch (err: any) {
      console.error("Error updating ticket:", err);
      toast({
        title: "Error",
        description: "Failed to update ticket status.",
        variant: "destructive",
      });
    }
  };

  // Animation variants
  const containerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  // Helper to render status badges
  const renderStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Open</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">In Progress</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Resolved</Badge>;
      case "closed":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Closed</Badge>;
    }
  };

  // Helper to render priority indicators
  const renderPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case "low":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Low</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Medium</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">High</Badge>;
      case "urgent":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Urgent</Badge>;
    }
  };

  // Helper to render category badges
  const renderCategoryBadge = (category: TicketCategory) => {
    switch (category) {
      case "billing":
        return <Badge variant="outline">Billing</Badge>;
      case "technical":
        return <Badge variant="outline">Technical</Badge>;
      case "feature":
        return <Badge variant="outline">Feature</Badge>;
      case "account":
        return <Badge variant="outline">Account</Badge>;
      case "other":
        return <Badge variant="outline">Other</Badge>;
    }
  };

  return (
    <div className="min-h-screen text-foreground flex">
      <DashboardSidebar />
      <main className="flex-1 h-screen overflow-y-auto bg-background">
        <DashboardHeader />

        <div className="mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Support</h1>
              <p className="text-muted-foreground mt-1">
                Need help? Create a support ticket or check the status of existing ones
              </p>
            </div>
            <Dialog open={newTicketDialog} onOpenChange={setNewTicketDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to create a new support ticket. Our team will respond as soon as possible.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitNewTicket}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Title
                      </label>
                      <Input
                        id="title"
                        placeholder="Brief summary of your issue"
                        value={newTicket.title}
                        onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Description
                      </label>
                      <Textarea
                        id="description"
                        placeholder="Please provide details about your issue"
                        rows={5}
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="category" className="text-sm font-medium">
                          Category
                        </label>
                        <Select
                          value={newTicket.category}
                          onValueChange={(value: TicketCategory) =>
                            setNewTicket({ ...newTicket, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical Issue</SelectItem>
                            <SelectItem value="billing">Billing</SelectItem>
                            <SelectItem value="feature">Feature Request</SelectItem>
                            <SelectItem value="account">Account</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="priority" className="text-sm font-medium">
                          Priority
                        </label>
                        <Select
                          value={newTicket.priority}
                          onValueChange={(value: TicketPriority) =>
                            setNewTicket({ ...newTicket, priority: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setNewTicketDialog(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Ticket"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Panel: Ticket List */}
            <Card className="md:col-span-1 border rounded-lg overflow-hidden">
              <CardHeader className="p-4 pb-0">
                <div className="relative mb-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex justify-between items-center mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchTickets()}
                    className="text-muted-foreground"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                </div>

                {/* Ticket Status Filter Tabs */}
                <div className="mt-4">
                  <Tabs>
                    <TabsList className="w-full">
                      <TabsTrigger
                        value="all"
                        className={cn("flex-1", activeFilter === "all" ? "bg-primary/10" : "")}
                        onClick={() => setActiveFilter("all")}
                      >
                        All
                      </TabsTrigger>
                      <TabsTrigger
                        value="open"
                        className={cn("flex-1", activeFilter === "open" ? "bg-primary/10" : "")}
                        onClick={() => setActiveFilter("open")}
                      >
                        Open
                      </TabsTrigger>
                      <TabsTrigger
                        value="in-progress"
                        className={cn("flex-1", activeFilter === "in-progress" ? "bg-primary/10" : "")}
                        onClick={() => setActiveFilter("in-progress")}
                      >
                        In Progress
                      </TabsTrigger>
                      <TabsTrigger
                        value="resolved"
                        className={cn("flex-1", activeFilter === "resolved" ? "bg-primary/10" : "")}
                        onClick={() => setActiveFilter("resolved")}
                      >
                        Resolved
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>

              <CardContent className="p-0 pt-2">
                <ScrollArea className="h-[calc(100vh-320px)]">
                  {loading ? (
                    <div className="p-4 space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2 p-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="flex gap-2 mt-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : error ? (
                    <div className="p-8 text-center">
                      <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-3" />
                      <h3 className="font-medium text-lg mb-1">Error loading tickets</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {error}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => fetchTickets()}
                        className="mx-auto"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="p-8 text-center">
                      <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="font-medium text-lg mb-1">No tickets found</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {searchQuery || activeFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Create your first support ticket to get help"}
                      </p>
                      {(searchQuery || activeFilter !== "all") && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchQuery("");
                            setActiveFilter("all");
                          }}
                          className="mx-auto"
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={containerVariant}
                    >
                      {tickets.map((ticket) => (
                        <motion.div
                          key={ticket._id}
                          variants={itemVariant}
                          onClick={() => handleSelectTicket(ticket)}
                          className={cn(
                            "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                            selectedTicket?._id === ticket._id ? "bg-muted" : ""
                          )}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-medium line-clamp-1">{ticket.title}</h3>
                            {renderStatusBadge(ticket.status)}
                          </div>
                          <p className="text-muted-foreground text-sm line-clamp-1 mb-2">
                            {ticket.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {renderPriorityBadge(ticket.priority)}
                              {renderCategoryBadge(ticket.category)}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(ticket.updatedAt))} ago
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Right Panel: Ticket Details */}
            <Card className="md:col-span-2 border rounded-lg overflow-hidden flex flex-col">
              {selectedTicket ? (
                <>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <CardTitle className="text-xl">{selectedTicket.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <CardDescription>
                            Ticket #{selectedTicket._id.substring(0, 8)} •
                            Created {format(new Date(selectedTicket.createdAt), 'MMM d, yyyy')}
                          </CardDescription>
                          {renderStatusBadge(selectedTicket.status)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderPriorityBadge(selectedTicket.priority)}
                        {renderCategoryBadge(selectedTicket.category)}
                      </div>
                    </div>

                    {/* Status update buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <p className="text-sm font-medium mr-2 flex items-center">Update status:</p>
                      {selectedTicket.status !== "open" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateTicketStatus("open")}
                        >
                          Mark as Open
                        </Button>
                      )}
                      {selectedTicket.status !== "in-progress" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateTicketStatus("in-progress")}
                        >
                          Mark In Progress
                        </Button>
                      )}
                      {selectedTicket.status !== "resolved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateTicketStatus("resolved")}
                        >
                          Mark Resolved
                        </Button>
                      )}
                      {selectedTicket.status !== "closed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateTicketStatus("closed")}
                        >
                          Close Ticket
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 flex-grow overflow-hidden flex flex-col">
                    <div className="mt-2 mb-3">
                      <p className="text-sm">{selectedTicket.description}</p>
                    </div>
                    <Separator className="my-3" />

                    <h3 className="font-medium text-sm mb-3">Conversation</h3>

                    <ScrollArea className="flex-grow h-[calc(100vh-450px)]">
                      <div className="space-y-4 pb-4">
                        {selectedTicket.messages.map((message, index) => (
                          <div
                            key={message._id || index}
                            className={cn(
                              "flex gap-3 p-3 rounded-lg",
                              message.sender === "support"
                                ? "bg-muted/50"
                                : "bg-primary/5"
                            )}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {message.sender === "support" ? "S" : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <p className="text-sm font-medium">
                                  {message.sender === "support" ? "Support Team" : "You"}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {message.createdAt && format(new Date(message.createdAt), 'MMM d, h:mm a')}
                                </span>
                              </div>
                              <p className="mt-1 text-sm whitespace-pre-line">{message.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>

                  <CardFooter className="p-4 border-t">
                    <form className="w-full" onSubmit={handleSendMessage}>
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Type your message here..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1 resize-none"
                          rows={2}
                          disabled={sendingMessage || selectedTicket.status === "closed"}
                        />
                        <Button
                          type="submit"
                          disabled={!newMessage.trim() || sendingMessage || selectedTicket.status === "closed"}
                        >
                          {sendingMessage ? "Sending..." : "Send"}
                        </Button>
                      </div>
                      {selectedTicket.status === "closed" && (
                        <p className="text-muted-foreground text-sm mt-2">
                          This ticket is closed. You cannot send additional messages.
                        </p>
                      )}
                    </form>
                  </CardFooter>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <Ticket className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-medium mb-2">No ticket selected</h2>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Select a ticket from the list to view details or create a new support ticket.
                  </p>
                  <Dialog open={newTicketDialog} onOpenChange={setNewTicketDialog}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create New Ticket
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
