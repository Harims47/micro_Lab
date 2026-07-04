import { httpClient } from '../../../infrastructure/http/httpClient';
import type { QCSample, QCInstrument, QCReagent, QCEvent } from '../models/types';

export class QcService {
  static async getSamples(): Promise<QCSample[]> {
    const res = await httpClient.get<QCSample[]>('/qc/samples');
    return res.data;
  }

  static async scheduleSample(sample: Partial<QCSample>): Promise<QCSample> {
    const res = await httpClient.post<QCSample>('/qc/samples', sample);
    return res.data;
  }

  static async updateSampleStatus(sampleId: string, status: QCSample['status'], findings?: string): Promise<QCSample> {
    const res = await httpClient.post<QCSample>(`/qc/samples/${sampleId}/status`, { status, findings });
    return res.data;
  }

  static async getInstruments(): Promise<QCInstrument[]> {
    const res = await httpClient.get<QCInstrument[]>('/qc/instruments');
    return res.data;
  }

  static async calibrateInstrument(id: string): Promise<QCInstrument> {
    const res = await httpClient.post<QCInstrument>(`/qc/instruments/${id}/calibrate`, {});
    return res.data;
  }

  static async scheduleMaintenance(id: string, date: string): Promise<QCInstrument> {
    const res = await httpClient.post<QCInstrument>(`/qc/instruments/${id}/maintenance/schedule`, { date });
    return res.data;
  }

  static async completeMaintenance(id: string): Promise<QCInstrument> {
    const res = await httpClient.post<QCInstrument>(`/qc/instruments/${id}/maintenance/complete`, {});
    return res.data;
  }

  static async getReagents(): Promise<QCReagent[]> {
    const res = await httpClient.get<QCReagent[]>('/qc/reagents');
    return res.data;
  }

  static async registerReagent(reagent: Partial<QCReagent>): Promise<QCReagent> {
    const res = await httpClient.post<QCReagent>('/qc/reagents', reagent);
    return res.data;
  }

  static async getEvents(): Promise<QCEvent[]> {
    const res = await httpClient.get<QCEvent[]>('/qc/events');
    return res.data;
  }
}

export default QcService;
