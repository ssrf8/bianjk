import { CheckCircle2, Clock, KeyRound, Radio, Shield, Wifi } from "lucide-react";
import type { ApiStatus } from "../types";

interface ApiStatusPanelProps {
  status: ApiStatus;
}

export function ApiStatusPanel({ status }: ApiStatusPanelProps) {
  const rows = [
    { label: "Binance API", value: status.restConnected ? "已连接" : "异常", icon: Wifi, ok: status.restConnected },
    { label: "WebSocket", value: status.websocketConnected ? "实时连接" : "断开", icon: Radio, ok: status.websocketConnected },
    { label: "最近同步", value: status.lastSyncTime, icon: Clock, ok: true },
    { label: "API 延迟", value: `${status.latencyMs} ms`, icon: CheckCircle2, ok: status.latencyMs < 200 },
    { label: "权限状态", value: status.permission, icon: KeyRound, ok: status.permission === "只读 + 平仓" },
    { label: "IP 白名单", value: status.ipWhitelist ? "已启用" : "未启用", icon: Shield, ok: status.ipWhitelist },
    { label: "更新频率", value: status.updateFrequency, icon: Clock, ok: true },
  ];

  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const Icon = row.icon;
        return (
          <div key={row.label} className="flex items-center justify-between gap-3 rounded-md bg-panel2 px-3 py-2 text-sm">
            <span className="flex items-center gap-2 text-muted">
              <Icon className={row.ok ? "h-4 w-4 text-long" : "h-4 w-4 text-danger"} />
              {row.label}
            </span>
            <span className="text-right font-mono text-text">{row.value}</span>
          </div>
        );
      })}
      <div className="rounded-md border border-cyan/30 bg-cyan/10 px-3 py-2 text-xs leading-5 text-cyan">
        API Secret 只允许存放在后端环境变量中；前端仅展示数据并请求后端平仓接口。
      </div>
    </div>
  );
}
