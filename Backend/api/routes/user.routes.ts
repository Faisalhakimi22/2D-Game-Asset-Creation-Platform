/**
 * User Profile API Routes
 */

import { Router, Request, Response } from 'express';
import { UserService } from '../../services/user.service';
import { verifyToken } from '../../lib/auth';

const router = Router();

/**
 * Middleware to verify Firebase token and get user
 */
const authenticateUser = async (req: Request, res: Response, next: any) => {
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

    req.user = user;
    next();
  } catch (error: any) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
};

/**
 * GET /api/user/profile
 * Get current user profile
 */
router.get('/profile', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    return res.status(200).json({
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      plan: user.plan_type,
      credits: user.credits,
      status: user.status || 'Active',
      created_at: user.created_at,
      last_login_at: user.last_login_at
    });
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return res.status(500).json({
      error: 'Failed to get user profile',
      message: error.message
    });
  }
});

/**
 * POST /api/user/credits/deduct
 * Deduct credits from user account
 */
router.post('/credits/deduct', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { credits } = req.body;

    if (!credits || credits <= 0) {
      return res.status(400).json({ error: 'Invalid credits amount' });
    }

    if (user.credits < credits) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }

    const updatedUser = await UserService.update(user.id, {
      credits: user.credits - credits
    });

    return res.status(200).json({
      success: true,
      remaining_credits: updatedUser.credits,
      deducted: credits
    });
  } catch (error: any) {
    console.error('Error deducting credits:', error);
    return res.status(500).json({
      error: 'Failed to deduct credits',
      message: error.message
    });
  }
});

/**
 * POST /api/user/credits/add
 * Add credits to user account (for purchases, bonuses, etc.)
 */
router.post('/credits/add', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { credits, reason } = req.body;

    if (!credits || credits <= 0) {
      return res.status(400).json({ error: 'Invalid credits amount' });
    }

    const updatedUser = await UserService.update(user.id, {
      credits: user.credits + credits
    });

    // TODO: Log credit transaction for audit trail
    console.log(`Added ${credits} credits to user ${user.id}. Reason: ${reason || 'Not specified'}`);

    return res.status(200).json({
      success: true,
      total_credits: updatedUser.credits,
      added: credits
    });
  } catch (error: any) {
    console.error('Error adding credits:', error);
    return res.status(500).json({
      error: 'Failed to add credits',
      message: error.message
    });
  }
});

/**
 * PUT /api/user/profile
 * Update user profile
 */
router.put('/profile', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { display_name, avatar_url } = req.body;

    const updateData: any = {};
    if (display_name !== undefined) updateData.display_name = display_name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updatedUser = await UserService.update(user.id, updateData);

    return res.status(200).json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        display_name: updatedUser.display_name,
        avatar_url: updatedUser.avatar_url,
        plan: updatedUser.plan_type,
        credits: updatedUser.credits,
        status: updatedUser.status || 'Active'
      }
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({
      error: 'Failed to update user profile',
      message: error.message
    });
  }
});

export default router;