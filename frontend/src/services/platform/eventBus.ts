export type PlatformEventName =
  | 'SPECIMEN_CREATED'
  | 'SPECIMEN_RECEIVED'
  | 'SPECIMEN_REJECTED'
  | 'ORDER_COMPLETED'
  | 'TASK_ASSIGNED'
  | 'TASK_COMPLETED'
  | 'BARCODE_PRINTED'
  | 'ATTACHMENT_UPLOADED'
  | 'NOTE_CREATED'
  | 'AUDIT_CREATED'
  | 'PLATE_CREATED'
  | 'PLATE_INCUBATED'
  | 'OBSERVATION_DUE'
  | 'OBSERVATION_COMPLETED'
  | 'COLONY_CREATED'
  | 'COLONY_UPDATED'
  | 'ORGANISM_PENDING'
  | 'INCUBATION_OVERDUE'
  | 'CULTURE_CREATED'
  | 'MEDIA_PREPARED'
  | 'INOCULATION_COMPLETED'
  | 'INCUBATION_STARTED'
  | 'OBSERVATION_RECORDED'
  | 'GROWTH_DETECTED'
  | 'NO_GROWTH'
  | 'CONTAMINATION_FOUND'
  | 'CULTURE_COMPLETED'
  | 'COLONY_SELECTED'
  | 'IDENTIFICATION_ATTEMPT_CREATED'
  | 'IDENTIFICATION_QC_VERIFIED'
  | 'IDENTIFICATION_ESCALATED'
  | 'IDENTIFICATION_SUPERSEDED'
  | 'GRAM_STAIN_COMPLETED'
  | 'BIOCHEMICAL_TEST_COMPLETED'
  | 'IDENTIFICATION_APPROVED'
  | 'IDENTIFICATION_REJECTED'
  | 'ORGANISM_IDENTIFIED'
  | 'AST_REQUESTED'
  | 'AST_CREATED'
  | 'AST_UPDATED'
  | 'AST_PANEL_ASSIGNED'
  | 'AST_COMPLETED'
  | 'AST_REQUIRES_REVIEW'
  | 'AST_APPROVED'
  | 'AST_REJECTED'
  | 'TECHNICAL_VALIDATION_COMPLETED'
  | 'QC_VALIDATION_COMPLETED'
  | 'CLINICAL_VALIDATION_COMPLETED'
  | 'PATHOLOGIST_APPROVED'
  | 'VALIDATION_REJECTED'
  | 'RETURNED_FOR_CORRECTION'
  | 'LAB_RESULT_READY_FOR_RELEASE';

type EventCallback = (data: any) => void;

class EventBusService {
  private listeners: Map<PlatformEventName, EventCallback[]> = new Map();

  /**
   * Subscribe to a platform event.
   * Returns an unsubscribe function.
   */
  subscribe(event: PlatformEventName, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    return () => {
      const current = this.listeners.get(event);
      if (current) {
        this.listeners.set(
          event,
          current.filter((cb) => cb !== callback)
        );
      }
    };
  }

  /**
   * Publish data payload to all subscribers of a platform event.
   */
  publish(event: PlatformEventName, data: any): void {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error(`[EventBus] Callback failed for event ${event}`, err);
        }
      });
    }
  }
}

export const eventBus = new EventBusService();
export default eventBus;
