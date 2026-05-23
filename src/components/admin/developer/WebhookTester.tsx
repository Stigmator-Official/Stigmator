"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Webhook,
  Plus,
  Send,
  Trash2,
  Check,
  X,
  Clock,
  Globe,
  Shield,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

interface DeliveryLog {
  id: string;
  timestamp: string;
  statusCode: number;
  success: boolean;
  retryCount: number;
  payload: string;
  response: string;
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  status: "active" | "inactive";
  lastDelivery: string;
  deliveryCount: number;
  failureCount: number;
  logs: DeliveryLog[];
}

const AVAILABLE_EVENTS = [
  "order.created",
  "order.updated",
  "order.cancelled",
  "payment.success",
  "payment.failed",
  "customer.created",
  "customer.updated",
  "product.created",
  "product.updated",
  "inventory.low",
  "shipment.shipped",
  "shipment.delivered",
];

const MOCK_WEBHOOKS: Webhook[] = [
  {
    id: "wh-001",
    url: "https://api.example.com/webhooks/stigmator",
    events: ["order.created", "order.updated", "payment.success"],
    secret: "whsec_8f7d6s5a4f3d2g1h",
    status: "active",
    lastDelivery: "2 min ago",
    deliveryCount: 1247,
    failureCount: 3,
    logs: [
      {
        id: "del-001",
        timestamp: "2024-03-23T09:45:32Z",
        statusCode: 200,
        success: true,
        retryCount: 0,
        payload: JSON.stringify({ event: "order.created", data: { orderId: "ORD-001" } }, null, 2),
        response: "{ \"received\": true }",
      },
      {
        id: "del-002",
        timestamp: "2024-03-23T09:30:15Z",
        statusCode: 500,
        success: false,
        retryCount: 2,
        payload: JSON.stringify({ event: "payment.success", data: { paymentId: "PAY-002" } }, null, 2),
        response: "Internal Server Error",
      },
    ],
  },
  {
    id: "wh-002",
    url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX",
    events: ["order.created", "inventory.low"],
    secret: "whsec_slack_9i8u7y6t5r4e3w2q",
    status: "active",
    lastDelivery: "15 min ago",
    deliveryCount: 856,
    failureCount: 0,
    logs: [
      {
        id: "del-003",
        timestamp: "2024-03-23T09:35:00Z",
        statusCode: 200,
        success: true,
        retryCount: 0,
        payload: JSON.stringify({ event: "inventory.low", data: { productId: "PROD-123", stock: 5 } }, null, 2),
        response: "ok",
      },
    ],
  },
];

const TEST_PAYLOAD = {
  event: "order.created",
  timestamp: "2024-03-23T10:00:00Z",
  data: {
    orderId: "ORD-TEST-001",
    customer: {
      id: "CUST-001",
      email: "test@example.com",
      name: "Test Customer",
    },
    items: [
      { productId: "PROD-001", quantity: 2, price: 49.99 },
      { productId: "PROD-002", quantity: 1, price: 89.99 },
    ],
    total: 189.97,
    currency: "USD",
    status: "pending",
  },
};

function StatusBadge({ status }: { status: "active" | "inactive" }) {
  return status === "active" ? (
    <Badge className="rounded-none bg-[#4ade80] text-black text-xs font-mono">ACTIVE</Badge>
  ) : (
    <Badge variant="outline" className="rounded-none border-[#1a2e1a] text-[#6b8e6b] text-xs font-mono">
      INACTIVE
    </Badge>
  );
}

function DeliveryStatus({ success, statusCode }: { success: boolean; statusCode: number }) {
  return success ? (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-[#4ade80]" />
      <span className="text-xs font-mono text-[#4ade80]">{statusCode}</span>
      <Badge className="rounded-none bg-[#4ade80] text-black text-[10px]">OK</Badge>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-[#dc2626]" />
      <span className="text-xs font-mono text-[#dc2626]">{statusCode}</span>
      <Badge className="rounded-none bg-[#dc2626] text-white text-[10px]">FAIL</Badge>
    </div>
  );
}

export function WebhookTester() {
  const [webhooks, setWebhooks] = useState<Webhook[]>(MOCK_WEBHOOKS);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<string | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Form state
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    const newWebhook: Webhook = {
      id: `wh-${Date.now()}`,
      url,
      events: selectedEvents,
      secret: secret || `whsec_${Math.random().toString(36).substring(2, 18)}`,
      status: "active",
      lastDelivery: "Never",
      deliveryCount: 0,
      failureCount: 0,
      logs: [],
    };
    setWebhooks([newWebhook, ...webhooks]);
    setUrl("");
    setSecret("");
    setSelectedEvents([]);
    setCreateDialogOpen(false);
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
  };

  const handleTestWebhook = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setTestDialogOpen(true);
  };

  const handleSendTest = () => {
    if (!selectedWebhook) return;
    
    const newLog: DeliveryLog = {
      id: `del-${Date.now()}`,
      timestamp: new Date().toISOString(),
      statusCode: 200,
      success: true,
      retryCount: 0,
      payload: JSON.stringify(TEST_PAYLOAD, null, 2),
      response: JSON.stringify({ received: true, timestamp: new Date().toISOString() }, null, 2),
    };

    setWebhooks(
      webhooks.map((w) =>
        w.id === selectedWebhook.id
          ? {
              ...w,
              lastDelivery: "Just now",
              deliveryCount: w.deliveryCount + 1,
              logs: [newLog, ...w.logs],
            }
          : w
      )
    );
    setTestDialogOpen(false);
  };

  const copyPayload = async () => {
    await navigator.clipboard.writeText(JSON.stringify(TEST_PAYLOAD, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#6b8e6b] font-mono">WEBHOOKS</p>
            <p className="text-2xl font-black text-[#e8f5e8]">{webhooks.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#6b8e6b] font-mono">ACTIVE</p>
            <p className="text-2xl font-black text-[#4ade80]">
              {webhooks.filter((w) => w.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#6b8e6b] font-mono">DELIVERIES</p>
            <p className="text-2xl font-black text-[#e8f5e8]">
              {webhooks.reduce((sum, w) => sum + w.deliveryCount, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            <p className="text-xs text-[#6b8e6b] font-mono">FAILURES</p>
            <p className="text-2xl font-black text-[#dc2626]">
              {webhooks.reduce((sum, w) => sum + w.failureCount, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks List */}
      <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-black tracking-tighter text-[#e8f5e8] flex items-center gap-2">
            <Webhook className="w-5 h-5 text-[#4ade80]" />
            Webhooks
          </CardTitle>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-bold rounded-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Webhook
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <motion.div
                key={webhook.id}
                layout
                className="border border-[#1a2e1a] overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#4ade80]/10 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-5 h-5 text-[#4ade80]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="font-mono text-sm text-[#4ade80] truncate">
                            {webhook.url}
                          </code>
                          <StatusBadge status={webhook.status} />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {webhook.events.map((event) => (
                            <Badge
                              key={event}
                              variant="outline"
                              className="rounded-none border-[#1a2e1a] text-[#6b8e6b] text-[10px] font-mono"
                            >
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4 hidden sm:block">
                        <p className="text-xs text-[#6b8e6b]">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {webhook.lastDelivery}
                        </p>
                        <p className="text-xs text-[#6b8e6b]">
                          {webhook.deliveryCount} deliveries
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestWebhook(webhook)}
                        className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        className="border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10 rounded-none"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Delivery Logs */}
                <div className="border-t border-[#1a2e1a] bg-[#050805]">
                  <button
                    onClick={() => setExpandedLogs(expandedLogs === webhook.id ? null : webhook.id)}
                    className="w-full px-4 py-2 flex items-center justify-between text-[#6b8e6b] hover:text-[#e8f5e8] transition-colors"
                  >
                    <span className="text-xs font-mono">DELIVERY LOGS ({webhook.logs.length})</span>
                    {expandedLogs === webhook.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedLogs === webhook.id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4">
                          {webhook.logs.length === 0 ? (
                            <p className="text-sm text-[#6b8e6b] py-4 text-center">
                              No delivery logs yet
                            </p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow className="border-[#1a2e1a] hover:bg-transparent">
                                  <TableHead className="text-[#6b8e6b] font-mono text-xs">Time</TableHead>
                                  <TableHead className="text-[#6b8e6b] font-mono text-xs">Status</TableHead>
                                  <TableHead className="text-[#6b8e6b] font-mono text-xs">Retries</TableHead>
                                  <TableHead className="text-[#6b8e6b] font-mono text-xs">Response</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {webhook.logs.map((log) => (
                                  <TableRow key={log.id} className="border-[#1a2e1a]/50 hover:bg-[#1a2e1a]/20">
                                    <TableCell className="font-mono text-xs text-[#e8f5e8]">
                                      {new Date(log.timestamp).toLocaleTimeString()}
                                    </TableCell>
                                    <TableCell>
                                      <DeliveryStatus success={log.success} statusCode={log.statusCode} />
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-[#e8f5e8]">
                                      {log.retryCount}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-[#6b8e6b] truncate max-w-[200px]">
                                      {log.response}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Webhook Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8] max-w-lg rounded-none">
          <DialogHeader>
            <DialogTitle className="font-black tracking-tighter flex items-center gap-2">
              <Webhook className="w-5 h-5 text-[#4ade80]" />
              Add Webhook
            </DialogTitle>
            <DialogDescription className="text-[#6b8e6b]">
              Configure a new webhook endpoint to receive real-time events.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateWebhook} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="webhook-url" className="text-[#e8f5e8] font-mono text-xs">
                ENDPOINT URL
              </Label>
              <Input
                id="webhook-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/webhooks"
                className="bg-[#050805] border-[#1a2e1a] text-[#e8f5e8] rounded-none focus:border-[#4ade80]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook-secret" className="text-[#e8f5e8] font-mono text-xs">
                SECRET (OPTIONAL)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="webhook-secret"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="whsec_..."
                  className="bg-[#050805] border-[#1a2e1a] text-[#e8f5e8] rounded-none focus:border-[#4ade80]"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSecret(`whsec_${Math.random().toString(36).substring(2, 18)}`)}
                  className="border-[#1a2e1a] text-[#6b8e6b] rounded-none whitespace-nowrap"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Generate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#e8f5e8] font-mono text-xs">EVENTS TO SUBSCRIBE</Label>
              <div className="border border-[#1a2e1a] p-3 space-y-2 max-h-48 overflow-y-auto">
                {AVAILABLE_EVENTS.map((event) => (
                  <div key={event} className="flex items-center gap-2">
                    <Checkbox
                      id={`event-${event}`}
                      checked={selectedEvents.includes(event)}
                      onCheckedChange={() => toggleEvent(event)}
                      className="border-[#1a2e1a] data-[state=checked]:bg-[#4ade80] data-[state=checked]:border-[#4ade80]"
                    />
                    <Label
                      htmlFor={`event-${event}`}
                      className="text-xs font-mono text-[#e8f5e8] cursor-pointer"
                    >
                      {event}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!url || selectedEvents.length === 0}
                className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-bold rounded-none"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Webhook
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Test Webhook Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8] max-w-2xl rounded-none">
          <DialogHeader>
            <DialogTitle className="font-black tracking-tighter flex items-center gap-2">
              <Send className="w-5 h-5 text-[#4ade80]" />
              Test Webhook
            </DialogTitle>
            <DialogDescription className="text-[#6b8e6b]">
              Send a test payload to {selectedWebhook?.url}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[#e8f5e8] font-mono text-xs">TEST PAYLOAD</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyPayload}
                  className="h-6 text-[#6b8e6b] hover:text-[#e8f5e8]"
                >
                  {copiedPayload ? (
                    <Check className="w-3.5 h-3.5 mr-1" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 mr-1" />
                  )}
                  {copiedPayload ? "Copied" : "Copy"}
                </Button>
              </div>
              <pre className="bg-[#050805] border border-[#1a2e1a] p-4 text-xs font-mono text-[#e8f5e8] overflow-x-auto max-h-64">
                {JSON.stringify(TEST_PAYLOAD, null, 2)}
              </pre>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTestDialogOpen(false)}
                className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSendTest}
                className="bg-[#4ade80] hover:bg-[#3ec46e] text-black font-bold rounded-none"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Test
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WebhookTester;
