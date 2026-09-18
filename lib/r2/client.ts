import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

export interface R2Config {
  accountId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName?: string;
  publicDomain?: string;
}

export function getR2Config(): R2Config {
  return {
    accountId: process.env.R2_ACCOUNT_ID || process.env.NEXT_PUBLIC_R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME || process.env.NEXT_PUBLIC_R2_BUCKET_NAME || 'phulwari-videos',
    publicDomain: process.env.R2_PUBLIC_DOMAIN || process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN,
  };
}

export function isR2Configured(): boolean {
  const config = getR2Config();
  return Boolean(config.accountId && config.accessKeyId && config.secretAccessKey && config.bucketName);
}

export function getR2Client(): S3Client | null {
  const config = getR2Config();
  if (!isR2Configured()) {
    return null;
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId!,
      secretAccessKey: config.secretAccessKey!,
    },
  });
}

/**
 * Upload a video/media file to Cloudflare R2 or local storage fallback.
 */
export async function uploadVideoFile(
  buffer: Buffer,
  filename: string,
  contentType = 'video/mp4'
): Promise<{ url: string; key: string; size: number; storage: 'r2' | 'local' }> {
  const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueKey = `videos/${Date.now()}-${cleanFilename}`;
  const config = getR2Config();

  if (isR2Configured()) {
    try {
      const client = getR2Client()!;
      await client.send(
        new PutObjectCommand({
          Bucket: config.bucketName,
          Key: uniqueKey,
          Body: buffer,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );

      const publicUrl = config.publicDomain
        ? `${config.publicDomain.replace(/\/$/, '')}/${uniqueKey}`
        : `https://${config.bucketName}.${config.accountId}.r2.cloudflarestorage.com/${uniqueKey}`;

      return {
        url: publicUrl,
        key: uniqueKey,
        size: buffer.length,
        storage: 'r2',
      };
    } catch (r2Err) {
      console.warn('⚠️ Cloudflare R2 upload failed, falling back to local storage:', r2Err);
    }
  }

  // Fallback: Save to local public/videos directory
  const localDir = path.join(process.cwd(), 'public', 'videos');
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  const localPath = path.join(localDir, `${Date.now()}-${cleanFilename}`);
  fs.writeFileSync(localPath, buffer);
  const baseName = path.basename(localPath);

  return {
    url: `/videos/${baseName}`,
    key: `videos/${baseName}`,
    size: buffer.length,
    storage: 'local',
  };
}

/**
 * List uploaded video files from R2 or local storage.
 */
export async function listVideos(): Promise<Array<{ key: string; url: string; size?: number; lastModified?: Date; storage: string }>> {
  const config = getR2Config();

  if (isR2Configured()) {
    try {
      const client = getR2Client()!;
      const res = await client.send(
        new ListObjectsV2Command({
          Bucket: config.bucketName,
          Prefix: 'videos/',
        })
      );

      if (res.Contents) {
        return res.Contents.map((obj) => {
          const key = obj.Key || '';
          const url = config.publicDomain
            ? `${config.publicDomain.replace(/\/$/, '')}/${key}`
            : `https://${config.bucketName}.${config.accountId}.r2.cloudflarestorage.com/${key}`;
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
  }

  // Fallback: read local public/videos folder
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

  return [];
}
