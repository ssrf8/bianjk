import type { AlertItem } from "../types";
import { riskMeta } from "../lib/format";

interface AlertsPanelProps {
  alerts: AlertItem[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const meta = riskMeta[alert.level];
        return (
          <div key={alert.id} className={`rounded-md border p-3 ${meta.className}`}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">{alert.title}</span>
              <span className="font-mono text-xs opacity-80">{alert.time}</span>
            </div>
            <p className="m-0 text-sm opacity-90">{alert.message}</p>
          </div>
        );
      })}
    </div>
  );
}
