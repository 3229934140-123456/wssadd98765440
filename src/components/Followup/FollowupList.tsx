import { useMemo, useState } from 'react';
import {
  Phone,
  Calendar,
  Search,
  Filter,
  Eye,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { FollowupStatus, FollowupRecord, ChildRecord, ToothRecord } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import { useAppStore } from '@/store/useAppStore';
import EmptyState from '@/components/common/EmptyState';
import { daysUntil, formatDate, formatDateTime, isWithinThisMonth, isWithinThisWeek } from '@/utils/date';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import CallModal from './CallModal';

type RangeFilter = 'all' | 'week' | 'month' | 'overdue' | 'pending';
type StatusFilter = FollowupStatus | 'all';

type EnrichedFollowup = FollowupRecord & {
  child: ChildRecord;
  record: ToothRecord | undefined;
  daysLeft: number;
};

interface Props {
  stats: Record<FollowupStatus | 'all' | 'overdue' | 'week', number>;
}

export default function FollowupList({ stats }: Props) {
  const followups = useAppStore((s) => s.followups);
  const children = useAppStore((s) => s.children);
  const toothRecords = useAppStore((s) => s.toothRecords);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [range, setRange] = useState<RangeFilter>('pending');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modalItem, setModalItem] = useState<EnrichedFollowup | null>(null);

  const enriched: EnrichedFollowup[] = useMemo(
    () =>
      followups
        .map((f) => {
          const child = children.find((c) => c.id === f.childId);
          const record = toothRecords.find((r) => r.id === f.toothRecordId);
          const daysLeft = daysUntil(f.reviewDate);
          return { ...f, child, record, daysLeft };
        })
        .filter((f) => !!f.child) as EnrichedFollowup[],
    [followups, children, toothRecords]
  );

  const filtered = useMemo(
    () =>
      enriched
        .filter((f) => {
          if (range === 'week' && !isWithinThisWeek(f.reviewDate)) return false;
          if (range === 'month' && !isWithinThisMonth(f.reviewDate)) return false;
          if (range === 'overdue' && f.daysLeft >= 0) return false;
          if (range === 'pending' && f.status !== 'pending' && f.status !== 'contacted') return false;
          if (statusFilter !== 'all' && f.status !== statusFilter) return false;
          if (query.trim()) {
            const q = query.trim().toLowerCase();
            return (
              f.child.name.toLowerCase().includes(q) ||
              f.child.parentPhone.includes(q) ||
              (f.child.school && f.child.school.toLowerCase().includes(q)) ||
              (f.remark && f.remark.toLowerCase().includes(q))
            );
          }
          return true;
        })
        .sort((a, b) => {
          if (a.daysLeft !== b.daysLeft) return a.daysLeft - b.daysLeft;
          return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime();
        }),
    [enriched, range, statusFilter, query]
  );

  const rowCls = (f: (typeof filtered)[number]) => {
    if (f.daysLeft < 0 && (f.status === 'pending' || f.status === 'contacted'))
      return 'animate-row-overdue bg-rose-50/40';
    if (f.daysLeft <= 7 && (f.status === 'pending' || f.status === 'contacted'))
      return 'animate-row-pulse';
    return '';
  };

  const daysLabel = (d: number) => {
    if (d < 0) return { text: `逾期 ${Math.abs(d)} 天`, cls: 'text-rose-600 font-bold' };
    if (d === 0) return { text: '今天复查', cls: 'text-warm-600 font-bold' };
    if (d <= 3) return { text: `还有 ${d} 天`, cls: 'text-warm-600 font-semibold' };
    if (d <= 7) return { text: `还有 ${d} 天`, cls: 'text-warm-500' };
    return { text: `还有 ${d} 天`, cls: 'text-slate-500' };
  };

  return (
    <>
      <div
        className="card animate-fade-in-up"
        style={{ animationDelay: '120ms' }}
      >
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 leading-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-medical-500" strokeWidth={1.8} />
              回访跟进列表
              <span className="ml-1.5 text-sm font-normal text-slate-500">
                共 {filtered.length} 条
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                strokeWidth={1.8}
              />
              <input
                className="w-56 pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-medical-300 focus:ring-2 focus:ring-medical-100 transition-all"
                placeholder="搜索姓名/电话/学校"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/70 border border-slate-200/60">
              <Filter className="w-4 h-4 text-slate-400 ml-2" strokeWidth={1.8} />
              {(
                [
                  { v: 'pending', l: '待跟进', n: stats.pending + stats.contacted },
                  { v: 'week', l: '本周内', n: stats.week },
                  { v: 'overdue', l: '逾期', n: stats.overdue },
                  { v: 'month', l: '本月', n: undefined },
                  { v: 'all', l: '全部', n: stats.all },
                ] as { v: RangeFilter; l: string; n?: number }[]
              ).map((f) => (
                <button
                  key={f.v}
                  onClick={() => setRange(f.v)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    range === f.v
                      ? 'bg-white text-medical-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  )}
                >
                  {f.l}
                  {typeof f.n === 'number' && (
                    <span
                      className={clsx(
                        'ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold tabular-nums',
                        range === f.v
                          ? 'bg-medical-50 text-medical-600'
                          : 'bg-slate-200/80 text-slate-500'
                      )}
                    >
                      {f.n}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <select
              className="select w-auto py-2 text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="all">全部状态</option>
              <option value="pending">待联系 ({stats.pending})</option>
              <option value="contacted">已联系 ({stats.contacted})</option>
              <option value="appointed">已预约 ({stats.appointed})</option>
              <option value="postponed">暂不来院 ({stats.postponed})</option>
              <option value="invalid">号码无效 ({stats.invalid})</option>
              <option value="done">已完成 ({stats.done})</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            variant="followup"
            title="暂无符合条件的回访记录"
            description="请尝试调整筛选条件，或等待儿童完成窝沟封闭操作后自动进入回访列表。"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/70 text-slate-600 text-xs">
                  <th className="text-left font-semibold px-5 py-3 whitespace-nowrap">儿童信息</th>
                  <th className="text-left font-semibold px-3 py-3 whitespace-nowrap">复查日期</th>
                  <th className="text-left font-semibold px-3 py-3 whitespace-nowrap">紧迫度</th>
                  <th className="text-left font-semibold px-3 py-3 whitespace-nowrap">封闭牙位</th>
                  <th className="text-left font-semibold px-3 py-3 whitespace-nowrap">回访状态</th>
                  <th className="text-left font-semibold px-3 py-3 whitespace-nowrap">上次联系</th>
                  <th className="text-right font-semibold px-5 py-3 whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, idx) => {
                  const dl = daysLabel(f.daysLeft);
                  return (
                    <tr
                      key={f.id}
                      className={clsx(
                        'border-t border-slate-100 transition-colors hover:bg-slate-50/60 animate-fade-in',
                        rowCls(f),
                        idx % 2 === 1 && !rowCls(f) ? 'bg-slate-50/30' : ''
                      )}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-medical-100 to-medical-200 text-medical-700 flex items-center justify-center font-bold shadow-sm">
                            {f.child.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800 flex items-center gap-2">
                              {f.child.name}
                              <span className="text-xs font-normal text-slate-500">
                                {f.child.age}岁
                              </span>
                            </div>
                            <a
                              href={`tel:${f.child.parentPhone}`}
                              className="text-xs text-slate-500 hover:text-medical-600 flex items-center gap-1 transition-colors"
                            >
                              <Phone className="w-3 h-3" strokeWidth={2} />
                              {f.child.parentPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 **** $3')}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="font-medium text-slate-700 whitespace-nowrap">
                          {formatDate(f.reviewDate)}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {dayjs(f.reviewDate).format('dddd')}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div
                          className={clsx(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-xs whitespace-nowrap',
                            f.daysLeft < 0 && 'bg-rose-50 ring-1 ring-rose-200',
                            f.daysLeft >= 0 && f.daysLeft <= 7 && f.daysLeft > 3 && 'bg-warm-50 ring-1 ring-warm-200',
                            f.daysLeft >= 0 && f.daysLeft <= 3 && 'bg-warm-100 ring-1 ring-warm-300',
                            f.daysLeft > 7 && 'bg-slate-50 ring-1 ring-slate-200'
                          )}
                        >
                          {f.daysLeft < 0 ? (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500" strokeWidth={2} />
                          ) : f.daysLeft <= 7 ? (
                            <Clock className="w-3.5 h-3.5 text-warm-500" strokeWidth={2} />
                          ) : (
                            <Calendar className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                          )}
                          <span className={dl.cls}>{dl.text}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        {f.record && f.record.selectedTeeth.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {f.record.selectedTeeth
                              .sort((a, b) => Number(a) - Number(b))
                              .map((t) => (
                                <span
                                  key={t}
                                  className={clsx(
                                    'inline-flex items-center justify-center min-w-[32px] h-6 px-1.5 rounded-md text-[11px] font-bold ring-1',
                                    ['16', '26', '36', '46'].includes(t)
                                      ? 'bg-warm-50 text-warm-700 ring-warm-200'
                                      : 'bg-slate-50 text-slate-600 ring-slate-200'
                                  )}
                                >
                                  {t}
                                </span>
                              ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-col gap-1">
                          <StatusBadge type="followup" status={f.status} />
                          {f.remark && (
                            <div
                              className="text-[11px] text-slate-500 max-w-[220px] truncate"
                              title={f.remark}
                            >
                              💬 {f.remark}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        {f.contactCount > 0 ? (
                          <div className="leading-tight">
                            <div className="text-xs text-slate-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                              {f.contactCount} 次
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {formatDateTime(f.contactedAt)}
                            </div>
                          </div>
                        ) : (
                          <span className="chip bg-warm-50/60 text-warm-600 ring-1 ring-warm-200 animate-pulse-soft">
                            <User className="w-3 h-3" strokeWidth={2} />
                            尚未联系
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setModalItem(f)}
                            className={clsx(
                              'px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-all',
                              f.status === 'pending' || f.status === 'contacted'
                                ? 'btn-warning'
                                : 'btn-secondary'
                            )}
                          >
                            <Phone className="w-3.5 h-3.5" strokeWidth={2} />
                            回访记录
                          </button>
                          {f.record && (
                            <button
                              onClick={() => navigate(`/tooth/${f.childId}`)}
                              className="btn-ghost text-xs px-3 py-1.5"
                              title="查看完整就诊记录"
                            >
                              <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                              详情
                            </button>
                          )}
                          {(f.status === 'pending' || f.status === 'contacted') && (
                            <a
                              href={`tel:${f.child.parentPhone}`}
                              className="btn-success text-xs px-3 py-1.5"
                              title="直接拨打"
                            >
                              拨号
                              <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CallModal
        open={!!modalItem}
        onClose={() => setModalItem(null)}
        followup={modalItem}
        childName={modalItem?.child?.name || ''}
        phone={modalItem?.child?.parentPhone || ''}
      />
    </>
  );
}
