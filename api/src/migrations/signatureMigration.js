import axios from 'axios';
import config from 'config';
import { getPresignedDownloadUrl } from '../utils/s3.util.js';
import {
  usersCollection,
  organizationCollection,
  banksCollection,
} from '../models/dbCollections.js';
import { AttachmentService } from '../services/attachments.service.js';
import { EntityType } from '../models/attachment.model.js';
import { OwnerType } from '../enums/user.enum.js';

/**
 * Migration script to convert old signature URLs to attachment structure
 * Migrates:
 * 1. User signatures (user.signatureUrl → user.signatureAttachmentId)
 * 2. Organization signatures (org.signatureUrl → org.signatureAttachmentId)
 * 3. Bank signatures (bank.bankPreferences.signatureUrl → bank.bankPreferences.signatureAttachmentId)
 */

const migrationResults = {
  userSignatures: { migrated: 0, failed: 0, errors: [] },
  organizationSignatures: { migrated: 0, failed: 0, errors: [] },
  bankSignatures: { migrated: 0, failed: 0, errors: [] },
};

/**
 * Generates fresh presigned URL from S3 key (for expired URLs)
 */
async function generateFreshSignatureUrl(
  signatureUrl,
  signatureType,
  metadata
) {
  try {
    let s3Key;
    const { userId, organizationId, bankName } = metadata;

    if (signatureType === 'user') {
      s3Key = `${userId}/checkWriter/personal/uniqueSignature`;
    } else if (signatureType === 'organization') {
      s3Key = `${userId}/checkWriter/organization/${organizationId}/uniqueSignature`;
    } else if (signatureType === 'bank') {
      // Bank signatures use: signature_BankName.png
      const fileName = bankName
        ? `signature_${removeSpaces(bankName)}.png`
        : 'signature.png';
      s3Key = organizationId
        ? `${userId}/checkWriter/organization/${organizationId}/signatures/bank/${fileName}`
        : `${userId}/checkWriter/personal/signatures/bank/${fileName}`;
    } else {
      // Fallback: Extract key from URL pathname
      s3Key = new URL(signatureUrl).pathname.replace('/', '');
    }

    console.info(`Regenerating URL with S3 key: ${s3Key}`);

    return await getPresignedDownloadUrl({
      Bucket: config.s3.bucket_name,
      Key: s3Key,
      expiresIn: 60 * 60,
    });
  } catch (error) {
    console.error(`Error generating fresh URL for key:`, error.message);
    throw error;
  }
}

/**
 * Import removeSpaces function from banks service
 */
function removeSpaces(str) {
  return str ? str.replace(/\s+/g, '') : '';
}

/**
 * Downloads a file from URL (handles expired URLs by regenerating them)
 */
async function downloadFileFromUrl(signatureUrl, signatureType, metadata) {
  try {
    // First try the original URL
    try {
      const response = await axios.get(signatureUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });
      return Buffer.from(response.data);
    } catch (error) {
      // If failed (likely expired), generate fresh URL and try again
      console.info(`URL expired for ${signatureType}, generating fresh URL...`);

      const freshUrl = await generateFreshSignatureUrl(
        signatureUrl,
        signatureType,
        metadata
      );
      const response = await axios.get(freshUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });
      return Buffer.from(response.data);
    }
  } catch (error) {
    console.error(
      `Error downloading ${signatureType} signature:`,
      error.message
    );
    throw error;
  }
}

/**
 * Creates attachment record from signature URL
 */
async function createAttachmentFromSignatureUrl({
  signatureUrl,
  entityType,
  entityId,
  ownerType,
  ownerId,
  uploadedBy,
  description,
  userId,
  organizationId,
  bankName = null,
}) {
  try {
    // Determine signature type based on entity type
    const signatureType =
      entityType === EntityType.USERS
        ? 'user'
        : entityType === EntityType.ORGANIZATIONS
        ? 'organization'
        : 'bank';

    // Create metadata object for URL regeneration
    const metadata = { userId, organizationId, bankName };

    // Download file from S3 (handles expired URLs)
    const fileBuffer = await downloadFileFromUrl(
      signatureUrl,
      signatureType,
      metadata
    );

    // Extract filename from URL
    const urlParts = new URL(signatureUrl).pathname.split('/');
    const originalFilename = urlParts[urlParts.length - 1] || 'signature.png';

    // Determine file extension and mimetype
    const extension = originalFilename.includes('.')
      ? originalFilename.split('.').pop()
      : 'png';
    const mimetype = `image/${extension}`;

    const file = {
      buffer: fileBuffer,
      originalname: originalFilename,
      mimetype,
      size: fileBuffer.length,
      description,
    };

    const attachments = await AttachmentService.createAttachments({
      files: [file],
      entityType,
      entityId,
      ownerType,
      ownerId,
      uploadedBy,
    });

    return attachments[0];
  } catch (error) {
    console.error('Error creating attachment from signature URL:', error);
    throw error;
  }
}

/**
 * Migrate user signatures
 */
async function migrateUserSignatures() {
  console.info('Starting user signature migration...');

  const users = await usersCollection
    .find({
      signatureUrl: { $exists: true, $ne: '' },
      signatureAttachmentId: { $exists: false }, // Not already migrated
    })
    .lean();

  console.info(`Found ${users.length} users with signatures to migrate`);

  for (const user of users) {
    try {
      const attachment = await createAttachmentFromSignatureUrl({
        signatureUrl: user.signatureUrl,
        entityType: EntityType.USERS,
        entityId: user._id.toString(),
        ownerType: OwnerType.USER,
        ownerId: user._id.toString(),
        uploadedBy: user._id.toString(),
        description: 'Migrated personal signature',
        userId: user._id.toString(),
        organizationId: null,
      });

      // Update user with attachment ID
      await usersCollection.findByIdAndUpdate(user._id, {
        $set: {
          signatureAttachmentId: attachment._id,
        },
      });

      migrationResults.userSignatures.migrated++;
      console.info(`✅ Migrated user signature: ${user._id}`);
    } catch (error) {
      migrationResults.userSignatures.failed++;
      migrationResults.userSignatures.errors.push({
        userId: user._id.toString(),
        error: error.message,
      });
      console.error(
        `❌ Failed to migrate user signature ${user._id}:`,
        error.message
      );
    }
  }
}

/**
 * Migrate organization signatures
 */
async function migrateOrganizationSignatures() {
  console.info('Starting organization signature migration...');

  const organizations = await organizationCollection
    .find({
      signatureUrl: { $exists: true, $ne: '' },
      signatureAttachmentId: { $exists: false }, // Not already migrated
    })
    .lean();

  console.info(
    `Found ${organizations.length} organizations with signatures to migrate`
  );

  for (const org of organizations) {
    try {
      // Get a user ID from the organization for uploadedBy
      const uploadedBy =
        org.users && org.users.length > 0
          ? org.users[0].toString()
          : org._id.toString(); // Fallback to org ID

      const attachment = await createAttachmentFromSignatureUrl({
        signatureUrl: org.signatureUrl,
        entityType: EntityType.ORGANIZATIONS,
        entityId: org._id.toString(),
        ownerType: OwnerType.ORGANIZATION,
        ownerId: org._id.toString(),
        uploadedBy,
        description: 'Migrated organization signature',
        userId:
          org.users && org.users.length > 0
            ? org.users[0].toString()
            : org._id.toString(),
        organizationId: org._id.toString(),
      });

      // Update organization with attachment ID
      await organizationCollection.findByIdAndUpdate(org._id, {
        $set: {
          signatureAttachmentId: attachment._id,
        },
      });

      migrationResults.organizationSignatures.migrated++;
      console.info(`✅ Migrated organization signature: ${org._id}`);
    } catch (error) {
      migrationResults.organizationSignatures.failed++;
      migrationResults.organizationSignatures.errors.push({
        organizationId: org._id.toString(),
        error: error.message,
      });
      console.error(
        `❌ Failed to migrate organization signature ${org._id}:`,
        error.message
      );
    }
  }
}

/**
 * Migrate bank signatures
 */
async function migrateBankSignatures() {
  console.info('Starting bank signature migration...');

  const banks = await banksCollection
    .find({
      'bankPreferences.signatureUrl': { $exists: true, $ne: '' },
      'bankPreferences.signatureAttachmentId': { $exists: false }, // Not already migrated
    })
    .lean();

  console.info(`Found ${banks.length} banks with signatures to migrate`);

  for (const bank of banks) {
    try {
      if (!bank.bankPreferences?.signatureUrl) continue;

      const attachment = await createAttachmentFromSignatureUrl({
        signatureUrl: bank.bankPreferences.signatureUrl,
        entityType: EntityType.BANKS,
        entityId: bank._id.toString(),
        ownerType: bank.ownerType,
        ownerId: bank.ownerId.toString(),
        uploadedBy: bank.ownerId.toString(),
        description: `Migrated bank signature for ${bank.bankName}`,
        userId: bank.ownerType === 'user' ? bank.ownerId.toString() : null,
        organizationId:
          bank.ownerType === 'organization' ? bank.ownerId.toString() : null,
        bankName: bank.bankName, // Add bank name for S3 key generation
      });

      // Update bank with attachment ID
      await banksCollection.findByIdAndUpdate(bank._id, {
        $set: {
          'bankPreferences.signatureAttachmentId': attachment._id,
        },
      });

      migrationResults.bankSignatures.migrated++;
      console.info(`✅ Migrated bank signature: ${bank._id} (${bank.bankName})`);
    } catch (error) {
      migrationResults.bankSignatures.failed++;
      migrationResults.bankSignatures.errors.push({
        bankId: bank._id.toString(),
        bankName: bank.bankName,
        error: error.message,
      });
      console.error(
        `❌ Failed to migrate bank signature ${bank._id}:`,
        error.message
      );
    }
  }
}

/**
 * Main migration function
 */
export async function migrateSignaturesToAttachments() {
  console.info('🚀 Starting signature migration to attachment structure...');
  console.info('=====================================');

  try {
    // Migrate in order: users, organizations, then banks
    await migrateUserSignatures();
    console.info('=====================================');

    await migrateOrganizationSignatures();
    console.info('=====================================');

    await migrateBankSignatures();
    console.info('=====================================');

    // Print final results
    console.info('📊 Migration Summary:');
    console.info('=====================================');
    console.info(
      `👤 User signatures: ${migrationResults.userSignatures.migrated} migrated, ${migrationResults.userSignatures.failed} failed`
    );
    console.info(
      `🏢 Organization signatures: ${migrationResults.organizationSignatures.migrated} migrated, ${migrationResults.organizationSignatures.failed} failed`
    );
    console.info(
      `🏦 Bank signatures: ${migrationResults.bankSignatures.migrated} migrated, ${migrationResults.bankSignatures.failed} failed`
    );

    const totalMigrated =
      migrationResults.userSignatures.migrated +
      migrationResults.organizationSignatures.migrated +
      migrationResults.bankSignatures.migrated;
    const totalFailed =
      migrationResults.userSignatures.failed +
      migrationResults.organizationSignatures.failed +
      migrationResults.bankSignatures.failed;

    console.info(`📈 Total: ${totalMigrated} successful, ${totalFailed} failed`);
    console.info('=====================================');

    // Log errors if any
    if (totalFailed > 0) {
      console.info('❌ Migration Errors:');
      [
        ...migrationResults.userSignatures.errors,
        ...migrationResults.organizationSignatures.errors,
        ...migrationResults.bankSignatures.errors,
      ].forEach((error, index) => {
        console.info(`${index + 1}. ${JSON.stringify(error)}`);
      });
    }

    return {
      success: totalFailed === 0,
      totalMigrated,
      totalFailed,
      results: migrationResults,
    };
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

/**
 * Rollback migration - removes signatureAttachmentId fields
 * Use this if migration needs to be reversed
 */
export async function rollbackSignatureMigration() {
  console.info('🔄 Rolling back signature migration...');

  try {
    // Remove signatureAttachmentId from users
    await usersCollection.updateMany(
      { signatureAttachmentId: { $exists: true } },
      { $unset: { signatureAttachmentId: 1 } }
    );

    // Remove signatureAttachmentId from organizations
    await organizationCollection.updateMany(
      { signatureAttachmentId: { $exists: true } },
      { $unset: { signatureAttachmentId: 1 } }
    );

    // Remove signatureAttachmentId from banks
    await banksCollection.updateMany(
      { 'bankPreferences.signatureAttachmentId': { $exists: true } },
      { $unset: { 'bankPreferences.signatureAttachmentId': 1 } }
    );

    console.info(
      '✅ Rollback completed - removed all signatureAttachmentId fields'
    );
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

// Export for CLI usage
export default migrateSignaturesToAttachments;
