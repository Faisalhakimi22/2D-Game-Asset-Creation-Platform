"use strict";
/**
 * Real Test Setup Configuration
 * Configures Jest environment for testing with real Firebase services
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
exports.createdTestIds = exports.testAssetData = exports.testProjectData = exports.testUserData = exports.TEST_PREFIX = void 0;
exports.cleanupTestData = cleanupTestData;
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });
// Test data prefix to identify test records
exports.TEST_PREFIX = 'TEST_' + Date.now();
// Test user data
exports.testUserData = {
    firebase_uid: `${exports.TEST_PREFIX}_firebase_uid`,
    email: `${exports.TEST_PREFIX}@test.pixelar.com`,
    display_name: 'Test User',
    provider: 'google',
    plan_type: 'free',
    credits: 100,
};
// Test project data
exports.testProjectData = {
    title: `${exports.TEST_PREFIX} Test Project`,
    type: 'sprite',
    description: 'Test project for automated testing',
};
// Test asset data
exports.testAssetData = {
    name: `${exports.TEST_PREFIX}_test_sprite`,
    asset_type: 'sprite',
    file_type: 'png',
    blob_url: 'https://test.blob.vercel-storage.com/test.png',
    metadata: {
        prompt: 'test prompt',
        style: 'pixel_art',
    },
};
// Store created test IDs for cleanup
exports.createdTestIds = {
    users: [],
    projects: [],
    assets: [],
};
// Cleanup function to remove test data after tests
async function cleanupTestData() {
    const { getCollection } = await Promise.resolve().then(() => __importStar(require('../lib/db')));
    console.log('Cleaning up test data...');
    // Delete test assets
    for (const id of exports.createdTestIds.assets) {
        try {
            await getCollection('assets').doc(id).delete();
            console.log(`Deleted test asset: ${id}`);
        }
        catch (e) {
            console.error(`Failed to delete asset ${id}:`, e);
        }
    }
    // Delete test projects
    for (const id of exports.createdTestIds.projects) {
        try {
            await getCollection('projects').doc(id).delete();
            console.log(`Deleted test project: ${id}`);
        }
        catch (e) {
            console.error(`Failed to delete project ${id}:`, e);
        }
    }
    // Delete test users
    for (const id of exports.createdTestIds.users) {
        try {
            await getCollection('users').doc(id).delete();
            console.log(`Deleted test user: ${id}`);
        }
        catch (e) {
            console.error(`Failed to delete user ${id}:`, e);
        }
    }
    // Clear the arrays
    exports.createdTestIds.users = [];
    exports.createdTestIds.projects = [];
    exports.createdTestIds.assets = [];
    console.log('Test data cleanup complete.');
}
