/**
 * Client-Side Automatic Video Compression & Poster Generation Utility
 * Compresses camera/phone videos in the browser before upload to save bandwidth and storage.
 */

export interface VideoCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  videoBitrate?: number; // in bps, e.g. 1_800_000 for 1.8 Mbps
  targetFps?: number;
  onProgress?: (progressPercent: number, statusText: string) => void;
}

export interface VideoCompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  duration: number;
  poster: string;
  compressionRatio: number; // percentage saved, e.g. 75 (%)
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Extract poster image from video at specified second
 */
export async function generateVideoPoster(videoFile: File | Blob, seekTime = 1.0): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(videoFile);
    video.src = url;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(seekTime, (video.duration || 2) / 2);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const posterDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          URL.revokeObjectURL(url);
          resolve(posterDataUrl);
        } else {
          URL.revokeObjectURL(url);
          resolve('');
        }
      } catch (e) {
        URL.revokeObjectURL(url);
        resolve('');
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('');
    };
  });
}

/**
 * Automatically validate & compress video on client side
 */
export async function compressVideo(
  videoFile: File,
  options: VideoCompressionOptions = {}
): Promise<VideoCompressionResult> {
  const {
    maxWidth = 1280,
    maxHeight = 720,
    videoBitrate = 1_800_000, // 1.8 Mbps delivers great 720p quality at tiny size
    targetFps = 30,
    onProgress,
  } = options;

  const originalSize = videoFile.size;

  // Extract poster first
  onProgress?.(10, 'Extracting video thumbnail...');
  const poster = await generateVideoPoster(videoFile, 1.0);

  // If video is small (< 5MB), skip heavy re-encoding and return directly
  if (originalSize <= 5 * 1024 * 1024) {
    onProgress?.(100, 'Video is already lightweight. Ready to upload.');
    return {
      file: videoFile,
      originalSize,
      compressedSize: originalSize,
      duration: 0,
      poster,
      compressionRatio: 0,
    };
  }

  // Check MediaRecorder and canvas capture support
  if (
    typeof window === 'undefined' ||
    typeof MediaRecorder === 'undefined' ||
    typeof HTMLCanvasElement.prototype.captureStream === 'undefined'
  ) {
    onProgress?.(100, 'Browser compression not supported. Using original file.');
    return {
      file: videoFile,
      originalSize,
      compressedSize: originalSize,
      duration: 0,
      poster,
      compressionRatio: 0,
    };
  }

  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(videoFile);
    video.src = url;

    video.onloadedmetadata = async () => {
      const duration = video.duration || 1;
      let width = video.videoWidth || 1280;
      let height = video.videoHeight || 720;

      // Scale down proportionally if larger than maximum dimensions
      if (width > maxWidth || height > maxHeight) {
        const aspect = width / height;
        if (aspect >= maxWidth / maxHeight) {
          width = maxWidth;
          height = Math.round(maxWidth / aspect);
        } else {
          height = maxHeight;
          width = Math.round(maxHeight * aspect);
        }
      }

      // Ensure even dimensions for video codecs
      width = width % 2 === 0 ? width : width - 1;
      height = height % 2 === 0 ? height : height - 1;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve({
          file: videoFile,
          originalSize,
          compressedSize: originalSize,
          duration,
          poster,
          compressionRatio: 0,
        });
        return;
      }

      const stream = canvas.captureStream(targetFps);

      // Try best supported mimeType
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4',
      ];
      const supportedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, {
          mimeType: supportedMime,
          videoBitsPerSecond: videoBitrate,
        });
      } catch (err) {
        URL.revokeObjectURL(url);
        resolve({
          file: videoFile,
          originalSize,
          compressedSize: originalSize,
          duration,
          poster,
          compressionRatio: 0,
        });
        return;
      }

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        URL.revokeObjectURL(url);
        const ext = supportedMime.includes('mp4') ? 'mp4' : 'webm';
        const compressedBlob = new Blob(chunks, { type: supportedMime });
        const compressedSize = compressedBlob.size;

        // If compressed file is somehow larger than original, stick with original
        if (compressedSize >= originalSize) {
          onProgress?.(100, 'Original file is already optimal.');
          resolve({
            file: videoFile,
            originalSize,
            compressedSize: originalSize,
            duration,
            poster,
            compressionRatio: 0,
          });
          return;
        }

        const baseName = videoFile.name.replace(/\.[^/.]+$/, '');
        const compressedFile = new File([compressedBlob], `${baseName}_optimized.${ext}`, {
          type: supportedMime,
        });

        const ratio = Math.round(((originalSize - compressedSize) / originalSize) * 100);
        onProgress?.(100, `Compressed: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (${ratio}% saved)`);

        resolve({
          file: compressedFile,
          originalSize,
          compressedSize,
          duration,
          poster,
          compressionRatio: ratio,
        });
      };

      recorder.start();
      video.play();

      const drawFrame = () => {
        if (video.paused || video.ended) return;
        ctx.drawImage(video, 0, 0, width, height);

        const currentProg = Math.min(95, Math.round(10 + (video.currentTime / duration) * 85));
        onProgress?.(currentProg, `Compressing video... ${Math.round((video.currentTime / duration) * 100)}%`);

        requestAnimationFrame(drawFrame);
      };

      video.onplay = () => {
        drawFrame();
      };

      video.onended = () => {
        recorder.stop();
      };

      video.onerror = () => {
        try {
          recorder.stop();
        } catch (_) {}
        URL.revokeObjectURL(url);
        resolve({
          file: videoFile,
          originalSize,
          compressedSize: originalSize,
          duration: 0,
          poster,
          compressionRatio: 0,
        });
      };
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        file: videoFile,
        originalSize,
        compressedSize: originalSize,
        duration: 0,
        poster,
        compressionRatio: 0,
      });
    };
  });
}
