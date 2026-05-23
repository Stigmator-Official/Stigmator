"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useRequireRole } from "@/lib/auth/provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  ExternalLink,
  RotateCcw,
  DollarSign,
  AlertTriangle,
  Printer,
  FileText,
  Send,
  Check,
  Loader2,
  MessageSquare,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { getMockOrderById, updateMockOrderStatus, addNoteToOrder, processMockRefund } from "@/lib/mock/orders";
import type { MockOrder, OrderNote } from "@/lib/mock/orders";
import type { OrderStatus } from "@/lib/api/orders";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

// ============================================
// TIMELINE COMPONENT
// ============================================

function OrderTimeline({ order }: { order: MockOrder }) {
  const events: {
    status: OrderStatus;
    title: string;
    description: string;
    timestamp?: string;
    icon: React.ReactNode;
  }[] = [
    {
      status: "pending_payment",
      title: "Order Placed",
      description: "Order created and awaiting payment",
      timestamp: order.created_at,
      icon: <Clock className="h-4 w-4" />,
    },
    {
      status: "confirmed",
      title: "Payment Confirmed",
      description: "Payment received and order confirmed",
      timestamp: order.status !== "pending_payment" && order.status !== "payment_failed" && order.status !== "cancelled"
        ? order.created_at
        : undefined,
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      status: "processing",
      title: "Processing",
      description: "Order is being prepared for shipment",
      timestamp: ["processing", "shipped", "delivered"].includes(order.status)
        ? order.updated_at
        : undefined,
      icon: <Package className="h-4 w-4" />,
    },
    {
      status: "shipped",
      title: "Shipped",
      description: order.tracking_number
        ? `Tracking: ${order.tracking_number}`
        : "Order has been shipped",
      timestamp: order.shipped_at,
      icon: <Truck className="h-4 w-4" />,
    },
    {
      status: "delivered",
      title: "Delivered",
      description: "Order has been delivered",
      timestamp: order.delivered_at,
      icon: <Check className="h-4 w-4" />,
    },
  ];

  const terminalStatuses: Record<string, { title: string; description: string; icon: React.ReactNode; color: string }> = {
    cancelled: {
      title: "Cancelled",
      description: "Order has been cancelled",
      icon: <XCircle className="h-4 w-4" />,
      color: "#6b7280",
    },
    refunded: {
      title: "Refunded",
      description: order.refund_reason || "Order has been refunded",
      icon: <RotateCcw className="h-4 w-4" />,
      color: "#f97316",
    },
    payment_failed: {
      title: "Payment Failed",
      description: "Payment could not be processed",
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "#dc2626",
    },
  };

  const isTerminal = ["cancelled", "refunded", "payment_failed"].includes(order.status);
  const terminalEvent = isTerminal ? terminalStatuses[order.status] : null;

  return (
    <div className="space-y-0">
      {events.map((event, index) => {
        const isCompleted = isTerminal
          ? false
          : ["confirmed", "processing", "shipped", "delivered"].includes(order.status) &&
            index <= ["confirmed", "processing", "shipped", "delivered"].indexOf(order.status) + 1;
        const isCurrent = order.status === event.status;

        if (isTerminal) return null;

        return (
          <div key={event.status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 flex items-center justify-center border-2 transition-colors ${
                  isCompleted || isCurrent
                    ? "bg-[#4ade80]/10 border-[#4ade80] text-[#4ade80]"
                    : "bg-[#050805] border-[#1a2e1a] text-[#6b8e6b]"
                }`}
              >
                {event.icon}
              </div>
              {index < events.length - 1 && (
                <div
                  className={`w-0.5 h-12 ${
                    isCompleted ? "bg-[#4ade80]" : "bg-[#1a2e1a]"
                  }`}
                />
              )}
            </div>
            <div className="flex-1 pb-8">
              <p
                className={`font-black text-sm ${
                  isCompleted || isCurrent ? "text-[#e8f5e8]" : "text-[#6b8e6b]"
                }`}
              >
                {event.title}
              </p>
              <p className="text-xs text-[#6b8e6b] mt-1">{event.description}</p>
              {event.timestamp && (
                <p className="text-xs text-[#4ade80] mt-1 font-mono">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {terminalEvent && (
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 flex items-center justify-center border-2 bg-opacity-10"
              style={{
                borderColor: terminalEvent.color,
                color: terminalEvent.color,
                backgroundColor: `${terminalEvent.color}10`,
              }}
            >
              {terminalEvent.icon}
            </div>
          </div>
          <div className="flex-1">
            <p className="font-black text-sm" style={{ color: terminalEvent.color }}>
              {terminalEvent.title}
            </p>
            <p className="text-xs text-[#6b8e6b] mt-1">{terminalEvent.description}</p>
            <p className="text-xs mt-1 font-mono" style={{ color: terminalEvent.color }}>
              {new Date(order.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// NOTES COMPONENT
// ============================================

function OrderNotes({ order, onAddNote }: { order: MockOrder; onAddNote: (content: string) => void }) {
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onAddNote(newNote);
    setNewNote("");
    setIsSubmitting(false);
  };

  const getNoteIcon = (type: OrderNote["type"]) => {
    switch (type) {
      case "system":
        return <RefreshCw className="h-3 w-3" />;
      case "status_change":
        return <CheckCircle className="h-3 w-3" />;
      case "customer":
        return <User className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getNoteColor = (type: OrderNote["type"]) => {
    switch (type) {
      case "system":
        return "text-[#60a5fa] bg-[#60a5fa]/10";
      case "status_change":
        return "text-[#4ade80] bg-[#4ade80]/10";
      case "customer":
        return "text-[#fbbf24] bg-[#fbbf24]/10";
      default:
        return "text-[#a78bfa] bg-[#a78bfa]/10";
    }
  };

  const sortedNotes = [...(order.notes || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Add a note about this order..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] placeholder:text-[#6b8e6b]/50 focus:border-[#4ade80] min-h-[80px] resize-none"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!newNote.trim() || isSubmitting}
            className="rounded-none bg-[#4ade80] hover:bg-[#22c55e] text-black"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            ADD NOTE
          </Button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {sortedNotes.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-8 w-8 text-[#1a2e1a] mx-auto mb-2" />
            <p className="text-sm text-[#6b8e6b]">No notes yet</p>
          </div>
        ) : (
          sortedNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-[#050805] border border-[#1a2e1a]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`p-1 ${getNoteColor(note.type)}`}>
                    {getNoteIcon(note.type)}
                  </span>
                  <span className="text-xs font-mono text-[#6b8e6b]">
                    {note.author}
                  </span>
                </div>
                <span className="text-xs text-[#6b8e6b]">
                  {new Date(note.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-[#e8f5e8] mt-2">{note.content}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  useRequireRole(["ADMIN"]);
  const router = useRouter();
  const [order, setOrder] = useState<MockOrder | undefined>(() => getMockOrderById(params.id));
  
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  if (!order) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-[#050805] flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-[#1a2e1a] mx-auto mb-4" />
          <h1 className="text-2xl font-black text-[#e8f5e8] mb-2">ORDER NOT FOUND</h1>
          <p className="text-[#6b8e6b] mb-4">The order you&apos;re looking for doesn&apos;t exist</p>
          <Button
            onClick={() => router.push("/admin/orders")}
            className="rounded-none bg-[#4ade80] hover:bg-[#22c55e] text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK TO ORDERS
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdateStatus = async (status: OrderStatus) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const updated = updateMockOrderStatus(order.id, status);
    if (updated) setOrder({ ...updated });
    setIsLoading(false);
    setShowStatusDialog(false);
    setPendingStatus(null);
  };

  const handleAddNote = (content: string) => {
    const note = addNoteToOrder(order.id, content);
    if (note) {
      setOrder({ ...order, notes: [...(order.notes || []), note] });
    }
  };

  const handleRefund = async () => {
    const amount = parseFloat(refundAmount);
    if (!amount || amount <= 0 || amount > order.total) return;
    
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const updated = processMockRefund(order.id, amount, refundReason || "Customer request");
    if (updated) setOrder({ ...updated });
    setIsLoading(false);
    setShowRefundDialog(false);
    setRefundAmount("");
    setRefundReason("");
  };

  const handleDelete = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/admin/orders");
  };

  const canUpdateStatus = !["cancelled", "refunded"].includes(order.status);
  const canRefund = ["confirmed", "processing", "shipped", "delivered"].includes(order.status) && !order.refund_amount;
  const canDelete = true;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#050805]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/orders")}
              className="rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              BACK
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tighter text-[#e8f5e8]">
                  ORDER #{order.id.slice(-8).toUpperCase()}
                </h1>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-[#6b8e6b] text-sm mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString()} at{" "}
                {new Date(order.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a]"
            >
              <Printer className="mr-2 h-4 w-4" />
              PRINT
            </Button>
            <Button
              variant="outline"
              className="rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a]"
            >
              <FileText className="mr-2 h-4 w-4" />
              INVOICE
            </Button>
            {canDelete && (
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="rounded-none border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10"
              >
                <XCircle className="mr-2 h-4 w-4" />
                DELETE
              </Button>
            )}
          </div>
        </div>

        {/* Quick Actions Bar */}
        {canUpdateStatus && (
          <div className="mb-8 p-4 bg-[#0a0f0a] border border-[#1a2e1a]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono text-[#6b8e6b] mr-2">UPDATE STATUS:</span>
              {order.status === "pending_payment" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => { setPendingStatus("confirmed"); setShowStatusDialog(true); }}
                    className="rounded-none bg-[#60a5fa] text-black hover:bg-[#3b82f6] text-xs"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    CONFIRM PAYMENT
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => { setPendingStatus("cancelled"); setShowStatusDialog(true); }}
                    variant="outline"
                    className="rounded-none border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10 text-xs"
                  >
                    <XCircle className="mr-1 h-3 w-3" />
                    CANCEL
                  </Button>
                </>
              )}
              {order.status === "confirmed" && (
                <Button
                  size="sm"
                  onClick={() => { setPendingStatus("processing"); setShowStatusDialog(true); }}
                  className="rounded-none bg-[#a78bfa] text-black hover:bg-[#8b5cf6] text-xs"
                >
                  <Package className="mr-1 h-3 w-3" />
                  START PROCESSING
                </Button>
              )}
              {order.status === "processing" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => { setPendingStatus("shipped"); setShowStatusDialog(true); }}
                    className="rounded-none bg-[#4ade80] text-black hover:bg-[#22c55e] text-xs"
                  >
                    <Truck className="mr-1 h-3 w-3" />
                    MARK SHIPPED
                  </Button>
                  <Input
                    placeholder="Tracking number (optional)"
                    className="w-48 rounded-none bg-[#050805] border-[#1a2e1a] text-[#e8f5e8] text-xs"
                  />
                </>
              )}
              {order.status === "shipped" && (
                <Button
                  size="sm"
                  onClick={() => { setPendingStatus("delivered"); setShowStatusDialog(true); }}
                  className="rounded-none bg-[#22c55e] text-black hover:bg-[#16a34a] text-xs"
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  MARK DELIVERED
                </Button>
              )}
              {canRefund && (
                <Button
                  size="sm"
                  onClick={() => setShowRefundDialog(true)}
                  variant="outline"
                  className="rounded-none border-[#f97316] text-[#f97316] hover:bg-[#f97316]/10 text-xs ml-auto"
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  PROCESS REFUND
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Card */}
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardHeader className="border-b border-[#1a2e1a]">
                <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8]">
                  ORDER ITEMS ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#1a2e1a] hover:bg-transparent">
                      <TableHead className="text-[#6b8e6b] font-mono text-xs">ITEM</TableHead>
                      <TableHead className="text-[#6b8e6b] font-mono text-xs">ARTIST</TableHead>
                      <TableHead className="text-[#6b8e6b] font-mono text-xs">VARIANT</TableHead>
                      <TableHead className="text-[#6b8e6b] font-mono text-xs text-right">PRICE</TableHead>
                      <TableHead className="text-[#6b8e6b] font-mono text-xs text-right">QTY</TableHead>
                      <TableHead className="text-[#6b8e6b] font-mono text-xs text-right">TOTAL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id} className="border-[#1a2e1a] hover:bg-[#1a2e1a]/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#050805] border border-[#1a2e1a] flex items-center justify-center">
                              <Package className="h-5 w-5 text-[#6b8e6b]" />
                            </div>
                            <div>
                              <p className="font-medium text-[#e8f5e8] text-sm">
                                {item.product_design.design.title}
                              </p>
                              <p className="text-xs text-[#6b8e6b]">
                                {item.product_design.product.name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#6b8e6b] text-sm">
                          {item.product_design.design.artist.display_name}
                        </TableCell>
                        <TableCell className="text-[#e8f5e8] text-sm">
                          {item.size} / {item.color}
                        </TableCell>
                        <TableCell className="text-right text-[#e8f5e8]">
                          ${item.unit_price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-[#e8f5e8]">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right font-black text-[#60a5fa]">
                          ${(item.unit_price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Order Summary */}
                <div className="border-t border-[#1a2e1a] p-4">
                  <div className="w-full max-w-xs ml-auto space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6b8e6b]">Subtotal</span>
                      <span className="text-[#e8f5e8]">${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6b8e6b]">Shipping</span>
                      <span className="text-[#e8f5e8]">
                        {order.shipping === 0 ? "FREE" : `$${order.shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6b8e6b]">Tax</span>
                      <span className="text-[#e8f5e8]">${order.tax.toFixed(2)}</span>
                    </div>
                    {order.refund_amount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#f97316]">Refunded</span>
                        <span className="text-[#f97316]">-${order.refund_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-lg pt-2 border-t border-[#1a2e1a]">
                      <span className="text-[#e8f5e8]">TOTAL</span>
                      <span className="text-[#60a5fa]">
                        ${(order.total - (order.refund_amount || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs: Timeline, Notes, Activity */}
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="bg-[#0a0f0a] border border-[#1a2e1a] rounded-none p-0 h-auto w-full">
                <TabsTrigger
                  value="timeline"
                  className="rounded-none px-6 py-3 data-[state=active]:bg-[#4ade80] data-[state=active]:text-black font-black tracking-wider flex-1"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  TIMELINE
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="rounded-none px-6 py-3 data-[state=active]:bg-[#4ade80] data-[state=active]:text-black font-black tracking-wider flex-1"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  NOTES ({order.notes?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="payment"
                  className="rounded-none px-6 py-3 data-[state=active]:bg-[#4ade80] data-[state=active]:text-black font-black tracking-wider flex-1"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  PAYMENT
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-4">
                <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
                  <CardContent className="p-6">
                    <OrderTimeline order={order} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
                  <CardContent className="p-6">
                    <OrderNotes order={order} onAddNote={handleAddNote} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payment" className="mt-4">
                <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
                        <p className="text-xs font-mono text-[#6b8e6b] mb-1">PAYMENT METHOD</p>
                        <p className="text-[#e8f5e8] font-medium">
                          {order.payment_method || "Not recorded"}
                        </p>
                      </div>
                      <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
                        <p className="text-xs font-mono text-[#6b8e6b] mb-1">PAYMENT STATUS</p>
                        <p className="font-medium">
                          {["confirmed", "processing", "shipped", "delivered"].includes(order.status) ? (
                            <span className="text-[#4ade80]">PAID</span>
                          ) : order.status === "pending_payment" ? (
                            <span className="text-[#fbbf24]">PENDING</span>
                          ) : order.status === "payment_failed" ? (
                            <span className="text-[#dc2626]">FAILED</span>
                          ) : (
                            <span className="text-[#6b8e6b]">N/A</span>
                          )}
                        </p>
                      </div>
                      <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
                        <p className="text-xs font-mono text-[#6b8e6b] mb-1">TRANSACTION ID</p>
                        <p className="text-[#e8f5e8] font-mono text-sm">
                          {order.stripe_payment_intent_id || "N/A"}
                        </p>
                      </div>
                      <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
                        <p className="text-xs font-mono text-[#6b8e6b] mb-1">AMOUNT PAID</p>
                        <p className="text-[#60a5fa] font-black text-xl">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {order.refund_amount && (
                      <div className="p-4 bg-[#f97316]/10 border border-[#f97316]/50">
                        <div className="flex items-center gap-2 mb-2">
                          <RotateCcw className="h-4 w-4 text-[#f97316]" />
                          <p className="text-[#f97316] font-black">REFUND PROCESSED</p>
                        </div>
                        <p className="text-[#e8f5e8] text-sm mb-1">
                          Amount: <span className="font-black">${order.refund_amount.toFixed(2)}</span>
                        </p>
                        <p className="text-[#6b8e6b] text-sm">
                          Reason: {order.refund_reason}
                        </p>
                        <p className="text-[#6b8e6b] text-xs mt-2">
                          Refunded on {order.refunded_at && new Date(order.refunded_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Customer & Shipping */}
          <div className="space-y-6">
            {/* Customer Card */}
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardHeader className="border-b border-[#1a2e1a]">
                <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8] flex items-center">
                  <User className="mr-2 h-5 w-5 text-[#60a5fa]" />
                  CUSTOMER
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="font-black text-[#e8f5e8] text-lg">
                    {order.shipping_address.first_name} {order.shipping_address.last_name}
                  </p>
                  <p className="text-[#6b8e6b] text-sm">{order.user_id}</p>
                </div>
                <div className="space-y-2">
                  <a
                    href={`mailto:${order.shipping_address.email}`}
                    className="flex items-center gap-2 text-sm text-[#60a5fa] hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {order.shipping_address.email}
                  </a>
                  {order.shipping_address.phone && (
                    <a
                      href={`tel:${order.shipping_address.phone}`}
                      className="flex items-center gap-2 text-sm text-[#4ade80] hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {order.shipping_address.phone}
                    </a>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a]"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  VIEW CUSTOMER
                </Button>
              </CardContent>
            </Card>

            {/* Shipping Address Card */}
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardHeader className="border-b border-[#1a2e1a]">
                <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8] flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-[#4ade80]" />
                  SHIPPING ADDRESS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <p className="font-bold text-[#e8f5e8]">
                  {order.shipping_address.first_name} {order.shipping_address.last_name}
                </p>
                <p className="text-[#e8f5e8] text-sm">{order.shipping_address.address}</p>
                <p className="text-[#e8f5e8] text-sm">
                  {order.shipping_address.city}, {order.shipping_address.state}{" "}
                  {order.shipping_address.zip_code}
                </p>
                <p className="text-[#e8f5e8] text-sm">{order.shipping_address.country}</p>
              </CardContent>
            </Card>

            {/* Tracking Card */}
            {order.tracking_number && (
              <Card className="bg-[#0a0f0a] border-[#4ade80]/30 rounded-none">
                <CardHeader className="border-b border-[#4ade80]/20">
                  <CardTitle className="text-lg font-black tracking-tighter text-[#4ade80] flex items-center">
                    <Truck className="mr-2 h-5 w-5" />
                    TRACKING
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-xs font-mono text-[#6b8e6b] mb-1">TRACKING NUMBER</p>
                    <p className="text-[#e8f5e8] font-mono text-sm">{order.tracking_number}</p>
                  </div>
                  {order.shipped_at && (
                    <div>
                      <p className="text-xs font-mono text-[#6b8e6b] mb-1">SHIPPED ON</p>
                      <p className="text-[#e8f5e8] text-sm">
                        {new Date(order.shipped_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full rounded-none border-[#4ade80]/50 text-[#4ade80] hover:bg-[#4ade80]/10"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    TRACK SHIPMENT
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Order Info Card */}
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardHeader className="border-b border-[#1a2e1a]">
                <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8]">
                  ORDER INFO
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8e6b]">Order ID</span>
                  <span className="text-[#e8f5e8] font-mono">{order.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8e6b]">Created</span>
                  <span className="text-[#e8f5e8]">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8e6b]">Last Updated</span>
                  <span className="text-[#e8f5e8]">
                    {new Date(order.updated_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8e6b]">Items</span>
                  <span className="text-[#e8f5e8]">{order.items.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Update Dialog */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tighter text-[#e8f5e8]">
                UPDATE ORDER STATUS
              </DialogTitle>
              <DialogDescription className="text-[#6b8e6b]">
                Are you sure you want to change the order status to{" "}
                <span className="text-[#4ade80] font-black uppercase">
                  {pendingStatus?.replace("_", " ")}
                </span>
                ?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowStatusDialog(false); setPendingStatus(null); }}
                disabled={isLoading}
                className="rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8]"
              >
                CANCEL
              </Button>
              <Button
                onClick={() => pendingStatus && handleUpdateStatus(pendingStatus)}
                disabled={isLoading}
                className="rounded-none bg-[#4ade80] hover:bg-[#22c55e] text-black"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                CONFIRM
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Refund Dialog */}
        <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
          <DialogContent className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tighter text-[#e8f5e8]">
                PROCESS REFUND
              </DialogTitle>
              <DialogDescription className="text-[#6b8e6b]">
                Enter the refund amount and reason below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-mono text-[#6b8e6b] mb-2 block">
                  REFUND AMOUNT (MAX: ${order.total.toFixed(2)})
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                  <Input
                    type="number"
                    min="0.01"
                    max={order.total}
                    step="0.01"
                    placeholder="0.00"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="pl-10 bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] focus:border-[#f97316]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-mono text-[#6b8e6b] mb-2 block">
                  REASON FOR REFUND
                </label>
                <Textarea
                  placeholder="Why is this order being refunded?"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] placeholder:text-[#6b8e6b]/50 focus:border-[#f97316] resize-none"
                />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowRefundDialog(false); setRefundAmount(""); setRefundReason(""); }}
                disabled={isLoading}
                className="rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8]"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleRefund}
                disabled={isLoading || !refundAmount || parseFloat(refundAmount) <= 0 || parseFloat(refundAmount) > order.total}
                className="rounded-none bg-[#f97316] hover:bg-[#ea580c] text-white"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4" />
                )}
                PROCESS REFUND
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tighter text-[#e8f5e8]">
                DELETE ORDER
              </DialogTitle>
              <DialogDescription className="text-[#6b8e6b]">
                Are you sure you want to delete this order? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isLoading}
                className="rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8]"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isLoading}
                className="rounded-none bg-[#dc2626] hover:bg-[#b91c1c] text-white"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                DELETE ORDER
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
