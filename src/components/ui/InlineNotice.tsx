import type { HTMLAttributes, ReactNode } from 'react';

export interface InlineNoticeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  intent?: 'info' | 'success' | 'warning' | 'danger';
  children: ReactNode;
}

export function InlineNotice({
  intent = 'info',
  className = '',
  children,
  ...props
}: InlineNoticeProps) {
  const classes = ['inline-notice', `inline-notice--${intent}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <div {...props} className={classes} role={intent === 'danger' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
