import type { FuturesPosition } from "../types.js";

export const mockPositions: FuturesPosition[] = [
  {
    symbol: "BTCUSDT",
    positionSide: "LONG",
    quantity: 0.38,
    entryPrice: 62840,
    markPrice: 64925.4,
    unrealizedPnl: 792.45,
    leverage: 10,
    liquidationPrice: 57890,
    margin: 6278.3,
  },
  {
    symbol: "ETHUSDT",
    positionSide: "SHORT",
    quantity: 7.2,
    entryPrice: 3184.6,
    markPrice: 3098.2,
    unrealizedPnl: 622.08,
    leverage: 8,
    liquidationPrice: 3462.5,
    margin: 2866.14,
  },
  {
    symbol: "SOLUSDT",
    positionSide: "LONG",
    quantity: 185,
    entryPrice: 141.82,
    markPrice: 135.64,
    unrealizedPnl: -1143.3,
    leverage: 20,
    liquidationPrice: 131.6,
    margin: 1311.84,
  },
];

const priceState = new Map(mockPositions.map((item) => [item.symbol, item.markPrice]));

export const getDynamicMockPositions = () => {
  return mockPositions.map((position) => {
    const previousPrice = priceState.get(position.symbol) ?? position.markPrice;
    const drift = 1 + (Math.random() - 0.5) * 0.0018;
    const markPrice = Number((previousPrice * drift).toFixed(position.markPrice > 1000 ? 2 : 4));
    priceState.set(position.symbol, markPrice);

    const unrealizedPnl =
      position.positionSide === "LONG"
        ? (markPrice - position.entryPrice) * position.quantity
        : (position.entryPrice - markPrice) * position.quantity;

    return {
      ...position,
      markPrice,
      unrealizedPnl: Number(unrealizedPnl.toFixed(2)),
      margin: Number(((position.entryPrice * position.quantity) / position.leverage).toFixed(2)),
    };
  });
};

export const mockOpenOrders = [
  {
    symbol: "BTCUSDT",
    type: "LIMIT",
    side: "SELL",
    price: "67200",
    origQty: "0.18",
    executedQty: "0.04",
    status: "PARTIALLY_FILLED",
    time: Date.now() - 1800000,
  },
];

export const mockRecentTrades = [
  {
    time: Date.now() - 900000,
    symbol: "BTCUSDT",
    side: "SELL",
    price: 67200,
    qty: 0.04,
    commission: 1.08,
    realizedPnl: 174.4,
  },
];

export const mockPnlSeries = [
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

export const mockMarketTickers = [
  { symbol: "BTCUSDT", price: 64925.4, change24h: 1.84, volume24h: "18.4B", fundingRate: 0.0087, nextFundingTime: "16:00" },
  { symbol: "ETHUSDT", price: 3098.2, change24h: -0.92, volume24h: "7.1B", fundingRate: -0.0042, nextFundingTime: "16:00" },
  { symbol: "BNBUSDT", price: 604.1, change24h: 0.42, volume24h: "1.2B", fundingRate: 0.0021, nextFundingTime: "16:00" },
  { symbol: "SOLUSDT", price: 135.64, change24h: -3.76, volume24h: "2.8B", fundingRate: 0.0154, nextFundingTime: "16:00" },
];
