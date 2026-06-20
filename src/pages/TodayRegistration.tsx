import { useMemo } from 'react';
import { Users, Sparkles, RefreshCcw, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { isToday } from '@/utils/date';
import StatsCard from '@/components/Today/StatsCard';
import RegistrationForm from '@/components/Today/RegistrationForm';
import ChildrenList from '@/components/Today/ChildrenList';
import SourceChart from '@/components/Today/SourceChart';

export default function TodayRegistration() {
  const children = useAppStore((s) => s.children);

  const stats = useMemo(() => {
    const today = children.filter((c) => isToday(c.createdAt));
    return {
      total: today.length,
      first: today.filter((c) => c.isFirst).length,
      revisit: today.filter((c) => !c.isFirst).length,
      pending: today.filter((c) => c.status === 'registered').length,
    };
  }, [children]);

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-medical-50 text-medical-600 text-sm font-medium">
            今日工作
          </span>
          今日登记
        </h1>
        <p className="mt-1 text-sm text-slate-500 ml-[108px]">
          前台录入儿童信息，护士进入牙位记录完成操作闭环
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          label="今日登记总数"
          value={stats.total}
          icon={Users}
          hint="到院儿童总人数"
          tone="medical"
        />
        <StatsCard
          label="首次封闭"
          value={stats.first}
          icon={Sparkles}
          hint="新儿童首次做窝沟封闭"
          tone="mint"
        />
        <StatsCard
          label="复诊 / 补封闭"
          value={stats.revisit}
          icon={RefreshCcw}
          hint="有封闭记录的儿童"
          tone="warm"
        />
        <StatsCard
          label="待进入牙位记录"
          value={stats.pending}
          icon={AlertCircle}
          hint="已登记未开始操作"
          tone="rose"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <RegistrationForm />
          <ChildrenList />
        </div>
        <div className="space-y-6">
          <SourceChart />

          <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
            <h3 className="font-semibold text-slate-800 leading-tight mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-warm-100 text-warm-600 flex items-center justify-center text-xs font-bold">
                i
              </span>
              操作说明
            </h3>
            <ol className="space-y-2.5 text-sm text-slate-600 leading-relaxed">
              <li className="flex gap-2.5">
                <span className="shrink-0 w-5 h-5 rounded-md bg-medical-50 text-medical-600 flex items-center justify-center text-xs font-bold">1</span>
                前台录入儿童基本信息，保存后自动进入今日列表
              </li>
              <li className="flex gap-2.5">
                <span className="shrink-0 w-5 h-5 rounded-md bg-medical-50 text-medical-600 flex items-center justify-center text-xs font-bold">2</span>
                点击"开始牙位记录"进入操作页面，交由护士处理
              </li>
              <li className="flex gap-2.5">
                <span className="shrink-0 w-5 h-5 rounded-md bg-medical-50 text-medical-600 flex items-center justify-center text-xs font-bold">3</span>
                勾选牙位（重点 16/26/36/46），按 FDS 四步标记完成情况
              </li>
              <li className="flex gap-2.5">
                <span className="shrink-0 w-5 h-5 rounded-md bg-medical-50 text-medical-600 flex items-center justify-center text-xs font-bold">4</span>
                完成后生成家长确认单并打印，自动排入回访列表
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
