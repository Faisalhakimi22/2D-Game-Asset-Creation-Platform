/**
 * Firestore Collections Structure
 * Converted from PostgreSQL schema
 */

export const FIRESTORE_COLLECTIONS = {
  users: 'users',
  projects: 'projects',
  assets: 'assets',
  generationJobs: 'generation_jobs',
  creditsTransactions: 'credits_transactions',
} as const;

/**
 * Firestore Collection Schemas
 */

// Users Collection
export interface FirestoreUser {
  id: string; // Document ID
  firebase_uid: string;
  email: string;
  email_verified: boolean;
  display_name?: string;
  avatar_url?: string;
  provider: 'google' | 'email' | 'github';
  plan_type: 'free' | 'pro' | 'enterprise';
  credits: number;
  credits_used: number;
  created_at: FirebaseFirestore.Timestamp;
  updated_at: FirebaseFirestore.Timestamp;
  last_login_at?: FirebaseFirestore.Timestamp;
}

// Projects Collection
export interface FirestoreProject {
  id: string; // Document ID
  user_id: string; // Reference to users collection
  title: string;
  type: 'sprite' | 'scene';
  description?: string;
  color?: string; // Hex color
  thumbnail_url?: string;
  settings: {
    style?: 'pixel_art' | '2d_flat';
    viewpoint?: 'front' | 'back' | 'side' | 'top_down' | 'isometric';
    dimensions?: string;
    sprite_type?: 'character' | 'object';
    resolution?: string;
    [key: string]: any;
  };
  status: 'draft' | 'active' | 'archived' | 'deleted';
  created_at: FirebaseFirestore.Timestamp;
  updated_at: FirebaseFirestore.Timestamp;
}

// Assets Collection
export interface FirestoreAsset {
  id: string; // Document ID
  project_id: string; // Reference to projects collection
  user_id: string; // Reference to users collection
  name?: string;
  asset_type: 'sprite' | 'scene' | 'reference_image' | 'pose_image' | 'variant' | 'export';
  file_type: 'png' | 'jpg' | 'jpeg' | 'webp' | 'gif' | 'json' | 'zip';
  blob_url: string;
  blob_path: string;
  blob_id?: string;
  file_size?: number; // Bytes
  width?: number;
  height?: number;
  mime_type?: string;
  metadata: {
    prompt?: string;
    colors?: string[];
    generation_params?: Record<string, any>;
    variant_index?: number;
    pose_data?: any;
    export_format?: 'unity' | 'godot' | 'unreal';
    [key: string]: any;
  };
  status: 'active' | 'deleted' | 'processing';
  created_at: FirebaseFirestore.Timestamp;
  updated_at: FirebaseFirestore.Timestamp;
}

// Generation Jobs Collection
export interface FirestoreGenerationJob {
  id: string; // Document ID
  user_id: string; // Reference to users collection
  project_id?: string; // Reference to projects collection
  job_type: 'sprite_generation' | 'scene_generation' | 'variant_generation';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  input_params: {
    prompt: string;
    reference_image_url?: string;
    colors?: string[];
    style?: 'pixel_art' | '2d_flat';
    viewpoint?: 'front' | 'back' | 'side' | 'top_down' | 'isometric';
    dimensions?: string;
    pose_image_url?: string;
    sprite_type?: 'character' | 'object';
    resolution?: string;
    [key: string]: any;
  };
  output_assets: string[]; // Array of asset IDs
  error_message?: string;
  credits_cost: number;
  created_at: FirebaseFirestore.Timestamp;
  started_at?: FirebaseFirestore.Timestamp;
  completed_at?: FirebaseFirestore.Timestamp;
}

// Credits Transactions Collection
export interface FirestoreCreditsTransaction {
  id: string; // Document ID
  user_id: string; // Reference to users collection
  transaction_type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'expiration';
  amount: number; // Positive for additions, negative for deductions
  generation_job_id?: string; // Reference to generation_jobs collection
  description?: string;
  balance_after: number;
  created_at: FirebaseFirestore.Timestamp;
}

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

