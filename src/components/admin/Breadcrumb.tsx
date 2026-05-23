"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

// Auto-generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const parts = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Skip "admin" in the display but keep the path
  let currentPath = "";

  parts.forEach((part, index) => {
    currentPath += `/${part}`;

    if (part === "admin") {
      breadcrumbs.push({
        label: "Admin",
        href: "/admin/dashboard",
      });
    } else {
      // Format the label
      const label = part
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Only add href if it's not the last item
      const isLast = index === parts.length - 1;
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    }
  });

  return breadcrumbs;
}

// Custom label mappings for common routes
const labelMappings: Record<string, string> = {
  dashboard: "Dashboard",
  orders: "Orders",
  products: "Products",
  analytics: "Analytics",
  customers: "Customers",
  promos: "Promo Codes",
  "promo-codes": "Promo Codes",
  settings: "Settings",
  developer: "Developer",
  "artist-applications": "Artist Applications",
  "new": "New",
  "edit": "Edit",
  "view": "View",
};

export function Breadcrumb({
  items,
  className,
  showHome = true,
}: BreadcrumbProps) {
  const pathname = usePathname();
  const breadcrumbs = items || generateBreadcrumbs(pathname);

  // Apply custom label mappings
  const mappedBreadcrumbs = breadcrumbs.map((item) => ({
    ...item,
    label: labelMappings[item.label.toLowerCase()] || item.label,
  }));

  if (mappedBreadcrumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-2 text-sm", className)}
    >
      {showHome && (
        <>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1 text-[#6b8e6b] hover:text-[#4ade80] transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          {mappedBreadcrumbs.length > 0 && (
            <ChevronRight className="w-4 h-4 text-[#1a2e1a]" />
          )}
        </>
      )}

      <ol className="flex items-center gap-2 flex-wrap">
        {mappedBreadcrumbs.map((item, index) => {
          const isLast = index === mappedBreadcrumbs.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {isLast || !item.href ? (
                <span
                  className={cn(
                    "font-medium",
                    isLast ? "text-[#e8f5e8]" : "text-[#6b8e6b]"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-[#6b8e6b] hover:text-[#4ade80] transition-colors"
                >
                  {item.label}
                </Link>
              )}
              {!isLast && (
                <ChevronRight className="w-4 h-4 text-[#1a2e1a]" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Page header component with breadcrumb and title
interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <Breadcrumb items={breadcrumb} className="mb-4" />
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#e8f5e8]">
            {title}
          </h1>
          {description && (
            <p className="text-[#6b8e6b] mt-2 max-w-2xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

export default Breadcrumb;
