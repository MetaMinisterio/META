"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { getFinancialSummary } from "@/lib/actions/finances";
import { TrendingUp } from "lucide-react";

type Series = { month: string; income: number; expense: number };

const PERIODS = [
  { label: "3 meses", value: 3 },
  { label: "6 meses", value: 6 },
  { label: "12 meses", value: 12 },
];

function formatBRL(v: number) {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs space-y-1.5">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: {formatBRL(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function FinancialChart({ initialSeries, initialMonths = 6 }: { initialSeries: Series[]; initialMonths?: number }) {
  const [months, setMonths] = useState(initialMonths);
  const [series, setSeries] = useState<Series[]>(initialSeries);
  const [loading, setLoading] = useState(false);

  async function changePeriod(m: number) {
    setLoading(true);
    setMonths(m);
    const result = await getFinancialSummary(m);
    setSeries(result.series);
    setLoading(false);
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gold" strokeWidth={1.5} />
          <h3 className="font-bold text-foreground">Entradas × Saídas</h3>
        </div>
        <div className="flex rounded-xl bg-muted p-0.5 w-fit">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => changePeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                months === p.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="skeleton h-48 rounded-xl" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={series} barGap={4} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={52} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
            <Legend formatter={(v) => v === "income" ? "Entradas" : "Saídas"} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Bar dataKey="income" name="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
