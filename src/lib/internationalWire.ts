import type { InternationalWireData } from '../types';

/** True when receiving-bank essentials are already captured (e.g. profile or prior visit). */
export function hasInternationalWireBeneficiaryCore(data: InternationalWireData): boolean {
  return !!(data.bankName?.trim() && data.swiftCode?.trim());
}
