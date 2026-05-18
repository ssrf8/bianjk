import type { FastifyInstance } from "fastify";
import { config } from "../config.js";
import { binanceClient } from "../lib/binanceClient.js";
import { closePosition, validateClosePositionPayload } from "../services/closePositionService.js";
import { getDashboardSnapshot } from "../services/dashboardService.js";
import { getPositions, getRawPositionRiskDebug } from "../services/positionService.js";

const checkStep = async (name: string, fn: () => Promise<unknown>) => {
  try {
    const startedAt = Date.now();
    await fn();
    return { name, ok: true, latencyMs: Date.now() - startedAt };
  } catch (error) {
    return {
      name,
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: typeof error === "object" && error && "details" in error ? (error as { details?: unknown }).details : undefined,
    };
  }
};

export const registerFuturesRoutes = async (app: FastifyInstance) => {
  app.get("/api/health", async () => ({
    ok: true,
    service: "binance-futures-monitor-backend",
    mode: config.mode,
    time: new Date().toISOString(),
  }));

  app.get("/api/futures/api-status", async () => ({
    restConnected: config.mode === "mock" || Boolean(config.binanceApiKey),
    websocketConnected: false,
    mode: config.mode,
    permission: config.mode === "mock" ? "mock" : "server-side-signed",
    hedgeMode: config.hedgeMode,
    lastSyncTime: new Date().toISOString(),
  }));

  app.get("/api/futures/positions", async () => getPositions());

  app.get("/api/futures/snapshot", async () => getDashboardSnapshot());

  app.get("/api/futures/debug/binance", async () => {
    const symbol = config.monitorSymbols[0] || "BTCUSDT";
    const checks = await Promise.all([
      checkStep("account", () => binanceClient.signedRequest("GET", "/fapi/v3/account")),
      checkStep("positionRisk", () => binanceClient.signedRequest("GET", "/fapi/v3/positionRisk")),
      checkStep("income", () => binanceClient.signedRequest("GET", "/fapi/v1/income", { limit: 1 })),
      checkStep("ticker24h", () => binanceClient.publicRequest("/fapi/v1/ticker/24hr", { symbol })),
      checkStep("premiumIndex", () => binanceClient.publicRequest("/fapi/v1/premiumIndex", { symbol })),
    ]);

    return {
      mode: config.mode,
      baseUrl: config.binanceBaseUrl,
      testSymbol: symbol,
      checks,
    };
  });

  app.get("/api/futures/debug/positions", async (request) => {
    const query = request.query as { symbol?: string };
    return getRawPositionRiskDebug(query.symbol || "BTCUSDT");
  });

  app.get("/api/futures/account-summary", async () => {
    const snapshot = await getDashboardSnapshot();
    return snapshot.accountSummary;
  });

  app.get("/api/futures/open-orders", async () => {
    const snapshot = await getDashboardSnapshot();
    return snapshot.openOrders;
  });

  app.get("/api/futures/trades", async () => {
    const snapshot = await getDashboardSnapshot();
    return snapshot.recentTrades;
  });

  app.post("/api/futures/close-position", async (request) => {
    const payload = validateClosePositionPayload(request.body);
    return closePosition(payload);
  });
};
