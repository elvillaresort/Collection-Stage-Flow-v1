import { SmallClaimsCaseDetails, ActionableDocument, DemandLetterProof, BarangayRequirement, FilingFeeCalculation } from '../types';

/**
 * Compliance validation utilities for 2025 Philippine Small Claims requirements
 */

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Validate that the claim amount is within small claims jurisdiction
 * Maximum: ₱1,000,000.00 as of 2025
 */
export const validateJurisdictionalAmount = (amount: number): boolean => {
    const MAX_SMALL_CLAIMS_AMOUNT = 1000000;
    return amount > 0 && amount <= MAX_SMALL_CLAIMS_AMOUNT;
};

/**
 * Validate demand letter requirement
 * Must have at least one demand letter sent with proof
 */
export const validateDemandLetterRequirement = (proofs: DemandLetterProof[]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!proofs || proofs.length === 0) {
        errors.push('At least one demand letter must be sent before filing');
        return { isValid: false, errors, warnings };
    }

    // Check if proof is attached
    const proofsWithoutAttachment = proofs.filter(p => !p.proofAttached);
    if (proofsWithoutAttachment.length > 0) {
        errors.push('Proof of receipt must be attached for all demand letters');
    }

    // Warn if registry number is missing for registered mail
    proofs.forEach(proof => {
        if (proof.method === 'REGISTERED_MAIL' && !proof.registryNumber) {
            warnings.push(`Registry number missing for ${proof.demandType} demand letter`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Check if barangay conciliation is required
 * Required if both parties are residents of the same city/municipality
 */
export const checkBarangayRequirement = (
    debtorCity?: string,
    creditorCity?: string
): BarangayRequirement => {
    if (!debtorCity || !creditorCity) {
        return {
            isRequired: false,
            reason: 'NOT_APPLICABLE',
            certificateAttached: false
        };
    }

    const isSameCity = debtorCity.toLowerCase().trim() === creditorCity.toLowerCase().trim();

    return {
        isRequired: isSameCity,
        reason: isSameCity ? 'SAME_CITY' : 'DIFFERENT_CITY',
        certificateAttached: false
    };
};

/**
 * Validate barangay conciliation compliance
 */
export const validateBarangayConciliation = (requirement: BarangayRequirement): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (requirement.isRequired && !requirement.certificateAttached) {
        errors.push('Certificate to File Action from Barangay Lupon is required (parties in same city/municipality)');
    }

    if (requirement.isRequired && !requirement.certificateNumber) {
        warnings.push('Barangay certificate number should be recorded');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Validate actionable documents requirement
 * Must have at least one actionable document with 2 certified copies
 */
export const validateActionableDocuments = (docs: ActionableDocument[]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!docs || docs.length === 0) {
        errors.push('At least one actionable document (contract, invoice, promissory note) is required');
        return { isValid: false, errors, warnings };
    }

    // Check for 2 certified copies
    const docsWithoutCertification = docs.filter(d => !d.isCertified);
    if (docsWithoutCertification.length > 0) {
        errors.push('All actionable documents must be certified true copies');
    }

    const docsWithoutDuplicates = docs.filter(d => d.copies < 2);
    if (docsWithoutDuplicates.length > 0) {
        errors.push('Two (2) certified photocopies of each actionable document are required');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Calculate filing fees based on claim amount and filing frequency
 * Basic fee varies by amount, plus ₱500 surcharge for frequent filers (>10 cases/year)
 */
export const calculateFilingFees = (
    claimAmount: number,
    casesFiledThisYear: number
): FilingFeeCalculation => {
    let basicFee = 0;

    // Basic filing fee schedule (simplified - actual may vary by court)
    if (claimAmount <= 100000) {
        basicFee = 1500;
    } else if (claimAmount <= 300000) {
        basicFee = 2000;
    } else if (claimAmount <= 500000) {
        basicFee = 2500;
    } else if (claimAmount <= 1000000) {
        basicFee = 3000;
    }

    // Frequent filer surcharge: ₱500 if more than 10 cases filed this year
    const frequentFilerSurcharge = casesFiledThisYear > 10 ? 500 : 0;

    return {
        basicFee,
        frequentFilerSurcharge,
        totalFee: basicFee + frequentFilerSurcharge,
        casesFiledThisYear
    };
};

/**
 * Comprehensive validation for ready-to-file status
 * Checks all 2025 compliance requirements
 */
export const validateReadyToFile = (caseDetails: SmallClaimsCaseDetails): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Jurisdictional amount
    if (!validateJurisdictionalAmount(caseDetails.totalAmount)) {
        errors.push(`Claim amount (₱${caseDetails.totalAmount.toLocaleString()}) exceeds small claims jurisdiction (₱1,000,000)`);
    }

    // 2. Demand letter requirement
    if (caseDetails.demandLetterProofs) {
        const demandValidation = validateDemandLetterRequirement(caseDetails.demandLetterProofs);
        errors.push(...demandValidation.errors);
        warnings.push(...demandValidation.warnings);
    } else {
        errors.push('Demand letter must be sent with proof of receipt');
    }

    // 3. Barangay conciliation
    if (caseDetails.barangayRequirement) {
        const barangayValidation = validateBarangayConciliation(caseDetails.barangayRequirement);
        errors.push(...barangayValidation.errors);
        warnings.push(...barangayValidation.warnings);
    }

    // 4. Actionable documents
    if (caseDetails.actionableDocuments) {
        const docsValidation = validateActionableDocuments(caseDetails.actionableDocuments);
        errors.push(...docsValidation.errors);
        warnings.push(...docsValidation.warnings);
    } else {
        errors.push('Actionable documents (contracts, invoices, etc.) must be attached');
    }

    // 5. Corporate authorization
    if (!caseDetails.authorizedOfficer) {
        errors.push('Authorized officer must be designated');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Get compliance checklist status
 * Returns a user-friendly checklist of requirements
 */
export const getComplianceChecklist = (caseDetails: SmallClaimsCaseDetails) => {
    return {
        jurisdictionalAmount: {
            status: validateJurisdictionalAmount(caseDetails.totalAmount) ? 'complete' : 'incomplete',
            label: `Amount within jurisdiction (≤ ₱1,000,000)`,
            value: `₱${caseDetails.totalAmount.toLocaleString()}`
        },
        demandLetter: {
            status: caseDetails.demandLetterProofs && caseDetails.demandLetterProofs.length > 0 ? 'complete' : 'incomplete',
            label: 'Demand letter sent with proof',
            value: caseDetails.demandLetterProofs?.length || 0
        },
        barangayConciliation: {
            status: caseDetails.barangayRequirement?.isRequired
                ? (caseDetails.barangayRequirement.certificateAttached ? 'complete' : 'incomplete')
                : 'not_required',
            label: 'Barangay conciliation certificate',
            value: caseDetails.barangayRequirement?.isRequired ? 'Required' : 'Not required'
        },
        actionableDocuments: {
            status: caseDetails.actionableDocuments && caseDetails.actionableDocuments.length > 0 ? 'complete' : 'incomplete',
            label: 'Actionable documents (2 certified copies)',
            value: caseDetails.actionableDocuments?.length || 0
        },
        corporateAuth: {
            status: caseDetails.authorizedOfficer ? 'complete' : 'incomplete',
            label: 'Corporate authorization documents',
            value: caseDetails.authorizedOfficer ? 'Ready' : 'Pending'
        },
        filingFees: {
            status: caseDetails.filingFees ? 'complete' : 'incomplete',
            label: 'Filing fees calculated',
            value: caseDetails.filingFees ? `₱${caseDetails.filingFees.totalFee.toLocaleString()}` : 'Not calculated'
        }
    };
};
