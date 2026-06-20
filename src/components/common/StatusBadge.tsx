import type { FollowupStatus, ChildStatus } from '@/types';
import { FOLLOWUP_STATUS_LABEL } from '@/types';
import { clsx } from 'clsx';

type StatusKind = 'followup' | 'child';

interface Props {
  type: StatusKind;
  status: FollowupStatus | ChildStatus;
}

const FOLLOWUP_MAP: Record<FollowupStatus, { label: string; cls: string; dot: string }> = {
  pending: {
    label: '待联系',
    cls: 'bg-warm-50 text-warm-700 ring-1 ring-warm-200',
    dot: 'bg-warm-500',
  },
  contacted: {
    label: '已联系',
    cls: 'bg-medical-50 text-medical-700 ring-1 ring-medical-200',
    dot: 'bg-medical-500',
  },
  appointed: {
    label: '已预约',
    cls: 'bg-mint-50 text-mint-700 ring-1 ring-mint-200',
    dot: 'bg-mint-500',
  },
  postponed: {
    label: '暂不来院',
    cls: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    dot: 'bg-sky-500',
  },
  invalid: {
    label: '号码无效',
    cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    dot: 'bg-slate-400',
  },
  done: {
    label: '已完成',
    cls: 'bg-slate-50 text-slate-500 ring-1 ring-slate-200',
    dot: 'bg-slate-300',
  },
};

const CHILD_MAP: Record<ChildStatus, { label: string; cls: string; dot: string }> = {
  registered: {
    label: '待处理',
    cls: 'bg-warm-50 text-warm-700 ring-1 ring-warm-200',
    dot: 'bg-warm-500',
  },
  in_progress: {
    label: '操作中',
    cls: 'bg-medical-50 text-medical-700 ring-1 ring-medical-200',
    dot: 'bg-medical-500',
  },
  completed: {
    label: '已完成',
    cls: 'bg-mint-50 text-mint-700 ring-1 ring-mint-200',
    dot: 'bg-mint-500',
  },
};

export default function StatusBadge({ type, status }: Props) {
  const map = type === 'followup' ? FOLLOWUP_MAP : CHILD_MAP;
  const cfg = (map as any)[status] as { label: string; cls: string; dot: string };
  const label =
    type === 'followup'
      ? FOLLOWUP_STATUS_LABEL[status as FollowupStatus]
      : cfg.label;

  return (
    <span
      className={clsx(
        'chip whitespace-nowrap',
        cfg.cls
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {label}
    </span>
  );
}
