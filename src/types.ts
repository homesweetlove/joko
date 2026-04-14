export type DayOfWeek = '월' | '화' | '수' | '목' | '금' | '토' | '일';

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
  taxType: 'FREELANCER' | 'FOUR_MAJOR';
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

export interface PayrollStep {
  academyName: string;
  employees: Employee[];
  attendance: AttendanceRecord[];
  currentStep: number;
}
