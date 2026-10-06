import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'aria-label'
> {
  label: string;
  icon: ReactNode;
  variant?: 'default' | 'quiet' | 'danger';
}

export function IconButton({
  label,
  icon,
  variant = 'default',
  title,
  className = '',
  type = 'button',
  ...props
}: IconButtonProps) {
  const classes = ['icon-control', 'icon-button', `icon-button--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button {...props} type={type} className={classes} aria-label={label} title={title ?? label}>
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
