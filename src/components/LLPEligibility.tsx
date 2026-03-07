import { useState, useEffect } from 'react';
import RadioButton from './RadioButton';
import InputField from './InputField';
import CurrencyInput from './CurrencyInput';
import InfoBox from './InfoBox';
import { formatCurrency } from '../data/accounts';

type YesNo = 'yes' | 'no' | null;

interface LLPState {
  student: 'you' | 'spouse' | null;
  firstName: string;
  lastName: string;
  sin: string;
  spouseFirstName: string;
  spouseLastName: string;
  spouseSIN: string;
  enrolled: YesNo;
  enrollmentType: 'full-time' | 'part-time' | null;
  disabilityCondition: YesNo;
  previousWithdrawals: YesNo;
  afterFourthYear: YesNo;
  withdrawalAmount: string;
  firstWithdrawalThisYear: YesNo;
  alreadyWithdrawnThisYear: string;
  previousYearsWithdrawn: string;
}

const initialState: LLPState = {
  student: null,
  firstName: 'Anastasia',
  lastName: 'Carmichael',
  sin: '***-***-789',
  spouseFirstName: '',
  spouseLastName: '',
  spouseSIN: '',
  enrolled: null,
  enrollmentType: null,
  disabilityCondition: null,
  previousWithdrawals: null,
  afterFourthYear: null,
  withdrawalAmount: '',
  firstWithdrawalThisYear: null,
  alreadyWithdrawnThisYear: '',
  previousYearsWithdrawn: '',
};

interface LLPEligibilityProps {
  onComplete: (eligible: boolean, data: LLPState) => void;
  withdrawalAmount: string;
  onWithdrawalAmountChange: (val: string) => void;
}

export default function LLPEligibility({ onComplete, withdrawalAmount, onWithdrawalAmountChange }: LLPEligibilityProps) {
  const [s, setS] = useState<LLPState>({ ...initialState, withdrawalAmount });

  useEffect(() => {
    if (withdrawalAmount !== s.withdrawalAmount) {
      setS((prev) => ({ ...prev, withdrawalAmount }));
    }
  }, [withdrawalAmount]);

  function set<K extends keyof LLPState>(field: K, val: LLPState[K]) {
    setS((prev) => {
      const next = { ...prev, [field]: val };

      if (field === 'enrolled') {
        next.enrollmentType = null;
        next.disabilityCondition = null;
        next.previousWithdrawals = null;
        next.afterFourthYear = null;
        next.firstWithdrawalThisYear = null;
        next.alreadyWithdrawnThisYear = '';
        next.previousYearsWithdrawn = '';
      }

      if (field === 'enrollmentType') {
        next.disabilityCondition = null;
        next.previousWithdrawals = null;
        next.afterFourthYear = null;
        next.firstWithdrawalThisYear = null;
        next.alreadyWithdrawnThisYear = '';
        next.previousYearsWithdrawn = '';
      }

      if (field === 'disabilityCondition') {
        next.previousWithdrawals = null;
        next.afterFourthYear = null;
        next.firstWithdrawalThisYear = null;
        next.alreadyWithdrawnThisYear = '';
        next.previousYearsWithdrawn = '';
      }

      if (field === 'previousWithdrawals') {
        next.afterFourthYear = null;
        next.firstWithdrawalThisYear = null;
        next.alreadyWithdrawnThisYear = '';
        next.previousYearsWithdrawn = '';
      }

      if (field === 'afterFourthYear') {
        next.firstWithdrawalThisYear = null;
        next.alreadyWithdrawnThisYear = '';
        next.previousYearsWithdrawn = '';
      }

      if (field === 'firstWithdrawalThisYear') {
        next.alreadyWithdrawnThisYear = '';
      }

      if (field === 'withdrawalAmount' || next.withdrawalAmount !== prev.withdrawalAmount) {
        onWithdrawalAmountChange(next.withdrawalAmount);
      }

      return next;
    });
  }

  const lineA = parseFloat(s.withdrawalAmount) || 0;
  const lineB = parseFloat(s.alreadyWithdrawnThisYear) || 0;
  const lineC = parseFloat(s.previousYearsWithdrawn) || 0;

  const yearlyExceeds = lineA + lineB > 10000;
  const totalExceeds = lineA + lineB + lineC > 20000;

  const isTerminal_notEnrolled = s.enrolled === 'no';
  const isTerminal_noDisability = s.enrollmentType === 'part-time' && s.disabilityCondition === 'no';
  const isTerminal_afterFourthYear = s.afterFourthYear === 'yes';

  const isTerminalEarly = isTerminal_notEnrolled || isTerminal_noDisability;
  const isTerminal = isTerminalEarly || isTerminal_afterFourthYear;

  const questionsComplete =
    !isTerminal &&
    s.student !== null &&
    s.enrolled === 'yes' &&
    s.enrollmentType !== null &&
    (s.enrollmentType === 'full-time' || s.disabilityCondition === 'yes') &&
    (s.previousWithdrawals === 'no' || (s.previousWithdrawals === 'yes' && s.afterFourthYear === 'no')) &&
    lineA > 0 &&
    s.firstWithdrawalThisYear !== null &&
    (s.firstWithdrawalThisYear === 'yes' || s.alreadyWithdrawnThisYear !== '') &&
    s.previousYearsWithdrawn !== '';

  const eligible = questionsComplete && !yearlyExceeds && !totalExceeds;

  useEffect(() => {
    onComplete(!!eligible, s);
  }, [eligible, s]);

  const showQ3 = s.enrolled === 'yes';
  const showQ4 = s.enrollmentType === 'part-time';
  const showQ5 = s.enrollmentType === 'full-time' || (s.enrollmentType === 'part-time' && s.disabilityCondition === 'yes');
  const showQ6 = s.previousWithdrawals === 'yes';
  const showQ7 = s.previousWithdrawals === 'no' || (s.previousWithdrawals === 'yes' && s.afterFourthYear === 'no');
  const showQ8 = showQ7 && lineA > 0;
  const showQ8a = s.firstWithdrawalThisYear === 'no';
  const showQ9 = showQ8 && s.firstWithdrawalThisYear !== null;

  return (
    <div>
      <p className="font-semibold text-base text-qt-primary leading-6 mb-1">Eligibility questions</p>
      <p className="text-sm text-qt-secondary leading-[22px] mb-6">
        Please answer the following to determine your eligibility for the Lifelong Learning Plan.
      </p>

      <div className="flex flex-col gap-6">
        {/* Q1: LLP Student */}
        <div className="animate-[fadeSlideIn_0.3s_ease-out]">
          <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">The LLP student</p>
          <p className="text-xs text-qt-secondary mb-3">Select only one</p>
          <div className="flex flex-col gap-3">
            <RadioButton name="llp-student" value="you" label="You" checked={s.student === 'you'} onChange={() => set('student', 'you')} />
            <RadioButton name="llp-student" value="spouse" label="Your spouse or common-law partner" checked={s.student === 'spouse'} onChange={() => set('student', 'spouse')} />
          </div>
        </div>

        {s.student === 'spouse' && (
          <div className="ml-6 pl-4 border-l-2 border-qt-border flex flex-col gap-4 animate-[fadeSlideIn_0.3s_ease-out]">
            <InputField label="First name" value={s.spouseFirstName} onChange={(e) => set('spouseFirstName', e.target.value)} placeholder="Enter first name" />
            <InputField label="Last name" value={s.spouseLastName} onChange={(e) => set('spouseLastName', e.target.value)} placeholder="Enter last name" />
            <InputField label="Social Insurance Number (SIN)" value={s.spouseSIN} onChange={(e) => set('spouseSIN', e.target.value)} placeholder="e.g. 123-456-789" maxLength={11} />
          </div>
        )}

        {s.student === 'you' && (
          <div className="ml-6 pl-4 border-l-2 border-qt-border flex flex-col gap-4 animate-[fadeSlideIn_0.3s_ease-out]">
            <p className="text-xs text-qt-secondary">Pre-filled from your account. You may edit if needed.</p>
            <InputField label="First name" value={s.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Enter first name" />
            <InputField label="Last name" value={s.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Enter last name" />
            <InputField label="Social Insurance Number (SIN)" value={s.sin} onChange={(e) => set('sin', e.target.value)} placeholder="e.g. 123-456-789" maxLength={11} />
          </div>
        )}

        {/* Q2 */}
        {s.student !== null && (
          <div className="animate-[fadeSlideIn_0.3s_ease-out]">
            <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
              Has the LLP student enrolled in a qualifying educational program at a designated educational institution, or received a written offer to enrol before March of next year in such a program?
            </p>
            <div className="flex gap-6">
              <RadioButton name="llp-enrolled" value="yes" label="Yes" checked={s.enrolled === 'yes'} onChange={() => set('enrolled', 'yes')} />
              <RadioButton name="llp-enrolled" value="no" label="No" checked={s.enrolled === 'no'} onChange={() => set('enrolled', 'no')} />
            </div>
          </div>
        )}

        {isTerminal_notEnrolled && <Terminal />}

        {/* Q3 */}
        {showQ3 && (
          <div className="animate-[fadeSlideIn_0.3s_ease-out]">
            <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
              Is the student enrolling as a full-time student or a part-time student?
            </p>
            <div className="flex gap-6">
              <RadioButton name="llp-enrollment-type" value="full-time" label="Full-time" checked={s.enrollmentType === 'full-time'} onChange={() => set('enrollmentType', 'full-time')} />
              <RadioButton name="llp-enrollment-type" value="part-time" label="Part-time" checked={s.enrollmentType === 'part-time'} onChange={() => set('enrollmentType', 'part-time')} />
            </div>

            {/* Sub-question: disability (only for part-time) */}
            {showQ4 && (
              <div className="ml-6 pl-4 border-l-2 border-qt-border mt-4 animate-[fadeSlideIn_0.3s_ease-out]">
                <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
                  Does the student meet one of the disability conditions explained in Guide RC4112?
                </p>
                <div className="flex gap-6">
                  <RadioButton name="llp-disability" value="yes" label="Yes" checked={s.disabilityCondition === 'yes'} onChange={() => set('disabilityCondition', 'yes')} />
                  <RadioButton name="llp-disability" value="no" label="No" checked={s.disabilityCondition === 'no'} onChange={() => set('disabilityCondition', 'no')} />
                </div>
              </div>
            )}

            {isTerminal_noDisability && (
              <div className="mt-4">
                <Terminal />
              </div>
            )}
          </div>
        )}

        {/* Q4 */}
        {showQ5 && !isTerminalEarly && (
          <div className="animate-[fadeSlideIn_0.3s_ease-out]">
            <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
              Have you ever used the LLP before for this specific period of study?
            </p>
            <div className="flex gap-6">
              <RadioButton name="llp-previous" value="yes" label="Yes" checked={s.previousWithdrawals === 'yes'} onChange={() => set('previousWithdrawals', 'yes')} />
              <RadioButton name="llp-previous" value="no" label="No" checked={s.previousWithdrawals === 'no'} onChange={() => set('previousWithdrawals', 'no')} />
            </div>

            {/* Sub-question: withdrawal window check, only if Yes */}
            {showQ6 && (
              <div className="ml-6 pl-4 border-l-2 border-qt-border mt-4 animate-[fadeSlideIn_0.3s_ease-out]">
                <p className="text-sm text-qt-primary leading-[22px] mb-2 font-semibold">
                  We need to check if your withdrawal window is still open. Are either of the following statements true?
                </p>
                <ul className="list-disc ml-5 text-sm text-qt-secondary leading-[22px] mb-3">
                  <li>It has been more than 4 years since your very first LLP withdrawal.</li>
                  <li>You have already started making your annual LLP repayments back into your RRSP.</li>
                </ul>
                <div className="flex flex-col gap-3">
                  <RadioButton name="llp-fourth-year" value="yes" label="Yes, one or both are true" checked={s.afterFourthYear === 'yes'} onChange={() => set('afterFourthYear', 'yes')} />
                  <RadioButton name="llp-fourth-year" value="no" label="No, neither are true" checked={s.afterFourthYear === 'no'} onChange={() => set('afterFourthYear', 'no')} />
                </div>
              </div>
            )}

            {isTerminal_afterFourthYear && (
              <div className="mt-4">
                <Terminal />
              </div>
            )}
          </div>
        )}

        {/* Q6 */}
        {showQ7 && !isTerminal && (
          <div className="animate-[fadeSlideIn_0.3s_ease-out]">
            <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
              How much do you want to withdraw?
            </p>
            <CurrencyInput
              label="Withdrawal amount"
              value={s.withdrawalAmount}
              onChange={(v) => set('withdrawalAmount', v)}
              max={10000}
              maxLabel="$10,000.00 CAD per calendar year"
            />
            <p className="text-xs text-qt-secondary mt-1">Maximum $10,000 per calendar year</p>
          </div>
        )}

        {/* Q8 */}
        {showQ8 && !isTerminal && (
          <div className="animate-[fadeSlideIn_0.3s_ease-out]">
            <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
              Is this your first LLP withdrawal this year?
            </p>
            <div className="flex gap-6">
              <RadioButton name="llp-first-year" value="yes" label="Yes" checked={s.firstWithdrawalThisYear === 'yes'} onChange={() => set('firstWithdrawalThisYear', 'yes')} />
              <RadioButton name="llp-first-year" value="no" label="No" checked={s.firstWithdrawalThisYear === 'no'} onChange={() => set('firstWithdrawalThisYear', 'no')} />
            </div>
          </div>
        )}

        {/* Q8a */}
        {showQ8a && !isTerminal && (
          <div className="ml-6 pl-4 border-l-2 border-qt-border animate-[fadeSlideIn_0.3s_ease-out]">
            <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
              How much have you already withdrawn under the LLP this year?
            </p>
            <CurrencyInput
              label="Amount already withdrawn this year"
              value={s.alreadyWithdrawnThisYear}
              onChange={(v) => set('alreadyWithdrawnThisYear', v)}
            />
            {yearlyExceeds && (
              <div className="mt-3">
                <InfoBox variant="warning">
                  <p>
                    Your total withdrawals this year (Line A + Line B = {formatCurrency(lineA + lineB, 'CAD')}) exceed the $10,000 annual limit. Your RRSP issuer will withhold tax on the part of your withdrawal that exceeds the $10,000 limit.
                  </p>
                </InfoBox>
              </div>
            )}
          </div>
        )}

        {/* Q9 */}
        {showQ9 && !isTerminal && (
          <div className="animate-[fadeSlideIn_0.3s_ease-out]">
            <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
              How much have you withdrawn under the LLP in previous years of your current LLP participation?
            </p>
            <CurrencyInput
              label="Previous years' withdrawals"
              value={s.previousYearsWithdrawn}
              onChange={(v) => set('previousYearsWithdrawn', v)}
            />
            <p className="text-xs text-qt-secondary mt-1">
              Do not include amounts that were included as income in your previous years' income tax and benefit returns because you exceeded the $10,000 limit.
            </p>
            {totalExceeds && (
              <div className="mt-3">
                <InfoBox variant="warning">
                  <p>
                    Your total LLP withdrawals (Line A + Line B + Line C = {formatCurrency(lineA + lineB + lineC, 'CAD')}) exceed the $20,000 lifetime limit. Your RRSP issuer will withhold tax on the part of your withdrawal that exceeds the $20,000 limit.
                  </p>
                </InfoBox>
              </div>
            )}
          </div>
        )}

        {questionsComplete && !yearlyExceeds && !totalExceeds && (
          <InfoBox variant="success">
            <p className="font-semibold">You appear to be eligible for the Lifelong Learning Plan.</p>
          </InfoBox>
        )}
      </div>
    </div>
  );
}

function Terminal({ message }: { message?: string }) {
  return (
    <div className="animate-[fadeSlideIn_0.3s_ease-out]">
      <InfoBox variant="error">
        <p><strong>{message || 'Not eligible for a Lifelong Learning Plan withdrawal.'}</strong></p>
      </InfoBox>
    </div>
  );
}
