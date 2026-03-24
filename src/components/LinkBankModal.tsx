import { useState } from 'react';
import { X, Building2, ChevronRight, Upload, CheckCircle2 } from 'lucide-react';
import type { LinkedBank } from '../types';
import { bankOptions } from '../data/accounts';
import InputField from './InputField';
import Button from './Button';

interface LinkBankModalProps {
  onClose: () => void;
  onSave: (bank: LinkedBank) => void;
}

export default function LinkBankModal({ onClose, onSave }: LinkBankModalProps) {
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
      institutionCountry: 'CA',
    };
    onSave(newBank);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-qt-border">
          <h3 className="font-display text-xl text-qt-primary">Connect bank account</h3>
          <button onClick={onClose} className="text-qt-secondary hover:text-qt-primary cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {mode === 'choose' && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setMode('select_bank')}
                className="flex items-center gap-3 p-4 rounded-lg border border-qt-border hover:border-qt-green transition-all cursor-pointer text-left w-full"
              >
                <div className="size-10 rounded-full bg-qt-green-bg flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-qt-green-dark" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-qt-primary">Connect automatically</p>
                  <p className="text-xs text-qt-secondary">Securely link your bank using online banking credentials</p>
                </div>
                <ChevronRight size={18} className="text-qt-gray-dark" />
              </button>
              <button
                onClick={() => setMode('manual')}
                className="flex items-center gap-3 p-4 rounded-lg border border-qt-border hover:border-qt-green transition-all cursor-pointer text-left w-full"
              >
                <div className="size-10 rounded-full bg-qt-bg-3 flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-qt-secondary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-qt-primary">Enter manually</p>
                  <p className="text-xs text-qt-secondary">Enter your institution, transit, and account number</p>
                </div>
                <ChevronRight size={18} className="text-qt-gray-dark" />
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
                    className="flex items-center gap-2 p-3 rounded-lg border border-qt-border hover:border-qt-green hover:bg-qt-green-bg/20 transition-all cursor-pointer text-left"
                  >
                    <div className="size-8 rounded-full bg-qt-bg-3 flex items-center justify-center shrink-0">
                      <Building2 size={14} className="text-qt-secondary" />
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
                <label className="text-sm leading-[22px] text-qt-primary mb-1 block">Financial institution</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full h-12 rounded-md border border-qt-gray-dark bg-white px-4 text-sm text-qt-primary appearance-none outline-none focus:border-qt-green cursor-pointer"
                >
                  <option value="" disabled>Select institution</option>
                  {bankOptions.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
              <InputField
                label="Transit number"
                placeholder="e.g. 12345"
                value={transit}
                onChange={(e) => setTransit(e.target.value)}
                maxLength={5}
              />
              <InputField
                label="Account number"
                placeholder="e.g. 1234567"
                value={accountNum}
                onChange={(e) => setAccountNum(e.target.value)}
              />

              <div>
                <label className="text-sm leading-[22px] text-qt-primary mb-1 block">
                  Upload void cheque or direct deposit form
                </label>
                <div
                  className="border-2 border-dashed border-qt-border rounded-lg p-6 text-center hover:border-qt-green transition-colors cursor-pointer"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files?.[0]) setVoidCheque(e.dataTransfer.files[0]); }}
                  onClick={() => document.getElementById('void-cheque-upload')?.click()}
                >
                  <input
                    id="void-cheque-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) setVoidCheque(e.target.files[0]); }}
                  />
                  {voidCheque ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <CheckCircle2 size={22} className="text-qt-green" />
                      <p className="text-sm font-semibold text-qt-primary">{voidCheque.name}</p>
                      <p className="text-xs text-qt-secondary">Click or drag to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload size={22} className="text-qt-secondary" />
                      <p className="text-sm text-qt-primary">
                        Drag & drop your file here, or <span className="font-semibold text-qt-green-dark">browse</span>
                      </p>
                      <p className="text-xs text-qt-secondary">Accepted formats: PDF, JPG, PNG</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={() => setMode('choose')}>Back</Button>
                <Button
                  onClick={handleSave}
                  disabled={!selectedBank || !transit || !accountNum || !voidCheque}
                >
                  Link account
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
