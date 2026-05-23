"use client"

export default function ColorAuditPage() {
  const colors = [
    { name: "Background Dark", hex: "#050805", usage: "Main page background", text: "white" },
    { name: "Background Card", hex: "#0a0f0a", usage: "Cards, panels", text: "white" },
    { name: "Background Hover", hex: "#0d120d", usage: "Hover states", text: "white" },
    { name: "Border Default", hex: "#1a2e1a", usage: "Borders, dividers", text: "white" },
    { name: "Border Light", hex: "#3a4e3a", usage: "Subtle borders, disabled", text: "white" },
    { name: "Text Muted", hex: "#5a6e5a", usage: "Secondary text, IDs", text: "black" },
    { name: "Text Secondary", hex: "#6b8e6b", usage: "Labels, descriptions", text: "black" },
    { name: "Text Light", hex: "#a3c9a3", usage: "Subtle text", text: "black" },
    { name: "Text Primary", hex: "#e8f5e8", usage: "Main headings, body", text: "black" },
    { name: "Accent Green", hex: "#4ade80", usage: "Primary accent, CTAs", text: "black" },
    { name: "Accent Red", hex: "#dc2626", usage: "Danger, warnings", text: "white" },
    { name: "Accent Orange", hex: "#f97316", usage: "Featured, highlights", text: "black" },
  ]

  return (
    <div className="min-h-screen bg-[#050805] text-[#e8f5e8] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-2">COLOR AUDIT</h1>
        <p className="text-[#6b8e6b] mb-8">All colors used in the Stigmator design system</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colors.map((color) => (
            <div key={color.name} className="border-2 border-[#1a2e1a] overflow-hidden">
              <div 
                className="h-24 flex items-center justify-center"
                style={{ backgroundColor: color.hex }}
              >
                <span style={{ color: color.text === "white" ? "#fff" : "#000" }} className="font-mono text-lg">
                  {color.hex}
                </span>
              </div>
              <div className="p-4 bg-[#0a0f0a]">
                <h3 className="font-bold text-[#e8f5e8]">{color.name}</h3>
                <p className="text-sm text-[#6b8e6b] mt-1">{color.usage}</p>
                <code className="text-xs text-[#4ade80] mt-2 block">{color.hex}</code>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-black mt-12 mb-4">CONTRAST CHECK</h2>
        <div className="space-y-4">
          <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
            <p className="text-[#e8f5e8] text-lg">Primary text on background (GOOD)</p>
            <p className="text-xs text-[#6b8e6b]">#e8f5e8 on #050805 - High contrast</p>
          </div>
          <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
            <p className="text-[#6b8e6b] text-lg">Secondary text on background (GOOD)</p>
            <p className="text-xs text-[#5a6e5a]">#6b8e6b on #050805 - Medium contrast</p>
          </div>
          <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
            <p className="text-[#5a6e5a] text-lg">Muted text on background (FIXED)</p>
            <p className="text-xs text-[#4ade80]">Changed from #1a2e1a to #5a6e5a</p>
          </div>
          <div className="p-4 bg-[#0a0f0a] border border-[#1a2e1a]">
            <p className="text-[#4ade80] text-lg">Accent on card (GOOD)</p>
            <p className="text-xs text-[#6b8e6b]">#4ade80 on #0a0f0a - High contrast</p>
          </div>
        </div>
      </div>
    </div>
  )
}
