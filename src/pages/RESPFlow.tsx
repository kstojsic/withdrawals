import { useState, useRef, useEffect, type ReactNode } from 'react';
import { useLinkedBankWithdrawalRules } from '../hooks/useLinkedBankWithdrawalRules';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Download, ChevronDown, Upload, X } from 'lucide-react';
import Tooltip from '../components/Tooltip';
import AccountDropdown from '../components/AccountDropdown';
import CurrencySelector from '../components/CurrencySelector';
import CurrencyInput from '../components/CurrencyInput';
import MethodSelector from '../components/MethodSelector';
import BankSelector from '../components/BankSelector';
import InternationalWireForm from '../components/InternationalWireForm';
import ESignature from '../components/ESignature';
import RadioButton from '../components/RadioButton';
import InputField from '../components/InputField';
import Button from '../components/Button';
import InfoBox from '../components/InfoBox';
import QuestionGroup from '../components/QuestionGroup';
import WizardSection from '../components/WizardSection';
import { accounts, linkedBanks as defaultBanks, formatCurrency, FX_RATE, FX_BUFFER } from '../data/accounts';
import { withdrawalMethodEtaSummary, withdrawalMethodSummaryLabel } from '../lib/withdrawalMethodSummary';
import type { Account, Currency, WithdrawalMethod, LinkedBank, InternationalWireData, RESPWithdrawalType } from '../types';

const respOptions: { value: RESPWithdrawalType; label: string }[] = [
  { value: 'eap_pse', label: 'Educational Assistance Payment (EAP) & Post-Secondary Education (PSE)' },
  { value: 'capital', label: 'Capital Withdrawal' },
  { value: 'aip', label: 'Accumulated Income Payment (AIP)' },
];

export default function RESPFlow() {
  const navigate = useNavigate();
  const respAccounts = accounts.filter((a) => a.type === 'RESP');
  const [account, setAccount] = useState<Account | null>(respAccounts[0] || null);

  const [respType, setRespType] = useState<RESPWithdrawalType | ''>('');
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<WithdrawalMethod | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [allBanks, setAllBanks] = useState<LinkedBank[]>(defaultBanks);
  const [intlWire, setIntlWire] = useState<InternationalWireData>({
    firstName: 'Anastasia', lastName: 'Carmichael',
    currency: 'CAD', amount: '', reason: '',
    bankName: '', bankAddress: '', bankCity: '', bankCountry: '',
    swiftCode: '', bankAccountNumber: '',
    hasIntermediary: false, intermediaryBankName: '',
    intermediarySwiftCode: '', intermediaryAccountNumber: '',
    routingNumber: '',
    isBrokerage: false,
    brokerageName: '',
    brokerageAccountName: '',
    brokerageAccountNumber: '',
  });
  const [signed, setSigned] = useState(false);
  const [jointSigned, setJointSigned] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { methodDisabled } = useLinkedBankWithdrawalRules(allBanks, selectedBank, setMethod, setIntlWire);

  // EAP & PSE questionnaire state
  const [beneficiary, setBeneficiary] = useState<string | null>(null);
  const [residency, setResidency] = useState<'resident' | 'non_resident' | null>(null);
  const [institutionName, setInstitutionName] = useState('');
  const [institutionAddress, setInstitutionAddress] = useState('');
  const [programType, setProgramType] = useState<string | null>(null);
  const [programTypeOther, setProgramTypeOther] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState<'full_time' | 'part_time' | null>(null);
  const [programName, setProgramName] = useState('');
  const [programStartDate, setProgramStartDate] = useState('');
  const [programLength, setProgramLength] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [weeksPerSemester, setWeeksPerSemester] = useState('');
  const [withdrawalScope, setWithdrawalScope] = useState<'full' | 'partial' | null>(null);
  const [distribution, setDistribution] = useState<'auto' | 'specify' | null>(null);
  const [eapSpecificAmount, setEapSpecificAmount] = useState('');
  const [pseSpecificAmount, setPseSpecificAmount] = useState('');
  const [fundsRecipient, setFundsRecipient] = useState<'subscriber' | 'beneficiary' | null>(null);
  const [beneficiaryConsent, setBeneficiaryConsent] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofConfirmed, setProofConfirmed] = useState(false);

  // Capital withdrawal questionnaire state
  const [capPurpose, setCapPurpose] = useState<'education' | 'capital' | null>(null);
  const [capAmount, setCapAmount] = useState('');
  const [capPriorEAP, setCapPriorEAP] = useState<'yes' | 'no' | null>(null);
  const [capComments, setCapComments] = useState('');
  const [capFeeAck, setCapFeeAck] = useState(false);

  // AIP state
  const [aipResident, setAipResident] = useState<'yes' | 'no' | null>(null);
  const [aipChoice, setAipChoice] = useState<'withdrawal' | 'rollover' | null>(null);
  // AIP Withdrawal (T1172)
  const [aipProvince, setAipProvince] = useState('');
  const [aipTotalAIP, setAipTotalAIP] = useState('');
  const [aipContribRRSP, setAipContribRRSP] = useState<'yes' | 'no' | null>(null);
  const [aipRRSPAmount, setAipRRSPAmount] = useState('');
  const [aipPriorRRSP, setAipPriorRRSP] = useState<'yes' | 'no' | null>(null);
  const [aipPriorRRSPAmount, setAipPriorRRSPAmount] = useState('');
  // AIP Rollover (T1171)
  const [aipRelationship, setAipRelationship] = useState<string | null>(null);
  const [aipTransferDest, setAipTransferDest] = useState<string | null>(null);
  const [aipDestInstitution, setAipDestInstitution] = useState('');
  const [aipDestAccount, setAipDestAccount] = useState('');
  const [aipTransferAmount, setAipTransferAmount] = useState('');
  const [aipWithinLimit, setAipWithinLimit] = useState<'yes' | 'no' | null>(null);
  const [aipPriorTransfers, setAipPriorTransfers] = useState<'yes' | 'no' | null>(null);
  const [aipPriorTransferAmount, setAipPriorTransferAmount] = useState('');
  // Shared AIP
  const [aipCloseAck, setAipCloseAck] = useState(false);

  function handleAccountChange(acct: Account) {
    if (acct.type !== 'RESP') {
      if (acct.type === 'RRSP') navigate('/withdraw/rrsp');
      else if (acct.type === 'FHSA') navigate('/withdraw/fhsa');
      else navigate('/');
      return;
    }
    setAccount(acct);
    resetForm();
  }

  function resetForm() {
    setRespType('');
    setCurrency(null);
    setAmount('');
    setMethod(null);
    setSelectedBank(null);
    setSigned(false);
    setJointSigned(false);
    setConfirmChecked(false);
    setShowSummary(false);
    setBeneficiary(null);
    setResidency(null);
    setInstitutionName('');
    setInstitutionAddress('');
    setProgramType(null);
    setProgramTypeOther('');
    setEnrollmentStatus(null);
    setProgramName('');
    setProgramStartDate('');
    setProgramLength('');
    setCurrentYear('');
    setWeeksPerSemester('');
    setWithdrawalScope(null);
    setDistribution(null);
    setEapSpecificAmount('');
    setPseSpecificAmount('');
    setFundsRecipient(null);
    setBeneficiaryConsent(false);
    setProofFile(null);
    setProofConfirmed(false);
    setCapPurpose(null);
    setCapAmount('');
    setCapPriorEAP(null);
    setCapComments('');
    setCapFeeAck(false);
    resetAIP();
  }

  function resetAipQuestionnaire() {
    setAipChoice(null);
    setAipProvince('');
    setAipTotalAIP('');
    setAipContribRRSP(null);
    setAipRRSPAmount('');
    setAipPriorRRSP(null);
    setAipPriorRRSPAmount('');
    setAipRelationship(null);
    setAipTransferDest(null);
    setAipDestInstitution('');
    setAipDestAccount('');
    setAipTransferAmount('');
    setAipWithinLimit(null);
    setAipPriorTransfers(null);
    setAipPriorTransferAmount('');
    setAipCloseAck(false);
  }

  function resetAIP() {
    setAipResident(null);
    resetAipQuestionnaire();
  }

  const bd = account?.respBreakdown;
  const contribCad = bd ? bd.contributions.cad : 0;
  const contribUsd = bd ? bd.contributions.usd : 0;
  const growthCad = bd ? bd.investmentGrowth.cad : 0;
  const growthUsd = bd ? bd.investmentGrowth.usd : 0;
  const grantsCad = bd ? bd.grants.cad : 0;
  const grantsUsd = bd ? bd.grants.usd : 0;

  const totalCad = contribCad + growthCad + grantsCad;
  const totalUsd = contribUsd + growthUsd + grantsUsd;
  const combinedTotalCad = totalCad + totalUsd * FX_RATE * (1 - FX_BUFFER);
  const combinedTotalUsd = totalCad / FX_RATE * (1 - FX_BUFFER) + totalUsd;

  const maxAmount = currency === 'CAD' ? combinedTotalCad : currency === 'USD' ? combinedTotalUsd : 0;
  const parsedAmount = parseFloat(amount) || 0;
  const exceedsAvailable = parsedAmount > maxAmount && parsedAmount > 0;
  const singleCurrencyBalance = currency === 'CAD' ? totalCad : currency === 'USD' ? totalUsd : 0;
  const triggersConversion = parsedAmount > singleCurrencyBalance && !exceedsAvailable && parsedAmount > 0;
  const fee = method === 'wire' ? (currency === 'USD' ? 30 : 20) : method === 'international_wire' ? 40 : 0;

  const isEAPPSE = respType === 'eap_pse';
  const isCapital = respType === 'capital';
  const isAIP = respType === 'aip';

  const combinedGrowthCad = growthCad + growthUsd * FX_RATE * (1 - FX_BUFFER);
  const combinedGrowthUsd = growthCad / FX_RATE * (1 - FX_BUFFER) + growthUsd;
  const aipMaxAmount = currency === 'CAD' ? combinedGrowthCad : currency === 'USD' ? combinedGrowthUsd : 0;
  const singleGrowthBalance = currency === 'CAD' ? growthCad : currency === 'USD' ? growthUsd : 0;
  const aipTriggersConversion = parsedAmount > singleGrowthBalance && parsedAmount <= aipMaxAmount && parsedAmount > 0;

  // T1172 calculation
  const t1172_line1 = parseFloat(aipTotalAIP) || 0;
  const t1172_line2 = aipContribRRSP === 'yes' ? (parseFloat(aipRRSPAmount) || 0) : 0;
  const t1172_line3 = 50000;
  const t1172_line4 = aipPriorRRSP === 'yes' ? (parseFloat(aipPriorRRSPAmount) || 0) : 0;
  const t1172_line5 = Math.max(0, t1172_line3 - t1172_line4);
  const t1172_line6 = Math.min(t1172_line2, t1172_line5);
  const t1172_line7 = Math.max(0, t1172_line1 - t1172_line6);
  const t1172_rate = aipProvince === 'Quebec' ? 0.12 : 0.20;
  const t1172_tax = t1172_line7 * t1172_rate;

  // T1171 lifetime check
  const rolloverAmount = parseFloat(aipTransferAmount) || 0;
  const priorTransferAmt = aipPriorTransfers === 'yes' ? (parseFloat(aipPriorTransferAmount) || 0) : 0;
  const lifetimeExceeded = rolloverAmount + priorTransferAmt > 50000;

  const combinedContribCad = contribCad + contribUsd * FX_RATE * (1 - FX_BUFFER);
  const combinedContribUsd = contribCad / FX_RATE * (1 - FX_BUFFER) + contribUsd;
  const capMaxAmount = currency === 'CAD' ? combinedContribCad : currency === 'USD' ? combinedContribUsd : 0;
  const capParsedAmount = parseFloat(capAmount) || 0;
  const capExceedsAvailable = capParsedAmount > capMaxAmount && capParsedAmount > 0;
  const singleContribBalance = currency === 'CAD' ? contribCad : currency === 'USD' ? contribUsd : 0;
  const capTriggersConversion = capParsedAmount > singleContribBalance && !capExceedsAvailable && capParsedAmount > 0;

  /** Intl: exclude `signed` here — RESP EAP/Capital/AIP collect subscriber signatures after this gate. */
  const bankReady =
    method === 'international_wire'
      ? !!(selectedBank && intlWire.bankName && intlWire.swiftCode)
      : !!selectedBank;

  const selectedBeneficiary = account?.respBeneficiaries?.find((b) => b.id === beneficiary) || null;
  const hasJoint = !!account?.jointSubscriber;

  const AGE_OF_MAJORITY_19 = ['BC', 'NB', 'NL', 'NT', 'NS', 'NU', 'YT'];
  const beneficiaryProvince = selectedBeneficiary?.province || 'ON';
  const beneficiaryAge = (() => {
    if (!selectedBeneficiary?.dateOfBirth) return null;
    const dob = new Date(selectedBeneficiary.dateOfBirth);
    if (isNaN(dob.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
    return age;
  })();
  const majorityAge = AGE_OF_MAJORITY_19.includes(beneficiaryProvince) ? 19 : 18;
  const beneficiaryIsMajor = beneficiaryAge !== null && beneficiaryAge >= majorityAge;
  const needsBeneficiaryConsent = fundsRecipient === 'subscriber' && beneficiaryIsMajor;

  const residencyOk = residency === 'resident';
  const beneficiaryReady = !!beneficiary && residencyOk;
  const amountReady = parsedAmount > 0 && !exceedsAvailable;
  const educationReady = !!institutionName && !!institutionAddress && !!programType && !!enrollmentStatus && !!programName && !!programStartDate;

  const eapCad = growthCad + grantsCad;
  const eapUsd = growthUsd + grantsUsd;
  const combinedEapCad = eapCad + eapUsd * FX_RATE * (1 - FX_BUFFER);
  const combinedEapUsd = eapCad / FX_RATE * (1 - FX_BUFFER) + eapUsd;
  const eapAvailable = currency === 'CAD' ? combinedEapCad : currency === 'USD' ? combinedEapUsd : 0;

  const withinFirst13Weeks = (() => {
    if (!programStartDate) return true;
    const parts = programStartDate.split('/');
    if (parts.length !== 3) return true;
    const start = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
    if (isNaN(start.getTime())) return true;
    const weeks = (Date.now() - start.getTime()) / (7 * 24 * 60 * 60 * 1000);
    return weeks < 13;
  })();

  const eapPseLimit = enrollmentStatus === 'part_time'
    ? (currency === 'USD' ? 4000 / FX_RATE : 4000)
    : withinFirst13Weeks
      ? (currency === 'USD' ? 8000 / FX_RATE : 8000)
      : Infinity;

  const eapPseMax = eapPseLimit !== Infinity ? Math.min(eapPseLimit, maxAmount) : maxAmount;
  const proofReady = proofFile && proofConfirmed;
  const signaturesReady = signed && (!hasJoint || jointSigned);

  const consentReady = !needsBeneficiaryConsent || beneficiaryConsent;
  const canContinueEAPPSE =
    isEAPPSE && currency && amountReady && method && bankReady &&
    beneficiaryReady && educationReady && fundsRecipient && consentReady && proofReady && signaturesReady && confirmChecked;

  const canContinueCapital =
    isCapital && currency && capParsedAmount > 0 && !capExceedsAvailable && method && bankReady &&
    capPurpose === 'capital' && capPriorEAP !== null && capFeeAck && signaturesReady && confirmChecked;

  const aipWithdrawalReady =
    aipChoice === 'withdrawal' && aipProvince && t1172_line1 > 0 &&
    (aipContribRRSP === 'no' || (aipContribRRSP === 'yes' && parseFloat(aipRRSPAmount) >= 0)) &&
    (aipPriorRRSP === 'no' || (aipPriorRRSP === 'yes' && parseFloat(aipPriorRRSPAmount) >= 0));

  const aipRolloverReady =
    aipChoice === 'rollover' &&
    aipRelationship && aipRelationship !== 'none' &&
    aipTransferDest && aipTransferDest !== 'cash' &&
    aipDestInstitution && aipDestAccount &&
    rolloverAmount > 0 && aipWithinLimit === 'yes' &&
    !lifetimeExceeded &&
    (aipPriorTransfers !== null);

  const canContinueAIP =
    isAIP &&
    currency &&
    parsedAmount > 0 &&
    !exceedsAvailable &&
    method &&
    bankReady &&
    (aipResident === 'yes' || aipResident === 'no') &&
    (aipWithdrawalReady || aipRolloverReady) &&
    aipCloseAck &&
    signaturesReady &&
    confirmChecked;

  function handleSubmit() {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (submitted && account) {
    return (
      <div className="flex flex-col min-h-0">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center px-6">
            <div className="size-16 rounded-full bg-qt-green-bg flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-qt-green" />
            </div>
            <h2 className="font-display text-[28px] leading-[38px] text-qt-primary mb-3">
              Withdrawal submitted
            </h2>
            <p className="text-base text-qt-secondary leading-6 mb-2">
              Your RESP {isCapital ? 'Capital Withdrawal' : isAIP ? 'Accumulated Income Payment' : 'EAP & PSE withdrawal'} request has been submitted.
            </p>
            <p className="text-sm text-qt-secondary leading-[22px] mb-8">
              Processing typically takes 1-3 business days. You'll receive a confirmation email shortly.
            </p>
            <Button onClick={() => { setSubmitted(false); setAccount(null); resetForm(); navigate('/'); }}>
              Start new withdrawal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0">
      {showSummary && account && renderSummary()}
      <main className="flex-1">
        <div className="max-w-[680px] mx-auto w-full px-6 py-10">
          <h1 className="font-display text-[28px] leading-[38px] text-qt-primary mb-6">
            Withdraw funds
          </h1>

          <div className="flex flex-col gap-8">
            {/* Account Dropdown */}
            <section>
              <AccountDropdown value={account?.id || null} onChange={handleAccountChange} />
            </section>

            {/* Balance Card with RESP breakdown */}
            <WizardSection visible={!!account}>
              <section>
                {account && bd && <RESPBalanceCard account={account} />}
              </section>
            </WizardSection>

            {/* Withdrawal Type */}
            <WizardSection visible={!!account}>
              <section>
                <RESPTypeDropdown
                  value={respType}
                  onChange={(v) => {
                    setRespType(v);
                    setCurrency(null);
                    setAmount('');
                    setMethod(null);
                    setSelectedBank(null);
                    setSigned(false);
                    setJointSigned(false);
                    setConfirmChecked(false);
                    setBeneficiary(null);
                    setResidency(null);
                    setInstitutionName('');
                    setInstitutionAddress('');
                    setProgramType(null);
                    setProgramTypeOther('');
                    setEnrollmentStatus(null);
                    setProgramName('');
                    setProgramStartDate('');
                    setProgramLength('');
                    setCurrentYear('');
                    setWeeksPerSemester('');
                    setWithdrawalScope(null);
                    setDistribution(null);
                    setEapSpecificAmount('');
                    setPseSpecificAmount('');
                    setFundsRecipient(null);
                    setProofFile(null);
                    setProofConfirmed(false);
                    setCapPurpose(null);
                    setCapAmount('');
                    setCapPriorEAP(null);
                    setCapComments('');
                    setCapFeeAck(false);
                    resetAIP();
                  }}
                />
              </section>
            </WizardSection>

            {/* EAP & PSE Info */}
            <WizardSection visible={isEAPPSE}>
              <section className="flex flex-col gap-4">
                <InfoBox variant="info">
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="font-semibold mb-1">Source of funds</p>
                      <ul className="text-sm list-disc ml-5 flex flex-col gap-1">
                        <li><strong>EAP (Educational Assistance Payment):</strong> Investment Growth + Grants</li>
                        <li><strong>PSE (Post-Secondary Education):</strong> Contributions</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">EAP withdrawal limits</p>
                      <p className="text-sm">
                        Full-time studies are limited to <strong>$8,000</strong> in EAP within the first 13 weeks of the beneficiary's post-secondary program. Part-time studies are limited to <strong>$4,000</strong> in EAP per withdrawal.
                      </p>
                      <p className="text-sm mt-1">
                        After 13 weeks, full-time students can withdraw any amount of EAP provided they remain enrolled. There are no limits on PSE (contribution) withdrawals.
                      </p>
                    </div>
                  </div>
                </InfoBox>
              </section>
            </WizardSection>

            {/* Currency Selection */}
            <WizardSection visible={isEAPPSE}>
              <section>
                <CurrencySelector
                  value={currency}
                  onChange={(c) => { setCurrency(c); setAmount(''); }}
                  cadAmount={combinedTotalCad}
                  usdAmount={combinedTotalUsd}
                />
              </section>
            </WizardSection>

            {/* EAP/PSE Questionnaire */}
            <WizardSection visible={isEAPPSE && !!currency}>
              <section className="flex flex-col gap-6">

                {/* Section 1: Account & Personal Information */}
                <QuestionGroup title="Account & Personal Information" step={1} totalSteps={5}>
                  <div className="bg-qt-bg-3 rounded-lg p-4 flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-qt-secondary">Subscriber</span>
                      <span className="text-sm font-semibold text-qt-primary">{account?.subscriberName}</span>
                    </div>
                    {hasJoint && (
                      <div className="flex justify-between">
                        <span className="text-xs text-qt-secondary">Joint subscriber</span>
                        <span className="text-sm font-semibold text-qt-primary">{account?.jointSubscriber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-xs text-qt-secondary">Account number</span>
                      <span className="text-sm font-semibold text-qt-primary">{account?.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-qt-secondary">Date</span>
                      <span className="text-sm font-semibold text-qt-primary">{new Date().toLocaleDateString('en-CA')}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
                      Who is the beneficiary for this withdrawal?
                    </p>
                    <div className="flex flex-col gap-3">
                      {account?.respBeneficiaries?.map((b) => (
                        <RadioButton
                          key={b.id}
                          name="resp-beneficiary"
                          value={b.id}
                          label={`${b.firstName} ${b.lastName}`}
                          checked={beneficiary === b.id}
                          onChange={() => { setBeneficiary(b.id); setResidency(null); }}
                        />
                      ))}
                    </div>
                    {selectedBeneficiary && (
                      <div className="mt-3 bg-white border border-qt-border rounded-lg p-3">
                        <span className="text-xs text-qt-secondary">SIN: </span>
                        <span className="text-sm font-semibold text-qt-primary">{selectedBeneficiary.sin}</span>
                      </div>
                    )}
                  </div>

                  {beneficiary && (
                    <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                      <p className="text-sm text-qt-primary leading-[22px] mb-2 font-semibold">
                        Beneficiary residency status
                      </p>
                      <p className="text-xs text-qt-secondary mb-3 italic">
                        Beneficiaries studying abroad are considered Canadian residents. EAP and PSE withdrawals are ineligible if the beneficiary is a non-resident.
                      </p>
                      <div className="flex gap-6">
                        <RadioButton name="resp-residency" value="resident" label="Resident" checked={residency === 'resident'} onChange={() => setResidency('resident')} />
                        <RadioButton name="resp-residency" value="non_resident" label="Non-Resident" checked={residency === 'non_resident'} onChange={() => setResidency('non_resident')} />
                      </div>
                      {residency === 'non_resident' && (
                        <div className="mt-3">
                          <InfoBox variant="error">
                            <p><strong>Not eligible.</strong> EAP and PSE withdrawals are ineligible for non-resident beneficiaries.</p>
                          </InfoBox>
                        </div>
                      )}
                    </div>
                  )}
                </QuestionGroup>

                {/* Section 2: Post-Secondary Education Details */}
                {residencyOk && (
                  <QuestionGroup
                    title="Post-Secondary Education Details"
                    step={2}
                    totalSteps={5}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <InputField label="Educational institution name" placeholder="e.g. University of Toronto" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <InputField label="Institution address (postal code required)" placeholder="e.g. 27 King's College Cir, Toronto ON M5S 1A1" value={institutionAddress} onChange={(e) => setInstitutionAddress(e.target.value)} />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">Post-secondary program type</p>
                      <div className="grid grid-cols-2 gap-3">
                        <RadioButton name="program-type" value="university" label="University" checked={programType === 'university'} onChange={() => { setProgramType('university'); setProgramTypeOther(''); }} />
                        <RadioButton name="program-type" value="cegep" label="CÉGEP / Community College" checked={programType === 'cegep'} onChange={() => { setProgramType('cegep'); setProgramTypeOther(''); }} />
                        <RadioButton name="program-type" value="career" label="Career College" checked={programType === 'career'} onChange={() => { setProgramType('career'); setProgramTypeOther(''); }} />
                        <RadioButton name="program-type" value="other" label="Other" checked={programType === 'other'} onChange={() => setProgramType('other')} />
                      </div>
                      {programType === 'other' && (
                        <div className="mt-3 animate-[fadeSlideIn_0.3s_ease-out]">
                          <InputField label="Please specify" placeholder="e.g. Trade school" value={programTypeOther} onChange={(e) => setProgramTypeOther(e.target.value)} />
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">Enrollment status</p>
                      <div className="flex gap-6">
                        <RadioButton name="enrollment-status" value="full_time" label="Full-time" checked={enrollmentStatus === 'full_time'} onChange={() => setEnrollmentStatus('full_time')} />
                        <RadioButton name="enrollment-status" value="part_time" label="Part-time" checked={enrollmentStatus === 'part_time'} onChange={() => setEnrollmentStatus('part_time')} />
                      </div>
                      {enrollmentStatus && (
                        <div className="mt-3">
                          <InfoBox variant="info">
                            <p>
                              {enrollmentStatus === 'full_time'
                                ? 'Full-time studies are limited to $8,000 in EAP within the first 13 weeks of enrollment. After 13 weeks, the full EAP amount can be withdrawn.'
                                : 'Part-time studies are limited to $4,000 in EAP per withdrawal.'}
                            </p>
                          </InfoBox>
                        </div>
                      )}
                    </div>

                    <InputField label="Program name / Field of study" placeholder="e.g. Bachelor of Computer Science" value={programName} onChange={(e) => setProgramName(e.target.value)} />

                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Program start date (MM/DD/YYYY)" placeholder="e.g. 09/01/2025" value={programStartDate} onChange={(e) => setProgramStartDate(e.target.value)} />
                      <InputField label="Program length (years)" placeholder="e.g. 4" value={programLength} onChange={(e) => setProgramLength(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Current year of program" placeholder="e.g. 1st, 2nd, 3rd" value={currentYear} onChange={(e) => setCurrentYear(e.target.value)} />
                      <InputField label="Weeks per semester" placeholder="e.g. 15" value={weeksPerSemester} onChange={(e) => setWeeksPerSemester(e.target.value)} />
                    </div>
                  </QuestionGroup>
                )}

                {/* Section 3: Withdrawal Details */}
                {residencyOk && educationReady && (
                  <QuestionGroup
                    title="Withdrawal Details"
                    step={3}
                    totalSteps={5}
                  >
                    <div>
                      <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
                        I would like my withdrawal to be done in:
                      </p>
                      <div className="flex gap-6">
                        <RadioButton name="resp-scope" value="full" label="Full" checked={withdrawalScope === 'full'} onChange={() => { setWithdrawalScope('full'); setAmount(eapPseMax.toFixed(2)); }} />
                        <RadioButton name="resp-scope" value="partial" label="Partial" checked={withdrawalScope === 'partial'} onChange={() => { setWithdrawalScope('partial'); setAmount(''); }} />
                      </div>
                    </div>

                    {withdrawalScope && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                        {withdrawalScope === 'partial' ? (
                          <CurrencyInput
                            label="Withdrawal amount"
                            value={amount}
                            onChange={setAmount}
                            max={eapPseMax}
                            maxLabel={eapPseLimit !== Infinity ? `${formatCurrency(eapPseLimit, currency!)} (${enrollmentStatus === 'part_time' ? 'part-time' : 'first 13 weeks'} limit)` : undefined}
                            error={exceedsAvailable ? `Amount exceeds available balance of ${formatCurrency(maxAmount, currency!)}` : parsedAmount > eapPseMax && parsedAmount > 0 ? `Amount exceeds the ${formatCurrency(eapPseLimit, currency!)} limit for ${enrollmentStatus === 'part_time' ? 'part-time' : 'full-time (first 13 weeks)'} students` : undefined}
                          />
                        ) : (
                          <div className="bg-qt-bg-3 rounded-lg p-4">
                            <p className="text-xs text-qt-secondary mb-1">Full withdrawal amount</p>
                            <p className="text-lg font-semibold text-qt-primary">{formatCurrency(eapPseMax, currency!)}</p>
                            {eapPseLimit !== Infinity && eapPseLimit < maxAmount && (
                              <p className="text-xs text-qt-secondary mt-1">
                                Capped at {formatCurrency(eapPseLimit, currency!)} ({enrollmentStatus === 'part_time' ? 'part-time' : 'first 13 weeks'} limit)
                              </p>
                            )}
                          </div>
                        )}
                        {triggersConversion && (
                          <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
                            <p className="text-sm text-amber-800">Your request exceeds your {currency} balance. An automatic currency conversion will be applied to cover the difference.</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="border-t border-qt-border pt-4">
                      <p className="text-xs text-qt-secondary italic leading-relaxed">
                        The funds will be automatically withdrawn from your EAP amount prior to the PSE amount, unless otherwise specified below. Any EAP amounts withdrawn will generate a T4A slip under the beneficiary's name.
                      </p>
                    </div>

                    {amountReady && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                        <p className="text-sm text-qt-primary leading-[22px] mb-2 font-semibold">
                          How would you like the funds distributed?
                        </p>
                        <div className="flex flex-col gap-3">
                          <RadioButton name="resp-distribution" value="auto" label="Automatic (EAP first, then PSE)" checked={distribution === 'auto'} onChange={() => { setDistribution('auto'); setEapSpecificAmount(''); setPseSpecificAmount(''); }} />
                          <RadioButton name="resp-distribution" value="specify" label="I want to specify the exact EAP and PSE amounts" checked={distribution === 'specify'} onChange={() => setDistribution('specify')} />
                        </div>
                      </div>
                    )}

                    {distribution === 'specify' && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out] flex flex-col gap-4 ml-5 pl-4 border-l-2 border-qt-border">
                        <CurrencyInput label="EAP amount requested" value={eapSpecificAmount} onChange={setEapSpecificAmount} />
                        <CurrencyInput label="PSE amount requested" value={pseSpecificAmount} onChange={setPseSpecificAmount} />
                      </div>
                    )}
                  </QuestionGroup>
                )}

                {/* Section 4: Payment Direction */}
                {amountReady && (distribution === 'auto' || distribution === 'specify') && (
                  <QuestionGroup title="Payment Direction" step={4} totalSteps={5}>
                    <div>
                      <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">The funds are being sent to:</p>
                      <div className="flex gap-6">
                        <RadioButton name="resp-recipient" value="subscriber" label="Subscriber" checked={fundsRecipient === 'subscriber'} onChange={() => { setFundsRecipient('subscriber'); setBeneficiaryConsent(false); }} />
                        <RadioButton name="resp-recipient" value="beneficiary" label="Beneficiary" checked={fundsRecipient === 'beneficiary'} onChange={() => { setFundsRecipient('beneficiary'); setBeneficiaryConsent(false); }} />
                      </div>
                    </div>

                    {fundsRecipient === 'subscriber' && beneficiaryIsMajor && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out] border border-qt-border rounded-lg p-4 bg-qt-bg-3">
                        <p className="text-sm font-semibold text-qt-primary mb-1">Beneficiary consent required</p>
                        <p className="text-xs text-qt-secondary mb-3">
                          {selectedBeneficiary?.firstName} {selectedBeneficiary?.lastName} is {beneficiaryAge} years old and has reached the age of majority ({majorityAge}) in {beneficiaryProvince}. The beneficiary must consent to the funds being deposited into the subscriber's account.
                        </p>
                        <ESignature
                          onSign={() => setBeneficiaryConsent(true)}
                          signed={beneficiaryConsent}
                          label={`${selectedBeneficiary?.firstName} ${selectedBeneficiary?.lastName} — Beneficiary initials`}
                        />
                      </div>
                    )}

                    {fundsRecipient && consentReady && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                        <p className="text-sm text-qt-primary leading-[22px] mb-2 font-semibold">Deposit account</p>
                        <BankSelector value={selectedBank} onChange={setSelectedBank} allBanks={allBanks} onBanksChange={setAllBanks} />
                      </div>
                    )}

                    {fundsRecipient && consentReady && selectedBank && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                        <p className="text-sm text-qt-primary leading-[22px] mb-2 font-semibold">Payment method</p>
                        <MethodSelector
                          value={method}
                          onChange={setMethod}
                          currency={currency}
                          methodDisabled={methodDisabled}
                        />
                      </div>
                    )}

                    {fundsRecipient && consentReady && selectedBank && method === 'international_wire' && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                        <InternationalWireForm currency={currency || 'CAD'} amount={amount} data={intlWire} onChange={setIntlWire} />
                      </div>
                    )}
                  </QuestionGroup>
                )}

                {/* Section 5: Documents & Signatures */}
                {!!bankReady && fundsRecipient && (
                  <QuestionGroup title="Signatures & Authorization" step={5} totalSteps={5}>
                    <div>
                      <p className="text-sm text-qt-primary leading-[22px] mb-2 font-semibold">Proof of enrollment</p>
                      <p className="text-xs text-qt-secondary mb-3">
                        Upload proof of enrollment from the beneficiary's institution (must be issued within the last six months).
                      </p>
                      <FileUpload file={proofFile} onFileChange={setProofFile} />
                      {proofFile && (
                        <label className="flex items-start gap-3 cursor-pointer mt-4">
                          <input type="checkbox" checked={proofConfirmed} onChange={(e) => setProofConfirmed(e.target.checked)} className="mt-1 size-4 accent-qt-green cursor-pointer" />
                          <span className="text-sm text-qt-primary leading-[22px]">I confirm I have uploaded valid Proof of Enrollment (issued within the last six months)</span>
                        </label>
                      )}
                    </div>

                    {proofReady && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out] flex flex-col gap-6">
                        <div>
                          <p className="text-sm text-qt-primary leading-[22px] mb-1 font-semibold">Subscriber signature</p>
                          <ESignature onSign={() => setSigned(true)} signed={signed} />
                        </div>
                        {hasJoint && (
                          <div>
                            <p className="text-sm text-qt-primary leading-[22px] mb-1 font-semibold">Joint subscriber signature</p>
                            <ESignature onSign={() => setJointSigned(true)} signed={jointSigned} />
                          </div>
                        )}
                      </div>
                    )}

                    {signaturesReady && proofReady && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                        <div className="border border-qt-border rounded-lg p-5 bg-white">
                          <p className="text-sm text-qt-primary leading-[22px] mb-4 italic">
                            I hereby request a withdrawal as detailed above. I confirm that the information provided is true and accurate.
                          </p>
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)} className="mt-1 size-4 accent-qt-green cursor-pointer" />
                            <span className="text-sm font-semibold text-qt-primary leading-[22px]">I agree</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </QuestionGroup>
                )}
              </section>
            </WizardSection>

            {/* Continue - EAP & PSE */}
            <WizardSection visible={!!canContinueEAPPSE}>
              <div className="flex gap-3 pt-2 border-t border-qt-border">
                <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
                <Button onClick={() => { setShowSummary(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Continue
                </Button>
              </div>
            </WizardSection>

            {/* ========== CAPITAL WITHDRAWAL FLOW ========== */}

            {/* Capital Info */}
            <WizardSection visible={isCapital}>
              <section>
                <InfoBox variant="info">
                  <p><strong>Source of funds:</strong> Contributions</p>
                </InfoBox>
              </section>
            </WizardSection>

            {/* Capital Currency Selection */}
            <WizardSection visible={isCapital}>
              <section>
                <CurrencySelector
                  value={currency}
                  onChange={(c) => { setCurrency(c); setCapAmount(''); setAmount(''); }}
                  cadAmount={combinedContribCad}
                  usdAmount={combinedContribUsd}
                />
              </section>
            </WizardSection>

            {/* Capital Amount */}
            <WizardSection visible={isCapital && !!currency}>
              <section>
                <CurrencyInput
                  label="Gross withdrawal amount"
                  value={amount}
                  onChange={(v) => { setAmount(v); setCapAmount(v); }}
                  error={exceedsAvailable ? `Amount exceeds available contributions of ${formatCurrency(capMaxAmount, currency!)}` : undefined}
                  max={capMaxAmount}
                />
                {capTriggersConversion && (
                  <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
                    <p className="text-sm text-amber-800">Your request exceeds your {currency} balance. An automatic currency conversion will be applied to cover the difference.</p>
                  </div>
                )}
              </section>
            </WizardSection>

            {/* Capital deposit bank */}
            <WizardSection visible={isCapital && parsedAmount > 0 && !exceedsAvailable}>
              <section>
                <BankSelector
                  value={selectedBank}
                  onChange={setSelectedBank}
                  allBanks={allBanks}
                  onBanksChange={setAllBanks}
                />
              </section>
            </WizardSection>

            {/* Capital method */}
            <WizardSection visible={isCapital && parsedAmount > 0 && !exceedsAvailable && !!selectedBank}>
              <section>
                <MethodSelector
                  value={method}
                  onChange={setMethod}
                  currency={currency}
                  methodDisabled={methodDisabled}
                />
              </section>
            </WizardSection>

            {/* Capital International Wire */}
            <WizardSection visible={isCapital && method === 'international_wire'}>
              <section>
                <InternationalWireForm
                  currency={currency || 'CAD'}
                  amount={amount}
                  data={intlWire}
                  onChange={setIntlWire}
                />
              </section>
            </WizardSection>

            {/* Capital Questionnaire */}
            <WizardSection visible={isCapital && !!bankReady}>
              <section className="flex flex-col gap-6">
                <p className="font-semibold text-base text-qt-primary leading-6">Withdrawal details</p>

                {/* Pre-filled info */}
                <div className="bg-qt-bg-3 rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-qt-secondary">Subscriber</span>
                    <span className="text-sm font-semibold text-qt-primary">{account?.subscriberName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-qt-secondary">Account number</span>
                    <span className="text-sm font-semibold text-qt-primary">{account?.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-qt-secondary">Social Insurance Number</span>
                    <span className="text-sm font-semibold text-qt-primary">*** *** ***</span>
                  </div>
                </div>

                {/* Q1: Purpose */}
                <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                  <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
                    Are these funds meant to pay for post-secondary education?
                  </p>
                  <div className="flex flex-col gap-3">
                    <RadioButton
                      name="cap-purpose"
                      value="education"
                      label="Yes"
                      checked={capPurpose === 'education'}
                      onChange={() => { setCapPurpose('education'); setCapPriorEAP(null); }}
                    />
                    <RadioButton
                      name="cap-purpose"
                      value="capital"
                      label="No, I am just withdrawing my original capital"
                      checked={capPurpose === 'capital'}
                      onChange={() => { setCapPurpose('capital'); }}
                    />
                  </div>
                  {capPurpose === 'education' && (
                    <div className="mt-3 animate-[fadeSlideIn_0.3s_ease-out]">
                      <InfoBox variant="warning">
                        <p>Please fill out the standard <strong>RESP Withdrawal Request Form</strong> instead to ensure you receive your educational grants.</p>
                      </InfoBox>
                    </div>
                  )}
                </div>

                {/* Q3: Prior EAP */}
                {capPurpose === 'capital' && capParsedAmount > 0 && !capExceedsAvailable && (
                  <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                    <p className="text-sm text-qt-primary leading-[22px] mb-2 font-semibold">
                      Has the beneficiary of this account previously received an Educational Assistance Payment (EAP)?
                    </p>
                    <p className="text-xs text-qt-secondary mb-3 italic">
                      An EAP is a withdrawal that includes government grants and investment earnings, typically used when the beneficiary is actively in school.
                    </p>
                    <div className="flex flex-col gap-3">
                      <RadioButton
                        name="cap-prior-eap"
                        value="yes"
                        label="Yes"
                        checked={capPriorEAP === 'yes'}
                        onChange={() => setCapPriorEAP('yes')}
                      />
                      <RadioButton
                        name="cap-prior-eap"
                        value="no"
                        label="No"
                        checked={capPriorEAP === 'no'}
                        onChange={() => setCapPriorEAP('no')}
                      />
                    </div>
                    {capPriorEAP === 'yes' && (
                      <div className="mt-3 animate-[fadeSlideIn_0.3s_ease-out]">
                        <InfoBox variant="success">
                          <p>Because the beneficiary has previously received an EAP, you may withdraw your capital without having to return the Canada Education Savings Grant (CESG).</p>
                        </InfoBox>
                      </div>
                    )}
                    {capPriorEAP === 'no' && (
                      <div className="mt-3 animate-[fadeSlideIn_0.3s_ease-out]">
                        <InfoBox variant="warning">
                          <p>Because an EAP has not been received, any grants received on the contributions you are withdrawing must be returned to HRSDC.</p>
                        </InfoBox>
                      </div>
                    )}
                  </div>
                )}

                {/* Q4: Comments */}
                {capPriorEAP !== null && (
                  <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                    <InputField
                      label="Do you have any additional comments regarding this withdrawal? (Optional)"
                      value={capComments}
                      onChange={(e) => setCapComments(e.target.value)}
                      placeholder="Enter any additional comments..."
                    />
                  </div>
                )}

                {/* Fee Acknowledgment */}
                {capPriorEAP !== null && (
                  <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                    <div className="border border-qt-border rounded-lg p-5 bg-qt-bg-3">
                      <p className="text-sm text-qt-primary leading-[22px] mb-4">
                        I understand that administrative or de-registration fees may apply to this withdrawal request. Please visit our website for more information.
                      </p>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={capFeeAck}
                          onChange={(e) => setCapFeeAck(e.target.checked)}
                          className="mt-1 size-4 accent-qt-green cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-qt-primary leading-[22px]">
                          I acknowledge and agree
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Capital E-Signatures */}
                {capFeeAck && (
                  <div className="animate-[fadeSlideIn_0.3s_ease-out] flex flex-col gap-6">
                    <div>
                      <p className="text-sm text-qt-primary leading-[22px] mb-1 font-semibold">Subscriber signature</p>
                      <ESignature onSign={() => setSigned(true)} signed={signed} />
                    </div>
                    {hasJoint && (
                      <div>
                        <p className="text-sm text-qt-primary leading-[22px] mb-1 font-semibold">Joint subscriber's signature</p>
                        <ESignature onSign={() => setJointSigned(true)} signed={jointSigned} />
                      </div>
                    )}
                  </div>
                )}

                {/* Capital Certification */}
                {capFeeAck && signaturesReady && (
                  <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                    <div className="border border-qt-border rounded-lg p-5 bg-qt-bg-3">
                      <p className="text-sm text-qt-primary leading-[22px] mb-4">
                        I certify that the information I've provided is correct and complete, and I authorize this withdrawal from my RESP.
                      </p>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={confirmChecked}
                          onChange={(e) => setConfirmChecked(e.target.checked)}
                          className="mt-1 size-4 accent-qt-green cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-qt-primary leading-[22px]">
                          I agree
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </section>
            </WizardSection>

            {/* Continue - Capital */}
            <WizardSection visible={!!canContinueCapital}>
              <div className="flex gap-3 pt-2 border-t border-qt-border">
                <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
                <Button onClick={() => { setShowSummary(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Continue
                </Button>
              </div>
            </WizardSection>

            {/* ========== AIP FLOW ========== */}

            <WizardSection visible={isAIP}>
              <section>
                <InfoBox variant="info">
                  <p><strong>Source of funds:</strong> Investment Growth</p>
                </InfoBox>
              </section>
            </WizardSection>

            <WizardSection visible={isAIP}>
              <section>
                <CurrencySelector
                  value={currency}
                  onChange={(c) => { setCurrency(c); setAmount(''); }}
                  cadAmount={combinedGrowthCad}
                  usdAmount={combinedGrowthUsd}
                />
              </section>
            </WizardSection>

            <WizardSection visible={isAIP && !!currency}>
              <section>
                <CurrencyInput
                  label="Gross withdrawal amount"
                  value={amount}
                  onChange={setAmount}
                  error={parsedAmount > aipMaxAmount && parsedAmount > 0 ? `Amount exceeds available growth of ${formatCurrency(aipMaxAmount, currency!)}` : undefined}
                  max={aipMaxAmount}
                />
                {aipTriggersConversion && (
                  <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
                    <p className="text-sm text-amber-800">Your request exceeds your {currency} balance. An automatic currency conversion will be applied to cover the difference.</p>
                  </div>
                )}
              </section>
            </WizardSection>

            <WizardSection visible={isAIP && parsedAmount > 0 && parsedAmount <= aipMaxAmount}>
              <section>
                <BankSelector value={selectedBank} onChange={setSelectedBank} allBanks={allBanks} onBanksChange={setAllBanks} />
              </section>
            </WizardSection>

            <WizardSection visible={isAIP && parsedAmount > 0 && parsedAmount <= aipMaxAmount && !!selectedBank}>
              <section>
                <MethodSelector
                  value={method}
                  onChange={setMethod}
                  currency={currency}
                  methodDisabled={methodDisabled}
                />
              </section>
            </WizardSection>

            <WizardSection visible={isAIP && method === 'international_wire'}>
              <section>
                <InternationalWireForm currency={currency || 'CAD'} amount={amount} data={intlWire} onChange={setIntlWire} />
              </section>
            </WizardSection>

            {/* AIP Questionnaire */}
            <WizardSection visible={isAIP && !!bankReady}>
              <section className="flex flex-col gap-6">
                <p className="font-semibold text-base text-qt-primary leading-6">AIP details</p>

                <div className="bg-qt-bg-3 rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-qt-secondary">Name</span>
                    <span className="text-sm font-semibold text-qt-primary">{account?.subscriberName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-qt-secondary">Account number</span>
                    <span className="text-sm font-semibold text-qt-primary">{account?.accountNumber}</span>
                  </div>
                </div>

                {/* Residency */}
                <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                  <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">Are you currently a resident of Canada?</p>
                  <div className="flex gap-6">
                    <RadioButton
                      name="aip-resident"
                      value="yes"
                      label="Yes"
                      checked={aipResident === 'yes'}
                      onChange={() => {
                        resetAIP();
                        setAipResident('yes');
                      }}
                    />
                    <RadioButton
                      name="aip-resident"
                      value="no"
                      label="No"
                      checked={aipResident === 'no'}
                      onChange={() => {
                        setAipResident('no');
                        resetAipQuestionnaire();
                      }}
                    />
                  </div>
                  {aipResident === 'no' && (
                    <div className="mt-3 animate-[fadeSlideIn_0.3s_ease-out]">
                      <InfoBox variant="warning">
                        <p>
                          <strong>Note.</strong> AIP rules generally apply to Canadian residents. You can still complete this
                          section so we can capture your intent; eligibility will be confirmed during processing.
                        </p>
                      </InfoBox>
                    </div>
                  )}
                </div>

                {/* AIP Choice */}
                {(aipResident === 'yes' || aipResident === 'no') && (
                  <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                    <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">What would you like to do with the accumulated income (growth) in your RESP?</p>
                    <div className="flex flex-col gap-3">
                      <RadioButton name="aip-choice" value="withdrawal" label="AIP Withdrawal: I want the growth sent to my bank account or a non-RRSP Questrade account" checked={aipChoice === 'withdrawal'} onChange={() => setAipChoice('withdrawal')} />
                      <RadioButton name="aip-choice" value="rollover" label="AIP Rollover: I want to roll over the growth into my Questrade RRSP" checked={aipChoice === 'rollover'} onChange={() => setAipChoice('rollover')} />
                    </div>
                  </div>
                )}

                {/* ===== AIP WITHDRAWAL BRANCH (T1172) ===== */}
                {aipChoice === 'withdrawal' && (
                  <div className="animate-[fadeSlideIn_0.3s_ease-out] flex flex-col gap-6">
                    <InfoBox variant="warning">
                      <p className="text-sm">An Accumulated Income Payment (AIP) is subject to an additional tax of <strong>20%</strong> (or <strong>12%</strong> for residents of Quebec), on top of regular income tax. However, you can reduce this tax by rolling the funds into an RRSP, up to a lifetime limit of $50,000.</p>
                    </InfoBox>

                    <div>
                      <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">What province or territory did you reside in on December 31st of the tax year?</p>
                      <select value={aipProvince} onChange={(e) => setAipProvince(e.target.value)} className="w-full h-12 rounded-md border border-qt-gray-dark bg-white px-4 text-sm text-qt-primary appearance-none outline-none focus:border-qt-green cursor-pointer">
                        <option value="" disabled>Select province / territory</option>
                        {['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Northwest Territories','Nova Scotia','Nunavut','Ontario','Prince Edward Island','Quebec','Saskatchewan','Yukon'].map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    {aipProvince && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                        <CurrencyInput
                          label="What is the total amount of AIPs you received from your RESP this year?"
                          value={aipTotalAIP}
                          onChange={setAipTotalAIP}
                        />
                        <p className="text-xs text-qt-secondary mt-1 italic">You can find this amount in Box 040 of the T4A slip provided by your financial institution.</p>
                      </div>
                    )}

                    {t1172_line1 > 0 && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                        <p className="text-sm text-qt-primary leading-[22px] mb-2 font-semibold">Did you contribute any of these AIP funds into your RRSP, PRPP, or SPP?</p>
                        <p className="text-xs text-qt-secondary mb-3 italic">These contributions must have been made in the same year you received the AIP, or within the first 60 days of the following year.</p>
                        <div className="flex gap-6">
                          <RadioButton name="aip-contrib-rrsp" value="yes" label="Yes" checked={aipContribRRSP === 'yes'} onChange={() => setAipContribRRSP('yes')} />
                          <RadioButton name="aip-contrib-rrsp" value="no" label="No" checked={aipContribRRSP === 'no'} onChange={() => { setAipContribRRSP('no'); setAipRRSPAmount(''); }} />
                        </div>
                      </div>
                    )}

                    {aipContribRRSP === 'yes' && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                        <CurrencyInput
                          label="How much of those RRSP contributions do you want to use to reduce your AIP tax?"
                          value={aipRRSPAmount}
                          onChange={setAipRRSPAmount}
                        />
                        <p className="text-xs text-qt-secondary mt-1 italic">You must also deduct this exact amount on your main income tax return.</p>
                      </div>
                    )}

                    {(aipContribRRSP !== null) && t1172_line1 > 0 && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                        <p className="text-sm text-qt-primary leading-[22px] mb-2 font-semibold">Have you ever used an RRSP deduction to reduce the tax on an AIP in previous years?</p>
                        <div className="flex gap-6">
                          <RadioButton name="aip-prior-rrsp" value="yes" label="Yes" checked={aipPriorRRSP === 'yes'} onChange={() => setAipPriorRRSP('yes')} />
                          <RadioButton name="aip-prior-rrsp" value="no" label="No" checked={aipPriorRRSP === 'no'} onChange={() => { setAipPriorRRSP('no'); setAipPriorRRSPAmount(''); }} />
                        </div>
                      </div>
                    )}

                    {aipPriorRRSP === 'yes' && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                        <CurrencyInput
                          label="How much have you deducted in all previous years combined?"
                          value={aipPriorRRSPAmount}
                          onChange={setAipPriorRRSPAmount}
                        />
                      </div>
                    )}

                    {/* Tax calculation display */}
                    {aipPriorRRSP !== null && t1172_line1 > 0 && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out] border border-qt-border rounded-lg overflow-hidden">
                        <div className="px-5 py-3 bg-qt-bg-3 border-b border-qt-border">
                          <p className="font-semibold text-sm text-qt-primary">T1172 Tax Calculation</p>
                        </div>
                        <div className="divide-y divide-qt-border">
                          <TaxRow label="Total AIP (Line 1)" value={formatCurrency(t1172_line1, 'CAD')} />
                          <TaxRow label="RRSP Deduction (Line 2)" value={formatCurrency(t1172_line2, 'CAD')} />
                          <TaxRow label="Lifetime Maximum (Line 3)" value={formatCurrency(t1172_line3, 'CAD')} />
                          <TaxRow label="Previous Uses (Line 4)" value={formatCurrency(t1172_line4, 'CAD')} />
                          <TaxRow label="Remaining Limit (Line 5)" value={formatCurrency(t1172_line5, 'CAD')} />
                          <TaxRow label="Allowable Deduction (Line 6)" value={formatCurrency(t1172_line6, 'CAD')} />
                          <TaxRow label="AIP Subject to Tax (Line 7)" value={formatCurrency(t1172_line7, 'CAD')} />
                          <TaxRow label={`Tax Rate (Line 8) — ${aipProvince === 'Quebec' ? 'Quebec 12%' : '20%'}`} value={`${(t1172_rate * 100).toFixed(0)}%`} />
                          <div className="flex items-center justify-between px-5 py-3 bg-qt-bg-3">
                            <p className="font-semibold text-sm text-qt-primary">Additional Tax Owed (Line 9)</p>
                            <p className="font-semibold text-sm text-qt-red">{formatCurrency(t1172_tax, 'CAD')}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ===== AIP ROLLOVER BRANCH (T1171) ===== */}
                {aipChoice === 'rollover' && (
                  <div className="animate-[fadeSlideIn_0.3s_ease-out] flex flex-col gap-6">
                    <InfoBox variant="info">
                      <p className="text-sm">To roll over AIP funds into an RRSP and waive withholding tax, you must complete a CRA T1171 form. We'll guide you through the required information.</p>
                    </InfoBox>

                    <div className="bg-qt-bg-3 rounded-lg p-4 flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-qt-secondary">Name</span>
                        <span className="text-sm font-semibold text-qt-primary">{account?.subscriberName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-qt-secondary">SIN</span>
                        <span className="text-sm font-semibold text-qt-primary">*** *** ***</span>
                      </div>
                    </div>

                    {/* Relationship */}
                    <div>
                      <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">What is your relationship to this RESP account?</p>
                      <div className="flex flex-col gap-3">
                        <RadioButton name="aip-rel" value="original" label="I am the original subscriber of the plan" checked={aipRelationship === 'original'} onChange={() => setAipRelationship('original')} />
                        <RadioButton name="aip-rel" value="marriage" label="I acquired the rights to the plan due to a marriage or relationship breakdown" checked={aipRelationship === 'marriage'} onChange={() => setAipRelationship('marriage')} />
                        <RadioButton name="aip-rel" value="spouse_deceased" label="I am the spouse or common-law partner of the deceased original subscriber" checked={aipRelationship === 'spouse_deceased'} onChange={() => setAipRelationship('spouse_deceased')} />
                        <RadioButton name="aip-rel" value="none" label="None of the above" checked={aipRelationship === 'none'} onChange={() => setAipRelationship('none')} />
                      </div>
                      {aipRelationship === 'none' && (
                        <div className="mt-3 animate-[fadeSlideIn_0.3s_ease-out]">
                          <InfoBox variant="error">
                            <p><strong>Not eligible.</strong> You do not qualify for the withholding tax waiver. The financial institution must withhold tax on this withdrawal.</p>
                          </InfoBox>
                        </div>
                      )}
                    </div>

                    {/* Transfer destination */}
                    {aipRelationship && aipRelationship !== 'none' && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                        <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">Where are you transferring the AIP?</p>
                        <div className="flex flex-col gap-3">
                          <RadioButton name="aip-dest" value="own_rrsp" label="To my own RRSP, PRPP, or SPP" checked={aipTransferDest === 'own_rrsp'} onChange={() => setAipTransferDest('own_rrsp')} />
                          <RadioButton name="aip-dest" value="spouse_rrsp" label="To my spouse or common-law partner's RRSP or SPP" checked={aipTransferDest === 'spouse_rrsp'} onChange={() => setAipTransferDest('spouse_rrsp')} />
                          <RadioButton name="aip-dest" value="cash" label="To a non-registered account / Cash withdrawal" checked={aipTransferDest === 'cash'} onChange={() => setAipTransferDest('cash')} />
                        </div>
                        {aipTransferDest === 'cash' && (
                          <div className="mt-3 animate-[fadeSlideIn_0.3s_ease-out]">
                            <InfoBox variant="error">
                              <p><strong>Not eligible.</strong> You cannot use Form T1171 to waive tax on cash withdrawals. Standard withholding tax will apply.</p>
                            </InfoBox>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Destination details */}
                    {aipTransferDest && aipTransferDest !== 'cash' && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out] flex flex-col gap-4">
                        <p className="text-sm text-qt-primary leading-[22px] font-semibold">Destination account details</p>
                        <InputField label="Name of the financial institution" value={aipDestInstitution} onChange={(e) => setAipDestInstitution(e.target.value)} placeholder="e.g. Questrade" />
                        <InputField label="RRSP/PRPP/SPP account or contract number" value={aipDestAccount} onChange={(e) => setAipDestAccount(e.target.value)} placeholder="e.g. 26958737" />
                      </div>
                    )}

                    {/* Transfer amount */}
                    {aipDestInstitution && aipDestAccount && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                        <CurrencyInput
                          label="How much of your AIP are you transferring to this retirement account?"
                          value={aipTransferAmount || amount}
                          onChange={(v) => { setAipTransferAmount(v); setAmount(v); }}
                        />
                      </div>
                    )}

                    {/* Within RRSP limit */}
                    {rolloverAmount > 0 && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                        <p className="text-sm text-qt-primary leading-[22px] mb-2 font-semibold">Does this transfer amount fit within your available RRSP deduction limit for this tax year?</p>
                        <p className="text-xs text-qt-secondary mb-3 italic">You can find your RRSP deduction limit on your most recent Notice of Assessment from the CRA.</p>
                        <div className="flex gap-6">
                          <RadioButton name="aip-within" value="yes" label="Yes" checked={aipWithinLimit === 'yes'} onChange={() => setAipWithinLimit('yes')} />
                          <RadioButton name="aip-within" value="no" label="No" checked={aipWithinLimit === 'no'} onChange={() => setAipWithinLimit('no')} />
                        </div>
                        {aipWithinLimit === 'no' && (
                          <div className="mt-3 animate-[fadeSlideIn_0.3s_ease-out]">
                            <InfoBox variant="error">
                              <p><strong>Warning.</strong> The financial institution is required to withhold tax on any amount that exceeds your available RRSP deduction limit. You can only waive the tax up to your available limit.</p>
                            </InfoBox>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Lifetime $50K limit */}
                    {aipWithinLimit === 'yes' && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                        <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">Have you previously transferred AIPs to an RRSP to reduce your taxes?</p>
                        <div className="flex gap-6">
                          <RadioButton name="aip-prior-xfer" value="no" label="No" checked={aipPriorTransfers === 'no'} onChange={() => { setAipPriorTransfers('no'); setAipPriorTransferAmount(''); }} />
                          <RadioButton name="aip-prior-xfer" value="yes" label="Yes" checked={aipPriorTransfers === 'yes'} onChange={() => setAipPriorTransfers('yes')} />
                        </div>
                      </div>
                    )}

                    {aipPriorTransfers === 'yes' && (
                      <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                        <CurrencyInput
                          label="What is the total amount you have transferred in all previous years combined?"
                          value={aipPriorTransferAmount}
                          onChange={setAipPriorTransferAmount}
                        />
                        {lifetimeExceeded && (
                          <div className="mt-3">
                            <InfoBox variant="error">
                              <p><strong>Warning.</strong> The lifetime limit for this tax waiver is $50,000. Your request exceeds this limit. Tax must be withheld on the excess amount.</p>
                            </InfoBox>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Close RESP acknowledgment */}
                {((aipWithdrawalReady) || (aipRolloverReady) || (aipChoice === 'rollover' && aipPriorTransfers === 'no' && aipWithinLimit === 'yes' && !lifetimeExceeded && aipDestInstitution && aipDestAccount && rolloverAmount > 0)) && (
                  <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                    <div className="border border-qt-border rounded-lg p-5 bg-qt-bg-3">
                      <p className="text-sm text-qt-primary leading-[22px] mb-4">
                        I acknowledge that I must close the RESP in February of the following year the withdrawal/rollover is made.
                      </p>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={aipCloseAck} onChange={(e) => setAipCloseAck(e.target.checked)} className="mt-1 size-4 accent-qt-green cursor-pointer" />
                        <span className="text-sm font-semibold text-qt-primary leading-[22px]">I acknowledge and agree</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* AIP E-Signatures */}
                {aipCloseAck && (
                  <div className="animate-[fadeSlideIn_0.3s_ease-out] flex flex-col gap-6">
                    <div>
                      <p className="text-sm text-qt-primary leading-[22px] mb-1 font-semibold">Subscriber signature</p>
                      <ESignature onSign={() => setSigned(true)} signed={signed} />
                    </div>
                    {hasJoint && (
                      <div>
                        <p className="text-sm text-qt-primary leading-[22px] mb-1 font-semibold">Joint subscriber's signature</p>
                        <ESignature onSign={() => setJointSigned(true)} signed={jointSigned} />
                      </div>
                    )}
                    <p className="text-xs text-qt-secondary">Date: {new Date().toLocaleDateString('en-CA')}</p>
                  </div>
                )}

                {/* AIP Certification */}
                {aipCloseAck && signaturesReady && (
                  <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                    <div className="border border-qt-border rounded-lg p-5 bg-qt-bg-3">
                      <p className="text-sm text-qt-primary leading-[22px] mb-4">
                        I certify that the information I've provided is correct and complete, and I authorize this {aipChoice === 'rollover' ? 'rollover' : 'withdrawal'} from my RESP.
                      </p>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)} className="mt-1 size-4 accent-qt-green cursor-pointer" />
                        <span className="text-sm font-semibold text-qt-primary leading-[22px]">I agree</span>
                      </label>
                    </div>
                  </div>
                )}
              </section>
            </WizardSection>

            {/* Continue - AIP */}
            <WizardSection visible={!!canContinueAIP}>
              <div className="flex gap-3 pt-2 border-t border-qt-border">
                <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
                <Button onClick={() => { setShowSummary(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Continue
                </Button>
              </div>
            </WizardSection>
          </div>
        </div>
      </main>
    </div>
  );

  function renderSummary() {
    if (!account) return null;
    const bank = allBanks.find((b) => b.id === selectedBank);
    const summaryAmount = isCapital ? capParsedAmount : parsedAmount;
    const aipTaxCad = isAIP && aipChoice === 'withdrawal' ? t1172_tax : 0;
    const aipTaxInCurrency = currency === 'USD' ? aipTaxCad / FX_RATE : aipTaxCad;
    const net = summaryAmount - fee - aipTaxInCurrency;
    const typeLabel = isAIP
      ? `Accumulated Income Payment (AIP) — ${aipChoice === 'rollover' ? 'Rollover' : 'Withdrawal'}`
      : isCapital ? 'Capital Withdrawal'
      : 'Educational Assistance Payment (EAP) & Post-Secondary Education (PSE)';
    const formLabel = isAIP
      ? 'Letter of Direction for AIP Rollover/Withdrawal form'
      : isCapital ? 'QT Capital Withdrawal form'
      : 'QT RESP Withdrawal form';

    const methodSummaryLabel = withdrawalMethodSummaryLabel(method);
    const methodEta = withdrawalMethodEtaSummary(method);

    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto" onClick={() => setShowSummary(false)}>
        <div className="w-full max-w-[680px] mx-auto bg-white rounded-2xl shadow-2xl my-10" onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-6 border-b border-qt-border flex items-center justify-between">
            <h2 className="font-display text-[22px] leading-[30px] text-qt-primary">Review & confirm</h2>
            <button type="button" onClick={() => setShowSummary(false)} className="text-qt-secondary hover:text-qt-primary text-sm font-semibold cursor-pointer">Close</button>
          </div>
          <div className="px-6 py-6">

            <div className="bg-white border border-qt-border rounded-lg divide-y divide-qt-border mb-6">
              <SummaryRow label="Subscriber" value={account.subscriberName || ''} />
              {hasJoint && <SummaryRow label="Joint subscriber" value={account.jointSubscriber || ''} />}
              <SummaryRow label="Account" value={`${account.label} - ${account.accountNumber}`} />
              <SummaryRow label="Withdrawal type" value={typeLabel} />

              {/* EAP & PSE specific rows */}
              {isEAPPSE && (
                <>
                  <SummaryRow label="Beneficiary" value={selectedBeneficiary ? `${selectedBeneficiary.firstName} ${selectedBeneficiary.lastName}` : ''} />
                  <SummaryRow label="Beneficiary SIN" value={selectedBeneficiary?.sin || ''} />
                  <SummaryRow label="Residency" value="Canadian resident" />
                  <SummaryRow label="Institution" value={institutionName} />
                  <SummaryRow label="Program" value={programName} />
                  <SummaryRow label="Enrollment" value={enrollmentStatus === 'full_time' ? 'Full-time' : 'Part-time'} />
                  <SummaryRow label="Program start" value={programStartDate} />
                </>
              )}

              <SummaryRow label="Currency" value={currency || ''} />
              {isEAPPSE && <SummaryRow label="Withdrawal type" value={withdrawalScope === 'full' ? 'Full' : 'Partial'} />}
              <SummaryRow label="Withdrawal amount" value={formatCurrency(summaryAmount, currency || 'CAD')} />

              {isEAPPSE && distribution === 'specify' && (
                <>
                  <SummaryRow label="EAP portion" value={formatCurrency(parseFloat(eapSpecificAmount) || 0, currency || 'CAD')} />
                  <SummaryRow label="PSE portion" value={formatCurrency(parseFloat(pseSpecificAmount) || 0, currency || 'CAD')} />
                </>
              )}

              {isEAPPSE && (
                <>
                  <SummaryRow label="Funds sent to" value={fundsRecipient === 'subscriber' ? 'Subscriber' : 'Beneficiary'} />
                  {fundsRecipient === 'subscriber' && beneficiaryIsMajor && (
                    <SummaryRow label="Beneficiary consent" value={`${selectedBeneficiary?.firstName} ${selectedBeneficiary?.lastName} — Confirmed (age ${beneficiaryAge}, ${beneficiaryProvince})`} />
                  )}
                </>
              )}

              {/* Capital specific rows */}
              {isCapital && capPriorEAP === 'yes' && (
                <SummaryRow label="Prior EAP received" value="Yes — CESG return not required" />
              )}
              {isCapital && capPriorEAP === 'no' && (
                <SummaryRow label="Prior EAP received" value="No — grants must be returned to HRSDC" />
              )}
              {isCapital && capComments && (
                <SummaryRow label="Comments" value={capComments} />
              )}

              {/* AIP specific rows */}
              {isAIP && aipChoice === 'withdrawal' && (
                <>
                  <SummaryRow label="Province" value={aipProvince} />
                  <SummaryRow label="Total AIP" value={formatCurrency(currency === 'USD' ? t1172_line1 / FX_RATE : t1172_line1, currency || 'CAD')} />
                  <SummaryRow label="RRSP deduction" value={formatCurrency(currency === 'USD' ? t1172_line6 / FX_RATE : t1172_line6, currency || 'CAD')} />
                  <SummaryRow label="AIP subject to tax" value={formatCurrency(currency === 'USD' ? t1172_line7 / FX_RATE : t1172_line7, currency || 'CAD')} />
                  <SummaryRow label={`Additional tax (${(t1172_rate * 100).toFixed(0)}%)`} value={`-${formatCurrency(aipTaxInCurrency, currency || 'CAD')}`} tooltip="This additional tax is reported on line 41800 of your income tax return" />
                </>
              )}
              {isAIP && aipChoice === 'rollover' && (
                <>
                  <SummaryRow label="Destination" value={aipTransferDest === 'own_rrsp' ? 'Own RRSP/PRPP/SPP' : 'Spouse RRSP/SPP'} />
                  <SummaryRow label="Institution" value={aipDestInstitution} />
                  <SummaryRow label="Destination account" value={aipDestAccount} />
                  <SummaryRow label="Transfer amount" value={formatCurrency(rolloverAmount, currency || 'CAD')} />
                </>
              )}

              <SummaryRow label="Method" value={methodSummaryLabel} />
              {methodEta ? <SummaryRow label="ETA" value={methodEta} /> : null}
              {fee > 0 && <SummaryRow label="Fee" value={`-${formatCurrency(fee, currency || 'CAD')}`} />}
              {method !== 'international_wire' && bank && (
                <SummaryRow label="Bank" value={`${bank.name} - ****${bank.last4}`} />
              )}
              {method === 'international_wire' && (
                <>
                  <SummaryRow label="International bank" value={intlWire.bankName} />
                  <SummaryRow label="SWIFT code" value={intlWire.swiftCode} />
                </>
              )}

              {isEAPPSE && (
                <SummaryRow label="Proof of enrollment" value={proofFile?.name || ''} />
              )}

              <div className="flex items-center justify-between px-5 py-4 bg-qt-bg-3">
                <p className="font-semibold text-base text-qt-primary">Withdrawal amount requested</p>
                <p className={`font-semibold text-lg ${net <= 0 ? 'text-qt-red' : 'text-qt-green-dark'}`}>{formatCurrency(Math.max(0, net), currency || 'CAD')}</p>
              </div>
              {net <= 0 && (
                <div className="px-5 py-3 bg-red-50 border-t border-red-300">
                  <p className="text-sm text-red-800">The withholding tax and fees exceed your withdrawal amount. Please go back and reduce the tax inputs or increase your withdrawal amount.</p>
                </div>
              )}
              {net > 0 && ((currency === 'CAD' && parsedAmount > 50000) || (currency === 'USD' && parsedAmount > 25000)) && (
                <div className="px-5 py-3 bg-amber-50 border-t border-amber-300">
                  <p className="text-sm text-amber-800">This amount is more than $50k CAD or $25k USD, so it will be processed in multiple withdrawals.</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <button className="flex items-center gap-2 text-sm font-semibold text-qt-green-dark hover:underline cursor-pointer">
                <Download size={16} />
                Download pre-filled {formLabel}
              </button>
              <p className="text-xs text-qt-secondary mt-2">A copy will also be emailed to you.</p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowSummary(false)}>Back</Button>
              <Button onClick={handleSubmit} disabled={net <= 0}>Submit withdrawal</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

/* ---------- RESP Balance Card ---------- */

function RESPBalanceCard({ account }: { account: Account }) {
  const [combined, setCombined] = useState(false);
  const bd = account.respBreakdown!;

  const contribCad = combined ? bd.contributions.cad + bd.contributions.usd * FX_RATE * (1 - FX_BUFFER) : bd.contributions.cad;
  const contribUsd = combined ? bd.contributions.cad / FX_RATE * (1 - FX_BUFFER) + bd.contributions.usd : bd.contributions.usd;
  const growthCad = combined ? bd.investmentGrowth.cad + bd.investmentGrowth.usd * FX_RATE * (1 - FX_BUFFER) : bd.investmentGrowth.cad;
  const growthUsd = combined ? bd.investmentGrowth.cad / FX_RATE * (1 - FX_BUFFER) + bd.investmentGrowth.usd : bd.investmentGrowth.usd;
  const grantsCad = combined ? bd.grants.cad + bd.grants.usd * FX_RATE * (1 - FX_BUFFER) : bd.grants.cad;
  const grantsUsd = combined ? bd.grants.cad / FX_RATE * (1 - FX_BUFFER) + bd.grants.usd : bd.grants.usd;

  const totalCad = contribCad + growthCad + grantsCad;
  const totalUsd = contribUsd + growthUsd + grantsUsd;

  const cadLabel = combined ? 'Combined CAD' : 'CAD';
  const usdLabel = combined ? 'Combined USD' : 'USD';

  return (
    <>
    <div className="border border-qt-border rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 bg-qt-bg-3 border-b border-qt-border">
        <p className="font-semibold text-sm text-qt-primary">Available to Withdraw</p>
        <button
          onClick={() => setCombined((c) => !c)}
          className="flex items-center gap-2 text-xs font-semibold text-qt-green-dark hover:underline cursor-pointer"
        >
          <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${combined ? 'bg-qt-green' : 'bg-qt-border'}`}>
            <span className={`inline-block size-3.5 rounded-full bg-white transition-transform ${combined ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
          </span>
          {combined ? 'Combined' : 'Separate'}
        </button>
      </div>

      <div className="grid grid-cols-3 px-5 py-2 bg-qt-bg-2 border-b border-qt-border">
        <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary">&nbsp;</p>
        <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary text-center">{cadLabel}</p>
        <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary text-center">{usdLabel}</p>
      </div>

      <BreakdownRow label="Available to withdraw" cad={totalCad} usd={totalUsd} bold />
      <div className="border-t border-qt-border">
        <BreakdownRow label="Contribution Amount" cad={contribCad} usd={contribUsd} />
      </div>
      <div className="border-t border-qt-border">
        <BreakdownRow label="Investment Growth" cad={growthCad} usd={growthUsd} />
      </div>
      <div className="border-t border-qt-border">
        <BreakdownRow label="Grant Amount" cad={grantsCad} usd={grantsUsd} />
      </div>
      <div className="border-t border-qt-border">
        <BreakdownRow
          label="Unavailable funds"
          cad={combined ? 150 + 50 * FX_RATE * (1 - FX_BUFFER) : 150}
          usd={combined ? (150 / FX_RATE) * (1 - FX_BUFFER) + 50 : 50}
        />
      </div>
    </div>
    </>
  );
}

function BreakdownRow({
  label,
  cad,
  usd,
  bold,
}: {
  label: ReactNode;
  cad: number;
  usd: number;
  bold?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 px-5 py-3 items-center">
      <div className={`text-sm ${bold ? 'font-semibold text-qt-primary' : 'text-qt-secondary'}`}>{label}</div>
      <p className={`text-sm text-center ${bold ? 'font-semibold text-qt-primary' : 'text-qt-primary'}`}>
        {formatCurrency(cad, 'CAD')}
      </p>
      <p className={`text-sm text-center ${bold ? 'font-semibold text-qt-primary' : 'text-qt-primary'}`}>
        {formatCurrency(usd, 'USD')}
      </p>
    </div>
  );
}

/* ---------- RESP Type Dropdown ---------- */

function RESPTypeDropdown({
  value,
  onChange,
}: {
  value: RESPWithdrawalType | '';
  onChange: (v: RESPWithdrawalType) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = respOptions.find((o) => o.value === value);

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      <label className="font-semibold text-sm text-qt-primary">Withdrawal type</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative w-full h-12 rounded-md border bg-white px-4 pr-10 text-left text-sm text-qt-primary
          outline-none transition-colors cursor-pointer flex items-center gap-2
          ${open ? 'border-qt-green' : 'border-qt-gray-dark'}`}
      >
        {selected ? (
          <span className="text-xs font-bold tracking-wider uppercase">{selected.label}</span>
        ) : (
          <span className="text-qt-secondary italic">Select withdrawal type</span>
        )}
        <ChevronDown
          size={20}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-qt-secondary transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border border-qt-border rounded-md bg-white shadow-lg overflow-hidden animate-[fadeSlideIn_0.15s_ease-out]">
          {respOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-4 py-3 text-left flex items-center gap-2 cursor-pointer transition-colors
                ${value === opt.value ? 'bg-qt-green-bg/30' : 'hover:bg-qt-bg-3'}`}
            >
              <span className="text-xs font-bold tracking-wider uppercase text-qt-primary">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- File Upload ---------- */

function FileUpload({ file, onFileChange }: { file: File | null; onFileChange: (f: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) onFileChange(f);
  }

  return (
    <div>
      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-qt-border rounded-lg p-8 text-center cursor-pointer hover:border-qt-green transition-colors"
        >
          <Upload size={24} className="mx-auto text-qt-secondary mb-2" />
          <p className="text-sm text-qt-primary font-semibold">Click to upload or drag and drop</p>
          <p className="text-xs text-qt-secondary mt-1">PDF, JPG, or PNG (max 10MB)</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) onFileChange(e.target.files[0]); }}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between border border-qt-green rounded-lg p-4 bg-qt-green-bg/10">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-qt-green shrink-0" />
            <div>
              <p className="text-sm font-semibold text-qt-primary">{file.name}</p>
              <p className="text-xs text-qt-secondary">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="text-qt-secondary hover:text-qt-primary cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Tax Calculation Row ---------- */

function TaxRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5">
      <p className="text-xs text-qt-secondary">{label}</p>
      <p className="text-sm font-semibold text-qt-primary">{value}</p>
    </div>
  );
}

/* ---------- Summary Row ---------- */

function SummaryRow({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <p className="text-sm text-qt-secondary flex items-center gap-1.5">
        {label}
        {tooltip && <Tooltip content={tooltip} />}
      </p>
      <p className="text-sm font-semibold text-qt-primary text-right max-w-[60%]">{value}</p>
    </div>
  );
}
