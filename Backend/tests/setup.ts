/**
 * Test Setup Configuration
 * Configures Jest environment for backend testing
 */

// Mock environment variables
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';
process.env.BLOB_READ_WRITE_TOKEN = 'test_blob_token';
process.env.REPLICATE_API_TOKEN = 'test_replicate_token';
process.env.REPLICATE_MODEL_ID = 'test/model:v1';
process.env.GEMINI_API_KEY = 'test_gemini_key';

// Global test utilities
export const mockUser = {
    id: 'user_123',
    firebase_uid: 'firebase_uid_123',
    email: 'test@example.com',
    display_name: 'Test User',
    avatar_url: null as string | null,
    plan_type: 'free',
    credits: 100,
    created_at: new Date(),
    last_login_at: new Date()
};

export const mockProject = {
    id: 'project_123',
    user_id: 'user_123',
    title: 'Test Project',
    type: 'sprite',
    description: 'Test description',
    thumbnail_url: null as string | null,
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
};

export const mockAsset = {
    id: 'asset_123',
    project_id: 'project_123',
    user_id: 'user_123',
    name: 'test_sprite',
    asset_type: 'sprite',
    file_type: 'png',
    blob_url: 'https://blob.vercel-storage.com/test.png',
    metadata: {
        prompt: 'test prompt',
        style: 'pixel_art'
    } as Record<string, any>,
    status: 'active',
    created_at: new Date()
};

// Mock generation result
export const mockGenerationResult = {
    success: true,
    images: ['data:image/png;base64,abc123'],
    creditsUsed: 5
};

// Mock animation result
export const mockAnimationResult = {
    success: true,
    frames: ['frame1', 'frame2', 'frame3', 'frame4'],
    frameCount: 4,
    creditsUsed: 12
};
