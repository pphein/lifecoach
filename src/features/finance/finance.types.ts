export interface FinanceRecord {
  id?: number;
  date: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  note: string;
}

export const INCOME_CATEGORIES = ["Salary", "Freelance", "Business", "Investment", "Other"];
export const EXPENSE_CATEGORIES = ["Food", "House", "Child", "Transport", "Health", "Education", "Entertainment", "Other"];
