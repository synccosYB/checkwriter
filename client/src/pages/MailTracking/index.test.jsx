import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route } from 'react-router-dom';
import MailTrackingPage from './index';
import { shippingClient } from '../../API/shipping/shippingClient';

jest.mock('../../API/shipping/shippingClient', () => ({ shippingClient: { get: jest.fn() } }));

test('structured API errors remain readable and a retry can recover the tracking page', async () => {
  shippingClient.get.mockRejectedValueOnce({ response: { data: { error: {
    userMessage: 'Letter not found in the configured Lob account.', statusCode: 404, developerMessage: 'Not found',
  } } } }).mockResolvedValueOnce({ data: { id: 'ltr_missing', mail_type: 'usps_first_class', events: [] } });
  render(<MemoryRouter initialEntries={['/tracking/ltr_missing']}>
    <Route path="/tracking/:lobId"><MailTrackingPage /></Route>
  </MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Letter not found in the configured Lob account.');
  expect(screen.getByRole('button', { name: 'Back to All Orders' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('Letter Tracking')).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
