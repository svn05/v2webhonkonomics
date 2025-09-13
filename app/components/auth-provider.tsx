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

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app would call API
    if (email && password) {
      const mockUser: User = {
        id: "1",
        email,
        name: email.split("@")[0],
        honkPoints: 100,
        goldenEggs: 5,
        streak: 1,
        level: 1,
        gooseAccessories: ["basic"],
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
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        honkPoints: 50,
        goldenEggs: 2,
        streak: 0,
        level: 1,
        gooseAccessories: ["basic"],
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
