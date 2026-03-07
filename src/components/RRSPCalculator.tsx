import { useState, useRef, useCallback } from 'react';
import type { Currency } from '../types';
import { formatCurrency, formatAmountDisplay, stripFormatting, calculateWithholdingTax, getWithholdingRate } from '../data/accounts';
import RadioButton from './RadioButton';
import Tooltip from './Tooltip';

interface RRSPCalculatorProps {
  currency: Currency;
  onAmountChange: (grossAmount: number) => void;
}

export default function RRSPCalculator({ currency, onAmountChange }: RRSPCalculatorProps) {
  const [mode, setMode] = useState<'gross' | 'net'>('gross');
  const [grossInput, setGrossInput] = useState('');
  const [netInput, setNetInput] = useState('');
  const lastReported = useRef(0);

  const [focused, setFocused] = useState(false);
  const rawValue = mode === 'gross' ? grossInput : netInput;
  const inputValue = focused ? rawValue : (rawValue ? formatAmountDisplay(rawValue) : '');

  const numericValue = parseFloat(stripFormatting(rawValue)) || 0;

  let grossAmount: number;
  let withholdingTax: number;
  let netAmount: number;

  if (mode === 'gross') {
    grossAmount = numericValue;
    withholdingTax = calculateWithholdingTax(grossAmount);
    netAmount = grossAmount - withholdingTax;
  } else {
    netAmount = numericValue;
    const estGross = netAmount / 0.7;
    const rate = getWithholdingRate(estGross);
    grossAmount = netAmount / (1 - rate / 100);
    withholdingTax = grossAmount - netAmount;
  }

  const rate = getWithholdingRate(grossAmount);

  const reportAmount = useCallback((gross: number) => {
    if (gross !== lastReported.current) {
      lastReported.current = gross;
      onAmountChange(gross);
    }
  }, [onAmountChange]);

  function handleInputChange(val: string) {
    if (mode === 'gross') {
      setGrossInput(val);
      const g = parseFloat(val) || 0;
      const tax = calculateWithholdingTax(g);
      setNetInput((g - tax).toFixed(2));
      reportAmount(g);
    } else {
      setNetInput(val);
      const n = parseFloat(val) || 0;
      const estGross = n / 0.7;
      const r = getWithholdingRate(estGross);
      const g = n / (1 - r / 100);
      setGrossInput(g.toFixed(2));
      reportAmount(g);
    }
  }

  function switchMode(newMode: 'gross' | 'net') {
    setMode(newMode);
  }

  return (
    <div>
      <p className="font-semibold text-base text-qt-primary leading-6 mb-1">Withdrawal calculator</p>
      <p className="text-sm text-qt-secondary leading-[22px] mb-4">
        Calculate your withdrawal based on gross or net amount.
      </p>

      <div className="flex gap-4 mb-4">
        <RadioButton
          name="calc-mode"
          value="gross"
          label="Gross withdrawal amount"
          checked={mode === 'gross'}
          onChange={() => switchMode('gross')}
        />
        <RadioButton
          name="calc-mode"
          value="net"
          label="Net withdrawal amount"
          checked={mode === 'net'}
          onChange={() => switchMode('net')}
        />
      </div>

      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-qt-secondary text-sm">$</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={inputValue}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '' || /^[0-9]*\.?[0-9]*$/.test(v)) {
              handleInputChange(v);
            }
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full h-12 rounded-md border border-qt-gray-dark bg-white pl-8 pr-16 text-sm text-qt-primary placeholder:text-qt-secondary placeholder:italic outline-none focus:border-qt-green"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-qt-secondary">
          {mode === 'gross' ? 'GROSS' : 'NET'} {currency}
        </span>
      </div>

      {numericValue > 0 && (
        <div className="border border-qt-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-2 bg-qt-bg-3 border-b border-qt-border">
            <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary">&nbsp;</p>
            <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary">{currency}</p>
          </div>
          <CalcRow label="Gross Amount" amount={grossAmount} currency={currency} />
          <CalcRow label={`Withholding Tax (${rate}%)`} amount={-withholdingTax} currency={currency} negative tooltip="Questrade must make this tax payment to the CRA on your behalf" />
          <div className="border-t-2 border-qt-border">
            <CalcRow label="Net Withdrawal Amount" amount={netAmount} currency={currency} bold />
          </div>
        </div>
      )}
    </div>
  );
}

function CalcRow({
  label,
  amount,
  currency,
  bold,
  negative,
  tooltip,
}: {
  label: string;
  amount: number;
  currency: Currency;
  bold?: boolean;
  negative?: boolean;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-qt-border last:border-b-0">
      <p className={`text-sm flex items-center gap-1.5 ${bold ? 'font-semibold text-qt-primary' : 'text-qt-secondary'}`}>
        {label}
        {tooltip && <Tooltip content={tooltip} />}
      </p>
      <p className={`text-sm ${bold ? 'font-semibold text-qt-primary' : negative ? 'text-qt-red' : 'text-qt-primary'}`}>
        {negative && amount !== 0 ? '-' : ''}{formatCurrency(Math.abs(amount), currency)}
      </p>
    </div>
  );
}
