"use client";

import type React from "react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "./auth-provider";

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/onboarding_background.png"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background/95" />
      </div>
      
      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/goose_waving.png"
              alt="Welcome Goose"
              width={150}
              height={150}
            />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Welcome to Honkonomics!
          </CardTitle>
          <CardDescription>
            Learn to invest strategically with your personal goose guide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-card/80 border border-border"
                />
              </div>
            )}
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input/50"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input/50"
              />
            </div>
            <Button
              type="submit"
              variant="brand"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary/80 hover:underline text-sm font-medium transition-colors duration-200"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
      
      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground z-10">
        <div className="flex justify-center items-center gap-2 mb-2">
          <span>Powered by</span>
          <Image src="/techrbc.png" alt="Tech@RBC" width={60} height={22} className="opacity-70" />
        </div>
        <div>
          Made with 💙 in Waterloo, Ontario, Canada 🇨🇦 at Hack The North 2025
        </div>
      </div>
    </div>
  );
}
