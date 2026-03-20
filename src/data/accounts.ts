import type { Account, BalanceInfo, Currency, LinkedBank } from '../types';

export const FX_RATE = 1.36;
export const FX_BUFFER = 0.0225;

export const accounts: Account[] = [
  {
    id: '1',
    type: 'TFSA',
    label: 'Self-directed TFSA',
    accountNumber: '26958734',
    balance: { cad: 45230.50, usd: 12840.25 },
    currency: 'CAD',
  },
  {
    id: '2',
    type: 'CASH',
    label: 'Self-directed Cash',
    accountNumber: '26958735',
    balance: { cad: 12840.25, usd: 5320.00 },
    currency: 'CAD',
  },
  {
    id: '3',
    type: 'MARGIN',
    label: 'Self-directed Margin',
    accountNumber: '26958736',
    balance: { cad: 78120.00, usd: 34500.00 },
    currency: 'CAD',
    marginBreakdown: {
      settledCash: { cad: 52080.00, usd: 23000.00 },
      buyingPower: { cad: 26040.00, usd: 11500.00 },
    },
  },
  {
    id: '4',
    type: 'RRSP',
    label: 'Self-directed RRSP',
    accountNumber: '26958737',
    balance: { cad: 156430.75, usd: 42150.00 },
    currency: 'CAD',
  },
  {
    id: '5',
    type: 'FHSA',
    label: 'Self-directed FHSA',
    accountNumber: '26958738',
    balance: { cad: 8000.00, usd: 3500.0 },
    currency: 'CAD',
  },
  {
    id: '6',
    type: 'RESP',
    label: 'Family RESP',
    accountNumber: '26958739',
    balance: { cad: 32650.40, usd: 8200.00 },
    currency: 'CAD',
    subscriberName: 'Anastasia Carmichael',
    jointSubscriber: 'Michael Carmichael',
    respBreakdown: {
      contributions: { cad: 18000.00, usd: 4500.00 },
      investmentGrowth: { cad: 8150.40, usd: 2100.00 },
      grants: { cad: 6500.00, usd: 1600.00 },
    },
    respBeneficiaries: [
      { id: 'ben1', firstName: 'Dante', lastName: 'Carmichael', sin: '987 654 321', dateOfBirth: '2004-06-15', province: 'ON' },
      { id: 'ben2', firstName: 'Leo', lastName: 'Carmichael', sin: '123 456 789', dateOfBirth: '2010-03-22', province: 'ON' },
    ],
  },
];

export const linkedBanks: LinkedBank[] = [
  {
    id: 'b1',
    name: 'TD Canada Trust',
    institutionNumber: '004',
    transitNumber: '10202',
    accountNumber: '1234567',
    last4: '4567',
    depositCurrency: 'CAD',
  },
  {
    id: 'b2',
    name: 'RBC Royal Bank',
    institutionNumber: '003',
    transitNumber: '00016',
    accountNumber: '7654321',
    last4: '4321',
    depositCurrency: 'CAD',
  },
  {
    id: 'b-usd-1',
    name: 'Chase Bank (USA)',
    institutionNumber: '021',
    transitNumber: '00001',
    accountNumber: '9988776655',
    last4: '6655',
    depositCurrency: 'USD',
  },
];

export const bankOptions = [
  { value: 'bmo', label: 'BMO Bank of Montreal', institution: '001' },
  { value: 'scotiabank', label: 'Scotiabank', institution: '002' },
  { value: 'rbc', label: 'RBC Royal Bank', institution: '003' },
  { value: 'td', label: 'TD Canada Trust', institution: '004' },
  { value: 'national', label: 'National Bank of Canada', institution: '006' },
  { value: 'cibc', label: 'CIBC', institution: '010' },
  { value: 'hsbc', label: 'HSBC Bank Canada', institution: '016' },
  { value: 'desjardins', label: 'Desjardins', institution: '815' },
  { value: 'tangerine', label: 'Tangerine', institution: '614' },
  { value: 'simplii', label: 'Simplii Financial', institution: '010' },
  { value: 'eq', label: 'EQ Bank', institution: '623' },
  { value: 'other', label: 'Other', institution: '' },
];

export function getLinkedBankDepositCurrency(bank: LinkedBank | null | undefined): Currency {
  return bank?.depositCurrency ?? 'CAD';
}

export function formatCurrency(amount: number, currency: 'CAD' | 'USD' = 'CAD'): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function calculateWithholdingTax(grossAmount: number): number {
  if (grossAmount <= 0) return 0;
  if (grossAmount <= 5000) return grossAmount * 0.10;
  if (grossAmount <= 15000) return grossAmount * 0.20;
  return grossAmount * 0.30;
}

export function getWithholdingRate(grossAmount: number): number {
  if (grossAmount <= 0) return 0;
  if (grossAmount <= 5000) return 10;
  if (grossAmount <= 15000) return 20;
  return 30;
}

export function grossFromNet(netAmount: number): number {
  if (netAmount <= 0) return 0;
  const brackets: { maxGross: number; rate: number }[] = [
    { maxGross: 5000, rate: 0.10 },
    { maxGross: 15000, rate: 0.20 },
    { maxGross: Infinity, rate: 0.30 },
  ];
  for (const { maxGross, rate } of brackets) {
    const gross = netAmount / (1 - rate);
    if (gross <= maxGross) return gross;
  }
  return netAmount / 0.70;
}

export function formatAmountDisplay(value: string): string {
  const num = parseFloat(value.replace(/,/g, ''));
  if (isNaN(num) || value === '') return value;
  return num.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function stripFormatting(value: string): string {
  return value.replace(/,/g, '');
}

/** Settled cash used for withdrawal availability (margin uses settled cash only). */
export function settledBalances(account: Account): BalanceInfo {
  if (account.type === 'MARGIN' && account.marginBreakdown) {
    return account.marginBreakdown.settledCash;
  }
  return account.balance;
}

/** Convert CAD + USD balances into a single display-currency amount (FX + buffer). */
export function balanceToDisplayAmount(cad: number, usd: number, currency: Currency): number {
  if (currency === 'CAD') {
    return cad + usd * FX_RATE * (1 - FX_BUFFER);
  }
  return (cad / FX_RATE) * (1 - FX_BUFFER) + usd;
}

/** Placeholder unavailable leg (unsettled) — same basis as mobile balance card mock. */
const UNAVAILABLE_MOCK_CAD = 150;
const UNAVAILABLE_MOCK_USD = 50;

export interface WithdrawalAmountStepData {
  primaryCurrency: Currency;
  availableBalance: number;
  unavailableBalance: number;
  secondaryCurrency?: Currency;
  secondaryBalance?: number;
  maxFromSecondaryInPrimary?: number;
  combinedMaxInPrimary?: number;
}

/**
 * Metrics for the withdrawal amount step: primary = settled cash in withdrawal currency only;
 * secondary = other currency; combined = both legs at current rate.
 */
export function getWithdrawalAmountStepData(account: Account, primaryCurrency: Currency): WithdrawalAmountStepData {
  const { cad: cadAvail, usd: usdAvail } = settledBalances(account);
  const unavailableBalance = balanceToDisplayAmount(UNAVAILABLE_MOCK_CAD, UNAVAILABLE_MOCK_USD, primaryCurrency);

  if (primaryCurrency === 'CAD') {
    const availableBalance = cadAvail;
    const secondaryBalance = usdAvail;
    const maxFromSecondaryInPrimary = usdAvail * FX_RATE * (1 - FX_BUFFER);
    const combinedMaxInPrimary = availableBalance + maxFromSecondaryInPrimary;
    return {
      primaryCurrency: 'CAD',
      availableBalance,
      unavailableBalance,
      secondaryCurrency: 'USD',
      secondaryBalance,
      maxFromSecondaryInPrimary,
      combinedMaxInPrimary,
    };
  }

  const availableBalance = usdAvail;
  const secondaryBalance = cadAvail;
  const maxFromSecondaryInPrimary = (cadAvail / FX_RATE) * (1 - FX_BUFFER);
  const combinedMaxInPrimary = availableBalance + maxFromSecondaryInPrimary;
  return {
    primaryCurrency: 'USD',
    availableBalance,
    unavailableBalance,
    secondaryCurrency: 'CAD',
    secondaryBalance,
    maxFromSecondaryInPrimary,
    combinedMaxInPrimary,
  };
}
