import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Users, Calculator, Settings, ChevronRight, Upload, Download, Database, Check, FileText, Trash2, Calendar, Clock, Coffee, AlertCircle, X, Search, Printer } from 'lucide-react';
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
}

export default function Main({ onCreatePayroll, onManageEmployees, employees, onImportEmployees, reports, onImportReport, onDeleteReport }: MainProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportFileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const [viewingReport, setViewingReport] = useState<PayrollReport | null>(null);
  const [activeTab, setActiveTab] = useState<'employees' | 'reports'>('employees');
  const [activeAuditEmployeeId, setActiveAuditEmployeeId] = useState<string | null>(null);
  const [showPayslipEmpId, setShowPayslipEmpId] = useState<string | null>(null);
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditTaxFilter, setAuditTaxFilter] = useState<'all' | 'FREELANCER' | 'FOUR_MAJOR'>('all');
  const [showBulkStatements, setShowBulkStatements] = useState(false);

  const handleExport = () => {
    if (employees.length === 0) {
      alert("백업할 조교 데이터가 없습니다. 먼저 조교를 등록해주세요!");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(employees, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `조교급여대장_백업_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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
          if (parsed.calculated.length > 0) {
            setActiveAuditEmployeeId(parsed.calculated[0].employeeId);
          }
        } else {
          alert("올바르지 않은 급여대장 결과 패키지 형식입니다.");
        }
      } catch (err) {
        alert("파일을 읽는 중 에러가 발생했습니다: " + err);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed) && parsed.every(item => item.id && item.name)) {
          onImportEmployees(parsed);
          setSuccessMsg(true);
          setTimeout(() => setSuccessMsg(false), 3000);
        } else {
          alert("올바르지 않은 백업 파일 형식입니다.");
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
            <button
              onClick={onCreatePayroll}
              className="btn-3d w-full text-lg group"
            >
              조교급여 대장 생성
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* New JSON Save/Load & History system */}
          <div className="glass-card p-8 space-y-6 relative border-2 border-dashed border-slate-200">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Database className="text-emerald-600" />
              기존 데이터 세션 관리
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              브라우저가 초기화되거나 다른 기기에서 이용할 때를 위해, 인력 리스트 및 계산에 필요한 데이터를 백업 및 복원하거나 다운로드 하세요.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center text-sm border border-slate-100">
              <span className="text-slate-500 font-medium">현재 등록된 조교 수</span>
              <span className="font-extrabold text-slate-900 bg-slate-200/55 px-3 py-1 rounded-full text-xs">
                {employees.length}명
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold border border-slate-200 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Download size={16} className="text-slate-600" />
                백업 받기
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Upload size={16} className="text-emerald-400" />
                가져오기
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <AnimatePresence>
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-bold flex items-center gap-2 justify-center"
                >
                  <Check size={14} className="text-emerald-600 animate-bounce" />
                  성공적으로 데이터를 복원하였습니다!
                </motion.div>
              )}
            </AnimatePresence>
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
        {viewingReport && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-200"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-600 font-black rounded text-[10px] uppercase">AUDIT LEDGER</span>
                    <h3 className="text-2xl font-black">{viewingReport.academyName} 급여 정산 감사</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    정산 산출 일자: {new Date(viewingReport.createdAt).toLocaleString('ko-KR')}
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
              <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-100 bg-slate-50">
                <div className="p-4 text-center border-r border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">정산 대상자</p>
                  <p className="text-lg font-black text-slate-800">{viewingReport.calculated.length}명</p>
                </div>
                <div className="p-4 text-center border-r border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">총 지급 세액 세전</p>
                  <p className="text-lg font-black text-slate-800">
                    {formatCurrency(viewingReport.calculated.reduce((sum, item) => sum + item.totalGross, 0))}
                  </p>
                </div>
                <div className="p-4 text-center border-r border-slate-100 col-span-2 md:col-span-1">
                  <p className="text-[10px] font-bold text-slate-red-400 text-red-500 uppercase tracking-widest">총 세금 및 공제액</p>
                  <p className="text-lg font-black text-red-500">
                    {formatCurrency(viewingReport.calculated.reduce((sum, item) => sum + item.totalDeduction, 0))}
                  </p>
                </div>
                <div className="p-4 text-center bg-blue-50">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">최종 실지급액</p>
                  <p className="text-lg font-black text-blue-700">
                    {formatCurrency(viewingReport.calculated.reduce((sum, item) => sum + item.netSalary, 0))}
                  </p>
                </div>
              </div>

              {/* Side-by-Side Detail Panel */}
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Left side: list of employees calculated */}
                <div className="w-full md:w-80 border-r border-slate-100 bg-slate-50/50 overflow-y-auto p-4 flex flex-col">
                  {/* Search and filters */}
                  <div className="space-y-2 mb-4 bg-white/80 p-3 rounded-xl border border-slate-200 shadow-sm">
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
                          "flex-1 py-1.5 text-[10px] font-black rounded transition-all",
                          auditTaxFilter === 'all' ? "bg-slate-950 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        )}
                      >
                        전체
                      </button>
                      <button
                        onClick={() => setAuditTaxFilter('FREELANCER')}
                        className={cn(
                          "flex-1 py-1.5 text-[10px] font-black rounded transition-all",
                          auditTaxFilter === 'FREELANCER' ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        )}
                      >
                        3.3% 프리
                      </button>
                      <button
                        onClick={() => setAuditTaxFilter('FOUR_MAJOR')}
                        className={cn(
                          "flex-1 py-1.5 text-[10px] font-black rounded transition-all",
                          auditTaxFilter === 'FOUR_MAJOR' ? "bg-purple-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        )}
                      >
                        4대보험
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3 px-1">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">직원 목록</h4>
                    {viewingReport.calculated.length > 0 && (
                      <button
                        onClick={() => setShowBulkStatements(true)}
                        className="flex items-center gap-1 px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-lg transition-all shadow-sm cursor-pointer"
                      >
                        <Printer size={11} />
                        전원 일괄인쇄
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {(() => {
                      const list = viewingReport.calculated.filter((calc) => {
                        const nameMatch = calc.name.toLowerCase().includes(auditSearchQuery.toLowerCase());
                        const taxMatch = auditTaxFilter === 'all' || calc.taxType === auditTaxFilter;
                        return nameMatch && taxMatch;
                      });

                      if (list.length === 0) {
                        return (
                          <div className="text-center py-8 text-slate-400 text-xs font-bold bg-white/30 rounded-xl border border-dashed border-slate-200">
                            검색 결과가 없습니다.
                          </div>
                        );
                      }

                      return list.map((calc) => (
                        <button
                          key={calc.employeeId}
                          onClick={() => setActiveAuditEmployeeId(calc.employeeId)}
                          className={cn(
                            "w-full text-left p-3.5 rounded-xl border transition-all flex justify-between items-center",
                            activeAuditEmployeeId === calc.employeeId
                              ? "bg-white border-slate-900 shadow-md translate-x-1"
                              : "bg-white/40 border-slate-100 hover:bg-white"
                          )}
                        >
                          <div className="space-y-1">
                            <div className="font-extrabold text-slate-900 text-sm leading-tight">{calc.name}</div>
                            <div className="text-xs text-slate-500">{calc.position}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[9px] bg-slate-150 text-slate-600 px-1.5 py-0.5 rounded font-black inline-block mb-1 font-mono uppercase tracking-tight">
                              {calc.taxType === 'FREELANCER' ? '3.3%' : '4대보험'}
                            </div>
                            <div className="font-black text-xs text-slate-850">{formatCurrency(calc.netSalary)}</div>
                          </div>
                        </button>
                      ));
                    })()}
                  </div>
                </div>

                {/* Right side: selected employee audit logs */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {(() => {
                    const selectedCalc = viewingReport.calculated.find(c => c.employeeId === activeAuditEmployeeId);
                    const selectedEmp = viewingReport.employees.find(e => e.id === activeAuditEmployeeId);
                    if (!selectedCalc) {
                      return (
                        <div className="text-center py-20 text-slate-400 text-sm">
                          왼쪽 목록에서 급여를 감사할 조교를 선택하세요.
                        </div>
                      );
                    }

                    // Get attendance log for this person
                    const personAttendance = viewingReport.attendance.filter(att => att.employeeId === activeAuditEmployeeId);
                    const hStat = viewingReport.weeklyHolidayStatus[selectedCalc.employeeId]?.[0] !== false;

                    return (
                      <div className="space-y-6">
                        {/* TA Metadata Card */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-wrap justify-between items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl">
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
                              <span>{selectedEmp?.hourlyWage.toLocaleString()}원</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-medium block">주휴일자</span>
                              <span>{selectedEmp?.weeklyHoliday}요일</span>
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
                          <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-500 font-bold">
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
                                    <tr key={att.date} className="border-t border-slate-100">
                                      <td className="px-4 py-3 font-semibold">{att.date}</td>
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
                          <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs space-y-3">
                            <h6 className="font-bold text-blue-900 flex items-center gap-1.5 text-sm">
                              <Calculator size={14} />
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
                            <hr className="border-blue-100" />
                            <div className="flex justify-between text-base font-black text-blue-900">
                              <span>세전 총급여</span>
                              <span>{formatCurrency(selectedCalc.totalGross)}</span>
                            </div>
                          </div>

                          {/* Right: Deductions elements */}
                          <div className="p-5 bg-red-50/50 rounded-2xl border border-red-100 text-xs space-y-3">
                            <h6 className="font-bold text-red-900 flex items-center gap-1.5 text-sm">
                              <Clock size={14} />
                              공제 세금 및 영수 법정 요율
                            </h6>
                            {Object.entries(selectedCalc.deductions).map(([taxName, amt]) => (
                              <div key={taxName} className="flex justify-between">
                                <span className="text-slate-500">{taxName}</span>
                                <span className="font-extrabold text-red-600">-{formatCurrency(amt as number)}</span>
                              </div>
                            ))}
                            <hr className="border-red-100" />
                            <div className="flex justify-between text-base font-black text-red-600">
                              <span>공제 합계액</span>
                              <span>-{formatCurrency(selectedCalc.totalDeduction)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Final Result Card */}
                        <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div>
                            <span className="text-xs text-slate-400 font-bold block uppercase tracking-widest">실 수령급여 산출액</span>
                            <span className="text-sm text-slate-300 font-semibold">{formatCurrency(selectedCalc.totalGross)} (세전) - {formatCurrency(selectedCalc.totalDeduction)} (공제)</span>
                          </div>
                          <div className="text-right flex flex-wrap gap-3 items-center justify-end">
                            <button
                              onClick={() => setShowPayslipEmpId(selectedCalc.employeeId)}
                              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md"
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
        )}
      </AnimatePresence>

      {/* Wage Statement Sheet for Audited Reports */}
      {showPayslipEmpId && viewingReport && (() => {
        const emp = viewingReport.employees.find(e => e.id === showPayslipEmpId);
        const calculated = viewingReport.calculated.find(c => c.employeeId === showPayslipEmpId);
        if (!emp || !calculated) return null;
        return (
          <WageStatementSheet
            employee={emp}
            calculated={calculated as any}
            academyName={viewingReport.academyName}
            onClose={() => setShowPayslipEmpId(null)}
          />
        );
      })()}

      {/* Bulk Wage Statement Sheet for Audited Reports */}
      {showBulkStatements && viewingReport && (() => {
        const statements = viewingReport.calculated.map(calc => {
          const emp = viewingReport.employees.find(e => e.id === calc.employeeId);
          return emp ? { employee: emp, calculated: calc } : null;
        }).filter(Boolean) as Array<{ employee: Employee; calculated: any }>;

        if (statements.length === 0) return null;

        return (
          <WageStatementSheet
            allStatements={statements}
            academyName={viewingReport.academyName}
            onClose={() => setShowBulkStatements(false)}
          />
        );
      })()}
    </div>
  );
}
