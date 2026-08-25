import { api } from "./client";
export type TransactionType = "INCOME" | "EXPENSE";
export type FinancialStatus =
  "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED";
export type FinancialTransaction = {
  id: string;
  type: TransactionType;
  description: string;
  amountCents: number;
  paidCents: number;
  status: FinancialStatus;
  dueDate: string;
  student?: { name: string } | null;
  guardian?: { name: string; phone: string } | null;
  vehicle?: { plate: string; model: string } | null;
};
export type FinanceDashboard = {
  balanceCents: number;
  incomeCents: number;
  expenseCents: number;
  resultCents: number;
  receivableCents: number;
  payableCents: number;
  overdueCents: number;
  delinquencyRate: number;
  projection: { days30Cents: number; days60Cents: number };
};
export const financeApi = {
  dashboard: () => api<FinanceDashboard>("/finance/dashboard"),
  transactions: (query = "") =>
    api<{ data: FinancialTransaction[]; total: number }>(
      `/finance/transactions${query ? `?${query}` : ""}`,
    ),
  create: (input: unknown) =>
    api<FinancialTransaction[]>("/finance/transactions", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  pay: (id: string, input: unknown) =>
    api<FinancialTransaction>(`/finance/transactions/${id}/payments`, {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify(input),
    }),
  cancel: (id: string, reason: string) =>
    api<FinancialTransaction>(`/finance/transactions/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};
