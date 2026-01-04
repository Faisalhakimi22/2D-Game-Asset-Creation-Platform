/**
 * Authentication Utilities
 * Firebase token verification and user session management
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import type { DecodedIdToken } from 'firebase-admin/auth';
import * as path from 'path';
import * as fs from 'fs';

let firebaseApp: App | null = null;
let auth: Auth | null = null;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase(): Auth {
  if (auth) {
    return auth;
  }

  // Check if already initialized
  const apps = getApps();
  if (apps.length > 0) {
    firebaseApp = apps[0];
    auth = getAuth(firebaseApp);
    return auth;
  }

  try {
    // Try to load from service account JSON file first
    const serviceAccountPath = path.join(__dirname, '../pixelar-webapp-firebase-adminsdk-fbsvc-03ee05ff4b.json');

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      // Fall back to environment variables
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      const projectId = process.env.FIREBASE_PROJECT_ID;

      if (!privateKey || !projectId) {
        throw new Error('Firebase credentials not configured. Either provide service account JSON file or set FIREBASE_PRIVATE_KEY and FIREBASE_PROJECT_ID');
      }

      firebaseApp = initializeApp({
        credential: cert({
          projectId,
          privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }

    auth = getAuth(firebaseApp);
    return auth;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

/**
 * Verify Firebase ID token
 */
export async function verifyToken(idToken: string): Promise<DecodedIdToken> {
  try {
    const authInstance = initializeFirebase();
    const decodedToken = await authInstance.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Get user ID from request headers
 * Expects Authorization header: "Bearer <token>"
 */
export async function getUserIdFromRequest(
  headers: Headers | Record<string, string>
): Promise<string | null> {
  try {
    const authHeader =
      headers instanceof Headers
        ? headers.get('authorization')
        : headers['authorization'] || headers['Authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error getting user ID from request:', error);
    return null;
  }
}

/**
 * Middleware to verify authentication
 * Returns user ID if authenticated, throws error otherwise
 */
export async function requireAuth(
  headers: Headers | Record<string, string>
): Promise<string> {
  const userId = await getUserIdFromRequest(headers);

  if (!userId) {
    throw new Error('Unauthorized: Authentication required');
  }

  return userId;
}

/**
 * Get user email from token
 */
export async function getUserEmailFromToken(idToken: string): Promise<string | null> {
  try {
    const decodedToken = await verifyToken(idToken);
    return decodedToken.email || null;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}

/**
 * Create a user in Firebase Admin (if needed)
 */
export async function createFirebaseUser(email: string, displayName?: string): Promise<string> {
  try {
    const authInstance = initializeFirebase();
    const userRecord = await authInstance.createUser({
      email,
      displayName,
      emailVerified: false,
    });
    return userRecord.uid;
  } catch (error) {
    console.error('Error creating Firebase user:', error);
    throw error;
  }
}

