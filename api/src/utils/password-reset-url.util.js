const DEFAULT_PASSWORD_RESET_BASE_URL = 'https://check-writer.synccos.com';

export function getPasswordResetUrl(token) {
  const configuredBaseUrl =
    process.env.PASSWORD_RESET_BASE_URL ||
    DEFAULT_PASSWORD_RESET_BASE_URL;

  let baseUrl;
  try {
    baseUrl = new URL(configuredBaseUrl);
  } catch {
    console.error(
      'Invalid password reset base URL; using the production Check Writer URL.'
    );
    baseUrl = new URL(DEFAULT_PASSWORD_RESET_BASE_URL);
  }

  baseUrl.pathname = '/auth/reset-password';
  baseUrl.search = '';
  baseUrl.hash = '';
  baseUrl.searchParams.set('token', token.toString());

  return baseUrl.toString();
}
