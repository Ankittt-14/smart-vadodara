import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/report', label: 'Report Issue', icon: 'report_problem' },
  { path: '/processing', label: 'AI Processing', icon: 'memory' },
  { path: '/ward-dashboard', label: 'Ward Dashboard', icon: 'location_city' },
  { path: '/outcome', label: 'Public Outcome', icon: 'visibility' },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();

  const getRoleIcon = () => {
    if (user?.role === 'admin') return 'admin_panel_settings';
    if (user?.role === 'ward_officer') return 'engineering';
    return 'person';
  };

  const getRoleBadgeStyle = () => {
    if (user?.role === 'admin') return 'bg-tertiary-container text-on-tertiary-container';
    if (user?.role === 'ward_officer') return 'bg-primary-container text-on-primary-container';
    return 'bg-secondary-container text-on-secondary-container';
  };

  return (
    <div>
      <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col border-r border-outline-variant/30">
        <div className="px-gutter py-margin-desktop flex items-center gap-base mb-margin-desktop">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-on-primary shrink-0">
            <span className="material-symbols-outlined text-[20px]">location_city</span>
          </div>
          <span className="font-headline-md text-headline-md text-primary tracking-tight">VMC Civic AI</span>
        </div>
        <nav className="flex-1 px-base space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center px-gutter py-3 transition-all rounded-lg font-label-md ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              <span className="material-symbols-outlined mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-gutter pb-gutter text-label-sm font-label-sm text-on-surface-variant/70">
          Smart Vadodara &middot; Secure Auth System
        </div>
      </aside>
      <div className="pl-72">
        <header className="fixed top-0 left-72 right-0 h-20 bg-surface/80 backdrop-blur-xl z-40 flex items-center justify-end px-margin-desktop gap-gutter border-b border-outline-variant/20">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>

          {!token ? (
            <Link
              to="/login"
              className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-full shadow-md hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Sign In / Register
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-full shadow-sm">
                <div className={`w-8 h-8 rounded-full ${getRoleBadgeStyle()} flex items-center justify-center font-label-md shadow-sm`}>
                  <span className="material-symbols-outlined text-[18px]">{getRoleIcon()}</span>
                </div>
                <div className="flex flex-col text-left hidden sm:flex pr-1">
                  <span className="text-label-md font-label-md text-on-surface leading-tight">{user.name}</span>
                  <span className="text-[11px] font-label-sm text-primary leading-none uppercase tracking-wider">{user.title || user.role}</span>
                </div>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                title="Sign Out"
                className="px-3 py-1.5 bg-surface-container hover:bg-error-container hover:text-on-error-container text-on-surface-variant font-label-md text-label-md rounded-full border border-outline-variant/30 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </header>
        <main className="pt-20 min-h-screen bg-background p-margin-desktop">{children}</main>
      </div>
    </div>
  );
}
