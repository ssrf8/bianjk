import type { MarketTicker } from "../types";
import { currency, percent, pnlClass } from "../lib/format";

interface MarketWatchProps {
  tickers: MarketTicker[];
}

export function MarketWatch({ tickers }: MarketWatchProps) {
  return (
    <div className="space-y-2">
      {tickers.map((ticker) => (
        <div key={ticker.symbol} className="rounded-md bg-panel2 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono font-semibold text-text">{ticker.symbol}</span>
            <span className={`font-mono text-sm font-semibold ${pnlClass(ticker.change24h)}`}>{percent(ticker.change24h)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted">
            <span>最新价格</span>
            <span className="text-right font-mono text-text">{currency(ticker.price)}</span>
            <span>24h 成交量</span>
            <span className="text-right font-mono">{ticker.volume24h}</span>
            <span>资金费率</span>
            <span className={`text-right font-mono ${pnlClass(ticker.fundingRate)}`}>{percent(ticker.fundingRate, 4)}</span>
            <span>下次结算</span>
            <span className="text-right font-mono">{ticker.nextFundingTime}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
