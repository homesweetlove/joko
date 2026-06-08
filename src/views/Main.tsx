import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Users, Calculator, Settings, ChevronRight, Upload, Download, Database, Check, FileText, Trash2, Calendar, Clock, Coffee, AlertCircle, X, Search, Printer, Building2 } from 'lucide-react';
import { parse, differenceInMinutes } from 'date-fns';
import { cn, formatCurrency } from '../lib/utils';
import { Employee, PayrollReport } from '../types';
import WageStatementSheet from '../components/WageStatementSheet';

interface MainProps {
  onCreatePayroll: () => void;
  onManageEmployees: () => void;
  employees: Employee[];
  onImportEmployees: (employees: Employee[]) => void;
  reports: PayrollReport[];
  onImportReport: (report: PayrollReport) => void;
  onDeleteReport: (reportId: string) => void;
  onEditReport: (report: PayrollReport) => void;
}

export default function Main({ onCreatePayroll, onManageEmployees, employees, onImportEmployees, reports, onImportReport, onDeleteReport, onEditReport }: MainProps) {
  const reportFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [viewingReport, setViewingReport] = useState<PayrollReport | null>(null);

  // Consolidated Audit Dashboard Integration States
  const [selectedAcademy, setSelectedAcademy] = useState<string>('');
  const [filterYear, setFilterYear] = useState<number | 'all'>(2026);
  const [filterMonth, setFilterMonth] = useState<number | 'all'>(6);
  const [activeAuditEmployeeId, setActiveAuditEmployeeId] = useState<string | null>(null);

  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditTaxFilter, setAuditTaxFilter] = useState<'all' | 'FREELANCER' | 'FOUR_MAJOR'>('all');

  const [showPayslipEmpId, setShowPayslipEmpId] = useState<string | null>(null);
  const [showBulkStatements, setShowBulkStatements] = useState<boolean>(false);

  const [selectedPayslipCalc, setSelectedPayslipCalc] = useState<{ employee: Employee; calculated: any; academyName: string } | null>(null);
  const [selectedBulkCalcs, setSelectedBulkCalcs] = useState<{ statements: { employee: Employee; calculated: any }[]; academyName: string } | null>(null);

  // Sync state whenever a report is clicked for 상세 감사
  useEffect(() => {
    if (viewingReport) {
      setSelectedAcademy(viewingReport.academyName);
      const d = new Date(viewingReport.createdAt);
      setFilterYear(d.getFullYear());
      setFilterMonth(d.getMonth() + 1);
      
      if (viewingReport.calculated.length > 0) {
        setActiveAuditEmployeeId(viewingReport.calculated[0].employeeId);
      } else {
        setActiveAuditEmployeeId(null);
      }
    }
  }, [viewingReport]);

  const handleImportReportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.id && parsed.academyName && Array.isArray(parsed.calculated)) {
          onImportReport(parsed);
          setViewingReport(parsed); // Open inspector directly
        } else {
          alert("올바르지 않은 급여대장 결과 패키지 형식입니다.");
        }
      } catch (err) {
        alert("파일을 읽는 중 에러가 발생했습니다: " + err);
      }
    };
    reader.readAsText(file);
  };

  const handleEditReportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.id && parsed.academyName && Array.isArray(parsed.calculated)) {
          const exists = reports.some(r => r.id === parsed.id);
          if (!exists) {
            onImportReport(parsed);
          }
          onEditReport(parsed);
        } else {
          alert("올바르지 않은 급여대장 결과 패키지 형식입니다.");
        }
      } catch (err) {
        alert("파일을 읽는 중 에러가 발생했습니다: " + err);
      }
    };
    reader.readAsText(file);
  };
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">
            조교급여<span className="text-blue-600">대장</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium">
            2026년 최신 법정 이율 반영 · 스마트 급여 관리 솔루션
          </p>
        </motion.div>
      </header>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          <div className="glass-card p-8 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="text-purple-600" />
              인력 관리
            </h2>
            <p className="text-slate-600 leading-relaxed">
              조교들의 기본 정보, 시급, 근로계약 시간, 고정 수당 및 부서 정보를 등록하고 관리합니다. 
              체계적인 기본 마스터 데이터를 먼저 등록해 두어야 정확한 급여대장 산출이 가능합니다.
            </p>
            <button
              onClick={onManageEmployees}
              className="btn-3d-secondary w-full text-lg group"
            >
              조교 정보 관리
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="glass-card p-8 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calculator className="text-blue-600" />
              급여 관리 시작하기
            </h2>
            <p className="text-slate-600 leading-relaxed">
              학원 조교들의 출퇴근 기록을 업로드하고, 주휴수당과 세금을 자동으로 계산하세요. 
              3.3% 프리랜서, 4대보험 공제 방식 및 커스텀 세율(%) 임의 산출을 완벽하게 처리합니다.
            </p>
            <div className="space-y-3">
              <button
                onClick={onCreatePayroll}
                className="btn-3d w-full text-lg group"
              >
                조교급여 대장 생성
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => editFileInputRef.current?.click()}
                className="btn-3d-secondary w-full text-lg group flex items-center justify-center gap-1.5"
              >
                <Upload size={18} className="text-slate-600 group-hover:scale-105 transition-transform" />
                조교급여 대장 수정
              </button>
              <input
                type="file"
                ref={editFileInputRef}
                onChange={handleEditReportFile}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Main page Right column - Historical Audit & Archive System */}
          <div className="glass-card p-8 space-y-6 relative border-2 border-slate-900 bg-slate-900 text-white shadow-2xl">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <FileText className="text-blue-400" />
              급여정산 결과 및 상세기록 감사
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm">
              이전에 내보낸 급여대장 리포트 파일(.json)을 직접 업로드하거나 로컬 이력에서 선택해 **"어떤 정보와 근태 기록을 넣었는지, 주휴수당과 세금 공제 버튼은 무엇을 눌렀는지"** 상세 기록을 한눈에 감사하세요.
            </p>

            <button
              onClick={() => reportFileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Upload size={16} />
              급여 리포트(.json) 파일 불러오기
            </button>
            <input
              type="file"
              ref={reportFileInputRef}
              onChange={handleImportReportFile}
              accept=".json"
              className="hidden"
            />

            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">최근 정산 기록 ({reports.length}개)</h3>
              
              {reports.length === 0 ? (
                <div className="text-center py-8 bg-slate-800/40 rounded-xl border border-slate-800 text-slate-500 text-xs">
                  최근 완료하거나 불러온 정산 결과 이력이 없습니다.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {reports.map((rep) => {
                    const totalNet = rep.calculated.reduce((sum, item) => sum + item.netSalary, 0);
                    return (
                      <div key={rep.id} className="p-4 bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-800 flex justify-between items-center text-sm transition-all">
                        <div className="space-y-1">
                          <div className="font-extrabold text-white text-base">{rep.academyName}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(rep.createdAt).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                          <div className="text-xs text-blue-300 font-bold">
                            인원: {rep.calculated.length}명 · 총 지급: {formatCurrency(totalNet)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onEditReport(rep);
                            }}
                            className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => {
                              setViewingReport(rep);
                              if (rep.calculated.length > 0) {
                                setActiveAuditEmployeeId(rep.calculated[0].employeeId);
                              }
                            }}
                            className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                          >
                            상세 감사
                          </button>
                          <button
                            onClick={() => onDeleteReport(rep.id)}
                            className="p-2 text-slate-500 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* DETAILED LEDGER AUDIT MODAL DRAWER */}
      <AnimatePresence>
        {viewingReport && (() => {
          const filteredReports = reports.filter((rep) => {
            const d = new Date(rep.createdAt);
            const yearMatch = filterYear === 'all' || d.getFullYear() === Number(filterYear);
            const monthMatch = filterMonth === 'all' || (d.getMonth() + 1) === Number(filterMonth);
            return yearMatch && monthMatch;
          });

          const academiesInFilter = Array.from(new Set(filteredReports.map((r) => r.academyName)));

          // Derive active report based on selection
          const activeReport = filteredReports
            .filter((r) => r.academyName === selectedAcademy)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || viewingReport;

          const handleAcademySelect = (academy: string) => {
            setSelectedAcademy(academy);
            const targetReport = filteredReports
              .filter((r) => r.academyName === academy)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            if (targetReport && targetReport.calculated.length > 0) {
              setActiveAuditEmployeeId(targetReport.calculated[0].employeeId);
            } else {
              setActiveAuditEmployeeId(null);
            }
          };

          const handleYearChange = (year: string) => {
            const yr = year === 'all' ? 'all' : Number(year);
            setFilterYear(yr);
            const updatedFiltered = reports.filter((rep) => {
              const d = new Date(rep.createdAt);
              const yearMatch = yr === 'all' || d.getFullYear() === Number(yr);
              const monthMatch = filterMonth === 'all' || (d.getMonth() + 1) === Number(filterMonth);
              return yearMatch && monthMatch;
            });
            const updatedAcademies = Array.from(new Set(updatedFiltered.map((r) => r.academyName)));
            if (updatedAcademies.length > 0) {
              setSelectedAcademy(updatedAcademies[0]);
              const nextReport = updatedFiltered.filter(r => r.academyName === updatedAcademies[0]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
              if (nextReport && nextReport.calculated.length > 0) {
                setActiveAuditEmployeeId(nextReport.calculated[0].employeeId);
              } else {
                setActiveAuditEmployeeId(null);
              }
            } else {
              setSelectedAcademy('');
              setActiveAuditEmployeeId(null);
            }
          };

          const handleMonthChange = (month: string) => {
            const mo = month === 'all' ? 'all' : Number(month);
            setFilterMonth(mo);
            const updatedFiltered = reports.filter((rep) => {
              const d = new Date(rep.createdAt);
              const yearMatch = filterYear === 'all' || d.getFullYear() === Number(filterYear);
              const monthMatch = mo === 'all' || (d.getMonth() + 1) === Number(mo);
              return yearMatch && monthMatch;
            });
            const updatedAcademies = Array.from(new Set(updatedFiltered.map((r) => r.academyName)));
            if (updatedAcademies.length > 0) {
              setSelectedAcademy(updatedAcademies[0]);
              const nextReport = updatedFiltered.filter(r => r.academyName === updatedAcademies[0]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
              if (nextReport && nextReport.calculated.length > 0) {
                setActiveAuditEmployeeId(nextReport.calculated[0].employeeId);
              } else {
                setActiveAuditEmployeeId(null);
              }
            } else {
              setSelectedAcademy('');
              setActiveAuditEmployeeId(null);
            }
          };

          const totalNet = activeReport ? activeReport.calculated.reduce((sum, item) => sum + item.netSalary, 0) : 0;
          const totalGross = activeReport ? activeReport.calculated.reduce((sum, item) => sum + item.totalGross, 0) : 0;
          const totalDeductions = activeReport ? activeReport.calculated.reduce((sum, item) => sum + item.totalDeduction, 0) : 0;

          return (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200"
              >
                {/* Modal Header */}
                <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-600 font-black rounded text-[10px] uppercase">AUDIT PORTAL</span>
                      <h3 className="text-2xl font-black">급여정산 결과 및 상세기록 감사 대시보드</h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      정산 리포트별 내역을 기간(연/월)과 학원 단위로 상세 추적 및 감사할 수 있습니다.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setViewingReport(null);
                      setActiveAuditEmployeeId(null);
                      setAuditSearchQuery('');
                      setAuditTaxFilter('all');
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Quick Overall Stats */}
                {activeReport && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-slate-100 bg-slate-50 text-sm">
                    <div className="p-4 text-center border-r border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">선택된 학원</p>
                      <p className="text-lg font-black text-slate-800">
                        {activeReport ? activeReport.academyName : '-'}
                      </p>
                    </div>
                    <div className="p-4 text-center border-r border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">정산 인원 및 세전 총액</p>
                      <p className="text-lg font-black text-slate-800">
                        {activeReport ? `${activeReport.calculated.length}명 / ${formatCurrency(totalGross)}` : '0명'}
                      </p>
                    </div>
                    <div className="p-4 text-center border-r border-slate-100">
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">총 세금 / 공제 합계</p>
                      <p className="text-lg font-black text-red-500">
                        -{formatCurrency(totalDeductions)}
                      </p>
                    </div>
                    <div className="p-4 text-center bg-blue-50">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">최종 실지급액</p>
                      <p className="text-lg font-black text-blue-700">
                        {formatCurrency(totalNet)}
                      </p>
                    </div>
                  </div>
                )}

                {/* 3-Column Unified Audit Body Layout */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                  
                  {/* Column 1: Period Selection & Academies Sidebar */}
                  <div className="w-full lg:w-64 border-r border-slate-150 bg-slate-50/70 overflow-y-auto p-4 flex flex-col space-y-4">
                    
                    {/* Period Setting */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-500" />
                        감사 기간 선택
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">연도</label>
                          <select
                            value={filterYear}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="all">전체</option>
                            <option value="2025">2025년</option>
                            <option value="2026">2026년</option>
                            <option value="2027">2027년</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">월</label>
                          <select
                            value={filterMonth}
                            onChange={(e) => handleMonthChange(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="all">전체</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                              <option key={m} value={m}>{m}월</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Academy Selection ("학원 선택") */}
                    <div className="space-y-2 flex-1 flex flex-col">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 size={13} className="text-blue-600" />
                        학원 선택
                      </h4>

                      {academiesInFilter.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs font-bold border border-dashed border-slate-200 rounded-xl bg-white/50 p-3">
                          해당 기간에 생성된 급여 대장이 없습니다.
                        </div>
                      ) : (
                        <div className="space-y-1.5 overflow-y-auto pr-1">
                          {academiesInFilter.map((academy) => {
                            const matchCount = filteredReports.filter(r => r.academyName === academy).length;
                            const isSelected = selectedAcademy === academy;
                            
                            return (
                              <button
                                key={academy}
                                onClick={() => handleAcademySelect(academy)}
                                className={cn(
                                  "w-full text-left p-3 rounded-xl border flex items-center gap-2.5 transition-all",
                                  isSelected
                                    ? "bg-blue-600 border-blue-600 text-white shadow-md font-bold"
                                    : "bg-white border-slate-100 hover:border-slate-350 text-slate-700 font-semibold"
                                )}
                              >
                                <Building2 size={15} className={cn(isSelected ? "text-white" : "text-blue-500")} />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs truncate">{academy}</div>
                                  <div className={cn(
                                    "text-[9px] font-medium block mt-0.5",
                                    isSelected ? "text-blue-100" : "text-slate-400"
                                  )}>
                                    정산 이력: {matchCount}회
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Selected Academy Employees List */}
                  <div className="w-full lg:w-80 border-r border-slate-150 bg-white overflow-y-auto p-4 flex flex-col">
                    
                    {/* Search and Filters */}
                    <div className="space-y-2 mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400 h-3.5 w-3.5" />
                        <input
                          type="text"
                          placeholder="이름으로 검색..."
                          value={auditSearchQuery}
                          onChange={(e) => setAuditSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-850"
                        />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setAuditTaxFilter('all')}
                          className={cn(
                            "flex-1 py-1 text-[10px] font-black rounded transition-all",
                            auditTaxFilter === 'all' ? "bg-slate-950 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                          )}
                        >
                          전체
                        </button>
                        <button
                          onClick={() => setAuditTaxFilter('FREELANCER')}
                          className={cn(
                            "flex-1 py-1 text-[10px] font-black rounded transition-all",
                            auditTaxFilter === 'FREELANCER' ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                          )}
                        >
                          3.3% 프리
                        </button>
                        <button
                          onClick={() => setAuditTaxFilter('FOUR_MAJOR')}
                          className={cn(
                            "flex-1 py-1 text-[10px] font-black rounded transition-all",
                            auditTaxFilter === 'FOUR_MAJOR' ? "bg-purple-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                          )}
                        >
                          4대보험
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3 px-1">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">직원 목록</h4>
                      {activeReport && activeReport.calculated.length > 0 && (
                        <button
                          onClick={() => setShowBulkStatements(true)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-lg transition-all shadow-sm cursor-pointer"
                        >
                          <Printer size={11} />
                          전원 명세서 인쇄
                        </button>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 pr-1">
                      {activeReport ? (() => {
                        const list = activeReport.calculated.filter((calc) => {
                          const nameMatch = calc.name.toLowerCase().includes(auditSearchQuery.toLowerCase());
                          const taxMatch = auditTaxFilter === 'all' || calc.taxType === auditTaxFilter;
                          return nameMatch && taxMatch;
                        });

                        if (list.length === 0) {
                          return (
                            <div className="text-center py-8 text-slate-400 text-xs font-bold bg-slate-50 rounded-xl border border-dashed border-slate-150">
                              조건에 맞는 정산 대상이 없습니다.
                            </div>
                          );
                        }

                        return list.map((calc) => (
                          <button
                            key={calc.employeeId}
                            onClick={() => setActiveAuditEmployeeId(calc.employeeId)}
                            className={cn(
                              "w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center",
                              activeAuditEmployeeId === calc.employeeId
                                ? "bg-slate-50 border-slate-900 shadow-sm translate-x-1"
                                : "bg-white border-slate-100 hover:bg-slate-50/50"
                            )}
                          >
                            <div className="space-y-1">
                              <div className="font-extrabold text-slate-900 text-sm leading-tight">{calc.name}</div>
                              <div className="text-xs text-slate-500">{calc.position}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-black inline-block mb-1 tracking-tight">
                                {calc.taxType === 'FREELANCER' ? '3.3%' : '4대보험'}
                              </div>
                              <div className="font-black text-xs text-slate-800">{formatCurrency(calc.netSalary)}</div>
                            </div>
                          </button>
                        ));
                      })() : (
                        <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                          학원을 선택해주시면 조교 목록이 표시됩니다.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 3: Selected Employee Attendance & Formulas Sheet */}
                  <div className="flex-1 bg-slate-50/50 overflow-y-auto p-6 space-y-6">
                    {(() => {
                      if (!activeReport) {
                        return (
                          <div className="text-center py-20 text-slate-400 text-sm font-semibold">
                            지정된 날짜의 학원을 선택해 대장 감사를 시작하십시오.
                          </div>
                        );
                      }

                      const selectedCalc = activeReport.calculated.find(c => c.employeeId === activeAuditEmployeeId);
                      const selectedEmp = activeReport.employees.find(e => e.id === activeAuditEmployeeId);
                      if (!selectedCalc) {
                        return (
                          <div className="text-center py-20 text-slate-400 text-sm font-semibold">
                            왼쪽의 직원 목록에서 급여를 상세 감사할 대상을 기정하십시오.
                          </div>
                        );
                      }

                      // Get attendance log for this person
                      const personAttendance = activeReport.attendance.filter(att => att.employeeId === activeAuditEmployeeId);
                      const hStat = activeReport.weeklyHolidayStatus[selectedCalc.employeeId]?.[0] !== false;

                      return (
                        <div className="space-y-6">
                          {/* TA Metadata Card */}
                          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-xs">
                                {selectedCalc.name[0]}
                              </div>
                              <div>
                                <h4 className="text-xl font-bold text-slate-900">{selectedCalc.name} <span className="text-xs text-slate-500 font-normal">{selectedCalc.position}</span></h4>
                                <p className="text-xs text-slate-400">주민번호: {selectedEmp?.ssn.split('-')[0]}-******* · 입사일: {selectedEmp?.hireDate}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-600">
                              <div>
                                <span className="text-slate-400 font-medium block">시정 시급</span>
                                <span className="text-slate-800">{selectedEmp?.hourlyWage.toLocaleString()}원</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium block">주휴일자</span>
                                <span className="text-slate-800">{selectedEmp?.weeklyHoliday}요일</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium block">세금설정</span>
                                <span className="text-blue-600">{selectedCalc.taxType === 'FREELANCER' ? '3.3% 사업소득세' : '4대보험 공제'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Attendance Logs Details (Where numbers were entered) */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <h5 className="font-bold text-slate-800 flex items-center gap-2">
                                <Calendar size={16} className="text-blue-600" />
                                입력된 근태 기록 및 설정 감사시트
                              </h5>
                              <span className="text-xs text-slate-500">주 근무시간: <strong className="text-slate-900 text-sm font-black">{selectedCalc.weeklyHours.toFixed(1)}시간</strong></span>
                            </div>
                            <div className="border border-slate-150 rounded-xl overflow-hidden text-xs bg-white shadow-xs">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                    <th className="px-4 py-3">근무 일자</th>
                                    <th className="px-4 py-3">출근 기록</th>
                                    <th className="px-4 py-3">퇴근 기록</th>
                                    <th className="px-4 py-3">휴게 적용여부 (4h당 30m)</th>
                                    <th className="px-4 py-3">차감 후 실시간</th>
                                    <th className="px-4 py-3">상태</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {personAttendance.length === 0 ? (
                                    <tr>
                                      <td colSpan={6} className="text-center py-6 text-slate-400">당시 정산기록에 상세 행 데이터가 누락되었습니다.</td>
                                    </tr>
                                  ) : (
                                    personAttendance.map((att) => (
                                      <tr key={att.date} className="border-t border-slate-100 hover:bg-slate-50/40">
                                        <td className="px-4 py-3 font-semibold text-slate-800">{att.date}</td>
                                        <td className="px-4 py-3 font-bold text-slate-700">{att.clockIn || '-'}</td>
                                        <td className="px-4 py-3 font-bold text-slate-700">{att.clockOut || '-'}</td>
                                        <td className="px-4 py-3">
                                          <span className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-black",
                                            att.hasBreak ? "bg-orange-50 text-orange-600 border border-orange-200" : "bg-slate-100 text-slate-400"
                                          )}>
                                            {att.hasBreak ? 'Break Y' : 'Break N'}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 font-black text-slate-900">
                                          {att.clockIn && att.clockOut ? (
                                            // Simple recalculation render
                                            (() => {
                                              const start = parse(att.clockIn, 'HH:mm', new Date());
                                              const end = parse(att.clockOut, 'HH:mm', new Date());
                                              let diff = differenceInMinutes(end, start);
                                              if (att.hasBreak) {
                                                if (diff >= 480) diff -= 60;
                                                else if (diff >= 240) diff -= 30;
                                              }
                                              return `${Math.max(0, diff / 60).toFixed(1)}h`;
                                            })()
                                          ) : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                          {att.isAbsence ? (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-600 font-bold rounded">결석</span>
                                          ) : (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-600 font-bold rounded">정상</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Financial Ledger Formulas */}
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Left: Salary elements */}
                            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-150 text-xs space-y-3">
                              <h6 className="font-bold text-blue-900 flex items-center gap-1.5 text-sm">
                                <Calculator size={14} className="text-blue-600" />
                                지급 산식 공식
                              </h6>
                              <div className="flex justify-between">
                                <span className="text-slate-500">기본급 ({selectedCalc.weeklyHours.toFixed(1)}시간)</span>
                                <span className="font-extrabold text-slate-800">{formatCurrency(selectedCalc.baseSalary)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 flex items-center gap-2">
                                  주휴수당 지급 여부
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[9px] font-black",
                                    hStat ? "bg-blue-600 text-white" : "bg-red-500 text-white"
                                  )}>
                                    {hStat ? '지급 Y' : '미자격/제외 N'}
                                  </span>
                                </span>
                                <span className="font-extrabold text-slate-800">{formatCurrency(selectedCalc.holidayAllowance)}</span>
                              </div>
                              <hr className="border-blue-105" />
                              <div className="flex justify-between text-base font-black text-blue-900">
                                <span>세전 총급여</span>
                                <span>{formatCurrency(selectedCalc.totalGross)}</span>
                              </div>
                            </div>

                            {/* Right: Deductions elements */}
                            <div className="p-5 bg-red-50/50 rounded-2xl border border-red-150 text-xs space-y-3">
                              <h6 className="font-bold text-red-900 flex items-center gap-1.5 text-sm">
                                <Clock size={14} className="text-red-500" />
                                공제 세금 및 영수 법정 요율
                              </h6>
                              {Object.entries(selectedCalc.deductions).map(([taxName, amt]) => (
                                <div key={taxName} className="flex justify-between">
                                  <span className="text-slate-500">{taxName}</span>
                                  <span className="font-extrabold text-red-600">-{formatCurrency(amt as number)}</span>
                                </div>
                              ))}
                              <hr className="border-red-105" />
                              <div className="flex justify-between text-base font-black text-red-600">
                                <span>공제 합계액</span>
                                <span>-{formatCurrency(selectedCalc.totalDeduction)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Final Result Card */}
                          <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                              <span className="text-slate-400 text-xs font-bold block uppercase tracking-widest mb-1">실 수령급여 산출액</span>
                              <span className="text-slate-300 text-xs font-semibold">{formatCurrency(selectedCalc.totalGross)} (세전) - {formatCurrency(selectedCalc.totalDeduction)} (공제)</span>
                            </div>
                            <div className="text-right flex flex-wrap gap-3 items-center justify-end">
                              <button
                                onClick={() => setShowPayslipEmpId(selectedCalc.employeeId)}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                              >
                                <Printer size={13} />
                                법정 임금명세서 인쇄
                              </button>
                              <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded font-black uppercase tracking-widest">NET PAY</span>
                              <span className="text-3xl font-black text-white leading-none inline-block">{formatCurrency(selectedCalc.netSalary)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Wage Statement Sheet for Audited Reports */}
      {showPayslipEmpId && viewingReport && (() => {
        // Find reference report safely
        const filteredReports = reports.filter((rep) => {
          const d = new Date(rep.createdAt);
          const yearMatch = filterYear === 'all' || d.getFullYear() === Number(filterYear);
          const monthMatch = filterMonth === 'all' || (d.getMonth() + 1) === Number(filterMonth);
          return yearMatch && monthMatch;
        });
        const activeReport = filteredReports.find(r => r.academyName === selectedAcademy) || viewingReport;

        const emp = activeReport.employees.find(e => e.id === showPayslipEmpId);
        const calculated = activeReport.calculated.find(c => c.employeeId === showPayslipEmpId);
        if (!emp || !calculated) return null;
        return (
          <WageStatementSheet
            employee={emp}
            calculated={calculated as any}
            academyName={activeReport.academyName}
            onClose={() => setShowPayslipEmpId(null)}
          />
        );
      })()}

      {/* Bulk Wage Statement Sheet for Audited Reports */}
      {showBulkStatements && viewingReport && (() => {
        // Find reference report safely
        const filteredReports = reports.filter((rep) => {
          const d = new Date(rep.createdAt);
          const yearMatch = filterYear === 'all' || d.getFullYear() === Number(filterYear);
          const monthMatch = filterMonth === 'all' || (d.getMonth() + 1) === Number(filterMonth);
          return yearMatch && monthMatch;
        });
        const activeReport = filteredReports.find(r => r.academyName === selectedAcademy) || viewingReport;

        const statements = activeReport.calculated.map(calc => {
          const emp = activeReport.employees.find(e => e.id === calc.employeeId);
          return emp ? { employee: emp, calculated: calc } : null;
        }).filter(Boolean) as Array<{ employee: Employee; calculated: any }>;

        if (statements.length === 0) return null;

        return (
          <WageStatementSheet
            allStatements={statements}
            academyName={activeReport.academyName}
            onClose={() => setShowBulkStatements(false)}
          />
        );
      })()}
    </div>
  );
}
