import assert from 'node:assert/strict';
import test from 'node:test';
import { getPasswordResetUrl } from './password-reset-url.util.js';

const ENVIRONMENT_VARIABLES = [
  'PASSWORD_RESET_BASE_URL',
  'FRONTEND_URL',
];

function withCleanEnvironment(callback) {
  const originalValues = Object.fromEntries(
    ENVIRONMENT_VARIABLES.map((name) => [name, process.env[name]])
  );

  for (const name of ENVIRONMENT_VARIABLES) delete process.env[name];

  try {
    callback();
  } finally {
    for (const [name, value] of Object.entries(originalValues)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

test('uses the Check Writer production domain by default', () => {
  withCleanEnvironment(() => {
    process.env.FRONTEND_URL =
      'https://temporary-preview.riker.replit.dev';

    assert.equal(
      getPasswordResetUrl('abc.def'),
      'https://check-writer.synccos.com/auth/reset-password?token=abc.def'
    );
  });
});

test('uses a server-configured password reset domain', () => {
  withCleanEnvironment(() => {
    process.env.PASSWORD_RESET_BASE_URL = 'https://staging.example.com/old-path';

    assert.equal(
      getPasswordResetUrl('token value'),
      'https://staging.example.com/auth/reset-password?token=token+value'
    );
  });
});
