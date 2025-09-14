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
  const { user, updateUser } = useAuth()
  // Some builds may not surface custom fields on the User type; derive locally.
  const uClientId: string | null = (user as any)?.investEaseClientId ?? null
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
  const [explainOpen, setExplainOpen] = useState<boolean>(false)
  const [explainChoice, setExplainChoice] = useState<string | null>(null)
  const [explainBusy, setExplainBusy] = useState<boolean>(false)
  const [explainMsg, setExplainMsg] = useState<string>("")
  const [showSimulate, setShowSimulate] = useState<boolean>(false)

  // -------- Demo data seeding (ensures graphs render) --------
  const seedDemoData = (opts?: { keepClient?: boolean }) => {
    // Build ~4 years (48 months) of synthetic growth trend
    const months = 48
    const start = new Date()
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    start.setMonth(start.getMonth() - months)
    const invested = 15000
    let cur = invested
    const growth_trend: { date: string; value: number }[] = []
    for (let i = 0; i <= months; i++) {
      const d = new Date(start)
      d.setMonth(start.getMonth() + i)
      // Deterministic small monthly change within ~±2.5%
      const drift = 0.25 // baseline monthly drift in %
      const wobble = Math.sin(i * 0.9) * 1.2 + Math.cos(i * 0.33) * 0.8 // ~[-2,2]
      const pct = drift + wobble // percent
      cur = cur * (1 + pct / 100)
      growth_trend.push({ date: d.toISOString().slice(0, 10), value: Number(cur.toFixed(2)) })
    }
    const current_value = Number(cur.toFixed(2))

    const demoPortfolio: InvestEasePortfolio = {
      id: "demo-portfolio-1",
      type: "balanced",
      name: "Demo Balanced",
      invested_amount: invested,
      current_value,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 4).toISOString(),
      total_months_simulated: months,
      team_name: "Demo",
      transactions: [],
      __demo: true as any,
    }

    // Calendar returns for last 4 years
    const nowY = new Date().getFullYear()
    const calendarReturns: Record<string, string> = {}
    calendarReturns[String(nowY - 3)] = "6.4%"
    calendarReturns[String(nowY - 2)] = "9.1%"
    calendarReturns[String(nowY - 1)] = "-2.7%"
    calendarReturns[String(nowY)] = "5.3%"

    if (!opts?.keepClient) {
      setClient({ id: "demo-client", name: "Demo Client", email: "demo@example.com", cash: 25000 })
    }
    setPortfolios([demoPortfolio])
    setPortfolioDetails({
      [demoPortfolio.id]: {
        ...demoPortfolio,
        growth_trend,
      },
    })
    setPortfolioAnalysis({
      [demoPortfolio.id]: {
        trailingReturns: { "1Y": "7.2%", YTD: "4.1%" },
        calendarReturns,
      },
    })
  }

  const STRATEGIES: { value: string; label: string; description: string; target: string }[] = [
    { value: "aggressive_growth", label: "RBC Aggressive Growth", description: "High risk, high potential return", target: "12–15% annually" },
    { value: "growth", label: "RBC Growth", description: "Medium-high risk, good growth potential", target: "8–12% annually" },
    { value: "balanced", label: "RBC Balanced", description: "Medium risk, balanced growth and stability", target: "6–10% annually" },
    { value: "conservative", label: "RBC Conservative", description: "Low-medium risk, steady growth", target: "4–7% annually" },
    { value: "very_conservative", label: "RBC Very Conservative", description: "Low risk, capital preservation focused", target: "2–5% annually" },
  ]

  // LLM wiring lives below via fetch; no client SDK used in-browser

  // Normalize portfolio list responses from various backends
  const extractPortfolios = (raw: any): InvestEasePortfolio[] => {
    if (!raw) return []
    // Check if it's an array directly
    if (Array.isArray(raw)) return raw as InvestEasePortfolio[]
    // If it's a single portfolio object, wrap it in an array
    if (raw && typeof raw === 'object' && raw.id) return [raw] as InvestEasePortfolio[]
    // Check nested arrays
    if (raw && Array.isArray(raw.portfolios)) return raw.portfolios as InvestEasePortfolio[]
    if (raw && Array.isArray(raw.data)) return raw.data as InvestEasePortfolio[]
    // Check if response is a single portfolio in data field
    if (raw && raw.data && typeof raw.data === 'object' && raw.data.id) return [raw.data] as InvestEasePortfolio[]
    // If nothing matches, return empty array
    return []
  }

  // Human-friendly label for strategy values like "balanced" or "aggressive_growth"
  const strategyValueToLabel = (val: any): string | undefined => {
    if (val == null) return undefined
    const v = String(val)
    const found = STRATEGIES.find((s) => s.value === v)
    if (found) return found.label
    const cleaned = v.replace(/_/g, ' ').trim()
    if (!cleaned) return undefined
    // Title-case words
    return cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
  }

  // --- Currency display helpers (hard-coded FX vs CAD) ---
  type CurrencyCode =
    | 'CAD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR'
    | 'AUD' | 'CHF' | 'CNY' | 'HKD' | 'SGD'
    | 'MXN' | 'BRL' | 'ZAR' | 'PHP' | 'KRW'
    | 'BBD' | 'JMD' | 'TTD' | 'BSD'
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>('CAD')
  const [liveRate, setLiveRate] = useState<{ pair: string; rate: number; asOf: string; url: string } | null>(null)
  const FX: Record<CurrencyCode, number> = {
    CAD: 1,        // Base
    USD: 0.73,     // 1 CAD -> 0.73 USD
    EUR: 0.68,     // 1 CAD -> 0.68 EUR
    GBP: 0.58,     // 1 CAD -> 0.58 GBP
    JPY: 85,       // 1 CAD -> 85 JPY
    INR: 60,       // 1 CAD -> 60 INR (India)
    AUD: 1.10,     // 1 CAD -> 1.10 AUD
    CHF: 0.66,     // 1 CAD -> 0.66 CHF
    CNY: 5.30,     // 1 CAD -> 5.30 CNY (China)
    HKD: 5.70,     // 1 CAD -> 5.70 HKD (Hong Kong)
    SGD: 1.00,     // 1 CAD -> 1.00 SGD (Singapore)
    MXN: 13.0,     // 1 CAD -> 13.0 MXN (Mexico)
    BRL: 3.9,      // 1 CAD -> 3.9 BRL (Brazil)
    ZAR: 13.5,     // 1 CAD -> 13.5 ZAR (South Africa)
    PHP: 41,       // 1 CAD -> 41 PHP (Philippines)
    KRW: 1000,     // 1 CAD -> 1000 KRW (South Korea)
    // RBC Caribbean region
    BBD: 1.45,     // 1 CAD -> 1.45 BBD (Barbados)
    JMD: 115,      // 1 CAD -> 115 JMD (Jamaica)
    TTD: 5.0,      // 1 CAD -> 5.0 TTD (Trinidad & Tobago)
    BSD: 0.73,     // 1 CAD -> 0.73 BSD (Bahamas, USD-pegged)
  }
  const formatMoney = (cadAmount: any): string => {
    const n = asNumber(cadAmount) ?? 0
    const rate = FX[displayCurrency] || 1
    const converted = n * rate
    const zeroDecimal = displayCurrency === 'JPY'
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: displayCurrency,
        minimumFractionDigits: zeroDecimal ? 0 : 0,
        maximumFractionDigits: zeroDecimal ? 0 : 0,
      }).format(converted)
    } catch {
      // Fallback: symbol-less with thousands
      return `${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    }
  }
  const toCAD = (amountInDisplay: number, code: CurrencyCode = displayCurrency): number => {
    const rate = FX[code] || 1
    return amountInDisplay / rate
  }

  // ---------- LLM helpers for "Explain My Portfolio" ----------
  const buildExplainPrompt = (strategy: string) => {
    const choiceLabel = strategyValueToLabel(strategy) || strategy
    const summary = portfolios
      .map((p) => {
        const d = portfolioDetails[p.id]
        const name = p.name || p.type || 'Portfolio'
        const val = typeof d?.current_value === 'number' ? d.current_value : (typeof p?.current_value === 'number' ? p.current_value : 0)
        const inv = typeof d?.invested_amount === 'number' ? d.invested_amount : (typeof p?.invested_amount === 'number' ? p.invested_amount : 0)
        return `- ${name}: value ${val}, invested ${inv}`
      })
      .join('\n')
    return (
      `You are an investing coach. The user selected the strategy: ${choiceLabel}. Attached are details about RBC's portfolios make up: \n` +
      `Summarize this strategy and what qualities of commodities are reflected in the strategy including risk, asset mix, expected volatility, time horizon and past returns. The focus is on the asset mix. You must give atleast three examples of a asset/etf/commodity that are in the portfolio.\n` +
      `Keep it concise 70-90 words).\n\n` +
      `User portfolios (value, invested):\n${summary || '- none'}\n`
    )
  }

  const buildExplainPayload = (strategy: string) => {
    const strategyLabel = strategyValueToLabel(strategy) || strategy
    const details = portfolios.map((p) => {
      const d = portfolioDetails[p.id]
      const value = typeof d?.current_value === 'number' ? d.current_value : (typeof p?.current_value === 'number' ? p.current_value : 0)
      const invested = typeof d?.invested_amount === 'number' ? d.invested_amount : (typeof p?.invested_amount === 'number' ? p.invested_amount : 0)
      return { id: p.id, name: p.name || p.type || 'Portfolio', value, invested, type: p.type }
    })
    return {
      strategy: { value: strategy, label: strategyLabel },
      clientId: uClientId,
      portfolioIds: portfolios.map((p) => p.id),
      portfolios: details,
      prompt: buildExplainPrompt(strategy),
    }
  }

  const requestExplainLLM = async (strategy: string) => {
    const customEndpoint = process.env.NEXT_PUBLIC_LLM_ENDPOINT
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    const model = process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini'
    const prompt = buildExplainPrompt(strategy)
    const payload = buildExplainPayload(strategy)
    // Attempt to attach a reference markdown from /public if present
    let referenceMd: string | null = null
    try {
      const r = await fetch('/rbc_portfolios_summary.md', { headers: { Accept: 'text/markdown, text/plain' } })
      if (r.ok) referenceMd = await r.text()
    } catch {}
    if (customEndpoint) {
      const r = await fetch(customEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, referenceMd, referenceMdName: 'rbc_portfolios_summary.md', ...payload }),
      })
      if (!r.ok) throw new Error(await r.text())
      const data = await r.json().catch(() => null)
      return typeof data?.message === 'string' ? data.message : JSON.stringify(data)
    }
    if (apiKey) {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: (
            [ { role: 'system', content: 'You are a helpful investing coach that explains RBC\'s portfolios.' } ]
            .concat(referenceMd ? [{ role: 'system', content: `Reference document (rbc_portfolios_summary.md):\n\n${referenceMd}` }] : [])
            .concat([{ role: 'user', content: prompt }])
          ),
          temperature: 0.5,
          max_tokens: 1000,
        }),
      })
      if (!r.ok) throw new Error(await r.text())
      const data = await r.json()
      const msg = data?.choices?.[0]?.message?.content
      return typeof msg === 'string' ? msg : JSON.stringify(data)
    }
    throw new Error('No LLM configured. Set NEXT_PUBLIC_LLM_ENDPOINT or NEXT_PUBLIC_OPENAI_API_KEY.')
  }

  // Reset explain panel state whenever it is opened or closed
  useEffect(() => {
    setExplainChoice(null)
    setExplainMsg("")
    setExplainBusy(false)
  }, [explainOpen])

  useEffect(() => {
    const from: CurrencyCode = displayCurrency === 'CAD' ? 'CAD' : displayCurrency
    const to: CurrencyCode = displayCurrency === 'CAD' ? 'USD' : 'CAD'
    // Map display pair to BOC series
    let code: string | null = null
    let invert = false
    if (from === 'CAD' && to === 'USD') { code = 'FXUSDCAD'; invert = true }
    else if (to === 'CAD') {
      const map: Record<string, string> = {
        USD: 'FXUSDCAD', EUR: 'FXEURCAD', GBP: 'FXGBPCAD', JPY: 'FXJPYCAD',
        AUD: 'FXAUDCAD', CHF: 'FXCHFCAD', CNY: 'FXCNYCAD', HKD: 'FXHKDCAD',
        SGD: 'FXSGDCAD', MXN: 'FXMXNCAD', BRL: 'FXBRLCAD', ZAR: 'FXZARCAD',
        INR: 'FXINRCAD', PHP: 'FXPHPCAD', KRW: 'FXKRWCAD',
      }
      code = map[from] || null
    }
    if (!code) { setLiveRate(null); return }
    const url = `https://www.bankofcanada.ca/valet/observations/${code}/json?recent=1`
    const controller = new AbortController()
    ;(async () => {
      try {
        const res = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json' } })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        const obs = Array.isArray(data?.observations) && data.observations[0]
        const raw = obs?.[code]?.v
        const v = Number(raw)
        if (Number.isFinite(v) && v > 0) {
          const rate = invert ? (1 / v) : v
          const asOf = String(obs?.d || '')
          setLiveRate({ pair: `1 ${from} → ${to}`, rate, asOf, url })
        } else {
          setLiveRate(null)
        }
      } catch {
        setLiveRate(null)
      }
    })()
    return () => controller.abort()
  }, [displayCurrency])

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
        const amt = Math.abs(amtRaw)
        withdrawals += amt
      }
    }
    const net = deposits - withdrawals
    return net > 0 ? net : 0
  }

  const pickCostBasis = (d: any, p: any): number | undefined => {
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
    if (!uClientId) {
      // No client yet — seed demo so graphs render
      seedDemoData()
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    const base = process.env.NEXT_PUBLIC_BFF_URL || "http://localhost:8000"
    Promise.all([
      fetch(`${base}/investease/clients/${uClientId}`).then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        return r.json()
      }),
      fetch(`${base}/investease/clients/${uClientId}/portfolios`).then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        const json = await r.json()
        console.log('Portfolio response:', json) // Debug log
        const portfolios = extractPortfolios(json)
        console.log('Extracted portfolios:', portfolios) // Debug log
        return portfolios
      }),
    ])
      .then(([c, ps]) => {
        if (cancelled) return
        setClient(c)
        const list = extractPortfolios(ps)
        if (list.length) {
          setPortfolios((prev) => {
            const demo = prev.find((p: any) => p && (p as any).__demo)
            if (demo && !list.some((p: any) => p?.id === demo.id)) {
              return [demo as any].concat(list as any)
            }
            return list
          })
          const ids = list.map((p: any) => p.id).filter(Boolean)
          loadPortfolioDetails(ids)
          loadPortfolioAnalysis(ids)
        } else {
          // No portfolios returned — seed demo data but keep real client
          seedDemoData({ keepClient: true })
        }
      })
      .catch((e) => {
        if (!cancelled) {
          // On error, seed demo data so the UI still shows charts (suppress error noise)
          seedDemoData({ keepClient: true })
          setError(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [uClientId])

  if (!user) return null

  return (
    <div className="rbc-theme">
      <div className="rbc-hero">
        <div className="rbc-hero-inner">
          <Image src="/rbc-shield.svg" alt="RBC" width={64} height={64} className="rbc-logo" />
          <div className="rbc-hero-text">
            <div className="rbc-product">InvestEase</div>
            <h1 className="rbc-title">Portfolio Management</h1>
          </div>
        </div>
        <div className="rbc-hero-accent" />
      </div>

      <div className="rbc-content max-w-5xl mx-auto p-4 space-y-6">
        <Card className="rbc-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Image src="/RBCGoose.png" alt="RBC" width={48} height={48} className="rbc-logo" />
                <div>
                  <h3 className="rbc-heading-sm">Need help understanding your portfolio?</h3>
                  <p className="rbc-muted">We can summarize your asset mix, risk level and opportunities.</p>
                </div>
              </div>
              <button
                className="rbc-btn"
                onClick={() => setExplainOpen((v) => !v)}
                aria-expanded={explainOpen}
                aria-controls="rbc-explain-card"
                title="Explain my portfolio"
              >
                Explain My Portfolio
              </button>
            </div>
          </CardContent>
        </Card>

        {explainOpen && (
          <Card id="rbc-explain-card" className="rbc-card rbc-explain-card">
            <CardContent className="p-4 relative">
              <div className="rbc-explain-grid">
                <div className="rbc-explain-left">
                  <Image src="/goose_glasses.png" alt="Professor Goose" width={180} height={180} className="rbc-explain-img" />
                </div>
                <div className="rbc-explain-right">
                  {!explainChoice ? (
                    <>
                      <div className="rbc-heading-sm mb-3">Choose a strategy to focus the explanation</div>
                      <div className="rbc-choices">
                        {STRATEGIES.map((s) => (
                          <button
                            key={s.value}
                            className="rbc-choice"
                            onClick={async () => {
                              setExplainChoice(s.value)
                              setExplainBusy(true)
                              setExplainMsg("")
                              try {
                                const out = await requestExplainLLM(s.value)
                                setExplainMsg(out)
                              } catch (e: any) {
                                setExplainMsg(typeof e?.message === 'string' ? e.message : 'Failed to request explanation')
                              } finally {
                                setExplainBusy(false)
                              }
                            }}
                          >
                            <div className="rbc-choice-title">{s.label}</div>
                            <div className="rbc-choice-desc">{s.description} — target {s.target}</div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="rbc-heading-sm">Selected: {strategyValueToLabel(explainChoice) || explainChoice}</div>
                      <div className="text-sm rbc-muted">{explainBusy ? 'Requesting analysis…' : (explainMsg || 'Your choice has been saved.')} </div>
                      <button className="rbc-btn rbc-btn--secondary" onClick={() => { setExplainChoice(null); setExplainMsg("") }}>
                        Change selection
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="rbc-explain-powered">powered by OPENAI</div>
            </CardContent>
          </Card>
        )}

        <Card className="rbc-card">
          <CardHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="rbc-heading">Client Overview</CardTitle>
                <CardDescription className="rbc-muted">Your current outlook on InvestEase</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs rbc-muted">Currency</div>
                <select
                  value={displayCurrency}
                  onChange={(e) => setDisplayCurrency(e.target.value as any)}
                  className="rbc-input w-32 sm:w-40"
                  aria-label="Display currency"
                >
                  <option value="CAD">CAD — Canadian $</option>
                  <option value="USD">USD — US $</option>
                  <option value="EUR">EUR — Euro €</option>
                  <option value="GBP">GBP — Pound £</option>
                  <option value="JPY">JPY — Yen ¥</option>
                  <option value="INR">INR — Rupee ₹</option>
                  <option value="AUD">AUD — Australian $</option>
                  <option value="CHF">CHF — Swiss Franc</option>
                  <option value="CNY">CNY — Chinese Yuan ¥</option>
                  <option value="HKD">HKD — Hong Kong $</option>
                  <option value="SGD">SGD — Singapore $</option>
                  <option value="MXN">MXN — Mexican Peso</option>
                  <option value="BRL">BRL — Brazilian Real</option>
                  <option value="ZAR">ZAR — South African Rand</option>
                  <option value="PHP">PHP — Philippine Peso</option>
                  <option value="KRW">KRW — South Korean Won ₩</option>
                  <option value="BBD">BBD — Barbadian $</option>
                  <option value="JMD">JMD — Jamaican $</option>
                  <option value="TTD">TTD — Trinidad & Tobago $</option>
                  <option value="BSD">BSD — Bahamian $</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            {!uClientId && (
              <div className="text-sm text-muted-foreground">No client ID yet. Try logging out and back in to initialize.</div>
            )}
            {uClientId && (
              <div className="space-y-2">
                {loading && <div className="text-sm">Loading client…</div>}
                {error && <div className="text-sm text-red-600">{error}</div>}
                {!loading && !error && client && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rbc-kpi">
                      <div className="rbc-kpi-label">Cash</div>
                      <div className="rbc-kpi-value">{formatMoney(typeof client.cash === 'number' ? client.cash : 0)}</div>
                    </div>
                    <div className="rbc-kpi">
                      <div className="rbc-kpi-label">Total Portfolio Value</div>
                      <div className="rbc-kpi-value">{formatMoney(totalPortfolioValue)}</div>
                    </div>
                    <div className="rbc-kpi">
                      <div className="rbc-kpi-label">Portfolios Open</div>
                      <div className="rbc-kpi-value">{portfolios.length}</div>
                    </div>
                  </div>
                )}
                {!loading && !error && uClientId && (
                  <div className="mt-4 border-t pt-4">
                    <div className="rbc-heading-sm mb-2">Add Cash</div>
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <input
                        type="number"
                        min={1}
                        max={1000000}
                        step="1"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="rbc-input w-full sm:w-48"
                      />
                      <button
                        disabled={depositBusy}
                        onClick={async () => {
                          const displayAmt = Number(depositAmount)
                          if (!Number.isFinite(displayAmt) || displayAmt <= 0) {
                            setError(`Enter a valid amount greater than 0 in ${displayCurrency}`)
                            return
                          }
                          const cadAmt = toCAD(displayAmt)
                          if (cadAmt > 1_000_000) {
                            const maxInDisplay = FX[displayCurrency] * 1_000_000
                            setError(`Deposit exceeds CAD max. Max is ${formatMoney(1_000_000)} (~${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(maxInDisplay)} ${displayCurrency}).`)
                            return
                          }
                          if (!uClientId) return
                          setError(null)
                          setDepositBusy(true)
                          try {
                            const base = process.env.NEXT_PUBLIC_BFF_URL || "http://localhost:8000"
                            const res = await fetch(`${base}/investease/clients/${uClientId}/deposit`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              // Convert from selected currency to CAD for the API
                              body: JSON.stringify({ amount: cadAmt }),
                            })
                            if (!res.ok) {
                              throw new Error(await res.text())
                            }
                            setDepositAmount("")
                            // Refetch client and portfolios to reflect new cash
                            setLoading(true)
                            const [c, ps] = await Promise.all([
                              fetch(`${base}/investease/clients/${uClientId}`).then(async (r) => {
                                if (!r.ok) throw new Error(await r.text())
                                return r.json()
                              }),
                              fetch(`${base}/investease/clients/${uClientId}/portfolios`).then(async (r) => {
                                if (!r.ok) throw new Error(await r.text())
                                return r.json()
                              }),
                            ])
                            setClient(c)
                            const nextList = extractPortfolios(ps)
                            if (nextList.length > 0) {
                              setPortfolios((prev) => {
                                const demo = prev.find((p: any) => p && (p as any).__demo)
                                if (demo && !nextList.some((p: any) => p?.id === (demo as any).id)) {
                                  return [demo as any].concat(nextList as any)
                                }
                                return nextList
                              })
                              loadPortfolioDetails(nextList.map((p: any) => p.id).filter(Boolean))
                            } else {
                              // Preserve any existing demo data and details; if empty, seed demo
                              if (portfolios.length === 0) {
                                seedDemoData({ keepClient: true })
                              } // else keep previous portfolios
                            }
                          } catch (e: any) {
                            setError(typeof e?.message === "string" ? e.message : "Deposit failed")
                          } finally {
                            setDepositBusy(false)
                            setLoading(false)
                          }
                        }}
                        className="rbc-btn"
                      >
                        {depositBusy ? "Depositing…" : "Deposit"}
                      </button>
                    </div>
                    <div className="rbc-muted text-xs mt-1">Min deposit: {formatMoney(1)}. Entered in selected currency; converted to CAD at fixed rate.</div>
                  </div>
                )}
              </div>
            )}
            {/* Live FX pill (bottom-right, non-intrusive) */}
            {liveRate && (
              <div
                className="rbc-rate-pill"
                title={`Bank of Canada Valet • ${liveRate.asOf}`}
                role="note"
                aria-label={`Live FX ${liveRate.pair} as of ${liveRate.asOf}`}
              >
                <span className="rbc-dot" />
                <span className="rbc-rate-text">
                  {liveRate.pair}
                  <strong className="rbc-rate-val"> {liveRate.rate.toFixed(4)}</strong>
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rbc-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="rbc-heading">
                My{" "}
                <button
                  onClick={() => setShowSimulate(!showSimulate)}
                  className="inline-block hover:text-blue-600 transition-colors"
                  title={showSimulate ? "Hide simulation" : "Show simulation"}
                >
                  Portfolios
                </button>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {!uClientId && (
              <div className="text-sm text-muted-foreground">No client ID yet. Try logging out and back in to initialize.</div>
            )}
            {uClientId && (
              <>
                <div className="space-y-3">
                  {/* Simulate your future */}
                  {!loading && !error && showSimulate && (
                    <div className="mb-4 rbc-subcard">
                      <div className="rbc-heading-sm mb-2">Simulate your future</div>
                      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                        <input
                          type="number"
                          min={1}
                          max={12}
                          step="1"
                          placeholder="Months (1-12)"
                          value={simulateMonths}
                          onChange={(e) => setSimulateMonths(e.target.value)}
                          className="rbc-input w-full sm:w-48"
                        />
                        <button
                          disabled={simulateBusy}
                          onClick={async () => {
                            const m = Number(simulateMonths)
                            if (!Number.isInteger(m) || m < 1 || m > 12) {
                              setError('Enter months between 1 and 12')
                              return
                            }
                            if (!uClientId) return
                            setError(null)
                            setSimulateBusy(true)
                            try {
                              const base = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:8000'
                              const res = await fetch(`${base}/investease/client/${uClientId}/simulate`, {
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
                                fetch(`${base}/investease/clients/${uClientId}`).then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() }),
                                fetch(`${base}/investease/clients/${uClientId}/portfolios`).then(async (r) => { if (!r.ok) throw new Error(await r.text()); const j = await r.json(); return extractPortfolios(j) }),
                              ])
                              setClient(c)
                              const nextList = extractPortfolios(ps)
                              if (nextList.length > 0) {
                                setPortfolios((prev) => {
                                  const demo = prev.find((p: any) => p && (p as any).__demo)
                                  if (demo && !nextList.some((p: any) => p?.id === (demo as any).id)) {
                                    return [demo as any].concat(nextList as any)
                                  }
                                  return nextList
                                })
                              } else {
                                // Keep any existing demo data
                                if (portfolios.length === 0) seedDemoData({ keepClient: true })
                              }
                            } catch (e: any) {
                              setError(typeof e?.message === 'string' ? e.message : 'Simulation failed')
                            } finally {
                              setSimulateBusy(false)
                            }
                          }}
                          className="rbc-btn"
                        >
                          {simulateBusy ? 'Simulating…' : 'Simulate'}
                        </button>
                      </div>
                      <div className="rbc-muted text-xs mt-1">Choose 1–12 months. This runs a sandbox simulation and updates analyses below.</div>
                    </div>
                  )}
                  {loading && <div className="text-sm">Loading portfolios…</div>}
                  {error && <div className="text-sm text-red-600">{error}</div>}
                  {!loading && !error && (
                    <div className="space-y-3">
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
                            const isDemo = (p as any).__demo === true
                            return (
                              <div key={p.id} className="p-4 border rounded-lg rbc-card rbc-portfolio-card">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="space-y-1">
                                    <div className="text-2xl md:text-3xl font-bold">{formatMoney(value)}</div>
                                    <div className={`text-sm md:text-lg ${pctColor}`}>{pct == null ? '—' : `${pct.toFixed(2)}%`}</div>
                                    <div className="text-xs text-muted-foreground">Total value and % change</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium flex items-center justify-end gap-2">
                                      {strategyValueToLabel(p.type) || p.name || 'Portfolio'}
                                      <div className="group relative inline-block">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="cursor-help opacity-70 hover:opacity-100"
                                        >
                                          <circle cx="12" cy="12" r="10" />
                                          <path d="M12 16v-4" />
                                          <path d="M12 8h.01" />
                                        </svg>
                                        <div className="pointer-events-none absolute right-0 bottom-full -translate-y-2 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                                          <div className="rounded bg-black/80 px-3 py-2 text-xs text-white min-w-[200px] max-w-[300px]">
                                            {STRATEGIES.find(s => s.value === p.type)?.description}
                                            <div className="mt-1 font-medium">Target: {STRATEGIES.find(s => s.value === p.type)?.target}</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-2 flex flex-col items-end gap-2">
                                      {!isDemo && !transferOpen[wid] && !withdrawOpen[wid] && (
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => {
                                              setTransferOpen((prev) => ({ ...prev, [wid]: true }))
                                              setWithdrawOpen((prev) => ({ ...prev, [wid]: false }))
                                            }}
                                            className="rbc-btn rbc-btn--secondary"
                                          >
                                            Add
                                          </button>
                                          <button
                                            onClick={() => {
                                              setWithdrawOpen((prev) => ({ ...prev, [wid]: true }))
                                              setTransferOpen((prev) => ({ ...prev, [wid]: false }))
                                            }}
                                            className="rbc-btn rbc-btn--secondary"
                                          >
                                            Withdraw
                                          </button>
                                        </div>
                                      )}
                                      {!isDemo && transferOpen[wid] && (
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="number"
                                            min={1}
                                            step="1"
                                            placeholder="Amount"
                                            value={transferAmounts[wid] ?? ''}
                                            onChange={(e) => setTransferAmounts((prev) => ({ ...prev, [wid]: e.target.value }))}
                                            className="rbc-input w-36 text-right"
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
                                                setError(`Add must be ≤ available cash (${formatMoney(cash)})`)
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
                                                fetch(`${base}/investease/clients/${uClientId}`).then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() }),
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
                                            className="rbc-btn"
                                          >
                                            {transferBusy[wid] ? 'Adding…' : 'Confirm'}
                                          </button>
                                          <button
                                            onClick={() => setTransferOpen((prev) => ({ ...prev, [wid]: false }))}
                                            className="rbc-btn rbc-btn--ghost"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      )}
                                      {!isDemo && withdrawOpen[wid] && (
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="number"
                                            min={1}
                                            step="1"
                                            placeholder="Amount"
                                            value={withdrawAmounts[wid] ?? ''}
                                            onChange={(e) => setWithdrawAmounts((prev) => ({ ...prev, [wid]: e.target.value }))}
                                            className="rbc-input w-36 text-right"
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
                                                setError(`Withdraw must be ≤ current value (${formatMoney(max)})`)
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
                                                fetch(`${base}/investease/clients/${uClientId}`).then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() }),
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
                                            className="rbc-btn"
                                          >
                                            {withdrawBusy[wid] ? 'Withdrawing…' : 'Confirm'}
                                          </button>
                                          <button
                                            onClick={() => setWithdrawOpen((prev) => ({ ...prev, [wid]: false }))}
                                            className="rbc-btn rbc-btn--ghost"
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
                                  <div className="text-sm font-semibold">{formatMoney((typeof d.invested_amount === 'number' ? d.invested_amount : (typeof p.invested_amount === 'number' ? p.invested_amount : 0)))}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/60">
                                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">P/L</div>
                                  <div className={`text-sm font-semibold ${pct == null ? '' : pct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{pct == null ? '—' : formatMoney(value - (typeof d.invested_amount === 'number' ? d.invested_amount : (typeof p.invested_amount === 'number' ? p.invested_amount : 0)))}</div>
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
                                  {/* Month-over-month (from growth_trend) — Line chart with month labels */}
                                <div className="p-3 rounded-lg border rbc-chart">
                                  <div className="text-xs mb-2 font-medium">Monthly change</div>
                                  {(() => {
                                    const series = computeMonthlyReturnsFromTrend(d?.growth_trend)
                                    if (!series.length) return <div className="text-xs text-muted-foreground">Not enough data</div>
                                    const values = series.map((s) => s.pct)
                                    const maxV = Math.max(0, ...values)
                                    const minV = Math.min(0, ...values)
                                    const absMax = Math.max(Math.abs(maxV), Math.abs(minV)) || 1
                                    const baseChartH = 100
                                    const labelArea = 40
                                    const height = baseChartH + labelArea
                                    const padL = 44, padR = 12
                                    const labelSpacing = 56
                                    const width = Math.max(420, padL + padR + labelSpacing * Math.max(0, series.length - 1))
                                    const chartMid = baseChartH / 2 + 4
                                    const x = (i: number) => padL + (series.length === 1 ? 0 : (i * (width - padL - padR) / (series.length - 1)))
                                    const axisMax = 3
                                    const y = (pct: number) => {
                                      const half = baseChartH / 2 - 14
                                      const norm = Math.max(-axisMax, Math.min(axisMax, pct))
                                      return chartMid - (norm / axisMax) * half
                                    }
                                    // y-axis ticks (fixed ±15% with mid ticks)
                                    const ticks = [-axisMax, -axisMax / 2, 0, axisMax / 2, axisMax]
                                    const fmtTick = (t: number) => (Number.isInteger(t) ? `${t}%` : `${t.toFixed(1)}%`)
                                    const points = series.map((s, i) => `${x(i)},${y(s.pct)}`).join(' ')
                                    return (
                                      <svg width={width} height={height} className="overflow-visible">
                                        {/* zero axis */}
                                        <line x1={0} x2={width} y1={chartMid} y2={chartMid} stroke="#d1d5db" strokeDasharray="2,3" />
                                        {/* y-axis + ticks */}
                                        <line x1={padL} x2={padL} y1={chartMid - (baseChartH / 2 - 14)} y2={chartMid + (baseChartH / 2 - 14)} stroke="#CBD5E1" />
                                        {ticks.map((t, i) => (
                                          <g key={i}>
                                            <line x1={padL - 4} x2={padL} y1={y(t)} y2={y(t)} stroke="#94A3B8" />
                                            <text x={padL - 6} y={y(t) + 3} fontSize={10} textAnchor="end" fill="#64748B">{fmtTick(t)}</text>
                                          </g>
                                        ))}
                                        {/* line */}
                                        <polyline points={points} fill="none" stroke="#005DAA" strokeWidth={2} />
                                        {/* points + all labels (rotated) */}
                                        {series.map((s, i) => (
                                          <g key={i}>
                                            <circle cx={x(i)} cy={y(s.pct)} r={3} fill="#fff" stroke="#005DAA" strokeWidth={1.5} />
                                            <text
                                              x={x(i)}
                                              y={height - 6}
                                              fontSize={10}
                                              textAnchor="end"
                                              fill="#6b7280"
                                              transform={`rotate(-35, ${x(i)}, ${height - 6})`}
                                            >
                                              {s.label}
                                            </text>
                                          </g>
                                        ))}
                                      </svg>
                                    )
                                  })()}
                                </div>

                                  {/* Year-over-year (from calendarReturns) — Line chart with year labels */}
                                <div className="p-3 rounded-lg border rbc-chart">
                                  <div className="text-xs mb-2 font-medium">Year over year</div>
                                  {a?.calendarReturns ? (
                                    (() => {
                                      const years = Object.keys(a.calendarReturns).sort((x, y) => Number(x) - Number(y))
                                      if (!years.length) return <div className="text-xs text-muted-foreground">No data</div>
                                      const parsed = years.map((y) => ({ y, pct: parsePercent(a.calendarReturns[y]) ?? 0 }))
                                      const maxV = Math.max(0, ...parsed.map((p) => p.pct))
                                      const minV = Math.min(0, ...parsed.map((p) => p.pct))
                                      const absMax = Math.max(Math.abs(maxV), Math.abs(minV)) || 1
                                      const baseChartH = 100
                                      const labelArea = 28
                                      const height = baseChartH + labelArea
                                      const padL = 44, padR = 16
                                      const labelSpacing = 72
                                      const width = Math.max(380, padL + padR + labelSpacing * Math.max(0, parsed.length - 1))
                                      const mid = baseChartH / 2 + 4
                                      const x = (i: number) => padL + (parsed.length === 1 ? 0 : (i * (width - padL - padR) / (parsed.length - 1)))
                                      const axisMax = 15
                                      const y = (pct: number) => {
                                        const half = baseChartH / 2 - 14
                                        const norm = Math.max(-axisMax, Math.min(axisMax, pct))
                                        return mid - (norm / axisMax) * half
                                      }
                                      // y-axis ticks fixed to ±15% with mid ticks
                                      const ticks = [-axisMax, -axisMax / 2, 0, axisMax / 2, axisMax]
                                      const fmtTick = (t: number) => (Number.isInteger(t) ? `${t}%` : `${t.toFixed(1)}%`)
                                      const points = parsed.map((s, i) => `${x(i)},${y(s.pct)}`).join(' ')
                                      return (
                                        <svg width={width} height={height} className="overflow-visible">
                                          <line x1={0} x2={width} y1={mid} y2={mid} stroke="#d1d5db" strokeDasharray="2,3" />
                                          <line x1={padL} x2={padL} y1={mid - (baseChartH / 2 - 14)} y2={mid + (baseChartH / 2 - 14)} stroke="#CBD5E1" />
                                          {ticks.map((t, i) => (
                                            <g key={i}>
                                              <line x1={padL - 4} x2={padL} y1={y(t)} y2={y(t)} stroke="#94A3B8" />
                                              <text x={padL - 6} y={y(t) + 3} fontSize={10} textAnchor="end" fill="#64748B">{fmtTick(t)}</text>
                                            </g>
                                          ))}
                                          <polyline points={points} fill="none" stroke="#005DAA" strokeWidth={2} />
                                          {parsed.map((s, i) => (
                                            <g key={s.y}>
                                              <circle cx={x(i)} cy={y(s.pct)} r={3} fill="#fff" stroke="#005DAA" strokeWidth={1.5} />
                                              <text x={x(i)} y={height - 6} fontSize={10} textAnchor="end" fill="#6b7280" transform={`rotate(-35, ${x(i)}, ${height - 6})`}>{s.y}</text>
                                            </g>
                                          ))}
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
                    </div>
                  )}
                </div>
                <div>
                  {!loading && !error && (
                    <div className="mt-4 rbc-subcard">
                      <div className="rbc-heading-sm mb-2">Create Portfolio</div>
                      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                        <select
                          value={createStrategy}
                          onChange={(e) => setCreateStrategy(e.target.value)}
                          className="rbc-input w-full sm:w-72"
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
                          max={((client?.cash ?? 0) > 0 ? Math.floor(Number(client?.cash ?? 0)) : undefined)}
                          step="1"
                          placeholder={`${formatMoney(client?.cash ?? 0)}`}
                          value={createAmount}
                          onChange={(e) => setCreateAmount(e.target.value)}
                          className="rbc-input w-full sm:w-48"
                        />
                        <button
                          disabled={createBusy}
                          onClick={async () => {
                          if (!uClientId) return
                            const amt = Number(createAmount)
                            const cash = Number(client?.cash ?? 0)
                            const allowed = STRATEGIES.map((s) => s.value)
                            if (!allowed.includes(createStrategy)) {
                              setError("Please choose a valid strategy.")
                              return
                            }
                            if (!Number.isFinite(amt) || amt <= 0) {
                              setError('Enter an initial amount greater than 0')
                              return
                            }
                            if (amt > cash) {
                              setError(`Insufficient cash. Available: ${formatMoney(cash)}`)
                              return
                            }
                            setError(null)
                            setCreateBusy(true)
                            try {
                              const base = process.env.NEXT_PUBLIC_BFF_URL || "http://localhost:8000"
                            const res = await fetch(`${base}/investease/clients/${uClientId}/portfolios`, {
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
                              fetch(`${base}/investease/clients/${uClientId}`).then(async (r) => {
                                  if (!r.ok) throw new Error(await r.text())
                                  return r.json()
                                }),
                              fetch(`${base}/investease/clients/${uClientId}/portfolios`).then(async (r) => {
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
                          className="rbc-btn"
                        >
                          {createBusy ? "Creating…" : "Create"}
                        </button>
                      </div>
                      <div className="rbc-muted text-xs mt-1">
                        Strategies: Aggressive Growth, Growth, Balanced, Conservative, Very Conservative
                      </div>
                      {(client?.cash ?? 0) <= 0 && (
                        <div className="rbc-muted text-xs mt-1">
                          You have $0 available. Add cash to fund a new portfolio.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .rbc-theme { --rbc-blue: #005DAA; --rbc-blue-dark: #004c8f; --rbc-navy: #003B73; --rbc-gold: #FDB515; }
        .rbc-hero { background: linear-gradient(135deg, var(--rbc-blue), var(--rbc-navy)); color: #fff; padding: 18px 0 28px; }
        .rbc-hero-inner { max-width: 64rem; margin: 0 auto; display: flex; align-items: center; gap: 0; padding: 0; }
        .rbc-hero-text .rbc-product { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; opacity: .9; }
        .rbc-hero-text .rbc-title { font-size: 24px; font-weight: 700; margin-top: 2px; }
        .rbc-hero-accent { height: 4px; background: var(--rbc-gold); opacity: .95; margin-top: 14px; }
        .rbc-logo { border-radius: 6px; display:block; margin-left:0; margin-right:0; }
        .rbc-content { margin-top: 12px; padding-top: 4px; }

        .rbc-card { background: #fff; border: 1px solid #E5EAF0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
        .rbc-subcard { background: #fff; border: 1px solid #E5EAF0; border-radius: 10px; padding: 16px; }
        .rbc-heading { font-weight: 700; color: #102A43; }
        .rbc-heading-sm { font-weight: 600; color: #102A43; font-size: 0.95rem; }
        .rbc-muted { color: #5B7083; }

        .rbc-kpi { background: #F7FAFC; border: 1px solid #E5EAF0; border-radius: 10px; padding: 12px; }
        .rbc-kpi-label { font-size: 12px; color: #5B7083; text-transform: uppercase; letter-spacing: .04em; }
        .rbc-kpi-value { font-size: 22px; font-weight: 700; color: var(--rbc-blue); }

        .rbc-portfolio-card { transition: box-shadow .2s ease, transform .05s ease; }
        .rbc-portfolio-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.06); transform: translateY(-1px); }

        .rbc-input { border: 1px solid #DDE3EA; background: #fff; border-radius: 8px; padding: 8px 12px; font-size: 14px; outline: none; }
        .rbc-input:focus { border-color: var(--rbc-blue); box-shadow: 0 0 0 3px rgba(0,93,170,.15); }

        .rbc-btn { background: var(--rbc-blue); color: #fff; border: 1px solid var(--rbc-blue-dark); border-radius: 8px; padding: 8px 14px; font-weight: 600; font-size: 14px; transition: background .15s ease, box-shadow .15s ease; }
        .rbc-btn:hover { background: var(--rbc-blue-dark); box-shadow: 0 2px 8px rgba(0,93,170,.25); }
        .rbc-btn:disabled { opacity: .65; cursor: not-allowed; }
        .rbc-btn--secondary { background: #fff; color: var(--rbc-blue); border: 1px solid var(--rbc-blue); }
        .rbc-btn--secondary:hover { background: #f2f7fb; }
        .rbc-btn--ghost { background: #F1F5F9; color: #334155; border: 1px solid #E5EAF0; }
        .rbc-btn--ghost:hover { background: #E9EEF5; }

        .rbc-chart { overflow-x: auto; overflow-y: visible; }
        .rbc-chart svg { display: block; }

        /* Info tooltip */
        .rbc-info { display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; margin-left:6px; border-radius:50%; border:1px solid var(--rbc-blue); color: var(--rbc-blue); cursor:default; position:relative; user-select:none; background:#fff; }
        .rbc-info-icon { color: var(--rbc-blue); }
        .rbc-info .rbc-tip { position:absolute; left:0; top:100%; margin-top:6px; background:#0f172a; color:#fff; font-size:12px; line-height:1.2; padding:8px 10px; border-radius:6px; white-space:nowrap; box-shadow: 0 6px 20px rgba(0,0,0,.18); opacity:0; transform: translateY(-4px); transition: opacity .15s ease, transform .15s ease; z-index:30; pointer-events:none; }
        .rbc-info:hover .rbc-tip { opacity:1; transform: translateY(0); pointer-events:auto; }
        .rbc-info .rbc-tip::before { content:""; position:absolute; left:8px; top:-6px; width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-bottom:6px solid #0f172a; }

        /* FX rate pill */
        .rbc-rate-pill { position:absolute; right:12px; bottom:10px; display:inline-flex; align-items:center; gap:8px; background: linear-gradient(135deg, #ffffff 0%, #f6f9fc 100%); color:#0f172a; border:1px solid #E5EAF0; border-radius:999px; padding:6px 10px; box-shadow: 0 4px 12px rgba(0,0,0,.08); text-decoration:none; }
        .rbc-rate-text { font-size:12px; opacity:.9; }
        .rbc-rate-val { color: var(--rbc-blue); margin-left:4px; }
        .rbc-dot { width:8px; height:8px; border-radius:50%; background:#10b981; box-shadow:0 0 0 2px #ecfdf5 inset; }
        .rbc-explain-card { overflow: hidden; }
        .rbc-explain-grid { display: grid; grid-template-columns: 200px 1fr; gap: 16px; align-items: start; }
        @media (max-width: 640px) { .rbc-explain-grid { grid-template-columns: 1fr; } }
        .rbc-explain-left { display:flex; align-items:center; justify-content:center; padding: 8px; }
        .rbc-explain-img { border-radius: 12px; }
        .rbc-explain-right { padding: 4px; }
        .rbc-choices { display:flex; flex-direction:column; gap:10px; }
        .rbc-choice { text-align:left; background:#fff; border:1px solid #E5EAF0; border-radius:10px; padding:10px 12px; box-shadow:0 1px 2px rgba(0,0,0,.03); cursor:pointer; transition: box-shadow .15s ease, transform .05s ease, border-color .15s ease; }
        .rbc-choice:hover { box-shadow:0 4px 12px rgba(0,0,0,.08); transform: translateY(-1px); border-color: var(--rbc-blue); }
        .rbc-choice-title { font-weight: 700; color:#102A43; }
        .rbc-choice-desc { font-size: 12px; color:#5B7083; margin-top:2px; }
        .rbc-explain-powered { position:absolute; right:12px; bottom:1px; font-size: 11px; color:#94A3B8; letter-spacing:.02em; }
        .rbc-linklike { color: var(--rbc-blue); border: 0; background: transparent; cursor: pointer; padding: 0; font: inherit; }
        .rbc-linklike:hover { text-decoration: underline; }
      `}</style>
    </div>
  )
}
