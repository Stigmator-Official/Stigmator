import { createClientServer } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, Users, ArrowRight, Target, Loader2, Medal } from "lucide-react"
import Link from "next/link"

interface Competition {
  id: string
  title: string
  status: string
  theme: string
  submission_end: string
  entries: { count: number }[]
}

interface RankingEntry {
  rank: number
  artistId: string
  artistName: string
  studio: string
  points: number
  sales: number
  avatarUrl: string | null
}

export default async function CompetitionsPage() {
  let competitions: Competition[] = []
  let rankings: RankingEntry[] = []
  let isConfigured = true

  try {
    const supabase = await createClientServer()

    const { data: comps } = await supabase
      .from("competitions")
      .select(`
        *,
        entries:competition_entries(count),
        category:product_categories(name)
      `)
      .in("status", ["active", "voting", "upcoming"])
      .order("submission_start", { ascending: true })

    competitions = comps || []

    // Fetch top rankings
    const { data: rankingData } = await supabase
      .from("artist_stats")
      .select("artist_id, artist:artist_id(display_name, studio), total_points, total_sales")
      .order("total_points", { ascending: false })
      .limit(5)

    rankings = (rankingData || []).map((r: any, index: number) => ({
      rank: index + 1,
      artistId: r.artist_id,
      artistName: r.artist?.display_name || "Unknown Artist",
      studio: r.artist?.studio || "Independent",
      points: r.total_points || 0,
      sales: r.total_sales || 0,
      avatarUrl: null,
    }))
  } catch {
    isConfigured = false
  }

  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain">
      {!isConfigured && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 px-4 py-3">
          <p className="text-yellow-400 text-xs font-mono text-center">
            ⚠ DEMO MODE: SUPABASE NOT CONFIGURED
          </p>
        </div>
      )}

      {/* Hero */}
      <div className="px-4 sm:px-8 lg:px-16 py-16 border-b border-white/5">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <span className="inline-flex items-center space-x-2 font-mono text-xs tracking-widest text-red-500 mb-4">
                <Trophy className="h-3 w-3" />
                <span>THE ARENA</span>
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter">
                COMPETE
                <br />
                <span className="text-muted-foreground">& RISE</span>
              </h1>
            </div>
            <p className="max-w-md text-muted-foreground lg:text-right">
              Monthly design challenges, bracket tournaments, and global rankings. 
              Win prizes, gain exposure, cement your legacy.
            </p>
          </div>
        </div>
      </div>

      {/* Competition Types */}
      <div className="px-4 sm:px-8 lg:px-16 py-16 border-b border-white/5">
        <div className="max-w-[1800px] mx-auto">
          <h2 className="text-sm font-mono tracking-widest text-red-500 mb-8">
            BATTLE FORMATS
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: Clock,
                title: "MONTHLY DESIGN",
                desc: "Submit your best work each month based on a theme. Community voting decides the winner.",
              },
              {
                icon: Trophy,
                title: "BRACKET TOURNAMENT",
                desc: "Head-to-head battles. Designs face off in elimination rounds until one champion remains.",
              },
              {
                icon: Target,
                title: "RANKING CHALLENGE",
                desc: "Climb the global leaderboard based on sales, votes, and competition performance.",
              },
            ].map((type, i) => (
              <Card key={i} className="bg-white/[0.02] border-white/5 rounded-none">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 font-black tracking-tighter">
                    <type.icon className="h-5 w-5 text-red-600" />
                    <span>{type.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {type.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Active Competitions */}
      <div className="px-4 sm:px-8 lg:px-16 py-16">
        <div className="max-w-[1800px] mx-auto">
          <h2 className="text-3xl font-black tracking-tighter mb-8">
            ACTIVE <span className="text-red-600">BATTLES</span>
          </h2>
          
          {competitions.length === 0 ? (
            <div className="border border-dashed border-white/10 p-12 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-black tracking-tighter mb-2">NO ACTIVE COMPETITIONS</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Competitions are being organized. Check back soon for new challenges!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {competitions.map((competition) => (
                <Card key={competition.id} className="bg-white/[0.02] border-white/5 hover:border-red-600/30 transition-colors rounded-none group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl font-black tracking-tighter mb-2">
                          {competition.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          THEME: <span className="text-white">{competition.theme || "OPEN"}</span>
                        </p>
                      </div>
                      <Badge 
                        variant={competition.status === "active" ? "default" : "secondary"}
                        className={`rounded-none font-mono text-xs ${
                          competition.status === "active" ? "bg-red-600" : ""
                        }`}
                      >
                        {competition.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2 text-sm font-mono">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {competition.entries?.[0]?.count || 0} ENTRIES
                        </span>
                      </div>
                      <span className="text-sm font-mono text-muted-foreground">
                        ENDS {new Date(competition.submission_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                      </span>
                    </div>

                    <Link href={`/competitions/${competition.id}`}>
                      <Button className="w-full bg-red-600 hover:bg-red-700 rounded-none font-black tracking-wider brutal-box">
                        ENTER ARENA
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rankings */}
      <div className="px-4 sm:px-8 lg:px-16 py-16 border-t border-white/5">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl font-black tracking-tighter">
              GLOBAL <span className="text-red-600">RANKINGS</span>
            </h2>
            <Link href="/rankings">
              <span className="font-mono text-xs text-red-500 hover:text-red-400 flex items-center">
                VIEW ALL →
              </span>
            </Link>
          </div>

          <Card className="bg-white/[0.02] border-white/5 rounded-none">
            <CardContent className="p-0">
              {rankings.length === 0 ? (
                <div className="p-12 text-center">
                  <Medal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-black tracking-tighter mb-2">NO RANKINGS YET</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Rankings will appear once artists start competing and making sales.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {rankings.map((entry) => (
                    <div
                      key={entry.artistId}
                      className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 flex items-center justify-center font-black text-lg ${
                          entry.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                          entry.rank === 2 ? "bg-gray-400/20 text-gray-400" :
                          entry.rank === 3 ? "bg-orange-600/20 text-orange-600" :
                          "bg-white/5 text-muted-foreground"
                        }`}>
                          {entry.rank}
                        </div>
                        <div className="w-12 h-12 bg-red-600/20 flex items-center justify-center">
                          {entry.avatarUrl ? (
                            <img src={entry.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-black text-red-400">
                              {entry.artistName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-black tracking-tighter">{entry.artistName}</div>
                          <div className="text-xs font-mono text-muted-foreground">{entry.studio}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-xl">{entry.points} PTS</div>
                        <div className="text-xs font-mono text-muted-foreground">
                          {entry.sales} SALES
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
