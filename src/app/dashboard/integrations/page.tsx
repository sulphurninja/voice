"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Filter,
  Settings,
  Building2,
  Home,
  MapPin,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Shield,
  Star,
  TrendingUp,
  Users,
  Globe,
  Puzzle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Download,
  Upload,
  Play,
  Pause,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share,
  BarChart3,
  Activity,
  Wifi,
  WifiOff,
  Crown,
  Sparkles,
  Target
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Integration categories
const categories = [
  { id: "all", label: "All Integrations", icon: <Globe className="h-4 w-4" /> },
  { id: "real-estate", label: "Real Estate", icon: <Building2 className="h-4 w-4" /> },
  { id: "crm", label: "CRM", icon: <Users className="h-4 w-4" /> },
  { id: "communication", label: "Communication", icon: <Zap className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
];

// Available integrations with detailed info
const availableIntegrations = [
  {
    id: "housing",
    name: "Housing.com",
    description: "Import property leads and listings from India's leading real estate platform",
    category: "real-estate",
    logo: "/integrations/housing-logo.png", // You'll need to add these
    rating: 4.8,
    installs: "12.5K+",
    isPremium: false,
    features: [
      "Automatic lead import",
      "Property listing sync",
      "Buyer inquiry management",
      "Real-time notifications",
      "Lead scoring & qualification"
    ],
    pricing: "Free",
    setupTime: "5 minutes",
    dataPoints: ["Contact Info", "Property Details", "Budget Range", "Preferences"],
    supportedPipelines: ["Sales", "Property Inquiry", "Buyer Journey"],
    apiEndpoint: "https://api.housing.com/v1",
    authType: "API Key",
    webhookSupport: true,
    batchImport: true,
    realTimeSync: true,
    leadVolume: "High",
    status: "available"
  },
  {
    id: "99acres",
    name: "99acres",
    description: "Connect with 99acres to import property leads and buyer inquiries across India",
    category: "real-estate",
    logo: "/integrations/99acres-logo.png",
    rating: 4.6,
    installs: "8.9K+",
    isPremium: false,
    features: [
      "Lead import from property listings",
      "Buyer-seller matching",
      "Location-based filtering",
      "Automated follow-ups",
      "Performance analytics"
    ],
    pricing: "Free",
    setupTime: "3 minutes",
    dataPoints: ["Contact Details", "Property Type", "Location", "Budget", "Timeline"],
    supportedPipelines: ["Real Estate Sales", "Property Management", "Rental Inquiries"],
    apiEndpoint: "https://api.99acres.com/v2",
    authType: "OAuth 2.0",
    webhookSupport: true,
    batchImport: true,
    realTimeSync: true,
    leadVolume: "Very High",
 status: "available"
  },
  {
    id: "magicbricks",
    name: "Magicbricks",
    description: "Integrate with India's #1 property portal to capture high-quality real estate leads",
    category: "real-estate",
    logo: "/integrations/magicbricks-logo.png",
    rating: 4.7,
    installs: "15.2K+",
    isPremium: true,
    features: [
      "Premium lead scoring",
      "Advanced property matching",
      "Geo-location targeting",
      "Smart lead distribution",
      "Conversion tracking",
      "Custom field mapping"
    ],
    pricing: "₹999/month",
    setupTime: "10 minutes",
    dataPoints: ["Contact Info", "Property Preferences", "Budget Range", "Location", "Timeline", "Source Campaign"],
    supportedPipelines: ["Premium Sales", "Luxury Properties", "Commercial Real Estate"],
    apiEndpoint: "https://api.magicbricks.com/v3",
    authType: "OAuth 2.0 + API Key",
    webhookSupport: true,
    batchImport: true,
    realTimeSync: true,
    leadVolume: "Premium",
    status: "available"
  },
  {
    id: "commonfloor",
    name: "CommonFloor",
    description: "Access verified property leads and apartment listings across major Indian cities",
    category: "real-estate",
    logo: "/integrations/commonfloor-logo.png",
    rating: 4.4,
    installs: "6.8K+",
    isPremium: false,
    features: [
      "Verified lead import",
      "Apartment listing sync",
      "Society-wise filtering",
      "Tenant-owner matching",
      "Maintenance request tracking"
    ],
    pricing: "Free",
    setupTime: "7 minutes",
    dataPoints: ["Contact Details", "Property Type", "Society Info", "Budget", "Move-in Timeline"],
    supportedPipelines: ["Rental Management", "Property Sales", "Society Management"],
    apiEndpoint: "https://api.commonfloor.com/v2",
    authType: "API Key",
    webhookSupport: false,
    batchImport: true,
    realTimeSync: false,
    leadVolume: "Medium",
    status: "available"
  },
  {
    id: "proptiger",
    name: "PropTiger",
    description: "Import leads from PropTiger's comprehensive real estate marketplace platform",
    category: "real-estate",
    logo: "/integrations/proptiger-logo.png",
    rating: 4.3,
    installs: "4.5K+",
    isPremium: false,
    features: [
      "New project leads",
      "Resale property inquiries",
      "Investment opportunity alerts",
      "Market trend analysis",
      "Price comparison data"
    ],
    pricing: "Free",
    setupTime: "5 minutes",
    dataPoints: ["Contact Info", "Property Interest", "Investment Capacity", "Location Preference"],
    supportedPipelines: ["Investment Sales", "New Projects", "Resale Properties"],
    apiEndpoint: "https://api.proptiger.com/v1",
    authType: "API Key",
    webhookSupport: true,
    batchImport: true,
    realTimeSync: true,
    leadVolume: "High",
    status: "coming-soon"
  },
  // Additional CRM integrations
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Sync leads bidirectionally with the world's #1 CRM platform",
    category: "crm",
    logo: "/integrations/salesforce-logo.png",
    rating: 4.9,
    installs: "50K+",
    isPremium: true,
    features: [
      "Bidirectional sync",
      "Custom object mapping",
      "Workflow automation",
      "Advanced reporting",
      "Territory management",
      "Lead scoring integration"
    ],
    pricing: "₹1,999/month",
    setupTime: "15 minutes",
    dataPoints: ["All CRM fields", "Custom Objects", "Activities", "Opportunities"],
    supportedPipelines: ["Any Pipeline"],
    apiEndpoint: "https://api.salesforce.com/v1",
    authType: "OAuth 2.0",
    webhookSupport: true,
    batchImport: true,
    realTimeSync: true,
    leadVolume: "Enterprise",
    status: "available"
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Connect with HubSpot's inbound marketing and CRM platform",
    category: "crm",
    logo: "/integrations/hubspot-logo.png",
    rating: 4.8,
    installs: "35K+",
    isPremium: false,
    features: [
      "Contact synchronization",
      "Deal pipeline sync",
      "Email marketing integration",
      "Form submissions",
      "Website tracking",
      "Marketing automation"
    ],
    pricing: "Free",
    setupTime: "8 minutes",
    dataPoints: ["Contacts", "Deals", "Companies", "Marketing Data"],
    supportedPipelines: ["Sales", "Marketing Qualified", "Customer Success"],
    apiEndpoint: "https://api.hubapi.com/v3",
    authType: "OAuth 2.0",
    webhookSupport: true,
    batchImport: true,
    realTimeSync: true,
    leadVolume: "High",
    status: "available"
  }
];

// Connected integrations (mock data)
const connectedIntegrations = [
  {
    id: "housing",
    name: "Housing.com",
    status: "active",
    lastSync: "2024-01-15T10:30:00Z",
    leadsImported: 1247,
    successRate: 96.8,
    monthlyLeads: 89,
    pipeline: "Real Estate Sales",
    stage: "New Lead"
  },
  {
    id: "99acres",
    name: "99acres",
    status: "active",
    lastSync: "2024-01-15T09:45:00Z",
    leadsImported: 892,
    successRate: 94.2,
    monthlyLeads: 67,
    pipeline: "Property Inquiries",
    stage: "Qualified Lead"
  }
];

// Form schemas
const integrationSetupSchema = z.object({
  pipelineId: z.string().min(1, "Pipeline is required"),
  stageId: z.string().min(1, "Stage is required"),
  apiKey: z.string().min(1, "API key is required"),
  webhookUrl: z.string().url("Invalid webhook URL").optional(),
  leadFilters: z.string().optional(),
  customMapping: z.string().optional(),
});

export default function IntegrationsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("marketplace");

  const form = useForm<z.infer<typeof integrationSetupSchema>>({
    resolver: zodResolver(integrationSetupSchema),
    defaultValues: {
      leadFilters: "",
      customMapping: "",
    },
  });

  const selectedPipelineId = form.watch("pipelineId");

  // Fetch pipelines
  useEffect(() => {
    const fetchPipelines = async () => {
      try {
        const response = await fetch("/api/pipelines");
        if (response.ok) {
          const data = await response.json();
          setPipelines(data.pipelines);
        }
      } catch (error) {
        console.error("Error fetching pipelines:", error);
      }
    };
    fetchPipelines();
  }, []);

  // Filter integrations
  const filteredIntegrations = availableIntegrations.filter(integration => {
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory;
    const matchesSearch = searchTerm === "" ||
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleConnectIntegration = (integration: any) => {
    setSelectedIntegration(integration);
    setShowSetupDialog(true);
  };

  const handleSetupIntegration = async (data: z.infer<typeof integrationSetupSchema>) => {
    try {
      setLoading(true);

      const setupData = {
        integrationId: selectedIntegration.id,
        ...data,
        leadFilters: data.leadFilters ? JSON.parse(data.leadFilters) : {},
        customMapping: data.customMapping ? JSON.parse(data.customMapping) : {},
      };

      const response = await fetch("/api/integrations/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setupData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `${selectedIntegration.name} connected successfully`,
        });
        setShowSetupDialog(false);
        form.reset();
        // Refresh connected integrations
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to connect integration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen text-foreground flex ">
      <DashboardSidebar />

      <main className="flex-1 overflow-hidden bg-transparent">
        <DashboardHeader />

        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header Section */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariant}
              className="space-y-6"
            >
              {/* Title and Navigation */}
              <motion.div variants={cardVariant} className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl">
                      <Puzzle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-primary">
                        Integrations Marketplace
                      </h1>
                      <p className="text-muted-foreground">
                        Connect external platforms to automate lead import and enhance your workflow
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{connectedIntegrations.length} Connected</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{availableIntegrations.length} Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span>{connectedIntegrations.reduce((sum, i) => sum + i.monthlyLeads, 0)} Leads/Month</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" className="gap-2 bg-white/50 backdrop-blur-sm">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Import Data</span>
                  </Button>

                  <Button variant="outline" className="gap-2 bg-white/50 backdrop-blur-sm">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Manage Connections</span>
                  </Button>
                </div>
              </motion.div>

              {/* Tabs Navigation */}
              <motion.div variants={cardVariant}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full lg:w-fit grid-cols-2 lg:grid-cols-4 b backdrop-blur-sm">
                    <TabsTrigger value="marketplace" className="gap-2">
                      <Globe className="h-4 w-4" />
                      Marketplace
                    </TabsTrigger>
                    <TabsTrigger value="connected" className="gap-2">
                      <Wifi className="h-4 w-4" />
                      Connected ({connectedIntegrations.length})
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Analytics
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="marketplace" className="space-y-6">
                    {/* Search and Filter */}
                    <motion.div variants={cardVariant}>
                      <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-white/20 shadow-xl">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search integrations..."
                                  className="pl-10 bg-white dark:bg-slate-800"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                />
                              </div>
                            </div>

                            {/* Category Filter */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                              {categories.map((category) => (
                                <Button
                                  key={category.id}
                                  variant={selectedCategory === category.id ? "default" : "outline"}
                                  size="sm"
                                  className={cn(
                                    "gap-2 whitespace-nowrap",
                                    selectedCategory === category.id
                                      ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                                      : "bg-white/50 hover:bg-white/80 dark:bg-slate-800/50"
                                  )}
                                  onClick={() => setSelectedCategory(category.id)}
                                >
                                  {category.icon}
                                  {category.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Integration Grid */}
                    <motion.div
                      variants={containerVariant}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {filteredIntegrations.map((integration) => (
                        <motion.div
                          key={integration.id}
                          variants={cardVariant}
                          whileHover={{ y: -4 }}
                          className="group"
                        >
                          <Card className="h-full  shadow-xl hover:shadow-2xl transition-all duration-300">
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-sm">
                                    {/* Placeholder for integration logo */}
                                    <Building2 className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                                      {integration.isPremium && (
                                        <Crown className="h-4 w-4 text-yellow-500" />
                                      )}
                                      {integration.status === "coming-soon" && (
                                        <Badge variant="outline" className="text-xs">Soon</Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                        <span className="text-xs text-muted-foreground">{integration.rating}</span>
                                      </div>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <span className="text-xs text-muted-foreground">{integration.installs} installs</span>
                                    </div>
                                  </div>
                                </div>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="gap-2">
                                      <Eye className="h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2">
                                      <ExternalLink className="h-4 w-4" />
                                      Visit Website
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2">
                                      <Share className="h-4 w-4" />
                                      Share Integration
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <CardDescription className="text-sm leading-relaxed">
                                {integration.description}
                              </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                              {/* Key Features */}
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Key Features</h4>
                                <div className="flex flex-wrap gap-1">
                                  {integration.features.slice(0, 3).map((feature) => (
                                    <Badge
                                      key={feature}
                                      variant="secondary"
                                      className="text-xs bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                                    >
                                      {feature}
                                    </Badge>
                                  ))}
                                  {integration.features.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{integration.features.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Setup Time</p>
                                  <p className="font-semibold">{integration.setupTime}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Lead Volume</p>
                          <p className="font-semibold">{integration.leadVolume}</p>
                                </div>
                              </div>

                              {/* Pricing */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-green-600">{integration.pricing}</span>
                                  {integration.isPremium && (
                                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                                      Premium
                                    </Badge>
                                  )}
                                </div>

                                <Button
                                  onClick={() => handleConnectIntegration(integration)}
                                  disabled={integration.status === "coming-soon"}
                                  className={cn(
                                    "gap-2",
                                    integration.status === "coming-soon"
                                      ? "opacity-50 cursor-not-allowed"
                                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                                  )}
                                >
                                  {integration.status === "coming-soon" ? (
                                    <>
                                      <Clock className="h-4 w-4" />
                                      Coming Soon
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="h-4 w-4" />
                                      Connect
                                    </>
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Empty State */}
                    {filteredIntegrations.length === 0 && (
                      <motion.div
                        variants={cardVariant}
                        className="text-center py-16"
                      >
                        <div className="h-20 w-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
                          <Search className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No integrations found</h3>
                        <p className="text-muted-foreground mb-6">
                          Try adjusting your search or category filters
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedCategory("all");
                          }}
                        >
                          Clear Filters
                        </Button>
                      </motion.div>
                    )}
                  </TabsContent>

                  <TabsContent value="connected" className="space-y-6">
                    {/* Connected Integrations */}
                    <motion.div
                      variants={containerVariant}
                      className="space-y-4"
                    >
                      {connectedIntegrations.map((integration) => (
                        <motion.div
                          key={integration.id}
                          variants={cardVariant}
                        >
                          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-white/40 shadow-xl">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center shadow-sm">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-3">
                                      <h3 className="font-semibold text-lg">{integration.name}</h3>
                                      <Badge
                                        className={cn(
                                          "text-xs",
                                          integration.status === "active"
                                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                        )}
                                      >
                                        <div className={cn(
                                          "w-2 h-2 rounded-full mr-1",
                                          integration.status === "active" ? "bg-green-500" : "bg-red-500"
                                        )} />
                                        {integration.status === "active" ? "Active" : "Inactive"}
                                      </Badge>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-muted-foreground mt-1">
                                      <span>Last sync: {new Date(integration.lastSync).toLocaleString()}</span>
                                      <span>{integration.leadsImported.toLocaleString()} total leads</span>
                                      <span>{integration.successRate}% success rate</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600">
                                      {integration.monthlyLeads}
                                    </div>
                                    <div className="text-xs text-muted-foreground">leads/month</div>
                                  </div>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem className="gap-2">
                                        <RefreshCw className="h-4 w-4" />
                                        Sync Now
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="gap-2">
                                        <Settings className="h-4 w-4" />
                                        Configure
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="gap-2">
                                        <BarChart3 className="h-4 w-4" />
                                        View Analytics
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="gap-2">
                                        <Pause className="h-4 w-4" />
                                        Pause Integration
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="gap-2 text-destructive">
                                        <WifiOff className="h-4 w-4" />
                                        Disconnect
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>

                              {/* Integration Details */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Pipeline</p>
                                  <p className="font-semibold">{integration.pipeline}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Default Stage</p>
                                  <p className="font-semibold">{integration.stage}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Import Rate</p>
                                  <div className="flex items-center gap-2">
                                    <Progress value={integration.successRate} className="h-2 flex-1" />
                                    <span className="text-sm font-semibold">{integration.successRate}%</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}

                      {connectedIntegrations.length === 0 && (
                        <motion.div
                          variants={cardVariant}
                          className="text-center py-16"
                        >
                          <div className="h-20 w-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
                            <WifiOff className="h-10 w-10 text-muted-foreground" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">No connected integrations</h3>
                          <p className="text-muted-foreground mb-6">
                            Connect your first integration to start importing leads automatically
                          </p>
                          <Button
                            onClick={() => setActiveTab("marketplace")}
                            className="gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Browse Integrations
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-6">
                    {/* Analytics Dashboard */}
                    <motion.div
                      variants={containerVariant}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                      <motion.div variants={cardVariant}>
                        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-white/40 shadow-xl">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Leads Imported</p>
                                <p className="text-3xl font-bold">
                                  {connectedIntegrations.reduce((sum, i) => sum + i.leadsImported, 0).toLocaleString()}
                                </p>
                              </div>
                              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Download className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div variants={cardVariant}>
                        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-white/40 shadow-xl">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Monthly Import Rate</p>
                                <p className="text-3xl font-bold">
                                  {connectedIntegrations.reduce((sum, i) => sum + i.monthlyLeads, 0)}
                                </p>
                              </div>
                              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div variants={cardVariant}>
                        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-white/40 shadow-xl">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                                <p className="text-3xl font-bold">
                                  {connectedIntegrations.length > 0
                                    ? Math.round(connectedIntegrations.reduce((sum, i) => sum + i.successRate, 0) / connectedIntegrations.length)
                                    : 0}%
                                </p>
                              </div>
                              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-purple-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div variants={cardVariant}>
                        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-white/40 shadow-xl">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Integrations</p>
                                <p className="text-3xl font-bold">{connectedIntegrations.length}</p>
                              </div>
                              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <Wifi className="h-6 w-6 text-orange-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>

                    {/* Detailed Analytics Charts */}
                    <motion.div variants={cardVariant}>
                      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-white/40 shadow-xl">
                        <CardHeader>
                          <CardTitle>Integration Performance</CardTitle>
                          <CardDescription>Lead import performance over the last 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                              <p>Analytics dashboard will be implemented with real data</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6">
                    {/* Global Settings */}
                    <motion.div variants={cardVariant}>
                      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-white/40 shadow-xl">
                        <CardHeader>
                          <CardTitle>Global Integration Settings</CardTitle>
                          <CardDescription>Configure default settings for all integrations</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">Auto-sync enabled</h4>
                                <p className="text-sm text-muted-foreground">Automatically sync leads from connected integrations</p>
                              </div>
                              <Button variant="outline" size="sm">Configure</Button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">Duplicate detection</h4>
                                <p className="text-sm text-muted-foreground">Prevent duplicate leads from being imported</p>
                              </div>
                              <Button variant="outline" size="sm">Configure</Button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">Lead enrichment</h4>
                                <p className="text-sm text-muted-foreground">Automatically enrich imported leads with additional data</p>
                              </div>
                              <Button variant="outline" size="sm">Configure</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Integration Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Puzzle className="h-4 w-4 text-white" />
              </div>
              Connect {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              Configure the integration settings to start importing leads from {selectedIntegration?.name} into your pipeline.
            </DialogDescription>
          </DialogHeader>

          {selectedIntegration && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSetupIntegration)} className="space-y-6">
                {/* Integration Info */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedIntegration.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedIntegration.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Setup time:</span>
                      <span className="ml-1 font-medium">{selectedIntegration.setupTime}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lead volume:</span>
                      <span className="ml-1 font-medium">{selectedIntegration.leadVolume}</span>
                    </div>
                  </div>
                </div>

                {/* Pipeline Configuration */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Pipeline Configuration</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pipelineId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Target Pipeline *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-slate-800">
                                <SelectValue placeholder="Select pipeline" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {pipelines.map((pipeline) => (
                                <SelectItem key={pipeline._id} value={pipeline._id}>
                                  <div className="flex items-center gap-2">
                                    {pipeline.name}
                                    {pipeline.isDefault && (
                                      <Badge variant="outline" className="text-xs">Default</Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stageId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Initial Stage *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-slate-800">
                                <SelectValue placeholder="Select stage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {selectedPipelineId &&
                                pipelines
                                  .find((p) => p._id === selectedPipelineId)
                                  ?.stages.sort((a, b) => a.order - b.order)
                                  .map((stage) => (
                                    <SelectItem key={stage._id} value={stage._id}>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: stage.color }}
                                        />
                                        {stage.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Authentication */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Authentication</h3>

                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          API Key *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your API key from the integration provider"
                            className="bg-white dark:bg-slate-800"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          You can find your API key in your {selectedIntegration.name} dashboard under Settings → API
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Advanced Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Advanced Settings</h3>

                  {selectedIntegration.webhookSupport && (
                    <FormField
                      control={form.control}
                      name="webhookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Webhook URL (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://your-domain.com/webhooks"
                              className="bg-white dark:bg-slate-800"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Configure a webhook URL for real-time lead notifications
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="leadFilters"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          Lead Filters (JSON)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='{"location": "Mumbai", "budget_min": 5000000}'
                            className="bg-white dark:bg-slate-800 font-mono text-sm"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Configure filters to import only specific leads (JSON format)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowSetupDialog(false);
                      form.reset();
                    }}
                    className="min-w-[100px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="min-w-[150px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Connect Integration
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
