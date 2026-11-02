export function assertLobCheckStockReady() {
  const error = new Error('Check mailing is on hold until Lob confirms a supported check-stock printing workflow. No new mailing order was created.');
  error.statusCode = 503;
  throw error;
}
