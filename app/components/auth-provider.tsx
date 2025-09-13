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
    const base = "http://localhost:8000"
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
    try {
      const res = await fetch("http://localhost:8001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) return false
      const data = await res.json()
      if (data && data.user_id && data.email) {
        setUser({
          id: data.user_id,
          email: data.email,
          name: data.email.split("@")[0], // or fetch name from /get-name if needed
          honkPoints: 0,
          goldenEggs: 0,
          streak: 0,
          level: 1,
          gooseAccessories: ["basic"],
          portfolioType: "",
          riskTolerance: "moderate",
          investmentGoals: [],
          experienceLevel: "beginner",
          hasCompletedOnboarding: false,
        })
        localStorage.setItem(
          "honkonomics_user",
          JSON.stringify({
            id: data.user_id,
            email: data.email,
            name: data.email.split("@")[0],
            honkPoints: 0,
            goldenEggs: 0,
            streak: 0,
            level: 1,
            gooseAccessories: ["basic"],
            portfolioType: "",
            riskTolerance: "moderate",
            investmentGoals: [],
            experienceLevel: "beginner",
            hasCompletedOnboarding: false,
          })
        )
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:8001/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })
      if (!res.ok) return false
      // Optionally, auto-login after registration
      return await login(email, password)
    } catch (e) {
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("honkonomics_user")
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
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
