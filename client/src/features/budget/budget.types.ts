export type Expense = {
  id: string;
  trip_id: string;
  title: string;
  amount_cents: number;
  currency: string;
  category: string | null;
  split_type: "equal" | "custom" | "full" | null;
  paid_by: string;
  date: string | null;
  notes: string | null;
  created_at: string;
  payer?: {
    display_name: string | null;
    email: string;
  };
};

export type ExpenseSplit = {
  id: string;
  expense_id: string;
  trip_id: string;
  user_id: string;
  amount_cents: number;
  is_settled: boolean;
};

export type BudgetSummary = {
  total_cents: number;
  budget_cents: number;
  by_category: { category: string; total_cents: number; count: number }[];
  by_member: { user_id: string; total_cents: number; display_name: string | null }[];
};

export type Settlement = {
  from_user_id: string;
  from_name: string;
  to_user_id: string;
  to_name: string;
  amount_cents: number;
};

export type SettlementSummary = {
  balances: { user_id: string; display_name: string; net_cents: number }[];
  settlements: Settlement[];
};

export type CreateExpenseInput = {
  title: string;
  amount_cents: number;
  currency?: string;
  category?: string;
  split_type?: "equal" | "custom" | "full";
  paid_by: string;
  date?: string;
  notes?: string;
  splits?: { user_id: string; amount_cents: number }[];
};
