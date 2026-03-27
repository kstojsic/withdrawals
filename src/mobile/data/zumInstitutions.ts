/** Mock institutions for the ZUM “connect automatically” demo (names/URLs mirror reference screens). */
export interface ZumInstitution {
  id: string;
  /** Maps to `bankOptions[].value` in `data/accounts.ts` for saving a `LinkedBank`. */
  institutionKey: string;
  name: string;
  url: string;
}

export const zumInstitutions: ZumInstitution[] = [
  { id: 'island', institutionKey: 'other', name: 'Island Savings CU (BC) - (Ladysmith)', url: 'www.islandsavings.ca' },
  { id: 'meridian', institutionKey: 'other', name: 'Meridian - Commercial Business', url: 'businessbanking.meridiancu.ca' },
  { id: 'steinbach', institutionKey: 'other', name: 'Steinbach Credit Union - Collabria Credit Card', url: 'www.collabriacreditcards.ca' },
  { id: 'valley', institutionKey: 'other', name: 'Valley First CU (BC)', url: 'www.valleyfirst.com' },
  { id: 'affinity', institutionKey: 'other', name: 'Affinity Credit Union (CA)', url: 'www.affinitycu.ca' },
  { id: 'coastal', institutionKey: 'other', name: 'Coastal Community CU', url: 'www.coastalcommunity.ca' },
  { id: 'bmo', institutionKey: 'bmo', name: 'BMO Bank of Montreal', url: 'www.bmo.com' },
  { id: 'scotiabank', institutionKey: 'scotiabank', name: 'Scotiabank', url: 'www.scotiabank.com' },
  { id: 'rbc', institutionKey: 'rbc', name: 'RBC Royal Bank', url: 'www.rbcroyalbank.com' },
  { id: 'td', institutionKey: 'td', name: 'TD Canada Trust', url: 'www.td.com' },
  { id: 'national', institutionKey: 'national', name: 'National Bank of Canada', url: 'www.nbc.ca' },
  { id: 'cibc', institutionKey: 'cibc', name: 'CIBC', url: 'www.cibc.com' },
];

export interface ZumSelectableAccount {
  id: string;
  label: string;
  mask: string;
  balanceLabel: string;
  disabled?: boolean;
  invalidReason?: string;
}

export const zumMockAccountsForInstitution: ZumSelectableAccount[] = [
  { id: 'chq', label: 'Chequing', mask: '...2259', balanceLabel: 'CA$56,651.32' },
  { id: 'sav', label: 'Savings', mask: '...8841', balanceLabel: 'CA$12,450.00' },
  {
    id: 'cc',
    label: 'Credit Card',
    mask: '...9012',
    balanceLabel: 'CA$0.00',
    disabled: true,
    invalidReason: 'Invalid account',
  },
];
