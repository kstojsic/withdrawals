import { useState } from 'react';
import { X, Building2, ChevronRight, Upload, CheckCircle2 } from 'lucide-react';
import type { LinkedBank } from '../../types';
import { bankOptions } from '../../data/accounts';
import MobileInputField from './MobileInputField';
import MobileButton from './MobileButton';

interface MobileLinkBankModalProps {
  onClose: () => void;
  onSave: (bank: LinkedBank) => void;
}

export default function MobileLinkBankModal({ onClose, onSave }: MobileLinkBankModalProps) {
  const [mode, setMode] = useState<'choose' | 'select_bank' | 'manual'>('choose');
  const [selectedBank, setSelectedBank] = useState('');
  const [transit, setTransit] = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [voidCheque, setVoidCheque] = useState<File | null>(null);

  function handleSave() {
    const bankInfo = bankOptions.find((b) => b.value === selectedBank);
    const newBank: LinkedBank = {
      id: `new-${Date.now()}`,
      name: bankInfo?.label || 'New Bank',
      institutionNumber: bankInfo?.institution || '',
      transitNumber: transit,
      accountNumber: accountNum,
      last4: accountNum.slice(-4),
    };
    onSave(newBank);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-[430px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4 border-b border-qt-border sticky top-0 bg-white">
          <h3 className="font-display text-xl text-qt-primary">Connect bank account</h3>
          <button onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-qt-secondary active:text-qt-primary cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          {mode === 'choose' && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setMode('select_bank')}
                className="min-h-[72px] flex items-center gap-4 p-4 rounded-xl border-2 border-qt-border active:border-qt-green transition-all cursor-pointer text-left w-full"
              >
                <div className="size-12 rounded-xl bg-qt-green-bg flex items-center justify-center shrink-0">
                  <Building2 size={20} className="text-qt-green-dark" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-qt-primary">Connect automatically</p>
                  <p className="text-xs text-qt-secondary">Securely link your bank using online banking credentials</p>
                </div>
                <ChevronRight size={20} className="text-qt-gray-dark" />
              </button>
              <button
                onClick={() => setMode('manual')}
                className="min-h-[72px] flex items-center gap-4 p-4 rounded-xl border-2 border-qt-border active:border-qt-green transition-all cursor-pointer text-left w-full"
              >
                <div className="size-12 rounded-xl bg-qt-bg-3 flex items-center justify-center shrink-0">
                  <Building2 size={20} className="text-qt-secondary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-qt-primary">Enter manually</p>
                  <p className="text-xs text-qt-secondary">Enter your institution, transit, and account number</p>
                </div>
                <ChevronRight size={20} className="text-qt-gray-dark" />
              </button>
            </div>
          )}

          {mode === 'select_bank' && (
            <div>
              <p className="text-sm text-qt-secondary mb-4">Select your financial institution</p>
              <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                {bankOptions.filter(b => b.value !== 'other').map((bank) => (
                  <button
                    key={bank.value}
                    onClick={() => {
                      setSelectedBank(bank.value);
                      setMode('manual');
                    }}
                    className="min-h-[56px] flex items-center gap-2 p-3 rounded-xl border-2 border-qt-border active:border-qt-green active:bg-qt-green-bg/20 transition-all cursor-pointer text-left"
                  >
                    <div className="size-10 rounded-lg bg-qt-bg-3 flex items-center justify-center shrink-0">
                      <Building2 size={16} className="text-qt-secondary" />
                    </div>
                    <p className="text-sm text-qt-primary font-medium truncate">{bank.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'manual' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm leading-[22px] text-qt-primary mb-2 block">Financial institution</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full min-h-[52px] rounded-xl border-2 border-qt-gray-dark bg-white px-4 text-base text-qt-primary appearance-none outline-none focus:border-qt-green cursor-pointer"
                >
                  <option value="" disabled>Select institution</option>
                  {bankOptions.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
              <MobileInputField
                label="Transit number"
                placeholder="e.g. 12345"
                value={transit}
                onChange={(e) => setTransit(e.target.value)}
                maxLength={5}
              />
              <MobileInputField
                label="Account number"
                placeholder="e.g. 1234567"
                value={accountNum}
                onChange={(e) => setAccountNum(e.target.value)}
              />

              <div>
                <label className="text-sm leading-[22px] text-qt-primary mb-2 block">
                  Upload void cheque or direct deposit form
                </label>
                <div
                  className="min-h-[120px] border-2 border-dashed border-qt-border rounded-xl p-6 flex items-center justify-center text-center active:border-qt-green transition-colors cursor-pointer"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files?.[0]) setVoidCheque(e.dataTransfer.files[0]); }}
                  onClick={() => document.getElementById('mobile-void-cheque-upload')?.click()}
                >
                  <input
                    id="mobile-void-cheque-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) setVoidCheque(e.target.files[0]); }}
                  />
                  {voidCheque ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 size={28} className="text-qt-green" />
                      <p className="text-sm font-semibold text-qt-primary">{voidCheque.name}</p>
                      <p className="text-xs text-qt-secondary">Tap to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={28} className="text-qt-secondary" />
                      <p className="text-sm text-qt-primary">
                        Tap to browse or drag & drop
                      </p>
                      <p className="text-xs text-qt-secondary">PDF, JPG, PNG</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <MobileButton variant="secondary" onClick={() => setMode('choose')} fullWidth={false} className="flex-1">
                  Back
                </MobileButton>
                <MobileButton
                  onClick={handleSave}
                  disabled={!selectedBank || !transit || !accountNum || !voidCheque}
                  fullWidth={false}
                  className="flex-1"
                >
                  Link account
                </MobileButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
