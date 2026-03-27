export type AccountType = 'TFSA' | 'CASH' | 'MARGIN' | 'RRSP' | 'FHSA' | 'RESP';

export type RRSPWithdrawalType = 'deregistration' | 'hbp' | 'llp' | 'overcontribution';

export type FHSAWithdrawalType = 'qualifying' | 'non_qualifying' | 'overcontribution';

export type RESPWithdrawalType = 'eap_pse' | 'capital' | 'aip';

export type WithdrawalMethod = 'eft' | 'wire' | 'international_wire';

export type Currency = 'CAD' | 'USD';

export interface BalanceInfo {
  cad: number;
  usd: number;
}

export interface MarginBreakdown {
  settledCash: BalanceInfo;
  buyingPower: BalanceInfo;
}

export interface RESPBreakdown {
  contributions: BalanceInfo;
  investmentGrowth: BalanceInfo;
  grants: BalanceInfo;
}

export interface RESPBeneficiary {
  id: string;
  firstName: string;
  lastName: string;
  sin: string;
  dateOfBirth: string;
  province: string;
}

export interface Account {
  id: string;
  type: AccountType;
  label: string;
  accountNumber: string;
  balance: BalanceInfo;
  currency: string;
  marginBreakdown?: MarginBreakdown;
  respBreakdown?: RESPBreakdown;
  respBeneficiaries?: RESPBeneficiary[];
  subscriberName?: string;
  jointSubscriber?: string;
}

export interface LinkedBank {
  id: string;
  name: string;
  institutionNumber: string;
  transitNumber: string;
  accountNumber: string;
  last4: string;
  /** Currency for EFT/wire deposits to this linked account (defaults to CAD if omitted). */
  depositCurrency?: Currency;
  /** Institution country: CA = Canadian, US = U.S., INTL = international (defaults to CA if omitted). */
  institutionCountry?: 'CA' | 'US' | 'INTL';
  /** SWIFT/BIC when linked as an international account (optional, for display/reference). */
  swiftCode?: string;
  /** Full international wire details when the customer linked via “Add international Account”. */
  internationalWire?: InternationalWireData;
  /** Manually linked CA accounts: personal vs corporate holder. */
  accountHolderType?: 'personal' | 'corporate';
}

export interface InternationalWireData {
  firstName: string;
  lastName: string;
  currency: Currency;
  amount: string;
  reason: string;
  bankName: string;
  bankAddress: string;
  bankCity: string;
  bankCountry: string;
  swiftCode: string;
  bankAccountNumber: string;
  hasIntermediary: boolean;
  intermediaryBankName: string;
  intermediarySwiftCode: string;
  intermediaryAccountNumber: string;
  routingNumber: string;
  isBrokerage: boolean;
  brokerageName: string;
  brokerageAccountName: string;
  brokerageAccountNumber: string;
}
