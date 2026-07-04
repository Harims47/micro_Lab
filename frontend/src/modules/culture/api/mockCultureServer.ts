import { mockAdapter } from '../../../infrastructure/http/mockAdapter';
import type { Culture, CulturePlate, PlateObservation, ColonyItem, MediaName } from '../models/types';
import { mockPatients } from '../../../mock/mockData';
import { eventBus } from '../../../services/platform/eventBus';

// Stateful mock culture database
let culturesDb: Culture[] = [];

const seedCultures = () => {
  if (culturesDb.length > 0) return;

  const mediaTypes: MediaName[] = ['Blood Agar', 'MacConkey', 'Chocolate Agar', 'CLED', 'Sabouraud'];
  const plateStatuses = ['Created', 'Inoculated', 'Incubating', 'Completed', 'Contaminated'];

  for (let i = 1; i <= 60; i++) {
    const pIdx = i % mockPatients.length;
    const patient = mockPatients[pIdx] || mockPatients[0];
    const cultureId = `CUL-ID-${String(i).padStart(6, '0')}`;
    const day = String(1 + (i % 28)).padStart(2, '0');
    const dateStr = `2026-07-${day}`;
    const dateFormatted = dateStr.replace(/-/g, '');
    const cultureAccession = `CUL-${dateFormatted}-${String(i).padStart(6, '0')}`;
    
    const specimenBarcode = `SPC-${dateFormatted}-${String(i).padStart(6, '0')}`;
    const specimenId = `SPC-ID-${String(i).padStart(6, '0')}`;

    // Seed 1 to 3 plates per culture
    const platesCount = 1 + (i % 3);
    const plates: CulturePlate[] = [];

    for (let p = 1; p <= platesCount; p++) {
      const plateId = `PLT-ID-${String(i).padStart(4, '0')}-${p}`;
      const plateBarcode = `PLT-${dateFormatted}-${String(i).padStart(4, '0')}-${p}`;
      const media = mediaTypes[(i + p) % mediaTypes.length] || 'Blood Agar';
      const status = plateStatuses[(i + p) % plateStatuses.length] as any;

      const observations: PlateObservation[] = [];
      const colonies: ColonyItem[] = [];

      if (['Completed', 'Contaminated'].includes(status) || (status === 'Incubating' && p === 1)) {
        observations.push({
          id: `OBS-${plateId}-1`,
          timestamp: `${dateStr}T18:00:00Z`,
          observer: 'John Miller',
          roundNumber: 1,
          growthLevel: i % 4 === 0 ? 'No Growth' : 'Moderate',
          comments: i % 4 === 0 ? 'No significant bacterial growth visible at 18h.' : 'Gram-negative rods colonies visible.',
          attachmentIds: []
        });

        if (i % 4 !== 0) {
          colonies.push({
            colonyId: `COL-${plateId}-1`,
            colonyNumber: 1,
            morphology: 'Circular, convex, smooth, shiny',
            color: 'Pink',
            hemolysis: 'Gamma',
            odor: 'Musty sweet',
            texture: 'Moist',
            organismStatus: 'None'
          });
        }
      }

      plates.push({
        plateId,
        plateBarcode,
        mediaName: media,
        mediaLot: `LOT-${dateFormatted}-${p}A`,
        mediaExpiry: `2026-12-${day}`,
        status,
        inoculation: {
          method: 'Loop streak isolation',
          loopSize: '10 uL',
          streakPattern: '4-Quadrant streak',
          timestamp: `${dateStr}T08:00:00Z`,
          bench: 'Bench-Micro-3',
          technician: 'Sarah Connor'
        },
        incubation: {
          incubatorId: `INC-0${1 + (i % 3)}`,
          chamber: `Chamber-${p}`,
          rack: `Rack-${p + 1}`,
          shelf: `Shelf-${p}`,
          tempCelsius: 37,
          co2Percentage: 5,
          humidityPercentage: 85,
          startDatetime: `${dateStr}T08:30:00Z`,
          expectedCompletionDatetime: `${dateStr}T20:30:00Z`,
          actualCompletionDatetime: status === 'Completed' ? `${dateStr}T20:00:00Z` : undefined
        },
        observations,
        colonies
      });
    }

    culturesDb.push({
      cultureId,
      cultureAccession,
      patientId: patient.patientId,
      patientName: `${patient.lastName}, ${patient.firstName}`,
      patientMrn: patient.mrn,
      orderId: `ORD-ID-${String(i).padStart(6, '0')}`,
      orderAccession: `ORD-${dateFormatted}-${String(i).padStart(6, '0')}`,
      specimenId,
      specimenBarcode,
      status: i % 5 === 0 ? 'Contaminated' : i % 3 === 0 ? 'Completed' : 'Incubating',
      plates,
      auditTrail: [
        {
          id: `AUD-${cultureId}-1`,
          timestamp: `${dateStr}T08:00:00Z`,
          performedBy: 'Sarah Connor',
          action: 'Registered culture set and prepared media.',
          source: 'CultureEngine'
        }
      ]
    });
  }
};

export const initializeMockCultureServer = () => {
  seedCultures();

  // 1. GET /cultures
  mockAdapter.register('GET', '/cultures', (queryParams: any) => {
    const {
      page = '1',
      limit = '10',
      search = '',
      status = 'All',
      sortBy = 'cultureAccession',
      sortOrder = 'desc',
    } = queryParams || {};

    let filtered = [...culturesDb];

    // Status filter
    if (status !== 'All') {
      filtered = filtered.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }

    // Search query matches
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.cultureAccession.toLowerCase().includes(q) ||
          c.patientMrn.toLowerCase().includes(q) ||
          c.patientName.toLowerCase().includes(q) ||
          c.specimenBarcode.toLowerCase().includes(q) ||
          c.plates.some((p) => p.plateBarcode.toLowerCase().includes(q) || p.mediaName.toLowerCase().includes(q))
      );
    }

    // Sorting
    filtered.sort((a: any, b: any) => {
      const aVal = a[sortBy] ?? '';
      const bVal = b[sortBy] ?? '';
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const p = parseInt(page, 10);
    const l = parseInt(limit, 10);
    const start = (p - 1) * l;
    const sliced = filtered.slice(start, start + l);

    return {
      cultures: sliced,
      total: filtered.length,
      page: p,
      limit: l,
    };
  });

  // 2. GET /cultures/:id
  mockAdapter.register('GET', '^/cultures/[a-zA-Z0-9\\-]+$', (_, url) => {
    const id = url?.split('/').pop();
    const culture = culturesDb.find((c) => c.cultureId === id);
    if (!culture) {
      throw { status: 404, message: 'Culture plate set not found.' };
    }
    return culture;
  });

  // 3. POST /cultures
  mockAdapter.register('POST', '/cultures', (body: any) => {
    const newIdx = culturesDb.length + 1;
    const dateFormatted = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const cultureAccession = `CUL-${dateFormatted}-${String(newIdx).padStart(6, '0')}`;
    const cultureId = `CUL-ID-${String(newIdx).padStart(6, '0')}`;

    const newCulture: Culture = {
      cultureId,
      cultureAccession,
      patientId: body.patientId,
      patientName: body.patientName || 'Demographics Unknown',
      patientMrn: body.patientMrn || 'MRN-UNKNOWN',
      orderId: body.orderId || 'ORD-UNKNOWN',
      orderAccession: body.orderAccession || 'ORD-UNKNOWN',
      specimenId: body.specimenId,
      specimenBarcode: body.specimenBarcode,
      status: 'Created',
      plates: (body.plates || []).map((p: any, idx: number) => ({
        plateId: `PLT-ID-${String(newIdx).padStart(4, '0')}-${idx + 1}`,
        plateBarcode: `PLT-${dateFormatted}-${String(newIdx).padStart(4, '0')}-${idx + 1}`,
        mediaName: p.mediaName || 'Blood Agar',
        mediaLot: p.mediaLot || 'LOT-TEMP-01',
        mediaExpiry: p.mediaExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Created',
        inoculation: p.inoculation || {
          method: 'Quadrant Streak',
          loopSize: '10uL',
          streakPattern: '4-Quadrant',
          timestamp: new Date().toISOString(),
          bench: 'Bench-Micro-3',
          technician: 'Sarah Connor'
        },
        incubation: p.incubation || {
          incubatorId: 'INC-01',
          chamber: 'Chamber-1',
          rack: 'Rack-1',
          shelf: 'Shelf-1',
          tempCelsius: 37,
          co2Percentage: 5,
          humidityPercentage: 85,
          startDatetime: new Date().toISOString(),
          expectedCompletionDatetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        observations: [],
        colonies: []
      })),
      auditTrail: [
        {
          id: `AUD-${cultureId}-1`,
          timestamp: new Date().toISOString(),
          performedBy: 'registrar_user',
          action: 'Created culture plate sets from accepted specimen.',
          source: 'CultureEngine'
        }
      ]
    };

    culturesDb.unshift(newCulture);

    // Notify Event Bus
    eventBus.publish('CULTURE_CREATED', newCulture);

    return newCulture;
  });

  // 4. POST /cultures/:id/plates/:plateId/observe
  mockAdapter.register('POST', '^/cultures/[a-zA-Z0-9\\-]+/plates/[a-zA-Z0-9\\-]+/observe$', (body: any, url) => {
    const parts = url?.split('/');
    const cultureId = parts?.[parts.length - 4];
    const plateId = parts?.[parts.length - 2];

    const cultureIdx = culturesDb.findIndex((c) => c.cultureId === cultureId);
    if (cultureIdx === -1) {
      throw { status: 404, message: 'Culture record not found.' };
    }

    const culture = culturesDb[cultureIdx];
    const plateIdx = culture.plates.findIndex((p) => p.plateId === plateId);
    if (plateIdx === -1) {
      throw { status: 404, message: 'Culture plate not found.' };
    }

    const plate = culture.plates[plateIdx];
    const obs = body.observation;
    const colonies = body.colonies || [];

    const newObs: PlateObservation = {
      id: `OBS-${plate.plateId}-${plate.observations.length + 1}`,
      timestamp: new Date().toISOString(),
      observer: 'tech_user',
      roundNumber: plate.observations.length + 1,
      growthLevel: obs.growthLevel || 'No Growth',
      comments: obs.comments || 'Colony assessment round.',
      attachmentIds: obs.attachmentIds || []
    };

    plate.observations.push(newObs);
    
    // Seed isolated colonies list
    plate.colonies = colonies.map((col: any, idx: number) => ({
      colonyId: `COL-${plate.plateId}-${plate.colonies.length + idx + 1}`,
      colonyNumber: plate.colonies.length + idx + 1,
      morphology: col.morphology || 'Punctiform, transparent',
      color: col.color || 'White',
      hemolysis: col.hemolysis || 'None',
      odor: col.odor,
      texture: col.texture,
      organismStatus: 'None'
    }));

    // Update status based on growth level
    const detected = obs.growthLevel !== 'No Growth' && obs.growthLevel !== 'No significant growth';
    plate.status = 'Completed';
    culture.status = detected ? 'Growth Detected' : 'No Growth';

    // Publish event
    eventBus.publish('OBSERVATION_RECORDED', { culture, plate, observation: newObs });
    if (detected) {
      eventBus.publish('GROWTH_DETECTED', { culture, plate });
    } else {
      eventBus.publish('NO_GROWTH', { culture, plate });
    }

    culturesDb[cultureIdx] = { ...culture };
    return culture;
  });

  // 5. POST /cultures/:id/plates/:plateId/contaminate
  mockAdapter.register('POST', '^/cultures/[a-zA-Z0-9\\-]+/plates/[a-zA-Z0-9\\-]+/contaminate$', (body: any, url) => {
    const parts = url?.split('/');
    const cultureId = parts?.[parts.length - 4];
    const plateId = parts?.[parts.length - 2];

    const cultureIdx = culturesDb.findIndex((c) => c.cultureId === cultureId);
    if (cultureIdx === -1) {
      throw { status: 404, message: 'Culture record not found.' };
    }

    const culture = culturesDb[cultureIdx];
    const plateIdx = culture.plates.findIndex((p) => p.plateId === plateId);
    if (plateIdx === -1) {
      throw { status: 404, message: 'Plate not found.' };
    }

    const plate = culture.plates[plateIdx];
    plate.status = 'Contaminated';
    culture.status = 'Contaminated';

    culture.auditTrail.push({
      id: `AUD-${culture.cultureId}-${culture.auditTrail.length + 1}`,
      timestamp: new Date().toISOString(),
      performedBy: 'tech_user',
      action: 'Flagged Contamination',
      source: 'ContaminationManagement',
      reason: `Source: ${body.source}. Severity: ${body.severity}. Action: ${body.action}`
    });

    eventBus.publish('CONTAMINATION_FOUND', { culture, plate });

    culturesDb[cultureIdx] = { ...culture };
    return culture;
  });

  // 6. POST /cultures/:id/plates/:plateId/status
  mockAdapter.register('POST', '^/cultures/[a-zA-Z0-9\\-]+/plates/[a-zA-Z0-9\\-]+/status$', (body: any, url) => {
    const parts = url?.split('/');
    const cultureId = parts?.[parts.length - 4];
    const plateId = parts?.[parts.length - 2];

    const cultureIdx = culturesDb.findIndex((c) => c.cultureId === cultureId);
    if (cultureIdx === -1) {
      throw { status: 404, message: 'Culture record not found.' };
    }

    const culture = culturesDb[cultureIdx];
    const plateIdx = culture.plates.findIndex((p) => p.plateId === plateId);
    if (plateIdx === -1) {
      throw { status: 404, message: 'Plate not found.' };
    }

    const plate = culture.plates[plateIdx];
    plate.status = body.status;
    
    if (body.status === 'Incubating') {
      plate.incubation = {
        ...plate.incubation,
        startDatetime: new Date().toISOString(),
        expectedCompletionDatetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      eventBus.publish('PLATE_INCUBATED', { culture, plate });
    }

    culturesDb[cultureIdx] = { ...culture };
    return culture;
  });
};

export default initializeMockCultureServer;
