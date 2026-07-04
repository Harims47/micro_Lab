import React from 'react';

// ─── 404 ────────────────────────────────────────────────────────────────────

export const ErrorPage404: React.FC = () => (
  <ErrorPageShell
    code="404"
    emoji="🔍"
    title="Page Not Found"
    message="The page you're looking for doesn't exist or has been moved."
    action={{ label: 'Return to Dashboard', href: '/' }}
  />
);

// ─── 403 ────────────────────────────────────────────────────────────────────

export const ErrorPage403: React.FC = () => (
  <ErrorPageShell
    code="403"
    emoji="🔒"
    title="Access Denied"
    message="You don't have permission to access this resource. Contact your administrator if you believe this is an error."
    action={{ label: 'Return to Dashboard', href: '/' }}
  />
);

// ─── 500 ────────────────────────────────────────────────────────────────────

export const ErrorPage500: React.FC = () => (
  <ErrorPageShell
    code="500"
    emoji="⚠️"
    title="Server Error"
    message="An unexpected error occurred on our servers. The issue has been logged. Please try again shortly."
    action={{ label: 'Reload Page', onClick: () => window.location.reload() }}
  />
);

// ─── Generic ─────────────────────────────────────────────────────────────────

export const ErrorPageGeneric: React.FC<{ message?: string }> = ({ message }) => (
  <ErrorPageShell
    code="ERR"
    emoji="❌"
    title="Something Went Wrong"
    message={message ?? 'An unexpected error occurred. Please try again or contact support.'}
    action={{ label: 'Reload Page', onClick: () => window.location.reload() }}
  />
);

// ─── Shell ───────────────────────────────────────────────────────────────────

interface ErrorPageShellProps {
  code: string;
  emoji: string;
  title: string;
  message: string;
  action: { label: string; href?: string; onClick?: () => void };
}

const ErrorPageShell: React.FC<ErrorPageShellProps> = ({ code, emoji, title, message, action }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '3rem 2rem',
      textAlign: 'center',
      backgroundColor: 'var(--color-surface-base)',
      color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-sans)',
      gap: '1.25rem',
    }}
  >
    <div style={{ fontSize: '3.5rem' }}>{emoji}</div>
    <p
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        fontWeight: 700,
        letterSpacing: '0.15em',
        color: 'var(--color-brand-primary)',
        margin: 0,
        textTransform: 'uppercase',
      }}
    >
      Error {code}
    </p>
    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{title}</h1>
    <p
      style={{
        color: 'var(--color-text-secondary)',
        maxWidth: '480px',
        lineHeight: 1.6,
        margin: 0,
        fontSize: '0.95rem',
      }}
    >
      {message}
    </p>
    {action.href ? (
      <a
        href={action.href}
        style={actionStyle}
      >
        {action.label}
      </a>
    ) : (
      <button onClick={action.onClick} style={actionStyle}>
        {action.label}
      </button>
    )}
  </div>
);

const actionStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 28px',
  backgroundColor: 'var(--color-brand-primary)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '0.9rem',
  textDecoration: 'none',
  marginTop: '0.5rem',
};
