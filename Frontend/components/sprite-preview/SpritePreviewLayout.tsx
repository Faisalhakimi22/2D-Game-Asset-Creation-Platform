import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProfileModal } from "@/components/profile-modal";
import { UserProfileButton } from "@/components/UserProfileButton";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { Logo } from "@/components/Logo";

interface SpritePreviewLayoutProps {
    children: ReactNode;
    title: string;
    projectId: string;
    backLink?: string;
    actions?: ReactNode;
}

export function SpritePreviewLayout({ children, title, projectId, backLink = "/projects", actions }: SpritePreviewLayoutProps) {
    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            {/* Header */}
            <header className="border-b border-primary/15 bg-surface/50 backdrop-blur-md px-6 py-3 z-50 h-[65px] flex-none">
                <div className="flex items-center justify-between gap-6 h-full">
                    {/* Left Section */}
                    <div className="flex items-center gap-4 flex-1">
                        <Link href={backLink}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>

                        <div className="h-5 w-[1px] bg-primary/20" />

                        <Logo size="sm" linkTo={null} />

                        <div className="h-5 w-[1px] bg-primary/20" />

                        <div className="flex flex-col gap-0.5">
                            <h1 className="text-sm font-semibold text-text">{title}</h1>
                            <p className="text-xs text-text-muted">Project #{projectId}</p>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {actions && (
                            <>
                                {actions}
                                <div className="h-5 w-[1px] bg-primary/20" />
                            </>
                        )}

                        <CreditsDisplay className="hidden sm:flex" />
                        <UserProfileButton className="hidden md:flex" />
                        <UserProfileButton compact className="md:hidden" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full flex flex-col overflow-hidden">
                {children}
            </main>
        </div>
    );
}
