import type { Position } from "../types";
import { closeLabel, currency, liquidationDistance, number, percent, pnlClass, sideLabel } from "../lib/format";

interface PositionsTableProps {
  positions: Position[];
  closingId: string | null;
  onCloseClick: (position: Position) => void;
}

export function PositionsTable({ positions, closingId, onCloseClick }: PositionsTableProps) {
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>交易对</th>
            <th>方向</th>
            <th>杠杆</th>
            <th>数量</th>
            <th>开仓均价</th>
            <th>标记价格</th>
            <th>未实现盈亏</th>
            <th>ROI</th>
            <th>占用保证金</th>
            <th>强平价格</th>
            <th>强平距离</th>
            <th>平仓操作</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => {
            const distance = liquidationDistance(position);
            const nearLiquidation = distance < 5;
            const sideClass = position.side === "LONG" ? "bg-long/10 text-long border-long/30" : "bg-short/10 text-short border-short/30";
            return (
              <tr key={position.id} className={nearLiquidation ? "bg-danger/8" : "hover:bg-panel2/50"}>
                <td className="font-mono font-semibold">{position.symbol}</td>
                <td>
                  <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${sideClass}`}>
                    {sideLabel(position.side)}
                  </span>
                </td>
                <td className={position.leverage >= 15 ? "font-semibold text-warn" : ""}>{position.leverage}x</td>
                <td className="font-mono">{number(position.quantity, 4)}</td>
                <td className="font-mono">{currency(position.entryPrice)}</td>
                <td className="font-mono">{currency(position.markPrice)}</td>
                <td className={`font-mono font-semibold ${pnlClass(position.unrealizedPnl)}`}>{currency(position.unrealizedPnl)}</td>
                <td className={`font-mono font-semibold ${pnlClass(position.roi)}`}>{percent(position.roi)}</td>
                <td className="font-mono">{currency(position.margin)}</td>
                <td className="font-mono">{currency(position.liquidationPrice)}</td>
                <td>
                  <span className={`font-mono font-semibold ${nearLiquidation ? "text-danger" : "text-text"}`}>{percent(distance)}</span>
                  {nearLiquidation ? <div className="mt-1 text-xs text-danger">接近强平</div> : null}
                </td>
                <td>
                  <button
                    className={`min-w-[72px] rounded-md px-3 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70 ${
                      position.side === "LONG" ? "bg-long hover:bg-long/90" : "bg-short hover:bg-short/90"
                    }`}
                    disabled={closingId === position.id}
                    onClick={() => onCloseClick(position)}
                  >
                    {closingId === position.id ? "处理中" : closeLabel(position.side)}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {positions.length === 0 ? <div className="py-10 text-center text-sm text-muted">当前没有持仓。</div> : null}
    </div>
  );
}
