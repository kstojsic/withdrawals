import { useState, useRef, useCallback } from 'react';
import type { Currency } from '../types';
import {
  formatCurrency,
  formatAmountDisplay,
  stripFormatting,
  calculateWithholdingTax,
  getWithholdingRate,
  grossFromNet,
} from '../data/accounts';
import RadioButton from './RadioButton';
import Tooltip from './Tooltip';

function withdrawalCurrencyPrefix(currency: Currency): string {
  return currency === 'USD' ? 'US$' : 'CA$';
}

interface RRSPCalculatorProps {
  currency: Currency;
  onAmountChange: (grossAmount: number) => void;
  /** Tighter layout for mobile wizard (single screen) */
  compact?: boolean;
}

export default function RRSPCalculator({ currency, onAmountChange, compact = false }: RRSPCalculatorProps) {
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
    grossAmount = grossFromNet(netAmount);
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
      const g = grossFromNet(n);
      setGrossInput(g.toFixed(2));
      reportAmount(g);
    }
  }

  function switchMode(newMode: 'gross' | 'net') {
    setMode(newMode);
  }

  if (compact) {
    return (
      <div className="min-h-0 w-full max-w-[357px]">
        <div className="overflow-hidden rounded-2xl border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] px-4 py-4">
          <p className="text-sm font-medium text-qt-secondary">Withdrawal calculator</p>
          <div className="mt-3 flex overflow-hidden rounded-[length:var(--ads-border-radius-m)] border border-solid border-[var(--ads-color-secondary-400)]">
            <button
              type="button"
              onClick={() => switchMode('gross')}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                mode === 'gross'
                  ? 'bg-qt-bg-3 text-qt-primary'
                  : 'bg-[var(--ads-color-elevation-overlay)] text-qt-secondary'
              }`}
            >
              Gross
            </button>
            <button
              type="button"
              onClick={() => switchMode('net')}
              className={`flex-1 border-l border-solid border-[var(--ads-color-secondary-400)] py-2.5 text-xs font-semibold transition-colors ${
                mode === 'net'
                  ? 'bg-qt-bg-3 text-qt-primary'
                  : 'bg-[var(--ads-color-elevation-overlay)] text-qt-secondary'
              }`}
            >
              Net
            </button>
          </div>
          <div
            className={`mt-3 flex min-h-[48px] items-center gap-2 rounded-[length:var(--ads-border-radius-m)] border border-solid bg-[var(--ads-color-elevation-overlay)] px-3 transition-colors ${
              focused ? 'border-qt-green' : 'border-[var(--ads-color-secondary-400)]'
            }`}
          >
            <span className="text-base font-medium text-qt-secondary tabular-nums" aria-hidden>
              {withdrawalCurrencyPrefix(currency)}
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
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
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[18px] font-semibold leading-6 text-qt-primary outline-none placeholder:italic placeholder:text-qt-border tabular-nums"
            />
            <span className="shrink-0 text-[10px] font-semibold tracking-wide text-qt-secondary">
              {mode === 'gross' ? 'GROSS' : 'NET'} {currency}
            </span>
          </div>
          {numericValue > 0 && (
            <>
              <div className="my-3 h-px w-full bg-figma-neutral-100" aria-hidden />
              <div className="flex flex-col gap-2 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-qt-secondary">Gross</span>
                  <span className="font-semibold tabular-nums text-qt-primary">
                    {formatCurrency(grossAmount, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1 font-medium text-qt-secondary">
                    <span>Tax ({rate}%)</span>
                    <Tooltip content="Questrade must make this tax payment to the CRA on your behalf" />
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-qt-red">
                    -{formatCurrency(Math.abs(withholdingTax), currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-figma-neutral-100 pt-2">
                  <span className="text-sm font-bold text-qt-primary">Net</span>
                  <span className="text-sm font-bold tabular-nums text-qt-primary">
                    {formatCurrency(netAmount, currency)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
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
  compact,
}: {
  label: string;
  amount: number;
  currency: Currency;
  bold?: boolean;
  negative?: boolean;
  tooltip?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center justify-between px-2 py-1 border-b border-qt-border last:border-b-0">
        <p className={`text-[11px] flex items-center gap-1 min-w-0 ${bold ? 'font-semibold text-qt-primary' : 'text-qt-secondary'}`}>
          <span className="truncate">{label}</span>
          {tooltip && <Tooltip content={tooltip} />}
        </p>
        <p className={`text-[11px] font-medium tabular-nums shrink-0 ml-1 ${bold ? 'font-semibold text-qt-primary' : negative ? 'text-qt-red' : 'text-qt-primary'}`}>
          {negative && amount !== 0 ? '-' : ''}{formatCurrency(Math.abs(amount), currency)}
        </p>
      </div>
    );
  }
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
