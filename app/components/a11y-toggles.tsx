"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const CONTRAST_KEY = "honk_a11y_contrast";
const TEXT_KEY = "honk_a11y_text"; // values: "normal" | "large"

export function A11yToggles() {
  const [contrast, setContrast] = useState<boolean>(false);
  const [textLarge, setTextLarge] = useState<boolean>(false);

  // Load saved prefs on mount
  useEffect(() => {
    try {
      const c = localStorage.getItem(CONTRAST_KEY);
      const t = localStorage.getItem(TEXT_KEY);
      if (c === "1") setContrast(true);
      if (t === "large") setTextLarge(true);
    } catch {}
  }, []);

  // Apply classes to <html> for global effect
  useEffect(() => {
    const root = document.documentElement;
    if (contrast) root.classList.add("a11y-contrast");
    else root.classList.remove("a11y-contrast");
    try { localStorage.setItem(CONTRAST_KEY, contrast ? "1" : "0"); } catch {}
  }, [contrast]);

  useEffect(() => {
    const root = document.documentElement;
    if (textLarge) root.classList.add("a11y-text-large");
    else root.classList.remove("a11y-text-large");
    try { localStorage.setItem(TEXT_KEY, textLarge ? "large" : "normal"); } catch {}
  }, [textLarge]);

  return (
    <div
      aria-label="Accessibility settings"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 p-2 bg-card/95 border border-border rounded-lg shadow-lg backdrop-blur-sm"
    >
      <div className="text-xs font-medium text-muted-foreground px-1">Accessibility</div>
      <div className="flex gap-2">
        <Button
          variant={contrast ? "brand" : "outline"}
          className="px-3"
          role="switch"
          aria-checked={contrast}
          aria-label="Increase contrast"
          onClick={() => setContrast((v) => !v)}
        >
          {contrast ? "Contrast: On" : "Contrast: Off"}
        </Button>
        <Button
          variant={textLarge ? "brand" : "outline"}
          className="px-3"
          role="switch"
          aria-checked={textLarge}
          aria-label="Larger text"
          onClick={() => setTextLarge((v) => !v)}
        >
          {textLarge ? "Text: Large" : "Text: Normal"}
        </Button>
      </div>
    </div>
  );
}

