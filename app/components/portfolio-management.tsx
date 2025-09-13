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
<<<<<<< HEAD
=======
  const [client, setClient] = useState<InvestEaseClient | null>(null)
  const [portfolios, setPortfolios] = useState<InvestEasePortfolio[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState<string>("")
  const [depositBusy, setDepositBusy] = useState(false)
  const [createStrategy, setCreateStrategy] = useState<string>("balanced")
  const [createAmount, setCreateAmount] = useState<string>("")
  const [createBusy, setCreateBusy] = useState(false)
  const [portfolioDetails, setPortfolioDetails] = useState<Record<string, any>>({})
  const [withdrawAmounts, setWithdrawAmounts] = useState<Record<string, string>>({})
  const [withdrawBusy, setWithdrawBusy] = useState<Record<string, boolean>>({})
  const [withdrawOpen, setWithdrawOpen] = useState<Record<string, boolean>>({})
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<Record<string, any>>({})
  const [closeBusy, setCloseBusy] = useState<Record<string, boolean>>({})
  const [transferOpen, setTransferOpen] = useState<Record<string, boolean>>({})
  const [transferAmounts, setTransferAmounts] = useState<Record<string, string>>({})
  const [transferBusy, setTransferBusy] = useState<Record<string, boolean>>({})

  const STRATEGIES: { value: string; label: string; description: string; target: string }[] = [
    { value: "aggressive_growth", label: "Aggressive growth", description: "High risk, high potential return", target: "12–15% annually" },
    { value: "growth", label: "Growth", description: "Medium-high risk, good growth potential", target: "8–12% annually" },
    { value: "balanced", label: "Balanced", description: "Medium risk, balanced growth and stability", target: "6–10% annually" },
    { value: "conservative", label: "Conservative", description: "Low-medium risk, steady growth", target: "4–7% annually" },
    { value: "very_conservative", label: "Very conservative", description: "Low risk, capital preservation focused", target: "2–5% annually" },
  ]

  const totalPortfolioValue = (() => {
    const portfolioSum = portfolios.reduce((sum, p) => {
      const d = portfolioDetails[p.id]
      const v = typeof d?.value === 'number' ? d.value : (typeof p.current_value === 'number' ? p.current_value : 0)
      return sum + v
    }, 0)
    const cash = typeof client?.cash === 'number' ? client.cash : 0
    return portfolioSum + cash
  })()

  const loadPortfolioDetails = async (ids: string[]) => {
    if (!ids.length) return
    const base = process.env.NEXT_PUBLIC_BFF_URL || "http://localhost:8000"
    try {
      const results = await Promise.all(ids.map(async (id) => {
        const r = await fetch(`${base}/investease/portfolios/${id}`)
        if (!r.ok) throw new Error(await r.text())
        const data = await r.json()
        return [id, data] as const
      }))
      setPortfolioDetails((prev) => {
        const next = { ...prev }
        for (const [id, data] of results) next[id] = data
        return next
      })
    } catch (e: any) {
      // surface a single error line without breaking all
      setError((prev) => prev ?? (typeof e?.message === 'string' ? e.message : 'Failed to load portfolio details'))
    }
  }

  const loadPortfolioAnalysis = async (ids: string[]) => {
    if (!ids.length) return
    const base = process.env.NEXT_PUBLIC_BFF_URL || "http://localhost:8000"
    const settled = await Promise.allSettled(
      ids.map(async (id) => {
        const r = await fetch(`${base}/investease/portfolios/${id}/analysis`)
        if (!r.ok) throw new Error(await r.text())
        const data = await r.json()
        return { id, data }
      })
    )
    const updates: Record<string, any> = {}
    for (const s of settled) {
      if (s.status === "fulfilled" && s.value && s.value.data) {
        updates[s.value.id] = s.value.data
      }
    }
    if (Object.keys(updates).length) {
      setPortfolioAnalysis((prev) => ({ ...prev, ...updates }))
    }
  }

  useEffect(() => {
    if (!user?.investEaseClientId) {
      setClient(null)
      setPortfolios([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    const base = process.env.NEXT_PUBLIC_BFF_URL || "http://localhost:8000"
    Promise.all([
      fetch(`${base}/investease/clients/${user.investEaseClientId}`).then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        return r.json()
      }),
      fetch(`${base}/investease/clients/${user.investEaseClientId}/portfolios`).then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        return r.json()
      }),
    ])
      .then(([c, ps]) => {
        if (cancelled) return
        setClient(c)
        setPortfolios(Array.isArray(ps) ? ps : [])
        // Load per-portfolio details (value, deposits, etc.)
        if (Array.isArray(ps) && ps.length) {
          const ids = ps.map((p: any) => p.id).filter(Boolean)
          loadPortfolioDetails(ids)
          loadPortfolioAnalysis(ids)
        } else {
          setPortfolioDetails({})
          setPortfolioAnalysis({})
        }
      })
      .catch((e) => {
        if (!cancelled) setError(typeof e?.message === "string" ? e.message : "Failed to load data")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user?.investEaseClientId])
>>>>>>> 3653099 (porfolio)

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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/70" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-3xl font-bold mb-2">Portfolio Management</h1>
          <p className="text-muted-foreground">Practice investing with virtual money</p>
        </div>

<<<<<<< HEAD
        {/* AI Portfolio Explainer */}
        <Card className="bg-card/95 backdrop-blur-sm border-2 border-foreground/20">
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
=======
        <Card className="bg-card/95 backdrop-blur-sm">
          <CardHeader>      
            <CardTitle>Client Overview</CardTitle>
            <CardDescription>Your current outlook on InvestEase</CardDescription>
          </CardHeader>
          <CardContent>
            {!user.investEaseClientId && (
              <div className="text-sm text-muted-foreground">No client ID yet. Try logging out and back in to initialize.</div>
            )}
            {user.investEaseClientId && (
              <div className="space-y-2">
                {loading && <div className="text-sm">Loading client…</div>}
                {error && <div className="text-sm text-red-600">{error}</div>}
                {!loading && !error && client && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Cash</div>
                      <div className="text-2xl font-bold text-primary">${typeof client.cash === 'number' ? client.cash.toLocaleString() : '0'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Total Net Worth</div>
                      <div className="text-2xl font-bold text-primary">${totalPortfolioValue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Portfolios Open</div>
                      <div className="text-2xl font-bold text-primary">{portfolios.length}</div>
                    </div>

                  </div>
                )}
                {!loading && !error && user.investEaseClientId && (
                  <div className="mt-4 border-t pt-4">
                    <div className="text-sm font-medium mb-2">Add Cash</div>
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <input
                        type="number"
                        min={1}
                        max={1000000}
                        step="1"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full sm:w-48 rounded-md border px-3 py-2 bg-background"
                      />
                      <button
                        disabled={depositBusy}
                        onClick={async () => {
                          const amt = Number(depositAmount)
                          if (!Number.isFinite(amt) || amt <= 0 || amt > 1_000_000) {
                            setError("Enter a valid amount between 1 and 1,000,000")
                            return
                          }
                          if (!user.investEaseClientId) return
                          setError(null)
                          setDepositBusy(true)
                          try {
                            const base = process.env.NEXT_PUBLIC_BFF_URL || "http://localhost:8000"
                            const res = await fetch(`${base}/investease/clients/${user.investEaseClientId}/deposit`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ amount: amt }),
                            })
                            if (!res.ok) {
                              throw new Error(await res.text())
                            }
                            setDepositAmount("")
                            // Refetch client and portfolios to reflect new cash
                            setLoading(true)
                            const [c, ps] = await Promise.all([
                              fetch(`${base}/investease/clients/${user.investEaseClientId}`).then(async (r) => {
                                if (!r.ok) throw new Error(await r.text())
                                return r.json()
                              }),
                              fetch(`${base}/investease/clients/${user.investEaseClientId}/portfolios`).then(async (r) => {
                                if (!r.ok) throw new Error(await r.text())
                                return r.json()
                              }),
                            ])
                            setClient(c)
                            setPortfolios(Array.isArray(ps) ? ps : [])
                            if (Array.isArray(ps) && ps.length) {
                              const ids = ps.map((p: any) => p.id).filter(Boolean)
                              loadPortfolioDetails(ids)
                              loadPortfolioAnalysis(ids)
                            } else {
                              setPortfolioDetails({})
                              setPortfolioAnalysis({})
                            }
                          } catch (e: any) {
                            setError(typeof e?.message === "string" ? e.message : "Deposit failed")
                          } finally {
                            setDepositBusy(false)
                            setLoading(false)
                          }
                        }}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow transition-colors hover:opacity-90 disabled:opacity-50"
                      >
                        {depositBusy ? "Depositing…" : "Deposit"}
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Min deposit: $1</div>
                  </div>
                )}
>>>>>>> 3653099 (porfolio)
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
        <Card className="bg-card/95 backdrop-blur-sm border border-foreground/20">
          <CardHeader>
<<<<<<< HEAD
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
          <Card className="bg-card/95 backdrop-blur-sm border border-foreground/20">
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
          <Card className="bg-card/95 backdrop-blur-sm border border-foreground/20">
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
          <Card className="bg-card/95 backdrop-blur-sm border border-foreground/20">
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
                className={`cursor-pointer transition-all bg-card/95 backdrop-blur-sm border border-foreground/20 ${
                  selectedPortfolio === portfolio.id ? "ring-2 ring-primary" : ""
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
=======
            <CardTitle>My Portfolios</CardTitle>
            <CardDescription>Fetched from InvestEase</CardDescription>
          </CardHeader>
          <CardContent>
            {!user.investEaseClientId && (
              <div className="text-sm text-muted-foreground">No client ID yet. Try logging out and back in to initialize.</div>
            )}
            {user.investEaseClientId && (
              <div className="space-y-3">
                {loading && <div className="text-sm">Loading portfolios…</div>}
                {error && <div className="text-sm text-red-600">{error}</div>}
                {!loading && !error && (
                  <>
                    {portfolios.length > 0 ? (
                      <div className="space-y-3">
                        {portfolios.map((p) => {
                          const d = portfolioDetails[p.id] || {}
                          const a = portfolioAnalysis[p.id] || {}
                          const value = typeof d.value === 'number' ? d.value : (typeof p.current_value === 'number' ? p.current_value : 0)
                          const deposits = typeof d.totalDeposits === 'number' ? d.totalDeposits : (typeof d.initialAmount === 'number' ? d.initialAmount : (typeof d.initial_amount === 'number' ? d.initial_amount : undefined))
                          const pct = typeof deposits === 'number' && deposits > 0 ? ((value - deposits) / deposits) * 100 : null
                          const pctColor = pct == null ? 'text-muted-foreground' : pct >= 0 ? 'text-emerald-600' : 'text-red-600'
                          const wid = p.id
                          return (
                            <div key={p.id} className="p-4 border rounded-lg">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="text-2xl md:text-3xl font-bold">${value.toLocaleString()}</div>
                                  <div className={`text-sm md:text-lg ${pctColor}`}>{pct == null ? '—' : `${pct.toFixed(2)}%`}</div>
                                  <div className="text-xs text-muted-foreground">Total value and % change</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{p.type || p.name || 'Portfolio'}</div>
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2 items-center">
                                {/* Add (transfer) from cash -> portfolio */}
                                {!transferOpen[wid] && (
                                  <button
                                    onClick={() => setTransferOpen((prev) => ({ ...prev, [wid]: true }))}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary text-primary-foreground px-3 py-1 text-xs font-medium shadow hover:opacity-90"
                                  >
                                    Add
                                  </button>
                                )}
                                {transferOpen[wid] && (
                                  <>
                                    <input
                                      type="number"
                                      min={1}
                                      step="1"
                                      placeholder="Amount"
                                      value={transferAmounts[wid] ?? ''}
                                      onChange={(e) => setTransferAmounts((prev) => ({ ...prev, [wid]: e.target.value }))}
                                      className="w-36 rounded-md border px-3 py-1 text-sm bg-background"
                                    />
                                    <button
                                      disabled={!!transferBusy[wid]}
                                      onClick={async () => {
                                        const amt = Number(transferAmounts[wid])
                                        if (!Number.isFinite(amt) || amt <= 0) {
                                          setError('Enter a valid add amount greater than 0')
                                          return
                                        }
                                        const cash = Number(client?.cash ?? 0)
                                        if (amt > cash) {
                                          setError(`Add must be ≤ available cash ($${cash.toLocaleString()})`)
                                          return
                                        }
                                        setError(null)
                                        setTransferBusy((prev) => ({ ...prev, [wid]: true }))
                                        try {
                                          const base = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:8000'
                                          const res = await fetch(`${base}/investease/portfolios/${wid}/transfer`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ amount: amt }),
                                          })
                                          if (!res.ok) throw new Error(await res.text())
                                          if (typeof window !== 'undefined') {
                                            window.location.hash = '#portfolio'
                                            window.location.reload()
                                          }
                                          return
                                        } catch (e: any) {
                                          setError(typeof e?.message === 'string' ? e.message : 'Add to portfolio failed')
                                        } finally {
                                          setTransferBusy((prev) => ({ ...prev, [wid]: false }))
                                        }
                                      }}
                                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary text-primary-foreground px-3 py-1 text-xs font-medium shadow transition-colors hover:opacity-90 disabled:opacity-50"
                                    >
                                      {transferBusy[wid] ? 'Adding…' : 'Confirm'}
                                    </button>
                                    <button
                                      onClick={() => setTransferOpen((prev) => ({ ...prev, [wid]: false }))}
                                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-muted px-3 py-1 text-xs font-medium shadow hover:opacity-90"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                                {!withdrawOpen[wid] && (
                                  <button
                                    onClick={() => setWithdrawOpen((prev) => ({ ...prev, [wid]: true }))}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary/80 text-primary-foreground px-3 py-1 text-xs font-medium shadow hover:opacity-90"
                                  >
                                    Withdraw
                                  </button>
                                )}
                                {/* Close portfolio button */}
                                {(() => {
                                  const canClose = (value ?? 0) <= 0
                                  return (
                                    <button
                                      disabled={!canClose || !!closeBusy[wid]}
                                      onClick={async () => {
                                        if (!((value ?? 0) <= 0)) return
                                        if (!window.confirm('Close this portfolio? This action cannot be undone.')) return
                                        setCloseBusy((prev) => ({ ...prev, [wid]: true }))
                                        try {
                                          const base = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:8000'
                                          const res = await fetch(`${base}/investease/portfolios/${wid}`, { method: 'DELETE' })
                                          if (!res.ok) throw new Error(await res.text())
                                          if (typeof window !== 'undefined') {
                                            window.location.hash = '#portfolio'
                                            window.location.reload()
                                          }
                                          return
                                        } catch (e: any) {
                                          setError(typeof e?.message === 'string' ? e.message : 'Close portfolio failed')
                                        } finally {
                                          setCloseBusy((prev) => ({ ...prev, [wid]: false }))
                                        }
                                      }}
                                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium shadow transition-colors ${(!canClose || !!closeBusy[wid]) ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-70' : 'bg-red-600 text-white hover:bg-red-700'}`}
                                    >
                                      {closeBusy[wid] ? 'Closing…' : 'Close portfolio'}
                                    </button>
                                  )
                                })()}
                                {withdrawOpen[wid] && (
                                  <>
                                    <input
                                      type="number"
                                      min={1}
                                      step="1"
                                      placeholder="Amount"
                                      value={withdrawAmounts[wid] ?? ''}
                                      onChange={(e) => setWithdrawAmounts((prev) => ({ ...prev, [wid]: e.target.value }))}
                                      className="w-36 rounded-md border px-3 py-1 text-sm bg-background"
                                    />
                                    <button
                                      disabled={!!withdrawBusy[wid]}
                                      onClick={async () => {
                                        const amt = Number(withdrawAmounts[wid])
                                        if (!Number.isFinite(amt) || amt <= 0) {
                                          setError('Enter a valid withdraw amount greater than 0')
                                          return
                                        }
                                        const max = value || 0
                                        if (amt > max) {
                                          setError(`Withdraw must be ≤ current value ($${max.toLocaleString()})`)
                                          return
                                        }
                                        setError(null)
                                        setWithdrawBusy((prev) => ({ ...prev, [wid]: true }))
                                        try {
                                          const base = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:8000'
                                          const res = await fetch(`${base}/investease/portfolios/${wid}/withdraw`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ amount: amt }),
                                          })
                                          if (!res.ok) throw new Error(await res.text())
                                          // Force a full page refresh to update all values and sections
                                          if (typeof window !== 'undefined') {
                                            window.location.hash = '#portfolio'
                                            window.location.reload()
                                          }
                                          return
                                        } catch (e: any) {
                                          setError(typeof e?.message === 'string' ? e.message : 'Withdraw failed')
                                        } finally {
                                          setWithdrawBusy((prev) => ({ ...prev, [wid]: false }))
                                        }
                                      }}
                                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary text-primary-foreground px-3 py-1 text-xs font-medium shadow transition-colors hover:opacity-90 disabled:opacity-50"
                                    >
                                      {withdrawBusy[wid] ? 'Withdrawing…' : 'Confirm'}
                                    </button>
                                    <button
                                      onClick={() => setWithdrawOpen((prev) => ({ ...prev, [wid]: false }))}
                                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-muted px-3 py-1 text-xs font-medium shadow hover:opacity-90"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                              </div>

                              {a && (a.trailingReturns || a.calendarReturns) && (
                                <div className="mt-3 space-y-2">
                                  {a.trailingReturns && (
                                    <div>
                                      <div className="text-xs text-muted-foreground mb-1">Trailing returns</div>
                                      <div className="flex flex-wrap gap-2 text-xs">
                                        {['1M','3M','6M','1Y','3Y','5Y','YTD'].map((k) => (
                                          a.trailingReturns?.[k] ? (
                                            <div key={k} className="px-2 py-1 rounded bg-muted">
                                              <span className="font-medium mr-1">{k}:</span>{a.trailingReturns[k]}
                                            </div>
                                          ) : null
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {a.calendarReturns && (
                                    <div>
                                      <div className="text-xs text-muted-foreground mb-1">Calendar returns</div>
                                      <div className="flex flex-wrap gap-2 text-xs">
                                        {Object.keys(a.calendarReturns)
                                          .sort((x,y) => Number(x) - Number(y))
                                          .map((yr) => (
                                            <div key={yr} className="px-2 py-1 rounded bg-muted">
                                              <span className="font-medium mr-1">{yr}:</span>{a.calendarReturns[yr]}
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">No portfolios yet for this client.</div>
                        {/* Encourage deposit if no cash */}
                        {(client?.cash ?? 0) <= 0 && (
                          <div className="text-sm">
                            Add cash above to create a portfolio.
                          </div>
                        )}
                      </div>
                    )}
                    {/* Create Portfolio section moved to bottom */}
                    {!loading && !error && (client?.cash ?? 0) > 0 && (
                      <div className="mt-4 border rounded-lg p-4">
                        <div className="text-sm font-medium mb-2">Create Portfolio</div>
                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                          <select
                            value={createStrategy}
                            onChange={(e) => setCreateStrategy(e.target.value)}
                            className="w-full sm:w-72 rounded-md border px-3 py-2 bg-background"
                          >
                            {STRATEGIES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label} — {s.description} (target: {s.target})
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min={1}
                            max={Math.max(1, Math.floor((client?.cash ?? 0)))}
                            step="1"
                            placeholder={`${(client?.cash ?? 0).toLocaleString?.() || client?.cash || 0}`}
                            value={createAmount}
                            onChange={(e) => setCreateAmount(e.target.value)}
                            className="w-full sm:w-48 rounded-md border px-3 py-2 bg-background"
                          />
                          <button
                            disabled={createBusy}
                            onClick={async () => {
                              if (!user.investEaseClientId) return
                              const amt = Number(createAmount)
                              const cash = Number(client?.cash ?? 0)
                              const allowed = STRATEGIES.map((s) => s.value)
                              if (!allowed.includes(createStrategy)) {
                                setError("Please choose a valid strategy.")
                                return
                              }
                              if (!Number.isFinite(amt) || amt <= 0 || amt > cash) {
                                setError(`Enter an initial amount between 1 and ${cash.toLocaleString()}`)
                                return
                              }
                              setError(null)
                              setCreateBusy(true)
                              try {
                                const base = process.env.NEXT_PUBLIC_BFF_URL || "http://localhost:8000"
                                const res = await fetch(`${base}/investease/clients/${user.investEaseClientId}/portfolios`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ type: createStrategy, initialAmount: amt }),
                                })
                                if (!res.ok) {
                                  throw new Error(await res.text())
                                }
                                setCreateAmount("")
                                // Refetch to update cash and portfolio list
                                setLoading(true)
                                const [c, ps] = await Promise.all([
                                  fetch(`${base}/investease/clients/${user.investEaseClientId}`).then(async (r) => {
                                    if (!r.ok) throw new Error(await r.text())
                                    return r.json()
                                  }),
                                  fetch(`${base}/investease/clients/${user.investEaseClientId}/portfolios`).then(async (r) => {
                                    if (!r.ok) throw new Error(await r.text())
                                    return r.json()
                                  }),
                                ])
                                setClient(c)
                                setPortfolios(Array.isArray(ps) ? ps : [])
                                if (Array.isArray(ps) && ps.length) {
                                  const ids = ps.map((p: any) => p.id).filter(Boolean)
                                  loadPortfolioDetails(ids)
                                  loadPortfolioAnalysis(ids)
                                } else {
                                  setPortfolioDetails({})
                                  setPortfolioAnalysis({})
                                }
                              } catch (e: any) {
                                setError(typeof e?.message === "string" ? e.message : "Create portfolio failed")
                              } finally {
                                setCreateBusy(false)
                                setLoading(false)
                              }
                            }}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow transition-colors hover:opacity-90 disabled:opacity-50"
                          >
                            {createBusy ? "Creating…" : "Create"}
                          </button>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Strategies: Aggressive Growth, Growth, Balanced, Conservative, Very Conservative
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
>>>>>>> 3653099 (porfolio)
      </div>
    </div>
  )
}
