export type Interpretation =
  | 'S'
  | 'I'
  | 'R'
  | 'Not Tested'
  | 'Invalid';

export interface AntibioticAgentResult {
  agentId: string;
  agentName: string;
  method: 'Disk Diffusion' | 'MIC' | 'Broth Microdilution' | 'E-test';
  value: number; // zone diameter in mm or MIC value in ug/mL
  unit: 'mm' | 'ug/mL';
  interpretation: Interpretation;
  overrideInterpretation?: 'S' | 'I' | 'R';
  overrideReason?: string;
  comments?: string;
}

export interface AstResult {
  astId: string; // AST-YYYYMMDD-XXXXXX
  colonyId: string;
  organismId: string;
  organismName: string;
  status:
    | 'Created'
    | 'Panel Assigned'
    | 'In Testing'
    | 'Testing Completed'
    | 'Pending Technical Review'
    | 'Approved'
    | 'Rejected'
    | 'Returned For Correction';
  guideline: 'CLSI 2026' | 'EUCAST 2026';
  agentResults: AntibioticAgentResult[];
  performedBy: string;
  timestamp: string;
  reviewedBy?: string;
  reviewTimestamp?: string;
  qcVerified: boolean;
  instrumentId?: string;
  amendmentReason?: string;
}
