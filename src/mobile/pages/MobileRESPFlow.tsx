import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAccountDropdown from '../components/MobileAccountDropdown';
import MobileButton from '../components/MobileButton';
import { accounts } from '../../data/accounts';
import type { Account } from '../../types';

/**
 * RESP withdrawals are lengthy on desktop. This route keeps account switching consistent;
 * the flow is a lightweight placeholder — extend with full steps when needed.
 */
export default function MobileRESPFlow() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(() => accounts.find((a) => a.type === 'RESP') ?? null);

  const handleAccountChange = useCallback(
    (acct: Account) => {
      if (acct.type === 'RRSP') navigate('/rrsp');
      else if (acct.type === 'FHSA') navigate('/fhsa');
      else if (acct.type !== 'RESP') navigate('/');
      else setAccount(acct);
    },
    [navigate],
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-6 px-4 py-6 w-full overflow-y-auto">
      <p className="text-sm font-medium text-qt-primary">RESP withdrawal</p>
      <MobileAccountDropdown accounts={accounts} value={account?.id ?? null} onChange={handleAccountChange} />
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
        <p className="text-sm text-amber-900 leading-relaxed">
          Full RESP flows (EAP/PSE, capital, AIP) with questionnaires match the desktop experience. Use this prototype to
          switch accounts; wire the remaining steps from <code className="text-xs">RESPFlow.tsx</code> when you&apos;re ready.
        </p>
      </div>
      <MobileButton variant="secondary" onClick={() => navigate('/')}>
        Back to standard withdrawal
      </MobileButton>
    </div>
  );
}
