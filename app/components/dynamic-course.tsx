"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MiniCourse } from "@/types/mini-course";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "./auth-provider";

export interface DynamicCoursePlayerProps {
  id: string; // stable id for progress storage (e.g., ai:slug)
  course: MiniCourse;
  onExit?: () => void;
  onComplete?: () => void;
  onProgress?: (pct: number) => void;
}

export function DynamicCoursePlayer({ id, course, onExit, onComplete, onProgress }: DynamicCoursePlayerProps) {
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const { user, updateUser } = useAuth();

  const lessonsList = (Array.isArray(course.lessons) && course.lessons.length > 0)
    ? course.lessons
    : [{
        title: course.title || "Overview",
        summary: course.overview || "",
        durationMinutes: 5,
        objectives: [],
        outline: [],
        activity: "Read the overview and resources",
      }];

  const total = lessonsList.length;
  const pct = Math.round((index / total) * 100);

  // Keep latest onProgress in a ref to avoid effect loops from changing identity
  const onProgressRef = useRef<typeof onProgress | undefined>(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  // Push progress only when percent changes
  useEffect(() => {
    onProgressRef.current?.(pct);
  }, [pct]);

  // Persist and restore current lesson index per user + course
  useEffect(() => {
    try {
      const key = user?.id ? `honk_index_${user.id}_${id}` : null;
      if (!key) return;
      const raw = localStorage.getItem(key);
      const saved = raw ? parseInt(raw, 10) : NaN;
      if (!Number.isNaN(saved) && saved >= 0 && saved < total) {
        setIndex(saved);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id, total]);

  useEffect(() => {
    try {
      const key = user?.id ? `honk_index_${user.id}_${id}` : null;
      if (!key) return;
      localStorage.setItem(key, String(index));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ai-progress:updated', { detail: { userId: user?.id, courseId: id, index } }));
      }
    } catch {}
  }, [id, user?.id, index]);

  const lesson = lessonsList[index];
  const canPrev = index > 0;
  const isLast = index >= total - 1;

  const handleNext = () => {
    if (lesson?.quiz && selectedOption === null) return; // require answer when quiz exists
    if (!isLast) {
      setIndex((i) => Math.min(i + 1, total - 1));
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Complete
      const bonus = Math.max(20, total * 10); // simple points formula
      if (user) {
        updateUser({ honkPoints: user.honkPoints + bonus });
      }
      onProgress?.(100);
      onComplete?.();
      try {
        const key = user?.id ? `honk_index_${user.id}_${id}` : null;
        if (key) localStorage.removeItem(key);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ai-progress:updated', { detail: { userId: user?.id, courseId: id, index: 0 } }));
        }
      } catch {}
    }
  };

  const handlePrev = () => {
    if (!canPrev) return;
    setIndex((i) => Math.max(i - 1, 0));
    setSelectedOption(null);
    setShowExplanation(false);
  };

  const difficultyColor = (d: string) =>
    d === "beginner"
      ? "bg-green-100 text-green-800"
      : d === "intermediate"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";

  return (
    <div className="relative min-h-screen">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <Card className="bg-card/95 backdrop-blur-sm border border-foreground/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <CardDescription className="mt-1">{course.overview}</CardDescription>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <span>⏱️ {course.estimatedDuration}</span>
                  <Badge className={difficultyColor(course.level) + " capitalize"}>{course.level}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onExit}>Exit</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{pct}%</span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Lesson {index + 1} of {total}</div>
                  <h3 className="font-semibold text-lg mt-1">{lesson.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{lesson.summary}</p>
                </div>
                <div className="text-sm text-muted-foreground">⏱️ {lesson.durationMinutes} min</div>
              </div>

              {lesson.objectives?.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-medium">Objectives</div>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {lesson.objectives.map((o, i) => (<li key={i}>{o}</li>))}
                  </ul>
                </div>
              )}

              {lesson.outline?.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-medium">Outline</div>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {lesson.outline.map((o, i) => (<li key={i}>{o}</li>))}
                  </ul>
                </div>
              )}

              {lesson.activity && (
                <div className="mt-3 text-sm">
                  <span className="font-medium">Activity: </span>
                  <span className="text-muted-foreground">{lesson.activity}</span>
                </div>
              )}

              {lesson.quiz && (
                <div className="mt-4">
                  <div className="text-sm font-medium">Quick Quiz</div>
                  <div className="text-sm mt-1">{lesson.quiz.question}</div>
                  <div className="mt-2 flex flex-col gap-2">
                    {lesson.quiz.options.map((opt, i) => {
                      const isSelected = selectedOption === i;
                      const isCorrect = i === lesson.quiz!.answerIndex;
                      const variant = isSelected ? (isCorrect ? "brand" : "destructive") : "outline";
                      return (
                        <Button
                          key={i}
                          type="button"
                          variant={variant as any}
                          className="justify-start"
                          onClick={() => {
                            setSelectedOption(i);
                            setShowExplanation(true);
                          }}
                        >
                          {opt}
                        </Button>
                      );
                    })}
                  </div>
                  {showExplanation && (
                    <div className="text-xs text-muted-foreground mt-2">{lesson.quiz.explanation}</div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={handlePrev} disabled={!canPrev}>Previous</Button>
                <Button onClick={handleNext}>{isLast ? "Finish" : "Next"}</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {course.resources?.length > 0 && (
          <Card className="bg-card/95 backdrop-blur-sm border border-foreground/20">
            <CardHeader>
              <CardTitle className="text-base">Resources</CardTitle>
              <CardDescription>Helpful links to extend your learning</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {course.resources.map((r, i) => (
                  <li key={i}>
                    <a className="underline" href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
