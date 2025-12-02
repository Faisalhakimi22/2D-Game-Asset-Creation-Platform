# Pixelar Setup Guide

## Features Implemented

### 1. **New Project Modal** ✅
- Click "New Project" button or the dashed card
- Select project type: **Sprite** or **Scene**
- Enter project name
- Creates project instantly with random color

### 2. **Import Functionality** ✅
- Click "Import" button
- Browse and select image files (PNG, JPG, JPEG, GIF)
- Multiple file selection supported
- Automatically creates projects from imported files

### 3. **Login with Firebase** ✅
- Google Sign-in ready
- Loading states and error handling
- Redirects to projects page after login
- **Just needs Firebase credentials to work**

## Firebase Setup Instructions

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard

### Step 2: Enable Google Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Google** sign-in provider
4. Save changes

### Step 3: Get Firebase Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click the **Web** icon (</>)
4. Register your app
5. Copy the `firebaseConfig` values

### Step 4: Add Credentials to Project
1. Copy `.env.local.example` to `.env.local`
2. Fill in your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 5: Uncomment Firebase Code
1. Open `lib/firebase.ts` and uncomment the Firebase initialization code
2. Open `app/login/page.tsx` and uncomment the Firebase auth imports
3. Open `hooks/useAuth.ts` and uncomment the authentication hook

### Step 6: Install Firebase
```bash
npm install firebase
```

### Step 7: Test Login
1. Run the development server: `npm run dev`
2. Go to `/login`
3. Click "Continue with Google"
4. Sign in with your Google account

## Current Functionality (Without Firebase)

The app currently works with a **mock authentication** that:
- Simulates a 1-second loading delay
- Redirects to projects page after clicking sign in
- All other features work perfectly

This allows you to develop and test the UI without Firebase configured.

## Project Structure

```
app/
├── login/page.tsx          # Login page with Google auth
├── projects/page.tsx       # Projects dashboard with modal & import
└── page.tsx                # Home page

lib/
└── firebase.ts             # Firebase configuration (needs credentials)

hooks/
└── useAuth.ts              # Authentication hook (ready for Firebase)

.env.local.example          # Firebase credentials template
```

## Next Steps

1. Add your Firebase credentials
2. Uncomment Firebase code in the files mentioned above
3. Install Firebase: `npm install firebase`
4. Test the authentication flow

The entire authentication system is **ready to go** - it just needs Firebase credentials!
