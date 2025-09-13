"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "./auth-provider"

interface LeaderboardUser {
  id: string
  name: string
  honkPoints: number
  goldenEggs: number
  streak: number
  level: number
  rank: number
  weeklyPoints: number
  monthlyPoints: number
  achievements: number
}

// Mock leaderboard data
const mockUsers: LeaderboardUser[] = [
  {
    id: "1",
    name: "InvestorGoose",
    honkPoints: 2450,
    goldenEggs: 18,
    streak: 15,
    level: 8,
    rank: 1,
    weeklyPoints: 340,
    monthlyPoints: 1200,
    achievements: 12,
  },
  {
    id: "2",
    name: "StockSavvy",
    honkPoints: 2180,
    goldenEggs: 15,
    streak: 12,
    level: 7,
    rank: 2,
    weeklyPoints: 280,
    monthlyPoints: 980,
    achievements: 10,
  },
  {
    id: "3",
    name: "PortfolioMaster",
    honkPoints: 1950,
    goldenEggs: 13,
    streak: 8,
    level: 6,
    rank: 3,
    weeklyPoints: 220,
    monthlyPoints: 850,
    achievements: 9,
  },
  {
    id: "4",
    name: "ETFExplorer",
    honkPoints: 1720,
    goldenEggs: 11,
    streak: 6,
    level: 5,
    rank: 4,
    weeklyPoints: 180,
    monthlyPoints: 720,
    achievements: 8,
  },
  {
    id: "5",
    name: "DividendHunter",
    honkPoints: 1580,
    goldenEggs: 10,
    streak: 4,
    level: 5,
    rank: 5,
    weeklyPoints: 160,
    monthlyPoints: 650,
    achievements: 7,
  },
  {
    id: "6",
    name: "BondBuddy",
    honkPoints: 1420,
    goldenEggs: 9,
    streak: 3,
    level: 4,
    rank: 6,
    weeklyPoints: 140,
    monthlyPoints: 580,
    achievements: 6,
  },
  {
    id: "7",
    name: "CryptoCanadian",
    honkPoints: 1280,
    goldenEggs: 8,
    streak: 2,
    level: 4,
    rank: 7,
    weeklyPoints: 120,
    monthlyPoints: 520,
    achievements: 5,
  },
  {
    id: "8",
    name: "RiskTaker",
    honkPoints: 1150,
    goldenEggs: 7,
    streak: 1,
    level: 3,
    rank: 8,
    weeklyPoints: 100,
    monthlyPoints: 460,
    achievements: 4,
  },
]

interface Flock {
  id: string
  name: string
  description: string
  members: number
  totalPoints: number
  averageLevel: number
  isJoined: boolean
}

const mockFlocks: Flock[] = [
  {
    id: "1",
    name: "Canadian Investors",
    description: "Focus on Canadian markets and tax-advantaged accounts",
    members: 156,
    totalPoints: 45600,
    averageLevel: 5.2,
    isJoined: true,
  },
  {
    id: "2",
    name: "ETF Enthusiasts",
    description: "All about Exchange-Traded Funds and passive investing",
    members: 203,
    totalPoints: 62400,
    averageLevel: 4.8,
    isJoined: false,
  },
  {
    id: "3",
    name: "Dividend Seekers",
    description: "Building wealth through dividend-paying stocks",
    members: 89,
    totalPoints: 28900,
    averageLevel: 6.1,
    isJoined: false,
  },
  {
    id: "4",
    name: "Growth Investors",
    description: "High-growth stocks and emerging markets",
    members: 134,
    totalPoints: 41200,
    averageLevel: 4.5,
    isJoined: false,
  },
  {
    id: "5",
    name: "Beginner Friendly",
    description: "New to investing? Start here with supportive community",
    members: 287,
    totalPoints: 35600,
    averageLevel: 2.8,
    isJoined: false,
  },
]

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return "🥇"
    case 2:
      return "🥈"
    case 3:
      return "🥉"
    default:
      return `#${rank}`
  }
}

export function Leaderboards() {
  const [selectedTab, setSelectedTab] = useState("all-time")
  const { user } = useAuth()

  if (!user) return null

  // Find current user's position (mock)
  const currentUserRank = 15
  const currentUserData = {
    ...user,
    rank: currentUserRank,
    weeklyPoints: 85,
    monthlyPoints: 320,
    achievements: 3,
  }


  const getLeaderboardData = (type: string) => {
    switch (type) {
      case "weekly":
        return [...mockUsers].sort((a, b) => b.weeklyPoints - a.weeklyPoints)
      case "monthly":
        return [...mockUsers].sort((a, b) => b.monthlyPoints - a.monthlyPoints)
      default:
        return mockUsers
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="text-center py-4">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-3xl font-bold mb-2">Leaderboards & Community</h1>
        <p className="text-muted-foreground">See how you stack up against other investors</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-time">All Time</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="flocks">Flocks</TabsTrigger>
        </TabsList>

        <TabsContent value="all-time" className="space-y-6">
          <LeaderboardContent data={getLeaderboardData("all-time")} currentUser={currentUserData} type="honkPoints" />
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <LeaderboardContent data={getLeaderboardData("monthly")} currentUser={currentUserData} type="monthlyPoints" />
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          <LeaderboardContent data={getLeaderboardData("weekly")} currentUser={currentUserData} type="weeklyPoints" />
        </TabsContent>

        <TabsContent value="flocks" className="space-y-6">
          <FlocksContent flocks={mockFlocks} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LeaderboardContent({
  data,
  currentUser,
  type,
}: {
  data: LeaderboardUser[]
  currentUser: any
  type: "honkPoints" | "weeklyPoints" | "monthlyPoints"
}) {
  const getPointsValue = (user: LeaderboardUser, type: string) => {
    switch (type) {
      case "weeklyPoints":
        return user.weeklyPoints
      case "monthlyPoints":
        return user.monthlyPoints
      default:
        return user.honkPoints
    }
  }

  const getPointsLabel = (type: string) => {
    switch (type) {
      case "weeklyPoints":
        return "Weekly Points"
      case "monthlyPoints":
        return "Monthly Points"
      default:
        return "Total Points"
    }
  }

  return (
    <>
      {/* Current User Position */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="text-2xl">🪿</div>
            Your Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-primary">#{currentUser.rank}</div>
              <div>
                <div className="font-medium">{currentUser.name}</div>
                <div className="text-sm text-muted-foreground">Level {currentUser.level}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{getPointsValue(currentUser, type)} points</div>
              <div className="text-sm text-muted-foreground">{getPointsLabel(type)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 10 Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Top Investors</CardTitle>
          <CardDescription>The highest-scoring members of the Honkonomics community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.slice(0, 10).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold w-8 text-center">{getRankIcon(index + 1)}</div>
                  <Avatar>
                    <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Level {user.level} • {user.streak} day streak
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{getPointsValue(user, type).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">🥚 {user.goldenEggs}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function FlocksContent({ flocks }: { flocks: Flock[] }) {
  const [joinedFlocks, setJoinedFlocks] = useState(flocks.filter((f) => f.isJoined))

  const joinFlock = (flockId: string) => {
    // Mock join functionality
    console.log(`Joining flock ${flockId}`)
  }

  const leaveFlock = (flockId: string) => {
    // Mock leave functionality
    console.log(`Leaving flock ${flockId}`)
  }

  return (
    <div className="space-y-6">
      {/* My Flocks */}
      {joinedFlocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Flocks</CardTitle>
            <CardDescription>Investment communities you've joined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {joinedFlocks.map((flock) => (
                <div key={flock.id} className="flex items-center justify-between p-4 border rounded-lg bg-accent/5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{flock.name}</h3>
                      <Badge variant="secondary">Joined</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{flock.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>👥 {flock.members} members</span>
                      <span>🪙 {flock.totalPoints.toLocaleString()} total points</span>
                      <span>📊 Avg Level {flock.averageLevel}</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => leaveFlock(flock.id)}>
                    Leave
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Flocks */}
      <Card>
        <CardHeader>
          <CardTitle>Join a Flock</CardTitle>
          <CardDescription>Connect with like-minded investors and learn together</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {flocks
              .filter((f) => !f.isJoined)
              .map((flock) => (
                <div key={flock.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">{flock.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{flock.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>👥 {flock.members} members</span>
                      <span>🪙 {flock.totalPoints.toLocaleString()} total points</span>
                      <span>📊 Avg Level {flock.averageLevel}</span>
                    </div>
                  </div>
                  <Button onClick={() => joinFlock(flock.id)}>Join Flock</Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Flock */}
      <Card className="border-dashed">
        <CardContent className="text-center py-8">
          <div className="text-4xl mb-4">🆕</div>
          <h3 className="text-lg font-medium mb-2">Create Your Own Flock</h3>
          <p className="text-muted-foreground mb-4">Start a community around your investment interests</p>
          <Button variant="outline">Create New Flock</Button>
        </CardContent>
      </Card>
    </div>
  )
}
