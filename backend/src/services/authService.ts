import crypto from "node:crypto";
import { config } from "../config.js";
import { HttpError } from "../lib/httpError.js";

interface CaptchaRecord {
  answer: string;
  expiresAt: number;
}

const captchas = new Map<string, CaptchaRecord>();

const cleanupCaptchas = () => {
  const now = Date.now();
  for (const [id, record] of captchas.entries()) {
    if (record.expiresAt <= now) captchas.delete(id);
  }
};

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const signTokenPayload = (payload: string) =>
  crypto.createHmac("sha256", config.authTokenSecret).update(payload).digest("base64url");

export const createCaptcha = () => {
  cleanupCaptchas();

  const left = crypto.randomInt(10, 50);
  const right = crypto.randomInt(2, 19);
  const operator = crypto.randomInt(0, 2) === 0 ? "+" : "-";
  const answer = operator === "+" ? left + right : left - right;
  const captchaId = crypto.randomUUID();
  const expiresAt = Date.now() + config.captchaTtlMs;

  captchas.set(captchaId, {
    answer: String(answer),
    expiresAt,
  });

  return {
    captchaId,
    question: `${left} ${operator} ${right} = ?`,
    expiresAt,
  };
};

export const login = (body: unknown) => {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Request body is required.");
  }

  const input = body as Record<string, unknown>;
  const username = typeof input.username === "string" ? input.username : "";
  const password = typeof input.password === "string" ? input.password : "";
  const captchaId = typeof input.captchaId === "string" ? input.captchaId : "";
  const captchaAnswer = typeof input.captchaAnswer === "string" ? input.captchaAnswer.trim() : "";
  const captcha = captchas.get(captchaId);

  if (!captcha || captcha.expiresAt <= Date.now()) {
    captchas.delete(captchaId);
    throw new HttpError(400, "Captcha expired. Please refresh it.");
  }

  captchas.delete(captchaId);

  if (!safeEqual(captcha.answer, captchaAnswer)) {
    throw new HttpError(401, "Captcha answer is incorrect.");
  }

  if (!safeEqual(config.adminUsername, username) || !safeEqual(config.adminPassword, password)) {
    throw new HttpError(401, "Invalid username or password.");
  }

  const expiresAt = Date.now() + config.authTokenTtlMs;
  const payload = Buffer.from(JSON.stringify({ username, expiresAt }), "utf8").toString("base64url");
  const signature = signTokenPayload(payload);

  return {
    token: `${payload}.${signature}`,
    expiresAt,
  };
};

export const verifyAuthToken = (authorization: string | undefined) => {
  if (!authorization?.startsWith("Bearer ")) return false;

  const token = authorization.slice("Bearer ".length);
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = signTokenPayload(payload);
  if (!safeEqual(expected, signature)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { expiresAt?: number };
    return typeof parsed.expiresAt === "number" && parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
};
