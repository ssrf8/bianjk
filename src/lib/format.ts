import type { Position, RiskLevel } from "../types";

export const currency = (value: number, digits = 2) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

export const number = (value: number, digits = 2) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

export const percent = (value: number, digits = 2) => `${number(value, digits)}%`;

export const pnlClass = (value: number) => (value >= 0 ? "text-long" : "text-short");

export const sideLabel = (side: Position["side"]) => (side === "LONG" ? "多单" : "空单");

export const closeLabel = (side: Position["side"]) => (side === "LONG" ? "平多" : "平空");

export const liquidationDistance = (position: Position) => {
  const raw =
    position.side === "LONG"
      ? ((position.markPrice - position.liquidationPrice) / position.markPrice) * 100
      : ((position.liquidationPrice - position.markPrice) / position.markPrice) * 100;
  return Math.max(raw, 0);
};

export const riskMeta: Record<RiskLevel, { label: string; className: string; dot: string }> = {
  safe: {
    label: "安全",
    className: "border-long/40 bg-long/10 text-long",
    dot: "bg-long",
  },
  watch: {
    label: "注意",
    className: "border-warn/50 bg-warn/10 text-warn",
    dot: "bg-warn",
  },
  high: {
    label: "高风险",
    className: "border-orange-500/50 bg-orange-500/10 text-orange-300",
    dot: "bg-orange-400",
  },
  danger: {
    label: "危险",
    className: "border-danger/50 bg-danger/10 text-danger",
    dot: "bg-danger",
  },
};
