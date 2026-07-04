import type { GramStain, BiochemicalResult, IdentificationAttempt } from '../models/types';

export class OrganismValidator {
  /**
   * Validates Gram Stain parameter limits.
   */
  static validateGramStain(gram: Partial<GramStain>): { isValid: boolean; error?: string } {
    if (!gram.reaction || gram.reaction === 'Not Applicable') {
      return { isValid: false, error: 'Gram reaction is required.' };
    }
    if (!gram.shape) {
      return { isValid: false, error: 'Gram cellular shape morphotype is required.' };
    }
    return { isValid: true };
  }

  /**
   * Validates Biochemical assay parameters.
   */
  static validateBiochemicals(tests: BiochemicalResult[]): { isValid: boolean; error?: string } {
    if (tests.length === 0) {
      return { isValid: false, error: 'At least one biochemical test is required.' };
    }
    for (const t of tests) {
      if (!t.testName) {
        return { isValid: false, error: 'Enzymatic assay type name is required.' };
      }
      if (!t.result || t.result === 'Not Performed') {
        return { isValid: false, error: `Result for test ${t.testName} is invalid.` };
      }
    }
    return { isValid: true };
  }

  /**
   * Validates Identification attempt confidence values.
   */
  static validateAttempt(attempt: Partial<IdentificationAttempt>): { isValid: boolean; error?: string } {
    if (!attempt.organismId || !attempt.organismName) {
      return { isValid: false, error: 'Organism selection is required.' };
    }
    const conf = attempt.confidence;
    if (conf) {
      if (conf.instrumentConfidence < 0 || conf.instrumentConfidence > 100) {
        return { isValid: false, error: 'Instrument match confidence score must be between 0% and 100%.' };
      }
    }
    return { isValid: true };
  }
}
export default OrganismValidator;
