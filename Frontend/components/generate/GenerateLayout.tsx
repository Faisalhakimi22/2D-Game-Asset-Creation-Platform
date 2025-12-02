import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProfileModal } from "@/components/profile-modal";
import { UserProfileButton } from "@/components/UserProfileButton";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { Logo } from "@/components/Logo";

interface GenerateLayoutProps {
    children: ReactNode;
    projectId: string;
}

export function GenerateLayout({ children, projectId }: GenerateLayoutProps) {
    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            {/* Header */}
            <header className="border-b border-primary/15 bg-surface/50 backdrop-blur-md px-3 sm:px-6 py-3 z-50 h-[60px] sm:h-[65px] flex-none">
                <div className="flex items-center justify-between gap-2 sm:gap-6 h-full">
                    {/* Left Section */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                        <Link href={`/projects/${projectId}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>

                        <div className="hidden sm:block h-5 w-[1px] bg-primary/20 flex-shrink-0" />

                        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                            <Logo size="sm" linkTo={null} />
                        </div>

                        <div className="hidden sm:block h-5 w-[1px] bg-primary/20 flex-shrink-0" />

                        <div className="flex flex-col gap-0.5 min-w-0">
                            <h1 className="text-xs sm:text-sm font-semibold text-text truncate">Generate Animation</h1>
                            <p className="text-[10px] sm:text-xs text-text-muted truncate">Project #{projectId}</p>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <CreditsDisplay />
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
