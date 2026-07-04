import { mockAdapter } from '../../../infrastructure/http/mockAdapter';
import type { AstResult, AntibioticAgentResult, Interpretation } from '../models/types';
import { eventBus } from '../../../services/platform/eventBus';

// Stateful mock AST database
let astsDb: AstResult[] = [];

// Interpretation Guidelines Rules Engine
export const interpretAntibioticResult = (
  agentId: string,
  method: 'Disk Diffusion' | 'MIC' | 'Broth Microdilution' | 'E-test',
  value: number,
  guideline: 'CLSI 2026' | 'EUCAST 2026'
): Interpretation => {
  const isDisk = method === 'Disk Diffusion';

  if (guideline === 'CLSI 2026') {
    switch (agentId) {
      case 'AMX': // Amoxicillin
        return isDisk ? (value >= 17 ? 'S' : value <= 13 ? 'R' : 'I') : (value <= 8 ? 'S' : value >= 32 ? 'R' : 'I');
      case 'CIP': // Ciprofloxacin
        return isDisk ? (value >= 21 ? 'S' : value <= 15 ? 'R' : 'I') : (value <= 0.25 ? 'S' : value >= 1 ? 'R' : 'I');
      case 'GEN': // Gentamicin
        return isDisk ? (value >= 15 ? 'S' : value <= 12 ? 'R' : 'I') : (value <= 4 ? 'S' : value >= 16 ? 'R' : 'I');
      case 'CRO': // Ceftriaxone
        return isDisk ? (value >= 23 ? 'S' : value <= 19 ? 'R' : 'I') : (value <= 1 ? 'S' : value >= 4 ? 'R' : 'I');
      case 'IPM': // Imipenem
        return isDisk ? (value >= 22 ? 'S' : value <= 19 ? 'R' : 'I') : (value <= 1 ? 'S' : value >= 4 ? 'R' : 'I');
      case 'PEN': // Penicillin
        return isDisk ? (value >= 15 ? 'S' : value <= 11 ? 'R' : 'I') : (value <= 0.12 ? 'S' : value >= 2 ? 'R' : 'I');
      case 'VAN': // Vancomycin
        return isDisk ? (value >= 15 ? 'S' : 'R') : (value <= 2 ? 'S' : value >= 8 ? 'R' : 'I');
      case 'ERY': // Erythromycin
        return isDisk ? (value >= 21 ? 'S' : value <= 13 ? 'R' : 'I') : (value <= 0.5 ? 'S' : value >= 8 ? 'R' : 'I');
      case 'CLI': // Clindamycin
        return isDisk ? (value >= 21 ? 'S' : value <= 14 ? 'R' : 'I') : (value <= 0.5 ? 'S' : value >= 4 ? 'R' : 'I');
      case 'LZD': // Linezolid
        return isDisk ? (value >= 21 ? 'S' : value <= 20 ? 'R' : 'I') : (value <= 2 ? 'S' : value >= 8 ? 'R' : 'I');
      default:
        return 'Not Tested';
    }
  } else {
    // EUCAST 2026 rules (e.g. S vs I/R, increased exposure interpretation)
    switch (agentId) {
      case 'AMX':
        return isDisk ? (value >= 18 ? 'S' : 'R') : (value <= 8 ? 'S' : 'R');
      case 'CIP':
        return isDisk ? (value >= 22 ? 'S' : 'R') : (value <= 0.25 ? 'S' : 'R');
      case 'GEN':
        return isDisk ? (value >= 16 ? 'S' : 'R') : (value <= 4 ? 'S' : 'R');
      case 'CRO':
        return isDisk ? (value >= 24 ? 'S' : 'R') : (value <= 1 ? 'S' : 'R');
      case 'IPM':
        return isDisk ? (value >= 23 ? 'S' : 'R') : (value <= 1 ? 'S' : 'R');
      default:
        return 'Not Tested';
    }
  }
};

const seedAstDatabase = () => {
  if (astsDb.length > 0) return;

  const targetOrganisms = [
    { id: 'EC-01', name: 'Escherichia coli', type: 'Negative' },
    { id: 'SA-01', name: 'Staphylococcus aureus', type: 'Positive' },
    { id: 'PA-01', name: 'Pseudomonas aeruginosa', type: 'Negative' },
    { id: 'EF-01', name: 'Enterococcus faecalis', type: 'Positive' }
  ];

  // Distribute exactly: 20 Created, 20 In Testing, 15 Pending Review, 15 Approved, 10 Rejected
  const distributions = [
    ...Array(20).fill('Created'),
    ...Array(20).fill('In Testing'),
    ...Array(15).fill('Pending Technical Review'),
    ...Array(15).fill('Approved'),
    ...Array(10).fill('Rejected')
  ];

  distributions.forEach((status, idx) => {
    const astId = `AST-ID-${String(idx + 1).padStart(6, '0')}`;
    const day = String(1 + (idx % 28)).padStart(2, '0');
    const dateStr = `2026-07-${day}`;
    const colonyId = `COL-ID-${String(idx + 1).padStart(6, '0')}`;

    const org = targetOrganisms[idx % targetOrganisms.length] || targetOrganisms[0];
    const isGramNegative = org.type === 'Negative';

    // Seed agent panels
    const agentResults: AntibioticAgentResult[] = [];
    const agentsList = isGramNegative
      ? [
          { id: 'AMX', name: 'Amoxicillin', unit: 'ug/mL' as const, method: 'MIC' as const, value: 4 },
          { id: 'CIP', name: 'Ciprofloxacin', unit: 'mm' as const, method: 'Disk Diffusion' as const, value: 22 },
          { id: 'GEN', name: 'Gentamicin', unit: 'ug/mL' as const, method: 'MIC' as const, value: 2 },
          { id: 'CRO', name: 'Ceftriaxone', unit: 'mm' as const, method: 'Disk Diffusion' as const, value: 24 }
        ]
      : [
          { id: 'PEN', name: 'Penicillin', unit: 'ug/mL' as const, method: 'MIC' as const, value: 0.06 },
          { id: 'VAN', name: 'Vancomycin', unit: 'ug/mL' as const, method: 'MIC' as const, value: 1 },
          { id: 'ERY', name: 'Erythromycin', unit: 'mm' as const, method: 'Disk Diffusion' as const, value: 22 },
          { id: 'CLI', name: 'Clindamycin', unit: 'mm' as const, method: 'Disk Diffusion' as const, value: 23 }
        ];

    agentsList.forEach((a) => {
      const interp = interpretAntibioticResult(a.id, a.method, a.value, 'CLSI 2026');
      agentResults.push({
        agentId: a.id,
        agentName: a.name,
        method: a.method,
        value: a.value,
        unit: a.unit,
        interpretation: status === 'Created' ? 'Not Tested' : interp
      });
    });

    astsDb.push({
      astId,
      colonyId,
      organismId: org.id,
      organismName: org.name,
      status,
      guideline: 'CLSI 2026',
      agentResults,
      performedBy: 'tech_user',
      timestamp: `${dateStr}T14:00:00Z`,
      reviewedBy: status === 'Approved' ? 'supervisor_user' : undefined,
      reviewTimestamp: status === 'Approved' ? `${dateStr}T16:00:00Z` : undefined,
      qcVerified: status === 'Approved'
    });
  });
};

export const initializeMockAstServer = () => {
  seedAstDatabase();

  // 1. GET /asts
  mockAdapter.register('GET', '/asts', (queryParams: any) => {
    const {
      page = '1',
      limit = '10',
      search = '',
      status = 'All'
    } = queryParams || {};

    let filtered = [...astsDb];

    if (status !== 'All') {
      filtered = filtered.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.astId.toLowerCase().includes(q) ||
          c.colonyId.toLowerCase().includes(q) ||
          c.organismName.toLowerCase().includes(q)
      );
    }

    const p = parseInt(page, 10);
    const l = parseInt(limit, 10);
    const start = (p - 1) * l;
    const sliced = filtered.slice(start, start + l);

    return {
      asts: sliced,
      total: filtered.length,
      page: p,
      limit: l
    };
  });

  // 2. GET /asts/:id
  mockAdapter.register('GET', '^/asts/[a-zA-Z0-9\\-]+$', (_, url) => {
    const id = url?.split('/').pop();
    const ast = astsDb.find((c) => c.astId === id);
    if (!ast) {
      throw { status: 404, message: 'AST susceptibility card not found.' };
    }
    return ast;
  });

  // 3. POST /asts
  mockAdapter.register('POST', '/asts', (body: any) => {
    const newIdx = astsDb.length + 1;
    const dateFormatted = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const astId = `AST-${dateFormatted}-${String(newIdx).padStart(6, '0')}`;

    const newRecord: AstResult = {
      astId,
      colonyId: body.colonyId,
      organismId: body.organismId || 'EC-01',
      organismName: body.organismName || 'Escherichia coli',
      status: 'Created',
      guideline: 'CLSI 2026',
      agentResults: [],
      performedBy: 'tech_user',
      timestamp: new Date().toISOString(),
      qcVerified: false
    };

    astsDb.unshift(newRecord);
    eventBus.publish('AST_CREATED', newRecord);
    return newRecord;
  });

  // 4. POST /asts/:id/results
  mockAdapter.register('POST', '^/asts/[a-zA-Z0-9\\-]+/results$', (body: any, url) => {
    const id = url?.split('/')?.[2];
    const astIdx = astsDb.findIndex((c) => c.astId === id);
    if (astIdx === -1) {
      throw { status: 404, message: 'AST not found.' };
    }

    const ast = astsDb[astIdx];
    const guideline = body.guideline || ast.guideline;

    ast.agentResults = (body.results || []).map((r: any) => {
      const interpretation = interpretAntibioticResult(r.agentId, r.method, r.value, guideline);
      return {
        ...r,
        interpretation
      };
    });

    ast.guideline = guideline;
    ast.status = 'Testing Completed';

    eventBus.publish('AST_UPDATED', ast);
    eventBus.publish('AST_COMPLETED', ast);
    eventBus.publish('AST_REQUIRES_REVIEW', ast); // Notify downstream validation queue
    
    astsDb[astIdx] = { ...ast };
    return ast;
  });

  // 5. POST /asts/:id/review
  mockAdapter.register('POST', '^/asts/[a-zA-Z0-9\\-]+/review$', (body: any, url) => {
    const id = url?.split('/')?.[2];
    const astIdx = astsDb.findIndex((c) => c.astId === id);
    if (astIdx === -1) {
      throw { status: 404, message: 'AST not found.' };
    }

    const ast = astsDb[astIdx];
    ast.status = body.status; // Approved | Rejected | Returned For Correction
    ast.reviewedBy = body.reviewer || 'supervisor_user';
    ast.reviewTimestamp = new Date().toISOString();

    if (body.status === 'Approved') {
      ast.qcVerified = true;
      eventBus.publish('AST_APPROVED', ast);
    } else if (body.status === 'Returned For Correction') {
      ast.qcVerified = false;
      eventBus.publish('AST_REQUIRES_REVIEW', ast); // Returned — re-enters editable state
    } else {
      ast.qcVerified = false;
      eventBus.publish('AST_REJECTED', ast);
    }

    astsDb[astIdx] = { ...ast };
    return ast;
  });
};

export default initializeMockAstServer;
