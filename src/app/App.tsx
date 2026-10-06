import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { TodayPage } from '../features/today/TodayPage';
import { TaskDetailPage } from '../features/tasks/TaskDetailPage';
import { TasksPage } from '../features/tasks/TasksPage';
import { ProjectDetailPage } from '../features/projects/ProjectDetailPage';
import { ProjectsPage } from '../features/projects/ProjectsPage';
import { SettingsPage } from '../features/settings/SettingsPage';

function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page not found — Daymark';
  }, []);

  return (
    <div className="page-scaffold">
      <div className="page-heading">
        <p className="page-eyebrow">Not found</p>
        <h1>This page isn’t here.</h1>
        <p className="page-description">
          The link may be out of date. Choose Today, Tasks, or Projects to continue.
        </p>
      </div>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<TodayPage />} />
        <Route path="/today" element={<TodayPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
