import { Activity, BarChart3, CircleDollarSign, ShieldAlert, Wallet } from "lucide-react";
import type { AccountSummary } from "../types";
import { currency, pnlClass, riskMeta } from "../lib/format";

interface AccountOverviewProps {
  summary: AccountSummary;
}

export function AccountOverview({ summary }: AccountOverviewProps) {
  const cards = [
    { label: "合约账户总资产", value: currency(summary.totalEquity), icon: Wallet, className: "text-text" },
    { label: "可用余额", value: currency(summary.availableBalance), icon: CircleDollarSign, className: "text-cyan" },
    { label: "占用保证金", value: currency(summary.usedMargin), icon: BarChart3, className: "text-warn" },
    { label: "当前持仓数量", value: String(summary.positionCount), icon: Activity, className: "text-text" },
    { label: "进行中订单", value: String(summary.openOrderCount), icon: Activity, className: "text-text" },
    { label: "今日盈亏", value: currency(summary.pnlToday), icon: BarChart3, className: pnlClass(summary.pnlToday) },
    { label: "7 日盈亏", value: currency(summary.pnl7d), icon: BarChart3, className: pnlClass(summary.pnl7d) },
    { label: "30 日盈亏", value: currency(summary.pnl30d), icon: BarChart3, className: pnlClass(summary.pnl30d) },
  ];
  const meta = riskMeta[summary.riskLevel];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-9">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="panel min-h-[88px] p-3 xl:col-span-1">
            <div className="mb-3 flex items-center justify-between">
              <span className="metric-label">{card.label}</span>
              <Icon className="h-4 w-4 text-muted" />
            </div>
            <div className={`font-mono text-xl font-semibold ${card.className}`}>{card.value}</div>
          </div>
        );
      })}
      <div className={`panel min-h-[88px] border p-3 ${meta.className}`}>
        <div className="mb-3 flex items-center justify-between">
          <span className="metric-label">当前账户风险等级</span>
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2 text-xl font-semibold">
          <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </div>
      </div>
    </div>
  );
}
