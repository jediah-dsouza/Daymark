import { useEffect, useRef, useState, type RefObject } from 'react';
import { Filter, Search, X } from 'lucide-react';
import type { Project, TaskFilters } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { IconButton } from '../../../components/ui/IconButton';
import { SelectField } from '../../../components/ui/SelectField';
import { activeTaskFilterCount, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '../selectors';

const statusOptions = Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const priorityOptions = Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const sortOptions = [
  { value: 'dueDate', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'createdAt', label: 'Recently created' },
  { value: 'title', label: 'Title' },
];

export function TaskToolbar({
  filters,
  projects,
  searchRef,
  onChange,
  onClearFilters,
  onClearAll,
  showProjectFilter = true,
}: {
  filters: TaskFilters;
  projects: Project[];
  searchRef: RefObject<HTMLInputElement | null>;
  onChange: (patch: Partial<TaskFilters>) => void;
  onClearFilters: () => void;
  onClearAll: () => void;
  showProjectFilter?: boolean;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRoot = useRef<HTMLDivElement>(null);
  const filterTrigger = useRef<HTMLButtonElement>(null);
  const activeFilters = activeTaskFilterCount(filters);
  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: `${project.name}${project.archived ? ' (archived)' : ''}`,
  }));
  const activeFilterLabels = [
    ...(filters.status === 'all' ? [] : [`Status: ${TASK_STATUS_LABELS[filters.status]}`]),
    ...(filters.priority === 'all' ? [] : [`Priority: ${TASK_PRIORITY_LABELS[filters.priority]}`]),
    ...(filters.projectId === 'all'
      ? []
      : [
          `Project: ${
            filters.projectId === 'unassigned'
              ? 'No project'
              : (projects.find((project) => project.id === filters.projectId)?.name ??
                'Unknown project')
          }`,
        ]),
  ];

  useEffect(() => {
    if (!filterOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!filterRoot.current?.contains(event.target as Node)) setFilterOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setFilterOpen(false);
        filterTrigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [filterOpen]);

  return (
    <section className="task-toolbar" aria-label="Task search and filters">
      <div className="task-toolbar__search-group">
        <label className="visually-hidden" htmlFor="tasks-search">
          Search tasks and projects
        </label>
        <span className="task-search__icon" aria-hidden="true">
          <Search size={17} strokeWidth={1.8} />
        </span>
        <input
          ref={searchRef}
          id="tasks-search"
          className="field__input task-search__input"
          type="search"
          autoComplete="off"
          placeholder="Search titles, descriptions, projects…"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
        />
        {filters.search && (
          <IconButton
            className="task-search__clear"
            label="Clear search"
            title="Clear search"
            variant="quiet"
            icon={<X size={16} aria-hidden="true" />}
            onClick={() => {
              onChange({ search: '' });
              searchRef.current?.focus();
            }}
          />
        )}
        <span
          className="task-search__shortcut"
          aria-label="Keyboard shortcut: Control or Command plus K"
        >
          Ctrl/⌘ K
        </span>
      </div>

      <div className="task-toolbar__controls">
        <div className="task-filter" ref={filterRoot}>
          <button
            ref={filterTrigger}
            type="button"
            className={`button button--${activeFilters > 0 ? 'secondary' : 'quiet'} button--medium`}
            aria-expanded={filterOpen}
            aria-controls="task-filter-panel"
            onClick={() => setFilterOpen((open) => !open)}
          >
            <Filter size={16} aria-hidden="true" />
            <span>Filters{activeFilters > 0 ? ` · ${activeFilters} active` : ''}</span>
          </button>
          {filterOpen && (
            <div
              id="task-filter-panel"
              className="task-filter__panel"
              role="group"
              aria-label="Task filters"
            >
              <div className="task-filter__heading">
                <h2>Filter tasks</h2>
                {activeFilters > 0 && (
                  <Button variant="quiet" size="small" onClick={onClearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
              <SelectField
                id="filter-task-status"
                label="Status"
                placeholder="All statuses"
                options={statusOptions}
                value={filters.status === 'all' ? '' : filters.status}
                onChange={(event) =>
                  onChange({ status: (event.target.value || 'all') as TaskFilters['status'] })
                }
              />
              <SelectField
                id="filter-task-priority"
                label="Priority"
                placeholder="All priorities"
                options={priorityOptions}
                value={filters.priority === 'all' ? '' : filters.priority}
                onChange={(event) =>
                  onChange({ priority: (event.target.value || 'all') as TaskFilters['priority'] })
                }
              />
              {showProjectFilter && (
                <SelectField
                  id="filter-task-project"
                  label="Project"
                  placeholder="All projects"
                  options={[{ value: 'unassigned', label: 'No project' }, ...projectOptions]}
                  value={filters.projectId === 'all' ? '' : filters.projectId}
                  onChange={(event) =>
                    onChange({
                      projectId: (event.target.value || 'all') as TaskFilters['projectId'],
                    })
                  }
                />
              )}
            </div>
          )}
        </div>
        <SelectField
          id="task-sort"
          label="Sort by"
          options={sortOptions}
          value={filters.sort}
          wrapperClassName="task-sort"
          onChange={(event) => onChange({ sort: event.target.value as TaskFilters['sort'] })}
        />
        {(filters.search.trim() || activeFilters > 0) && (
          <Button
            variant="quiet"
            size="small"
            className="task-toolbar__clear-all"
            onClick={onClearAll}
          >
            Clear all
          </Button>
        )}
      </div>
      {activeFilters > 0 && (
        <p className="task-active-filters" aria-label="Active filters">
          <span>Filters:</span> {activeFilterLabels.join(' · ')}
        </p>
      )}
    </section>
  );
}
