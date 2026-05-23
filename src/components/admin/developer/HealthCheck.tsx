"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Database,
  Server,
  Cpu,
  HardDrive,
  Globe,
  Zap,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ServiceStatus = "healthy" | "degraded" | "down";

interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  responseTime: number;
  uptime: number;
  lastChecked: string;
  icon: React.ElementType;
}

interface Metric {
  name: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  trendValue: number;
}

const INITIAL_SERVICES: Service[] = [
  {
    id: "database",
    name: "Database",
    status: "healthy",
    responseTime: 12,
    uptime: 99.99,
    lastChecked: "Just now",
    icon: Database,
  },
  {
    id: "api",
    name: "API Server",
    status: "healthy",
    responseTime: 45,
    uptime: 99.95,
    lastChecked: "Just now",
    icon: Server,
  },
  {
    id: "ai",
    name: "AI Service",
    status: "degraded",
    responseTime: 2345,
    uptime: 98.5,
    lastChecked: "2 min ago",
    icon: Zap,
  },
  {
    id: "storage",
    name: "Storage",
    status: "healthy",
    responseTime: 89,
    uptime: 99.99,
    lastChecked: "Just now",
    icon: HardDrive,
  },
  {
    id: "auth",
    name: "Authentication",
    status: "healthy",
    responseTime: 34,
    uptime: 99.98,
    lastChecked: "Just now",
    icon: Globe,
  },
];

const INITIAL_METRICS: Metric[] = [
  { name: "CPU Usage", value: 42, unit: "%", trend: "stable", trendValue: 0 },
  { name: "Memory", value: 68, unit: "%", trend: "up", trendValue: 5 },
  { name: "Disk Usage", value: 73, unit: "%", trend: "up", trendValue: 2 },
];

// Mock response times data for sparkline
const RESPONSE_TIME_HISTORY = [
  [45, 52, 48, 55, 49, 46, 51, 47, 44, 48, 52, 45],
  [12, 15, 11, 13, 14, 12, 16, 11, 13, 12, 15, 12],
  [1800, 2100, 1950, 2345, 2200, 2100, 2450, 2300, 2150, 2200, 2350, 2345],
  [89, 92, 87, 95, 91, 88, 94, 86, 90, 93, 89, 89],
  [34, 36, 33, 35, 37, 34, 36, 33, 35, 34, 36, 34],
];

function StatusIcon({ status }: { status: ServiceStatus }) {
  switch (status) {
    case "healthy":
      return <CheckCircle className="w-5 h-5 text-[#4ade80]" />;
    case "degraded":
      return <AlertTriangle className="w-5 h-5 text-[#fbbf24]" />;
    case "down":
      return <XCircle className="w-5 h-5 text-[#dc2626]" />;
  }
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  switch (status) {
    case "healthy":
      return (
        <Badge className="rounded-none bg-[#4ade80] text-black text-xs font-mono">
          HEALTHY
        </Badge>
      );
    case "degraded":
      return (
        <Badge className="rounded-none bg-[#fbbf24] text-black text-xs font-mono">
          DEGRADED
        </Badge>
      );
    case "down":
      return (
        <Badge className="rounded-none bg-[#dc2626] text-white text-xs font-mono">
          DOWN
        </Badge>
      );
  }
}

function TrendIndicator({ trend, value }: { trend: "up" | "down" | "stable"; value: number }) {
  if (trend === "stable") {
    return (
      <div className="flex items-center gap-1 text-[#6b8e6b]">
        <Minus className="w-3 h-3" />
        <span className="text-xs font-mono">0%</span>
      </div>
    );
  }
  if (trend === "up") {
    return (
      <div className="flex items-center gap-1 text-[#dc2626]">
        <TrendingUp className="w-3 h-3" />
        <span className="text-xs font-mono">+{value}%</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-[#4ade80]">
      <TrendingDown className="w-3 h-3" />
      <span className="text-xs font-mono">-{value}%</span>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-12">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      {/* Gradient fill */}
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`${color}20`}
      />
    </svg>
  );
}

function MetricBar({ value, max = 100, color = "#4ade80" }: { value: number; max?: number; color?: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 bg-[#1a2e1a] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

export function HealthCheck() {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [metrics, setMetrics] = useState<Metric[]>(INITIAL_METRICS);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setServices((prev) =>
        prev.map((service) => ({
          ...service,
          responseTime: Math.max(5, service.responseTime + Math.floor(Math.random() * 20 - 10)),
          lastChecked: "Just now",
        }))
      );
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value: Math.min(100, Math.max(0, metric.value + Math.floor(Math.random() * 10 - 5))),
        }))
      );
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const healthyCount = services.filter((s) => s.status === "healthy").length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;
  const downCount = services.filter((s) => s.status === "down").length;

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card
          className={cn(
            "rounded-none border-2",
            downCount > 0
              ? "bg-[#dc2626]/10 border-[#dc2626]"
              : degradedCount > 0
              ? "bg-[#fbbf24]/10 border-[#fbbf24]"
              : "bg-[#4ade80]/10 border-[#4ade80]"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#6b8e6b]">SYSTEM STATUS</p>
                <p
                  className={cn(
                    "text-2xl font-black",
                    downCount > 0
                      ? "text-[#dc2626]"
                      : degradedCount > 0
                      ? "text-[#fbbf24]"
                      : "text-[#4ade80]"
                  )}
                >
                  {downCount > 0 ? "CRITICAL" : degradedCount > 0 ? "WARNING" : "OPERATIONAL"}
                </p>
              </div>
              <Activity
                className={cn(
                  "w-8 h-8",
                  downCount > 0
                    ? "text-[#dc2626]"
                    : degradedCount > 0
                    ? "text-[#fbbf24]"
                    : "text-[#4ade80]"
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <p className="text-xs font-mono text-[#6b8e6b]">HEALTHY</p>
            <p className="text-2xl font-black text-[#4ade80]">{healthyCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <p className="text-xs font-mono text-[#6b8e6b]">DEGRADED</p>
            <p className="text-2xl font-black text-[#fbbf24]">{degradedCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <p className="text-xs font-mono text-[#6b8e6b]">DOWN</p>
            <p className="text-2xl font-black text-[#dc2626]">{downCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Health Grid */}
      <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-black tracking-tighter text-[#e8f5e8] flex items-center gap-2">
            <Server className="w-5 h-5 text-[#4ade80]" />
            Service Health
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6b8e6b] font-mono">
              <Clock className="w-3 h-3 inline mr-1" />
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {services.map((service, index) => {
              const Icon = service.icon;
              const sparklineColor =
                service.status === "healthy"
                  ? "#4ade80"
                  : service.status === "degraded"
                  ? "#fbbf24"
                  : "#dc2626";

              return (
                <div
                  key={service.id}
                  className="border border-[#1a2e1a] p-4 hover:border-[#1a2e1a]/80 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 flex items-center justify-center",
                          service.status === "healthy"
                            ? "bg-[#4ade80]/10"
                            : service.status === "degraded"
                            ? "bg-[#fbbf24]/10"
                            : "bg-[#dc2626]/10"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5",
                            service.status === "healthy"
                              ? "text-[#4ade80]"
                              : service.status === "degraded"
                              ? "text-[#fbbf24]"
                              : "text-[#dc2626]"
                          )}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-[#e8f5e8]">{service.name}</p>
                        <p className="text-xs text-[#6b8e6b]">Last checked: {service.lastChecked}</p>
                      </div>
                    </div>
                    <StatusBadge status={service.status} />
                  </div>

                  {/* Response Time Sparkline */}
                  <div className="mb-3">
                    <Sparkline data={RESPONSE_TIME_HISTORY[index]} color={sparklineColor} />
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-[#6b8e6b] font-mono mb-1">RESPONSE TIME</p>
                      <p
                        className={cn(
                          "font-mono",
                          service.responseTime > 1000
                            ? "text-[#fbbf24]"
                            : "text-[#e8f5e8]"
                        )}
                      >
                        {service.responseTime}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6b8e6b] font-mono mb-1">UPTIME</p>
                      <p className="font-mono text-[#e8f5e8]">{service.uptime}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
        <CardHeader>
          <CardTitle className="font-black tracking-tighter text-[#e8f5e8] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#4ade80]" />
            System Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((metric) => {
              const color =
                metric.value > 80 ? "#dc2626" : metric.value > 60 ? "#fbbf24" : "#4ade80";

              return (
                <div key={metric.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {metric.name === "CPU Usage" && <Cpu className="w-4 h-4 text-[#6b8e6b]" />}
                      {metric.name === "Memory" && <Activity className="w-4 h-4 text-[#6b8e6b]" />}
                      {metric.name === "Disk Usage" && <HardDrive className="w-4 h-4 text-[#6b8e6b]" />}
                      <span className="text-sm font-medium text-[#e8f5e8]">{metric.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendIndicator trend={metric.trend} value={metric.trendValue} />
                      <span className="text-lg font-black font-mono" style={{ color }}>
                        {metric.value}{metric.unit}
                      </span>
                    </div>
                  </div>
                  <MetricBar value={metric.value} color={color} />
                </div>
              );
            })}
          </div>

          {/* Additional Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#1a2e1a]">
            <div className="text-center">
              <p className="text-xs text-[#6b8e6b] font-mono mb-1">REQUESTS/MIN</p>
              <p className="text-2xl font-black text-[#e8f5e8]">1,247</p>
              <p className="text-xs text-[#4ade80]">+12% from last hour</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#6b8e6b] font-mono mb-1">ERROR RATE</p>
              <p className="text-2xl font-black text-[#e8f5e8]">0.12%</p>
              <p className="text-xs text-[#4ade80]">-0.05% from last hour</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#6b8e6b] font-mono mb-1">AVG LATENCY</p>
              <p className="text-2xl font-black text-[#e8f5e8]">124ms</p>
              <p className="text-xs text-[#dc2626]">+8ms from last hour</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#6b8e6b] font-mono mb-1">THROUGHPUT</p>
              <p className="text-2xl font-black text-[#e8f5e8]">45.2 MB/s</p>
              <p className="text-xs text-[#4ade80]">+2.1 MB/s from last hour</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HealthCheck;
