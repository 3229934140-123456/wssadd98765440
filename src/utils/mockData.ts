import dayjs from 'dayjs';
import type { ChildRecord, ToothRecord, FollowupRecord, ToothStep } from '@/types';
import { STEP_ORDER } from '@/types';

const genId = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const createInitialChildren = (): ChildRecord[] => [
  {
    id: 'c001',
    name: '张小明',
    age: 7,
    parentPhone: '13812341234',
    school: '阳光小学',
    source: '学校体检',
    isFirst: true,
    remark: '有点紧张，需要耐心引导',
    createdAt: dayjs().hour(9).minute(15).toISOString(),
    status: 'completed',
  },
  {
    id: 'c002',
    name: '王朵朵',
    age: 8,
    parentPhone: '13956785678',
    school: '育才一小',
    source: '家长介绍',
    isFirst: false,
    remark: '上次配合很好',
    createdAt: dayjs().hour(10).minute(30).toISOString(),
    status: 'in_progress',
  },
  {
    id: 'c003',
    name: '刘子豪',
    age: 6,
    parentPhone: '13790129012',
    school: '实验幼儿园',
    source: '网络推广',
    isFirst: true,
    remark: '',
    createdAt: dayjs().hour(11).minute(0).toISOString(),
    status: 'registered',
  },
  {
    id: 'c004',
    name: '陈思琪',
    age: 9,
    parentPhone: '13633443344',
    school: '阳光小学',
    source: '学校体检',
    isFirst: false,
    remark: '去年已封闭16/26，今年补36/46',
    createdAt: dayjs().hour(14).minute(10).toISOString(),
    status: 'registered',
  },
];

const buildStepsForTeeth = (teeth: string[]): ToothStep[] => {
  const steps: ToothStep[] = [];
  teeth.forEach((t) => {
    STEP_ORDER.forEach((s) => {
      steps.push({ tooth: t, step: s, completed: false, time: null, operator: null });
    });
  });
  return steps;
};

const completeStepsFor = (teeth: string[], operator: string): ToothStep[] => {
  const steps: ToothStep[] = [];
  const base = dayjs().hour(9).minute(30);
  teeth.forEach((t, idx) => {
    STEP_ORDER.forEach((s, sIdx) => {
      steps.push({
        tooth: t,
        step: s,
        completed: true,
        time: base.add(idx * 4 + sIdx, 'minute').toISOString(),
        operator,
      });
    });
  });
  return steps;
};

export const createInitialToothRecords = (): ToothRecord[] => [
  {
    id: 't001',
    childId: 'c001',
    selectedTeeth: ['16', '26', '36', '46'],
    steps: completeStepsFor(['16', '26', '36', '46'], '李护士'),
    doctorAdvice:
      '1. 封闭后2小时内请勿进食；\n2. 24小时内避免食用坚硬、粘性食物；\n3. 每日认真刷牙，使用牙线清洁邻面；\n4. 如出现咬合不适请及时复诊；\n5. 建议每3-6个月复查一次。',
    reviewDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    completedAt: dayjs().hour(10).minute(0).toISOString(),
    operator: '李护士',
  },
  {
    id: 't002',
    childId: 'c002',
    selectedTeeth: ['16', '36'],
    steps: buildStepsForTeeth(['16', '36']).map((s, i) =>
      i < 4
        ? {
            ...s,
            completed: true,
            time: dayjs().hour(11).minute(i).toISOString(),
            operator: '王护士',
          }
        : s
    ),
    doctorAdvice: '',
    reviewDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    completedAt: null,
    operator: '王护士',
  },
];

export const createInitialFollowups = (): FollowupRecord[] => [
  {
    id: 'f001',
    childId: 'c001',
    toothRecordId: 't001',
    reviewDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    status: 'pending',
    contactCount: 0,
  },
  {
    id: 'f003',
    childId: 'c_hist1',
    toothRecordId: 't_hist1',
    reviewDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    status: 'pending',
    contactCount: 0,
  },
  {
    id: 'f004',
    childId: 'c_hist2',
    toothRecordId: 't_hist2',
    reviewDate: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    status: 'postponed',
    callResult: '暂不来院',
    contactedAt: dayjs().subtract(2, 'day').hour(15).minute(30).toISOString(),
    contactCount: 2,
    remark: '孩子去外地了，3周后再联系',
  },
];

export const createHistoricalChildren = (): ChildRecord[] => [
  {
    id: 'c_hist1',
    name: '赵一诺',
    age: 8,
    parentPhone: '13511112222',
    school: '第一实验小学',
    source: '家长介绍',
    isFirst: false,
    remark: '',
    createdAt: dayjs().subtract(7, 'day').hour(10).minute(0).toISOString(),
    status: 'completed',
  },
  {
    id: 'c_hist2',
    name: '孙浩然',
    age: 7,
    parentPhone: '13533334444',
    school: '育才一小',
    source: '门诊路过',
    isFirst: true,
    remark: '',
    createdAt: dayjs().subtract(14, 'day').hour(9).minute(0).toISOString(),
    status: 'completed',
  },
];

export const allInitialChildren = (): ChildRecord[] => [
  ...createInitialChildren(),
  ...createHistoricalChildren(),
];

export { genId, buildStepsForTeeth };
