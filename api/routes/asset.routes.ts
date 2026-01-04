/**
 * Asset Routes
 * Handles asset management operations
 */

import { Router, Request, Response } from 'express';
import { verifyToken } from '../../lib/auth';
import { UserService } from '../../services/user.service';
import { AssetService } from '../../services/asset.service';

const router = Router();

// GET /api/assets - List user's assets
router.get('/', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing authorization' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const user = await UserService.findByFirebaseUid(decodedToken.uid);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { unassigned, asset_type, limit } = req.query;

        // Build filters
        const filters: any = {
            user_id: user.id,
            status: 'active',
            limit: limit ? parseInt(limit as string) : 50,
        };

        if (asset_type) {
            filters.asset_type = asset_type as string;
        }

        let assets = await AssetService.list(filters);

        // Filter for unassigned assets (no project_id)
        if (unassigned === 'true') {
            assets = assets.filter(a => !a.project_id);
        }

        res.json({ success: true, assets });
    } catch (error: any) {
        console.error('List assets error:', error);
        res.status(500).json({ error: 'Failed to list assets' });
    }
});

// PUT /api/assets/:id - Update asset (e.g., add to project)
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing authorization' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const user = await UserService.findByFirebaseUid(decodedToken.uid);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { id } = req.params;
        const { name, project_id, metadata } = req.body;

        const asset = await AssetService.update(id, user.id, {
            name,
            project_id,
            metadata,
        });

        res.json({ success: true, asset });
    } catch (error: any) {
        if (error.message === 'Asset not found') {
            return res.status(404).json({ error: 'Asset not found' });
        }
        console.error('Update asset error:', error);
        res.status(500).json({ error: 'Failed to update asset' });
    }
});

// DELETE /api/assets/:id - Delete asset
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing authorization' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const user = await UserService.findByFirebaseUid(decodedToken.uid);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { id } = req.params;
        await AssetService.delete(id, user.id);

        res.json({ success: true, message: 'Asset deleted' });
    } catch (error: any) {
        console.error('Delete asset error:', error);
        res.status(500).json({ error: 'Failed to delete asset' });
    }
});

export default router;
