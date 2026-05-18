import crypto from "node:crypto";
import { assertBinanceCredentials, config } from "../config.js";
import { UpstreamError } from "./httpError.js";

type QueryValue = string | number | boolean | undefined;

export class BinanceClient {
  private buildQuery(params: Record<string, QueryValue>) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) search.set(key, String(value));
    }
    return search.toString();
  }

  private sign(query: string) {
    return crypto.createHmac("sha256", config.binanceApiSecret).update(query).digest("hex");
  }

  async publicRequest<T>(path: string, params: Record<string, QueryValue> = {}) {
    const query = this.buildQuery(params);
    const url = `${config.binanceBaseUrl}${path}${query ? `?${query}` : ""}`;

    const startedAt = Date.now();
    let response: Response;
    try {
      response = await fetch(url);
    } catch (error) {
      throw new UpstreamError("Binance network request failed", "binance", {
        path,
        cause: error instanceof Error ? error.message : String(error),
      });
    }
    const latencyMs = Date.now() - startedAt;
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const message = typeof data?.msg === "string" ? data.msg : `Binance request failed: ${response.status}`;
      throw new UpstreamError(message, "binance", {
        status: response.status,
        code: data?.code,
        msg: data?.msg,
        path,
      });
    }

    return { data: data as T, latencyMs };
  }

  async signedRequest<T>(method: "GET" | "POST" | "DELETE", path: string, params: Record<string, QueryValue> = {}) {
    assertBinanceCredentials();

    const query = this.buildQuery({
      ...params,
      recvWindow: config.recvWindow,
      timestamp: Date.now(),
    });
    const signature = this.sign(query);
    const url = `${config.binanceBaseUrl}${path}?${query}&signature=${signature}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: {
          "X-MBX-APIKEY": config.binanceApiKey,
        },
      });
    } catch (error) {
      throw new UpstreamError("Binance network request failed", "binance", {
        path,
        cause: error instanceof Error ? error.message : String(error),
      });
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const message = typeof data?.msg === "string" ? data.msg : `Binance request failed: ${response.status}`;
      throw new UpstreamError(message, "binance", {
        status: response.status,
        code: data?.code,
        msg: data?.msg,
        path,
      });
    }

    return data as T;
  }
}

export const binanceClient = new BinanceClient();
