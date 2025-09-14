"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { loadAICourses } from "@/lib/ai-courses"

interface Lesson {
  id: number
  title: string
  description: string
  points: number
  progress: number
  locked: boolean
  completed: boolean
  moduleId?: string
}

const baseLessons: Lesson[] = [
  {
    id: 1,
    title: "Investment Basics",
    description: "Learn the fundamentals",
    points: 50,
    progress: 25,
    locked: false,
    completed: false,
    moduleId: "investment-basics",
  },
  {
    id: 2,
    title: "Risk & Return",
    description: "Understanding risk profiles",
    points: 60,
    progress: 0,
    locked: false,
    completed: false,
    moduleId: "risk-rewards",
  },
  {
    id: 3,
    title: "Canadian Tax Accounts",
    description: "TFSA, RRSP, and more",
    points: 75,
    progress: 0,
    locked: true,
    completed: false,
    moduleId: "canadian-accounts",
  },
  {
    id: 4,
    title: "ETF Essentials",
    description: "Exchange-Traded Funds",
    points: 60,
    progress: 0,
    locked: true,
    completed: false,
    moduleId: "etf-essentials",
  },
  {
    id: 5,
    title: "Portfolio Building",
    description: "Create your portfolio",
    points: 80,
    progress: 0,
    locked: false,
    completed: false,
    moduleId: "portfolio-management",
  },
  {
    id: 6,
    title: "Market Psychology",
    description: "Behavioral finance basics",
    points: 60,
    progress: 0,
    locked: true,
    completed: false
  },
  {
    id: 7,
    title: "Trading Fundamentals",
    description: "Market vs. limit orders",
    points: 55,
    progress: 0,
    locked: false,
    completed: false,
    moduleId: "trading-fundamentals",
  },
  {
    id: 8,
    title: "Stock Market Basics",
    description: "Exchanges, tickers, market caps",
    points: 55,
    progress: 0,
    locked: false,
    completed: false,
    moduleId: "stock-market-basics",
  },
  {
    id: 9,
    title: "Technical Analysis",
    description: "Trends and indicators",
    points: 70,
    progress: 0,
    locked: true,
    completed: false,
    moduleId: "technical-analysis",
  },
  {
    id: 10,
    title: "Options & Derivatives",
    description: "Calls, puts, strategies",
    points: 90,
    progress: 0,
    locked: true,
    completed: false,
    moduleId: "options-derivatives",
  },
  {
    id: 11,
    title: "Crypto Basics",
    description: "Bitcoin, wallets, chains",
    points: 85,
    progress: 0,
    locked: false,
    completed: false,
    moduleId: "crypto-basics",
  },
  {
    id: 12,
    title: "Day Trading Dojo",
    description: "Intraday strategies",
    points: 95,
    progress: 0,
    locked: true,
    completed: false,
    moduleId: "day-trading",
  }
]

export function LearningPath({ onStartLesson }: { onStartLesson: (moduleId: string) => void }) {
  const [currentLesson, setCurrentLesson] = useState(1)
  const [hoveredLesson, setHoveredLesson] = useState<number | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>(baseLessons)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    // Auto-scroll to current lesson on mount
    if (scrollRef.current) {
      const cloudWidth = 200
      const scrollPosition = (currentLesson - 1) * cloudWidth - 100
      scrollRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' })
    }
  }, [currentLesson])

  const getCloudImage = (lesson: Lesson) => {
    if (lesson.completed) return "/cloud_completed.png"
    if (lesson.locked) return "/cloud_locked.png"
    return "/cloud_unlocked.png"
  }

  const getCloudPosition = (index: number) => {
    // Create a wave pattern for cloud heights
    const waveHeight = Math.sin(index * 0.8) * 30 + 120
    return waveHeight
  }

  // Load and compute progress/locks
  useEffect(() => {
    if (!user?.id) return;
    const recompute = () => {
      let saved: Record<string, number> = {}
      try {
        const raw = localStorage.getItem(`honk_progress_${user.id}`)
        if (raw) saved = JSON.parse(raw)
      } catch {}

      // Base lessons
      const computed: Lesson[] = baseLessons.map(l => ({ ...l }))

      // Append AI courses as unlocked lessons
      const ai = loadAICourses(user.id)
      const startId = computed.length > 0 ? computed[computed.length - 1].id + 1 : 1
      ai.forEach((sc, idx) => {
        computed.push({
          id: startId + idx,
          title: sc.course.title,
          description: sc.course.overview,
          points: Math.max(20, sc.course.lessons.length * 10),
          progress: 0,
          locked: false,
          completed: false,
          moduleId: sc.id,
        })
      })

      // Compute progress and locks; AI lessons are never locked by sequence
      let prevCompleted = true
      for (let i = 0; i < computed.length; i++) {
        const l = computed[i]
        const p = l.moduleId ? (saved[l.moduleId] ?? l.progress) : l.progress
        l.progress = p
        const completed = p >= 100 || l.completed
        l.completed = completed
        if (l.moduleId && l.moduleId.startsWith("ai:")) {
          l.locked = false
        } else {
          l.locked = i === 0 ? false : !prevCompleted
          prevCompleted = completed
        }
      }
      setLessons(computed)

      // Focus the first incomplete unlocked lesson
      const firstIncomplete = computed.find(l => !l.completed) || computed[computed.length - 1]
      setCurrentLesson(firstIncomplete?.id || 1)
    }

    recompute()
    const onUpdate = (e: any) => { try { if (e?.detail?.userId && user?.id && e.detail.userId === user.id) recompute() } catch {} }
    if (typeof window !== 'undefined') {
      window.addEventListener('ai-courses:updated', onUpdate as any)
      window.addEventListener('honk-progress:updated', onUpdate as any)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ai-courses:updated', onUpdate as any)
        window.removeEventListener('honk-progress:updated', onUpdate as any)
      }
    }
  }, [user?.id])

  return (
    <div className="relative w-full bg-gradient-to-b from-sky-100 to-sky-50 rounded-xl overflow-hidden border border-foreground/20" style={{ height: '400px' }}>
      {/* Background image + lighter overlay for better visibility */}
      <Image src="/journeybackground.png" alt="Journey Background" fill className="object-cover opacity-25 pointer-events-none select-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200/20 via-sky-100/10 to-transparent" />
      
      {/* Scrollable Path Container */}
      <div 
        ref={scrollRef}
        className="relative h-full overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="relative h-full" style={{ width: `${lessons.length * 200 + 100}px` }}>
          {/* Flight Path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {lessons.map((lesson, index) => {
              if (index === 0) return null
              const prevX = (index - 1) * 200 + 100
              const prevY = getCloudPosition(index - 1) + 80
              const currX = index * 200 + 100
              const currY = getCloudPosition(index) + 80
              
              return (
                <line
                  key={`path-${index}`}
                  x1={prevX}
                  y1={prevY}
                  x2={currX}
                  y2={currY}
                  stroke={lesson.locked ? "#cbd5e1" : "#60a5fa"}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity={0.6}
                />
              )
            })}
          </svg>

          {/* Clouds */}
          {lessons.map((lesson, index) => {
            const isCurrentLesson = lesson.id === currentLesson
            const cloudY = getCloudPosition(index)
            
            return (
              <div
                key={lesson.id}
                className="absolute transition-all duration-300 group"
                style={{
                  left: `${index * 200 + 50}px`,
                  top: `${cloudY}px`,
                  zIndex: isCurrentLesson ? 3 : 2
                }}
                onMouseEnter={() => setHoveredLesson(lesson.id)}
                onMouseLeave={() => setHoveredLesson(null)}
              >
                {/* Cloud */}
                <button
                  onClick={() => !lesson.locked && lesson.moduleId && onStartLesson(lesson.moduleId)}
                  disabled={lesson.locked}
                  className={`relative transition-all duration-300 ease-out ${
                    !lesson.locked ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  <div className="relative w-32 h-32">
                    {/* Cloud Image */}
                    <Image 
                      src={getCloudImage(lesson)} 
                      alt={`Lesson ${lesson.id}`}
                      width={128}
                      height={128}
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Lesson Number */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {lesson.id}
                    </div>

                    {/* Progress Ring for Current Lesson */}
                    {isCurrentLesson && lesson.progress > 0 && (
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="60"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="4"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="60"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 60}`}
                          strokeDashoffset={`${2 * Math.PI * 60 * (1 - lesson.progress / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Goose on Current Lesson */}
                {isCurrentLesson && (
                  <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <Image 
                      src="/goose_flying_1.png" 
                      alt="Flying Goose"
                      width={64}
                      height={64}
                      className="w-16 h-16 object-contain scale-x-[-1]"
                    />
                  </div>
                )}

                {/* Hover Tooltip */}
                {hoveredLesson === lesson.id && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-foreground text-background px-3 py-2 rounded-lg text-sm z-10 shadow-lg max-w-md w-max">
                    <div className="font-semibold truncate max-w-md">{lesson.title}</div>
                    <div className="text-xs opacity-90 mt-1 break-words" style={{ display: '-webkit-box', WebkitLineClamp: 2 as any, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                      {lesson.description}
                    </div>
                    <div className="text-xs mt-1 flex items-center gap-1">
                      <Image src="/honk_point.png" alt="Points" width={12} height={12} />
                      <span>{lesson.points} points</span>
                    </div>
                    {lesson.progress > 0 && (
                      <div className="text-xs mt-1">{lesson.progress}% complete</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Current Progress Text */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
        <div className="text-sm font-semibold">{lessons[currentLesson - 1].title}</div>
        <div className="text-xs text-muted-foreground">
          {lessons[currentLesson - 1].progress}% Complete 
          {currentLesson < lessons.length && ` • Next: ${lessons[currentLesson].title}`}
        </div>
      </div>

      {/* Points Display */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 border border-border">
        <Image src="/honk_point.png" alt="Honk Points" width={24} height={24} />
        <span className="font-semibold">{user?.honkPoints || 0}</span>
      </div>
    </div>
  )
}
