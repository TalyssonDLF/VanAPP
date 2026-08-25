import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Plus,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  financeApi,
  FinanceDashboard,
  FinancialStatus,
  FinancialTransaction,
  TransactionType,
} from "@/lib/api/finance";
const money = (c: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    c / 100,
  );
const dateText = (v: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(v));
const statuses: Record<FinancialStatus, string> = {
  PENDING: "Pendente",
  PARTIAL: "Parcial",
  PAID: "Pago",
  OVERDUE: "Atrasado",
  CANCELLED: "Cancelado",
};
function Metric({
  title,
  value,
  icon: Icon,
  onClick,
  tone = "neutral",
}: {
  title: string;
  value: number;
  icon: typeof Wallet;
  onClick?: () => void;
  tone?: "neutral" | "green" | "red";
}) {
  return (
    <button className="text-left" onClick={onClick}>
      <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">{title}</span>
            <Icon
              size={18}
              className={
                tone === "green"
                  ? "text-emerald-600"
                  : tone === "red"
                    ? "text-red-600"
                    : "text-neutral-500"
              }
            />
          </div>
          <strong
            className={`mt-3 block text-2xl ${tone === "green" ? "text-emerald-700" : tone === "red" ? "text-red-700" : ""}`}
          >
            {money(value)}
          </strong>
        </CardContent>
      </Card>
    </button>
  );
}
function TransactionForm({
  type,
  onDone,
  onClose,
}: {
  type: TransactionType;
  onDone: () => void;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const d = new FormData(e.currentTarget);
    try {
      await financeApi.create({
        type,
        description: d.get("description"),
        amountCents: Math.round(Number(d.get("amount")) * 100),
        dueDate: d.get("dueDate"),
        competence: d.get("competence"),
        paymentMethod: d.get("paymentMethod") || undefined,
        installmentCount: Number(d.get("installments")) || 1,
      });
      toast.success(
        type === "INCOME" ? "Receita cadastrada." : "Despesa cadastrada.",
      );
      onDone();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível salvar.",
      );
    } finally {
      setSaving(false);
    }
  }
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/30 sm:place-items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-title"
    >
      <form
        onSubmit={submit}
        className="w-full rounded-t-2xl bg-white p-6 shadow-xl sm:max-w-lg sm:rounded-xl"
      >
        <h2 id="transaction-title" className="text-xl font-semibold">
          Nova {type === "INCOME" ? "receita" : "despesa"}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Informe o essencial agora. Você poderá complementar depois.
        </p>
        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              required
              maxLength={160}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                inputMode="decimal"
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Vencimento</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={today}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="competence">Competência</Label>
              <Input
                id="competence"
                name="competence"
                type="date"
                defaultValue={today}
                required
              />
            </div>
            <div>
              <Label htmlFor="installments">Parcelas</Label>
              <Input
                id="installments"
                name="installments"
                type="number"
                min="1"
                max="120"
                defaultValue="1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="paymentMethod">Forma prevista</Label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              className="mt-1 h-9 w-full rounded-md border bg-white px-3 text-sm"
            >
              <option value="">Não informada</option>
              <option value="PIX">Pix</option>
              <option value="CASH">Dinheiro</option>
              <option value="CARD">Cartão</option>
              <option value="BOLETO">Boleto</option>
              <option value="TRANSFER">Transferência</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={saving}>
            {saving ? "Salvando..." : "Salvar lançamento"}
          </Button>
        </div>
      </form>
    </div>
  );
}
export function FinancePage() {
  const [data, setData] = useState<FinanceDashboard | null>(null),
    [items, setItems] = useState<FinancialTransaction[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(false),
    [filter, setFilter] = useState(""),
    [form, setForm] = useState<TransactionType | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [d, t] = await Promise.all([
        financeApi.dashboard(),
        financeApi.transactions(filter),
      ]);
      setData(d);
      setItems(t.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [filter]);
  useEffect(() => {
    void load();
  }, [load]);
  if (loading && !data)
    return (
      <div aria-label="Carregando financeiro" className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((x) => (
            <Skeleton key={x} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  if (error && !data)
    return (
      <div className="mx-auto mt-20 max-w-md text-center">
        <AlertCircle className="mx-auto text-red-600" />
        <h1 className="mt-4 text-xl font-semibold">
          Não foi possível carregar o financeiro
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Confira sua conexão e tente novamente. Seus dados permanecem seguros.
        </p>
        <Button className="mt-5" onClick={() => void load()}>
          <RefreshCw size={16} />
          Tentar novamente
        </Button>
      </div>
    );
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Gestão financeira
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Financeiro</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Entenda quanto o seu negócio realmente está rendendo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setForm("INCOME")}>
            <ArrowUpRight size={16} />
            Receita
          </Button>
          <Button onClick={() => setForm("EXPENSE")}>
            <Plus size={16} />
            Despesa
          </Button>
        </div>
      </header>
      {data && (
        <>
          <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              title="Saldo atual"
              value={data.balanceCents}
              icon={Wallet}
            />
            <Metric
              title="Entradas no mês"
              value={data.incomeCents}
              icon={ArrowUpRight}
              tone="green"
              onClick={() => setFilter("type=INCOME")}
            />
            <Metric
              title="Saídas no mês"
              value={data.expenseCents}
              icon={ArrowDownRight}
              tone="red"
              onClick={() => setFilter("type=EXPENSE")}
            />
            <Metric
              title="Resultado do mês"
              value={data.resultCents}
              icon={Wallet}
              tone={data.resultCents >= 0 ? "green" : "red"}
            />
          </section>
          <section className="mt-4 grid gap-4 sm:grid-cols-3">
            <Metric
              title="A receber"
              value={data.receivableCents}
              icon={CalendarDays}
              onClick={() => setFilter("type=INCOME&status=PENDING")}
            />
            <Metric
              title={`Em atraso · ${data.delinquencyRate}%`}
              value={data.overdueCents}
              icon={AlertCircle}
              tone="red"
              onClick={() => setFilter("status=OVERDUE")}
            />
            <Metric
              title="A pagar"
              value={data.payableCents}
              icon={CalendarDays}
              onClick={() => setFilter("type=EXPENSE&status=PENDING")}
            />
          </section>
          <section className="mt-7 grid gap-5 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de caixa</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="flex h-44 items-end justify-around gap-5 border-b pb-2"
                  aria-label="Comparativo de entradas e saídas"
                >
                  {[
                    [data.incomeCents, "bg-emerald-500", "Receitas"],
                    [data.expenseCents, "bg-red-400", "Despesas"],
                  ].map(([value, color, label]) => (
                    <div
                      key={String(label)}
                      className="flex h-full w-24 items-end"
                    >
                      <div
                        className={`w-full rounded-t ${color}`}
                        style={{
                          height: `${Math.max(8, Math.min(100, (Number(value) / Math.max(data.incomeCents, data.expenseCents, 1)) * 100))}%`,
                        }}
                        title={`${label}: ${money(Number(value))}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-center gap-8 text-sm">
                  <span>
                    <i className="mr-2 inline-block size-2 rounded-full bg-emerald-500" />
                    Entradas
                  </span>
                  <span>
                    <i className="mr-2 inline-block size-2 rounded-full bg-red-400" />
                    Saídas
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Saldo projetado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <span className="text-sm text-neutral-500">Em 30 dias</span>
                  <strong className="block text-xl">
                    {money(data.projection.days30Cents)}
                  </strong>
                </div>
                <div>
                  <span className="text-sm text-neutral-500">Em 60 dias</span>
                  <strong className="block text-xl">
                    {money(data.projection.days60Cents)}
                  </strong>
                </div>
                <p className="text-xs text-neutral-500">
                  Estimativa baseada nos lançamentos previstos; não é
                  aconselhamento contábil.
                </p>
              </CardContent>
            </Card>
          </section>
        </>
      )}
      <Card className="mt-7">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Lançamentos</CardTitle>
            <p className="mt-1 text-sm text-neutral-500">
              Receitas, despesas e mensalidades em um só lugar.
            </p>
          </div>
          {filter && (
            <Button variant="ghost" onClick={() => setFilter("")}>
              Limpar filtro
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <Wallet className="mx-auto text-neutral-400" />
              <h3 className="mt-3 font-medium">Nenhum lançamento encontrado</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">
                Registre mensalidades, combustível e outros custos para
                descobrir o resultado real da sua operação.
              </p>
              <Button className="mt-4" onClick={() => setForm("EXPENSE")}>
                <Plus size={16} />
                Adicionar lançamento
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 py-4"
                >
                  <div
                    className={`grid size-9 place-items-center rounded-full ${item.type === "INCOME" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                  >
                    {item.type === "INCOME" ? (
                      <ArrowUpRight size={17} />
                    ) : (
                      <ArrowDownRight size={17} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.description}</p>
                    <p className="text-xs text-neutral-500">
                      Vence {dateText(item.dueDate)}
                      {item.student ? ` · ${item.student.name}` : ""}
                      {item.vehicle ? ` · ${item.vehicle.plate}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline">{statuses[item.status]}</Badge>
                  <div className="min-w-28 text-right">
                    <strong
                      className={
                        item.type === "INCOME"
                          ? "text-emerald-700"
                          : "text-red-700"
                      }
                    >
                      {item.type === "INCOME" ? "+ " : "- "}
                      {money(item.amountCents)}
                    </strong>
                    {item.status === "PARTIAL" && (
                      <small className="block text-neutral-500">
                        restam {money(item.amountCents - item.paidCents)}
                      </small>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {form && (
        <TransactionForm
          type={form}
          onClose={() => setForm(null)}
          onDone={() => {
            setForm(null);
            void load();
          }}
        />
      )}
    </>
  );
}
