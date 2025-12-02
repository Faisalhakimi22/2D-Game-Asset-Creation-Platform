"use client";

import { ProfileModal } from "@/components/profile-modal";
import { UserProfileButton } from "@/components/UserProfileButton";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { Logo } from "@/components/Logo";

interface HeaderProps {
    title?: string;
    subtitle?: string;
    children?: React.ReactNode;
}

export function Header({ title, subtitle, children }: HeaderProps) {
    return (
        <header className="border-b border-primary/15 bg-surface/50 backdrop-blur-md px-6 py-3 z-50 sticky top-0">
            <div className="flex items-center justify-between gap-6">
                {/* Left Section */}
                <div className="flex items-center gap-4 flex-1">
                    <Logo size="sm" />
                    {(title || subtitle) && (
                        <>
                            <div className="h-5 w-[1px] bg-primary/20" />
                            <div className="flex flex-col gap-0.5">
                                {title && <h2 className="text-sm font-semibold text-text">{title}</h2>}
                                {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
                            </div>
                        </>
                    )}
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {children}

                    <CreditsDisplay className="hidden sm:flex" />
                    <UserProfileButton className="hidden md:flex" />
                    <UserProfileButton compact className="md:hidden" />
                </div>
            </div>
        </header>
    );
}
