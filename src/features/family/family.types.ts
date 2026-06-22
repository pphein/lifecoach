export type FamilyMember = "wife" | "daughter" | "family";

export interface FamilyRecord {
  id?: number;
  date: string;
  type: FamilyMember;
  activity: string;
  minutes: number;
  score: number;
}

export const ACTIVITY_SUGGESTIONS: Record<FamilyMember, string[]> = {
  wife: ["Quality Time", "Date Night", "Deep Conversation", "Help with Tasks", "Cook Together", "Romantic Gesture", "Walk Together"],
  daughter: ["Playtime", "Reading Together", "School Help", "Outdoor Fun", "Creative Activity", "Bedtime Story", "Drawing"],
  family: ["Family Dinner", "Movie Night", "Board Game", "Day Trip", "Walk Together", "Cook Together", "Prayer/Devotion"],
};
