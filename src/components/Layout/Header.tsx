import { User, Bell, RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { formatDateCN, todayISO } from '@/utils/date';

export default function Header() {
  const [operatorName, setOperatorName] = useState(useAppStore.getState().currentOperator);
  const [editing, setEditing] = useState(false);
  const setCurrentOperator = useAppStore((s) => s.setCurrentOperator);
  const resetToDemo = useAppStore((s) => s.resetToDemo);
  const followups = useAppStore((s) => s.followups);

  const pendingCount = followups.filter(
    (f) => f.status === 'pending' || f.status === 'contacted'
  ).length;

  const saveOperator = () => {
    const name = operatorName.trim() || '护士';
    setCurrentOperator(name);
    setEditing(false);
  };

  return (
    <header className="h-16 shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-30">
      <div className="h-full px-8 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.8} />
            <input
              type="text"
              placeholder="搜索儿童姓名 / 电话 / 学校…"
              className="w-72 pl-9 pr-4 py-2 rounded-xl bg-slate-100/70 border border-transparent text-sm focus:outline-none focus:bg-white focus:border-medical-300 focus:ring-2 focus:ring-medical-100 transition-all"
            />
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-medical-50 text-medical-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-medical-500 animate-pulse" />
            {formatDateCN(todayISO())}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('确认重置为演示数据？当前所有修改将丢失。')) {
                resetToDemo();
              }
            }}
            className="btn-ghost text-xs px-3 py-2"
            title="重置为演示数据"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.8} />
            重置演示
          </button>

          <button className="relative w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <Bell className="w-5 h-5 text-slate-600" strokeWidth={1.8} />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center shadow-md border-2 border-white">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-400 to-medical-600 text-white flex items-center justify-center shadow-sm">
              <User className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div className="leading-tight">
              {editing ? (
                <input
                  autoFocus
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  onBlur={saveOperator}
                  onKeyDown={(e) => e.key === 'Enter' && saveOperator()}
                  className="w-24 px-2 py-1 text-sm font-medium rounded border border-medical-300 focus:outline-none focus:ring-2 focus:ring-medical-200"
                />
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm font-medium text-slate-800 hover:text-medical-600 transition-colors"
                  title="点击修改当前操作者"
                >
                  {operatorName}
                </button>
              )}
              <div className="text-[11px] text-slate-500">当前操作者</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
