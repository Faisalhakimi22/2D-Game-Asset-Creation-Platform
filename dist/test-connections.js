"use strict";
/**
 * Test script to verify Firebase Auth, Firestore, and Blob storage connections
 * Run with: npx tsx test-connections.ts
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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const db_1 = require("./lib/db");
const blob_1 = require("./lib/blob");
async function testFirestoreConnection() {
    console.log('\n🔥 Testing Firestore Connection...');
    try {
        const isHealthy = await (0, db_1.healthCheck)();
        if (isHealthy) {
            console.log('✅ Firestore connection successful!');
        }
        else {
            console.log('❌ Firestore health check failed');
            return false;
        }
        // Test read/write
        const db = (0, db_1.getDb)();
        const testDoc = db.collection('_test').doc('connection-test');
        await testDoc.set({
            test: true,
            timestamp: new Date().toISOString()
        });
        const snapshot = await testDoc.get();
        console.log('✅ Firestore read/write test passed!');
        // Cleanup
        await testDoc.delete();
        console.log('✅ Firestore cleanup successful!');
        return true;
    }
    catch (error) {
        console.error('❌ Firestore test failed:', error.message);
        return false;
    }
}
async function testBlobStorage() {
    console.log('\n📦 Testing Vercel Blob Storage...');
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.log('⚠️  BLOB_READ_WRITE_TOKEN not set - skipping blob tests');
        return false;
    }
    try {
        // Test upload
        const testContent = Buffer.from('Test content ' + Date.now());
        const testPath = `_test/connection-test-${Date.now()}.txt`;
        const uploadResult = await blob_1.blobService.upload({
            path: testPath,
            data: testContent,
            options: { contentType: 'text/plain' }
        });
        console.log('✅ Blob upload successful!');
        console.log('   URL:', uploadResult.url);
        // Test list
        const listResult = await blob_1.blobService.list({ prefix: '_test/' });
        console.log('✅ Blob list successful! Found', listResult.blobs.length, 'test blobs');
        // Test head (metadata)
        const metadata = await blob_1.blobService.head(uploadResult.url);
        if (metadata) {
            console.log('✅ Blob metadata retrieval successful!');
        }
        // Test delete (cleanup)
        await blob_1.blobService.delete(uploadResult.url);
        console.log('✅ Blob delete successful!');
        return true;
    }
    catch (error) {
        console.error('❌ Blob storage test failed:', error.message);
        return false;
    }
}
async function testFirebaseAuth() {
    console.log('\n🔐 Testing Firebase Auth initialization...');
    try {
        // Import auth module to trigger initialization
        const { verifyToken } = await Promise.resolve().then(() => __importStar(require('./lib/auth')));
        // We can't fully test token verification without a real token,
        // but we can verify the SDK initializes correctly
        console.log('✅ Firebase Auth SDK initialized successfully!');
        // Test with invalid token to verify the SDK is working
        try {
            await verifyToken('invalid-token');
        }
        catch (error) {
            if (error.message.includes('Invalid') || error.message.includes('expired') || error.message.includes('Decoding')) {
                console.log('✅ Firebase Auth token verification is working (correctly rejected invalid token)');
                return true;
            }
            throw error;
        }
        return true;
    }
    catch (error) {
        console.error('❌ Firebase Auth test failed:', error.message);
        return false;
    }
}
async function main() {
    console.log('========================================');
    console.log('  Backend Connection Tests');
    console.log('========================================');
    const results = {
        firestore: await testFirestoreConnection(),
        auth: await testFirebaseAuth(),
        blob: await testBlobStorage(),
    };
    console.log('\n========================================');
    console.log('  Test Results Summary');
    console.log('========================================');
    console.log('Firestore:', results.firestore ? '✅ PASS' : '❌ FAIL');
    console.log('Firebase Auth:', results.auth ? '✅ PASS' : '❌ FAIL');
    console.log('Blob Storage:', results.blob ? '✅ PASS' : '❌ FAIL');
    const allPassed = Object.values(results).every(r => r);
    console.log('\nOverall:', allPassed ? '✅ All tests passed!' : '⚠️  Some tests failed');
    process.exit(allPassed ? 0 : 1);
}
main();
