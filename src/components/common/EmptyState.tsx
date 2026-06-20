import { ClipboardList, Users, CalendarOff } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  title: string;
  description?: string;
  variant?: 'default' | 'children' | 'followup';
  action?: React.ReactNode;
}

const VARIANT_ICON = {
  default: ClipboardList,
  children: Users,
  followup: CalendarOff,
};

const VARIANT_TINT = {
  default: 'from-medical-50 to-white text-medical-400',
  children: 'from-mint-50 to-white text-mint-400',
  followup: 'from-warm-50 to-white text-warm-400',
};

export default function EmptyState({
  title,
  description,
  variant = 'default',
  action,
}: Props) {
  const Icon = VARIANT_ICON[variant];
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
      <div
        className={clsx(
          'w-24 h-24 rounded-3xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-sm ring-1 ring-slate-100',
          VARIANT_TINT[variant]
        )}
      >
        <Icon className="w-12 h-12" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 text-center max-w-xs leading-relaxed mb-5">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
