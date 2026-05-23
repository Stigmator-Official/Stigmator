"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { cn } from "@/lib/utils";
import { Globe, Search, Users, Mail, Link2 } from "lucide-react";

interface TrafficSource {
  name: string;
  visitors: number;
  percentage: number;
}

interface TrafficSourcesProps {
  data: TrafficSource[];
  className?: string;
}

const COLORS = {
  "Organic Search": "#4ade80",
  Direct: "#60a5fa",
  "Social Media": "#fbbf24",
  Referral: "#a78bfa",
  Email: "#f87171",
};

const ICONS = {
  "Organic Search": Search,
  Direct: Globe,
  "Social Media": Users,
  Referral: Link2,
  Email: Mail,
};

const renderActiveShape = (props: {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
  payload?: { name: string };
  percent?: number;
  value?: number;
}) => {
  const {
    cx = 0, cy = 0, innerRadius = 0, outerRadius = 0, startAngle = 0, endAngle = 0,
    fill = "#4ade80", payload, value = 0,
  } = props;
  
  return (
    <g>
      <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#e8f5e8" className="text-lg font-black">
        {payload?.name}
      </text>
      <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#6b8e6b" className="text-sm font-mono">
        {value.toLocaleString()} visitors
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 6}
        fill={fill}
      />
    </g>
  );
};

export function TrafficSources({ data, className }: TrafficSourcesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const totalVisitors = data.reduce((sum, d) => sum + d.visitors, 0);
  
  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };
  
  return (
    <div className={cn("bg-[#0a0f0a] border border-[#1a2e1a]", className)}>
      {/* Header */}
      <div className="p-6 border-b border-[#1a2e1a]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black tracking-tight text-[#e8f5e8]">
              Traffic Sources
            </h3>
            <p className="text-xs font-mono text-[#6b8e6b] mt-1">
              Where your visitors come from
            </p>
          </div>
          <div className="p-2 bg-[#60a5fa]/10">
            <Globe className="w-5 h-5 text-[#60a5fa]" />
          </div>
        </div>
        
        {/* Total Visitors */}
        <div className="mt-4 p-3 bg-[#050805] border border-[#1a2e1a]">
          <p className="text-xs font-mono text-[#6b8e6b] uppercase">Total Visitors</p>
          <p className="text-2xl font-black text-[#e8f5e8] mt-1">{totalVisitors.toLocaleString()}</p>
        </div>
      </div>
      
      {/* Chart */}
      <div className="p-6">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="visitors"
                onMouseEnter={onPieEnter}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === activeIndex ? COLORS[entry.name as keyof typeof COLORS] || "#6b8e6b" : (COLORS[entry.name as keyof typeof COLORS] || "#6b8e6b") + "cc"}
                    stroke="#0a0f0a"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-4 space-y-2">
          {data.map((source, index) => {
            const Icon = ICONS[source.name as keyof typeof ICONS] || Globe;
            const color = COLORS[source.name as keyof typeof COLORS] || "#6b8e6b";
            const isActive = activeIndex === index;
            
            return (
              <button
                key={source.name}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "w-full flex items-center justify-between p-2",
                  "border transition-all duration-200",
                  isActive
                    ? "bg-[#1a2e1a] border-[#4ade80]/30"
                    : "bg-[#050805] border-[#1a2e1a] hover:border-[#1a2e1a]/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center"
                    style={{ backgroundColor: `${color}1a` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[#e8f5e8]">{source.name}</p>
                    <p className="text-xs font-mono text-[#6b8e6b]">
                      {source.visitors.toLocaleString()} visitors
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className="text-sm font-mono font-bold"
                    style={{ color }}
                  >
                    {source.percentage}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TrafficSources;
