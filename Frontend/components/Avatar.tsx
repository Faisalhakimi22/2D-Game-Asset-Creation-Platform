"use client";

import { useState } from "react";
import { User } from "lucide-react";

interface AvatarProps {
    src?: string | null;
    alt?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
    fallbackSeed?: string;
    avatarStyle?: "avataaars" | "personas" | "initials" | "bottts";
}

const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-24 h-24"
};

export function Avatar({ 
    src, 
    alt = "User", 
    size = "md", 
    className = "",
    fallbackSeed = "default",
    avatarStyle = "avataaars"
}: AvatarProps) {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(!!src);

    const getFallbackUrl = () => {
        const seed = encodeURIComponent(fallbackSeed || 'default');
        switch (avatarStyle) {
            case "initials":
                // Create initials from the seed
                const initials = fallbackSeed?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
                return `https://ui-avatars.com/api/?name=${initials}&background=334155&color=fff&size=128`;
            case "personas":
                return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}`;
            case "bottts":
                return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
            default:
                return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
        }
    };

    const fallbackUrl = getFallbackUrl();
    const imageUrl = imageError || !src ? fallbackUrl : src;

    const handleImageError = () => {
        console.log('Avatar image failed to load:', imageUrl);
        setImageError(true);
        setIsLoading(false);
    };

    const handleImageLoad = () => {
        console.log('Avatar image loaded successfully:', imageUrl);
        setIsLoading(false);
    };

    // Extract custom border radius from className, default to rounded-full
    const hasCustomRadius = className.includes('rounded-');
    const baseClasses = hasCustomRadius ? '' : 'rounded-full';
    const borderClasses = className.includes('border-0') ? '' : 'border border-slate-600';
    const bgClasses = className.includes('bg-') ? '' : 'bg-slate-800';

    return (
        <div className={`${sizeClasses[size]} ${baseClasses} ${bgClasses} ${borderClasses} overflow-hidden flex items-center justify-center relative ${className}`}>
            {isLoading && (
                <div className={`absolute inset-0 bg-slate-700 animate-pulse ${hasCustomRadius ? 'rounded-[inherit]' : 'rounded-full'} z-10`} />
            )}
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={alt}
                    className="w-full h-full object-cover flex-shrink-0 min-w-0 min-h-0"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
            ) : (
                <User className="w-1/2 h-1/2 text-slate-400 flex-shrink-0" />
            )}
        </div>
    );
}