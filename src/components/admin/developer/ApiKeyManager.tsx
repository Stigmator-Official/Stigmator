"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Copy,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Shield,
  Check,
  X,
  Clock,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Permission {
  resource: string;
  read: boolean;
  write: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: Permission[];
  lastUsed: string;
  created: string;
  status: "active" | "revoked";
}

const RESOURCES = [
  "orders",
  "products",
  "customers",
  "analytics",
  "webhooks",
  "settings",
];

const INITIAL_PERMISSIONS: Permission[] = RESOURCES.map((resource) => ({
  resource,
  read: false,
  write: false,
}));

const MOCK_API_KEYS: ApiKey[] = [
  {
    id: "key-001",
    name: "Production API",
    key: "stig_placeholder_prod_xxxxxxxxxxxxxxxx",
    permissions: [
      { resource: "orders", read: true, write: true },
      { resource: "products", read: true, write: false },
      { resource: "customers", read: true, write: false },
      { resource: "analytics", read: true, write: false },
    ],
    lastUsed: "2 min ago",
    created: "2024-03-15",
    status: "active",
  },
  {
    id: "key-002",
    name: "Development API",
    key: "stig_placeholder_dev_xxxxxxxxxxxxxxxx",
    permissions: [
      { resource: "orders", read: true, write: true },
      { resource: "products", read: true, write: true },
      { resource: "customers", read: true, write: true },
      { resource: "analytics", read: true, write: true },
      { resource: "webhooks", read: true, write: true },
    ],
    lastUsed: "5 hours ago",
    created: "2024-03-10",
    status: "active",
  },
  {
    id: "key-003",
    name: "Analytics Integration",
    key: "stig_placeholder_analytics_xxxxxxxx",
    permissions: [
      { resource: "analytics", read: true, write: false },
      { resource: "orders", read: true, write: false },
    ],
    lastUsed: "1 day ago",
    created: "2024-02-28",
    status: "active",
  },
  {
    id: "key-004",
    name: "Legacy Integration",
    key: "stig_placeholder_legacy_xxxxxxxxxxx",
    permissions: [
      { resource: "orders", read: true, write: true },
      { resource: "products", read: true, write: true },
    ],
    lastUsed: "2 weeks ago",
    created: "2024-01-15",
    status: "revoked",
  },
];

function KeyPreview({ keyValue }: { keyValue: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(keyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const preview = revealed
    ? keyValue
    : `${keyValue.slice(0, 8)}${"•".repeat(24)}${keyValue.slice(-4)}`;

  return (
    <div className="flex items-center gap-2">
      <code className="font-mono text-xs text-[#6b8e6b] bg-[#050805] px-2 py-1 border border-[#1a2e1a]">
        {preview}
      </code>
      <button
        onClick={() => setRevealed(!revealed)}
        className="p-1 text-[#6b8e6b] hover:text-[#e8f5e8] transition-colors"
        title={revealed ? "Hide key" : "Reveal key"}
      >
        {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={handleCopy}
        className="p-1 text-[#6b8e6b] hover:text-[#4ade80] transition-colors"
        title="Copy to clipboard"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function PermissionBadge({ read, write }: { read: boolean; write: boolean }) {
  if (read && write) {
    return (
      <Badge className="rounded-none bg-[#4ade80] text-black text-[10px] font-mono">
        RW
      </Badge>
    );
  }
  if (read) {
    return (
      <Badge className="rounded-none bg-[#60a5fa] text-black text-[10px] font-mono">
        RO
      </Badge>
    );
  }
  if (write) {
    return (
      <Badge className="rounded-none bg-[#fbbf24] text-black text-[10px] font-mono">
        WO
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="rounded-none border-[#1a2e1a] text-[#6b8e6b] text-[10px] font-mono">
      --
    </Badge>
  );
}

function PermissionsMatrix({
  permissions,
  onChange,
  readOnly = false,
}: {
  permissions: Permission[];
  onChange?: (permissions: Permission[]) => void;
  readOnly?: boolean;
}) {
  const handleToggle = (resource: string, type: "read" | "write") => {
    if (readOnly || !onChange) return;
    const newPermissions = permissions.map((p) =>
      p.resource === resource ? { ...p, [type]: !p[type] } : p
    );
    onChange(newPermissions);
  };

  return (
    <div className="border border-[#1a2e1a] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-[#1a2e1a] hover:bg-transparent">
            <TableHead className="text-[#6b8e6b] font-mono text-xs">Resource</TableHead>
            <TableHead className="text-[#6b8e6b] font-mono text-xs text-center">Read</TableHead>
            <TableHead className="text-[#6b8e6b] font-mono text-xs text-center">Write</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((perm) => (
            <TableRow key={perm.resource} className="border-[#1a2e1a]/50 hover:bg-[#1a2e1a]/20">
              <TableCell className="font-mono text-xs text-[#e8f5e8] capitalize">
                {perm.resource}
              </TableCell>
              <TableCell className="text-center">
                <Checkbox
                  checked={perm.read}
                  onCheckedChange={() => handleToggle(perm.resource, "read")}
                  disabled={readOnly}
                  className="border-[#1a2e1a] data-[state=checked]:bg-[#60a5fa] data-[state=checked]:border-[#60a5fa]"
                />
              </TableCell>
              <TableCell className="text-center">
                <Checkbox
                  checked={perm.write}
                  onCheckedChange={() => handleToggle(perm.resource, "write")}
                  disabled={readOnly}
                  className="border-[#1a2e1a] data-[state=checked]:bg-[#fbbf24] data-[state=checked]:border-[#fbbf24]"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CreateKeyDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (key: Omit<ApiKey, "id" | "created" | "lastUsed" | "status">) => void;
}) {
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>(INITIAL_PERMISSIONS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = `stig_placeholder_${Array.from({ length: 32 }, () =>
      Math.random().toString(36).charAt(2)
    ).join("")}`;
    onCreate({ name, key, permissions });
    setName("");
    setPermissions(INITIAL_PERMISSIONS);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8] max-w-lg rounded-none">
        <DialogHeader>
          <DialogTitle className="font-black tracking-tighter flex items-center gap-2">
            <Key className="w-5 h-5 text-[#4ade80]" />
            Create New API Key
          </DialogTitle>
          <DialogDescription className="text-[#6b8e6b]">
            Create a new API key with specific permissions for your integrations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="key-name" className="text-[#e8f5e8] font-mono text-xs">
              KEY NAME
            </Label>
            <Input
              id="key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Production API"
              className="bg-[#050805] border-[#1a2e1a] text-[#e8f5e8] rounded-none focus:border-[#4ade80]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#e8f5e8] font-mono text-xs">PERMISSIONS</Label>
            <PermissionsMatrix permissions={permissions} onChange={setPermissions} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name}
              className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-bold rounded-none"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_API_KEYS);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const handleCreateKey = (newKey: Omit<ApiKey, "id" | "created" | "lastUsed" | "status">) => {
    const key: ApiKey = {
      ...newKey,
      id: `key-${Date.now()}`,
      created: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      status: "active",
    };
    setKeys([key, ...keys]);
  };

  const handleRevokeKey = (id: string) => {
    setKeys(keys.map((k) => (k.id === id ? { ...k, status: "revoked" } : k)));
  };

  const activeKeys = keys.filter((k) => k.status === "active");
  const revokedKeys = keys.filter((k) => k.status === "revoked");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4ade80]/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-[#4ade80]" />
              </div>
              <div>
                <p className="text-xs text-[#6b8e6b] font-mono">ACTIVE KEYS</p>
                <p className="text-2xl font-black text-[#e8f5e8]">{activeKeys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#dc2626]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#dc2626]" />
              </div>
              <div>
                <p className="text-xs text-[#6b8e6b] font-mono">REVOKED</p>
                <p className="text-2xl font-black text-[#e8f5e8]">{revokedKeys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#60a5fa]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#60a5fa]" />
              </div>
              <div>
                <p className="text-xs text-[#6b8e6b] font-mono">LAST USED</p>
                <p className="text-2xl font-black text-[#e8f5e8]">2m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keys List */}
      <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-black tracking-tighter text-[#e8f5e8] flex items-center gap-2">
            <Key className="w-5 h-5 text-[#4ade80]" />
            API Keys
          </CardTitle>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-bold rounded-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Key
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keys.map((apiKey) => (
              <motion.div
                key={apiKey.id}
                layout
                className={cn(
                  "border overflow-hidden",
                  apiKey.status === "active" ? "border-[#1a2e1a]" : "border-[#1a2e1a]/50 opacity-60"
                )}
              >
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1a2e1a]/20 transition-colors"
                  onClick={() => setExpandedKey(expandedKey === apiKey.id ? null : apiKey.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 flex items-center justify-center",
                        apiKey.status === "active" ? "bg-[#4ade80]/10" : "bg-[#6b8e6b]/10"
                      )}
                    >
                      <Key
                        className={cn(
                          "w-5 h-5",
                          apiKey.status === "active" ? "text-[#4ade80]" : "text-[#6b8e6b]"
                        )}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#e8f5e8]">{apiKey.name}</span>
                        {apiKey.status === "revoked" && (
                          <Badge className="rounded-none bg-[#dc2626] text-white text-[10px]">
                            REVOKED
                          </Badge>
                        )}
                      </div>
                      <KeyPreview keyValue={apiKey.key} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4 text-xs text-[#6b8e6b]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {apiKey.lastUsed}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {apiKey.created}
                      </span>
                    </div>
                    {apiKey.status === "active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRevokeKey(apiKey.id);
                        }}
                        className="border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10 rounded-none"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Revoke
                      </Button>
                    ) : (
                      <Badge variant="outline" className="rounded-none border-[#1a2e1a] text-[#6b8e6b]">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {expandedKey === apiKey.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="border-t border-[#1a2e1a] overflow-hidden"
                    >
                      <div className="p-4 bg-[#050805]">
                        <p className="text-xs text-[#6b8e6b] font-mono mb-3">PERMISSIONS</p>
                        <div className="flex flex-wrap gap-2">
                          {apiKey.permissions.map((perm) => (
                            <div
                              key={perm.resource}
                              className="flex items-center gap-2 bg-[#0a0f0a] border border-[#1a2e1a] px-3 py-1.5"
                            >
                              <span className="text-xs text-[#e8f5e8] capitalize">{perm.resource}</span>
                              <PermissionBadge read={perm.read} write={perm.write} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreateKeyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreateKey}
      />
    </div>
  );
}

export default ApiKeyManager;
