import { Calendar, Phone, Clock, Bell, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ChildRecord, ToothRecord, FollowupRecord } from '@/types';
import { FOLLOWUP_STATUS_LABEL } from '@/types';
import { formatDateCN, daysUntil } from '@/utils/date';
import { clsx } from 'clsx';

interface Props {
  child: ChildRecord;
  record: ToothRecord;
  followup?: FollowupRecord;
}

export default function ReviewPlanPanel({ child, record, followup }: Props) {
  const navigate = useNavigate();

  const daysLeft = daysUntil(record.reviewDate);
  const status = followup?.status || 'pending';
  const statusLabel = FOLLOWUP_STATUS_LABEL[status];

  const statusColor = {
    pending: 'bg-warm-50 text-warm-700 ring-warm-200',
    contacted: 'bg-medical-50 text-medical-700 ring-medical-200',
    appointed: 'bg-mint-50 text-mint-700 ring-mint-200',
    postponed: 'bg-slate-50 text-slate-600 ring-slate-200',
    invalid: 'bg-rose-50 text-rose-700 ring-rose-200',
    done: 'bg-mint-50 text-mint-700 ring-mint-200',
  }[status];

  const isUrgent = daysLeft <= 3 && status !== 'done';
  const isOverdue = daysLeft < 0 && status !== 'done';

  return (
    <div className="card p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 leading-tight flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" strokeWidth={2} />
          </span>
          复查计划小看板
        </h3>
        <span className={clsx(
          'chip ring-1 text-xs font-medium',
          statusColor
        )}>
          {statusLabel}
        </span>
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-gradient-to-br from-mint-50 to-medical-50 border border-mint-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-1">建议复查日期</div>
              <div className="text-xl font-bold text-slate-800">
                {formatDateCN(record.reviewDate)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 mb-1">距今天数</div>
              <div className={clsx(
                'text-xl font-bold tabular-nums',
                isOverdue
                  ? 'text-rose-600'
                  : isUrgent
                  ? 'text-warm-600'
                  : 'text-mint-600'
              )}>
                {isOverdue ? `逾期 ${Math.abs(daysLeft)} 天` : daysLeft === 0 ? '今天' : `还有 ${daysLeft} 天`}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
              <Phone className="w-3.5 h-3.5" strokeWidth={2} />
              家长电话
            </div>
            <a
              href={`tel:${child.parentPhone}`}
              className="text-sm font-semibold text-slate-800 hover:text-medical-600 transition-colors"
            >
              {child.parentPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')}
            </a>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
              <Clock className="w-3.5 h-3.5" strokeWidth={2} />
              联系次数
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {followup?.contactCount || 0} 次
            </div>
          </div>
        </div>

        {followup?.remark && (
          <div className="p-3 rounded-xl bg-warm-50/60 border border-warm-100 text-sm text-warm-800">
            <span className="font-medium">上次备注：</span>
            {followup.remark}
          </div>
        )}

        <button
          onClick={() => navigate('/followup')}
          className="w-full py-2.5 rounded-xl bg-medical-50 text-medical-700 hover:bg-medical-100 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ring-1 ring-medical-200"
        >
          <Bell className="w-4 h-4" strokeWidth={2} />
          查看回访提醒详情
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
