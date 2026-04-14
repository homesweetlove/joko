import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Coffee,
  Calculator,
  Download,
  Building2
} from 'lucide-react';
import { Employee, AttendanceRecord, PayrollStep } from '../types';
import { TAX_RATES_2026 } from '../constants';
import { cn, formatCurrency, calculateWeeklyHolidayAllowance } from '../lib/utils';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parse, differenceInMinutes } from 'date-fns';
import { ko } from 'date-fns/locale';

interface PayrollCreationProps {
  employees: Employee[];
  onBack: () => void;
}

export default function PayrollCreation({ employees, onBack }: PayrollCreationProps) {
  const [step, setStep] = useState(1);
  const [academyName, setAcademyName] = useState('');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [weeklyHolidayStatus, setWeeklyHolidayStatus] = useState<Record<string, Record<number, boolean>>>({}); // employeeId -> weekIndex -> boolean

  // Step 1: Academy Name
  const handleAcademySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (academyName) setStep(2);
  };

  // Step 3: File Upload (Simulation)
  const handleFileUpload = () => {
    // Simulate parsing a file
    const records: AttendanceRecord[] = [];
    const startDate = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    
    employees.forEach(emp => {
      eachDayOfInterval({
        start: startDate,
        end: endOfWeek(startDate, { weekStartsOn: 1 })
      }).forEach(date => {
        const dayName = format(date, 'eeeeee', { locale: ko }) as any;
        const standard = emp.standardWorkHours[dayName as keyof typeof emp.standardWorkHours];
        
        if (standard) {
          // 90% chance of being present for demo
          const isPresent = Math.random() > 0.1;
          records.push({
            employeeId: emp.id,
            date: format(date, 'yyyy-MM-dd'),
            clockIn: isPresent ? standard.start : undefined,
            clockOut: isPresent ? standard.end : undefined,
            hasBreak: false,
            isAbsence: !isPresent,
          });
        }
      });
    });
    
    setAttendance(records);
    setStep(3);
  };

  const toggleBreak = (employeeId: string, date: string) => {
    setAttendance(prev => prev.map(r => 
      (r.employeeId === employeeId && r.date === date) 
        ? { ...r, hasBreak: !r.hasBreak } 
        : r
    ));
  };

  const applyAllBreaks = () => {
    setAttendance(prev => prev.map(r => ({ ...r, hasBreak: true })));
  };

  const calculateHours = (record: AttendanceRecord) => {
    if (!record.clockIn || !record.clockOut) return 0;
    const start = parse(record.clockIn, 'HH:mm', new Date());
    const end = parse(record.clockOut, 'HH:mm', new Date());
    let diff = differenceInMinutes(end, start);
    
    if (record.hasBreak) {
      // 4시간마다 30분 휴게 (단순화: 4시간 이상이면 30분, 8시간 이상이면 1시간 제외)
      if (diff >= 480) diff -= 60;
      else if (diff >= 240) diff -= 30;
    }
    
    return Math.max(0, diff / 60);
  };

  const getWeeklyHours = (employeeId: string) => {
    return attendance
      .filter(r => r.employeeId === employeeId)
      .reduce((sum, r) => sum + calculateHours(r), 0);
  };

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto py-20">
      <div className="glass-card p-10 text-center space-y-8">
        <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto text-blue-600">
          <Building2 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">학원명을 입력하세요</h2>
          <p className="text-slate-500">급여대장에 표시될 학원 이름을 기재해주세요.</p>
        </div>
        <form onSubmit={handleAcademySubmit} className="space-y-4">
          <input
            autoFocus
            type="text"
            required
            value={academyName}
            onChange={e => setAcademyName(e.target.value)}
            placeholder="예: 미래인재 학원"
            className="w-full px-6 py-4 text-xl rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-center font-bold"
          />
          <button type="submit" className="btn-3d w-full py-4 text-lg">
            다음 단계로
            <ChevronRight className="ml-2" />
          </button>
        </form>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto py-12 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{academyName} 급여 생성</h2>
          <p className="text-slate-500">출퇴근 기록 파일을 불러와주세요.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 transition-colors">이전</button>
        </div>
      </div>

      <div className="glass-card p-12 text-center border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors group">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-50 transition-colors">
          <Upload size={40} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">출퇴근 기록 파일 업로드</h3>
        <p className="text-slate-500 mb-8">엑셀(XLSX) 또는 CSV 파일을 드래그하거나 클릭하여 선택하세요.</p>
        <button
          onClick={handleFileUpload}
          className="btn-3d px-10"
        >
          파일 불러오기
        </button>
      </div>

      <div className="glass-card p-6 bg-blue-50 border-blue-100">
        <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-2">
          <AlertCircle size={18} />
          참고 사항
        </h4>
        <p className="text-sm text-blue-700 leading-relaxed">
          파일 양식에는 [날짜, 이름, 출근시간, 퇴근시간] 항목이 포함되어 있어야 합니다. 
          기록이 없는 날짜는 자동으로 결석 처리됩니다.
        </p>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">출퇴근 및 주휴수당 확인</h2>
          <p className="text-slate-500">각 주차별 근무 시간과 주휴수당 지급 여부를 확인하세요.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={applyAllBreaks}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Coffee size={16} className="text-orange-500" />
            일괄 휴게 적용
          </button>
          <button onClick={() => setStep(4)} className="btn-3d px-8 py-2">
            다음 단계
            <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {employees.map(emp => {
          const weeklyHours = getWeeklyHours(emp.id);
          const holidayAllowance = calculateWeeklyHolidayAllowance(weeklyHours, emp.hourlyWage);
          const isEligible = weeklyHours >= 15;

          return (
            <div key={emp.id} className="glass-card overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {emp.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{emp.name} <span className="text-slate-400 font-medium text-sm ml-1">{emp.position}</span></h3>
                    <p className="text-xs text-slate-500">시급: {emp.hourlyWage.toLocaleString()}원</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">주간 근무시간</p>
                    <p className="text-xl font-black text-slate-900">{weeklyHours.toFixed(1)}h</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">주휴수당 (예상)</p>
                    <p className={cn("text-xl font-black", isEligible ? "text-blue-600" : "text-slate-300")}>
                      {isEligible ? formatCurrency(holidayAllowance) : '대상 아님'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 ml-2">지급 여부</span>
                    <button 
                      onClick={() => setWeeklyHolidayStatus(prev => ({
                        ...prev,
                        [emp.id]: { ...prev[emp.id], 0: !prev[emp.id]?.[0] }
                      }))}
                      className={cn(
                        "px-4 py-1 rounded-lg text-xs font-bold transition-all",
                        weeklyHolidayStatus[emp.id]?.[0] !== false ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-100 text-slate-400"
                      )}
                    >
                      Y
                    </button>
                    <button 
                      onClick={() => setWeeklyHolidayStatus(prev => ({
                        ...prev,
                        [emp.id]: { ...prev[emp.id], 0: false }
                      }))}
                      className={cn(
                        "px-4 py-1 rounded-lg text-xs font-bold transition-all",
                        weeklyHolidayStatus[emp.id]?.[0] === false ? "bg-red-600 text-white shadow-lg shadow-red-200" : "bg-slate-100 text-slate-400"
                      )}
                    >
                      N
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4 border-b border-slate-100">날짜</th>
                      <th className="px-6 py-4 border-b border-slate-100">출근</th>
                      <th className="px-6 py-4 border-b border-slate-100">퇴근</th>
                      <th className="px-6 py-4 border-b border-slate-100">휴게</th>
                      <th className="px-6 py-4 border-b border-slate-100">실근무</th>
                      <th className="px-6 py-4 border-b border-slate-100">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.filter(r => r.employeeId === emp.id).map(record => {
                      const hours = calculateHours(record);
                      return (
                        <tr key={record.date} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 border-b border-slate-100 font-medium text-slate-700">
                            {format(parse(record.date, 'yyyy-MM-dd', new Date()), 'MM/dd (eee)', { locale: ko })}
                          </td>
                          <td className="px-6 py-4 border-b border-slate-100">
                            <input 
                              type="time" 
                              value={record.clockIn || ''} 
                              onChange={e => setAttendance(prev => prev.map(r => r.date === record.date && r.employeeId === emp.id ? { ...r, clockIn: e.target.value, isAbsence: false } : r))}
                              className="bg-transparent border-none focus:ring-0 text-slate-900 font-bold p-0 w-20"
                            />
                          </td>
                          <td className="px-6 py-4 border-b border-slate-100">
                            <input 
                              type="time" 
                              value={record.clockOut || ''} 
                              onChange={e => setAttendance(prev => prev.map(r => r.date === record.date && r.employeeId === emp.id ? { ...r, clockOut: e.target.value, isAbsence: false } : r))}
                              className="bg-transparent border-none focus:ring-0 text-slate-900 font-bold p-0 w-20"
                            />
                          </td>
                          <td className="px-6 py-4 border-b border-slate-100">
                            <button 
                              onClick={() => toggleBreak(emp.id, record.date)}
                              className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all",
                                record.hasBreak ? "bg-orange-100 text-orange-600 border border-orange-200" : "bg-slate-100 text-slate-400 border border-slate-200"
                              )}
                            >
                              {record.hasBreak ? 'Break Y' : 'Break N'}
                            </button>
                          </td>
                          <td className="px-6 py-4 border-b border-slate-100 font-black text-slate-900">
                            {hours > 0 ? `${hours.toFixed(1)}h` : '-'}
                          </td>
                          <td className="px-6 py-4 border-b border-slate-100">
                            {record.isAbsence ? (
                              <span className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-full border border-red-200">결석</span>
                            ) : (
                              <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-black rounded-full border border-green-200">정상</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );

  const renderStep4 = () => {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">세금 및 최종 급여 확인</h2>
            <p className="text-slate-500">2026년 법정 이율이 적용된 최종 지급액을 확인하세요.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep(3)} className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 transition-colors">이전</button>
            <button onClick={onBack} className="btn-3d px-8 py-2">
              완료 및 저장
              <CheckCircle2 size={18} className="ml-1" />
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {employees.map(emp => {
            const weeklyHours = getWeeklyHours(emp.id);
            const holidayAllowance = weeklyHolidayStatus[emp.id]?.[0] !== false ? calculateWeeklyHolidayAllowance(weeklyHours, emp.hourlyWage) : 0;
            const baseSalary = weeklyHours * emp.hourlyWage;
            const totalGross = baseSalary + holidayAllowance;
            
            let totalDeduction = 0;
            let deductions: Record<string, number> = {};

            if (emp.taxType === 'FREELANCER') {
              totalDeduction = totalGross * TAX_RATES_2026.FREELANCER;
              deductions = { '사업소득세 (3.3%)': totalDeduction };
            } else {
              const np = totalGross * TAX_RATES_2026.FOUR_MAJOR.NATIONAL_PENSION;
              const hi = totalGross * TAX_RATES_2026.FOUR_MAJOR.HEALTH_INSURANCE;
              const ltc = hi * TAX_RATES_2026.FOUR_MAJOR.LONG_TERM_CARE;
              const ei = totalGross * TAX_RATES_2026.FOUR_MAJOR.EMPLOYMENT_INSURANCE;
              
              deductions = {
                '국민연금 (4.5%)': np,
                '건강보험 (3.545%)': hi,
                '장기요양보험': ltc,
                '고용보험 (0.9%)': ei,
              };
              totalDeduction = Object.values(deductions).reduce((a, b) => a + b, 0);
            }

            const netSalary = totalGross - totalDeduction;

            return (
              <div key={emp.id} className="glass-card p-8 grid md:grid-cols-3 gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                    emp.taxType === 'FREELANCER' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                  )}>
                    {emp.taxType === 'FREELANCER' ? '3.3% 프리랜서' : '4대보험 가입'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-xl">
                      {emp.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{emp.name}</h3>
                      <p className="text-sm text-slate-500">{emp.position}</p>
                    </div>
                  </div>
                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">기본급 ({weeklyHours.toFixed(1)}h)</span>
                      <span className="font-bold">{formatCurrency(baseSalary)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">주휴수당</span>
                      <span className="font-bold text-blue-600">+{formatCurrency(holidayAllowance)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                      <span>세전 총액</span>
                      <span>{formatCurrency(totalGross)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">공제 항목 (Deductions)</h4>
                  {Object.entries(deductions).map(([name, amount]) => (
                    <div key={name} className="flex justify-between text-sm">
                      <span className="text-slate-600">{name}</span>
                      <span className="text-red-500 font-medium">-{formatCurrency(amount)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-red-600">
                    <span>공제 합계</span>
                    <span>-{formatCurrency(totalDeduction)}</span>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center md:items-end text-center md:text-right space-y-2">
                  <p className="text-sm font-bold text-slate-400 uppercase">최종 실지급액</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">{formatCurrency(netSalary)}</p>
                  <button className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline">
                    <Download size={16} />
                    급여명세서 다운로드
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft size={24} className="text-slate-600" />
            </button>
            <span className="font-bold text-slate-900">급여 생성 마법사</span>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(s => (
              <div 
                key={s} 
                className={cn(
                  "w-8 h-1 rounded-full transition-all duration-500",
                  step >= s ? "bg-blue-600" : "bg-slate-200"
                )}
              />
            ))}
          </div>
        </div>
      </nav>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
}
