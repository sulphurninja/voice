"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Phone,
  Plus,
  Settings,
  BarChart,
  Clock,
  Volume2,
  Pencil,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Agent = {
  agent_id: string;
  name: string;
  description: string;
  disabled: boolean;
  voice_id: string;
  voiceName: string;
  usage_minutes: number;
  last_called_at: string | null;
  conversation_config: {
    first_message: string;
    system_prompt: string;
  };
};

export default function AgentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);
  const [deletingAgent, setDeletingAgent] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/agents");

        if (!response.ok) {
          throw new Error("Failed to fetch agents");
        }

        const data = await response.json();
        setAgents(data.agents || []);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching agents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const handleDeleteAgent = async (agentId: string) => {
    try {
      setDeletingAgent(true);
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete agent");
      }

      // Remove the deleted agent from the state
      setAgents(prev => prev.filter(agent => agent.agent_id !== agentId));
      setAgentToDelete(null);
    } catch (err: any) {
      console.error("Error deleting agent:", err);
      // Handle error state/notification in a real app
    } finally {
      setDeletingAgent(false);
    }
  };

  // Animation variants
  const containerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen text-foreground flex">
      <DashboardSidebar />
      <main className="flex-1 h-fit max-h-screen overflow-y-auto bg-background">
        <DashboardHeader />

        <div className=" mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Voice Agents</h1>
              <p className="text-muted-foreground mt-1">
                Manage your AI voice agents for phone calls and conversations
              </p>
            </div>
            <Button
              onClick={() => router.push('/dashboard/new-agent')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Agent
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex justify-between w-full">
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error Loading Agents</CardTitle>
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
          ) : agents.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>No Voice Agents Yet</CardTitle>
                <CardDescription>
                  Create your first AI voice agent to start making phone calls
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Bot className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground max-w-md mb-6">
                  Voice agents use AI to have natural phone conversations with your customers, leads,
                  or users. They can handle calls, qualify leads, provide support, and more.
                </p>
                <Button
                  onClick={() => router.push('/dashboard/new-agent')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Agent
                </Button>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariant}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {agents.map((agent) => (
                <motion.div key={agent.agent_id} variants={itemVariant}>
                  <Card className={cn(
                    "overflow-hidden h-full flex flex-col border-2 hover:shadow-md transition-shadow",
                    agent.disabled ? "border-muted bg-muted/20" : "border-border"
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{agent.name}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/agents/${agent.agent_id}/edit`)}
                              className="cursor-pointer"
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Agent
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => setAgentToDelete(agent.agent_id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Agent
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {agent.description && (
                        <CardDescription className="line-clamp-2">
                          {agent.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Volume2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Voice: {agent.voiceName.slice(0, 18)}...</p>
                          {agent.disabled && (
                            <Badge variant="outline" className="text-muted-foreground border-muted-foreground">
                              Disabled
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4 text-sm ml-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {agent.last_called_at
                              ? `Last used ${formatDistanceToNow(new Date(agent.last_called_at))} ago`
                              : "Never used"}
                          </span>
                        </div>

                        {/* <div className="flex items-center gap-2">
                          <BarChart className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {agent.usage_minutes.toFixed(1)} minutes used
                          </span>
                        </div> */}
                      </div>
                    </CardContent>

                    <CardFooter className="border-t pt-4 flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => router.push(`/dashboard/agents/${agent.agent_id}`)}
                      >
                        <Settings className="h-4 w-4" />
                        Manage
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2"
                        onClick={() => router.push(`/dashboard/calls/new?agent=${agent.agent_id}`)}
                      >
                        <Phone className="h-4 w-4" />
                        Make Call
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
      <AlertDialog open={!!agentToDelete} onOpenChange={(open) => !open && setAgentToDelete(null)}>
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
                if (agentToDelete) {
                  handleDeleteAgent(agentToDelete);
                }
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
