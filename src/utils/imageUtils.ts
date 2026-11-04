/**
 * Image compression and upload utility.
 * Resizes images client-side to maximum 1200px and converts to ~100-150KB JPEG.
 * Uploads compressed images to Supabase Storage bucket 'blog-images'.
 */

import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

export interface CompressResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  originalSizeKb: number;
  compressedSizeKb: number;
}

/**
 * Compresses an image file client-side using HTML5 Canvas.
 * Caps maximum dimension at 1200px and targets ~100-150KB JPEG quality.
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<CompressResult> {
  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Proportional resize if either dimension exceeds max
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight = height;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Clean white fill for transparent PNGs converted to JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create compressed blob'));
              return;
            }
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            const compressedSizeKb = Math.round(blob.size / 1024);
            resolve({
              blob,
              dataUrl,
              width,
              height,
              originalSizeKb,
              compressedSizeKb,
            });
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a compressed image blob to Supabase Storage bucket 'blog-images'.
 * Returns the public CDN URL.
 */
export async function uploadImageToSupabaseStorage(
  blob: Blob,
  folder = 'posts'
): Promise<string> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured yet. Please enter your Supabase Project URL and Anon Key in Database Settings.'
    );
  }

  // Generate safe unique filename
  const cleanFolder = folder.replace(/[^a-z0-9_-]/gi, '');
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const filePath = `${cleanFolder}/${timestamp}-${randomSuffix}.jpg`;

  const { data, error } = await client.storage
    .from('blog-images')
    .upload(filePath, blob, {
      contentType: 'image/jpeg',
      cacheControl: '31536000', // 1 year cache
      upsert: false,
    });

  if (error) {
    if (error.message?.includes('Bucket not found') || (error as any).statusCode === 404) {
      throw new Error(
        "Supabase Storage bucket 'blog-images' not found. Please create a public bucket named 'blog-images' in your Supabase Dashboard -> Storage."
      );
    }
    if (error.message?.includes('row-level security') || error.message?.includes('violates')) {
      throw new Error(
        "Storage RLS Policy missing: Supabase bucket 'blog-images' par photo upload allow karne ke liye SQL Editor mein Storage Policy run karein."
      );
    }
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicData } = client.storage
    .from('blog-images')
    .getPublicUrl(data.path);

  if (!publicData || !publicData.publicUrl) {
    throw new Error('Failed to get public URL for uploaded image');
  }

  return publicData.publicUrl;
}
