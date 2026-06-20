import { type LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  tone?: 'medical' | 'mint' | 'warm' | 'rose';
  trend?: { value: number; label: string };
}

const TONE = {
  medical: {
    bg: 'from-medical-500 to-medical-600',
    iconBg: 'bg-white/20',
    ring: 'ring-medical-300/50',
  },
  mint: {
    bg: 'from-mint-500 to-mint-600',
    iconBg: 'bg-white/20',
    ring: 'ring-mint-300/50',
  },
  warm: {
    bg: 'from-warm-500 to-warm-600',
    iconBg: 'bg-white/20',
    ring: 'ring-warm-300/50',
  },
  rose: {
    bg: 'from-rose-500 to-rose-600',
    iconBg: 'bg-white/20',
    ring: 'ring-rose-300/50',
  },
};

export default function StatsCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = 'medical',
  trend,
}: Props) {
  const t = TONE[tone];
  return (
    <div
      className={clsx(
        'relative p-5 rounded-2xl bg-gradient-to-br text-white shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden ring-1',
        t.bg,
        t.ring,
        'hover:-translate-y-0.5'
      )}
    >
      <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute right-4 bottom-0 w-24 h-24 rounded-full bg-white/5 blur-xl" />

      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[13px] font-medium text-white/85">{label}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
            {value}
            <span className="text-lg font-medium text-white/60 ml-0.5">
              {typeof value === 'number' ? '人' : ''}
            </span>
          </div>
          {hint && (
            <div className="mt-1 text-xs text-white/70">{hint}</div>
          )}
          {trend && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/15 backdrop-blur">
              <span className={trend.value >= 0 ? 'text-white' : 'text-rose-100'}>
                {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}
              </span>
              <span className="text-white/80">{trend.label}</span>
            </div>
          )}
        </div>
        <div
          className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center ring-1 ring-white/25 shadow-inner',
            t.iconBg
          )}
        >
          <Icon className="w-6 h-6" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
