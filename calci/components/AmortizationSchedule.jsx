import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { fadeIn } from '../utils/motion';

const AmortizationSchedule = ({ schedule }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const filteredSchedule = schedule.filter(payment => 
    payment.paymentNumber.toString().includes(searchTerm) ||
    payment.date.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredSchedule.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredSchedule.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getProgressPercentage = (balance, originalPrincipal) => {
    return ((originalPrincipal - balance) / originalPrincipal) * 100;
  };

  const originalPrincipal = schedule[0]?.balance + schedule[0]?.principal || 0;

  return (
    <motion.div 
      className="bg-slate-800 rounded-lg p-6 space-y-4"
      {...fadeIn}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-blue-400">Amortization Schedule</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm"
            />
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-700 border border-slate-600 rounded-lg text-white text-sm p-2"
          >
            <option value={12}>12 per page</option>
            <option value={24}>24 per page</option>
            <option value={36}>36 per page</option>
            <option value={60}>60 per page</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Total Payments</p>
          <p className="text-lg font-bold text-white">{schedule.length}</p>
        </div>
        <div className="bg-slate-700 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Total Interest</p>
          <p className="text-lg font-bold text-yellow-400">
            {formatCurrency(schedule.reduce((sum, p) => sum + p.interest, 0))}
          </p>
        </div>
        <div className="bg-slate-700 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Total Principal</p>
          <p className="text-lg font-bold text-green-400">
            {formatCurrency(schedule.reduce((sum, p) => sum + p.principal, 0))}
          </p>
        </div>
        <div className="bg-slate-700 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Total Amount</p>
          <p className="text-lg font-bold text-blue-400">
            {formatCurrency(schedule.reduce((sum, p) => sum + p.emi, 0))}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 text-slate-400 font-medium">#</th>
              <th className="text-left p-3 text-slate-400 font-medium">Date</th>
              <th className="text-right p-3 text-slate-400 font-medium">EMI</th>
              <th className="text-right p-3 text-slate-400 font-medium">Interest</th>
              <th className="text-right p-3 text-slate-400 font-medium">Principal</th>
              <th className="text-right p-3 text-slate-400 font-medium">Balance</th>
              <th className="text-center p-3 text-slate-400 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((payment, index) => {
              const progress = getProgressPercentage(payment.balance, originalPrincipal);
              return (
                <motion.tr
                  key={payment.paymentNumber}
                  className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <td className="p-3 text-white font-medium">{payment.paymentNumber}</td>
                  <td className="p-3 text-slate-300">{payment.date}</td>
                  <td className="p-3 text-right text-white font-medium">
                    {formatCurrency(payment.emi)}
                  </td>
                  <td className="p-3 text-right text-yellow-400">
                    {formatCurrency(payment.interest)}
                  </td>
                  <td className="p-3 text-right text-green-400">
                    {formatCurrency(payment.principal)}
                  </td>
                  <td className="p-3 text-right text-blue-400 font-medium">
                    {formatCurrency(payment.balance)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <span className="ml-2 text-xs text-slate-400">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredSchedule.length)} of {filteredSchedule.length} payments
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AmortizationSchedule;