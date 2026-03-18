import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowUpRight, ArrowLeftRight, BadgeDollarSign, ChevronDown, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../data/accounts';

type TxnType = 'deposit' | 'withdrawal' | 'transfer' | 'exchange';

interface Transaction {
  id: string;
  date: string;
  type: TxnType;
  description: string;
  account: string;
  amount: number;
  currency: 'CAD' | 'USD';
  status: 'completed' | 'pending' | 'processing';
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2026-03-05', type: 'deposit', description: 'EFT Deposit — TD Canada Trust', account: 'TFSA ••4734', amount: 5000.00, currency: 'CAD', status: 'completed' },
  { id: 't2', date: '2026-03-04', type: 'withdrawal', description: 'Wire Transfer — RBC Royal Bank', account: 'Cash ••4735', amount: -2500.00, currency: 'CAD', status: 'completed' },
  { id: 't3', date: '2026-03-03', type: 'exchange', description: 'CAD → USD Currency Exchange', account: 'Margin ••4736', amount: -3400.00, currency: 'CAD', status: 'completed' },
  { id: 't4', date: '2026-03-03', type: 'transfer', description: 'Transfer to RRSP', account: 'TFSA ••4734 → RRSP ••4737', amount: -7000.00, currency: 'CAD', status: 'completed' },
  { id: 't5', date: '2026-03-01', type: 'deposit', description: 'EFT Deposit — Scotiabank', account: 'RRSP ••4737', amount: 3000.00, currency: 'CAD', status: 'completed' },
  { id: 't6', date: '2026-02-28', type: 'withdrawal', description: 'EFT Withdrawal — TD Canada Trust', account: 'TFSA ••4734', amount: -1200.00, currency: 'CAD', status: 'completed' },
  { id: 't7', date: '2026-02-27', type: 'exchange', description: 'USD → CAD Currency Exchange', account: 'Cash ••4735', amount: 1850.00, currency: 'USD', status: 'completed' },
  { id: 't8', date: '2026-02-25', type: 'deposit', description: 'Pre-authorized Contribution', account: 'FHSA ••4738', amount: 500.00, currency: 'CAD', status: 'completed' },
  { id: 't9', date: '2026-02-24', type: 'transfer', description: 'Transfer to RESP', account: 'Cash ••4735 → RESP ••4739', amount: -2000.00, currency: 'CAD', status: 'completed' },
  { id: 't10', date: '2026-02-22', type: 'withdrawal', description: 'International Wire — HSBC UK', account: 'Margin ••4736', amount: -8500.00, currency: 'USD', status: 'completed' },
  { id: 't11', date: '2026-02-20', type: 'deposit', description: 'EFT Deposit — CIBC', account: 'Cash ••4735', amount: 10000.00, currency: 'CAD', status: 'completed' },
  { id: 't12', date: '2026-02-18', type: 'exchange', description: 'CAD → USD Currency Exchange', account: 'TFSA ••4734', amount: -5440.00, currency: 'CAD', status: 'completed' },
  { id: 't13', date: '2026-03-06', type: 'deposit', description: 'EFT Deposit — TD Canada Trust', account: 'RRSP ••4737', amount: 2000.00, currency: 'CAD', status: 'pending' },
  { id: 't14', date: '2026-03-06', type: 'withdrawal', description: 'EFT Withdrawal — RBC Royal Bank', account: 'TFSA ••4734', amount: -3200.00, currency: 'CAD', status: 'processing' },
];

const TYPE_META: Record<TxnType, { label: string; color: string; icon: typeof Wallet }> = {
  deposit:    { label: 'Deposit',    color: 'text-[#085041]', icon: Wallet },
  transfer:   { label: 'Transfer',   color: 'text-[#085041]', icon: ArrowLeftRight },
  exchange:   { label: 'Exchange',   color: 'text-[#085041]', icon: BadgeDollarSign },
  withdrawal: { label: 'Withdrawal', color: 'text-[#085041]', icon: ArrowUpRight },
};

const FILTER_OPTIONS: { value: TxnType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'deposit', label: 'Deposits' },
  { value: 'withdrawal', label: 'Withdrawals' },
  { value: 'transfer', label: 'Transfers' },
  { value: 'exchange', label: 'Exchanges' },
];

const PERIOD_OPTIONS = ['Last 30 days', 'Last 90 days', 'Last 6 months', 'Year to date', 'Last 12 months'];

function StatusBadge({ status }: { status: Transaction['status'] }) {
  const styles = {
    completed: 'bg-qt-green-bg text-qt-green-dark',
    pending: 'bg-amber-50 text-amber-600',
    processing: 'bg-blue-50 text-qt-blue',
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function MoveMoneyPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TxnType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'open'>('all');
  const [period, setPeriod] = useState('Last 30 days');
  const [showPeriod, setShowPeriod] = useState(false);

  const sorted = [...MOCK_TRANSACTIONS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const byType = filter === 'all' ? sorted : sorted.filter((t) => t.type === filter);
  const filtered = statusFilter === 'all' ? byType
    : statusFilter === 'completed' ? byType.filter((t) => t.status === 'completed')
    : byType.filter((t) => t.status === 'pending' || t.status === 'processing');

  const actions: { type: TxnType; label: string; sublabel: string; onClick: () => void }[] = [
    { type: 'deposit',    label: 'Deposit',    sublabel: 'Add funds to your account from your bank',   onClick: () => {} },
    { type: 'transfer',   label: 'Transfer',   sublabel: 'Move funds between your Questrade accounts', onClick: () => {} },
    { type: 'exchange',   label: 'Exchange',   sublabel: 'Convert between CAD and USD currencies',     onClick: () => {} },
    { type: 'withdrawal', label: 'Withdrawal', sublabel: 'Withdraw funds to your linked bank account', onClick: () => navigate('/withdraw') },
  ];

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = today.getTime() - d.getTime();
    if (diff < 0) return 'Today';
    if (diff < 86400000) return 'Today';
    if (diff < 172800000) return 'Yesterday';
    return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="max-w-[960px] mx-auto px-6 py-8">
      <h1 className="font-display text-[28px] leading-[38px] text-qt-primary mb-1">Move Money</h1>
      <p className="text-sm text-qt-secondary mb-8">Manage your deposits, transfers, exchanges, and withdrawals</p>

      {/* Stacked Action Bars */}
      <div className="flex flex-col gap-3 mb-10">
        {actions.map(({ type, label, sublabel, onClick }) => {
          const { icon: Icon } = TYPE_META[type];
          return (
            <button
              key={type}
              onClick={onClick}
              className="group flex items-center gap-4 w-full px-5 py-4 rounded-xl border border-qt-border bg-white hover:border-qt-green hover:shadow-md transition-all cursor-pointer text-left"
            >
              <div className="flex items-center justify-center size-12 rounded-lg bg-[#E1F5EE] border-2 border-[#085041]/20 text-[#085041] shrink-0 group-hover:scale-105 transition-transform">
                <Icon size={24} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-qt-primary">{label}</p>
                <p className="text-xs text-qt-secondary mt-0.5">{sublabel}</p>
              </div>
              <ChevronRight size={20} className="text-qt-gray-dark group-hover:text-qt-green-dark transition-colors shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Transaction History */}
      <div className="bg-white border border-qt-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-qt-border">
          <h2 className="font-display text-[22px] leading-[30px] text-qt-primary">Transaction History</h2>
          <div className="relative">
            <button
              onClick={() => setShowPeriod(!showPeriod)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-qt-border text-xs text-qt-secondary hover:border-qt-green transition-colors cursor-pointer"
            >
              {period}
              <ChevronDown size={14} />
            </button>
            {showPeriod && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-qt-border rounded-lg shadow-lg z-20 py-1">
                {PERIOD_OPTIONS.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPeriod(p); setShowPeriod(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-qt-bg-3 transition-colors cursor-pointer ${p === period ? 'text-qt-green-dark font-semibold' : 'text-qt-primary'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-qt-border bg-white">
          <div className="flex items-center gap-1">
            {FILTER_OPTIONS.map(({ value, label }) => {
              const active = filter === value;
              return (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`h-8 px-3.5 rounded-full text-xs font-medium transition-all cursor-pointer
                    ${active
                      ? 'bg-qt-green text-white'
                      : 'text-qt-secondary hover:bg-qt-bg-3'
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1">
            {([
              { value: 'all' as const, label: 'All' },
              { value: 'completed' as const, label: 'Completed' },
              { value: 'open' as const, label: 'Open requests' },
            ]).map(({ value, label }) => {
              const active = statusFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`h-8 px-3.5 rounded-full text-xs font-medium transition-all cursor-pointer
                    ${active
                      ? 'bg-qt-primary text-white'
                      : 'text-qt-secondary hover:bg-qt-bg-3'
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transaction List */}
        <div className="divide-y divide-qt-border/60">
          {filtered.map((txn) => {
            const { icon: TxnIcon } = TYPE_META[txn.type];
            const isPositive = txn.amount > 0;
            return (
              <div key={txn.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-qt-bg-2/50 transition-colors">
                <div className="flex items-center justify-center size-8 rounded-md bg-[#E1F5EE] text-[#085041] shrink-0">
                  <TxnIcon size={15} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-qt-primary font-medium truncate">{txn.description}</p>
                  <p className="text-[11px] text-qt-secondary">{txn.account}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${isPositive ? 'text-qt-green-dark' : 'text-qt-primary'}`}>
                    {isPositive ? '+' : ''}{formatCurrency(Math.abs(txn.amount), txn.currency)}
                  </p>
                  <div className="flex items-center gap-2 justify-end mt-0.5">
                    <span className="text-[11px] text-qt-secondary">{formatDate(txn.date)}</span>
                    <StatusBadge status={txn.status} />
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-qt-secondary">No transactions found for this filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
