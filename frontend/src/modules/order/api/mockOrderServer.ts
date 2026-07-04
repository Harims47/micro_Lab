import { mockAdapter } from '../../../infrastructure/http/mockAdapter';
import { TEST_CATALOG, type Order, type OrderTimelineEvent, type OrderAuditLog, type OrderPriority, type OrderStatus } from '../models/types';
import { mockPatients } from '../../../mock/mockData';

// Stateful mock order storage
let ordersDb: Order[] = [];

const seedOrders = () => {
  if (ordersDb.length > 0) return;

  const priorities: OrderPriority[] = ['Routine', 'Urgent', 'STAT', 'Emergency'];
  const statuses: OrderStatus[] = [
    'Submitted',
    'Accepted',
    'Specimen Awaiting',
    'Specimen Received',
    'In Progress',
    'Completed'
  ];
  const testCodes = ['MC-001', 'MC-002', 'MC-003', 'MC-004', 'MC-005'];
  const doctors = ['Dr. Gregory House', 'Dr. Sarah Connor', 'Dr. Elena Rostova', 'Dr. Allison Cameron'];

  for (let i = 1; i <= 150; i++) {
    const pIdx = i % mockPatients.length;
    const patient = mockPatients[pIdx] || mockPatients[0];
    const orderId = `ORD-ID-${String(i).padStart(6, '0')}`;
    const day = String(1 + (i % 28)).padStart(2, '0');
    const dateStr = `2026-07-${day}`;
    const dateFormatted = dateStr.replace(/-/g, '');
    const accessionNumber = `ORD-${dateFormatted}-${String(i).padStart(6, '0')}`;
    const priority = priorities[i % priorities.length];
    const status = statuses[i % statuses.length];
    const tests = [testCodes[i % testCodes.length]];
    if (i % 4 === 0) {
      tests.push(testCodes[(i + 1) % testCodes.length]);
    }
    const physician = doctors[i % doctors.length];

    const timeline: OrderTimelineEvent[] = [
      {
        id: `TL-${orderId}-1`,
        status: 'Draft',
        timestamp: `${dateStr}T08:00:00Z`,
        performedBy: 'registrar_user',
        notes: 'Draft initialized.'
      }
    ];

    if (status !== 'Draft') {
      timeline.push({
        id: `TL-${orderId}-2`,
        status: 'Submitted',
        timestamp: `${dateStr}T08:30:00Z`,
        performedBy: 'registrar_user',
        notes: 'Requisition submitted.'
      });
    }

    if (['Accepted', 'Specimen Awaiting', 'Specimen Received', 'In Progress', 'Completed'].includes(status)) {
      timeline.push({
        id: `TL-${orderId}-3`,
        status: 'Accepted',
        timestamp: `${dateStr}T09:00:00Z`,
        performedBy: 'supervisor_user',
        notes: 'Requisition accepted.'
      });
    }

    if (['Specimen Received', 'In Progress', 'Completed'].includes(status)) {
      timeline.push({
        id: `TL-${orderId}-4`,
        status: 'Specimen Received',
        timestamp: `${dateStr}T10:15:00Z`,
        performedBy: 'tech_user',
        notes: 'Specimen received in microbiology lab.'
      });
    }

    if (['In Progress', 'Completed'].includes(status)) {
      timeline.push({
        id: `TL-${orderId}-5`,
        status: 'In Progress',
        timestamp: `${dateStr}T11:00:00Z`,
        performedBy: 'tech_user',
        notes: 'Primary inoculation active.'
      });
    }

    if (status === 'Completed') {
      timeline.push({
        id: `TL-${orderId}-6`,
        status: 'Completed',
        timestamp: `${dateStr}T15:30:00Z`,
        performedBy: 'pathologist_user',
        notes: 'Final culture results validated.'
      });
    }

    const auditTrail: OrderAuditLog[] = [
      {
        id: `AUD-${orderId}-1`,
        timestamp: `${dateStr}T08:00:00Z`,
        performedBy: 'registrar_user',
        action: 'Created order requisition.',
      }
    ];

    ordersDb.push({
      orderId,
      accessionNumber,
      patientId: patient.patientId,
      patientMrn: patient.mrn,
      patientName: `${patient.lastName}, ${patient.firstName}`,
      physicianName: physician,
      clinicalInfo: i % 2 === 0 ? 'Patient displays acute UTI symptomatology.' : 'Suspected bacteremia. Rule out sepsis.',
      priority,
      status,
      requestedTests: tests,
      createdAt: `${dateStr}T08:00:00Z`,
      submittedAt: status !== 'Draft' ? `${dateStr}T08:30:00Z` : undefined,
      timeline,
      auditTrail,
      specimenIds: ['Specimen Received', 'In Progress', 'Completed'].includes(status) ? [`SPEC-ID-${String(i).padStart(6, '0')}`] : [],
      collectionStatus: ['Specimen Received', 'In Progress', 'Completed'].includes(status) ? 'Collected' : 'Pending',
    });
  }
};

export const initializeMockOrderServer = () => {
  seedOrders();

  // 1. GET /orders (with paging, search, and dynamic status filters)
  mockAdapter.register('GET', '/orders', (queryParams: any) => {
    const {
      page = '1',
      limit = '10',
      search = '',
      status = 'All',
      priority = 'All',
      physician = '',
      investigation = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryParams || {};

    let filtered = [...ordersDb];

    // Status filter
    if (status !== 'All') {
      filtered = filtered.filter((o) => o.status.toLowerCase() === status.toLowerCase());
    }

    // Priority filter
    if (priority !== 'All') {
      filtered = filtered.filter((o) => o.priority.toLowerCase() === priority.toLowerCase());
    }

    // Physician filter
    if (physician) {
      filtered = filtered.filter((o) => o.physicianName.toLowerCase().includes(physician.toLowerCase()));
    }

    // Investigation filter
    if (investigation) {
      filtered = filtered.filter((o) => o.requestedTests.some((t) => t.toLowerCase() === investigation.toLowerCase()));
    }

    // Search query matches
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.accessionNumber.toLowerCase().includes(q) ||
          o.patientMrn.toLowerCase().includes(q) ||
          o.patientName.toLowerCase().includes(q) ||
          o.physicianName.toLowerCase().includes(q) ||
          o.requestedTests.some((code) => {
            const test = TEST_CATALOG.find((cat) => cat.code === code);
            return test && (test.name.toLowerCase().includes(q) || test.code.toLowerCase().includes(q));
          })
      );
    }

    // Sort order
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
      orders: sliced,
      total: filtered.length,
      page: p,
      limit: l,
    };
  });

  // 2. GET /orders/:id
  mockAdapter.register('GET', '^/orders/[a-zA-Z0-9\\-]+$', (_, url) => {
    const id = url?.split('/').pop();
    const order = ordersDb.find((o) => o.orderId === id);
    if (!order) {
      throw { status: 404, message: 'Order requisition record not found.' };
    }
    return order;
  });

  // 3. POST /orders (create)
  mockAdapter.register('POST', '/orders', (body: any) => {
    const newIdx = ordersDb.length + 1;
    const dateFormatted = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const accessionNumber = `ORD-${dateFormatted}-${String(newIdx).padStart(6, '0')}`;
    const orderId = `ORD-ID-${String(newIdx).padStart(6, '0')}`;

    // Resolve patient details
    const patient = mockPatients.find((p) => p.patientId === body.patientId) || mockPatients[0];

    const newOrder: Order = {
      orderId,
      accessionNumber,
      patientId: body.patientId,
      patientMrn: patient.mrn,
      patientName: `${patient.lastName}, ${patient.firstName}`,
      physicianName: body.physicianName || 'Dr. Unknown',
      clinicalInfo: body.clinicalInfo || '',
      priority: body.priority || 'Routine',
      status: body.status || 'Submitted',
      requestedTests: body.requestedTests || [],
      createdAt: new Date().toISOString(),
      submittedAt: body.status === 'Submitted' ? new Date().toISOString() : undefined,
      timeline: [
        {
          id: `TL-${orderId}-1`,
          status: 'Draft',
          timestamp: new Date().toISOString(),
          performedBy: 'registrar_user',
          notes: 'Draft requisition initialized.'
        }
      ],
      auditTrail: [
        {
          id: `AUD-${orderId}-1`,
          timestamp: new Date().toISOString(),
          performedBy: 'registrar_user',
          action: 'Created order requisition.'
        }
      ]
    };

    if (newOrder.status === 'Submitted') {
      newOrder.timeline.push({
        id: `TL-${orderId}-2`,
        status: 'Submitted',
        timestamp: new Date().toISOString(),
        performedBy: 'registrar_user',
        notes: 'Requisition submitted.'
      });
    }

    ordersDb.unshift(newOrder);
    return newOrder;
  });

  // 4. PUT /orders/:id (edit/update)
  mockAdapter.register('PUT', '^/orders/[a-zA-Z0-9\\-]+$', (body: any, url) => {
    const id = url?.split('/').pop();
    const orderIdx = ordersDb.findIndex((o) => o.orderId === id);
    if (orderIdx === -1) {
      throw { status: 404, message: 'Order record not found.' };
    }

    const order = ordersDb[orderIdx];
    const updated: Order = {
      ...order,
      ...body,
      auditTrail: [
        ...order.auditTrail,
        {
          id: `AUD-${order.orderId}-${order.auditTrail.length + 1}`,
          timestamp: new Date().toISOString(),
          performedBy: 'registrar_user',
          action: 'Modified order attributes.',
          reason: body.amendmentReason || 'Order detail corrections.'
        }
      ]
    };

    // If status changed, push to timeline
    if (body.status && body.status !== order.status) {
      updated.timeline.push({
        id: `TL-${order.orderId}-${order.timeline.length + 1}`,
        status: body.status,
        timestamp: new Date().toISOString(),
        performedBy: 'registrar_user',
        notes: 'Status transition triggered.'
      });
    }

    ordersDb[orderIdx] = updated;
    return updated;
  });

  // 5. POST /orders/:id/cancel
  mockAdapter.register('POST', '^/orders/[a-zA-Z0-9\\-]+/cancel$', (body: any, url) => {
    const parts = url?.split('/');
    const id = parts?.[parts.length - 2];
    const orderIdx = ordersDb.findIndex((o) => o.orderId === id);
    if (orderIdx === -1) {
      throw { status: 404, message: 'Order record not found.' };
    }

    const order = ordersDb[orderIdx];
    const updated: Order = {
      ...order,
      status: 'Cancelled',
      timeline: [
        ...order.timeline,
        {
          id: `TL-${order.orderId}-${order.timeline.length + 1}`,
          status: 'Cancelled',
          timestamp: new Date().toISOString(),
          performedBy: 'supervisor_user',
          notes: body.reason || 'Requisition cancelled by supervisor.'
        }
      ],
      auditTrail: [
        ...order.auditTrail,
        {
          id: `AUD-${order.orderId}-${order.auditTrail.length + 1}`,
          timestamp: new Date().toISOString(),
          performedBy: 'supervisor_user',
          action: 'Cancelled order.',
          reason: body.reason || 'Cancellation request.'
        }
      ]
    };

    ordersDb[orderIdx] = updated;
    return updated;
  });

  // 6. POST /orders/bulk-update (bulk change priority / cancel)
  mockAdapter.register('POST', '/orders/bulk-update', (body: any) => {
    const { ids = [], updates = {} } = body || {};
    let count = 0;

    ordersDb = ordersDb.map((o) => {
      if (ids.includes(o.orderId)) {
        count++;
        const auditTrail = [...o.auditTrail];
        auditTrail.push({
          id: `AUD-${o.orderId}-${o.auditTrail.length + 1}`,
          timestamp: new Date().toISOString(),
          performedBy: 'supervisor_user',
          action: 'Bulk modified order parameters.',
          reason: 'Bulk operation override.'
        });

        const timeline = [...o.timeline];
        if (updates.status && updates.status !== o.status) {
          timeline.push({
            id: `TL-${o.orderId}-${o.timeline.length + 1}`,
            status: updates.status,
            timestamp: new Date().toISOString(),
            performedBy: 'supervisor_user',
            notes: 'Bulk status update.'
          });
        }

        return {
          ...o,
          ...updates,
          timeline,
          auditTrail
        };
      }
      return o;
    });

    return { count };
  });
};

export default initializeMockOrderServer;
