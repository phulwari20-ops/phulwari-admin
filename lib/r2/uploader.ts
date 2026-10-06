/**
 * Client-Side Media Uploader
 * Supports:
 *  - Direct upload for files <= 3.5MB (fast single-request)
 *  - Chunked upload for files > 3.5MB (splits into ~3MB parts to safely stay under Vercel 4.5MB payload limit)
 *  - Seamlessly handles both images & videos across Chrome, Maya OS, Safari, etc.
 */

export interface UploadMediaOptions {
  title?: string;
  onProgress?: (percent: number, status: string) => void;
}

export interface UploadMediaResult {
  success: boolean;
  url: string;
  key: string;
  size: number;
  storage: 'r2' | 'local';
  original_name?: string;
  title?: string;
}

const CHUNK_SIZE = 1.5 * 1024 * 1024; // 1.5 MB per slice (guaranteed well under Vercel 4.5MB limit)
const DIRECT_UPLOAD_LIMIT = 1.0 * 1024 * 1024; // 1.0 MB (anything larger uses chunked pipeline)

export async function uploadMediaFile(
  file: File | Blob,
  fileName: string,
  contentType: string,
  options?: UploadMediaOptions
): Promise<UploadMediaResult> {
  const onProgress = options?.onProgress;
  const fileSize = file.size;

  // Case 1: Small file (<= 3.5 MB) -> Direct upload in one POST
  if (fileSize <= DIRECT_UPLOAD_LIMIT) {
    onProgress?.(50, 'Uploading to Cloudflare R2...');
    const formData = new FormData();
    formData.append('file', file, fileName);
    if (options?.title) formData.append('title', options.title);

    const res = await fetch('/api/r2/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      let errMsg = 'Failed to upload media';
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error) errMsg = parsed.error;
      } catch (_) {
        if (errText && errText.length < 200) errMsg = errText;
      }
      throw new Error(errMsg);
    }

    const data = await res.json();
    onProgress?.(100, 'Upload complete!');
    return data;
  }

  // Case 2: Large file (> 3.5 MB) -> Chunked upload
  const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
  const uploadId = `upl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  onProgress?.(5, `Uploading large file in ${totalChunks} parts...`);

  for (let index = 0; index < totalChunks; index++) {
    const start = index * CHUNK_SIZE;
    const end = Math.min(fileSize, start + CHUNK_SIZE);
    const chunkBlob = file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunkBlob, `part_${index}`);
    formData.append('uploadId', uploadId);
    formData.append('index', String(index));

    const currentPercent = Math.min(90, Math.round(((index + 1) / totalChunks) * 85));
    onProgress?.(currentPercent, `Uploading part ${index + 1} of ${totalChunks} to Cloudflare R2...`);

    const chunkRes = await fetch('/api/r2/chunk-upload', {
      method: 'POST',
      body: formData,
    });

    if (!chunkRes.ok) {
      const errText = await chunkRes.text();
      let errMsg = `Failed to upload part ${index + 1}`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error) errMsg = parsed.error;
      } catch (_) {}
      throw new Error(errMsg);
    }
  }

  // Finalize: Assemble chunks in R2
  onProgress?.(94, 'Assembling parts in Cloudflare R2...');
  const completeRes = await fetch('/api/r2/chunk-upload/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uploadId,
      total: totalChunks,
      filename: fileName,
      contentType,
      title: options?.title,
    }),
  });

  if (!completeRes.ok) {
    const errText = await completeRes.text();
    let errMsg = 'Failed to assemble video parts';
    try {
      const parsed = JSON.parse(errText);
      if (parsed.error) errMsg = parsed.error;
    } catch (_) {}
    throw new Error(errMsg);
  }

  const resultData = await completeRes.json();
  onProgress?.(100, 'Upload assembled & verified in Cloudflare R2!');
  return resultData;
}
