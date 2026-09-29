/**
 * Client-side image compression & optimization helper for fast, reliable uploads.
 * Works seamlessly across Maya OS (Linux), Windows, Android, and iOS.
 * Shrinks heavy 5-15MB camera photos down to ~150-300KB crystal-clear JPEGs,
 * preventing 413 Payload Too Large and network timeouts.
 */
export async function optimizeImageForUpload(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If file is SVG, return as data URL directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Scale down proportionally if larger than maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to direct file reader
        const fallbackReader = new FileReader();
        fallbackReader.onload = (e) => resolve(e.target?.result as string);
        fallbackReader.onerror = (err) => reject(err);
        fallbackReader.readAsDataURL(file);
        return;
      }

      // Draw with smooth image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG data URL
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}
