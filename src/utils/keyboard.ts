import type { KeyboardEvent } from 'react';

export function closeDisclosureOnEscape(event: KeyboardEvent<HTMLDetailsElement>) {
  if (event.key !== 'Escape' || !event.currentTarget.open) return;

  event.preventDefault();
  event.stopPropagation();
  event.currentTarget.open = false;
  event.currentTarget.querySelector('summary')?.focus({ preventScroll: true });
}
