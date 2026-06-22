export interface Habit {
  id?: number;
  title: string;
  category: "health" | "family" | "wealth";
  completed: boolean;
  date: string;
}

export interface HabitTemplate {
  title: string;
  category: "health" | "family" | "wealth";
}

export const DEFAULT_HABITS: HabitTemplate[] = [
  { title: "Exercise",        category: "health" },
  { title: "Water 2L",        category: "health" },
  { title: "Protein Breakfast", category: "health" },
  { title: "Walk",            category: "health" },
  { title: "Sleep 7h",        category: "health" },
  { title: "Wife Time",       category: "family" },
  { title: "Daughter Play",   category: "family" },
  { title: "Family Meal",     category: "family" },
  { title: "Learn Skill",     category: "wealth" },
  { title: "Save Money",      category: "wealth" },
  { title: "Side Project",    category: "wealth" },
];
