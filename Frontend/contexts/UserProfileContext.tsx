"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/hooks/useUserProfile';

interface UserProfileContextType {
    userProfile: UserProfile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
    updateCredits: (creditsUsed: number) => Promise<boolean>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
    const { user: firebaseUser, loading: authLoading } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchUserProfile = async () => {
        if (!firebaseUser || authLoading) return;

        try {
            setLoading(true);
            const idToken = await firebaseUser.getIdToken();
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const userData = await response.json();
                const profileData = {
                    name: firebaseUser.displayName || userData.display_name || "User",
                    email: firebaseUser.email || userData.email || "",
                    avatarUrl: firebaseUser.photoURL || userData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firebaseUser.displayName || userData.display_name || firebaseUser.email || "User")}`,
                    plan: (userData.plan as "Free" | "Pro" | "Enterprise") || "Free",
                    credits: userData.credits || 0,
                    status: (userData.status as "Active" | "Inactive") || "Active",
                };
                console.log('User profile loaded:', profileData);
                setUserProfile(profileData);
            } else {
                console.warn('Failed to fetch user profile from backend, using Firebase data only');
                const fallbackData = {
                    name: firebaseUser.displayName || "User",
                    email: firebaseUser.email || "",
                    avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firebaseUser.displayName || firebaseUser.email || "User")}`,
                    plan: "Free" as const,
                    credits: 0,
                    status: "Active" as const,
                };
                console.log('Using fallback profile data:', fallbackData);
                setUserProfile(fallbackData);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Fallback to Firebase data
            const errorFallbackData = {
                name: firebaseUser.displayName || "User",
                email: firebaseUser.email || "",
                avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firebaseUser.displayName || firebaseUser.email || "User")}`,
                plan: "Free" as const,
                credits: 0,
                status: "Active" as const,
            };
            console.log('Using error fallback profile data:', errorFallbackData);
            setUserProfile(errorFallbackData);
        } finally {
            setLoading(false);
        }
    };

    const updateCredits = async (creditsUsed: number): Promise<boolean> => {
        if (!firebaseUser || !userProfile) return false;

        try {
            const idToken = await firebaseUser.getIdToken();
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/user/credits/deduct`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ credits: creditsUsed }),
            });

            if (response.ok) {
                const result = await response.json();
                // Update local state immediately for better UX
                setUserProfile(prev => prev ? {
                    ...prev,
                    credits: result.remaining_credits
                } : null);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating credits:', error);
            return false;
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [firebaseUser, authLoading]);

    const value: UserProfileContextType = {
        userProfile,
        loading: loading || authLoading,
        refreshProfile: fetchUserProfile,
        updateCredits,
    };

    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
}

export function useUserProfileContext() {
    const context = useContext(UserProfileContext);
    if (context === undefined) {
        throw new Error('useUserProfileContext must be used within a UserProfileProvider');
    }
    return context;
}