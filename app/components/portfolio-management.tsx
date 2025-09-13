"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-provider"

type InvestEaseClient = {
  id: string
  name?: string
  email?: string
  cash?: number
  [k: string]: any
}

type InvestEasePortfolio = {
  id: string
  type?: string
  name?: string
  current_value?: number
  invested_amount?: number
  client_id?: string
  team_name?: string
  created_at?: string
  total_months_simulated?: number
  transactions?: any[]
  growth_trend?: any
  [k: string]: any
}

export function PortfolioManagement() {
  const { user } = useAuth()
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
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<Record<string, any>>({})
  const [withdrawAmounts, setWithdrawAmounts] = useState<Record<string, string>>({})
  const [withdrawBusy, setWithdrawBusy] = useState<Record<string, boolean>>({})
  const [withdrawOpen, setWithdrawOpen] = useState<Record<string, boolean>>({})
  const [transferAmounts, setTransferAmounts] = useState<Record<string, string>>({})
  const [transferBusy, setTransferBusy] = useState<Record<string, boolean>>({})
  const [transferOpen, setTransferOpen] = useState<Record<string, boolean>>({})
  const [simulateMonths, setSimulateMonths] = useState<string>("6")
  const [simulateBusy, setSimulateBusy] = useState<boolean>(false)

  const STRATEGIES: { value: string; label: string; description: string; target: string }[] = [
    { value: "aggressive_growth", label: "Aggressive growth", description: "High risk, high potential return", target: "12–15% annually" },
    { value: "growth", label: "Growth", description: "Medium-high risk, good growth potential", target: "8–12% annually" },
    { value: "balanced", label: "Balanced", description: "Medium risk, balanced growth and stability", target: "6–10% annually" },
    { value: "conservative", label: "Conservative", description: "Low-medium risk, steady growth", target: "4–7% annually" },
    { value: "very_conservative", label: "Very conservative", description: "Low risk, capital preservation focused", target: "2–5% annually" },
  ]

  // Helpers for parsing and computing principal from transactions
  const asNumber = (val: any): number | undefined => {
    if (typeof val === 'number' && Number.isFinite(val)) return val
    if (typeof val === 'string') {
      const n = parseFloat(val.replace(/[^0-9.-]/g, ''))
      return Number.isFinite(n) ? n : undefined
    }
    return undefined
  }

  // Total principal (sum of all deposits; ignores growth/withdrawals)
  const calcTotalPrincipal = (transactions: any[] | undefined | null): number => {
    if (!Array.isArray(transactions)) return 0
    return transactions.reduce((sum, tx) => {
      const t = (tx?.type || '').toString().toLowerCase()
      const amt = asNumber(tx?.amount) || 0
      if (t === 'deposit' && amt > 0) return sum + amt
      return sum
    }, 0)
  }

  // Net principal after withdrawals (deposits minus withdrawals; ignores growth)
  const calcNetPrincipalAfterWithdrawals = (transactions: any[] | undefined | null): number => {
    if (!Array.isArray(transactions)) return 0
    let deposits = 0
    let withdrawals = 0
    for (const tx of transactions) {
      const t = (tx?.type || '').toString().toLowerCase()
      const amtRaw = asNumber(tx?.amount) || 0
      if (t === 'deposit' && amtRaw > 0) {
        deposits += amtRaw
      } else if (t === 'withdraw') {
        // Treat withdraw as positive amount to subtract from deposits
        const amt = Math.abs(amtRaw)
        withdrawals += amt
      }
    }
    const net = deposits - withdrawals
    return net > 0 ? net : 0
  }

  const pickCostBasis = (d: any, p: any): number | undefined => {
    // Prefer server-provided invested_amount; fallback to computing from transactions
    if (typeof d?.invested_amount === 'number' && d.invested_amount >= 0) return d.invested_amount
    if (typeof p?.invested_amount === 'number' && p.invested_amount >= 0) return p.invested_amount
    const txs = Array.isArray(d?.transactions) ? d.transactions : (Array.isArray(p?.transactions) ? p.transactions : [])
    const net = calcNetPrincipalAfterWithdrawals(txs)
    return Number.isFinite(net) && net > 0 ? net : undefined
  }

  const totalPortfolioValue = (() => {
    const portfolioSum = portfolios.reduce((sum, p) => {
      const d = portfolioDetails[p.id]
      const v = typeof d?.current_value === 'number' ? d.current_value : (typeof p.current_value === 'number' ? p.current_value : 0)
      return sum + v
    }, 0)
    const cash = typeof client?.cash === 'number' ? client.cash : 0
    return portfolioSum + cash
  })()

  // --- Performance helpers ---
  const parsePercent = (val: any): number | undefined => {
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
      const m = val.match(/-?\d+(?:\.\d+)?/)
      if (m) return parseFloat(m[0])
    }
    return undefined
  }

  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const monthLabel = (d: Date) => d.toLocaleString(undefined, { month: 'short' }) + ' ' + String(d.getFullYear()).slice(-2)

  const computeMonthlyReturnsFromTrend = (trend: any[] | undefined | null): { label: string; pct: number }[] => {
    if (!Array.isArray(trend) || trend.length === 0) return []
    // Build month -> last value map
    const byMonth = new Map<string, { date: Date; value: number }>()
    for (const pt of trend) {
      const raw = (pt?.date ?? pt?.timestamp ?? pt?.day ?? pt?.time)
      const val = typeof pt?.value === 'number' ? pt.value : (typeof pt?.current_value === 'number' ? pt.current_value : undefined)
      if (!raw || typeof val !== 'number' || !Number.isFinite(val)) continue
      const dt = new Date(raw)
      if (isNaN(dt.getTime())) continue
      const key = monthKey(dt)
      const prev = byMonth.get(key)
      if (!prev || dt > prev.date) {
        byMonth.set(key, { date: dt, value: val })
      }
    }
    const entries = Array.from(byMonth.values()).sort((a, b) => a.date.getTime() - b.date.getTime())
    if (entries.length < 2) return []
    const res: { label: string; pct: number }[] = []
    for (let i = 1; i < entries.length; i++) {
      const prev = entries[i - 1]
      const cur = entries[i]
      if (prev.value > 0) {
        const pct = ((cur.value - prev.value) / prev.value) * 100
        res.push({ label: monthLabel(cur.date), pct })
      }
    }
    // Keep last 12 months
    return res.slice(-12)
  }

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
    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          const r = await fetch(`${base}/investease/portfolios/${id}/analysis`)
          if (!r.ok) {
            const txt = await r.text()
            if (txt && txt.includes("No growth trend data")) {
              // Gracefully ignore missing trend data
              return [id, null] as const
            }
            throw new Error(txt)
          }
          const data = await r.json()
          if (data && typeof data === 'object' && data.message === 'No growth trend data found for this portfolio') {
            // Gracefully ignore missing trend data
            return [id, null] as const
          }
          return [id, data] as const
        })
      )
      setPortfolioAnalysis((prev) => {
        const next: Record<string, any> = { ...prev }
        for (const [id, data] of results) {
          if (data != null) {
            next[id] = data
          } else {
            // Ensure we don't show anything for this portfolio
            delete next[id]
          }
        }
        return next
      })
    } catch (e: any) {
      setError((prev) => prev ?? (typeof e?.message === 'string' ? e.message : 'Failed to load portfolio analysis'))
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
        // Load per-portfolio details and analysis
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

  if (!user) return null

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <Image src="/background3.png" alt="Background" fill className="object-cover opacity-20" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background/95" />
      </div>
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
              </div>
              <Button
                variant="brand"
                onClick={() => {
                  // TODO: Implement AI portfolio explanation
                  console.log("Explaining portfolio")
                }}
              >
                Explain My Portfolio
              </Button>
            </div>
          </CardContent>
        </Card>

      <div className="relative z-10 max-w-5xl mx-auto p-4 space-y-6">
        <div className="text-center py-4">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-3xl font-bold mb-2">Portfolio Management</h1>
          <p className="text-muted-foreground">Your InvestEase sandbox portfolios and cash</p>
        </div>

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
                      <div className="text-xs text-muted-foreground">Total Portfolio Value</div>
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
                              loadPortfolioDetails(ps.map((p: any) => p.id).filter(Boolean))
                            } else {
                              setPortfolioDetails({})
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
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>My Portfolios</CardTitle>
            <CardDescription>Fetched from InvestEase</CardDescription>
          </CardHeader>
          <CardContent>
            {!user.investEaseClientId && (
              <div className="text-sm text-muted-foreground">No client ID yet. Try logging out and back in to initialize.</div>
            )}
            {user.investEaseClientId && (
              <div className="space-y-3">
                {/* Simulate your future */}
                {!loading && !error && (
                  <div className="mb-4 border rounded-lg p-4">
                    <div className="text-sm font-medium mb-2">Simulate your future</div>
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <input
                        type="number"
                        min={1}
                        max={12}
                        step="1"
                        placeholder="Months (1-12)"
                        value={simulateMonths}
                        onChange={(e) => setSimulateMonths(e.target.value)}
                        className="w-full sm:w-48 rounded-md border px-3 py-2 bg-background"
                      />
                      <button
                        disabled={simulateBusy}
                        onClick={async () => {
                          const m = Number(simulateMonths)
                          if (!Number.isInteger(m) || m < 1 || m > 12) {
                            setError('Enter months between 1 and 12')
                            return
                          }
                          if (!user.investEaseClientId) return
                          setError(null)
                          setSimulateBusy(true)
                          try {
                            const base = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:8000'
                            const res = await fetch(`${base}/investease/client/${user.investEaseClientId}/simulate`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ months: m }),
                            })
                            if (!res.ok) throw new Error(await res.text())
                            // After simulation, refresh analyses and details for all portfolios
                            const ids = portfolios.map((p) => p.id).filter(Boolean)
                            if (ids.length) {
                              await Promise.all([loadPortfolioAnalysis(ids), loadPortfolioDetails(ids)])
                            }
                            // Also refresh client cash & portfolio list values in case they changed
                            const [c, ps] = await Promise.all([
                              fetch(`${base}/investease/clients/${user.investEaseClientId}`).then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() }),
                              fetch(`${base}/investease/clients/${user.investEaseClientId}/portfolios`).then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() }),
                            ])
                            setClient(c)
                            setPortfolios(Array.isArray(ps) ? ps : [])
                          } catch (e: any) {
                            setError(typeof e?.message === 'string' ? e.message : 'Simulation failed')
                          } finally {
                            setSimulateBusy(false)
                          }
                        }}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow transition-colors hover:opacity-90 disabled:opacity-50"
                      >
                        {simulateBusy ? 'Simulating…' : 'Simulate'}
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Choose 1–12 months. This runs a sandbox simulation and updates analyses below.</div>
                  </div>
                )}
                {!loading && !error && (client?.cash ?? 0) > 0 && (
                  <div className="mb-4 border rounded-lg p-4">
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
                              loadPortfolioDetails(ps.map((p: any) => p.id).filter(Boolean))
                            } else {
                              setPortfolioDetails({})
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
                {loading && <div className="text-sm">Loading portfolios…</div>}
                {error && <div className="text-sm text-red-600">{error}</div>}
                {!loading && !error && (
                  <>
                    {portfolios.length > 0 ? (
                      <div className="space-y-3">
                        {portfolios.map((p) => {
                          const d = portfolioDetails[p.id] || {}
                          const a = portfolioAnalysis[p.id] || {}
                          const currentValue = typeof d.current_value === 'number' ? d.current_value : (typeof p.current_value === 'number' ? p.current_value : 0)
                          const invested = typeof d.invested_amount === 'number' ? d.invested_amount : (typeof p.invested_amount === 'number' ? p.invested_amount : undefined)
                          const pct = typeof invested === 'number' && invested > 0 ? ((currentValue - invested) / invested) * 100 : null
                          const value = currentValue
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
                                  <div className="mt-2 flex flex-col items-end gap-2">
                                    {!transferOpen[wid] && !withdrawOpen[wid] && (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            setTransferOpen((prev) => ({ ...prev, [wid]: true }))
                                            setWithdrawOpen((prev) => ({ ...prev, [wid]: false }))
                                          }}
                                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary/80 text-primary-foreground px-3 py-1 text-xs font-medium shadow hover:opacity-90"
                                        >
                                          Add
                                        </button>
                                        <button
                                          onClick={() => {
                                            setWithdrawOpen((prev) => ({ ...prev, [wid]: true }))
                                            setTransferOpen((prev) => ({ ...prev, [wid]: false }))
                                          }}
                                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary/80 text-primary-foreground px-3 py-1 text-xs font-medium shadow hover:opacity-90"
                                        >
                                          Withdraw
                                        </button>
                                      </div>
                                    )}
                                    {transferOpen[wid] && (
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          min={1}
                                          step="1"
                                          placeholder="Amount"
                                          value={transferAmounts[wid] ?? ''}
                                          onChange={(e) => setTransferAmounts((prev) => ({ ...prev, [wid]: e.target.value }))}
                                          className="w-36 rounded-md border px-3 py-1 text-sm bg-background text-right"
                                        />
                                        <button
                                          disabled={!!transferBusy[wid]}
                                          onClick={async () => {
                                            const amt = Number(transferAmounts[wid])
                                            const cash = Number(client?.cash ?? 0)
                                            if (!Number.isFinite(amt) || amt <= 0) {
                                              setError('Enter a valid add amount greater than 0')
                                              return
                                            }
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
                                              // Clear input, refresh client cash and this portfolio's details
                                              setTransferAmounts((prev) => ({ ...prev, [wid]: '' }))
                                              const [c, dref] = await Promise.all([
                                                fetch(`${base}/investease/clients/${user.investEaseClientId}`).then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() }),
                                                fetch(`${base}/investease/portfolios/${wid}`).then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() }),
                                              ])
                                              setClient(c)
                                              setPortfolioDetails((prev) => ({ ...prev, [wid]: dref }))
                                              setTransferOpen((prev) => ({ ...prev, [wid]: false }))
                                            } catch (e: any) {
                                              setError(typeof e?.message === 'string' ? e.message : 'Add failed')
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
                                      </div>
                                    )}
                                    {withdrawOpen[wid] && (
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          min={1}
                                          step="1"
                                          placeholder="Amount"
                                          value={withdrawAmounts[wid] ?? ''}
                                          onChange={(e) => setWithdrawAmounts((prev) => ({ ...prev, [wid]: e.target.value }))}
                                          className="w-36 rounded-md border px-3 py-1 text-sm bg-background text-right"
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
                                              // Clear input, refresh client cash and this portfolio's details
                                              setWithdrawAmounts((prev) => ({ ...prev, [wid]: '' }))
                                              const [c, dref] = await Promise.all([
                                                fetch(`${base}/investease/clients/${user.investEaseClientId}`).then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() }),
                                                fetch(`${base}/investease/portfolios/${wid}`).then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() }),
                                              ])
                                              setClient(c)
                                              setPortfolioDetails((prev) => ({ ...prev, [wid]: dref }))
                                              setWithdrawOpen((prev) => ({ ...prev, [wid]: false }))
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
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* KPIs row */}
                              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-3 rounded-lg bg-muted/60">
                                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Invested</div>
                                  <div className="text-sm font-semibold">${(typeof d.invested_amount === 'number' ? d.invested_amount : (typeof p.invested_amount === 'number' ? p.invested_amount : 0)).toLocaleString()}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/60">
                                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">P/L</div>
                                  <div className={`text-sm font-semibold ${pct == null ? '' : pct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{pct == null ? '—' : `$${(value - (typeof d.invested_amount === 'number' ? d.invested_amount : (typeof p.invested_amount === 'number' ? p.invested_amount : 0))).toLocaleString()}`}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/60">
                                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">1Y</div>
                                  <div className="text-sm font-semibold">{a?.trailingReturns?.['1Y'] ?? '—'}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/60">
                                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">YTD</div>
                                  <div className="text-sm font-semibold">{a?.trailingReturns?.['YTD'] ?? '—'}</div>
                                </div>
                              </div>

                              {/* Charts */}
                              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Month-over-month (from growth_trend) */}
                                <div className="p-3 rounded-lg border">
                                  <div className="text-xs mb-2 font-medium">Monthly change (last 12)</div>
                                  {(() => {
                                    const series = computeMonthlyReturnsFromTrend(d?.growth_trend)
                                    if (!series.length) return <div className="text-xs text-muted-foreground">Not enough data</div>
                                    const values = series.map(s => s.pct)
                                    const maxV = Math.max(0, ...values)
                                    const minV = Math.min(0, ...values)
                                    const absMax = Math.max(Math.abs(maxV), Math.abs(minV)) || 1
                                    const barW = Math.max(8, Math.floor(220 / series.length))
                                    const height = 120
                                    const mid = height / 2
                                    return (
                                      <svg width={Math.max(220, series.length * (barW + 4))} height={height} className="overflow-visible">
                                        {series.map((s, i) => {
                                          const h = (Math.abs(s.pct) / absMax) * (height / 2 - 6)
                                          const y = s.pct >= 0 ? mid - h : mid
                                          const color = s.pct >= 0 ? '#059669' : '#dc2626'
                                          return (
                                            <g key={i} transform={`translate(${i * (barW + 4)},0)`}>
                                              <rect x={0} y={y} width={barW} height={Math.max(2, h)} fill={color} rx={2} />
                                            </g>
                                          )
                                        })}
                                        {/* mid axis */}
                                        <line x1={0} x2={Math.max(220, series.length * (barW + 4))} y1={mid} y2={mid} stroke="#d1d5db" strokeDasharray="2,3" />
                                      </svg>
                                    )
                                  })()}
                                </div>

                                {/* Year-over-year (from calendarReturns) */}
                                <div className="p-3 rounded-lg border">
                                  <div className="text-xs mb-2 font-medium">Year over year</div>
                                  {a?.calendarReturns ? (
                                    (() => {
                                      const years = Object.keys(a.calendarReturns).sort((x, y) => Number(x) - Number(y))
                                      if (!years.length) return <div className="text-xs text-muted-foreground">No data</div>
                                      const parsed = years.map(y => ({ y, pct: parsePercent(a.calendarReturns[y]) ?? 0 }))
                                      const maxV = Math.max(0, ...parsed.map(p => p.pct))
                                      const minV = Math.min(0, ...parsed.map(p => p.pct))
                                      const absMax = Math.max(Math.abs(maxV), Math.abs(minV)) || 1
                                      const barW = Math.max(16, Math.floor(220 / parsed.length))
                                      const height = 120
                                      const mid = height / 2
                                      return (
                                        <svg width={Math.max(220, parsed.length * (barW + 8))} height={height} className="overflow-visible">
                                          {parsed.map((s, i) => {
                                            const h = (Math.abs(s.pct) / absMax) * (height / 2 - 6)
                                            const y = s.pct >= 0 ? mid - h : mid
                                            const color = s.pct >= 0 ? '#059669' : '#dc2626'
                                            return (
                                              <g key={i} transform={`translate(${i * (barW + 8)},0)`}>
                                                <rect x={0} y={y} width={barW} height={Math.max(2, h)} fill={color} rx={2} />
                                                <text x={barW / 2} y={height + 12} fontSize={10} textAnchor="middle" fill="#6b7280">{s.y}</text>
                                              </g>
                                            )
                                          })}
                                          <line x1={0} x2={Math.max(220, parsed.length * (barW + 8))} y1={mid} y2={mid} stroke="#d1d5db" strokeDasharray="2,3" />
                                        </svg>
                                      )
                                    })()
                                  ) : (
                                    <div className="text-xs text-muted-foreground">No data</div>
                                  )}
                                </div>
                              </div>
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
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
