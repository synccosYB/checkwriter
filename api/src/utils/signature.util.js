import { AttachmentService } from '../services/attachments.service.js';
import { EntityType } from '../models/attachment.model.js';
import {
  usersCollection,
  organizationCollection,
} from '../models/dbCollections.js';

/**
 * Global signature URL retrieval function
 * Handles all signature scenarios using the attachment system
 */
export const getSignatureUrl = async ({
  // Direct attachment ID (most efficient when available)
  signatureAttachmentId,

  // Entity-based lookup parameters
  entityType, // 'users', 'organizations', 'banks'
  entityId, // userId, organizationId, or bankId

  // Owner context
  ownerType, // 'user' or 'organization'
  ownerId, // userId or organizationId (who owns this signature)

  // Default signature handling
  useDefaultSignature = false,
  defaultOwnerType, // For bank signatures that want to use owner's signature
  defaultOwnerId, // User/org ID whose signature to use as default
}) => {
  try {
    // Case 1: Direct attachment ID lookup (most efficient)
    if (signatureAttachmentId) {
      const result = await AttachmentService.downloadAttachment({
        attachmentId: signatureAttachmentId.toString(),
        ownerType,
        userId: ownerId,
      });
      return result.url;
    }

    // Case 2: Use default signature from user/organization
    if (useDefaultSignature && defaultOwnerId) {
      // Get the owner's signature attachment ID
      const ownerData =
        defaultOwnerType === 'user'
          ? await usersCollection
              .findById(defaultOwnerId, { signatureAttachmentId: 1 })
              .lean()
          : await organizationCollection
              .findById(defaultOwnerId, { signatureAttachmentId: 1 })
              .lean();

      if (ownerData?.signatureAttachmentId) {
        const result = await AttachmentService.downloadAttachment({
          attachmentId: ownerData.signatureAttachmentId.toString(),
          ownerType: defaultOwnerType,
          userId: defaultOwnerId,
        });
        return result.url;
      }
      return '';
    }

    // Case 3: Entity-based lookup (fallback when no direct attachment ID)
    if (entityType && entityId) {
      const attachments = await AttachmentService.getAttachmentsByEntity({
        entityType,
        entityId,
        ownerType,
        ownerId,
      });

      if (attachments.length > 0) {
        // Get the most recent signature
        const latestSignature = attachments[attachments.length - 1];
        const result = await AttachmentService.downloadAttachment({
          attachmentId: latestSignature._id.toString(),
          ownerType,
          userId: ownerId,
        });
        return result.url;
      }
    }

    return '';
  } catch (error) {
    console.error('Error getting signature URL:', error);
    return '';
  }
};

/**
 * Get user or organization signature URL
 */
export const getUserSignatureUrl = async (userId, organizationId = null) => {
  const ownerType = organizationId ? 'organization' : 'user';
  const ownerId = organizationId || userId;
  const entityType = organizationId
    ? EntityType.ORGANIZATIONS
    : EntityType.USERS;

  return getSignatureUrl({
    entityType,
    entityId: ownerId,
    ownerType,
    ownerId,
  });
};

/**
 * Get user or organization signature base64 (optimized)
 */
export const getUserSignatureBase64 = async (ownerId, ownerType) => {
  try {
    // Get the user/organization's signature attachment ID directly
    const owner =
      ownerType === 'user'
        ? await usersCollection
            .findById(ownerId, { signatureAttachmentId: 1 })
            .lean()
        : await organizationCollection
            .findById(ownerId, { signatureAttachmentId: 1 })
            .lean();

    if (!owner?.signatureAttachmentId) {
      return '';
    }

    // Direct attachment download (need owner params for security)
    const result = await AttachmentService.downloadAttachment({
      attachmentId: owner.signatureAttachmentId.toString(),
      ownerType,
      userId: ownerId,
    });

    if (!result.url) {
      return '';
    }

    // Convert to base64
    const axios = (await import('axios')).default;
    const response = await axios.get(result.url, {
      responseType: 'arraybuffer',
    });

    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const contentType = response.headers['content-type'] || 'image/png';

    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Error getting user signature base64:', error);
    return '';
  }
};

/**
 * Get bank signature URL (with default signature support)
 */
export const getBankSignatureUrl = async ({
  bankId,
  bankPreferences,
  ownerType,
  ownerId,
  defaultOwnerId,
  ownerData, // Optional: pre-fetched owner data for efficiency
}) => {
  // Check if bank wants to use default signature
  if (bankPreferences?.useDefaultSignature) {
    // If ownerData is provided and has signatureAttachmentId, use it directly
    if (ownerData?.signatureAttachmentId) {
      try {
        const result = await AttachmentService.downloadAttachment({
          attachmentId: ownerData.signatureAttachmentId.toString(),
          ownerType,
          userId: ownerId,
        });
        return result.url;
      } catch (error) {
        console.error('Error getting default signature from ownerData:', error);
        return '';
      }
    }

    // Fallback to regular lookup
    return getSignatureUrl({
      useDefaultSignature: true,
      defaultOwnerType: ownerType,
      defaultOwnerId,
      ownerType,
      ownerId,
    });
  }

  // Use bank-specific signature attachment ID directly if available
  if (bankPreferences?.signatureAttachmentId) {
    try {
      const result = await AttachmentService.downloadAttachment({
        attachmentId: bankPreferences.signatureAttachmentId.toString(),
        ownerType,
        userId: ownerId,
      });
      return result.url;
    } catch (error) {
      console.error('Error getting bank signature from attachment ID:', error);
      return '';
    }
  }

  // Fallback to entity lookup
  return getSignatureUrl({
    entityType: EntityType.BANKS,
    entityId: bankId,
    ownerType,
    ownerId,
  });
};

/**
 * Get base64 signature for PDF generation
 */
export const getSignatureBase64 = async ({
  signatureAttachmentId,
  entityType,
  entityId,
  ownerType,
  ownerId,
  useDefaultSignature = false,
  defaultOwnerType,
  defaultOwnerId,
}) => {
  try {
    const signatureUrl = await getSignatureUrl({
      signatureAttachmentId,
      entityType,
      entityId,
      ownerType,
      ownerId,
      useDefaultSignature,
      defaultOwnerType,
      defaultOwnerId,
    });

    if (!signatureUrl) {
      return '';
    }

    // Convert URL to base64 for PDF embedding
    const axios = (await import('axios')).default;
    const response = await axios.get(signatureUrl, {
      responseType: 'arraybuffer',
    });

    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const contentType = response.headers['content-type'] || 'image/png';

    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting signature to base64:', error);
    return '';
  }
};
