"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "./auth-provider"

interface Accessory {
  id: string
  name: string
  emoji: string
  cost: number
  currency: "honkPoints" | "goldenEggs"
  category: "hats" | "accessories" | "backgrounds"
  unlocked: boolean
}

const accessories: Accessory[] = [
  // Hats
  { id: "basic", name: "No Hat", emoji: "", cost: 0, currency: "honkPoints", category: "hats", unlocked: true },
  { id: "tophat", name: "Top Hat", emoji: "🎩", cost: 100, currency: "honkPoints", category: "hats", unlocked: false },
  { id: "cap", name: "Baseball Cap", emoji: "🧢", cost: 50, currency: "honkPoints", category: "hats", unlocked: false },
  { id: "crown", name: "Royal Crown", emoji: "👑", cost: 5, currency: "goldenEggs", category: "hats", unlocked: false },

  // Accessories
  {
    id: "none",
    name: "No Accessory",
    emoji: "",
    cost: 0,
    currency: "honkPoints",
    category: "accessories",
    unlocked: true,
  },
  {
    id: "monocle",
    name: "Monocle",
    emoji: "🧐",
    cost: 75,
    currency: "honkPoints",
    category: "accessories",
    unlocked: false,
  },
  {
    id: "briefcase",
    name: "Briefcase",
    emoji: "💼",
    cost: 150,
    currency: "honkPoints",
    category: "accessories",
    unlocked: false,
  },
  {
    id: "glasses",
    name: "Smart Glasses",
    emoji: "🤓",
    cost: 3,
    currency: "goldenEggs",
    category: "accessories",
    unlocked: false,
  },

  // Backgrounds
  { id: "default", name: "Pond", emoji: "🏞️", cost: 0, currency: "honkPoints", category: "backgrounds", unlocked: true },
  {
    id: "wallstreet",
    name: "Wall Street",
    emoji: "🏢",
    cost: 200,
    currency: "honkPoints",
    category: "backgrounds",
    unlocked: false,
  },
  {
    id: "baystreet",
    name: "Bay Street",
    emoji: "🇨🇦",
    cost: 250,
    currency: "honkPoints",
    category: "backgrounds",
    unlocked: false,
  },
  {
    id: "crypto",
    name: "Crypto Mine",
    emoji: "⛏️",
    cost: 8,
    currency: "goldenEggs",
    category: "backgrounds",
    unlocked: false,
  },
]

export function GooseCustomization() {
  const { user, updateUser } = useAuth()
  const [selectedHat, setSelectedHat] = useState(
    user?.gooseAccessories.find((acc) => accessories.find((a) => a.id === acc)?.category === "hats") || "basic",
  )
  const [selectedAccessory, setSelectedAccessory] = useState(
    user?.gooseAccessories.find((acc) => accessories.find((a) => a.id === acc)?.category === "accessories") || "none",
  )
  const [selectedBackground, setSelectedBackground] = useState(
    user?.gooseAccessories.find((acc) => accessories.find((a) => a.id === acc)?.category === "backgrounds") ||
      "default",
  )

  if (!user) return null

  const purchaseAccessory = (accessory: Accessory) => {
    if (accessory.currency === "honkPoints" && user.honkPoints >= accessory.cost) {
      updateUser({
        honkPoints: user.honkPoints - accessory.cost,
        gooseAccessories: [...user.gooseAccessories, accessory.id],
      })
    } else if (accessory.currency === "goldenEggs" && user.goldenEggs >= accessory.cost) {
      updateUser({
        goldenEggs: user.goldenEggs - accessory.cost,
        gooseAccessories: [...user.gooseAccessories, accessory.id],
      })
    }
  }

  const isOwned = (accessoryId: string) => user.gooseAccessories.includes(accessoryId)
  const canAfford = (accessory: Accessory) => {
    if (accessory.currency === "honkPoints") return user.honkPoints >= accessory.cost
    return user.goldenEggs >= accessory.cost
  }

  const getGooseDisplay = () => {
    const hat = accessories.find((a) => a.id === selectedHat)
    const accessory = accessories.find((a) => a.id === selectedAccessory)
    const background = accessories.find((a) => a.id === selectedBackground)

    return (
      <div className="text-center p-8 bg-gradient-to-b from-sky-100 to-green-100 rounded-lg">
        <div className="text-6xl mb-2">{background?.emoji}</div>
        <div className="relative inline-block">
          <div className="text-8xl">🪿</div>
          {hat?.emoji && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-4xl">{hat.emoji}</div>
          )}
          {accessory?.emoji && <div className="absolute top-4 -right-2 text-3xl">{accessory.emoji}</div>}
        </div>
        <div className="mt-4 text-lg font-medium">Your Goose</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold mb-2">Customize Your Goose</h1>
        <p className="text-muted-foreground">Make your goose unique with accessories!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goose Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {getGooseDisplay()}
            <div className="mt-4 flex justify-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{user.honkPoints}</div>
                <div className="text-sm text-muted-foreground">Honk Points</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-accent">{user.goldenEggs}</div>
                <div className="text-sm text-muted-foreground">Golden Eggs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customization Options */}
        <Card>
          <CardHeader>
            <CardTitle>Accessories</CardTitle>
            <CardDescription>Customize your goose with hats, accessories, and backgrounds</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="hats">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="hats">Hats</TabsTrigger>
                <TabsTrigger value="accessories">Accessories</TabsTrigger>
                <TabsTrigger value="backgrounds">Backgrounds</TabsTrigger>
              </TabsList>

              <TabsContent value="hats" className="space-y-3">
                {accessories
                  .filter((a) => a.category === "hats")
                  .map((accessory) => (
                    <div key={accessory.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{accessory.emoji || "🪿"}</div>
                        <div>
                          <div className="font-medium">{accessory.name}</div>
                          {accessory.cost > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {accessory.cost} {accessory.currency === "honkPoints" ? "🪙" : "🥚"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOwned(accessory.id) ? (
                          <>
                            <Badge variant="secondary">Owned</Badge>
                            <Button
                              size="sm"
                              variant={selectedHat === accessory.id ? "default" : "outline"}
                              onClick={() => setSelectedHat(accessory.id)}
                            >
                              {selectedHat === accessory.id ? "Equipped" : "Equip"}
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            disabled={!canAfford(accessory)}
                            onClick={() => purchaseAccessory(accessory)}
                          >
                            Buy
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value="accessories" className="space-y-3">
                {accessories
                  .filter((a) => a.category === "accessories")
                  .map((accessory) => (
                    <div key={accessory.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{accessory.emoji || "🪿"}</div>
                        <div>
                          <div className="font-medium">{accessory.name}</div>
                          {accessory.cost > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {accessory.cost} {accessory.currency === "honkPoints" ? "🪙" : "🥚"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOwned(accessory.id) ? (
                          <>
                            <Badge variant="secondary">Owned</Badge>
                            <Button
                              size="sm"
                              variant={selectedAccessory === accessory.id ? "default" : "outline"}
                              onClick={() => setSelectedAccessory(accessory.id)}
                            >
                              {selectedAccessory === accessory.id ? "Equipped" : "Equip"}
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            disabled={!canAfford(accessory)}
                            onClick={() => purchaseAccessory(accessory)}
                          >
                            Buy
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value="backgrounds" className="space-y-3">
                {accessories
                  .filter((a) => a.category === "backgrounds")
                  .map((accessory) => (
                    <div key={accessory.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{accessory.emoji}</div>
                        <div>
                          <div className="font-medium">{accessory.name}</div>
                          {accessory.cost > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {accessory.cost} {accessory.currency === "honkPoints" ? "🪙" : "🥚"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOwned(accessory.id) ? (
                          <>
                            <Badge variant="secondary">Owned</Badge>
                            <Button
                              size="sm"
                              variant={selectedBackground === accessory.id ? "default" : "outline"}
                              onClick={() => setSelectedBackground(accessory.id)}
                            >
                              {selectedBackground === accessory.id ? "Equipped" : "Equip"}
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            disabled={!canAfford(accessory)}
                            onClick={() => purchaseAccessory(accessory)}
                          >
                            Buy
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
