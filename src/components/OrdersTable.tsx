import type { OpenOrder } from "../types";
import { currency, number } from "../lib/format";

interface OrdersTableProps {
  orders: OpenOrder[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>交易对</th>
            <th>订单类型</th>
            <th>方向</th>
            <th>委托价格</th>
            <th>委托数量</th>
            <th>已成交</th>
            <th>剩余</th>
            <th>状态</th>
            <th>下单时间</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const progress = order.quantity > 0 ? (order.filled / order.quantity) * 100 : 0;
            const tagClass =
              order.group === "普通委托"
                ? "border-cyan/30 bg-cyan/10 text-cyan"
                : order.group === "止盈止损"
                  ? "border-warn/30 bg-warn/10 text-warn"
                  : "border-purple-400/30 bg-purple-500/10 text-purple-300";
            return (
              <tr key={order.id} className="hover:bg-panel2/50">
                <td className="font-mono font-semibold">{order.symbol}</td>
                <td>
                  <span className={`inline-flex rounded-md border px-2 py-1 text-xs ${tagClass}`}>{order.type}</span>
                </td>
                <td className={order.side === "买入" ? "text-long" : "text-short"}>{order.side}</td>
                <td className="font-mono">{currency(order.price)}</td>
                <td className="font-mono">{number(order.quantity, 4)}</td>
                <td className="min-w-[130px]">
                  <div className="mb-1 flex justify-between gap-2 font-mono text-xs">
                    <span>{number(order.filled, 4)}</span>
                    <span className="text-muted">{number(progress, 0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-line">
                    <div className="h-full rounded-full bg-cyan" style={{ width: `${progress}%` }} />
                  </div>
                </td>
                <td className="font-mono">{number(order.quantity - order.filled, 4)}</td>
                <td>{order.status}</td>
                <td className="font-mono text-xs text-muted">{order.time}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
