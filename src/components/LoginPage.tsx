import { FormEvent, useEffect, useState } from "react";
import { LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";
import { fetchCaptcha, login, setAuthToken, type CaptchaResponse } from "../services/authApi";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [captcha, setCaptcha] = useState<CaptchaResponse | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCaptcha = async () => {
    setError(null);
    setCaptchaAnswer("");
    try {
      setCaptcha(await fetchCaptcha());
    } catch (err) {
      setError(err instanceof Error ? err.message : "验证码加载失败。");
    }
  };

  useEffect(() => {
    void loadCaptcha();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!captcha) return;

    setLoading(true);
    setError(null);

    try {
      const result = await login({
        username,
        password,
        captchaId: captcha.captchaId,
        captchaAnswer,
      });
      setAuthToken(result.token);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败。");
      await loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-line bg-panel p-5 shadow-glow">
        <div className="mb-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h1 className="m-0 text-xl font-semibold text-text">账户监控登录</h1>
          <p className="mt-2 text-sm leading-5 text-muted">登录后才能查看合约账户数据和提交平仓请求。</p>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs text-muted">用户名</span>
            <input
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-text outline-none focus:border-cyan"
              value={username}
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs text-muted">密码</span>
            <input
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-text outline-none focus:border-cyan"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs text-muted">验证码</span>
            <div className="flex gap-2">
              <div className="flex min-w-[120px] items-center justify-center rounded-md border border-line bg-panel2 px-3 py-2 font-mono text-sm text-cyan">
                {captcha?.question ?? "..."}
              </div>
              <input
                className="min-w-0 flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-text outline-none focus:border-cyan"
                value={captchaAnswer}
                inputMode="numeric"
                onChange={(event) => setCaptchaAnswer(event.target.value)}
              />
              <button
                type="button"
                className="rounded-md border border-line px-3 text-muted hover:bg-panel2 hover:text-text"
                aria-label="刷新验证码"
                onClick={() => void loadCaptcha()}
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </label>
        </div>

        {error ? <div className="mt-4 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div> : null}

        <button
          type="submit"
          disabled={loading || !captcha}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-cyan px-4 py-2.5 text-sm font-semibold text-bg hover:bg-cyan/90 disabled:cursor-wait disabled:opacity-70"
        >
          <ShieldCheck className="h-4 w-4" />
          {loading ? "登录中..." : "登录"}
        </button>
      </form>
    </main>
  );
}
