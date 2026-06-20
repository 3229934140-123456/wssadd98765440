import { forwardRef } from 'react';
import type { ChildRecord, ToothRecord, ToothStep } from '@/types';
import { STEP_LABELS, STEP_ORDER } from '@/types';
import { formatDateCN, formatDateTime } from '@/utils/date';
import { Printer, ShieldCheck, Calendar, Stethoscope } from 'lucide-react';

interface Props {
  child: ChildRecord;
  record: ToothRecord;
}

const ConfirmationSlip = forwardRef<HTMLDivElement, Props>(
  ({ child, record }, ref) => {
    const completedTeeth = record.selectedTeeth.filter((tooth) => {
      const sealed = record.steps.find(
        (s: ToothStep) => s.tooth === tooth && s.step === 'sealed'
      );
      return !!sealed?.completed;
    });

    const hasStep = (tooth: string, step: string) =>
      record.steps.find((s) => s.tooth === tooth && s.step === step)?.completed;

    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-medical-500" strokeWidth={1.8} />
            家长确认单预览
            <span className="chip bg-mint-50 text-mint-600 ring-1 ring-mint-200 text-[11px] font-medium">
              打印专用样式
            </span>
          </h3>
          <button
            onClick={() => window.print()}
            className="btn-secondary text-sm"
          >
            <Printer className="w-4 h-4" strokeWidth={1.8} />
            打印确认单
          </button>
        </div>

        <div
          ref={ref}
          className="print-slip mx-auto max-w-[210mm] bg-white rounded-2xl shadow-card-hover border border-slate-200 p-8 relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-medical-500 via-mint-500 to-warm-500" />
          <div className="absolute top-4 right-4 opacity-10">
            <ShieldCheck className="w-28 h-28 text-medical-500" strokeWidth={1.2} />
          </div>

          <div className="text-center border-b-2 border-dashed border-slate-200 pb-5 mb-5">
            <div className="text-[11px] text-slate-400 tracking-[0.3em] mb-1">
              DENTAL SEALANT CONFIRMATION
            </div>
            <h2 className="text-[22px] font-bold text-slate-800 tracking-wide">
              儿童窝沟封闭 操作确认单
            </h2>
            <div className="mt-1 text-xs text-slate-500">
              编号：{record.id.toUpperCase().slice(-10)} · 操作日期 {formatDateCN(record.completedAt || new Date().toISOString())}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13.5px] mb-6">
            <Row label="儿童姓名" value={child.name} />
            <Row label="年龄" value={`${child.age} 岁`} />
            <Row label="家长电话" value={child.parentPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')} />
            <Row label="学校/幼儿园" value={child.school || '—'} />
            <Row label="封闭类型" value={child.isFirst ? '首次封闭' : '复诊补封闭'} />
            <Row label="来源渠道" value={child.source} />
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 pb-1.5 border-b border-slate-100">
              <Stethoscope className="w-4 h-4 text-medical-600" strokeWidth={2} />
              <span className="font-semibold text-slate-800 text-[14px]">封闭牙位及操作记录</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="py-2.5 px-3 text-left font-semibold">牙位号</th>
                    {STEP_ORDER.map((s) => (
                      <th key={s} className="py-2.5 px-2 text-center font-semibold">
                        {STEP_LABELS[s]}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-center font-semibold">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {record.selectedTeeth
                    .sort((a, b) => Number(a) - Number(b))
                    .map((tooth) => {
                      const allDone = STEP_ORDER.every((s) => hasStep(tooth, s));
                      return (
                        <tr key={tooth} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg font-bold text-[14px] ${
                              ['16','26','36','46'].includes(tooth)
                                ? 'bg-warm-50 text-warm-700 ring-1 ring-warm-200'
                                : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'
                            }`}>
                              {tooth}
                            </span>
                          </td>
                          {STEP_ORDER.map((s) => (
                            <td key={s} className="py-2.5 px-2 text-center">
                              {hasStep(tooth, s) ? (
                                <span className="inline-block w-5 h-5 rounded-full bg-mint-500 text-white flex items-center justify-center mx-auto">
                                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5">
                                    <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </span>
                              ) : (
                                <span className="inline-block w-5 h-5 rounded-full border-2 border-slate-200 mx-auto" />
                              )}
                            </td>
                          ))}
                          <td className="py-2.5 px-3 text-center">
                            {allDone ? (
                              <span className="chip bg-mint-50 text-mint-700 ring-1 ring-mint-200 font-medium">
                                已完成
                              </span>
                            ) : (
                              <span className="chip bg-warm-50 text-warm-700 ring-1 ring-warm-200 font-medium">
                                部分完成
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="mt-2.5 text-[11.5px] text-slate-500 flex flex-wrap gap-x-5 gap-y-1">
              <span>已清洁：去除牙面菌斑及食物残渣</span>
              <span>已酸蚀：涂布酸蚀剂约30秒后冲洗干燥</span>
              <span>已封闭：窝沟封闭剂涂布并光固化</span>
              <span>需复查：已纳入随访复查计划</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-mint-600" strokeWidth={2} />
              <span className="font-semibold text-slate-800 text-[14px]">医生建议与复查日期</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
              <div className="rounded-xl bg-medical-50/40 border border-medical-100 p-4 min-h-[88px] text-[13px] leading-7 text-slate-700 whitespace-pre-wrap">
                {record.doctorAdvice || (
                  <span className="text-slate-400 italic">暂无医生建议，由操作护士填写</span>
                )}
              </div>
              <div className="shrink-0 text-center p-4 rounded-xl bg-gradient-to-br from-warm-50 to-mint-50 border border-warm-200/60">
                <div className="text-[11px] text-slate-500 mb-1">建议复查日期</div>
                <div className="text-lg font-bold text-warm-700 leading-tight">
                  {formatDateCN(record.reviewDate)}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  （封闭后约7天）
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-4 border-t-2 border-dashed border-slate-200">
            <SignBlock label="操作护士" value={record.operator} />
            <SignBlock label="医生签字" value="" />
            <SignBlock label="家长确认签字" value="" />
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div>诊所名称：儿童牙科门诊 · 咨询电话：400-888-8888</div>
            <div>打印时间：{formatDateTime(new Date().toISOString())}</div>
          </div>
        </div>
      </div>
    );
  }
);
ConfirmationSlip.displayName = 'ConfirmationSlip';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 border-b border-dashed border-slate-100 pb-2">
      <span className="text-slate-500 shrink-0 w-[92px]">{label}：</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

function SignBlock({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="h-12 border-b border-slate-300 flex items-end pb-1 justify-center text-sm font-medium text-slate-700">
        {value}
      </div>
      <div className="mt-1.5 text-center text-[11.5px] text-slate-500">{label}</div>
    </div>
  );
}

export default ConfirmationSlip;
