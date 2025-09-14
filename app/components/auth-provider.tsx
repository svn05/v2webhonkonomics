"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
  // InvestEase client id for RBC sandbox
  investEaseClientId?: string
  honkPoints: number
  goldenEggs: number
  streak: number
  level: number
  gooseAccessories: string[]
  gooseTuning?: {
    gooseY: number
    gooseScale: number
    hatY: number
    hatDeg: number
  }
  equippedHat?: string
  equippedAccessory?: string
  equippedBackground?: string
  portfolioType: string
  riskTolerance: "conservative" | "moderate" | "aggressive"
  investmentGoals: string[]
  experienceLevel: "beginner" | "intermediate" | "advanced"
  hasCompletedOnboarding: boolean
  country?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const computeLevel = (points: number | undefined): number => {
    const p = Math.max(0, points ?? 0)
    // Simple mapping: every 200 points → +1 level. 0–199 => 1, 200–399 => 2, etc.
    return Math.floor(p / 200) + 1
  }

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("honkonomics_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  // If a saved user exists but has no InvestEase client, initialize one in the background
  useEffect(() => {
    const run = async () => {
      if (!user || user.investEaseClientId) return
      const clientId = await ensureInvestEaseClient(user.name, user.email)
      if (clientId) {
        const updated = { ...user, investEaseClientId: clientId }
        setUser(updated)
        localStorage.setItem("honkonomics_user", JSON.stringify(updated))
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email])

  const ensureInvestEaseClient = async (name: string, email: string): Promise<string | undefined> => {
    const base = "https://htn2025-508985230aed.herokuapp.com/"
    try {
      // 1) Try to find an existing client by email
      const listRes = await fetch(`${base}/investease/clients`)
      if (!listRes.ok) {
        console.error("List clients failed", await listRes.text())
      } else {
        const clients = await listRes.json()
        if (Array.isArray(clients)) {
          const match = clients.find((c: any) => typeof c?.email === "string" && c.email.toLowerCase() === email.toLowerCase())
          if (match?.id) return match.id as string
        }
      }

      // 2) Create a new client with cash=0
      const createRes = await fetch(`${base}/investease/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, cash: 0 }),
      })
      if (!createRes.ok) {
        console.error("Create client failed", await createRes.text())
        return undefined
      }
      const created = await createRes.json()
      return created?.id as string
    } catch (e) {
      console.error("ensureInvestEaseClient error", e)
      return undefined
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app would call API
    if (email && password) {
      const name = email.split("@")[0]
      const investEaseClientId = await ensureInvestEaseClient(name, email)
      const mockUser: User = {
        id: "1",
        email,
        name,
        investEaseClientId,
        honkPoints: 100,
        goldenEggs: 5,
        streak: 1,
        level: computeLevel(100),
        gooseAccessories: ["basic", "rbchat"],
        gooseTuning: { gooseY: 16, gooseScale: 1.0, hatY: 24, hatDeg: 0 },
        equippedHat: "rbchat",
        equippedAccessory: "none",
        equippedBackground: "default",
        portfolioType: "",
        riskTolerance: "moderate",
        investmentGoals: [],
        experienceLevel: "beginner",
        hasCompletedOnboarding: false,
      }
      setUser(mockUser)
      localStorage.setItem("honkonomics_user", JSON.stringify(mockUser))
      return true
    }
    return false
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    // Mock registration - in real app would call API
    if (email && password && name) {
      const investEaseClientId = await ensureInvestEaseClient(name, email)
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        investEaseClientId,
        honkPoints: 50,
        goldenEggs: 2,
        streak: 0,
        level: computeLevel(50),
        gooseAccessories: ["basic", "rbchat"],
        gooseTuning: { gooseY: 16, gooseScale: 1.0, hatY: 24, hatDeg: 0 },
        equippedHat: "rbchat",
        equippedAccessory: "none",
        equippedBackground: "default",
        portfolioType: "",
        riskTolerance: "moderate",
        investmentGoals: [],
        experienceLevel: "beginner",
        hasCompletedOnboarding: false,
      }
      setUser(newUser)
      localStorage.setItem("honkonomics_user", JSON.stringify(newUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("honkonomics_user")
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const merged = { ...user, ...updates }
      // Auto-compute level from honkPoints
      merged.level = computeLevel(merged.honkPoints)
      const updatedUser = merged
      if (updates.portfolioType) {
        updatedUser.hasCompletedOnboarding = true
      }
      setUser(updatedUser)
      localStorage.setItem("honkonomics_user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
