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

export function calculateNightHours(clockIn?: string, clockOut?: string): number {
  if (!clockIn || !clockOut) return 0;
  const parseTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const startMin = parseTime(clockIn);
  let endMin = parseTime(clockOut);

  if (endMin < startMin) {
    endMin += 24 * 60; // crossed midnight
  }

  let nightMin = 0;
  for (let m = startMin; m < endMin; m++) {
    const minOfDay = m % (24 * 60);
    // Night is 22:00 (1320 min) to 06:00 (360 min)
    if (minOfDay >= 22 * 60 || minOfDay < 6 * 60) {
      nightMin++;
    }
  }
  return nightMin / 60;
}
