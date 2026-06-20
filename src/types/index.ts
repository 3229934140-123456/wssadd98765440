export type SourceType = '学校体检' | '家长介绍' | '网络推广' | '门诊路过' | '其他';
export type ChildStatus = 'registered' | 'in_progress' | 'completed';
export type StepType = 'cleaned' | 'etched' | 'sealed' | 'review';
export type FollowupStatus = 'pending' | 'contacted' | 'appointed' | 'postponed' | 'invalid' | 'done';
export type CallResultType = '已预约' | '暂不来院' | '号码无效' | '已复查' | '其他';

export interface ChildRecord {
  id: string;
  name: string;
  age: number;
  parentPhone: string;
  school: string;
  source: SourceType;
  isFirst: boolean;
  remark: string;
  createdAt: string;
  status: ChildStatus;
}

export interface ToothStep {
  tooth: string;
  step: StepType;
  completed: boolean;
  time: string | null;
  operator: string | null;
}

export interface ToothRecord {
  id: string;
  childId: string;
  selectedTeeth: string[];
  steps: ToothStep[];
  doctorAdvice: string;
  reviewDate: string;
  completedAt: string | null;
  operator: string;
}

export interface FollowupRecord {
  id: string;
  childId: string;
  toothRecordId: string;
  reviewDate: string;
  status: FollowupStatus;
  callResult?: CallResultType;
  remark?: string;
  contactedAt?: string;
  contactCount: number;
}

export const STEP_LABELS: Record<StepType, string> = {
  cleaned: '已清洁',
  etched: '已酸蚀',
  sealed: '已封闭',
  review: '需复查',
};

export const STEP_ORDER: StepType[] = ['cleaned', 'etched', 'sealed', 'review'];

export const SOURCE_OPTIONS: SourceType[] = [
  '学校体检',
  '家长介绍',
  '网络推广',
  '门诊路过',
  '其他',
];

export const CALL_RESULT_OPTIONS: CallResultType[] = [
  '已预约',
  '暂不来院',
  '号码无效',
  '已复查',
  '其他',
];

export const KEY_TEETH = ['16', '26', '36', '46'];

export const ALL_TEETH = [
  '18', '17', '16', '15', '14', '13', '12', '11',
  '21', '22', '23', '24', '25', '26', '27', '28',
  '48', '47', '46', '45', '44', '43', '42', '41',
  '31', '32', '33', '34', '35', '36', '37', '38',
];

export const FOLLOWUP_STATUS_LABEL: Record<FollowupStatus, string> = {
  pending: '待联系',
  contacted: '已联系',
  appointed: '已预约',
  postponed: '暂不来院',
  invalid: '号码无效',
  done: '已完成',
};

export const CHILD_STATUS_LABEL: Record<ChildStatus, string> = {
  registered: '待处理',
  in_progress: '操作中',
  completed: '已完成',
};
