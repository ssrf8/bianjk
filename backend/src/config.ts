export interface AppConfig {
  port: number;
  host: string;
  mode: "mock" | "binance";
  binanceBaseUrl: string;
  binanceApiKey: string;
  binanceApiSecret: string;
  recvWindow: number;
  hedgeMode: boolean;
  allowHedgeCloseWithoutReduceOnly: boolean;
  adminUsername: string;
  adminPassword: string;
  authTokenSecret: string;
  authTokenTtlMs: number;
  captchaTtlMs: number;
  monitorSymbols: string[];
}

const boolEnv = (value: string | undefined, fallback = false) => {
  if (value == null) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

export const config: AppConfig = {
  port: Number(process.env.PORT ?? 8080),
  host: process.env.HOST ?? "0.0.0.0",
  mode: process.env.BINANCE_MODE === "binance" ? "binance" : "mock",
  binanceBaseUrl: process.env.BINANCE_BASE_URL ?? "https://fapi.binance.com",
  binanceApiKey: process.env.BINANCE_API_KEY ?? "",
  binanceApiSecret: process.env.BINANCE_API_SECRET ?? "",
  recvWindow: Number(process.env.BINANCE_RECV_WINDOW ?? 5000),
  hedgeMode: boolEnv(process.env.BINANCE_HEDGE_MODE),
  allowHedgeCloseWithoutReduceOnly: boolEnv(process.env.BINANCE_ALLOW_HEDGE_CLOSE_WITHOUT_REDUCE_ONLY),
  adminUsername: process.env.ADMIN_USERNAME ?? "admin",
  adminPassword: process.env.ADMIN_PASSWORD ?? "change-this-password",
  authTokenSecret: process.env.AUTH_TOKEN_SECRET ?? "change-this-token-secret",
  authTokenTtlMs: Number(process.env.AUTH_TOKEN_TTL_MS ?? 12 * 60 * 60 * 1000),
  captchaTtlMs: Number(process.env.CAPTCHA_TTL_MS ?? 2 * 60 * 1000),
  monitorSymbols: (process.env.MONITOR_SYMBOLS ?? "")
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean),
};

export const assertBinanceCredentials = () => {
  if (!config.binanceApiKey || !config.binanceApiSecret) {
    throw new Error("BINANCE_API_KEY and BINANCE_API_SECRET are required when BINANCE_MODE=binance.");
  }
};

export const assertAuthConfig = () => {
  if (
    config.adminPassword === "change-this-password" ||
    config.authTokenSecret === "change-this-token-secret" ||
    config.authTokenSecret === "change-this-long-random-secret"
  ) {
    throw new Error("Unsafe auth config. Set ADMIN_PASSWORD and AUTH_TOKEN_SECRET in backend/.env before starting.");
  }
};
