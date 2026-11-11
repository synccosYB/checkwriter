import assert from 'node:assert/strict';
import test from 'node:test';
import { EntityType } from '../../models/attachment.model.js';
import { AttachmentService } from '../../services/attachments.service.js';
import { compileTemplate } from './checkEmail.utils.js';

test('printing an existing check finds its legacy signature by populated bank ID', async (t) => {
  const signatureUrl = 'https://example.test/check-signature.png';
  const find = t.mock.method(AttachmentService, 'getAttachmentsByEntity', async () => [
    { _id: 'saved-signature' },
  ]);
  const download = t.mock.method(AttachmentService, 'downloadAttachment', async () => ({
    url: signatureUrl,
  }));

  const html = await compileTemplate({
    ownerId: 'check-organization',
    ownerType: 'organization',
    userId: 'printing-user',
    bank: {
      _id: 'check-bank',
      bankPreferences: { signatureEnabled: true },
    },
    payee: { name: 'TEST PAYEE', address: {} },
    checkNumber: 123,
    amount: 1,
  });

  assert.equal(find.mock.callCount(), 1);
  assert.deepEqual(find.mock.calls[0].arguments[0], {
    entityType: EntityType.BANKS,
    entityId: 'check-bank',
    ownerType: 'organization',
    ownerId: 'check-organization',
  });
  assert.equal(download.mock.callCount(), 1);
  assert.deepEqual(download.mock.calls[0].arguments[0], {
    attachmentId: 'saved-signature',
    ownerType: 'organization',
    userId: 'check-organization',
  });
  assert.ok(html.includes(`src='${signatureUrl}'`));
});
