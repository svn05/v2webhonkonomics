"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "./auth-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Accessory {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  currency: "honkPoints" | "goldenEggs";
  category: "hats" | "accessories" | "backgrounds";
  unlocked: boolean;
  imageSrc?: string;
  rotateDeg?: number;
}

const accessories: Accessory[] = [
  // Hats
  {
    id: "basic",
    name: "No Hat",
    emoji: "",
    cost: 0,
    currency: "honkPoints",
    category: "hats",
    unlocked: true,
  },
  {
    id: "rbchat",
    name: "RBC Hat",
    emoji: "",
    imageSrc: "/rbchat.png",
    rotateDeg: -12,
    cost: 0,
    currency: "honkPoints",
    category: "hats",
    unlocked: true,
  },
  {
    id: "tophat",
    name: "Top Hat",
    emoji: "🎩",
    cost: 100,
    currency: "honkPoints",
    category: "hats",
    unlocked: false,
  },
  {
    id: "cap",
    name: "Baseball Cap",
    emoji: "🧢",
    cost: 50,
    currency: "honkPoints",
    category: "hats",
    unlocked: false,
  },
  {
    id: "crown",
    name: "Royal Crown",
    emoji: "👑",
    cost: 5,
    currency: "goldenEggs",
    category: "hats",
    unlocked: false,
  },

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
    emoji: "",
    imageSrc: "/goose_glasses.png",
    cost: 3,
    currency: "goldenEggs",
    category: "accessories",
    unlocked: false,
  },

  // Backgrounds (real images)
  {
    id: "default",
    name: "Pond",
    emoji: "",
    imageSrc: "/pond.png",
    cost: 0,
    currency: "honkPoints",
    category: "backgrounds",
    unlocked: true,
  },
  {
    id: "wallstreet",
    name: "Wall Street",
    emoji: "",
    imageSrc: "/wallst.png",
    cost: 200,
    currency: "honkPoints",
    category: "backgrounds",
    unlocked: false,
  },
  {
    id: "baystreet",
    name: "Bay Street",
    emoji: "",
    imageSrc: "/bayst.png",
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
];

export function GooseCustomization() {
  const { user, updateUser } = useAuth();
  const [selectedHat, setSelectedHat] = useState(
    user?.equippedHat ||
      (user?.gooseAccessories.includes("rbchat") ? "rbchat" : "basic")
  );
  const [selectedAccessory, setSelectedAccessory] = useState(
    user?.equippedAccessory || "none"
  );
  const [selectedBackground, setSelectedBackground] = useState(
    user?.equippedBackground || "default"
  );

  if (!user) return null;

  const purchaseAccessory = (accessory: Accessory) => {
    if (
      accessory.currency === "honkPoints" &&
      user.honkPoints >= accessory.cost
    ) {
      updateUser({
        honkPoints: user.honkPoints - accessory.cost,
        gooseAccessories: [...user.gooseAccessories, accessory.id],
      });
    } else if (
      accessory.currency === "goldenEggs" &&
      user.goldenEggs >= accessory.cost
    ) {
      updateUser({
        goldenEggs: user.goldenEggs - accessory.cost,
        gooseAccessories: [...user.gooseAccessories, accessory.id],
      });
    }
  };

  const isOwned = (accessoryId: string) =>
    user.gooseAccessories.includes(accessoryId);
  const canAfford = (accessory: Accessory) => {
    if (accessory.currency === "honkPoints")
      return user.honkPoints >= accessory.cost;
    return user.goldenEggs >= accessory.cost;
  };

  const getGooseDisplay = () => {
    const hat = accessories.find((a) => a.id === selectedHat);
    const accessory = accessories.find((a) => a.id === selectedAccessory);
    const background = accessories.find((a) => a.id === selectedBackground);

    // Map backgrounds to real image sources
    const bgSrc = background?.imageSrc || "/pond.png";
    const tuning = user.gooseTuning || {
      gooseY: 16,
      gooseScale: 1.0,
      hatY: 24,
      hatDeg: 0,
    };

    return (
      <div className="relative w-full h-80 rounded-lg overflow-hidden border">
        {/* Background image */}
        <Image src={bgSrc} alt="Background" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/10" />

        {/* Goose container (position + scale) */}
        <div
          className="absolute bottom-0 left-1/2 w-48 h-48 relative"
          style={{
            transform: `translate(-50%, ${tuning.gooseY}px) scale(${tuning.gooseScale})`,
          }}
        >
          <Image
            src="/goose_waving.png"
            alt="Goose"
            fill
            className="object-contain pointer-events-none select-none"
          />

          {/* Hat overlay (rotatable) */}
          {hat?.imageSrc ? (
            <Image
              src={hat.imageSrc}
              alt={hat.name}
              width={60}
              height={60}
              className="absolute left-1/2 origin-bottom pointer-events-none"
              style={{
                transform: `translate(-50%, ${tuning.hatY}px) rotate(${
                  (hat.rotateDeg ?? 0) + tuning.hatDeg
                }deg)`,
              }}
            />
          ) : hat?.emoji ? (
            <div
              className="absolute left-1/2 origin-bottom text-3xl"
              style={{
                transform: `translate(-50%, ${tuning.hatY}px) rotate(${
                  (hat?.rotateDeg ?? 0) + tuning.hatDeg
                }deg)`,
              }}
            >
              {hat.emoji}
            </div>
          ) : null}

          {/* Accessory overlay: image or emoji */}
          {accessory?.imageSrc ? (
            <Image
              src={accessory.imageSrc}
              alt={accessory.name}
              width={100}
              height={56}
              className="absolute top-20 left-1/2 -translate-x-1/2"
            />
          ) : accessory?.emoji ? (
            <div className="absolute top-4 -right-2 text-3xl">
              {accessory.emoji}
            </div>
          ) : null}
        </div>

        <div className="absolute left-0 right-0 bottom-1 text-center text-xs font-medium text-background/90 bg-background/20 backdrop-blur-sm">
          Your Goose
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold mb-2">Customize Your Goose</h1>
        <p className="text-muted-foreground">
          Make your goose unique with accessories!
        </p>
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
                <div className="text-lg font-bold text-primary">
                  {user.honkPoints}
                </div>
                <div className="text-sm text-muted-foreground">Honk Points</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-accent">
                  {user.goldenEggs}
                </div>
                <div className="text-sm text-muted-foreground">Golden Eggs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customization Options */}
        <Card>
          <CardHeader>
            <CardTitle>Accessories</CardTitle>
            <CardDescription>
              Customize your goose with hats, accessories, and backgrounds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="hats">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="hats">Hats</TabsTrigger>
                <TabsTrigger value="accessories">Accessories</TabsTrigger>
                <TabsTrigger value="backgrounds">Backgrounds</TabsTrigger>
                <TabsTrigger value="tuning">Tuning</TabsTrigger>
              </TabsList>

              <TabsContent value="hats" className="space-y-3">
                {accessories
                  .filter((a) => a.category === "hats")
                  .map((accessory) => (
                    <div
                      key={accessory.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {accessory.imageSrc ? (
                            <Image
                              src={accessory.imageSrc}
                              alt={accessory.name}
                              width={28}
                              height={28}
                              className="rounded"
                            />
                          ) : (
                            accessory.emoji || "🪿"
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{accessory.name}</div>
                          {accessory.cost > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {accessory.cost}{" "}
                              {accessory.currency === "honkPoints"
                                ? "🪙"
                                : "🥚"}
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
                              variant={
                                selectedHat === accessory.id
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => {
                                setSelectedHat(accessory.id);
                                updateUser({ equippedHat: accessory.id });
                              }}
                            >
                              {selectedHat === accessory.id
                                ? "Equipped"
                                : "Equip"}
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
                    <div
                      key={accessory.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {accessory.imageSrc ? (
                            <Image
                              src={accessory.imageSrc}
                              alt={accessory.name}
                              width={28}
                              height={28}
                              className="rounded"
                            />
                          ) : (
                            accessory.emoji || "🪿"
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{accessory.name}</div>
                          {accessory.cost > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {accessory.cost}{" "}
                              {accessory.currency === "honkPoints"
                                ? "🪙"
                                : "🥚"}
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
                              variant={
                                selectedAccessory === accessory.id
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => {
                                setSelectedAccessory(accessory.id);
                                updateUser({ equippedAccessory: accessory.id });
                              }}
                            >
                              {selectedAccessory === accessory.id
                                ? "Equipped"
                                : "Equip"}
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
                    <div
                      key={accessory.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {accessory.imageSrc ? (
                            <Image
                              src={accessory.imageSrc}
                              alt={accessory.name}
                              width={28}
                              height={28}
                              className="rounded"
                            />
                          ) : (
                            accessory.emoji
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{accessory.name}</div>
                          {accessory.cost > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {accessory.cost}{" "}
                              {accessory.currency === "honkPoints"
                                ? "🪙"
                                : "🥚"}
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
                              variant={
                                selectedBackground === accessory.id
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => {
                                setSelectedBackground(accessory.id);
                                updateUser({
                                  equippedBackground: accessory.id,
                                });
                              }}
                            >
                              {selectedBackground === accessory.id
                                ? "Equipped"
                                : "Equip"}
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

              <TabsContent value="tuning" className="space-y-4">
                {(() => {
                  const t = user.gooseTuning || {
                    gooseY: 16,
                    gooseScale: 1.0,
                    hatY: 24,
                    hatDeg: 0,
                  };
                  const updateT = (patch: Partial<typeof t>) => {
                    const next = { ...t, ...patch };
                    updateUser({ gooseTuning: next });
                  };
                  return (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">
                          Goose vertical offset: {t.gooseY}px
                        </Label>
                        <input
                          type="range"
                          min={-40}
                          max={60}
                          step={1}
                          defaultValue={t.gooseY}
                          onChange={(e) =>
                            updateT({
                              gooseY: parseInt(e.currentTarget.value, 10),
                            })
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">
                          Goose scale: {t.gooseScale.toFixed(2)}x
                        </Label>
                        <input
                          type="range"
                          min={0.8}
                          max={1.4}
                          step={0.02}
                          defaultValue={t.gooseScale}
                          onChange={(e) =>
                            updateT({
                              gooseScale: parseFloat(e.currentTarget.value),
                            })
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">
                          Hat vertical offset: {t.hatY}px
                        </Label>
                        <input
                          type="range"
                          min={-20}
                          max={60}
                          step={1}
                          defaultValue={t.hatY}
                          onChange={(e) =>
                            updateT({
                              hatY: parseInt(e.currentTarget.value, 10),
                            })
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">
                          Hat rotation: {t.hatDeg}°
                        </Label>
                        <input
                          type="range"
                          min={-30}
                          max={30}
                          step={1}
                          defaultValue={t.hatDeg}
                          onChange={(e) =>
                            updateT({
                              hatDeg: parseInt(e.currentTarget.value, 10),
                            })
                          }
                          className="w-full"
                        />
                      </div>
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateT({
                              gooseY: 16,
                              gooseScale: 1.0,
                              hatY: 24,
                              hatDeg: 0,
                            })
                          }
                        >
                          Reset defaults
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
