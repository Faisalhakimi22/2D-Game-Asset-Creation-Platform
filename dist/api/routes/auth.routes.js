"use strict";
/**
 * Authentication API Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = require("../../services/user.service");
const auth_1 = require("../../lib/auth");
const router = (0, express_1.Router)();
/**
 * POST /api/auth/sync-user
 * Sync user from Firebase Auth to Firestore
 */
router.post('/sync-user', async (req, res) => {
    try {
        const { firebase_uid, email, display_name, avatar_url, email_verified, provider } = req.body;
        if (!firebase_uid || !email) {
            return res.status(400).json({
                error: 'firebase_uid and email are required'
            });
        }
        // Check if user exists
        let user = await user_service_1.UserService.findByFirebaseUid(firebase_uid);
        if (user) {
            // Update existing user - preserve existing values if new ones are not provided
            const updateData = {
                last_login_at: new Date(),
            };
            if (display_name !== undefined)
                updateData.display_name = display_name;
            if (avatar_url !== undefined)
                updateData.avatar_url = avatar_url;
            if (email_verified !== undefined)
                updateData.email_verified = email_verified;
            user = await user_service_1.UserService.update(user.id, updateData);
        }
        else {
            // Create new user
            user = await user_service_1.UserService.create({
                firebase_uid,
                email,
                email_verified: email_verified ?? false,
                display_name: display_name || null,
                avatar_url: avatar_url || null,
                provider: provider || 'google',
                plan_type: 'free',
                credits: 100, // Welcome credits
            });
        }
        return res.status(200).json({ user });
    }
    catch (error) {
        console.error('Error syncing user:', error);
        return res.status(500).json({
            error: 'Failed to sync user',
            message: error.message
        });
    }
});
/**
 * GET /api/auth/me
 * Get current user by Firebase token
 */
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await (0, auth_1.verifyToken)(idToken);
        const user = await user_service_1.UserService.findByFirebaseUid(decodedToken.uid);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({ user });
    }
    catch (error) {
        console.error('Error getting user:', error);
        return res.status(500).json({
            error: 'Failed to get user',
            message: error.message
        });
    }
});
exports.default = router;
