"use client"

import { useState } from "react"
import Image from "next/image"
import { useAuth } from "./auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { LearningHub } from "./learning-hub"
import { GooseCustomization } from "./goose-customization"
import { Achievements } from "./achievements"
import { PortfolioManagement } from "./portfolio-management"
import { DailyChallenges } from "./daily-challenges"
import { Leaderboards } from "./leaderboards"
import { LearningPath } from "./learning-path"
import { Profile } from "./profile"

export function Dashboard() {
  const [currentView, setCurrentView] = useState<
    "dashboard" | "learning" | "challenges" | "goose" | "achievements" | "portfolio" | "leaderboards" | "profile"
  >("dashboard")
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
        return null
    }
  }

  const getPortfolioDescription = (type: string) => {
    switch (type) {
      case "conservative":
        return "Conservative Nest Egg - Focus on bonds and stable investments"
      case "balanced":
        return "Balanced Flock - Mix of stocks and bonds for steady growth"
      case "growth":
        return "Growth Gosling - High-growth stocks and ETFs"
      case "dividend":
        return "Dividend Dynasty - Focus on dividend-paying stocks"
      default:
        return "Custom portfolio based on your preferences"
    }
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "learning":
        return <LearningHub />
      case "goose":
        return <GooseCustomization />
      case "achievements":
        return <Achievements />
      case "portfolio":
        return <PortfolioManagement />
      case "challenges":
        return <DailyChallenges />
      case "leaderboards":
        return <Leaderboards />
      case "profile":
        return <Profile />
      default:
        return renderDashboard()
    }
  }

  const renderDashboard = () => (
    <main className="relative min-h-screen">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/mainbackground.png"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto p-4 space-y-6">
        {/* Welcome Section */}
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <Image src="/goose_waving.png" alt="Welcome Goose" width={120} height={120} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h2>
          <p className="text-muted-foreground">Ready to learn some investing?</p>
          <div className="mt-4">
            <Badge variant="secondary" className="text-sm">
              {user.experienceLevel} • {user.riskTolerance} risk
              {getCountryLabel(user.country) && ` • ${getCountryLabel(user.country)}`}
            </Badge>
          </div>
        </div>

        {/* Learning Path */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Your Learning Journey</h2>
          <LearningPath onStartLesson={() => setCurrentView("learning")} />
        </div>

        {/* Primary Action Cards - Portfolio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-card/90 backdrop-blur-sm" onClick={() => setCurrentView("learning")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">📚 Learning Hub</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Explore all lessons</p>
              <Button variant="outline" className="w-full bg-transparent">View All Modules</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-card/90 backdrop-blur-sm" onClick={() => setCurrentView("portfolio")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Portfolio
                <Image src="/rbc.png" alt="RBC" width={60} height={30} className="ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Manage your investments</p>
              <Button variant="outline" className="w-full bg-transparent">
                View Portfolio
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Your Investment Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">{getPortfolioDescription(user.portfolioType)}</h3>
                <div className="flex flex-wrap gap-2">
                  {user.investmentGoals.map((goal) => (
                    <Badge key={goal} variant="outline">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Section */}
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Your Learning Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Investment Basics</span>
                  <span>25%</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Canadian Tax Accounts</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>ETF Essentials</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-card/90 backdrop-blur-sm" onClick={() => setCurrentView("challenges")}> 
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🎯 Daily Challenge</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Test your knowledge</p>
              <Button variant="outline" className="w-full bg-transparent">Take Challenge</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-card/90 backdrop-blur-sm" onClick={() => setCurrentView("goose")}> 
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🪿 Customize Goose</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Personalize your companion</p>
              <Button variant="outline" className="w-full bg-transparent">
                Customize
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow bg-card/90 backdrop-blur-sm"
            onClick={() => setCurrentView("achievements")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🏆 Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Track your progress</p>
              <Button variant="outline" className="w-full bg-transparent">
                View All
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow bg-card/90 backdrop-blur-sm"
            onClick={() => setCurrentView("leaderboards")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">👥 Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">See how you rank</p>
              <Button variant="outline" className="w-full bg-transparent">View Rankings</Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="py-6 space-y-2">
          <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <Image src="/techrbc.png" alt="Tech@RBC" width={80} height={30} className="opacity-70 hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Made with 💙 in Waterloo, Ontario, Canada 🇨🇦 at Hack The North 2025
          </div>
        </footer>
      </div>
    </main>
  )

  if (currentView !== "dashboard") {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="relative z-10 bg-card/95 backdrop-blur-sm border-b border-border py-2 px-4">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto md:h-12 gap-2 md:gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <Button variant="ghost" onClick={() => setCurrentView("dashboard")} className="text-sm md:text-base p-1.5">
                ← Back
              </Button>
              <Image src="/honkonomics_logo.svg" alt="Honkonomics" width={100} height={100} className="md:w-[120px] md:h-[120px]" />
              <Button 
                variant="ghost" 
                onClick={() => setCurrentView("profile")} 
                className="md:hidden p-1"
              >
                <Image src="/goose_pfp.png" alt="Profile" width={36} height={36} className="rounded-full" />
              </Button>
            </div>
            {/* Stats Bar */}
            <div className="flex items-center gap-3 md:gap-6 flex-wrap justify-center">
              <div className="flex items-center gap-1 md:gap-2">
                <Image src="/honk_point.png" alt="Honk Points" width={20} height={20} className="md:w-[24px] md:h-[24px]" />
                <span className="font-semibold text-sm md:text-base">{user.honkPoints}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Image src="/golden_egg.png" alt="Golden Eggs" width={20} height={20} className="md:w-[24px] md:h-[24px]" />
                <span className="font-semibold text-sm md:text-base">{user.goldenEggs}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Image src="/streak.png" alt="Streak" width={20} height={20} className="md:w-[24px] md:h-[24px]" />
                <span className="font-semibold text-sm md:text-base">{user.streak} days</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs md:text-sm text-muted-foreground">Level</span>
                <span className="font-semibold text-sm md:text-base">{user.level}</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setCurrentView("profile")} 
              className="hidden md:block p-1"
            >
              <Image src="/goose_pfp.png" alt="Profile" width={40} height={40} className="rounded-full" />
            </Button>
          </div>
        </header>
        {renderCurrentView()}
        {/* Footer */}
        <footer className="py-6 space-y-2">
          <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <Image src="/techrbc.png" alt="Tech@RBC" width={80} height={30} className="opacity-70 hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Made with 💙 in Waterloo, Ontario, Canada 🇨🇦 at Hack The North 2025
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/mainbackground.png"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background/95" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-card/95 backdrop-blur-sm border-b border-border py-2 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto md:h-12 gap-2 md:gap-4">
          {/* Logo */}
          <div className="md:h-full md:py-1">
            <Image src="/honkonomics_logo.svg" alt="Honkonomics" width={120} height={120} className="md:w-auto md:h-full" />
          </div>
          
          {/* Stats Bar */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-1.5">
              <Image src="/honk_point.png" alt="Honk Points" width={20} height={20} />
              <span className="font-semibold text-sm">{user.honkPoints}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Image src="/golden_egg.png" alt="Golden Eggs" width={20} height={20} />
              <span className="font-semibold text-sm">{user.goldenEggs}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Image src="/streak.png" alt="Streak" width={20} height={20} />
              <span className="font-semibold text-sm">{user.streak} days</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Level</span>
              <span className="font-bold text-base text-primary">{user.level}</span>
            </div>
          </div>

          <Button 
            variant="ghost" 
            onClick={() => setCurrentView("profile")} 
            size="sm"
            className="p-1"
          >
            <Image src="/goose_pfp.png" alt="Profile" width={40} height={40} className="rounded-full" />
          </Button>
        </div>
      </header>

      {renderDashboard()}
    </div>
  )
}
