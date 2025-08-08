"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/contexts/AuthContext";

import {
  LayoutDashboard, PhoneCall, Users, BarChart,
  Settings, HelpCircle, LogOut, ChevronLeft,
  Menu, Plus, Contact, Shield,
  Megaphone
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // live agent count
  const { data: agentsData } = useSWR<{ agents: any[] }>("/api/agents", fetcher);
  const agentCount = agentsData?.agents?.length ?? 0;

  // Active calls
  const { data: callsData } = useSWR<{ calls: any[], pagination: any }>("/api/calls?status=in-progress", fetcher);
  const activeCallCount = callsData?.calls?.length ?? 0;

  const navItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      href: "/dashboard"
    },
    {
      icon: <PhoneCall className="h-5 w-5" />,
      label: "Calls",
      href: "/dashboard/calls",
      badge: activeCallCount > 0 ? activeCallCount : undefined
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Agents",
      href: "/dashboard/agents",
      badge: agentCount,
    },
    {
      icon: <Contact className="h-5 w-5" />,
      label: "Contacts",
      href: "/dashboard/contacts"
    },
    {
      icon: <Megaphone className="h-5 w-5" />,
      label: "Campaigns",
      href: "/dashboard/campaigns"
    },
    {
      icon: <BarChart className="h-5 w-5" />,
      label: "Analytics",
      href: "/dashboard/analytics"
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/dashboard/settings"
    },
  ];

  /* ---------- local handlers ---------- */
  const toggleSidebar = () => setCollapsed(!collapsed);
  const toggleMobileSidebar = () => setMobileOpen(!mobileOpen);
  const handleLogout = () => {
    logout();
  };

  /* ---------- render ---------- */
  return (
    <>
      {/* mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleMobileSidebar}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed h-screen top-0 left-0 bg-sidebar border-r border-sidebar-border z-50",
          "transition-all duration-300 flex flex-col",
          "md:relative md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* logo + collapse btn */}
        <div className={cn(
          "flex items-center px-4 h-16 border-b border-sidebar-border/50",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image src="/Wow.png" alt="Wow AI" fill className="object-contain" />
            </div>
            {!collapsed && <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-sidebar-primary to-sidebar-primary/70">Wow AI</span>}
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:flex text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <ChevronLeft className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {/* nav section - this is where we need to adjust spacing */}
        <div className="flex-1 flex flex-col min-h-0">
          {collapsed ? (
            // When collapsed, use a direct flex layout with justify-between to distribute items
            <div className="flex-1 flex flex-col justify-evenly py-6 px-2">
              {navItems.map(({ icon, label, href, badge }) => {
                const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                return (
                  <TooltipProvider key={href} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={href}
                          onClick={() => setMobileOpen(false)}
                          className="flex justify-center mb-2"
                        >
                          <Button
                            variant="ghost"
                            className={cn(
                              "justify-center px-2 relative py-2 h-auto w-14",
                              active
                                ? "bg-sidebar-accent/20 text-sidebar-accent-foreground"
                                : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/10"
                            )}
                          >
                            {icon}
                            {badge !== undefined && (
                              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                                {typeof badge === 'number' && badge > 9 ? '9+' : badge}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{label}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          ) : (
            // When expanded, use ScrollArea with regular spacing
            <ScrollArea className="flex-1 h-full">
              <nav className="py-6 px-2 space-y-1">
                {navItems.map(({ icon, label, href, badge }) => {
                  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="block"
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 px-3 py-2 h-auto",
                          active
                            ? "bg-sidebar-accent/20 text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/10"
                        )}
                      >
                        <div className="flex items-center gap-3 relative">
                          {icon}
                          <span>{label}</span>
                          {badge !== undefined && (
                            <Badge className="ml-auto bg-sidebar-primary/20 text-sidebar-primary border-sidebar-primary/20">
                              {badge}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </ScrollArea>
          )}
        </div>

        {/* footer */}
        <div className={cn(
          "p-4 border-t border-sidebar-border/50",
          collapsed && "flex flex-col items-center"
        )}>
          <Link href="/dashboard/new-agent" onClick={() => setMobileOpen(false)}>
            <Button
              className={cn(
                "bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground",
                "w-full shadow-sm",
                collapsed && "px-0 justify-center"
              )}
            >
              <Plus className="h-5 w-5 " />
              {!collapsed && <span>New Agent</span>}
            </Button>
          </Link>

          <div className="mt-6 flex flex-col gap-2">
            <TooltipProvider delayDuration={collapsed ? 100 : 1000}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      collapsed ? "justify-center" : "justify-start",
                      "px-3 py-2 h-auto text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/10"
                    )}
                    asChild
                  >
                    <Link href="/dashboard/support">
                      <HelpCircle className="h-5 w-5 mr-2" />
                      {!collapsed && <span>Help & Support</span>}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">Help & Support</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={collapsed ? 100 : 1000}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      collapsed ? "justify-center" : "justify-start",
                      "px-3 py-2 h-auto text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    )}
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    {!collapsed && <span>Log Out</span>}
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">Log Out</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          </div>

          {!collapsed && (
            <div className="mt-6 pt-4 border-t border-sidebar-border/50">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-sidebar-primary" />
                <span className="text-xs font-medium text-sidebar-foreground/90">Wow AI</span>
              </div>
              <p className="text-[11px] text-sidebar-foreground/60 mt-1.5">
                Version {process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
