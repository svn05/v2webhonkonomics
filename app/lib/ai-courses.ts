import type { MiniCourse } from "@/types/mini-course";

export interface SavedAICourse {
  id: string; // ai:<slug>
  course: MiniCourse;
  createdAt: number;
}

const keyFor = (userId: string) => `honk_ai_courses_${userId}`;

export function loadAICourses(userId?: string | null): SavedAICourse[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as SavedAICourse[]) : [];
  } catch {
    return [];
  }
}

export function saveAICourses(userId: string, items: SavedAICourse[]) {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(items));
  } catch {}
}

export function upsertAICourse(userId: string, item: SavedAICourse) {
  const items = loadAICourses(userId);
  const idx = items.findIndex((c) => c.id === item.id);
  if (idx >= 0) {
    items[idx] = item;
  } else {
    items.unshift(item); // newest first
  }
  saveAICourses(userId, items);
}

export function removeAICourse(userId: string, id: string) {
  const items = loadAICourses(userId).filter((c) => c.id !== id);
  saveAICourses(userId, items);
}

