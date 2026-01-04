# Pixelar Backend API

## Overview

This backend API is designed to support the Pixelar frontend application, providing:
- User authentication and management (Firebase Auth + Firestore)
- Project management (sprites and scenes)
- Asset storage and metadata (Vercel Blob)
- AI generation job tracking
- Credits system

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
# Firebase Configuration (if not using service account JSON file)
FIREBASE_PROJECT_ID=pixelar-webapp
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL="..."

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_token_here

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
npm start
```

## Deployment

### Firebase Cloud Run

This backend can be deployed to Firebase Cloud Run:

1. Build the Docker image
2. Deploy to Cloud Run
3. Set environment variables in Cloud Run console

### Firebase Functions

Alternatively, you can deploy as Firebase Functions (requires additional configuration).

### 3. TypeScript Types

All TypeScript types are available in `types/`:
- `types/database.types.ts` - Database entity types
- `types/blob-storage.types.ts` - Blob storage types

## Database Schema (Firestore)

### Collections

| Collection | Purpose | Key Relationships |
|------------|---------|-------------------|
| `users` | User accounts and authentication | → projects, generation_jobs, credits_transactions |
| `projects` | Sprite/scene projects | → assets, generation_jobs |
| `assets` | File metadata | → projects, users |
| `generation_jobs` | AI generation tracking | → users, projects, assets |
| `credits_transactions` | Credit usage history | → users, generation_jobs |

See `schemas/firestore-collections.ts` for collection names and required indexes.

### Storage Structure

```
Vercel Blob:
├── users/{userId}/
│   ├── avatar/
│   ├── projects/{projectId}/
│   │   ├── sprites/
│   │   ├── scenes/
│   │   ├── references/
│   │   ├── poses/
│   │   └── exports/
│   └── temp/
```

## Key Features

### User Management
- Firebase Authentication integration
- Subscription plans (free, pro, enterprise)
- Credits system with transaction history
- Profile management

### Project Management
- Support for sprite and scene projects
- Flexible settings via JSONB
- Status tracking (draft, active, archived, deleted)
- Thumbnail management

### Asset Management
- Metadata storage in database
- Actual files in Vercel Blob
- Support for multiple asset types
- Variant tracking for scenes

### Generation System
- Job tracking with status
- Input parameter storage
- Output asset linking
- Credit cost tracking

## File Structure

```
Backend/
├── api/
│   ├── index.ts                  # Express server entry point
│   └── routes/
│       └── auth.routes.ts        # Authentication routes
├── lib/
│   ├── auth.ts                   # Firebase Auth utilities
│   ├── blob.ts                   # Vercel Blob service
│   └── db.ts                     # Firestore connection
├── services/
│   ├── user.service.ts           # User business logic
│   └── project.service.ts        # Project business logic
├── schemas/
│   └── firestore-collections.ts  # Firestore collection definitions
├── types/
│   ├── database.types.ts         # Database TypeScript types
│   └── blob-storage.types.ts     # Blob storage TypeScript types
└── README.md                      # This file
```

## API Endpoints

### Authentication

- `POST /api/auth/sync-user` - Sync user from Firebase Auth to Firestore
- `GET /api/auth/me` - Get current user by Firebase token

### Health Check

- `GET /health` - Server health check

## Data Flow Examples

### User Authentication Flow

1. **User signs in with Firebase Auth** (frontend)
2. **Frontend calls** `POST /api/auth/sync-user` with user data
3. **Backend creates/updates user** in Firestore
4. **Returns user data** to frontend

### Creating a Sprite Project

1. **User creates project** via API
2. **Generate thumbnail** and upload to Vercel Blob
3. **Update project** with thumbnail URL
4. **Generate sprite** via AI generation job
5. **Upload result** to Vercel Blob
6. **Create asset record** in Firestore

## TypeScript Usage

```typescript
import { UserService } from './services/user.service';
import { ProjectService } from './services/project.service';

// Create a user
const user = await UserService.create({
  firebase_uid: 'firebase-uid',
  email: 'user@example.com',
  display_name: 'John Doe',
  provider: 'google',
});

// Create a project
const project = await ProjectService.create({
  user_id: user.id,
  title: 'My Sprite',
  type: 'sprite',
  settings: {
    style: 'pixel_art',
    dimensions: '64x64'
  }
});
```

## Resources

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Express.js Documentation](https://expressjs.com/)

