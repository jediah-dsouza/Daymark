import { useId, type ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  titleLevel?: 1 | 2;
}

export function EmptyState({
  title,
  description,
  action,
  className = '',
  titleLevel = 2,
}: EmptyStateProps) {
  const generatedId = useId().replaceAll(':', '');
  const Title = titleLevel === 1 ? 'h1' : 'h2';
  return (
    <section
      className={['empty-state', className].filter(Boolean).join(' ')}
      aria-labelledby={`empty-${generatedId}`}
    >
      <span className="empty-state__rule" aria-hidden="true" />
      <div>
        <Title id={`empty-${generatedId}`}>{title}</Title>
        <p>{description}</p>
        {action && <div className="empty-state__action">{action}</div>}
      </div>
    </section>
  );
}
