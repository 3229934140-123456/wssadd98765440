import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export { dayjs };

export const formatTime = (iso?: string | null) =>
  iso ? dayjs(iso).format('HH:mm') : '--:--';

export const formatDateTime = (iso?: string | null) =>
  iso ? dayjs(iso).format('YYYY-MM-DD HH:mm') : '--';

export const formatDate = (d?: string | null) =>
  d ? dayjs(d).format('YYYY-MM-DD') : '--';

export const formatDateCN = (d?: string | null) =>
  d ? dayjs(d).format('YYYY年M月D日') : '--';

export const relativeToNow = (iso?: string | null) =>
  iso ? dayjs(iso).fromNow() : '';

export const daysUntil = (d: string) => dayjs(d).startOf('day').diff(dayjs().startOf('day'), 'day');

export const isWithinThisWeek = (d: string) => {
  const target = dayjs(d);
  const start = dayjs().startOf('week');
  const end = dayjs().endOf('week');
  return target.isBetween(start, end, null, '[]');
};

export const isWithinThisMonth = (d: string) => {
  const target = dayjs(d);
  return target.month() === dayjs().month() && target.year() === dayjs().year();
};

export const nowISO = () => dayjs().toISOString();

export const todayISO = () => dayjs().format('YYYY-MM-DD');

export const addDaysISO = (days: number) =>
  dayjs().add(days, 'day').format('YYYY-MM-DD');

export const isToday = (iso: string) => dayjs(iso).isSame(dayjs(), 'day');
