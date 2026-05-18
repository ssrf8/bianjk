export interface CaptchaResponse {
  captchaId: string;
  question: string;
  expiresAt: number;
}

export interface LoginPayload {
  username: string;
  password: string;
  captchaId: string;
  captchaAnswer: string;
}

export const authStorageKey = "binance-monitor-auth-token";

export const getAuthToken = () => window.localStorage.getItem(authStorageKey);

export const setAuthToken = (token: string) => window.localStorage.setItem(authStorageKey, token);

export const clearAuthToken = () => window.localStorage.removeItem(authStorageKey);

export const fetchCaptcha = async () => {
  const response = await fetch("/api/auth/captcha");
  if (!response.ok) throw new Error("验证码加载失败。");
  return (await response.json()) as CaptchaResponse;
};

export const login = async (payload: LoginPayload) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? "登录失败。");
  }

  return data as { token: string; expiresAt: number };
};
