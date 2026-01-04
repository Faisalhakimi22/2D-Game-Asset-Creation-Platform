"use strict";
/**
 * Unit Tests: User Service
 * Tests for user management operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
const setup_1 = require("../setup");
// Mock Firestore
const mockFirestore = {
    collection: jest.fn(),
    doc: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    where: jest.fn(),
};
// Mock user data store
let mockUserStore = {};
beforeEach(() => {
    mockUserStore = {
        'user_123': { ...setup_1.mockUser },
        'user_456': {
            ...setup_1.mockUser,
            id: 'user_456',
            firebase_uid: 'firebase_uid_456',
            email: 'user2@example.com',
            credits: 50
        }
    };
    jest.clearAllMocks();
});
describe('User Service - Unit Tests', () => {
    // ========================================
    // UT-USR-001: findByFirebaseUid with valid UID
    // ========================================
    describe('UT-USR-001: findByFirebaseUid with valid UID', () => {
        it('should return user object when UID exists', async () => {
            const result = await UserService.findByFirebaseUid('firebase_uid_123');
            expect(result).not.toBeNull();
            expect(result?.id).toBe('user_123');
            expect(result?.email).toBe('test@example.com');
            expect(result?.display_name).toBe('Test User');
            expect(result?.credits).toBe(100);
        });
    });
    // ========================================
    // UT-USR-002: findByFirebaseUid with invalid UID
    // ========================================
    describe('UT-USR-002: findByFirebaseUid with invalid UID', () => {
        it('should return null when UID does not exist', async () => {
            const result = await UserService.findByFirebaseUid('nonexistent_uid');
            expect(result).toBeNull();
        });
    });
    // ========================================
    // UT-USR-003: deductCredits with sufficient balance
    // ========================================
    describe('UT-USR-003: deductCredits with sufficient balance', () => {
        it('should reduce credits correctly', async () => {
            const initialCredits = mockUserStore['user_123'].credits;
            const deductAmount = 5;
            const result = await UserService.deductCredits('user_123', deductAmount);
            expect(result.credits).toBe(initialCredits - deductAmount);
            expect(mockUserStore['user_123'].credits).toBe(95);
        });
        it('should handle multiple deductions', async () => {
            await UserService.deductCredits('user_123', 10);
            await UserService.deductCredits('user_123', 15);
            await UserService.deductCredits('user_123', 5);
            expect(mockUserStore['user_123'].credits).toBe(70);
        });
    });
    // ========================================
    // UT-USR-004: deductCredits with insufficient balance
    // ========================================
    describe('UT-USR-004: deductCredits with insufficient balance', () => {
        it('should throw error when credits insufficient', async () => {
            await expect(UserService.deductCredits('user_456', 100)).rejects.toThrow('Insufficient credits');
        });
        it('should not modify credits on failure', async () => {
            const initialCredits = mockUserStore['user_456'].credits;
            try {
                await UserService.deductCredits('user_456', 100);
            }
            catch (e) {
                // Expected error
            }
            expect(mockUserStore['user_456'].credits).toBe(initialCredits);
        });
    });
    // ========================================
    // UT-USR-005: update user profile
    // ========================================
    describe('UT-USR-005: update user profile', () => {
        it('should update display_name correctly', async () => {
            const result = await UserService.update('user_123', {
                display_name: 'Updated Name'
            });
            expect(result.display_name).toBe('Updated Name');
            expect(mockUserStore['user_123'].display_name).toBe('Updated Name');
        });
        it('should update avatar_url correctly', async () => {
            const newAvatarUrl = 'https://example.com/avatar.png';
            const result = await UserService.update('user_123', {
                avatar_url: newAvatarUrl
            });
            expect(result.avatar_url).toBe(newAvatarUrl);
        });
        it('should update multiple fields at once', async () => {
            const result = await UserService.update('user_123', {
                display_name: 'New Name',
                avatar_url: 'https://example.com/new-avatar.png'
            });
            expect(result.display_name).toBe('New Name');
            expect(result.avatar_url).toBe('https://example.com/new-avatar.png');
        });
        it('should preserve unchanged fields', async () => {
            const originalEmail = mockUserStore['user_123'].email;
            await UserService.update('user_123', {
                display_name: 'Changed Name'
            });
            expect(mockUserStore['user_123'].email).toBe(originalEmail);
        });
    });
    // ========================================
    // UT-USR-006: addCredits
    // ========================================
    describe('UT-USR-006: addCredits', () => {
        it('should increase credits correctly', async () => {
            const initialCredits = mockUserStore['user_123'].credits;
            const result = await UserService.addCredits('user_123', 50);
            expect(result.credits).toBe(initialCredits + 50);
        });
        it('should handle adding to zero balance', async () => {
            mockUserStore['user_456'].credits = 0;
            const result = await UserService.addCredits('user_456', 100);
            expect(result.credits).toBe(100);
        });
    });
    // ========================================
    // UT-USR-007: findById
    // ========================================
    describe('UT-USR-007: findById', () => {
        it('should return user by ID', async () => {
            const result = await UserService.findById('user_123');
            expect(result).not.toBeNull();
            expect(result?.id).toBe('user_123');
        });
        it('should return null for non-existent ID', async () => {
            const result = await UserService.findById('nonexistent');
            expect(result).toBeNull();
        });
    });
    // ========================================
    // UT-USR-008: Boundary value tests for credits
    // ========================================
    describe('UT-USR-008: Boundary value tests for credits', () => {
        it('should allow deducting exact balance', async () => {
            mockUserStore['user_456'].credits = 50;
            const result = await UserService.deductCredits('user_456', 50);
            expect(result.credits).toBe(0);
        });
        it('should reject deducting one more than balance', async () => {
            mockUserStore['user_456'].credits = 50;
            await expect(UserService.deductCredits('user_456', 51)).rejects.toThrow('Insufficient credits');
        });
        it('should handle zero deduction', async () => {
            const initialCredits = mockUserStore['user_123'].credits;
            const result = await UserService.deductCredits('user_123', 0);
            expect(result.credits).toBe(initialCredits);
        });
    });
});
// ========================================
// Mock UserService Implementation
// ========================================
const UserService = {
    async findByFirebaseUid(uid) {
        const user = Object.values(mockUserStore).find(u => u.firebase_uid === uid);
        return user || null;
    },
    async findById(id) {
        return mockUserStore[id] || null;
    },
    async deductCredits(userId, amount) {
        const user = mockUserStore[userId];
        if (!user)
            throw new Error('User not found');
        if (user.credits < amount)
            throw new Error('Insufficient credits');
        user.credits -= amount;
        return { ...user };
    },
    async addCredits(userId, amount) {
        const user = mockUserStore[userId];
        if (!user)
            throw new Error('User not found');
        user.credits += amount;
        return { ...user };
    },
    async update(userId, data) {
        const user = mockUserStore[userId];
        if (!user)
            throw new Error('User not found');
        Object.assign(user, data);
        return { ...user };
    }
};
