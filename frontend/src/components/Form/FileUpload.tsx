import React, { useState, useRef } from 'react';
import './Form.css';

export interface FileUploadProps {
  label: string;
  accept?: string;
  maxSizeMb?: number;
  onFileSelect: (file: File) => void;
  description?: string;
  error?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  maxSizeMb = 5,
  onFileSelect,
  description,
  error: parentError,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndProcessFile = (file: File) => {
    setLocalError(null);
    
    // Size check
    if (file.size > maxSizeMb * 1024 * 1024) {
      setLocalError(`ERR-014: File size exceeds the maximum limit of ${maxSizeMb}MB.`);
      return;
    }

    // Type check (if accept is defined)
    if (accept) {
      const fileType = file.type;
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());
      
      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return fileExtension === type;
        }
        if (type.endsWith('/*')) {
          const mimeGroup = type.replace('/*', '');
          return fileType.startsWith(mimeGroup);
        }
        return fileType === type;
      });

      if (!isAccepted) {
        setLocalError(`Invalid file format. Approved formats: ${accept}`);
        return;
      }
    }

    setFileName(file.name);
    
    // Simulate upload progress
    setProgress(0);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        onFileSelect(file);
      }
    }, 100);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const error = localError || parentError;

  return (
    <div className={`lims-form-group ${className}`}>
      <span className="lims-form-label">{label}</span>
      {description && <span className="lims-form-desc">{description}</span>}
      
      <div
        className={`lims-file-drop ${dragActive ? 'lims-file-drop-active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onButtonClick();
          }
        }}
        aria-describedby="upload-description"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          style={{ display: 'none' }}
        />
        <div style={{ fontSize: '1.75rem', marginBottom: 'var(--spacing-xs)' }}>📤</div>
        <p style={{ font: 'var(--type-body-default)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {fileName ? `Selected: ${fileName}` : 'Drag & Drop files here, or Click to select'}
        </p>
        <span id="upload-description" style={{ font: 'var(--type-body-small)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          Maximum file size: {maxSizeMb}MB. {accept ? `Allowed types: ${accept}` : ''}
        </span>

        {progress !== null && (
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <span style={{ font: 'var(--type-body-small)', fontSize: '0.75rem', color: 'var(--color-status-success)' }}>
              {progress < 100 ? `Analyzing: ${progress}%` : 'File Ready'}
            </span>
            <div className="lims-file-progress-bar">
              <div className="lims-file-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {error && (
        <span className="lims-form-error-msg" role="alert">
          <span>⚠️</span> {error}
        </span>
      )}
    </div>
  );
};
