import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LobRecovery from './LobRecovery';
import { shippingClient } from '../../../API/shipping/shippingClient';

jest.mock('../../../API/shipping/shippingClient', () => ({ shippingClient: { get: jest.fn(), post: jest.fn() } }));
const row = { sourceLobId: 'ltr_original', checkId: 'check1', ownerId: 'owner1', ownerType: 'user',
  createdAt: '2026-10-29T12:00:00Z', state: 'Prepared', pdfSha256: 'reviewed-sha',
  snapshot: { checkNumber: 123, payeeName: 'TEST PAYEE', amount: 12.34 } };
beforeEach(() => { jest.clearAllMocks(); shippingClient.get.mockResolvedValue({ data: { records: [row] } }); shippingClient.post.mockResolvedValue({ data: {} }); });

test('preparation never dispatches a check and final submission requires operator review and confirmation', async () => {
  render(<LobRecovery />);
  expect(await screen.findByText(/Check 123/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Review resend (0)' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Prepare PDF', exact: true }));
  await waitFor(() => expect(shippingClient.post).toHaveBeenCalledWith('/lob-recovery/ltr_original/prepare'));
  await waitFor(() => expect(screen.getByRole('checkbox')).toBeEnabled());
  expect(shippingClient.post.mock.calls.some(([url]) => url.endsWith('/submit'))).toBe(false);
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Review resend (1)' }));
  expect(await screen.findByText('Print and mail 1 reviewed replacement checks?')).toBeVisible();
  expect(shippingClient.post.mock.calls.some(([url]) => url.endsWith('/submit'))).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Confirm print and mail' }));
  await waitFor(() => expect(shippingClient.post).toHaveBeenCalledWith('/lob-recovery/ltr_original/submit', {
    pdfSha256: 'reviewed-sha', confirmation: 'PRINT_AND_MAIL_THE_REVIEWED_CHECK',
  }));
});

test('an uncertain provider outcome is visible and cannot be selected for another resend', async () => {
  shippingClient.get.mockResolvedValue({ data: { records: [{ ...row, state: 'Needs reconciliation', failure: 'Provider outcome uncertain.' }] } });
  render(<LobRecovery />);
  expect(await screen.findByText('Provider outcome uncertain.')).toBeVisible();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Prepare PDF', exact: true })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Review resend (0)' })).toBeDisabled();
});

test('reconciliation checks provider records without creating another mailing', async () => {
  shippingClient.get.mockResolvedValue({ data: { records: [{ ...row, state: 'Needs reconciliation' }] } });
  render(<LobRecovery />);
  fireEvent.click(await screen.findByRole('button', { name: 'Reconcile provider response' }));
  fireEvent.click(screen.getByRole('button', { name: 'Reconcile without sending' }));
  await waitFor(() => expect(shippingClient.post).toHaveBeenCalledWith('/lob-recovery/ltr_original/reconcile', {}));
  expect(shippingClient.post.mock.calls.some(([url]) => url.endsWith('/submit'))).toBe(false);
});
