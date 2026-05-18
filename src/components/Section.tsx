import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({ title, action, children, className = "" }: SectionProps) {
  return (
    <section className={`panel ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-line/80 px-3 py-2.5">
        <h2 className="panel-title">{title}</h2>
        {action}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}
