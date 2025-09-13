"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "./auth-provider"

interface Module {
  id: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  activities: Activity[]
  pointsReward: number
}

interface Activity {
  id: string
  type: "story" | "drag-drop" | "scenario" | "build-portfolio" | "match" | "calculator" | "quiz"
  title: string
  points: number
  content: any
}

// Story activity for narrative learning
interface StoryActivity extends Activity {
  type: "story"
  content: {
    panels: {
      text: string
      image?: string
      gooseDialog?: string
      choices?: { label: string; correct?: boolean; feedback: string }[]
    }[]
  }
}

// Drag and drop matching activity
interface DragDropActivity extends Activity {
  type: "drag-drop"
  content: {
    instruction: string
    items: { id: string; label: string; category: string }[]
    categories: { id: string; label: string; description: string }[]
  }
}

// Real-world scenario decision making
interface ScenarioActivity extends Activity {
  type: "scenario"
  content: {
    scenario: string
    context: string
    options: {
      label: string
      outcome: string
      points: number
      correct?: boolean
    }[]
  }
}

// Portfolio building simulator
interface PortfolioActivity extends Activity {
  type: "build-portfolio"
  content: {
    budget: number
    goal: string
    assets: {
      id: string
      name: string
      type: string
      risk: "low" | "medium" | "high"
      expectedReturn: string
      minInvestment: number
    }[]
  }
}

const investmentBasicsModule: Module = {
  id: "investment-basics",
  title: "Investment Basics 101",
  description: "Learn the fundamentals of investing",
  difficulty: "beginner",
  pointsReward: 50,
  activities: [
    {
      id: "story-intro",
      type: "story",
      title: "The Goose's Golden Journey",
      points: 10,
      content: {
        panels: [
          {
            text: "Meet Honky! A young goose who just inherited 1000 golden eggs from Grandma Goose. 🥚",
            gooseDialog: "Wow! What should I do with all these golden eggs?",
            image: "/goose_thinking.png"
          },
          {
            text: "Honky could keep all the eggs in the nest (like a savings account), but inflation means they'll buy less grain each year...",
            gooseDialog: "Hmm, Grandma always said eggs in the nest don't multiply!",
            choices: [
              { label: "Keep them safe in the nest", feedback: "Safe but won't grow! Inflation will reduce their value over time." },
              { label: "Learn about investing", correct: true, feedback: "Smart choice! Let's learn how to make those eggs grow! 🌱" }
            ]
          },
          {
            text: "Investing means putting your eggs to work! You can buy pieces of farms (stocks), lend eggs to other geese (bonds), or invest in ponds (real estate).",
            gooseDialog: "So investing is like planting eggs to grow more eggs? Cool!",
            image: "/goose_cheering.png"
          }
        ]
      }
    },
    {
      id: "drag-drop-types",
      type: "drag-drop",
      title: "Sort the Investment Types",
      points: 15,
      content: {
        instruction: "Help Honky organize different investments by their risk level! Drag each investment to the correct nest.",
        items: [
          { id: "1", label: "Government Bonds", category: "low" },
          { id: "2", label: "Tech Startup Stock", category: "high" },
          { id: "3", label: "Blue Chip Stocks", category: "medium" },
          { id: "4", label: "Savings Account", category: "low" },
          { id: "5", label: "Cryptocurrency", category: "high" },
          { id: "6", label: "Index Fund ETF", category: "medium" },
          { id: "7", label: "Corporate Bonds", category: "medium" },
          { id: "8", label: "Penny Stocks", category: "high" }
        ],
        categories: [
          { id: "low", label: "🛡️ Low Risk Nest", description: "Steady but slower growth" },
          { id: "medium", label: "⚖️ Balanced Nest", description: "Moderate risk and return" },
          { id: "high", label: "🚀 High Risk Nest", description: "High potential but volatile" }
        ]
      }
    },
    {
      id: "scenario-first-investment",
      type: "scenario",
      title: "Your First Investment Decision",
      points: 20,
      content: {
        scenario: "You've saved $1,000 from your summer job and want to start investing. You're 20 years old and won't need this money for at least 5 years.",
        context: "Consider your age, time horizon, and the fact that this is money you can afford to invest.",
        options: [
          {
            label: "Put it all in a single hot tech stock your friend recommended",
            outcome: "Risky! Putting all eggs in one basket could lead to big losses. Your friend's tip might work out, but it's gambling, not investing.",
            points: 0
          },
          {
            label: "Buy a diversified index fund ETF",
            outcome: "Excellent choice! ETFs provide instant diversification across many companies, perfect for beginners with a 5+ year timeline.",
            points: 20,
            correct: true
          },
          {
            label: "Keep it in savings until you learn more",
            outcome: "Playing it safe, but with 5+ years ahead, you're missing growth opportunities. A small start in index funds while learning would be better.",
            points: 5
          },
          {
            label: "Day trade with it to make quick profits",
            outcome: "Very risky! Most day traders lose money. With your timeline and experience level, long-term investing is much wiser.",
            points: 0
          }
        ]
      }
    },
    {
      id: "portfolio-builder",
      type: "build-portfolio",
      title: "Build Your First Portfolio",
      points: 25,
      content: {
        budget: 5000,
        goal: "Create a balanced portfolio for long-term growth. Try to diversify across different asset types!",
        assets: [
          {
            id: "vti",
            name: "Total Stock Market ETF",
            type: "ETF",
            risk: "medium",
            expectedReturn: "7-10% annually",
            minInvestment: 100
          },
          {
            id: "bnd",
            name: "Bond Index Fund",
            type: "Bonds",
            risk: "low",
            expectedReturn: "3-5% annually",
            minInvestment: 100
          },
          {
            id: "apple",
            name: "Apple Stock",
            type: "Individual Stock",
            risk: "high",
            expectedReturn: "Variable",
            minInvestment: 150
          },
          {
            id: "vxus",
            name: "International Stock ETF",
            type: "ETF",
            risk: "medium",
            expectedReturn: "6-9% annually",
            minInvestment: 100
          },
          {
            id: "reit",
            name: "Real Estate ETF",
            type: "REIT",
            risk: "medium",
            expectedReturn: "5-8% annually",
            minInvestment: 100
          }
        ]
      }
    },
    {
      id: "match-terms",
      type: "match",
      title: "Investment Term Matchup",
      points: 15,
      content: {
        instruction: "Match the investment terms with their definitions!",
        pairs: [
          { term: "Dividend", definition: "Regular payments from stocks to shareholders" },
          { term: "Portfolio", definition: "Your collection of all investments" },
          { term: "Bull Market", definition: "Period when stock prices are rising" },
          { term: "Bear Market", definition: "Period when stock prices are falling" },
          { term: "P/E Ratio", definition: "Price compared to earnings per share" },
          { term: "Diversification", definition: "Spreading risk across different investments" }
        ]
      }
    },
    {
      id: "compound-calculator",
      type: "calculator",
      title: "The Magic of Compound Interest",
      points: 10,
      content: {
        instruction: "See how your money grows with compound interest! Adjust the sliders to see different scenarios.",
        initialAmount: 1000,
        monthlyContribution: 100,
        years: 30,
        returnRate: 7,
        description: "This is why starting early is so powerful! Even small amounts grow significantly over time."
      }
    }
  ]
}

// Trading Fundamentals Module
const tradingFundamentalsModule: Module = {
  id: "trading-fundamentals",
  title: "Trading Fundamentals 🦆",
  description: "Master the art of buying and selling in the markets",
  difficulty: "beginner",
  pointsReward: 60,
  activities: [
    {
      id: "tf-story-1",
      type: "story",
      title: "Your First Trade with Honk! 🦆",
      points: 10,
      content: {
        panels: [
          {
            text: "Honk the Goose wants to buy some shares of his favorite pond company! But first, he needs to understand how trading works.",
            image: "/goose_waving.png",
            choices: [
              { text: "Let's learn about market orders!", correct: true },
              { text: "I'll just click randomly!", correct: false }
            ]
          },
          {
            text: "A MARKET ORDER buys or sells immediately at the current price. It's fast but you might pay more than expected!",
            image: "/goose_flying_1.png",
            choices: [
              { text: "Speed is good, but what about price control?", correct: true },
              { text: "I only want market orders!", correct: false }
            ]
          },
          {
            text: "A LIMIT ORDER lets you set your exact price! You might wait longer, but you control how much you pay.",
            image: "/goose_atlas.png",
            choices: [
              { text: "I understand both order types now!", correct: true },
              { text: "This is too complicated", correct: false }
            ]
          }
        ]
      }
    },
    {
      id: "tf-drag-1",
      type: "drag-drop",
      title: "Order Type Sorting Challenge",
      points: 15,
      content: {
        instruction: "Drag each trading scenario to the correct order type!",
        categories: [
          { id: "market", label: "Market Order 🚀" },
          { id: "limit", label: "Limit Order 🎯" }
        ],
        items: [
          { id: "1", label: "Need to buy RIGHT NOW", correctCategory: "market" },
          { id: "2", label: "Want exact price of $50", correctCategory: "limit" },
          { id: "3", label: "Selling at market close", correctCategory: "market" },
          { id: "4", label: "Buy only if it drops to $45", correctCategory: "limit" },
          { id: "5", label: "Emergency exit from position", correctCategory: "market" },
          { id: "6", label: "Patient value investing", correctCategory: "limit" }
        ]
      }
    },
    {
      id: "tf-scenario-1",
      type: "scenario",
      title: "Trading Decision Time!",
      points: 15,
      content: {
        situation: "Stock XYZ is at $100. News just broke that could move the price. You want to buy 10 shares.",
        image: "/goose_atlas.png",
        question: "Which order type should you use?",
        options: [
          {
            text: "Market order - Get in before price jumps!",
            feedback: "Good thinking! When news breaks, speed matters. You got in at $101.",
            correct: true,
            points: 15
          },
          {
            text: "Limit order at $95 - Wait for a dip",
            feedback: "The stock jumped to $110 and never came back down. You missed out!",
            correct: false,
            points: 5
          },
          {
            text: "Don't trade on news",
            feedback: "Sometimes waiting is smart, but you missed a 10% gain opportunity.",
            correct: false,
            points: 8
          }
        ]
      }
    },
    {
      id: "tf-match-1",
      type: "match",
      title: "Trading Terms Match-Up",
      points: 10,
      content: {
        instruction: "Match the trading terms with their meanings!",
        pairs: [
          { term: "Bid Price", definition: "Price buyers are willing to pay" },
          { term: "Ask Price", definition: "Price sellers are asking for" },
          { term: "Spread", definition: "Difference between bid and ask" },
          { term: "Volume", definition: "Number of shares traded" },
          { term: "Stop Loss", definition: "Automatic sell if price drops" }
        ]
      }
    },
    {
      id: "tf-calculator-1",
      type: "calculator",
      title: "Trading Cost Calculator",
      points: 10,
      content: {
        instruction: "See how trading fees and spreads affect your returns!",
        sharePrice: 50,
        numberOfShares: 100,
        commission: 9.99,
        spread: 0.05,
        description: "Notice how fees can eat into profits on smaller trades!"
      }
    }
  ]
}

// Stock Market Basics Module
const stockMarketBasicsModule: Module = {
  id: "stock-market-basics",
  title: "Stock Market Safari 🦢",
  description: "Navigate the wild world of stocks and exchanges",
  difficulty: "beginner",
  pointsReward: 55,
  activities: [
    {
      id: "sm-story-1",
      type: "story",
      title: "Welcome to the Stock Jungle! 🌳",
      points: 10,
      content: {
        panels: [
          {
            text: "Honk discovers the stock market is like a giant marketplace where companies and investors meet!",
            image: "/goose_waving.png",
            choices: [
              { text: "Tell me about stock exchanges!", correct: true },
              { text: "I don't need to know this", correct: false }
            ]
          },
          {
            text: "Stock exchanges like NYSE and NASDAQ are where stocks are bought and sold. Think of them as the 'stores' for stocks!",
            image: "/goose_atlas.png",
            choices: [
              { text: "How do companies get listed?", correct: true },
              { text: "Just tell me what to buy", correct: false }
            ]
          },
          {
            text: "Companies go through an IPO (Initial Public Offering) to sell shares to the public. Now anyone can own a piece!",
            image: "/goose_flying_1.png",
            choices: [
              { text: "So I become a part owner? Cool!", correct: true },
              { text: "Sounds risky", correct: false }
            ]
          }
        ]
      }
    },
    {
      id: "sm-drag-1",
      type: "drag-drop",
      title: "Market Cap Categories",
      points: 12,
      content: {
        instruction: "Sort these companies by their market cap size!",
        categories: [
          { id: "large", label: "Large Cap ($10B+) 🐘" },
          { id: "mid", label: "Mid Cap ($2-10B) 🦌" },
          { id: "small", label: "Small Cap (<$2B) 🐭" }
        ],
        items: [
          { id: "1", label: "Apple ($3 Trillion)", correctCategory: "large" },
          { id: "2", label: "Local Restaurant Chain ($500M)", correctCategory: "small" },
          { id: "3", label: "Regional Bank ($5B)", correctCategory: "mid" },
          { id: "4", label: "Microsoft ($2.8T)", correctCategory: "large" },
          { id: "5", label: "Growing Tech Startup ($800M)", correctCategory: "small" },
          { id: "6", label: "Established Retailer ($7B)", correctCategory: "mid" }
        ]
      }
    },
    {
      id: "sm-build-1",
      type: "build-portfolio",
      title: "Build Your First Stock Portfolio!",
      points: 15,
      content: {
        instruction: "Allocate $10,000 across different sectors for diversification!",
        budget: 10000,
        categories: [
          { id: "tech", name: "Technology 💻", minPercent: 15, maxPercent: 40 },
          { id: "health", name: "Healthcare 🆘", minPercent: 10, maxPercent: 30 },
          { id: "finance", name: "Financial 🏦", minPercent: 10, maxPercent: 30 },
          { id: "consumer", name: "Consumer 🛒", minPercent: 10, maxPercent: 30 },
          { id: "energy", name: "Energy ⚡", minPercent: 5, maxPercent: 20 }
        ],
        targetDiversification: "A diversified portfolio reduces risk!"
      }
    },
    {
      id: "sm-match-1",
      type: "match",
      title: "Stock Market Lingo",
      points: 8,
      content: {
        instruction: "Match these stock terms with their meanings!",
        pairs: [
          { term: "P/E Ratio", definition: "Price compared to earnings" },
          { term: "Dividend", definition: "Cash payment to shareholders" },
          { term: "Bear Market", definition: "Prices falling 20%+" },
          { term: "Bull Market", definition: "Prices rising strongly" },
          { term: "Blue Chip", definition: "Large, stable company" }
        ]
      }
    },
    {
      id: "sm-scenario-1",
      type: "scenario",
      title: "Reading Stock Quotes",
      points: 10,
      content: {
        situation: "You're looking at HONK stock: Price $50, P/E 15, Dividend 2%, Volume 1M shares",
        image: "/goose_pfp.png",
        question: "What does this tell you about the stock?",
        options: [
          {
            text: "It's reasonably valued with steady income",
            feedback: "Correct! P/E of 15 is moderate, and 2% dividend provides income.",
            correct: true,
            points: 10
          },
          {
            text: "It's too expensive",
            feedback: "Actually, a P/E of 15 is quite reasonable compared to market average of 20.",
            correct: false,
            points: 3
          },
          {
            text: "Volume is too low",
            feedback: "1M shares daily is actually decent liquidity for most investors.",
            correct: false,
            points: 5
          }
        ]
      }
    }
  ]
}

// Portfolio Management Module
const portfolioManagementModule: Module = {
  id: "portfolio-management",
  title: "Portfolio Builder Pro 🪿",
  description: "Master the art of portfolio construction and management",
  difficulty: "intermediate",
  pointsReward: 70,
  activities: [
    {
      id: "pm-story-1",
      type: "story",
      title: "The Egg Basket Principle 🥚",
      points: 12,
      content: {
        panels: [
          {
            text: "Honk learned a valuable lesson: Never put all your golden eggs in one basket!",
            image: "/golden_egg.png",
            choices: [
              { text: "Why is diversification important?", correct: true },
              { text: "One basket is simpler!", correct: false }
            ]
          },
          {
            text: "If one investment fails, others can save your portfolio. Spread risk across different assets, sectors, and regions!",
            image: "/goose_atlas.png",
            choices: [
              { text: "How many investments do I need?", correct: true },
              { text: "Too much work!", correct: false }
            ]
          },
          {
            text: "Research shows 15-20 different stocks can eliminate most company-specific risk. Or just use ETFs for instant diversification!",
            image: "/goose_waving.png",
            choices: [
              { text: "Smart! I'll diversify my portfolio!", correct: true },
              { text: "I'll stick to one stock", correct: false }
            ]
          }
        ]
      }
    },
    {
      id: "pm-build-1",
      type: "build-portfolio",
      title: "Age-Based Asset Allocation",
      points: 18,
      content: {
        instruction: "Build portfolios for different life stages using the 100-minus-age rule!",
        budget: 100000,
        categories: [
          { id: "stocks", name: "Stocks 📈", minPercent: 20, maxPercent: 90 },
          { id: "bonds", name: "Bonds 📜", minPercent: 10, maxPercent: 60 },
          { id: "reits", name: "REITs 🏢", minPercent: 5, maxPercent: 20 },
          { id: "commodities", name: "Commodities 🌾", minPercent: 0, maxPercent: 15 },
          { id: "cash", name: "Cash 💵", minPercent: 5, maxPercent: 20 }
        ],
        targetDiversification: "Young investors can take more risk with stocks, older investors need more bonds!"
      }
    },
    {
      id: "pm-drag-1",
      type: "drag-drop",
      title: "Risk vs Return Ladder",
      points: 15,
      content: {
        instruction: "Arrange investments from lowest to highest risk/return!",
        categories: [
          { id: "low", label: "Low Risk/Return 🚯" },
          { id: "medium", label: "Medium Risk/Return ⚖️" },
          { id: "high", label: "High Risk/Return 🚀" }
        ],
        items: [
          { id: "1", label: "Government Bonds", correctCategory: "low" },
          { id: "2", label: "Crypto", correctCategory: "high" },
          { id: "3", label: "Blue Chip Stocks", correctCategory: "medium" },
          { id: "4", label: "Savings Account", correctCategory: "low" },
          { id: "5", label: "Growth Stocks", correctCategory: "high" },
          { id: "6", label: "Corporate Bonds", correctCategory: "medium" }
        ]
      }
    },
    {
      id: "pm-calculator-1",
      type: "calculator",
      title: "Rebalancing Calculator",
      points: 15,
      content: {
        instruction: "See how rebalancing keeps your portfolio on track!",
        initialStocks: 60,
        initialBonds: 40,
        yearLaterStocks: 75,
        yearLaterBonds: 25,
        description: "When stocks outperform, sell some high and buy bonds low to maintain your target allocation!"
      }
    },
    {
      id: "pm-scenario-1",
      type: "scenario",
      title: "Portfolio Emergency!",
      points: 10,
      content: {
        situation: "Market crash! Your portfolio is down 30%. You need money in 10 years for retirement.",
        image: "/goose_atlas.png",
        question: "What should you do?",
        options: [
          {
            text: "Stay calm and stick to the plan",
            feedback: "Excellent! With 10 years to recover, history shows patience pays off.",
            correct: true,
            points: 10
          },
          {
            text: "Sell everything immediately!",
            feedback: "You locked in losses! Markets historically recover over 10-year periods.",
            correct: false,
            points: 2
          },
          {
            text: "Double down on stocks",
            feedback: "Brave but risky! Consider your risk tolerance first.",
            correct: false,
            points: 6
          }
        ]
      }
    }
  ]
}

// Risk and Rewards Module
const riskRewardsModule: Module = {
  id: "risk-rewards",
  title: "Risk & Rewards Balance ⚖️",
  description: "Understanding the relationship between risk and return",
  difficulty: "intermediate",
  pointsReward: 65,
  activities: [
    {
      id: "rr-story-1",
      type: "story",
      title: "The Risk-Return Seesaw 🎮",
      points: 10,
      content: {
        panels: [
          {
            text: "Honk discovers that higher returns always come with higher risk - like flying higher means farther to fall!",
            image: "/goose_flying_1.png",
            choices: [
              { text: "Show me examples!", correct: true },
              { text: "I want no risk!", correct: false }
            ]
          },
          {
            text: "A savings account is safe but earns 2%. Stocks are volatile but average 10% long-term. Risk and reward are connected!",
            image: "/goose_atlas.png",
            choices: [
              { text: "How do I find my risk tolerance?", correct: true },
              { text: "I'll take maximum risk!", correct: false }
            ]
          },
          {
            text: "Your risk tolerance depends on age, goals, and personality. Young Honk can take more risk than Grandpa Goose!",
            image: "/goose_waving.png",
            choices: [
              { text: "I'll match risk to my situation!", correct: true },
              { text: "One size fits all!", correct: false }
            ]
          }
        ]
      }
    },
    {
      id: "rr-match-1",
      type: "match",
      title: "Risk Types Matchup",
      points: 12,
      content: {
        instruction: "Match different types of investment risk!",
        pairs: [
          { term: "Market Risk", definition: "Entire market declining" },
          { term: "Inflation Risk", definition: "Money losing purchasing power" },
          { term: "Liquidity Risk", definition: "Can't sell when needed" },
          { term: "Credit Risk", definition: "Borrower won't pay back" },
          { term: "Currency Risk", definition: "Exchange rate changes" }
        ]
      }
    },
    {
      id: "rr-calculator-1",
      type: "calculator",
      title: "Risk-Adjusted Returns",
      points: 15,
      content: {
        instruction: "Compare investments using the Sharpe Ratio (return per unit of risk)!",
        investment1Return: 12,
        investment1Volatility: 20,
        investment2Return: 8,
        investment2Volatility: 5,
        riskFreeRate: 2,
        description: "Higher Sharpe Ratio means better risk-adjusted returns. Sometimes lower returns with lower risk is better!"
      }
    },
    {
      id: "rr-scenario-1",
      type: "scenario",
      title: "Risk Assessment Quiz",
      points: 13,
      content: {
        situation: "You have $10,000 to invest. The market drops 20% next month.",
        image: "/goose_pfp.png",
        question: "What's your reaction?",
        options: [
          {
            text: "Buy more at discount prices!",
            feedback: "High risk tolerance! You see opportunity in volatility.",
            correct: true,
            points: 13
          },
          {
            text: "Hold and wait it out",
            feedback: "Moderate risk tolerance. Patient approach often works.",
            correct: true,
            points: 13
          },
          {
            text: "Sell to prevent more losses",
            feedback: "Low risk tolerance. Consider more conservative investments.",
            correct: true,
            points: 13
          }
        ]
      }
    },
    {
      id: "rr-drag-1",
      type: "drag-drop",
      title: "Volatility Sorting",
      points: 15,
      content: {
        instruction: "Sort assets by volatility (price swings)!",
        categories: [
          { id: "low-vol", label: "Low Volatility 🌊" },
          { id: "med-vol", label: "Medium Volatility 🌊🌊" },
          { id: "high-vol", label: "High Volatility 🌊🌊🌊" }
        ],
        items: [
          { id: "1", label: "Treasury Bonds", correctCategory: "low-vol" },
          { id: "2", label: "Meme Stocks", correctCategory: "high-vol" },
          { id: "3", label: "S&P 500 Index", correctCategory: "med-vol" },
          { id: "4", label: "Money Market Fund", correctCategory: "low-vol" },
          { id: "5", label: "Bitcoin", correctCategory: "high-vol" },
          { id: "6", label: "Utility Stocks", correctCategory: "med-vol" }
        ]
      }
    }
  ]
}

// Crypto Basics Module  
const cryptoBasicsModule: Module = {
  id: "crypto-basics",
  title: "Crypto 101 🪙",
  description: "Understanding digital assets and blockchain",
  difficulty: "intermediate",
  pointsReward: 85,
  activities: [
    {
      id: "crypto-story-1",
      type: "story",
      title: "Honk Discovers Digital Gold 🪙",
      points: 15,
      content: {
        panels: [
          {
            text: "Honk learns about Bitcoin - digital money that no government controls! It's secured by blockchain technology.",
            image: "/goose_waving.png",
            choices: [
              { text: "What's a blockchain?", correct: true },
              { text: "Sounds like a scam", correct: false }
            ]
          },
          {
            text: "Blockchain is like a public ledger that everyone can see but no one can cheat. Every transaction is recorded forever!",
            image: "/goose_atlas.png",
            choices: [
              { text: "How is it secured?", correct: true },
              { text: "Too complicated", correct: false }
            ]
          },
          {
            text: "Miners (or validators) use computers to verify transactions. They get rewarded with new coins. It's decentralized!",
            image: "/goose_flying_1.png",
            choices: [
              { text: "Fascinating! Tell me more!", correct: true },
              { text: "I'll stick to dollars", correct: false }
            ]
          }
        ]
      }
    },
    {
      id: "crypto-match-1",
      type: "match",
      title: "Crypto Terms Decoder",
      points: 15,
      content: {
        instruction: "Match crypto terms with their meanings!",
        pairs: [
          { term: "Wallet", definition: "Stores your crypto keys" },
          { term: "Mining", definition: "Validating transactions for rewards" },
          { term: "Gas Fees", definition: "Transaction processing costs" },
          { term: "DeFi", definition: "Decentralized Finance" },
          { term: "HODL", definition: "Hold On for Dear Life" },
          { term: "Fork", definition: "Blockchain protocol change" }
        ]
      }
    },
    {
      id: "crypto-drag-1",
      type: "drag-drop",
      title: "Crypto Risk Assessment",
      points: 20,
      content: {
        instruction: "Sort crypto assets by risk level!",
        categories: [
          { id: "lower", label: "Lower Risk (for crypto) 🚯" },
          { id: "medium", label: "Medium Risk ⚠️" },
          { id: "extreme", label: "Extreme Risk 🚨" }
        ],
        items: [
          { id: "1", label: "Bitcoin (BTC)", correctCategory: "lower" },
          { id: "2", label: "New Meme Coin", correctCategory: "extreme" },
          { id: "3", label: "Ethereum (ETH)", correctCategory: "lower" },
          { id: "4", label: "Mid-cap Altcoin", correctCategory: "medium" },
          { id: "5", label: "Leveraged Crypto Trading", correctCategory: "extreme" },
          { id: "6", label: "Stablecoins (USDC)", correctCategory: "lower" }
        ]
      }
    },
    {
      id: "crypto-scenario-1",
      type: "scenario",
      title: "Crypto Investment Decision",
      points: 20,
      content: {
        situation: "You want to add crypto to your portfolio. You have $1000 to invest.",
        image: "/goose_pfp.png",
        question: "What's the smartest approach?",
        options: [
          {
            text: "Start small with 5-10% of portfolio in major coins",
            feedback: "Smart! Crypto is volatile, so position sizing is crucial.",
            correct: true,
            points: 20
          },
          {
            text: "All in on the next moonshot!",
            feedback: "Way too risky! Many cryptos go to zero.",
            correct: false,
            points: 5
          },
          {
            text: "Avoid crypto entirely",
            feedback: "Conservative but you might miss opportunities. Small allocation could work.",
            correct: false,
            points: 10
          }
        ]
      }
    },
    {
      id: "crypto-calculator-1",
      type: "calculator",
      title: "Crypto Volatility Calculator",
      points: 15,
      content: {
        instruction: "See how crypto volatility affects your portfolio!",
        cryptoAllocation: 10,
        cryptoVolatility: 80,
        stockVolatility: 20,
        bondVolatility: 5,
        description: "Even small crypto allocations can dramatically increase portfolio volatility!"
      }
    }
  ]
}

// Create module map
const moduleMap: { [key: string]: Module } = {
  "investment-basics": investmentBasicsModule,
  "trading-fundamentals": tradingFundamentalsModule,
  "stock-market-basics": stockMarketBasicsModule,
  "portfolio-management": portfolioManagementModule,
  "risk-rewards": riskRewardsModule,
  "crypto-basics": cryptoBasicsModule
}

export function LearningModule({ moduleId, onComplete }: { moduleId: string; onComplete: () => void }) {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0)
  const [moduleProgress, setModuleProgress] = useState(0)
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [activityCompleted, setActivityCompleted] = useState<boolean[]>([])
  const { user, updateUser } = useAuth()
  
  const handleBackToHub = () => {
    onComplete()
  }

  // Get the appropriate module based on moduleId
  const module = moduleMap[moduleId] || investmentBasicsModule
  const currentActivity = module.activities[currentActivityIndex]
  const progress = ((currentActivityIndex + 1) / module.activities.length) * 100

  const handleActivityComplete = (points: number) => {
    const newEarnedPoints = earnedPoints + points
    setEarnedPoints(newEarnedPoints)
    
    const newCompleted = [...activityCompleted]
    newCompleted[currentActivityIndex] = true
    setActivityCompleted(newCompleted)

    if (currentActivityIndex < module.activities.length - 1) {
      setTimeout(() => {
        setCurrentActivityIndex(currentActivityIndex + 1)
      }, 1500)
    } else {
      // Module complete!
      updateUser({
        honkPoints: (user?.honkPoints || 0) + newEarnedPoints
      })
      setTimeout(() => {
        onComplete()
      }, 2000)
    }
  }

  const renderActivity = () => {
    switch (currentActivity.type) {
      case "story":
        return <StoryActivityComponent activity={currentActivity} onComplete={handleActivityComplete} />
      case "drag-drop":
        return <DragDropActivityComponent activity={currentActivity} onComplete={handleActivityComplete} />
      case "scenario":
        return <ScenarioActivityComponent activity={currentActivity} onComplete={handleActivityComplete} />
      case "build-portfolio":
        return <PortfolioActivityComponent activity={currentActivity} onComplete={handleActivityComplete} />
      case "match":
        return <MatchActivityComponent activity={currentActivity} onComplete={handleActivityComplete} />
      case "calculator":
        return <CalculatorActivityComponent activity={currentActivity} onComplete={handleActivityComplete} />
      default:
        return <div>Activity type not implemented yet</div>
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Button variant="ghost" onClick={handleBackToHub} className="text-sm">
          ← Back to Learning Hub
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{module.title}</h1>
            <p className="text-muted-foreground">{module.description}</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2 flex items-center gap-2">
            <Image src="/honk_point.png" alt="Honk Points" width={20} height={20} />
            <span>{earnedPoints} / {module.pointsReward}</span>
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Activity {currentActivityIndex + 1} of {module.activities.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Activity Navigation Dots */}
      <div className="flex justify-center gap-2">
        {module.activities.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentActivityIndex
                ? "bg-primary w-8"
                : index < currentActivityIndex
                ? "bg-primary/60"
                : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Current Activity */}
      <Card className="min-h-[400px] bg-card/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {currentActivity.title}
            <Badge variant="outline">+{currentActivity.points} points</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderActivity()}
        </CardContent>
      </Card>

      {/* Skip/Help buttons */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setCurrentActivityIndex(Math.max(0, currentActivityIndex - 1))}>
          ← Previous
        </Button>
        <Button variant="ghost" onClick={() => setCurrentActivityIndex(Math.min(module.activities.length - 1, currentActivityIndex + 1))}>
          Skip →
        </Button>
      </div>
    </div>
  )
}

// Story Activity Component
function StoryActivityComponent({ activity, onComplete }: { activity: any; onComplete: (points: number) => void }) {
  const [currentPanel, setCurrentPanel] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  
  const panel = activity.content.panels[currentPanel]

  const handleChoice = (index: number) => {
    setSelectedChoice(index)
    if (panel.choices[index].correct) {
      setTimeout(() => {
        if (currentPanel < activity.content.panels.length - 1) {
          setCurrentPanel(currentPanel + 1)
          setSelectedChoice(null)
        } else {
          onComplete(activity.points)
        }
      }, 2000)
    }
  }

  const handleNext = () => {
    if (currentPanel < activity.content.panels.length - 1) {
      setCurrentPanel(currentPanel + 1)
    } else {
      onComplete(activity.points)
    }
  }

  return (
    <div className="space-y-6">
      {panel.image && (
        <div className="flex justify-center">
          <Image src={panel.image} alt="Story" width={150} height={150} />
        </div>
      )}
      
      <div className="text-lg leading-relaxed">{panel.text}</div>
      
      {panel.gooseDialog && (
        <div className="bg-sky-50 rounded-lg p-4 border-2 border-sky-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🪿</span>
            <p className="italic">{panel.gooseDialog}</p>
          </div>
        </div>
      )}

      {panel.choices ? (
        <div className="space-y-3">
          {panel.choices.map((choice: any, index: number) => (
            <Button
              key={index}
              variant={selectedChoice === index ? (choice.correct ? "default" : "destructive") : "outline"}
              className="w-full justify-start text-left p-4 h-auto"
              onClick={() => handleChoice(index)}
              disabled={selectedChoice !== null}
            >
              <div className="text-left">
                <div>{choice.label || choice.text}</div>
                {selectedChoice === index && (
                  <div className="text-sm mt-2 font-normal">{choice.feedback}</div>
                )}
              </div>
            </Button>
          ))}
        </div>
      ) : (
        <Button onClick={handleNext} className="w-full">
          {currentPanel < activity.content.panels.length - 1 ? "Continue" : "Complete"}
        </Button>
      )}
    </div>
  )
}

// Drag and Drop Activity Component
function DragDropActivityComponent({ activity, onComplete }: { activity: any; onComplete: (points: number) => void }) {
  const [items, setItems] = useState(activity.content.items)
  const [categorized, setCategorized] = useState<Record<string, any[]>>({
    low: [],
    medium: [],
    high: []
  })
  const [draggedItem, setDraggedItem] = useState<any>(null)
  const [isComplete, setIsComplete] = useState(false)

  const handleDragStart = (item: any) => {
    setDraggedItem(item)
  }

  const handleDrop = (categoryId: string) => {
    if (!draggedItem) return

    const newCategorized = { ...categorized }
    
    // Remove item from any existing category first
    Object.keys(newCategorized).forEach(cat => {
      newCategorized[cat] = newCategorized[cat].filter((item: any) => item.id !== draggedItem.id)
    })
    
    // Add to new category
    if (!newCategorized[categoryId]) {
      newCategorized[categoryId] = []
    }
    newCategorized[categoryId] = [...newCategorized[categoryId], draggedItem]
    setCategorized(newCategorized)

    // Remove from uncategorized items if it was there
    setItems(items.filter((item: any) => item.id !== draggedItem.id))
    setDraggedItem(null)
  }

  const checkAnswers = () => {
    let correct = true
    let totalItems = 0
    
    Object.entries(categorized).forEach(([category, items]) => {
      totalItems += items.length
      items.forEach((item) => {
        if (item.category !== category) correct = false
      })
    })

    // Check if all items have been categorized and all are correct
    const expectedItemCount = activity.content.items.length
    if (correct && totalItems === expectedItemCount && items.length === 0) {
      setIsComplete(true)
      setTimeout(() => {
        onComplete(activity.points)
      }, 1000)
    } else if (totalItems === expectedItemCount && items.length === 0 && !correct) {
      // Show error state but don't complete
      setIsComplete(false)
    }
  }

  useEffect(() => {
    if (items.length === 0) {
      checkAnswers()
    }
  }, [items, categorized])

  return (
    <div className="space-y-6">
      <p className="text-center font-medium">{activity.content.instruction}</p>

      {/* Items to drag */}
      <div className="flex flex-wrap gap-2 justify-center min-h-[60px] p-4 bg-muted rounded-lg">
        {items.map((item: any) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(item)}
            className="px-4 py-2 bg-card border-2 border-border rounded-lg cursor-move hover:shadow-md transition-shadow"
          >
            {item.label}
          </div>
        ))}
        {items.length === 0 && !isComplete && (
          <p className="text-muted-foreground">All items sorted! Checking...</p>
        )}
      </div>

      {/* Drop zones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activity.content.categories.map((category: any) => (
          <div
            key={category.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(category.id)}
            className="p-4 bg-card border-2 border-dashed border-border rounded-lg min-h-[150px]"
          >
            <h3 className="font-bold mb-2">{category.label}</h3>
            <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
            <div className="space-y-2">
              {(categorized[category.id] || []).map((item: any) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  className={`px-3 py-1 rounded text-sm cursor-move ${
                    item.category === category.id
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }`}
                >
                  {item.label}
                  {item.category === category.id ? " ✓" : " ✗"}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center">
          {isComplete ? (
            <p className="text-lg font-bold text-green-600">Perfect! All investments correctly categorized! 🎉</p>
          ) : (
            <div>
              <p className="text-lg font-bold text-orange-600">Some items are in the wrong category!</p>
              <p className="text-sm text-muted-foreground">Check the items with ✗ marks and try moving them to the correct category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Scenario Activity Component
function ScenarioActivityComponent({ activity, onComplete }: { activity: any; onComplete: (points: number) => void }) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showOutcome, setShowOutcome] = useState(false)

  const handleSelect = (index: number) => {
    setSelectedOption(index)
    setShowOutcome(true)
    
    const option = activity.content.options[index]
    if (option.correct) {
      setTimeout(() => {
        onComplete(option.points)
      }, 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-6 rounded-lg">
        <h3 className="font-bold mb-2">📊 Scenario:</h3>
        <p className="text-lg mb-4">{activity.content.scenario || activity.content.situation}</p>
        <p className="text-sm text-muted-foreground italic">{activity.content.context || activity.content.question}</p>
        {activity.content.image && (
          <div className="mt-4 flex justify-center">
            <Image src={activity.content.image} alt="Scenario" width={80} height={80} />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {activity.content.options.map((option: any, index: number) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all ${
              selectedOption === index
                ? option.correct
                  ? "border-green-500 bg-green-50"
                  : "border-orange-500 bg-orange-50"
                : "hover:shadow-md"
            }`}
            onClick={() => !showOutcome && handleSelect(index)}
          >
            <CardContent className="p-4">
              <div className="font-medium mb-2">{option.label || option.text}</div>
              {showOutcome && selectedOption === index && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm">{option.outcome || option.feedback}</p>
                  <div className="mt-2">
                    {option.correct ? (
                      <Badge className="bg-green-600">+{option.points} points</Badge>
                    ) : (
                      <Badge variant="secondary">+{option.points} points</Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {showOutcome && selectedOption !== null && !activity.content.options[selectedOption].correct && (
        <Button onClick={() => onComplete(activity.content.options[selectedOption!].points)} className="w-full">
          Continue with {activity.content.options[selectedOption!].points} points
        </Button>
      )}
    </div>
  )
}

// Portfolio Building Activity Component
function PortfolioActivityComponent({ activity, onComplete }: { activity: any; onComplete: (points: number) => void }) {
  const [portfolio, setPortfolio] = useState<Record<string, number>>({})
  const [remaining, setRemaining] = useState(activity.content.budget)

  const handleInvest = (assetId: string, amount: number) => {
    const newPortfolio = { ...portfolio }
    newPortfolio[assetId] = (newPortfolio[assetId] || 0) + amount
    setPortfolio(newPortfolio)
    setRemaining(remaining - amount)
  }

  const calculateDiversification = () => {
    const types = new Set(
      Object.keys(portfolio).map(id => 
        activity.content.assets.find((a: any) => a.id === id)?.type
      )
    )
    return types.size
  }

  const handleComplete = () => {
    const diversificationScore = calculateDiversification()
    const points = Math.min(activity.points, diversificationScore * 5)
    onComplete(points)
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold">Budget: ${activity.content.budget}</p>
            <p className="text-sm text-muted-foreground">{activity.content.goal}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">Remaining: ${remaining}</p>
            <p className="text-sm">Diversity: {calculateDiversification()} types</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activity.content.assets.map((asset: any) => (
          <Card key={asset.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold">{asset.name}</h4>
                  <Badge variant="outline" className="mt-1">{asset.type}</Badge>
                </div>
                <Badge className={
                  asset.risk === "low" ? "bg-green-600" :
                  asset.risk === "medium" ? "bg-yellow-600" :
                  "bg-red-600"
                }>
                  {asset.risk} risk
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                Expected return: {asset.expectedReturn}
              </p>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleInvest(asset.id, asset.minInvestment)}
                  disabled={remaining < asset.minInvestment}
                >
                  +${asset.minInvestment}
                </Button>
                {portfolio[asset.id] && (
                  <Badge variant="secondary">
                    Invested: ${portfolio[asset.id]}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {remaining < 500 && (
        <Button onClick={handleComplete} className="w-full">
          Complete Portfolio (Diversity bonus: {calculateDiversification()} types)
        </Button>
      )}
    </div>
  )
}

// Match Activity Component
function MatchActivityComponent({ activity, onComplete }: { activity: any; onComplete: (points: number) => void }) {
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)
  const [selectedDef, setSelectedDef] = useState<string | null>(null)
  const [matched, setMatched] = useState<Record<string, string>>({})
  const [shuffledDefs] = useState(() => 
    [...activity.content.pairs].sort(() => Math.random() - 0.5)
  )

  useEffect(() => {
    if (selectedTerm && selectedDef) {
      const pair = activity.content.pairs.find((p: any) => p.term === selectedTerm)
      if (pair && pair.definition === selectedDef) {
        setMatched({ ...matched, [selectedTerm]: selectedDef })
      }
      setSelectedTerm(null)
      setSelectedDef(null)
    }
  }, [selectedTerm, selectedDef])

  useEffect(() => {
    if (Object.keys(matched).length === activity.content.pairs.length) {
      onComplete(activity.points)
    }
  }, [matched])

  return (
    <div className="space-y-6">
      <p className="text-center font-medium">{activity.content.instruction}</p>

      <div className="grid grid-cols-2 gap-6">
        {/* Terms */}
        <div className="space-y-3">
          <h3 className="font-bold text-center">Terms</h3>
          {activity.content.pairs.map((pair: any) => (
            <Button
              key={pair.term}
              variant={
                matched[pair.term] ? "default" :
                selectedTerm === pair.term ? "secondary" : "outline"
              }
              className="w-full justify-start"
              onClick={() => !matched[pair.term] && setSelectedTerm(pair.term)}
              disabled={!!matched[pair.term]}
            >
              {pair.term}
              {matched[pair.term] && " ✓"}
            </Button>
          ))}
        </div>

        {/* Definitions */}
        <div className="space-y-3">
          <h3 className="font-bold text-center">Definitions</h3>
          {shuffledDefs.map((pair: any) => {
            const isMatched = Object.values(matched).includes(pair.definition)
            return (
              <Button
                key={pair.definition}
                variant={
                  isMatched ? "default" :
                  selectedDef === pair.definition ? "secondary" : "outline"
                }
                className="w-full justify-start text-left h-auto py-2"
                onClick={() => !isMatched && setSelectedDef(pair.definition)}
                disabled={isMatched}
              >
                <span className="text-sm">{pair.definition}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {Object.keys(matched).length === activity.content.pairs.length && (
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">Perfect matches! You know your terms! 🎯</p>
        </div>
      )}
    </div>
  )
}

// Calculator Activity Component
function CalculatorActivityComponent({ activity, onComplete }: { activity: any; onComplete: (points: number) => void }) {
  const [amount, setAmount] = useState(activity.content.initialAmount)
  const [monthly, setMonthly] = useState(activity.content.monthlyContribution)
  const [years, setYears] = useState(activity.content.years)
  const [rate, setRate] = useState(activity.content.returnRate)

  const calculateFutureValue = () => {
    const monthlyRate = rate / 100 / 12
    const months = years * 12
    
    // Future value of initial amount
    const fvInitial = amount * Math.pow(1 + rate / 100, years)
    
    // Future value of monthly contributions
    const fvMonthly = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    
    return Math.round(fvInitial + fvMonthly)
  }

  const futureValue = calculateFutureValue()
  const totalContributed = amount + (monthly * years * 12)
  const earnings = futureValue - totalContributed

  return (
    <div className="space-y-6">
      <p className="text-center font-medium">{activity.content.instruction}</p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Initial Investment: ${amount}</label>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Monthly Contribution: ${monthly}</label>
          <input
            type="range"
            min="0"
            max="1000"
            step="50"
            value={monthly}
            onChange={(e) => setMonthly(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Time Period: {years} years</label>
          <input
            type="range"
            min="1"
            max="40"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Annual Return: {rate}%</label>
          <input
            type="range"
            min="1"
            max="12"
            step="0.5"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Contributed</p>
            <p className="text-xl font-bold">${totalContributed.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Investment Earnings</p>
            <p className="text-xl font-bold text-green-600">+${earnings.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Future Value</p>
            <p className="text-2xl font-bold text-primary">${futureValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">{activity.content.description}</p>
        <Button onClick={() => onComplete(activity.points)} className="w-full">
          Amazing! I understand compound interest!
        </Button>
      </div>
    </div>
  )
}
