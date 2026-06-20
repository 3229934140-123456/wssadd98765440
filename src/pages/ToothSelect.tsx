import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Search, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import { formatTime, isToday } from '@/utils/date';
import { clsx } from 'clsx';

export default function ToothSelect() {
  const children = useAppStore((s) => s.children);
  const getOrCreateToothRecord = useAppStore((s) => s.getOrCreateToothRecord);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const actionable = useMemo(
    () =>
      children
        .filter((c) => c.status !== 'completed')
        .filter((c) => {
          if (!query.trim()) return true;
          const q = query.trim().toLowerCase();
          return (
            c.name.toLowerCase().includes(q) ||
            c.parentPhone.includes(q) ||
            (c.school && c.school.toLowerCase().includes(q))
          );
        })
        .sort((a, b) => {
          const rank = { registered: 0, in_progress: 1, completed: 2 } as const;
          const r = rank[a.status] - rank[b.status];
          if (r !== 0) return r;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }),
    [children, query]
  );

  const handleEnter = (childId: string) => {
    const record = getOrCreateToothRecord(childId);
    navigate(`/tooth/${childId}?r=${record.id}`);
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-mint-50 text-mint-600 text-sm font-medium">
            <ShieldCheck className="w-4 h-4" strokeWidth={1.8} />
            护士站
          </span>
          选择儿童进入牙位记录
        </h1>
        <p className="mt-1 text-sm text-slate-500 ml-[112px]">
          请选择今日待处理的儿童，或使用搜索快速定位
        </p>
      </div>

      <div className="card p-4 mb-5 animate-fade-in-up">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400"
            strokeWidth={1.8}
          />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-medical-300 focus:ring-2 focus:ring-medical-100"
            placeholder="搜索儿童姓名、电话或学校…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {actionable.length === 0 ? (
        <EmptyState
          variant="children"
          title="暂无待处理的儿童"
          description="所有儿童的窝沟封闭操作已完成，或请先到「今日登记」页面录入儿童信息。"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {actionable.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => handleEnter(c.id)}
              className={clsx(
                'card-hover p-5 text-left group animate-fade-in-up',
                c.status === 'registered' && 'ring-1 ring-warm-300/60'
              )}
              style={{ animationDelay: `${idx * 45}ms` }}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-medical-100 to-medical-200 text-medical-700 flex items-center justify-center font-bold text-xl shadow-sm">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-[15px]">{c.name}</span>
                      <span className="text-xs text-slate-500">{c.age}岁</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" strokeWidth={2} />
                      {formatTime(c.createdAt)} 登记
                      {isToday(c.createdAt) ? '' : ' · 历史登记'}
                    </div>
                  </div>
                </div>
                <StatusBadge type="child" status={c.status} />
              </div>

              <div className="space-y-1.5 text-sm mb-4">
                <div className="text-slate-600">
                  📱 {c.parentPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 **** $3')}
                </div>
                <div className="text-slate-600 truncate">
                  🏫 {c.school || '未填写学校'}
                </div>
                <div className="text-slate-600 flex items-center gap-2">
                  {c.isFirst ? (
                    <span className="chip bg-warm-50 text-warm-700 ring-1 ring-warm-200 text-[11px]">
                      首次封闭
                    </span>
                  ) : (
                    <span className="chip bg-medical-50 text-medical-700 ring-1 ring-medical-200 text-[11px]">
                      复诊补封闭
                    </span>
                  )}
                  <span className="chip bg-slate-50 text-slate-600 ring-1 ring-slate-200 text-[11px]">
                    来源：{c.source}
                  </span>
                </div>
              </div>

              {c.remark && (
                <div className="text-xs text-slate-500 p-2.5 rounded-lg bg-slate-50 border border-slate-100 mb-4 line-clamp-2">
                  💡 {c.remark}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500 group-hover:text-medical-600 transition-colors">
                  {c.status === 'in_progress' ? '继续上次操作' : '开始操作'}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-medical-500 text-white text-sm font-medium shadow-sm group-hover:bg-medical-600 group-hover:shadow-md transition-all">
                  进入记录
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
