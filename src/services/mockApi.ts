import type { PositionSide } from "../types";

export interface ClosePositionPayload {
  symbol: string;
  positionSide: PositionSide;
  quantity: number;
}

export const mockClosePosition = async (payload: ClosePositionPayload) => {
  if (!payload.symbol || payload.quantity <= 0) {
    throw new Error("平仓参数无效，请刷新持仓后重试。");
  }

  if (import.meta.env.VITE_MOCK_CLOSE_ONLY === "true") {
    await new Promise((resolve) => window.setTimeout(resolve, 850));
    return {
      ok: true,
      orderId: `mock-close-${Date.now()}`,
      reduceOnly: true,
      backendRoute: "/api/futures/close-position",
    };
  }

  const response = await fetch("/api/futures/close-position", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? "平仓失败，请稍后重试。");
  }

  return data;
};
import { getAuthToken } from "./authApi";
