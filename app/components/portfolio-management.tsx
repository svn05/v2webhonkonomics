"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "./auth-provider"

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface PortfolioHolding {
  symbol: string
  name: string
  shares: number
  avgPrice: number
  currentPrice: number
  value: number
  gainLoss: number
  gainLossPercent: number
}

interface PresetPortfolio {
  id: string
  name: string
  description: string
  riskLevel: "low" | "medium" | "high"
  allocation: { category: string; percentage: number; color: string }[]
  holdings: { symbol: string; name: string; percentage: number }[]
}

const presetPortfolios: PresetPortfolio[] = [
  {
    id: "conservative",
    name: "Conservative Nest Egg",
    description: "Low-risk portfolio focused on bonds and stable investments",
    riskLevel: "low",
    allocation: [
      { category: "Bonds", percentage: 60, color: "#3b82f6" },
      { category: "Dividend Stocks", percentage: 25, color: "#10b981" },
      { category: "Cash", percentage: 15, color: "#6b7280" },
    ],
    holdings: [
      { symbol: "TDB902", name: "TD Canadian Bond Index", percentage: 40 },
      { symbol: "TDB909", name: "TD Canadian Index", percentage: 25 },
      { symbol: "VTI", name: "Vanguard Total Stock", percentage: 20 },
      { symbol: "CASH", name: "Cash Reserve", percentage: 15 },
    ],
  },
  {
    id: "balanced",
    name: "Balanced Flock",
    description: "Moderate risk with 60/40 equity/fixed income split",
    riskLevel: "medium",
    allocation: [
      { category: "Canadian Stocks", percentage: 35, color: "#ef4444" },
      { category: "International Stocks", percentage: 25, color: "#f59e0b" },
      { category: "Bonds", percentage: 30, color: "#3b82f6" },
      { category: "REITs", percentage: 10, color: "#8b5cf6" },
    ],
    holdings: [
      { symbol: "VTI", name: "Vanguard Total Stock", percentage: 35 },
      { symbol: "VXUS", name: "Vanguard International", percentage: 25 },
      { symbol: "BND", name: "Vanguard Total Bond", percentage: 30 },
      { symbol: "VNQ", name: "Vanguard REIT", percentage: 10 },
    ],
  },
  {
    id: "growth",
    name: "Growth Gosling",
    description: "High-growth stocks and ETFs for long-term wealth building",
    riskLevel: "high",
    allocation: [
      { category: "Growth Stocks", percentage: 50, color: "#ef4444" },
      { category: "Tech ETFs", percentage: 30, color: "#f59e0b" },
      { category: "International Growth", percentage: 15, color: "#10b981" },
      { category: "Bonds", percentage: 5, color: "#3b82f6" },
    ],
    holdings: [
      { symbol: "VUG", name: "Vanguard Growth ETF", percentage: 50 },
      { symbol: "QQQ", name: "Invesco QQQ Trust", percentage: 30 },
      { symbol: "VXUS", name: "Vanguard International", percentage: 15 },
      { symbol: "BND", name: "Vanguard Total Bond", percentage: 5 },
    ],
  },
  {
    id: "dividend",
    name: "Dividend Dynasty",
    description: "Focus on dividend-paying stocks for steady income",
    riskLevel: "medium",
    allocation: [
      { category: "Dividend Stocks", percentage: 60, color: "#10b981" },
      { category: "REITs", percentage: 20, color: "#8b5cf6" },
      { category: "Bonds", percentage: 15, color: "#3b82f6" },
      { category: "Cash", percentage: 5, color: "#6b7280" },
    ],
    holdings: [
      { symbol: "VYM", name: "Vanguard High Dividend", percentage: 40 },
      { symbol: "SCHD", name: "Schwab US Dividend", percentage: 20 },
      { symbol: "VNQ", name: "Vanguard REIT", percentage: 20 },
      { symbol: "BND", name: "Vanguard Total Bond", percentage: 15 },
      { symbol: "CASH", name: "Cash Reserve", percentage: 5 },
    ],
  },
  {
    id: "aggressive",
    name: "Aggressive Growth",
    description: "Maximum growth potential with higher volatility",
    riskLevel: "high",
    allocation: [
      { category: "Small Cap Growth", percentage: 40, color: "#ef4444" },
      { category: "Emerging Markets", percentage: 30, color: "#f59e0b" },
      { category: "Tech Stocks", percentage: 25, color: "#8b5cf6" },
      { category: "Crypto ETF", percentage: 5, color: "#06b6d4" },
    ],
    holdings: [
      { symbol: "VB", name: "Vanguard Small-Cap", percentage: 40 },
      { symbol: "VWO", name: "Vanguard Emerging Markets", percentage: 30 },
      { symbol: "QQQ", name: "Invesco QQQ Trust", percentage: 25 },
      { symbol: "BITO", name: "Bitcoin Strategy ETF", percentage: 5 },
    ],
  },
]

// Mock stock data
const mockStocks: Stock[] = [
  { symbol: "VTI", name: "Vanguard Total Stock", price: 245.67, change: 2.34, changePercent: 0.96 },
  { symbol: "VXUS", name: "Vanguard International", price: 62.45, change: -0.87, changePercent: -1.37 },
  { symbol: "BND", name: "Vanguard Total Bond", price: 78.23, change: 0.12, changePercent: 0.15 },
  { symbol: "VNQ", name: "Vanguard REIT", price: 89.56, change: 1.23, changePercent: 1.39 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", price: 378.9, change: 4.56, changePercent: 1.22 },
]

export function PortfolioManagement() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("balanced")
  const [portfolioValue] = useState(10000) // Starting with $10,000 mock money
  const [totalGainLoss] = useState(234.56) // Mock gain/loss
  const { user } = useAuth()

  if (!user) return null

  const currentPortfolio = presetPortfolios.find((p) => p.id === selectedPortfolio) || presetPortfolios[1]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const mockHoldings: PortfolioHolding[] = currentPortfolio.holdings.map((holding) => {
    const stock = mockStocks.find((s) => s.symbol === holding.symbol)
    const value = (portfolioValue * holding.percentage) / 100
    const shares = stock ? value / stock.price : 0
    const avgPrice = stock?.price || 0
    const gainLoss = stock ? (stock.price - avgPrice) * shares : 0
    const gainLossPercent = avgPrice > 0 ? (gainLoss / (avgPrice * shares)) * 100 : 0

    return {
      symbol: holding.symbol,
      name: holding.name,
      shares: Math.round(shares * 100) / 100,
      avgPrice,
      currentPrice: stock?.price || avgPrice,
      value,
      gainLoss,
      gainLossPercent,
    }
  })

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/background3.png"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background/95" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-3xl font-bold mb-2">Portfolio Management</h1>
          <p className="text-muted-foreground">Practice investing with virtual money</p>
        </div>

        {/* AI Portfolio Explainer */}
        <Card className="bg-card/95 backdrop-blur-sm border-2 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Image 
                  src="/goose_glass.png" 
                  alt="Professor Goose" 
                  width={80} 
                  height={80}
                  className="flex-shrink-0"
                />
                <div>
                  <h3 className="font-bold text-lg">Need help understanding your portfolio?</h3>
                  <p className="text-sm text-muted-foreground">I can explain your asset allocation, risk level, and suggest improvements!</p>
                </div>
              </div>
              <Button 
                variant="brand"
                onClick={() => {
                  // TODO: Implement AI portfolio explanation
                  console.log("Explaining portfolio:", currentPortfolio.name)
                }}
              >
                Explain My Portfolio
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Overview */}
        <Card className="bg-card/95 backdrop-blur-sm">
          <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
          <CardDescription>Your virtual investment portfolio performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">${portfolioValue.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${totalGainLoss >= 0 ? "+" : ""}
                {totalGainLoss.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Gain/Loss</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalGainLoss >= 0 ? "+" : ""}
                {((totalGainLoss / (portfolioValue - totalGainLoss)) * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">Return</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{currentPortfolio.name}</div>
              <div className="text-sm text-muted-foreground">Current Strategy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Asset Allocation */}
          <Card className="bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>How your portfolio is distributed across asset classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentPortfolio.allocation.map((allocation) => (
                  <div key={allocation.category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: allocation.color }}></div>
                        {allocation.category}
                      </span>
                      <span>{allocation.percentage}%</span>
                    </div>
                    <Progress value={allocation.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart Placeholder */}
          <Card className="bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Performance Chart</CardTitle>
              <CardDescription>Portfolio value over time (simulated data)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p className="text-muted-foreground">Interactive chart would go here</p>
                  <p className="text-sm text-muted-foreground">Showing portfolio performance over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holdings" className="space-y-6">
          <Card className="bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Current Holdings</CardTitle>
              <CardDescription>Detailed view of your portfolio positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockHoldings.map((holding) => (
                  <div key={holding.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{holding.symbol}</div>
                      <div className="text-sm text-muted-foreground">{holding.name}</div>
                      <div className="text-sm text-muted-foreground">{holding.shares} shares</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${holding.value.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">${holding.currentPrice.toFixed(2)} per share</div>
                      <div className={`text-sm ${holding.gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {holding.gainLoss >= 0 ? "+" : ""}${holding.gainLoss.toFixed(2)} (
                        {holding.gainLossPercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          <div className="grid gap-4">
            {presetPortfolios.map((portfolio) => (
              <Card
                key={portfolio.id}
                className={`cursor-pointer transition-all bg-card/95 backdrop-blur-sm ${
                  selectedPortfolio === portfolio.id ? "ring-2 ring-primary" : "hover:shadow-md"
                }`}
                onClick={() => setSelectedPortfolio(portfolio.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {portfolio.name}
                        <Badge className={getRiskColor(portfolio.riskLevel)}>{portfolio.riskLevel} risk</Badge>
                        {selectedPortfolio === portfolio.id && <Badge variant="default">Current</Badge>}
                      </CardTitle>
                      <CardDescription className="mt-2">{portfolio.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Asset Allocation:</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {portfolio.allocation.map((allocation) => (
                        <div key={allocation.category} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: allocation.color }}></div>
                          <span>
                            {allocation.category}: {allocation.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                    {selectedPortfolio !== portfolio.id && (
                      <Button variant="outline" className="w-full mt-4 bg-transparent">
                        Switch to This Strategy
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Educational Note */}
      <Card className="border-blue-200 bg-blue-50/95 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-medium mb-2">Learning Note</h3>
              <p className="text-sm text-muted-foreground">
                This is a practice portfolio with virtual money. In real investing, always do your research, consider
                your risk tolerance, and never invest more than you can afford to lose. Consider consulting with a
                financial advisor for personalized advice.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
