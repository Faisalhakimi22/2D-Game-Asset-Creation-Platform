"use strict";
/**
 * Firestore Collections Structure
 * Converted from PostgreSQL schema
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIRESTORE_COLLECTIONS = void 0;
exports.FIRESTORE_COLLECTIONS = {
    users: 'users',
    projects: 'projects',
    assets: 'assets',
    generationJobs: 'generation_jobs',
    creditsTransactions: 'credits_transactions',
};
/**
 * Firestore Indexes Required
 *
 * Create these indexes in Firebase Console:
 *
 * Collection: users
 * - firebase_uid (Ascending) - Single field
 * - email (Ascending) - Single field
 * - created_at (Descending) - Single field
 *
 * Collection: projects
 * - user_id (Ascending), type (Ascending) - Composite
 * - user_id (Ascending), status (Ascending) - Composite
 * - user_id (Ascending), created_at (Descending) - Composite
 *
 * Collection: assets
 * - project_id (Ascending), asset_type (Ascending) - Composite
 * - user_id (Ascending), status (Ascending) - Composite
 * - project_id (Ascending), created_at (Descending) - Composite
 *
 * Collection: generation_jobs
 * - user_id (Ascending), status (Ascending) - Composite
 * - project_id (Ascending), created_at (Descending) - Composite
 *
 * Collection: credits_transactions
 * - user_id (Ascending), created_at (Descending) - Composite
 * - transaction_type (Ascending), created_at (Descending) - Composite
 */
