import { CheckCircle2, Circle, Clock, User } from 'lucide-react';
import type { ToothStep, StepType } from '@/types';
import { STEP_ORDER, STEP_LABELS } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { formatTime } from '@/utils/date';
import { clsx } from 'clsx';

interface Props {
  recordId: string;
  selectedTeeth: string[];
  steps: ToothStep[];
}

const STEP_COLORS: Record<StepType, { done: string; ring: string; text: string; bg: string; iconBg: string }> = {
  cleaned: {
    done: 'bg-sky-500',
    ring: 'ring-sky-200',
    text: 'text-sky-700',
    bg: 'bg-sky-50',
    iconBg: 'bg-sky-100 text-sky-600',
  },
  etched: {
    done: 'bg-violet-500',
    ring: 'ring-violet-200',
    text: 'text-violet-700',
    bg: 'bg-violet-50',
    iconBg: 'bg-violet-100 text-violet-600',
  },
  sealed: {
    done: 'bg-medical-500',
    ring: 'ring-medical-200',
    text: 'text-medical-700',
    bg: 'bg-medical-50',
    iconBg: 'bg-medical-100 text-medical-600',
  },
  review: {
    done: 'bg-mint-500',
    ring: 'ring-mint-200',
    text: 'text-mint-700',
    bg: 'bg-mint-50',
    iconBg: 'bg-mint-100 text-mint-600',
  },
};

export default function StepPanel({ recordId, selectedTeeth, steps }: Props) {
  const toggleStep = useAppStore((s) => s.toggleStep);
  const currentOperator = useAppStore((s) => s.currentOperator);

  if (selectedTeeth.length === 0) {
    return (
      <div className="card p-8 text-center animate-fade-in">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <Circle className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <h4 className="font-semibold text-slate-700 mb-1">尚未选择牙位</h4>
        <p className="text-sm text-slate-500">
          请先在上方牙位图中勾选需要处理的牙位，重点关注 16、26、36、46 四颗第一恒磨牙
        </p>
      </div>
    );
  }

  const sortedTeeth = [...selectedTeeth].sort((a, b) => Number(a) - Number(b));

  const toggle = (tooth: string, step: StepType) => toggleStep(recordId, tooth, step);

  const toothProgress = (tooth: string) => {
    const t = steps.filter((s) => s.tooth === tooth);
    return { done: t.filter((s) => s.completed).length, total: t.length || 4 };
  };

  return (
    <div className="space-y-3 animate-fade-in-up">
      {sortedTeeth.map((tooth, toothIdx) => {
        const prog = toothProgress(tooth);
        const isKey = ['16', '26', '36', '46'].includes(tooth);
        const pct = prog.total ? (prog.done / prog.total) * 100 : 0;

        return (
          <div
            key={tooth}
            className={clsx(
              'card p-5 transition-all',
              pct === 100 ? 'ring-1 ring-mint-300/70' : ''
            )}
            style={{ animationDelay: `${toothIdx * 60}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    'relative w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ring-1',
                    isKey
                      ? 'bg-gradient-to-br from-warm-50 to-warm-100 text-warm-700 ring-warm-300/70'
                      : 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 ring-slate-200'
                  )}
                >
                  {tooth}
                  {isKey && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-warm-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm border-2 border-white">
                      ★
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-[15px]">
                      牙位 {tooth}
                    </span>
                    {isKey && (
                      <span className="chip bg-warm-50 text-warm-700 ring-1 ring-warm-200">
                        重点封闭
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-32 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={clsx(
                          'h-full rounded-full transition-all duration-500',
                          pct === 100 ? 'bg-mint-500' : 'bg-medical-500'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span
                      className={clsx(
                        'text-xs font-semibold tabular-nums',
                        pct === 100 ? 'text-mint-600' : 'text-slate-500'
                      )}
                    >
                      {prog.done}/{prog.total} 步骤
                    </span>
                    {pct === 100 && (
                      <CheckCircle2 className="w-4 h-4 text-mint-500" strokeWidth={2} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-[30px] top-8 bottom-2 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />
              <div className="space-y-2.5">
                {STEP_ORDER.map((step, idx) => {
                  const found = steps.find((s) => s.tooth === tooth && s.step === step);
                  const completed = !!found?.completed;
                  const c = STEP_COLORS[step];
                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => toggle(tooth, step)}
                      className={clsx(
                        'relative w-full group flex items-stretch gap-3 p-3 rounded-xl text-left transition-all duration-200',
                        completed
                          ? `${c.bg} ring-1 ${c.ring}`
                          : 'hover:bg-slate-50 ring-1 ring-transparent'
                      )}
                    >
                      <div className="relative z-10 shrink-0">
                        <div
                          className={clsx(
                            'w-14 h-14 rounded-2xl flex items-center justify-center transition-all ring-4',
                            completed
                              ? `${c.done} text-white ring-white shadow-md`
                              : 'bg-white text-slate-400 ring-slate-100 border border-slate-200 group-hover:border-slate-300 group-hover:text-slate-500'
                          )}
                        >
                          {completed ? (
                            <CheckCircle2 className="w-7 h-7" strokeWidth={2.5} />
                          ) : (
                            <div className="flex flex-col items-center leading-none">
                              <span className="text-[15px] font-bold">{idx + 1}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between gap-3">
                          <div
                            className={clsx(
                              'font-semibold text-[14.5px] flex items-center gap-2',
                              completed ? c.text : 'text-slate-700'
                            )}
                          >
                            {STEP_LABELS[step]}
                            {step === 'cleaned' && <span className="text-[10px] font-normal text-slate-400">去除菌斑</span>}
                            {step === 'etched' && <span className="text-[10px] font-normal text-slate-400">酸蚀30秒</span>}
                            {step === 'sealed' && <span className="text-[10px] font-normal text-slate-400">光照固化</span>}
                            {step === 'review' && <span className="text-[10px] font-normal text-slate-400">纳入复查</span>}
                          </div>

                          {completed ? (
                            <div className="shrink-0 flex flex-col items-end gap-0.5">
                              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                <Clock className="w-3 h-3" strokeWidth={2} />
                                {formatTime(found?.time)}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                <User className="w-3 h-3" strokeWidth={2} />
                                {found?.operator || currentOperator}
                              </div>
                            </div>
                          ) : (
                            <span className="shrink-0 chip bg-white text-slate-400 border border-slate-200 text-[11px] font-medium">
                              点击完成此步
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
