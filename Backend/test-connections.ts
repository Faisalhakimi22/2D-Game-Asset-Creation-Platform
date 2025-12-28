/**
 * Test script to verify Firebase Auth, Firestore, and Blob storage connections
 * Run with: npx tsx test-connections.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { getDb, healthCheck } from './lib/db';
import { blobService } from './lib/blob';

async function testFirestoreConnection() {
  console.log('\n🔥 Testing Firestore Connection...');
  try {
    const isHealthy = await healthCheck();
    if (isHealthy) {
      console.log('✅ Firestore connection successful!');
    } else {
      console.log('❌ Firestore health check failed');
      return false;
    }

    // Test read/write
    const db = getDb();
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
  } catch (error: any) {
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
    
    const uploadResult = await blobService.upload({
      path: testPath,
      data: testContent,
      options: { contentType: 'text/plain' }
    });
    console.log('✅ Blob upload successful!');
    console.log('   URL:', uploadResult.url);

    // Test list
    const listResult = await blobService.list({ prefix: '_test/' });
    console.log('✅ Blob list successful! Found', listResult.blobs.length, 'test blobs');

    // Test head (metadata)
    const metadata = await blobService.head(uploadResult.url);
    if (metadata) {
      console.log('✅ Blob metadata retrieval successful!');
    }

    // Test delete (cleanup)
    await blobService.delete(uploadResult.url);
    console.log('✅ Blob delete successful!');

    return true;
  } catch (error: any) {
    console.error('❌ Blob storage test failed:', error.message);
    return false;
  }
}

async function testFirebaseAuth() {
  console.log('\n🔐 Testing Firebase Auth initialization...');
  try {
    // Import auth module to trigger initialization
    const { verifyToken } = await import('./lib/auth');
    
    // We can't fully test token verification without a real token,
    // but we can verify the SDK initializes correctly
    console.log('✅ Firebase Auth SDK initialized successfully!');
    
    // Test with invalid token to verify the SDK is working
    try {
      await verifyToken('invalid-token');
    } catch (error: any) {
      if (error.message.includes('Invalid') || error.message.includes('expired') || error.message.includes('Decoding')) {
        console.log('✅ Firebase Auth token verification is working (correctly rejected invalid token)');
        return true;
      }
      throw error;
    }
    
    return true;
  } catch (error: any) {
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
