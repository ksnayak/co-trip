import { Request, Response } from "express";
import * as budgetService from "../services/budget.service";
import { param } from "../utils/params";

export async function list(req: Request, res: Response) {
  const expenses = await budgetService.getExpenses(param(req, "tripId"));
  res.json(expenses);
}

export async function get(req: Request, res: Response) {
  const expense = await budgetService.getExpense(param(req, "expenseId"));
  res.json(expense);
}

export async function create(req: Request, res: Response) {
  const expense = await budgetService.createExpense(req.user!.id, {
    ...req.body,
    trip_id: param(req, "tripId"),
  });
  res.status(201).json(expense);
}

export async function update(req: Request, res: Response) {
  const expense = await budgetService.updateExpense(
    param(req, "expenseId"),
    req.body
  );
  res.json(expense);
}

export async function remove(req: Request, res: Response) {
  await budgetService.deleteExpense(param(req, "expenseId"));
  res.status(204).end();
}

export async function summary(req: Request, res: Response) {
  const data = await budgetService.getSummary(param(req, "tripId"));
  res.json(data);
}

export async function settlements(req: Request, res: Response) {
  const data = await budgetService.getSettlementSummary(param(req, "tripId"));
  res.json(data);
}
