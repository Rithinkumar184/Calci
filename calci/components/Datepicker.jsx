import React from 'react';
import { Calendar } from 'lucide-react';

const DatePicker = ({ label, value, onChange, error, className = '', ...props }) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full p-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 pr-10 ${
            error ? 'border-red-500' : 'border-slate-600'
          }`}
          {...props}
        />
        <Calendar 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" 
          size={20} 
        />
      </div>
    </div>
  );
};

export default DatePicker;