"use client"

import { useState } from "react"
import { CheckCircle, Copy, Database } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SetupDatabasePage() {
  const [copied, setCopied] = useState(false)
  
  const envTemplate = `# PlanetScale Connection String
# Get this from: PlanetScale Dashboard → Connect → @prisma/client
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/stigmator?sslaccept=strict"

# For local development (optional - MySQL via Docker or XAMPP)
DATABASE_URL_DEV="mysql://root@localhost:3306/stigmator"
`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envTemplate)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-8 w-8 text-[#4ade80]" />
          <h1 className="text-4xl font-black tracking-tighter text-[#e8f5e8]">
            PLANETSCALE <span className="text-[#4ade80]">SETUP</span>
          </h1>
        </div>
        
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="border border-[#1a2e1a] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#4ade80] text-[#080a08] flex items-center justify-center font-black">1</div>
              <h2 className="text-xl font-black text-[#e8f5e8]">Create PlanetScale Account</h2>
            </div>
            <ol className="text-[#a3c9a3] space-y-2 list-decimal list-inside">
              <li>Go to <a href="https://planetscale.com" target="_blank" rel="noopener" className="text-[#4ade80] hover:underline">planetscale.com</a></li>
              <li>Sign up with GitHub</li>
              <li>Click "Create New Database"</li>
              <li>Name: <code className="bg-[#1a2e1a] px-2">stigmator</code></li>
              <li>Region: Choose closest (US East, EU West, etc.)</li>
              <li>Plan: <strong>Hobby (Free)</strong></li>
              <li>Click "Create Database"</li>
            </ol>
          </div>

          {/* Step 2 */}
          <div className="border border-[#1a2e1a] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#4ade80] text-[#080a08] flex items-center justify-center font-black">2</div>
              <h2 className="text-xl font-black text-[#e8f5e8]">Create Database Password</h2>
            </div>
            <ol className="text-[#a3c9a3] space-y-2 list-decimal list-inside">
              <li>In your database dashboard, click <strong>"Connect"</strong></li>
              <li>Select <strong>"@prisma/client"</strong> from dropdown</li>
              <li>Click <strong>"New Password"</strong></li>
              <li>Name it: <code className="bg-[#1a2e1a] px-2">nextjs-app</code></li>
              <li>Copy the connection string</li>
            </ol>
          </div>

          {/* Step 3 */}
          <div className="border border-[#1a2e1a] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#4ade80] text-[#080a08] flex items-center justify-center font-black">3</div>
              <h2 className="text-xl font-black text-[#e8f5e8]">Update .env.local</h2>
            </div>
            <p className="text-[#a3c9a3] mb-4">Paste your connection string:</p>
            <div className="relative">
              <pre className="bg-[#050805] p-4 text-sm font-mono text-[#4ade80] overflow-x-auto">
                {envTemplate}
              </pre>
              <Button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 bg-[#1a2e1a] hover:bg-[#2a3e2a] text-[#4ade80] rounded-none h-8"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : "COPY"}
              </Button>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border border-[#1a2e1a] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#4ade80] text-[#080a08] flex items-center justify-center font-black">4</div>
              <h2 className="text-xl font-black text-[#e8f5e8]">Create Database Schema</h2>
            </div>
            <p className="text-[#a3c9a3] mb-4">Run Prisma migrations:</p>
            <pre className="bg-[#050805] p-4 text-sm font-mono text-[#a3c9a3] overflow-x-auto">
npx prisma migrate dev --name init
            </pre>
            <p className="text-[#6b8e6b] mt-2 text-sm">This creates all tables in PlanetScale</p>
          </div>

          {/* Step 5 */}
          <div className="border border-[#1a2e1a] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#4ade80] text-[#080a08] flex items-center justify-center font-black">5</div>
              <h2 className="text-xl font-black text-[#e8f5e8]">Generate Prisma Client</h2>
            </div>
            <pre className="bg-[#050805] p-4 text-sm font-mono text-[#a3c9a3] overflow-x-auto">
npx prisma generate
            </pre>
            <p className="text-[#6b8e6b] mt-2 text-sm">Generates TypeScript types from your schema</p>
          </div>

          {/* Step 6 */}
          <div className="border-2 border-[#4ade80] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#4ade80] text-[#080a08] flex items-center justify-center font-black">6</div>
              <h2 className="text-xl font-black text-[#e8f5e8]">Restart Dev Server</h2>
            </div>
            <p className="text-[#a3c9a3]">Stop server (Ctrl+C) and run:</p>
            <code className="bg-[#050805] px-4 py-2 font-mono text-[#4ade80] block mt-2">npm run dev</code>
          </div>

          {/* Free Tier Info */}
          <div className="bg-[#1a2e1a]/50 border border-[#4ade80]/30 p-6">
            <h3 className="font-black text-[#4ade80] mb-2">PLANETSCALE HOBBY (FREE) INCLUDES:</h3>
            <ul className="text-[#a3c9a3] space-y-1">
              <li>✓ 5 GB storage (10x more than Supabase)</li>
              <li>✓ 1 billion row reads/month</li>
              <li>✓ 10 million row writes/month</li>
              <li>✓ Never pauses (unlike Supabase)</li>
              <li>✓ No credit card required</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
