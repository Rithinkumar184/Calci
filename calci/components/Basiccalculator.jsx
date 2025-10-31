import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Delete, RotateCcw, Calculator as CalcIcon } from 'lucide-react';
import Button from './Button';
import ScientificPanel from './ScientificPanel';
import { add, subtract, multiply, divide, sin, cos, tan, asin, acos, atan, sqrt, power } from '../utils/calculator';
import { MemoryCalculator } from '../utils/calculator';
import { fadeIn, slideUp, staggerContainer, staggerItem } from '../utils/motion';

const BasicCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [error, setError] = useState(null);
  const [memory, setMemory] = useState(new MemoryCalculator());
  const [memoryValue, setMemoryValue] = useState(0);
  const [history, setHistory] = useState([]);
  const [showScientific, setShowScientific] = useState(false);

  const handleNumberClick = (num) => {
    if (error) setError(null);

    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const handleDecimalClick = () => {
    if (error) setError(null);

    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const performOperation = (prevValue, currValue, op) => {
    const a = parseFloat(prevValue);
    const b = parseFloat(currValue);

    if (isNaN(a) || isNaN(b)) return 0;

    let result;
    switch (op) {
      case '+':
        result = add(a, b);
        break;
      case '-':
        result = subtract(a, b);
        break;
      case '×':
        result = multiply(a, b);
        break;
      case '÷':
        if (b === 0) {
          setError('Cannot divide by zero');
          return 0;
        }
        result = divide(a, b);
        break;
      default:
        result = b;
    }

    return result;
  };

  const handleOperationClick = (nextOperation) => {
    if (error) setError(null);

    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const newValue = performOperation(previousValue, inputValue, operation);
      if (!error) {
        setDisplay(String(newValue))
        setPreviousValue(newValue);
      } else {
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(false);
        return;
      }
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const handleEqualsClick = () => {
    if (error) setError(null);

    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = performOperation(previousValue, inputValue, operation);
      if (!error) {
        const calculation = {
          expression: `${previousValue} ${operation} ${inputValue} = ${newValue}`,
          timestamp: Date.now()
        };
        setHistory(prev => [calculation, ...prev]);
        setDisplay(String(newValue))
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(true);
      }
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setError(null);
  };

  const handleBackspace = () => {
    if (error) {
      setError(null);
      setDisplay('0');
      return;
    }

    if (!waitingForOperand && display !== '0') {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay === '' || newDisplay === '-' ? '0' : newDisplay);
    }
  };

  const handlePercentage = () => {
    if (error) setError(null);
    const currentValue = parseFloat(display);
    if (previousValue !== null && operation) {
      const percentValue = (previousValue * currentValue) / 100;
      setDisplay(String(percentValue));
      setWaitingForOperand(true);
    } else {
      const percentValue = currentValue / 100;
      setDisplay(String(percentValue));
    }
  };

  const handleMemoryAdd = () => {
    const value = parseFloat(display);
    const newMemory = memory.memoryAdd(value);
    setMemoryValue(newMemory);
  };

  const handleMemorySubtract = () => {
    const value = parseFloat(display);
    const newMemory = memory.memorySubtract(value);
    setMemoryValue(newMemory);
  };

  const handleMemoryRecall = () => {
    const value = memory.memoryRecall();
    setDisplay(String(value));
    setWaitingForOperand(true);
  };

  const handleMemoryClear = () => {
    memory.memoryClear();
    setMemoryValue(0);
  };

  const handleMemoryStore = () => {
    const value = parseFloat(display);
    memory.memoryStore(value);
    setMemoryValue(value);
  };

  const handleScientificFunction = (func) => {
    if (error) setError(null);

    const currentValue = parseFloat(display);
    let result;

    switch (func) {
      case 'sin':
        result = sin(currentValue);
        break;
      case 'cos':
        result = cos(currentValue);
        break;
      case 'tan':
        result = tan(currentValue);
        break;
      case 'asin':
        result = asin(currentValue);
        break;
      case 'acos':
        result = acos(currentValue);
        break;
      case 'atan':
        result = atan(currentValue);
        break;
      case 'sqrt':
        result = sqrt(currentValue);
        break;
      case 'square':
        result = power(currentValue, 2);
        break;
      case 'inverse':
        if (currentValue === 0) {
          setError('Cannot divide by zero');
          return;
        }
        result = 1 / currentValue;
        break;
      case 'pi':
        result = Math.PI;
        break;
      case 'e':
        result = Math.E;
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const buttons = [
    { label: 'MC', type: 'memory', action: handleMemoryClear, variant: 'secondary' },
    { label: 'MR', type: 'memory', action: handleMemoryRecall, variant: 'secondary' },
    { label: 'M+', type: 'memory', action: handleMemoryAdd, variant: 'secondary' },
    { label: 'M-', type: 'memory', action: handleMemorySubtract, variant: 'secondary' },
    { label: 'MS', type: 'memory', action: handleMemoryStore, variant: 'secondary' },
    { label: 'C', type: 'function', action: handleClear, variant: 'danger' },
    { label: '←', type: 'function', action: handleBackspace, variant: 'secondary', icon: Delete },
    { label: '÷', type: 'operation', action: () => handleOperationClick('÷'), variant: 'warning' },
    { label: '%', type: 'function', action: handlePercentage, variant: 'secondary' },
    { label: '7', type: 'number', action: () => handleNumberClick('7') },
    { label: '8', type: 'number', action: () => handleNumberClick('8') },
    { label: '9', type: 'number', action: () => handleNumberClick('9') },
    { label: '×', type: 'operation', action: () => handleOperationClick('×'), variant: 'warning' },
    { label: '4', type: 'number', action: () => handleNumberClick('4') },
    { label: '5', type: 'number', action: () => handleNumberClick('5') },
    { label: '6', type: 'number', action: () => handleNumberClick('6') },
    { label: '-', type: 'operation', action: () => handleOperationClick('-'), variant: 'warning' },
    { label: '1', type: 'number', action: () => handleNumberClick('1') },
    { label: '2', type: 'number', action: () => handleNumberClick('2') },
    { label: '3', type: 'number', action: () => handleNumberClick('3') },
    { label: '+', type: 'operation', action: () => handleOperationClick('+'), variant: 'warning' },
    { label: '0', type: 'number', action: () => handleNumberClick('0'), span: 2 },
    { label: '.', type: 'decimal', action: handleDecimalClick },
    { label: '=', type: 'equals', action: handleEqualsClick, variant: 'success' }
  ];

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4"
      {...fadeIn}
    >
      <motion.div
        className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        {...slideUp}
        transition={{ delay: 0.1 }}
      >
        {/* Scientific Panel Toggle */}
        <div className="p-4 bg-slate-700 border-b border-slate-600">
          <button
            onClick={() => setShowScientific(!showScientific)}
            className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <CalcIcon size={20} />
            <span className="font-medium">
              {showScientific ? 'Hide' : 'Show'} Scientific Functions
            </span>
          </button>
        </div>

        {/* Scientific Panel */}
        {showScientific && (
          <ScientificPanel
            onFunction={handleScientificFunction}
            onClose={() => setShowScientific(false)}
          />
        )}

        <div className="p-6">
          {/* Display */}
          <motion.div
            className="bg-slate-900 rounded-xl p-6 mb-6 border-2 border-slate-700"
            {...fadeIn}
            transition={{ delay: 0.2 }}
          >
            <div className="text-right">
              {operation && previousValue !== null && !error && (
                <div className="text-slate-400 text-sm mb-2">
                  {previousValue} {operation}
                </div>
              )}
              {error ? (
                <div className="text-red-500 text-2xl font-bold font-inter">
                  {error}
                </div>
              ) : (
                <>
                  {memoryValue !== 0 && (
                    <div className="text-slate-500 text-xs mb-1">
                      Memory: {memoryValue}
                    </div>
                  )}
                  <div className="text-white text-4xl font-bold font-inter break-all">
                    {display}
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Buttons Grid */}
          <motion.div
            className="grid grid-cols-4 gap-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {buttons.map((button, index) => {
              const Icon = button.icon;
              return (
                <motion.div
                  key={`${button.label}-${index}`}
                  className={button.span === 2 ? 'col-span-2' : ''}
                  variants={staggerItem}
                >
                  <Button
                    onClick={button.action}
                    variant={button.variant || 'outline'}
                    size="lg"
                    className="w-full h-16 text-xl font-bold"
                  >
                    {Icon ? <Icon size={24} /> : button.label}
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Clear All Button */}
          <motion.div
            className="mt-4"
            {...fadeIn}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={handleClear}
              variant="danger"
              size="md"
              className="w-full flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              Clear All
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BasicCalculator;