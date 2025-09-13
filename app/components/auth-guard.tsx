"use client"

import type React from "react"

import { useAuth } from "./auth-provider"
import { LoginForm } from "./login-form"
import { OnboardingQuiz } from "./onboarding-quiz"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-6xl mb-4">🪿</div>
          <p className="text-muted-foreground">Loading Honkonomics...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  if (!user.hasCompletedOnboarding) {
    return <OnboardingQuiz />
  }

  return <>{children}</>
}
