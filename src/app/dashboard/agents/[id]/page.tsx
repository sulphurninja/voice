"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Bot,
  Phone,
  Pencil,
  Volume2,
  MessageSquare,
  Wand2,
  Settings,
  BarChart,
  Clock,
  Activity,
  List,
  FileText,
  AlertTriangle
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Call = {
  id: string;
  phoneNumber: string;
  status: string;
  duration: number;
  startTime: string;
  endTime?: string;
  contactName?: string;
};

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggleDisableDialog, setToggleDisableDialog] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [callsLoading, setCallsLoading] = useState(true);

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
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching agent:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentCalls = async () => {
      try {
        setCallsLoading(true);
        // This endpoint might need to be implemented
        const response = await fetch(`/api/calls?agentId=${params.id}&limit=5`);

        if (!response.ok) {
          // Just log the error but don't show it to the user
          console.error("Failed to fetch recent calls");
          return;
        }

        const data = await response.json();
        setRecentCalls(data.calls || []);
      } catch (err) {
        console.error("Error fetching recent calls:", err);
      } finally {
        setCallsLoading(false);
      }
    };

    fetchAgent();
    fetchRecentCalls();
  }, [params.id]);

  const toggleAgentStatus = async () => {
    try {
      setUpdatingStatus(true);
      const newStatus = !agent.disabled;

      const response = await fetch(`/api/agents/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          disabled: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update agent status");
      }

      // Update local state
      setAgent({
        ...agent,
        disabled: newStatus,
      });

      setToggleDisableDialog(false);
    } catch (err: any) {
      console.error("Error updating agent status:", err);
      // You could show an error toast here
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-foreground flex">
        <DashboardSidebar />
        <main className="flex-1 h-fit max-h-screen overflow-y-auto bg-background">
          <DashboardHeader />
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="max-w-5xl mx-auto">
              <Skeleton className="h-8 w-32 mb-8" />
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-10 w-56" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-40 mb-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-foreground flex">
        <DashboardSidebar />
        <main className="flex-1 h-fit max-h-screen overflow-y-auto bg-background">
          <DashboardHeader />
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="max-w-5xl mx-auto">
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => router.push("/dashboard/agents")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Agents
              </Button>

              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Error Loading Agent
                  </CardTitle>
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
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground flex">
      <DashboardSidebar />

      <main className="flex-1 h-fit max-h-screen overflow-y-auto bg-background">
        <DashboardHeader />

        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => router.push("/dashboard/agents")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Agents
            </Button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{agent.name}</h1>
                  {agent.disabled && (
                    <Badge variant="outline" className="text-muted-foreground border-muted-foreground mt-1">
                      Disabled
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={agent.disabled ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setToggleDisableDialog(true)}
                >
                  <Settings className="h-4 w-4" />
                  {agent.disabled ? "Enable Agent" : "Disable Agent"}
                </Button>

                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => router.push(`/dashboard/agents/${params.id}/edit`)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>

                <Button
                  className="gap-2"
                  onClick={() => router.push(`/dashboard/calls/new?agent=${params.id}`)}
                >
                  <Phone className="h-4 w-4" />
                  Make Call
                </Button>
              </div>
            </div>

            {agent.description && (
              <Card className="mb-6">
                <CardHeader>
                  <h1 className='text-xl font-bold'>Agent Description</h1>
                </CardHeader>
                <CardContent className="">
                  <p className="text-muted-foreground">{agent.description}</p>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="overview">
              <TabsList className="mb-6">
                <TabsTrigger value="overview" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="conversations" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Conversations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{agent.usage_minutes.toFixed(1)} minutes</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Last Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {agent.last_called_at
                          ? formatDistanceToNow(new Date(agent.last_called_at), { addSuffix: true })
                          : "Never"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Voice</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Volume2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-lg font-semibold truncate">{agent.voiceName}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <List className="h-5 w-5 text-primary" />
                      Recent Calls
                    </CardTitle>
                    <CardDescription>The most recent calls made with this agent</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {callsLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex justify-between items-center">
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-8 w-20" />
                          </div>
                        ))}
                      </div>
                    ) : recentCalls.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No calls have been made with this agent yet</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => router.push(`/dashboard/calls/new?agent=${params.id}`)}
                        >
                          Make First Call
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentCalls.map((call) => (
                          <div key={call.id} className="flex justify-between items-center border-b pb-4">
                            <div>
                              <div className="font-medium">
                                {call.contactName || call.phoneNumber}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(call.startTime), "MMM d, yyyy 'at' h:mm a")}
                                {call.duration > 0 && ` • ${Math.round(call.duration / 60)} mins`}
                              </div>
                            </div>
                            <Badge
                              variant={
                                call.status === "completed" ? "default" :
                                  call.status === "failed" ? "destructive" : "outline"
                              }
                            >
                              {call.status}
                            </Badge>
                          </div>
                        ))}

                        <div className="pt-2 text-center">
                          <Button
                            variant="link"
                            onClick={() => router.push(`/dashboard/calls?agent=${params.id}`)}
                          >
                            View All Calls
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Conversation Configuration
                    </CardTitle>
                    <CardDescription>How your agent interacts with callers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">First Message</h3>
                      <div className="p-4 bg-muted/50 rounded-md">
                        {agent.conversation_config?.first_message || "No first message configured"}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">System Prompt</h3>
                      <div className="p-4 bg-muted/50 rounded-md whitespace-pre-wrap">
                        {agent.conversation_config?.system_prompt || "No system prompt configured"}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-6">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => router.push(`/dashboard/agents/${params.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Configuration
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      Tools & Capabilities
                    </CardTitle>
                    <CardDescription>Tools available to this agent during conversations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* System Tools */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">System Tools (Always Active)</h3>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">End Call - Automatically ends calls when appropriate</span>
                        </div>
                      </div>
                    </div>

                    {/* User Tools */}
                    {agent.tools && agent.tools.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Additional Tools</h3>
                        <div className="space-y-2">
                          {agent.tools.map((tool: string) => (
                            <div key={tool} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm capitalize">{tool}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!agent.tools || agent.tools.length === 0) && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Additional Tools</h3>
                        <p className="text-sm text-muted-foreground italic">No additional tools configured</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 border border-destructive/30 rounded-md">
                      <div>
                        <h3 className="font-medium">Delete this agent</h3>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete this agent and all associated data
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => router.push(`/dashboard/agents/${params.id}/edit`)}
                      >
                        Delete Agent
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="conversations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Conversation History</CardTitle>
                    <CardDescription>
                      View past conversations with this agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-10 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Conversation history coming soon</p>
                      <p className="text-sm mt-1">
                        This feature will allow you to review past conversations
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <AlertDialog open={toggleDisableDialog} onOpenChange={setToggleDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {agent.disabled ? "Enable Agent?" : "Disable Agent?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {agent.disabled
                ? "This will make the agent available for calls again."
                : "This will prevent the agent from making or receiving any calls."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updatingStatus}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                toggleAgentStatus();
              }}
              disabled={updatingStatus}
            >
              {updatingStatus ? "Updating..." : (agent.disabled ? "Enable Agent" : "Disable Agent")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
