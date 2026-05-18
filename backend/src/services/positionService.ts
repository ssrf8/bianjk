import { config } from "../config.js";
import { getDynamicMockPositions } from "../data/mockData.js";
import { binanceClient } from "../lib/binanceClient.js";
import type { BinancePositionRisk, FuturesPosition, PositionSide } from "../types.js";

const toPositionSide = (raw: BinancePositionRisk): PositionSide => {
  if (raw.positionSide === "LONG" || raw.positionSide === "SHORT") return raw.positionSide;
  return Number(raw.positionAmt) >= 0 ? "LONG" : "SHORT";
};

const firstPositiveNumber = (...values: Array<string | number | undefined>) => {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return 0;
};

const normalizePosition = (raw: BinancePositionRisk): FuturesPosition | null => {
  const amount = Number(raw.positionAmt);
  if (amount === 0) return null;
  const leverage = Number(raw.leverage ?? 1);
  const fallbackMargin = Math.abs(Number(raw.notional ?? 0)) / Math.max(leverage, 1);
  const liquidationPrice = Number(raw.liquidationPrice);

  return {
    symbol: raw.symbol,
    positionSide: toPositionSide(raw),
    quantity: Math.abs(amount),
    entryPrice: Number(raw.entryPrice),
    markPrice: Number(raw.markPrice),
    unrealizedPnl: Number(raw.unRealizedProfit),
    leverage,
    liquidationPrice: Number.isFinite(liquidationPrice) ? liquidationPrice : 0,
    margin: firstPositiveNumber(raw.positionInitialMargin, raw.isolatedMargin, raw.isolatedWallet, fallbackMargin),
  };
};

const getPositionRiskRows = async () => {
  const [v2Result, v3Result] = await Promise.allSettled([
    binanceClient.signedRequest<BinancePositionRisk[]>("GET", "/fapi/v2/positionRisk"),
    binanceClient.signedRequest<BinancePositionRisk[]>("GET", "/fapi/v3/positionRisk"),
  ]);
  if (v2Result.status === "rejected" && v3Result.status === "rejected") {
    throw v3Result.reason;
  }

  const v2Rows = v2Result.status === "fulfilled" ? v2Result.value : [];
  const v3Rows = v3Result.status === "fulfilled" ? v3Result.value : [];
  if (v3Rows.length === 0) return v2Rows;
  if (v2Rows.length === 0) return v3Rows;

  const v2ByKey = new Map(v2Rows.map((row) => [`${row.symbol}:${row.positionSide ?? "BOTH"}`, row]));
  const mergedRows = v3Rows.map((v3) => {
    const v2 = v2ByKey.get(`${v3.symbol}:${v3.positionSide ?? "BOTH"}`) ?? v2Rows.find((row) => row.symbol === v3.symbol);
    return {
      ...v2,
      ...v3,
      leverage: v3.leverage ?? v2?.leverage,
      isolatedMargin: v3.isolatedMargin ?? v2?.isolatedMargin,
      isolatedWallet: v3.isolatedWallet ?? v2?.isolatedWallet,
      positionInitialMargin: v3.positionInitialMargin ?? v2?.positionInitialMargin,
      notional: v3.notional ?? v2?.notional,
    };
  });

  if (mergedRows.some((row) => Number(row.positionAmt) !== 0)) return mergedRows;
  return v2Rows.some((row) => Number(row.positionAmt) !== 0) ? v2Rows : mergedRows;
};

export const getPositions = async () => {
  if (config.mode === "mock") return getDynamicMockPositions();

  const rows = await getPositionRiskRows();
  return rows.map(normalizePosition).filter((item): item is FuturesPosition => item !== null);
};

export const getRawPositionRiskDebug = async (symbol = "BTCUSDT") => {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const [v3Rows, v2Rows] = await Promise.all([
    binanceClient.signedRequest<BinancePositionRisk[]>("GET", "/fapi/v3/positionRisk", { symbol: normalizedSymbol }).catch((error) => ({
      error: error instanceof Error ? error.message : "Unknown error",
      details: typeof error === "object" && error && "details" in error ? (error as { details?: unknown }).details : undefined,
    })),
    binanceClient.signedRequest<BinancePositionRisk[]>("GET", "/fapi/v2/positionRisk", { symbol: normalizedSymbol }).catch((error) => ({
      error: error instanceof Error ? error.message : "Unknown error",
      details: typeof error === "object" && error && "details" in error ? (error as { details?: unknown }).details : undefined,
    })),
  ]);

  const summarize = (rows: BinancePositionRisk[] | { error: string; details?: unknown }) => {
    if (!Array.isArray(rows)) return rows;
    return rows.map((row) => ({
      symbol: row.symbol,
      positionSide: row.positionSide,
      positionAmt: row.positionAmt,
      entryPrice: row.entryPrice,
      markPrice: row.markPrice,
      unRealizedProfit: row.unRealizedProfit,
      leverage: row.leverage,
      isolatedMargin: row.isolatedMargin,
      isolatedWallet: row.isolatedWallet,
      positionInitialMargin: row.positionInitialMargin,
      notional: row.notional,
    }));
  };

  return {
    symbol: normalizedSymbol,
    v3: summarize(v3Rows),
    v2: summarize(v2Rows),
  };
};

export const findCurrentPosition = async (symbol: string, positionSide: PositionSide) => {
  const positions = await getPositions();
  return positions.find((item) => item.symbol === symbol && item.positionSide === positionSide);
};
