"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Radio,
  Plus,
  PhoneCall,
  Wallet,
  Sparkles,
  CheckCheck,
  Command,
  Gauge,
  BarChart3,
  Home,
  Layers
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletDisplay } from "./wallet-display";

// Mock notifications - would be fetched from API in a real implementation
const notifications = [
  {
    id: 4,
    title: "New AI model available",
    message: "Our enhanced conversation model is now available for your agents.",
    time: "3 days ago",
    read: true,
    type: "update",
    icon: <Sparkles className="h-5 w-5 text-primary" />
  }
];

// Quick actions menu for the plus button
const quickActions = [
  {
    label: "Create new agent",
    icon: <Radio className="h-4 w-4 text-primary" />,
    description: "Design a new voice agent with custom settings",
    href: "/dashboard/new-agent"
  },
  {
    label: "Make a call",
    icon: <PhoneCall className="h-4 w-4 text-primary" />,
    description: "Initiate a call with one of your agents",
    href: "/dashboard/calls"
  },
  {
    label: "Add contacts",
    icon: <User className="h-4 w-4 text-primary" />,
    description: "Import or add new contacts for outreach",
    href: "/dashboard/contacts"
  },

];

// Notification badge that shows the count
const NotificationBadge = ({ count }: { count: number }) => (
  count > 0 ? (
    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
      <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
        {count > 9 ? '9+' : count}
      </span>
    </div>
  ) : null
);

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch data for search
  const { data: agentsData } = useSWR<{ agents: any[] }>(
    searchValue.length > 2 ? `/api/agents?search=${searchValue}` : null,
    fetcher
  );

  const { data: contactsData } = useSWR<{ contacts: any[] }>(
    searchValue.length > 2 ? `/api/contacts?search=${searchValue}` : null,
    fetcher
  );

  // Effect for closing search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add scroll effect for header appearance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command+K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchFocused(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Animation variants for search results
  const searchVariants = {
    hidden: { opacity: 0, y: -10, height: 0 },
    visible: { opacity: 1, y: 0, height: 'auto' },
  };

  // Get the number of unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Function to get notification background color based on type
  const getNotificationBg = (type: string, read: boolean) => {
    const base = read ? 'bg-muted/50' : 'bg-muted/80';

    switch (type) {
      case 'success': return cn(base, 'border-success/20');
      case 'warning': return cn(base, 'border-warning/20');
      case 'info': return cn(base, 'border-info/20');
      case 'update': return cn(base, 'border-primary/20');
      default: return 'bg-muted/50';
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/40 bg-background/95 backdrop-blur-xl"
          : "border-b border-transparent bg-background/5 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and navigation section */}


        {/* Search section */}
        <div className={cn(
          "relative transition-all duration-300 max-w-xl",
          searchFocused ? 'z-50 w-full mx-4' : 'w-96',
          searchFocused ? 'flex-1' : ''
        )}>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between border-border/30 text-muted-foreground pl-4 pr-2 h-9",
              searchFocused ? "rounded-b-none border-primary/30 bg-background" : "bg-muted/10",
              scrolled ? "bg-muted/20" : ""
            )}
            onClick={() => setSearchFocused(true)}
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              <span className="text-sm">Search anything...</span>
            </div>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium md:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <AnimatePresence>
            {searchFocused && (
              <motion.div
                ref={searchResultsRef}
                className="absolute left-0 right-0 mt-0 bg-background border border-t-0 border-primary/20 rounded-b-lg shadow-xl overflow-hidden z-20"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={searchVariants}
              >
                <div className="p-3 border-b border-border">
                  <Input
                    ref={searchInputRef}
                    placeholder="Type to search..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="h-9 border-muted bg-background/50 focus-visible:ring-1 focus-visible:ring-offset-0"
                    autoFocus
                  />
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                  {searchValue.length > 2 ? (
                    <div className="divide-y divide-border">
                      {/* Agents results */}
                      <div className="p-2">
                        <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">AGENTS</div>
                        <div className="space-y-1">
                          {agentsData?.agents && agentsData.agents.length > 0 ? (
                            agentsData.agents.slice(0, 3).map((agent) => (
                              <button
                                key={agent.agent_id}
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm flex items-start gap-3 transition-colors"
                                onClick={() => {
                                  setSearchFocused(false);
                                  router.push(`/dashboard/agents/${agent.agent_id}`);
                                }}
                              >
                                <div className="rounded-full h-6 w-6 bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Radio className="h-3 w-3 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">{agent.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {agent.disabled ? "Paused" : "Active"} • {agent.usage_minutes || 0} min used
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              No agents found
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contacts results */}
                      <div className="p-2">
                        <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">CONTACTS</div>
                        <div className="space-y-1">
                          {contactsData?.contacts && contactsData.contacts.length > 0 ? (
                            contactsData.contacts.slice(0, 3).map((contact) => (
                              <button
                                key={contact._id}
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm flex items-start gap-3 transition-colors"
                                onClick={() => {
                                  setSearchFocused(false);
                                  router.push(`/dashboard/contacts/${contact._id}`);
                                }}
                              >
                                <div className="rounded-full h-6 w-6 bg-secondary/10 flex items-center justify-center flex-shrink-0">
                                  <User className="h-3 w-3 text-secondary" />
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">{contact.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {contact.phoneNumber} • {contact.company || 'No company'}
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              No contacts found
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      <Search className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                      Type at least 3 characters to search...
                    </div>
                  )}
                </div>

                <div className="p-2 border-t border-border bg-muted/30">
                  <Button variant="ghost" className="w-full justify-between text-xs h-8">
                    <span>Press <kbd className="bg-muted/70 rounded px-1.5 py-0.5 mx-1">↵</kbd> to see all results</span>
                    <span className="text-muted-foreground">ESC to close</span>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions section */}
        <div className="flex items-center gap-1 md:gap-2">
          <WalletDisplay />

          <TooltipProvider>

            <DropdownMenu open={quickActionsOpen} onOpenChange={setQuickActionsOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={quickActionsOpen ? "secondary" : "ghost"}
                      size="icon"
                      className={cn(
                        "h-9 w-9 rounded-full bg-background border border-border/30",
                        quickActionsOpen && "bg-primary/10 border-primary/30"
                      )}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Quick Actions</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1.5">
                  Create New
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                {quickActions.map((action, i) => (
                  <DropdownMenuItem
                    key={i}
                    className="cursor-pointer py-2.5 px-2 focus:bg-muted rounded-md"
                    onClick={() => {
                      setQuickActionsOpen(false);
                      router.push(action.href);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-md h-8 w-8 bg-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/10">
                        {action.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">{action.label}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={notificationsOpen ? "secondary" : "ghost"}
                      size="icon"
                      className={cn(
                        "h-9 w-9 rounded-full relative bg-background border border-border/30",
                        notificationsOpen && "bg-primary/10 border-primary/30"
                      )}
                    >
                      <Bell className="h-3.5 w-3.5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
                          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary opacity-50"></span>
                          <span className="relative rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Notifications</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-96 p-0 backdrop-blur-md">
                <div className="p-4 border-b border-border/80">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-base">Notifications</h3>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto py-2">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "px-4 py-3 mx-2 my-1 rounded-lg cursor-pointer",
                          getNotificationBg(notification.type, notification.read),
                          notification.read ? "opacity-80" : "",
                          "border hover:bg-muted/30 transition-colors"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 rounded-full bg-muted/40 items-center justify-center flex-shrink-0 border border-border/60">
                            {notification.icon}
                          </div>
                          <div>
                            <p className="font-medium text-sm flex items-center gap-2 text-foreground">
                              {notification.title}
                              {!notification.read && (
                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                              )}
                            </p>
                            <p className="text-sm text-foreground/80 mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <div className="rounded-full h-12 w-12 bg-muted/50 flex items-center justify-center mx-auto mb-2">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">No notifications yet</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">We'll notify you when something happens</p>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-border/80 bg-muted/30">
                  <Link href="/dashboard/notifications" className="w-full block">
                    <Button variant="ghost" className="w-full justify-center text-xs h-9 hover:bg-muted">
                      View all notifications
                    </Button>
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 rounded-full px-2 hover:bg-muted/30 ml-1 h-9 border border-border/30 bg-background"
                >
                  <Avatar className="h-7 w-7 border border-border/50 ring-2 ring-background">
                    <AvatarImage src="/avatars/user.jpg" alt="User avatar" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-medium text-foreground">{user?.name || 'User'}</p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <div className="px-3 py-2 -mx-2 -mt-2 bg-muted/30 rounded-t-md mb-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{user?.name || 'User'}</span>
                    <span className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</span>
                    <Badge variant="outline" className="mt-2 bg-primary/10 text-primary text-[10px] border-primary/20 w-fit">
                      {user?.plan || 'Free'} Plan
                    </Badge>
                  </div>
                </div>
                <Link href='/dashboard/profile'>
                  <DropdownMenuItem className="cursor-pointer focus:bg-muted rounded-md h-9">
                    <User className="mr-2 h-4 w-4" />
                    <span className="text-sm">Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href='/dashboard/settings'>
                  <DropdownMenuItem className="cursor-pointer focus:bg-muted rounded-md h-9">
                    <Settings className="mr-2 h-4 w-4" />
                    <span className="text-sm">Settings</span>
                  </DropdownMenuItem>
                </Link>
                <Link href='/dashboard/billing'>
                  <DropdownMenuItem className="cursor-pointer focus:bg-muted rounded-md h-9">
                    <Gauge className="mr-2 h-4 w-4" />
                    <span className="text-sm">Usage & Billing</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="cursor-pointer focus:bg-muted rounded-md h-9">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span className="text-sm">Help & Support</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer focus:bg-destructive/10 text-destructive hover:text-destructive rounded-md h-9"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="text-sm">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
