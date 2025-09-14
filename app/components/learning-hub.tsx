"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LearningModule } from "./learning-module";
import { DynamicCoursePlayer } from "./dynamic-course";
import type { MiniCourse, ExperienceLevel } from "@/types/mini-course";
import {
  loadAICourses,
  upsertAICourse,
  removeAICourse,
  type SavedAICourse,
} from "@/lib/ai-courses";
import { useAuth } from "./auth-provider";

interface ModuleInfo {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  progress: number;
  locked: boolean;
  pointsReward: number;
  estimatedTime: string;
}

const modules: ModuleInfo[] = [
  {
    id: "investment-basics",
    title: "Investment Basics 101",
    description:
      "Learn the fundamentals of investing, types of assets, and basic principles",
    difficulty: "beginner",
    progress: 0,
    locked: false,
    pointsReward: 50,
    estimatedTime: "15 min",
  },
  {
    id: "trading-fundamentals",
    title: "Trading Fundamentals 🦆",
    description:
      "Master buy/sell orders, market vs limit orders, and timing strategies",
    difficulty: "beginner",
    progress: 0,
    locked: false,
    pointsReward: 60,
    estimatedTime: "18 min",
  },
  {
    id: "stock-market-basics",
    title: "Stock Market Safari 🦢",
    description:
      "Navigate exchanges, tickers, market caps, and how stocks really work",
    difficulty: "beginner",
    progress: 0,
    locked: false,
    pointsReward: 55,
    estimatedTime: "16 min",
  },
  {
    id: "canadian-accounts",
    title: "Canadian Tax Accounts",
    description:
      "Master TFSA, RRSP, RESP, and FHSA for tax-efficient investing",
    difficulty: "beginner",
    progress: 0,
    locked: true,
    pointsReward: 75,
    estimatedTime: "20 min",
  },
  {
    id: "portfolio-management",
    title: "Portfolio Builder Pro 🪿",
    description:
      "Diversification, asset allocation, and building your ideal portfolio",
    difficulty: "intermediate",
    progress: 0,
    locked: false,
    pointsReward: 70,
    estimatedTime: "22 min",
  },
  {
    id: "risk-rewards",
    title: "Risk & Rewards Balance",
    description:
      "Understanding volatility, risk tolerance, and expected returns",
    difficulty: "intermediate",
    progress: 0,
    locked: false,
    pointsReward: 65,
    estimatedTime: "19 min",
  },
  {
    id: "etf-essentials",
    title: "ETF Essentials",
    description: "Everything you need to know about Exchange-Traded Funds",
    difficulty: "intermediate",
    progress: 0,
    locked: true,
    pointsReward: 60,
    estimatedTime: "18 min",
  },
  {
    id: "market-psychology",
    title: "Market Psychology",
    description:
      "Understand behavioral finance and avoid common investing mistakes",
    difficulty: "intermediate",
    progress: 0,
    locked: true,
    pointsReward: 80,
    estimatedTime: "25 min",
  },
  {
    id: "crypto-basics",
    title: "Crypto 101 🪙",
    description:
      "Bitcoin, blockchain, wallets, and the digital asset revolution",
    difficulty: "intermediate",
    progress: 0,
    locked: false,
    pointsReward: 85,
    estimatedTime: "24 min",
  },
  {
    id: "technical-analysis",
    title: "Chart Reading Master 📊",
    description:
      "Candlesticks, trends, support/resistance, and technical indicators",
    difficulty: "advanced",
    progress: 0,
    locked: false,
    pointsReward: 90,
    estimatedTime: "28 min",
  },
  {
    id: "options-derivatives",
    title: "Options & Derivatives",
    description: "Advanced strategies for experienced investors",
    difficulty: "advanced",
    progress: 0,
    locked: true,
    pointsReward: 100,
    estimatedTime: "30 min",
  },
  {
    id: "day-trading",
    title: "Day Trading Dojo 🥋",
    description: "High-frequency strategies, scalping, and intraday techniques",
    difficulty: "advanced",
    progress: 0,
    locked: false,
    pointsReward: 95,
    estimatedTime: "26 min",
  },
];

export function LearningHub({
  selectedModuleId,
}: {
  selectedModuleId?: string;
}) {
  const [selectedModule, setSelectedModule] = useState<string | null>(
    selectedModuleId ?? null
  );
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [generatedCourse, setGeneratedCourse] = useState<MiniCourse | null>(
    null
  );
  const [levelOverride, setLevelOverride] = useState<"auto" | ExperienceLevel>(
    "auto"
  );
  const [playingDynamic, setPlayingDynamic] = useState(false);
  const [savedCourses, setSavedCourses] = useState<SavedAICourse[]>([]);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [isGenCollapsed, setIsGenCollapsed] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<
    "all" | "beginner" | "intermediate" | "advanced"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "inprogress" | "locked"
  >("all");
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "progress" | "duration">(
    "default"
  );
  const [progressVersion, setProgressVersion] = useState(0);
  const { user } = useAuth();

  // Sync selection when invoked from Learning Path
  useEffect(() => {
    if (!selectedModuleId) return;
    if (selectedModuleId.startsWith("ai:")) {
      if (!user?.id) return;
      const all = loadAICourses(user.id);
      const found = all.find((c) => c.id === selectedModuleId);
      if (found) {
        setGeneratedCourse(found.course);
        setPlayingDynamic(true);
        setCurrentCourseId(selectedModuleId);
      }
    } else {
      setSelectedModule(selectedModuleId);
    }
  }, [selectedModuleId, user?.id]);

  // Load saved progress for current user
  useEffect(() => {
    if (!user?.id) return;
    try {
      const raw = localStorage.getItem(`honk_progress_${user.id}`);
      if (raw) setProgressMap(JSON.parse(raw));
    } catch {}
    setSavedCourses(loadAICourses(user.id));
  }, [user?.id]);

  // If dashboard queued a mini-course topic, auto-trigger generation once
  useEffect(() => {
    try {
      const pending = localStorage.getItem("honk_pending_topic");
      if (pending && pending.trim()) {
        setSearchQuery(pending);
        triggerGenerate(pending);
        localStorage.removeItem("honk_pending_topic");
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for AI progress updates to refresh resume labels
  useEffect(() => {
    const handler = (e: any) => {
      try {
        if (e?.detail?.userId && user?.id && e.detail.userId === user.id) {
          setProgressVersion((v) => v + 1);
        }
      } catch {}
    };
    if (typeof window !== "undefined") {
      window.addEventListener("ai-progress:updated", handler as any);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("ai-progress:updated", handler as any);
      }
    };
  }, [user?.id]);

  const saveProgress = (moduleId: string, percent: number) => {
    if (!user?.id) return;
    setProgressMap((prev) => {
      const next = {
        ...prev,
        [moduleId]: Math.max(prev[moduleId] || 0, percent),
      };
      localStorage.setItem(`honk_progress_${user.id}`, JSON.stringify(next));
      return next;
    });
  };

  const triggerGenerate = async (topicOverride?: string) => {
    const topic = (topicOverride ?? searchQuery).trim();
    if (!topic || isGenerating) return;
    setIsGenerating(true);
    setGenError(null);
    setGeneratedCourse(null);
    setCurrentCourseId(null);
    try {
      const fallbackLevel = (user?.experienceLevel ??
        "beginner") as ExperienceLevel;
      const level: ExperienceLevel =
        levelOverride === "auto" ? fallbackLevel : levelOverride;
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as MiniCourse;
      setGeneratedCourse(data);
      // set stable id for progress/saving
      const id = `ai:${slugify(data.topic || data.title)}`;
      setCurrentCourseId(id);
    } catch (e: any) {
      setGenError(String(e?.message || e));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModuleComplete = () => {
    setSelectedModule(null);
    // In a real app, we'd update the module progress here
  };

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const dynamicId = generatedCourse
    ? `ai:${slugify(generatedCourse.topic || generatedCourse.title)}`
    : undefined;
  const genId = currentCourseId ?? dynamicId;
  const isGenSaved = !!(genId && savedCourses.some((c) => c.id === genId));
  const getSavedIndex = (id: string): number => {
    if (!user?.id) return 0;
    try {
      const raw = localStorage.getItem(`honk_index_${user.id}_${id}`);
      const n = raw ? parseInt(raw, 10) : NaN;
      return Number.isNaN(n) ? 0 : n;
    } catch {
      return 0;
    }
  };
  const genSavedIndex = genId ? getSavedIndex(genId) : 0;

  const addToLearningPath = () => {
    if (!user?.id || !generatedCourse || !genId) return;
    const item: SavedAICourse = {
      id: genId,
      course: generatedCourse,
      createdAt: Date.now(),
    };
    upsertAICourse(user.id, item);
    setSavedCourses(loadAICourses(user.id));
    setSaveMsg("Added to your learning path");
    setTimeout(() => setSaveMsg(null), 2000);
    try {
      if (typeof window !== "undefined")
        window.dispatchEvent(
          new CustomEvent("ai-courses:updated", { detail: { userId: user.id } })
        );
    } catch {}
  };

  const removeFromLearningPath = (id: string) => {
    if (!user?.id) return;
    removeAICourse(user.id, id);
    setSavedCourses(loadAICourses(user.id));
    // also remove progress entry
    setProgressMap((prev) => {
      const { [id]: _drop, ...rest } = prev;
      try {
        localStorage.setItem(`honk_progress_${user.id}`, JSON.stringify(rest));
      } catch {}
      return rest;
    });
    try {
      if (typeof window !== "undefined")
        window.dispatchEvent(
          new CustomEvent("ai-courses:updated", { detail: { userId: user.id } })
        );
    } catch {}
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Compute sequential unlocking for built-in modules
  const computedModules = modules.map((m) => ({ ...m }));
  let prevCompleted = true;
  for (let i = 0; i < computedModules.length; i++) {
    const m = computedModules[i];
    const p = progressMap[m.id] ?? m.progress;
    m.progress = p;
    const completed = p >= 100;
    const locked = i === 0 ? false : !prevCompleted;
    m.locked = locked;
    prevCompleted = completed;
  }

  // Filter modules by difficulty and status
  let filteredModules = computedModules.filter((m) => {
    if (difficultyFilter !== "all" && m.difficulty !== difficultyFilter)
      return false;
    const p = m.progress ?? 0;
    if (statusFilter === "completed" && p < 100) return false;
    if (statusFilter === "inprogress" && !(p > 0 && p < 100)) return false;
    if (statusFilter === "locked" && !m.locked) return false;
    return true;
  });

  // Sorting
  if (sortBy === "progress") {
    filteredModules = [...filteredModules].sort(
      (a, b) => (b.progress ?? 0) - (a.progress ?? 0)
    );
  } else if (sortBy === "duration") {
    const toMinutes = (s: string) => {
      const n = parseInt(String(s).replace(/[^0-9]/g, ""), 10);
      return Number.isFinite(n) ? n : 0;
    };
    filteredModules = [...filteredModules].sort(
      (a, b) => toMinutes(a.estimatedTime) - toMinutes(b.estimatedTime)
    );
  }

  const unlockedCount = computedModules.filter((m) => !m.locked).length;
  const completedCount = computedModules.filter(
    (m) => (m.progress ?? 0) >= 100
  ).length;

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/secondarybackground.png"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/70" />
      </div>

      <div className="relative z-10">
        {playingDynamic && generatedCourse && genId ? (
          <DynamicCoursePlayer
            id={genId}
            course={generatedCourse}
            onExit={() => setPlayingDynamic(false)}
            onComplete={() => {
              setPlayingDynamic(false);
              if (genId) saveProgress(genId, 100);
            }}
            onProgress={(pct) => genId && saveProgress(genId, pct)}
          />
        ) : selectedModule ? (
          <LearningModule
            moduleId={selectedModule}
            onComplete={handleModuleComplete}
            onProgress={(pct) => saveProgress(selectedModule, pct)}
          />
        ) : (
          <div className="max-w-5xl mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="text-center py-8">
              <div className="mb-4 flex justify-center">
                <Image
                  src="/goose_study.png"
                  alt="Studying Goose"
                  width={120}
                  height={120}
                />
              </div>
              <h1 className="text-3xl font-bold mb-2">Learning Hub</h1>
              <p className="text-muted-foreground">
                Master investing one lesson at a time
              </p>
            </div>

            {/* AI Search Section */}
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-sky-300 via-blue-400 to-sky-300 animate-gradient-shift">
              <Card className="bg-card/95 backdrop-blur-sm rounded-2xl border border-foreground/20">
                <CardContent className="p-6 relative">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="flex-1 space-y-4 w-full">
                      <div>
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                          What do you want to learn?
                          <span className="text-2xl">🔍</span>
                        </h2>
                        <p className="text-base text-muted-foreground">
                          Anything about investing, markets, or personal
                          finance, we'll create a personalized mini-course
                          uniquely tailored to you.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label htmlFor="learning-search" className="sr-only">
                          Search learning topics
                        </Label>
                        <Input
                          id="learning-search"
                          placeholder="e.g., How do I start investing with $100?"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => setIsSearchFocused(true)}
                          onBlur={() => setIsSearchFocused(false)}
                          className="flex-1 h-10 rounded-lg text-base border border-foreground/20 shadow-none focus-visible:ring-1 focus-visible:ring-primary/40"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && searchQuery.trim()) {
                              triggerGenerate();
                            }
                          }}
                        />
                        <Button
                          className="px-5 h-10 rounded-xl"
                          variant="brand"
                          onClick={() => triggerGenerate()}
                          disabled={!searchQuery.trim() || isGenerating}
                        >
                          {isGenerating ? "Generating..." : "Explore"}
                        </Button>
                      </div>
                      {/* Level selector */}
                      <div className="flex flex-wrap items-center gap-2 text-sm mt-2">
                        <span className="text-muted-foreground">Level:</span>
                        {(
                          [
                            { key: "auto", label: "Auto" },
                            { key: "beginner", label: "Beginner" },
                            { key: "intermediate", label: "Intermediate" },
                            { key: "advanced", label: "Advanced" },
                          ] as const
                        ).map((opt) => (
                          <Button
                            key={opt.key}
                            type="button"
                            size="sm"
                            variant={
                              levelOverride === opt.key ? "brand" : "outline"
                            }
                            className="rounded-full px-3"
                            onClick={() => setLevelOverride(opt.key as any)}
                            aria-pressed={levelOverride === opt.key}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                      {levelOverride === "auto" && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Auto uses your profile level:{" "}
                          <span className="capitalize">
                            {user?.experienceLevel ?? "beginner"}
                          </span>
                        </div>
                      )}

                      {/* Prompt suggestions */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {[
                          "ETFs for beginners",
                          "Investing $100 to start",
                          "Dollar-cost averaging",
                          "Risk tolerance basics",
                        ].map((s) => (
                          <Button
                            key={s}
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => {
                              setSearchQuery(s);
                              triggerGenerate(s);
                            }}
                            disabled={isGenerating}
                          >
                            {s}
                          </Button>
                        ))}
                      </div>
                      {genError && (
                        <div className="text-sm text-red-600 mt-2">
                          {genError}
                        </div>
                      )}
                      {isGenerating && (
                        <div className="mt-3 text-sm text-muted-foreground">
                          🧠 Honk is preparing your mini-course...
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Powered by Gemini - top right */}
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full border border-border">
                      <span className="text-sm text-muted-foreground font-medium">
                        powered by
                      </span>
                      <Image
                        src="/gemini_logo.png"
                        alt="Gemini"
                        width={48}
                        height={48}
                        className="inline-block"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generated Mini-Course */}
            {generatedCourse && (
              <Card className="bg-card/95 backdrop-blur-sm border border-foreground/20">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">
                        {generatedCourse.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {generatedCourse.overview}
                      </CardDescription>
                    </div>
                    <div className="text-right text-sm text-muted-foreground min-w-[240px] space-y-1">
                      <div>⏱️ {generatedCourse.estimatedDuration}</div>
                      <div className="capitalize">
                        Level: {generatedCourse.level}
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        {genId && (
                          <Button
                            size="sm"
                            onClick={() => setPlayingDynamic(true)}
                          >
                            {progressMap[genId]
                              ? `Resume · Lesson ${Math.max(
                                  1,
                                  genSavedIndex + 1
                                )}`
                              : "Start"}{" "}
                            Interactive
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsGenCollapsed((v) => !v)}
                        >
                          {isGenCollapsed ? "Expand" : "Collapse"}
                        </Button>
                      </div>
                      {genId && (
                        <div className="pt-1">
                          <Button
                            size="sm"
                            variant={isGenSaved ? "secondary" : "outline"}
                            onClick={
                              !isGenSaved ? addToLearningPath : undefined
                            }
                            disabled={isGenSaved}
                          >
                            {isGenSaved ? "Saved ✓" : "Add to Learning Path"}
                          </Button>
                        </div>
                      )}
                      {saveMsg && (
                        <div className="text-xs text-green-700 mt-1">
                          {saveMsg}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {!isGenCollapsed && (
                  <CardContent className="space-y-4">
                    {generatedCourse.prerequisites?.length > 0 && (
                      <div>
                        <div className="font-medium mb-1">Prerequisites</div>
                        <ul className="list-disc pl-5 text-sm text-muted-foreground">
                          {generatedCourse.prerequisites.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="font-semibold">Lessons</div>
                      {generatedCourse.lessons.map((lesson, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-border p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-medium">{lesson.title}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {lesson.summary}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ⏱️ {lesson.durationMinutes} min
                            </div>
                          </div>
                          {lesson.objectives?.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm font-medium">
                                Objectives
                              </div>
                              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                {lesson.objectives.map((o, i) => (
                                  <li key={i}>{o}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {lesson.outline?.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm font-medium">Outline</div>
                              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                {lesson.outline.map((o, i) => (
                                  <li key={i}>{o}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {lesson.activity && (
                            <div className="mt-3 text-sm">
                              <span className="font-medium">Activity: </span>
                              <span className="text-muted-foreground">
                                {lesson.activity}
                              </span>
                            </div>
                          )}
                          {lesson.quiz && (
                            <div className="mt-3 text-sm">
                              <div className="font-medium">Quick Quiz</div>
                              <div className="text-muted-foreground mt-1">
                                {lesson.quiz.question}
                              </div>
                              <ul className="list-disc pl-5 text-sm text-muted-foreground mt-1">
                                {lesson.quiz.options.map((opt, i) => (
                                  <li
                                    key={i}
                                    className={
                                      i === lesson.quiz!.answerIndex
                                        ? "font-medium"
                                        : ""
                                    }
                                  >
                                    {i === lesson.quiz!.answerIndex
                                      ? "✅ "
                                      : ""}
                                    {opt}
                                  </li>
                                ))}
                              </ul>
                              <div className="text-xs text-muted-foreground mt-1">
                                {lesson.quiz.explanation}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {generatedCourse.resources?.length > 0 && (
                      <div>
                        <div className="font-medium mb-1">Resources</div>
                        <ul className="list-disc pl-5 text-sm text-muted-foreground">
                          {generatedCourse.resources.map((r, i) => (
                            <li key={i}>
                              <a
                                className="underline"
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {r.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )}

            {/* User Progress Overview */}
            <Card className="bg-card/95 backdrop-blur-sm border border-foreground/20">
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>
                  Keep learning to earn more Honk Points and unlock new modules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {user?.honkPoints || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Honk Points
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {user?.level || 1}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current Level
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {completedCount}/{computedModules.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Modules Completed
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {unlockedCount}/{computedModules.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Available Modules
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Modules */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Learning Modules</h2>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground">
                  Difficulty:
                </span>
                {["all", "beginner", "intermediate", "advanced"].map((d) => (
                  <Button
                    key={d}
                    size="sm"
                    variant={difficultyFilter === d ? "brand" : "outline"}
                    className="rounded-full px-3"
                    onClick={() => setDifficultyFilter(d as any)}
                  >
                    {d}
                  </Button>
                ))}
                <span className="ml-4 text-sm text-muted-foreground">
                  Status:
                </span>
                {[
                  { k: "all", l: "All" },
                  { k: "completed", l: "Completed" },
                  { k: "inprogress", l: "In Progress" },
                  { k: "locked", l: "Locked" },
                ].map(({ k, l }) => (
                  <Button
                    key={k}
                    size="sm"
                    variant={statusFilter === (k as any) ? "brand" : "outline"}
                    className="rounded-full px-3"
                    onClick={() => setStatusFilter(k as any)}
                  >
                    {l}
                  </Button>
                ))}
                <span className="ml-4 text-sm text-muted-foreground">
                  Sort:
                </span>
                {[
                  { k: "default", l: "Default" },
                  { k: "progress", l: "Progress" },
                  { k: "duration", l: "Duration" },
                ].map(({ k, l }) => (
                  <Button
                    key={k}
                    size="sm"
                    variant={sortBy === (k as any) ? "brand" : "outline"}
                    className="rounded-full px-3"
                    onClick={() => setSortBy(k as any)}
                  >
                    {l}
                  </Button>
                ))}
              </div>
              <div className="grid gap-4">
                {filteredModules.map((module) => {
                  const p = module.progress ?? 0;
                  return (
                    <Card
                      key={module.id}
                      className={`transition-all bg-card/95 backdrop-blur-sm border border-foreground/20 flex flex-col ${
                        module.locked
                          ? "opacity-60 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">
                                {module.title}
                              </CardTitle>
                              <Badge
                                className={getDifficultyColor(
                                  module.difficulty
                                )}
                              >
                                {module.difficulty}
                              </Badge>
                              {module.locked && (
                                <Badge variant="secondary">🔒 Locked</Badge>
                              )}
                            </div>
                            <CardDescription className="mb-3">
                              {module.description}
                            </CardDescription>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>⏱️ {module.estimatedTime}</span>
                              <span className="flex items-center gap-1">
                                <Image
                                  src="/honk_point.png"
                                  alt="Points"
                                  width={16}
                                  height={16}
                                />
                                {module.pointsReward} points
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{p}%</span>
                          </div>
                          <Progress value={p} className="h-2" />
                        </div>
                      </CardContent>
                      <CardFooter className="justify-end">
                        <Button
                          onClick={() =>
                            !module.locked && setSelectedModule(module.id)
                          }
                          disabled={module.locked}
                          variant={p > 0 ? "default" : "outline"}
                        >
                          {p > 0 ? "Continue" : "Start Module"}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Your AI Courses */}
            {savedCourses.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Your AI Courses</h2>
                <div className="grid gap-4">
                  {savedCourses.map((sc) => {
                    const p = progressMap[sc.id] ?? 0;
                    return (
                      <Card
                        key={sc.id}
                        className="transition-all bg-card/95 backdrop-blur-sm border border-foreground/20 flex flex-col"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg">
                                  {sc.course.title}
                                </CardTitle>
                                <Badge
                                  className={getDifficultyColor(
                                    sc.course.level
                                  )}
                                >
                                  {sc.course.level}
                                </Badge>
                              </div>
                              <CardDescription className="mb-3">
                                {sc.course.overview}
                              </CardDescription>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>⏱️ {sc.course.estimatedDuration}</span>
                                <span className="flex items-center gap-1">
                                  <Image
                                    src="/honk_point.png"
                                    alt="Points"
                                    width={16}
                                    height={16}
                                  />
                                  {Math.max(20, sc.course.lessons.length * 10)}{" "}
                                  points
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 min-w-[140px]">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setGeneratedCourse(sc.course);
                                  setCurrentCourseId(sc.id);
                                  setPlayingDynamic(true);
                                }}
                              >
                                {(p ?? 0) > 0
                                  ? `Resume · Lesson ${Math.max(
                                      1,
                                      getSavedIndex(sc.id) + 1
                                    )}`
                                  : "Start"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromLearningPath(sc.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{p}%</span>
                            </div>
                            <Progress value={p} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Coming Soon */}
            <Card className="border-dashed bg-card/95 backdrop-blur-sm border border-foreground/20">
              <CardContent className="text-center py-8">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-lg font-medium mb-2">
                  More Modules Coming Soon!
                </h3>
                <p className="text-muted-foreground">
                  We're working on advanced topics like Real Estate,
                  Cryptocurrency, and International Markets
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
