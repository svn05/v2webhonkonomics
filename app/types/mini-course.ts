export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export interface MiniCourseResource {
  title: string;
  url: string;
}

export interface MiniCourseQuiz {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface MiniCourseLesson {
  title: string;
  summary: string;
  durationMinutes: number;
  objectives: string[];
  outline: string[];
  activity: string;
  quiz?: MiniCourseQuiz;
}

export interface MiniCourse {
  topic: string;
  title: string;
  overview: string;
  estimatedDuration: string;
  level: ExperienceLevel;
  prerequisites: string[];
  lessons: MiniCourseLesson[];
  resources: MiniCourseResource[];
}

