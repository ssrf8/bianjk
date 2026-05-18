import { AlertOctagon, ShieldCheck } from "lucide-react";
import type { RiskMetric } from "../types";
import { currency, percent, riskMeta } from "../lib/format";

interface RiskMonitorProps {
  risk: RiskMetric;
}

export function RiskMonitor({ risk }: RiskMonitorProps) {
  const meta = riskMeta[risk.riskLevel];
  const warnings = [
    risk.highLeverageCount > 0 ? `${risk.highLeverageCount} 个高杠杆仓位需要关注` : null,
    risk.nearLiquidationCount > 0 ? `${risk.nearLiquidationCount} 个仓位接近强平` : null,
    risk.lowAvailableMargin ? "可用保证金比例不足" : null,
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      <div className={`rounded-lg border p-4 ${meta.className}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">风险等级</span>
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="mt-3 text-2xl font-semibold">{meta.label}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Metric label="账户保证金率" value={percent(risk.marginRatio)} />
        <Metric label="总仓位价值" value={currency(risk.totalPositionValue)} />
        <Metric label="仓位/权益比例" value={percent(risk.positionEquityRatio)} />
        <Metric label="最大风险敞口" value={`${risk.maxSymbolExposure.symbol} ${percent(risk.maxSymbolExposure.ratio)}`} />
      </div>
      <div className="space-y-2">
        {warnings.map((warning) => (
          <div key={warning} className="flex items-center gap-2 rounded-md border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger">
            <AlertOctagon className="h-4 w-4" />
            {warning}
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-panel2 p-3">
      <div className="metric-label mb-2">{label}</div>
      <div className="font-mono text-sm font-semibold text-text">{value}</div>
    </div>
  );
}
