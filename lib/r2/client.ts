import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  endpoint: string;
  publicDomain?: string;
}

export function getR2Config(): R2Config {
  const accountId =
    process.env.R2_ACCOUNT_ID ||
    process.env.NEXT_PUBLIC_R2_ACCOUNT_ID ||
    '98d203bfa51dd119ae438c70538c5f98';

  const accessKeyId =
    process.env.R2_ACCESS_KEY_ID ||
    process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID ||
    '3dce3a2786840437fb3440006ef3fdcd';

  const secretAccessKey =
    process.env.R2_SECRET_ACCESS_KEY ||
    '028e8b1f972367ed09e50d7a9d79ef32c8132103546b3aa49b2a751b999c9992';

  const bucketName =
    process.env.R2_BUCKET_NAME ||
    process.env.NEXT_PUBLIC_R2_BUCKET_NAME ||
    'media-storage';

  const endpoint =
    process.env.R2_ENDPOINT ||
    `https://${accountId}.r2.cloudflarestorage.com`;

  const publicDomain =
    process.env.R2_PUBLIC_DOMAIN ||
    process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    endpoint,
    publicDomain,
  };
}

export function isR2Configured(): boolean {
  const config = getR2Config();
  return Boolean(config.accountId && config.accessKeyId && config.secretAccessKey && config.bucketName);
}

export function getR2Client(): S3Client {
  const config = getR2Config();
  return new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

/**
 * Upload a media (video or image) file to Cloudflare R2 bucket.
 */
export async function uploadVideoFile(
  buffer: Buffer,
  filename: string,
  contentType = 'video/mp4'
): Promise<{ url: string; key: string; size: number; storage: 'r2' | 'local' }> {
  const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const folder = contentType.startsWith('image/') ? 'images' : 'videos';
  const uniqueKey = `${folder}/${Date.now()}-${cleanFilename}`;
  const config = getR2Config();

  try {
    const client = getR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: uniqueKey,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    // Determine public URL:
    // If explicit public domain set, use it; otherwise use the standard phulwari media proxy route
    const publicUrl = config.publicDomain
      ? `${config.publicDomain.replace(/\/$/, '')}/${uniqueKey}`
      : `https://www.phulwari.co.in/api/media/${uniqueKey}`;

    return {
      url: publicUrl,
      key: uniqueKey,
      size: buffer.length,
      storage: 'r2',
    };
  } catch (r2Err: any) {
    console.error('⚠️ Cloudflare R2 upload error:', r2Err);

    // In serverless/production (Vercel), writing to disk will throw EROFS. Fail gracefully with error.
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    if (isServerless) {
      throw new Error(`Cloudflare R2 storage error: ${r2Err.message || 'Upload failed'}`);
    }

    // Only in local development fallback to public/videos
    try {
      const localDir = path.join(process.cwd(), 'public', folder);
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }

      const localPath = path.join(localDir, `${Date.now()}-${cleanFilename}`);
      fs.writeFileSync(localPath, buffer);
      const baseName = path.basename(localPath);

      return {
        url: `/${folder}/${baseName}`,
        key: `${folder}/${baseName}`,
        size: buffer.length,
        storage: 'local',
      };
    } catch (localErr: any) {
      throw new Error(`Upload failed: ${r2Err.message || localErr.message}`);
    }
  }
}

/**
 * List uploaded video files from R2 or local storage.
 */
export async function listVideos(): Promise<Array<{ key: string; url: string; size?: number; lastModified?: Date; storage: string }>> {
  const config = getR2Config();

  try {
    const client = getR2Client();
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: config.bucketName,
        Prefix: 'videos/',
      })
    );

    if (res.Contents && res.Contents.length > 0) {
      return res.Contents.map((obj: any) => {
        const key = obj.Key || '';
        const url = config.publicDomain
          ? `${config.publicDomain.replace(/\/$/, '')}/${key}`
          : `https://www.phulwari.co.in/api/media/${key}`;
        return {
          key,
          url,
          size: obj.Size,
          lastModified: obj.LastModified,
          storage: 'r2',
        };
      });
    }
  } catch (e) {
    console.warn('Error listing R2 videos:', e);
  }

  // Local fallback if in local development
  try {
    const localDir = path.join(process.cwd(), 'public', 'videos');
    if (fs.existsSync(localDir)) {
      const files = fs.readdirSync(localDir);
      return files.map((file) => {
        const filePath = path.join(localDir, file);
        const stat = fs.statSync(filePath);
        return {
          key: `videos/${file}`,
          url: `/videos/${file}`,
          size: stat.size,
          lastModified: stat.mtime,
          storage: 'local',
        };
      });
    }
  } catch (_) {}

  return [];
}
