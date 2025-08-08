"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  CalendarIcon,
  Download,
  Filter,
  Phone,
  Search,
  ChevronRight,
  MoreHorizontal,
  PlayCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  FileText,
  Mic,
  VolumeX,
  Info,
  X,
  PhoneCall,
  PhoneOff,
  ArrowDownToLine,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Pause,
  Volume2,
  Volume1,
  VolumeX as VolumeMute,
  RotateCcw,
  RotateCw,
  Star,
  Sparkles,
  Award,
  Gauge,
  BadgeCheck,
  BadgeMinus,
  BadgeX,
  HandshakeIcon,
  TimerReset,
  HandCoins,
  ShieldAlert,
  Siren,
  CircleCheck,
  CircleOff,
  CircleAlert,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CircleDollarSign,
  Briefcase,
  CalendarCheck
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { string } from "zod";

// Call type definition for history
type Call = {
  _id: string;
  contactName: string;
  phoneNumber: string;
  status: 'completed' | 'failed' | 'in-progress' | 'queued' | 'initiated' | 'no-answer';
  startTime?: string;
  endTime?: string;
  duration?: number;
  agentId: string;
  agentName?: string;
  transcription?: string;
  summary?: string;
  notes?: string;
  cost?: number;
  callType?: string;
  createdAt: string;
  conversationId?: string;
  outcome?: string; // Can be any of the professional outcome types
};

// Define professional outcome types and their properties
const outcomeTypes = {
  "highly_interested": {
    icon: <Sparkles className="h-3 w-3 mr-1" />,
    label: "Highly Interested",
    color: "bg-success/10 text-success border-success/20"
  },
  "interested": {
    icon: <ThumbsUp className="h-3 w-3 mr-1" />,
    label: "Interested",
    color: "bg-success/10 text-success border-success/20"
  },
  "qualified_lead": {
    icon: <BadgeCheck className="h-3 w-3 mr-1" />,
    label: "Qualified Lead",
    color: "bg-success/10 text-success border-success/20"
  },
  "appointment_scheduled": {
    icon: <CalendarCheck className="h-3 w-3 mr-1" />,
    label: "Appointment Set",
    color: "bg-success/10 text-success border-success/20"
  },
  "opportunity_created": {
    icon: <CircleDollarSign className="h-3 w-3 mr-1" />,
    label: "Opportunity Created",
    color: "bg-success/10 text-success border-success/20"
  },
  "needs_follow_up": {
    icon: <RotateCw className="h-3 w-3 mr-1" />,
    label: "Needs Follow-up",
    color: "bg-warning/10 text-warning border-warning/20"
  },
  "considering": {
    icon: <CircleAlert className="h-3 w-3 mr-1" />,
    label: "Considering",
    color: "bg-secondary/10 text-secondary border-secondary/20"
  },
  "neutral": {
    icon: <BadgeMinus className="h-3 w-3 mr-1" />,
    label: "Neutral Response",
    color: "bg-secondary/10 text-secondary border-secondary/20"
  },
  "more_information_requested": {
    icon: <Info className="h-3 w-3 mr-1" />,
    label: "Info Requested",
    color: "bg-secondary/10 text-secondary border-secondary/20"
  },
  "call_back_later": {
    icon: <TimerReset className="h-3 w-3 mr-1" />,
    label: "Call Back Later",
    color: "bg-secondary/10 text-secondary border-secondary/20"
  },
  "not_interested": {
    icon: <ThumbsDown className="h-3 w-3 mr-1" />,
    label: "Not Interested",
    color: "bg-destructive/10 text-destructive border-destructive/20"
  },
  "do_not_call": {
    icon: <PhoneOff className="h-3 w-3 mr-1" />,
    label: "Do Not Call",
    color: "bg-destructive/10 text-destructive border-destructive/20"
  },
  "unqualified": {
    icon: <BadgeX className="h-3 w-3 mr-1" />,
    label: "Unqualified",
    color: "bg-destructive/10 text-destructive border-destructive/20"
  },
  "wrong_number": {
    icon: <XCircle className="h-3 w-3 mr-1" />,
    label: "Wrong Number",
    color: "bg-destructive/10 text-destructive border-destructive/20"
  },
  "complaint": {
    icon: <ShieldAlert className="h-3 w-3 mr-1" />,
    label: "Complaint Received",
    color: "bg-destructive/10 text-destructive border-destructive/20"
  },
};

export default function CallHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch calls with filters
  useEffect(() => {
    fetchCalls();
  }, [currentPage, searchTerm, statusFilter, dateRange]);

  // Handle audio events
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleTimeUpdate = () => setAudioTime(audioElement.currentTime);
    const handleDurationChange = () => setAudioDuration(audioElement.duration);
    const handleEnded = () => setIsPlaying(false);

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('durationchange', handleDurationChange);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('durationchange', handleDurationChange);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [selectedCall]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      let url = `/api/calls?page=${currentPage}&limit=20`;

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      if (statusFilter) {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }

      if (dateRange?.from) {
        url += `&startDate=${encodeURIComponent(dateRange.from.toISOString())}`;
        if (dateRange.to) {
          url += `&endDate=${encodeURIComponent(dateRange.to.toISOString())}`;
        }
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch calls");
      }

      const data = await response.json();
      setCalls(data.calls);
      setTotalPages(data.pagination.pages);

    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching calls:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCalls = async () => {
    try {
      setIsExporting(true);

      let url = `/api/calls/export`;

      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }

      if (statusFilter) {
        url += `${url.includes('?') ? '&' : '?'}status=${encodeURIComponent(statusFilter)}`;
      }

      if (dateRange?.from) {
        url += `${url.includes('?') ? '&' : '?'}startDate=${encodeURIComponent(dateRange.from.toISOString())}`;
        if (dateRange.to) {
          url += `&endDate=${encodeURIComponent(dateRange.to.toISOString())}`;
        }
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to export calls");
      }

      // Create download link
      const blob = await response.blob();
      const url2 = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url2;
      a.download = `call_history_${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

    } catch (error: any) {
      console.error("Error exporting calls:", error);
      alert("Failed to export calls");
    } finally {
      setIsExporting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
    setDateRange(undefined);
  };

  // Audio player functions
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setAudioTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setAudioVolume(value[0]);
  };

  const handleRewind = () => {
    if (audioRef.current) {
      const newTime = Math.max(0, audioRef.current.currentTime - 10);
      audioRef.current.currentTime = newTime;
      setAudioTime(newTime);
    }
  };

  const handleForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(audioDuration, audioRef.current.currentTime + 10);
      audioRef.current.currentTime = newTime;
      setAudioTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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

  const getOutcomeBadge = (outcome?: string) => {
    if (!outcome) return null;

    // Normalize outcome string (remove spaces, lowercase)
    const normalizedOutcome = outcome.toLowerCase().replace(/\s+/g, '_');

    // Try to match with our predefined outcomes
    const matchedOutcome = Object.entries(outcomeTypes).find(([key]) =>
      key === normalizedOutcome || key.includes(normalizedOutcome) || normalizedOutcome.includes(key)
    );

    if (matchedOutcome) {
      const [key, config] = matchedOutcome;
      return (
        <Badge className={config.color}>
          {config.icon} {config.label}
        </Badge>
      );
    }

    // Fallback for custom outcomes
    return (
      <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
        <Info className="h-3 w-3 mr-1" /> {outcome}
      </Badge>
    );
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

        <div className="container mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
            className="mb-8"
          >
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Call History</h1>
                <p className="text-muted-foreground mt-1">
                  Complete record of all AI voice calls
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportCalls}
                  disabled={isExporting}
                  className="gap-2"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowDownToLine className="h-4 w-4" />
                  )}
                  Export
                </Button>

                <Button
                  onClick={() => router.push('/dashboard/calls/new')}
                  className="gap-2"
                >
                  <Phone className="h-4 w-4" />
                  New Call
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Filters and search */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
            className="mb-6"
          >
            <Card className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by contact or phone..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={statusFilter || ""} onValueChange={val => setStatusFilter(val || null)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="queued">Queued</SelectItem>
                    <SelectItem value="no-answer">No Answer</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex-shrink-0">
                  <DateRangePicker date={dateRange} setDate={setDateRange} />
                </div>

                {(searchTerm || statusFilter || dateRange?.from) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear filters
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Calls Table */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
          >
            <Card>
              {loading ? (
                <CardContent className="p-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex gap-4 items-center py-4 border-b last:border-0">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  ))}
                </CardContent>
              ) : error ? (
                <CardContent className="p-6">
                  <div className="text-center py-6">
                    <div className="rounded-full bg-destructive/10 p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Error Loading Calls</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => fetchCalls()}>Retry</Button>
                  </div>
                </CardContent>
              ) : calls.length === 0 ? (
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <div className="rounded-full bg-muted p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <PhoneOff className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No calls found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {searchTerm || statusFilter || dateRange?.from
                        ? "Try adjusting your search filters"
                        : "You haven't made any AI voice calls yet"}
                    </p>
                    {searchTerm || statusFilter || dateRange?.from ? (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    ) : (
                      <Button onClick={() => router.push('/dashboard/calls/new')}>
                        <Phone className="h-4 w-4 mr-2" />
                        Make Your First Call
                      </Button>
                    )}
                  </div>
                </CardContent>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contact</TableHead>
                        <TableHead className="hidden md:table-cell">Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Outcome</TableHead>
                        <TableHead className="hidden md:table-cell">Agent</TableHead>
                        <TableHead className="hidden lg:table-cell">Date & Time</TableHead>
                        <TableHead className="hidden lg:table-cell">Duration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calls.map(call => (
                        <TableRow key={call._id} className="cursor-pointer" onClick={() => setSelectedCall(call)}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {call.contactName?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{call.contactName || "Unknown"}</div>
                                <div className="text-xs text-muted-foreground md:hidden">
                                  {call.phoneNumber}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {call.phoneNumber}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(call.status)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {call.outcome ? getOutcomeBadge(call.outcome) : "-"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {call.agentName || "-"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {call.startTime ? format(new Date(call.startTime), "MMM d, h:mm a") : "-"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {call.duration ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCall(call);
                                }}>
                                  <Info className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Navigate to make a new call with same contact info
                                    router.push(`/dashboard/calls/new?phone=${call.phoneNumber}&name=${encodeURIComponent(call.contactName || 'Unknown')}&agent=${call.agentId}`);
                                  }}
                                >
                                  <Phone className="h-4 w-4 mr-2" />
                                  Call Again
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="py-4 border-t">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>

                          {Array.from({ length: totalPages }).map((_, i) => {
                            const page = i + 1;
                            // Only show first, last, current, and adjacent pages
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    isActive={page === currentPage}
                                    onClick={() => setCurrentPage(page)}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            } else if (
                              (page === 2 && currentPage > 3) ||
                              (page === totalPages - 1 && currentPage < totalPages - 2)
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }
                            return null;
                          })}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Card>
          </motion.div>
        </div>
      </main>
      {/* Call Details Dialog */}
      <Dialog open={!!selectedCall} onOpenChange={(open) => !open && setSelectedCall(null)}>
        <DialogContent className="sm:max-w-[600px] scrollbar-hidden h-fit max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
            <DialogDescription>
              Complete information about this call
            </DialogDescription>
          </DialogHeader>

          {selectedCall && (
            <div className="space-y-6 py-2">
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
                <div className="ml-auto">
                  {getStatusBadge(selectedCall.status)}
                </div>
              </div>

              {/* Call Outcome Card */}
              {selectedCall.outcome && (
                <Card className="bg-card/30 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Call Outcome</p>
                        <div className="flex items-center">
                          {getOutcomeBadge(selectedCall.outcome)}
                        </div>
                      </div>

                      {/* Visual indicator based on outcome */}
                      <div className="flex-shrink-0">
                        {selectedCall.outcome && (
                          <div className={cn(
                            "rounded-full w-12 h-12 flex items-center justify-center",
                            selectedCall.outcome.toLowerCase().includes("interest") ||
                            selectedCall.outcome.toLowerCase().includes("qualified") ||
                            selectedCall.outcome.toLowerCase().includes("appointment") ||
                            selectedCall.outcome.toLowerCase().includes("opportunity")
                              ? "bg-success/10"
                              : selectedCall.outcome.toLowerCase().includes("not_") ||
                                selectedCall.outcome.toLowerCase().includes("unqualified") ||
                                selectedCall.outcome.toLowerCase().includes("wrong") ||
                                selectedCall.outcome.toLowerCase().includes("do_not")
                                ? "bg-destructive/10"
                                : "bg-secondary/10"
                          )}>
                            {selectedCall.outcome.toLowerCase().includes("interest") ||
                             selectedCall.outcome.toLowerCase().includes("qualified") ||
                             selectedCall.outcome.toLowerCase().includes("appointment") ||
                             selectedCall.outcome.toLowerCase().includes("opportunity")
                              ? <ThumbsUp className="h-6 w-6 text-success" />
                              : selectedCall.outcome.toLowerCase().includes("not_") ||
                                selectedCall.outcome.toLowerCase().includes("unqualified") ||
                                selectedCall.outcome.toLowerCase().includes("wrong") ||
                                selectedCall.outcome.toLowerCase().includes("do_not")
                                ? <ThumbsDown className="h-6 w-6 text-destructive" />
                                : <Info className="h-6 w-6 text-secondary" />
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Agent</p>
                  <p className="font-medium text-sm">{selectedCall.agentName || "—"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Call Type</p>
                  <p className="text-sm">{selectedCall.callType || "Standard"}</p>
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
                  <p className="text-xs text-muted-foreground">End Time</p>
                  <p className="text-sm">
                    {selectedCall.endTime
                      ? format(new Date(selectedCall.endTime), "MMM d, yyyy h:mm a")
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


              </div>

              {selectedCall.notes && (
                <div className="space-y-1 pt-2">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {selectedCall.notes}
                  </div>
                </div>
              )}

              <Tabs defaultValue="transcript" className="space-y-4">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="recording">Recording</TabsTrigger>
                </TabsList>

                <TabsContent value="transcript">
                  {selectedCall.transcription ? (
                    <ScrollArea className="h-[240px]">
                      <div className="p-3 bg-muted/30 rounded-md space-y-4">
                        {selectedCall.transcription.split(/user:|agent:/).filter(Boolean).map((segment, index) => {
                          const speakerType = index % 2 === 0 ? "user" : "agent";
                          return (
                            <div key={index} className={cn("flex gap-3", speakerType === "user" ? "justify-end" : "justify-start")}>
                              {speakerType === "agent" && (
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Bot className="h-4 w-4 text-primary" />
                                </div>
                              )}
                              <div className={cn(
                                "rounded-2xl px-4 py-2 text-sm max-w-[80%]",
                                speakerType === "user" ? "bg-secondary text-secondary-foreground rounded-tr-none" : "bg-muted text-muted-foreground rounded-tl-none"
                              )}>
                                <p>{segment.trim()}</p>
                              </div>
                              {speakerType === "user" && (
                                <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center">
                                  <User className="h-4 w-4 text-secondary" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-muted-foreground text-sm">Transcript not available.</p>
                  )}
                </TabsContent>

                <TabsContent value="summary">
                  {selectedCall.summary ? (
                    <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                      {selectedCall.summary}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Summary not available.</p>
                  )}
                </TabsContent>

                <TabsContent value="recording">
                  {selectedCall.conversationId ? (
                    <div className="space-y-4">
                      {/* Hidden audio element for programmatic control */}
                      <audio
                        ref={audioRef}
                        src={`/api/audio/${encodeURIComponent(selectedCall.conversationId)}`}
                        preload="metadata"
                        className="hidden"
                      />

                      {/* Custom audio player UI */}
                      <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">
                            {formatTime(audioTime)} / {formatTime(audioDuration)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-background"
                              onClick={() => handleVolumeChange([audioVolume === 0 ? 0.8 : 0])}
                              title={audioVolume === 0 ? "Unmute" : "Mute"}
                            >
                              {audioVolume === 0 ? (
                                <VolumeMute className="h-4 w-4" />
                              ) : audioVolume < 0.5 ? (
                                <Volume1 className="h-4 w-4" />
                              ) : (
                                <Volume2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full">
                          <Slider
                            value={[audioTime]}
                            max={audioDuration || 100}
                            step={0.1}
                            onValueChange={handleTimeChange}
                            className="cursor-pointer"
                            aria-label="Playback progress"
                          />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-2 py-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full hover:bg-background"
                            onClick={handleRewind}
                            title="Rewind 10s"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-full bg-background hover:bg-background/80"
                            onClick={togglePlayPause}
                            title={isPlaying ? "Pause" : "Play"}
                          >
                            {isPlaying ? (
                              <Pause className="h-6 w-6" />
                            ) : (
                              <PlayCircle className="h-6 w-6" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full hover:bg-background"
                            onClick={handleForward}
                            title="Forward 10s"
                          >
                            <RotateCw className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Volume slider (collapsible) */}
                        <div className="flex items-center gap-3 px-1">
                          <div className="flex-shrink-0">
                            {audioVolume === 0 ? (
                              <VolumeMute className="h-4 w-4 text-muted-foreground" />
                            ) : audioVolume < 0.5 ? (
                              <Volume1 className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Volume2 className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <Slider
                            value={[audioVolume]}
                            max={1}
                            step={0.01}
                            onValueChange={handleVolumeChange}
                            className="cursor-pointer"
                            aria-label="Volume control"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 bg-muted/30 rounded-md">
                      <VolumeX className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-sm">Audio recording not available.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <DialogFooter className="flex flex-wrap gap-3 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push(`/dashboard/calls/new?phone=${selectedCall.phoneNumber}&name=${encodeURIComponent(selectedCall.contactName || 'Unknown')}&agent=${selectedCall.agentId}`);
                    setSelectedCall(null);
                  }}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Again
                </Button>
                <Button
                  variant="default"
                  onClick={() => setSelectedCall(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
