import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PnlPoint, PnlSummary } from "../types";
import { currency, pnlClass } from "../lib/format";

interface PnlChartsProps {
  summary: PnlSummary;
  data: PnlPoint[];
}

export function PnlCharts({ summary, data }: PnlChartsProps) {
  const metrics = [
    ["今日", summary.today],
    ["7 日", summary.sevenDays],
    ["30 日", summary.thirtyDays],
    ["已实现", summary.realized],
    ["未实现", summary.unrealized],
    ["手续费", summary.fees],
    ["资金费率", summary.funding],
    ["净收益", summary.net],
  ] as const;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-md bg-panel2 p-2.5">
            <div className="metric-label mb-1">{label}</div>
            <div className={`font-mono text-base font-semibold ${pnlClass(value)}`}>{currency(value)}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <div className="h-60 rounded-md bg-panel2 p-3">
          <div className="mb-2 text-sm font-medium text-text">账户净值</div>
          <ResponsiveContainer width="100%" height="86%">
            <LineChart data={data}>
              <CartesianGrid stroke="#223044" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#8ea0b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#8ea0b8" tick={{ fontSize: 11 }} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
              <Tooltip
                contentStyle={{ background: "#0e141d", border: "1px solid #223044", borderRadius: 8 }}
                formatter={(value) => currency(Number(value))}
              />
              <Line type="monotone" dataKey="equity" stroke="#27c7d8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-60 rounded-md bg-panel2 p-3">
          <div className="mb-2 text-sm font-medium text-text">每日盈亏</div>
          <ResponsiveContainer width="100%" height="86%">
            <BarChart data={data}>
              <CartesianGrid stroke="#223044" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#8ea0b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#8ea0b8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#0e141d", border: "1px solid #223044", borderRadius: 8 }}
                formatter={(value) => currency(Number(value))}
              />
              <Bar dataKey="dailyPnl" radius={[4, 4, 0, 0]}>
                {data.map((point) => (
                  <Cell key={point.date} fill={point.dailyPnl >= 0 ? "#18c683" : "#ff5f6d"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-60 rounded-md bg-panel2 p-3">
          <div className="mb-2 text-sm font-medium text-text">近期资金收益</div>
          <ResponsiveContainer width="100%" height="86%">
            <LineChart data={data}>
              <CartesianGrid stroke="#223044" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#8ea0b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#8ea0b8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#0e141d", border: "1px solid #223044", borderRadius: 8 }}
                formatter={(value) => currency(Number(value))}
              />
              <Line type="monotone" dataKey="fundingIncome" stroke="#f6c343" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
