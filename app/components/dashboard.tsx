"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "./auth-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LearningHub } from "./learning-hub";
import { GooseCustomization } from "./goose-customization";
import { Achievements } from "./achievements";
import { PortfolioManagement } from "./portfolio-management";
import { DailyChallenges } from "./daily-challenges";
import { Leaderboards } from "./leaderboards";
import { LearningPath } from "./learning-path";
import { Profile } from "./profile";

export function Dashboard() {
  const [currentView, setCurrentView] = useState<
    | "dashboard"
    | "learning"
    | "challenges"
    | "goose"
    | "achievements"
    | "portfolio"
    | "leaderboards"
    | "profile"
  >("dashboard");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const { user, logout } = useAuth();

  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [hasRedeemed14, setHasRedeemed14] = useState(false);

  // Load progress from localStorage and listen for updates from other views
  useEffect(() => {
    if (!user?.id) return;
    try {
      const raw = localStorage.getItem(`honk_progress_${user.id}`);
      if (raw) setProgressMap(JSON.parse(raw));
    } catch {}

    const onUpdate = (e: any) => {
      try {
        if (e?.detail?.userId && e.detail.userId === user.id) {
          // Reload snapshot for simplicity
          const raw = localStorage.getItem(`honk_progress_${user.id}`);
          if (raw) setProgressMap(JSON.parse(raw));
        }
      } catch {}
    };
    if (typeof window !== "undefined")
      window.addEventListener("honk-progress:updated", onUpdate as any);
    return () => {
      if (typeof window !== "undefined")
        window.removeEventListener("honk-progress:updated", onUpdate as any);
    };
  }, [user?.id]);

  // Load streak redemption state
  useEffect(() => {
    if (!user?.id) return;
    try {
      const val = localStorage.getItem(`honk_redeem14_${user.id}`);
      setHasRedeemed14(val === '1');
    } catch {}
  }, [user?.id]);

  const redeemStreakReward = () => {
    if (!user) return;
    if (user.streak < 14 || hasRedeemed14) return;
    try { localStorage.setItem(`honk_redeem14_${user.id}`, '1'); } catch {}
    setHasRedeemed14(true);
  };

  if (!user) return null;

  const getCountryLabel = (country?: string) => {
    switch (country) {
      case "canada":
        return "🇨🇦 Canada";
      case "usa":
        return "🇺🇸 United States";
      case "uk":
        return "🇬🇧 United Kingdom";
      case "eu":
        return "🇪🇺 European Union";
      case "other":
        return "🌍 International";
      default:
        return null;
    }
  };

  const getPortfolioDescription = (type: string) => {
    switch (type) {
      case "conservative":
        return "Conservative Nest Egg - Focus on bonds and stable investments";
      case "balanced":
        return "Balanced Flock - Mix of stocks and bonds for steady growth";
      case "growth":
        return "Growth Gosling - High-growth stocks and ETFs";
      case "dividend":
        return "Dividend Dynasty - Focus on dividend-paying stocks";
      default:
        return "Custom portfolio based on your preferences";
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "learning":
        return <LearningHub selectedModuleId={selectedModuleId ?? undefined} />;
      case "goose":
        return <GooseCustomization />;
      case "achievements":
        return <Achievements />;
      case "portfolio":
        return <PortfolioManagement />;
      case "challenges":
        return <DailyChallenges />;
      case "leaderboards":
        return <Leaderboards />;
      case "profile":
        return <Profile />;
      default:
        return renderDashboard();
    }
  };

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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto p-4 space-y-6">
        {/* Welcome Section + Top-right Stats */}
        <div className="relative py-6">
          <div className="flex items-center gap-4">
            <Image
              src="/goose_waving.png"
              alt="Welcome Goose"
              width={160}
              height={160}
            />
            <div>
              <h2 className="text-2xl font-bold mb-1">
                Welcome back, {user.name}!
              </h2>
              <p className="text-muted-foreground">
                Let's learn and invest with RBC.
              </p>
            </div>
          </div>
          {/* Stats – top right */}
          <div className="absolute top-0 right-0 flex flex-col items-end gap-1">
            <div className="flex items-center gap-4">
              {/* Honk Points (tooltip) */}
              <div className="relative group flex items-center gap-1">
                <Image
                  src="/honk_point.png"
                  alt="Honk Points"
                  width={20}
                  height={20}
                />
                <span className="font-semibold text-sm md:text-base">
                  {user.honkPoints}
                </span>
                {/* Tooltip */}
                <div className="absolute top-full right-0 mt-2 bg-foreground text-background text-xs rounded-md px-3 py-2 shadow-lg border border-border/20 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 w-60">
                  <div className="font-semibold mb-1">Honk Points</div>
                  <p>
                    Earn by completing lessons, daily challenges, and AI
                    courses. Use them to level up and unlock goodies.
                  </p>
                </div>
              </div>
              {/* Golden Eggs (tooltip) */}
              <div className="relative group flex items-center gap-1">
                <Image
                  src="/golden_egg.png"
                  alt="Golden Eggs"
                  width={20}
                  height={20}
                />
                <span className="font-semibold text-sm md:text-base">
                  {user.goldenEggs}
                </span>
                <div className="absolute top-full right-0 mt-2 bg-foreground text-background text-xs rounded-md px-3 py-2 shadow-lg border border-border/20 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 w-60">
                  <div className="font-semibold mb-1">Golden Eggs</div>
                  <p>
                    Premium rewards for streaks and high scores. Spend on rare
                    accessories and special perks.
                  </p>
                </div>
              </div>
              {/* Streak (tooltip) */}
              <div className="relative group flex items-center gap-1">
                <Image src="/streak.png" alt="Streak" width={20} height={20} />
                <span className="font-semibold text-sm md:text-base">
                  {user.streak} days
                </span>
                <div className="absolute top-full right-0 mt-2 bg-foreground text-background text-xs rounded-md px-3 py-2 shadow-lg border border-border/20 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 w-60">
                  <div className="font-semibold mb-1">Learning Streak</div>
                  <p>
                    Complete something each day to keep your streak and earn
                    bonus points and eggs.
                  </p>
                </div>
              </div>
              {/* Level (tooltip) */}
              <div className="relative group flex items-center gap-1">
                <Image src="/level.png" alt="Level" width={20} height={20} />
                <span className="font-semibold text-sm md:text-base">
                  {user.level}
                </span>
                <div className="absolute top-full right-0 mt-2 bg-foreground text-background text-xs rounded-md px-3 py-2 shadow-lg border border-border/20 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 w-60">
                  <div className="font-semibold mb-1">Level</div>
                  <p>
                    Levels increase with Honk Points. Higher levels unlock more
                    content and badges.
                  </p>
                </div>
              </div>
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">
              {user.experienceLevel.charAt(0).toUpperCase() +
                user.experienceLevel.slice(1)}{" "}
              •{" "}
              {user.riskTolerance.charAt(0).toUpperCase() +
                user.riskTolerance.slice(1)}{" "}
              Risk
              {getCountryLabel(user.country)
                ? ` • ${getCountryLabel(user.country)}`
                : ""}
            </div>
          </div>
        </div>

        {/* Recommended (powered by Gemini) */}
        <Card className="relative overflow-hidden bg-card/90 backdrop-blur-sm border border-foreground/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recommended
            </CardTitle>
            <CardDescription>
              Three quick picks tailored to you, by us.
            </CardDescription>
            {/* Powered by Gemini (mini-course generation) */}
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-full border border-border">
                <span className="text-sm text-muted-foreground font-medium">powered by</span>
                <Image
                  src="/gemini_logo.png"
                  alt="Gemini"
                  width={64}
                  height={64}
                  className="inline-block object-contain"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              // 1) Mini-course topic
              const courseTopics: string[] = [];
              switch (user.country) {
                case "canada":
                  courseTopics.push("TFSA vs RRSP: choose the right account");
                  break;
                case "usa":
                  courseTopics.push("401(k) vs IRA: tax‑smart investing");
                  break;
                case "uk":
                  courseTopics.push("ISA & SIPP: tax shelters explained");
                  break;
                case "eu":
                  courseTopics.push("UCITS ETFs: a practical guide");
                  break;
                default:
                  courseTopics.push("Global index funds 101");
              }
              if (user.experienceLevel === "beginner")
                courseTopics.push("Start with $100: DCA basics");
              if (user.experienceLevel === "intermediate")
                courseTopics.push("Asset allocation & rebalancing");
              if (user.experienceLevel === "advanced")
                courseTopics.push(
                  "Factor investing (value, quality, momentum)"
                );
              const miniCourse = Array.from(new Set(courseTopics))[0];

              // 2) Article (region‑aware) — safe defaults
              let article = {
                title: "What Is an ETF?",
                url: "https://www.investopedia.com/terms/e/etf.asp",
              };
              if (user.country === "canada")
                article = {
                  title: "TFSA basics",
                  url: "https://www.investopedia.com/terms/t/tfsa.asp",
                };
              else if (user.country === "usa")
                article = {
                  title: "IRA vs 401(k)",
                  url: "https://www.investopedia.com/ask/answers/102814/what-difference-between-401k-plan-and-ira.asp",
                };
              else if (user.country === "uk")
                article = {
                  title: "What is a SIPP?",
                  url: "https://www.investopedia.com/terms/s/self-invested-personal-pension-sipp.asp",
                };
              else if (user.country === "eu")
                article = {
                  title: "UCITS ETF overview",
                  url: "https://www.investopedia.com/terms/u/ucits.asp",
                };

              // 3) Fun fact (with source link)
              const factPool: { title: string; url: string }[] = [
                {
                  title:
                    "The first index fund for retail investors launched in 1976 (Vanguard 500).",
                  url: "https://www.investopedia.com/terms/i/indexfund.asp",
                },
                {
                  title:
                    "Dollar‑cost averaging can reduce timing risk by spreading buys over time.",
                  url: "https://www.investopedia.com/terms/d/dollarcostaveraging.asp",
                },
                {
                  title:
                    "Dividends have historically contributed a large share of total stock returns.",
                  url: "https://www.investopedia.com/terms/t/total_return.asp",
                },
              ];
              if (user.country === "canada")
                factPool.unshift({
                  title:
                    "Canada’s TFSA allows tax‑free growth and withdrawals for life.",
                  url: "https://www.investopedia.com/terms/t/tfsa.asp",
                });
              if (user.country === "usa")
                factPool.unshift({
                  title:
                    "Roth IRA withdrawals in retirement are tax‑free if rules are followed.",
                  url: "https://www.investopedia.com/terms/r/rothira.asp",
                });
              const funFact = factPool[0];

              const goToTopic = (topic: string) => {
                try {
                  localStorage.setItem("honk_pending_topic", topic);
                } catch {}
                setCurrentView("learning");
              };

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Mini‑course (Gemini)</div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-28"
                      onClick={() => goToTopic(miniCourse)}
                    >
                      Generate
                    </Button>
                  </div>
                  <div className="text-sm font-medium">{miniCourse}</div>
                  <div className="h-px bg-border" />

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Reading</div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-28"
                      asChild
                    >
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open
                      </a>
                    </Button>
                  </div>
                  <div className="text-sm font-medium">{article.title}</div>
                  <div className="h-px bg-border" />

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Fun fact</div>
                    <Button size="sm" variant="outline" className="w-28" asChild>
                      <a href={funFact.url} target="_blank" rel="noopener noreferrer">Source</a>
                    </Button>
                  </div>
                  <div className="text-sm font-medium">{funFact.title}</div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Learning Path */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Your Learning Journey</h2>
          <LearningPath
            onStartLesson={(moduleId) => {
              setSelectedModuleId(moduleId);
              setCurrentView("learning");
            }}
          />
        </div>

        {/* Streak Rewards Section */}
        <Card className="bg-card/90 backdrop-blur-sm border border-foreground/20">
          <CardHeader>
            <CardTitle>Streak Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Current streak</div>
                <div className="text-sm font-semibold flex items-center gap-1">
                  <span role="img" aria-label="fire">🔥</span>
                  {user.streak} days
                </div>
              </div>
              <Progress value={Math.min(100, (user.streak / 14) * 100)} className="h-2" />
              <div className="relative flex items-start gap-4">
                <Image src="/giftcard.png" alt="Tim Hortons $15 Gift Card" width={96} height={64} className="rounded-md border" />
                <div className="flex-1">
                  <div className="font-medium">14‑Day Reward: Tim Hortons $15 Gift Card</div>
                  <p className="text-sm text-muted-foreground">Keep a 14‑day learning streak to redeem a $15 Tim Hortons gift card.</p>
                </div>
                {/* Right-aligned action area */}
                <div className="absolute top-0 right-0 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {user.streak < 14 ? `${14 - user.streak} days to go` : hasRedeemed14 ? 'Enjoy your coffee!' : 'Ready to claim'}
                  </span>
                  <Button size="sm" onClick={redeemStreakReward} disabled={user.streak < 14 || hasRedeemed14}>
                    {hasRedeemed14 ? 'Redeemed' : (user.streak >= 14 ? 'Redeem' : 'Locked')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primary Action Cards - Portfolio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            role="button"
            tabIndex={0}
            aria-label="Open Learning Hub"
            className="cursor-pointer bg-card/90 backdrop-blur-sm border border-foreground/20 flex flex-col"
            onClick={() => setCurrentView("learning")}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('learning');
              }
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 m-0">
                📚 Learning Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                Explore all lessons
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-transparent">
                View All Modules
              </Button>
            </CardFooter>
          </Card>

          <Card
            role="button"
            tabIndex={0}
            aria-label="Open Portfolio"
            className="relative cursor-pointer bg-card/90 backdrop-blur-sm border border-foreground/20 flex flex-col"
            onClick={() => setCurrentView("portfolio")}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('portfolio');
              }
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 m-0">
                📊 Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                Manage your investments
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-transparent">
                View Portfolio
              </Button>
            </CardFooter>
            <Image
              src="/rbc.png"
              alt="RBC"
              width={88}
              height={44}
              className="absolute top-3 right-3"
            />
          </Card>
        </div>

        {/* Investment Portfolio card removed per request */}

        {/* Progress Section */}
        <Card className="bg-card/90 backdrop-blur-sm border border-foreground/20">
          <CardHeader>
            <CardTitle>Module Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: "investment-basics", label: "Investment Basics" },
                { id: "canadian-accounts", label: "Canadian Tax Accounts" },
                { id: "etf-essentials", label: "ETF Essentials" },
              ].map(({ id, label }) => {
                const p = Math.min(100, Math.max(0, progressMap[id] ?? 0));
                const canOpen = !Number.isNaN(p);
                return (
                  <div key={id} className="group">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">{label}</span>
                      <div className="flex items-center gap-3">
                        <span>{p}%</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedModuleId(id);
                            setCurrentView("learning");
                          }}
                          disabled={!canOpen}
                        >
                          {p > 0 && p < 100
                            ? "Resume"
                            : p >= 100
                            ? "Review"
                            : "Start"}
                        </Button>
                      </div>
                    </div>
                    <Progress value={p} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            role="button"
            tabIndex={0}
            aria-label="Open Daily Challenge"
            className="cursor-pointer bg-card/90 backdrop-blur-sm border border-foreground/20 flex flex-col"
            onClick={() => setCurrentView("challenges")}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('challenges');
              }
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Daily Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                Test your knowledge
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-transparent">
                Take Challenge
              </Button>
            </CardFooter>
          </Card>

          <Card
            role="button"
            tabIndex={0}
            aria-label="Customize Goose"
            className="cursor-pointer bg-card/90 backdrop-blur-sm border border-foreground/20 flex flex-col"
            onClick={() => setCurrentView("goose")}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('goose');
              }
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🪿 Customize Goose
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                Personalize your companion
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-transparent">
                Customize
              </Button>
            </CardFooter>
          </Card>

          <Card
            role="button"
            tabIndex={0}
            aria-label="View Achievements"
            className="cursor-pointer bg-card/90 backdrop-blur-sm border border-foreground/20 flex flex-col"
            onClick={() => setCurrentView("achievements")}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('achievements');
              }
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏆 Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                Track your progress
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-transparent">
                View All
              </Button>
            </CardFooter>
          </Card>

          <Card
            role="button"
            tabIndex={0}
            aria-label="Open Leaderboard"
            className="cursor-pointer bg-card/90 backdrop-blur-sm border border-foreground/20 flex flex-col"
            onClick={() => setCurrentView("leaderboards")}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('leaderboards');
              }
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👥 Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">See how you rank</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-transparent">
                View Rankings
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Footer */}
        <footer className="py-6 space-y-2">
          <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <Image
              src="/techrbc.png"
              alt="Tech@RBC"
              width={80}
              height={30}
              className="opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Made with 💙 in Waterloo, Ontario, Canada 🇨🇦 at Hack The North 2025
          </div>
        </footer>
      </div>
    </main>
  );

  if (currentView !== "dashboard") {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="relative z-10 bg-card/95 backdrop-blur-sm border-b border-border py-2 px-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto h-14 gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setCurrentView("dashboard")}
                size="sm"
                className="p-1.5"
              >
                ← Back
              </Button>
              <div className="h-6 ml-2 md:ml-3">
                <Image
                  src="/honkonomics_logo.svg"
                  alt="Honkonomics"
                  width={72}
                  height={72}
                  className="h-full w-auto"
                />
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => setCurrentView("profile")}
              size="icon"
              className="rounded-full p-0 mr-2 md:mr-3"
              aria-label="Open profile"
            >
              <Image
                src="/goose_pfp.png"
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full"
              />
            </Button>
          </div>
        </header>
        {renderCurrentView()}
        {/* Footer */}
        <footer className="py-6 space-y-2">
          <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <Image
              src="/techrbc.png"
              alt="Tech@RBC"
              width={80}
              height={30}
              className="opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Made with 💙 in Waterloo, Ontario, Canada 🇨🇦 at Hack The North 2025
          </div>
        </footer>
      </div>
    );
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/70" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-card/95 backdrop-blur-sm border-b border-border py-2 px-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto h-14 gap-4">
          {/* Logo */}
          <div className="h-6 ml-2 md:ml-3">
            <Image
              src="/honkonomics_logo.svg"
              alt="Honkonomics"
              width={72}
              height={72}
              className="h-full w-auto"
            />
          </div>

          <Button
            variant="ghost"
            onClick={() => setCurrentView("profile")}
            size="icon"
            className="rounded-full p-0 mr-2 md:mr-3"
            aria-label="Open profile"
          >
            <Image
              src="/goose_pfp.png"
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full"
            />
          </Button>
        </div>
      </header>

      {renderDashboard()}
    </div>
  );
}
