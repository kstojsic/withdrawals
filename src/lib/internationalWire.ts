import type { InternationalWireData } from '../types';

/** True when receiving-bank essentials are already captured (e.g. profile or prior visit). */
export function hasInternationalWireBeneficiaryCore(data: InternationalWireData): boolean {
  return !!(data.bankName?.trim() && data.swiftCode?.trim());
}

export const emptyInternationalWireData = (): InternationalWireData => ({
  firstName: '',
  lastName: '',
  currency: 'CAD',
  amount: '',
  reason: '',
  bankName: '',
  bankAddress: '',
  bankCity: '',
  bankCountry: '',
  swiftCode: '',
  bankAccountNumber: '',
  hasIntermediary: false,
  intermediaryBankName: '',
  intermediarySwiftCode: '',
  intermediaryAccountNumber: '',
  routingNumber: '',
  isBrokerage: false,
  brokerageName: '',
  brokerageAccountName: '',
  brokerageAccountNumber: '',
});

/** Link-bank international path: holder name, bank + SWIFT, and initials. */
export function hasInternationalLinkComplete(data: InternationalWireData, signed: boolean): boolean {
  return !!(
    signed &&
    data.firstName?.trim() &&
    data.lastName?.trim() &&
    hasInternationalWireBeneficiaryCore(data)
  );
}
