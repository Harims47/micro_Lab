import { eventBus } from './eventBus';

export type AttachmentCategory =
  | 'Images'
  | 'PDFs'
  | 'Reports'
  | 'External Documents'
  | 'Quality Documents'
  | 'Instrument Files'
  | 'Other';

export interface Attachment {
  id: string;
  filename: string;
  category: AttachmentCategory;
  url: string;
  sizeBytes: number;
  uploadedBy: string;
  timestamp: string;
  version: number;
  history: {
    version: number;
    filename: string;
    timestamp: string;
    uploadedBy: string;
  }[];
}

class AttachmentServiceStore {
  private attachments: Map<string, Attachment[]> = new Map(); // Key is entityId (e.g. specimenId)

  /**
   * Fetch attachments linked to a LIMS record entity.
   */
  getAttachments(entityId: string): Attachment[] {
    return this.attachments.get(entityId) || [];
  }

  /**
   * Simulates uploading a new attachment or version.
   */
  uploadAttachment(
    entityId: string,
    file: { filename: string; sizeBytes: number; category: AttachmentCategory },
    user: string
  ): Attachment {
    const list = this.getAttachments(entityId);
    const existingIdx = list.findIndex(
      (a) => a.filename === file.filename && a.category === file.category
    );

    let updatedAttachment: Attachment;
    const now = new Date().toISOString();

    if (existingIdx !== -1) {
      // Create new version
      const old = list[existingIdx];
      const newVersion = old.version + 1;
      updatedAttachment = {
        ...old,
        version: newVersion,
        sizeBytes: file.sizeBytes,
        uploadedBy: user,
        timestamp: now,
        history: [
          ...old.history,
          {
            version: old.version,
            filename: old.filename,
            timestamp: old.timestamp,
            uploadedBy: old.uploadedBy,
          },
        ],
      };
      list[existingIdx] = updatedAttachment;
    } else {
      // Create new attachment
      updatedAttachment = {
        id: `ATT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        filename: file.filename,
        category: file.category,
        url: '#', // Simulated download
        sizeBytes: file.sizeBytes,
        uploadedBy: user,
        timestamp: now,
        version: 1,
        history: [],
      };
      list.push(updatedAttachment);
    }

    this.attachments.set(entityId, list);

    // Notify Event Bus
    eventBus.publish('ATTACHMENT_UPLOADED', {
      entityId,
      attachment: updatedAttachment,
    });

    return updatedAttachment;
  }

  /**
   * Delete an attachment.
   */
  deleteAttachment(entityId: string, attachmentId: string): void {
    const list = this.getAttachments(entityId);
    this.attachments.set(
      entityId,
      list.filter((a) => a.id !== attachmentId)
    );
  }
}

export const attachmentService = new AttachmentServiceStore();
export default attachmentService;
