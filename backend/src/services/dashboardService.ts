import { config } from "../config.js";
import { mockMarketTickers, mockOpenOrders, mockPnlSeries, mockRecentTrades } from "../data/mockData.js";
import { binanceClient } from "../lib/binanceClient.js";
import type { FuturesPosition } from "../types.js";
import { getPositions } from "./positionService.js";

type RiskLevel = "safe" | "watch" | "high" | "danger";

interface BinanceAccountAsset {
  asset: string;
  walletBalance: string;
  marginBalance?: string;
  availableBalance?: string;
}

interface BinanceAccount {
  totalMarginBalance: string;
  availableBalance: string;
  totalInitialMargin: string;
  totalOpenOrderInitialMargin: string;
  totalMaintMargin: string;
  assets: BinanceAccountAsset[];
}

interface BinanceOpenOrder {
  orderId: number;
  symbol: string;
  type: string;
  side: "BUY" | "SELL";
  price: string;
  origQty: string;
  executedQty: string;
  status: string;
  time: number;
}

interface BinanceIncome {
  time: number;
  income: string;
  incomeType: string;
  symbol?: string;
}

interface BinanceTrade {
  id: number;
  time: number;
  symbol: string;
  side: "BUY" | "SELL";
  price: string;
  qty: string;
  commission: string;
  realizedPnl: string;
}

interface BinanceTicker24h {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
}

interface BinancePremiumIndex {
  symbol: string;
  markPrice: string;
  lastFundingRate: string;
  nextFundingTime: number;
}

const dayMs = 24 * 60 * 60 * 1000;

const formatDateTime = (value: number) => new Date(value).toLocaleString("zh-CN", { hour12: false });

const formatShortTime = (value: number) =>
  new Date(value).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const formatVolume = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
};

const orderTypeLabel = (type: string) => {
  if (type.includes("TAKE_PROFIT")) return "止盈单";
  if (type.includes("STOP")) return "止损单";
  if (type === "MARKET") return "市价单";
  if (type === "LIMIT") return "限价单";
  return "条件单";
};

const orderGroup = (type: string) => {
  if (type.includes("TAKE_PROFIT") || type.includes("STOP")) return "止盈止损";
  if (type === "LIMIT" || type === "MARKET") return "普通委托";
  return "条件单";
};

const orderStatusLabel = (status: string) => {
  if (status === "PARTIALLY_FILLED") return "部分成交";
  if (status === "NEW") return "新订单";
  return "等待触发";
};

const sideLabel = (side: "BUY" | "SELL") => (side === "BUY" ? "买入" : "卖出");

const calcRiskLevel = (account: BinanceAccount | null, positions: FuturesPosition[]): RiskLevel => {
  const equity = account ? Number(account.totalMarginBalance) : 53552.63;
  const maintMargin = account ? Number(account.totalMaintMargin) : 0;
  const marginRatio = equity > 0 ? (maintMargin / equity) * 100 : 0;
  const nearLiquidation = positions.some((position) => {
    const distance =
      position.positionSide === "LONG"
        ? ((position.markPrice - position.liquidationPrice) / position.markPrice) * 100
        : ((position.liquidationPrice - position.markPrice) / position.markPrice) * 100;
    return distance > 0 && distance < 5;
  });

  if (marginRatio >= 80 || nearLiquidation) return "danger";
  if (marginRatio >= 50 || positions.some((item) => item.leverage >= 20)) return "high";
  if (marginRatio >= 25 || positions.some((item) => item.leverage >= 10)) return "watch";
  return "safe";
};

const liquidationDistance = (position: FuturesPosition) => {
  if (position.liquidationPrice <= 0 || position.markPrice <= 0) return 999;
  const distance =
    position.positionSide === "LONG"
      ? ((position.markPrice - position.liquidationPrice) / position.markPrice) * 100
      : ((position.liquidationPrice - position.markPrice) / position.markPrice) * 100;
  return Math.max(distance, 0);
};

const buildAlerts = (positions: FuturesPosition[], marketTickers: Array<{ symbol: string; fundingRate: number }>) => {
  const alerts = [];
  for (const position of positions) {
    const distance = liquidationDistance(position);
    if (distance < 5) {
      alerts.push({
        id: `liq-${position.symbol}`,
        level: "danger",
        title: `${position.symbol} 接近强平`,
        message: `距离强平约 ${distance.toFixed(2)}%，请关注保证金和仓位风险。`,
        time: formatShortTime(Date.now()),
      });
    }
    if (position.leverage >= 15) {
      alerts.push({
        id: `lev-${position.symbol}`,
        level: "high",
        title: `${position.symbol} 高杠杆仓位`,
        message: `当前杠杆 ${position.leverage}x，价格波动会明显放大保证金风险。`,
        time: formatShortTime(Date.now()),
      });
    }
    if (position.margin > 0 && position.unrealizedPnl / position.margin < -0.25) {
      alerts.push({
        id: `loss-${position.symbol}`,
        level: "watch",
        title: `${position.symbol} 亏损扩大`,
        message: `当前仓位亏损超过保证金 25%，建议复核风险敞口。`,
        time: formatShortTime(Date.now()),
      });
    }
  }

  for (const ticker of marketTickers) {
    if (Math.abs(ticker.fundingRate) > 0.01) {
      alerts.push({
        id: `funding-${ticker.symbol}`,
        level: "watch",
        title: `${ticker.symbol} 资金费率偏高`,
        message: `当前资金费率 ${ticker.fundingRate.toFixed(4)}%，持仓成本可能上升。`,
        time: formatShortTime(Date.now()),
      });
    }
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "normal",
      level: "safe",
      title: "暂无高优先级风险",
      message: "当前持仓、强平距离和资金费率未触发主要预警阈值。",
      time: formatShortTime(Date.now()),
    });
  }

  return alerts.slice(0, 8);
};

const sumIncome = (rows: BinanceIncome[], from: number, types?: string[]) =>
  rows
    .filter((item) => item.time >= from)
    .filter((item) => !types || types.includes(item.incomeType))
    .reduce((sum, item) => sum + Number(item.income), 0);

const buildPnlSeries = (incomeRows: BinanceIncome[], accountEquity: number) => {
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today.getTime() - (29 - index) * dayMs);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  let rollingEquity = accountEquity - sumIncome(incomeRows, days[0].getTime());
  return days.map((date) => {
    const start = date.getTime();
    const end = start + dayMs;
    const dailyRows = incomeRows.filter((item) => item.time >= start && item.time < end);
    const dailyPnl = dailyRows.reduce((sum, item) => sum + Number(item.income), 0);
    const fundingIncome = dailyRows
      .filter((item) => item.incomeType === "FUNDING_FEE")
      .reduce((sum, item) => sum + Number(item.income), 0);
    rollingEquity += dailyPnl;

    return {
      date: date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" }).replace("/", "-"),
      equity: Number(rollingEquity.toFixed(2)),
      dailyPnl: Number(dailyPnl.toFixed(2)),
      fundingIncome: Number(fundingIncome.toFixed(2)),
    };
  });
};

const getRealAccount = () => binanceClient.signedRequest<BinanceAccount>("GET", "/fapi/v3/account");

const getRealOpenOrders = async () => {
  const rows = await binanceClient.signedRequest<BinanceOpenOrder[]>("GET", "/fapi/v1/openOrders");
  return rows.map((order) => ({
    id: String(order.orderId),
    symbol: order.symbol,
    type: orderTypeLabel(order.type),
    group: orderGroup(order.type),
    side: sideLabel(order.side),
    price: Number(order.price),
    quantity: Number(order.origQty),
    filled: Number(order.executedQty),
    status: orderStatusLabel(order.status),
    time: formatDateTime(order.time),
  }));
};

const getRealIncome = async () => {
  const startTime = Date.now() - 30 * dayMs;
  return binanceClient.signedRequest<BinanceIncome[]>("GET", "/fapi/v1/income", {
    startTime,
    limit: 1000,
  });
};

const getRealMarkets = async (symbols: string[]) => {
  const rows = await Promise.all(
    symbols.map(async (symbol) => {
      const [{ data: ticker }, { data: premium }] = await Promise.all([
        binanceClient.publicRequest<BinanceTicker24h>("/fapi/v1/ticker/24hr", { symbol }),
        binanceClient.publicRequest<BinancePremiumIndex>("/fapi/v1/premiumIndex", { symbol }),
      ]);

      return {
        symbol,
        price: Number(ticker.lastPrice || premium.markPrice),
        change24h: Number(ticker.priceChangePercent),
        volume24h: formatVolume(Number(ticker.quoteVolume)),
        fundingRate: Number(premium.lastFundingRate) * 100,
        nextFundingTime: formatShortTime(premium.nextFundingTime),
      };
    }),
  );

  return rows;
};

const getRealTrades = async (symbols: string[]) => {
  const rows = await Promise.all(
    symbols.slice(0, 6).map((symbol) =>
      binanceClient
        .signedRequest<BinanceTrade[]>("GET", "/fapi/v1/userTrades", { symbol, limit: 20 })
        .catch(() => []),
    ),
  );

  return rows
    .flat()
    .sort((a, b) => b.time - a.time)
    .slice(0, 30)
    .map((trade) => ({
      id: `${trade.symbol}-${trade.id}`,
      time: formatDateTime(trade.time),
      symbol: trade.symbol,
      side: sideLabel(trade.side),
      price: Number(trade.price),
      quantity: Number(trade.qty),
      fee: Number(trade.commission),
      realizedPnl: Number(trade.realizedPnl),
    }));
};

const buildAssetSummary = (account: BinanceAccount, positions: FuturesPosition[]) => {
  const totalEquity = Number(account.totalMarginBalance);
  const positionMargin = positions.reduce((sum, item) => sum + item.margin, 0);
  const assets = account.assets
    .map((asset) => ({
      asset: asset.asset,
      value: Number(asset.marginBalance ?? asset.walletBalance),
    }))
    .filter((asset) => asset.value > 0)
    .map((asset) => ({
      ...asset,
      percent: totalEquity > 0 ? (asset.value / totalEquity) * 100 : 0,
    }));

  return {
    totalEquity,
    availableBalance: Number(account.availableBalance),
    positionMargin,
    orderFrozen: Number(account.totalOpenOrderInitialMargin),
    assets,
  };
};

export const getDashboardSnapshot = async () => {
  const positions = await getPositions();

  if (config.mode === "mock") {
    const unrealized = positions.reduce((sum, item) => sum + item.unrealizedPnl, 0);
    const usedMargin = positions.reduce((sum, item) => sum + item.margin, 0);
    const openOrders = mockOpenOrders.map((order, index) => ({
      id: `mock-order-${index}`,
      symbol: order.symbol,
      type: orderTypeLabel(order.type),
      group: orderGroup(order.type),
      side: sideLabel(order.side as "BUY" | "SELL"),
      price: Number(order.price),
      quantity: Number(order.origQty),
      filled: Number(order.executedQty),
      status: orderStatusLabel(order.status),
      time: formatDateTime(order.time),
    }));
    const recentTrades = mockRecentTrades.map((trade, index) => ({
      id: `mock-trade-${index}`,
      time: formatDateTime(trade.time),
      symbol: trade.symbol,
      side: sideLabel(trade.side as "BUY" | "SELL"),
      price: trade.price,
      quantity: trade.qty,
      fee: trade.commission,
      realizedPnl: trade.realizedPnl,
    }));
    return {
      positions,
      accountSummary: {
        totalEquity: 53552.63 + unrealized,
        availableBalance: 38112.49,
        usedMargin,
        positionCount: positions.length,
        openOrderCount: openOrders.length,
        pnlToday: unrealized,
        pnl7d: 1898.44,
        pnl30d: 5476.2,
        riskLevel: calcRiskLevel(null, positions),
      },
      openOrders,
      pnlSummary: {
        today: unrealized,
        sevenDays: 1898.44,
        thirtyDays: 5476.2,
        realized: 6280.72,
        unrealized,
        fees: -384.9,
        funding: -419.62,
        net: 6280.72 + unrealized - 384.9 - 419.62,
      },
      pnlSeries: mockPnlSeries,
      assetSummary: {
        totalEquity: 53552.63 + unrealized,
        availableBalance: 38112.49,
        positionMargin: usedMargin,
        orderFrozen: 4096.76,
        assets: [
          { asset: "USDT", value: 46250.18, percent: 86.36 },
          { asset: "BTC", value: 4104.72, percent: 7.66 },
          { asset: "ETH", value: 2197.73, percent: 4.1 },
        ],
      },
      marketTickers: mockMarketTickers,
      alerts: buildAlerts(positions, mockMarketTickers),
      recentTrades,
      apiStatus: {
        restConnected: true,
        websocketConnected: false,
        lastSyncTime: formatDateTime(Date.now()),
        latencyMs: 0,
        permission: "只读 + 平仓",
        ipWhitelist: true,
        updateFrequency: "账户 3s / 行情 3s",
      },
      syncedAt: new Date().toISOString(),
    };
  }

  const startedAt = Date.now();
  const [account, openOrders, incomeRows] = await Promise.all([
    getRealAccount(),
    getRealOpenOrders(),
    getRealIncome(),
  ]);
  const symbols = Array.from(
    new Set([
      ...positions.map((item) => item.symbol),
      ...openOrders.map((item) => item.symbol),
      ...config.monitorSymbols,
    ]),
  );
  const marketTickers = symbols.length > 0 ? await getRealMarkets(symbols) : [];
  const recentTrades = await getRealTrades(symbols);
  const equity = Number(account.totalMarginBalance);
  const usedMargin = Number(account.totalInitialMargin);
  const unrealized = positions.reduce((sum, item) => sum + item.unrealizedPnl, 0);
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const realized = sumIncome(incomeRows, now - 30 * dayMs, ["REALIZED_PNL"]);
  const fees = sumIncome(incomeRows, now - 30 * dayMs, ["COMMISSION"]);
  const funding = sumIncome(incomeRows, now - 30 * dayMs, ["FUNDING_FEE"]);
  const pnlToday = sumIncome(incomeRows, todayStart) + unrealized;
  const pnl7d = sumIncome(incomeRows, now - 7 * dayMs) + unrealized;
  const pnl30d = sumIncome(incomeRows, now - 30 * dayMs) + unrealized;
  const riskLevel = calcRiskLevel(account, positions);

  return {
    positions,
    accountSummary: {
      totalEquity: equity,
      availableBalance: Number(account.availableBalance),
      usedMargin,
      positionCount: positions.length,
      openOrderCount: openOrders.length,
      pnlToday,
      pnl7d,
      pnl30d,
      riskLevel,
    },
    openOrders,
    pnlSummary: {
      today: pnlToday,
      sevenDays: pnl7d,
      thirtyDays: pnl30d,
      realized,
      unrealized,
      fees,
      funding,
      net: realized + unrealized + fees + funding,
    },
    pnlSeries: buildPnlSeries(incomeRows, equity),
    assetSummary: buildAssetSummary(account, positions),
    marketTickers,
    alerts: buildAlerts(positions, marketTickers),
    recentTrades,
    apiStatus: {
      restConnected: true,
      websocketConnected: false,
      lastSyncTime: formatDateTime(Date.now()),
      latencyMs: Date.now() - startedAt,
      permission: "只读 + 平仓",
      ipWhitelist: true,
      updateFrequency: "账户 3s / 行情 3s",
    },
    syncedAt: new Date().toISOString(),
  };
};
