import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';
import { slideIn } from '../utils/motion';

const ScientificPanel = ({ onFunction, onClose }) => {
  const scientificButtons = [
    ['sin', 'cos', 'tan', 'asin'],
    ['acos', 'atan', 'log', 'ln'],
    ['√', 'x²', '1/x', 'π'],
    ['e', '(', ')', 'x^y']
  ];

  const handleFunction = (func) => {
    if (func === '√') {
      onFunction('sqrt');
    } else if (func === 'x²') {
      onFunction('square');
    } else if (func === '1/x') {
      onFunction('inverse');
    } else if (func === 'π') {
      onFunction('pi');
    } else if (func === 'x^y') {
      onFunction('power');
    } else {
      onFunction(func);
    }
  };

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
          <h3 className="text-lg font-semibold text-blue-400">Scientific Functions</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4">
          <div className="grid gap-3">
            {scientificButtons.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-4 gap-3">
                {row.map((btn, colIndex) => (
                  <Button
                    key={`${rowIndex}-${colIndex}`}
                    value={btn}
                    type="scientific"
                    onClick={() => handleFunction(btn)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScientificPanel;