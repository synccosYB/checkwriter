// The current letter template is a check summary, not the original check PDF.
// Keep ordering disabled until a verified check document pipeline replaces it.
export function assertLobCheckMailingReady() {
  const error = new Error('Check mailing is temporarily paused while we verify the printed check document. No new Lob mailing order has been created.');
  error.statusCode = 503;
  throw error;
}
