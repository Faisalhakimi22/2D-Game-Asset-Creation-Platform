"use client";

import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";

export function DebugUserProfile() {
    const { user: firebaseUser, loading: authLoading } = useAuth();
    const userProfile = useUserProfile();

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
            <h3 className="font-bold mb-2">Debug: User Profile</h3>
            <div className="space-y-1">
                <div>Auth Loading: {authLoading ? 'Yes' : 'No'}</div>
                <div>Firebase User: {firebaseUser ? 'Logged in' : 'Not logged in'}</div>
                {firebaseUser && (
                    <>
                        <div>Display Name: {firebaseUser.displayName || 'None'}</div>
                        <div>Email: {firebaseUser.email || 'None'}</div>
                        <div>Photo URL: {firebaseUser.photoURL || 'None'}</div>
                    </>
                )}
                <div>User Profile: {userProfile ? 'Loaded' : 'Not loaded'}</div>
                {userProfile && (
                    <>
                        <div>Name: {userProfile.name}</div>
                        <div>Avatar URL: {userProfile.avatarUrl}</div>
                        <div>Plan: {userProfile.plan}</div>
                        <div>Credits: {userProfile.credits}</div>
                    </>
                )}
            </div>
        </div>
    );
}