"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BarChart3,
  Users,
  Ticket,
  Settings,
  Code2,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Palette,
  Shield,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type UserRole,
  type Permission,
  hasPermission,
  canAccessSystem,
  canManageUsers,
  canManageFinancials,
} from "@/lib/permissions";
import { RoleBadge } from "./RoleBadge";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  description?: string;
  requiredPermission?: Permission;
  requiredRole?: UserRole;
  check?: (role: UserRole) => boolean;
}

interface SidebarProps {
  role?: UserRole;
  isCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  className?: string;
}

export function Sidebar({ 
  role = "CUSTOMER", 
  isCollapsed: controlledCollapsed, 
  onCollapse, 
  className 
}: SidebarProps) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  
  // Support both controlled and uncontrolled collapsed state
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const handleCollapse = onCollapse || setInternalCollapsed;

  // Navigation items with permission requirements
  const navigation: NavItem[] = useMemo(() => [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      description: "Overview and quick stats",
      requiredRole: "ADMIN",
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      badge: 12,
      description: "Order list, filters, actions",
      check: (r) => hasPermission(r, "orders:view"),
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: Package,
      description: "Garments management",
      check: (r) => hasPermission(r, "products:view"),
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      description: "Charts, reports, insights",
      check: (r) => hasPermission(r, "analytics:view"),
    },
    {
      label: "Customers",
      href: "/admin/customers",
      icon: Users,
      description: "User management",
      check: (r) => canManageUsers(r),
    },
    {
      label: "Artists",
      href: "/admin/artists",
      icon: Palette,
      description: "Artist approvals and management",
      check: (r) => hasPermission(r, "artists:view"),
    },
    {
      label: "Studios",
      href: "/admin/studios",
      icon: Building2,
      description: "Studio management",
      check: (r) => hasPermission(r, "studios:view"),
    },
    {
      label: "Promo Codes",
      href: "/admin/promo-codes",
      icon: Ticket,
      description: "Discounts and campaigns",
      check: (r) => hasPermission(r, "products:moderate"),
    },
    {
      label: "Financials",
      href: "/admin/financials",
      icon: BarChart3,
      description: "Payouts and financial reports",
      check: (r) => canManageFinancials(r),
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
      description: "Platform configuration",
      check: (r) => hasPermission(r, "system:configure"),
    },
    {
      label: "Developer",
      href: "/admin/developer",
      icon: Code2,
      description: "API keys, webhooks, logs",
      check: (r) => canAccessSystem(r),
    },
    {
      label: "Super Admin",
      href: "/admin/super",
      icon: Shield,
      description: "System administration",
      requiredRole: "SUPER_ADMIN",
    },
  ], []);

  // Filter navigation based on role
  const filteredNavigation = useMemo(() => {
    return navigation.filter((item) => {
      if (item.requiredRole) {
        const roleHierarchy: Record<UserRole, number> = {
          SUPER_ADMIN: 100,
          ADMIN: 80,
          DEVELOPER: 60,
          ARTIST: 20,
          CUSTOMER: 10,
        };
        return roleHierarchy[role] >= roleHierarchy[item.requiredRole];
      }
      if (item.check) {
        return item.check(role);
      }
      if (item.requiredPermission) {
        return hasPermission(role, item.requiredPermission);
      }
      return true;
    });
  }, [navigation, role]);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-[#0a0f0a] border-r border-[#1a2e1a]",
          "flex flex-col",
          className
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1a2e1a]">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-10 h-10 bg-[#4ade80] flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-black" />
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="font-black text-lg tracking-tighter text-[#e8f5e8] whitespace-nowrap"
                >
                  STIGMATOR
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Role Badge */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-[#1a2e1a]">
            <RoleBadge role={role} size="sm" />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 transition-all duration-200 group relative",
                      "border border-transparent",
                      isActive
                        ? "bg-[#4ade80]/10 border-[#4ade80]/30 text-[#4ade80]"
                        : "text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] hover:border-[#1a2e1a]"
                    )}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-[#4ade80]"
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    <Icon className={cn(
                      "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                      isActive ? "text-[#4ade80]" : "group-hover:text-[#e8f5e8]"
                    )} />

                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between flex-1 min-w-0 overflow-hidden"
                        >
                          <span className="font-medium text-sm whitespace-nowrap truncate">
                            {item.label}
                          </span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className={cn(
                              "ml-2 px-2 py-0.5 text-xs font-mono font-bold flex-shrink-0",
                              isActive
                                ? "bg-[#4ade80] text-black"
                                : "bg-[#dc2626] text-white"
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Collapsed Badge */}
                    {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#dc2626] text-white text-xs font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="bg-[#1a2e1a] border-[#1a2e1a] text-[#e8f5e8]">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-[#6b8e6b]">{item.description}</p>
                    {item.badge !== undefined && item.badge > 0 && (
                      <p className="text-xs text-[#dc2626] mt-1">{item.badge} pending</p>
                    )}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-[#1a2e1a]">
          <button
            onClick={() => handleCollapse(!isCollapsed)}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-3 py-2",
              "text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a]",
              "transition-colors duration-200 border border-transparent hover:border-[#1a2e1a]"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}

export default Sidebar;
