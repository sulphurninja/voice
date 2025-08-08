"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Phone,
  UserPlus,
  Search,
  MoreHorizontal,
  Tag,
  Download,
  Upload,
  Trash2,
  Edit,
  Calendar,
  Clock,
  Plus,
  Building,
  Mail,
  Loader2,
  Filter,
  X,
  Users,
  CheckCircle,
  FileText,
  MessageSquarePlus,
  PhoneCall,
  AlertCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Contact type definition
type Contact = {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  company?: string;
  notes?: string;
  tags?: string[];
  lastContacted?: string;
  createdAt: string;
};

// Contact form schema
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().min(7, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
});

export default function ContactsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      email: "",
      company: "",
      notes: "",
      tags: [],
    },
  });

  // Fetch contacts
  useEffect(() => {
    fetchContacts();
  }, [currentPage, searchTerm, selectedTag]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      let url = `/api/contacts?page=${currentPage}&limit=10`;

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      if (selectedTag) {
        url += `&tag=${encodeURIComponent(selectedTag)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }

      const data = await response.json();
      setContacts(data.contacts);
      setTotalPages(data.pagination.pages);

      // Extract unique tags from contacts
      const tags = new Set<string>();
      data.contacts.forEach((contact: Contact) => {
        if (contact.tags && contact.tags.length > 0) {
          contact.tags.forEach(tag => tags.add(tag));
        }
      });
      setAvailableTags(Array.from(tags));

    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (data: z.infer<typeof contactSchema>) => {
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add contact");
      }

      // Refresh contacts list
      fetchContacts();
      setShowAddContact(false);
      form.reset();
      toast({
        title: "Success",
        description: "Contact added successfully",
      });
    } catch (error: any) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateContact = async (data: z.infer<typeof contactSchema>) => {
    if (!editingContact) return;

    try {
      const response = await fetch(`/api/contacts/${editingContact._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update contact");
      }

      // Refresh contacts list
      fetchContacts();
      setEditingContact(null);
      form.reset();
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating contact:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSingleContact = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }

      // Refresh contacts list
      fetchContacts();
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContacts = async () => {
    if (selectedContacts.length === 0) return;

    try {
      setIsDeleting(true);

      const response = await fetch("/api/contacts/batch", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactIds: selectedContacts }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete contacts");
      }

      const result = await response.json();

      // Refresh contacts list
      fetchContacts();
      setSelectedContacts([]);
      setShowDeleteAlert(false);

      toast({
        title: "Success",
        description: `Successfully deleted ${result.deletedCount} contacts`,
      });
    } catch (error: any) {
      console.error("Error deleting contacts:", error);
      toast({
        title: "Error",
        description: "Failed to delete contacts",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportContacts = async () => {
    try {
      setIsExporting(true);

      const response = await fetch("/api/contacts", {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to export contacts");
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contacts_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

    } catch (error: any) {
      console.error("Error exporting contacts:", error);
      toast({
        title: "Error",
        description: "Failed to export contacts",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/contacts", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to import contacts");
      }

      const result = await response.json();
      setImportResults(result);

      // Refresh contacts list
      fetchContacts();

    } catch (error: any) {
      console.error("Error importing contacts:", error);
      toast({
        title: "Error",
        description: "Failed to import contacts",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    form.reset({
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      email: contact.email || "",
      company: contact.company || "",
      notes: contact.notes || "",
      tags: contact.tags || [],
    });
  };

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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag(null);
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

        <div className=" mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariant}
            className="mb-8"
          >
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Contacts</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your contacts for AI voice calls
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportContacts}
                  disabled={isExporting}
                  className="gap-2"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Export
                </Button>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="gap-2"
                  >
                    {isImporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Import
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    setShowAddContact(true);
                    form.reset();
                  }}
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Contact
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
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {availableTags.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Tag className="h-4 w-4" />
                      {selectedTag ? selectedTag : "Filter by tag"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Select Tag</DropdownMenuLabel>
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
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {(searchTerm || selectedTag) && (
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

              {selectedContacts.length > 0 && (
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedContacts.length} selected
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteAlert(true)}
                    disabled={isDeleting}
                    className="gap-2"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Contacts Table */}
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
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  ))}
                </CardContent>
              ) : error ? (
                <CardContent className="p-6">
                  <div className="text-center py-6">
                    <div className="rounded-full bg-destructive/10 p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <X className="h-6 w-6 text-destructive" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Error Loading Contacts</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => fetchContacts()}>Retry</Button>
                  </div>
                </CardContent>
              ) : contacts.length === 0 ? (
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <div className="rounded-full bg-muted p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No contacts found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {searchTerm || selectedTag
                        ? "Try adjusting your search filters"
                        : "Add your first contact to start making AI voice calls"}
                    </p>
                    {searchTerm || selectedTag ? (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    ) : (
                      <Button onClick={() => setShowAddContact(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Contact
                      </Button>
                    )}
                  </div>
                </CardContent>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <Checkbox
                            checked={selectedContacts.length === contacts.length && contacts.length > 0}
                            onCheckedChange={handleSelectAllContacts}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Phone</TableHead>
                        <TableHead className="hidden md:table-cell">Company</TableHead>
                        <TableHead className="hidden lg:table-cell">Tags</TableHead>
                        <TableHead className="hidden lg:table-cell">Last Contact</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map(contact => (
                        <TableRow key={contact._id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedContacts.includes(contact._id)}
                              onCheckedChange={() => handleToggleSelectContact(contact._id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-medium text-primary">
                                  {contact.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{contact.name}</div>
                                <div className="text-xs text-muted-foreground md:hidden">
                                  {contact.phoneNumber}
                                </div>
                                {contact.email && (
                                  <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                    {contact.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {contact.phoneNumber}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {contact.company || "-"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
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
                          <TableCell className="hidden lg:table-cell">
                            {contact.lastContacted ? (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>{formatDistanceToNow(new Date(contact.lastContacted))} ago</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Never</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => router.push(`/dashboard/calls/new?contact=${contact._id}`)}
                                  className="cursor-pointer"
                                >
                                  <PhoneCall className="h-4 w-4 mr-2" />
                                  Call Contact
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditContact(contact)}
                                  className="cursor-pointer"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setDeletingContactId(contact._id);
                                    setShowDeleteAlert(true);
                                  }}
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
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

          {/* Import Results */}
          {importResults && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariant}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    Import Results
                  </CardTitle>
                  <CardDescription>
                    {importResults.message}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-success/10 rounded-lg p-4 text-center">
                      <span className="text-2xl font-bold text-success">{importResults.results?.created || 0}</span>
                      <p className="text-sm text-muted-foreground">Created</p>
                    </div>
                    <div className="bg-warning/10 rounded-lg p-4 text-center">
                      <span className="text-2xl font-bold text-warning">{importResults.results?.skipped || 0}</span>
                      <p className="text-sm text-muted-foreground">Skipped</p>
                    </div>
                    <div className="bg-destructive/10 rounded-lg p-4 text-center">
                      <span className="text-2xl font-bold text-destructive">{importResults.results?.failed || 0}</span>
                      <p className="text-sm text-muted-foreground">Failed</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={() => setImportResults(null)} className="ml-auto">
                    Dismiss
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      {/* Add/Edit Contact Dialog */}
      <Dialog
        open={showAddContact || !!editingContact}
        onOpenChange={open => {
          if (!open) {
            setShowAddContact(false);
            setEditingContact(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Edit Contact" : "Add New Contact"}
            </DialogTitle>
            <DialogDescription>
              {editingContact
                ? "Update contact information"
                : "Fill in the details to add a new contact"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(editingContact ? handleUpdateContact : handleAddContact)} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 555 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Add tags separated by commas"
                        value={field.value?.join(", ") || ""}
                        onChange={(e) => {
                          const tags = e.target.value
                            .split(",")
                            .map(tag => tag.trim())
                            .filter(Boolean);
                          field.onChange(tags);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter tags separated by commas (e.g. "lead, customer, vip")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes about this contact"
                        className="resize-none h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {editingContact ? "Update Contact" : "Add Contact"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deletingContactId
                ? "Are you sure you want to delete this contact? This action cannot be undone."
                : `Are you sure you want to delete ${selectedContacts.length} contacts? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingContactId) {
                  handleDeleteSingleContact(deletingContactId);
                  setDeletingContactId(null);
                } else {
                  handleDeleteContacts();
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
