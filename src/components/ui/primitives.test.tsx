import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import { CheckboxField } from './CheckboxField';
import { EmptyState } from './EmptyState';
import { InlineNotice } from './InlineNotice';
import { SelectField } from './SelectField';
import { TextField } from './TextField';

describe('shared accessible UI primitives', () => {
  it('keeps an action disabled and announces its busy state while loading', () => {
    render(<Button loading>Save changes</Button>);
    const button = screen.getByRole('button', { name: 'Save changes' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('links field guidance and validation feedback to its native input', () => {
    render(
      <TextField
        id="task-title"
        label="Task name"
        required
        hint="Use a clear action and subject."
        error="Task names must contain at least 2 characters."
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Task name' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'task-title-hint task-title-error');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Task names must contain at least 2 characters.',
    );
  });

  it('supports native checkbox and select input interaction', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <>
        <CheckboxField label="Show completed tasks" defaultChecked />
        <SelectField
          label="Priority"
          defaultValue="medium"
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
          onChange={onChange}
        />
      </>,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Show completed tasks' });
    const select = screen.getByRole('combobox', { name: 'Priority' });
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    await user.selectOptions(select, 'high');
    expect(select).toHaveValue('high');
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('exposes the correct live-region role for notice intent', () => {
    render(
      <>
        <InlineNotice intent="success">Your changes are saved.</InlineNotice>
        <InlineNotice intent="danger">Your changes could not be saved.</InlineNotice>
      </>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Your changes are saved.');
    expect(screen.getByRole('alert')).toHaveTextContent('Your changes could not be saved.');
  });

  it('gives an empty result a named region and an operable next action', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <EmptyState
        title="No tasks match"
        description="Clear a filter to see more work."
        action={<Button onClick={onClick}>Clear filters</Button>}
      />,
    );
    expect(screen.getByRole('region', { name: 'No tasks match' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
