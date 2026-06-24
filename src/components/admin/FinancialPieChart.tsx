"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PieChart as PieIcon } from "lucide-react";

type Slice = { name: string; color: string; value: number; type: string };

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-foreground">{d.name}</p>
      <p style={{ color: d.payload.color }}>R$ {d.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
    </div>
  );
}

export default function FinancialPieChart({ data }: { data: Slice[] }) {
  if (!data.length) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] gap-2">
        <PieIcon className="w-8 h-8 text-muted-foreground/30" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">Sem dados para exibir</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <PieIcon className="w-5 h-5 text-gold" strokeWidth={1.5} />
        <h3 className="font-bold text-foreground">Distribuição Financeira</h3>
        <span className="text-xs text-muted-foreground ml-auto">Este mês</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(v) => <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{v}</span>}
            wrapperStyle={{ paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
