"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "./auth-provider"

interface Challenge {
  id: string
  title: string
  description: string
  type: "stock-or-not" | "price-is-right" | "market-minute"
  difficulty: "easy" | "medium" | "hard"
  pointsReward: number
  completed: boolean
}

interface StockOrNotQuestion {
  symbol: string
  isReal: boolean
  hint?: string
}

interface PriceIsRightQuestion {
  symbol: string
  name: string
  actualPrice: number
  range: { min: number; max: number }
}

const todaysChallenges: Challenge[] = [
  {
    id: "stock-or-not-1",
    title: "Stock or Not?",
    description: "Can you identify real stock ticker symbols?",
    type: "stock-or-not",
    difficulty: "easy",
    pointsReward: 25,
    completed: false,
  },
  {
    id: "price-is-right-1",
    title: "Price is Right: Stock Edition",
    description: "Guess the current stock prices",
    type: "price-is-right",
    difficulty: "medium",
    pointsReward: 40,
    completed: false,
  },
  {
    id: "market-minute-1",
    title: "Market Minute",
    description: "Quick fire investment knowledge test",
    type: "market-minute",
    difficulty: "hard",
    pointsReward: 60,
    completed: false,
  },
]

const stockOrNotQuestions: StockOrNotQuestion[] = [
  { symbol: "AAPL", isReal: true, hint: "Think fruit company" },
  { symbol: "GOOGL", isReal: true, hint: "Search engine giant" },
  { symbol: "TSLA", isReal: true, hint: "Electric vehicle pioneer" },
  { symbol: "MSFT", isReal: true, hint: "Software giant from Seattle" },
  { symbol: "AMZN", isReal: true, hint: "Everything store" },
  { symbol: "NVDA", isReal: true, hint: "AI chips leader" },
  { symbol: "META", isReal: true, hint: "Social + VR" },
  { symbol: "NFLX", isReal: true, hint: "Streaming pioneer" },
  { symbol: "RY", isReal: true, hint: "Royal Bank of Canada" },
  { symbol: "RBC", isReal: true, hint: "RBC Bearings (also think Canadian bank)" },
  { symbol: "SHOP", isReal: true, hint: "Canadian e‑commerce" },
  { symbol: "BNS", isReal: true, hint: "Scotiabank" },
  { symbol: "TD", isReal: true, hint: "Another big Canadian bank" },
  { symbol: "XIC", isReal: true, hint: "Canadian broad market ETF" },
  { symbol: "VOO", isReal: true, hint: "S&P 500 ETF" },
  { symbol: "QQQ", isReal: true, hint: "NASDAQ 100 ETF" },
  { symbol: "HONK", isReal: false, hint: "Too on‑brand for our goose!" },
  { symbol: "GOOSE", isReal: false, hint: "Our mascot isn't listed... yet!" },
  { symbol: "DUCK", isReal: false, hint: "More of a pond vibe than a ticker" },
  { symbol: "EGG", isReal: false, hint: "Yummy but not a ticker" },
]

const priceIsRightQuestions: PriceIsRightQuestion[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    actualPrice: 189.25,
    range: { min: 150, max: 220 },
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    actualPrice: 142.87,
    range: { min: 120, max: 180 },
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    actualPrice: 248.42,
    range: { min: 200, max: 300 },
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    actualPrice: 378.91,
    range: { min: 300, max: 420 },
  },
]

export function DailyChallenges() {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [userAnswers, setUserAnswers] = useState<any[]>([])
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [summary, setSummary] = useState<{
    finalScore: number
    pointsEarned: number
    challenge: Challenge
  } | null>(null)
  const { user, updateUser } = useAuth()

  if (!user) return null

  const resetGame = () => {
    setCurrentQuestionIndex(0)
    setScore(0)
    setGameComplete(false)
    setUserAnswers([])
  }

  const startChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    resetGame()
    setSummary(null)
  }

  const completeChallenge = (finalScore: number, challenge: Challenge) => {
    const pointsEarned = Math.round((finalScore / 100) * challenge.pointsReward)
    updateUser({
      honkPoints: user.honkPoints + pointsEarned,
      goldenEggs: finalScore >= 80 ? user.goldenEggs + 1 : user.goldenEggs,
    })
    setGameComplete(true)
    setCompleted((prev) => ({ ...prev, [challenge.id]: true }))
    setSummary({ finalScore, pointsEarned, challenge })
  }

  if (selectedChallenge) {
    if (summary) {
      return (
        <div className="max-w-2xl mx-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">{summary.challenge.title} — Results</CardTitle>
              <CardDescription className="text-center">Great job! Here’s how you did today.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4 py-4">
                <Image src="/goose_cheering.png" alt="Celebration Goose" width={96} height={96} />
                <div className="text-2xl font-bold">Score: {summary.finalScore}%</div>
                <div className="flex items-center gap-2 text-lg">
                  <Image src="/honk_point.png" alt="Honk Points" width={24} height={24} />
                  <span>+{summary.pointsEarned} Honk Points</span>
                </div>
                <div className="text-sm text-muted-foreground">Bonus Golden Egg for 80%+ scores</div>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={() => setSelectedChallenge(null)}>Back to Challenges</Button>
                  <Button onClick={() => startChallenge(summary.challenge)}>Replay</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
    if (selectedChallenge.type === "stock-or-not") {
      return (
        <StockOrNotGame
          challenge={selectedChallenge}
          onComplete={completeChallenge}
          onBack={() => setSelectedChallenge(null)}
        />
      )
    } else if (selectedChallenge.type === "price-is-right") {
      return (
        <PriceIsRightGame
          challenge={selectedChallenge}
          onComplete={completeChallenge}
          onBack={() => setSelectedChallenge(null)}
        />
      )
    } else if (selectedChallenge.type === "market-minute") {
      return (
        <MarketMinuteGame
          challenge={selectedChallenge}
          onComplete={completeChallenge}
          onBack={() => setSelectedChallenge(null)}
        />
      )
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="text-center py-4">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-3xl font-bold mb-2">Daily Challenges</h1>
        <p className="text-muted-foreground">Test your investment knowledge and earn rewards</p>
      </div>

      {/* Challenge Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Challenges</CardTitle>
          <CardDescription>Complete challenges to earn Honk Points and Golden Eggs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {todaysChallenges.filter((c) => c.completed).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{todaysChallenges.length}</div>
              <div className="text-sm text-muted-foreground">Total Challenges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{todaysChallenges.reduce((sum, c) => sum + c.pointsReward, 0)}</div>
              <div className="text-sm text-muted-foreground">Max Points Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenge List */}
      <div className="space-y-4">
        {todaysChallenges.map((challenge) => (
          <Card key={challenge.id} className={(completed[challenge.id] || challenge.completed) ? "opacity-60" : "border border-foreground/20"}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">{challenge.title}</h3>
                    <Badge
                      variant={
                        challenge.difficulty === "easy"
                          ? "secondary"
                          : challenge.difficulty === "medium"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {challenge.difficulty}
                    </Badge>
                    {(completed[challenge.id] || challenge.completed) && <Badge variant="outline">✓ Completed</Badge>}
                  </div>
                  <p className="text-muted-foreground mb-3">{challenge.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Image src="/honk_point.png" alt="Honk Points" width={16} height={16} />
                      {challenge.pointsReward} points
                    </span>
                    <span className="flex items-center gap-1">
                      <Image src="/golden_egg.png" alt="Golden Egg" width={16} height={16} />
                      Bonus for 80%+ score
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <Button
                    onClick={() => startChallenge(challenge)}
                    disabled={completed[challenge.id] || challenge.completed}
                    variant={(completed[challenge.id] || challenge.completed) ? "outline" : "default"}
                  >
                    {(completed[challenge.id] || challenge.completed) ? "Completed" : "Start Challenge"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Tomorrow */}
      <Card className="border-dashed">
        <CardContent className="text-center py-8">
          <div className="text-4xl mb-4">⏰</div>
          <h3 className="text-lg font-medium mb-2">New Challenges Tomorrow!</h3>
          <p className="text-muted-foreground">Come back tomorrow for fresh challenges and more rewards</p>
        </CardContent>
      </Card>
    </div>
  )
}

function StockOrNotGame({
  challenge,
  onComplete,
  onBack,
}: {
  challenge: Challenge
  onComplete: (score: number, challenge: Challenge) => void
  onBack: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [showBurst, setShowBurst] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const currentQuestion = stockOrNotQuestions[currentIndex]
  const progress = ((currentIndex + 1) / stockOrNotQuestions.length) * 100

  // 3-second answer window per question. Auto-fail if timer hits 0 without an answer.
  useEffect(() => {
    if (showResult) return
    setCountdown(3)
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t)
          // If no answer chosen when time runs out, mark as incorrect and advance after showing result
          if (!showResult && selectedAnswer === null) {
            // Show result as incorrect
            setShowResult(true)
            setTimeout(() => {
              if (currentIndex < stockOrNotQuestions.length - 1) {
                setCurrentIndex(currentIndex + 1)
                setShowResult(false)
                setSelectedAnswer(null)
              } else {
                const finalScore = Math.round((score / stockOrNotQuestions.length) * 100)
                onComplete(finalScore, challenge)
              }
            }, 2000)
          }
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [currentIndex, showResult])

  const handleAnswer = (isReal: boolean) => {
    setSelectedAnswer(isReal)
    setShowResult(true)

    if (isReal === currentQuestion.isReal) {
      setScore(score + 1)
      setShowBurst(true)
    }

    setTimeout(() => {
      setShowBurst(false)
      if (currentIndex < stockOrNotQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowResult(false)
        setSelectedAnswer(null)
      } else {
        const finalScore = Math.round(
          ((score + (isReal === currentQuestion.isReal ? 1 : 0)) / stockOrNotQuestions.length) * 100,
        )
        onComplete(finalScore, challenge)
      }
    }, 2000)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack}>
              ← Back
            </Button>
            <Badge variant="outline">
              {currentIndex + 1} of {stockOrNotQuestions.length}
            </Badge>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-center">{challenge.title}</CardTitle>
          <CardDescription className="text-center">
            Is this a real stock ticker symbol?
            <span className="ml-2 text-primary font-medium">Time left: {countdown}s</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center relative">
            <div className="flex justify-center mb-2">
              <Image src="/goose_thinking.png" alt="Goose" width={64} height={64} />
            </div>
            <div className="text-6xl font-bold text-primary mb-2">{currentQuestion.symbol}</div>
            {currentQuestion.hint && <p className="text-sm text-muted-foreground mb-4">Hint: {currentQuestion.hint}</p>}
            {showBurst && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-40 h-40">
                  {[...Array(8)].map((_, i) => (
                    <Image
                      key={i}
                      src="/honk_point.png"
                      alt="Coin"
                      width={20}
                      height={20}
                      className="absolute animate-bounce"
                      style={{
                        left: `${50 + 40 * Math.cos((i / 8) * 2 * Math.PI)}%`,
                        top: `${50 + 40 * Math.sin((i / 8) * 2 * Math.PI)}%`,
                        transform: "translate(-50%, -50%)",
                        animationDelay: `${i * 80}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {showResult ? (
            <div className="text-center space-y-4" role="status" aria-live="polite">
              <div className={`text-4xl ${selectedAnswer === currentQuestion.isReal ? "text-green-600" : "text-red-600"}`}>
                {selectedAnswer === currentQuestion.isReal ? (
                  <div className="flex flex-col items-center gap-2">
                    <Image src="/goose_cheering.png" alt="Correct" width={64} height={64} />
                    ✓ Correct!
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Image src="/goose_thinking.png" alt="Wrong" width={64} height={64} />
                    ✗ Wrong!
                  </div>
                )}
              </div>
              <p className="text-muted-foreground">
                {currentQuestion.symbol} is {currentQuestion.isReal ? "a real" : "not a real"} stock ticker
              </p>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => handleAnswer(true)} className="flex-1 max-w-xs">
                Real Stock
              </Button>
              <Button size="lg" variant="outline" onClick={() => handleAnswer(false)} className="flex-1 max-w-xs">
                Fake Symbol
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Score: {score}/{stockOrNotQuestions.length}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PriceIsRightGame({
  challenge,
  onComplete,
  onBack,
}: {
  challenge: Challenge
  onComplete: (score: number, challenge: Challenge) => void
  onBack: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [userGuess, setUserGuess] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showBurst, setShowBurst] = useState(false)

  const currentQuestion = priceIsRightQuestions[currentIndex]
  const progress = ((currentIndex + 1) / priceIsRightQuestions.length) * 100

  const handleSubmit = () => {
    const guess = Number.parseFloat(userGuess)
    const actual = currentQuestion.actualPrice
    const tolerance = actual * 0.1 // 10% tolerance

    const correct = Math.abs(guess - actual) <= tolerance
    setIsCorrect(correct)
    if (correct) setShowBurst(true)
    setShowResult(true)

    if (correct) {
      setScore(score + 1)
    }

    setTimeout(() => {
      if (currentIndex < priceIsRightQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowResult(false)
        setUserGuess("")
        setShowBurst(false)
      } else {
        const finalScore = Math.round(((score + (correct ? 1 : 0)) / priceIsRightQuestions.length) * 100)
        onComplete(finalScore, challenge)
      }
    }, 3000)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack}>
              ← Back
            </Button>
            <Badge variant="outline">
              {currentIndex + 1} of {priceIsRightQuestions.length}
            </Badge>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-center">{challenge.title}</CardTitle>
          <CardDescription className="text-center">Guess the current stock price (within 10%)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">{currentQuestion.symbol}</div>
            <div className="text-lg text-muted-foreground mb-4">{currentQuestion.name}</div>
          </div>

          {showResult ? (
            <div className="text-center space-y-4" role="status" aria-live="polite">
              <div className={`text-4xl ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                {isCorrect ? (
                  <div className="flex flex-col items-center gap-2">
                    <Image src="/goose_cheering.png" alt="Correct" width={64} height={64} />
                    ✓ Close Enough!
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Image src="/goose_thinking.png" alt="Wrong" width={64} height={64} />
                    ✗ Not Quite!
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p>Your guess: ${Number.parseFloat(userGuess).toFixed(2)}</p>
                <p>Actual price: ${currentQuestion.actualPrice.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {isCorrect ? "Within 10% - Great job!" : "Outside 10% tolerance"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 relative">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Image src="/goose_glass.png" alt="Professor Goose" width={56} height={56} />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Price range hint: ${currentQuestion.range.min} - ${currentQuestion.range.max}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Enter your guess"
                    value={userGuess}
                    onChange={(e) => setUserGuess(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && userGuess && handleSubmit()}
                  />
                </div>
                <Button onClick={handleSubmit} disabled={!userGuess}>
                  Submit
                </Button>
              </div>
              {showBurst && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    {[...Array(8)].map((_, i) => (
                      <Image
                        key={i}
                        src="/honk_point.png"
                        alt="Coin"
                        width={20}
                        height={20}
                        className="absolute animate-bounce"
                        style={{
                          left: `${50 + 40 * Math.cos((i / 8) * 2 * Math.PI)}%`,
                          top: `${50 + 40 * Math.sin((i / 8) * 2 * Math.PI)}%`,
                          transform: "translate(-50%, -50%)",
                          animationDelay: `${i * 80}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Score: {score}/{priceIsRightQuestions.length}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MarketMinuteGame({
  challenge,
  onComplete,
  onBack,
}: {
  challenge: Challenge
  onComplete: (score: number, challenge: Challenge) => void
  onBack: () => void
}) {
  const [timeLeft, setTimeLeft] = useState(60)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [showBurst, setShowBurst] = useState(false)

  const questions = [
    { question: "What does ETF stand for?", answer: "Exchange-Traded Fund" },
    { question: "What is diversification?", answer: "Spreading investments across different assets" },
    { question: "What does TFSA stand for?", answer: "Tax-Free Savings Account" },
    { question: "What is a dividend?", answer: "Payment made by companies to shareholders" },
    { question: "What does P/E ratio measure?", answer: "Price to Earnings ratio" },
  ]

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameEnded) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setGameEnded(true)
      const finalScore = Math.round((score / questions.length) * 100)
      onComplete(finalScore, challenge)
    }
  }, [timeLeft, gameStarted, gameEnded])

  const startGame = () => {
    setGameStarted(true)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack}>
              ← Back
            </Button>
            <Badge variant="outline">Time: {timeLeft}s</Badge>
          </div>
          <CardTitle className="text-center">{challenge.title}</CardTitle>
          <CardDescription className="text-center">Answer as many questions as you can in 60 seconds!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!gameStarted ? (
            <div className="text-center space-y-4">
              <div className="text-4xl mb-4">⏱️</div>
              <p className="text-muted-foreground">Ready for a quick-fire investment knowledge test?</p>
              <Button size="lg" onClick={startGame}>
                Start 60-Second Challenge
              </Button>
            </div>
          ) : gameEnded ? (
            <div className="text-center space-y-4" role="status" aria-live="polite">
              <div className="text-4xl text-primary mb-4">🎉</div>
              <h3 className="text-xl font-bold">Time's Up!</h3>
              <p>
                You answered {score} out of {questions.length} questions correctly
              </p>
              <p className="text-sm text-muted-foreground">
                Final Score: {Math.round((score / questions.length) * 100)}%
              </p>
            </div>
          ) : (
            <div className="space-y-4 relative">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4">{questions[currentIndex]?.question}</h3>
                <p className="text-sm text-muted-foreground">Think fast! ⚡</p>
              </div>
              <div className="text-center">
                <Button
                  onClick={() => {
                    setScore(score + 1)
                    setShowBurst(true)
                    setTimeout(() => setShowBurst(false), 800)
                    if (currentIndex < questions.length - 1) {
                      setCurrentIndex(currentIndex + 1)
                    }
                  }}
                >
                  I Know This! (+1 Point)
                </Button>
              </div>
              {showBurst && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    {[...Array(8)].map((_, i) => (
                      <Image
                        key={i}
                        src="/honk_point.png"
                        alt="Coin"
                        width={20}
                        height={20}
                        className="absolute animate-bounce"
                        style={{
                          left: `${50 + 40 * Math.cos((i / 8) * 2 * Math.PI)}%`,
                          top: `${50 + 40 * Math.sin((i / 8) * 2 * Math.PI)}%`,
                          transform: "translate(-50%, -50%)",
                          animationDelay: `${i * 80}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="text-center text-sm text-muted-foreground">
                Question {currentIndex + 1} of {questions.length} • Score: {score}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
