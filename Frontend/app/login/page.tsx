"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Logo } from "@/components/Logo";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/sync-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          firebase_uid: user.uid,
          email: user.email,
          display_name: user.displayName,
          avatar_url: user.photoURL,
          email_verified: user.emailVerified,
          provider: 'google'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to sync user with backend');
      }
      router.push('/home');
    } catch (err: any) {
      console.error("Authentication error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign in cancelled.");
      } else if (err.code === 'auth/configuration-not-found') {
        setError("Authentication not configured. Please check .env.local");
      } else if (err.message?.includes('fetch') || err.message?.includes('network') || err.name === 'TypeError') {
        setError("Cannot connect to backend server. Please ensure the backend is running on port 3001.");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Pixel grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
        backgroundSize: '16px 16px'
      }} />

      {/* Animated pixel orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-none blur-2xl animate-pulse" />
      <div className="absolute bottom-40 right-40 w-48 h-48 bg-accent-cyan/10 rounded-none blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Left Side - Hero Banner Style (same as home page) */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12">
        <div className="hero-banner relative w-full max-w-3xl rounded-xl overflow-hidden !bg-transparent" style={{ background: 'transparent' }}>
          {/* Background Image */}
          <Image
            src="/preview.png"
            alt="Game Asset Showcase"
            width={900}
            height={700}
            className="w-full h-auto object-contain"
            priority
          />
          
          {/* Decorative Corner Pixels */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-primary/60 z-10"></div>
          <div className="absolute top-4 right-4 w-3 h-3 bg-accent-cyan/60 z-10"></div>
          <div className="absolute bottom-4 left-4 w-3 h-3 bg-accent-pink/60 z-10"></div>
          <div className="absolute bottom-4 right-4 w-3 h-3 bg-accent-orange/60 z-10"></div>
          
          {/* Text overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-8 z-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-lg">
                Generate <span className="text-primary glow-text">Pixel Perfect</span>
                <br />Game Assets
              </h2>
              <p className="text-gray-300 text-sm max-w-md drop-shadow-md">
                Sprites, scenes, and animations ready for Unity, Godot, and Unreal Engine.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <Logo size="2xl" linkTo={null} />

          {/* Heading */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-sm">
              <div className="w-2 h-2 bg-primary animate-pulse" />
              <span className="text-xs font-mono text-primary uppercase tracking-wider">Game Dev Tools</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
              Create game assets
              <br />
              <span className="text-primary">in minutes</span>
            </h1>
            
            <p className="text-text-muted text-base">
              AI-powered sprites, scenes & animations for Unity, Godot, and Unreal Engine.
            </p>
          </div>

          {/* Sign In */}
          <div className="space-y-4 pt-4">
            {/* Pixel-style button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 relative group"
              style={{
                clipPath: 'polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))'
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" />
                    <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#fff" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400 text-center font-mono">{error}</p>
              </div>
            )}
          </div>

          {/* Terms */}
          <p className="text-xs text-text-dim text-center font-mono">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">Terms</a>
            {" "}and{" "}
            <a href="#" className="text-primary hover:underline">Privacy</a>
          </p>

          {/* Pixel decoration */}
          <div className="flex justify-center gap-1 pt-4">
            <div className="w-2 h-2 bg-primary/60" />
            <div className="w-2 h-2 bg-primary/40" />
            <div className="w-2 h-2 bg-primary/20" />
          </div>
        </div>
      </div>
    </main>
  );
}
