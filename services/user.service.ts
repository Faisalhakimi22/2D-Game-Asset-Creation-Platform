/**
 * User Service - Firestore
 */

import { getCollection } from '../lib/db';
import type { 
  User, 
  CreateUserInput, 
  UpdateUserInput 
} from '../types/database.types';
import { Timestamp } from 'firebase-admin/firestore';

export class UserService {
  /**
   * Find user by Firebase UID
   */
  static async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const snapshot = await getCollection('users')
      .where('firebase_uid', '==', firebaseUid)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const doc = await getCollection('users').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as User;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const snapshot = await getCollection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  /**
   * Create a new user
   */
  static async create(input: CreateUserInput): Promise<User> {
    const now = Timestamp.now();
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

    const docRef = await getCollection('users').add(userData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as User;
  }

  /**
   * Update user
   */
  static async update(id: string, input: UpdateUserInput): Promise<User> {
    const updates: any = {
      updated_at: Timestamp.now(),
    };

    if (input.display_name !== undefined) updates.display_name = input.display_name;
    if (input.avatar_url !== undefined) updates.avatar_url = input.avatar_url;
    if (input.email_verified !== undefined) updates.email_verified = input.email_verified;
    if (input.plan_type !== undefined) updates.plan_type = input.plan_type;
    if (input.credits !== undefined) updates.credits = input.credits;
    if (input.credits_used !== undefined) updates.credits_used = input.credits_used;
    if (input.last_login_at !== undefined) {
      updates.last_login_at = input.last_login_at instanceof Date 
        ? Timestamp.fromDate(input.last_login_at)
        : input.last_login_at;
    }

    await getCollection('users').doc(id).update(updates);
    return this.findById(id) as Promise<User>;
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(id: string): Promise<void> {
    await getCollection('users').doc(id).update({
      last_login_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
  }

  /**
   * Get user with project summary
   */
  static async getUserSummary(userId: string): Promise<any> {
    const user = await this.findById(userId);
    if (!user) return null;

    const projectsSnapshot = await getCollection('projects')
      .where('user_id', '==', userId)
      .where('status', '!=', 'deleted')
      .get();

    const assetsSnapshot = await getCollection('assets')
      .where('user_id', '==', userId)
      .where('status', '==', 'active')
      .get();

    const transactionsSnapshot = await getCollection('creditsTransactions')
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
  static async hasEnoughCredits(userId: string, requiredCredits: number): Promise<boolean> {
    const user = await this.findById(userId);
    return user ? user.credits >= requiredCredits : false;
  }

  /**
   * Deduct credits from user
   */
  static async deductCredits(userId: string, amount: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.credits < amount) throw new Error('Insufficient credits');

    return this.update(userId, {
      credits: user.credits - amount,
      credits_used: user.credits_used + amount,
    });
  }

  /**
   * Add credits to user
   */
  static async addCredits(userId: string, amount: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');
    return this.update(userId, { credits: user.credits + amount });
  }
}

