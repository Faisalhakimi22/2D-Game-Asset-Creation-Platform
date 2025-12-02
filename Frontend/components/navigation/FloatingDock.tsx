"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen } from "lucide-react";
import { ProfileModal } from "@/components/profile-modal";

export function FloatingDock() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-auto max-w-[90vw]">
            <nav className="glass-dock px-2 py-2 rounded-full flex items-center gap-1.5 md:gap-2">

                <Link
                    href="/home"
                    className={`dock-item h-11 px-6 rounded-full flex items-center gap-2 text-sm ${pathname === "/home" ? "active" : "text-slate-400 hover:text-white"
                        }`}
                >
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                </Link>

                <Link
                    href="/projects"
                    className={`dock-item h-11 px-6 rounded-full flex items-center gap-2 text-sm ${pathname.startsWith("/projects") ? "active" : "text-slate-400 hover:text-white"
                        }`}
                >
                    <FolderOpen className="w-4 h-4" />
                    <span className="hidden md:inline">Projects</span>
                </Link>

                {/* Divider */}
                <div className="w-[1px] h-6 bg-slate-700 mx-1"></div>

                {/* User Profile (In Dock) */}
                <ProfileModal>
                    <button className="dock-item h-11 pl-2 pr-5 rounded-full flex items-center gap-3 text-slate-400 text-sm ml-1 hover:text-white">
                        <div className="relative">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Profile" className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600" />
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-[#0b1324] rounded-full"></div>
                        </div>
                        <div className="flex flex-col items-start leading-tight">
                            <span className="text-xs font-bold text-white">Alex Design</span>
                            <span className="text-[10px] text-primary">Pro Plan</span>
                        </div>
                    </button>
                </ProfileModal>

            </nav>
        </div>
    );
}
