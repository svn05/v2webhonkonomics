import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Suspense } from "react";
import { A11yToggles } from "@/components/a11y-toggles";

export const metadata: Metadata = {
  title: "Honkonomics - Learn Investing with Canada Goose",
  description: "Gamified investment learning app with Canada Goose mascot",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-2 focus:rounded"
        >
          Skip to main content
        </a>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <div id="main-content">{children}</div>
          </AuthProvider>
        </Suspense>
        <A11yToggles />
        <Analytics />
      </body>
    </html>
  );
}
