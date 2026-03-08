import * as expensesRepo from "../repositories/expenses.repository";
import * as splitsRepo from "../repositories/expense_splits.repository";
import { supabase } from "../lib/supabase";
import { NotFoundError } from "../utils/errors";

export async function getExpenses(tripId: string) {
  return expensesRepo.findByTripId(tripId);
}

export async function getExpense(id: string) {
  const expense = await expensesRepo.findById(id);
  if (!expense) throw new NotFoundError("Expense not found");
  return expense;
}

export async function createExpense(
  userId: string,
  data: {
    trip_id: string;
    title: string;
    amount_cents: number;
    currency?: string;
    category?: string;
    split_type?: string;
    paid_by?: string;
    date?: string;
    notes?: string;
    splits?: { user_id: string; amount_cents: number }[];
  }
) {
  const { splits, ...expenseData } = data;
  const expense = await expensesRepo.create({
    ...expenseData,
    paid_by: expenseData.paid_by || userId,
  });

  if (data.split_type === "equal") {
    const { data: members } = await supabase
      .from("trip_members")
      .select("user_id")
      .eq("trip_id", data.trip_id);

    if (members && members.length > 0) {
      const perPerson = Math.floor(data.amount_cents / members.length);
      const remainder = data.amount_cents - perPerson * members.length;

      const splitRows = members.map((m, i) => ({
        expense_id: expense.id,
        trip_id: data.trip_id,
        user_id: m.user_id,
        amount_cents: perPerson + (i === 0 ? remainder : 0),
      }));

      await splitsRepo.createMany(splitRows);
    }
  } else if (data.split_type === "custom" && splits && splits.length > 0) {
    const splitRows = splits.map((s) => ({
      expense_id: expense.id,
      trip_id: data.trip_id,
      user_id: s.user_id,
      amount_cents: s.amount_cents,
    }));

    await splitsRepo.createMany(splitRows);
  }

  return expense;
}

export async function updateExpense(
  id: string,
  data: Partial<{
    title: string;
    amount_cents: number;
    currency: string;
    category: string;
    split_type: string;
    paid_by: string;
    date: string;
    notes: string;
  }>
) {
  const expense = await expensesRepo.update(id, data);
  if (!expense) throw new NotFoundError("Expense not found");
  return expense;
}

export async function deleteExpense(id: string) {
  await expensesRepo.softDelete(id);
}

export async function getSummary(tripId: string) {
  const rows = await expensesRepo.getBudgetSummary(tripId);

  const { data: trip } = await supabase
    .from("trips")
    .select("budget_cents")
    .eq("id", tripId)
    .single();

  const { data: memberSpending } = await supabase
    .from("expenses")
    .select("paid_by, amount_cents, profiles:paid_by(display_name)")
    .eq("trip_id", tripId)
    .is("deleted_at", null);

  const by_category = rows.map((r: { category: string; total_cents: number; count: number }) => ({
    category: r.category || "other",
    total_cents: Number(r.total_cents),
    count: Number(r.count),
  }));

  const total_cents = by_category.reduce((sum: number, c: { total_cents: number }) => sum + c.total_cents, 0);

  const memberMap = new Map<string, { total_cents: number; display_name: string | null }>();
  for (const row of memberSpending || []) {
    const existing = memberMap.get(row.paid_by) || { total_cents: 0, display_name: null };
    existing.total_cents += row.amount_cents;
    const profile = (row as Record<string, unknown>).profiles as { display_name: string | null } | null;
    if (profile?.display_name) existing.display_name = profile.display_name;
    memberMap.set(row.paid_by, existing);
  }

  const by_member = Array.from(memberMap.entries()).map(([user_id, val]) => ({
    user_id,
    total_cents: val.total_cents,
    display_name: val.display_name,
  }));

  return {
    total_cents,
    budget_cents: trip?.budget_cents || 0,
    by_category,
    by_member,
  };
}

export async function getSettlementSummary(tripId: string) {
  const splits = await splitsRepo.findByTripId(tripId);
  const expenses = await expensesRepo.findByTripId(tripId);

  const balances = new Map<string, { paid: number; owes: number; name: string }>();

  for (const split of splits) {
    const profile = (split as Record<string, unknown>).profiles as { id: string; display_name: string | null; email: string } | null;
    if (!balances.has(split.user_id)) {
      balances.set(split.user_id, {
        paid: 0,
        owes: 0,
        name: profile?.display_name || profile?.email || "Unknown",
      });
    }
    if (!split.is_settled) {
      balances.get(split.user_id)!.owes += split.amount_cents;
    }
  }

  for (const expense of expenses) {
    const payerId = expense.paid_by;
    if (!payerId) continue;
    if (!balances.has(payerId)) {
      const payer = (expense as Record<string, unknown>).profiles as { display_name: string | null; email: string } | null;
      balances.set(payerId, {
        paid: 0,
        owes: 0,
        name: payer?.display_name || payer?.email || "Unknown",
      });
    }
    balances.get(payerId)!.paid += expense.amount_cents;
  }

  const netBalances = Array.from(balances.entries()).map(([userId, b]) => ({
    user_id: userId,
    display_name: b.name,
    net_cents: b.paid - b.owes,
  }));

  const debtors = netBalances.filter((b) => b.net_cents < 0).map((b) => ({ ...b, remaining: -b.net_cents }));
  const creditors = netBalances.filter((b) => b.net_cents > 0).map((b) => ({ ...b, remaining: b.net_cents }));

  const settlements: {
    from_user_id: string;
    from_name: string;
    to_user_id: string;
    to_name: string;
    amount_cents: number;
  }[] = [];

  let di = 0;
  let ci = 0;
  while (di < debtors.length && ci < creditors.length) {
    const amount = Math.min(debtors[di].remaining, creditors[ci].remaining);
    if (amount > 0) {
      settlements.push({
        from_user_id: debtors[di].user_id,
        from_name: debtors[di].display_name,
        to_user_id: creditors[ci].user_id,
        to_name: creditors[ci].display_name,
        amount_cents: amount,
      });
    }
    debtors[di].remaining -= amount;
    creditors[ci].remaining -= amount;
    if (debtors[di].remaining === 0) di++;
    if (creditors[ci].remaining === 0) ci++;
  }

  return { balances: netBalances, settlements };
}
