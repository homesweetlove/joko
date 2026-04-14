import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Users, Calculator, Settings, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface MainProps {
  onCreatePayroll: () => void;
  onManageEmployees: () => void;
}

export default function Main({ onCreatePayroll, onManageEmployees }: MainProps) {
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
              <Calculator className="text-blue-600" />
              급여 관리 시작하기
            </h2>
            <p className="text-slate-600 leading-relaxed">
              학원 조교들의 출퇴근 기록을 업로드하고, 주휴수당과 세금을 자동으로 계산하세요. 
              3.3% 프리랜서 및 4대보험 공제 방식을 모두 지원합니다.
            </p>
            <button
              onClick={onCreatePayroll}
              className="btn-3d w-full text-lg group"
            >
              조교급여 생성
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="glass-card p-8 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="text-purple-600" />
              인력 관리
            </h2>
            <p className="text-slate-600 leading-relaxed">
              조교들의 기본 정보, 시급, 근로계약 시간을 등록하고 관리합니다. 
              입사일과 퇴사일 관리를 통해 체계적인 인력 운영이 가능합니다.
            </p>
            <button
              onClick={onManageEmployees}
              className="btn-3d-secondary w-full text-lg group"
            >
              조교 정보 관리
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative hidden md:block"
        >
          {/* Abstract 3D Shapes */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          
          <div className="relative glass-card p-12 aspect-square flex items-center justify-center overflow-hidden">
            <motion.div
              animate={{ 
                rotate: [0, 10, 0, -10, 0],
                y: [0, -20, 0]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center"
            >
              <Calculator size={80} className="text-white" />
            </motion.div>
            
            <motion.div
              animate={{ 
                rotate: [0, -15, 0, 15, 0],
                x: [0, 30, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-20 right-10 w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center"
            >
              <Plus size={40} className="text-blue-600" />
            </motion.div>

            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                y: [0, 40, 0]
              }}
              transition={{ 
                duration: 7, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-20 left-10 w-32 h-32 bg-slate-900 rounded-full shadow-2xl flex items-center justify-center"
            >
              <Users size={48} className="text-white" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
