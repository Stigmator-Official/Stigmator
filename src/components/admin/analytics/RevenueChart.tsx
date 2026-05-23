"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";

interface DailyMetric {
  date: string;
  revenue: number;
  profit: number;
  orders: number;
  visitors: number;
  conversionRate: number;
}

interface RevenueChartProps {
  data: DailyMetric[];
  className?: string;
}

type MetricType = "revenue" | "profit" | "both";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-3 shadow-xl">
      <p className="text-xs font-mono text-[#6b8e6b] mb-2">{formatDate(label || "")}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="w-2 h-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-[#6b8e6b] capitalize">{entry.name}:</span>
            <span className="text-sm font-mono font-bold text-[#e8f5e8]">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RevenueChart({ data, className }: RevenueChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("both");
  const [hoveredData, setHoveredData] = useState<DailyMetric | null>(null);
  
  // Calculate totals and trends
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalProfit = data.reduce((sum, d) => sum + d.profit, 0);
  const avgDailyRevenue = totalRevenue / data.length;
  
  // Calculate trend (compare first half to second half)
  const midPoint = Math.floor(data.length / 2);
  const firstHalfRevenue = data.slice(0, midPoint).reduce((sum, d) => sum + d.revenue, 0);
  const secondHalfRevenue = data.slice(midPoint).reduce((sum, d) => sum + d.revenue, 0);
  const trend = ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100;
  
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  
  return (
    <div className={cn("bg-[#0a0f0a] border border-[#1a2e1a]", className)}>
      {/* Header */}
      <div className="p-6 border-b border-[#1a2e1a]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-black tracking-tight text-[#e8f5e8]">
              Revenue Overview
            </h3>
            <p className="text-xs font-mono text-[#6b8e6b] mt-1">
              Daily revenue and profit metrics
            </p>
          </div>
          
          {/* Metric Toggle */}
          <div className="flex items-center gap-1 bg-[#050805] border border-[#1a2e1a] p-1">
            {([
              { value: "revenue", label: "Revenue" },
              { value: "profit", label: "Profit" },
              { value: "both", label: "Both" },
            ] as { value: MetricType; label: string }[]).map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedMetric(option.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-mono font-bold transition-all",
                  selectedMetric === option.value
                    ? "bg-[#4ade80] text-black"
                    : "text-[#6b8e6b] hover:text-[#e8f5e8]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-3 bg-[#050805] border border-[#1a2e1a]">
            <p className="text-xs font-mono text-[#6b8e6b] uppercase">Total Revenue</p>
            <p className="text-xl font-black text-[#e8f5e8] mt-1">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="p-3 bg-[#050805] border border-[#1a2e1a]">
            <p className="text-xs font-mono text-[#6b8e6b] uppercase">Total Profit</p>
            <p className="text-xl font-black text-[#4ade80] mt-1">{formatCurrency(totalProfit)}</p>
          </div>
          <div className="p-3 bg-[#050805] border border-[#1a2e1a]">
            <p className="text-xs font-mono text-[#6b8e6b] uppercase">Avg Daily</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xl font-black text-[#e8f5e8]">{formatCurrency(avgDailyRevenue)}</p>
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-[#4ade80]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#dc2626]" />
              )}
            </div>
          </div>
          <div className="p-3 bg-[#050805] border border-[#1a2e1a]">
            <p className="text-xs font-mono text-[#6b8e6b] uppercase">Profit Margin</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xl font-black text-[#e8f5e8]">{profitMargin.toFixed(1)}%</p>
              <Percent className="w-4 h-4 text-[#6b8e6b]" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="p-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              onMouseMove={(e) => {
                if (e && typeof e === 'object' && 'activePayload' in e && e.activePayload && Array.isArray(e.activePayload) && e.activePayload[0]) {
                  setHoveredData(e.activePayload[0].payload as DailyMetric);
                }
              }}
              onMouseLeave={() => setHoveredData(null)}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1a2e1a"
                vertical={false}
              />
              
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#6b8e6b"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
                tickLine={false}
                axisLine={{ stroke: "#1a2e1a" }}
                minTickGap={30}
              />
              
              <YAxis
                stroke="#6b8e6b"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
                tickLine={false}
                axisLine={{ stroke: "#1a2e1a" }}
                tickFormatter={(value: number) => `$${(value / 1000).toFixed(1)}k`}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {(selectedMetric === "revenue" || selectedMetric === "both") && (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#4ade80"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  animationDuration={1000}
                />
              )}
              
              {(selectedMetric === "profit" || selectedMetric === "both") && (
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  fill="url(#profitGradient)"
                />
              )}
              
              {/* Average line */}
              <ReferenceLine
                y={avgDailyRevenue}
                stroke="#6b8e6b"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
              />
              
              {/* Brush for zooming */}
              <Brush
                dataKey="date"
                height={30}
                stroke="#4ade80"
                fill="#0a0f0a"
                tickFormatter={formatDate}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          {(selectedMetric === "revenue" || selectedMetric === "both") && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#4ade80]" />
              <span className="text-xs font-mono text-[#6b8e6b]">Revenue</span>
            </div>
          )}
          {(selectedMetric === "profit" || selectedMetric === "both") && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#60a5fa]" />
              <span className="text-xs font-mono text-[#6b8e6b]">Profit</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-[#6b8e6b] border-dashed border-t border-[#6b8e6b]" style={{ borderStyle: "dashed" }} />
            <span className="text-xs font-mono text-[#6b8e6b]">Average</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevenueChart;
