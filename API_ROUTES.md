# Pixelar Backend API Routes

## Authentication Routes (`/api/auth`)

### POST `/api/auth/sync-user`
Sync user from Firebase Auth to Firestore database.

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "firebase_uid": "string",
  "email": "string",
  "display_name": "string",
  "avatar_url": "string",
  "email_verified": boolean,
  "provider": "google"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "firebase_uid": "string",
    "email": "string",
    "display_name": "string",
    "avatar_url": "string",
    "plan_type": "free|pro|enterprise",
    "credits": number,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### GET `/api/auth/me`
Get current user by Firebase token.

**Headers:**
- `Authorization: Bearer <firebase_id_token>`

**Response:**
```json
{
  "user": {
    "id": "string",
    "firebase_uid": "string",
    "email": "string",
    "display_name": "string",
    "avatar_url": "string",
    "plan_type": "free|pro|enterprise",
    "credits": number,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

## User Profile Routes (`/api/user`)

### GET `/api/user/profile`
Get current user profile with formatted data.

**Headers:**
- `Authorization: Bearer <firebase_id_token>`

**Response:**
```json
{
  "id": "string",
  "email": "string",
  "display_name": "string",
  "avatar_url": "string",
  "plan": "Free|Pro|Enterprise",
  "credits": number,
  "status": "Active|Inactive",
  "created_at": "timestamp",
  "last_login_at": "timestamp"
}
```

### POST `/api/user/credits/deduct`
Deduct credits from user account (used when generating assets).

**Headers:**
- `Authorization: Bearer <firebase_id_token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "credits": number
}
```

**Response:**
```json
{
  "success": true,
  "remaining_credits": number,
  "deducted": number
}
```

**Error Response (Insufficient Credits):**
```json
{
  "error": "Insufficient credits"
}
```

### POST `/api/user/credits/add`
Add credits to user account (for purchases, bonuses, etc.).

**Headers:**
- `Authorization: Bearer <firebase_id_token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "credits": number,
  "reason": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "total_credits": number,
  "added": number
}
```

### PUT `/api/user/profile`
Update user profile information.

**Headers:**
- `Authorization: Bearer <firebase_id_token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "display_name": "string (optional)",
  "avatar_url": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "display_name": "string",
    "avatar_url": "string",
    "plan": "Free|Pro|Enterprise",
    "credits": number,
    "status": "Active|Inactive"
  }
}
```

## Credit Costs

- **Sprite Generation**: 5 credits per generation
- **Scene Generation**: 8 credits per generation
- **Animation Generation**: 10 credits per generation (if implemented)

## Error Responses

All endpoints may return these error responses:

**401 Unauthorized:**
```json
{
  "error": "Missing or invalid authorization header"
}
```

**404 Not Found:**
```json
{
  "error": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Error details (in development mode)"
}
```


## Generation Routes (`/api/generate`)

### POST `/api/generate/sprite`
Generate sprite images using AI (Gemini).

**Headers:**
- `Authorization: Bearer <firebase_id_token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "prompt": "string (required) - Description of the sprite to generate",
  "style": "pixel_art | 2d_flat (default: pixel_art)",
  "aspectRatio": "2:3 | 1:1 | 9:16 | 4:3 | 3:2 | 16:9 (default: 1:1)",
  "viewpoint": "front | back | side | top_down | isometric (default: front)",
  "colors": ["#hex1", "#hex2"] (optional - color palette),
  "dimensions": "32x32 | 64x64 | 128x128 | 256x256 (default: 64x64)",
  "quantity": 1-4 (default: 2),
  "referenceImage": "base64 data URL (optional)",
  "poseImage": "base64 data URL (optional)",
  "apiKey": "string (optional - user's own Gemini API key for BYOK)",
  "saveToCloud": boolean (default: true)
}
```

**Response:**
```json
{
  "success": true,
  "images": ["url1", "url2"],
  "creditsUsed": 5,
  "remainingCredits": 95
}
```

**Error Response (Insufficient Credits):**
```json
{
  "error": "Insufficient credits",
  "required": 5,
  "available": 2
}
```

### POST `/api/generate/scene`
Generate scene/background images using AI (Gemini).

**Headers:**
- `Authorization: Bearer <firebase_id_token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "prompt": "string (required) - Description of the scene to generate",
  "style": "pixel_art | 2d_flat (default: pixel_art)",
  "aspectRatio": "2:3 | 1:1 | 9:16 | 4:3 | 3:2 | 16:9 (default: 16:9)",
  "viewpoint": "front | side | top_down | isometric (default: side)",
  "colors": ["#hex1", "#hex2"] (optional - color palette),
  "quantity": 1-4 (default: 2),
  "referenceImage": "base64 data URL (optional)",
  "apiKey": "string (optional - user's own Gemini API key for BYOK)"
}
```

**Response:**
```json
{
  "success": true,
  "images": ["url1", "url2"],
  "creditsUsed": 8,
  "remainingCredits": 92
}
```

## Environment Variables Required

Add to `Backend/.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

Note: Users can also use their own API key (BYOK - Bring Your Own Key) by storing it in localStorage under `replicate_api_key`. When using their own key, no credits are deducted.
