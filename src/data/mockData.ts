import type {
  AccountSummary,
  AlertItem,
  ApiStatus,
  AssetSummary,
  MarketTicker,
  OpenOrder,
  PnlPoint,
  PnlSummary,
  Position,
  RiskMetric,
  TradeRecord,
} from "../types";

export const initialPositions: Position[] = [
  {
    id: "pos-btc-long",
    symbol: "BTCUSDT",
    side: "LONG",
    leverage: 10,
    quantity: 0.38,
    entryPrice: 62840,
    markPrice: 64925.4,
    unrealizedPnl: 792.45,
    roi: 12.62,
    margin: 6278.3,
    liquidationPrice: 57890,
  },
  {
    id: "pos-eth-short",
    symbol: "ETHUSDT",
    side: "SHORT",
    leverage: 8,
    quantity: 7.2,
    entryPrice: 3184.6,
    markPrice: 3098.2,
    unrealizedPnl: 622.08,
    roi: 21.63,
    margin: 2866.14,
    liquidationPrice: 3462.5,
  },
  {
    id: "pos-sol-long",
    symbol: "SOLUSDT",
    side: "LONG",
    leverage: 20,
    quantity: 185,
    entryPrice: 141.82,
    markPrice: 135.64,
    unrealizedPnl: -1143.3,
    roi: -43.58,
    margin: 1311.84,
    liquidationPrice: 131.6,
  },
  {
    id: "pos-bnb-short",
    symbol: "BNBUSDT",
    side: "SHORT",
    leverage: 12,
    quantity: 18,
    entryPrice: 591.4,
    markPrice: 604.1,
    unrealizedPnl: -228.6,
    roi: -25.78,
    margin: 887.1,
    liquidationPrice: 628.8,
  },
];

export const openOrders: OpenOrder[] = [
  {
    id: "ord-1",
    symbol: "BTCUSDT",
    type: "限价单",
    group: "普通委托",
    side: "卖出",
    price: 67200,
    quantity: 0.18,
    filled: 0.04,
    status: "部分成交",
    time: "2026-05-04 09:18:32",
  },
  {
    id: "ord-2",
    symbol: "ETHUSDT",
    type: "止盈单",
    group: "止盈止损",
    side: "买入",
    price: 2980,
    quantity: 3.5,
    filled: 0,
    status: "等待触发",
    time: "2026-05-04 08:41:05",
  },
  {
    id: "ord-3",
    symbol: "SOLUSDT",
    type: "止损单",
    group: "止盈止损",
    side: "卖出",
    price: 132.2,
    quantity: 100,
    filled: 0,
    status: "等待触发",
    time: "2026-05-04 07:55:21",
  },
  {
    id: "ord-4",
    symbol: "BNBUSDT",
    type: "条件单",
    group: "条件单",
    side: "买入",
    price: 618,
    quantity: 8,
    filled: 0,
    status: "新订单",
    time: "2026-05-03 22:14:43",
  },
];

export const pnlSummary: PnlSummary = {
  today: 42.63,
  sevenDays: 1898.44,
  thirtyDays: 5476.2,
  realized: 6280.72,
  unrealized: 42.63,
  fees: -384.9,
  funding: -419.62,
  net: 5518.83,
};

export const pnlSeries: PnlPoint[] = [
  { date: "04-05", equity: 40580, dailyPnl: -420, fundingIncome: -18.4 },
  { date: "04-06", equity: 41240, dailyPnl: 660, fundingIncome: -22.1 },
  { date: "04-07", equity: 41920, dailyPnl: 680, fundingIncome: 8.6 },
  { date: "04-08", equity: 41440, dailyPnl: -480, fundingIncome: -13.2 },
  { date: "04-09", equity: 42860, dailyPnl: 1420, fundingIncome: 17.8 },
  { date: "04-10", equity: 42390, dailyPnl: -470, fundingIncome: -9.5 },
  { date: "04-11", equity: 43530, dailyPnl: 1140, fundingIncome: 11.9 },
  { date: "04-12", equity: 44820, dailyPnl: 1290, fundingIncome: 16.4 },
  { date: "04-13", equity: 44660, dailyPnl: -160, fundingIncome: -6.7 },
  { date: "04-14", equity: 45770, dailyPnl: 1110, fundingIncome: 14.5 },
  { date: "04-15", equity: 46240, dailyPnl: 470, fundingIncome: 6.2 },
  { date: "04-16", equity: 45930, dailyPnl: -310, fundingIncome: -11.8 },
  { date: "04-17", equity: 47120, dailyPnl: 1190, fundingIncome: 19.3 },
  { date: "04-18", equity: 46810, dailyPnl: -310, fundingIncome: -8.4 },
  { date: "04-19", equity: 47520, dailyPnl: 710, fundingIncome: 12.1 },
  { date: "04-20", equity: 48180, dailyPnl: 660, fundingIncome: 9.8 },
  { date: "04-21", equity: 49210, dailyPnl: 1030, fundingIncome: 21.6 },
  { date: "04-22", equity: 48830, dailyPnl: -380, fundingIncome: -14.3 },
  { date: "04-23", equity: 50120, dailyPnl: 1290, fundingIncome: 18.9 },
  { date: "04-24", equity: 49670, dailyPnl: -450, fundingIncome: -16.8 },
  { date: "04-25", equity: 50880, dailyPnl: 1210, fundingIncome: 15.7 },
  { date: "04-26", equity: 51420, dailyPnl: 540, fundingIncome: 5.3 },
  { date: "04-27", equity: 50930, dailyPnl: -490, fundingIncome: -19.1 },
  { date: "04-28", equity: 51840, dailyPnl: 910, fundingIncome: 13.2 },
  { date: "04-29", equity: 52260, dailyPnl: 420, fundingIncome: 7.4 },
  { date: "04-30", equity: 52020, dailyPnl: -240, fundingIncome: -10.6 },
  { date: "05-01", equity: 53180, dailyPnl: 1160, fundingIncome: 22.9 },
  { date: "05-02", equity: 52790, dailyPnl: -390, fundingIncome: -12.7 },
  { date: "05-03", equity: 53510, dailyPnl: 720, fundingIncome: 10.1 },
  { date: "05-04", equity: 53552.63, dailyPnl: 42.63, fundingIncome: -4.6 },
];

export const assetSummary: AssetSummary = {
  totalEquity: 53552.63,
  availableBalance: 38112.49,
  positionMargin: 11343.38,
  orderFrozen: 4096.76,
  assets: [
    { asset: "USDT", value: 46250.18, percent: 86.36 },
    { asset: "BTC", value: 4104.72, percent: 7.66 },
    { asset: "ETH", value: 2197.73, percent: 4.1 },
    { asset: "BNB", value: 1000, percent: 1.87 },
  ],
};

export const marketTickers: MarketTicker[] = [
  { symbol: "BTCUSDT", price: 64925.4, change24h: 1.84, volume24h: "18.4B", fundingRate: 0.0087, nextFundingTime: "16:00" },
  { symbol: "ETHUSDT", price: 3098.2, change24h: -0.92, volume24h: "7.1B", fundingRate: -0.0042, nextFundingTime: "16:00" },
  { symbol: "BNBUSDT", price: 604.1, change24h: 0.42, volume24h: "1.2B", fundingRate: 0.0021, nextFundingTime: "16:00" },
  { symbol: "SOLUSDT", price: 135.64, change24h: -3.76, volume24h: "2.8B", fundingRate: 0.0154, nextFundingTime: "16:00" },
];

export const alerts: AlertItem[] = [
  {
    id: "alert-1",
    level: "danger",
    title: "SOLUSDT 接近强平",
    message: "距离强平约 2.98%，建议降低风险或补充保证金。",
    time: "09:42:18",
  },
  {
    id: "alert-2",
    level: "high",
    title: "高杠杆仓位",
    message: "SOLUSDT 当前 20x，波动放大后保证金消耗较快。",
    time: "09:31:04",
  },
  {
    id: "alert-3",
    level: "watch",
    title: "资金费率偏高",
    message: "SOLUSDT 资金费率 0.0154%，下一周期持仓成本上升。",
    time: "09:20:55",
  },
  {
    id: "alert-4",
    level: "safe",
    title: "订单部分成交",
    message: "BTCUSDT 限价委托已成交 22.22%。",
    time: "09:18:36",
  },
];

export const recentTrades: TradeRecord[] = [
  { id: "tr-1", time: "2026-05-04 09:18:35", symbol: "BTCUSDT", side: "卖出", price: 67200, quantity: 0.04, fee: 1.08, realizedPnl: 174.4 },
  { id: "tr-2", time: "2026-05-04 08:27:12", symbol: "ETHUSDT", side: "买入", price: 3104.2, quantity: 1.2, fee: 0.93, realizedPnl: 96.48 },
  { id: "tr-3", time: "2026-05-03 21:09:44", symbol: "SOLUSDT", side: "买入", price: 139.2, quantity: 60, fee: 2.51, realizedPnl: -156 },
  { id: "tr-4", time: "2026-05-03 16:44:01", symbol: "BNBUSDT", side: "卖出", price: 596.8, quantity: 10, fee: 1.79, realizedPnl: 88 },
  { id: "tr-5", time: "2026-05-03 10:23:19", symbol: "BTCUSDT", side: "买入", price: 64180, quantity: 0.09, fee: 1.73, realizedPnl: 0 },
];

export const apiStatus: ApiStatus = {
  restConnected: true,
  websocketConnected: true,
  lastSyncTime: "2026-05-04 09:45:22",
  latencyMs: 84,
  permission: "只读 + 平仓",
  ipWhitelist: true,
  updateFrequency: "账户 3s / 行情 1s",
};

export const buildAccountSummary = (positions: Position[]): AccountSummary => {
  const unrealized = positions.reduce((sum, item) => sum + item.unrealizedPnl, 0);
  return {
    totalEquity: assetSummary.totalEquity + unrealized - pnlSummary.unrealized,
    availableBalance: assetSummary.availableBalance,
    usedMargin: positions.reduce((sum, item) => sum + item.margin, 0),
    positionCount: positions.length,
    openOrderCount: openOrders.length,
    pnlToday: pnlSummary.today + unrealized - pnlSummary.unrealized,
    pnl7d: pnlSummary.sevenDays,
    pnl30d: pnlSummary.thirtyDays,
    riskLevel: positions.some((item) => item.symbol === "SOLUSDT") ? "high" : "watch",
  };
};

export const buildRiskMetric = (positions: Position[]): RiskMetric => {
  const totalPositionValue = positions.reduce((sum, item) => sum + item.markPrice * item.quantity, 0);
  const max = positions.reduce(
    (top, item) => {
      const value = item.markPrice * item.quantity;
      return value > top.value ? { symbol: item.symbol, value, ratio: (value / assetSummary.totalEquity) * 100 } : top;
    },
    { symbol: "-", value: 0, ratio: 0 },
  );

  return {
    marginRatio: 21.18,
    totalPositionValue,
    positionEquityRatio: (totalPositionValue / assetSummary.totalEquity) * 100,
    maxSymbolExposure: max,
    highLeverageCount: positions.filter((item) => item.leverage >= 15).length,
    nearLiquidationCount: positions.filter((item) => item.symbol === "SOLUSDT").length,
    lowAvailableMargin: assetSummary.availableBalance / assetSummary.totalEquity < 0.2,
    riskLevel: positions.some((item) => item.symbol === "SOLUSDT") ? "high" : "watch",
  };
};
