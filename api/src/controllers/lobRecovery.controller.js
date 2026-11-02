import express from 'express';
import adminPrivilageMiddleware from '../middlewares/adminPrivilage.middleware.js';
import { listLobRecoveries, prepareLobRecovery, recoveryPdf, originalRecoveryPdf, submitLobRecovery, reconcileLobRecovery } from '../services/lobRecovery.service.js';
import { setPlatformSetting } from '../models/platformSettings.model.js';

const router = express.Router();
router.use(adminPrivilageMiddleware);
router.get('/', async (req, res, next) => {
  try { res.json({ since: '2026-10-27', records: await listLobRecoveries() }); } catch (e) { next(e); }
});
router.post('/:lobId/prepare', async (req, res, next) => {
  try { const r = await prepareLobRecovery(req.params.lobId, req.userId); res.json({ pdfSha256: r.pdfSha256, state: r.status }); } catch (e) { next(e); }
});
router.get('/:lobId/pdf', async (req, res, next) => {
  try { const { bytes } = await recoveryPdf(req.params.lobId); res.type('pdf').set('Cache-Control', 'no-store').send(bytes); } catch (e) { next(e); }
});
router.get('/:lobId/original', async (req, res, next) => {
  try { res.type('pdf').set('Cache-Control', 'no-store').send(await originalRecoveryPdf(req.params.lobId)); } catch (e) { next(e); }
});
router.post('/:lobId/submit', async (req, res, next) => {
  try {
    if (req.body.confirmation !== 'PRINT_AND_MAIL_THE_REVIEWED_CHECK') return res.status(422).json({ error: 'Review the complete check PDF and confirm the physical mailing.' });
    res.json(await submitLobRecovery(req.params.lobId, req.body.pdfSha256, req.userId));
  } catch (e) { next(e); }
});
router.post('/:lobId/reconcile', async (req, res, next) => {
  try { res.json(await reconcileLobRecovery(req.params.lobId, req.userId, req.body)); } catch (e) { next(e); }
});
router.post('/enable/new-mailings', async (req, res, next) => {
  try {
    if (req.body.confirmation !== 'I_REVIEWED_THE_FULL_CHECK_PDF_AND_PRINT_SERVICE') return res.status(422).json({ error: 'Review a full check PDF and confirm the print service before reopening mailing.' });
    await setPlatformSetting('LOB_ORIGINAL_PDF_ENABLED', 'true'); res.json({ enabled: true });
  } catch (e) { next(e); }
});
export default router;
