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
  PositionSide,
  TradeRecord,
} from "../types";
import { getAuthToken } from "./authApi";

interface BackendPosition {
  symbol: string;
  positionSide: PositionSide;
  quantity: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  leverage: number;
  liquidationPrice: number;
  margin: number;
}

const authHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const request = async <T>(path: string) => {
  const response = await fetch(path, {
    headers: authHeaders(),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? "数据请求失败。");
  }

  return data as T;
};

const mapPosition = (position: BackendPosition): Position => {
  const roi = position.margin > 0 ? (position.unrealizedPnl / position.margin) * 100 : 0;
  return {
    id: `${position.symbol}-${position.positionSide}`,
    symbol: position.symbol,
    side: position.positionSide,
    leverage: position.leverage,
    quantity: position.quantity,
    entryPrice: position.entryPrice,
    markPrice: position.markPrice,
    unrealizedPnl: position.unrealizedPnl,
    roi,
    margin: position.margin,
    liquidationPrice: position.liquidationPrice,
  };
};

export const fetchPositions = async () => {
  const rows = await request<BackendPosition[]>("/api/futures/positions");
  return rows.map(mapPosition);
};

export const fetchRealtimeSnapshot = async () => {
  const snapshot = await request<{
    positions: BackendPosition[];
    accountSummary: AccountSummary;
    openOrders: OpenOrder[];
    pnlSummary: PnlSummary;
    pnlSeries: PnlPoint[];
    assetSummary: AssetSummary;
    marketTickers: MarketTicker[];
    alerts: AlertItem[];
    recentTrades: TradeRecord[];
    apiStatus: ApiStatus;
    syncedAt: string;
  }>("/api/futures/snapshot");

  return {
    ...snapshot,
    positions: snapshot.positions.map(mapPosition),
    syncedAt: new Date(snapshot.syncedAt),
  };
};
