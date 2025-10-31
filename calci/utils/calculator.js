export const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const calculateMonthsBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  return yearDiff * 12 + monthDiff;
};

export const calculateSimpleInterest = (principal, rate, timeInYears) => {
  const interest = principal * rate * timeInYears;
  const total = principal + interest;

  return {
    interest,
    total,
    principal
  };
};

export const calculateCompoundInterest = (principal, rate, timeInYears, compoundingFrequency) => {
  const amount = principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * timeInYears);
  const interest = amount - principal;
  const effectiveRate = Math.pow(1 + rate / compoundingFrequency, compoundingFrequency) - 1;

  return {
    interest,
    total: amount,
    principal,
    effectiveRate
  };
};

export const calculateDailyInterestBreakdown = (principal, dailyRate, totalDays, startDate, calculationType = 'simple', compoundingFrequency = 365) => {
  const breakdown = [];
  let currentDate = new Date(startDate);
  let cumulativeInterest = 0;
  let currentPrincipal = principal;

  for (let day = 1; day <= totalDays; day++) {
    let dailyInterest;

    if (calculationType === 'simple') {
      dailyInterest = principal * dailyRate;
    } else if (calculationType === 'compound') {
      dailyInterest = currentPrincipal * dailyRate;
      currentPrincipal += dailyInterest;
    }

    cumulativeInterest += dailyInterest;

    breakdown.push({
      day,
      date: currentDate.toLocaleDateString('en-IN'),
      dailyInterest: Math.round(dailyInterest),
      cumulativeInterest: Math.round(cumulativeInterest),
      totalAmount: Math.round(principal + cumulativeInterest),
      principal: Math.round(currentPrincipal)
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return breakdown;
};

export const calculateEMI = (principal, monthlyRate, totalMonths) => {
  if (monthlyRate === 0) {
    return principal / totalMonths;
  }

  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) /
              (Math.pow(1 + monthlyRate, totalMonths) - 1);

  return emi;
};

export const generateAmortizationSchedule = (principal, monthlyRate, totalMonths, emi, startDate, prepaymentOptions = {}) => {
  const schedule = [];
  let remainingBalance = principal;
  let currentDate = new Date(startDate);
  let paymentNumber = 1;
  let actualMonths = 0;

  while (remainingBalance > 0.01 && actualMonths < totalMonths * 2) {
    const interestPayment = remainingBalance * monthlyRate;
    let principalPayment = emi - interestPayment;
    let currentEMI = emi;

    let extraPayment = 0;

    if (prepaymentOptions.type === 'monthly' && prepaymentOptions.monthly > 0) {
      extraPayment += prepaymentOptions.monthly;
    }

    if (prepaymentOptions.type === 'onetime' && prepaymentOptions.oneTime) {
      const prepaymentDate = new Date(prepaymentOptions.oneTime.date);
      const currentDateStr = currentDate.toISOString().split('T')[0];
      const prepaymentDateStr = prepaymentDate.toISOString().split('T')[0];

      if (currentDateStr === prepaymentDateStr) {
        extraPayment += prepaymentOptions.oneTime.amount;
      }
    }

    if (prepaymentOptions.type === 'balloon' && prepaymentOptions.balloon > 0) {
      if (actualMonths === totalMonths - 1) {
        extraPayment += prepaymentOptions.balloon;
      }
    }

    principalPayment += extraPayment;
    currentEMI += extraPayment;

    if (principalPayment > remainingBalance) {
      principalPayment = remainingBalance;
      currentEMI = interestPayment + principalPayment;
    }

    remainingBalance -= principalPayment;

    schedule.push({
      paymentNumber,
      date: currentDate.toLocaleDateString(),
      emi: Math.round(currentEMI),
      interest: Math.round(interestPayment),
      principal: Math.round(principalPayment),
      balance: Math.max(0, Math.round(remainingBalance))
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
    paymentNumber++;
    actualMonths++;

    if (remainingBalance < 0.01) {
      break;
    }
  }

  return {
    schedule,
    actualMonths
  };
};

export const formatCurrency = (amount, symbol = '₹', decimals = 0) => {
  return `${symbol}${Math.round(amount).toLocaleString('en-IN')}`;
};

export const formatPercentage = (rate, decimals = 2) => {
  return `${(rate * 100).toFixed(decimals)}%`;
};

export const roundToDecimals = (number, decimals = 0) => {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const validatePositiveNumber = (value, fieldName) => {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
};

export const validateNonNegativeNumber = (value, fieldName) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) {
    return `${fieldName} must be zero or positive`;
  }
  return null;
};

export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return 'Both start and end dates are required';
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    return 'End date must be after start date';
  }

  return null;
};

export const applyDayCountConvention = (days, convention) => {
  switch (convention) {
    case 'actual360':
      return days / 360;
    case '30360':
      return days / 360;
    case 'actual365':
    default:
      return days / 365;
  }
};

export const exportToCSV = (data, filename = 'export.csv') => {
  const csvContent = data.map(row =>
    Object.values(row).map(value =>
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  ).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

export const add = (a, b) => {
  const result = a + b;
  return Math.round(result * 100000000) / 100000000;
}

export const subtract = (a, b) => {
  const result = a - b;
  return Math.round(result * 100000000) / 100000000;
}

export const multiply = (a, b) => {
  const result = a * b;
  return Math.round(result * 100000000) / 100000000;
}

export const divide = (a, b) => {
  if (b === 0) return 0;
  const result = a / b;
  return Math.round(result * 100000000) / 100000000;
};

export const percentage = (a, b) => {
  const result = (a * b) / 100;
  return Math.round(result * 100000000) / 100000000;
};

export const power = (a, b) => Math.pow(a, b);
export const sqrt = (a) => Math.sqrt(a);
export const factorial = (n) => {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
};

export const sin = (x) => Math.sin(x);
export const cos = (x) => Math.cos(x);
export const tan = (x) => Math.tan(x);
export const log = (x) => Math.log10(x);
export const ln = (x) => Math.log(x);
export const exp = (x) => Math.exp(x);
export const asin = (x) => Math.asin(x);
export const acos = (x) => Math.acos(x);
export const atan = (x) => Math.atan(x);

export class MemoryCalculator {
  constructor() {
    this.memory = 0;
  }

  memoryAdd(value) {
    this.memory += parseFloat(value) || 0;
    return this.memory;
  }

  memorySubtract(value) {
    this.memory -= parseFloat(value) || 0;
    return this.memory;
  }

  memoryRecall() {
    return this.memory;
  }

  memoryClear() {
    this.memory = 0;
    return this.memory;
  }

  memoryStore(value) {
    this.memory = parseFloat(value) || 0;
    return this.memory;
  }
}