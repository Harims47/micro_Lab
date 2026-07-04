import type { AstResult } from '../models/types';

export class AstValidator {
  /**
   * Validates AST Testing and MIC results parameters.
   */
  static validate(result: Partial<AstResult>): { isValid: boolean; error?: string } {
    if (!result.colonyId) {
      return { isValid: false, error: 'Target isolated colony selection is required.' };
    }
    if (!result.organismId || !result.organismName) {
      return { isValid: false, error: 'Approved organism taxon is required.' };
    }
    if (!result.guideline) {
      return { isValid: false, error: 'Interpretation guideline (CLSI vs EUCAST) is required.' };
    }

    const agents = result.agentResults || [];
    if (agents.length === 0) {
      return { isValid: false, error: 'At least one antibiotic agent result must be documented.' };
    }

    const seenAgents = new Set<string>();
    for (const a of agents) {
      if (seenAgents.has(a.agentId)) {
        return { isValid: false, error: `Duplicate results for antibiotic agent ${a.agentName} are not allowed.` };
      }
      seenAgents.add(a.agentId);

      if (a.value <= 0) {
        return { isValid: false, error: `Result value for ${a.agentName} must be greater than 0.` };
      }

      if (a.overrideInterpretation && (!a.overrideReason || a.overrideReason.trim().length < 5)) {
        return { isValid: false, error: `Clinical override for ${a.agentName} requires a reason (minimum 5 chars).` };
      }
    }

    return { isValid: true };
  }

  /**
   * Validates peer validation rules (Segregation of Duties).
   */
  static validateReviewer(performer: string, reviewer: string): { isValid: boolean; error?: string } {
    if (performer.toLowerCase() === reviewer.toLowerCase()) {
      return { isValid: false, error: 'Technical validation requires peer-review (Reviewer cannot be the testing Performer).' };
    }
    return { isValid: true };
  }
}
export default AstValidator;
