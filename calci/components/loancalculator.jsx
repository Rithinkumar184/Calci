import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Download, Copy, Share2, FileText } from 'lucide-react';
import Button from './Button';
import DatePicker from './Datepicker';
import AmortizationSchedule from './AmortizationSchedule';
import { calculateEMI, generateAmortizationSchedule, calculateMonthsBetween } from '../utils/calculator';
import { fadeIn } from '../utils/motion';

const LoanCalculator = () => {
  const [formData, setFormData] = useState({
    principal: '',
    rate: '',
    tenureType: 'years',
    years: '',
    months: '',
    startDate: '',
    endDate: '',
    paymentFrequency: 'monthly',
    loanStartDate: '',
    prepaymentType: 'none',
    oneTimePrepayment: '',
    prepaymentDate: '',
    monthlyExtraPayment: '',
    balloonPayment: ''
  });

  const [results, setResults] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSchedule, setShowSchedule] = useState(false);

  const paymentFrequencies = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Biweekly' }
  ];

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
    
    if (!formData.rate || parseFloat(formData.rate) < 0) {
      newErrors.rate = 'Rate must be 0 or greater';
    }
    
    if (formData.tenureType === 'years') {
      if (!formData.years || parseFloat(formData.years) <= 0) {
        newErrors.years = 'Years must be greater than 0';
      }
    } else {
      if (!formData.startDate || !formData.endDate) {
        newErrors.dates = 'Both start and end dates are required';
      } else if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.dates = 'End date must be after start date';
      }
    }
    
    if (formData.prepaymentType === 'onetime') {
      if (!formData.oneTimePrepayment || parseFloat(formData.oneTimePrepayment) <= 0) {
        newErrors.oneTimePrepayment = 'One-time prepayment must be greater than 0';
      }
      if (!formData.prepaymentDate) {
        newErrors.prepaymentDate = 'Prepayment date is required';
      }
    }
    
    if (formData.prepaymentType === 'monthly') {
      if (!formData.monthlyExtraPayment || parseFloat(formData.monthlyExtraPayment) <= 0) {
        newErrors.monthlyExtraPayment = 'Monthly extra payment must be greater than 0';
      }
    }
    
    if (formData.prepaymentType === 'balloon') {
      if (!formData.balloonPayment || parseFloat(formData.balloonPayment) <= 0) {
        newErrors.balloonPayment = 'Balloon payment must be greater than 0';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculate = () => {
    if (!validateForm()) return;
    
    const principal = parseFloat(formData.principal);
    const annualRate = parseFloat(formData.rate) / 100;
    
    let totalMonths;
    if (formData.tenureType === 'years') {
      totalMonths = parseFloat(formData.years) * 12 + (parseFloat(formData.months) || 0);
    } else {
      totalMonths = calculateMonthsBetween(formData.startDate, formData.endDate);
    }
    
    const monthlyRate = annualRate / 12;
    const emi = calculateEMI(principal, monthlyRate, totalMonths);
    
    const prepaymentOptions = {
      type: formData.prepaymentType,
      oneTime: formData.prepaymentType === 'onetime' ? {
        amount: parseFloat(formData.oneTimePrepayment),
        date: formData.prepaymentDate
      } : null,
      monthly: formData.prepaymentType === 'monthly' ? parseFloat(formData.monthlyExtraPayment) : 0,
      balloon: formData.prepaymentType === 'balloon' ? parseFloat(formData.balloonPayment) : 0
    };
    
    const amortizationData = generateAmortizationSchedule(
      principal,
      monthlyRate,
      totalMonths,
      emi,
      formData.loanStartDate || new Date().toISOString().split('T')[0],
      prepaymentOptions
    );
    
    const totalPayment = amortizationData.schedule.reduce((sum, payment) => sum + payment.emi, 0);
    const totalInterest = totalPayment - principal;
    
    const payoffDate = new Date(formData.loanStartDate || new Date());
    payoffDate.setMonth(payoffDate.getMonth() + amortizationData.actualMonths);
    
    setResults({
      emi: parseFloat(emi.toFixed(2)),
      totalPayment: parseFloat(totalPayment.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      totalMonths: amortizationData.actualMonths,
      payoffDate: payoffDate.toLocaleDateString(),
      principal,
      rate: formData.rate
    });
    
    setSchedule(amortizationData.schedule);
  };

  const exportToCSV = () => {
    if (!schedule) return;
    
    const headers = ['Payment #', 'Date', 'EMI', 'Interest', 'Principal', 'Balance'];
    const csvContent = [
      headers.join(','),
      ...schedule.map(payment => [
        payment.paymentNumber,
        payment.date,
        payment.emi.toFixed(2),
        payment.interest.toFixed(2),
        payment.principal.toFixed(2),
        payment.balance.toFixed(2)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'amortization_schedule.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const copyResults = () => {
    if (!results) return;
    
    const text = `Loan Calculation Results:
Principal: $${results.principal.toLocaleString()}
Rate: ${results.rate}%
EMI: $${results.emi.toLocaleString()}
Total Payment: $${results.totalPayment.toLocaleString()}
Total Interest: $${results.totalInterest.toLocaleString()}
Payoff Date: ${results.payoffDate}`;
    
    navigator.clipboard.writeText(text);
  };

  const shareResults = () => {
    if (!results) return;
    
    const text = `EMI: $${results.emi.toLocaleString()} | Total Interest: $${results.totalInterest.toLocaleString()}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Loan Calculation Results',
        text: text
      });
    } else {
      copyResults();
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Input Form */}
      <motion.div className="space-y-4" {...fadeIn}>
        {/* Principal */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Loan Amount (Principal)
          </label>
          <input
            type="number"
            value={formData.principal}
            onChange={(e) => handleInputChange('principal', e.target.value)}
            className={`w-full p-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${
              errors.principal ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="Enter loan amount"
          />
          {errors.principal && <p className="text-red-400 text-sm mt-1">{errors.principal}</p>}
        </div>

        {/* Rate */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Annual Interest Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.rate}
            onChange={(e) => handleInputChange('rate', e.target.value)}
            className={`w-full p-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${
              errors.rate ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="Enter annual interest rate"
          />
          {errors.rate && <p className="text-red-400 text-sm mt-1">{errors.rate}</p>}
        </div>

        {/* Tenure Type */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tenure Input Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['years', 'dates'].map((type) => (
              <button
                key={type}
                onClick={() => handleInputChange('tenureType', type)}
                className={`p-3 rounded-lg border transition-colors ${
                  formData.tenureType === type
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {type === 'years' ? 'Years & Months' : 'Start & End Dates'}
              </button>
            ))}
          </div>
        </div>

        {/* Tenure Input */}
        {formData.tenureType === 'years' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Years
              </label>
              <input
                type="number"
                value={formData.years}
                onChange={(e) => handleInputChange('years', e.target.value)}
                className={`w-full p-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${
                  errors.years ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="Years"
              />
              {errors.years && <p className="text-red-400 text-sm mt-1">{errors.years}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Months (Optional)
              </label>
              <input
                type="number"
                min="0"
                max="11"
                value={formData.months}
                onChange={(e) => handleInputChange('months', e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                placeholder="Months"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label="Loan Start Date"
              value={formData.startDate}
              onChange={(value) => handleInputChange('startDate', value)}
              error={errors.dates}
            />
            <DatePicker
              label="Loan End Date"
              value={formData.endDate}
              onChange={(value) => handleInputChange('endDate', value)}
              error={errors.dates}
            />
          </div>
        )}
        {errors.dates && <p className="text-red-400 text-sm mt-1">{errors.dates}</p>}

        {/* Loan Start Date */}
        <DatePicker
          label="Loan Start Date (Optional)"
          value={formData.loanStartDate}
          onChange={(value) => handleInputChange('loanStartDate', value)}
        />

        {/* Payment Frequency */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Payment Frequency
          </label>
          <select
            value={formData.paymentFrequency}
            onChange={(e) => handleInputChange('paymentFrequency', e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            {paymentFrequencies.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
        </div>

        {/* Prepayment Options */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Prepayment Options
          </label>
          <select
            value={formData.prepaymentType}
            onChange={(e) => handleInputChange('prepaymentType', e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="none">No Prepayment</option>
            <option value="onetime">One-time Prepayment</option>
            <option value="monthly">Monthly Extra Payment</option>
            <option value="balloon">Balloon Payment at End</option>
          </select>
        </div>

        {/* Prepayment Details */}
        {formData.prepaymentType === 'onetime' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Prepayment Amount
              </label>
              <input
                type="number"
                value={formData.oneTimePrepayment}
                onChange={(e) => handleInputChange('oneTimePrepayment', e.target.value)}
                className={`w-full p-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${
                  errors.oneTimePrepayment ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="Amount"
              />
              {errors.oneTimePrepayment && <p className="text-red-400 text-sm mt-1">{errors.oneTimePrepayment}</p>}
            </div>
            <DatePicker
              label="Prepayment Date"
              value={formData.prepaymentDate}
              onChange={(value) => handleInputChange('prepaymentDate', value)}
              error={errors.prepaymentDate}
            />
          </div>
        )}

        {formData.prepaymentType === 'monthly' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Monthly Extra Payment
            </label>
            <input
              type="number"
              value={formData.monthlyExtraPayment}
              onChange={(e) => handleInputChange('monthlyExtraPayment', e.target.value)}
              className={`w-full p-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${
                errors.monthlyExtraPayment ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Extra payment amount per month"
            />
            {errors.monthlyExtraPayment && <p className="text-red-400 text-sm mt-1">{errors.monthlyExtraPayment}</p>}
          </div>
        )}

        {formData.prepaymentType === 'balloon' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Balloon Payment Amount
            </label>
            <input
              type="number"
              value={formData.balloonPayment}
              onChange={(e) => handleInputChange('balloonPayment', e.target.value)}
              className={`w-full p-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 ${
                errors.balloonPayment ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Balloon payment amount"
            />
            {errors.balloonPayment && <p className="text-red-400 text-sm mt-1">{errors.balloonPayment}</p>}
          </div>
        )}

        {/* Calculate Button */}
        <Button
          onClick={calculate}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <Calculator size={20} />
          Calculate EMI
        </Button>
      </motion.div>

      {/* Results */}
      {results && (
        <motion.div 
          className="bg-slate-800 rounded-lg p-6 space-y-4"
          {...fadeIn}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-400">Loan Calculation Results</h3>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm">Monthly EMI</p>
              <p className="text-2xl font-bold text-green-400">
                ${results.emi.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm">Total Payment</p>
              <p className="text-2xl font-bold text-blue-400">
                ${results.totalPayment.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm">Total Interest</p>
              <p className="text-2xl font-bold text-yellow-400">
                ${results.totalInterest.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-slate-400">Loan Amount: <span className="text-white">${results.principal.toLocaleString()}</span></p>
              <p className="text-slate-400">Interest Rate: <span className="text-white">{results.rate}%</span></p>
            </div>
            <div className="space-y-2">
              <p className="text-slate-400">Total Payments: <span className="text-white">{results.totalMonths}</span></p>
              <p className="text-slate-400">Payoff Date: <span className="text-white">{results.payoffDate}</span></p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setShowSchedule(!showSchedule)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              {showSchedule ? 'Hide' : 'Show'} Amortization Schedule
            </Button>
            {schedule && (
              <button
                onClick={exportToCSV}
                className="p-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
              >
                <Download size={20} />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Amortization Schedule */}
      {showSchedule && schedule && (
        <AmortizationSchedule schedule={schedule} />
      )}
    </div>
  );
};

export default LoanCalculator;