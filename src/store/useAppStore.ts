import { create } from 'zustand';
import type {
  ChildRecord,
  ToothRecord,
  FollowupRecord,
  SourceType,
  StepType,
  FollowupStatus,
  CallResultType,
} from '@/types';
import {
  allInitialChildren,
  createInitialFollowups,
  createInitialToothRecords,
  genId,
  buildStepsForTeeth,
} from '@/utils/mockData';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { nowISO, addDaysISO } from '@/utils/date';

interface AppState {
  children: ChildRecord[];
  toothRecords: ToothRecord[];
  followups: FollowupRecord[];
  currentOperator: string;

  addChild: (data: {
    name: string;
    age: number;
    parentPhone: string;
    school: string;
    source: SourceType;
    isFirst: boolean;
    remark: string;
  }) => ChildRecord;

  updateChildStatus: (id: string, status: ChildRecord['status']) => void;
  removeChild: (id: string) => void;

  getOrCreateToothRecord: (childId: string) => ToothRecord;
  toggleTooth: (recordId: string, tooth: string) => void;
  setSelectedTeeth: (recordId: string, teeth: string[]) => void;
  toggleStep: (
    recordId: string,
    tooth: string,
    step: StepType,
    operatorOverride?: string
  ) => void;
  setDoctorAdvice: (recordId: string, advice: string) => void;
  setReviewDate: (recordId: string, date: string) => void;
  completeToothRecord: (recordId: string) => void;

  updateFollowup: (
    id: string,
    data: {
      status: FollowupStatus;
      callResult?: CallResultType;
      remark?: string;
      newReviewDate?: string;
    }
  ) => void;

  setCurrentOperator: (name: string) => void;

  resetToDemo: () => void;
  _persist: () => void;
  _hydrate: () => void;
}

const buildInitialState = () => ({
  children: allInitialChildren(),
  toothRecords: createInitialToothRecords(),
  followups: createInitialFollowups(),
  currentOperator: '李护士',
});

export const useAppStore = create<AppState>((set, get) => ({
  ...buildInitialState(),

  addChild: (data) => {
    const child: ChildRecord = {
      id: genId('c'),
      ...data,
      createdAt: nowISO(),
      status: 'registered',
    };
    set({ children: [child, ...get().children] });
    get()._persist();
    return child;
  },

  updateChildStatus: (id, status) => {
    set({
      children: get().children.map((c) => (c.id === id ? { ...c, status } : c)),
    });
    get()._persist();
  },

  removeChild: (id) => {
    set({
      children: get().children.filter((c) => c.id !== id),
      toothRecords: get().toothRecords.filter((r) => r.childId !== id),
      followups: get().followups.filter((f) => f.childId !== id),
    });
    get()._persist();
  },

  getOrCreateToothRecord: (childId) => {
    const existing = get().toothRecords.find((r) => r.childId === childId);
    if (existing) return existing;

    const record: ToothRecord = {
      id: genId('t'),
      childId,
      selectedTeeth: [],
      steps: [],
      doctorAdvice: '',
      reviewDate: addDaysISO(7),
      completedAt: null,
      operator: get().currentOperator,
    };
    set({ toothRecords: [...get().toothRecords, record] });
    get().updateChildStatus(childId, 'in_progress');
    get()._persist();
    return record;
  },

  toggleTooth: (recordId, tooth) => {
    set({
      toothRecords: get().toothRecords.map((r) => {
        if (r.id !== recordId) return r;
        const isSelected = r.selectedTeeth.includes(tooth);
        let newSelected: string[];
        let newSteps = [...r.steps];

        if (isSelected) {
          newSelected = r.selectedTeeth.filter((t) => t !== tooth);
          newSteps = newSteps.filter((s) => s.tooth !== tooth);
        } else {
          newSelected = [...r.selectedTeeth, tooth];
          const existingTeethInSteps = new Set(newSteps.map((s) => s.tooth));
          if (!existingTeethInSteps.has(tooth)) {
            newSteps = [...newSteps, ...buildStepsForTeeth([tooth])];
          }
        }
        return { ...r, selectedTeeth: newSelected, steps: newSteps };
      }),
    });
    get()._persist();
  },

  setSelectedTeeth: (recordId, teeth) => {
    set({
      toothRecords: get().toothRecords.map((r) => {
        if (r.id !== recordId) return r;
        const existingStepMap = new Map(
          r.steps.map((s) => [`${s.tooth}-${s.step}`, s])
        );
        const newSteps = buildStepsForTeeth(teeth).map((s) => {
          const key = `${s.tooth}-${s.step}`;
          return existingStepMap.get(key) || s;
        });
        return { ...r, selectedTeeth: teeth, steps: newSteps };
      }),
    });
    get()._persist();
  },

  toggleStep: (recordId, tooth, step, operatorOverride) => {
    const operator = operatorOverride || get().currentOperator;
    set({
      toothRecords: get().toothRecords.map((r) => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          steps: r.steps.map((s) => {
            if (s.tooth !== tooth || s.step !== step) return s;
            const wasCompleted = s.completed;
            return {
              ...s,
              completed: !wasCompleted,
              time: !wasCompleted ? nowISO() : null,
              operator: !wasCompleted ? operator : null,
            };
          }),
        };
      }),
    });
    get()._persist();
  },

  setDoctorAdvice: (recordId, advice) => {
    set({
      toothRecords: get().toothRecords.map((r) =>
        r.id === recordId ? { ...r, doctorAdvice: advice } : r
      ),
    });
    get()._persist();
  },

  setReviewDate: (recordId, date) => {
    set({
      toothRecords: get().toothRecords.map((r) =>
        r.id === recordId ? { ...r, reviewDate: date } : r
      ),
    });
    get()._persist();
  },

  completeToothRecord: (recordId) => {
    const record = get().toothRecords.find((r) => r.id === recordId);
    if (!record) return;

    set({
      toothRecords: get().toothRecords.map((r) =>
        r.id === recordId ? { ...r, completedAt: nowISO() } : r
      ),
      children: get().children.map((c) =>
        c.id === record.childId ? { ...c, status: 'completed' } : c
      ),
    });

    const existingFollowup = get().followups.find(
      (f) => f.toothRecordId === recordId
    );
    if (!existingFollowup) {
      const followup: FollowupRecord = {
        id: genId('f'),
        childId: record.childId,
        toothRecordId: recordId,
        reviewDate: record.reviewDate,
        status: 'pending',
        contactCount: 0,
      };
      set({ followups: [...get().followups, followup] });
    } else {
      set({
        followups: get().followups.map((f) =>
          f.id === existingFollowup.id
            ? { ...f, reviewDate: record.reviewDate }
            : f
        ),
      });
    }

    get()._persist();
  },

  updateFollowup: (id, data) => {
    set({
      followups: get().followups.map((f) => {
        if (f.id !== id) return f;
        const updated: FollowupRecord = {
          ...f,
          status: data.status,
          callResult: data.callResult ?? f.callResult,
          remark: data.remark ?? f.remark,
          contactedAt: nowISO(),
          contactCount: f.contactCount + 1,
        };
        if (data.newReviewDate) {
          updated.reviewDate = data.newReviewDate;
        }
        return updated;
      }),
    });
    get()._persist();
  },

  setCurrentOperator: (name) => {
    set({ currentOperator: name });
    get()._persist();
  },

  resetToDemo: () => {
    set(buildInitialState());
    get()._persist();
  },

  _persist: () => {
    const { children, toothRecords, followups, currentOperator } = get();
    saveToStorage({ children, toothRecords, followups, currentOperator });
  },

  _hydrate: () => {
    const data = loadFromStorage();
    if (data && data.children && data.children.length > 0) {
      set({
        children: data.children,
        toothRecords: data.toothRecords || [],
        followups: data.followups || [],
        currentOperator: data.currentOperator || '李护士',
      });
    }
  },
}));
