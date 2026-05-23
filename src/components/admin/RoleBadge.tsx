import { UserRole, getRoleDisplayName, getRoleBadgeColor } from "@/lib/permissions";

export interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md" | "lg";
}

export function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  const colorClass = getRoleBadgeColor(role);

  return (
    <span
      className={`inline-block font-bold tracking-wider ${sizeClasses[size]} ${colorClass} text-black`}
    >
      {getRoleDisplayName(role).toUpperCase()}
    </span>
  );
}
