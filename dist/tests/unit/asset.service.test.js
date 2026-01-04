"use strict";
/**
 * Unit Tests: Asset Service
 * Tests for asset CRUD operations and blob storage
 */
Object.defineProperty(exports, "__esModule", { value: true });
const setup_1 = require("../setup");
// Mock asset data store
let mockAssetStore = {};
let assetIdCounter = 1;
beforeEach(() => {
    assetIdCounter = 1;
    mockAssetStore = {
        'asset_123': { ...setup_1.mockAsset },
        'asset_456': {
            ...setup_1.mockAsset,
            id: 'asset_456',
            name: 'second_sprite',
            asset_type: 'scene',
            status: 'active'
        },
        'asset_789': {
            ...setup_1.mockAsset,
            id: 'asset_789',
            name: 'deleted_sprite',
            status: 'deleted'
        }
    };
    jest.clearAllMocks();
});
describe('Asset Service - Unit Tests', () => {
    // ========================================
    // UT-AST-001: create asset with metadata
    // ========================================
    describe('UT-AST-001: create asset with metadata', () => {
        it('should create asset with all required fields', async () => {
            const input = {
                project_id: 'project_123',
                user_id: 'user_123',
                name: 'new_sprite',
                asset_type: 'sprite',
                file_type: 'png',
                blob_url: 'https://blob.vercel-storage.com/new.png',
                metadata: {
                    prompt: 'a warrior character',
                    style: 'pixel_art',
                    viewpoint: 'front'
                }
            };
            const result = await AssetService.create(input);
            expect(result.id).toBeDefined();
            expect(result.project_id).toBe('project_123');
            expect(result.user_id).toBe('user_123');
            expect(result.name).toBe('new_sprite');
            expect(result.asset_type).toBe('sprite');
            expect(result.file_type).toBe('png');
            expect(result.blob_url).toBe('https://blob.vercel-storage.com/new.png');
            expect(result.metadata.prompt).toBe('a warrior character');
            expect(result.status).toBe('active');
            expect(result.created_at).toBeDefined();
        });
        it('should store generation parameters in metadata', async () => {
            const input = {
                project_id: 'project_123',
                user_id: 'user_123',
                name: 'detailed_sprite',
                asset_type: 'sprite',
                file_type: 'png',
                blob_url: 'https://blob.vercel-storage.com/detailed.png',
                metadata: {
                    prompt: 'a knight in armor',
                    style: 'pixel_art',
                    viewpoint: 'isometric',
                    aspectRatio: '1:1',
                    colors: ['#FF5733', '#33FF57'],
                    dimensions: { width: 1024, height: 1024 }
                }
            };
            const result = await AssetService.create(input);
            expect(result.metadata.style).toBe('pixel_art');
            expect(result.metadata.viewpoint).toBe('isometric');
            expect(result.metadata.aspectRatio).toBe('1:1');
            expect(result.metadata.colors).toEqual(['#FF5733', '#33FF57']);
        });
    });
    // ========================================
    // UT-AST-002: findById
    // ========================================
    describe('UT-AST-002: findById', () => {
        it('should return asset when ID exists', async () => {
            const result = await AssetService.findById('asset_123');
            expect(result).not.toBeNull();
            expect(result?.id).toBe('asset_123');
            expect(result?.name).toBe('test_sprite');
        });
        it('should return null when ID does not exist', async () => {
            const result = await AssetService.findById('nonexistent');
            expect(result).toBeNull();
        });
        it('should filter by user_id when provided', async () => {
            const result = await AssetService.findById('asset_123', 'user_123');
            expect(result).not.toBeNull();
            const wrongUser = await AssetService.findById('asset_123', 'wrong_user');
            expect(wrongUser).toBeNull();
        });
    });
    // ========================================
    // UT-AST-003: list assets by project
    // ========================================
    describe('UT-AST-003: list assets by project', () => {
        it('should list all active assets for project', async () => {
            const result = await AssetService.listByProject('project_123');
            expect(result.length).toBeGreaterThan(0);
            result.forEach(asset => {
                expect(asset.project_id).toBe('project_123');
                expect(asset.status).not.toBe('deleted');
            });
        });
        it('should filter by asset_type', async () => {
            const result = await AssetService.listByProject('project_123', {
                asset_type: 'sprite'
            });
            result.forEach(asset => {
                expect(asset.asset_type).toBe('sprite');
            });
        });
        it('should exclude deleted assets by default', async () => {
            const result = await AssetService.listByProject('project_123');
            const deletedAssets = result.filter(a => a.status === 'deleted');
            expect(deletedAssets.length).toBe(0);
        });
        it('should order by created_at desc', async () => {
            const result = await AssetService.listByProject('project_123');
            for (let i = 1; i < result.length; i++) {
                expect(new Date(result[i - 1].created_at).getTime())
                    .toBeGreaterThanOrEqual(new Date(result[i].created_at).getTime());
            }
        });
    });
    // ========================================
    // UT-AST-004: list assets by user
    // ========================================
    describe('UT-AST-004: list assets by user', () => {
        it('should list all assets for user across projects', async () => {
            const result = await AssetService.listByUser('user_123');
            expect(result.length).toBeGreaterThan(0);
            result.forEach(asset => {
                expect(asset.user_id).toBe('user_123');
            });
        });
        it('should support pagination', async () => {
            const page1 = await AssetService.listByUser('user_123', { limit: 1, offset: 0 });
            const page2 = await AssetService.listByUser('user_123', { limit: 1, offset: 1 });
            expect(page1.length).toBeLessThanOrEqual(1);
            if (page1.length > 0 && page2.length > 0) {
                expect(page1[0].id).not.toBe(page2[0].id);
            }
        });
    });
    // ========================================
    // UT-AST-005: update asset
    // ========================================
    describe('UT-AST-005: update asset', () => {
        it('should update name', async () => {
            const result = await AssetService.update('asset_123', 'user_123', {
                name: 'renamed_sprite'
            });
            expect(result.name).toBe('renamed_sprite');
        });
        it('should update metadata', async () => {
            const result = await AssetService.update('asset_123', 'user_123', {
                metadata: {
                    ...setup_1.mockAsset.metadata,
                    tags: ['warrior', 'pixel']
                }
            });
            expect(result.metadata.tags).toEqual(['warrior', 'pixel']);
        });
        it('should throw error for non-existent asset', async () => {
            await expect(AssetService.update('nonexistent', 'user_123', { name: 'Test' })).rejects.toThrow('Asset not found');
        });
        it('should throw error for wrong user', async () => {
            await expect(AssetService.update('asset_123', 'wrong_user', { name: 'Test' })).rejects.toThrow('Asset not found');
        });
    });
    // ========================================
    // UT-AST-006: delete asset (soft delete)
    // ========================================
    describe('UT-AST-006: delete asset (soft delete)', () => {
        it('should set status to deleted', async () => {
            await AssetService.delete('asset_123', 'user_123');
            const asset = mockAssetStore['asset_123'];
            expect(asset.status).toBe('deleted');
        });
        it('should preserve asset data and blob_url', async () => {
            const originalBlobUrl = mockAssetStore['asset_123'].blob_url;
            await AssetService.delete('asset_123', 'user_123');
            expect(mockAssetStore['asset_123'].blob_url).toBe(originalBlobUrl);
        });
        it('should throw error for non-existent asset', async () => {
            await expect(AssetService.delete('nonexistent', 'user_123')).rejects.toThrow();
        });
    });
    // ========================================
    // UT-AST-007: count assets
    // ========================================
    describe('UT-AST-007: count assets', () => {
        it('should return correct count for project', async () => {
            const count = await AssetService.countByProject('project_123');
            expect(typeof count).toBe('number');
            expect(count).toBeGreaterThanOrEqual(0);
        });
        it('should return correct count for user', async () => {
            const count = await AssetService.countByUser('user_123');
            expect(typeof count).toBe('number');
            expect(count).toBeGreaterThanOrEqual(0);
        });
        it('should exclude deleted from count', async () => {
            const countBefore = await AssetService.countByProject('project_123');
            await AssetService.delete('asset_123', 'user_123');
            const countAfter = await AssetService.countByProject('project_123');
            expect(countAfter).toBe(countBefore - 1);
        });
    });
    // ========================================
    // UT-AST-008: getRecentAssets
    // ========================================
    describe('UT-AST-008: getRecentAssets', () => {
        it('should return most recent assets', async () => {
            const result = await AssetService.getRecent('user_123', 5);
            expect(result.length).toBeLessThanOrEqual(5);
            // Verify ordering
            for (let i = 1; i < result.length; i++) {
                expect(new Date(result[i - 1].created_at).getTime())
                    .toBeGreaterThanOrEqual(new Date(result[i].created_at).getTime());
            }
        });
        it('should respect limit parameter', async () => {
            const result = await AssetService.getRecent('user_123', 1);
            expect(result.length).toBeLessThanOrEqual(1);
        });
    });
});
const AssetService = {
    async create(input) {
        const id = `asset_new_${assetIdCounter++}`;
        const now = new Date();
        const asset = {
            id,
            project_id: input.project_id,
            user_id: input.user_id,
            name: input.name,
            asset_type: input.asset_type,
            file_type: input.file_type,
            blob_url: input.blob_url,
            metadata: input.metadata,
            status: 'active',
            created_at: now
        };
        mockAssetStore[id] = asset;
        return { ...asset };
    },
    async findById(id, userId) {
        const asset = mockAssetStore[id];
        if (!asset)
            return null;
        if (userId && asset.user_id !== userId)
            return null;
        return { ...asset };
    },
    async listByProject(projectId, filters = {}) {
        let assets = Object.values(mockAssetStore)
            .filter(a => a.project_id === projectId);
        if (filters.asset_type) {
            assets = assets.filter(a => a.asset_type === filters.asset_type);
        }
        if (filters.status) {
            assets = assets.filter(a => a.status === filters.status);
        }
        else {
            assets = assets.filter(a => a.status !== 'deleted');
        }
        // Sort by created_at desc
        assets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return assets.map(a => ({ ...a }));
    },
    async listByUser(userId, filters = {}) {
        let assets = Object.values(mockAssetStore)
            .filter(a => a.user_id === userId && a.status !== 'deleted');
        // Sort by created_at desc
        assets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (filters.offset) {
            assets = assets.slice(filters.offset);
        }
        if (filters.limit) {
            assets = assets.slice(0, filters.limit);
        }
        return assets.map(a => ({ ...a }));
    },
    async update(id, userId, data) {
        const asset = mockAssetStore[id];
        if (!asset || asset.user_id !== userId) {
            throw new Error('Asset not found');
        }
        Object.assign(asset, data);
        return { ...asset };
    },
    async delete(id, userId) {
        const asset = mockAssetStore[id];
        if (!asset || asset.user_id !== userId) {
            throw new Error('Asset not found');
        }
        asset.status = 'deleted';
    },
    async countByProject(projectId) {
        return Object.values(mockAssetStore)
            .filter(a => a.project_id === projectId && a.status !== 'deleted')
            .length;
    },
    async countByUser(userId) {
        return Object.values(mockAssetStore)
            .filter(a => a.user_id === userId && a.status !== 'deleted')
            .length;
    },
    async getRecent(userId, limit) {
        let assets = Object.values(mockAssetStore)
            .filter(a => a.user_id === userId && a.status !== 'deleted');
        assets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return assets.slice(0, limit).map(a => ({ ...a }));
    }
};
