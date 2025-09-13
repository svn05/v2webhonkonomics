"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LearningModule } from "./learning-module"
import { useAuth } from "./auth-provider"

interface ModuleInfo {
  id: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  progress: number
  locked: boolean
  pointsReward: number
  estimatedTime: string
}

const modules: ModuleInfo[] = [
  {
    id: "investment-basics",
    title: "Investment Basics 101",
    description: "Learn the fundamentals of investing, types of assets, and basic principles",
    difficulty: "beginner",
    progress: 0,
    locked: false,
    pointsReward: 50,
    estimatedTime: "15 min",
  },
  {
    id: "trading-fundamentals",
    title: "Trading Fundamentals 🦆",
    description: "Master buy/sell orders, market vs limit orders, and timing strategies",
    difficulty: "beginner",
    progress: 0,
    locked: false,
    pointsReward: 60,
    estimatedTime: "18 min",
  },
  {
    id: "stock-market-basics",
    title: "Stock Market Safari 🦢",
    description: "Navigate exchanges, tickers, market caps, and how stocks really work",
    difficulty: "beginner",
    progress: 0,
    locked: false,
    pointsReward: 55,
    estimatedTime: "16 min",
  },
  {
    id: "canadian-accounts",
    title: "Canadian Tax Accounts",
    description: "Master TFSA, RRSP, RESP, and FHSA for tax-efficient investing",
    difficulty: "beginner",
    progress: 0,
    locked: true,
    pointsReward: 75,
    estimatedTime: "20 min",
  },
  {
    id: "portfolio-management",
    title: "Portfolio Builder Pro 🪿",
    description: "Diversification, asset allocation, and building your ideal portfolio",
    difficulty: "intermediate",
    progress: 0,
    locked: false,
    pointsReward: 70,
    estimatedTime: "22 min",
  },
  {
    id: "risk-rewards",
    title: "Risk & Rewards Balance",
    description: "Understanding volatility, risk tolerance, and expected returns",
    difficulty: "intermediate",
    progress: 0,
    locked: false,
    pointsReward: 65,
    estimatedTime: "19 min",
  },
  {
    id: "etf-essentials",
    title: "ETF Essentials",
    description: "Everything you need to know about Exchange-Traded Funds",
    difficulty: "intermediate",
    progress: 0,
    locked: true,
    pointsReward: 60,
    estimatedTime: "18 min",
  },
  {
    id: "market-psychology",
    title: "Market Psychology",
    description: "Understand behavioral finance and avoid common investing mistakes",
    difficulty: "intermediate",
    progress: 0,
    locked: true,
    pointsReward: 80,
    estimatedTime: "25 min",
  },
  {
    id: "crypto-basics",
    title: "Crypto 101 🪙",
    description: "Bitcoin, blockchain, wallets, and the digital asset revolution",
    difficulty: "intermediate",
    progress: 0,
    locked: false,
    pointsReward: 85,
    estimatedTime: "24 min",
  },
  {
    id: "technical-analysis",
    title: "Chart Reading Master 📊",
    description: "Candlesticks, trends, support/resistance, and technical indicators",
    difficulty: "advanced",
    progress: 0,
    locked: false,
    pointsReward: 90,
    estimatedTime: "28 min",
  },
  {
    id: "options-derivatives",
    title: "Options & Derivatives",
    description: "Advanced strategies for experienced investors",
    difficulty: "advanced",
    progress: 0,
    locked: true,
    pointsReward: 100,
    estimatedTime: "30 min",
  },
  {
    id: "day-trading",
    title: "Day Trading Dojo 🥋",
    description: "High-frequency strategies, scalping, and intraday techniques",
    difficulty: "advanced",
    progress: 0,
    locked: false,
    pointsReward: 95,
    estimatedTime: "26 min",
  },
]

export function LearningHub() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const { user } = useAuth()

  const handleModuleComplete = () => {
    setSelectedModule(null)
    // In a real app, we'd update the module progress here
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/secondarybackground.png"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background/95" />
      </div>

      <div className="relative z-10">
        {selectedModule ? (
          <LearningModule moduleId={selectedModule} onComplete={handleModuleComplete} />
        ) : (
          <div className="max-w-5xl mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📚</div>
              <h1 className="text-3xl font-bold mb-2">Learning Hub</h1>
              <p className="text-muted-foreground">Master investing one lesson at a time</p>
            </div>

            {/* AI Search Section */}
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-sky-300 via-blue-400 to-sky-300 animate-gradient-shift">
              <Card className="bg-card/95 backdrop-blur-sm rounded-2xl border-0">
                <CardContent className="p-6 relative">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <Image 
                      src="/goose_glass.png" 
                      alt="Professor Goose" 
                      width={150} 
                      height={150}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 space-y-4 w-full">
                      <div>
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                          What do you want to learn about? 
                          <span className="text-2xl">🔍</span>
                        </h2>
                        <p className="text-base text-muted-foreground">Ask me anything about investing, markets, or personal finance! I'll create a personalized mini-course just for you.</p>
                      </div>
                      <div className="relative">
                        <Input
                          placeholder="e.g., How do I start investing with $100?"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => setIsSearchFocused(true)}
                          onBlur={() => setIsSearchFocused(false)}
                          className="w-full pr-44 h-12 rounded-xl text-base"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && searchQuery.trim()) {
                              console.log("Generating course for:", searchQuery)
                            }
                          }}
                        />
                        <Button 
                          className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 h-auto"
                          variant="brand"
                          onClick={() => {
                            // TODO: Implement AI search
                            console.log("Generating course for:", searchQuery)
                          }}
                          disabled={!searchQuery.trim()}
                        >
                          Generate Course
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Powered by Gemini - top right */}
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full border border-border">
                      <span className="text-sm text-muted-foreground font-medium">powered by</span>
                      <Image src="/gemini_logo.png" alt="Gemini" width={32} height={32} className="inline-block" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

        {/* User Progress Overview */}
        <Card className="bg-card/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Keep learning to earn more Honk Points and unlock new modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{user?.honkPoints || 0}</div>
              <div className="text-sm text-muted-foreground">Total Honk Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{user?.level || 1}</div>
              <div className="text-sm text-muted-foreground">Current Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1/5</div>
              <div className="text-sm text-muted-foreground">Modules Unlocked</div>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Learning Modules */}
        <div className="space-y-4">
        <h2 className="text-2xl font-bold">Learning Modules</h2>
        <div className="grid gap-4">
          {modules.map((module) => (
            <Card
              key={module.id}
              className={`transition-all bg-card/95 backdrop-blur-sm ${
                module.locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-md"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <Badge className={getDifficultyColor(module.difficulty)}>{module.difficulty}</Badge>
                      {module.locked && <Badge variant="secondary">🔒 Locked</Badge>}
                    </div>
                    <CardDescription className="mb-3">{module.description}</CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>⏱️ {module.estimatedTime}</span>
                      <span className="flex items-center gap-1">
                        <Image src="/honk_point.png" alt="Points" width={16} height={16} />
                        {module.pointsReward} points
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-2" />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => !module.locked && setSelectedModule(module.id)}
                      disabled={module.locked}
                      variant={module.progress > 0 ? "default" : "outline"}
                    >
                      {module.progress > 0 ? "Continue" : "Start Module"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

        {/* Coming Soon */}
        <Card className="border-dashed bg-card/95 backdrop-blur-sm">
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-lg font-medium mb-2">More Modules Coming Soon!</h3>
            <p className="text-muted-foreground">
              We're working on advanced topics like Real Estate, Cryptocurrency, and International Markets
            </p>
          </CardContent>
        </Card>
          </div>
        )}
      </div>
    </div>
  )
}
