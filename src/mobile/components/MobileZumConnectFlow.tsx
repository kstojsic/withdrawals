import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  X,
  Search,
  Building2,
  Lock,
  Shield,
  Info,
} from 'lucide-react';
import type { LinkedBank } from '../../types';
import { bankOptions } from '../../data/accounts';
import MobileButton from './MobileButton';
import ZumLogo from './zum/ZumLogo';
import {
  zumInstitutions,
  zumMockAccountsForInstitution,
  type ZumInstitution,
} from '../data/zumInstitutions';

interface MobileZumConnectFlowProps {
  onComplete: (bank: LinkedBank) => void;
  onExit: () => void;
}

type ZumStep = 'select_bank' | 'credentials' | 'consent' | 'connecting' | 'select_account';

const ACCOUNT_NUMBERS: Record<string, string> = {
  chq: '9025612259',
  sav: '9025778841',
};

function ZumHeader({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-qt-border bg-white pl-[max(0.25rem,env(safe-area-inset-left))] pr-[max(0.25rem,env(safe-area-inset-right))]">
      <div className="flex w-12 shrink-0 justify-start">
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center text-qt-primary active:opacity-70"
          aria-label="Back"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
      </div>
      <div className="flex min-w-0 flex-1 justify-center">
        <ZumLogo />
      </div>
      <div className="flex w-12 shrink-0 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center text-qt-secondary active:text-qt-primary"
          aria-label="Close"
        >
          <X size={22} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}

export default function MobileZumConnectFlow({ onComplete, onExit }: MobileZumConnectFlowProps) {
  const [step, setStep] = useState<ZumStep>('select_bank');
  const [search, setSearch] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<ZumInstitution | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [connectProgress, setConnectProgress] = useState(0.33);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return zumInstitutions;
    return zumInstitutions.filter(
      (z) => z.name.toLowerCase().includes(q) || z.url.toLowerCase().includes(q),
    );
  }, [search]);

  useEffect(() => {
    if (step !== 'connecting') return;
    setConnectProgress(0.33);
    const start = Date.now();
    const duration = 2800;
    const iv = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      setConnectProgress(0.33 + t * 0.62);
      if (t >= 1) window.clearInterval(iv);
    }, 50);
    const done = window.setTimeout(() => {
      window.clearInterval(iv);
      setStep('select_account');
    }, duration);
    return () => {
      window.clearInterval(iv);
      window.clearTimeout(done);
    };
  }, [step]);

  useEffect(() => {
    if (step === 'select_account' && !selectedAccountId) {
      const first = zumMockAccountsForInstitution.find((a) => !a.disabled);
      if (first) setSelectedAccountId(first.id);
    }
  }, [step, selectedAccountId]);

  function handleBack() {
    if (step === 'select_bank') onExit();
    else if (step === 'credentials') setStep('select_bank');
    else if (step === 'connecting') setStep('consent');
    else if (step === 'select_account') setStep('consent');
  }

  function handleClose() {
    onExit();
  }

  function pickInstitution(inst: ZumInstitution) {
    setSelectedInstitution(inst);
    setStep('credentials');
  }

  function submitCredentials() {
    setStep('consent');
  }

  function agreeConsent() {
    setStep('connecting');
  }

  function finishAccountLink() {
    if (!selectedInstitution || !selectedAccountId) return;
    const acc = zumMockAccountsForInstitution.find((a) => a.id === selectedAccountId);
    if (!acc || acc.disabled) return;

    const bankMeta = bankOptions.find((b) => b.value === selectedInstitution.institutionKey);
    const accountNumber = ACCOUNT_NUMBERS[selectedAccountId] ?? '9025600000';

    const newBank: LinkedBank = {
      id: `zum-${Date.now()}`,
      name: bankMeta?.label ?? selectedInstitution.name,
      institutionNumber: bankMeta?.institution ?? '004',
      transitNumber: '10202',
      accountNumber,
      last4: accountNumber.slice(-4),
      depositCurrency: 'CAD',
      institutionCountry: 'CA',
    };
    onComplete(newBank);
  }

  const credentialsValid = username.trim().length > 0 && password.trim().length > 0;
  const canContinueAccount =
    selectedAccountId &&
    !zumMockAccountsForInstitution.find((a) => a.id === selectedAccountId)?.disabled;

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-center bg-white font-[family-name:var(--font-body)]"
      role="dialog"
      aria-modal="true"
      aria-label="Connect bank"
    >
      <div
        className="flex h-[100svh] max-h-[100svh] min-h-0 w-full max-w-[min(100%,var(--mobile-layout-max-width))] flex-col overflow-hidden pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
      >
      {step === 'consent' ? (
        <header className="relative flex h-14 shrink-0 items-center justify-center border-b border-qt-border bg-white">
          <ZumLogo />
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-[max(0.5rem,env(safe-area-inset-right))] top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-qt-secondary"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </header>
      ) : (
        <ZumHeader onClose={handleClose} onBack={handleBack} />
      )}

      {step === 'select_bank' && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-2 pb-1">
          <h1 className="mb-4 text-xl font-bold text-qt-primary">Select your bank</h1>
          <div className="relative mb-4">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-qt-gray-dark"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="min-h-[48px] w-full rounded-lg border border-[#D1D1D1] bg-white py-3 pl-11 pr-4 text-base text-qt-primary outline-none placeholder:text-qt-gray-dark focus:border-qt-green"
              autoComplete="off"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <ul className="flex flex-col pb-4">
              {filtered.map((inst) => (
                  <li key={inst.id} className="border-b border-qt-border last:border-b-0">
                    <button
                      type="button"
                      onClick={() => pickInstitution(inst)}
                      className="flex w-full items-start gap-3 py-4 text-left active:bg-[#E8EEF5]"
                    >
                      <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-md bg-qt-bg-3">
                        <Building2 size={20} className="text-qt-secondary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold leading-snug text-qt-primary">{inst.name}</p>
                        <p className="mt-0.5 text-xs text-qt-secondary">{inst.url}</p>
                      </div>
                    </button>
                  </li>
              ))}
            </ul>
          </div>
          <p className="shrink-0 py-3 text-center text-xs text-qt-secondary">
            Not listed? Scroll down to view more ↓↓↓
          </p>
        </div>
      )}

      {step === 'credentials' && selectedInstitution && (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-4 pb-6 pt-4">
          <div className="mb-6 flex gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-qt-bg-3">
              <Building2 size={24} className="text-qt-secondary" />
            </div>
            <div>
              <p className="text-lg font-bold text-qt-primary">Enter your credentials</p>
              <p className="mt-2 text-sm leading-relaxed text-qt-secondary">
                By providing your credentials, you&apos;re enabling Questrade to retrieve your financial data
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or Card Number"
                className="min-h-[52px] w-full rounded-lg border border-[#D1D1D1] bg-white py-3 pl-4 pr-12 text-base text-qt-primary outline-none placeholder:text-qt-gray-dark focus:border-qt-green"
              />
              <Lock className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-qt-gray-dark" />
            </div>
          </div>
          <div className="mb-8">
            <div className="relative">
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="min-h-[52px] w-full rounded-lg border border-[#D1D1D1] bg-white py-3 pl-4 pr-12 text-base text-qt-primary outline-none placeholder:text-qt-gray-dark focus:border-qt-green"
              />
              <Lock className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-qt-gray-dark" />
            </div>
          </div>

          <MobileButton onClick={submitCredentials} disabled={!credentialsValid}>
            Submit
          </MobileButton>
        </div>
      )}

      {step === 'consent' && (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-4 pb-8 pt-6">
          <div className="mb-6 flex flex-col items-center">
            <Lock className="mb-4 size-14 text-qt-primary" strokeWidth={1.5} />
            <h1 className="text-center text-2xl font-bold text-qt-primary">Consent</h1>
            <p className="mt-3 text-center text-sm leading-relaxed text-qt-secondary">
              Questrade application needs your consent to link your bank account
            </p>
          </div>

          <div className="mb-6 flex gap-3 rounded-xl border border-qt-border bg-qt-bg-2/50 p-4">
            <Shield className="mt-0.5 size-6 shrink-0 text-qt-primary" strokeWidth={1.5} />
            <div>
              <p className="font-bold text-qt-primary">Private and Secure</p>
              <p className="mt-1 text-sm leading-relaxed text-qt-secondary">
                Your credentials are never stored and all the communication is encrypted, protecting your personal
                financial data
              </p>
            </div>
          </div>

          <div className="mb-8 flex gap-3 rounded-xl border border-qt-border bg-qt-bg-2/50 p-4">
            <Lock className="mt-0.5 size-6 shrink-0 text-qt-primary" strokeWidth={1.5} />
            <div>
              <p className="font-bold text-qt-primary">Read-only</p>
              <p className="mt-1 text-sm leading-relaxed text-qt-secondary">
                Bank account number, balance, transaction history, holder name and address
              </p>
            </div>
          </div>

          <p className="mb-6 text-center text-xs leading-relaxed text-qt-secondary">
            By clicking Agree, you authorize <span className="font-semibold text-qt-primary">Questrade</span> and agree
            to the{' '}
            <a href="#" className="text-qt-blue underline" onClick={(e) => e.preventDefault()}>
              End User Terms &amp; Conditions
            </a>
            .
          </p>

          <div className="mt-auto space-y-3">
            <MobileButton onClick={agreeConsent}>Agree</MobileButton>
            <button
              type="button"
              onClick={() => setStep('credentials')}
              className="w-full min-h-[44px] text-sm font-semibold text-qt-green-dark active:underline"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {step === 'connecting' && (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-12 sm:px-8">
          <div className="mb-10 h-2 w-full max-w-sm overflow-hidden rounded-full bg-qt-bg-3">
            <div
              className="h-full rounded-full bg-qt-green transition-[width] duration-300 ease-out"
              style={{ width: `${Math.min(1, connectProgress) * 100}%` }}
            />
          </div>
          <h2 className="mb-3 text-center text-xl font-bold text-qt-primary">Establishing Connection</h2>
          <p className="text-center text-sm leading-relaxed text-qt-secondary">
            This may take up to 10 minutes, please do not close this page
          </p>
        </div>
      )}

      {step === 'select_account' && selectedInstitution && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-qt-border px-4 py-4">
            <div className="flex gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-qt-bg-3">
                <Building2 size={20} className="text-qt-secondary" />
              </div>
              <div>
                <p className="text-base font-bold text-qt-primary">
                  {bankOptions.find((b) => b.value === selectedInstitution.institutionKey)?.label ??
                    selectedInstitution.name}
                </p>
                <p className="text-xs text-qt-secondary">{selectedInstitution.url}</p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4">
            <h2 className="text-xl font-bold text-qt-primary">Select an account</h2>
            <p className="mt-2 text-sm text-qt-secondary">
              Let Questrade application know your primary account
            </p>

            <ul className="mt-6 flex flex-col divide-y divide-qt-border border-t border-qt-border">
              {zumMockAccountsForInstitution.map((acc) => {
                const checked = selectedAccountId === acc.id;
                return (
                  <li key={acc.id} className="py-4">
                    <label
                      className={`flex cursor-pointer items-start gap-3 ${acc.disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      <input
                        type="radio"
                        name="zum-account"
                        checked={checked}
                        disabled={acc.disabled}
                        onChange={() => {
                          if (!acc.disabled) setSelectedAccountId(acc.id);
                        }}
                        className="mt-1 size-5 shrink-0 accent-qt-green"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-base font-bold ${acc.disabled ? 'text-qt-secondary' : 'text-qt-primary'}`}>
                            {acc.label}
                          </span>
                          <span className={`shrink-0 text-sm font-semibold ${acc.disabled ? 'text-qt-secondary' : 'text-qt-primary'}`}>
                            {acc.balanceLabel}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-qt-secondary">{acc.mask}</p>
                        {acc.disabled && acc.invalidReason && (
                          <p className="mt-2 flex items-center gap-1 text-xs text-qt-secondary">
                            <Info size={14} className="shrink-0" aria-hidden />
                            {acc.invalidReason}
                          </p>
                        )}
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="shrink-0 border-t border-qt-border bg-white px-4 py-3">
            <MobileButton onClick={finishAccountLink} disabled={!canContinueAccount}>
              Continue
            </MobileButton>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
