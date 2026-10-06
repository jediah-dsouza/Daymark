import { useEffect, useState } from 'react';
import {
  CalendarDays,
  CheckSquare2,
  ChevronRight,
  FolderKanban,
  Moon,
  Monitor,
  Plus,
  Search,
  Settings2,
  Sun,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppProvider';
import { IconButton } from '../ui/IconButton';
import { InlineNotice } from '../ui/InlineNotice';
import type { ThemePreference } from '../../types';

const navigation = [
  { to: '/today', label: 'Today', icon: CalendarDays, key: 'today' },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare2, key: 'tasks' },
  { to: '/projects', label: 'Projects', icon: FolderKanban, key: 'projects' },
] as const;

const themeNext: Record<ThemePreference, ThemePreference> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};
const themeLabel: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

function DaymarkMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 17h18M7 17a5 5 0 0 1 10 0M12 6v2M5.7 9.7l1.4 1.4m11.2-1.4-1.4 1.4" />
    </svg>
  );
}

function WorkspaceLinks() {
  const { data } = useApp();
  const projects = data.projects.filter((project) => !project.archived);
  return (
    <div className="sidebar-projects" aria-label="Your projects">
      {projects.map((project) => (
        <Link
          className="project-shortcut"
          key={project.id}
          to={`/projects/${project.id}`}
          title={project.name}
        >
          <span className={`project-dot project-dot--${project.colorToken}`} aria-hidden="true" />
          <span className="project-shortcut__name">{project.name}</span>
          <ChevronRight className="project-shortcut__arrow" size={13} aria-hidden="true" />
        </Link>
      ))}
      {projects.length === 0 && <p className="sidebar-note">Your projects will appear here.</p>}
    </div>
  );
}

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label={mobile ? 'Primary mobile navigation' : 'Primary navigation'}
      className={mobile ? 'primary-nav primary-nav--mobile' : 'primary-nav'}
    >
      {navigation.map(({ to, label, icon: Icon, key }) => {
        const active =
          key === 'today'
            ? pathname === '/' || pathname === '/today'
            : key === 'tasks'
              ? pathname.startsWith('/tasks')
              : pathname.startsWith('/projects');
        return (
          <NavLink
            key={to}
            to={key === 'today' && pathname === '/' ? '/' : to}
            end={key === 'today'}
            className={`primary-nav__link${active ? ' is-active' : ''}`}
          >
            <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        );
      })}
      {mobile && (
        <NavLink
          to="/settings"
          aria-current={pathname === '/settings' ? 'page' : undefined}
          className={`primary-nav__link${pathname === '/settings' ? ' is-active' : ''}`}
        >
          <Settings2 size={18} strokeWidth={1.7} aria-hidden="true" />
          <span>Settings</span>
        </NavLink>
      )}
    </nav>
  );
}

function ThemeControl() {
  const { data, updatePreferences } = useApp();
  const theme = data.preferences.theme;
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const next = themeNext[theme];
  return (
    <IconButton
      label={`Theme: ${themeLabel[theme]}. Switch to ${themeLabel[next].toLowerCase()} theme.`}
      title={`Theme: ${themeLabel[theme]}`}
      icon={<Icon size={17} strokeWidth={1.7} />}
      onClick={() => updatePreferences({ theme: next })}
    />
  );
}

function PageContext() {
  const { pathname } = useLocation();
  const label = pathname.startsWith('/tasks')
    ? 'Tasks'
    : pathname.startsWith('/projects')
      ? 'Projects'
      : pathname === '/settings'
        ? 'Settings'
        : 'Today';
  return <span className="topbar-context">{label}</span>;
}

export function AppShell() {
  const { persistenceStatus, storageMessage, recoveryMessage, retryPersistence } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select, [contenteditable="true"], dialog[open]') !== null
      ) {
        return;
      }
      event.preventDefault();
      navigate('/tasks?focusSearch=1');
    };
    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, [navigate]);

  useEffect(() => {
    if (storageMessage || recoveryMessage) setNotice(storageMessage ?? recoveryMessage);
    else setNotice(null);
  }, [storageMessage, recoveryMessage]);

  const handleRetry = () => {
    if (retryPersistence()) setNotice('Your workspace is saved in this browser.');
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <aside className="sidebar" aria-label="Daymark workspace navigation">
        <Link className="brand" to="/today" aria-label="Daymark, Today">
          <DaymarkMark />
          <span>daymark</span>
        </Link>
        <p className="nav-overline">Workspace</p>
        <NavigationLinks />
        <div className="sidebar-section-heading">
          <span>Your projects</span>
          <Link to="/projects" aria-label="All projects" title="All projects">
            <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <WorkspaceLinks />
        <div className="sidebar-footer">
          <NavLink
            to="/settings"
            aria-current={pathname === '/settings' ? 'page' : undefined}
            className={`settings-link${pathname === '/settings' ? ' is-active' : ''}`}
          >
            <Settings2 size={17} strokeWidth={1.7} aria-hidden="true" />
            <span>Settings</span>
          </NavLink>
          <div className="workspace-caption">
            <span className="status-dot" aria-hidden="true" />
            Local workspace
          </div>
        </div>
      </aside>

      <div className="app-main-column">
        <header className="topbar">
          <Link className="brand brand--mobile" to="/today" aria-label="Daymark, Today">
            <DaymarkMark />
            <span>daymark</span>
          </Link>
          <div className="topbar-left">
            <PageContext />
          </div>
          <div className="topbar-actions">
            <Link
              className="icon-control"
              to="/tasks?focusSearch=1"
              aria-label="Search tasks and projects"
              title="Search work"
            >
              <Search size={17} strokeWidth={1.7} aria-hidden="true" />
            </Link>
            <Link
              className="icon-control"
              to="/today?quick=add"
              aria-label="Quick add task"
              title="Quick add task"
            >
              <Plus size={16} strokeWidth={2} aria-hidden="true" />
            </Link>
            <ThemeControl />
          </div>
        </header>
        {notice && (
          <InlineNotice
            className={`persistence-notice${persistenceStatus === 'memory-only' ? ' persistence-notice--error' : ''}`}
            intent={
              persistenceStatus === 'memory-only' ? 'danger' : recoveryMessage ? 'warning' : 'info'
            }
          >
            <span>{notice}</span>
            {persistenceStatus === 'memory-only' && (
              <button className="text-action" type="button" onClick={handleRetry}>
                Retry saving
              </button>
            )}
          </InlineNotice>
        )}
        <main id="main-content" className="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      <div className="mobile-navigation">
        <NavigationLinks mobile />
      </div>
    </div>
  );
}
