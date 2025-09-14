"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
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


  const login = async (email: string, password: string): Promise<boolean> => {
    try {

      const base = process.env.NEXT_PUBLIC_BFF_URL || "https://htn2025-508985230aed.herokuapp.com"
      
      // 1) Try to find an existing client by email
      const listRes = await fetch(`${base}/investease/clients`)
      if (!listRes.ok) {
        console.error("List clients failed", await listRes.text())
      } else {
        const clients = await listRes.json()
        if (Array.isArray(clients)) {
          const match = clients.find((c: any) => typeof c?.email === "string" && c.email.toLowerCase() === email.toLowerCase())
          if (match?.id) {
            const cid = match.id as string
            // Persist to DB profile by email (best-effort)
            try {
              await fetch(`${base}/account/set-investease`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, investEaseClientId: cid }),
              })
            } catch {}
            return true
          }
        }
      }

      // 2) Create a new client with cash=0
      const createRes = await fetch(`${base}/investease/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          name: email.split("@")[0],
          cash: 0 
        }),
      });
      if (!createRes.ok) {
        console.log("Login failed: response not ok");
        return false;
      }

      const created = await createRes.json();
      const cid = created?.id as string;
      if (cid) {
        try {
          await fetch(`${base}/account/set-investease`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, investEaseClientId: cid }),
          });
          
          const userObj: User = {
            id: cid,
            email: email,
            name: email.split("@")[0],
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
          };
          setUser(userObj);
          localStorage.setItem("honkonomics_user", JSON.stringify(userObj));
          console.log("Login successful, user set");
          return true;
        } catch (e) {
          console.error("Failed to set InvestEase client ID:", e);
          return false;
        }
      }
      console.log("Login failed: could not create InvestEase client");
      return false;

    } catch (e) {
      console.error("Login error:", e);
      return false;
    }
  };


  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
    console.log("Register called with", email, name);
    const res = await fetch("http://localhost:8001/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    console.log("Signup response:", data);
    if (!res.ok) return false;
    // Optionally, auto-login after registration
    return await login(email, password);
    } catch (e) {
      console.error("Register error:", e);
      return false;
    }
  };


  const logout = async () => {
    console.log("Logout called");
    try {
      await fetch("http://localhost:8001/signout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: "" }), // If you use access tokens, pass here
      });
      console.log("Signout API call completed");
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUser(null);
    localStorage.removeItem("honkonomics_user");
    console.log("User state cleared and localStorage removed");
  };

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