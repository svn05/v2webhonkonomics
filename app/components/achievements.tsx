"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "./auth-provider"

interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  category: "learning" | "streak" | "points" | "social"
  requirement: number
  reward: { honkPoints?: number; goldenEggs?: number }
  unlocked: boolean
  progress: number
}

export function Achievements() {
  const { user } = useAuth()

  if (!user) return null

  const achievements: Achievement[] = [
    {
      id: "first-lesson",
      title: "First Steps",
      description: "Complete your first lesson",
      emoji: "🐣",
      category: "learning",
      requirement: 1,
      reward: { honkPoints: 25 },
      unlocked: true, // Mock - would be based on actual progress
      progress: 100,
    },
    {
      id: "quiz-master",
      title: "Quiz Master",
      description: "Score 100% on any quiz",
      emoji: "🎯",
      category: "learning",
      requirement: 1,
      reward: { goldenEggs: 2 },
      unlocked: false,
      progress: 0,
    },
    {
      id: "week-streak",
      title: "Dedicated Learner",
      description: "Maintain a 7-day learning streak",
      emoji: "🔥",
      category: "streak",
      requirement: 7,
      reward: { honkPoints: 100, goldenEggs: 1 },
      unlocked: false,
      progress: (user.streak / 7) * 100,
    },
    {
      id: "point-collector",
      title: "Point Collector",
      description: "Earn 500 Honk Points",
      emoji: "🪙",
      category: "points",
      requirement: 500,
      reward: { goldenEggs: 3 },
      unlocked: user.honkPoints >= 500,
      progress: Math.min((user.honkPoints / 500) * 100, 100),
    },
    {
      id: "golden-goose",
      title: "Golden Goose",
      description: "Collect 10 Golden Eggs",
      emoji: "🥚",
      category: "points",
      requirement: 10,
      reward: { honkPoints: 200 },
      unlocked: user.goldenEggs >= 10,
      progress: Math.min((user.goldenEggs / 10) * 100, 100),
    },
    {
      id: "module-master",
      title: "Module Master",
      description: "Complete 3 learning modules",
      emoji: "📚",
      category: "learning",
      requirement: 3,
      reward: { goldenEggs: 5 },
      unlocked: false,
      progress: 33, // Mock progress
    },
    {
      id: "early-bird",
      title: "Early Bird",
      description: "Complete a lesson before 9 AM",
      emoji: "🌅",
      category: "streak",
      requirement: 1,
      reward: { honkPoints: 50 },
      unlocked: false,
      progress: 0,
    },
    {
      id: "night-owl",
      title: "Night Owl",
      description: "Complete a lesson after 10 PM",
      emoji: "🦉",
      category: "streak",
      requirement: 1,
      reward: { honkPoints: 50 },
      unlocked: false,
      progress: 0,
    },
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "learning":
        return "bg-blue-100 text-blue-800"
      case "streak":
        return "bg-orange-100 text-orange-800"
      case "points":
        return "bg-green-100 text-green-800"
      case "social":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const unlockedAchievements = achievements.filter((a) => a.unlocked)
  const lockedAchievements = achievements.filter((a) => !a.unlocked)

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="text-center py-4">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-muted-foreground">Track your learning milestones and earn rewards</p>
      </div>

      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{unlockedAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Achievements Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{achievements.length}</div>
              <div className="text-sm text-muted-foreground">Total Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Unlocked Achievements</h2>
          <div className="grid gap-4">
            {unlockedAchievements.map((achievement) => (
              <Card key={achievement.id} className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{achievement.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{achievement.title}</h3>
                        <Badge className={getCategoryColor(achievement.category)}>{achievement.category}</Badge>
                        <Badge variant="default" className="bg-green-600">
                          ✓ Unlocked
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{achievement.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Reward:</span>
                        {achievement.reward.honkPoints && (
                          <span className="flex items-center gap-1">🪙 {achievement.reward.honkPoints}</span>
                        )}
                        {achievement.reward.goldenEggs && (
                          <span className="flex items-center gap-1">🥚 {achievement.reward.goldenEggs}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">In Progress</h2>
        <div className="grid gap-4">
          {lockedAchievements.map((achievement) => (
            <Card key={achievement.id} className="opacity-75">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl grayscale">{achievement.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{achievement.title}</h3>
                      <Badge className={getCategoryColor(achievement.category)}>{achievement.category}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{achievement.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(achievement.progress)}%</span>
                      </div>
                      <Progress value={achievement.progress} className="h-2" />
                    </div>
                    <div className="flex items-center gap-4 text-sm mt-3">
                      <span>Reward:</span>
                      {achievement.reward.honkPoints && (
                        <span className="flex items-center gap-1">🪙 {achievement.reward.honkPoints}</span>
                      )}
                      {achievement.reward.goldenEggs && (
                        <span className="flex items-center gap-1">🥚 {achievement.reward.goldenEggs}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
