import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  meta?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: 'neutral' | 'success' | 'warning' | 'danger';
  };
  progress?: {
    current: number;
    target: number;
    percent: number;
  };
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  meta,
  icon: Icon,
  badge,
  progress,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums font-mono">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {badge && (
          <span
            className={`text-xs font-medium ${
              badge.variant === 'success'
                ? 'text-emerald-600 dark:text-emerald-400'
                : badge.variant === 'warning'
                ? 'text-amber-600 dark:text-amber-400'
                : badge.variant === 'danger'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {(subtitle || meta) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {subtitle && <span>{subtitle}</span>}
          {subtitle && meta && <span aria-hidden="true">·</span>}
          {meta && <span>{meta}</span>}
        </div>
      )}

      {progress && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 tabular-nums">
            <span>Avance meta</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{progress.percent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progress.percent >= 100
                  ? 'bg-emerald-600'
                  : progress.percent >= 70
                  ? 'bg-sky-600'
                  : progress.percent >= 40
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progress.percent))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
