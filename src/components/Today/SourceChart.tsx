import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { SOURCE_OPTIONS } from '@/types';
import { isToday } from '@/utils/date';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { SourceType } from '@/types';

const COLORS: Record<SourceType, string> = {
  学校体检: '#2563EB',
  家长介绍: '#10B981',
  网络推广: '#8B5CF6',
  门诊路过: '#F59E0B',
  其他: '#94A3B8',
};

export default function SourceChart() {
  const children = useAppStore((s) => s.children);

  const data = useMemo(() => {
    const todayChildren = children.filter((c) => isToday(c.createdAt));
    return SOURCE_OPTIONS.map((s) => ({
      name: s,
      value: todayChildren.filter((c) => c.source === s).length,
    })).filter((d) => d.value > 0);
  }, [children]);

  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '180ms' }}>
      <h3 className="font-semibold text-slate-800 leading-tight mb-4">
        今日来源渠道分布
        {total > 0 && (
          <span className="ml-2 text-sm font-normal text-slate-500">共 {total} 人</span>
        )}
      </h3>

      {total === 0 ? (
        <div className="h-56 flex items-center justify-center text-sm text-slate-400">
          暂无登记数据
        </div>
      ) : (
        <>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[entry.name as SourceType]}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [`${v} 人 (${((v / total) * 100).toFixed(0)}%)`, '人数']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: 12,
                  }}
                />
                <Legend
                  iconType="circle"
                  formatter={(v) => <span className="text-xs text-slate-600">{v}</span>}
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {data.map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50/70"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: COLORS[d.name as SourceType] }}
                  />
                  <span className="text-xs text-slate-600">{d.name}</span>
                </div>
                <div className="text-sm font-semibold text-slate-800 tabular-nums">
                  {d.value}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    {((d.value / total) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
