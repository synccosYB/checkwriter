import 'dotenv/config';
import express, { type RequestHandler, type ErrorRequestHandler, type Router } from 'express';
import config from 'config';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { IAppConfig } from './types/config.ts/index.js';
import { logger, installConsoleGate } from './utils/logger.js';

installConsoleGate();

type RoutesRegistrar = (target: Router | express.Express, expressModule: typeof express) => void;

declare module 'config' {
  interface IConfig extends IAppConfig {}
}

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

const port = isProduction ? (process.env.PORT || 5000) : (config.port || 7777);

type AppState = 'starting' | 'ready' | 'failed';
let appState: AppState = 'starting';
let appError: string | null = null;

app.get('/api/health-check', (_req, res) => {
  const status = appState === 'ready' ? 200 : appState === 'starting' ? 503 : 503;
  res.status(status).json({ status: appState, ...(appError ? { error: appError } : {}) });
});
app.get('/health-check', (_req, res) => {
  const status = appState === 'ready' ? 200 : appState === 'starting' ? 503 : 503;
  res.status(status).json({ status: appState, ...(appError ? { error: appError } : {}) });
});

app.use((req, res, next) => {
  if (appState === 'ready') return next();
  if (req.path === '/api/health-check' || req.path === '/health-check') return next();
  if (appState === 'starting') {
    res.status(503).send('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Starting Up</title></head><body><h1>Application is starting up</h1><p>Please wait, the server is initializing. This page will refresh automatically.</p><script>setTimeout(()=>location.reload(),5000)</script></body></html>');
  } else {
    const safeError = (appError || 'Unknown error').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    res.status(503).send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Service Unavailable</title></head><body><h1>Service Unavailable</h1><p>The application failed to start.</p><p>Reason: ${safeError}</p><p>Please contact the administrator or try again later.</p><script>setTimeout(()=>location.reload(),15000)</script></body></html>`);
  }
});

const server = app.listen(port, () => {
  logger.info('listening on port', port);
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

app.disable('etag');
app.use(cookieParser());
app.use(
  bodyParser.json({
    limit: '50mb',
    verify: function (req: any, res, buf) {
      if (
        req.originalUrl.startsWith('/stripe/webhook') ||
        req.originalUrl.startsWith('/api/stripe/webhook') ||
        req.originalUrl.startsWith('/stripe/payment-link/webhooks') ||
        req.originalUrl.startsWith('/api/stripe/payment-link/webhooks') ||
        req.originalUrl.startsWith('/managesubscription/webhook') ||
        req.originalUrl.startsWith('/api/managesubscription/webhook') ||
        req.originalUrl.startsWith('/managesubscription/payment-links/webhook') ||
        req.originalUrl.startsWith('/api/managesubscription/payment-links/webhook') ||
        req.originalUrl.startsWith('/lob/webhookEvents') ||
        req.originalUrl.startsWith('/api/lob/webhookEvents') ||
        req.originalUrl.startsWith('/carrier-shipment/webhookEvents') ||
        req.originalUrl.startsWith('/api/carrier-shipment/webhookEvents')
      ) {
        req.rawBody = buf.toString();
      }
    },
  })
);

const allowedOriginsEnv = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (!isProduction) return callback(null, true);
    if (allowedOriginsEnv.includes(origin)) return callback(null, true);
    try {
      const host = new URL(origin).hostname;
      if (
        host.endsWith('.replit.app') ||
        host.endsWith('.replit.dev') ||
        host === 'synccos.com' ||
        host.endsWith('.synccos.com')
      ) {
        return callback(null, true);
      }
    } catch {}
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));

let routesRegistered = false;

async function loadDependencies() {
  logger.debug('[startup] loading middleware modules');
  const { default: errorHandler } = await import('./middlewares/error-handler.middleware.js');
  const { default: authorization } = await import('./middlewares/authorization.middleware.js');
  const { default: queryMetrics } = await import('./middlewares/queryMetrics.middleware.js');

  logger.debug('[startup] loading route controllers');
  const { routes } = await import('./controllers/main.controller.js');

  return { errorHandler, authorization, queryMetrics, routes };
}

function registerRoutes(errorHandler: ErrorRequestHandler, authorization: RequestHandler, queryMetrics: RequestHandler, routes: RoutesRegistrar) {
  if (routesRegistered) {
    return;
  }

  if (isProduction) {
    logger.debug('[startup] configuring production unified routes (API + static client)');

    const apiRouter = express.Router();
    apiRouter.use(queryMetrics);
    apiRouter.use(authorization);
    routes(apiRouter, express);
    apiRouter.use(errorHandler);
    app.use('/api', apiRouter);

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const clientBuildDir = path.resolve(__dirname, '../../client/build');
    const clientIndexHtml = path.join(clientBuildDir, 'index.html');

    if (existsSync(clientIndexHtml)) {
      logger.info(`[startup] serving static client from ${clientBuildDir}`);
      app.use(express.static(clientBuildDir, { index: false, maxAge: '1h' }));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) return next();
        if (req.path === '/health-check' || req.path === '/api/health-check') return next();
        res.sendFile(clientIndexHtml);
      });
    } else {
      logger.warn(`[startup] client build not found at ${clientBuildDir}; non-/api routes will 404`);
      app.get('/', (_req, res) => {
        res.status(200).json({ service: 'synccos-check-writer-api', status: 'ok' });
      });
    }

    app.use((req, res) => {
      res.status(404).json({ error: 'Not Found', path: req.path });
    });
  } else {
    app.use(queryMetrics);
    app.use(authorization);
    routes(app, express);
    app.use(errorHandler);
  }

  routesRegistered = true;
}

// Graceful shutdown: when the platform sends SIGTERM/SIGINT (e.g. when
// scaling an autoscale instance to zero), close the HTTP server so the
// Node event loop can drain and the process can exit cleanly instead of
// being SIGKILL'd. There are no in-process timers/cron loops to stop —
// recurring jobs are HTTP-triggered (see /scheduled-jobs/*).
let shuttingDown = false;
function gracefulShutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`[shutdown] received ${signal}, beginning graceful shutdown`);
  server.close((err) => {
    if (err) {
      logger.error('[shutdown] error closing HTTP server:', err);
      process.exit(1);
    }
    process.exit(0);
  });
  // Hard timeout so we never block the platform from reclaiming the
  // instance if a connection refuses to close.
  setTimeout(() => {
    logger.warn('[shutdown] graceful shutdown timed out, forcing exit.');
    process.exit(0);
  }, 10000).unref();
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

async function setupApp() {
  const stripeSubConfig = config.has('stripe_subscription') ? config.get('stripe_subscription') as Record<string, unknown> : null;
  if (!stripeSubConfig || !stripeSubConfig.stripe_subscription_webhook_endpoint_secret) {
    logger.warn('stripe_subscription.stripe_subscription_webhook_endpoint_secret is not configured; /api/managesubscription/webhook will fail signature verification.');
  }

  const { errorHandler, authorization, queryMetrics, routes } = await loadDependencies();

  registerRoutes(errorHandler, authorization, queryMetrics, routes);

  if (!isProduction) {
    const { default: swaggerDocs } = await import('./utils/swagger.js');
    swaggerDocs(app, config.port || 7777);
  }

  appState = 'ready';
  appError = null;
  logger.info('app ready');
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

async function startWithRetries() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await setupApp();
      return;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`[startup] attempt ${attempt}/${MAX_RETRIES} failed: ${errorMessage}`, err instanceof Error ? err.stack : undefined);

      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        logger.error(`[startup] all ${MAX_RETRIES} initialization attempts failed; app is in failed state.`);
        appState = 'failed';
        appError = errorMessage;
      }
    }
  }
}

startWithRetries();
