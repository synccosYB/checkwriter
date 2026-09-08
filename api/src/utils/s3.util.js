import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from 'config';

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: config.s3.endpoint_url,
  credentials: {
    accessKeyId: config.s3.access_key_id,
    secretAccessKey: config.s3.secret_access_key,
  },
  forcePathStyle: true,
});

export const uploadToS3 = async ({ Bucket, Key, ContentType, Body }) => {
  const command = new PutObjectCommand({ Bucket, Key, ContentType, Body });
  return s3Client.send(command);
};

export const getPresignedDownloadUrl = async ({ Bucket, Key, expiresIn = 3600 }) => {
  const command = new GetObjectCommand({ Bucket, Key });
  return getSignedUrl(s3Client, command, { expiresIn });
};

export const getPresignedUploadUrl = async ({ Bucket, Key, ContentType, expiresIn = 3600 }) => {
  const command = new PutObjectCommand({ Bucket, Key, ContentType });
  return getSignedUrl(s3Client, command, { expiresIn });
};

export const deleteFromS3 = async ({ Bucket, Key }) => {
  const command = new DeleteObjectCommand({ Bucket, Key });
  return s3Client.send(command);
};
