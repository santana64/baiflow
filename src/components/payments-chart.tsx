"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export type MonthlyChartData = {
  month: string;
  encaissé: number;
  impayé: number;
};

function formatEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export function PaymentsChart({ data }: { data: MonthlyChartData[] }) {
  if (data.every((d) => d.encaissé === 0 && d.impayé === 0)) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-ink/40">Pas encore de données à afficher.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradEncaisse" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#5c8c6e" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#5c8c6e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradImpaie" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#e05252" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#e05252" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9a8f82" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#9a8f82" }} axisLine={false} tickLine={false} width={36} />
        <Tooltip
          formatter={(value, name) => [typeof value === "number" ? formatEuro(value) : value, name]}
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e5", fontSize: 12, color: "#0a0a0a" }}
          labelStyle={{ fontWeight: 600, color: "#0a0a0a" }}
        />
        <Area type="monotone" dataKey="encaissé" stroke="#5c8c6e" strokeWidth={2} fill="url(#gradEncaisse)" dot={false} activeDot={{ r: 4 }} />
        <Area type="monotone" dataKey="impayé" stroke="#e05252" strokeWidth={2} fill="url(#gradImpaie)" dot={false} activeDot={{ r: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
