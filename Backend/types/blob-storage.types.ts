/**
 * Vercel Blob Storage Type Definitions
 * These types define the structure and paths for Vercel Blob storage
 */

// ============================================
// BLOB PATH TYPES
// ============================================

export type BlobCategory = 'users' | 'projects' | 'temp';
export type BlobSubcategory = 
  | 'avatar' 
  | 'thumbnails' 
  | 'sprites' 
  | 'scenes' 
  | 'references' 
  | 'poses' 
  | 'exports';

export interface BlobPathComponents {
  userId: string;
  projectId?: string;
  category: BlobCategory;
  subcategory?: BlobSubcategory;
  filename: string;
}

// ============================================
// BLOB PATH BUILDERS
// ============================================

export class BlobPathBuilder {
  /**
   * Build path for user avatar
   */
  static avatar(userId: string, filename: string): string {
    return `users/${userId}/avatar/${filename}`;
  }

  /**
   * Build path for project thumbnail
   */
  static thumbnail(userId: string, projectId: string, filename: string): string {
    return `users/${userId}/projects/${projectId}/thumbnails/${filename}`;
  }

  /**
   * Build path for sprite asset
   */
  static sprite(
    userId: string,
    projectId: string,
    assetId: string,
    variant: number | 'original' = 'original',
    extension: string = 'png'
  ): string {
    const variantSuffix = variant === 'original' ? 'original' : `variant-${variant}`;
    return `users/${userId}/projects/${projectId}/sprites/sprite-${assetId}-${variantSuffix}.${extension}`;
  }

  /**
   * Build path for scene asset
   */
  static scene(
    userId: string,
    projectId: string,
    assetId: string,
    variant: number | 'original' = 'original',
    extension: string = 'png'
  ): string {
    const variantSuffix = variant === 'original' ? 'original' : `variant-${variant}`;
    return `users/${userId}/projects/${projectId}/scenes/scene-${assetId}-${variantSuffix}.${extension}`;
  }

  /**
   * Build path for reference image
   */
  static reference(
    userId: string,
    projectId: string,
    assetId: string,
    extension: string = 'png'
  ): string {
    return `users/${userId}/projects/${projectId}/references/reference-${assetId}.${extension}`;
  }

  /**
   * Build path for pose image
   */
  static pose(
    userId: string,
    projectId: string,
    assetId: string,
    extension: string = 'png'
  ): string {
    return `users/${userId}/projects/${projectId}/poses/pose-${assetId}.${extension}`;
  }

  /**
   * Build path for exported asset
   */
  static export(
    userId: string,
    projectId: string,
    assetId: string,
    engine: 'unity' | 'godot' | 'unreal',
    extension: string = 'png'
  ): string {
    return `users/${userId}/projects/${projectId}/exports/export-${assetId}-${engine}.${extension}`;
  }

  /**
   * Build path for temporary file
   */
  static temp(userId: string, tempId: string, extension: string = 'png'): string {
    return `users/${userId}/temp/${tempId}.${extension}`;
  }

  /**
   * Parse blob path into components
   */
  static parse(path: string): BlobPathComponents | null {
    const parts = path.split('/');
    
    if (parts.length < 3) return null;

    const category = parts[0] as BlobCategory;
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
      const subcategory = parts[4] as BlobSubcategory;
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

// ============================================
// BLOB UPLOAD TYPES
// ============================================

export interface BlobUploadOptions {
  contentType?: string;
  access?: 'public' | 'private';
  addRandomSuffix?: boolean;
  cacheControlMaxAge?: number;
}

export interface BlobUploadResult {
  url: string;
  pathname: string;
  contentType?: string;
  contentDisposition?: string;
  size: number;
}

export interface BlobUploadInput {
  path: string;
  data: Buffer | Uint8Array | string;
  options?: BlobUploadOptions;
}

// ============================================
// BLOB URL TYPES
// ============================================

export interface SignedUrlOptions {
  expiresIn?: number; // seconds, default 3600 (1 hour)
}

export interface BlobUrlInfo {
  url: string;
  path: string;
  expiresAt?: Date;
  isPublic: boolean;
}

// ============================================
// BLOB METADATA TYPES
// ============================================

export interface BlobMetadata {
  pathname: string;
  contentType: string;
  contentDisposition?: string;
  size: number;
  uploadedAt: Date;
  url: string;
}

export interface BlobListOptions {
  prefix?: string;
  limit?: number;
  cursor?: string;
}

export interface BlobListResult {
  blobs: BlobMetadata[];
  cursor?: string;
  hasMore: boolean;
}

// ============================================
// FILE VALIDATION TYPES
// ============================================

export type AllowedFileType = 'png' | 'jpg' | 'jpeg' | 'webp' | 'gif' | 'json' | 'zip';
export type AllowedMimeType = 
  | 'image/png'
  | 'image/jpeg'
  | 'image/jpg'
  | 'image/webp'
  | 'image/gif'
  | 'application/json'
  | 'application/zip';

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  fileType?: AllowedFileType;
  mimeType?: AllowedMimeType;
  size?: number;
}

export interface FileSizeLimits {
  sprite: number; // 5MB
  scene: number; // 20MB
  reference: number; // 10MB
  pose: number; // 2MB
  export: number; // 50MB
}

export const DEFAULT_FILE_SIZE_LIMITS: FileSizeLimits = {
  sprite: 5 * 1024 * 1024, // 5MB
  scene: 20 * 1024 * 1024, // 20MB
  reference: 10 * 1024 * 1024, // 10MB
  pose: 2 * 1024 * 1024, // 2MB
  export: 50 * 1024 * 1024, // 50MB
};

// ============================================
// BLOB CLEANUP TYPES
// ============================================

export interface CleanupOptions {
  olderThan?: Date; // Delete files older than this date
  prefix?: string; // Only delete files with this prefix
  dryRun?: boolean; // Don't actually delete, just return list
}

export interface CleanupResult {
  deleted: number;
  failed: number;
  errors: Array<{ path: string; error: string }>;
}

// ============================================
// BLOB SERVICE INTERFACE
// ============================================

export interface IBlobService {
  /**
   * Upload a file to Vercel Blob
   */
  upload(input: BlobUploadInput): Promise<BlobUploadResult>;

  /**
   * Delete a file from Vercel Blob
   */
  delete(path: string): Promise<void>;

  /**
   * Get a signed URL for a blob
   */
  getSignedUrl(path: string, options?: SignedUrlOptions): Promise<string>;

  /**
   * Get public URL for a blob
   */
  getPublicUrl(path: string): Promise<string>;

  /**
   * List blobs with optional prefix
   */
  list(options?: BlobListOptions): Promise<BlobListResult>;

  /**
   * Get blob metadata
   */
  head(path: string): Promise<BlobMetadata | null>;

  /**
   * Check if blob exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Cleanup old or orphaned blobs
   */
  cleanup(options?: CleanupOptions): Promise<CleanupResult>;
}

