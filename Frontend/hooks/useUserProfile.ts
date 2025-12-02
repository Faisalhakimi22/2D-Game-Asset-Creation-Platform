import { useUserProfileContext } from '@/contexts/UserProfileContext';

export interface UserProfile {
    name: string;
    email: string;
    avatarUrl: string;
    plan: "Free" | "Pro" | "Enterprise";
    credits: number;
    status: "Active" | "Inactive";
}

export function useUserProfile(): UserProfile | null {
    const { userProfile } = useUserProfileContext();
    return userProfile;
}

// Hook for updating credits in real-time
export function useUpdateCredits() {
    const { updateCredits } = useUserProfileContext();
    return { updateCredits };
}