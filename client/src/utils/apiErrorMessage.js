// API errors can be plain strings or { error: { userMessage, ... } }.
// Return only displayable text; never pass a response object to React.
export function apiErrorMessage(error, fallback = 'An error occurred. Please try again.') {
  const data = error?.response?.data;
  const candidates = [data?.error?.userMessage, data?.userMessage,
    data?.error?.message, data?.error, data?.message, error?.message];
  return candidates.find(value => typeof value === 'string' && value.trim()) || fallback;
}
