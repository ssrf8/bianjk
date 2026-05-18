import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { AssetSummary } from "../types";
import { currency, percent } from "../lib/format";

const COLORS = ["#27c7d8", "#18c683", "#f6c343", "#ff5f6d"];

interface AssetDistributionProps {
  summary: AssetSummary;
}

export function AssetDistribution({ summary }: AssetDistributionProps) {
  const rows = [
    ["总权益", summary.totalEquity],
    ["可用余额", summary.availableBalance],
    ["持仓占用保证金", summary.positionMargin],
    ["挂单冻结资金", summary.orderFrozen],
  ] as const;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-md bg-panel2 p-3">
            <div className="metric-label mb-2">{label}</div>
            <div className="font-mono font-semibold text-text">{currency(value)}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={summary.assets} dataKey="value" nameKey="asset" innerRadius={45} outerRadius={70} paddingAngle={2}>
                {summary.assets.map((item, index) => (
                  <Cell key={item.asset} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0e141d", border: "1px solid #223044", borderRadius: 8 }} formatter={(value) => currency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {summary.assets.map((item, index) => (
            <div key={item.asset} className="flex items-center justify-between rounded-md bg-panel2 px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                {item.asset}
              </span>
              <span className="font-mono text-muted">
                {currency(item.value)} / {percent(item.percent)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
