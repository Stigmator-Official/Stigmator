"use client"

import { Copy, CheckCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function DeployPage() {
  const [copied, setCopied] = useState(false)

  const copyCommand = () => {
    navigator.clipboard.writeText("npx vercel --prod")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <h1 className="text-5xl font-black tracking-tighter text-[#e8f5e8] mb-4">
          DEPLOY TO <span className="text-[#4ade80]">PRODUCTION</span>
        </h1>
        <p className="text-xl text-[#a3c9a3] mb-12">
          Host your Stigmator website for free on Vercel
        </p>

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="border-2 border-[#1a2e1a] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#4ade80] text-[#080a08] flex items-center justify-center font-black text-xl">1</div>
              <h2 className="text-2xl font-black text-[#e8f5e8]">Push to GitHub</h2>
            </div>
            <pre className="bg-[#050805] p-4 text-sm font-mono text-[#a3c9a3] overflow-x-auto mb-4">
{`git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stigmator.git
git push -u origin main`}
            </pre>
            <p className="text-[#6b8e6b]">Create a new repository on GitHub first</p>
          </div>

          {/* Step 2 */}
          <div className="border-2 border-[#1a2e1a] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#4ade80] text-[#080a08] flex items-center justify-center font-black text-xl">2</div>
              <h2 className="text-2xl font-black text-[#e8f5e8]">Connect to Vercel</h2>
            </div>
            <ol className="text-[#a3c9a3] space-y-3 list-decimal list-inside">
              <li>Go to <a href="https://vercel.com" target="_blank" rel="noopener" className="text-[#4ade80] hover:underline">vercel.com</a></li>
              <li>Sign up with GitHub</li>
              <li>Click "Add New Project"</li>
              <li>Import your GitHub repository</li>
              <li>Vercel auto-detects Next.js settings</li>
            </ol>
          </div>

          {/* Step 3 */}
          <div className="border-2 border-[#1a2e1a] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#4ade80] text-[#080a08] flex items-center justify-center font-black text-xl">3</div>
              <h2 className="text-2xl font-black text-[#e8f5e8]">Environment Variables</h2>
            </div>
            <p className="text-[#a3c9a3] mb-4">Add these in Vercel Dashboard → Settings → Environment Variables:</p>
            <div className="bg-[#050805] p-4 space-y-2 font-mono text-sm">
              <div className="flex justify-between border-b border-[#1a2e1a] pb-2">
                <span className="text-[#6b8e6b]">DATABASE_URL</span>
                <span className="text-[#4ade80]">your_planetscale_url</span>
              </div>
              <div className="flex justify-between border-b border-[#1a2e1a] pb-2">
                <span className="text-[#6b8e6b]">NEXT_PUBLIC_APP_URL</span>
                <span className="text-[#4ade80]">https://your-domain.vercel.app</span>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border-2 border-[#4ade80] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#4ade80] text-[#080a08] flex items-center justify-center font-black text-xl">4</div>
              <h2 className="text-2xl font-black text-[#e8f5e8]">Deploy</h2>
            </div>
            <p className="text-[#a3c9a3] mb-4">Click "Deploy" in Vercel or use CLI:</p>
            <div className="relative">
              <pre className="bg-[#050805] p-4 text-sm font-mono text-[#4ade80]">
                npx vercel --prod
              </pre>
              <Button
                onClick={copyCommand}
                className="absolute top-2 right-2 bg-[#1a2e1a] hover:bg-[#2a3e2a] text-[#4ade80] rounded-none h-8 text-xs"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : "COPY"}
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4 mt-12">
            <div className="border border-[#1a2e1a] p-4 text-center">
              <div className="text-3xl font-black text-[#4ade80] mb-2">FREE</div>
              <p className="text-[#6b8e6b] text-sm">Hobby plan includes unlimited static sites</p>
            </div>
            <div className="border border-[#1a2e1a] p-4 text-center">
              <div className="text-3xl font-black text-[#dc2626] mb-2">AUTO</div>
              <p className="text-[#6b8e6b] text-sm">Deploys on every git push</p>
            </div>
            <div className="border border-[#1a2e1a] p-4 text-center">
              <div className="text-3xl font-black text-[#f97316] mb-2">GLOBAL</div>
              <p className="text-[#6b8e6b] text-sm">CDN in 100+ locations worldwide</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
