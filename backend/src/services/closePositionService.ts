import { config } from "../config.js";
import { mockPositions } from "../data/mockData.js";
import { binanceClient } from "../lib/binanceClient.js";
import { HttpError } from "../lib/httpError.js";
import type { ClosePositionRequest } from "../types.js";
import { findCurrentPosition } from "./positionService.js";

const symbolPattern = /^[A-Z0-9]{5,20}$/;

export const validateClosePositionPayload = (body: unknown): ClosePositionRequest => {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Request body is required.");
  }

  const input = body as Record<string, unknown>;
  const symbol = typeof input.symbol === "string" ? input.symbol.trim().toUpperCase() : "";
  const positionSide = input.positionSide;
  const quantity = Number(input.quantity);

  if (!symbolPattern.test(symbol)) throw new HttpError(400, "Invalid symbol.");
  if (positionSide !== "LONG" && positionSide !== "SHORT") throw new HttpError(400, "Invalid positionSide.");
  if (!Number.isFinite(quantity) || quantity <= 0) throw new HttpError(400, "Invalid quantity.");

  return { symbol, positionSide, quantity };
};

export const closePosition = async (payload: ClosePositionRequest) => {
  const current = await findCurrentPosition(payload.symbol, payload.positionSide);
  if (!current) {
    throw new HttpError(409, "No current position found for this symbol and side.");
  }
  if (payload.quantity > current.quantity) {
    throw new HttpError(409, "Close quantity is larger than current position quantity.");
  }

  const orderSide = payload.positionSide === "LONG" ? "SELL" : "BUY";

  if (config.mode === "mock") {
    const index = mockPositions.findIndex(
      (item) => item.symbol === payload.symbol && item.positionSide === payload.positionSide,
    );
    if (index >= 0) mockPositions.splice(index, 1);
    return {
      ok: true,
      mode: "mock",
      symbol: payload.symbol,
      side: orderSide,
      positionSide: payload.positionSide,
      quantity: payload.quantity,
      reduceOnly: true,
    };
  }

  if (config.hedgeMode && !config.allowHedgeCloseWithoutReduceOnly) {
    throw new HttpError(
      409,
      "Hedge mode close is disabled by default because Binance USD-M reduceOnly cannot be sent in Hedge Mode. Use one-way mode or explicitly enable BINANCE_ALLOW_HEDGE_CLOSE_WITHOUT_REDUCE_ONLY after reviewing the risk.",
    );
  }

  const params: Record<string, string | number | boolean> = {
    symbol: payload.symbol,
    side: orderSide,
    type: "MARKET",
    quantity: payload.quantity,
  };

  if (config.hedgeMode) {
    params.positionSide = payload.positionSide;
  } else {
    params.reduceOnly = true;
  }

  const order = await binanceClient.signedRequest("POST", "/fapi/v1/order", params);
  return {
    ok: true,
    mode: "binance",
    reduceOnly: !config.hedgeMode,
    order,
  };
};
