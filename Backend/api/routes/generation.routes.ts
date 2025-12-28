/**
 * Generation Routes
 * Handles sprite and scene generation endpoints
 */

import { Router, Request, Response } from 'express';
import { verifyToken } from '../../lib/auth';
import { generateImages, uploadGeneratedImage, generateAnimationFrames } from '../../services/generation.service';
import { UserService } from '../../services/user.service';
import { AssetService } from '../../services/asset.service';
import { ProjectService } from '../../services/project.service';

const router = Router();

// POST /api/generate/sprite - Generate sprite images
router.post('/sprite', async (req: Request, res: Response) => {
    try {
        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Get user and check credits
        const user = await UserService.findByFirebaseUid(decodedToken.uid);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const creditsRequired = 5;
        if (user.credits < creditsRequired) {
            return res.status(402).json({ 
                error: 'Insufficient credits',
                required: creditsRequired,
                available: user.credits
            });
        }

        // Get generation parameters
        const {
            prompt,
            style = 'pixel_art',
            aspectRatio = '1:1',
            viewpoint = 'front',
            colors = [],
            dimensions = '64x64',
            quantity = 2,
            referenceImage,
            poseImage,
            spriteType = 'character',
            projectId,
            apiKey // User's own API key (BYOK)
        } = req.body;

        if (!prompt || prompt.trim().length === 0) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Use user's API key or server's key
        const userApiKey = apiKey;
        const userProvider = req.body.provider || 'replicate'; // 'replicate' or 'gemini'
        
        // Generate images
        const result = await generateImages({
            prompt,
            type: 'sprite',
            style,
            aspectRatio,
            viewpoint,
            colors,
            dimensions,
            quantity: Math.min(quantity, 4), // Max 4 images
            referenceImage,
            poseImage
        }, {
            apiKey: userApiKey,
            provider: userProvider,
            useOwnKey: !!userApiKey
        });

        if (!result.success) {
            return res.status(500).json({ error: result.error || 'Generation failed' });
        }

        // Deduct credits (only if not using own API key)
        if (!userApiKey) {
            await UserService.deductCredits(user.id, creditsRequired);
        }

        // Upload to blob storage and save to database
        const uploadedUrls: string[] = [];
        const savedAssets: any[] = [];
        const shouldUpload = req.body.saveToCloud !== false;
        
        if (shouldUpload) {
            for (let i = 0; i < result.images.length; i++) {
                const imageDataUrl = result.images[i];
                try {
                    const url = await uploadGeneratedImage(imageDataUrl, user.id, 'sprite');
                    uploadedUrls.push(url);
                    
                    // Save asset to database with all details
                    const asset = await AssetService.create({
                        project_id: projectId || undefined,
                        user_id: user.id,
                        name: `${spriteType}_${Date.now()}_${i + 1}`,
                        asset_type: 'sprite',
                        file_type: 'png',
                        blob_url: url,
                        metadata: {
                            prompt,
                            style,
                            viewpoint,
                            dimensions,
                            colors,
                            aspect_ratio: aspectRatio,
                            sprite_type: spriteType,
                            user_name: user.display_name || user.email,
                            variant_index: i + 1,
                            generation_params: {
                                quantity,
                                has_reference: !!referenceImage,
                                has_pose: !!poseImage,
                            }
                        }
                    });
                    savedAssets.push(asset);
                } catch (uploadError) {
                    console.error('Failed to upload image:', uploadError);
                    uploadedUrls.push(imageDataUrl);
                }
            }
        }

        res.json({
            success: true,
            images: shouldUpload ? uploadedUrls : result.images,
            assets: savedAssets,
            creditsUsed: apiKey ? 0 : creditsRequired,
            remainingCredits: apiKey ? user.credits : user.credits - creditsRequired
        });

    } catch (error: any) {
        console.error('Sprite generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate sprite',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// POST /api/generate/scene - Generate scene images
router.post('/scene', async (req: Request, res: Response) => {
    try {
        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Get user and check credits
        const user = await UserService.findByFirebaseUid(decodedToken.uid);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const creditsRequired = 8;
        if (user.credits < creditsRequired) {
            return res.status(402).json({ 
                error: 'Insufficient credits',
                required: creditsRequired,
                available: user.credits
            });
        }

        // Get generation parameters
        const {
            prompt,
            style = 'pixel_art',
            aspectRatio = '16:9',
            viewpoint = 'side',
            colors = [],
            quantity = 2,
            referenceImage,
            sceneType = 'environment',
            projectId,
            apiKey
        } = req.body;

        if (!prompt || prompt.trim().length === 0) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const userApiKey = apiKey;
        const userProvider = req.body.provider || 'replicate';

        // Generate images
        const result = await generateImages({
            prompt,
            type: 'scene',
            style,
            aspectRatio,
            viewpoint,
            colors,
            quantity: Math.min(quantity, 4),
            referenceImage
        }, {
            apiKey: userApiKey,
            provider: userProvider,
            useOwnKey: !!userApiKey
        });

        if (!result.success) {
            return res.status(500).json({ error: result.error || 'Generation failed' });
        }

        // Deduct credits
        if (!userApiKey) {
            await UserService.deductCredits(user.id, creditsRequired);
        }

        // Upload to blob storage and save to database
        const uploadedUrls: string[] = [];
        const savedAssets: any[] = [];
        
        for (let i = 0; i < result.images.length; i++) {
            const imageDataUrl = result.images[i];
            try {
                const url = await uploadGeneratedImage(imageDataUrl, user.id, 'scene');
                uploadedUrls.push(url);
                
                // Save asset to database with all details
                const asset = await AssetService.create({
                    project_id: projectId || undefined,
                    user_id: user.id,
                    name: `${sceneType}_${Date.now()}_${i + 1}`,
                    asset_type: 'scene',
                    file_type: 'png',
                    blob_url: url,
                    metadata: {
                        prompt,
                        style,
                        viewpoint,
                        colors,
                        aspect_ratio: aspectRatio,
                        scene_type: sceneType,
                        user_name: user.display_name || user.email,
                        variant_index: i + 1,
                        generation_params: {
                            quantity,
                            has_reference: !!referenceImage,
                        }
                    }
                });
                savedAssets.push(asset);
            } catch (uploadError) {
                console.error('Failed to upload image:', uploadError);
                uploadedUrls.push(imageDataUrl);
            }
        }

        res.json({
            success: true,
            images: uploadedUrls,
            assets: savedAssets,
            creditsUsed: apiKey ? 0 : creditsRequired,
            remainingCredits: apiKey ? user.credits : user.credits - creditsRequired
        });

    } catch (error: any) {
        console.error('Scene generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate scene',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// POST /api/generate/animation - Generate animation sprite sheet
router.post('/animation', async (req: Request, res: Response) => {
    try {
        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Get user and check credits
        const user = await UserService.findByFirebaseUid(decodedToken.uid);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get generation parameters
        const {
            characterImage,  // Base64 image of the character to animate
            viewType = 'isometric',
            direction = 'right',
            animationType,
            frameDescriptions,
            projectId,
            apiKey
        } = req.body;

        if (!characterImage) {
            return res.status(400).json({ error: 'Character image is required' });
        }

        if (!frameDescriptions || !Array.isArray(frameDescriptions) || frameDescriptions.length === 0) {
            return res.status(400).json({ error: 'Frame descriptions are required' });
        }

        // Calculate credits: 3 credits per frame
        const creditsRequired = frameDescriptions.length * 3;
        if (user.credits < creditsRequired && !apiKey) {
            return res.status(402).json({ 
                error: 'Insufficient credits',
                required: creditsRequired,
                available: user.credits
            });
        }

        const userApiKey = apiKey;
        const userProvider = req.body.provider || 'replicate';

        // Generate animation frames
        const result = await generateAnimationFrames({
            characterImage,
            viewType,
            direction,
            animationType,
            frameDescriptions,
        }, {
            apiKey: userApiKey,
            provider: userProvider,
            useOwnKey: !!userApiKey
        });

        if (!result.success) {
            return res.status(500).json({ error: result.error || 'Animation generation failed' });
        }

        // Deduct credits
        if (!userApiKey) {
            await UserService.deductCredits(user.id, creditsRequired);
        }

        // Upload frames to blob storage and save to database
        const uploadedUrls: string[] = [];
        const savedAssets: any[] = [];
        
        for (let i = 0; i < result.frames.length; i++) {
            const frameDataUrl = result.frames[i];
            try {
                const url = await uploadGeneratedImage(frameDataUrl, user.id, 'sprite');
                uploadedUrls.push(url);
                
                // Save each frame as an asset
                const asset = await AssetService.create({
                    project_id: projectId || undefined,
                    user_id: user.id,
                    name: `${animationType}_frame_${i + 1}`,
                    asset_type: 'animation',
                    file_type: 'png',
                    blob_url: url,
                    metadata: {
                        animation_type: animationType,
                        view_type: viewType,
                        direction,
                        frame_index: i + 1,
                        frame_count: frameDescriptions.length,
                        frame_description: frameDescriptions[i],
                        user_name: user.display_name || user.email,
                        generation_params: {
                            total_frames: frameDescriptions.length,
                        }
                    }
                });
                savedAssets.push(asset);
            } catch (uploadError) {
                console.error('Failed to upload frame:', uploadError);
                uploadedUrls.push(frameDataUrl);
            }
        }

        res.json({
            success: true,
            frames: uploadedUrls,
            assets: savedAssets,
            frameCount: uploadedUrls.length,
            creditsUsed: apiKey ? 0 : creditsRequired,
            remainingCredits: apiKey ? user.credits : user.credits - creditsRequired
        });

    } catch (error: any) {
        console.error('Animation generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate animation',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/generate/history - Get user's generation history
router.get('/history', async (req: Request, res: Response) => {
    try {
        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Get user
        const user = await UserService.findByFirebaseUid(decodedToken.uid);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get query parameters
        const { type, projectId, limit = '50', offset = '0' } = req.query;

        // Fetch assets
        const assets = await AssetService.list({
            user_id: user.id,
            project_id: projectId as string || undefined,
            asset_type: type as string || undefined,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            order_by: 'created_at',
            order: 'desc',
        });

        res.json({
            success: true,
            assets,
            count: assets.length,
        });

    } catch (error: any) {
        console.error('History fetch error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch history',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/generate/asset/:id - Get single asset details
router.get('/asset/:id', async (req: Request, res: Response) => {
    try {
        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Get user
        const user = await UserService.findByFirebaseUid(decodedToken.uid);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { id } = req.params;
        const asset = await AssetService.findById(id, user.id);

        if (!asset) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        res.json({
            success: true,
            asset,
        });

    } catch (error: any) {
        console.error('Asset fetch error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch asset',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;
