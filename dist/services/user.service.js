"use strict";
/**
 * User Service - Firestore
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const db_1 = require("../lib/db");
const firestore_1 = require("firebase-admin/firestore");
class UserService {
    /**
     * Find user by Firebase UID
     */
    static async findByFirebaseUid(firebaseUid) {
        const snapshot = await (0, db_1.getCollection)('users')
            .where('firebase_uid', '==', firebaseUid)
            .limit(1)
            .get();
        if (snapshot.empty)
            return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }
    /**
     * Find user by ID
     */
    static async findById(id) {
        const doc = await (0, db_1.getCollection)('users').doc(id).get();
        if (!doc.exists)
            return null;
        return { id: doc.id, ...doc.data() };
    }
    /**
     * Find user by email
     */
    static async findByEmail(email) {
        const snapshot = await (0, db_1.getCollection)('users')
            .where('email', '==', email)
            .limit(1)
            .get();
        if (snapshot.empty)
            return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }
    /**
     * Create a new user
     */
    static async create(input) {
        const now = firestore_1.Timestamp.now();
        const userData = {
            firebase_uid: input.firebase_uid,
            email: input.email,
            email_verified: input.email_verified ?? false,
            display_name: input.display_name || null,
            avatar_url: input.avatar_url || null,
            provider: input.provider || 'google',
            plan_type: input.plan_type || 'free',
            credits: input.credits || 0,
            credits_used: 0,
            created_at: now,
            updated_at: now,
            last_login_at: null,
        };
        const docRef = await (0, db_1.getCollection)('users').add(userData);
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    }
    /**
     * Update user
     */
    static async update(id, input) {
        const updates = {
            updated_at: firestore_1.Timestamp.now(),
        };
        if (input.display_name !== undefined)
            updates.display_name = input.display_name;
        if (input.avatar_url !== undefined)
            updates.avatar_url = input.avatar_url;
        if (input.email_verified !== undefined)
            updates.email_verified = input.email_verified;
        if (input.plan_type !== undefined)
            updates.plan_type = input.plan_type;
        if (input.credits !== undefined)
            updates.credits = input.credits;
        if (input.credits_used !== undefined)
            updates.credits_used = input.credits_used;
        if (input.last_login_at !== undefined) {
            updates.last_login_at = input.last_login_at instanceof Date
                ? firestore_1.Timestamp.fromDate(input.last_login_at)
                : input.last_login_at;
        }
        await (0, db_1.getCollection)('users').doc(id).update(updates);
        return this.findById(id);
    }
    /**
     * Update last login timestamp
     */
    static async updateLastLogin(id) {
        await (0, db_1.getCollection)('users').doc(id).update({
            last_login_at: firestore_1.Timestamp.now(),
            updated_at: firestore_1.Timestamp.now(),
        });
    }
    /**
     * Get user with project summary
     */
    static async getUserSummary(userId) {
        const user = await this.findById(userId);
        if (!user)
            return null;
        const projectsSnapshot = await (0, db_1.getCollection)('projects')
            .where('user_id', '==', userId)
            .where('status', '!=', 'deleted')
            .get();
        const assetsSnapshot = await (0, db_1.getCollection)('assets')
            .where('user_id', '==', userId)
            .where('status', '==', 'active')
            .get();
        const transactionsSnapshot = await (0, db_1.getCollection)('creditsTransactions')
            .where('user_id', '==', userId)
            .where('transaction_type', '==', 'usage')
            .get();
        const totalCreditsUsed = transactionsSnapshot.docs.reduce((sum, doc) => {
            const data = doc.data();
            return sum + Math.abs(data.amount || 0);
        }, 0);
        return {
            ...user,
            total_projects: projectsSnapshot.size,
            sprite_projects: projectsSnapshot.docs.filter(d => d.data().type === 'sprite').length,
            scene_projects: projectsSnapshot.docs.filter(d => d.data().type === 'scene').length,
            total_assets: assetsSnapshot.size,
            total_credits_used: totalCreditsUsed,
        };
    }
    /**
     * Check if user has enough credits
     */
    static async hasEnoughCredits(userId, requiredCredits) {
        const user = await this.findById(userId);
        return user ? user.credits >= requiredCredits : false;
    }
    /**
     * Deduct credits from user
     */
    static async deductCredits(userId, amount) {
        const user = await this.findById(userId);
        if (!user)
            throw new Error('User not found');
        if (user.credits < amount)
            throw new Error('Insufficient credits');
        return this.update(userId, {
            credits: user.credits - amount,
            credits_used: user.credits_used + amount,
        });
    }
    /**
     * Add credits to user
     */
    static async addCredits(userId, amount) {
        const user = await this.findById(userId);
        if (!user)
            throw new Error('User not found');
        return this.update(userId, { credits: user.credits + amount });
    }
}
exports.UserService = UserService;
