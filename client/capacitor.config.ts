import { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor configuration for Synccos Check Writer.
 *
 * Development tip:
 *   To enable live-reload against a running dev server, set the CAPACITOR_DEV_SERVER_URL
 *   environment variable before running `npx cap sync`, or temporarily uncomment the
 *   `server.url` block below and replace the URL with your actual dev server address
 *   (e.g. the Replit dev URL or your local IP).
 *
 *   IMPORTANT: Remove / comment out `server.url` before creating production builds so
 *   the app uses the bundled web assets instead of a remote URL.
 */

const devServerUrl = process.env.CAPACITOR_DEV_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.synccos.checkwriter',
  appName: 'Synccos Check Writer',
  webDir: 'build',
  ios: {
    path: '../mobile/ios',
  },
  android: {
    path: '../mobile/android',
  },
  server: {
    androidScheme: 'https',
    // When CAPACITOR_DEV_SERVER_URL is set, point native apps at the live dev server
    // (enables hot-reload during development). Leave unset for production builds so the
    // app loads from bundled assets (relative paths).
    ...(devServerUrl ? { url: devServerUrl, cleartext: true } : {}),
  },
};

export default config;
