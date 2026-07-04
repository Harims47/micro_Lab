import React, { useState, useEffect, useCallback } from 'react';
import type { Attachment, AttachmentCategory } from '../../services/platform/attachmentService';
import { attachmentService } from '../../services/platform/attachmentService';
import { usePermission } from '../../infrastructure/permissions/usePermission';
import { Permission } from '../../infrastructure/permissions/constants';
import { useNotification } from '../../infrastructure/notifications/useNotification';
import { Button } from '../Foundation/Button';
import { Card } from '../Layout/Card';

interface AttachmentPanelProps {
  entityId: string;
}

export const AttachmentPanel: React.FC<AttachmentPanelProps> = ({ entityId }) => {
  const { hasPermission } = usePermission();
  const { addToast } = useNotification();
  const canUpload = hasPermission(Permission.ATTACHMENT_UPLOAD);
  const canDelete = hasPermission(Permission.ATTACHMENT_DELETE);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  // Upload states
  const [selectedCategory, setSelectedCategory] = useState<AttachmentCategory>('Images');
  const [versionOpen, setVersionOpen] = useState<string | null>(null);

  const fetchFiles = useCallback(() => {
    setAttachments(attachmentService.getAttachments(entityId));
  }, [entityId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Mock File Upload Handler
  const handleSimulateUpload = (filename: string) => {
    if (!canUpload) {
      addToast('error', 'Unauthorized to upload attachments.');
      return;
    }
    const fakeFile = {
      filename,
      sizeBytes: Math.floor(100000 + Math.random() * 800000), // ~100KB to 900KB
      category: selectedCategory,
    };
    attachmentService.uploadAttachment(entityId, fakeFile, 'tech_user');
    addToast('success', `Uploaded file ${filename} to category ${selectedCategory}.`);
    fetchFiles();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleSimulateUpload(file.name);
    }
  };

  const handleDelete = (id: string) => {
    if (!canDelete) {
      addToast('error', 'Unauthorized to delete attachments.');
      return;
    }
    attachmentService.deleteAttachment(entityId, id);
    addToast('success', 'Attachment deleted.');
    fetchFiles();
  };

  return (
    <Card style={styles.container}>
      <h4 style={styles.title}>Attachments Framework</h4>

      {/* Drag & Drop Zone */}
      {canUpload && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            ...styles.dropzone,
            borderColor: dragActive ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
            backgroundColor: dragActive ? 'var(--color-brand-secondary-bg)' : 'transparent',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Drag and drop lab files here, or
          </p>
          <div style={styles.uploadControls}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as AttachmentCategory)}
              className="lims-input"
              style={styles.categorySelect}
            >
              <option value="Images">Images</option>
              <option value="PDFs">PDFs</option>
              <option value="Reports">Reports</option>
              <option value="External Documents">External Documents</option>
              <option value="Quality Documents">Quality Documents</option>
              <option value="Instrument Files">Instrument Files</option>
              <option value="Other">Other</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                const name = prompt('Simulate uploading file by typing filename:', 'culture_growth_plate_01.png');
                if (name) handleSimulateUpload(name);
              }}
            >
              Select File
            </Button>
          </div>
        </div>
      )}

      {/* Attachment List */}
      <div style={styles.fileList}>
        {attachments.length === 0 ? (
          <p style={{ margin: 0, font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
            No laboratory documents uploaded yet.
          </p>
        ) : (
          attachments.map((file) => (
            <div key={file.id} style={styles.fileItem}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong>{file.filename}</strong>
                  <span style={styles.catBadge}>{file.category}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'gray', marginTop: '2px' }}>
                  Size: {(file.sizeBytes / 1024).toFixed(1)} KB | Uploaded by: {file.uploadedBy} (v{file.version})
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {file.history.length > 0 && (
                  <Button variant="outline" onClick={() => setVersionOpen(versionOpen === file.id ? null : file.id)}>
                    Versions
                  </Button>
                )}
                <Button variant="outline" onClick={() => addToast('success', `Downloading file: ${file.filename}`)}>
                  Download
                </Button>
                {canDelete && (
                  <Button variant="outline" onClick={() => handleDelete(file.id)} style={{ color: 'var(--color-status-danger)' }}>
                    Delete
                  </Button>
                )}
              </div>

              {/* Version History Sub-panel */}
              {versionOpen === file.id && (
                <div style={styles.versionPanel}>
                  <strong style={{ fontSize: '0.72rem' }}>Version History Logs</strong>
                  {file.history.map((hist, idx) => (
                    <div key={idx} style={styles.historyRow}>
                      <span>v{hist.version} | {hist.filename}</span>
                      <span style={{ fontSize: '0.68rem', color: 'gray' }}>
                        {new Date(hist.timestamp).toLocaleString()} by {hist.uploadedBy}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  title: {
    font: 'var(--type-heading-item)',
    margin: 0,
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: '4px',
  },
  dropzone: {
    border: '2px dashed var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--spacing-md)',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  uploadControls: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  categorySelect: {
    height: '32px',
    padding: '0 8px',
  },
  fileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
  },
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '8px',
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-xs)',
    gap: '8px',
    position: 'relative',
  },
  catBadge: {
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'var(--color-brand-secondary-bg)',
    color: 'var(--color-brand-primary)',
    fontSize: '0.65rem',
    fontWeight: 'bold',
  },
  versionPanel: {
    width: '100%',
    marginTop: '6px',
    borderTop: '1px solid var(--color-border-default)',
    paddingTop: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  historyRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.7rem',
    padding: '2px 0',
    color: 'var(--color-text-secondary)',
  },
};
export default AttachmentPanel;
