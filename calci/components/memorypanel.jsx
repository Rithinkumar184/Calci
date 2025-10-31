import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database } from 'lucide-react';
import Button from './Button';
import { formatNumber } from '../utils/calculator';
import { slideIn } from '../utils/motion';

const MemoryPanel = ({ memory, onMemoryOperation, onClose }) => {
  const memoryButtons = [
    { label: 'MC', desc: 'Memory Clear' },
    { label: 'MR', desc: 'Memory Recall' },
    { label: 'M+', desc: 'Memory Add' },
    { label: 'M-', desc: 'Memory Subtract' },
    { label: 'MS', desc: 'Memory Store' }
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="bg-slate-800 border-b border-slate-700 shadow-lg"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-400">Memory</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4">
          {/* Memory Value Display */}
          <motion.div
            className="bg-slate-700 rounded-lg p-4 mb-4"
            {...slideIn}
          >
            <div className="text-sm text-slate-400 mb-1">Stored Value</div>
            <div className="text-2xl font-mono text-white">
              {formatNumber(memory)}
            </div>
          </motion.div>

          {/* Memory Operation Buttons */}
          <div className="grid grid-cols-5 gap-2">
            {memoryButtons.map((btn, index) => (
              <div key={btn.label} className="flex flex-col">
                <Button
                  value={btn.label}
                  type="memory"
                  onClick={() => onMemoryOperation(btn.label)}
                  disabled={btn.label === 'MR' && memory === 0}
                />
                <div className="text-xs text-slate-400 text-center mt-1 px-1">
                  {btn.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Memory Status */}
          <div className="mt-4 text-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              memory !== 0
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-400'
            }`}>
              <Database size={14} />
              {memory !== 0 ? 'Memory Active' : 'Memory Empty'}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MemoryPanel;