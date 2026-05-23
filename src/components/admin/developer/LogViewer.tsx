"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  AlertCircle,
  Bug,
  Clock,
  Filter,
  X,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type LogLevel = "error" | "warn" | "info" | "debug";

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  context: Record<string, unknown>;
  traceId?: string;
}

const LOG_LEVELS: { level: LogLevel; label: string; color: string; icon: React.ElementType }[] = [
  { level: "error", label: "ERROR", color: "#dc2626", icon: AlertTriangle },
  { level: "warn", label: "WARN", color: "#fbbf24", icon: AlertCircle },
  { level: "info", label: "INFO", color: "#60a5fa", icon: Info },
  { level: "debug", label: "DEBUG", color: "#6b8e6b", icon: Bug },
];

const SERVICES = [
  "api",
  "database",
  "auth",
  "payment",
  "storage",
  "ai-service",
  "webhook",
  "worker",
];

const MOCK_LOGS: LogEntry[] = [
  {
    id: "log-001",
    timestamp: "2024-03-23T10:45:32.123Z",
    level: "error",
    service: "payment",
    message: "Payment processing failed for order ORD-8923",
    context: {
      orderId: "ORD-8923",
      customerId: "CUST-4521",
      amount: 129.99,
      currency: "USD",
      error: "Card declined: Insufficient funds",
      paymentMethod: "card_123456789",
      retryCount: 3,
    },
    traceId: "trace-abc123def456",
  },
  {
    id: "log-002",
    timestamp: "2024-03-23T10:44:15.789Z",
    level: "info",
    service: "api",
    message: "Order ORD-8922 created successfully",
    context: {
      orderId: "ORD-8922",
      customerId: "CUST-8901",
      items: 3,
      total: 245.5,
      processingTime: "124ms",
    },
    traceId: "trace-xyz789ghi012",
  },
  {
    id: "log-003",
    timestamp: "2024-03-23T10:43:58.456Z",
    level: "warn",
    service: "database",
    message: "Slow query detected on table 'orders'",
    context: {
      table: "orders",
      query: "SELECT * FROM orders WHERE created_at > $1",
      duration: "2450ms",
      threshold: "1000ms",
      rows: 15000,
    },
    traceId: "trace-mno345pqr678",
  },
  {
    id: "log-004",
    timestamp: "2024-03-23T10:43:22.111Z",
    level: "debug",
    service: "auth",
    message: "Token validation successful",
    context: {
      userId: "USR-1234",
      tokenType: "access",
      expiresIn: 3600,
      ipAddress: "192.168.1.100",
    },
  },
  {
    id: "log-005",
    timestamp: "2024-03-23T10:42:45.999Z",
    level: "error",
    service: "ai-service",
    message: "Image generation failed: Rate limit exceeded",
    context: {
      requestId: "REQ-9987",
      model: "dall-e-3",
      prompt: "Abstract geometric tattoo design",
      error: "RateLimitError: 429 Too Many Requests",
      retryAfter: 60,
    },
    traceId: "trace-stu901vwx234",
  },
  {
    id: "log-006",
    timestamp: "2024-03-23T10:41:33.777Z",
    level: "info",
    service: "webhook",
    message: "Webhook delivered successfully",
    context: {
      webhookId: "WH-001",
      endpoint: "https://api.example.com/webhooks",
      event: "order.created",
      statusCode: 200,
      responseTime: "234ms",
    },
  },
  {
    id: "log-007",
    timestamp: "2024-03-23T10:40:12.555Z",
    level: "debug",
    service: "storage",
    message: "File upload completed",
    context: {
      fileId: "FILE-5567",
      filename: "design_mockup_v2.png",
      size: 2456789,
      bucket: "designs",
      mimeType: "image/png",
    },
  },
  {
    id: "log-008",
    timestamp: "2024-03-23T10:39:45.333Z",
    level: "warn",
    service: "worker",
    message: "Job retry scheduled due to failure",
    context: {
      jobId: "JOB-3344",
      type: "send-email",
      attempt: 2,
      maxAttempts: 5,
      nextRetry: "2024-03-23T10:44:45Z",
      error: "Connection timeout",
    },
  },
  {
    id: "log-009",
    timestamp: "2024-03-23T10:38:22.111Z",
    level: "error",
    service: "database",
    message: "Connection pool exhausted",
    context: {
      maxConnections: 100,
      activeConnections: 100,
      waitingQueries: 23,
      recommendation: "Consider increasing pool size",
    },
    traceId: "trace-klm567nop890",
  },
  {
    id: "log-010",
    timestamp: "2024-03-23T10:37:15.888Z",
    level: "info",
    service: "api",
    message: "Cache invalidated for product PROD-1234",
    context: {
      productId: "PROD-1234",
      cacheKey: "product:PROD-1234",
      ttl: 300,
    },
  },
  {
    id: "log-011",
    timestamp: "2024-03-23T10:36:44.666Z",
    level: "debug",
    service: "auth",
    message: "Session refreshed",
    context: {
      sessionId: "SES-7890",
      userId: "USR-5678",
      oldExpiry: "2024-03-23T11:36:44Z",
      newExpiry: "2024-03-23T12:36:44Z",
    },
  },
  {
    id: "log-012",
    timestamp: "2024-03-23T10:35:33.444Z",
    level: "warn",
    service: "payment",
    message: "3D Secure authentication required",
    context: {
      orderId: "ORD-8920",
      paymentIntent: "pi_1234567890",
      customerId: "CUST-3321",
      amount: 599.99,
    },
  },
];

function LevelBadge({ level }: { level: LogLevel }) {
  const config = LOG_LEVELS.find((l) => l.level === level)!;
  const Icon = config.icon;
  return (
    <Badge
      className="rounded-none font-mono text-[10px] border-0"
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
      }}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>(["error", "warn", "info"]);
  const [selectedService, setSelectedService] = useState<string>("all");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Level filter
      if (!selectedLevels.includes(log.level)) return false;

      // Service filter
      if (selectedService !== "all" && log.service !== selectedService) return false;

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesMessage = log.message.toLowerCase().includes(query);
        const matchesService = log.service.toLowerCase().includes(query);
        const matchesContext = JSON.stringify(log.context).toLowerCase().includes(query);
        if (!matchesMessage && !matchesService && !matchesContext) return false;
      }

      // Date range
      if (dateFrom && new Date(log.timestamp) < new Date(dateFrom)) return false;
      if (dateTo && new Date(log.timestamp) > new Date(dateTo + "T23:59:59")) return false;

      return true;
    });
  }, [logs, selectedLevels, selectedService, searchQuery, dateFrom, dateTo]);

  const toggleLevel = (level: LogLevel) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const handleExport = () => {
    const data = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLevels(["error", "warn", "info", "debug"]);
    setSelectedService("all");
    setDateFrom("");
    setDateTo("");
  };

  const stats = useMemo(() => {
    return {
      total: logs.length,
      error: logs.filter((l) => l.level === "error").length,
      warn: logs.filter((l) => l.level === "warn").length,
      info: logs.filter((l) => l.level === "info").length,
      debug: logs.filter((l) => l.level === "debug").length,
    };
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#6b8e6b] font-mono">TOTAL</p>
            <p className="text-2xl font-black text-[#e8f5e8]">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#6b8e6b] font-mono">ERRORS</p>
            <p className="text-2xl font-black text-[#dc2626]">{stats.error}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#6b8e6b] font-mono">WARNINGS</p>
            <p className="text-2xl font-black text-[#fbbf24]">{stats.warn}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#6b8e6b] font-mono">INFO</p>
            <p className="text-2xl font-black text-[#60a5fa]">{stats.info}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#6b8e6b] font-mono">DEBUG</p>
            <p className="text-2xl font-black text-[#6b8e6b]">{stats.debug}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
        <CardHeader className="pb-4">
          <CardTitle className="font-black tracking-tighter text-[#e8f5e8] text-sm flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#4ade80]" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Service */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8e6b]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="pl-10 bg-[#050805] border-[#1a2e1a] text-[#e8f5e8] rounded-none focus:border-[#4ade80]"
              />
            </div>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="bg-[#050805] border-[#1a2e1a] text-[#e8f5e8] rounded-none focus:border-[#4ade80]">
                <SelectValue placeholder="All services" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
                <SelectItem value="all" className="text-[#e8f5e8] focus:bg-[#1a2e1a] focus:text-[#e8f5e8]">
                  All services
                </SelectItem>
                {SERVICES.map((service) => (
                  <SelectItem
                    key={service}
                    value={service}
                    className="text-[#e8f5e8] focus:bg-[#1a2e1a] focus:text-[#e8f5e8]"
                  >
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                onClick={handleExport}
                variant="outline"
                className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          {/* Level Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs text-[#6b8e6b] font-mono">LEVELS:</span>
            {LOG_LEVELS.map(({ level, label, color }) => (
              <div key={level} className="flex items-center gap-2">
                <Checkbox
                  id={`level-${level}`}
                  checked={selectedLevels.includes(level)}
                  onCheckedChange={() => toggleLevel(level)}
                  className="border-[#1a2e1a] data-[state=checked]:bg-[#4ade80] data-[state=checked]:border-[#4ade80]"
                />
                <Label
                  htmlFor={`level-${level}`}
                  className="text-xs font-mono cursor-pointer"
                  style={{ color }}
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>

          {/* Date Range */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs text-[#6b8e6b] font-mono">DATE RANGE:</span>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#6b8e6b]" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-[#050805] border-[#1a2e1a] text-[#e8f5e8] rounded-none focus:border-[#4ade80]"
              />
            </div>
            <span className="text-[#6b8e6b]">to</span>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#6b8e6b]" />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-[#050805] border-[#1a2e1a] text-[#e8f5e8] rounded-none focus:border-[#4ade80]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-black tracking-tighter text-[#e8f5e8] flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#4ade80]" />
            System Logs
            <Badge className="rounded-none bg-[#1a2e1a] text-[#6b8e6b] ml-2">
              {filteredLogs.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-[#1a2e1a] overflow-hidden">
            {/* Terminal-style header */}
            <div className="bg-[#050805] px-4 py-2 border-b border-[#1a2e1a] flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#dc2626]" />
                <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
              </div>
              <span className="ml-4 text-xs text-[#6b8e6b] font-mono">system.log</span>
            </div>

            {/* Logs */}
            <div className="divide-y divide-[#1a2e1a]">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-[#6b8e6b]">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-mono">No logs match your filters</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id}>
                    <div
                      className="p-3 hover:bg-[#1a2e1a]/20 cursor-pointer transition-colors"
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        {/* Timestamp */}
                        <span className="text-xs font-mono text-[#6b8e6b] whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </span>

                        {/* Level Badge */}
                        <LevelBadge level={log.level} />

                        {/* Service */}
                        <Badge
                          variant="outline"
                          className="rounded-none border-[#1a2e1a] text-[#6b8e6b] text-[10px] font-mono w-fit"
                        >
                          {log.service}
                        </Badge>

                        {/* Message */}
                        <span className="text-sm text-[#e8f5e8] font-mono truncate flex-1">
                          {log.message}
                        </span>

                        {/* Expand Icon */}
                        {expandedLog === log.id ? (
                          <ChevronUp className="w-4 h-4 text-[#6b8e6b] flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#6b8e6b] flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedLog === log.id && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden border-t border-[#1a2e1a]"
                        >
                          <div className="p-4 bg-[#050805]">
                            {log.traceId && (
                              <div className="mb-3">
                                <span className="text-xs text-[#6b8e6b] font-mono">TRACE ID:</span>
                                <code className="ml-2 text-xs font-mono text-[#4ade80]">
                                  {log.traceId}
                                </code>
                              </div>
                            )}
                            <div>
                              <span className="text-xs text-[#6b8e6b] font-mono">CONTEXT:</span>
                              <pre className="mt-2 p-3 bg-[#0a0f0a] border border-[#1a2e1a] text-xs font-mono text-[#e8f5e8] overflow-x-auto">
                                {JSON.stringify(log.context, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LogViewer;
