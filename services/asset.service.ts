/**
 * Asset Service - Firestore
 * Handles saving and retrieving generated assets (sprites, scenes, animations)
 */

import { getCollection } from '../lib/db';
import { Timestamp } from 'firebase-admin/firestore';

export interface CreateAssetInput {
    project_id?: string;
    user_id: string;
    name?: string;
    asset_type: 'sprite' | 'scene' | 'animation' | 'reference_image' | 'pose_image' | 'variant' | 'export';
    file_type: 'png' | 'jpg' | 'jpeg' | 'webp' | 'gif' | 'json' | 'zip';
    blob_url: string;
    blob_path?: string;
    file_size?: number;
    width?: number;
    height?: number;
    mime_type?: string;
    metadata?: {
        prompt?: string;
        style?: string;
        viewpoint?: string;
        dimensions?: string;
        colors?: string[];
        direction?: string;
        animation_type?: string;
        frame_count?: number;
        generation_params?: Record<string, any>;
        [key: string]: any;
    };
}

export interface Asset extends CreateAssetInput {
    id: string;
    status: 'active' | 'deleted' | 'processing';
    created_at: FirebaseFirestore.Timestamp;
    updated_at: FirebaseFirestore.Timestamp;
}

export interface AssetQueryFilters {
    user_id?: string;
    project_id?: string;
    asset_type?: string;
    status?: string;
    limit?: number;
    offset?: number;
    order_by?: string;
    order?: 'asc' | 'desc';
}

export class AssetService {
    /**
     * Find asset by ID
     */
    static async findById(id: string, userId?: string): Promise<Asset | null> {
        const doc = await getCollection('assets').doc(id).get();
        if (!doc.exists) return null;

        const data = doc.data() as any;
        if (userId && data.user_id !== userId) return null;

        return { id: doc.id, ...data } as Asset;
    }

    /**
     * List assets with filters
     */
    static async list(filters: AssetQueryFilters): Promise<Asset[]> {
        let query = getCollection('assets') as any;

        if (filters.user_id) {
            query = query.where('user_id', '==', filters.user_id);
        }

        if (filters.project_id) {
            query = query.where('project_id', '==', filters.project_id);
        }

        if (filters.asset_type) {
            query = query.where('asset_type', '==', filters.asset_type);
        }

        if (filters.status) {
            query = query.where('status', '==', filters.status);
        } else {
            query = query.where('status', '==', 'active');
        }

        const orderBy = filters.order_by || 'created_at';
        const order = filters.order || 'desc';
        query = query.orderBy(orderBy, order);

        const limit = filters.limit || 50;
        query = query.limit(limit);

        const snapshot = await query.get();
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Asset));
    }

    /**
     * Create a new asset
     */
    static async create(input: CreateAssetInput): Promise<Asset> {
        const now = Timestamp.now();
        const assetData = {
            project_id: input.project_id || null,
            user_id: input.user_id,
            name: input.name || null,
            asset_type: input.asset_type,
            file_type: input.file_type,
            blob_url: input.blob_url,
            blob_path: input.blob_path || null,
            file_size: input.file_size || null,
            width: input.width || null,
            height: input.height || null,
            mime_type: input.mime_type || null,
            metadata: input.metadata || {},
            status: 'active',
            created_at: now,
            updated_at: now,
        };

        const docRef = await getCollection('assets').add(assetData);
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() } as Asset;
    }

    /**
     * Create multiple assets at once (for sprite sheets, animations)
     */
    static async createMany(inputs: CreateAssetInput[]): Promise<Asset[]> {
        const assets: Asset[] = [];
        for (const input of inputs) {
            const asset = await this.create(input);
            assets.push(asset);
        }
        return assets;
    }

    /**
     * Update asset
     */
    static async update(id: string, userId: string, updates: Partial<CreateAssetInput>): Promise<Asset> {
        const asset = await this.findById(id, userId);
        if (!asset) throw new Error('Asset not found');

        const updateData: any = { updated_at: Timestamp.now() };

        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.project_id !== undefined) updateData.project_id = updates.project_id;
        if (updates.metadata !== undefined) updateData.metadata = { ...asset.metadata, ...updates.metadata };

        await getCollection('assets').doc(id).update(updateData);
        return this.findById(id, userId) as Promise<Asset>;
    }

    /**
     * Delete asset (soft delete)
     */
    static async delete(id: string, userId: string): Promise<void> {
        const asset = await this.findById(id, userId);
        if (!asset) throw new Error('Asset not found');

        await getCollection('assets').doc(id).update({
            status: 'deleted',
            updated_at: Timestamp.now(),
        });
    }

    /**
     * Get user's recent creations
     */
    static async getRecentByUser(userId: string, limit: number = 20): Promise<Asset[]> {
        return this.list({
            user_id: userId,
            status: 'active',
            limit,
            order_by: 'created_at',
            order: 'desc',
        });
    }

    /**
     * Get assets by type for a user
     */
    static async getByType(userId: string, assetType: string, limit: number = 50): Promise<Asset[]> {
        return this.list({
            user_id: userId,
            asset_type: assetType,
            status: 'active',
            limit,
        });
    }
}
