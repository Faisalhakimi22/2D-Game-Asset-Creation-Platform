"use client";

import { useState } from "react";
import {
    CreditCard,
    LogOut,
    User,
    Zap,
    Settings,
    Mail,
    CheckCircle2,
    Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { CreditsPurchaseModal } from "./CreditsPurchaseModal";
import { Avatar } from "./Avatar";
import Image from "next/image";

export function ProfileModal({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const userProfile = useUserProfile();
    const router = useRouter();

    // Don't render if user profile is not loaded yet
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

    const handleBuyCredits = () => {
        // TODO: Implement buy credits flow
        console.log("Opening credits purchase flow...");
    };

    const handleManageSubscription = () => {
        // TODO: Implement subscription management
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
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden gap-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>User Profile</DialogTitle>
                </DialogHeader>
                <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 w-full relative">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                </div>

                <div className="px-6 pb-6 -mt-12 relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-xl bg-background p-1 shadow-lg mb-4 overflow-hidden flex-shrink-0">
                            <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary to-secondary p-[1px] overflow-hidden flex-shrink-0">
                                <div className="w-full h-full overflow-hidden rounded-[7px] bg-black">
                                    <Avatar 
                                        src={userProfile.avatarUrl}
                                        alt={userProfile.name}
                                        size="lg"
                                        fallbackSeed={userProfile.name}
                                        className="rounded-[7px] border-0 bg-transparent w-full h-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-text">{userProfile.name}</h2>
                        <div className="flex items-center gap-1.5 text-sm text-text-muted mt-1">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{userProfile.email}</span>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        {/* Credits Section */}
                        <Card className="bg-surface-highlight/50 border-primary/10">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-medium text-text-muted">Available Credits</div>
                                        <div className="text-2xl font-bold text-text">{userProfile.credits}</div>
                                    </div>
                                </div>
                                <CreditsPurchaseModal>
                                    <Button size="sm">
                                        Buy More
                                    </Button>
                                </CreditsPurchaseModal>
                            </CardContent>
                        </Card>

                        {/* Subscription Section */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Subscription</h3>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium text-sm">{userProfile.plan} Plan</div>
                                        <div className="text-xs text-green-500 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            {userProfile.status}
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={handleManageSubscription}>
                                    Manage
                                </Button>
                            </div>
                        </div>

                        {/* Account Actions */}
                        <div className="space-y-1 pt-2">
                            {isChangePasswordOpen ? (
                                <div className="p-4 rounded-lg border border-border bg-background/50 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <Input id="current-password" type="password" placeholder="••••••••" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input id="new-password" type="password" placeholder="••••••••" />
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setIsChangePasswordOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => {
                                                console.log("Password updated");
                                                setIsChangePasswordOpen(false);
                                            }}
                                        >
                                            Update Password
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-text-muted hover:text-text"
                                    onClick={() => setIsChangePasswordOpen(true)}
                                >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Change Password
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Log Out
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
