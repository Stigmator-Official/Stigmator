"use client";

import React, { useState, useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, Package, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface TopProduct {
  id: string;
  name: string;
  image: string;
  sales: number;
  revenue: number;
  growth: number;
}

type SortKey = "name" | "sales" | "revenue" | "growth";
type SortDirection = "asc" | "desc";

interface TopProductsProps {
  products: TopProduct[];
  className?: string;
  maxItems?: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function TopProducts({ products, className, maxItems = 8 }: TopProductsProps) {
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  const sortedProducts = useMemo(() => {
    const sorted = [...products].sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "sales":
          comparison = a.sales - b.sales;
          break;
        case "revenue":
          comparison = a.revenue - b.revenue;
          break;
        case "growth":
          comparison = a.growth - b.growth;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return sorted.slice(0, maxItems);
  }, [products, sortKey, sortDirection, maxItems]);
  
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };
  
  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <Minus className="w-3 h-3 text-[#6b8e6b]" />;
    return sortDirection === "asc" ? (
      <ArrowUpRight className="w-3 h-3 text-[#4ade80] rotate-180" />
    ) : (
      <ArrowUpRight className="w-3 h-3 text-[#4ade80]" />
    );
  };
  
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
  const totalSales = products.reduce((sum, p) => sum + p.sales, 0);
  
  return (
    <div className={cn("bg-[#0a0f0a] border border-[#1a2e1a]", className)}>
      {/* Header */}
      <div className="p-6 border-b border-[#1a2e1a]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black tracking-tight text-[#e8f5e8]">
              Top Products
            </h3>
            <p className="text-xs font-mono text-[#6b8e6b] mt-1">
              Best performing garments by revenue
            </p>
          </div>
          <div className="p-2 bg-[#4ade80]/10">
            <Package className="w-5 h-5 text-[#4ade80]" />
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-[#050805] border border-[#1a2e1a]">
            <p className="text-xs font-mono text-[#6b8e6b] uppercase">Top Products Revenue</p>
            <p className="text-lg font-black text-[#e8f5e8] mt-1">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="p-3 bg-[#050805] border border-[#1a2e1a]">
            <p className="text-xs font-mono text-[#6b8e6b] uppercase">Total Units Sold</p>
            <p className="text-lg font-black text-[#e8f5e8] mt-1">{formatNumber(totalSales)}</p>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a2e1a] bg-[#050805]">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider hover:text-[#e8f5e8] transition-colors"
                >
                  Product
                  {getSortIcon("name")}
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort("sales")}
                  className="flex items-center justify-end gap-1 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider hover:text-[#e8f5e8] transition-colors ml-auto"
                >
                  Sales
                  {getSortIcon("sales")}
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort("revenue")}
                  className="flex items-center justify-end gap-1 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider hover:text-[#e8f5e8] transition-colors ml-auto"
                >
                  Revenue
                  {getSortIcon("revenue")}
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort("growth")}
                  className="flex items-center justify-end gap-1 text-xs font-mono text-[#6b8e6b] uppercase tracking-wider hover:text-[#e8f5e8] transition-colors ml-auto"
                >
                  Growth
                  {getSortIcon("growth")}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product, index) => {
              const isPositive = product.growth > 0;
              const isNegative = product.growth < 0;
              
              return (
                <tr
                  key={product.id}
                  className="border-b border-[#1a2e1a]/50 hover:bg-[#1a2e1a]/20 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-[#1a2e1a] text-xs font-mono font-bold text-[#6b8e6b]">
                        {index + 1}
                      </span>
                      <div className="w-10 h-10 bg-[#1a2e1a] flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <div className="w-full h-full bg-[#1a2e1a] relative">
                            <div className="absolute inset-0 flex items-center justify-center text-[#6b8e6b] text-xs">
                              IMG
                            </div>
                          </div>
                        ) : (
                          <Package className="w-5 h-5 text-[#6b8e6b]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#e8f5e8] truncate max-w-[150px]">
                          {product.name}
                        </p>
                        <p className="text-xs font-mono text-[#6b8e6b]">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-mono text-[#e8f5e8]">
                      {formatNumber(product.sales)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-mono font-bold text-[#e8f5e8]">
                      {formatCurrency(product.revenue)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 text-xs font-mono font-bold",
                        isPositive && "bg-[#4ade80]/10 text-[#4ade80]",
                        isNegative && "bg-[#dc2626]/10 text-[#dc2626]",
                        !isPositive && !isNegative && "bg-[#1a2e1a] text-[#6b8e6b]"
                      )}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : isNegative ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : null}
                      {isPositive ? "+" : ""}
                      {product.growth.toFixed(1)}%
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-[#1a2e1a] bg-[#050805]">
        <p className="text-xs text-center text-[#6b8e6b]">
          Showing top {Math.min(maxItems, products.length)} of {products.length} products
        </p>
      </div>
    </div>
  );
}

export default TopProducts;
