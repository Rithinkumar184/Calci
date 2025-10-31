import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BasicCalculator from './Basiccalculator';
import { Calculator as CalcIcon, DollarSign, Percent, Grid3x3, History, Menu } from 'lucide-react';
import InterestCalculator from './interestcalculator';
import LoanCalculator from './loancalculator';
import HistoryPanel from './Historypanel';
import { slideIn, fadeIn } from '../utils/motion';

const Calculator = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [showMenu, setShowMenu] = useState(false);

  const tabs = [
    { id: 'interest', label: 'Interest Calculator', icon: Percent },
    { id: 'loan', label: 'Loan Calculator', icon: DollarSign },
    { id: 'basic', label: 'Basic Calculator', icon: Grid3x3 },
    { id: 'history', label: 'History', icon: History }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white font-inter">
      {/* Header with Hamburger Menu */}
      <motion.div
        className="flex items-center justify-between p-4 bg-slate-800 shadow-lg border-b border-slate-700"
        {...slideIn}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            <Menu className="text-blue-400" size={24} />
          </button>
          <CalcIcon className="text-blue-400" size={24} />
          <h1 className="text-xl font-bold text-blue-400">DL Calculator</h1>
        </div>
      </motion.div>

      {/* Dropdown Menu */}
      {showMenu && (
        <motion.div
          className="absolute top-16 left-4 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50 overflow-hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowMenu(false);
                }}
                className={`w-full flex items-center gap-3 p-4 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        className="flex-1 overflow-auto"
        {...fadeIn}
        transition={{ delay: 0.2 }}
      >
        {activeTab === 'interest' && <InterestCalculator />}
        {activeTab === 'loan' && <LoanCalculator />}
        {activeTab === 'basic' && <BasicCalculator />}
        {activeTab === 'history' && <HistoryPanel history={[]} onClose={() => setActiveTab('basic')} onClear={() => {}} onSelectCalculation={() => {}} />}
      </motion.div>
    </div>
  );
};

export default Calculator;