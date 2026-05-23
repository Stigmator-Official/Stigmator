"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Key,
  Webhook,
  Terminal,
  Activity,
  Code2,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/Breadcrumb";
import {
  ApiKeyManager,
  WebhookTester,
  LogViewer,
  HealthCheck,
} from "@/components/admin/developer";
import { cn } from "@/lib/utils";

const TABS = [
  {
    id: "api-keys",
    label: "API Keys",
    icon: Key,
    description: "Manage API keys and permissions",
  },
  {
    id: "webhooks",
    label: "Webhooks",
    icon: Webhook,
    description: "Configure webhook endpoints",
  },
  {
    id: "logs",
    label: "Logs",
    icon: Terminal,
    description: "View system logs and events",
  },
  {
    id: "health",
    label: "System Status",
    icon: Activity,
    description: "Monitor service health",
  },
];

export default function DeveloperPage() {
  const [activeTab, setActiveTab] = useState("api-keys");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Developer Tools"
        description="Platform developer tools for API management, webhooks, logging, and system monitoring."
        breadcrumb={[{ label: "Developer" }]}
        actions={
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0f0a] border border-[#1a2e1a]">
            <Code2 className="w-4 h-4 text-[#4ade80]" />
            <span className="text-xs font-mono text-[#6b8e6b]">API v1.0.0</span>
          </div>
        }
      />

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 p-4 bg-[#fbbf24]/10 border border-[#fbbf24]/30"
      >
        <AlertCircle className="w-5 h-5 text-[#fbbf24] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[#fbbf24]">Developer Access</p>
          <p className="text-xs text-[#6b8e6b] mt-1">
            These tools are intended for platform developers. Changes made here can affect
            production systems. Use with caution.
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#0a0f0a] border border-[#1a2e1a] rounded-none p-0 h-auto w-full flex flex-wrap">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex-1 min-w-[140px] rounded-none px-6 py-4 flex items-center justify-center gap-3",
                  "data-[state=active]:bg-[#4ade80]/10 data-[state=active]:text-[#4ade80]",
                  "data-[state=active]:border-b-2 data-[state=active]:border-[#4ade80]",
                  "text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a]/50",
                  "transition-all duration-200"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "text-[#4ade80]")} />
                <div className="text-left">
                  <span className="font-bold text-sm block">{tab.label}</span>
                  <span className="text-[10px] font-mono opacity-70 hidden sm:block">
                    {tab.description}
                  </span>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="api-keys" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ApiKeyManager />
          </motion.div>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WebhookTester />
          </motion.div>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LogViewer />
          </motion.div>
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HealthCheck />
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#1a2e1a]">
        <a
          href="#"
          className="group p-4 bg-[#0a0f0a] border border-[#1a2e1a] hover:border-[#4ade80]/50 transition-colors"
        >
          <p className="text-sm font-medium text-[#e8f5e8] group-hover:text-[#4ade80]">
            API Documentation
          </p>
          <p className="text-xs text-[#6b8e6b] mt-1">
            View complete API reference and guides
          </p>
        </a>
        <a
          href="#"
          className="group p-4 bg-[#0a0f0a] border border-[#1a2e1a] hover:border-[#4ade80]/50 transition-colors"
        >
          <p className="text-sm font-medium text-[#e8f5e8] group-hover:text-[#4ade80]">
            SDK Downloads
          </p>
          <p className="text-xs text-[#6b8e6b] mt-1">
            Official SDKs for JavaScript, Python, Go
          </p>
        </a>
        <a
          href="#"
          className="group p-4 bg-[#0a0f0a] border border-[#1a2e1a] hover:border-[#4ade80]/50 transition-colors"
        >
          <p className="text-sm font-medium text-[#e8f5e8] group-hover:text-[#4ade80]">
            Support
          </p>
          <p className="text-xs text-[#6b8e6b] mt-1">
            Contact developer support team
          </p>
        </a>
      </div>
    </div>
  );
}
