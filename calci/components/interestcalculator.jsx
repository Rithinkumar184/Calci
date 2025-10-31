import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Calculator, Copy, Share2, TrendingUp } from 'lucide-react';
import Button from './Button';
import DatePicker from './Datepicker';
import { calculateSimpleInterest, calculateCompoundInterest, calculateDaysBetween, calculateDailyInterestBreakdown } from '../utils/calculator';
import { fadeIn } from '../utils/motion';

const InterestCalculator = () => {
  const [formData, setFormData] = useState({
    principal: '',
    monthlyRate: '',
    annualRate: '',
    calculationType: 'simple',
    timeInputType: 'days',
    days: '',
    startDate: '',
    endDate: '',
    dayCountConvention: 'actual365',
    compoundingFrequency: '12'
  });
  const [calculationMode] = useState('percentage');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [showDailyBreakdown, setShowDailyBreakdown] = useState(false);

  const dayCountConventions = [
    { value: 'actual365', label: 'Actual/365' },
    { value: 'actual360', label: 'Actual/360' },
    { value: '30360', label: '30/360' }
  ];

  const compoundingFrequencies = [
    { value: '1', label: 'Yearly (1)' },
    { value: '2', label: 'Semi-Annual (2)' },
    { value: '4', label: 'Quarterly (4)' },
    { value: '12', label: 'Monthly (12)' },
    { value: '365', label: 'Daily (365)' }
  ];

  useEffect(() => {
    if (formData.timeInputType === 'dates' && formData.startDate && formData.endDate) {
      const days = calculateDaysBetween(formData.startDate, formData.endDate);
      setCalculatedDays(days);
    }
  }, [formData.startDate, formData.endDate, formData.timeInputType]);

  useEffect(() => {
    if (calculationMode === 'percentage' && formData.monthlyRate && !formData.annualRate) {
      const calculatedAnnual = (parseFloat(formData.monthlyRate) * 12).toFixed(2);
      setFormData(prev => ({ ...prev, annualRate: calculatedAnnual }));
    }
  }, [formData.monthlyRate, calculationMode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.principal || parseFloat(formData.principal) <= 0) {
      newErrors.principal = 'Principal must be greater than 0';
    }

    if (calculationMode === 'percentage') {
      if (!formData.monthlyRate && !formData.annualRate) {
        newErrors.rate = 'Either monthly rate or annual rate is required';
      }

      if (formData.monthlyRate && parseFloat(formData.monthlyRate) < 0) {
        newErrors.monthlyRate = 'Monthly rate must be 0 or greater';
      }

      if (formData.annualRate && parseFloat(formData.annualRate) < 0) {
        newErrors.annualRate = 'Annual rate must be 0 or greater';
      }
    }

    if (formData.timeInputType === 'days') {
      if (!formData.days || parseInt(formData.days) <= 0) {
        newErrors.days = 'Days must be greater than 0';
      }
    } else {
      if (!formData.startDate || !formData.endDate) {
        newErrors.dates = 'Both start and end dates are required';
      } else if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.dates = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculate = () => {
    if (!validateForm()) return;

    const principal = parseFloat(formData.principal);

    let days;
    if (formData.timeInputType === 'days') {
      days = parseInt(formData.days);
    } else {
      days = calculateDaysBetween(formData.startDate, formData.endDate);
    }

    const dayCountBase = formData.dayCountConvention === 'actual360' ? 360 :
                        formData.dayCountConvention === '30360' ? 360 : 365;

    const timeInYears = days / dayCountBase;

    let result;
    let dailyBreakdown = [];

    if (calculationMode === 'percentage') {
      let annualRatePercent, monthlyRatePercent;
      if (formData.monthlyRate) {
        monthlyRatePercent = parseFloat(formData.monthlyRate);
        annualRatePercent = monthlyRatePercent * 12;
      } else {
        annualRatePercent = parseFloat(formData.annualRate);
        monthlyRatePercent = annualRatePercent / 12;
      }

      const annualRateDecimal = annualRatePercent / 100;
      const dailyRate = annualRateDecimal / dayCountBase;

      if (formData.calculationType === 'simple') {
        result = calculateSimpleInterest(principal, annualRateDecimal, timeInYears);
        dailyBreakdown = calculateDailyInterestBreakdown(
          principal,
          dailyRate,
          days,
          formData.startDate || new Date().toISOString().split('T')[0],
          'simple'
        );
      } else {
        const frequency = parseInt(formData.compoundingFrequency);
        result = calculateCompoundInterest(principal, annualRateDecimal, timeInYears, frequency);
        dailyBreakdown = calculateDailyInterestBreakdown(
          principal,
          dailyRate,
          days,
          formData.startDate || new Date().toISOString().split('T')[0],
          'compound',
          frequency
        );
      }

      result.annualRate = annualRatePercent.toFixed(2);
      result.monthlyRate = monthlyRatePercent.toFixed(2);
      result.dailyRate = (dailyRate * 100).toFixed(6);
    }

    const exactInterest = Math.round(result.interest);
    const exactTotal = Math.round(result.total);

    setResults({
      ...result,
      days,
      dayCountConvention: formData.dayCountConvention,
      timeInYears: timeInYears.toFixed(6),
      principal: Math.round(principal),
      interest: exactInterest,
      total: exactTotal,
      calculationMode,
      dailyBreakdown
    });
  };

  const formatINR = (amount) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  const copyResults = () => {
    if (!results) return;

    let text = `Interest Calculation Results:\nPrincipal: ${formatINR(results.principal)}\n`;
    if (calculationMode === 'percentage') {
      text += `Annual Rate: ${results.annualRate}%\nMonthly Rate: ${results.monthlyRate}%\nDaily Rate: ${results.dailyRate}%\n`;
    }
    text += `Time: ${results.days} days\nInterest Amount: ${formatINR(results.interest)}\nTotal Amount: ${formatINR(results.total)}`;

    navigator.clipboard.writeText(text);
  };

  const shareResults = () => {
    if (!results) return;

    const text = `Interest: ${formatINR(results.interest)} | Total: ${formatINR(results.total)}`;

    if (navigator.share) {
      navigator.share({
        title: 'Interest Calculation Results',
        text: text
      });
    } else {
      copyResults();
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      <motion.div className="space-y-4" {...fadeIn}>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Principal Amount (₹)
          </label>
          <input
            type="number"
            value={formData.principal}
            onChange={(e) => handleInputChange('principal', e.target.value)}
            className={`w-full p-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${
              errors.principal ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="Enter principal amount"
          />
          {errors.principal && <p className="text-red-400 text-sm mt-1">{errors.principal}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Calculation Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['simple', 'compound'].map((type) => (
              <button
                key={type}
                onClick={() => handleInputChange('calculationType', type)}
                className={`p-3 rounded-lg border transition-colors ${
                  formData.calculationType === type
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {type === 'simple' ? 'Simple Interest' : 'Compound Interest'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Monthly Rate (%) - Optional
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.monthlyRate}
            onChange={(e) => handleInputChange('monthlyRate', e.target.value)}
            className={`w-full p-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${
              errors.monthlyRate ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="Enter monthly interest rate"
          />
          {errors.monthlyRate && <p className="text-red-400 text-sm mt-1">{errors.monthlyRate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Annual Rate (%) - Optional
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.annualRate}
            onChange={(e) => handleInputChange('annualRate', e.target.value)}
            className={`w-full p-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${
              errors.annualRate ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="Enter annual interest rate"
          />
          {errors.annualRate && <p className="text-red-400 text-sm mt-1">{errors.annualRate}</p>}
        </div>
        {errors.rate && <p className="text-red-400 text-sm mt-1">{errors.rate}</p>}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Time Input Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['days', 'dates'].map((type) => (
              <button
                key={type}
                onClick={() => handleInputChange('timeInputType', type)}
                className={`p-3 rounded-lg border transition-colors ${
                  formData.timeInputType === type
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {type === 'days' ? 'Enter Days' : 'Select Dates'}
              </button>
            ))}
          </div>
        </div>

        {formData.timeInputType === 'days' ? (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Number of Days
            </label>
            <input
              type="number"
              value={formData.days}
              onChange={(e) => handleInputChange('days', e.target.value)}
              className={`w-full p-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${
                errors.days ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Enter number of days"
            />
            {errors.days && <p className="text-red-400 text-sm mt-1">{errors.days}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(value) => handleInputChange('startDate', value)}
                error={errors.dates}
              />
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(value) => handleInputChange('endDate', value)}
                error={errors.dates}
              />
            </div>
            {formData.startDate && formData.endDate && calculatedDays > 0 && (
              <div className="bg-slate-700 rounded-lg p-3">
                <p className="text-slate-300 text-sm">
                  Calculated Days: <span className="text-white font-semibold">{calculatedDays} days</span>
                </p>
              </div>
            )}
          </div>
        )}
        {errors.dates && <p className="text-red-400 text-sm mt-1">{errors.dates}</p>}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Day Count Convention
          </label>
          <select
            value={formData.dayCountConvention}
            onChange={(e) => handleInputChange('dayCountConvention', e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            {dayCountConventions.map((convention) => (
              <option key={convention.value} value={convention.value}>
                {convention.label}
              </option>
            ))}
          </select>
        </div>

        {formData.calculationType === 'compound' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Compounding Frequency
            </label>
            <select
              value={formData.compoundingFrequency}
              onChange={(e) => handleInputChange('compoundingFrequency', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              {compoundingFrequencies.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <Button
          onClick={calculate}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <Calculator size={20} />
          Calculate Interest
        </Button>
      </motion.div>

      {results && (
        <motion.div
          className="bg-slate-800 rounded-lg p-6 space-y-4"
          {...fadeIn}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-400">Calculation Results</h3>
            <div className="flex gap-2">
              <button
                onClick={copyResults}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={shareResults}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <p className="text-slate-400">Principal Amount: <span className="text-white font-semibold">{formatINR(results.principal)}</span></p>
              {calculationMode === 'percentage' && (
                <>
                  <p className="text-slate-400">Annual Rate: <span className="text-white font-semibold">{results.annualRate}%</span></p>
                  <p className="text-slate-400">Monthly Rate: <span className="text-white font-semibold">{results.monthlyRate}%</span></p>
                  <p className="text-slate-400">Daily Rate: <span className="text-white font-semibold">{results.dailyRate}%</span></p>
                </>
              )}
              <p className="text-slate-400">Days Used: <span className="text-white font-semibold">{results.days} days ({results.dayCountConvention})</span></p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Interest Amount</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatINR(results.interest)}
                </p>
                {calculationMode === 'percentage' && results.dailyBreakdown && results.dailyBreakdown.length > 0 && (
                  <p className="text-slate-400 text-xs mt-1">
                    Per Day: {formatINR(results.interest / results.days)}
                  </p>
                )}
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Total Amount</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatINR(results.total)}
                </p>
              </div>
            </div>
          </div>

          {formData.calculationType === 'compound' && results.effectiveRate && (
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm">Effective Annual Rate (EAR)</p>
              <p className="text-lg font-semibold text-yellow-400">
                {(results.effectiveRate * 100).toFixed(4)}%
              </p>
            </div>
          )}

          {results.dailyBreakdown && results.dailyBreakdown.length > 0 && (
            <div className="border-t border-slate-700 pt-4">
              <button
                onClick={() => setShowDailyBreakdown(!showDailyBreakdown)}
                className="w-full flex items-center justify-between p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <span className="text-white font-semibold flex items-center gap-2">
                  <TrendingUp size={18} />
                  Daily Interest Breakdown
                </span>
                <span className="text-slate-400">{showDailyBreakdown ? '▼' : '▶'}</span>
              </button>

              {showDailyBreakdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-2 max-h-96 overflow-y-auto"
                >
                  {results.dailyBreakdown.map((day, index) => (
                    <div key={index} className="bg-slate-700 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-semibold">Day {day.day}</p>
                          <p className="text-slate-400 text-xs">{day.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-semibold">{formatINR(day.dailyInterest)}</p>
                          <p className="text-slate-400 text-xs">Cumulative: {formatINR(day.cumulativeInterest)}</p>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-600">
                        <p className="text-slate-300 text-sm">Total Amount: <span className="text-white font-semibold">{formatINR(day.totalAmount)}</span></p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default InterestCalculator;