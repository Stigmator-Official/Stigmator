"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, useRequireRole } from "@/lib/auth/provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ImageIcon, 
  Package, 
  Paintbrush, 
  DollarSign,
  TrendingUp,
  Users,
  Plus,
  LogOut,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Upload,
  Shirt,
  Droplets,
  MessageSquare,
  Bell,
  Loader2,
} from "lucide-react";

// Onboarding checklist steps
const ONBOARDING_STEPS = [
  { id: "profile", label: "Complete your profile", icon: Users },
  { id: "avatar", label: "Upload profile picture", icon: ImageIcon },
  { id: "design", label: "Upload your first design", icon: Upload },
  { id: "product", label: "Create your first product", icon: Shirt },
  { id: "payment", label: "Set up payment info", icon: DollarSign },
];

export default function ArtistDashboardPage() {
  const { user, signOut } = useAuth();
  useRequireRole(["ARTIST", "ADMIN"]);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>(["profile"]);
  
  // Real earnings data
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    totalSales: 0,
    recentSales: [] as any[],
    designEarnings: [] as any[],
  });
  const [earningsLoading, setEarningsLoading] = useState(true);
  
  // Stripe Connect status
  const [connectStatus, setConnectStatus] = useState({
    connected: false,
    onboardingComplete: false,
    checking: true,
  });
  const [connectLoading, setConnectLoading] = useState(false);

  const progress = (completedSteps.length / ONBOARDING_STEPS.length) * 100;

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };
  
  // Load earnings and connect status
  useEffect(() => {
    const loadData = async () => {
      try {
        const [earningsRes, connectRes] = await Promise.all([
          fetch("/api/artist/earnings"),
          fetch("/api/stripe/connect"),
        ]);
        
        if (earningsRes.ok) {
          const data = await earningsRes.json();
          setEarnings(data);
        }
        
        if (connectRes.ok) {
          const data = await connectRes.json();
          setConnectStatus({ ...data, checking: false });
        } else {
          setConnectStatus(prev => ({ ...prev, checking: false }));
        }
      } catch {
        // Silent fail - show empty state
      } finally {
        setEarningsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const handleConnectStripe = async () => {
    setConnectLoading(true);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Show error
    } finally {
      setConnectLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#050805]">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-[#e8f5e8]">
              ARTIST STUDIO
            </h1>
            <p className="text-[#6b8e6b] mt-2">
              Welcome back, {user?.displayName || user?.fullName || "Artist"}
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Link href="/shop">
              <Button variant="outline" className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none">
                <ExternalLink className="mr-2 h-4 w-4" />
                VIEW SHOP
              </Button>
            </Link>
            <Button 
              onClick={signOut}
              variant="outline" 
              className="border-[#dc2626]/30 text-[#dc2626] hover:bg-[#dc2626]/10 rounded-none"
            >
              <LogOut className="mr-2 h-4 w-4" />
              SIGN OUT
            </Button>
          </div>
        </div>

        {/* Onboarding Checklist (shown until complete) */}
        {!onboardingComplete && progress < 100 && (
          <Card className="bg-[#0a0f0a] border-[#fbbf24]/30 rounded-none mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tighter text-[#fbbf24] flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                GETTING STARTED
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#6b8e6b]">Complete your setup</span>
                  <span className="text-[#fbbf24] font-mono">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-[#1a2e1a]" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {ONBOARDING_STEPS.map(step => {
                  const isComplete = completedSteps.includes(step.id);
                  const Icon = step.icon;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => toggleStep(step.id)}
                      className={`flex items-center gap-3 p-3 border transition-all text-left ${
                        isComplete 
                          ? "bg-[#4ade80]/10 border-[#4ade80]/50" 
                          : "bg-[#050805] border-[#1a2e1a] hover:border-[#fbbf24]/50"
                      }`}
                    >
                      <div className={`w-8 h-8 flex items-center justify-center ${
                        isComplete ? "bg-[#4ade80] text-black" : "bg-[#1a2e1a] text-[#6b8e6b]"
                      }`}>
                        {isComplete ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className={`text-xs font-mono ${isComplete ? "text-[#4ade80]" : "text-[#6b8e6b]"}`}>
                        {step.label.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {progress === 100 && (
                <div className="mt-4 text-center">
                  <Button 
                    onClick={() => setOnboardingComplete(true)}
                    className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    COMPLETE SETUP
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stripe Connect Banner */}
        {!connectStatus.connected && !connectStatus.checking && (
          <Card className="bg-[#fbbf24]/5 border-[#fbbf24]/30 rounded-none mb-8">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-black tracking-tighter text-[#fbbf24] mb-1">
                  GET PAID
                </h3>
                <p className="text-sm text-[#6b8e6b]">
                  Connect your bank account via Stripe to receive payouts
                </p>
              </div>
              <Button 
                onClick={handleConnectStripe}
                disabled={connectLoading}
                className="bg-[#fbbf24] hover:bg-[#d97706] text-black rounded-none font-black"
              >
                {connectLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <DollarSign className="h-4 w-4 mr-2" />
                )}
                CONNECT BANK
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-[#4ade80]">
                    {earningsLoading ? "—" : `$${(earnings.totalEarnings / 100).toFixed(2)}`}
                  </p>
                  <p className="text-xs font-mono text-[#6b8e6b]">TOTAL EARNINGS</p>
                </div>
                <DollarSign className="h-8 w-8 text-[#4ade80]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-[#e8f5e8]">
                    {earningsLoading ? "—" : earnings.totalSales}
                  </p>
                  <p className="text-xs font-mono text-[#6b8e6b]">TOTAL SALES</p>
                </div>
                <TrendingUp className="h-8 w-8 text-[#6b8e6b]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-[#fbbf24]">
                    {earningsLoading ? "—" : earnings.designEarnings.length}
                  </p>
                  <p className="text-xs font-mono text-[#6b8e6b]">EARNING DESIGNS</p>
                </div>
                <Paintbrush className="h-8 w-8 text-[#fbbf24]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-[#dc2626]">
                    {earningsLoading ? "—" : `$${(earnings.pendingEarnings / 100).toFixed(2)}`}
                  </p>
                  <p className="text-xs font-mono text-[#6b8e6b]">PENDING</p>
                </div>
                <Package className="h-8 w-8 text-[#dc2626]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#0a0f0a] border border-[#1a2e1a] rounded-none p-0 h-auto">
            <TabsTrigger 
              value="overview" 
              className="rounded-none px-6 py-3 data-[state=active]:bg-[#4ade80] data-[state=active]:text-black font-black tracking-wider"
            >
              OVERVIEW
            </TabsTrigger>
            <TabsTrigger 
              value="designs" 
              className="rounded-none px-6 py-3 data-[state=active]:bg-[#fbbf24] data-[state=active]:text-black font-black tracking-wider"
            >
              DESIGNS
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="rounded-none px-6 py-3 data-[state=active]:bg-[#dc2626] data-[state=active]:text-white font-black tracking-wider"
            >
              PRODUCTS
            </TabsTrigger>
            <TabsTrigger 
              value="partnerships" 
              className="rounded-none px-6 py-3 data-[state=active]:bg-[#6b8e6b] data-[state=active]:text-white font-black tracking-wider"
            >
              PARTNERSHIPS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8]">
                    QUICK ACTIONS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/artist/designs/upload">
                      <Button className="w-full h-24 bg-[#050805] border-2 border-dashed border-[#1a2e1a] hover:border-[#4ade80] hover:bg-[#4ade80]/5 rounded-none flex flex-col items-center gap-2">
                        <Upload className="h-6 w-6 text-[#4ade80]" />
                        <span className="font-black text-[#e8f5e8]">UPLOAD DESIGN</span>
                      </Button>
                    </Link>
                    
                    <Link href="/artist/garments/create">
                      <Button className="w-full h-24 bg-[#050805] border-2 border-dashed border-[#1a2e1a] hover:border-[#dc2626] hover:bg-[#dc2626]/5 rounded-none flex flex-col items-center gap-2">
                        <Plus className="h-6 w-6 text-[#dc2626]" />
                        <span className="font-black text-[#e8f5e8]">CREATE PRODUCT</span>
                      </Button>
                    </Link>
                    
                    <Link href="/artist/partnerships">
                      <Button className="w-full h-24 bg-[#050805] border-2 border-dashed border-[#1a2e1a] hover:border-[#fbbf24] hover:bg-[#fbbf24]/5 rounded-none flex flex-col items-center gap-2">
                        <Droplets className="h-6 w-6 text-[#fbbf24]" />
                        <span className="font-black text-[#e8f5e8]">CREATE PARTNERSHIP CODE</span>
                      </Button>
                    </Link>
                    
                    <Link href="/dashboard/messages">
                      <Button className="w-full h-24 bg-[#050805] border-2 border-dashed border-[#1a2e1a] hover:border-[#6b8e6b] hover:bg-[#6b8e6b]/5 rounded-none flex flex-col items-center gap-2">
                        <MessageSquare className="h-6 w-6 text-[#6b8e6b]" />
                        <span className="font-black text-[#e8f5e8]">MESSAGES</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Earnings Breakdown */}
              <Card className="bg-[#4ade80]/5 border-[#4ade80]/20 rounded-none">
                <CardHeader>
                  <CardTitle className="text-lg font-black tracking-tighter text-[#4ade80]">
                    EARNINGS BREAKDOWN
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {earningsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 text-[#4ade80] animate-spin" />
                    </div>
                  ) : earnings.designEarnings.length === 0 ? (
                    <p className="text-sm text-[#6b8e6b]">
                      No earnings yet. Upload designs and create products to start earning.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {earnings.designEarnings.slice(0, 5).map((de: any) => (
                        <div key={de.design_id} className="flex justify-between items-center py-2 border-b border-[#1a2e1a]">
                          <span className="text-sm text-[#e8f5e8] truncate max-w-[120px]">{de.design_title}</span>
                          <span className="text-sm font-mono text-[#4ade80]">${(de.amount / 100).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link href="/artist/payouts">
                    <Button className="w-full bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black">
                      <DollarSign className="h-4 w-4 mr-2" />
                      REQUEST PAYOUT
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sales */}
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardHeader>
                <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8]">
                  RECENT SALES
                </CardTitle>
              </CardHeader>
              <CardContent>
                {earningsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 text-[#4ade80] animate-spin" />
                  </div>
                ) : earnings.recentSales.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-[#1a2e1a]">
                    <TrendingUp className="h-12 w-12 text-[#1a2e1a] mx-auto mb-4" />
                    <p className="text-[#6b8e6b] font-mono text-sm">NO SALES YET</p>
                    <p className="text-xs text-[#6b8e6b]/70 mt-1">
                      Upload designs and create products to start selling
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {earnings.recentSales.map((sale: any, i: number) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-[#1a2e1a]">
                        <div>
                          <p className="text-sm text-[#e8f5e8]">{sale.design_title}</p>
                          <p className="text-xs text-[#6b8e6b]">
                            {new Date(sale.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-sm font-mono text-[#4ade80]">+${(sale.amount / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="designs">
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardContent className="p-12 text-center">
                <Paintbrush className="h-12 w-12 text-[#1a2e1a] mx-auto mb-4" />
                <p className="text-[#6b8e6b] font-mono text-lg mb-4">NO DESIGNS YET</p>
                <p className="text-sm text-[#6b8e6b]/70 mb-6">
                  Upload your tattoo designs to create products
                </p>
                <Link href="/artist/designs/upload">
                  <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black">
                    <Upload className="mr-2 h-4 w-4" />
                    UPLOAD YOUR FIRST DESIGN
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-[#1a2e1a] mx-auto mb-4" />
                <p className="text-[#6b8e6b] font-mono text-lg mb-4">NO PRODUCTS YET</p>
                <p className="text-sm text-[#6b8e6b]/70 mb-6">
                  Create products from your designs
                </p>
                <Link href="/artist/garments/create">
                  <Button className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none font-black">
                    <Plus className="mr-2 h-4 w-4" />
                    CREATE YOUR FIRST PRODUCT
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partnerships">
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardContent className="p-12 text-center">
                <Droplets className="h-12 w-12 text-[#1a2e1a] mx-auto mb-4" />
                <p className="text-[#6b8e6b] font-mono text-lg mb-4">NO PARTNERSHIPS YET</p>
                <p className="text-sm text-[#6b8e6b]/70 mb-6 max-w-md mx-auto">
                  Create partnership codes for your clients to share revenue when their tattoo design sells on merchandise
                </p>
                <Link href="/artist/partnerships">
                  <Button className="bg-[#fbbf24] hover:bg-[#d97706] text-black rounded-none font-black">
                    CREATE PARTNERSHIP CODE
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
