"use client";

import { Zap, Plus } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { CreditsPurchaseModal } from "./CreditsPurchaseModal";

interface CreditsDisplayProps {
    className?: string;
}

export function CreditsDisplay({ className = "" }: CreditsDisplayProps) {
    const userProfile = useUserProfile();

    if (!userProfile) {
        return (
            <div className={`flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-lg border border-amber-500/20 shadow-lg backdrop-blur-sm ${className}`}>
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <div className="w-8 h-4 bg-slate-700 rounded animate-pulse"></div>
                <span className="text-xs text-slate-500 font-medium ml-1">Credits</span>
            </div>
        );
    }

    const isLowCredits = userProfile.credits < 20;

    return (
        <div className={`flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-lg border ${isLowCredits ? 'border-red-500/30' : 'border-amber-500/20'} shadow-lg backdrop-blur-sm ${className}`}>
            <Zap className={`w-3.5 h-3.5 ${isLowCredits ? 'text-red-400 fill-red-400' : 'text-amber-400 fill-amber-400'}`} />
            <span className={`text-sm font-bold ${isLowCredits ? 'text-red-100' : 'text-amber-100'}`}>
                {userProfile.credits}
            </span>
            <span className="text-xs text-slate-500 font-medium ml-1">Credits</span>
            {isLowCredits && (
                <CreditsPurchaseModal>
                    <button className="ml-1 p-1 hover:bg-slate-700 rounded transition-colors">
                        <Plus className="w-3 h-3 text-slate-400 hover:text-white" />
                    </button>
                </CreditsPurchaseModal>
            )}
        </div>
    );
}