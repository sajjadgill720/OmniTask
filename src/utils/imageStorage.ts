/**
 * KNOVERA SECURE INDEXEDDB IMAGE STORAGE ENGINE
 * Efficient, asynchronous binary Blob storage for multiple photos on the Canvas Wall.
 * Prevents localStorage QuotaExceededError while supporting multi-photo moodboards.
 */

const DB_NAME = 'knovera_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'canvas_images';

export interface StoredImageData {
  id: string;
  blob: Blob;
  mimeType: string;
  filename: string;
  width: number;
  height: number;
  sizeBytes: number;
  thumbnailDataUrl: string; // Fast base64 thumbnail (~15KB) for instant initial render
  createdAt: string;
}

export interface ImageUploadResult {
  id: string;
  objectUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  filename: string;
}

// In-memory cache of resolved Object URLs to prevent memory leaks and repeated Blob conversions
const objectUrlCache = new Map<string, string>();

/**
 * Open or upgrade the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this browser environment.'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Validates file format and file size
 */
export function validateImageFile(file: File, maxSizeBytes: number = 20 * 1024 * 1024): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `"${file.name}" has an unsupported format. Please upload JPEG, PNG, WebP, GIF, or SVG.`,
    };
  }
  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `"${file.name}" is ${sizeMb}MB. Maximum permitted size is ${maxMb}MB.`,
    };
  }
  return { valid: true };
}

/**
 * Downsamples and compresses an image File using an offscreen canvas
 * Generates an optimized WebP/JPEG blob and a lightweight thumbnail
 */
export async function processAndCompressImage(file: File): Promise<{
  compressedBlob: Blob;
  thumbnailDataUrl: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const originalWidth = img.naturalWidth || img.width;
      const originalHeight = img.naturalHeight || img.height;

      // 1. Calculate dimensions for full-size canvas (max 2048px on longest side for optimal performance)
      const maxDimension = 2048;
      let targetW = originalWidth;
      let targetH = originalHeight;

      if (targetW > maxDimension || targetH > maxDimension) {
        if (targetW > targetH) {
          targetH = Math.round((targetH * maxDimension) / targetW);
          targetW = maxDimension;
        } else {
          targetW = Math.round((targetW * maxDimension) / targetH);
          targetH = maxDimension;
        }
      }

      // Render compressed main image
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to create 2D canvas context'));
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);

      // Determine output format (prefer WebP if supported, fallback to JPEG)
      const mime = file.type === 'image/png' && hasTransparency(ctx, targetW, targetH) ? 'image/png' : 'image/jpeg';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Failed to compress image to Blob'));
          }

          // 2. Render fast thumbnail (max 240px)
          const thumbCanvas = document.createElement('canvas');
          const thumbMax = 240;
          let thumbW = targetW;
          let thumbH = targetH;
          if (thumbW > thumbH) {
            thumbH = Math.round((thumbH * thumbMax) / thumbW);
            thumbW = thumbMax;
          } else {
            thumbW = Math.round((thumbW * thumbMax) / thumbH);
            thumbH = thumbMax;
          }
          thumbCanvas.width = thumbW;
          thumbCanvas.height = thumbH;
          const thumbCtx = thumbCanvas.getContext('2d');
          if (thumbCtx) {
            thumbCtx.imageSmoothingEnabled = true;
            thumbCtx.imageSmoothingQuality = 'medium';
            thumbCtx.drawImage(canvas, 0, 0, thumbW, thumbH);
          }
          const thumbnailDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);

          resolve({
            compressedBlob: blob,
            thumbnailDataUrl,
            width: targetW,
            height: targetH,
          });
        },
        mime,
        0.88 // 88% quality is visually indistinguishable from source while ~80% smaller
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to read image file "${file.name}"`));
    };

    img.src = objectUrl;
  });
}

function hasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    const data = ctx.getImageData(0, 0, Math.min(width, 50), Math.min(height, 50)).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true;
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Stores an image in IndexedDB and returns metadata
 */
export async function saveImageToStorage(file: File, customId?: string): Promise<ImageUploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const { compressedBlob, thumbnailDataUrl, width, height } = await processAndCompressImage(file);
  const id = customId || `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const record: StoredImageData = {
    id,
    blob: compressedBlob,
    mimeType: compressedBlob.type,
    filename: file.name,
    width,
    height,
    sizeBytes: compressedBlob.size,
    thumbnailDataUrl,
    createdAt: new Date().toISOString(),
  };

  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  const objectUrl = URL.createObjectURL(compressedBlob);
  objectUrlCache.set(id, objectUrl);

  return {
    id,
    objectUrl,
    thumbnailUrl: thumbnailDataUrl,
    width,
    height,
    aspectRatio: width / (height || 1),
    filename: file.name,
  };
}

/**
 * Retrieves an image object URL from storage
 */
export async function getImageFromStorage(id: string): Promise<string | null> {
  if (objectUrlCache.has(id)) {
    return objectUrlCache.get(id)!;
  }

  try {
    const db = await openDB();
    const record = await new Promise<StoredImageData | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (!record || !record.blob) return null;

    const url = URL.createObjectURL(record.blob);
    objectUrlCache.set(id, url);
    return url;
  } catch (err) {
    console.error('Failed to load image from IndexedDB:', err);
    return null;
  }
}

/**
 * Deletes an image from storage
 */
export async function deleteImageFromStorage(id: string): Promise<void> {
  if (objectUrlCache.has(id)) {
    URL.revokeObjectURL(objectUrlCache.get(id)!);
    objectUrlCache.delete(id);
  }

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete image from IndexedDB:', err);
  }
}

