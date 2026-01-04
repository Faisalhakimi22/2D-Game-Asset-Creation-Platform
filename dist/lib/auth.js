"use strict";
/**
 * Authentication Utilities
 * Firebase token verification and user session management
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
exports.getUserIdFromRequest = getUserIdFromRequest;
exports.requireAuth = requireAuth;
exports.getUserEmailFromToken = getUserEmailFromToken;
exports.createFirebaseUser = createFirebaseUser;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let firebaseApp = null;
let auth = null;
/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
    if (auth) {
        return auth;
    }
    // Check if already initialized
    const apps = (0, app_1.getApps)();
    if (apps.length > 0) {
        firebaseApp = apps[0];
        auth = (0, auth_1.getAuth)(firebaseApp);
        return auth;
    }
    try {
        // Try to load from service account JSON file first
        const serviceAccountPath = path.join(__dirname, '../pixelar-webapp-firebase-adminsdk-fbsvc-03ee05ff4b.json');
        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
            firebaseApp = (0, app_1.initializeApp)({
                credential: (0, app_1.cert)(serviceAccount),
            });
        }
        else {
            // Fall back to environment variables
            const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
            const projectId = process.env.FIREBASE_PROJECT_ID;
            if (!privateKey || !projectId) {
                throw new Error('Firebase credentials not configured. Either provide service account JSON file or set FIREBASE_PRIVATE_KEY and FIREBASE_PROJECT_ID');
            }
            firebaseApp = (0, app_1.initializeApp)({
                credential: (0, app_1.cert)({
                    projectId,
                    privateKey,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                }),
            });
        }
        auth = (0, auth_1.getAuth)(firebaseApp);
        return auth;
    }
    catch (error) {
        console.error('Firebase initialization error:', error);
        throw error;
    }
}
/**
 * Verify Firebase ID token
 */
async function verifyToken(idToken) {
    try {
        const authInstance = initializeFirebase();
        const decodedToken = await authInstance.verifyIdToken(idToken);
        return decodedToken;
    }
    catch (error) {
        console.error('Token verification error:', error);
        throw new Error('Invalid or expired token');
    }
}
/**
 * Get user ID from request headers
 * Expects Authorization header: "Bearer <token>"
 */
async function getUserIdFromRequest(headers) {
    try {
        const authHeader = headers instanceof Headers
            ? headers.get('authorization')
            : headers['authorization'] || headers['Authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        const token = authHeader.substring(7);
        const decodedToken = await verifyToken(token);
        return decodedToken.uid;
    }
    catch (error) {
        console.error('Error getting user ID from request:', error);
        return null;
    }
}
/**
 * Middleware to verify authentication
 * Returns user ID if authenticated, throws error otherwise
 */
async function requireAuth(headers) {
    const userId = await getUserIdFromRequest(headers);
    if (!userId) {
        throw new Error('Unauthorized: Authentication required');
    }
    return userId;
}
/**
 * Get user email from token
 */
async function getUserEmailFromToken(idToken) {
    try {
        const decodedToken = await verifyToken(idToken);
        return decodedToken.email || null;
    }
    catch (error) {
        console.error('Error getting user email:', error);
        return null;
    }
}
/**
 * Create a user in Firebase Admin (if needed)
 */
async function createFirebaseUser(email, displayName) {
    try {
        const authInstance = initializeFirebase();
        const userRecord = await authInstance.createUser({
            email,
            displayName,
            emailVerified: false,
        });
        return userRecord.uid;
    }
    catch (error) {
        console.error('Error creating Firebase user:', error);
        throw error;
    }
}
