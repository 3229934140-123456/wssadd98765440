import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/components/common/Toast';
import { SOURCE_OPTIONS } from '@/types';
import type { SourceType } from '@/types';
import { useNavigate } from 'react-router-dom';

interface FormState {
  name: string;
  age: string;
  parentPhone: string;
  school: string;
  source: SourceType;
  isFirst: boolean;
  remark: string;
}

const initialForm: FormState = {
  name: '',
  age: '',
  parentPhone: '',
  school: '',
  source: '学校体检',
  isFirst: true,
  remark: '',
};

export default function RegistrationForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const addChild = useAppStore((s) => s.addChild);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.name.trim()) return '请输入儿童姓名';
    if (!form.age || Number(form.age) < 2 || Number(form.age) > 16) return '请输入正确的年龄（2-16岁）';
    if (!/^1[3-9]\d{9}$/.test(form.parentPhone.replace(/\D/g, ''))) return '请输入有效的11位手机号';
    return null;
  };

  const reset = () => setForm(initialForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      showToast(err, 'error');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const child = addChild({
        name: form.name.trim(),
        age: Number(form.age),
        parentPhone: form.parentPhone.replace(/\D/g, ''),
        school: form.school.trim(),
        source: form.source,
        isFirst: form.isFirst,
        remark: form.remark.trim(),
      });
      showToast(`${child.name} 登记成功，可进入牙位记录`);
      reset();
      setSubmitting(false);
    }, 400);
  };

  const handleSubmitAndGo = () => {
    const err = validate();
    if (err) {
      showToast(err, 'error');
      return;
    }
    const child = addChild({
      name: form.name.trim(),
      age: Number(form.age),
      parentPhone: form.parentPhone.replace(/\D/g, ''),
      school: form.school.trim(),
      source: form.source,
      isFirst: form.isFirst,
      remark: form.remark.trim(),
    });
    showToast(`${child.name} 已登记，进入牙位记录`);
    reset();
    navigate(`/tooth/${child.id}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-6 animate-fade-in-up"
      style={{ animationDelay: '60ms' }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-medical-50 text-medical-600 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 leading-tight">快速登记</h3>
            <p className="text-xs text-slate-500 mt-0.5">录入到院儿童基本信息</p>
          </div>
        </div>
        <span className="chip bg-rose-50 text-rose-600 ring-1 ring-rose-100">
          <span className="w-1 h-1 rounded-full bg-rose-500" /> 必填项
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            儿童姓名 <span className="text-rose-500">*</span>
          </label>
          <input
            className="input"
            placeholder="请输入姓名"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            maxLength={20}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            年龄 <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            className="input"
            placeholder="例如 7"
            min={2}
            max={16}
            value={form.age}
            onChange={(e) => update('age', e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            家长电话 <span className="text-rose-500">*</span>
          </label>
          <input
            className="input"
            placeholder="11位手机号"
            value={form.parentPhone}
            onChange={(e) => update('parentPhone', e.target.value.replace(/[^\d-]/g, ''))}
            maxLength={13}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            学校 / 幼儿园
          </label>
          <input
            className="input"
            placeholder="选填，例如：阳光小学"
            value={form.school}
            onChange={(e) => update('school', e.target.value)}
            maxLength={40}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            来源渠道
          </label>
          <select
            className="select"
            value={form.source}
            onChange={(e) => update('source', e.target.value as SourceType)}
          >
            {SOURCE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center gap-6 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <label className="block text-xs font-medium text-slate-600 mr-2 shrink-0">
              是否首次封闭：
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={form.isFirst}
                onChange={() => update('isFirst', true)}
                className="w-4 h-4 text-medical-500 border-slate-300 focus:ring-medical-500"
              />
              <span className="text-sm text-slate-700">首次封闭</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!form.isFirst}
                onChange={() => update('isFirst', false)}
                className="w-4 h-4 text-medical-500 border-slate-300 focus:ring-medical-500"
              />
              <span className="text-sm text-slate-700">复诊 / 补封闭</span>
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            备注信息
          </label>
          <textarea
            className="textarea"
            placeholder="特殊情况、过敏史、性格特点等（选填）"
            value={form.remark}
            onChange={(e) => update('remark', e.target.value)}
            maxLength={200}
          />
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={reset}
          className="btn-ghost text-sm"
        >
          清空表单
        </button>
        <div className="flex items-center gap-2.5">
          <button
            type="submit"
            disabled={submitting}
            className="btn-secondary"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            保存并继续登记
          </button>
          <button
            type="button"
            onClick={handleSubmitAndGo}
            disabled={submitting}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            登记并进入牙位记录
          </button>
        </div>
      </div>
    </form>
  );
}
