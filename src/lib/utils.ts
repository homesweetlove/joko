import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(value);
}

export function calculateWeeklyHolidayAllowance(weeklyHours: number, hourlyWage: number) {
  // 주휴수당: (1주 총 근로시간 / 40시간) * 8시간 * 시급
  // 단, 1주 15시간 이상 근무 시 발생
  if (weeklyHours < 15) return 0;
  const cappedHours = Math.min(weeklyHours, 40);
  return (cappedHours / 40) * 8 * hourlyWage;
}
