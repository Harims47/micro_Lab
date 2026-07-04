import { mockAdapter } from '../../../infrastructure/http/mockAdapter';
import type { Colony, GramStain, BiochemicalResult, IdentificationAttempt, OrganismMaster, IdentificationInstrument } from '../models/types';
import { eventBus } from '../../../services/platform/eventBus';

// Master Reference Taxonomic Catalog
export const mockOrganismsCatalog: OrganismMaster[] = [
  {
    organismId: 'EC-01',
    genus: 'Escherichia',
    species: 'coli',
    gramClassification: 'Gram Negative',
    shape: 'Bacilli',
    respiration: 'Facultative Anaerobe',
    commonSpecimenTypes: ['Urine', 'Blood', 'Wound'],
    commonCultureMedia: ['MacConkey', 'Blood Agar'],
    recommendedAstPanel: 'Gram-Negative Enteric Panel',
    biosafetyLevel: 'BSL-2',
    clinicalNotes: 'Common cause of urinary tract infections and bacteremia.',
    synonyms: ['E. coli', 'Bacterium coli'],
    taxonomyVersion: 'NCBI:562'
  },
  {
    organismId: 'SA-01',
    genus: 'Staphylococcus',
    species: 'aureus',
    gramClassification: 'Gram Positive',
    shape: 'Cocci',
    respiration: 'Facultative Anaerobe',
    commonSpecimenTypes: ['Wound', 'Blood', 'Sputum'],
    commonCultureMedia: ['Blood Agar', 'Chocolate Agar'],
    recommendedAstPanel: 'Gram-Positive GPC Panel',
    biosafetyLevel: 'BSL-2',
    clinicalNotes: 'Major pathogen causing skin infections, pneumonia, and sepsis.',
    synonyms: ['S. aureus', 'Golden Staph'],
    taxonomyVersion: 'NCBI:1280'
  },
  {
    organismId: 'PA-01',
    genus: 'Pseudomonas',
    species: 'aeruginosa',
    gramClassification: 'Gram Negative',
    shape: 'Bacilli',
    respiration: 'Aerobic',
    commonSpecimenTypes: ['Wound', 'Sputum', 'Ear swab'],
    commonCultureMedia: ['MacConkey', 'Blood Agar'],
    recommendedAstPanel: 'Non-Fermenter Panel',
    biosafetyLevel: 'BSL-2',
    clinicalNotes: 'Opportunistic pathogen, highly resistant to multiple antibiotics.',
    synonyms: ['P. aeruginosa'],
    taxonomyVersion: 'NCBI:287'
  },
  {
    organismId: 'EF-01',
    genus: 'Enterococcus',
    species: 'faecalis',
    gramClassification: 'Gram Positive',
    shape: 'Cocci',
    respiration: 'Facultative Anaerobe',
    commonSpecimenTypes: ['Urine', 'Blood'],
    commonCultureMedia: ['Blood Agar', 'CLED'],
    recommendedAstPanel: 'Enterococcal AST Panel',
    biosafetyLevel: 'BSL-2',
    clinicalNotes: 'Commonly exhibits intrinsic resistance to cephalosporins.',
    synonyms: ['Streptococcus faecalis'],
    taxonomyVersion: 'NCBI:1351'
  },
  {
    organismId: 'KP-01',
    genus: 'Klebsiella',
    species: 'pneumoniae',
    gramClassification: 'Gram Negative',
    shape: 'Bacilli',
    respiration: 'Facultative Anaerobe',
    commonSpecimenTypes: ['Sputum', 'Urine', 'Blood'],
    commonCultureMedia: ['MacConkey', 'Blood Agar'],
    recommendedAstPanel: 'Gram-Negative Enteric Panel',
    biosafetyLevel: 'BSL-2',
    clinicalNotes: 'Can produce Extended-Spectrum Beta-Lactamases (ESBL).',
    synonyms: ['K. pneumoniae'],
    taxonomyVersion: 'NCBI:573'
  },
  {
    organismId: 'CA-01',
    genus: 'Candida',
    species: 'albicans',
    gramClassification: 'Gram Positive', // Yeasts stain gram-positive
    shape: 'Pleomorphic',
    respiration: 'Aerobic',
    commonSpecimenTypes: ['Vaginal swab', 'Blood', 'Oral swab'],
    commonCultureMedia: ['Sabouraud'],
    recommendedAstPanel: 'Antifungal Panel',
    biosafetyLevel: 'BSL-1',
    clinicalNotes: 'Unicellular fungus, displays pseudohyphae.',
    synonyms: ['Monilia albicans'],
    taxonomyVersion: 'NCBI:5476'
  }
];

// Hardware Instrument Reference List
export const mockInstruments: IdentificationInstrument[] = [
  {
    instrumentId: 'MALDI-01',
    vendor: 'Bruker Daltonics',
    model: 'Microflex LRF',
    serialNumber: 'BRK-7492-M',
    calibrationStatus: 'Calibrated',
    lastQcDate: '2026-07-01'
  },
  {
    instrumentId: 'VITEK-02',
    vendor: 'bioMérieux',
    model: 'Vitek 2 Compact',
    serialNumber: 'BMX-8392-V',
    calibrationStatus: 'Calibrated',
    lastQcDate: '2026-06-28'
  }
];

// Stateful isolated colonies database
let coloniesDb: Colony[] = [];

const seedColonies = () => {
  if (coloniesDb.length > 0) return;

  const colonyStatuses = ['Observed', 'Selected', 'Under Identification', 'Identified', 'Sent to AST', 'Completed'];
  const qcStatuses = ['Pending QC', 'QC Verified', 'QC Failed', 'Repeat Identification'];

  for (let i = 1; i <= 65; i++) {
    const colonyId = `COL-ID-${String(i).padStart(6, '0')}`;
    const day = String(1 + (i % 28)).padStart(2, '0');
    const dateStr = `2026-07-${day}`;
    const dateFormatted = dateStr.replace(/-/g, '');
    const plateBarcode = `PLT-${dateFormatted}-${String(1000 + i).slice(1)}`;
    const cultureAccession = `CUL-${dateFormatted}-${String(i).padStart(6, '0')}`;

    const status = colonyStatuses[i % colonyStatuses.length] as any;
    const qcStatus = qcStatuses[i % qcStatuses.length] as any;

    const attempts: IdentificationAttempt[] = [];
    let approvedAttempt: IdentificationAttempt | undefined;

    // Seed attempts for identified colonies
    if (['Identified', 'Sent to AST', 'Completed'].includes(status)) {
      const org = mockOrganismsCatalog[i % mockOrganismsCatalog.length] || mockOrganismsCatalog[0];
      const inst = mockInstruments[i % mockInstruments.length];

      attempts.push({
        attemptId: `ATT-${colonyId}-1`,
        colonyId,
        attemptNumber: 1,
        organismId: org.organismId,
        organismName: `${org.genus} ${org.species}`,
        method: i % 2 === 0 ? 'MALDI-TOF' : 'VITEK 2',
        confidence: {
          instrumentConfidence: 98.5 + (i % 10) / 10,
          technicianConfidence: 'High',
          supervisorConfidence: 'High',
          finalConfidence: 'High'
        },
        instrument: inst,
        performedBy: 'tech_user',
        timestamp: `${dateStr}T10:00:00Z`,
        status: status === 'Identified' ? 'Pending Verification' : 'Approved'
      });

      if (status !== 'Identified') {
        approvedAttempt = {
          ...attempts[0],
          status: 'Approved'
        };
      }
    }

    const gramStain: GramStain | undefined = i % 4 === 0 ? undefined : {
      reaction: i % 2 === 0 ? 'Gram Negative' : 'Gram Positive',
      shape: i % 2 === 0 ? 'Bacilli' : 'Cocci',
      arrangement: i % 2 === 0 ? 'Singles' : 'Clusters',
      technician: 'Sarah Connor',
      timestamp: `${dateStr}T09:00:00Z`
    };

    const biochemicals: BiochemicalResult[] = [];
    if (i % 3 !== 0) {
      biochemicals.push({
        testName: 'Catalase',
        result: i % 2 === 0 ? 'Positive' : 'Negative',
        performedBy: 'tech_user',
        timestamp: `${dateStr}T09:30:00Z`
      });
      biochemicals.push({
        testName: 'Oxidase',
        result: i % 2 === 0 ? 'Negative' : 'Positive',
        performedBy: 'tech_user',
        timestamp: `${dateStr}T09:35:00Z`
      });
    }

    coloniesDb.push({
      colonyId,
      plateId: `PLT-ID-${String(i).padStart(4, '0')}-1`,
      plateBarcode,
      cultureAccession,
      colonyNumber: 1 + (i % 3),
      status,
      qcStatus,
      morphology: i % 2 === 0 ? 'Circular, smooth' : 'Convex, dry',
      color: i % 2 === 0 ? 'White' : 'Yellow',
      hemolysis: i % 2 === 0 ? 'None' : 'Beta',
      gramStain,
      biochemicals,
      attempts,
      approvedAttempt,
      astRequestId: status === 'Sent to AST' ? `AST-REQ-${String(i).padStart(6, '0')}` : undefined
    });
  }
};

export const initializeMockOrganismServer = () => {
  seedColonies();

  // 1. GET /colonies
  mockAdapter.register('GET', '/colonies', (queryParams: any) => {
    const {
      page = '1',
      limit = '10',
      search = '',
      status = 'All',
      qcStatus = 'All',
    } = queryParams || {};

    let filtered = [...coloniesDb];

    if (status !== 'All') {
      filtered = filtered.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }

    if (qcStatus !== 'All') {
      filtered = filtered.filter((c) => c.qcStatus.toLowerCase() === qcStatus.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.colonyId.toLowerCase().includes(q) ||
          c.plateBarcode.toLowerCase().includes(q) ||
          c.cultureAccession.toLowerCase().includes(q) ||
          c.approvedAttempt?.organismName.toLowerCase().includes(q)
      );
    }

    const p = parseInt(page, 10);
    const l = parseInt(limit, 10);
    const start = (p - 1) * l;
    const sliced = filtered.slice(start, start + l);

    return {
      colonies: sliced,
      total: filtered.length,
      page: p,
      limit: l
    };
  });

  // 2. GET /colonies/:id
  mockAdapter.register('GET', '^/colonies/[a-zA-Z0-9\\-]+$', (_, url) => {
    const id = url?.split('/').pop();
    const colony = coloniesDb.find((c) => c.colonyId === id);
    if (!colony) {
      throw { status: 404, message: 'Isolated colony profile not found.' };
    }
    return colony;
  });

  // 3. POST /colonies/:id/gram-stain
  mockAdapter.register('POST', '^/colonies/[a-zA-Z0-9\\-]+/gram-stain$', (body: any, url) => {
    const id = url?.split('/')?.[2];
    const colonyIdx = coloniesDb.findIndex((c) => c.colonyId === id);
    if (colonyIdx === -1) {
      throw { status: 404, message: 'Colony not found.' };
    }

    const colony = coloniesDb[colonyIdx];
    colony.gramStain = {
      reaction: body.reaction,
      shape: body.shape,
      arrangement: body.arrangement,
      technician: body.technician || 'tech_user',
      timestamp: new Date().toISOString()
    };
    
    eventBus.publish('GRAM_STAIN_COMPLETED', colony);
    coloniesDb[colonyIdx] = { ...colony };
    return colony;
  });

  // 4. POST /colonies/:id/biochemicals
  mockAdapter.register('POST', '^/colonies/[a-zA-Z0-9\\-]+/biochemicals$', (body: any, url) => {
    const id = url?.split('/')?.[2];
    const colonyIdx = coloniesDb.findIndex((c) => c.colonyId === id);
    if (colonyIdx === -1) {
      throw { status: 404, message: 'Colony not found.' };
    }

    const colony = coloniesDb[colonyIdx];
    colony.biochemicals = (body.biochemicals || []).map((t: any) => ({
      testName: t.testName,
      result: t.result,
      performedBy: t.performedBy || 'tech_user',
      timestamp: new Date().toISOString(),
      notes: t.notes
    }));

    eventBus.publish('BIOCHEMICAL_TEST_COMPLETED', colony);
    coloniesDb[colonyIdx] = { ...colony };
    return colony;
  });

  // 5. POST /colonies/:id/attempts
  mockAdapter.register('POST', '^/colonies/[a-zA-Z0-9\\-]+/attempts$', (body: any, url) => {
    const id = url?.split('/')?.[2];
    const colonyIdx = coloniesDb.findIndex((c) => c.colonyId === id);
    if (colonyIdx === -1) {
      throw { status: 404, message: 'Colony not found.' };
    }

    const colony = coloniesDb[colonyIdx];
    const newAttemptNumber = colony.attempts.length + 1;
    const attemptId = `ATT-${colony.colonyId}-${newAttemptNumber}`;

    const newAttempt: IdentificationAttempt = {
      attemptId,
      colonyId: colony.colonyId,
      attemptNumber: newAttemptNumber,
      organismId: body.organismId,
      organismName: body.organismName,
      method: body.method || 'MALDI-TOF',
      confidence: body.confidence || {
        instrumentConfidence: 99.5,
        technicianConfidence: 'High',
        supervisorConfidence: 'High',
        finalConfidence: 'High'
      },
      instrument: mockInstruments[0],
      performedBy: 'tech_user',
      timestamp: new Date().toISOString(),
      status: 'Pending Verification'
    };

    if (colony.attempts.length > 0) {
      // Mark previous attempts superseded
      eventBus.publish('IDENTIFICATION_SUPERSEDED', { colony, oldAttempt: colony.attempts[colony.attempts.length - 1] });
    }

    colony.attempts.push(newAttempt);
    colony.status = 'Under Identification';

    eventBus.publish('IDENTIFICATION_ATTEMPT_CREATED', newAttempt);
    coloniesDb[colonyIdx] = { ...colony };
    return colony;
  });

  // 6. POST /colonies/:id/attempts/:attemptId/review
  mockAdapter.register('POST', '^/colonies/[a-zA-Z0-9\\-]+/attempts/[a-zA-Z0-9\\-]+/review$', (body: any, url) => {
    const parts = url?.split('/');
    const colonyId = parts?.[2];
    const attemptId = parts?.[4];

    const colonyIdx = coloniesDb.findIndex((c) => c.colonyId === colonyId);
    if (colonyIdx === -1) {
      throw { status: 404, message: 'Colony not found.' };
    }

    const colony = coloniesDb[colonyIdx];
    const attemptIdx = colony.attempts.findIndex((a) => a.attemptId === attemptId);
    if (attemptIdx === -1) {
      throw { status: 404, message: 'Attempt not found.' };
    }

    const attempt = colony.attempts[attemptIdx];
    attempt.status = body.status; // 'Approved' | 'Rejected'
    
    if (body.status === 'Approved') {
      colony.approvedAttempt = attempt;
      colony.status = 'Identified';
      colony.qcStatus = 'QC Verified';
      eventBus.publish('IDENTIFICATION_APPROVED', { colony, attempt });
      eventBus.publish('ORGANISM_IDENTIFIED', { colony, organismName: attempt.organismName });
    } else {
      colony.qcStatus = 'QC Failed';
      eventBus.publish('IDENTIFICATION_REJECTED', { colony, attempt });
    }

    coloniesDb[colonyIdx] = { ...colony };
    return colony;
  });

  // 7. POST /colonies/:id/send-to-ast
  mockAdapter.register('POST', '^/colonies/[a-zA-Z0-9\\-]+/send-to-ast$', (_, url) => {
    const id = url?.split('/')?.[2];
    const colonyIdx = coloniesDb.findIndex((c) => c.colonyId === id);
    if (colonyIdx === -1) {
      throw { status: 404, message: 'Colony not found.' };
    }

    const colony = coloniesDb[colonyIdx];
    colony.status = 'Sent to AST';
    colony.astRequestId = `AST-REQ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    eventBus.publish('AST_REQUESTED', colony);
    coloniesDb[colonyIdx] = { ...colony };
    return colony;
  });
};

export default initializeMockOrganismServer;
