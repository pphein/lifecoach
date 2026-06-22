export interface Award {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredStreak: number;
  unlocked: boolean;
}

export function getAwards(streak: number): Award[] {
  return [
    {
      id: "7days",
      name: "7 Days Strong",
      description: "Complete 7 consecutive days with 70%+ score",
      icon: "🔥",
      requiredStreak: 7,
      unlocked: streak >= 7,
    },
    {
      id: "30days",
      name: "30 Days Warrior",
      description: "Complete 30 consecutive days with 70%+ score",
      icon: "🏆",
      requiredStreak: 30,
      unlocked: streak >= 30,
    },
    {
      id: "100days",
      name: "100 Days Builder",
      description: "Complete 100 consecutive days with 70%+ score",
      icon: "🥇",
      requiredStreak: 100,
      unlocked: streak >= 100,
    },
    {
      id: "365days",
      name: "Life Master",
      description: "Complete a full year with 70%+ score",
      icon: "👑",
      requiredStreak: 365,
      unlocked: streak >= 365,
    },
  ];
}
