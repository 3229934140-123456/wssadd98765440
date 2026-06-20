import { useEffect, useState } from 'react';
import { X, Phone, Calendar, MessageSquare, User } from 'lucide-react';
import type { FollowupRecord, CallResultType, FollowupStatus, ChildRecord } from '@/types';
import { CALL_RESULT_OPTIONS } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/components/common/Toast';
import { formatDate } from '@/utils/date';
import { clsx } from 'clsx';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  onClose: () => void;
  followup: (FollowupRecord & { child?: ChildRecord }) | null;
  childName: string;
  phone: string;
}

const STATUS_MAP: Record<CallResultType, { status: FollowupStatus; cls: string }> = {
  已预约: { status: 'appointed', cls: 'bg-mint-500 hover:bg-mint-600' },
  暂不来院: { status: 'postponed', cls: 'bg-sky-500 hover:bg-sky-600' },
  号码无效: { status: 'invalid', cls: 'bg-slate-500 hover:bg-slate-600' },
  已复查: { status: 'done', cls: 'bg-medical-500 hover:bg-medical-600' },
  其他: { status: 'contacted', cls: 'bg-violet-500 hover:bg-violet-600' },
};

export default function CallModal({ open, onClose, followup, childName, phone }: Props) {
  const [result, setResult] = useState<CallResultType>('已预约');
  const [remark, setRemark] = useState('');
  const [postponeDays, setPostponeDays] = useState<number | ''>('');
  const updateFollowup = useAppStore((s) => s.updateFollowup);
  const { showToast } = useToast();

  useEffect(() => {
    if (open && followup) {
      setResult(followup.callResult || '已预约');
      setRemark(followup.remark || '');
      setPostponeDays('');
    }
  }, [open, followup]);

  if (!open || !followup) return null;

  const handleSave = () => {
    const mapped = STATUS_MAP[result];
    const newReviewDate =
      result === '暂不来院' && postponeDays !== '' && postponeDays > 0
        ? dayjs(followup.reviewDate).add(Number(postponeDays), 'day').format('YYYY-MM-DD')
        : undefined;

    updateFollowup(followup.id, {
      status: mapped.status,
      callResult: result,
      remark: remark.trim() || undefined,
      newReviewDate,
    });

    showToast(`已记录 ${childName} 的回访结果：${result}`);
    onClose();
  };

  const resultCfg = STATUS_MAP[result];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg animate-scale-in">
        <div className="card overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-medical-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-medical-500 text-white flex items-center justify-center shadow-sm">
                <Phone className="w-5.5 h-5.5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">电话回访记录</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  联系家长并记录沟通结果
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm text-medical-600 flex items-center justify-center font-bold text-lg border border-slate-200">
                  {childName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{childName}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" strokeWidth={2} />
                    计划复查日：{formatDate(followup.reviewDate)}
                  </div>
                </div>
              </div>
              <a
                href={`tel:${phone}`}
                className="btn-success shrink-0"
                onClick={() => showToast(`正在拨打 ${phone}…`, 'info')}
              >
                <Phone className="w-4 h-4" strokeWidth={2} />
                拨打
              </a>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                电话结果
                <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {CALL_RESULT_OPTIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setResult(o)}
                    className={clsx(
                      'px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ring-1',
                      result === o
                        ? `${resultCfg.cls.replace('hover:', '')} text-white ring-transparent shadow-md scale-[1.02]`
                        : 'bg-white text-slate-600 ring-slate-200 hover:ring-medical-300 hover:text-medical-700'
                    )}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {result === '暂不来院' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  延后复查日期（可选）
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={180}
                    className="input w-36"
                    placeholder="天数"
                    value={postponeDays}
                    onChange={(e) =>
                      setPostponeDays(e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                  <span className="text-sm text-slate-500">天后自动提醒</span>
                  <div className="flex items-center gap-1 ml-2">
                    {[7, 14, 21, 30].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setPostponeDays(d)}
                        className={clsx(
                          'px-2.5 py-1.5 rounded-lg text-xs transition-all ring-1',
                          postponeDays === d
                            ? 'bg-sky-500 text-white ring-sky-400'
                            : 'bg-slate-50 text-slate-600 ring-slate-200 hover:ring-sky-300'
                        )}
                      >
                        +{d}天
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" strokeWidth={2} />
                备注说明
              </label>
              <textarea
                className="textarea"
                placeholder="记录沟通细节、约定时间、特殊情况等（选填）"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                maxLength={300}
              />
            </div>

            {followup.contactCount > 0 && followup.contactedAt && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" strokeWidth={2} />
                  历史联系记录
                </span>
                <span>
                  已联系 <b className="text-slate-700">{followup.contactCount}</b> 次，
                  上次 {dayjs(followup.contactedAt).format('M月D日 HH:mm')}
                  {followup.callResult && ` · ${followup.callResult}`}
                </span>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2.5">
            <button onClick={onClose} className="btn-secondary">
              取消
            </button>
            <button onClick={handleSave} className={clsx('btn text-white', resultCfg.cls)}>
              保存回访记录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
