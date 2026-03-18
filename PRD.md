# PRD: Questrade Withdrawals 2.0

**Document version:** 1.0  
**Date:** March 2026  
**Status:** Based on current codebase implementation

---

## 1. Product Overview

### What It Is
Questrade Withdrawals 2.0 is a web-based wizard application that enables Questrade clients to initiate and submit withdrawal requests from their registered and non-registered investment accounts. It is surfaced within the Questrade platform shell under the **Move Money** navigation tab.

### Problem It Solves
Withdrawing funds from Canadian investment accounts — particularly registered accounts such as RRSPs, FHSAs, and RESPs — involves significant regulatory complexity: CRA-mandated forms, withholding tax obligations, eligibility requirements, and program-specific limits. Traditionally these processes require clients to download, complete, and mail paper forms or call in to a service representative.

This product replaces that experience with a guided, digital wizard that:

- Determines eligibility in real time through structured questionnaires
- Calculates withholding taxes and net withdrawal amounts automatically
- Enforces CRA regulatory limits (e.g. HBP $60,000 CAD, LLP $10,000/year, EAP $8,000 first-13-weeks)
- Pre-fills government forms (T1036, RC96, RC725, RC727) from collected answers for download
- Routes funds via the client's preferred withdrawal method (EFT, Wire, International Wire)

### Supported Account Types

| Account | Flow |
|---|---|
| TFSA | Standard |
| Cash | Standard |
| Margin | Standard |
| RRSP | Specialized (4 sub-types) |
| FHSA | Specialized (3 sub-types) |
| RESP | Specialized (3 sub-types) |

---

## 2. Goals & Success Metrics

### Goals

**G1 — Reduce withdrawal processing friction**  
Clients can complete a withdrawal request end-to-end in a single digital session without paper forms or phone calls for the majority of withdrawal types.

**G2 — Ensure regulatory compliance**  
The application enforces CRA-mandated eligibility rules, withholding tax obligations, and program withdrawal limits before a request can be submitted.

**G3 — Provide transparency on tax implications**  
Clients see the withholding tax amount, tax rate, and net withdrawal amount before confirming, for all taxable withdrawal types.

**G4 — Support multi-currency withdrawals**  
Clients holding both CAD and USD balances can choose either currency, with automatic cross-currency availability calculations applying a 2.25% FX conversion buffer (1.5% internal fees + 0.75% FX fluctuation).

**G5 — Digitize government forms**  
CRA forms (T1036, RC96, RC725, RC727) are replaced by in-app questionnaires that generate pre-filled downloadable PDFs upon completion.

### Success Metrics

| Metric | Description |
|---|---|
| Wizard completion rate | % of users who start a withdrawal and reach "Submit" |
| Eligibility determination rate | % of users for whom the questionnaire returns a definitive eligible/not-eligible result |
| Form download rate | % of qualified withdrawals where the user downloads the pre-filled CRA form |
| Error rate on submission | % of submissions blocked by validation (exceeds balance, missing fields) |
| Multi-currency conversion trigger rate | % of withdrawals where the entered amount triggers an FX conversion warning |

---

## 3. User Stories

### 3.1 Platform & Navigation

**US-01**  
As a client, I want to see the Questrade platform navigation (top ribbon, sidebar) while completing a withdrawal, so that the experience feels integrated with the broader platform.

**US-02**  
As a client, I want the "Move Money" tab to always be visually highlighted as active, so that I know I am in the correct section.

**US-03**  
As a client, I want the account dropdown to automatically route me to the correct withdrawal flow when I switch account types, so that I never fill out the wrong form.

---

### 3.2 Balance & Currency

**US-04**  
As a client, I want to see my available CAD and USD balances before choosing a withdrawal amount, so that I know how much I can withdraw.

**US-05**  
As a client, I want to toggle between a combined view (total in one currency) and a separate view (CAD and USD shown individually) of my account balance, so that I can understand my cross-currency position.

**US-06**  
As a client, I want the combined available balance to account for a 2.25% FX buffer, so that I am not shown an amount that cannot actually be converted at current market rates.

**US-07**  
As a client, I want to choose whether my withdrawal is processed in CAD or USD, so that I receive funds in my preferred currency.

**US-08**  
As a client, I want to see the maximum withdrawable amount for each currency before selecting, so that I can make an informed choice.

**US-09**  
As a client, I want to be warned when my withdrawal amount will require an automatic currency conversion, so that I understand the FX implications before confirming.

---

### 3.3 Withdrawal Amount & Validation

**US-10**  
As a client, I want to enter a withdrawal amount and immediately see if it exceeds my available balance, so that I do not submit an invalid request.

**US-11**  
As a client, I want the withdrawal amount field to format my input with commas and two decimal places on focus loss, so that I can confirm I entered the correct number.

**US-12**  
As a client, I want the application to prevent me from entering an amount above the applicable regulatory limit (e.g. $60,000 for HBP, $10,000/year for LLP, $8,000 for EAP within first 13 weeks), so that my request stays within CRA rules.

**US-13**  
As a client, I want to see a disclosure when my withdrawal exceeds $50,000 CAD or $25,000 USD, so that I know the transaction will be processed in multiple withdrawals.

---

### 3.4 Withdrawal Method & Bank

**US-14**  
As a client, I want to choose between EFT (free), Wire Transfer ($20 CAD / $30 USD), and International Wire Transfer ($40) as my withdrawal method, so that I can balance speed and cost.

**US-15**  
As a client, I want to select a previously linked bank account as the destination for my withdrawal, so that I do not have to re-enter my banking details every time.

**US-16**  
As a client, I want to link a new bank account during the withdrawal flow without leaving the page, so that I can complete my request in one session.

**US-17**  
As a client linking a bank manually, I want to upload a void cheque or direct deposit form, so that Questrade can verify my banking details.

**US-18**  
As a client sending an international wire, I want to provide full recipient bank details (name, address, SWIFT/BIC, account/IBAN, routing number), so that the wire can be processed internationally.

**US-19**  
As a client sending an international wire to a brokerage, I want to provide brokerage-specific details (name, account name, account number), so that the funds are correctly allocated at the receiving institution.

**US-20**  
As a client sending an international wire, I want to optionally specify an intermediary bank, so that I can accommodate correspondent banking requirements.

---

### 3.5 Review & Confirmation

**US-21**  
As a client, I want to review a summary of my withdrawal (account, currency, amount, method, fee, bank, net amount) before submitting, so that I can verify all details are correct.

**US-22**  
As a client, I want to see the net amount (withdrawal minus fees and applicable taxes) on the summary screen, so that I know exactly how much I will receive.

**US-23**  
As a client, I want to see a success screen after submitting my withdrawal, so that I have confirmation the request was received.

**US-24**  
As a client, I want to start a new withdrawal immediately after submitting one, so that I can process multiple withdrawals in one session.

---

### 3.6 RRSP — Deregistration

**US-25**  
As a client withdrawing from my RRSP (deregistration), I want to enter either a gross amount or a desired net amount, and have the withholding tax calculated automatically, so that I know exactly how much CRA will receive on my behalf.

**US-26**  
As a client, I want the withholding tax rate to follow CRA tiered brackets (10% ≤$5,000 / 20% ≤$15,000 / 30% >$15,000), so that the calculation matches my actual tax obligation.

**US-27**  
As a client entering a net amount, I want the system to reverse-calculate the gross amount using the correct tax bracket, so that I receive exactly the net amount I intended.

---

### 3.7 RRSP — Home Buyer's Plan (HBP)

**US-28**  
As a client withdrawing under the Home Buyer's Plan, I want to complete an in-app eligibility questionnaire based on CRA T1036 requirements, so that my eligibility is determined before the request is submitted.

**US-29**  
As a client, I want to be informed when I do not qualify for the HBP based on my answers (e.g. not a resident, written agreement missing, prior HBP balance outstanding), so that I understand why my request cannot proceed.

**US-30**  
As a client eligible for the HBP, I want to enter the address of my qualifying home, provide my electronic initials, and download a pre-filled T1036 form, so that I have the documentation required by CRA.

**US-31**  
As a client, I want the HBP withdrawal limit ($60,000 CAD or its USD equivalent) enforced at the amount input, so that I cannot submit a request that exceeds the program cap.

---

### 3.8 RRSP — Lifelong Learning Plan (LLP)

**US-32**  
As a client withdrawing under the Lifelong Learning Plan, I want to complete an in-app eligibility questionnaire based on CRA RC96 requirements (including the annual $10,000 and lifetime $20,000 CAD limits), so that my eligibility is verified before submission.

**US-33**  
As a client, I want the LLP questionnaire to support withdrawals for both myself and my spouse or common-law partner, so that I can initiate LLP withdrawals on behalf of an eligible student.

**US-34**  
As a client, I want to see a warning when my cumulative LLP withdrawals approach the annual or lifetime limit, so that I can plan accordingly.

**US-35**  
As a client, I want to download a pre-filled RC96 form after completing the eligibility questionnaire, so that I have the CRA documentation required for the withdrawal.

---

### 3.9 RRSP — Overcontribution

**US-36**  
As a client who has overcontributed to my RRSP, I want to be shown clear instructions for completing the CRA T3012A Tax Deduction Waiver offline and mailing it to Questrade, so that I know the correct process for correcting my overcontribution.

---

### 3.10 FHSA — Qualifying (Tax-Free Home Purchase)

**US-37**  
As a client making a qualifying FHSA withdrawal (tax-free home purchase), I want to complete an in-app RC725 eligibility questionnaire, so that my first-time buyer status and qualifying home purchase are verified before submission.

**US-38**  
As a client, I want to be blocked from proceeding if I am not a first-time buyer (owned a qualifying home as primary residence in the current year or prior 4 years), so that I do not make an ineligible tax-free withdrawal.

**US-39**  
As a client eligible for a qualifying FHSA withdrawal, I want to enter my property address, sign electronically, and download a pre-filled RC725 form, so that I have the required CRA documentation.

---

### 3.11 FHSA — Non-Qualifying (Taxable)

**US-40**  
As a client making a non-qualifying FHSA withdrawal, I want to see the same gross/net tax calculator as the RRSP deregistration flow, so that I understand the withholding tax impact before confirming.

---

### 3.12 FHSA — Overcontribution (RC727)

**US-41**  
As a client who has overcontributed to my FHSA, I want to complete an RC727 questionnaire specifying the source of excess funds and the removal method (designated withdrawal or RRSP transfer), so that my overcontribution is corrected per CRA requirements.

**US-42**  
As a client correcting an FHSA overcontribution via RRSP transfer, I want to select the destination RRSP account from a list of my accounts, so that the transfer is directed to the correct account.

**US-43**  
As a client, I want to be reminded that completing the RC727 stops the 1% monthly penalty going forward but does not eliminate the need to file RC728 for past penalty months, so that I understand my remaining tax obligations.

---

### 3.13 RESP — EAP & PSE (Educational Assistance Payment)

**US-44**  
As a subscriber, I want to select the beneficiary receiving the EAP/PSE withdrawal, so that the correct student's account information is used on the government form.

**US-45**  
As a subscriber, I want to be blocked from making an EAP/PSE withdrawal for a non-resident beneficiary, so that the withdrawal complies with CRA residency requirements.

**US-46**  
As a subscriber, I want to provide my beneficiary's educational institution details (name, address, program type, enrollment status, program name, start date, length, current year), so that the withdrawal can be verified against enrollment criteria.

**US-47**  
As a subscriber, I want EAP withdrawal limits enforced based on enrollment status and program start date:
- Part-time: max $4,000 per withdrawal
- Full-time within first 13 weeks: max $8,000
- Full-time after 13 weeks: no limit

...so that withdrawals comply with CESG program rules.

**US-48**  
As a subscriber, I want to choose between a "Full" withdrawal (auto-fills the maximum) and a "Partial" withdrawal (manual entry), so that I can control the exact amount.

**US-49**  
As a subscriber, I want to choose automatic distribution (EAP drawn first, then PSE) or manually specify EAP and PSE amounts, so that I have control over the tax implications of the withdrawal.

**US-50**  
As a subscriber sending funds to myself, I want to be prompted for the beneficiary's electronic consent if the beneficiary has reached the age of majority in their province (18 in most provinces, 19 in BC, NB, NL, NT, NS, NU, YT), so that the beneficiary's authorization is on record.

**US-51**  
As a subscriber, I want to upload proof of enrollment (issued within the last 6 months) and confirm its validity, so that the withdrawal request includes the required documentation.

**US-52**  
As a subscriber with a joint subscriber on the account, I want both parties' electronic signatures collected, so that the authorization is complete.

---

### 3.14 RESP — Capital Withdrawal

**US-53**  
As a subscriber, I want to withdraw my RESP contributions (PSE capital only), with the application confirming the funds are not intended for education (which would require an EAP instead), so that the withdrawal type is correctly classified.

**US-54**  
As a subscriber, I want to be informed whether Canada Education Savings Grants (CESGs) must be returned to HRSDC based on whether the beneficiary has previously received an EAP, so that I understand the financial implications before confirming.

**US-55**  
As a subscriber, I want to acknowledge that administrative or deregistration fees may apply to a capital withdrawal, so that I am not surprised by post-submission charges.

---

### 3.15 RESP — Accumulated Income Payment (AIP)

**US-56**  
As a subscriber making an AIP withdrawal (T1172), I want to see a real-time tax calculation based on my province (20% for most provinces, 12% for Quebec), my total AIP amount, and any RRSP deduction I am applying, so that I know the additional tax I will owe before confirming.

**US-57**  
As a subscriber, I want to be prevented from submitting an AIP withdrawal if the calculated tax and fees exceed the withdrawal amount (net ≤ $0), so that I do not submit a request that results in no funds being received.

**US-58**  
As a subscriber rolling over AIP to an RRSP (T1171), I want to specify the destination RRSP/PRPP/SPP account, transfer amount, and confirm I am within my RRSP deduction limit, so that the rollover is processed correctly.

**US-59**  
As a subscriber, I want to confirm I understand I must close the RESP in February of the following calendar year after making an AIP withdrawal, so that I am aware of the administrative requirement.

---

### 3.16 Electronic Signature

**US-60**  
As a client, I want to provide my electronic initials as a signature to authorize regulated withdrawals (HBP, LLP, FHSA qualifying, FHSA overcontribution, international wire, RESP flows), so that I provide legally meaningful authorization without a physical signature.

**US-61**  
As a system, I want the e-signature input to be irreversible within the session once confirmed, so that signed authorizations cannot be accidentally cleared.

---

### 3.17 Questionnaire Logic — HBP (T1036)

**US-62**  
As a system, I want to block the HBP questionnaire from proceeding when the client answers "No" to Canadian residency, so that non-residents cannot initiate HBP withdrawals.

**US-63**  
As a system, I want to block the HBP questionnaire when the client does not have a written agreement to buy or build a qualifying home, so that only clients with confirmed purchase intent can proceed.

**US-64**  
As a system, I want to check whether the client has previously participated in the HBP and, if so, require their repayment balance to be $0 on January 1 of the current year, so that clients with outstanding HBP obligations are prevented from making a new withdrawal.

**US-65**  
As a system, I want to block the HBP questionnaire when the client does not intend to use the home as their primary residence within one year, so that the withdrawal complies with the primary residence requirement.

**US-66**  
As a client who has owned the qualifying home for more than 30 days, I want the questionnaire to determine my eligibility through a separation/divorce branch (90-day separation check, new spouse ownership check, principal residence differentiation, and interest acquisition timing), so that separated individuals can still qualify under the HBP rules.

**US-67**  
As a client who has not owned the home for more than 30 days, I want the questionnaire to check whether I owned a home between January 1, 2022 and January 26, 2026, and if so, apply the same separation/divorce branch, so that recent homeowners are assessed under the updated 2022–2026 ownership rules.

**US-68**  
As a system, I want changing an upstream HBP answer to automatically clear all downstream answers, so that a client cannot carry forward stale eligibility data from a previous answer path.

---

### 3.18 Questionnaire Logic — LLP (RC96)

**US-69**  
As a client, I want to specify whether the LLP student is myself or my spouse/common-law partner, and provide the student's name and SIN, so that the correct person's information is captured on the RC96 form.

**US-70**  
As a system, I want to block the LLP questionnaire when the student is not enrolled in a qualifying educational program at a designated institution, so that ineligible students cannot access LLP funds.

**US-71**  
As a system, I want to block part-time students from LLP eligibility unless they meet a disability condition per CRA Guide RC4112, so that the part-time student exemption is correctly applied.

**US-72**  
As a system, I want to block clients who have used the LLP for more than 4 years or have already started making repayments, so that the 4-year participation window is enforced.

**US-73**  
As a system, I want to track the client's LLP withdrawals for the current year and previous years separately, and show a warning when the annual limit ($10,000 CAD) or lifetime limit ($20,000 CAD) is exceeded, informing the client that the RRSP issuer will withhold tax on the excess portion.

**US-74**  
As a system, I want changing an upstream LLP answer to automatically clear all downstream answers, so that previous eligibility determinations are not carried forward incorrectly.

---

### 3.19 Questionnaire Logic — FHSA Qualifying (RC725)

**US-75**  
As a system, I want to block the FHSA qualifying questionnaire when the client is not a Canadian resident or will not remain a resident until home ownership, so that residency requirements are enforced.

**US-76**  
As a system, I want to block clients who have lived in a home they owned as their primary residence at any point in the current year or the past 4 calendar years, so that the first-time home buyer requirement is enforced.

**US-77**  
As a system, I want to block clients who took ownership of their home more than 30 days ago, so that the 30-day withdrawal window after ownership is enforced.

**US-78**  
As a system, I want to block clients who do not have a signed written agreement to buy or build before October 1 of the following year, so that the purchase commitment deadline is enforced.

**US-79**  
As a system, I want to block clients who do not plan to make the home their primary residence within one year, so that investment property purchases do not qualify for the tax-free withdrawal.

**US-80**  
As a client who passes all qualifying questions, I want to see a confirmation that I am eligible for a tax-free withdrawal before entering my property address and providing my signature, so that I am confident in my eligibility before finalizing the request.

**US-81**  
As a system, I want changing an upstream FHSA qualifying answer to automatically clear all downstream answers, so that eligibility is recalculated cleanly when a client revises an earlier response.

---

### 3.20 Questionnaire Logic — FHSA Overcontribution (RC727)

**US-82**  
As a system, I want the excess FHSA amount entered in the RC727 questionnaire to be bidirectionally synced with the gross withdrawal amount, so that clients see a consistent overcontribution figure throughout the flow.

**US-83**  
As a system, I want to restrict the removal method options based on the source of excess funds: cash deposits can only be removed as a designated withdrawal, RRSP transfers can only be removed as a designated transfer, and both sources allow either option, so that the correction method matches CRA requirements.

**US-84**  
As a client choosing to transfer excess funds to an RRSP, I want to select the destination RRSP account from a list of my eligible accounts, so that the transfer is directed to the correct account.

**US-85**  
As a system, I want to display a tax reminder informing the client that removing excess funds stops the 1% monthly penalty but does not eliminate the requirement to file Form RC728 for prior penalty months, so that the client understands their remaining CRA obligations.

**US-86**  
As a system, I want changing the source of excess funds to clear the removal method and destination account selections, so that downstream choices are always consistent with the current source answer.

---

### 3.21 Questionnaire Logic — RESP EAP/PSE

**US-87**  
As a system, I want to block EAP/PSE withdrawals when the selected beneficiary is a non-resident of Canada, so that the CRA residency requirement for EAP and PSE payments is enforced.

**US-88**  
As a system, I want to calculate whether the beneficiary is within the first 13 weeks of their post-secondary program by parsing the program start date and comparing it to the current date, so that the correct EAP withdrawal limit ($8,000 for full-time within 13 weeks, $4,000 for part-time, unlimited for full-time after 13 weeks) is dynamically applied.

**US-89**  
As a system, I want the "Full" withdrawal option to auto-fill the lesser of the available balance and the applicable EAP/PSE limit, and display a note when the limit caps the withdrawal below the available balance, so that the client understands why the full amount may be less than their balance.

**US-90**  
As a system, I want to determine the beneficiary's age of majority based on their province of residence (19 for BC, NB, NL, NT, NS, NU, YT; 18 for all others) and their date of birth, so that the beneficiary consent requirement is accurately triggered.

**US-91**  
As a system, I want to require the beneficiary's electronic initials when funds are directed to the subscriber and the beneficiary has reached the age of majority, and to allow the flow to proceed without consent when the beneficiary is a minor, so that the authorization requirements match the beneficiary's legal capacity.

**US-92**  
As a system, I want to gate the payment method and bank selection behind the beneficiary consent step (when applicable), so that the withdrawal cannot be finalized without proper authorization.

---

### 3.22 Questionnaire Logic — RESP Capital

**US-93**  
As a system, I want to redirect the client to the standard RESP withdrawal form when they indicate the capital withdrawal is intended to pay for post-secondary education, so that the correct withdrawal type (EAP) is used.

**US-94**  
As a system, I want to inform the client whether the Canada Education Savings Grant (CESG) must be returned to HRSDC based on the beneficiary's prior EAP history: no return required if the beneficiary has previously received an EAP, and grants must be returned if they have not, so that the client understands the financial impact before confirming.

---

### 3.23 Questionnaire Logic — RESP AIP (T1172 Withdrawal)

**US-95**  
As a system, I want to block AIP withdrawals when the subscriber is not a Canadian resident, so that the CRA residency requirement for Accumulated Income Payments is enforced.

**US-96**  
As a system, I want to calculate additional tax on an AIP withdrawal in real time across 9 computation lines: total AIP, RRSP deduction, lifetime maximum ($50,000), previous uses, remaining limit, allowable deduction, AIP subject to tax, applicable rate (20% for most provinces, 12% for Quebec), and final additional tax amount, so that the client sees the exact tax impact before confirming.

**US-97**  
As a system, I want the T1172 tax rate to be 12% when the subscriber resided in Quebec on December 31 of the tax year, and 20% for all other provinces and territories, so that the provincial tax rate is correctly applied.

---

### 3.24 Questionnaire Logic — RESP AIP (T1171 Rollover)

**US-98**  
As a system, I want to block the AIP rollover when the subscriber's relationship to the RESP is "none of the above" (not the original subscriber, not a spouse via marriage breakdown, not a spouse of the deceased original subscriber), so that only eligible subscribers can use the T1171 tax waiver.

**US-99**  
As a system, I want to block the AIP rollover when the client selects "Cash" as the transfer destination, so that the T1171 form is only used for legitimate RRSP/PRPP/SPP rollovers.

**US-100**  
As a system, I want to warn the client when their rollover amount exceeds the $50,000 lifetime transfer limit (inclusive of prior transfers), so that the client understands tax will be withheld on the excess.

**US-101**  
As a system, I want to warn the client when their transfer does not fit within their available RRSP deduction limit, so that the client understands the financial institution is required to withhold tax on the excess.

---

## 4. Out of Scope

The following are explicitly not part of this product based on what exists in the codebase:

| Item | Notes |
|---|---|
| **Deposits** | The Move Money page has a Deposit button but it has no `onClick` handler and no route — purely decorative. |
| **Transfers between accounts** | The Transfer button exists on the Move Money page but is not functional. |
| **Currency exchange** | The Exchange button exists on the Move Money page but is not functional. |
| **RRSP Overcontribution online submission** | The overcontribution flow is informational only — no form is submitted digitally. Clients are directed to mail the T3012A to Questrade. |
| **Authentication & authorization** | There is no login, session management, or user identity verification. Client data is mocked. |
| **Backend integration** | All data is mock/static. No API calls are made. Submission triggers a UI state change only. |
| **Actual PDF generation** | "Download pre-filled form" buttons exist in summaries but do not trigger a real PDF download — the functionality is represented but not implemented. |
| **Real FX rate feeds** | The FX rate is hardcoded at 1.36 CAD/USD with no live feed. |
| **Notifications or confirmations by email/SMS** | The success screen mentions "a copy will be sent to your email" but no email is actually sent. |
| **Withdrawal cancellation or history** | The Move Money page's transaction history is mock data only; no real transaction retrieval, cancellation, or status tracking exists. |
| **Non-Canadian accounts or foreign registered plans** | All account types and tax logic are specific to Canadian regulations (CRA). |
| **RRSP Spousal withdrawals** | No spousal RRSP-specific attribution rules or form flows are implemented. |
| **RESP multi-beneficiary splits** | Only one beneficiary is selected per withdrawal request; splitting a single withdrawal across multiple beneficiaries is not supported. |
| **Accessibility (WCAG)** | No `aria-*` labels, roles, or keyboard navigation optimizations are present in the codebase. |
| **Mobile responsive layout** | The layout uses a fixed left sidebar and top ribbon that are not adapted for mobile viewports. |
