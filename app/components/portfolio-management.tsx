"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  const [withdrawAmounts, setWithdrawAmounts] = useState<Record<string, string>>({})
  const [withdrawBusy, setWithdrawBusy] = useState<Record<string, boolean>>({})
  const [withdrawOpen, setWithdrawOpen] = useState<Record<string, boolean>>({})

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
          loadPortfolioDetails(ps.map((p: any) => p.id).filter(Boolean))
        } else {
          setPortfolioDetails({})
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
                                {!withdrawOpen[wid] && (
                                  <button
                                    onClick={() => setWithdrawOpen((prev) => ({ ...prev, [wid]: true }))}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary/80 text-primary-foreground px-3 py-1 text-xs font-medium shadow hover:opacity-90"
                                  >
                                    Withdraw
                                  </button>
                                )}
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
                                  </>
                                )}
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
