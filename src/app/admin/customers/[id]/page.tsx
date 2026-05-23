"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Mail,
  UserCog,
  UserX,
  UserCheck,
  Trash2,
  ShoppingBag,
  DollarSign,
  BarChart3,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Edit,
  Send,
  LogIn,
  Shield,
  Palette,
  Code2,
  User,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { customers, type Customer, type CustomerRole, type CustomerStatus, type ActivityItem } from "@/lib/data/customers";

const ROLE_OPTIONS: { value: CustomerRole; label: string; icon: typeof User; color: string }[] = [
  { value: "CUSTOMER", label: "Customer", icon: User, color: "text-[#6b8e6b]" },
  { value: "ARTIST", label: "Artist", icon: Palette, color: "text-[#60a5fa]" },
  { value: "ADMIN", label: "Admin", icon: Shield, color: "text-[#4ade80]" },
  { value: "SUPER_ADMIN", label: "Super Admin", icon: Shield, color: "text-[#dc2626]" },
  { value: "DEVELOPER", label: "Developer", icon: Code2, color: "text-[#a78bfa]" },
];

const STATUS_OPTIONS: { value: CustomerStatus; label: string; color: string }[] = [
  { value: "active", label: "Active", color: "text-[#4ade80]" },
  { value: "inactive", label: "Inactive", color: "text-[#6b8e6b]" },
  { value: "suspended", label: "Suspended", color: "text-[#dc2626]" },
  { value: "pending", label: "Pending", color: "text-[#fbbf24]" },
];

const ROLE_BADGE_COLORS: Record<CustomerRole, string> = {
  CUSTOMER: "bg-[#6b8e6b] text-black",
  ARTIST: "bg-[#60a5fa] text-black",
  ADMIN: "bg-[#4ade80] text-black",
  SUPER_ADMIN: "bg-[#dc2626] text-white",
  DEVELOPER: "bg-[#a78bfa] text-black",
};

const STATUS_BADGE_COLORS: Record<CustomerStatus, string> = {
  active: "bg-[#4ade80] text-black",
  inactive: "bg-[#6b8e6b] text-black",
  suspended: "bg-[#dc2626] text-white",
  pending: "bg-[#fbbf24] text-black",
};

const ACTIVITY_ICONS: Record<ActivityItem["type"], typeof LogIn> = {
  login: LogIn,
  order: Package,
  profile_update: Edit,
  role_change: Shield,
  status_change: UserCog,
  email_sent: Mail,
};

const ACTIVITY_COLORS: Record<ActivityItem["type"], string> = {
  login: "text-[#6b8e6b]",
  order: "text-[#4ade80]",
  profile_update: "text-[#60a5fa]",
  role_change: "text-[#a78bfa]",
  status_change: "text-[#fbbf24]",
  email_sent: "text-[#60a5fa]",
};

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const customer = customers.find(c => c.id === id);

  // Dialog states
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [editStatusOpen, setEditStatusOpen] = useState(false);
  const [sendEmailOpen, setSendEmailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newRole, setNewRole] = useState<CustomerRole | "">("");
  const [newStatus, setNewStatus] = useState<CustomerStatus | "">("");

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <UserX className="w-16 h-16 text-[#6b8e6b] mb-4" />
        <h1 className="text-2xl font-black text-[#e8f5e8] mb-2">Customer Not Found</h1>
        <p className="text-[#6b8e6b] mb-6">The customer you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-bold rounded-none">
          <Link href="/admin/customers">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Link>
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-[#dc2626]" />;
      case "pending":
        return <Loader2 className="w-4 h-4 text-[#fbbf24]" />;
      default:
        return <AlertCircle className="w-4 h-4 text-[#60a5fa]" />;
    }
  };

  const RoleIcon = ROLE_OPTIONS.find(r => r.value === customer.role)?.icon || User;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Customers", href: "/admin/customers" },
          { label: customer.fullName },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
          >
            <Link href="/admin/customers">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-[#e8f5e8]">
              {customer.fullName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={cn("rounded-none font-mono text-[10px]", ROLE_BADGE_COLORS[customer.role])}>
                {customer.role.replace("_", " ")}
              </Badge>
              <Badge className={cn("rounded-none font-mono text-[10px]", STATUS_BADGE_COLORS[customer.status])}>
                {customer.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setSendEmailOpen(true)}
            className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
          >
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
          <Button
            variant="outline"
            onClick={() => setEditRoleOpen(true)}
            className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
          >
            <UserCog className="w-4 h-4 mr-2" />
            Edit Role
          </Button>
          {customer.status === "active" ? (
            <Button
              variant="outline"
              onClick={() => setEditStatusOpen(true)}
              className="border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24]/10 rounded-none"
            >
              <UserX className="w-4 h-4 mr-2" />
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setEditStatusOpen(true)}
              className="border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80]/10 rounded-none"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Activate
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setDeleteOpen(true)}
            className="border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10 rounded-none"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Profile Card & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 mb-4 overflow-hidden bg-[#1a2e1a]">
                {customer.avatar ? (
                  <Image
                    src={customer.avatar}
                    alt={customer.fullName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#4ade80] text-black font-bold text-2xl">
                    {customer.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-[#e8f5e8]">{customer.fullName}</h2>
              <p className="text-[#6b8e6b] text-sm">{customer.email}</p>

              {customer.bio && (
                <p className="text-[#6b8e6b] text-sm mt-4 max-w-sm">{customer.bio}</p>
              )}

              <div className="flex items-center gap-2 mt-4">
                <Badge className={cn("rounded-none font-mono text-xs", ROLE_BADGE_COLORS[customer.role])}>
                  <RoleIcon className="w-3 h-3 mr-1" />
                  {customer.role.replace("_", " ")}
                </Badge>
              </div>

              <div className="w-full border-t border-[#1a2e1a] my-6" />

              <div className="w-full space-y-3 text-left">
                {customer.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-[#6b8e6b]" />
                    <span className="text-[#e8f5e8]">{customer.phone}</span>
                  </div>
                )}
                {customer.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-[#6b8e6b]" />
                    <span className="text-[#e8f5e8]">{customer.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-[#6b8e6b]" />
                  <span className="text-[#e8f5e8]">Joined {formatDate(customer.joinedAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-[#6b8e6b]" />
                  <span className="text-[#e8f5e8]">Last active {formatDate(customer.lastActive)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#4ade80]/10">
                    <ShoppingBag className="w-5 h-5 text-[#4ade80]" />
                  </div>
                  <span className="text-sm text-[#6b8e6b]">Total Orders</span>
                </div>
                <p className="text-3xl font-black text-[#e8f5e8]">{customer.totalOrders}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#60a5fa]/10">
                    <DollarSign className="w-5 h-5 text-[#60a5fa]" />
                  </div>
                  <span className="text-sm text-[#6b8e6b]">Total Spent</span>
                </div>
                <p className="text-3xl font-black text-[#e8f5e8]">
                  {formatCurrency(customer.totalSpent)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#a78bfa]/10">
                    <BarChart3 className="w-5 h-5 text-[#a78bfa]" />
                  </div>
                  <span className="text-sm text-[#6b8e6b]">Avg Order</span>
                </div>
                <p className="text-3xl font-black text-[#e8f5e8]">
                  {formatCurrency(customer.avgOrderValue)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Order History */}
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8]">
                Order History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {customer.orders && customer.orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1a2e1a] bg-[#050805]">
                        <th className="text-left py-3 px-6 text-xs font-mono text-[#6b8e6b] uppercase">
                          Order ID
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-mono text-[#6b8e6b] uppercase">
                          Date
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-mono text-[#6b8e6b] uppercase">
                          Items
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-mono text-[#6b8e6b] uppercase">
                          Amount
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-mono text-[#6b8e6b] uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-[#1a2e1a]/50 hover:bg-[#1a2e1a]/30"
                        >
                          <td className="py-3 px-6">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-mono text-sm text-[#4ade80] hover:underline"
                            >
                              {order.id}
                            </Link>
                          </td>
                          <td className="py-3 px-6 text-sm text-[#6b8e6b]">{order.date}</td>
                          <td className="py-3 px-6 text-sm text-[#e8f5e8]">{order.items}</td>
                          <td className="py-3 px-6 text-sm font-mono text-[#e8f5e8]">
                            {formatCurrency(order.amount)}
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              {getOrderStatusIcon(order.status)}
                              <span className={cn(
                                "text-xs font-medium capitalize",
                                order.status === "completed" && "text-[#4ade80]",
                                order.status === "cancelled" && "text-[#dc2626]",
                                order.status === "pending" && "text-[#fbbf24]",
                                order.status === "processing" && "text-[#60a5fa]",
                                order.status === "shipped" && "text-[#a78bfa]",
                              )}>
                                {order.status}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-[#1a2e1a] mx-auto mb-4" />
                  <p className="text-[#6b8e6b]">No orders yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Log */}
      <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
        <CardHeader>
          <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8]">
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.activityLog && customer.activityLog.length > 0 ? (
            <div className="space-y-4">
              {customer.activityLog.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type];
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 bg-[#050805] border border-[#1a2e1a]"
                  >
                    <div className={cn("p-2 bg-[#0a0f0a]", ACTIVITY_COLORS[activity.type])}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#e8f5e8]">{activity.description}</p>
                      <p className="text-xs text-[#6b8e6b] mt-1">{formatDateTime(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Clock className="w-12 h-12 text-[#1a2e1a] mx-auto mb-4" />
              <p className="text-[#6b8e6b]">No activity recorded</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent className="bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8] rounded-none">
          <DialogHeader>
            <DialogTitle className="font-black tracking-tighter">Edit Role</DialogTitle>
            <DialogDescription className="text-[#6b8e6b]">
              Change the role for {customer.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={customer.role} onValueChange={(v) => setNewRole(v as CustomerRole)}>
              <SelectTrigger className="w-full h-10 border-[#1a2e1a] bg-[#050805] text-[#e8f5e8] rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f0a] border-[#1a2e1a]">
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem
                    key={role.value}
                    value={role.value}
                    className="text-[#e8f5e8] hover:bg-[#1a2e1a] focus:bg-[#1a2e1a]"
                  >
                    <div className="flex items-center gap-2">
                      <role.icon className={cn("w-4 h-4", role.color)} />
                      {role.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditRoleOpen(false)}
              className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setEditRoleOpen(false)}
              className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-bold rounded-none"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={editStatusOpen} onOpenChange={setEditStatusOpen}>
        <DialogContent className="bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8] rounded-none">
          <DialogHeader>
            <DialogTitle className="font-black tracking-tighter">Change Status</DialogTitle>
            <DialogDescription className="text-[#6b8e6b]">
              Change the account status for {customer.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={customer.status} onValueChange={(v) => setNewStatus(v as CustomerStatus)}>
              <SelectTrigger className="w-full h-10 border-[#1a2e1a] bg-[#050805] text-[#e8f5e8] rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f0a] border-[#1a2e1a]">
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem
                    key={status.value}
                    value={status.value}
                    className="text-[#e8f5e8] hover:bg-[#1a2e1a] focus:bg-[#1a2e1a]"
                  >
                    <span className={status.color}>{status.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditStatusOpen(false)}
              className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setEditStatusOpen(false)}
              className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-bold rounded-none"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={sendEmailOpen} onOpenChange={setSendEmailOpen}>
        <DialogContent className="bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8] rounded-none">
          <DialogHeader>
            <DialogTitle className="font-black tracking-tighter">Send Email</DialogTitle>
            <DialogDescription className="text-[#6b8e6b]">
              Send an email to {customer.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <input
              type="text"
              placeholder="Subject"
              className={cn(
                "w-full h-10 px-3 bg-[#050805] border border-[#1a2e1a]",
                "text-[#e8f5e8] text-sm placeholder:text-[#6b8e6b]",
                "focus:border-[#4ade80] focus:outline-none"
              )}
            />
            <textarea
              placeholder="Message"
              rows={4}
              className={cn(
                "w-full px-3 py-2 bg-[#050805] border border-[#1a2e1a]",
                "text-[#e8f5e8] text-sm placeholder:text-[#6b8e6b]",
                "focus:border-[#4ade80] focus:outline-none resize-none"
              )}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSendEmailOpen(false)}
              className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setSendEmailOpen(false)}
              className="bg-[#60a5fa] hover:bg-[#3b82f6] text-black font-bold rounded-none"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-[#0a0f0a] border-[#dc2626] text-[#e8f5e8] rounded-none">
          <DialogHeader>
            <DialogTitle className="font-black tracking-tighter text-[#dc2626]">
              Delete Customer
            </DialogTitle>
            <DialogDescription className="text-[#6b8e6b]">
              Are you sure you want to delete {customer.fullName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setDeleteOpen(false);
                router.push("/admin/customers");
              }}
              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold rounded-none"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
