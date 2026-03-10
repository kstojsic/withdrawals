import { useState, useEffect } from 'react';
import RadioButton from './RadioButton';
import InfoBox from './InfoBox';
import QuestionGroup from './QuestionGroup';

type YesNo = 'yes' | 'no' | null;

interface HBPState {
  residentOfCanada: YesNo;
  personWithDisability: YesNo;
  disabledPersonPurchase: YesNo;
  writtenAgreement: YesNo;
  previousHBP: YesNo;
  repaymentBalanceZero: YesNo;
  intentPrimaryResidence: YesNo;
  ownedQualifyingHome30Days: YesNo;
  livingSeparate90Days: YesNo;
  newSpouseOwnsHome: YesNo;
  ownOccupyPrincipalResidence: YesNo;
  differentFromPrincipal: YesNo;
  acquireInterestBeforeWithdrawal: YesNo;
  ownedHomeBetween2022_2026: YesNo;
  sep_livingSeparate90Days: YesNo;
  sep_newSpouseOwnsHome: YesNo;
  sep_ownOccupyPrincipalResidence: YesNo;
  sep_differentFromPrincipal: YesNo;
  sep_acquireInterestBeforeWithdrawal: YesNo;
}

const initialState: HBPState = {
  residentOfCanada: null,
  personWithDisability: null,
  disabledPersonPurchase: null,
  writtenAgreement: null,
  previousHBP: null,
  repaymentBalanceZero: null,
  intentPrimaryResidence: null,
  ownedQualifyingHome30Days: null,
  livingSeparate90Days: null,
  newSpouseOwnsHome: null,
  ownOccupyPrincipalResidence: null,
  differentFromPrincipal: null,
  acquireInterestBeforeWithdrawal: null,
  ownedHomeBetween2022_2026: null,
  sep_livingSeparate90Days: null,
  sep_newSpouseOwnsHome: null,
  sep_ownOccupyPrincipalResidence: null,
  sep_differentFromPrincipal: null,
  sep_acquireInterestBeforeWithdrawal: null,
};

interface HBPEligibilityProps {
  onEligibilityChange: (eligible: boolean | null) => void;
  onAnswersChange?: (answers: HBPState) => void;
}

export default function HBPEligibility({ onEligibilityChange, onAnswersChange }: HBPEligibilityProps) {
  const [s, setS] = useState<HBPState>(initialState);

  function set<K extends keyof HBPState>(field: K, val: YesNo) {
    setS((prev) => {
      const next = { ...prev, [field]: val };
      const resets = getResets(field);
      for (const r of resets) next[r] = null;
      return next;
    });
  }

  function getResets(field: keyof HBPState): (keyof HBPState)[] {
    const resetMap: Partial<Record<keyof HBPState, (keyof HBPState)[]>> = {
      residentOfCanada: ['personWithDisability', 'disabledPersonPurchase', 'writtenAgreement', 'previousHBP', 'repaymentBalanceZero', 'intentPrimaryResidence', 'ownedQualifyingHome30Days', 'livingSeparate90Days', 'newSpouseOwnsHome', 'ownOccupyPrincipalResidence', 'differentFromPrincipal', 'acquireInterestBeforeWithdrawal', 'ownedHomeBetween2022_2026', 'sep_livingSeparate90Days', 'sep_newSpouseOwnsHome', 'sep_ownOccupyPrincipalResidence', 'sep_differentFromPrincipal', 'sep_acquireInterestBeforeWithdrawal'],
      personWithDisability: ['disabledPersonPurchase'],
      previousHBP: ['repaymentBalanceZero'],
      ownedQualifyingHome30Days: ['livingSeparate90Days', 'newSpouseOwnsHome', 'ownOccupyPrincipalResidence', 'differentFromPrincipal', 'acquireInterestBeforeWithdrawal', 'ownedHomeBetween2022_2026', 'sep_livingSeparate90Days', 'sep_newSpouseOwnsHome', 'sep_ownOccupyPrincipalResidence', 'sep_differentFromPrincipal', 'sep_acquireInterestBeforeWithdrawal'],
      livingSeparate90Days: ['newSpouseOwnsHome', 'ownOccupyPrincipalResidence', 'differentFromPrincipal', 'acquireInterestBeforeWithdrawal'],
      newSpouseOwnsHome: ['ownOccupyPrincipalResidence', 'differentFromPrincipal', 'acquireInterestBeforeWithdrawal'],
      ownOccupyPrincipalResidence: ['differentFromPrincipal', 'acquireInterestBeforeWithdrawal'],
      differentFromPrincipal: ['acquireInterestBeforeWithdrawal'],
      ownedHomeBetween2022_2026: ['sep_livingSeparate90Days', 'sep_newSpouseOwnsHome', 'sep_ownOccupyPrincipalResidence', 'sep_differentFromPrincipal', 'sep_acquireInterestBeforeWithdrawal'],
      sep_livingSeparate90Days: ['sep_newSpouseOwnsHome', 'sep_ownOccupyPrincipalResidence', 'sep_differentFromPrincipal', 'sep_acquireInterestBeforeWithdrawal'],
      sep_newSpouseOwnsHome: ['sep_ownOccupyPrincipalResidence', 'sep_differentFromPrincipal', 'sep_acquireInterestBeforeWithdrawal'],
      sep_ownOccupyPrincipalResidence: ['sep_differentFromPrincipal', 'sep_acquireInterestBeforeWithdrawal'],
      sep_differentFromPrincipal: ['sep_acquireInterestBeforeWithdrawal'],
    };
    return resetMap[field] || [];
  }

  const eligibility = computeEligibility(s);

  useEffect(() => {
    onEligibilityChange(eligibility);
    onAnswersChange?.(s);
  }, [s]);

  const g1Terminal = s.residentOfCanada === 'no' || s.writtenAgreement === 'no';
  const g1Done = s.residentOfCanada === 'yes' && s.writtenAgreement === 'yes'
    && (s.personWithDisability === 'yes' || s.disabledPersonPurchase !== null);

  const g2Terminal = s.previousHBP === 'yes' && s.repaymentBalanceZero === 'no';
  const g2Done = g1Done && !g1Terminal && (s.previousHBP === 'no' || s.repaymentBalanceZero === 'yes');

  const showG2 = g1Done && !g1Terminal;
  const showG3 = g2Done && !g2Terminal;

  const totalSteps = 3;

  return (
    <div>
      <p className="font-semibold text-base text-qt-primary leading-6 mb-1">Eligibility questions</p>
      <p className="text-sm text-qt-secondary leading-[22px] mb-6">
        Please answer the following questions to determine your eligibility for the Home Buyers' Plan.
      </p>

      <div className="flex flex-col gap-5">
        {/* Group 1: Residency & Home Purchase Agreement */}
        <QuestionGroup title="Residency & Agreement" step={1} totalSteps={totalSteps}>
          <Question
            q="Are you a resident of Canada?"
            value={s.residentOfCanada}
            onChange={(v) => set('residentOfCanada', v)}
          />

          {s.residentOfCanada === 'no' && <NotEligible reason="You must be a resident of Canada to participate in the Home Buyers' Plan." />}

          {s.residentOfCanada === 'yes' && (
            <>
              <Question
                q="Are you a person with a disability?"
                value={s.personWithDisability}
                onChange={(v) => set('personWithDisability', v)}
              />

              {s.personWithDisability === 'no' && (
                <Question
                  q="Are you making a withdrawal from your RRSP to buy or build a qualifying home for a specified disabled person or to help such a person buy or build a qualifying home?"
                  value={s.disabledPersonPurchase}
                  onChange={(v) => set('disabledPersonPurchase', v)}
                  sub
                />
              )}

              {(s.personWithDisability === 'yes' || s.disabledPersonPurchase !== null) && (
                <Question
                  q="Have you entered into a written agreement to buy or build a qualifying home?"
                  value={s.writtenAgreement}
                  onChange={(v) => set('writtenAgreement', v)}
                />
              )}

              {s.writtenAgreement === 'no' && <NotEligible reason="You must have a written agreement to buy or build a qualifying home." />}
            </>
          )}
        </QuestionGroup>

        {/* Group 2: Previous HBP Participation */}
        {showG2 && (
          <QuestionGroup title="Previous HBP Participation" step={2} totalSteps={totalSteps}>
            <Question
              q="Before this year, have you ever withdrawn funds from your RRSP under the Home Buyers' Plan?"
              value={s.previousHBP}
              onChange={(v) => set('previousHBP', v)}
            />

            {s.previousHBP === 'yes' && (
              <Question
                q="Was the repayment balance $0 on January 1 of this year?"
                value={s.repaymentBalanceZero}
                onChange={(v) => set('repaymentBalanceZero', v)}
                sub
              />
            )}

            {g2Terminal && <NotEligible reason="Your previous HBP repayment balance must be $0 on January 1 of this year." />}
          </QuestionGroup>
        )}

        {/* Group 3: Home & Residence */}
        {showG3 && (
          <QuestionGroup title="Home & Residence" step={3} totalSteps={totalSteps}>
            <Question
              q="Do you intend to use the home as your primary residence within one year of buying or building it?"
              value={s.intentPrimaryResidence}
              onChange={(v) => set('intentPrimaryResidence', v)}
            />

            {s.intentPrimaryResidence === 'no' && <NotEligible reason="You must intend to use the home as your primary residence within one year." />}

            {s.intentPrimaryResidence === 'yes' && (
              <>
                <Question
                  q="Have you or your spouse/common-law partner owned the qualifying home for more than 30 days before the withdrawal?"
                  value={s.ownedQualifyingHome30Days}
                  onChange={(v) => set('ownedQualifyingHome30Days', v)}
                />

                {s.ownedQualifyingHome30Days === 'yes' && renderOwnedYesBranch(s, set)}
                {s.ownedQualifyingHome30Days === 'no' && renderOwnedNoBranch(s, set)}
              </>
            )}
          </QuestionGroup>
        )}

        {eligibility === true && (
          <InfoBox variant="success">
            <p className="font-semibold">You appear to be eligible for the Home Buyers' Plan.</p>
          </InfoBox>
        )}
      </div>
    </div>
  );
}

function renderOwnedYesBranch(
  s: HBPState,
  set: <K extends keyof HBPState>(field: K, val: YesNo) => void
) {
  return (
    <>
      <Question
        q="Have you been living separate and apart from your spouse or common-law partner because of a breakdown of your marriage or common-law partnership for a period of at least 90 days at the time of the withdrawal, and began living separate and apart in the year of the withdrawal or in the four preceding calendar years?"
        value={s.livingSeparate90Days}
        onChange={(v) => set('livingSeparate90Days', v)}
        sub
      />

      {s.livingSeparate90Days === 'no' && <NotEligible reason="Since you or your spouse owned the qualifying home for more than 30 days, you must meet the separation conditions." />}

      {s.livingSeparate90Days === 'yes' && (
        <>
          <Question
            q="Do you have a new spouse or common-law partner, and does your new spouse or common-law partner own and occupy a home that is your principal place of residence?"
            value={s.newSpouseOwnsHome}
            onChange={(v) => set('newSpouseOwnsHome', v)}
            sub
          />

          {s.newSpouseOwnsHome === 'yes' && <NotEligible reason="You are not eligible because your new spouse/partner owns and occupies a home that is your principal place of residence." />}

          {s.newSpouseOwnsHome === 'no' && (
            <>
              <Question
                q="Do you own and occupy a home as your principal place of residence?"
                value={s.ownOccupyPrincipalResidence}
                onChange={(v) => set('ownOccupyPrincipalResidence', v)}
                sub
              />

              {s.ownOccupyPrincipalResidence === 'yes' && (
                <>
                  <Question
                    q="Is the qualifying home that you intend to buy or build different from your principal place of residence?"
                    value={s.differentFromPrincipal}
                    onChange={(v) => set('differentFromPrincipal', v)}
                    sub
                  />

                  {s.differentFromPrincipal === 'no' && (
                    <>
                      <Question
                        q="Will you acquire the interest or right of your separated spouse or common-law partner in the home no earlier than 30 days before the withdrawal?"
                        value={s.acquireInterestBeforeWithdrawal}
                        onChange={(v) => set('acquireInterestBeforeWithdrawal', v)}
                        sub
                      />
                      {s.acquireInterestBeforeWithdrawal === 'no' && <NotEligible reason="You must acquire the interest of your separated spouse no earlier than 30 days before withdrawal." />}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

function renderOwnedNoBranch(
  s: HBPState,
  set: <K extends keyof HBPState>(field: K, val: YesNo) => void
) {
  return (
    <>
      <Question
        q="Did you, either individually or together with your spouse/common-law partner, own a home between January 1, 2022 and January 26, 2026?"
        value={s.ownedHomeBetween2022_2026}
        onChange={(v) => set('ownedHomeBetween2022_2026', v)}
        sub
      />

      {s.ownedHomeBetween2022_2026 === 'yes' && (
        <>
          <Question
            q="Have you been living separate and apart from your spouse or common-law partner because of a breakdown of your marriage or common-law partnership for a period of at least 90 days at the time of the withdrawal, and began living separate and apart in the year of the withdrawal or in the four preceding calendar years?"
            value={s.sep_livingSeparate90Days}
            onChange={(v) => set('sep_livingSeparate90Days', v)}
            sub
          />

          {s.sep_livingSeparate90Days === 'no' && <NotEligible reason="Since you owned a home between 2022-2026, you must meet the separation conditions." />}

          {s.sep_livingSeparate90Days === 'yes' && (
            <>
              <Question
                q="Do you have a new spouse or common-law partner, and does your new spouse or common-law partner own and occupy a home that is your principal place of residence?"
                value={s.sep_newSpouseOwnsHome}
                onChange={(v) => set('sep_newSpouseOwnsHome', v)}
                sub
              />

              {s.sep_newSpouseOwnsHome === 'yes' && <NotEligible reason="You are not eligible because your new spouse/partner owns and occupies a home that is your principal place of residence." />}

              {s.sep_newSpouseOwnsHome === 'no' && (
                <>
                  <Question
                    q="Do you own and occupy a home as your principal place of residence?"
                    value={s.sep_ownOccupyPrincipalResidence}
                    onChange={(v) => set('sep_ownOccupyPrincipalResidence', v)}
                    sub
                  />

                  {s.sep_ownOccupyPrincipalResidence === 'yes' && (
                    <>
                      <Question
                        q="Is the qualifying home that you intend to buy or build different from your principal place of residence?"
                        value={s.sep_differentFromPrincipal}
                        onChange={(v) => set('sep_differentFromPrincipal', v)}
                        sub
                      />

                      {s.sep_differentFromPrincipal === 'no' && (
                        <>
                          <Question
                            q="Will you acquire the interest or right of your separated spouse or common-law partner in the home no earlier than 30 days before the withdrawal?"
                            value={s.sep_acquireInterestBeforeWithdrawal}
                            onChange={(v) => set('sep_acquireInterestBeforeWithdrawal', v)}
                            sub
                          />
                          {s.sep_acquireInterestBeforeWithdrawal === 'no' && <NotEligible reason="You must acquire the interest of your separated spouse no earlier than 30 days before withdrawal." />}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

function computeEligibility(s: HBPState): boolean | null {
  if (s.residentOfCanada === 'no') return false;
  if (s.writtenAgreement === 'no') return false;
  if (s.previousHBP === 'yes' && s.repaymentBalanceZero === 'no') return false;
  if (s.intentPrimaryResidence === 'no') return false;

  if (s.ownedQualifyingHome30Days === 'yes') {
    if (s.livingSeparate90Days === 'no') return false;
    if (s.newSpouseOwnsHome === 'yes') return false;
    if (s.newSpouseOwnsHome === 'no') {
      if (s.ownOccupyPrincipalResidence === 'no') return true;
      if (s.ownOccupyPrincipalResidence === 'yes') {
        if (s.differentFromPrincipal === 'yes') return true;
        if (s.differentFromPrincipal === 'no') {
          if (s.acquireInterestBeforeWithdrawal === 'yes') return true;
          if (s.acquireInterestBeforeWithdrawal === 'no') return false;
        }
      }
    }
    return null;
  }

  if (s.ownedQualifyingHome30Days === 'no') {
    if (s.ownedHomeBetween2022_2026 === 'no') return true;
    if (s.ownedHomeBetween2022_2026 === 'yes') {
      if (s.sep_livingSeparate90Days === 'no') return false;
      if (s.sep_newSpouseOwnsHome === 'yes') return false;
      if (s.sep_newSpouseOwnsHome === 'no') {
        if (s.sep_ownOccupyPrincipalResidence === 'no') return true;
        if (s.sep_ownOccupyPrincipalResidence === 'yes') {
          if (s.sep_differentFromPrincipal === 'yes') return true;
          if (s.sep_differentFromPrincipal === 'no') {
            if (s.sep_acquireInterestBeforeWithdrawal === 'yes') return true;
            if (s.sep_acquireInterestBeforeWithdrawal === 'no') return false;
          }
        }
      }
    }
    return null;
  }

  return null;
}

function Question({
  q,
  value,
  onChange,
  sub,
}: {
  q: string;
  value: YesNo;
  onChange: (v: YesNo) => void;
  sub?: boolean;
}) {
  return (
    <div className={`${sub ? 'ml-5 pl-4 border-l-2 border-qt-border' : ''}`}>
      <p className="text-sm text-qt-primary leading-[22px] mb-3">{q}</p>
      <div className="flex gap-6">
        <RadioButton
          name={q.slice(0, 30).replace(/\s/g, '-')}
          value="yes"
          label="Yes"
          checked={value === 'yes'}
          onChange={() => onChange('yes')}
        />
        <RadioButton
          name={q.slice(0, 30).replace(/\s/g, '-')}
          value="no"
          label="No"
          checked={value === 'no'}
          onChange={() => onChange('no')}
        />
      </div>
    </div>
  );
}

function NotEligible({ reason }: { reason: string }) {
  return (
    <InfoBox variant="error">
      <p><strong>Not eligible.</strong> {reason}</p>
    </InfoBox>
  );
}
