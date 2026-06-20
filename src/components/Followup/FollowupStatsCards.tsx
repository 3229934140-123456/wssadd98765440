import { useMemo } from 'react';
import {
  PhoneCall,
  CalendarCheck,
  CalendarX,
  AlertTriangle,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { daysUntil, isWithinThisWeek } from '@/utils/date';
import type { FollowupStatus } from '@/types';
import { clsx } from 'clsx';

export type FollowupStats = Record<FollowupStatus | 'all' | 'overdue' | 'week', number>;

const CARD_TONE: Record<string, {
  from: string;
  to: string;
  icon: typeof PhoneCall;
  label: string;
  hint: string;
}> = {
  pending: {
    from: 'from-warm-500',
    to: 'to-warm-600',
    icon: PhoneCall,
    label: '待联系',
    hint: '需要电话跟进',
  },
  overdue: {
    from: 'from-rose-500',
    to: 'to-rose-600',
    icon: AlertTriangle,
    label: '已逾期',
    hint: '超过复查日未跟进',
  },
  week: {
    from: 'from-violet-500',
    to: 'to-violet-600',
    icon: Calendar,
    label: '本周内复查',
    hint: '7天内需复查',
  },
  appointed: {
    from: 'from-mint-500',
    to: 'to-mint-600',
    icon: CalendarCheck,
    label: '已预约',
    hint: '家长已约好时间',
  },
  postponed: {
    from: 'from-sky-500',
    to: 'to-sky-600',
    icon: CalendarX,
    label: '暂不来院',
    hint: '已延后复查日期',
  },
  done: {
    from: 'from-slate-500',
    to: 'to-slate-600',
    icon: CheckCircle,
    label: '已完成',
    hint: '已复查或完成跟进',
  },
};

export const useFollowupStats = (): FollowupStats => {
  const followups = useAppStore((s) => s.followups);
  return useMemo(() => {
    const counts: FollowupStats = {
      all: followups.length,
      pending: 0,
      contacted: 0,
      appointed: 0,
      postponed: 0,
      invalid: 0,
      done: 0,
      overdue: 0,
      week: 0,
    };
    followups.forEach((f) => {
      const daysLeft = daysUntil(f.reviewDate);
      if (counts[f.status] !== undefined) counts[f.status]++;
      if (daysLeft < 0 && (f.status === 'pending' || f.status === 'contacted')) counts.overdue++;
      if (isWithinThisWeek(f.reviewDate)) counts.week++;
    });
    return counts;
  }, [followups]);
};

interface Props {
  stats: FollowupStats;
}

export default function FollowupStatsCards({ stats }: Props) {
  const cards: Array<{ key: keyof typeof CARD_TONE; count: number; alert?: boolean }> = [
    { key: 'pending', count: stats.pending },
    { key: 'overdue', count: stats.overdue, alert: stats.overdue > 0 },
    { key: 'week', count: stats.week },
    { key: 'appointed', count: stats.appointed },
    { key: 'postponed', count: stats.postponed + stats.invalid },
    { key: 'done', count: stats.done },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
      {cards.map(({ key, count, alert }, idx) => {
        const cfg = CARD_TONE[key];
        const Icon = cfg.icon;
        return (
          <div
            key={key}
            className={clsx(
              'relative p-5 rounded-2xl bg-gradient-to-br text-white shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden ring-1 ring-white/20',
              cfg.from,
              cfg.to,
              alert && 'ring-2 ring-rose-200',
              'hover:-translate-y-0.5 animate-fade-in-up'
            )}
            style={{ animationDelay: `${idx * 45}ms` }}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-[12.5px] font-medium text-white/85">{cfg.label}</div>
                <div className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
                  {count}
                  <span className="text-base font-medium text-white/60 ml-0.5">人</span>
                </div>
                <div className="mt-1 text-xs text-white/70">{cfg.hint}</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center ring-1 ring-white/30">
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
