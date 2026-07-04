import { mockAdapter } from '../../../infrastructure/http/mockAdapter';
import { eventBus } from '../../../services/platform/eventBus';
import type { QCSample, QCInstrument, QCReagent, QCEvent } from '../models/types';

let qcSamplesDb: QCSample[] = [];
let qcInstrumentsDb: QCInstrument[] = [];
let qcReagentsDb: QCReagent[] = [];
let qcEventsDb: QCEvent[] = [];

const seedQC = () => {
  if (qcSamplesDb.length > 0) return;

  // 1. Instruments
  const instNames = ['Vitek 2 Analyzer', 'MALDI-TOF Microflex', 'Bact/ALERT Virtuo', 'GeneXpert IV', 'Centrifuge C-1', 'Incubator I-102'];
  const instStatuses: QCInstrument['status'][] = ['Calibrated', 'Calibration Due', 'Maintenance Due', 'Maintenance Scheduled', 'Offline'];

  instNames.forEach((name, i) => {
    qcInstrumentsDb.push({
      instrumentId: `INST-${i + 1}`,
      name,
      code: `INST-CODE-${i + 1}`,
      status: instStatuses[i % instStatuses.length],
      lastCalibrationDate: '2026-06-01T08:00:00Z',
      nextCalibrationDueDate: i % 2 === 0 ? '2026-07-10T12:00:00Z' : '2026-07-01T12:00:00Z',
      lastMaintenanceDate: '2026-05-15T08:00:00Z',
      nextMaintenanceDueDate: i === 3 ? '2026-07-04T09:00:00Z' : '2026-07-28T09:00:00Z',
      downtimeHours: i * 2,
    });
  });

  // 2. Reagents
  const reagentNames = ['MacConkey Agar Lot A', 'Blood Agar Lot B', 'Vitek Gram-Negative Card', 'Ciprofloxacin E-Test Strip', 'Gram Stain Kit Lot X'];
  const expirations = ['2026-07-20', '2026-06-15', '2026-08-01', '2026-07-03', '2026-10-15'];

  reagentNames.forEach((name, i) => {
    qcReagentsDb.push({
      reagentId: `REG-${i + 1}`,
      name,
      lotNumber: `LOT-RE-${i + 100}`,
      expirationDate: expirations[i],
      storageConditions: 'Store at 2-8°C',
      qcStatus: i === 1 ? 'Failed' : i === 3 ? 'Pending' : 'Passed',
      usageCount: (i + 1) * 15,
    });
  });

  // 3. Samples
  const controlStrains = ['ATCC 25922', 'ATCC 25923', 'ATCC 27853', 'ATCC 29213'];
  const targets = ['Escherichia coli', 'Staphylococcus aureus', 'Pseudomonas aeruginosa', 'Enterococcus faecalis'];
  const sampleStatuses: QCSample['status'][] = ['Scheduled', 'Collected', 'Processed', 'Verified', 'Passed', 'Failed'];

  for (let idx = 0; idx < 80; idx++) {
    const status = sampleStatuses[idx % sampleStatuses.length];
    const day = String(1 + (idx % 28)).padStart(2, '0');
    const scheduledDate = `2026-07-${day}`;

    qcSamplesDb.push({
      sampleId: `QC-SMP-202607-${String(idx + 1).padStart(4, '0')}`,
      controlStrain: controlStrains[idx % controlStrains.length],
      targetOrganism: targets[idx % targets.length],
      status,
      scheduledDate,
      collectedDate: status !== 'Scheduled' ? `${scheduledDate}T08:00:00Z` : undefined,
      processedDate: ['Processed', 'Verified', 'Passed', 'Failed'].includes(status) ? `${scheduledDate}T10:00:00Z` : undefined,
      verifiedDate: ['Verified', 'Passed', 'Failed'].includes(status) ? `${scheduledDate}T12:00:00Z` : undefined,
      technician: 'tech_user',
      lotNumber: `LOT-RE-${100 + (idx % 5)}`,
      findings: status === 'Failed' ? 'Observed MIC values exceeded expected limits.' : 'All values conform to guideline range.',
    });
  }

  // 4. Events
  qcEventsDb.push(
    { eventId: 'EV-1', timestamp: '2026-07-01T08:00:00Z', type: 'Calibration', entityId: 'INST-1', entityName: 'Vitek 2 Analyzer', performedBy: 'tech_user', comments: 'Routine bi-annual calibration performed.' },
    { eventId: 'EV-2', timestamp: '2026-07-02T10:00:00Z', type: 'QC Run', entityId: 'QC-SMP-202607-0001', entityName: 'ATCC 25922', performedBy: 'tech_user', comments: 'Lot passed QC checks successfully.' },
    { eventId: 'EV-3', timestamp: '2026-07-03T09:00:00Z', type: 'Reagent Lot Expiry', entityId: 'REG-4', entityName: 'Ciprofloxacin E-Test Strip', performedBy: 'system', comments: 'Lot marked expired.' }
  );
};

export const initializeMockQCServer = () => {
  seedQC();

  // 1. GET /qc/samples
  mockAdapter.register('GET', '/qc/samples', () => {
    return qcSamplesDb;
  });

  // 2. POST /qc/samples
  mockAdapter.register('POST', '/qc/samples', (body: any) => {
    const newSample: QCSample = {
      sampleId: `QC-SMP-${Date.now()}`,
      controlStrain: body.controlStrain,
      targetOrganism: body.targetOrganism || 'Escherichia coli',
      status: 'Scheduled',
      scheduledDate: body.scheduledDate,
      lotNumber: body.lotNumber || 'LOT-RE-100',
    };
    qcSamplesDb.unshift(newSample);
    return newSample;
  });

  // 3. POST /qc/samples/:id/status
  mockAdapter.register('POST', '^/qc/samples/[a-zA-Z0-9\\-]+/status$', (body: any, url?: string) => {
    const parts = url?.split('/');
    const id = parts?.[3];
    const sample = qcSamplesDb.find((s) => s.sampleId === id);
    if (!sample) throw { status: 404, message: 'QC sample not found.' };

    sample.status = body.status;
    sample.findings = body.findings || '';
    if (body.status === 'Passed') {
      sample.verifiedDate = new Date().toISOString();
      eventBus.publish('QC_COMPLETED', sample);
    } else if (body.status === 'Failed') {
      sample.verifiedDate = new Date().toISOString();
      eventBus.publish('QC_FAILED', sample);
    }
    return sample;
  });

  // 4. GET /qc/instruments
  mockAdapter.register('GET', '/qc/instruments', () => {
    return qcInstrumentsDb;
  });

  // 5. POST /qc/instruments/:id/calibrate
  mockAdapter.register('POST', '^/qc/instruments/[a-zA-Z0-9\\-]+/calibrate$', (_: any, url?: string) => {
    const parts = url?.split('/');
    const id = parts?.[3];
    const inst = qcInstrumentsDb.find((i) => i.instrumentId === id);
    if (!inst) throw { status: 404, message: 'Instrument not found.' };

    inst.status = 'Calibrated';
    inst.lastCalibrationDate = new Date().toISOString();
    inst.nextCalibrationDueDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(); // +180 days

    qcEventsDb.unshift({
      eventId: `EV-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'Calibration',
      entityId: inst.instrumentId,
      entityName: inst.name,
      performedBy: 'tech_user',
      comments: 'Calibrated successfully.',
    });

    eventBus.publish('INSTRUMENT_CALIBRATED', inst);
    return inst;
  });

  // 6. POST /qc/instruments/:id/maintenance/schedule
  mockAdapter.register('POST', '^/qc/instruments/[a-zA-Z0-9\\-]+/maintenance/schedule$', (body: any, url?: string) => {
    const parts = url?.split('/');
    const id = parts?.[3];
    const inst = qcInstrumentsDb.find((i) => i.instrumentId === id);
    if (!inst) throw { status: 404, message: 'Instrument not found.' };

    inst.status = 'Maintenance Scheduled';
    inst.nextMaintenanceDueDate = body.date;

    qcEventsDb.unshift({
      eventId: `EV-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'Maintenance',
      entityId: inst.instrumentId,
      entityName: inst.name,
      performedBy: 'tech_user',
      comments: `Maintenance scheduled for date: ${body.date}`,
    });
    return inst;
  });

  // 7. POST /qc/instruments/:id/maintenance/complete
  mockAdapter.register('POST', '^/qc/instruments/[a-zA-Z0-9\\-]+/maintenance/complete$', (_: any, url?: string) => {
    const parts = url?.split('/');
    const id = parts?.[3];
    const inst = qcInstrumentsDb.find((i) => i.instrumentId === id);
    if (!inst) throw { status: 404, message: 'Instrument not found.' };

    inst.status = 'Maintenance Completed';
    inst.lastMaintenanceDate = new Date().toISOString();
    inst.nextMaintenanceDueDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // +90 days

    qcEventsDb.unshift({
      eventId: `EV-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'Maintenance',
      entityId: inst.instrumentId,
      entityName: inst.name,
      performedBy: 'tech_user',
      comments: 'Maintenance task completed successfully.',
    });
    return inst;
  });

  // 8. GET /qc/reagents
  mockAdapter.register('GET', '/qc/reagents', () => {
    return qcReagentsDb;
  });

  // 9. POST /qc/reagents
  mockAdapter.register('POST', '/qc/reagents', (body: any) => {
    const newReagent: QCReagent = {
      reagentId: `REG-${Date.now()}`,
      name: body.name,
      lotNumber: body.lotNumber,
      expirationDate: body.expirationDate,
      storageConditions: body.storageConditions || 'Store at 2-8°C',
      qcStatus: 'Pending',
      usageCount: 0,
    };
    qcReagentsDb.unshift(newReagent);
    return newReagent;
  });

  // 10. GET /qc/events
  mockAdapter.register('GET', '/qc/events', () => {
    return qcEventsDb;
  });
};

export default initializeMockQCServer;
export { qcSamplesDb };
