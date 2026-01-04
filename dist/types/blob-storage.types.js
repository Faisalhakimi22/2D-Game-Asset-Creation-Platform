"use strict";
/**
 * Vercel Blob Storage Type Definitions
 * These types define the structure and paths for Vercel Blob storage
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_FILE_SIZE_LIMITS = exports.BlobPathBuilder = void 0;
// ============================================
// BLOB PATH BUILDERS
// ============================================
class BlobPathBuilder {
    /**
     * Build path for user avatar
     */
    static avatar(userId, filename) {
        return `users/${userId}/avatar/${filename}`;
    }
    /**
     * Build path for project thumbnail
     */
    static thumbnail(userId, projectId, filename) {
        return `users/${userId}/projects/${projectId}/thumbnails/${filename}`;
    }
    /**
     * Build path for sprite asset
     */
    static sprite(userId, projectId, assetId, variant = 'original', extension = 'png') {
        const variantSuffix = variant === 'original' ? 'original' : `variant-${variant}`;
        return `users/${userId}/projects/${projectId}/sprites/sprite-${assetId}-${variantSuffix}.${extension}`;
    }
    /**
     * Build path for scene asset
     */
    static scene(userId, projectId, assetId, variant = 'original', extension = 'png') {
        const variantSuffix = variant === 'original' ? 'original' : `variant-${variant}`;
        return `users/${userId}/projects/${projectId}/scenes/scene-${assetId}-${variantSuffix}.${extension}`;
    }
    /**
     * Build path for reference image
     */
    static reference(userId, projectId, assetId, extension = 'png') {
        return `users/${userId}/projects/${projectId}/references/reference-${assetId}.${extension}`;
    }
    /**
     * Build path for pose image
     */
    static pose(userId, projectId, assetId, extension = 'png') {
        return `users/${userId}/projects/${projectId}/poses/pose-${assetId}.${extension}`;
    }
    /**
     * Build path for exported asset
     */
    static export(userId, projectId, assetId, engine, extension = 'png') {
        return `users/${userId}/projects/${projectId}/exports/export-${assetId}-${engine}.${extension}`;
    }
    /**
     * Build path for temporary file
     */
    static temp(userId, tempId, extension = 'png') {
        return `users/${userId}/temp/${tempId}.${extension}`;
    }
    /**
     * Parse blob path into components
     */
    static parse(path) {
        const parts = path.split('/');
        if (parts.length < 3)
            return null;
        const category = parts[0];
        const userId = parts[1];
        if (category === 'users' && parts[2] === 'avatar') {
            return {
                userId,
                category: 'users',
                subcategory: 'avatar',
                filename: parts.slice(3).join('/'),
            };
        }
        if (category === 'users' && parts[2] === 'projects' && parts.length >= 6) {
            const projectId = parts[3];
            const subcategory = parts[4];
            const filename = parts.slice(5).join('/');
            return {
                userId,
                projectId,
                category: 'users',
                subcategory,
                filename,
            };
        }
        if (category === 'users' && parts[2] === 'temp') {
            return {
                userId,
                category: 'users',
                subcategory: undefined,
                filename: parts.slice(3).join('/'),
            };
        }
        return null;
    }
}
exports.BlobPathBuilder = BlobPathBuilder;
exports.DEFAULT_FILE_SIZE_LIMITS = {
    sprite: 5 * 1024 * 1024, // 5MB
    scene: 20 * 1024 * 1024, // 20MB
    reference: 10 * 1024 * 1024, // 10MB
    pose: 2 * 1024 * 1024, // 2MB
    export: 50 * 1024 * 1024, // 50MB
};
