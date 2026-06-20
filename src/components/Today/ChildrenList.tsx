import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Trash2,
  Filter,
  Phone,
  User,
  School,
  Tag,
  Clock,
  Search,
  Download,
  Printer,
} from 'lucide-react';
import type { ChildStatus, SourceType } from '@/types';
import { SOURCE_OPTIONS, CHILD_STATUS_LABEL } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/components/common/Toast';
import { isToday, formatTime, formatDateCN, nowISO } from '@/utils/date';
import { clsx } from 'clsx';

const STATUS_FILTERS: { label: string; value: ChildStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: 'registered' },
  { label: '操作中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
];

const SOURCE_COLORS: Record<string, string> = {
  学校体检: 'bg-medical-50 text-medical-700 ring-medical-100',
  家长介绍: 'bg-mint-50 text-mint-700 ring-mint-100',
  网络推广: 'bg-violet-50 text-violet-700 ring-violet-100',
  门诊路过: 'bg-warm-50 text-warm-700 ring-warm-100',
  其他: 'bg-slate-50 text-slate-600 ring-slate-200',
};

export default function ChildrenList() {
  const children = useAppStore((s) => s.children);
  const removeChild = useAppStore((s) => s.removeChild);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ChildStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceType | 'all'>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');

  const schoolOptions = useMemo(() => {
    const schools = new Set<string>();
    children.forEach((c) => {
      if (isToday(c.createdAt) && c.school) {
        schools.add(c.school);
      }
    });
    return Array.from(schools).sort();
  }, [children]);

  const todayList = useMemo(
    () =>
      children.filter((c) => {
        if (!isToday(c.createdAt)) return false;
        if (status !== 'all' && c.status !== status) return false;
        if (sourceFilter !== 'all' && c.source !== sourceFilter) return false;
        if (schoolFilter !== 'all' && c.school !== schoolFilter) return false;
        if (query.trim()) {
          const q = query.trim().toLowerCase();
          return (
            c.name.toLowerCase().includes(q) ||
            c.parentPhone.includes(q) ||
            (c.school && c.school.toLowerCase().includes(q))
          );
        }
        return true;
      }),
    [children, query, status, sourceFilter, schoolFilter]
  );

  const countByStatus = (s: ChildStatus | 'all') => {
    if (s === 'all') return children.filter((c) => isToday(c.createdAt)).length;
    return children.filter((c) => isToday(c.createdAt) && c.status === s).length;
  };

  const handleRemove = (id: string, name: string) => {
    if (confirm(`确认删除 ${name} 的登记记录吗？此操作不可撤销。`)) {
      removeChild(id);
      showToast(`已删除 ${name} 的登记记录`, 'info');
    }
  };

  const exportCSV = () => {
    if (todayList.length === 0) {
      showToast('当前没有可导出的数据', 'info');
      return;
    }
    const headers = ['序号', '姓名', '年龄', '家长电话', '学校/幼儿园', '来源渠道', '是否首次', '状态', '登记时间', '备注'];
    const rows = todayList.map((c, idx) => [
      idx + 1,
      c.name,
      c.age,
      c.parentPhone,
      c.school || '—',
      c.source,
      c.isFirst ? '是' : '否',
      CHILD_STATUS_LABEL[c.status],
      formatTime(c.createdAt),
      c.remark || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `今日登记名单_${formatDateCN(nowISO())}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`已导出 ${todayList.length} 条登记记录`, 'success');
  };

  const printList = () => {
    if (todayList.length === 0) {
      showToast('当前没有可打印的数据', 'info');
      return;
    }
    window.print();
  };

  return (
    <div
      className="card animate-fade-in-up print-list"
      style={{ animationDelay: '120ms' }}
    >
      <div className="p-5 border-b border-slate-100 space-y-4 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-800 leading-tight flex items-center gap-2">
              <User className="w-5 h-5 text-medical-500" strokeWidth={1.8} />
              今日登记列表
              <span className="ml-1.5 text-sm font-normal text-slate-500">
                共 {todayList.length} 位儿童
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={exportCSV}
              className="btn-secondary text-sm py-2"
            >
              <Download className="w-4 h-4" strokeWidth={2} />
              导出 CSV
            </button>
            <button
              onClick={printList}
              className="btn-secondary text-sm py-2"
            >
              <Printer className="w-4 h-4" strokeWidth={2} />
              打印名单
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              strokeWidth={1.8}
            />
            <input
              className="w-56 pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-medical-300 focus:ring-2 focus:ring-medical-100 transition-all"
              placeholder="搜索姓名 / 电话 / 学校"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/70 border border-slate-200/60">
            <Filter className="w-4 h-4 text-slate-400 ml-2" strokeWidth={1.8} />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatus(f.value)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  status === f.value
                    ? 'bg-white text-medical-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                )}
              >
                {f.label}
                <span
                  className={clsx(
                    'ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold tabular-nums',
                    status === f.value
                      ? 'bg-medical-50 text-medical-600'
                      : 'bg-slate-200/80 text-slate-500'
                  )}
                >
                  {countByStatus(f.value)}
                </span>
              </button>
            ))}
          </div>

          <div className="relative">
            <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.8} />
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-medical-300 focus:ring-2 focus:ring-medical-100 transition-all appearance-none cursor-pointer"
            >
              <option value="all">全部学校</option>
              {schoolOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.8} />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as SourceType | 'all')}
              className="pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-medical-300 focus:ring-2 focus:ring-medical-100 transition-all appearance-none cursor-pointer"
            >
              <option value="all">全部来源</option>
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {todayList.length === 0 ? (
        <EmptyState
          variant="children"
          title="暂无登记记录"
          description="请使用左侧表单登记今日到院的儿童信息，或尝试调整筛选条件。"
        />
      ) : (
        <>
          <div className="hidden print:block p-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">窝沟封闭今日登记名单</h2>
            <p className="text-sm text-slate-500 mt-1">
              日期：{formatDateCN(nowISO())} · 共 {todayList.length} 位儿童
            </p>
          </div>
          <div className="divide-y divide-slate-100/80">
          {todayList.map((c, idx) => (
            <div
              key={c.id}
              className={clsx(
                'px-5 py-4 flex items-center gap-4 transition-all duration-200 group print:py-2',
                idx % 2 === 1 ? 'bg-slate-50/40' : 'hover:bg-slate-50/70'
              )}
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-medical-100 to-medical-200 text-medical-700 flex items-center justify-center font-semibold text-lg shadow-sm ring-1 ring-medical-300/30">
                {c.name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-1 text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 truncate">
                      {c.name}
                    </span>
                    <StatusBadge type="child" status={c.status} />
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3" strokeWidth={2} />
                    {c.age}岁
                    {c.isFirst ? (
                      <span className="ml-1 text-rose-500 font-medium">· 首次</span>
                    ) : (
                      <span className="ml-1 text-medical-600">· 复诊</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <a
                    href={`tel:${c.parentPhone}`}
                    className="text-slate-700 hover:text-medical-600 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" strokeWidth={1.8} />
                    {c.parentPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 **** $3')}
                  </a>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" strokeWidth={2} />
                    {formatTime(c.createdAt)} 登记
                  </div>
                </div>

                <div className="md:col-span-2 xl:col-span-1 truncate">
                  <div className="text-slate-700 flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.8} />
                    <span className="truncate">{c.school || '—'}</span>
                  </div>
                  {c.remark && (
                    <div className="text-xs text-slate-500 truncate mt-0.5" title={c.remark}>
                      📝 {c.remark}
                    </div>
                  )}
                </div>

                <div className="xl:col-span-1">
                  <span
                    className={clsx(
                      'chip ring-1',
                      SOURCE_COLORS[c.source] || SOURCE_COLORS['其他']
                    )}
                  >
                    <Tag className="w-3 h-3" strokeWidth={2} />
                    {c.source}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity no-print">
                <button
                  onClick={() => handleRemove(c.id, c.name)}
                  className="w-9 h-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all"
                  title="删除记录"
                >
                  <Trash2 className="w-4.5 h-4.5" strokeWidth={1.8} />
                </button>
                <button
                  onClick={() => navigate(`/tooth/${c.id}`)}
                  className={clsx(
                    'px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-1.5 transition-all',
                    c.status === 'completed'
                      ? 'btn-secondary'
                      : c.status === 'in_progress'
                      ? 'btn-warning'
                      : 'btn-primary'
                  )}
                >
                  {c.status === 'completed' ? '查看详情' : c.status === 'in_progress' ? '继续操作' : '开始牙位记录'}
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
          </div>
        </>
      )}
    </div>
  );
}
