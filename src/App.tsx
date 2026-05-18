import { useEffect, useMemo, useState } from "react";
import { LockKeyhole, LogOut, RefreshCw } from "lucide-react";
import { AccountOverview } from "./components/AccountOverview";
import { AlertsPanel } from "./components/AlertsPanel";
import { ApiStatusPanel } from "./components/ApiStatusPanel";
import { AssetDistribution } from "./components/AssetDistribution";
import { ClosePositionModal } from "./components/ClosePositionModal";
import { MarketWatch } from "./components/MarketWatch";
import { OrdersTable } from "./components/OrdersTable";
import { PnlCharts } from "./components/PnlCharts";
import { PositionsTable } from "./components/PositionsTable";
import { RiskMonitor } from "./components/RiskMonitor";
import { Section } from "./components/Section";
import { LoginPage } from "./components/LoginPage";
import { TradesTable } from "./components/TradesTable";
import {
  alerts,
  apiStatus,
  assetSummary,
  buildAccountSummary,
  buildRiskMetric,
  initialPositions,
  marketTickers,
  openOrders,
  pnlSeries,
  pnlSummary,
  recentTrades,
} from "./data/mockData";
import { mockClosePosition } from "./services/mockApi";
import { clearAuthToken, getAuthToken } from "./services/authApi";
import { fetchRealtimeSnapshot } from "./services/futuresApi";
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
  RiskMetric,
  TradeRecord,
} from "./types";

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => Boolean(getAuthToken()));
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const [remoteAccountSummary, setRemoteAccountSummary] = useState<AccountSummary | null>(null);
  const [liveOpenOrders, setLiveOpenOrders] = useState<OpenOrder[]>(openOrders);
  const [livePnlSummary, setLivePnlSummary] = useState<PnlSummary>(pnlSummary);
  const [livePnlSeries, setLivePnlSeries] = useState<PnlPoint[]>(pnlSeries);
  const [liveAssetSummary, setLiveAssetSummary] = useState<AssetSummary>(assetSummary);
  const [liveMarketTickers, setLiveMarketTickers] = useState<MarketTicker[]>(marketTickers);
  const [liveAlerts, setLiveAlerts] = useState<AlertItem[]>(alerts);
  const [liveRecentTrades, setLiveRecentTrades] = useState<TradeRecord[]>(recentTrades);
  const [liveApiStatus, setLiveApiStatus] = useState<ApiStatus>(apiStatus);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fallbackAccountSummary = useMemo(() => buildAccountSummary(positions), [positions]);
  const accountSummary = remoteAccountSummary ?? fallbackAccountSummary;
  const riskMetric = useMemo<RiskMetric>(() => {
    const fallback = buildRiskMetric(positions);
    const totalPositionValue = positions.reduce((sum, item) => sum + item.markPrice * item.quantity, 0);
    const max = positions.reduce(
      (top, item) => {
        const value = item.markPrice * item.quantity;
        return value > top.value
          ? { symbol: item.symbol, value, ratio: liveAssetSummary.totalEquity > 0 ? (value / liveAssetSummary.totalEquity) * 100 : 0 }
          : top;
      },
      { symbol: "-", value: 0, ratio: 0 },
    );

    return {
      ...fallback,
      totalPositionValue,
      positionEquityRatio: liveAssetSummary.totalEquity > 0 ? (totalPositionValue / liveAssetSummary.totalEquity) * 100 : 0,
      maxSymbolExposure: max,
      riskLevel: accountSummary.riskLevel,
    };
  }, [accountSummary.riskLevel, liveAssetSummary.totalEquity, positions]);

  useEffect(() => {
    if (!authenticated) return;

    let cancelled = false;
    let timer: number | undefined;

    const refresh = async () => {
      setRefreshing(true);
      try {
        const snapshot = await fetchRealtimeSnapshot();
        if (cancelled) return;
        setPositions(snapshot.positions);
        setRemoteAccountSummary(snapshot.accountSummary);
        setLiveOpenOrders(snapshot.openOrders);
        setLivePnlSummary(snapshot.pnlSummary);
        setLivePnlSeries(snapshot.pnlSeries);
        setLiveAssetSummary(snapshot.assetSummary);
        setLiveMarketTickers(snapshot.marketTickers);
        setLiveAlerts(snapshot.alerts);
        setLiveRecentTrades(snapshot.recentTrades);
        setLiveApiStatus(snapshot.apiStatus);
        setLastSyncTime(snapshot.syncedAt);
        setPollError(null);
      } catch (error) {
        if (cancelled) return;
        setPollError(error instanceof Error ? error.message : "轮询数据失败。");
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    };

    void refresh();
    timer = window.setInterval(refresh, 3000);

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
    };
  }, [authenticated]);

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  const handleClosePosition = async () => {
    if (!selectedPosition) return;

    setClosingId(selectedPosition.id);
    setCloseError(null);

    try {
      await mockClosePosition({
        symbol: selectedPosition.symbol,
        positionSide: selectedPosition.side,
        quantity: selectedPosition.quantity,
      });
      setPositions((current) => current.filter((item) => item.id !== selectedPosition.id));
      setLastAction(`${selectedPosition.symbol} ${selectedPosition.side === "LONG" ? "平多" : "平空"}模拟成功，持仓已从列表移除。`);
      setSelectedPosition(null);
    } catch (error) {
      setCloseError(error instanceof Error ? error.message : "平仓失败，请稍后重试。");
    } finally {
      setClosingId(null);
    }
  };

  return (
    <main className="min-h-screen px-3 py-3 sm:px-4 lg:px-5">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-3">
        <header className="flex flex-col gap-3 rounded-lg border border-line bg-panel/90 px-3 py-3 shadow-glow lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-cyan">
              <LockKeyhole className="h-4 w-4" />
              Monitor Only / Close Existing Positions
            </div>
            <h1 className="m-0 text-xl font-semibold text-text sm:text-2xl">Binance 合约账户可视化监控 Dashboard</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="rounded-md border border-line bg-panel2 px-3 py-2">禁止开仓</span>
            <span className="rounded-md border border-line bg-panel2 px-3 py-2">禁止新建订单</span>
            <span className="rounded-md border border-line bg-panel2 px-3 py-2">禁止改杠杆</span>
            <span className="rounded-md border border-line bg-panel2 px-3 py-2">禁止资金划转</span>
            <button
              className="inline-flex items-center gap-1 rounded-md border border-line bg-panel2 px-3 py-2 text-muted hover:text-text"
              onClick={() => {
                clearAuthToken();
                setRemoteAccountSummary(null);
                setLastSyncTime(null);
                setAuthenticated(false);
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              退出
            </button>
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-panel/80 px-3 py-2 text-xs text-muted">
          <span className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${pollError ? "bg-danger" : refreshing ? "bg-warn" : "bg-long"}`} />
            {pollError ? `数据同步异常：${pollError}` : refreshing ? "正在同步账户数据..." : "账户数据轮询中，每 3 秒刷新"}
          </span>
          <span className="font-mono">
            最近同步：{lastSyncTime ? lastSyncTime.toLocaleTimeString("zh-CN", { hour12: false }) : "-"}
          </span>
        </div>

        <AccountOverview summary={accountSummary} />

        {lastAction ? (
          <div className="rounded-lg border border-long/30 bg-long/10 px-4 py-3 text-sm text-long">{lastAction}</div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 2xl:grid-cols-[minmax(0,1.7fr)_minmax(380px,0.8fr)]">
          <div className="space-y-3">
            <Section title="当前持仓监控" action={<span className="text-sm text-muted">{positions.length} 个持仓</span>}>
              <PositionsTable
                positions={positions}
                closingId={closingId}
                onCloseClick={(position) => {
                  setCloseError(null);
                  setSelectedPosition(position);
                }}
              />
            </Section>

            <Section title="当前订单监控" action={<span className="text-sm text-muted">{liveOpenOrders.length} 个进行中订单</span>}>
              <OrdersTable orders={liveOpenOrders} />
            </Section>

            <Section title="盈亏分析">
              <PnlCharts summary={livePnlSummary} data={livePnlSeries} />
            </Section>
          </div>

          <aside className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-1">
            <Section title="风险监控">
              <RiskMonitor risk={riskMetric} />
            </Section>
            <Section title="行情监控">
              <MarketWatch tickers={liveMarketTickers} />
            </Section>
            <Section title="预警提醒">
              <AlertsPanel alerts={liveAlerts} />
            </Section>
          </aside>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <Section title="资产分布">
            <AssetDistribution summary={liveAssetSummary} />
          </Section>
          <Section title="API 状态与安全">
            <ApiStatusPanel status={liveApiStatus} />
          </Section>
        </div>

        <Section title="最近成交记录">
          <TradesTable trades={liveRecentTrades} />
        </Section>

        <footer className="rounded-lg border border-line bg-panel/80 px-4 py-3 text-xs leading-5 text-muted">
          后续接入 Binance Futures API 时，前端只调用自有后端接口。建议后端用环境变量保存 API Key/Secret，读取账户使用
          <span className="font-mono text-text"> /fapi/v3/account</span>、
          <span className="font-mono text-text"> /fapi/v3/positionRisk</span> 等接口，平仓使用
          <span className="font-mono text-text"> POST /api/futures/close-position</span> 统一封装；后端复核当前持仓数量后，对 LONG 发 SELL reduceOnly，对 SHORT 发 BUY reduceOnly。
          <span className="ml-2 inline-flex items-center gap-1 text-cyan">
            <RefreshCw className="h-3.5 w-3.5" />
            mock 数据可直接替换为 REST + WebSocket 数据源。
          </span>
        </footer>
      </div>

      <ClosePositionModal
        position={selectedPosition}
        loading={selectedPosition ? closingId === selectedPosition.id : false}
        error={closeError}
        onCancel={() => {
          if (!closingId) {
            setSelectedPosition(null);
            setCloseError(null);
          }
        }}
        onConfirm={handleClosePosition}
      />
    </main>
  );
}
