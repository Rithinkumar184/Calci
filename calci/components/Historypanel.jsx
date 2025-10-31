import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Clock } from 'lucide-react';
import { slideIn } from '../utils/motion';

const HistoryPanel = ({ history = [], onClose, onClear, onSelectCalculation }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor((now - date) / (1000 * 60));
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="bg-slate-800 border-b border-slate-700 max-h-80 overflow-hidden shadow-lg"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-400">History</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClear}
              className="p-2 rounded-lg bg-slate-700 hover:bg-red-600 transition-colors"
              disabled={history.length === 0}
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p>No calculations yet</p>
              <p className="text-sm mt-1">Your calculation history will appear here</p>
            </div>
          ) : (
            <div className="p-2">
              {history.map((calculation, index) => (
                <motion.div
                  key={index}
                  className="p-3 mb-2 bg-slate-700 rounded-lg hover:bg-slate-600 cursor-pointer transition-colors"
                  onClick={() => onSelectCalculation(calculation)}
                  {...slideIn}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="text-sm font-mono text-white">
                    {calculation.expression}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {formatTimestamp(calculation.timestamp)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HistoryPanel;