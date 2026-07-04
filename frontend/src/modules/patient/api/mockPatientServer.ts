import { mockAdapter } from '../../../infrastructure/http/mockAdapter';
import { mockPatients } from '../../../mock/mockData';
import type { Patient } from '../models/types';

// In-Memory stateful Patient Database
let patientsDb: Patient[] = [];

// Seed database with mock data and extend to 10,000+ items for scale/performance checks
const seedDatabase = () => {
  const list: Patient[] = mockPatients.map((p) => ({
    ...p,
    status: 'Active',
    nationalId: 'ID-' + p.patientId.replace('PAT-', ''),
    address: {
      street: '123 Clinical Way',
      city: 'Metropolis',
      state: 'NY',
      zipCode: '10001',
    },
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '555-9000',
    },
    insurance: {
      provider: 'Central Healthcare Service',
      policyNumber: 'POL-11223344',
    },
    clinicalFlags: {
      allergies: ['Penicillin'],
      isolationRequired: false,
    },
    timeline: [
      {
        eventId: 'EVT-1',
        title: 'Patient Registered',
        timestamp: p.createdAt,
        description: 'Demographics verified and record initialized in LIMS directory.',
        status: 'completed',
      },
    ],
  }));

  // Append 10,000 generated patient records
  for (let i = 4; i <= 10050; i++) {
    const paddedIndex = String(i).padStart(6, '0');
    const patientId = `PAT-0000${paddedIndex}`;
    const birthYear = 1950 + (i % 50);
    const birthMonth = String(1 + (i % 12)).padStart(2, '0');
    const birthDay = String(1 + (i % 28)).padStart(2, '0');

    list.push({
      patientId,
      mrn: `MRN-90${paddedIndex}`,
      firstName: `Clinical_${i}`,
      lastName: `Subject_${i}`,
      dob: `${birthYear}-${birthMonth}-${birthDay}`,
      gender: i % 3 === 0 ? 'Male' : i % 3 === 1 ? 'Female' : 'Other',
      phone: `555-${String(1000 + i).slice(-4)}`,
      email: `subject_${i}@clinical.org`,
      createdAt: new Date(Date.now() - i * 3600 * 1000).toISOString(),
      status: 'Active',
      nationalId: `NAT-ID-${paddedIndex}`,
      address: {
        street: `${i} Laboratory St`,
        city: 'Diagnostic City',
        state: 'CA',
        zipCode: '90210',
      },
      emergencyContact: {
        name: `Emergency Contact ${i}`,
        relationship: 'Sibling',
        phone: `555-${String(9000 + i).slice(-4)}`,
      },
      insurance: {
        provider: i % 2 === 0 ? 'Blue Cross' : 'Medicaid',
        policyNumber: `POL-INS-${paddedIndex}`,
      },
      clinicalFlags: {
        allergies: i % 5 === 0 ? ['Sulfa Drugs'] : [],
        isolationRequired: i % 10 === 0,
        notes: i % 10 === 0 ? 'MRSA carrier. Precautionary isolation recommended.' : undefined,
      },
      timeline: [
        {
          eventId: `EVT-${patientId}-1`,
          title: 'Patient Registered',
          timestamp: new Date(Date.now() - i * 3600 * 1000).toISOString(),
          description: 'Record created via automated portal batch ingestion.',
          status: 'completed',
        },
      ],
    });
  }

  patientsDb = list;
};

// Initialize on server script load
seedDatabase();

export const initializeMockPatientServer = () => {
  // ─── GET /patients ───────────────────────────────────────────────────────────
  mockAdapter.register('GET', '/patients', (queryParams: any) => {
    const {
      page = 1,
      limit = 25,
      search = '',
      status = 'All',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryParams || {};

    let list = [...patientsDb];

    // 1. Status Filter
    if (status !== 'All') {
      list = list.filter((p) => p.status === status);
    }

    // 2. Search Filter
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.patientId.toLowerCase().includes(query) ||
          p.mrn.toLowerCase().includes(query) ||
          p.firstName.toLowerCase().includes(query) ||
          p.lastName.toLowerCase().includes(query) ||
          (p.phone && p.phone.includes(query)) ||
          (p.email && p.email.toLowerCase().includes(query)) ||
          (p.nationalId && p.nationalId.toLowerCase().includes(query)) ||
          (p.passportNumber && p.passportNumber.toLowerCase().includes(query))
      );
    }

    // 3. Sorting
    list.sort((a: any, b: any) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (valA === undefined) valA = '';
      if (valB === undefined) valB = '';

      if (valA === valB) return 0;
      const comp = valA > valB ? 1 : -1;
      return sortOrder === 'asc' ? comp : -comp;
    });

    // 4. Pagination slicing
    const total = list.length;
    const start = (Number(page) - 1) * Number(limit);
    const paginatedSlice = list.slice(start, start + Number(limit));

    return {
      patients: paginatedSlice,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }, { latencyMs: 100 });

  // ─── GET /patients/{id} ───────────────────────────────────────────────────────
  mockAdapter.register('GET', '^/patients/PAT-[0-9]+$', (_body: any, url?: string) => {
    const id = (url || '').split('/').pop() || '';
    const patient = patientsDb.find((p) => p.patientId === id);

    if (!patient) {
      throw { status: 404, message: `Patient with ID ${id} not found.` };
    }

    return patient;
  }, { latencyMs: 80 });

  // ─── POST /patients ──────────────────────────────────────────────────────────
  mockAdapter.register('POST', '/patients', (body: any) => {
    const { firstName, lastName, dob, mrn } = body || {};

    if (!firstName || !lastName || !dob) {
      throw { status: 400, message: 'Mandatory clinical diagnostics parameters are missing.' };
    }

    // Duplicate Detection: Check MRN or (Name + DOB)
    const duplicate = patientsDb.find(
      (p) =>
        (mrn && p.mrn.toLowerCase() === mrn.toLowerCase() && p.status === 'Active') ||
        (p.firstName.toLowerCase() === firstName.toLowerCase() &&
          p.lastName.toLowerCase() === lastName.toLowerCase() &&
          p.dob === dob &&
          p.status === 'Active')
    );

    if (duplicate) {
      throw {
        status: 409,
        message: `ERR-DUP: Patient record matching MRN "${mrn || duplicate.mrn}" already exists in LIMS registry.`,
      };
    }

    // Create new patient record
    const patientId = `PAT-0000${String(patientsDb.length + 1).padStart(6, '0')}`;
    const newPatient: Patient = {
      ...body,
      patientId,
      mrn: mrn || `MRN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      createdAt: new Date().toISOString(),
      status: 'Active',
      timeline: [
        {
          eventId: `EVT-${patientId}-1`,
          title: 'Patient Registered',
          timestamp: new Date().toISOString(),
          description: 'Demographics record captured and locked in system.',
          status: 'completed',
        },
      ],
    };

    patientsDb.unshift(newPatient); // Add to beginning
    return newPatient;
  }, { latencyMs: 120 });

  // ─── PUT /patients/{id} ──────────────────────────────────────────────────────
  mockAdapter.register('PUT', '^/patients/PAT-[0-9]+$', (body: any, url?: string) => {
    const id = (url || '').split('/').pop() || '';
    const idx = patientsDb.findIndex((p) => p.patientId === id);

    if (idx === -1) {
      throw { status: 404, message: `Patient with ID ${id} not found.` };
    }

    const current = patientsDb[idx];
    const updated: Patient = {
      ...current,
      ...body,
      patientId: id, // Immutable
      createdAt: current.createdAt, // Immutable
    };

    // Add update timeline event
    if (updated.timeline) {
      updated.timeline.push({
        eventId: `EVT-${id}-${updated.timeline.length + 1}`,
        title: 'Demographics Updated',
        timestamp: new Date().toISOString(),
        description: 'Patient contact or identity fields modified.',
        status: 'completed',
      });
    }

    patientsDb[idx] = updated;
    return updated;
  }, { latencyMs: 100 });

  // ─── DELETE /patients/{id} (Soft-deactivate) ──────────────────────────────────
  mockAdapter.register('DELETE', '^/patients/PAT-[0-9]+$', (_body: any, url?: string) => {
    const id = (url || '').split('/').pop() || '';
    const idx = patientsDb.findIndex((p) => p.patientId === id);

    if (idx === -1) {
      throw { status: 404, message: `Patient with ID ${id} not found.` };
    }

    const current = patientsDb[idx];
    patientsDb[idx] = {
      ...current,
      status: 'Inactive',
    };

    return { success: true, patientId: id };
  }, { latencyMs: 90 });

  // ─── POST /patients/merge ─────────────────────────────────────────────────────
  mockAdapter.register('POST', '/patients/merge', (body: any) => {
    const { targetId, duplicateId, reason } = body || {};

    if (!targetId || !duplicateId) {
      throw { status: 400, message: 'Target ID and Duplicate ID are required for merging.' };
    }

    const targetIdx = patientsDb.findIndex((p) => p.patientId === targetId);
    const duplicateIdx = patientsDb.findIndex((p) => p.patientId === duplicateId);

    if (targetIdx === -1 || duplicateIdx === -1) {
      throw { status: 404, message: 'One or both patient records could not be resolved.' };
    }

    const target = patientsDb[targetIdx];
    const duplicate = patientsDb[duplicateIdx];

    // Merge notes and update timeline
    const mergedNotes = `Merged duplicate record ${duplicate.mrn} (${duplicate.lastName}, ${duplicate.firstName}) into this record. Reason: ${reason}`;
    
    const updatedTarget: Patient = {
      ...target,
      clinicalFlags: {
        allergies: Array.from(new Set([
          ...(target.clinicalFlags?.allergies || []),
          ...(duplicate.clinicalFlags?.allergies || [])
        ])),
        isolationRequired: target.clinicalFlags?.isolationRequired || duplicate.clinicalFlags?.isolationRequired || false,
        notes: [target.clinicalFlags?.notes, duplicate.clinicalFlags?.notes, mergedNotes].filter(Boolean).join(' | '),
      },
    };

    if (updatedTarget.timeline) {
      updatedTarget.timeline.push({
        eventId: `EVT-${targetId}-MERGE`,
        title: 'Records Merged',
        timestamp: new Date().toISOString(),
        description: `Duplicate record ${duplicate.mrn} consolidated into this index. Reason: ${reason}`,
        status: 'completed',
      });
    }

    patientsDb[targetIdx] = updatedTarget;

    // Soft merge flag on duplicate record
    patientsDb[duplicateIdx] = {
      ...duplicate,
      status: 'Inactive (Merged)',
      mergedIntoId: targetId,
    };

    return { success: true, target: updatedTarget };
  }, { latencyMs: 150 });

  // ─── GET /patients/search (Quick query) ───────────────────────────────────────
  mockAdapter.register('GET', '/patients/search', (queryParams: any) => {
    const { q = '' } = queryParams || {};
    const query = q.trim().toLowerCase();

    if (!query) return [];

    return patientsDb
      .filter(
        (p) =>
          p.status === 'Active' &&
          (p.patientId.toLowerCase().includes(query) ||
            p.mrn.toLowerCase().includes(query) ||
            p.firstName.toLowerCase().includes(query) ||
            p.lastName.toLowerCase().includes(query))
      )
      .slice(0, 10); // Return top 10 matches
  }, { latencyMs: 50 });

  // ─── GET /patients/history (Audit details list) ───────────────────────────────
  mockAdapter.register('GET', '/patients/history', (queryParams: any) => {
    const { patientId } = queryParams || {};
    if (!patientId) return [];

    // Filter timeline events as a mock of history logs
    const patient = patientsDb.find((p) => p.patientId === patientId);
    return patient ? patient.timeline || [] : [];
  }, { latencyMs: 70 });
};
export default initializeMockPatientServer;
