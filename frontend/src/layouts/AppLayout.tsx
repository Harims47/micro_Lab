import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useGlobalState } from '../providers/GlobalStateProvider';

import { 
  Menu, X, Sun, Moon, Search, Keyboard, AlertTriangle, CheckCircle, 
  ShieldAlert, User as UserIcon, LogOut, Layers, LayoutDashboard,
  Users, ShoppingCart, TestTube, Microscope, Columns, Award, Settings, 
  History, BarChart3, Wifi, Key
} from 'lucide-react';
import { useSearch } from '../infrastructure/search';
import { useAuth } from '../infrastructure/auth';
import { ChangePasswordDialog, SessionExpiredDialog } from '../components/Overlay';

// Navigation routes array
const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Patients', path: '/patient', icon: Users },
  { name: 'Orders', path: '/orders', icon: ShoppingCart },
  { name: 'Specimens', path: '/specimen', icon: TestTube },
  { name: 'Cultures', path: '/culture', icon: Columns },
  { name: 'Organisms', path: '/organism', icon: Microscope },
  { name: 'AST Results', path: '/ast', icon: Layers },
  { name: 'Validations', path: '/validation', icon: ShieldAlert },
  { name: 'Reports', path: '/reports', icon: Award },
  { name: 'Quality Control', path: '/qc', icon: CheckCircle },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Audit Logs', path: '/audit', icon: History },
  { name: 'Admin Console', path: '/admin', icon: Settings }
];

export const AppLayout: React.FC = () => {
  const {
    currentUser,
    activeRole,
    theme,
    isSidebarOpen,
    toasts,
    commandPaletteOpen,
    toggleTheme,
    setSidebarOpen,
    setCommandPaletteOpen,
    dismissToast,
    specimens,
    patients
  } = useGlobalState();

  const location = useLocation();
  const navigate = useNavigate();
  
  // Consume our Search and Auth Frameworks
  const { query, results, setQuery, registerSearchProvider } = useSearch();
  const { sessionState, logout: authLogout } = useAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // 1. Register Navigation search provider
  useEffect(() => {
    return registerSearchProvider({
      name: 'Navigation Search Provider',
      category: 'navigation',
      search: async (q) => {
        const val = q.trim().toLowerCase();
        if (!val) return [];
        return navigationItems
          .filter((item) => item.name.toLowerCase().includes(val))
          .map((item) => ({
            id: `nav-${item.name}`,
            category: 'navigation',
            title: `Go to ${item.name}`,
            subtitle: 'Navigation',
            url: item.path,
          }));
      },
    });
  }, [registerSearchProvider]);

  // 2. Register Specimen search provider
  useEffect(() => {
    return registerSearchProvider({
      name: 'Specimen Search Provider',
      category: 'specimen',
      search: async (q) => {
        const val = q.trim().toLowerCase();
        if (!val) return [];
        return specimens
          .filter((spec) => 
            spec.accessionNumber.toLowerCase().includes(val) || 
            spec.specimenId.toLowerCase().includes(val)
          )
          .map((spec) => ({
            id: `spec-${spec.specimenId}`,
            category: 'specimen',
            title: `Specimen: ${spec.accessionNumber} (${spec.specimenType})`,
            subtitle: 'Specimen ID',
            url: '/specimen',
          }));
      },
    });
  }, [specimens, registerSearchProvider]);

  // 3. Register Patient search provider
  useEffect(() => {
    return registerSearchProvider({
      name: 'Patient Search Provider',
      category: 'patient',
      search: async (q) => {
        const val = q.trim().toLowerCase();
        if (!val) return [];
        return patients
          .filter((pat) => {
            const fullName = `${pat.firstName} ${pat.lastName}`;
            return fullName.toLowerCase().includes(val) || pat.mrn.toLowerCase().includes(val);
          })
          .map((pat) => ({
            id: `pat-${pat.mrn}`,
            category: 'patient',
            title: `Patient: ${pat.firstName} ${pat.lastName} (${pat.mrn})`,
            subtitle: 'Patient MRN',
            url: '/patient',
          }));
      },
    });
  }, [patients, registerSearchProvider]);

  // Reset search query whenever command palette is closed
  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery('');
    }
  }, [commandPaletteOpen, setQuery]);

  // Breadcrumbs calculation
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return ['Dashboard'];
    const segment = path.split('/')[1];
    const navItem = navigationItems.find(item => item.path.includes(segment));
    return ['Portal', navItem ? navItem.name : segment];
  };

  // Keyboard shortcut listener for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  return (
    <div style={layoutStyles.shell}>
      {/* 1. Sidebar Panel */}
      <aside style={{ ...layoutStyles.sidebar, width: isSidebarOpen ? '260px' : '0px', padding: isSidebarOpen ? 'var(--spacing-md)' : '0px' }}>
        {isSidebarOpen && (
          <div style={layoutStyles.sidebarInner}>
            <div style={layoutStyles.sidebarHeader}>
              <span style={layoutStyles.logoEmblem}>☣</span>
              <div>
                <h2 style={layoutStyles.sidebarTitle}>MicroLIMS</h2>
                <span style={layoutStyles.sidebarVersion}>v1.0 Baseline</span>
              </div>
            </div>

            <nav style={layoutStyles.nav}>
              {navigationItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={idx}
                    to={item.path}
                    style={{
                      ...layoutStyles.navLink,
                      backgroundColor: isActive ? 'var(--color-brand-primary)' : 'transparent',
                      color: isActive ? 'white' : 'var(--color-text-primary)'
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </aside>

      <div style={layoutStyles.mainArea}>
        {/* 2. Header Dashboard Bar */}
        <header style={layoutStyles.header}>
          <div style={layoutStyles.headerLeft}>
            <button style={layoutStyles.iconBtn} onClick={() => setSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {/* Breadcrumb Indicator */}
            <div style={layoutStyles.breadcrumbs}>
              {getBreadcrumbs().map((b, idx, arr) => (
                <span key={idx} style={layoutStyles.breadcrumbNode}>
                  <span style={idx === arr.length - 1 ? layoutStyles.bcActive : {}}>{b}</span>
                  {idx < arr.length - 1 && <span style={layoutStyles.bcDivider}>/</span>}
                </span>
              ))}
            </div>
          </div>

          <div style={layoutStyles.headerRight}>
            {/* Search Trigger */}
            <button style={layoutStyles.searchTrigger} onClick={() => setCommandPaletteOpen(true)}>
              <Search size={16} />
              <span style={layoutStyles.searchText}>Search (Ctrl+K)</span>
            </button>

            {/* Theme Swapper */}
            <button style={layoutStyles.iconBtn} onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Profile badge widget */}
            {currentUser && (
              <div style={layoutStyles.profileWidget}>
                <div style={layoutStyles.profileAvatar}>
                  <UserIcon size={16} />
                </div>
                <div style={layoutStyles.profileInfo}>
                  <span style={layoutStyles.profileName}>{currentUser.name}</span>
                  <span style={layoutStyles.profileRole}>{activeRole}</span>
                </div>
                <button
                  style={{ ...layoutStyles.logoutBtn, marginRight: 'var(--spacing-2xs)', border: '1px solid var(--color-border-default)' }}
                  onClick={() => setChangePasswordOpen(true)}
                  title="Change Password"
                >
                  <Key size={14} />
                </button>
                <button style={layoutStyles.logoutBtn} onClick={authLogout} title="Sign Out">
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* 3. Action Context Bar */}
        <div style={layoutStyles.contextBar}>
          <span style={layoutStyles.contextText}>System Mode: <strong>Frontend Mock Engine active</strong>. No backend connection required.</span>
        </div>

        {/* 4. Active Outlet container */}
        <main style={layoutStyles.contentContainer}>
          <Outlet />
        </main>

        {/* 5. Footer Compliance panel */}
        <footer style={layoutStyles.footer}>
          <div style={layoutStyles.footerLeft}>
            <Award size={14} style={{ color: 'var(--color-status-success)' }} />
            <span>CAP Certified #459201</span>
            <span style={layoutStyles.footerDivider}>|</span>
            <span>CLIA Compliant</span>
          </div>
          <div style={layoutStyles.footerRight}>
            <Wifi size={14} style={{ color: 'var(--color-status-success)' }} />
            <span>Operational Mode: Online</span>
            <span style={layoutStyles.footerDivider}>|</span>
            <span>Database Schema: v1.0.0</span>
          </div>
        </footer>
      </div>

      {/* 6. Notifications Toast Overlay */}
      <div style={layoutStyles.toastContainer}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              ...layoutStyles.toastCard,
              borderColor:
                toast.type === 'success'
                  ? 'var(--color-status-success)'
                  : toast.type === 'warning'
                  ? 'var(--color-status-warning)'
                  : 'var(--color-status-danger)',
              backgroundColor: 'var(--color-surface-raised)'
            }}
          >
            <div style={layoutStyles.toastIcon}>
              {toast.type === 'success' ? (
                <CheckCircle size={18} style={{ color: 'var(--color-status-success)' }} />
              ) : toast.type === 'warning' ? (
                <AlertTriangle size={18} style={{ color: 'var(--color-status-warning)' }} />
              ) : (
                <ShieldAlert size={18} style={{ color: 'var(--color-status-danger)' }} />
              )}
            </div>
            <div style={layoutStyles.toastMessage}>{toast.message}</div>
            <button style={layoutStyles.toastDismiss} onClick={() => dismissToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* 7. Global Command Palette Modal Overlay */}
      {commandPaletteOpen && (
        <div style={layoutStyles.modalBackdrop} onClick={() => setCommandPaletteOpen(false)}>
          <div style={layoutStyles.commandPalette} onClick={(e) => e.stopPropagation()}>
            <div style={layoutStyles.cpHeader}>
              <Search size={18} style={{ color: 'var(--color-text-secondary)' }} />
              <input
                type="text"
                placeholder="Type MRN, Accession Number, or navigation target..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={layoutStyles.cpInput}
                autoFocus
              />
              <button style={layoutStyles.cpClose} onClick={() => setCommandPaletteOpen(false)}>
                <Keyboard size={16} /> ESC
              </button>
            </div>
            
            <div style={layoutStyles.cpResults}>
              {results.length === 0 ? (
                <div style={layoutStyles.cpEmpty}>
                  {query.trim() ? 'No matching records found' : 'Search registry items...'}
                </div>
              ) : (
                results.map((res, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setCommandPaletteOpen(false);
                      navigate(res.url);
                    }}
                    style={layoutStyles.cpItem}
                  >
                    <span style={layoutStyles.cpItemType}>{res.subtitle}</span>
                    <span style={layoutStyles.cpItemTitle}>{res.title}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reusable Authentication Change Password Dialog */}
      <ChangePasswordDialog
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />

      {/* Decoupled Idle Session Warning Modal */}
      <SessionExpiredDialog
        isOpen={sessionState === 'IDLE_WARNING'}
        onClose={() => {}}
      />
    </div>
  );
};

const layoutStyles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    position: 'relative'
  },
  sidebar: {
    backgroundColor: 'var(--color-surface-raised)',
    borderRight: '1px solid var(--color-border-default)',
    transition: 'width var(--motion-duration-medium) var(--motion-ease-standard)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  sidebarInner: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '228px', // Fit within width boundaries
    gap: 'var(--spacing-md)'
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    paddingBottom: 'var(--spacing-sm)',
    borderBottom: '1px solid var(--color-border-default)'
  },
  logoEmblem: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: 'var(--color-brand-primary)'
  },
  sidebarTitle: {
    font: 'var(--type-heading-subsection)',
    color: 'var(--color-text-primary)',
    fontSize: '1rem',
    fontWeight: 600
  },
  sidebarVersion: {
    font: 'var(--type-body-small)',
    fontSize: '0.7rem',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flexGrow: 1,
    overflowY: 'auto'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    font: 'var(--type-body-small)',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'background-color var(--motion-duration-fast) var(--motion-ease-standard)'
  },
  roleSwitcher: {
    marginTop: 'auto',
    borderTop: '1px solid var(--color-border-default)',
    paddingTop: 'var(--spacing-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2xs)'
  },
  switcherLabel: {
    font: 'var(--type-body-small)',
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
    fontWeight: 600,
    textTransform: 'uppercase'
  },
  switcherSelect: {
    padding: '6px 10px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border-default)',
    backgroundColor: 'var(--color-surface-base)',
    color: 'var(--color-text-primary)',
    font: 'var(--type-body-small)',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  mainArea: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0 // Prevent table layouts flex expansions
  },
  header: {
    height: '60px',
    backgroundColor: 'var(--color-surface-raised)',
    borderBottom: '1px solid var(--color-border-default)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 var(--spacing-lg)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)'
  },
  iconBtn: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color var(--motion-duration-fast) var(--motion-ease-standard)'
  },
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2xs)',
    font: 'var(--type-body-small)',
    color: 'var(--color-text-secondary)'
  },
  breadcrumbNode: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2xs)'
  },
  bcDivider: {
    fontSize: '0.75rem',
    color: 'var(--color-text-disabled)'
  },
  bcActive: {
    color: 'var(--color-text-primary)',
    fontWeight: 600
  },
  segmentedControl: {
    display: 'flex',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: '2px',
    backgroundColor: 'var(--color-surface-base)'
  },
  segBtn: {
    padding: '4px 8px',
    fontSize: '0.7rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: '2px',
    cursor: 'pointer',
    textTransform: 'uppercase'
  },
  searchTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    padding: '6px 12px',
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
    transition: 'border-color var(--motion-duration-fast) var(--motion-ease-standard)'
  },
  searchText: {
    font: 'var(--type-body-small)',
    fontSize: '0.75rem'
  },
  profileWidget: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    borderLeft: '1px solid var(--color-border-default)',
    paddingLeft: 'var(--spacing-md)'
  },
  profileAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: 'var(--radius-circular)',
    backgroundColor: 'var(--color-brand-primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  profileName: {
    font: 'var(--type-body-small)',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--color-text-primary)'
  },
  profileRole: {
    font: 'var(--type-body-small)',
    fontSize: '0.65rem',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  logoutBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-status-danger)',
    cursor: 'pointer',
    padding: '4px',
    marginLeft: 'var(--spacing-2xs)'
  },
  contextBar: {
    backgroundColor: 'var(--color-status-info-bg)',
    borderBottom: '1px solid var(--color-status-info)',
    padding: '6px var(--spacing-lg)',
    textAlign: 'center'
  },
  contextText: {
    font: 'var(--type-body-small)',
    color: 'var(--color-status-info)',
    fontSize: '0.75rem'
  },
  contentContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: 'var(--color-surface-base)'
  },
  footer: {
    height: '36px',
    backgroundColor: 'var(--color-surface-raised)',
    borderTop: '1px solid var(--color-border-default)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 var(--spacing-lg)',
    font: 'var(--type-body-small)',
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)'
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)'
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)'
  },
  footerDivider: {
    color: 'var(--color-border-default)'
  },
  toastContainer: {
    position: 'absolute',
    top: '72px',
    right: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
    zIndex: 999
  },
  toastCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    borderLeft: '4px solid',
    boxShadow: 'var(--elevation-2)',
    minWidth: '280px',
    maxWidth: '400px'
  },
  toastIcon: {
    display: 'flex',
    alignItems: 'center'
  },
  toastMessage: {
    font: 'var(--type-body-small)',
    color: 'var(--color-text-primary)',
    fontWeight: 500,
    flexGrow: 1
  },
  toastDismiss: {
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    padding: '2px'
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: '15vh',
    zIndex: 1000
  },
  commandPalette: {
    width: '100%',
    maxWidth: '560px',
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--elevation-3)',
    overflow: 'hidden'
  },
  cpHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    padding: '12px 16px',
    borderBottom: '1px solid var(--color-border-default)'
  },
  cpInput: {
    flexGrow: 1,
    border: 'none',
    backgroundColor: 'transparent',
    font: 'var(--type-body-default)',
    color: 'var(--color-text-primary)',
    outline: 'none'
  },
  cpClose: {
    fontSize: '0.7rem',
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    padding: '2px 6px',
    borderRadius: 'var(--radius-xs)',
    color: 'var(--color-text-secondary)',
    fontWeight: 600,
    cursor: 'pointer'
  },
  cpResults: {
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '8px 0'
  },
  cpEmpty: {
    padding: '24px',
    textAlign: 'center',
    font: 'var(--type-body-small)',
    color: 'var(--color-text-secondary)'
  },
  cpItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    padding: '10px 16px',
    cursor: 'pointer',
    transition: 'background-color var(--motion-duration-fast) var(--motion-ease-standard)'
  },
  cpItemType: {
    font: 'var(--type-body-small)',
    fontSize: '0.7rem',
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    padding: '2px 6px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-secondary)',
    fontWeight: 600
  },
  cpItemTitle: {
    font: 'var(--type-body-default)',
    color: 'var(--color-text-primary)'
  }
};
