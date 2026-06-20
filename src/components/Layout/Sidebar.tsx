import { NavLink, useLocation } from 'react-router-dom';
import { CalendarDays, ShieldCheck, PhoneCall, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { to: '/today', label: '今日登记', icon: CalendarDays, hint: '前台录入' },
  { to: '/tooth-select', label: '牙位记录', icon: ShieldCheck, hint: '护士操作' },
  { to: '/followup', label: '回访提醒', icon: PhoneCall, hint: '持续跟进' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 shrink-0 min-h-screen bg-gradient-to-b from-medical-700 via-medical-800 to-medical-900 text-white flex flex-col shadow-xl">
      <div className="px-6 pt-7 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20 shadow-inner">
            <Sparkles className="w-6 h-6 text-warm-300" strokeWidth={2} />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-[15px] tracking-wide">窝沟封闭</div>
            <div className="text-xs text-medical-200/80 mt-0.5">儿童牙科登记系统</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1.5">
        {navItems.map(({ to, label, icon: Icon, hint }) => {
          const isActive =
            location.pathname === to ||
            (to === '/tooth-select' && location.pathname.startsWith('/tooth'));
          return (
            <NavLink
              key={to}
              to={to}
              className={clsx(
                'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden',
                isActive
                  ? 'bg-white/15 shadow-inner text-white'
                  : 'text-medical-100/80 hover:bg-white/8 hover:text-white'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-warm-400 rounded-r-full shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              )}
              <Icon
                className={clsx(
                  'w-5 h-5 transition-transform',
                  isActive ? 'text-warm-300 scale-105' : 'group-hover:scale-105'
                )}
                strokeWidth={1.8}
              />
              <div className="flex-1 leading-tight">
                <div className="font-medium text-sm">{label}</div>
                <div className="text-[11px] opacity-60 mt-0.5">{hint}</div>
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="mx-4 mb-5 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <div className="text-[11px] text-medical-200/70 mb-2">小贴士</div>
        <div className="text-xs text-medical-100/90 leading-relaxed">
          按 FDS 四步清洁 → 酸蚀 → 封闭 → 复查，确保每颗关键牙位（16、26、36、46）不遗漏。
        </div>
      </div>
    </aside>
  );
}
