import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Save, X, UserPlus, Calendar, Clock, CreditCard, Users } from 'lucide-react';
import { Employee, DayOfWeek } from '../types';
import { DAYS_OF_WEEK, WORK_DAYS } from '../constants';
import { cn } from '../lib/utils';

interface EmployeeManagementProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onBack: () => void;
}

export default function EmployeeManagement({ employees, onAddEmployee, onDeleteEmployee, onBack }: EmployeeManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    position: '조교',
    ssn: '',
    hourlyWage: 10030, // 2025 최저시급 기준
    weeklyHoliday: '일',
    hireDate: new Date().toISOString().split('T')[0],
    payday: 10,
    taxType: 'FREELANCER',
    customTaxRate: 3.3,
    allowances: {
      position: 0,
      qualification: 0,
      businessPromotion: 0,
      cashier: 0,
      meal: 0,
      other: 0,
      omitted: 0,
    },
    standardWorkHours: {
      '월': { start: '14:00', end: '22:00' },
      '화': { start: '14:00', end: '22:00' },
      '수': { start: '14:00', end: '22:00' },
      '목': { start: '14:00', end: '22:00' },
      '금': { start: '14:00', end: '22:00' },
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmployee.name && newEmployee.ssn) {
      onAddEmployee({
        ...newEmployee,
        id: crypto.randomUUID(),
      } as Employee);
      setIsAdding(false);
      setNewEmployee({
        name: '',
        position: '조교',
        ssn: '',
        hourlyWage: 10030,
        weeklyHoliday: '일',
        hireDate: new Date().toISOString().split('T')[0],
        payday: 10,
        taxType: 'FREELANCER',
        customTaxRate: 3.3,
        allowances: {
          position: 0,
          qualification: 0,
          businessPromotion: 0,
          cashier: 0,
          meal: 0,
          other: 0,
          omitted: 0,
        },
        standardWorkHours: {
          '월': { start: '14:00', end: '22:00' },
          '화': { start: '14:00', end: '22:00' },
          '수': { start: '14:00', end: '22:00' },
          '목': { start: '14:00', end: '22:00' },
          '금': { start: '14:00', end: '22:00' },
        }
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">조교 정보 관리</h1>
          <p className="text-slate-500">학원에 소속된 조교들의 정보를 등록하고 관리하세요.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={onBack} className="px-6 py-2 font-medium text-slate-600 hover:text-slate-900 transition-colors">
            뒤로가기
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="btn-3d px-6 py-2"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            조교 추가
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-card p-8 mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">이름</label>
                  <input
                    required
                    type="text"
                    value={newEmployee.name}
                    onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="홍길동"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">직급</label>
                  <input
                    required
                    type="text"
                    value={newEmployee.position}
                    onChange={e => setNewEmployee({ ...newEmployee, position: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="조교 / 팀장"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">주민등록번호</label>
                  <input
                    required
                    type="text"
                    value={newEmployee.ssn}
                    onChange={e => setNewEmployee({ ...newEmployee, ssn: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="000000-0000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">시급 (원)</label>
                  <input
                    required
                    type="number"
                    value={newEmployee.hourlyWage}
                    onChange={e => setNewEmployee({ ...newEmployee, hourlyWage: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">주휴일</label>
                  <select
                    value={newEmployee.weeklyHoliday}
                    onChange={e => setNewEmployee({ ...newEmployee, weeklyHoliday: e.target.value as DayOfWeek })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day} value={day}>{day}요일</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">입사일</label>
                  <input
                    required
                    type="date"
                    value={newEmployee.hireDate}
                    onChange={e => setNewEmployee({ ...newEmployee, hireDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">급여지급일 (매달)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="31"
                    value={newEmployee.payday}
                    onChange={e => setNewEmployee({ ...newEmployee, payday: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Advanced tax and default/fixed allowances settings */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1">
                    <CreditCard size={18} className="text-blue-600" />
                    급여 공제(세금) 및 고정 수당 기본값 설정
                  </h3>
                  <p className="text-xs text-slate-500">정산 시 매월 자동으로 기본 반영될 세금 유형과 수당 값들을 미리 설정해 둘 수 있습니다.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">기본 세금 유형</label>
                    <select
                      value={newEmployee.taxType}
                      onChange={e => setNewEmployee({ ...newEmployee, taxType: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-800"
                    >
                      <option value="FREELANCER">3.3% 프리랜서 사업소득세</option>
                      <option value="FOUR_MAJOR">4대 보험 세율 규정 계산</option>
                      <option value="CUSTOM">커스텀 임의 요율 설정 (%)</option>
                    </select>
                  </div>

                  {newEmployee.taxType === 'CUSTOM' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">커스텀 원천징수 요율 (%)</label>
                      <input
                        required
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={newEmployee.customTaxRate || 3.3}
                        onChange={e => setNewEmployee({ ...newEmployee, customTaxRate: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                        placeholder="예: 5.5"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200/60 pt-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">고정 매월 수당 (원화)</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">직책수당</label>
                      <input
                        type="number"
                        value={newEmployee.allowances?.position || 0}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          setNewEmployee(prev => ({
                            ...prev,
                            allowances: { ...prev.allowances, position: val }
                          }));
                        }}
                        className="w-full px-3 py-1.5 bg-white text-xs font-semibold text-slate-800 rounded-lg border border-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">자격수당</label>
                      <input
                        type="number"
                        value={newEmployee.allowances?.qualification || 0}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          setNewEmployee(prev => ({
                            ...prev,
                            allowances: { ...prev.allowances, qualification: val }
                          }));
                        }}
                        className="w-full px-3 py-1.5 bg-white text-xs font-semibold text-slate-800 rounded-lg border border-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">업무추진비</label>
                      <input
                        type="number"
                        value={newEmployee.allowances?.businessPromotion || 0}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          setNewEmployee(prev => ({
                            ...prev,
                            allowances: { ...prev.allowances, businessPromotion: val }
                          }));
                        }}
                        className="w-full px-3 py-1.5 bg-white text-xs font-semibold text-slate-800 rounded-lg border border-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">출납수당</label>
                      <input
                        type="number"
                        value={newEmployee.allowances?.cashier || 0}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          setNewEmployee(prev => ({
                            ...prev,
                            allowances: { ...prev.allowances, cashier: val }
                          }));
                        }}
                        className="w-full px-3 py-1.5 bg-white text-xs font-semibold text-slate-800 rounded-lg border border-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">식대(비과세)</label>
                      <input
                        type="number"
                        value={newEmployee.allowances?.meal || 0}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          setNewEmployee(prev => ({
                            ...prev,
                            allowances: { ...prev.allowances, meal: val }
                          }));
                        }}
                        className="w-full px-3 py-1.5 bg-white text-xs font-semibold text-slate-800 rounded-lg border border-slate-200"
                        placeholder="최대 20만원 비과세"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">기타수당</label>
                      <input
                        type="number"
                        value={newEmployee.allowances?.other || 0}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          setNewEmployee(prev => ({
                            ...prev,
                            allowances: { ...prev.allowances, other: val }
                          }));
                        }}
                        className="w-full px-3 py-1.5 bg-white text-xs font-semibold text-slate-800 rounded-lg border border-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block text-red-500">기존누락분</label>
                      <input
                        type="number"
                        value={newEmployee.allowances?.omitted || 0}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          setNewEmployee(prev => ({
                            ...prev,
                            allowances: { ...prev.allowances, omitted: val }
                          }));
                        }}
                        className="w-full px-3 py-1.5 bg-white text-xs font-semibold text-slate-800 rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">

                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Clock size={18} className="text-blue-600" />
                  표준 근무 시간 설정 (월~금)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  {WORK_DAYS.map(day => (
                    <div key={day} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-sm font-bold text-slate-600 mb-2">{day}요일</div>
                      <div className="space-y-2">
                        <input
                          type="time"
                          value={newEmployee.standardWorkHours?.[day]?.start}
                          onChange={e => {
                            const hours = { ...newEmployee.standardWorkHours };
                            hours[day] = { ...hours[day]!, start: e.target.value };
                            setNewEmployee({ ...newEmployee, standardWorkHours: hours });
                          }}
                          className="w-full text-xs px-2 py-1 rounded border border-slate-200"
                        />
                        <input
                          type="time"
                          value={newEmployee.standardWorkHours?.[day]?.end}
                          onChange={e => {
                            const hours = { ...newEmployee.standardWorkHours };
                            hours[day] = { ...hours[day]!, end: e.target.value };
                            setNewEmployee({ ...newEmployee, standardWorkHours: hours });
                          }}
                          className="w-full text-xs px-2 py-1 rounded border border-slate-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                  저장하기
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {employees.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <Users size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">등록된 조교가 없습니다. 새로운 조교를 추가해보세요!</p>
          </div>
        ) : (
          employees.map(emp => (
            <motion.div
              layout
              key={emp.id}
              className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                  {emp.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{emp.name}</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded">
                      {emp.position}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{emp.ssn.split('-')[0]}-*******</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">시급</p>
                  <p className="font-bold text-slate-700">{emp.hourlyWage.toLocaleString()}원</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">세금유형</p>
                  <p className="font-bold text-blue-600 text-sm">
                    {emp.taxType === 'FREELANCER' ? '3.3% 프리랜서' : emp.taxType === 'CUSTOM' ? `커스텀 (${emp.customTaxRate || 3.3}%)` : '4대보험'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">입사일</p>
                  <p className="font-bold text-slate-700 text-sm">{emp.hireDate}</p>
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">지급일</p>
                  <p className="font-bold text-slate-700 text-sm">매달 {emp.payday}일</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => onDeleteEmployee(emp.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
