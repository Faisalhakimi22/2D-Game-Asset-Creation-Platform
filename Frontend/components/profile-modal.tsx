"use client";

import { useState } from "react";
import {
    LogOut,
    Zap,
    Mail,
    CheckCircle2,
    Lock,
    Crown,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useUserProfile } from "@/hooks/useUserProfile";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { CreditsPurchaseModal } from "./CreditsPurchaseModal";
import { Avatar } from "./Avatar";

export function ProfileModal({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const userProfile = useUserProfile();
    const router = useRouter();

    if (!userProfile) {
        return null;
    }

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setIsOpen(false);
            router.push('/login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleManageSubscription = () => {
        console.log("Opening subscription management...");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setIsChangePasswordOpen(false);
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden gap-0 bg-[#08080a] border border-white/10 rounded-2xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>User Profile</DialogTitle>
                </DialogHeader>
                
                {/* Header with gradient background */}
                <div className="h-28 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
                    <div className="absolute inset-0 pixel-grid opacity-20" />
                    
                    {/* Corner pixels */}
                    <div className="absolute top-3 left-3 w-2 h-2 bg-primary/60"></div>
                    <div className="absolute top-3 right-3 w-2 h-2 bg-accent-cyan/60"></div>
                    <div className="absolute bottom-3 left-3 w-2 h-2 bg-accent-pink/60"></div>
                    <div className="absolute bottom-3 right-3 w-2 h-2 bg-accent-orange/60"></div>
                </div>

                <div className="px-6 pb-6 -mt-14 relative z-10">
                    {/* Avatar */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-xl bg-[#0a0a0c] p-1 border border-white/10 mb-3 overflow-hidden">
                            <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 p-[2px] overflow-hidden">
                                <div className="w-full h-full overflow-hidden rounded-[6px] bg-[#08080a]">
                                    <Avatar 
                                        src={userProfile.avatarUrl}
                                        alt={userProfile.name}
                                        size="lg"
                                        fallbackSeed={userProfile.name}
                                        className="rounded-[6px] border-0 bg-transparent w-full h-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <h2 className="text-lg font-bold text-white">{userProfile.name}</h2>
                        <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                            <Mail className="w-3 h-3" />
                            <span>{userProfile.email}</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        {/* Credits Section */}
                        <div className="rounded-xl bg-[#0a0a0c] border border-white/5 p-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent" />
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-medium text-text-dim uppercase tracking-wider">Credits</div>
                                        <div className="text-xl font-bold text-amber-100">{userProfile.credits}</div>
                                    </div>
                                </div>
                                <CreditsPurchaseModal>
                                    <button className="px-3 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/30 transition-all flex items-center gap-1.5">
                                        <Sparkles className="w-3 h-3" />
                                        Buy More
                                    </button>
                                </CreditsPurchaseModal>
                            </div>
                        </div>

                        {/* Subscription Section */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-3 rounded-full bg-gradient-to-b from-primary to-primary/30" />
                                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Subscription</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0c] border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <Crown className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-sm text-white">{userProfile.plan} Plan</div>
                                        <div className="text-[10px] text-green-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                            {userProfile.status}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleManageSubscription}
                                    className="text-[10px] text-text-muted hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                                >
                                    Manage
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        {/* Account Actions */}
                        <div className="space-y-1">
                            {isChangePasswordOpen ? (
                                <div className="p-4 rounded-xl bg-[#0a0a0c] border border-white/5 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password" className="text-xs text-text-muted">Current Password</Label>
                                        <Input 
                                            id="current-password" 
                                            type="password" 
                                            placeholder="••••••••" 
                                            className="h-9 bg-[#08080a] border-white/10 text-sm focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password" className="text-xs text-text-muted">New Password</Label>
                                        <Input 
                                            id="new-password" 
                                            type="password" 
                                            placeholder="••••••••" 
                                            className="h-9 bg-[#08080a] border-white/10 text-sm focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={() => setIsChangePasswordOpen(false)}
                                            className="flex-1 h-9 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-text-muted hover:text-white hover:bg-white/10 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                console.log("Password updated");
                                                setIsChangePasswordOpen(false);
                                            }}
                                            className="flex-1 h-9 rounded-lg bg-primary/20 border border-primary/30 text-xs font-medium text-primary hover:bg-primary/30 transition-all"
                                        >
                                            Update
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsChangePasswordOpen(true)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-all text-sm"
                                >
                                    <Lock className="w-4 h-4" />
                                    Change Password
                                </button>
                            )}

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
