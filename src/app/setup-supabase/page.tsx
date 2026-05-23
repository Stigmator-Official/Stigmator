"use client"

import { useState } from "react"
import { CheckCircle, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SetupSupabasePage() {
  const [copied, setCopied] = useState(false)
  
  const sqlSchema = `-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    instagram_handle TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'artist', 'customer', 'fulfillment')) DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create a demo artist (approved)
INSERT INTO profiles (id, email, full_name, display_name, bio, location, role, is_verified, is_approved)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'demo@artist.com',
    'Demo Artist',
    'Ghost Ink',
    'Traditional Japanese & Neo-Traditional specialist. 15 years experience in Tokyo.',
    'Tokyo, Japan',
    'artist',
    true,
    true
)
ON CONFLICT (id) DO UPDATE SET 
    display_name = 'Ghost Ink',
    is_approved = true,
    is_verified = true;
`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <h1 className="text-4xl font-black tracking-tighter text-[#e8f5e8] mb-4">
          SUPABASE <span className="text-[#4ade80]">SETUP</span>
        </h1>
        
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="border border-[#1a2e1a] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#4ade80] text-[#080a08] flex items-center justify-center font-black">1</div>
              <h2 className="text-xl font-black text-[#e8f5e8]">Create Project</h2>
            </div>
            <ol className="text-[#a3c9a3] space-y-2 list-decimal list-inside">
              <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener" className="text-[#4ade80] hover:underline">supabase.com</a></li>
              <li>Sign up with GitHub</li>
              <li>Click "New Project"</li>
              <li>Name: <code className="bg-[#1a2e1a] px-2">stigmator</code></li>
              <li>Choose region closest to you</li>
              <li>Click "Create new project"</li>
            </ol>
          </div>

          {/* Step 2 */}
          <div className="border border-[#1a2e1a] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#4ade80] text-[#080a08] flex items-center justify-center font-black">2</div>
              <h2 className="text-xl font-black text-[#e8f5e8]">Get Credentials</h2>
            </div>
            <ol className="text-[#a3c9a3] space-y-2 list-decimal list-inside">
              <li>Wait for project to finish (green dot)</li>
              <li>Click ⚙️ Settings (bottom left)</li>
              <li>Click API</li>
              <li>Copy Project URL</li>
              <li>Copy anon public key</li>
            </ol>
          </div>

          {/* Step 3 */}
          <div className="border border-[#1a2e1a] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#4ade80] text-[#080a08] flex items-center justify-center font-black">3</div>
              <h2 className="text-xl font-black text-[#e8f5e8]">Update .env.local</h2>
            </div>
            <p className="text-[#a3c9a3] mb-4">Paste your credentials:</p>
            <pre className="bg-[#050805] p-4 text-sm font-mono text-[#4ade80] overflow-x-auto">
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
            </pre>
          </div>

          {/* Step 4 */}
          <div className="border border-[#1a2e1a] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#4ade80] text-[#080a08] flex items-center justify-center font-black">4</div>
              <h2 className="text-xl font-black text-[#e8f5e8]">Create Database</h2>
            </div>
            <p className="text-[#a3c9a3] mb-4">In Supabase: SQL Editor → New Query → paste & run:</p>
            <div className="relative">
              <pre className="bg-[#050805] p-4 text-xs font-mono text-[#a3c9a3] overflow-x-auto max-h-64 overflow-y-auto">
                {sqlSchema}
              </pre>
              <Button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 bg-[#1a2e1a] hover:bg-[#2a3e2a] text-[#4ade80] rounded-none h-8"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : "COPY"}
              </Button>
            </div>
          </div>

          {/* Step 5 */}
          <div className="border-2 border-[#4ade80] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#4ade80] text-[#080a08] flex items-center justify-center font-black">5</div>
              <h2 className="text-xl font-black text-[#e8f5e8]">Restart Server</h2>
            </div>
            <p className="text-[#a3c9a3]">Stop server (Ctrl+C) and run: <code className="bg-[#050805] px-2 text-[#4ade80]">npm run dev</code></p>
          </div>
        </div>
      </div>
    </div>
  )
}
