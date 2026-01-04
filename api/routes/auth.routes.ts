/**
 * Authentication API Routes
 */

import { Router, Request, Response } from 'express';
import { UserService } from '../../services/user.service';
import { verifyToken } from '../../lib/auth';

const router = Router();

/**
 * POST /api/auth/sync-user
 * Sync user from Firebase Auth to Firestore
 */
router.post('/sync-user', async (req: Request, res: Response) => {
  try {
    const { firebase_uid, email, display_name, avatar_url, email_verified, provider } = req.body;

    if (!firebase_uid || !email) {
      return res.status(400).json({
        error: 'firebase_uid and email are required'
      });
    }

    // Check if user exists
    let user = await UserService.findByFirebaseUid(firebase_uid);

    if (user) {
      // Update existing user - preserve existing values if new ones are not provided
      const updateData: any = {
        last_login_at: new Date(),
      };
      
      if (display_name !== undefined) updateData.display_name = display_name;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
      if (email_verified !== undefined) updateData.email_verified = email_verified;
      
      user = await UserService.update(user.id, updateData);
    } else {
      // Create new user
      user = await UserService.create({
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
  } catch (error: any) {
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
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyToken(idToken);

    const user = await UserService.findByFirebaseUid(decodedToken.uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error: any) {
    console.error('Error getting user:', error);
    return res.status(500).json({
      error: 'Failed to get user',
      message: error.message
    });
  }
});

export default router;

