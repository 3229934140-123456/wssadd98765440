import { PhoneCall, ShieldAlert } from 'lucide-react';
import FollowupStatsCards, { useFollowupStats } from '@/components/Followup/FollowupStatsCards';
import FollowupList from '@/components/Followup/FollowupList';

export default function FollowupReminder() {
  const stats = useFollowupStats();

  return (
    <div className="p-8 max-w-[1700px] mx-auto space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-warm-50 text-warm-600 text-sm font-medium">
            <PhoneCall className="w-4 h-4" strokeWidth={1.8} />
            持续跟进
          </span>
          回访提醒
        </h1>
        <p className="mt-1 text-sm text-slate-500 ml-[116px]">
          复查日前 7 天黄色提醒，逾期红色标记；前台记录电话结果，持续跟进直至闭环
        </p>
      </div>

      <FollowupStatsCards stats={stats} />

      {(stats.overdue > 0 || stats.pending + stats.contacted > 5) && (
        <div
          className="card p-4 animate-fade-in-up border-warm-200 bg-gradient-to-r from-warm-50/70 via-white to-mint-50/50"
          style={{ animationDelay: '60ms' }}
        >
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <ShieldAlert className="w-5 h-5 text-warm-600 shrink-0" strokeWidth={1.8} />
            <div className="flex-1 min-w-[280px]">
              <span className="text-slate-700">
                当前有 <b className="text-warm-700">{stats.pending + stats.contacted}</b> 位儿童待跟进
                {stats.overdue > 0 && (
                  <>
                    ，其中 <b className="text-rose-600">{stats.overdue}</b> 位已逾期超过复查日
                  </>
                )}
                ，请优先联系处理。
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="chip bg-white ring-1 ring-slate-200">
                <span className="w-2 h-2 rounded-full bg-warm-500 animate-pulse" />
                7天内复查 · 黄色提醒
              </span>
              <span className="chip bg-white ring-1 ring-slate-200">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                逾期未联系 · 红色高亮
              </span>
            </div>
          </div>
        </div>
      )}

      <FollowupList stats={stats} />
    </div>
  );
}
