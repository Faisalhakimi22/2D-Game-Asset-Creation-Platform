/**
 * Real Test Setup Configuration
 * Configures Jest environment for testing with real Firebase services
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Test data prefix to identify test records
export const TEST_PREFIX = 'TEST_' + Date.now();

// Test user data
export const testUserData = {
    firebase_uid: `${TEST_PREFIX}_firebase_uid`,
    email: `${TEST_PREFIX}@test.pixelar.com`,
    display_name: 'Test User',
    provider: 'google' as const,
    plan_type: 'free' as const,
    credits: 100,
};

// Test project data
export const testProjectData = {
    title: `${TEST_PREFIX} Test Project`,
    type: 'sprite' as const,
    description: 'Test project for automated testing',
};

// Test asset data
export const testAssetData = {
    name: `${TEST_PREFIX}_test_sprite`,
    asset_type: 'sprite' as const,
    file_type: 'png' as const,
    blob_url: 'https://test.blob.vercel-storage.com/test.png',
    metadata: {
        prompt: 'test prompt',
        style: 'pixel_art',
    },
};

// Store created test IDs for cleanup
export const createdTestIds: {
    users: string[];
    projects: string[];
    assets: string[];
} = {
    users: [],
    projects: [],
    assets: [],
};

// Cleanup function to remove test data after tests
export async function cleanupTestData() {
    const { getCollection } = await import('../lib/db');
    
    console.log('Cleaning up test data...');
    
    // Delete test assets
    for (const id of createdTestIds.assets) {
        try {
            await getCollection('assets').doc(id).delete();
            console.log(`Deleted test asset: ${id}`);
        } catch (e) {
            console.error(`Failed to delete asset ${id}:`, e);
        }
    }
    
    // Delete test projects
    for (const id of createdTestIds.projects) {
        try {
            await getCollection('projects').doc(id).delete();
            console.log(`Deleted test project: ${id}`);
        } catch (e) {
            console.error(`Failed to delete project ${id}:`, e);
        }
    }
    
    // Delete test users
    for (const id of createdTestIds.users) {
        try {
            await getCollection('users').doc(id).delete();
            console.log(`Deleted test user: ${id}`);
        } catch (e) {
            console.error(`Failed to delete user ${id}:`, e);
        }
    }
    
    // Clear the arrays
    createdTestIds.users = [];
    createdTestIds.projects = [];
    createdTestIds.assets = [];
    
    console.log('Test data cleanup complete.');
}
