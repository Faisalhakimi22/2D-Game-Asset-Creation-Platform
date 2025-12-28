"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Image, Film, RefreshCw, Layers, Coins } from "lucide-react";
import { Logo } from "./Logo";
import { Avatar } from "./Avatar";
import { ProfileModal } from "./profile-modal";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Tooltip } from "./ui/tooltip";

const menuItems = [
    { href: "/sprites", icon: Image, label: "Sprites", tooltip: "Generate pixel art sprites with AI" },
    { href: "/scenes", icon: Film, label: "Scenes", tooltip: "Create animated scenes and backgrounds" },
    { href: "/animations", icon: RefreshCw, label: "Animate", tooltip: "AI-generated animation sprite sheets" },
    { href: "/projects", icon: Layers, label: "Projects", tooltip: "Manage your saved projects" },
];

export function AppSidebar() {
    const pathname = usePathname();
    const userProfile = useUserProfile();

    return (
        <div className="w-[72px] min-w-[72px] bg-[#050506] border-r border-white/5 flex flex-col py-4 overflow-y-auto scrollbar-none">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6 px-2">
                <Logo size="xl" showText={false} linkTo="/home" minimal />
            </div>

            {/* Main Menu */}
            <div className="flex-1 flex flex-col items-center gap-2 px-2">
                {menuItems.map(({ href, icon: Icon, label, tooltip }) => {
                    const isActive = pathname === href || pathname?.startsWith(href + "/");
                    return (
                        <Tooltip key={href} content={tooltip} side="right">
                            <Link
                                href={href}
                                className={`w-full flex flex-col items-center gap-1.5 py-3 px-1 transition-all ${
                                    isActive ? "text-primary" : "text-text-muted hover:text-text"
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium">{label}</span>
                            </Link>
                        </Tooltip>
                    );
                })}
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col items-center gap-4 px-2 pt-4 border-t border-white/5 mt-4">
                {/* Credits */}
                <Tooltip content="Your available credits for AI generation" side="right">
                    <div className="flex items-center gap-1.5 cursor-default">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-100">{userProfile?.credits ?? 0}</span>
                    </div>
                </Tooltip>
                
                {/* Profile Button */}
                <Tooltip content="View your profile and settings" side="right">
                    <ProfileModal>
                        <button type="button" className="group relative">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-primary/50 transition-all">
                                <Avatar 
                                    src={userProfile?.avatarUrl}
                                    alt={userProfile?.name || "User"}
                                    size="md"
                                    fallbackSeed={userProfile?.name || "User"}
                                    className="w-full h-full"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-primary border-2 border-[#050506]" />
                        </button>
                    </ProfileModal>
                </Tooltip>
            </div>
        </div>
    );
}
