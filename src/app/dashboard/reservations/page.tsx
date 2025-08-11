"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Phone,
  User,
  CalendarDays,
} from "lucide-react";

type Reservation = {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  dateTime: string;
  duration: number;
  tableNumber?: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show';
  specialRequests?: string;
  notes?: string;
  createdAt: string;
};

export default function ReservationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, dateFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      let url = `/api/reservations?`;
      
      if (statusFilter !== "all") {
        url += `status=${statusFilter}&`;
      }
      
      if (dateFilter !== "all") {
        url += `date=${dateFilter}&`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setReservations(data.reservations || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (reservationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchReservations();
        if (selectedReservation?._id === reservationId) {
          setSelectedReservation({ ...selectedReservation, status: newStatus as any });
        }
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
      completed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      no_show: { color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getDateBadge = (dateTime: string) => {
    const date = new Date(dateTime);
    
    if (isToday(date)) {
      return <Badge className="bg-blue-100 text-blue-800">Today</Badge>;
    } else if (isTomorrow(date)) {
      return <Badge className="bg-purple-100 text-purple-800">Tomorrow</Badge>;
    } else if (isPast(date)) {
      return <Badge className="bg-gray-100 text-gray-800">Past</Badge>;
    }
    
    return null;
  };

  return (
    <div className="min-h-screen flex">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <DashboardHeader />
        
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Calendar className="h-8 w-8" />
                  Reservations
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage table reservations from AI calls
                </p>
              </div>
              
              <div className="flex gap-3">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value={new Date().toISOString().split('T')[0]}>Today</SelectItem>
                    <SelectItem value={new Date(Date.now() + 86400000).toISOString().split('T')[0]}>Tomorrow</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Party Size</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading reservations...
                    </TableCell>
                  </TableRow>
                ) : reservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No reservations found
                    </TableCell>
                  </TableRow>
                ) : (
                  reservations.map((reservation) => (
                    <TableRow key={reservation._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reservation.customerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {reservation.customerPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {reservation.partySize}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{format(new Date(reservation.dateTime), "MMM d, yyyy")}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(reservation.dateTime), "h:mm a")}
                          </div>
                          <div>{getDateBadge(reservation.dateTime)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {reservation.tableNumber ? (
                          <Badge variant="outline">Table {reservation.tableNumber}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                      <TableCell>{reservation.duration} min</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedReservation(reservation)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>

      {/* Reservation Details Dialog */}
      <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
          </DialogHeader>
          
          {selectedReservation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" /> Customer Information
                    </h4>
                    <div className="space-y-1">
                      <p className="font-medium">{selectedReservation.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        <Phone className="h-3 w-3 inline mr-1" />
                        {selectedReservation.customerPhone}
                      </p>
                      {selectedReservation.customerEmail && (
                        <p className="text-sm text-muted-foreground">
                          {selectedReservation.customerEmail}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4" /> Party Details
                    </h4>
                    <p>Party size: {selectedReservation.partySize} people</p>
                    <p>Duration: {selectedReservation.duration} minutes</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <CalendarDays className="h-4 w-4" /> Reservation Details
                    </h4>
                    <div className="space-y-1">
                      <p>{format(new Date(selectedReservation.dateTime), "EEEE, MMMM d, yyyy")}</p>
                      <p>{format(new Date(selectedReservation.dateTime), "h:mm a")}</p>
                      {selectedReservation.tableNumber && (
                        <p>Table: {selectedReservation.tableNumber}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {selectedReservation.specialRequests && (
                <div>
                  <h4 className="font-medium mb-2">Special Requests</h4>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {selectedReservation.specialRequests}
                  </div>
                </div>
              )}

              {selectedReservation.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {selectedReservation.notes}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Select
                  value={selectedReservation.status}
                  onValueChange={(value) => updateReservationStatus(selectedReservation._id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}