import { mockAdapter } from '../../../infrastructure/http/mockAdapter';
import type { Specimen, CustodyEvent, QualityAssessment, BarcodePrintLog, SpecimenAuditTrail, SpecimenStatus } from '../models/types';
import { mockPatients } from '../../../mock/mockData';

// Stateful mock specimen database
let specimensDb: Specimen[] = [];

const seedSpecimens = () => {
  if (specimensDb.length > 0) return;

  const testCodes = ['MC-001', 'MC-002', 'MC-003', 'MC-004', 'MC-005'];
  const testNames = ['Urine Culture', 'Blood Culture', 'CSF Culture', 'Gram Stain', 'Wound Culture'];
  const containerTypes = ['Sterile Cup', 'Aerobic Bottle', 'Sterile Tube #2', 'Amies Gel Swab', 'Sterile Transport Swab'];
  const statuses: SpecimenStatus[] = [
    'Collected',
    'Awaiting Transport',
    'Transported',
    'Received',
    'Under Quality Check',
    'Accepted',
    'Rejected',
    'Split',
    'Completed'
  ];

  for (let i = 1; i <= 100; i++) {
    const pIdx = i % mockPatients.length;
    const patient = mockPatients[pIdx] || mockPatients[0];
    const specimenId = `SPC-ID-${String(i).padStart(6, '0')}`;
    const day = String(1 + (i % 28)).padStart(2, '0');
    const dateStr = `2026-07-${day}`;
    const dateFormatted = dateStr.replace(/-/g, '');
    const barcode = `SPC-${dateFormatted}-${String(i).padStart(6, '0')}`;
    const status = statuses[i % statuses.length];
    const testCode = testCodes[i % testCodes.length];
    const testName = testNames[i % testNames.length];
    const container = containerTypes[i % containerTypes.length];
    const orderAccession = `ORD-${dateFormatted}-${String(i).padStart(6, '0')}`;
    const orderId = `ORD-ID-${String(i).padStart(6, '0')}`;

    const collectionDetails = {
      timestamp: `${dateStr}T08:30:00Z`,
      collector: 'Sarah Connor',
      location: 'Outpatient Clinic Room A',
      method: i % 2 === 0 ? 'Clean catch midstream' : 'Venipuncture venostat',
    };

    const custodyHistory: CustodyEvent[] = [
      {
        id: `CUST-${specimenId}-1`,
        status: 'Scheduled',
        timestamp: `${dateStr}T08:00:00Z`,
        performedBy: 'Sarah Connor',
        role: 'Registrar',
        department: 'Receiving',
        location: 'Outpatient Clinic Room A',
        action: 'Requisition checked and containers pre-labeled.'
      }
    ];

    if (status !== 'Scheduled') {
      custodyHistory.push({
        id: `CUST-${specimenId}-2`,
        status: 'Collected',
        timestamp: `${dateStr}T08:30:00Z`,
        performedBy: 'Sarah Connor',
        role: 'Registrar',
        department: 'Receiving',
        location: 'Outpatient Clinic Room A',
        action: 'Specimen collected from donor.'
      });
    }

    if (['Awaiting Transport', 'Transported', 'Received', 'Under Quality Check', 'Accepted', 'Rejected', 'Split', 'Completed'].includes(status)) {
      custodyHistory.push({
        id: `CUST-${specimenId}-3`,
        status: 'Awaiting Transport',
        timestamp: `${dateStr}T09:00:00Z`,
        performedBy: 'Sarah Connor',
        role: 'Registrar',
        department: 'Receiving',
        location: 'Central Storage Shelf B',
        action: 'Specimen placed in cooler bag.'
      });
    }

    if (['Transported', 'Received', 'Under Quality Check', 'Accepted', 'Rejected', 'Split', 'Completed'].includes(status)) {
      custodyHistory.push({
        id: `CUST-${specimenId}-4`,
        status: 'Transported',
        timestamp: `${dateStr}T10:00:00Z`,
        performedBy: 'Courier John',
        role: 'Courier Agent',
        department: 'Logistics',
        location: 'Transport Vehicle #5',
        action: 'Specimen transported in locked cooling box.'
      });
    }

    if (['Received', 'Under Quality Check', 'Accepted', 'Rejected', 'Split', 'Completed'].includes(status)) {
      custodyHistory.push({
        id: `CUST-${specimenId}-5`,
        status: 'Received',
        timestamp: `${dateStr}T10:30:00Z`,
        performedBy: 'John Miller',
        role: 'Technician',
        department: 'Microbiology Intake',
        location: 'Accessioning Station 2',
        action: 'Specimen received in central lab.'
      });
    }

    let qualityAssessment: QualityAssessment | undefined;
    if (['Accepted', 'Rejected', 'Split', 'Completed'].includes(status)) {
      const decision = status === 'Rejected' ? 'Rejected' : 'Accepted';
      qualityAssessment = {
        quantitySufficient: status !== 'Rejected',
        containerCorrect: true,
        labelCorrect: true,
        leakage: false,
        hemolysis: false,
        contamination: false,
        temperatureAcceptable: true,
        transportDelay: false,
        decision,
        reviewer: 'John Miller',
        timestamp: `${dateStr}T11:00:00Z`
      };
      
      custodyHistory.push({
        id: `CUST-${specimenId}-6`,
        status: decision,
        timestamp: `${dateStr}T11:00:00Z`,
        performedBy: 'John Miller',
        role: 'Technician',
        department: 'Microbiology Intake',
        location: 'Accessioning Station 2',
        action: decision === 'Accepted' ? 'Specimen accepted for testing.' : 'Specimen rejected due to insufficient quantity.'
      });
    }

    const auditTrail: SpecimenAuditTrail[] = [
      {
        id: `AUD-${specimenId}-1`,
        timestamp: `${dateStr}T08:30:00Z`,
        performedBy: 'Sarah Connor',
        action: 'Collected specimen and generated barcode labels.',
        source: 'LIMS Client'
      }
    ];

    specimensDb.push({
      specimenId,
      barcode,
      patientId: patient.patientId,
      patientMrn: patient.mrn,
      patientName: `${patient.lastName}, ${patient.firstName}`,
      orderId,
      orderAccession,
      testCode,
      testName,
      status,
      priority: i % 3 === 0 ? 'STAT' : i % 3 === 1 ? 'Urgent' : 'Routine',
      containerType: container,
      volume: i % 2 === 0 ? 10 : 1,
      collectionDetails,
      transportDetails: {
        pickupTime: `${dateStr}T09:15:00Z`,
        courier: 'Express Courier Services',
        transportBox: 'BOX-291',
        temperature: '4.5°C',
        arrivalTime: `${dateStr}T10:30:00Z`,
        durationMinutes: 75
      },
      qualityAssessment,
      rejectionCategory: status === 'Rejected' ? 'Insufficient volume' : undefined,
      rejectionReason: status === 'Rejected' ? 'Volume below required 1.5mL threshold.' : undefined,
      barcodePrintHistory: [
        {
          id: `PRINT-${specimenId}-1`,
          timestamp: `${dateStr}T08:30:00Z`,
          performedBy: 'Sarah Connor',
          workstation: 'WS-Registrar-1',
          isReplacement: false
        }
      ],
      custodyHistory,
      auditTrail
    });
  }
};

export const initializeMockSpecimenServer = () => {
  seedSpecimens();

  // 1. GET /specimens
  mockAdapter.register('GET', '/specimens', (queryParams: any) => {
    const {
      page = '1',
      limit = '10',
      search = '',
      status = 'All',
      container = '',
      collector = '',
      rejectionReason = '',
      sortBy = 'collectionDetails.timestamp',
      sortOrder = 'desc',
    } = queryParams || {};

    let filtered = [...specimensDb];

    // Status filter
    if (status !== 'All') {
      filtered = filtered.filter((s) => s.status.toLowerCase() === status.toLowerCase());
    }

    // Container filter
    if (container) {
      filtered = filtered.filter((s) => s.containerType.toLowerCase().includes(container.toLowerCase()));
    }

    // Collector filter
    if (collector) {
      filtered = filtered.filter((s) => s.collectionDetails.collector.toLowerCase().includes(collector.toLowerCase()));
    }

    // Rejection reason filter
    if (rejectionReason) {
      filtered = filtered.filter((s) => s.rejectionCategory?.toLowerCase() === rejectionReason.toLowerCase());
    }

    // Search query matches
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.barcode.toLowerCase().includes(q) ||
          s.patientMrn.toLowerCase().includes(q) ||
          s.patientName.toLowerCase().includes(q) ||
          s.orderAccession.toLowerCase().includes(q) ||
          s.testName.toLowerCase().includes(q) ||
          s.containerType.toLowerCase().includes(q)
      );
    }

    // Sort sorting
    filtered.sort((a: any, b: any) => {
      // Handle nested property sorting
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy.includes('.')) {
        const parts = sortBy.split('.');
        aVal = a[parts[0]]?.[parts[1]] ?? '';
        bVal = b[parts[0]]?.[parts[1]] ?? '';
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const p = parseInt(page, 10);
    const l = parseInt(limit, 10);
    const start = (p - 1) * l;
    const sliced = filtered.slice(start, start + l);

    return {
      specimens: sliced,
      total: filtered.length,
      page: p,
      limit: l,
    };
  });

  // 2. GET /specimens/:id
  mockAdapter.register('GET', '^/specimens/[a-zA-Z0-9\\-]+$', (_, url) => {
    const id = url?.split('/').pop();
    const specimen = specimensDb.find((s) => s.specimenId === id);
    if (!specimen) {
      throw { status: 404, message: 'Specimen container record not found.' };
    }
    return specimen;
  });

  // 3. POST /specimens (register/create)
  mockAdapter.register('POST', '/specimens', (body: any) => {
    const newIdx = specimensDb.length + 1;
    const dateFormatted = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const barcode = `SPC-${dateFormatted}-${String(newIdx).padStart(6, '0')}`;
    const specimenId = `SPC-ID-${String(newIdx).padStart(6, '0')}`;

    // Resolve patient details
    const patient = mockPatients.find((p) => p.patientId === body.patientId) || mockPatients[0];

    const newSpecimen: Specimen = {
      specimenId,
      barcode,
      patientId: body.patientId,
      patientMrn: patient.mrn,
      patientName: `${patient.lastName}, ${patient.firstName}`,
      orderId: body.orderId,
      orderAccession: body.orderAccession || 'ORD-UNKNOWN',
      testCode: body.testCode,
      testName: body.testName || 'Microbiology investigation',
      status: body.status || 'Collected',
      priority: body.priority || 'Routine',
      containerType: body.containerType || 'Sterile Container',
      volume: body.volume || 1,
      parentId: body.parentId,
      collectionDetails: {
        timestamp: body.collectionDetails?.timestamp || new Date().toISOString(),
        collector: body.collectionDetails?.collector || 'Sarah Connor',
        location: body.collectionDetails?.location || 'Outpatient Receiving Room',
        method: body.collectionDetails?.method || 'Extraction Swab',
      },
      barcodePrintHistory: [
        {
          id: `PRINT-${specimenId}-1`,
          timestamp: new Date().toISOString(),
          performedBy: 'registrar_user',
          workstation: 'WS-Registrar-1',
          isReplacement: false
        }
      ],
      custodyHistory: [
        {
          id: `CUST-${specimenId}-1`,
          status: 'Collected',
          timestamp: new Date().toISOString(),
          performedBy: 'registrar_user',
          role: 'Registrar',
          department: 'Receiving',
          location: body.collectionDetails?.location || 'Outpatient Receiving Room',
          action: 'Specimen collected from donor and registered.'
        }
      ],
      auditTrail: [
        {
          id: `AUD-${specimenId}-1`,
          timestamp: new Date().toISOString(),
          performedBy: 'registrar_user',
          action: 'Registered specimen collection.',
          source: 'LIMS Client'
        }
      ],
    };

    specimensDb.unshift(newSpecimen);
    return newSpecimen;
  });

  // 4. POST /specimens/:id/qc (Quality check)
  mockAdapter.register('POST', '^/specimens/[a-zA-Z0-9\\-]+/qc$', (body: any, url) => {
    const parts = url?.split('/');
    const id = parts?.[parts.length - 2];
    const specIdx = specimensDb.findIndex((s) => s.specimenId === id);
    if (specIdx === -1) {
      throw { status: 404, message: 'Specimen record not found.' };
    }

    const specimen = specimensDb[specIdx];
    const decision = body.decision || 'Accepted';

    const qa: QualityAssessment = {
      quantitySufficient: body.quantitySufficient !== false,
      containerCorrect: body.containerCorrect !== false,
      labelCorrect: body.labelCorrect !== false,
      leakage: body.leakage === true,
      hemolysis: body.hemolysis === true,
      contamination: body.contamination === true,
      temperatureAcceptable: body.temperatureAcceptable !== false,
      transportDelay: body.transportDelay === true,
      decision,
      reviewer: 'John Miller',
      timestamp: new Date().toISOString()
    };

    const updated: Specimen = {
      ...specimen,
      status: decision === 'Rejected' ? 'Rejected' : 'Accepted',
      qualityAssessment: qa,
      rejectionCategory: decision === 'Rejected' ? body.rejectionCategory : undefined,
      rejectionReason: decision === 'Rejected' ? body.rejectionReason : undefined,
      custodyHistory: [
        ...specimen.custodyHistory,
        {
          id: `CUST-${specimen.specimenId}-${specimen.custodyHistory.length + 1}`,
          status: decision === 'Rejected' ? 'Rejected' : 'Accepted',
          timestamp: new Date().toISOString(),
          performedBy: 'tech_user',
          role: 'Technician',
          department: 'Microbiology Intake',
          location: 'Accessioning Station 2',
          action: decision === 'Accepted' ? 'Accepted after QC.' : `Rejected: ${body.rejectionCategory}. Reason: ${body.rejectionReason}`
        }
      ],
      auditTrail: [
        ...specimen.auditTrail,
        {
          id: `AUD-${specimen.specimenId}-${specimen.auditTrail.length + 1}`,
          timestamp: new Date().toISOString(),
          performedBy: 'tech_user',
          action: 'Performed specimen quality assessment check.',
          source: 'LIMS Client'
        }
      ]
    };

    specimensDb[specIdx] = updated;
    return updated;
  });

  // 5. POST /specimens/:id/split (Split Aliquot)
  mockAdapter.register('POST', '^/specimens/[a-zA-Z0-9\\-]+/split$', (body: any, url) => {
    const parts = url?.split('/');
    const id = parts?.[parts.length - 2];
    const specIdx = specimensDb.findIndex((s) => s.specimenId === id);
    if (specIdx === -1) {
      throw { status: 404, message: 'Specimen parent container not found.' };
    }

    const parent = specimensDb[specIdx];
    const splitVol = body.volume || 1;

    if (parent.volume < splitVol) {
      throw { status: 400, message: 'Insufficient parent container volume to split aliquot.' };
    }

    // Subtract volume from parent container
    parent.volume -= splitVol;

    // Create child aliquot specimen
    const newIdx = specimensDb.length + 1;
    const childBarcode = `${parent.barcode}-ALQ${newIdx}`;
    const childSpecId = `SPC-ID-${String(newIdx).padStart(6, '0')}`;

    const child: Specimen = {
      ...parent,
      specimenId: childSpecId,
      barcode: childBarcode,
      parentId: parent.specimenId,
      volume: splitVol,
      status: 'Aliquoted',
      custodyHistory: [
        {
          id: `CUST-${childSpecId}-1`,
          status: 'Aliquoted',
          timestamp: new Date().toISOString(),
          performedBy: 'tech_user',
          role: 'Technician',
          department: 'Microbiology Intake',
          location: 'Biological Hood Station 4',
          action: `Child aliquot split from parent container ${parent.barcode}.`
        }
      ],
      auditTrail: [
        {
          id: `AUD-${childSpecId}-1`,
          timestamp: new Date().toISOString(),
          performedBy: 'tech_user',
          action: `Created aliquot split child from parent ${parent.specimenId}.`,
          source: 'LIMS Client'
        }
      ]
    };

    specimensDb.unshift(child);
    return child;
  });

  // 6. POST /specimens/:id/reprint (Reprint Barcode)
  mockAdapter.register('POST', '^/specimens/[a-zA-Z0-9\\-]+/reprint$', (body: any, url) => {
    const parts = url?.split('/');
    const id = parts?.[parts.length - 2];
    const specIdx = specimensDb.findIndex((s) => s.specimenId === id);
    if (specIdx === -1) {
      throw { status: 404, message: 'Specimen not found.' };
    }

    const specimen = specimensDb[specIdx];
    const newPrint: BarcodePrintLog = {
      id: `PRINT-${specimen.specimenId}-${specimen.barcodePrintHistory.length + 1}`,
      timestamp: new Date().toISOString(),
      performedBy: 'registrar_user',
      workstation: 'WS-Registrar-1',
      isReplacement: true,
      reason: body.reason || 'Damaged label reprint request.'
    };

    specimen.barcodePrintHistory.push(newPrint);
    specimen.auditTrail.push({
      id: `AUD-${specimen.specimenId}-${specimen.auditTrail.length + 1}`,
      timestamp: new Date().toISOString(),
      performedBy: 'registrar_user',
      action: 'Reprinted specimen container barcode labels.',
      source: 'LIMS Client',
      reason: body.reason
    });

    return specimen;
  });

  // 7. POST /specimens/bulk-receive
  mockAdapter.register('POST', '/specimens/bulk-receive', (body: any) => {
    const { ids = [] } = body || {};
    let count = 0;
    specimensDb = specimensDb.map((s) => {
      if (ids.includes(s.specimenId)) {
        count++;
        return {
          ...s,
          status: 'Received',
          custodyHistory: [
            ...s.custodyHistory,
            {
              id: `CUST-${s.specimenId}-${s.custodyHistory.length + 1}`,
              status: 'Received',
              timestamp: new Date().toISOString(),
              performedBy: 'tech_user',
              role: 'Technician',
              department: 'Microbiology Intake',
              location: 'Accessioning Station 2',
              action: 'Bulk received specimen container.'
            }
          ]
        };
      }
      return s;
    });
    return { count };
  });

  // 8. POST /specimens/bulk-accept
  mockAdapter.register('POST', '/specimens/bulk-accept', (body: any) => {
    const { ids = [] } = body || {};
    let count = 0;
    specimensDb = specimensDb.map((s) => {
      if (ids.includes(s.specimenId)) {
        count++;
        return {
          ...s,
          status: 'Accepted',
          custodyHistory: [
            ...s.custodyHistory,
            {
              id: `CUST-${s.specimenId}-${s.custodyHistory.length + 1}`,
              status: 'Accepted',
              timestamp: new Date().toISOString(),
              performedBy: 'tech_user',
              role: 'Technician',
              department: 'Microbiology Intake',
              location: 'Accessioning Station 2',
              action: 'Bulk accepted specimen for inoculation.'
            }
          ]
        };
      }
      return s;
    });
    return { count };
  });

  // 9. POST /specimens/bulk-reject
  mockAdapter.register('POST', '/specimens/bulk-reject', (body: any) => {
    const { ids = [], reason = '', category = '' } = body || {};
    let count = 0;
    specimensDb = specimensDb.map((s) => {
      if (ids.includes(s.specimenId)) {
        count++;
        return {
          ...s,
          status: 'Rejected',
          rejectionCategory: category,
          rejectionReason: reason,
          custodyHistory: [
            ...s.custodyHistory,
            {
              id: `CUST-${s.specimenId}-${s.custodyHistory.length + 1}`,
              status: 'Rejected',
              timestamp: new Date().toISOString(),
              performedBy: 'tech_user',
              role: 'Technician',
              department: 'Microbiology Intake',
              location: 'Accessioning Station 2',
              action: `Bulk rejected: ${category}. Notes: ${reason}`
            }
          ]
        };
      }
      return s;
    });
    return { count };
  });
};

export default initializeMockSpecimenServer;
