import type { TradeRecord } from "../types";
import { currency, number, pnlClass } from "../lib/format";

interface TradesTableProps {
  trades: TradeRecord[];
}

export function TradesTable({ trades }: TradesTableProps) {
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>交易对</th>
            <th>方向</th>
            <th>成交价格</th>
            <th>成交数量</th>
            <th>手续费</th>
            <th>已实现盈亏</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className="hover:bg-panel2/50">
              <td className="font-mono text-xs text-muted">{trade.time}</td>
              <td className="font-mono font-semibold">{trade.symbol}</td>
              <td className={trade.side === "买入" ? "text-long" : "text-short"}>{trade.side}</td>
              <td className="font-mono">{currency(trade.price)}</td>
              <td className="font-mono">{number(trade.quantity, 4)}</td>
              <td className="font-mono text-muted">{currency(trade.fee)}</td>
              <td className={`font-mono font-semibold ${pnlClass(trade.realizedPnl)}`}>{currency(trade.realizedPnl)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
