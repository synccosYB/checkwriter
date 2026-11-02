import { useEffect, useState } from 'react';
import { Alert, Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, Paper, Stack, TextField, Typography } from '@mui/material';
import { shippingClient } from '../../../API/shipping/shippingClient';
import { apiErrorMessage } from '../../../utils/apiErrorMessage';

export default function LobRecovery() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [reviewed, setReviewed] = useState({});
  const [confirm, setConfirm] = useState(false);
  const [enableConfirm, setEnableConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [pdf, setPdf] = useState(null);
  const [reconcile, setReconcile] = useState(null);
  const [providerLogId, setProviderLogId] = useState('');
  const [verifiedRejection, setVerifiedRejection] = useState(false);
  const load = async () => { const { data } = await shippingClient.get('/lob-recovery'); setRows(data.records); };
  useEffect(() => { load().catch(e => setError(apiErrorMessage(e))); }, []);
  const run = async (label, action) => {
    setBusy(label); setError('');
    try { await action(); } catch (e) { setError(apiErrorMessage(e)); }
    finally { try { await load(); } catch (e) { setError(apiErrorMessage(e)); } setBusy(''); }
  };
  const prepare = row => run(`Preparing ${row.sourceLobId}`, async () => {
    await shippingClient.post(`/lob-recovery/${row.sourceLobId}/prepare`);
    setReviewed(old => ({ ...old, [row.sourceLobId]: false }));
  });
  const view = (row, original = false) => run('Opening PDF', async () => {
    const { data } = await shippingClient.get(`/lob-recovery/${row.sourceLobId}/${original ? 'original' : 'pdf'}`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
    if (pdf?.url) URL.revokeObjectURL(pdf.url);
    setPdf({ url, title: original ? 'Original Lob document' : 'Complete check PDF' });
  });
  const selected = rows.filter(r => reviewed[r.sourceLobId] && r.state === 'Prepared');
  const submit = () => run('Submitting reviewed mailings', async () => {
    setConfirm(false);
    for (const row of selected) {
      await shippingClient.post(`/lob-recovery/${row.sourceLobId}/submit`, {
        pdfSha256: row.pdfSha256, confirmation: 'PRINT_AND_MAIL_THE_REVIEWED_CHECK',
      });
      setReviewed(old => ({ ...old, [row.sourceLobId]: false }));
    }
    setMessage('The reviewed replacement mailings were submitted. Their new Lob references are shown below.');
  });
  return <Box sx={{ py: 2 }}>
    <Typography variant="h6">Corrected check mailings from October 27, 2026</Typography>
    <Alert severity="warning" sx={{ my: 2 }}>
      These originals used the old summary-page workflow. Prepare and review each complete check PDF, compare its check number,
      amount and payee with the original, and confirm the payment remains unpaid before resending. Existing originals are retained.
    </Alert>
    {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
    {message && <Alert severity="success" sx={{ my: 2 }}>{message}</Alert>}
    <Stack direction="row" spacing={2} sx={{ my: 2 }}>
      <Button disabled={!!busy} onClick={() => run('Refreshing', load)}>Refresh list</Button>
      <Button disabled={!!busy} onClick={() => run('Preparing corrected PDFs', async () => {
        const failures = [];
        for (const row of rows.filter(r => r.state === 'Needs preparation')) {
          try { await shippingClient.post(`/lob-recovery/${row.sourceLobId}/prepare`); }
          catch (e) { failures.push(`${row.sourceLobId}: ${apiErrorMessage(e)}`); }
        }
        if (failures.length) throw new Error(failures.join(' '));
      })}>Prepare corrected PDFs</Button>
      <Button variant="contained" disabled={!!busy || !selected.length} onClick={() => setConfirm(true)}>
        Review resend ({selected.length})
      </Button>
      <Button disabled={!!busy} onClick={() => setEnableConfirm(true)}>Reopen new check mailings</Button>
    </Stack>
    {busy && <Stack direction="row" spacing={2}><CircularProgress size={20} /><Typography>{busy}</Typography></Stack>}
    <Typography sx={{ my: 2 }}>{rows.length} original mailing records. Resends use the same check and do not charge the customer again.</Typography>
    {rows.map(row => <Paper variant="outlined" key={row.sourceLobId} sx={{ p: 2, mb: 2 }}>
      <Typography fontWeight={600}>{row.snapshot
        ? `Check ${row.snapshot.checkNumber} · ${row.snapshot.payeeName} · ${Number(row.snapshot.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
        : `Check record ${row.checkId}`}</Typography>
      <Typography variant="body2">Original: {row.sourceLobId} · {new Date(row.createdAt).toLocaleString()} · {row.state}</Typography>
      <Typography variant="body2">Owner: {row.ownerId} ({row.ownerType})</Typography>
      {row.replacementLobId && <Typography>Replacement: {row.replacementLobId}</Typography>}
      {row.failure && <Alert severity="error">{row.failure}</Alert>}
      {['Needs reconciliation', 'Rejected'].includes(row.state) && <Button disabled={!!busy} onClick={() => {
        setReconcile(row); setProviderLogId(''); setVerifiedRejection(false);
      }}>Reconcile provider response</Button>}
      <Stack direction="row" spacing={1} sx={{ my: 1 }}>
        <Button disabled={!!busy} onClick={() => view(row, true)}>Original Lob document</Button>
        <Button disabled={!!busy || !['Needs preparation', 'Prepared'].includes(row.state)} onClick={() => prepare(row)}>Prepare PDF</Button>
        <Button disabled={!!busy || !row.pdfSha256} onClick={() => view(row)}>Review complete check PDF</Button>
      </Stack>
      {row.state === 'Prepared' && <FormControlLabel control={<Checkbox checked={!!reviewed[row.sourceLobId]}
        disabled={!!busy} onChange={e => setReviewed(old => ({ ...old, [row.sourceLobId]: e.target.checked }))} />}
        label="I reviewed this complete check PDF, matched its original check details, and confirmed the payment is still unpaid." />}
    </Paper>)}
    <Dialog open={!!reconcile} onClose={() => setReconcile(null)}>
      <DialogTitle>Reconcile this blocked mailing</DialogTitle>
      <DialogContent>
        <Typography>First check Lob API Logs for this exact request. An existing replacement is linked automatically.
          A new attempt is allowed only after verifying a 422 rejection with no reference ID. A timeout or missing list entry is insufficient.</Typography>
        <Typography sx={{ my: 2 }}>Request key: recovery-pdf-v1-{reconcile?.sourceLobId}</Typography>
        <TextField fullWidth label="Verified Lob API log ID" value={providerLogId} onChange={e => setProviderLogId(e.target.value)} />
        <FormControlLabel control={<Checkbox checked={verifiedRejection} onChange={e => setVerifiedRejection(e.target.checked)} />}
          label="I verified that this exact request returned 422 and has no reference ID." />
      </DialogContent>
      <DialogActions><Button onClick={() => setReconcile(null)}>Back</Button>
        <Button onClick={() => run('Reconciling provider response', async () => {
          await shippingClient.post(`/lob-recovery/${reconcile.sourceLobId}/reconcile`, verifiedRejection ? {
            confirmation: 'I_VERIFIED_LOB_REJECTED_THIS_REQUEST_WITH_NO_REFERENCE', statusCode: 422,
            logId: providerLogId, idempotencyKey: `recovery-pdf-v1-${reconcile.sourceLobId}`,
          } : {});
          setReconcile(null); setMessage('Provider reconciliation completed. No new mailing was submitted.');
        })}>Reconcile without sending</Button></DialogActions>
    </Dialog>
    <Dialog open={!!pdf} maxWidth="xl" fullWidth onClose={() => { URL.revokeObjectURL(pdf.url); setPdf(null); }}>
      <DialogTitle>{pdf?.title}</DialogTitle>
      <DialogContent>{pdf && <iframe title={pdf.title} src={pdf.url} style={{ width: '100%', height: '75vh', border: 0 }} />}</DialogContent>
      <DialogActions><Button onClick={() => { URL.revokeObjectURL(pdf.url); setPdf(null); }}>Close PDF</Button></DialogActions>
    </Dialog>
    <Dialog open={confirm} onClose={() => setConfirm(false)}>
      <DialogTitle>Print and mail {selected.length} reviewed replacement checks?</DialogTitle>
      <DialogContent>The exact reviewed PDFs will be sent to Lob using the original recipient addresses and check numbers.
        Lob printing/postage costs apply to the platform. No new customer checkout is created.
        Original mailings are not canceled by this action.</DialogContent>
      <DialogActions><Button onClick={() => setConfirm(false)}>Back</Button><Button variant="contained" onClick={submit}>Confirm print and mail</Button></DialogActions>
    </Dialog>
    <Dialog open={enableConfirm} onClose={() => setEnableConfirm(false)}>
      <DialogTitle>Reopen the complete-check PDF workflow?</DialogTitle>
      <DialogContent>Confirm you reviewed a complete PDF with the correct bank details, signature and check number, and verified
        the print service is configured for these check documents. New orders will send that full PDF with a separate address cover sheet.</DialogContent>
      <DialogActions><Button onClick={() => setEnableConfirm(false)}>Keep paused</Button>
        <Button onClick={() => run('Reopening new mailings', async () => {
          await shippingClient.post('/lob-recovery/enable/new-mailings', { confirmation: 'I_REVIEWED_THE_FULL_CHECK_PDF_AND_PRINT_SERVICE' });
          setEnableConfirm(false); setMessage('New check mailings now use the complete-check PDF workflow.');
        })}>Confirm reopening</Button></DialogActions>
    </Dialog>
  </Box>;
}
