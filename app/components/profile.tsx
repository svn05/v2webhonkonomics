"use client"

import Image from "next/image"
import { useAuth } from "./auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Profile() {
  const { user, logout } = useAuth()

  if (!user) return null

  const getCountryLabel = (country?: string) => {
    switch (country) {
      case "canada":
        return "🇨🇦 Canada"
      case "usa":
        return "🇺🇸 United States"
      case "uk":
        return "🇬🇧 United Kingdom"
      case "eu":
        return "🇪🇺 European Union"
      case "other":
        return "🌍 International"
      default:
        return "Not specified"
    }
  }

  const getPortfolioLabel = (type: string) => {
    switch (type) {
      case "conservative":
        return "Conservative Nest Egg"
      case "balanced":
        return "Balanced Flock"
      case "growth":
        return "Growth Gosling"
      case "dividend":
        return "Dividend Dynasty"
      default:
        return type
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Image 
              src="/goose_pfp.png" 
              alt="Profile" 
              width={120} 
              height={120} 
              className="rounded-full border-4 border-primary/20"
            />
            <div className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {user.level}
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-2">
              <Image src="/honk_point.png" alt="Honk Points" width={32} height={32} />
            </div>
            <div className="text-2xl font-bold">{user.honkPoints}</div>
            <div className="text-sm text-muted-foreground">Honk Points</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-2">
              <Image src="/golden_egg.png" alt="Golden Eggs" width={32} height={32} />
            </div>
            <div className="text-2xl font-bold">{user.goldenEggs}</div>
            <div className="text-sm text-muted-foreground">Golden Eggs</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-2">
              <Image src="/streak.png" alt="Streak" width={32} height={32} />
            </div>
            <div className="text-2xl font-bold">{user.streak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-2xl font-bold">{user.level}</div>
            <div className="text-sm text-muted-foreground">Level</div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Experience Level</div>
              <Badge variant="secondary">{user.experienceLevel}</Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Risk Tolerance</div>
              <Badge variant="secondary">{user.riskTolerance}</Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Portfolio Type</div>
              <Badge variant="secondary">{getPortfolioLabel(user.portfolioType)}</Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Location</div>
              <Badge variant="secondary">{getCountryLabel(user.country)}</Badge>
            </div>
          </div>

          {user.investmentGoals.length > 0 && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Investment Goals</div>
              <div className="flex flex-wrap gap-2">
                {user.investmentGoals.map((goal) => (
                  <Badge key={goal} variant="outline">
                    {goal === "retirement" && "🏖️ Retirement"}
                    {goal === "house" && "🏠 Home Purchase"}
                    {goal === "education" && "🎓 Education"}
                    {goal === "wealth" && "💰 Build Wealth"}
                    {goal === "income" && "💵 Passive Income"}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto">
            <div className="text-center min-w-[80px]">
              <div className="text-3xl mb-1">🎯</div>
              <div className="text-xs">First Lesson</div>
            </div>
            <div className="text-center min-w-[80px]">
              <div className="text-3xl mb-1">🔥</div>
              <div className="text-xs">7 Day Streak</div>
            </div>
            <div className="text-center min-w-[80px]">
              <div className="text-3xl mb-1">📚</div>
              <div className="text-xs">Quick Learner</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <span className="mr-2">✏️</span> Edit Profile
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <span className="mr-2">🔔</span> Notification Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <span className="mr-2">🔒</span> Privacy Settings
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={logout}
            >
              <span className="mr-2">🚪</span> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
