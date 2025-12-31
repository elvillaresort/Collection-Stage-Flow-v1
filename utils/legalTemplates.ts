import { SmallClaimsCaseDetails } from '../types';

/**
 * Utility functions for generating Philippine legal document templates
 * for Small Claims cases
 */

// Helper function to format currency
const formatCurrency = (amount: number): string => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper function to format dates
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Helper function to add days to a date
const addDays = (dateString: string, days: number): string => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

/**
 * Generate First Demand Letter (5-day notice)
 */
export const generateDemandLetter1 = (caseDetails: SmallClaimsCaseDetails): string => {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = addDays(today, 5);

    return `
    <div style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; max-width: 8.5in; margin: 0 auto; padding: 1in;">
      <div style="text-align: right; margin-bottom: 2em;">
        ${formatDate(today)}
      </div>
      
      <div style="margin-bottom: 2em;">
        <strong>${caseDetails.debtorName}</strong><br/>
        ${caseDetails.debtorAddress}
      </div>
      
      <div style="margin-bottom: 1em;">
        <strong>Re: FIRST DEMAND LETTER</strong><br/>
        <strong>Account Reference: ${caseDetails.referenceNumber}</strong>
      </div>
      
      <p>Dear ${caseDetails.debtorName},</p>
      
      <p style="text-align: justify;">
        This letter is a <strong>FORMAL DEMAND</strong> for the immediate payment of your outstanding obligation 
        to <strong>${caseDetails.creditorName}</strong> in the total amount of <strong>${formatCurrency(caseDetails.totalAmount)}</strong>.
      </p>
      
      <p style="text-align: justify;">
        Our records show that you obtained a loan/credit facility on <strong>${formatDate(caseDetails.loanDate)}</strong> 
        with a principal amount of <strong>${formatCurrency(caseDetails.principalAmount)}</strong>, which became due and 
        demandable on <strong>${formatDate(caseDetails.dueDate)}</strong>.
      </p>
      
      <p style="text-align: justify;">
        Despite the lapse of the due date and our previous attempts to contact you, this obligation remains 
        <strong>UNPAID and OUTSTANDING</strong>.
      </p>
      
      <div style="margin: 2em 0; padding: 1em; border: 2px solid #000;">
        <p style="margin: 0;"><strong>ACCOUNT SUMMARY:</strong></p>
        <table style="width: 100%; margin-top: 1em;">
          <tr>
            <td>Principal Amount:</td>
            <td style="text-align: right;"><strong>${formatCurrency(caseDetails.principalAmount)}</strong></td>
          </tr>
          ${caseDetails.interestRate ? `
          <tr>
            <td>Interest Charges:</td>
            <td style="text-align: right;"><strong>${formatCurrency((caseDetails.totalAmount - caseDetails.principalAmount - (caseDetails.penaltyAmount || 0)))}</strong></td>
          </tr>
          ` : ''}
          ${caseDetails.penaltyAmount ? `
          <tr>
            <td>Penalty/Late Charges:</td>
            <td style="text-align: right;"><strong>${formatCurrency(caseDetails.penaltyAmount)}</strong></td>
          </tr>
          ` : ''}
          <tr style="border-top: 2px solid #000;">
            <td><strong>TOTAL AMOUNT DUE:</strong></td>
            <td style="text-align: right;"><strong>${formatCurrency(caseDetails.totalAmount)}</strong></td>
          </tr>
        </table>
      </div>
      
      <p style="text-align: justify;">
        You are hereby given <strong>FIVE (5) CALENDAR DAYS</strong> from receipt of this letter, or until 
        <strong>${formatDate(dueDate)}</strong>, to settle this obligation in full.
      </p>
      
      <p style="text-align: justify;">
        Payment may be made through the following channels:
      </p>
      
      <ul>
        <li>Bank Transfer/Deposit to our account</li>
        <li>Payment at our office located at ${caseDetails.creditorAddress}</li>
        <li>Authorized payment centers</li>
      </ul>
      
      <p style="text-align: justify;">
        <strong>FAILURE TO COMPLY</strong> with this demand will leave us with no other recourse but to pursue 
        further collection actions, including but not limited to the filing of appropriate legal proceedings 
        before the proper courts.
      </p>
      
      <p style="text-align: justify;">
        We trust that you will give this matter your immediate and preferential attention to avoid any 
        unpleasant consequences.
      </p>
      
      <div style="margin-top: 3em;">
        <p>Very truly yours,</p>
        <div style="margin-top: 3em; margin-bottom: 0.5em;">
          <strong>${caseDetails.authorizedOfficer}</strong><br/>
          ${caseDetails.officerPosition}<br/>
          ${caseDetails.creditorName}
        </div>
      </div>
    </div>
  `;
};

/**
 * Generate Second Demand Letter (3-day notice)
 */
export const generateDemandLetter2 = (caseDetails: SmallClaimsCaseDetails): string => {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = addDays(today, 3);

    return `
    <div style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; max-width: 8.5in; margin: 0 auto; padding: 1in;">
      <div style="text-align: right; margin-bottom: 2em;">
        ${formatDate(today)}
      </div>
      
      <div style="margin-bottom: 2em;">
        <strong>${caseDetails.debtorName}</strong><br/>
        ${caseDetails.debtorAddress}
      </div>
      
      <div style="margin-bottom: 1em;">
        <strong>Re: SECOND AND URGENT DEMAND LETTER</strong><br/>
        <strong>Account Reference: ${caseDetails.referenceNumber}</strong>
      </div>
      
      <p>Dear ${caseDetails.debtorName},</p>
      
      <p style="text-align: justify;">
        This is our <strong>SECOND AND URGENT DEMAND</strong> for the immediate payment of your outstanding 
        obligation to <strong>${caseDetails.creditorName}</strong> in the amount of 
        <strong>${formatCurrency(caseDetails.totalAmount)}</strong>.
      </p>
      
      <p style="text-align: justify;">
        Despite our previous demand letter, you have <strong>FAILED and REFUSED</strong> to settle your obligation 
        or even communicate with us regarding payment arrangements.
      </p>
      
      <p style="text-align: justify; background-color: #fff3cd; padding: 1em; border-left: 4px solid #ff9800;">
        <strong>⚠️ URGENT NOTICE:</strong> This is your <strong>FINAL OPPORTUNITY</strong> to settle this matter 
        amicably before we are compelled to initiate legal proceedings.
      </p>
      
      <div style="margin: 2em 0; padding: 1em; border: 2px solid #d32f2f; background-color: #ffebee;">
        <p style="margin: 0; color: #d32f2f;"><strong>OUTSTANDING BALANCE:</strong></p>
        <p style="font-size: 18pt; margin: 0.5em 0; color: #d32f2f;"><strong>${formatCurrency(caseDetails.totalAmount)}</strong></p>
        <p style="margin: 0; font-size: 10pt;">Account Ref: ${caseDetails.referenceNumber}</p>
      </div>
      
      <p style="text-align: justify;">
        You are hereby given a <strong>FINAL PERIOD OF THREE (3) CALENDAR DAYS</strong> from receipt of this letter, 
        or until <strong>${formatDate(dueDate)}</strong>, to settle this obligation in full.
      </p>
      
      <p style="text-align: justify;">
        <strong>CONSEQUENCES OF NON-PAYMENT:</strong>
      </p>
      
      <ul>
        <li>Filing of a Small Claims case before the Metropolitan Trial Court</li>
        <li>Additional legal fees and court costs will be charged to your account</li>
        <li>Possible garnishment of wages or bank accounts</li>
        <li>Negative impact on your credit standing</li>
        <li>Public record of court judgment against you</li>
      </ul>
      
      <p style="text-align: justify;">
        We strongly urge you to contact our office immediately at your earliest convenience to discuss 
        payment arrangements and avoid litigation.
      </p>
      
      <p style="text-align: justify;">
        <strong>This is your LAST CHANCE to resolve this matter without court intervention.</strong>
      </p>
      
      <div style="margin-top: 3em;">
        <p>Very truly yours,</p>
        <div style="margin-top: 3em; margin-bottom: 0.5em;">
          <strong>${caseDetails.authorizedOfficer}</strong><br/>
          ${caseDetails.officerPosition}<br/>
          ${caseDetails.creditorName}
        </div>
      </div>
    </div>
  `;
};

/**
 * Generate Final Demand Letter (Pre-litigation)
 */
export const generateFinalDemand = (caseDetails: SmallClaimsCaseDetails): string => {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = addDays(today, 2);

    return `
    <div style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; max-width: 8.5in; margin: 0 auto; padding: 1in;">
      <div style="text-align: right; margin-bottom: 2em;">
        ${formatDate(today)}
      </div>
      
      <div style="margin-bottom: 2em;">
        <strong>${caseDetails.debtorName}</strong><br/>
        ${caseDetails.debtorAddress}
      </div>
      
      <div style="margin-bottom: 1em; background-color: #d32f2f; color: white; padding: 0.5em;">
        <strong>Re: FINAL DEMAND LETTER - PRE-LITIGATION NOTICE</strong><br/>
        <strong>Account Reference: ${caseDetails.referenceNumber}</strong>
      </div>
      
      <p>Dear ${caseDetails.debtorName},</p>
      
      <p style="text-align: justify; font-weight: bold;">
        This is our <strong style="text-decoration: underline;">FINAL AND LAST DEMAND</strong> before we file 
        a Small Claims case against you in court.
      </p>
      
      <p style="text-align: justify;">
        Despite our repeated demands, you have <strong>CONTINUOUSLY FAILED and REFUSED</strong> to pay your 
        outstanding obligation to <strong>${caseDetails.creditorName}</strong> in the amount of 
        <strong>${formatCurrency(caseDetails.totalAmount)}</strong>.
      </p>
      
      <div style="margin: 2em 0; padding: 1.5em; border: 3px solid #d32f2f; background-color: #ffebee;">
        <p style="text-align: center; margin: 0; font-size: 14pt; color: #d32f2f;">
          <strong>⚖️ NOTICE OF IMPENDING LEGAL ACTION ⚖️</strong>
        </p>
        <p style="text-align: center; margin: 1em 0; font-size: 16pt; color: #d32f2f;">
          <strong>${formatCurrency(caseDetails.totalAmount)}</strong>
        </p>
        <p style="text-align: center; margin: 0; font-size: 10pt;">
          Plus legal fees, court costs, and attorney's fees
        </p>
      </div>
      
      <p style="text-align: justify;">
        <strong>ACCOUNT DETAILS:</strong>
      </p>
      
      <table style="width: 100%; margin: 1em 0; border-collapse: collapse;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 0.5em; border: 1px solid #ddd;">Loan Date:</td>
          <td style="padding: 0.5em; border: 1px solid #ddd;"><strong>${formatDate(caseDetails.loanDate)}</strong></td>
        </tr>
        <tr>
          <td style="padding: 0.5em; border: 1px solid #ddd;">Due Date:</td>
          <td style="padding: 0.5em; border: 1px solid #ddd;"><strong>${formatDate(caseDetails.dueDate)}</strong></td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 0.5em; border: 1px solid #ddd;">Days Overdue:</td>
          <td style="padding: 0.5em; border: 1px solid #ddd;"><strong>${Math.floor((new Date().getTime() - new Date(caseDetails.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days</strong></td>
        </tr>
        <tr>
          <td style="padding: 0.5em; border: 1px solid #ddd;">Reference Number:</td>
          <td style="padding: 0.5em; border: 1px solid #ddd;"><strong>${caseDetails.referenceNumber}</strong></td>
        </tr>
      </table>
      
      <p style="text-align: justify; background-color: #fff3cd; padding: 1em; border-left: 4px solid #ff9800;">
        <strong>⏰ FINAL DEADLINE:</strong> You have until <strong>${formatDate(dueDate)}</strong> to settle 
        this obligation. After this date, we will immediately file a Small Claims case with the 
        <strong>${caseDetails.courtBranch}</strong> without further notice.
      </p>
      
      <p style="text-align: justify;">
        <strong>IF YOU FAIL TO PAY, THE FOLLOWING WILL HAPPEN:</strong>
      </p>
      
      <ol>
        <li style="margin-bottom: 0.5em;">A Small Claims case will be filed against you in court</li>
        <li style="margin-bottom: 0.5em;">You will be required to appear before the court</li>
        <li style="margin-bottom: 0.5em;">A judgment will be rendered against you</li>
        <li style="margin-bottom: 0.5em;">Your wages or bank accounts may be garnished</li>
        <li style="margin-bottom: 0.5em;">Additional costs including filing fees, sheriff's fees, and attorney's fees will be added to your debt</li>
        <li style="margin-bottom: 0.5em;">This will become a permanent public record affecting your creditworthiness</li>
      </ol>
      
      <p style="text-align: justify; font-weight: bold; font-size: 13pt;">
        THIS IS YOUR ABSOLUTE LAST OPPORTUNITY TO AVOID LITIGATION.
      </p>
      
      <p style="text-align: justify;">
        Contact our office immediately to arrange payment. We are still willing to discuss settlement options 
        if you act NOW.
      </p>
      
      <div style="margin-top: 3em;">
        <p>Very truly yours,</p>
        <div style="margin-top: 3em; margin-bottom: 0.5em;">
          <strong>${caseDetails.authorizedOfficer}</strong><br/>
          ${caseDetails.officerPosition}<br/>
          ${caseDetails.creditorName}<br/>
          ${caseDetails.creditorAddress}
        </div>
      </div>
      
      <div style="margin-top: 2em; padding: 1em; background-color: #f5f5f5; border: 1px solid #ddd;">
        <p style="margin: 0; font-size: 10pt; font-style: italic;">
          <strong>LEGAL NOTICE:</strong> This is a formal demand for payment. Your failure to respond or settle 
          this obligation will result in the filing of a Small Claims case pursuant to the Revised Rules on 
          Small Claims Cases. All legal remedies available under Philippine law will be pursued.
        </p>
      </div>
    </div>
  `;
};

/**
 * Generate Form 1-SCC (Statement of Claim)
 * Based on Supreme Court Form for Small Claims Cases
 */
export const generateForm1SCC = (caseDetails: SmallClaimsCaseDetails): string => {
    const today = new Date().toISOString().split('T')[0];

    return `
    <div style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; max-width: 8.5in; margin: 0 auto; padding: 0.75in;">
      <div style="text-align: center; margin-bottom: 1em;">
        <p style="margin: 0; font-weight: bold;">Republic of the Philippines</p>
        <p style="margin: 0; font-weight: bold;">${caseDetails.courtBranch}</p>
        <p style="margin: 0;">${caseDetails.courtAddress || 'Makati City'}</p>
      </div>
      
      <div style="border: 2px solid #000; padding: 1em; margin: 2em 0;">
        <table style="width: 100%;">
          <tr>
            <td style="width: 60%; vertical-align: top;">
              <p style="margin: 0;"><strong>${caseDetails.creditorName}</strong>,</p>
              <p style="margin: 0.5em 0 0 2em;">Claimant,</p>
            </td>
            <td style="width: 40%; vertical-align: top; text-align: right;">
              <p style="margin: 0;">SC Case No. __________</p>
              <p style="margin: 0.5em 0 0 0;">For: <strong>Sum of Money</strong></p>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: center; padding: 1em 0;">
              <p style="margin: 0;">- versus -</p>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <p style="margin: 0;"><strong>${caseDetails.debtorName}</strong>,</p>
              <p style="margin: 0.5em 0 0 2em;">Defendant.</p>
            </td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; margin: 2em 0;">
        <p style="margin: 0; font-weight: bold; font-size: 12pt;">STATEMENT OF CLAIM</p>
        <p style="margin: 0; font-size: 10pt;">(Form 1-SCC)</p>
      </div>
      
      <p style="text-align: justify; text-indent: 2em;">
        Claimant, through the undersigned authorized representative, respectfully states:
      </p>
      
      <p style="margin-left: 2em;">
        <strong>1. PARTIES</strong>
      </p>
      
      <p style="text-align: justify; margin-left: 3em;">
        1.1. Claimant <strong>${caseDetails.creditorName}</strong> is a corporation duly organized and existing 
        under Philippine laws, with principal office address at ${caseDetails.creditorAddress}.
      </p>
      
      <p style="text-align: justify; margin-left: 3em;">
        1.2. Defendant <strong>${caseDetails.debtorName}</strong> is of legal age and may be served with court 
        processes at ${caseDetails.debtorAddress}.
      </p>
      
      <p style="margin-left: 2em;">
        <strong>2. CAUSE OF ACTION</strong>
      </p>
      
      <p style="text-align: justify; margin-left: 3em;">
        2.1. On or about <strong>${formatDate(caseDetails.loanDate)}</strong>, Defendant obtained a loan/credit 
        facility from Claimant in the principal amount of <strong>${formatCurrency(caseDetails.principalAmount)}</strong>, 
        as evidenced by the Promissory Note and/or Credit Agreement with Reference Number <strong>${caseDetails.referenceNumber}</strong>.
      </p>
      
      <p style="text-align: justify; margin-left: 3em;">
        2.2. Under the terms of the agreement, Defendant bound himself/herself to pay the loan on or before 
        <strong>${formatDate(caseDetails.dueDate)}</strong>.
      </p>
      
      <p style="text-align: justify; margin-left: 3em;">
        2.3. Despite repeated demands, the last of which was made on <strong>${formatDate(today)}</strong>, 
        Defendant has failed and refused, and continues to fail and refuse, to pay his/her obligation.
      </p>
      
      <p style="text-align: justify; margin-left: 3em;">
        2.4. As of <strong>${formatDate(today)}</strong>, Defendant's total outstanding obligation amounts to 
        <strong>${formatCurrency(caseDetails.totalAmount)}</strong>, computed as follows:
      </p>
      
      <table style="width: 80%; margin: 1em auto; border-collapse: collapse;">
        <tr>
          <td style="padding: 0.5em; border-bottom: 1px solid #000;">Principal Amount:</td>
          <td style="padding: 0.5em; text-align: right; border-bottom: 1px solid #000;">${formatCurrency(caseDetails.principalAmount)}</td>
        </tr>
        ${caseDetails.interestRate ? `
        <tr>
          <td style="padding: 0.5em; border-bottom: 1px solid #000;">Interest Charges:</td>
          <td style="padding: 0.5em; text-align: right; border-bottom: 1px solid #000;">${formatCurrency((caseDetails.totalAmount - caseDetails.principalAmount - (caseDetails.penaltyAmount || 0)))}</td>
        </tr>
        ` : ''}
        ${caseDetails.penaltyAmount ? `
        <tr>
          <td style="padding: 0.5em; border-bottom: 1px solid #000;">Penalty Charges:</td>
          <td style="padding: 0.5em; text-align: right; border-bottom: 1px solid #000;">${formatCurrency(caseDetails.penaltyAmount)}</td>
        </tr>
        ` : ''}
        <tr style="font-weight: bold;">
          <td style="padding: 0.5em; border-top: 2px solid #000; border-bottom: 2px solid #000;">TOTAL AMOUNT DUE:</td>
          <td style="padding: 0.5em; text-align: right; border-top: 2px solid #000; border-bottom: 2px solid #000;">${formatCurrency(caseDetails.totalAmount)}</td>
        </tr>
      </table>
      
      <p style="margin-left: 2em;">
        <strong>3. PRAYER</strong>
      </p>
      
      <p style="text-align: justify; margin-left: 3em;">
        WHEREFORE, premises considered, it is respectfully prayed that judgment be rendered in favor of Claimant 
        and against Defendant, ordering the latter to pay:
      </p>
      
      <p style="margin-left: 4em;">
        a) The amount of <strong>${formatCurrency(caseDetails.totalAmount)}</strong> representing the principal 
        obligation, interest, and penalties;
      </p>
      
      <p style="margin-left: 4em;">
        b) Legal interest on the total amount due from the filing of this claim until fully paid; and
      </p>
      
      <p style="margin-left: 4em;">
        c) Costs of suit.
      </p>
      
      <p style="text-align: justify; margin-left: 3em;">
        Claimant prays for such other reliefs as may be deemed just and equitable under the premises.
      </p>
      
      <div style="margin-top: 3em;">
        <p style="margin: 0;">${caseDetails.creditorAddress}</p>
        <p style="margin: 0;">${formatDate(today)}</p>
      </div>
      
      <div style="margin-top: 3em; text-align: center;">
        <p style="margin: 0;">_________________________________</p>
        <p style="margin: 0;"><strong>${caseDetails.authorizedOfficer}</strong></p>
        <p style="margin: 0;">${caseDetails.officerPosition}</p>
        <p style="margin: 0;">Authorized Representative</p>
        <p style="margin: 0;">${caseDetails.creditorName}</p>
      </div>
      
      <div style="margin-top: 2em; border-top: 2px solid #000; padding-top: 1em;">
        <p style="margin: 0; font-size: 10pt;"><strong>VERIFICATION</strong></p>
        <p style="text-align: justify; margin-top: 1em; font-size: 10pt;">
          I, <strong>${caseDetails.authorizedOfficer}</strong>, of legal age, and the duly authorized representative 
          of ${caseDetails.creditorName}, after being duly sworn in accordance with law, hereby depose and state that:
        </p>
        <p style="text-align: justify; margin-top: 0.5em; font-size: 10pt;">
          I have caused the preparation of the foregoing Statement of Claim; I have read the contents thereof and 
          the same are true and correct of my own personal knowledge and based on authentic records.
        </p>
        <div style="margin-top: 2em; text-align: center;">
          <p style="margin: 0;">_________________________________</p>
          <p style="margin: 0;"><strong>${caseDetails.authorizedOfficer}</strong></p>
          <p style="margin: 0;">Affiant</p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Generate Form 2-SCC (Certificate of Non-Forum Shopping)
 */
export const generateForm2SCC = (caseDetails: SmallClaimsCaseDetails): string => {
    const today = new Date().toISOString().split('T')[0];

    return `
    <div style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; max-width: 8.5in; margin: 0 auto; padding: 0.75in;">
      <div style="text-align: center; margin-bottom: 1em;">
        <p style="margin: 0; font-weight: bold;">Republic of the Philippines</p>
        <p style="margin: 0; font-weight: bold;">${caseDetails.courtBranch}</p>
        <p style="margin: 0;">${caseDetails.courtAddress || 'Makati City'}</p>
      </div>
      
      <div style="border: 2px solid #000; padding: 1em; margin: 2em 0;">
        <table style="width: 100%;">
          <tr>
            <td style="width: 60%; vertical-align: top;">
              <p style="margin: 0;"><strong>${caseDetails.creditorName}</strong>,</p>
              <p style="margin: 0.5em 0 0 2em;">Claimant,</p>
            </td>
            <td style="width: 40%; vertical-align: top; text-align: right;">
              <p style="margin: 0;">SC Case No. __________</p>
              <p style="margin: 0.5em 0 0 0;">For: <strong>Sum of Money</strong></p>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: center; padding: 1em 0;">
              <p style="margin: 0;">- versus -</p>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <p style="margin: 0;"><strong>${caseDetails.debtorName}</strong>,</p>
              <p style="margin: 0.5em 0 0 2em;">Defendant.</p>
            </td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; margin: 2em 0;">
        <p style="margin: 0; font-weight: bold; font-size: 12pt;">CERTIFICATION AGAINST FORUM SHOPPING</p>
        <p style="margin: 0; font-size: 10pt;">(Form 2-SCC)</p>
      </div>
      
      <p style="text-align: justify; text-indent: 2em;">
        I, <strong>${caseDetails.authorizedOfficer}</strong>, of legal age, Filipino, and the duly authorized 
        ${caseDetails.officerPosition} of <strong>${caseDetails.creditorName}</strong>, after being duly sworn 
        in accordance with law, hereby depose and state that:
      </p>
      
      <p style="text-align: justify; margin-left: 2em;">
        1. I am the authorized representative of the Claimant in the above-entitled case;
      </p>
      
      <p style="text-align: justify; margin-left: 2em;">
        2. I have caused the preparation and filing of the foregoing Statement of Claim;
      </p>
      
      <p style="text-align: justify; margin-left: 2em;">
        3. I hereby certify that:
      </p>
      
      <p style="text-align: justify; margin-left: 4em;">
        a) I have not commenced any other action or proceeding involving the same issues in the Supreme Court, 
        the Court of Appeals, or any other tribunal or agency;
      </p>
      
      <p style="text-align: justify; margin-left: 4em;">
        b) To the best of my knowledge, no such action or proceeding is pending in the Supreme Court, the Court 
        of Appeals, or any other tribunal or agency;
      </p>
      
      <p style="text-align: justify; margin-left: 4em;">
        c) If I should thereafter learn that a similar action or proceeding has been filed or is pending before 
        the Supreme Court, the Court of Appeals, or any other tribunal or agency, I undertake to report that 
        fact within five (5) days therefrom to this Court.
      </p>
      
      <div style="margin-top: 3em;">
        <p style="margin: 0;">${caseDetails.creditorAddress}</p>
        <p style="margin: 0;">${formatDate(today)}</p>
      </div>
      
      <div style="margin-top: 3em; text-align: center;">
        <p style="margin: 0;">_________________________________</p>
        <p style="margin: 0;"><strong>${caseDetails.authorizedOfficer}</strong></p>
        <p style="margin: 0;">${caseDetails.officerPosition}</p>
        <p style="margin: 0;">Authorized Representative</p>
        <p style="margin: 0;">${caseDetails.creditorName}</p>
      </div>
      
      <div style="margin-top: 3em; border-top: 1px solid #000; padding-top: 1em;">
        <p style="margin: 0; font-size: 10pt;"><strong>SUBSCRIBED AND SWORN</strong> to before me this 
        ${formatDate(today)}, affiant exhibiting to me his/her valid government-issued identification card.</p>
        
        <div style="margin-top: 3em;">
          <p style="margin: 0;">_________________________________</p>
          <p style="margin: 0;">Notary Public</p>
          <p style="margin-top: 2em; font-size: 10pt;">Doc. No. _____</p>
          <p style="margin: 0; font-size: 10pt;">Page No. _____</p>
          <p style="margin: 0; font-size: 10pt;">Book No. _____</p>
          <p style="margin: 0; font-size: 10pt;">Series of 2025</p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Generate Board Resolution
 */
export const generateBoardResolution = (caseDetails: SmallClaimsCaseDetails): string => {
    const today = new Date().toISOString().split('T')[0];

    return `
    <div style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; max-width: 8.5in; margin: 0 auto; padding: 1in;">
      <div style="text-align: center; margin-bottom: 2em;">
        <p style="margin: 0; font-weight: bold; font-size: 14pt;">${caseDetails.creditorName}</p>
        <p style="margin: 0.5em 0 0 0;">BOARD RESOLUTION NO. _______</p>
        <p style="margin: 0.5em 0 0 0;">Series of 2025</p>
      </div>
      
      <div style="text-align: center; margin: 2em 0;">
        <p style="margin: 0; font-weight: bold; text-decoration: underline;">RESOLUTION AUTHORIZING THE FILING OF SMALL CLAIMS CASE</p>
        <p style="margin: 0; font-weight: bold; text-decoration: underline;">AGAINST ${caseDetails.debtorName.toUpperCase()}</p>
      </div>
      
      <p style="text-align: justify; text-indent: 2em;">
        <strong>WHEREAS</strong>, ${caseDetails.creditorName} (the "Corporation") extended credit facilities 
        to <strong>${caseDetails.debtorName}</strong> (the "Debtor");
      </p>
      
      <p style="text-align: justify; text-indent: 2em;">
        <strong>WHEREAS</strong>, the Debtor obtained a loan in the principal amount of 
        <strong>${formatCurrency(caseDetails.principalAmount)}</strong> on <strong>${formatDate(caseDetails.loanDate)}</strong>, 
        with Reference Number <strong>${caseDetails.referenceNumber}</strong>;
      </p>
      
      <p style="text-align: justify; text-indent: 2em;">
        <strong>WHEREAS</strong>, the said loan became due and demandable on <strong>${formatDate(caseDetails.dueDate)}</strong>;
      </p>
      
      <p style="text-align: justify; text-indent: 2em;">
        <strong>WHEREAS</strong>, despite repeated demands, the Debtor has failed and refused to pay the 
        outstanding obligation which now amounts to <strong>${formatCurrency(caseDetails.totalAmount)}</strong>;
      </p>
      
      <p style="text-align: justify; text-indent: 2em;">
        <strong>WHEREAS</strong>, it is in the best interest of the Corporation to pursue all legal remedies 
        available to collect the said obligation;
      </p>
      
      <p style="text-align: justify; text-indent: 2em;">
        <strong>NOW, THEREFORE, BE IT RESOLVED</strong>, as it is hereby resolved by the Board of Directors 
        of ${caseDetails.creditorName}, that:
      </p>
      
      <p style="text-align: justify; margin-left: 2em;">
        <strong>1.</strong> The Corporation is hereby authorized to file a Small Claims case against 
        <strong>${caseDetails.debtorName}</strong> for the collection of the sum of 
        <strong>${formatCurrency(caseDetails.totalAmount)}</strong>, plus legal interest, costs of suit, 
        and other charges;
      </p>
      
      <p style="text-align: justify; margin-left: 2em;">
        <strong>2.</strong> <strong>${caseDetails.authorizedOfficer}</strong>, ${caseDetails.officerPosition}, 
        is hereby authorized to:
      </p>
      
      <p style="text-align: justify; margin-left: 4em;">
        a) Sign, execute, and file the Statement of Claim and all other necessary pleadings and documents;
      </p>
      
      <p style="text-align: justify; margin-left: 4em;">
        b) Represent the Corporation in all court proceedings related to the said case;
      </p>
      
      <p style="text-align: justify; margin-left: 4em;">
        c) Enter into settlement agreements, if deemed beneficial to the Corporation;
      </p>
      
      <p style="text-align: justify; margin-left: 4em;">
        d) Perform all acts necessary and proper for the prosecution of the case;
      </p>
      
      <p style="text-align: justify; margin-left: 2em;">
        <strong>3.</strong> This Resolution shall take effect immediately.
      </p>
      
      <p style="text-align: justify; margin-top: 2em;">
        <strong>RESOLVED FURTHER</strong>, that a copy of this Resolution be furnished to all concerned for 
        their information and guidance.
      </p>
      
      <p style="text-align: justify; margin-top: 2em;">
        <strong>APPROVED</strong> this ${formatDate(today)}.
      </p>
      
      <div style="margin-top: 4em;">
        <table style="width: 100%;">
          <tr>
            <td style="width: 50%; text-align: center; vertical-align: bottom;">
              <p style="margin: 0;">_________________________________</p>
              <p style="margin: 0.5em 0 0 0;"><strong>Director's Name</strong></p>
              <p style="margin: 0;">Director</p>
            </td>
            <td style="width: 50%; text-align: center; vertical-align: bottom;">
              <p style="margin: 0;">_________________________________</p>
              <p style="margin: 0.5em 0 0 0;"><strong>Director's Name</strong></p>
              <p style="margin: 0;">Director</p>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="height: 3em;"></td>
          </tr>
          <tr>
            <td style="width: 50%; text-align: center; vertical-align: bottom;">
              <p style="margin: 0;">_________________________________</p>
              <p style="margin: 0.5em 0 0 0;"><strong>Director's Name</strong></p>
              <p style="margin: 0;">Director</p>
            </td>
            <td style="width: 50%; text-align: center; vertical-align: bottom;">
              <p style="margin: 0;">_________________________________</p>
              <p style="margin: 0.5em 0 0 0;"><strong>Director's Name</strong></p>
              <p style="margin: 0;">Director</p>
            </td>
          </tr>
        </table>
      </div>
      
      <div style="margin-top: 3em; border-top: 2px solid #000; padding-top: 1em;">
        <p style="margin: 0; font-weight: bold;">ATTESTED:</p>
        <div style="margin-top: 3em; text-align: center;">
          <p style="margin: 0;">_________________________________</p>
          <p style="margin: 0.5em 0 0 0;"><strong>Corporate Secretary's Name</strong></p>
          <p style="margin: 0;">Corporate Secretary</p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Generate Secretary's Certificate
 */
export const generateSecretaryCertificate = (caseDetails: SmallClaimsCaseDetails): string => {
    const today = new Date().toISOString().split('T')[0];

    return `
    <div style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; max-width: 8.5in; margin: 0 auto; padding: 1in;">
      <div style="text-align: center; margin-bottom: 2em;">
        <p style="margin: 0; font-weight: bold; font-size: 14pt;">${caseDetails.creditorName}</p>
        <p style="margin: 0.5em 0 0 0;">${caseDetails.creditorAddress}</p>
      </div>
      
      <div style="text-align: center; margin: 2em 0;">
        <p style="margin: 0; font-weight: bold; font-size: 13pt; text-decoration: underline;">SECRETARY'S CERTIFICATE</p>
      </div>
      
      <p style="text-align: justify; text-indent: 2em;">
        I, <strong>[Corporate Secretary's Name]</strong>, of legal age, Filipino, and the duly elected and 
        qualified Corporate Secretary of <strong>${caseDetails.creditorName}</strong> (the "Corporation"), 
        a corporation duly organized and existing under and by virtue of the laws of the Republic of the 
        Philippines, with principal office address at ${caseDetails.creditorAddress}, do hereby certify that:
      </p>
      
      <p style="text-align: justify; margin-left: 2em;">
        <strong>1.</strong> At a meeting of the Board of Directors of the Corporation duly called and held 
        on <strong>${formatDate(today)}</strong>, at which a quorum was present and acting throughout, the 
        following resolution was unanimously adopted:
      </p>
      
      <div style="margin: 2em 3em; padding: 1em; border: 1px solid #000; background-color: #f9f9f9;">
        <p style="text-align: center; margin: 0; font-style: italic;">
          [Insert Board Resolution authorizing the filing of Small Claims case]
        </p>
      </div>
      
      <p style="text-align: justify; margin-left: 2em;">
        <strong>2.</strong> The foregoing resolution has not been amended, modified, or revoked, and remains 
        in full force and effect as of this date;
      </p>
      
      <p style="text-align: justify; margin-left: 2em;">
        <strong>3.</strong> <strong>${caseDetails.authorizedOfficer}</strong> is the duly appointed and 
        qualified ${caseDetails.officerPosition} of the Corporation and is authorized to represent the 
        Corporation in all matters relating to the collection of the obligation owed by 
        <strong>${caseDetails.debtorName}</strong>;
      </p>
      
      <p style="text-align: justify; margin-left: 2em;">
        <strong>4.</strong> The specimen signature appearing below is the true and genuine signature of 
        ${caseDetails.authorizedOfficer}:
      </p>
      
      <div style="margin: 2em 4em; text-align: center;">
        <p style="margin: 0;">_________________________________</p>
        <p style="margin: 0.5em 0 0 0;"><strong>${caseDetails.authorizedOfficer}</strong></p>
        <p style="margin: 0;">${caseDetails.officerPosition}</p>
      </div>
      
      <p style="text-align: justify; text-indent: 2em;">
        <strong>IN WITNESS WHEREOF</strong>, I have hereunto affixed my signature this 
        <strong>${formatDate(today)}</strong>.
      </p>
      
      <div style="margin-top: 4em; text-align: center;">
        <p style="margin: 0;">_________________________________</p>
        <p style="margin: 0.5em 0 0 0;"><strong>[Corporate Secretary's Name]</strong></p>
        <p style="margin: 0;">Corporate Secretary</p>
      </div>
      
      <div style="margin-top: 3em; border-top: 2px solid #000; padding-top: 1em;">
        <p style="margin: 0; font-size: 10pt;"><strong>SUBSCRIBED AND SWORN</strong> to before me this 
        ${formatDate(today)}, affiant exhibiting to me his/her valid government-issued identification card.</p>
        
        <div style="margin-top: 3em;">
          <p style="margin: 0;">_________________________________</p>
          <p style="margin: 0;">Notary Public</p>
          <p style="margin-top: 2em; font-size: 10pt;">Doc. No. _____</p>
          <p style="margin: 0; font-size: 10pt;">Page No. _____</p>
          <p style="margin: 0; font-size: 10pt;">Book No. _____</p>
          <p style="margin: 0; font-size: 10pt;">Series of 2025</p>
        </div>
      </div>
      
      <div style="margin-top: 2em; padding: 1em; background-color: #f5f5f5; border: 1px solid #ddd;">
        <p style="margin: 0; font-size: 10pt; font-style: italic;">
          <strong>Note:</strong> This certificate is issued for the purpose of filing a Small Claims case 
          against ${caseDetails.debtorName} for the collection of the sum of 
          ${formatCurrency(caseDetails.totalAmount)}.
        </p>
      </div>
    </div>
  `;
};

/**
 * Generate Form 1-A-SCC (Verification and Certification Against Forum Shopping)
 * Separate form as required by 2025 Supreme Court rules
 */
export const generateForm1ASCC = (caseDetails: SmallClaimsCaseDetails): string => {
  const today = new Date().toISOString().split('T')[0];
  
  return `
    <div style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; max-width: 8.5in; margin: 0 auto; padding: 0.75in;">
      <div style="text-align: center; margin-bottom: 1em;">
        <p style="margin: 0; font-weight: bold;">Republic of the Philippines</p>
        <p style="margin: 0; font-weight: bold;">${caseDetails.courtBranch}</p>
        <p style="margin: 0;">${caseDetails.courtAddress || 'Makati City'}</p>
      </div>
      
      <div style="border: 2px solid #000; padding: 1em; margin: 2em 0;">
        <table style="width: 100%;">
          <tr>
            <td style="width: 60%; vertical-align: top;">
              <p style="margin: 0;"><strong>${caseDetails.creditorName}</strong>,</p>
              <p style="margin: 0.5em 0 0 2em;">Claimant,</p>
            </td>
            <td style="width: 40%; vertical-align: top; text-align: right;">
              <p style="margin: 0;">SC Case No. __________</p>
              <p style="margin: 0.5em 0 0 0;">For: <strong>Sum of Money</strong></p>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: center; padding: 1em 0;">
              <p style="margin: 0;">- versus -</p>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <p style="margin: 0;"><strong>${caseDetails.debtorName}</strong>,</p>
              <p style="margin: 0.5em 0 0 2em;">Defendant.</p>
            </td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; margin: 2em 0;">
        <p style="margin: 0; font-weight: bold; font-size: 12pt;">VERIFICATION AND CERTIFICATION</p>
        <p style="margin: 0; font-weight: bold; font-size: 12pt;">AGAINST FORUM SHOPPING</p>
        <p style="margin: 0; font-size: 10pt;">(Form 1-A-SCC)</p>
      </div>
      
      <p style="margin-top: 2em; font-weight: bold;">VERIFICATION</p>
      
      <p style="text-align: justify; text-indent: 2em;">
        I, <strong>${caseDetails.authorizedOfficer}</strong>, of legal age, Filipino, and the duly authorized 
        ${caseDetails.officerPosition} of <strong>${caseDetails.creditorName}</strong>, after being duly sworn 
        in accordance with law, hereby depose and state that:
      </p>
      
      <p style="text-align: justify; margin-left: 2em;">
        1. I am the authorized representative of the Claimant in the above-entitled case;
      </p>
      
      <p style="text-align: justify; margin-left: 2em;">
        2. I have caused the preparation and filing of the foregoing Statement of Claim (Form 1-SCC);
      </p>
      
      <p style="text-align: justify; margin-left: 2em;">
        3. I have read the contents of the Statement of Claim and the allegations therein are true and correct 
        of my own personal knowledge and based on authentic records;
      </p>
      
      <p style="text-align: justify; margin-left: 2em;">
        4. I have not resorted to the preparation and filing of the Statement of Claim merely to harass the 
        Defendant or to cause unnecessary delay in the administration of justice.
      </p>
      
      <p style="margin-top: 2em; font-weight: bold;">CERTIFICATION AGAINST FORUM SHOPPING</p>
      
      <p style="text-align: justify; text-indent: 2em;">
        I further certify under oath that:
      </p>
      
      <p style="text-align: justify; margin-left: 2em;">
        (a) I have not commenced any other action or proceeding involving the same issues in the Supreme Court, 
        the Court of Appeals, or any other tribunal or agency;
      </p>
      
      <p style="text-align: justify; margin-left: 2em;">
        (b) To the best of my knowledge, no such action or proceeding is pending in the Supreme Court, the Court 
        of Appeals, or any other tribunal or agency;
      </p>
      
      <p style="text-align: justify; margin-left: 2em;">
        (c) If I should thereafter learn that a similar action or proceeding has been filed or is pending before 
        the Supreme Court, the Court of Appeals, or any other tribunal or agency, I undertake to report that 
        fact within five (5) days therefrom to this Court.
      </p>
      
      <p style="text-align: justify; margin-left: 2em; margin-top: 1em;">
        I am executing this Verification and Certification to attest to the truth of the foregoing and to comply 
        with the requirements of the Revised Rules on Small Claims Cases.
      </p>
      
      <div style="margin-top: 3em;">
        <p style="margin: 0;">${caseDetails.creditorAddress}</p>
        <p style="margin: 0;">${formatDate(today)}</p>
      </div>
      
      <div style="margin-top: 3em; text-align: center;">
        <p style="margin: 0;">_________________________________</p>
        <p style="margin: 0;"><strong>${caseDetails.authorizedOfficer}</strong></p>
        <p style="margin: 0;">${caseDetails.officerPosition}</p>
        <p style="margin: 0;">Authorized Representative</p>
        <p style="margin: 0;">${caseDetails.creditorName}</p>
      </div>
      
      <div style="margin-top: 3em; border-top: 1px solid #000; padding-top: 1em;">
        <p style="margin: 0; font-size: 10pt;"><strong>SUBSCRIBED AND SWORN</strong> to before me this 
        ${formatDate(today)}, affiant exhibiting to me his/her valid government-issued identification card.</p>
        
        <div style="margin-top: 3em;">
          <p style="margin: 0;">_________________________________</p>
          <p style="margin: 0;">Notary Public</p>
          <p style="margin-top: 2em; font-size: 10pt;">Doc. No. _____</p>
          <p style="margin: 0; font-size: 10pt;">Page No. _____</p>
          <p style="margin: 0; font-size: 10pt;">Book No. _____</p>
          <p style="margin: 0; font-size: 10pt;">Series of 2025</p>
        </div>
      </div>
      
      <div style="margin-top: 2em; padding: 1em; background-color: #f5f5f5; border: 1px solid #ddd;">
        <p style="margin: 0; font-size: 10pt; font-style: italic;">
          <strong>IMPORTANT NOTE:</strong> This Form 1-A-SCC must be filed together with Form 1-SCC (Statement of Claim) 
          in duplicate. Failure to submit this verification and certification may result in dismissal of the claim.
        </p>
      </div>
    </div>
  `;
};
