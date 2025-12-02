/**
 * Vercel Blob Storage Service
 * Wrapper around @vercel/blob for file operations
 */

import { put, del, head, list } from '@vercel/blob';
import type { PutBlobResult, ListBlobResult, Blob } from '@vercel/blob';
import { BlobPathBuilder, type BlobUploadInput, type BlobUploadResult, type IBlobService } from '../types/blob-storage.types';

class BlobService implements IBlobService {
  private token: string;

  constructor() {
    this.token = process.env.BLOB_READ_WRITE_TOKEN || '';
    if (!this.token) {
      console.warn('BLOB_READ_WRITE_TOKEN not set. Blob operations will fail.');
    }
  }

  /**
   * Upload a file to Vercel Blob
   */
  async upload(input: BlobUploadInput): Promise<BlobUploadResult> {
    try {
      const result = await put(input.path, input.data, {
        access: input.options?.access || 'public',
        token: this.token,
        contentType: input.options?.contentType,
        addRandomSuffix: input.options?.addRandomSuffix || false,
        cacheControlMaxAge: input.options?.cacheControlMaxAge,
      });

      return {
        url: result.url,
        pathname: result.pathname,
        contentType: result.contentType,
        contentDisposition: result.contentDisposition,
        size: result.size,
      };
    } catch (error) {
      console.error('Blob upload error:', error);
      throw error;
    }
  }

  /**
   * Delete a file from Vercel Blob
   */
  async delete(path: string): Promise<void> {
    try {
      await del(path, { token: this.token });
    } catch (error) {
      console.error('Blob delete error:', error);
      throw error;
    }
  }

  /**
   * Get a signed URL for a blob (Vercel Blob URLs are public by default)
   * For private blobs, you may need to implement custom signing
   */
  async getSignedUrl(path: string, options?: { expiresIn?: number }): Promise<string> {
    // Vercel Blob URLs are public by default
    // If you need signed URLs, you may need to use a different approach
    // or implement custom URL signing
    const baseUrl = process.env.BLOB_STORAGE_URL || 'https://your-blob-storage.vercel-storage.com';
    return `${baseUrl}/${path}`;
  }

  /**
   * Get public URL for a blob
   */
  async getPublicUrl(path: string): Promise<string> {
    return this.getSignedUrl(path);
  }

  /**
   * List blobs with optional prefix
   */
  async list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    blobs: Array<{
      pathname: string;
      contentType: string;
      contentDisposition?: string;
      size: number;
      uploadedAt: Date;
      url: string;
    }>;
    cursor?: string;
    hasMore: boolean;
  }> {
    try {
      const result: ListBlobResult = await list({
        prefix: options?.prefix,
        limit: options?.limit,
        cursor: options?.cursor,
        token: this.token,
      });

      return {
        blobs: result.blobs.map((blob: Blob) => ({
          pathname: blob.pathname,
          contentType: blob.contentType,
          contentDisposition: blob.contentDisposition,
          size: blob.size,
          uploadedAt: blob.uploadedAt,
          url: blob.url,
        })),
        cursor: result.cursor || undefined,
        hasMore: result.hasMore,
      };
    } catch (error) {
      console.error('Blob list error:', error);
      throw error;
    }
  }

  /**
   * Get blob metadata
   */
  async head(path: string): Promise<{
    pathname: string;
    contentType: string;
    contentDisposition?: string;
    size: number;
    uploadedAt: Date;
    url: string;
  } | null> {
    try {
      const result = await head(path, { token: this.token });
      if (!result) return null;

      return {
        pathname: result.pathname,
        contentType: result.contentType,
        contentDisposition: result.contentDisposition,
        size: result.size,
        uploadedAt: result.uploadedAt,
        url: result.url,
      };
    } catch (error) {
      console.error('Blob head error:', error);
      return null;
    }
  }

  /**
   * Check if blob exists
   */
  async exists(path: string): Promise<boolean> {
    const metadata = await this.head(path);
    return metadata !== null;
  }

  /**
   * Cleanup old or orphaned blobs
   */
  async cleanup(options?: {
    olderThan?: Date;
    prefix?: string;
    dryRun?: boolean;
  }): Promise<{
    deleted: number;
    failed: number;
    errors: Array<{ path: string; error: string }>;
  }> {
    const errors: Array<{ path: string; error: string }> = [];
    let deleted = 0;
    let failed = 0;

    try {
      const listResult = await this.list({ prefix: options?.prefix });
      
      for (const blob of listResult.blobs) {
        const shouldDelete = 
          !options?.olderThan || 
          blob.uploadedAt < options.olderThan;

        if (shouldDelete) {
          if (options?.dryRun) {
            console.log(`[DRY RUN] Would delete: ${blob.pathname}`);
            deleted++;
          } else {
            try {
              await this.delete(blob.pathname);
              deleted++;
            } catch (error: any) {
              failed++;
              errors.push({
                path: blob.pathname,
                error: error.message || 'Unknown error',
              });
            }
          }
        }
      }

      return { deleted, failed, errors };
    } catch (error: any) {
      console.error('Cleanup error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const blobService = new BlobService();

// Export path builder utilities
export { BlobPathBuilder };

