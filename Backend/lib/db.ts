/**
 * Firestore Database Connection Utility
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { FIRESTORE_COLLECTIONS } from '../schemas/firestore-collections';
import * as path from 'path';
import * as fs from 'fs';

let firestore: Firestore | null = null;

/**
 * Initialize Firestore
 */
function getFirestoreInstance(): Firestore {
  if (firestore) {
    return firestore;
  }

  let app: App | null = null;
  const apps = getApps();

  if (apps.length > 0) {
    app = apps[0];
  } else {
    // Try to load from service account JSON file first
    const serviceAccountPath = path.join(__dirname, '../pixelar-webapp-firebase-adminsdk-fbsvc-04949cabec.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      app = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      // Fall back to environment variables
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      const projectId = process.env.FIREBASE_PROJECT_ID;

      if (!privateKey || !projectId) {
        throw new Error('Firebase credentials not configured. Either provide service account JSON file or set FIREBASE_PRIVATE_KEY and FIREBASE_PROJECT_ID');
      }

      app = initializeApp({
        credential: cert({
          projectId,
          privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
  }

  firestore = getFirestore(app);
  return firestore;
}

/**
 * Get Firestore instance
 */
export function getDb(): Firestore {
  return getFirestoreInstance();
}

/**
 * Get collection reference
 */
export function getCollection(collectionName: keyof typeof FIRESTORE_COLLECTIONS) {
  return getDb().collection(FIRESTORE_COLLECTIONS[collectionName]);
}

/**
 * Health check - test Firestore connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const db = getDb();
    await db.collection('_health').doc('check').get();
    return true;
  } catch (error) {
    console.error('Firestore health check failed:', error);
    return false;
  }
}

