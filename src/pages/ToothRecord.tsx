import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  ChevronRight,
  Calendar as CalendarIcon,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  User,
  Phone,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/components/common/Toast';
import StatusBadge from '@/components/common/StatusBadge';
import ToothChart from '@/components/Tooth/ToothChart';
import StepPanel from '@/components/Tooth/StepPanel';
import ConfirmationSlip from '@/components/Tooth/ConfirmationSlip';
import ReviewPlanPanel from '@/components/Tooth/ReviewPlanPanel';
import { addDaysISO, formatDate, formatTime, todayISO } from '@/utils/date';
import { KEY_TEETH, STEP_ORDER, STEP_LABELS } from '@/types';
import type { ToothStep } from '@/types';
import { clsx } from 'clsx';

export default function ToothRecord() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const slipRef = useRef<HTMLDivElement>(null);

  const child = useAppStore((s) => s.children.find((c) => c.id === id));
  const [recordId, setRecordId] = useState<string | null>(null);
  const getOrCreateToothRecord = useAppStore((s) => s.getOrCreateToothRecord);
  const toggleTooth = useAppStore((s) => s.toggleTooth);
  const setSelectedTeeth = useAppStore((s) => s.setSelectedTeeth);
  const setDoctorAdvice = useAppStore((s) => s.setDoctorAdvice);
  const setReviewDate = useAppStore((s) => s.setReviewDate);
  const completeToothRecord = useAppStore((s) => s.completeToothRecord);
  const updateChildStatus = useAppStore((s) => s.updateChildStatus);

  useEffect(() => {
    if (id && !recordId) {
      const r = getOrCreateToothRecord(id);
      setRecordId(r.id);
    }
  }, [id, recordId, getOrCreateToothRecord]);

  const record = useAppStore((s) =>
    s.toothRecords.find((r) => r.id === recordId)
  );

  const followup = useAppStore((s) =>
    recordId ? s.followups.find((f) => f.toothRecordId === recordId) : undefined
  );

  const completionStats = useMemo(() => {
    if (!record) return { sealedCount: 0, allDone: false, canComplete: false };
    const sealedCount = record.selectedTeeth.filter((t) =>
      record.steps.find(
        (s: ToothStep) => s.tooth === t && s.step === 'sealed' && s.completed
      )
    ).length;
    const allDone = record.selectedTeeth.every((t) =>
      STEP_ORDER.every((s) => {
        const found = record.steps.find(
          (st: ToothStep) => st.tooth === t && st.step === s
        );
        return found?.completed;
      })
    );
    return {
      sealedCount,
      allDone: record.selectedTeeth.length > 0 && allDone,
      canComplete: record.selectedTeeth.length > 0 && sealedCount > 0,
    };
  }, [record]);

  const missingSteps = useMemo(() => {
    if (!record) return [] as { tooth: string; step: string; stepLabel: string }[];
    const missing: { tooth: string; step: string; stepLabel: string }[] = [];
    record.selectedTeeth.forEach((tooth) => {
      STEP_ORDER.forEach((step) => {
        const found = record.steps.find(
          (s: ToothStep) => s.tooth === tooth && s.step === step
        );
        if (!found?.completed) {
          missing.push({ tooth, step, stepLabel: STEP_LABELS[step] });
        }
      });
    });
    return missing;
  }, [record]);

  const DEFAULT_ADVICE =
    '1. 封闭后2小时内请勿进食过硬、过粘食物；\n' +
    '2. 24小时内尽量食用软食，避免咀嚼冰块、坚果等硬物；\n' +
    '3. 每日认真刷牙（早晚各3分钟），配合使用牙线清洁邻面；\n' +
    '4. 如出现咬合高点、牙龈不适或封闭剂脱落，请及时复诊；\n' +
    '5. 建议每3-6个月复查一次，确保封闭剂完整有效。';

  const [showSlip, setShowSlip] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showMissingCheck, setShowMissingCheck] = useState(false);

  if (!child) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-500 mb-4">未找到对应的儿童信息</p>
        <button onClick={() => navigate('/tooth-select')} className="btn-primary">
          返回选择
        </button>
      </div>
    );
  }

  if (!record) return null;

  const handleQuickKey = () => {
    setSelectedTeeth(record.id, KEY_TEETH);
    showToast('已快速勾选四颗重点第一恒磨牙 16/26/36/46');
  };

  const handleClear = () => {
    setSelectedTeeth(record.id, []);
    showToast('已清空牙位选择', 'info');
  };

  const handleComplete = () => {
    if (!completionStats.canComplete) {
      showToast('请至少选择一颗牙位并完成「已封闭」步骤', 'error');
      return;
    }
    if (missingSteps.length > 0) {
      setShowMissingCheck(true);
      return;
    }
    doComplete();
  };

  const doComplete = () => {
    if (!record) return;
    if (!record.doctorAdvice.trim()) {
      if (confirm('尚未填写医生建议，是否使用默认建议内容？')) {
        setDoctorAdvice(record.id, DEFAULT_ADVICE);
      } else {
        return;
      }
    }
    setCompleting(true);
    setShowMissingCheck(false);
    setTimeout(() => {
      completeToothRecord(record.id);
      setCompleting(false);
      setShowSlip(true);
      showToast(`${child.name} 的窝沟封闭记录已完成，已自动加入回访列表`);
    }, 600);
  };

  const isCompleted = !!record.completedAt;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/tooth-select')}
            className="btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            返回选择
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              牙位记录 · 操作工作台
              <StatusBadge type="child" status={child.status} />
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              按 FDS 标准流程：清洁 → 酸蚀 → 封闭 → 复查
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isCompleted ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-mint-50 ring-1 ring-mint-200 text-mint-700 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
              已于 {formatTime(record.completedAt)} 完成操作
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  updateChildStatus(child.id, 'registered');
                  showToast('已暂停操作，状态已更新', 'info');
                }}
                className="btn-secondary"
              >
                保存并稍后继续
              </button>
              <button
                onClick={handleComplete}
                disabled={completing}
                className="btn-success"
              >
                <Save className="w-4 h-4" strokeWidth={2} />
                {completing ? '保存中…' : '完成操作 / 生成确认单'}
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </>
          )}
        </div>
      </div>

      <div
        className="card p-5 animate-fade-in-up"
        style={{ animationDelay: '60ms' }}
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-medical-400 to-medical-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {child.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold text-slate-800">{child.name}</span>
                <span className="chip bg-medical-50 text-medical-700 ring-1 ring-medical-200">
                  {child.age}岁
                </span>
                <span
                  className={clsx(
                    'chip ring-1',
                    child.isFirst
                      ? 'bg-warm-50 text-warm-700 ring-warm-200'
                      : 'bg-mint-50 text-mint-700 ring-mint-200'
                  )}
                >
                  {child.isFirst ? '首次封闭' : '复诊补封闭'}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" strokeWidth={2} />
                  {child.parentPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 **** $3')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" strokeWidth={2} />
                  {child.school || '未填写学校'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                  来源：{child.source}
                </span>
              </div>
            </div>
          </div>

          {child.remark && (
            <div className="flex-1 min-w-[280px] p-3 rounded-xl bg-warm-50/60 border border-warm-200/60 text-sm text-warm-800 flex items-start gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-warm-500 shrink-0 mt-0.5" strokeWidth={1.8} />
              <div>
                <span className="font-semibold">前台备注：</span>
                {child.remark}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-500">已选牙位</div>
              <div className="text-2xl font-bold tabular-nums text-slate-800">
                {record.selectedTeeth.length}
                <span className="text-sm font-normal text-slate-400 ml-0.5">颗</span>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-right">
              <div className="text-xs text-slate-500">已完成封闭</div>
              <div className="text-2xl font-bold tabular-nums text-mint-600">
                {completionStats.sealedCount}
                <span className="text-sm font-normal text-slate-400 ml-0.5">颗</span>
              </div>
            </div>
            {completionStats.allDone && (
              <div className="px-3 py-1.5 rounded-xl bg-mint-50 text-mint-700 ring-1 ring-mint-200 flex items-center gap-1.5 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                全部步骤已完成 ✓
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          <div
            className="card p-6 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-semibold text-slate-800 leading-tight flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-medical-50 text-medical-600 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  交互式恒牙位图
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    · 点击牙位勾选或取消
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleClear} className="btn-ghost text-xs px-3 py-1.5">
                  清空选择
                </button>
                <button onClick={handleQuickKey} className="btn-warning text-xs">
                  ⚡ 快速勾选 16/26/36/46（重点）
                </button>
              </div>
            </div>
            <ToothChart
              selectedTeeth={record.selectedTeeth}
              onToggle={(t) => toggleTooth(record.id, t)}
              disabled={isCompleted}
            />
          </div>

          <div
            className="card p-6 animate-fade-in-up"
            style={{ animationDelay: '160ms' }}
          >
            <h3 className="font-semibold text-slate-800 mb-5 leading-tight flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center text-xs font-bold">
                2
              </span>
              操作步骤面板
              <span className="text-xs font-normal text-slate-500 ml-1">
                · 每步点击标记完成，自动记录时间和操作者
              </span>
            </h3>
            <StepPanel
              recordId={record.id}
              selectedTeeth={record.selectedTeeth}
              steps={record.steps}
            />
          </div>

          <div
            className="card p-6 animate-fade-in-up"
            style={{ animationDelay: '220ms' }}
          >
            <h3 className="font-semibold text-slate-800 mb-5 leading-tight flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-warm-50 text-warm-600 flex items-center justify-center text-xs font-bold">
                3
              </span>
              医生建议与复查日期
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" strokeWidth={2} />
                  医生建议 / 术后注意事项
                </label>
                <textarea
                  className="textarea leading-7"
                  placeholder="填写术后注意事项、饮食建议、刷牙指导等"
                  value={record.doctorAdvice}
                  onChange={(e) => setDoctorAdvice(record.id, e.target.value)}
                  disabled={isCompleted}
                />
                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() =>
                      record.doctorAdvice.trim()
                        ? setDoctorAdvice(record.id, record.doctorAdvice + '\n' + DEFAULT_ADVICE)
                        : setDoctorAdvice(record.id, DEFAULT_ADVICE)
                    }
                    className="mt-2 text-xs text-medical-600 hover:text-medical-700 hover:underline"
                  >
                    + 插入标准建议模板
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" strokeWidth={2} />
                  下次复查日期
                </label>
                <input
                  type="date"
                  className="input py-2.5"
                  value={record.reviewDate}
                  min={todayISO()}
                  onChange={(e) => setReviewDate(record.id, e.target.value)}
                  disabled={isCompleted}
                />
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {[7, 14, 30, 90, 180].map((d) => (
                    <button
                      key={d}
                      onClick={() => setReviewDate(record.id, addDaysISO(d))}
                      disabled={isCompleted}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 text-xs text-slate-600 hover:bg-medical-50 hover:text-medical-700 ring-1 ring-slate-200 hover:ring-medical-200 transition-all disabled:opacity-50"
                    >
                      +{d}天
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                  💡 通常建议封闭后 <b>7天</b> 复查封闭情况；长期随访建议 <b>3-6个月</b> 复查。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          {showSlip || isCompleted ? (
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              <ConfirmationSlip ref={slipRef} child={child} record={record} />
              {isCompleted && (
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => navigate('/followup')}
                    className="btn-primary"
                  >
                    前往回访提醒查看
                    <ChevronRight className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              )}
              {isCompleted && followup && (
                <div className="mt-6">
                  <ReviewPlanPanel child={child} record={record} followup={followup} />
                </div>
              )}
            </div>
          ) : (
            <div
              className="card p-6 animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              <h3 className="font-semibold text-slate-800 mb-4 leading-tight">
                完成后将生成
              </h3>
              <div className="aspect-[210/297] rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-medical-50 text-medical-500 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-9 h-9" strokeWidth={1.5} />
                </div>
                <div className="font-semibold text-slate-700 mb-1">家长确认单</div>
                <div className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                  完成操作后，将自动生成可打印的A4格式家长确认单，含封闭牙位、步骤、建议、复查日期
                </div>
              </div>

              <div className="mt-5 space-y-2.5 text-xs">
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-mint-50/60 text-mint-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
                  自动排入回访列表，复查日前提醒
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-medical-50/60 text-medical-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
                  每一步操作均记录时间与操作者
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showMissingCheck && record && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="px-6 py-5 bg-gradient-to-r from-warm-500 to-warm-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">操作前检查 · 有未完成步骤</h3>
                    <p className="text-sm text-white/80 mt-0.5">
                      共 {missingSteps.length} 项待完成，请确认是否继续
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMissingCheck(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-5 max-h-[400px] overflow-y-auto">
              <div className="space-y-3">
                {record.selectedTeeth
                  .sort((a, b) => Number(a) - Number(b))
                  .map((tooth) => {
                    const toothMissing = missingSteps.filter((m) => m.tooth === tooth);
                    if (toothMissing.length === 0) return null;
                    return (
                      <div
                        key={tooth}
                        className="p-3.5 rounded-xl bg-warm-50 border border-warm-100"
                      >
                        <div className="flex items-center gap-2.5 mb-2">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                            ['16','26','36','46'].includes(tooth)
                              ? 'bg-warm-500 text-white'
                              : 'bg-white text-warm-700 ring-1 ring-warm-200'
                          }`}>
                            {tooth}
                          </span>
                          <span className="font-medium text-warm-800">
                            缺 {toothMissing.length} 步
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 ml-10.5">
                          {toothMissing.map((m) => (
                            <span
                              key={m.step}
                              className="px-2 py-1 rounded-md bg-white text-warm-600 text-xs font-medium ring-1 ring-warm-200"
                            >
                              {m.stepLabel}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <p className="font-medium text-slate-700 mb-1">💡 提示</p>
                <p>确认单只会展示真正完成「封闭」的牙位，未完成的牙位不会出现在确认单中。</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowMissingCheck(false)}
                className="btn-secondary"
              >
                返回继续操作
              </button>
              <button
                onClick={doComplete}
                disabled={completing}
                className="btn-primary"
              >
                {completing ? '保存中…' : '仍要完成操作'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
