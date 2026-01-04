"use strict";
/**
 * Asset Service - Firestore
 * Handles saving and retrieving generated assets (sprites, scenes, animations)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetService = void 0;
const db_1 = require("../lib/db");
const firestore_1 = require("firebase-admin/firestore");
class AssetService {
    /**
     * Find asset by ID
     */
    static async findById(id, userId) {
        const doc = await (0, db_1.getCollection)('assets').doc(id).get();
        if (!doc.exists)
            return null;
        const data = doc.data();
        if (userId && data.user_id !== userId)
            return null;
        return { id: doc.id, ...data };
    }
    /**
     * List assets with filters
     */
    static async list(filters) {
        let query = (0, db_1.getCollection)('assets');
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
        }
        else {
            query = query.where('status', '==', 'active');
        }
        const orderBy = filters.order_by || 'created_at';
        const order = filters.order || 'desc';
        query = query.orderBy(orderBy, order);
        const limit = filters.limit || 50;
        query = query.limit(limit);
        const snapshot = await query.get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    /**
     * Create a new asset
     */
    static async create(input) {
        const now = firestore_1.Timestamp.now();
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
        const docRef = await (0, db_1.getCollection)('assets').add(assetData);
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    }
    /**
     * Create multiple assets at once (for sprite sheets, animations)
     */
    static async createMany(inputs) {
        const assets = [];
        for (const input of inputs) {
            const asset = await this.create(input);
            assets.push(asset);
        }
        return assets;
    }
    /**
     * Update asset
     */
    static async update(id, userId, updates) {
        const asset = await this.findById(id, userId);
        if (!asset)
            throw new Error('Asset not found');
        const updateData = { updated_at: firestore_1.Timestamp.now() };
        if (updates.name !== undefined)
            updateData.name = updates.name;
        if (updates.metadata !== undefined)
            updateData.metadata = { ...asset.metadata, ...updates.metadata };
        await (0, db_1.getCollection)('assets').doc(id).update(updateData);
        return this.findById(id, userId);
    }
    /**
     * Delete asset (soft delete)
     */
    static async delete(id, userId) {
        const asset = await this.findById(id, userId);
        if (!asset)
            throw new Error('Asset not found');
        await (0, db_1.getCollection)('assets').doc(id).update({
            status: 'deleted',
            updated_at: firestore_1.Timestamp.now(),
        });
    }
    /**
     * Get user's recent creations
     */
    static async getRecentByUser(userId, limit = 20) {
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
    static async getByType(userId, assetType, limit = 50) {
        return this.list({
            user_id: userId,
            asset_type: assetType,
            status: 'active',
            limit,
        });
    }
}
exports.AssetService = AssetService;
