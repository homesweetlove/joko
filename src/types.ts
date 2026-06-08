export type DayOfWeek = '월' | '화' | '수' | '목' | '금' | '토' | '일';

export interface EmployeeAllowances {
  position?: number;            // 직책수당
  qualification?: number;       // 자격수당
  businessPromotion?: number;   // 업무추진비
  cashier?: number;             // 출납수당
  meal?: number;                // 식대(비과세)
  other?: number;               // 수당
  omitted?: number;             // 누락금
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  ssn: string; // 주민등록번호
  hourlyWage: number;
  weeklyHoliday: DayOfWeek;
  hireDate: string;
  resignationDate?: string;
  payday: number; // 1-31
  standardWorkHours: {
    [key in '월' | '화' | '수' | '목' | '금']?: {
      start: string; // "HH:mm"
      end: string;   // "HH:mm"
    };
  };
  taxType: 'FREELANCER' | 'FOUR_MAJOR' | 'CUSTOM';
  customTaxRate?: number; // % rate for CUSTOM tax
  allowances?: EmployeeAllowances;
}

export interface AttendanceRecord {
  employeeId: string;
  date: string; // YYYY-MM-DD
  clockIn?: string; // HH:mm
  clockOut?: string; // HH:mm
  hasBreak: boolean; // Y/N
  isAbsence: boolean; // 결석 여부
  note?: string;
}

export interface PayrollReport {
  id: string;
  createdAt: string; // ISO string
  academyName: string;
  employees: Employee[];
  attendance: AttendanceRecord[];
  weeklyHolidayStatus: Record<string, Record<number, boolean>>;
  calculated: {
    employeeId: string;
    name: string;
    position: string;
    weeklyHours: number;
    baseSalary: number;
    holidayAllowance: number;
    allowancesAmount: number; // total allowances
    itemizedAllowances: EmployeeAllowances;
    totalGross: number;
    deductions: Record<string, number>;
    totalDeduction: number;
    netSalary: number;
    taxType: 'FREELANCER' | 'FOUR_MAJOR' | 'CUSTOM';
    customTaxRate?: number;
    workDaysCount: number; // 근로일수
    totalMinutes: number; // 총근로시간 분단위
    overtimeHours: number; // 연장근로시간
    nightHours: number; // 야간근로시간
    holidayHours: number; // 휴일근로시간
  }[];
}

export interface PayrollStep {
  academyName: string;
  employees: Employee[];
  attendance: AttendanceRecord[];
  currentStep: number;
}
