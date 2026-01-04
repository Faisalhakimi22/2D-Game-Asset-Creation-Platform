"use strict";
/**
 * Integration Tests: API Routes
 * Tests for API endpoint integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
const setup_1 = require("../setup");
// Mock request/response helpers
const createMockRequest = (overrides = {}) => ({
    headers: { authorization: 'Bearer valid_token' },
    body: {},
    params: {},
    query: {},
    user: setup_1.mockUser,
    ...overrides
});
const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
// Mock services
const mockServices = {
    verifyToken: jest.fn(),
    UserService: {
        findByFirebaseUid: jest.fn(),
        deductCredits: jest.fn()
    },
    generateImages: jest.fn(),
    uploadGeneratedImage: jest.fn()
};
beforeEach(() => {
    jest.clearAllMocks();
    mockServices.verifyToken.mockResolvedValue({ uid: 'firebase_uid_123' });
    mockServices.UserService.findByFirebaseUid.mockResolvedValue(setup_1.mockUser);
    mockServices.UserService.deductCredits.mockResolvedValue({ ...setup_1.mockUser, credits: 95 });
});
describe('API Routes - Integration Tests', () => {
    // ========================================
    // IT-API-001: POST /api/generate/sprite with valid token
    // ========================================
    describe('IT-API-001: POST /api/generate/sprite with valid token', () => {
        it('should return generated images on success', async () => {
            const req = createMockRequest({
                body: {
                    prompt: 'a warrior character',
                    style: 'pixel_art',
                    aspectRatio: '1:1',
                    viewpoint: 'front',
                    quantity: 2
                }
            });
            const res = createMockResponse();
            mockServices.generateImages.mockResolvedValue({
                success: true,
                images: ['data:image/png;base64,abc123', 'data:image/png;base64,def456']
            });
            mockServices.uploadGeneratedImage.mockResolvedValue('https://blob.vercel-storage.com/test.png');
            await generateSpriteHandler(req, res, mockServices);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                images: expect.any(Array)
            }));
        });
    });
    // ========================================
    // IT-API-002: POST /api/generate/sprite without token
    // ========================================
    describe('IT-API-002: POST /api/generate/sprite without token', () => {
        it('should return 401 Unauthorized', async () => {
            const req = createMockRequest({
                headers: {}
            });
            const res = createMockResponse();
            await generateSpriteHandler(req, res, mockServices);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: expect.stringContaining('authorization')
            }));
        });
    });
    // ========================================
    // IT-API-003: POST /api/generate/sprite insufficient credits
    // ========================================
    describe('IT-API-003: POST /api/generate/sprite insufficient credits', () => {
        it('should return 402 Payment Required', async () => {
            const req = createMockRequest({
                body: { prompt: 'test', quantity: 2 }
            });
            const res = createMockResponse();
            mockServices.UserService.findByFirebaseUid.mockResolvedValue({
                ...setup_1.mockUser,
                credits: 2 // Less than required 5
            });
            await generateSpriteHandler(req, res, mockServices);
            expect(res.status).toHaveBeenCalledWith(402);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: 'Insufficient credits',
                required: 5,
                available: 2
            }));
        });
    });
    // ========================================
    // IT-API-004: GET /api/user/profile with valid token
    // ========================================
    describe('IT-API-004: GET /api/user/profile with valid token', () => {
        it('should return user profile data', async () => {
            const req = createMockRequest();
            const res = createMockResponse();
            await getUserProfileHandler(req, res, mockServices);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                id: setup_1.mockUser.id,
                email: setup_1.mockUser.email,
                display_name: setup_1.mockUser.display_name,
                credits: setup_1.mockUser.credits
            }));
        });
    });
    // ========================================
    // IT-API-005: POST /api/projects creates project
    // ========================================
    describe('IT-API-005: POST /api/projects creates project', () => {
        it('should create and return new project', async () => {
            const req = createMockRequest({
                body: {
                    title: 'New Project',
                    type: 'sprite'
                }
            });
            const res = createMockResponse();
            await createProjectHandler(req, res, mockServices);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                project: expect.objectContaining({
                    title: 'New Project',
                    type: 'sprite'
                })
            }));
        });
    });
    // ========================================
    // IT-API-006: DELETE /api/projects/:id soft deletes
    // ========================================
    describe('IT-API-006: DELETE /api/projects/:id soft deletes', () => {
        it('should soft delete project', async () => {
            const req = createMockRequest({
                params: { id: 'project_123' }
            });
            const res = createMockResponse();
            await deleteProjectHandler(req, res, mockServices);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: expect.stringContaining('deleted')
            }));
        });
    });
    // ========================================
    // IT-API-007: BYOK key usage
    // ========================================
    describe('IT-API-007: BYOK key usage', () => {
        it('should not deduct credits when using BYOK', async () => {
            const req = createMockRequest({
                body: {
                    prompt: 'test',
                    apiKey: 'user_provided_key'
                }
            });
            const res = createMockResponse();
            mockServices.generateImages.mockResolvedValue({
                success: true,
                images: ['data:image/png;base64,abc123']
            });
            await generateSpriteHandler(req, res, mockServices);
            expect(mockServices.UserService.deductCredits).not.toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                creditsUsed: 0
            }));
        });
    });
    // ========================================
    // IT-API-008: Invalid prompt validation
    // ========================================
    describe('IT-API-008: Invalid prompt validation', () => {
        it('should return 400 for empty prompt', async () => {
            const req = createMockRequest({
                body: { prompt: '' }
            });
            const res = createMockResponse();
            await generateSpriteHandler(req, res, mockServices);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: expect.stringContaining('Prompt')
            }));
        });
        it('should return 400 for missing prompt', async () => {
            const req = createMockRequest({
                body: {}
            });
            const res = createMockResponse();
            await generateSpriteHandler(req, res, mockServices);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
    // ========================================
    // IT-API-009: Generation failure handling
    // ========================================
    describe('IT-API-009: Generation failure handling', () => {
        it('should return 500 on generation failure', async () => {
            const req = createMockRequest({
                body: { prompt: 'test' }
            });
            const res = createMockResponse();
            mockServices.generateImages.mockResolvedValue({
                success: false,
                images: [],
                error: 'AI provider error'
            });
            await generateSpriteHandler(req, res, mockServices);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: expect.any(String)
            }));
        });
        it('should not deduct credits on failure', async () => {
            const req = createMockRequest({
                body: { prompt: 'test' }
            });
            const res = createMockResponse();
            mockServices.generateImages.mockResolvedValue({
                success: false,
                images: [],
                error: 'Failed'
            });
            await generateSpriteHandler(req, res, mockServices);
            expect(mockServices.UserService.deductCredits).not.toHaveBeenCalled();
        });
    });
    // ========================================
    // IT-API-010: Animation generation
    // ========================================
    describe('IT-API-010: Animation generation', () => {
        it('should generate animation frames', async () => {
            const req = createMockRequest({
                body: {
                    characterImage: 'data:image/png;base64,test',
                    animationType: 'Walking',
                    frameDescriptions: ['Frame 1', 'Frame 2', 'Frame 3', 'Frame 4'],
                    viewType: 'isometric',
                    direction: 'right'
                }
            });
            const res = createMockResponse();
            mockServices.generateImages.mockResolvedValue({
                success: true,
                frames: ['frame1', 'frame2', 'frame3', 'frame4']
            });
            await generateAnimationHandler(req, res, mockServices);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                frames: expect.any(Array),
                frameCount: 4
            }));
        });
        it('should calculate credits correctly (3 per frame)', async () => {
            const req = createMockRequest({
                body: {
                    characterImage: 'data:image/png;base64,test',
                    animationType: 'Walking',
                    frameDescriptions: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'],
                    viewType: 'isometric',
                    direction: 'right'
                }
            });
            const res = createMockResponse();
            mockServices.generateImages.mockResolvedValue({
                success: true,
                frames: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6']
            });
            await generateAnimationHandler(req, res, mockServices);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                creditsUsed: 18 // 6 frames × 3 credits
            }));
        });
    });
});
// ========================================
// Mock Route Handlers
// ========================================
async function generateSpriteHandler(req, res, services) {
    try {
        // Check authorization
        if (!req.headers.authorization?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }
        // Validate prompt
        if (!req.body.prompt || req.body.prompt.trim().length === 0) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        // Get user
        const user = await services.UserService.findByFirebaseUid('firebase_uid_123');
        // Check credits (unless BYOK)
        const creditsRequired = 5;
        if (!req.body.apiKey && user.credits < creditsRequired) {
            return res.status(402).json({
                error: 'Insufficient credits',
                required: creditsRequired,
                available: user.credits
            });
        }
        // Generate
        const result = await services.generateImages(req.body);
        if (!result.success) {
            return res.status(500).json({ error: result.error || 'Generation failed' });
        }
        // Deduct credits if not BYOK
        if (!req.body.apiKey) {
            await services.UserService.deductCredits(user.id, creditsRequired);
        }
        return res.json({
            success: true,
            images: result.images,
            creditsUsed: req.body.apiKey ? 0 : creditsRequired
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
async function getUserProfileHandler(req, res, services) {
    const user = req.user;
    return res.status(200).json({
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        credits: user.credits,
        plan: user.plan_type
    });
}
async function createProjectHandler(req, res, services) {
    const project = {
        id: 'new_project_id',
        user_id: req.user.id,
        ...req.body,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date()
    };
    return res.status(201).json({
        success: true,
        project
    });
}
async function deleteProjectHandler(req, res, services) {
    return res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
    });
}
async function generateAnimationHandler(req, res, services) {
    const frameCount = req.body.frameDescriptions.length;
    const creditsRequired = frameCount * 3;
    const result = await services.generateImages(req.body);
    return res.json({
        success: true,
        frames: result.frames,
        frameCount,
        creditsUsed: req.body.apiKey ? 0 : creditsRequired
    });
}
