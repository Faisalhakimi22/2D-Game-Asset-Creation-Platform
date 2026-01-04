"use strict";
/**
 * Vercel Blob Storage Service
 * Wrapper around @vercel/blob for file operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlobPathBuilder = exports.blobService = void 0;
const blob_1 = require("@vercel/blob");
const blob_storage_types_1 = require("../types/blob-storage.types");
Object.defineProperty(exports, "BlobPathBuilder", { enumerable: true, get: function () { return blob_storage_types_1.BlobPathBuilder; } });
class BlobService {
    constructor() {
        this.token = process.env.BLOB_READ_WRITE_TOKEN || '';
        if (!this.token) {
            console.warn('BLOB_READ_WRITE_TOKEN not set. Blob operations will fail.');
        }
    }
    /**
     * Upload a file to Vercel Blob
     */
    async upload(input) {
        try {
            const result = await (0, blob_1.put)(input.path, input.data, {
                access: 'public',
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
                size: result.size || 0,
            };
        }
        catch (error) {
            console.error('Blob upload error:', error);
            throw error;
        }
    }
    /**
     * Delete a file from Vercel Blob
     */
    async delete(path) {
        try {
            await (0, blob_1.del)(path, { token: this.token });
        }
        catch (error) {
            console.error('Blob delete error:', error);
            throw error;
        }
    }
    /**
     * Get a signed URL for a blob (Vercel Blob URLs are public by default)
     * For private blobs, you may need to implement custom signing
     */
    async getSignedUrl(path, options) {
        // Vercel Blob URLs are public by default
        // If you need signed URLs, you may need to use a different approach
        // or implement custom URL signing
        const baseUrl = process.env.BLOB_STORAGE_URL || 'https://your-blob-storage.vercel-storage.com';
        return `${baseUrl}/${path}`;
    }
    /**
     * Get public URL for a blob
     */
    async getPublicUrl(path) {
        return this.getSignedUrl(path);
    }
    /**
     * List blobs with optional prefix
     */
    async list(options) {
        try {
            const result = await (0, blob_1.list)({
                prefix: options?.prefix,
                limit: options?.limit,
                cursor: options?.cursor,
                token: this.token,
            });
            return {
                blobs: result.blobs.map((blob) => ({
                    pathname: blob.pathname,
                    contentType: blob.contentType || 'application/octet-stream',
                    contentDisposition: blob.contentDisposition,
                    size: blob.size,
                    uploadedAt: blob.uploadedAt,
                    url: blob.url,
                })),
                cursor: result.cursor || undefined,
                hasMore: result.hasMore,
            };
        }
        catch (error) {
            console.error('Blob list error:', error);
            throw error;
        }
    }
    /**
     * Get blob metadata
     */
    async head(path) {
        try {
            const result = await (0, blob_1.head)(path, { token: this.token });
            if (!result)
                return null;
            return {
                pathname: result.pathname,
                contentType: result.contentType,
                contentDisposition: result.contentDisposition,
                size: result.size,
                uploadedAt: result.uploadedAt,
                url: result.url,
            };
        }
        catch (error) {
            console.error('Blob head error:', error);
            return null;
        }
    }
    /**
     * Check if blob exists
     */
    async exists(path) {
        const metadata = await this.head(path);
        return metadata !== null;
    }
    /**
     * Cleanup old or orphaned blobs
     */
    async cleanup(options) {
        const errors = [];
        let deleted = 0;
        let failed = 0;
        try {
            const listResult = await this.list({ prefix: options?.prefix });
            for (const blob of listResult.blobs) {
                const shouldDelete = !options?.olderThan ||
                    blob.uploadedAt < options.olderThan;
                if (shouldDelete) {
                    if (options?.dryRun) {
                        console.log(`[DRY RUN] Would delete: ${blob.pathname}`);
                        deleted++;
                    }
                    else {
                        try {
                            await this.delete(blob.pathname);
                            deleted++;
                        }
                        catch (error) {
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
        }
        catch (error) {
            console.error('Cleanup error:', error);
            throw error;
        }
    }
}
// Export singleton instance
exports.blobService = new BlobService();
