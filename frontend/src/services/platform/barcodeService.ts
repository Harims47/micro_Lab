import { eventBus } from './eventBus';

export type BarcodeLabelTemplate =
  | 'Specimen Label'
  | 'Culture Plate Label'
  | 'Aliquot Label'
  | 'Archive Label'
  | 'Transport Label';

export interface BarcodePrintPayload {
  barcode: string;
  template: BarcodeLabelTemplate;
  patientName: string;
  patientMrn: string;
  testName: string;
  workstation: string;
  user: string;
  reason?: string;
  isReplacement: boolean;
}

export class BarcodeService {
  private static printLogs: any[] = [];

  /**
   * Generates a specimen barcode ID.
   */
  static generateSpecimenBarcode(index: number): string {
    const dateFormatted = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `SPC-${dateFormatted}-${String(index).padStart(6, '0')}`;
  }

  /**
   * Generates a QR Code endpoint lookup value.
   */
  static generateQRValue(barcode: string): string {
    return `https://lims.hospital.org/specimen/${barcode}`;
  }

  /**
   * Simulates label printing to physical lab barcode scanner printer.
   */
  static printLabel(payload: BarcodePrintPayload): void {
    const printLog = {
      id: `PRT-AUD-${this.printLogs.length + 1}`,
      timestamp: new Date().toISOString(),
      ...payload,
    };
    
    this.printLogs.push(printLog);

    // Publish print event to Event Bus
    eventBus.publish('BARCODE_PRINTED', printLog);
  }

  /**
   * Retrieves label print logs.
   */
  static getPrintHistory(barcode: string): any[] {
    return this.printLogs.filter((p) => p.barcode === barcode);
  }
}
export default BarcodeService;
