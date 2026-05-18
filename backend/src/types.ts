export type PositionSide = "LONG" | "SHORT";

export interface ClosePositionRequest {
  symbol: string;
  positionSide: PositionSide;
  quantity: number;
}

export interface FuturesPosition {
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

export interface BinancePositionRisk {
  symbol: string;
  positionAmt: string;
  entryPrice: string;
  markPrice: string;
  unRealizedProfit: string;
  liquidationPrice: string;
  leverage: string;
  isolatedMargin?: string;
  isolatedWallet?: string;
  notional?: string;
  positionInitialMargin?: string;
  positionSide?: "BOTH" | PositionSide;
}
