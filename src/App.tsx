/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Main from './views/Main';
import EmployeeManagement from './views/EmployeeManagement';
import PayrollCreation from './views/PayrollCreation';
import { Employee } from './types';

type View = 'MAIN' | 'EMPLOYEES' | 'PAYROLL';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('MAIN');
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Load employees from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('payroll_employees');
    if (saved) {
      try {
        setEmployees(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse employees', e);
      }
    }
  }, []);

  // Save employees to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('payroll_employees', JSON.stringify(employees));
  }, [employees]);

  const addEmployee = (emp: Employee) => {
    setEmployees(prev => [...prev, emp]);
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen font-sans">
      {currentView === 'MAIN' && (
        <Main 
          onCreatePayroll={() => setCurrentView('PAYROLL')} 
          onManageEmployees={() => setCurrentView('EMPLOYEES')} 
        />
      )}
      
      {currentView === 'EMPLOYEES' && (
        <EmployeeManagement 
          employees={employees}
          onAddEmployee={addEmployee}
          onDeleteEmployee={deleteEmployee}
          onBack={() => setCurrentView('MAIN')}
        />
      )}

      {currentView === 'PAYROLL' && (
        <PayrollCreation 
          employees={employees}
          onBack={() => setCurrentView('MAIN')}
        />
      )}
    </div>
  );
}
