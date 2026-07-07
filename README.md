# 🎮 Pixelar - AI-Powered 2D Game Asset Creation Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-12-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Full-stack web platform for generating and managing AI-powered 2D game assets**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture)

</div>

---

## 🌟 Overview

Pixelar is a comprehensive full-stack application that enables game developers to create, manage, and export 2D game assets using AI generation. The platform features a modern React frontend with Three.js 3D previews, a robust Express backend with Firebase integration, and a complete credits/subscription system.

## ✨ Features

### **Asset Generation**
- 🎨 AI-powered sprite generation
- 🌄 Scene/background creation
- 🔄 Multiple style options (pixel art, hand-drawn, etc.)
- ⚡ Real-time generation tracking
- 📐 Custom dimensions and settings

### **Project Management**
- 📁 Organize sprites and scenes into projects
- 🖼️ Asset library with thumbnails
- 🗂️ Version control for asset variants
- 📊 Project status tracking (draft, active, archived)
- 💾 Export functionality

### **User System**
- 🔐 Firebase Authentication (Google, Email)
- 👤 User profiles and preferences
- 💳 Subscription plans (Free, Pro, Enterprise)
- 🪙 Credits system with transaction history
- 📈 Usage analytics

### **Platform Features**
- 🎭 Three.js 3D asset preview
- 📱 Responsive design (mobile-friendly)
- ☁️ Cloud storage (Vercel Blob)
- 🔄 Real-time updates
- 🎯 Type-safe with TypeScript
- 🧪 Test coverage with Jest

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui
- **3D Graphics**: Three.js + React Three Fiber
- **State Management**: React Context API
- **Icons**: Lucide React
- **Authentication**: Firebase Auth

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript 5
- **Database**: Firebase Firestore
- **Storage**: Vercel Blob Storage
- **Authentication**: Firebase Admin SDK
- **Validation**: Zod schemas
- **Testing**: Jest + ts-jest

### **Infrastructure**
- **Hosting**: Vercel (Frontend), Firebase Cloud Run (Backend)
- **Database**: Firebase Firestore (NoSQL)
- **File Storage**: Vercel Blob Storage
- **Authentication**: Firebase Authentication
- **CI/CD**: GitHub Actions (planned)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled
- Vercel account with Blob Storage
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Faisalhakimi22/2D-Game-Asset-Creation-Platform.git
cd 2D-Game-Asset-Creation-Platform
```

### 2. Backend Setup

```bash
cd Backend
npm install

# Copy environment template
cp .env.example .env

# Configure .env with your Firebase and Vercel credentials
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_PRIVATE_KEY=your-private-key
# FIREBASE_CLIENT_EMAIL=your-client-email
# BLOB_READ_WRITE_TOKEN=your-blob-token
# PORT=3001
# FRONTEND_URL=http://localhost:3000

# Start development server
npm run dev
```

Backend will run on `http://localhost:3001`

See [Backend/README.md](Backend/README.md) for detailed setup instructions.

### 3. Frontend Setup

```bash
cd Frontend
npm install

# Copy environment template
cp .env.local.example .env.local

# Configure .env.local with Firebase config
# NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

See [Frontend/SETUP.md](Frontend/SETUP.md) for detailed setup instructions.

### 4. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📁 Project Structure

```
2D-Game-Asset-Creation-Platform/
├── Backend/                    # Express.js REST API
│   ├── api/                   # API routes and server
│   ├── services/              # Business logic layer
│   ├── lib/                   # Firebase, Blob utilities
│   ├── schemas/               # Firestore collection schemas
│   ├── types/                 # TypeScript type definitions
│   ├── tests/                 # Unit and integration tests
│   └── README.md              # Backend documentation
├── Frontend/                   # Next.js web application
│   ├── app/                   # Next.js app router pages
│   ├── components/            # React components
│   ├── contexts/              # React context providers
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   ├── public/                # Static assets
│   └── SETUP.md               # Frontend setup guide
└── README.md                   # This file
```

## 🏗️ Architecture

### System Overview

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│   Next.js Frontend          │
│   - React 19 + TypeScript   │
│   - Tailwind CSS            │
│   - Three.js (3D Preview)   │
│   - Firebase Auth (Client)  │
└──────────┬──────────────────┘
           │
           ▼ REST API
┌─────────────────────────────┐
│   Express Backend           │
│   - TypeScript              │
│   - Firebase Admin SDK      │
│   - Zod Validation          │
└──────┬──────────┬───────────┘
       │          │
       ▼          ▼
┌─────────────┐ ┌──────────────┐
│  Firestore  │ │ Vercel Blob  │
│  Database   │ │   Storage    │
└─────────────┘ └──────────────┘
```

### Data Flow

1. **User Authentication**: Firebase Auth → Frontend → Backend (token verification)
2. **Project Creation**: Frontend → Backend API → Firestore
3. **Asset Generation**: Frontend → Backend → AI Service → Blob Storage → Firestore
4. **Asset Retrieval**: Frontend → Backend → Blob Storage (signed URLs)

### Database Schema (Firestore)

**Collections:**
- `users` - User accounts and profiles
- `projects` - Sprite/scene projects
- `assets` - Generated asset metadata
- `generation_jobs` - AI generation tracking
- `credits_transactions` - Credit usage history

See [Backend/README.md](Backend/README.md) for detailed schema.

## 🔑 Key Features Implementation

### Authentication Flow
- User signs in with Firebase (Google/Email)
- Frontend receives Firebase token
- Backend validates token with Firebase Admin SDK
- User data synced to Firestore

### Credits System
- Each user has credit balance
- Generation jobs consume credits
- Transactions tracked in `credits_transactions`
- Subscription plans provide credit allocations

### Asset Management
- Metadata stored in Firestore
- Files stored in Vercel Blob Storage
- Organized by user and project
- Support for multiple variants (scenes)

### Generation Pipeline
1. User submits generation request
2. Backend creates `generation_job` record
3. AI service processes request (async)
4. Result uploaded to Blob Storage
5. Asset record created in Firestore
6. Credits deducted from user balance
7. Frontend receives real-time update

## 🧪 Testing

### Backend Tests

```bash
cd Backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit

# Watch mode
npm run test:watch
```

## 📦 Deployment

### Frontend (Vercel)

```bash
cd Frontend
npm run build

# Deploy to Vercel
vercel --prod
```

### Backend (Firebase Cloud Run)

```bash
cd Backend
npm run build

# Deploy with Firebase CLI
firebase deploy --only functions
```

## 🔐 Environment Variables

### Backend (.env)
```
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
BLOB_READ_WRITE_TOKEN=
PORT=3001
FRONTEND_URL=
```

### Frontend (.env.local)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_API_BASE_URL=
```

## 📈 Performance

- **Frontend Load Time**: < 2 seconds
- **API Response Time**: < 200ms (avg)
- **Asset Generation**: 5-30 seconds (depending on complexity)
- **Database Queries**: Indexed for optimal performance
- **Storage**: Blob URLs with CDN caching

## 🚧 Roadmap

### Phase 1 (Current - MVP)
- [x] User authentication
- [x] Project management
- [x] Basic asset generation
- [x] Credits system
- [x] Asset storage

### Phase 2 (In Progress)
- [ ] Advanced AI generation options
- [ ] Batch generation
- [ ] Asset animation system
- [ ] Collaborative features
- [ ] Advanced export formats

### Phase 3 (Planned)
- [ ] Marketplace for assets
- [ ] Template library
- [ ] API for developers
- [ ] Mobile apps (iOS/Android)
- [ ] Plugin system

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Firebase** - Backend infrastructure
- **Vercel** - Hosting and blob storage
- **Three.js** - 3D graphics
- **shadcn/ui** - UI components

## 📧 Contact

**Faisal Hakimi**
- GitHub: [@Faisalhakimi22](https://github.com/Faisalhakimi22)
- Project Link: [https://github.com/Faisalhakimi22/2D-Game-Asset-Creation-Platform](https://github.com/Faisalhakimi22/2D-Game-Asset-Creation-Platform)

---

<div align="center">

**Built with ❤️ for Game Developers**

Made by [Faisal Hakimi](https://github.com/Faisalhakimi22)

</div>
