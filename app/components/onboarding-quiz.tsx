"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SelectCard } from "@/components/ui/select-card";
import { useAuth } from "./auth-provider";

interface QuizOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  subtitle?: string | React.ReactNode;
  type: "single" | "multiple";
  options: QuizOption[];
  gooseImage?: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: "experience",
    question: "What's your experience with investing?",
    subtitle: "We'll customize your learning path based on your level",
    type: "single",
    gooseImage: "/goose_waving.png",
    options: [
      {
        value: "beginner",
        label: "I'm new to investing",
        icon: "📈",
        description: "Complete beginner ready to learn",
      },
      {
        value: "intermediate",
        label: "I know some basics",
        icon: "📊",
        description: "I've read about investing and understand key concepts",
      },
      {
        value: "advanced",
        label: "I'm experienced",
        icon: "🎯",
        description: "I've been actively investing for a while",
      },
    ],
  },
  {
    id: "riskTolerance",
    question: "How do you feel about investment risk?",
    subtitle: "This helps us recommend suitable investment strategies",
    type: "single",
    gooseImage: "/goose_thinking.png",
    options: [
      {
        value: "conservative",
        label: "Conservative",
        icon: "🛡️",
        description: "I prefer safe, steady returns",
      },
      {
        value: "moderate",
        label: "Balanced",
        icon: "⚖️",
        description: "Some risk for better returns",
      },
      {
        value: "aggressive",
        label: "Growth-Focused",
        icon: "🚀",
        description: "High risk for high rewards",
      },
    ],
  },
  {
    id: "timeHorizon",
    question: "When do you plan to use your investments?",
    subtitle: "Your timeline affects investment strategy",
    type: "single",
    gooseImage: "/goose_studying.png",
    options: [
      {
        value: "short",
        label: "Short-term",
        icon: "⏱️",
        description: "Within 2 years",
      },
      {
        value: "medium",
        label: "Medium-term",
        icon: "📅",
        description: "2-10 years",
      },
      {
        value: "long",
        label: "Long-term",
        icon: "🗓️",
        description: "More than 10 years",
      },
    ],
  },
  {
    id: "goals",
    question: "What are your investment goals?",
    subtitle: "Select all that apply to you",
    type: "multiple",
    gooseImage: "/goose_cheering.png",
    options: [
      {
        value: "retirement",
        label: "Retirement",
        icon: "🏖️",
        description: "Planning ahead",
      },
      {
        value: "house",
        label: "Home Purchase",
        icon: "🏠",
        description: "Saving for property",
      },
      {
        value: "education",
        label: "Education",
        icon: "🎓",
        description: "Funding learning",
      },
      {
        value: "wealth",
        label: "Build Wealth",
        icon: "💰",
        description: "Long-term growth",
      },
      {
        value: "income",
        label: "Passive Income",
        icon: "💵",
        description: "Regular returns",
      },
    ],
  },
  {
    id: "canadianFocus",
    question: "Are you interested in Canadian investment topics?",
    subtitle:
      "No matter where you are, we'll customize your experience to teach you what's most relevant",
    type: "single",
    gooseImage: "/goose_atlas.png",
    options: [
      {
        value: "yes",
        label: "Yes, definitely!",
        icon: "🇨🇦",
        description: "TFSA, RRSP, Canadian markets",
      },
      {
        value: "some",
        label: "Mix of both",
        icon: "🌍",
        description: "Canadian and international",
      },
      {
        value: "no",
        label: "International focus",
        icon: "🌐",
        description: "Global markets only",
      },
    ],
  },
  {
    id: "country",
    question: "Where are you located?",
    subtitle: (
      <div className="flex flex-col items-center gap-3">
        <span>This helps us customize your learning curriculum with region-specific content</span>
        <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-full border border-border">
          <span className="text-sm text-muted-foreground">powered by</span>
          <Image src="/gemini_logo.png" alt="Gemini" width={56} height={56} className="inline-block" />
        </div>
      </div>
    ),
    type: "single",
    gooseImage: "/goose_atlas.png",
    options: [
      {
        value: "canada",
        label: "Canada",
        icon: "🇨🇦",
        description: "Canadian tax accounts & markets",
      },
      {
        value: "usa",
        label: "United States",
        icon: "🇺🇸",
        description: "401k, IRA, US markets",
      },
      {
        value: "uk",
        label: "United Kingdom",
        icon: "🇬🇧",
        description: "ISA, SIPP, UK markets",
      },
      {
        value: "eu",
        label: "European Union",
        icon: "🇪🇺",
        description: "EU markets & regulations",
      },
      {
        value: "other",
        label: "Other",
        icon: "🌍",
        description: "International markets",
      },
      {
        value: "skip",
        label: "Skip for now",
        icon: "⏭️",
        description: "I'll set this later",
      },
    ],
  },
];

export function OnboardingQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { updateUser } = useAuth();

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  const handleSingleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

    // Auto-advance for single choice questions after a brief delay
    if (currentQuestion < quizQuestions.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setIsTransitioning(false);
      }, 500);
    }
  };

  const handleMultipleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => {
      const currentAnswers = (prev[questionId] as string[]) || [];
      if (currentAnswers.includes(value)) {
        return {
          ...prev,
          [questionId]: currentAnswers.filter((answer) => answer !== value),
        };
      } else {
        return { ...prev, [questionId]: [...currentAnswers, value] };
      }
    });
  };

  const canProceed = () => {
    const currentQ = quizQuestions[currentQuestion];
    const answer = answers[currentQ.id];
    if (currentQ.type === "single") {
      return !!answer;
    } else {
      return Array.isArray(answer) && answer.length > 0;
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      completeQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const completeQuiz = async () => {
    setIsCompleting(true);

    // Process answers and determine portfolio type
    const riskTolerance = answers.riskTolerance as
      | "conservative"
      | "moderate"
      | "aggressive";
    const experienceLevel = answers.experience as
      | "beginner"
      | "intermediate"
      | "advanced";
    const goals = answers.goals as string[];
    const timeHorizon = answers.timeHorizon as string;
    const country = answers.country as string;

    let portfolioType = "balanced";
    if (riskTolerance === "conservative" || timeHorizon === "short") {
      portfolioType = "conservative";
    } else if (riskTolerance === "aggressive" && timeHorizon === "long") {
      portfolioType = "growth";
    } else if (goals?.includes("income")) {
      portfolioType = "dividend";
    }

    // Update user profile with quiz results
    updateUser({
      riskTolerance,
      experienceLevel,
      investmentGoals: goals || [],
      portfolioType,
      country: country !== "skip" ? country : undefined,
      // Give bonus points for completing onboarding
      honkPoints: 150,
      goldenEggs: 3,
    });

    setIsCompleting(false);
  };

  const currentQ = quizQuestions[currentQuestion];

  // Special handling for Canadian question to show "Recommended" badge
  const isCanadianQuestion = currentQ.id === "canadianFocus";

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex flex-col items-center justify-center p-4">
      {/* Header with Logo */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex items-center justify-center mb-6">
          <Image
            src="/honkonomics_logo.svg"
            alt="Honkonomics"
            width={200}
            height={200}
          />
        </div>

        {/* Progress Bar */}
        <div className="max-w-xl mx-auto">
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`w-full max-w-3xl mx-auto transition-all duration-300 ${
          isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Goose Helper */}
        {currentQ.gooseImage && (
          <div className="flex justify-center mb-4">
            <Image
              src={currentQ.gooseImage}
              alt="Goose Helper"
              width={100}
              height={100}
              className="drop-shadow-md"
            />
          </div>
        )}

        {/* Question */}
        <div className="text-center mb-3">
          <h2 className="text-2xl font-bold text-foreground">
            {currentQ.question}
          </h2>
        </div>

        {currentQ.subtitle && (
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            {currentQ.subtitle}
          </p>
        )}

        {/* Options Grid */}
        <div
          className={`grid gap-4 md:gap-6 lg:gap-8 items-stretch place-items-stretch ${
            currentQ.type === "multiple" && currentQ.options.length === 5
              ? "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
              : "sm:grid-cols-2 md:grid-cols-3"
          }`}
        >
          {currentQ.options.map((option, index) => {
            const isSelected =
              currentQ.type === "single"
                ? answers[currentQ.id] === option.value
                : ((answers[currentQ.id] as string[]) || []).includes(
                    option.value
                  );

            // Show "Recommended" for the first Canadian option
            const showRecommended = isCanadianQuestion && index === 0;

            return (
              <div key={option.value} className="relative">
                {showRecommended && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Recommended
                    </span>
                  </div>
                )}
                <SelectCard
                  className="h-full"
                  selected={isSelected}
                  icon={option.icon}
                  title={option.label}
                  description={option.description}
                  onClick={() => {
                    if (currentQ.type === "single") {
                      handleSingleAnswer(currentQ.id, option.value);
                    } else {
                      handleMultipleAnswer(currentQ.id, option.value);
                    }
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-10 gap-2 md:gap-4">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Button>

          <div className="text-sm text-muted-foreground font-medium">
            {currentQuestion + 1} of {quizQuestions.length}
          </div>

          {/* Right-side primary action: always render to prevent layout shift */}
          {(() => {
            const isLast = currentQuestion === quizQuestions.length - 1;
            if (currentQ.type === "multiple") {
              return (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isCompleting}
                  size="lg"
                  variant="brand"
                  className="px-8"
                >
                  {isCompleting
                    ? "Setting up..."
                    : isLast
                    ? "Complete"
                    : "Continue"}
                </Button>
              );
            } else {
              if (isLast) {
                const canComplete = !!answers[currentQ.id];
                return (
                  <Button
                    onClick={completeQuiz}
                    disabled={isCompleting || !canComplete}
                    size="lg"
                    variant="brand"
                    className="px-8"
                  >
                    {isCompleting ? "Setting up..." : "Complete"}
                  </Button>
                );
              }
              // Single-choice, auto-advance screens: show disabled button to avoid layout jump
              return (
                <Button size="lg" variant="brand" className="px-8" disabled>
                  Continue
                </Button>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
}
