import React from 'react';
import './Foundation.css';

export interface AvatarProps {
  name: string;
  src?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, className = '' }) => {
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className={`lims-avatar ${className}`} title={name} aria-label={name}>
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};
