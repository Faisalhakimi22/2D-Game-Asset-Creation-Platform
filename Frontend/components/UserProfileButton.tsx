"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import { ProfileModal } from "./profile-modal";
import { Avatar } from "./Avatar";

interface UserProfileButtonProps {
    compact?: boolean;
    className?: string;
}

export function UserProfileButton({ compact = false, className = "" }: UserProfileButtonProps) {
    const userProfile = useUserProfile();

    if (!userProfile) {
        // Loading state
        return (
            <div className={`flex items-center gap-2.5 px-3 py-1.5 bg-surface-highlight rounded-lg border border-primary/15 ${className}`}>
                {!compact && (
                    <div className="text-right">
                        <div className="w-16 h-3 bg-slate-700 rounded animate-pulse"></div>
                        <div className="w-12 h-2 bg-slate-700 rounded animate-pulse mt-1"></div>
                    </div>
                )}
                <div className="w-6 h-6 rounded-md bg-slate-700 animate-pulse"></div>
            </div>
        );
    }

    return (
        <ProfileModal>
            <button className={`flex items-center gap-2.5 px-3 py-1.5 bg-surface-highlight rounded-lg border border-primary/15 cursor-pointer hover:bg-surface-highlight/80 transition-colors ${className}`}>
                {!compact && (
                    <div className="text-right">
                        <div className="text-xs font-medium text-text">{userProfile.name}</div>
                        <div className="text-[10px] text-text-muted">{userProfile.plan} Plan</div>
                    </div>
                )}
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary p-[0.5px] overflow-hidden flex-shrink-0">
                    <div className="w-full h-full overflow-hidden rounded-[3px] bg-black">
                        <Avatar 
                            src={userProfile.avatarUrl}
                            alt="User"
                            size="sm"
                            fallbackSeed={userProfile.name}
                            className="rounded-[3px] border-0 bg-transparent w-full h-full"
                        />
                    </div>
                </div>
            </button>
        </ProfileModal>
    );
}