import { AlertTriangle, X } from "lucide-react";
import type { Position } from "../types";
import { closeLabel, currency, pnlClass, sideLabel } from "../lib/format";

interface ClosePositionModalProps {
  position: Position | null;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ClosePositionModal({ position, loading, error, onCancel, onConfirm }: ClosePositionModalProps) {
  if (!position) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-line bg-panel shadow-glow">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warn" />
            <h3 className="text-base font-semibold text-text">确认{closeLabel(position.side)}</h3>
          </div>
          <button
            aria-label="关闭"
            className="rounded-md p-1.5 text-muted hover:bg-panel2 hover:text-text"
            disabled={loading}
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div className="rounded-lg border border-warn/30 bg-warn/10 p-3 text-sm text-warn">
            平仓请求将提交到后端接口，由后端复核当前持仓并使用 reduceOnly 执行。前端不会直接调用 Binance 签名接口。
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Info label="交易对" value={position.symbol} />
            <Info label="方向" value={sideLabel(position.side)} />
            <Info label="持仓数量" value={String(position.quantity)} />
            <Info label="当前标记价格" value={currency(position.markPrice)} />
            <Info label="预计未实现盈亏" value={currency(position.unrealizedPnl)} valueClass={pnlClass(position.unrealizedPnl)} />
            <Info label="后端接口" value="/api/futures/close-position" />
          </dl>
          {error ? <div className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div> : null}
        </div>
        <div className="flex justify-end gap-3 border-t border-line px-5 py-4">
          <button
            className="rounded-md border border-line px-4 py-2 text-sm text-muted hover:bg-panel2 hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className="rounded-md bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger/90 disabled:cursor-wait disabled:opacity-70"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "平仓中..." : `确认${closeLabel(position.side)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, valueClass = "text-text" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-md bg-panel2 p-3">
      <dt className="mb-1 text-xs text-muted">{label}</dt>
      <dd className={`font-mono text-sm font-semibold ${valueClass}`}>{value}</dd>
    </div>
  );
}
