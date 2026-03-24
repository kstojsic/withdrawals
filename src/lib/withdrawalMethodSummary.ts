import type { WithdrawalMethod } from '../types';

/** Method name only (review / summary). */
export function withdrawalMethodSummaryLabel(method: WithdrawalMethod | null): string {
  if (method === 'eft') return 'EFT';
  if (method === 'wire') return 'Wire Transfer';
  if (method === 'international_wire') return 'International Wire';
  return '';
}

/** ETA copy for review / summary (separate row from method). */
export function withdrawalMethodEtaSummary(method: WithdrawalMethod | null): string {
  if (method === 'eft') return '0–2 business days';
  if (method === 'wire') return '1–2 business days';
  if (method === 'international_wire') return '2+ business days';
  return '';
}
