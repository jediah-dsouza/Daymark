import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { NativeDialog } from './NativeDialog';

function DialogHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>
      <NativeDialog
        open={open}
        labelledBy="dialog-heading"
        initialFocusSelector="#dialog-close"
        onRequestClose={() => setOpen(false)}
      >
        <h2 id="dialog-heading">Keyboard focus test</h2>
        <button id="dialog-close" type="button" onClick={() => setOpen(false)}>
          Close dialog
        </button>
      </NativeDialog>
    </>
  );
}

describe('NativeDialog focus management', () => {
  it('restores focus to the opener after closing the native modal', async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);

    const opener = screen.getByRole('button', { name: 'Open dialog' });
    await user.click(opener);
    const dialog = screen.getByRole('dialog', { name: 'Keyboard focus test' });
    const closeButton = screen.getByRole('button', { name: 'Close dialog' });
    await waitFor(() => expect(closeButton).toHaveFocus());

    await user.click(closeButton);
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    await waitFor(() => expect(opener).toHaveFocus());
  });
});
