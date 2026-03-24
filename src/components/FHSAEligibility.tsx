import { useState, useEffect } from 'react';
import RadioButton from './RadioButton';
import AddressInput from './AddressInput';
import ESignature from './ESignature';
import InfoBox from './InfoBox';
import QuestionGroup from './QuestionGroup';

type YesNo = 'yes' | 'no' | null;

interface FHSAState {
  resident: YesNo;
  remainResident: YesNo;
  ownedHome: YesNo;
  takenOwnership: 'not_yet' | 'within_30' | 'more_30' | null;
  hasAgreement: YesNo;
  primaryResidence: YesNo;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  withdrawalAmount: string;
  signed: boolean;
  agreed: boolean;
}

const initialState: FHSAState = {
  resident: null,
  remainResident: null,
  ownedHome: null,
  takenOwnership: null,
  hasAgreement: null,
  primaryResidence: null,
  street: '',
  city: '',
  province: '',
  postalCode: '',
  withdrawalAmount: '',
  signed: false,
  agreed: false,
};

interface FHSAEligibilityProps {
  onComplete: (eligible: boolean, data: FHSAState) => void;
  /** True when the full RC725 questionnaire is finished (including non–tax-free outcomes). */
  onQuestionnaireComplete?: (complete: boolean) => void;
  withdrawalAmount: string;
  onWithdrawalAmountChange: (val: string) => void;
}

export default function FHSAEligibility({
  onComplete,
  onQuestionnaireComplete,
  withdrawalAmount,
  onWithdrawalAmountChange,
}: FHSAEligibilityProps) {
  const [s, setS] = useState<FHSAState>({ ...initialState, withdrawalAmount });

  useEffect(() => {
    if (withdrawalAmount !== s.withdrawalAmount) {
      setS((prev) => ({ ...prev, withdrawalAmount }));
    }
  }, [withdrawalAmount]);

  function set<K extends keyof FHSAState>(field: K, val: FHSAState[K]) {
    setS((prev) => {
      const next = { ...prev, [field]: val };

      if (field === 'resident') {
        next.remainResident = null;
        next.ownedHome = null;
        next.takenOwnership = null;
        next.hasAgreement = null;
        next.primaryResidence = null;
      }
      if (field === 'remainResident') {
        next.ownedHome = null;
        next.takenOwnership = null;
        next.hasAgreement = null;
        next.primaryResidence = null;
      }
      if (field === 'ownedHome') {
        next.takenOwnership = null;
        next.hasAgreement = null;
        next.primaryResidence = null;
      }
      if (field === 'takenOwnership') {
        next.hasAgreement = null;
        next.primaryResidence = null;
      }
      if (field === 'hasAgreement') {
        next.primaryResidence = null;
      }

      if (field === 'withdrawalAmount') {
        onWithdrawalAmountChange(next.withdrawalAmount);
      }

      return next;
    });
  }

  const t_notResident = s.resident === 'no';
  const t_wontRemain = s.remainResident === 'no';
  const t_ownedHome = s.ownedHome === 'yes';
  const t_over30 = s.takenOwnership === 'more_30';
  const t_noAgreement = s.hasAgreement === 'no';
  const t_notPrimary = s.primaryResidence === 'no';

  const isTerminalG1 = t_notResident || t_wontRemain;
  const isTerminalG2 = t_ownedHome || t_over30;
  const isTerminalG3 = t_noAgreement || t_notPrimary;
  const isTerminal = isTerminalG1 || isTerminalG2 || isTerminalG3;

  /** Both residency questions must be "yes" before continuing (non-residents cannot complete a qualifying withdrawal). */
  const g1Done = s.resident === 'yes' && s.remainResident === 'yes';
  const g2Done = s.ownedHome === 'no' && (s.takenOwnership === 'not_yet' || s.takenOwnership === 'within_30');
  const g3Done = s.hasAgreement === 'yes' && s.primaryResidence === 'yes';

  const showG2 = g1Done && !isTerminalG1;
  const showG3 = showG2 && g2Done && !isTerminalG2;
  const showG4 = showG3 && g3Done && !isTerminalG3;

  const showQ9 = showG4 && s.street !== '' && s.city !== '' && s.province !== '' && s.postalCode !== '';
  const parsedAmount = parseFloat(s.withdrawalAmount) || 0;

  const questionnaireComplete =
    !isTerminal &&
    showG4 &&
    parsedAmount > 0 &&
    s.street !== '' &&
    s.city !== '' &&
    s.province !== '' &&
    s.postalCode !== '' &&
    s.signed &&
    s.agreed;

  const eligible =
    questionnaireComplete && s.resident === 'yes' && s.remainResident === 'yes';

  useEffect(() => {
    onComplete(!!eligible, s);
  }, [eligible, s]);

  useEffect(() => {
    onQuestionnaireComplete?.(!!questionnaireComplete);
  }, [questionnaireComplete, onQuestionnaireComplete]);

  const totalSteps = 4;

  return (
    <div>
      <p className="font-semibold text-base text-qt-primary leading-6 mb-1">Eligibility questions</p>
      <p className="text-sm text-qt-secondary leading-[22px] mb-6">
        Please answer the following to determine your eligibility for a qualifying FHSA withdrawal.
      </p>

      <div className="flex flex-col gap-5">
        {/* Group 1: Residency */}
        <QuestionGroup title="Residency" step={1} totalSteps={totalSteps}>
          <div>
            <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
              Are you currently a resident of Canada?
            </p>
            <div className="flex gap-6">
              <RadioButton name="fhsa-resident" value="yes" label="Yes" checked={s.resident === 'yes'} onChange={() => set('resident', 'yes')} />
              <RadioButton name="fhsa-resident" value="no" label="No" checked={s.resident === 'no'} onChange={() => set('resident', 'no')} />
            </div>
          </div>

          {t_notResident && (
            <Terminal msg="Only residents of Canada can receive a tax-free qualifying FHSA withdrawal. You are not eligible for this qualifying withdrawal." />
          )}

          {s.resident === 'yes' && (
            <div>
              <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
                Will you remain a resident of Canada until you take ownership of your new home?
              </p>
              <div className="flex gap-6">
                <RadioButton name="fhsa-remain" value="yes" label="Yes" checked={s.remainResident === 'yes'} onChange={() => set('remainResident', 'yes')} />
                <RadioButton name="fhsa-remain" value="no" label="No" checked={s.remainResident === 'no'} onChange={() => set('remainResident', 'no')} />
              </div>
            </div>
          )}

          {t_wontRemain && <Terminal msg="You must remain a resident of Canada until you buy or build the home to qualify." />}
        </QuestionGroup>

        {/* Group 2: First-Time Home Buyer Status */}
        {showG2 && (
          <QuestionGroup title="Home Buyer Status" step={2} totalSteps={totalSteps}>
            <div>
              <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
                Have you lived in a home that you owned (or co-owned) as your primary residence at any point this year, or in the past 4 calendar years?
              </p>
              <p className="text-xs text-qt-secondary mb-3 italic">
                If you recently took ownership of the new home you are using these funds for, answer "No" as long as you bought it within the last 30 days.
              </p>
              <div className="flex gap-6">
                <RadioButton name="fhsa-owned" value="yes" label="Yes" checked={s.ownedHome === 'yes'} onChange={() => set('ownedHome', 'yes')} />
                <RadioButton name="fhsa-owned" value="no" label="No" checked={s.ownedHome === 'no'} onChange={() => set('ownedHome', 'no')} />
              </div>
            </div>

            {t_ownedHome && <Terminal msg="You do not qualify as a first-time home buyer for this withdrawal. Any funds withdrawn will be subject to withholding tax." />}

            {s.ownedHome === 'no' && (
              <div>
                <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
                  Have you already taken ownership of the new home you are buying?
                </p>
                <div className="flex flex-col gap-3">
                  <RadioButton name="fhsa-ownership" value="not_yet" label="No, not yet" checked={s.takenOwnership === 'not_yet'} onChange={() => set('takenOwnership', 'not_yet')} />
                  <RadioButton name="fhsa-ownership" value="within_30" label="Yes, within the last 30 days" checked={s.takenOwnership === 'within_30'} onChange={() => set('takenOwnership', 'within_30')} />
                  <RadioButton name="fhsa-ownership" value="more_30" label="Yes, more than 30 days ago" checked={s.takenOwnership === 'more_30'} onChange={() => set('takenOwnership', 'more_30')} />
                </div>
              </div>
            )}

            {t_over30 && <Terminal msg="You must withdraw your FHSA funds within 30 days of taking ownership of the home. You no longer qualify for a tax-free withdrawal." />}
          </QuestionGroup>
        )}

        {/* Group 3: Purchase Agreement */}
        {showG3 && (
          <QuestionGroup title="Purchase Agreement" step={3} totalSteps={totalSteps}>
            <div>
              <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
                Do you have a signed, written agreement to buy or build a home in Canada before October 1st of next year?
              </p>
              <div className="flex gap-6">
                <RadioButton name="fhsa-agreement" value="yes" label="Yes" checked={s.hasAgreement === 'yes'} onChange={() => set('hasAgreement', 'yes')} />
                <RadioButton name="fhsa-agreement" value="no" label="No" checked={s.hasAgreement === 'no'} onChange={() => set('hasAgreement', 'no')} />
              </div>
            </div>

            {t_noAgreement && <Terminal msg="Not eligible for this withdrawal. You must have a formal written agreement in place before you can withdraw your FHSA funds." />}

            {s.hasAgreement === 'yes' && (
              <div>
                <p className="text-sm text-qt-primary leading-[22px] mb-3 font-semibold">
                  Do you plan to move into this home and make it your primary residence within one year of buying or building it?
                </p>
                <div className="flex gap-6">
                  <RadioButton name="fhsa-primary" value="yes" label="Yes" checked={s.primaryResidence === 'yes'} onChange={() => set('primaryResidence', 'yes')} />
                  <RadioButton name="fhsa-primary" value="no" label="No" checked={s.primaryResidence === 'no'} onChange={() => set('primaryResidence', 'no')} />
                </div>
              </div>
            )}

            {t_notPrimary && <Terminal msg="FHSA funds can only be used to purchase a primary residence, not investment properties or secondary homes." />}
          </QuestionGroup>
        )}

        {/* Group 4: Property & Withdrawal Details */}
        {showG4 && (
          <QuestionGroup title="Property & Withdrawal Details" step={4} totalSteps={totalSteps}>
            {eligible && (
              <InfoBox variant="success">
                <p className="font-semibold">You are eligible for a tax-free qualifying FHSA withdrawal.</p>
              </InfoBox>
            )}
            {questionnaireComplete && !eligible && (
              <InfoBox variant="warning">
                <p>
                  <strong>Tax treatment.</strong> Based on your answers, this withdrawal does not qualify as tax-free (for
                  example, if you are not a resident of Canada or do not meet the other qualifying conditions). You can
                  still submit your withdrawal request for review.
                </p>
              </InfoBox>
            )}

            <AddressInput
              value={{ street: s.street, city: s.city, province: s.province, postalCode: s.postalCode }}
              onChange={(a) => setS((prev) => ({ ...prev, street: a.street, city: a.city, province: a.province, postalCode: a.postalCode }))}
            />

            {showQ9 && (
              <div className="flex flex-col gap-6">
                <ESignature onSign={() => set('signed', true as never)} signed={s.signed} />

                <div className="border border-qt-border rounded-lg p-5 bg-qt-bg-3">
                  <p className="text-sm text-qt-primary leading-[22px] mb-4">
                    I certify that the information I've provided is correct and complete, and I authorize this qualifying withdrawal from my FHSA.
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={s.agreed}
                      onChange={(e) => set('agreed', e.target.checked as never)}
                      className="mt-1 size-4 accent-qt-green cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-qt-primary leading-[22px]">
                      I agree
                    </span>
                  </label>
                </div>
              </div>
            )}
          </QuestionGroup>
        )}
      </div>
    </div>
  );
}

function Terminal({ msg }: { msg: string }) {
  return (
    <InfoBox variant="error">
      <p><strong>Not eligible.</strong> {msg}</p>
    </InfoBox>
  );
}
