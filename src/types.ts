export type RiskLevel = "safe" | "watch" | "high" | "danger";
export type PositionSide = "LONG" | "SHORT";

export interface AccountSummary {
  totalEquity: number;
  availableBalance: number;
  usedMargin: number;
  positionCount: number;
  openOrderCount: number;
  pnlToday: number;
  pnl7d: number;
  pnl30d: number;
  riskLevel: RiskLevel;
}

export interface Position {
  id: string;
  symbol: string;
  side: PositionSide;
  leverage: number;
  quantity: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  roi: number;
  margin: number;
  liquidationPrice: number;
}

export interface OpenOrder {
  id: string;
  symbol: string;
  type: "限价单" | "市价单" | "止盈单" | "止损单" | "条件单";
  group: "普通委托" | "止盈止损" | "条件单";
  side: "买入" | "卖出";
  price: number;
  quantity: number;
  filled: number;
  status: "新订单" | "部分成交" | "等待触发";
  time: string;
}

export interface PnlPoint {
  date: string;
  equity: number;
  dailyPnl: number;
  fundingIncome: number;
}

export interface PnlSummary {
  today: number;
  sevenDays: number;
  thirtyDays: number;
  realized: number;
  unrealized: number;
  fees: number;
  funding: number;
  net: number;
}

export interface AssetSlice {
  asset: string;
  value: number;
  percent: number;
}

export interface AssetSummary {
  totalEquity: number;
  availableBalance: number;
  positionMargin: number;
  orderFrozen: number;
  assets: AssetSlice[];
}

export interface RiskMetric {
  marginRatio: number;
  totalPositionValue: number;
  positionEquityRatio: number;
  maxSymbolExposure: {
    symbol: string;
    value: number;
    ratio: number;
  };
  highLeverageCount: number;
  nearLiquidationCount: number;
  lowAvailableMargin: boolean;
  riskLevel: RiskLevel;
}

export interface MarketTicker {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: string;
  fundingRate: number;
  nextFundingTime: string;
}

export interface AlertItem {
  id: string;
  level: RiskLevel;
  title: string;
  message: string;
  time: string;
}

export interface TradeRecord {
  id: string;
  time: string;
  symbol: string;
  side: "买入" | "卖出";
  price: number;
  quantity: number;
  fee: number;
  realizedPnl: number;
}

export interface ApiStatus {
  restConnected: boolean;
  websocketConnected: boolean;
  lastSyncTime: string;
  latencyMs: number;
  permission: "只读 + 平仓" | "只读" | "异常";
  ipWhitelist: boolean;
  updateFrequency: string;
}
