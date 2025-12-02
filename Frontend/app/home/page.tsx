"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Sparkles, Image as ImageIcon, Film, Layers, Home, FolderOpen, Gamepad2, Trophy, Clock, ChevronDown, User } from "lucide-react";
import { Logo } from "@/components/Logo";
import { BYOKButton } from "@/components/home/BYOKButton";
import { ProfileModal } from "@/components/profile-modal";
import { useUserProfile } from "@/hooks/useUserProfile";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { AuthGuard } from "@/components/AuthGuard";
import { Avatar } from "@/components/Avatar";

function UserProfileDock() {
    const userProfile = useUserProfile();

    if (!userProfile) {
        return (
            <div className="dock-item h-11 pl-2 pr-5 rounded-full flex items-center gap-3 text-text-muted text-sm ml-1">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 animate-pulse"></div>
                <div className="flex flex-col items-start leading-tight">
                    <div className="w-16 h-3 bg-white/10 rounded animate-pulse"></div>
                    <div className="w-12 h-2 bg-white/10 rounded animate-pulse mt-1"></div>
                </div>
            </div>
        );
    }

    return (
        <ProfileModal>
            <button className="dock-item h-11 pl-2 pr-5 rounded-full flex items-center gap-3 text-text-muted text-sm ml-1 hover:text-white">
                <div className="relative">
                    <Avatar 
                        src={userProfile.avatarUrl}
                        alt="Profile"
                        size="md"
                        fallbackSeed={userProfile.name}
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-[#0b1324] rounded-full"></div>
                </div>
                <div className="flex flex-col items-start leading-tight">
                    <span className="text-xs font-bold text-white">{userProfile.name}</span>
                    <span className="text-[10px] text-primary">{userProfile.plan} Plan</span>
                </div>
            </button>
        </ProfileModal>
    );
}

// Mock session data
const recentSessions = {
    today: [
        { id: "8842", title: "Cyberpunk Character Set", type: "sprite", time: "2 hours ago", author: "You", images: ["/9a6417c2-8fdb-4d86-ba15-f3df35f58490_removalai_preview.png", "/73e95d25-727c-45b3-bbb5-1187ce8ad231_removalai_preview.png", "/702f4fc5-6f33-4b77-aadc-09c393e7442d_removalai_preview.png"] },
        { id: "9120", title: "Hero Idle Animation", type: "sprite", time: "5 hours ago", author: "You", images: ["/73e95d25-727c-45b3-bbb5-1187ce8ad231_removalai_preview.png", "/9a6417c2-8fdb-4d86-ba15-f3df35f58490_removalai_preview.png"] },
    ],
    yesterday: [
        { id: "7731", title: "Forest Environment Pack", type: "scene", time: "Yesterday", author: "You", images: ["/702f4fc5-6f33-4b77-aadc-09c393e7442d_removalai_preview.png"] },
    ],
    thisWeek: [
        { id: "6654", title: "Dungeon Tileset", type: "sprite", time: "3 days ago", author: "You", images: ["/9a6417c2-8fdb-4d86-ba15-f3df35f58490_removalai_preview.png", "/73e95d25-727c-45b3-bbb5-1187ce8ad231_removalai_preview.png", "/702f4fc5-6f33-4b77-aadc-09c393e7442d_removalai_preview.png", "/9a6417c2-8fdb-4d86-ba15-f3df35f58490_removalai_preview.png"] },
        { id: "5521", title: "NPC Merchant Sprites", type: "sprite", time: "5 days ago", author: "You", images: [] },
    ],
};

function RecentSessionsSection() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeFilter, setActiveFilter] = useState<"my" | "all" | "archived">("my");

    const SessionCard = ({ session }: { session: typeof recentSessions.today[0] }) => (
        <Link href={`/projects/${session.id}`} className="group block">
            <div className="relative rounded-2xl overflow-hidden bg-[#08080a] border border-white/5 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
                {/* Image Preview */}
                <div className="aspect-[4/3] relative">
                    {session.images.length > 0 ? (
                        <div className={`grid ${session.images.length === 1 ? 'grid-cols-1' : session.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'} gap-0.5 h-full`}>
                            {session.images.slice(0, 4).map((img, i) => (
                                <div key={i} className="relative bg-[#0a0a0c] overflow-hidden">
                                    <Image src={img} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full h-full bg-[#08080a] flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-white/10" />
                        </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-transparent opacity-60" />
                    
                    {/* Type badge */}
                    <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm ${
                            session.type === "sprite" 
                                ? "bg-primary/20 text-primary border border-primary/20" 
                                : "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/20"
                        }`}>
                            {session.type}
                        </span>
                    </div>
                </div>
                
                {/* Info */}
                <div className="p-4">
                    <h4 className="font-medium text-white group-hover:text-primary transition-colors truncate">{session.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-xs text-text-muted">{session.author}</span>
                        <span className="text-text-dim">•</span>
                        <span className="text-xs text-text-dim">{session.time}</span>
                    </div>
                </div>
            </div>
        </Link>
    );

    return (
        <div className="mb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-white">Recent Sessions</h2>
                    <span className="text-xs text-text-dim bg-white/5 px-2 py-0.5 rounded-full">{recentSessions.today.length + recentSessions.yesterday.length + recentSessions.thisWeek.length} total</span>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search sessions..."
                            className="w-52 h-9 pl-10 pr-4 text-sm bg-[#08080a] border border-white/10 rounded-xl text-white placeholder:text-text-dim focus:border-primary/50 focus:outline-none transition-all"
                        />
                    </div>
                    
                    {/* Filter Pills */}
                    <div className="flex gap-1 p-1 bg-[#08080a] border border-white/5 rounded-xl">
                        {[
                            { key: "my", label: "My Sessions" },
                            { key: "all", label: "Workspace" },
                            { key: "archived", label: "Archived" },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setActiveFilter(key as "my" | "all" | "archived")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    activeFilter === key
                                        ? "bg-primary text-white"
                                        : "text-text-muted hover:text-white"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Today's Sessions - Always visible */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-medium text-white">Today</span>
                    <div className="flex-1 h-px bg-white/5" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {recentSessions.today.map((session) => (
                        <SessionCard key={session.id} session={session} />
                    ))}
                </div>
            </div>

            {/* Expandable Section */}
            {isExpanded && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    {/* Yesterday */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm font-medium text-text-muted">Yesterday</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {recentSessions.yesterday.map((session) => (
                                <SessionCard key={session.id} session={session} />
                            ))}
                        </div>
                    </div>

                    {/* This Week */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm font-medium text-text-muted">This Week</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {recentSessions.thisWeek.map((session) => (
                                <SessionCard key={session.id} session={session} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Expand/Collapse Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-6 w-full py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all flex items-center justify-center gap-2 group"
            >
                <span className="text-sm text-text-muted group-hover:text-white transition-colors">
                    {isExpanded ? "Show less" : `Show ${recentSessions.yesterday.length + recentSessions.thisWeek.length} more sessions`}
                </span>
                <ChevronDown className={`w-4 h-4 text-text-muted group-hover:text-white transition-all ${isExpanded ? "rotate-180" : ""}`} />
            </button>
        </div>
    );
}

export default function HomePage() {
    return (
        <AuthGuard>
            <div className="min-h-screen w-full flex flex-col relative overflow-hidden">
            {/* Background Animation Layer */}
            <div className="bg-animation">
                <div className="grid-overlay"></div>
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>

            {/* Top Bar */}
            <header className="w-full h-20 px-8 flex items-center justify-between z-40 flex-shrink-0 relative">
                {/* Brand/Logo */}
                <Logo size="md" />

                {/* Right Utilities */}
                <div className="flex items-center gap-4">
                    <BYOKButton />
                    <CreditsDisplay />
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-1 overflow-y-auto app-scroll pb-36 px-4 md:px-12 relative z-10 custom-scrollbar">
                <div className="max-w-7xl mx-auto pt-4">

                    {/* Hero Banner */}
                    <div className="hero-banner p-8 md:p-10 mb-10 relative overflow-hidden">
                        {/* Background Image - Cover entire container */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: "url('/new.jpg')" }}
                        />
                        {/* Dark overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
                        
                        {/* Decorative Corner Pixels */}
                        <div className="absolute top-4 left-4 w-3 h-3 bg-primary/60 z-10"></div>
                        <div className="absolute top-4 right-4 w-3 h-3 bg-accent-cyan/60 z-10"></div>
                        <div className="absolute bottom-4 left-4 w-3 h-3 bg-accent-pink/60 z-10"></div>
                        <div className="absolute bottom-4 right-4 w-3 h-3 bg-accent-orange/60 z-10"></div>
                        
                        <div className="relative z-10">
                            <div className="space-y-4 max-w-2xl">
                                <div className="retro-badge inline-block mb-2">
                                    <span className="flex items-center gap-1">
                                        <Gamepad2 className="w-3 h-3" />
                                        Game Dev Tools
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                                    Create <span className="text-primary glow-text">Pixel Perfect</span>
                                    <br />Game Assets
                                </h1>
                                <p className="text-text-muted text-base md:text-lg max-w-lg">
                                    AI-powered tools to generate sprites, scenes, and animations for your 2D games. Level up your game dev workflow!
                                </p>
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="flex items-center gap-2 text-sm text-text-muted">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                        <span>Instant Generation</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-text-muted">
                                        <Trophy className="w-4 h-4 text-accent-orange" />
                                        <span>Pro Quality</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Title */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent-cyan rounded-full"></div>
                        <h2 className="text-lg font-bold text-white">What would you like to create today?</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent"></div>
                    </div>

                    {/* Main Tools Grid (3 Cards) - Pixel Style */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">

                        {/* Card 1: Sprite Generator */}
                        <Link href="/sprites" className="pixel-card game-card-glow rounded-xl p-1 cursor-pointer group flex flex-col h-[320px] relative overflow-hidden block">
                            <div className="absolute top-2 right-2 z-20">
                                <span className="retro-badge text-[9px] px-2 py-0.5">Popular</span>
                            </div>
                            
                            <div className="flex-1 w-full flex items-center justify-center relative z-10 p-3">
                                <div className="w-full h-full bg-gradient-to-br from-[#0a0a0c] to-[#08080a] rounded-lg p-3 flex items-center justify-center border border-white/5 relative overflow-hidden">
                                    <div className="absolute inset-0 pixel-grid opacity-30"></div>
                                    <Image
                                        src="/9a6417c2-8fdb-4d86-ba15-f3df35f58490_removalai_preview.png"
                                        alt="Sprite Generator"
                                        width={200}
                                        height={200}
                                        className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            </div>
                            
                            <div className="p-4 relative">
                                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-primary/50 transition-all"></div>
                                <div className="flex items-center gap-2.5 mb-2 pt-1">
                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/50 transition-all">
                                        <Sparkles className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">Sprite Generator</h3>
                                        <p className="text-[10px] text-text-dim">AI-Powered</p>
                                    </div>
                                </div>
                                <p className="text-text-muted text-xs line-clamp-2">Create unique pixel art characters and objects with AI.</p>
                            </div>
                        </Link>

                        {/* Card 2: Scene Builder */}
                        <Link href="/scenes" className="pixel-card game-card-glow rounded-xl p-1 cursor-pointer group flex flex-col h-[320px] relative overflow-hidden block">
                            <div className="absolute top-2 right-2 z-20">
                                <span className="bg-accent-cyan/90 text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                            </div>
                            
                            <div className="flex-1 w-full flex items-center justify-center relative z-10 p-3">
                                <div className="w-full h-full bg-gradient-to-br from-[#0a0a0c] to-[#08080a] rounded-lg p-3 flex items-center justify-center border border-white/5 relative overflow-hidden">
                                    <div className="absolute inset-0 pixel-grid opacity-30"></div>
                                    <Image
                                        src="/73e95d25-727c-45b3-bbb5-1187ce8ad231_removalai_preview.png"
                                        alt="Scene Builder"
                                        width={200}
                                        height={200}
                                        className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            </div>
                            
                            <div className="p-4 relative">
                                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-primary/50 transition-all"></div>
                                <div className="flex items-center gap-2.5 mb-2 pt-1">
                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/50 transition-all">
                                        <ImageIcon className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">Scene Builder</h3>
                                        <p className="text-[10px] text-text-dim">Backgrounds & Environments</p>
                                    </div>
                                </div>
                                <p className="text-text-muted text-xs line-clamp-2">Design immersive game backgrounds and environments.</p>
                            </div>
                        </Link>

                        {/* Card 3: Sheet to GIF */}
                        <Link href="/tools/gif-converter" className="pixel-card game-card-glow rounded-xl p-1 cursor-pointer group flex flex-col h-[320px] relative overflow-hidden block">
                            <div className="flex-1 w-full flex items-center justify-center relative z-10 p-3">
                                <div className="w-full h-full bg-gradient-to-br from-[#0a0a0c] to-[#08080a] rounded-lg p-3 flex items-center justify-center border border-white/5 relative overflow-hidden">
                                    <div className="absolute inset-0 pixel-grid opacity-30"></div>
                                    <Image
                                        src="/702f4fc5-6f33-4b77-aadc-09c393e7442d_removalai_preview.png"
                                        alt="Sheet to GIF"
                                        width={200}
                                        height={200}
                                        className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            </div>
                            
                            <div className="p-4 relative">
                                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-primary/50 transition-all"></div>
                                <div className="flex items-center gap-2.5 mb-2 pt-1">
                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/50 transition-all">
                                        <Film className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">Sheet to GIF</h3>
                                        <p className="text-[10px] text-text-dim">Animation Tool</p>
                                    </div>
                                </div>
                                <p className="text-text-muted text-xs line-clamp-2">Convert sprite sheets into smooth animated GIFs.</p>
                            </div>
                        </Link>

                    </div>

                    {/* Templates Section */}
                    <div className="mb-24">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1 h-8 bg-gradient-to-b from-text-muted to-text-dim rounded-full"></div>
                            <div className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-text-muted" />
                                <h2 className="text-xl font-bold text-white">Quick Start Templates</h2>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                            <button className="text-sm text-text-muted hover:text-white transition-colors flex items-center gap-1">
                                View All
                                <span className="text-lg">→</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Template 1 */}
                            <div className="rounded-xl h-52 relative overflow-hidden group cursor-pointer bg-[#08080a] border border-white/5 hover:border-primary/30 transition-all">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent"></div>
                                <div className="absolute inset-0 pixel-grid opacity-20"></div>
                                
                                {/* Decorative pixel corners */}
                                <div className="absolute top-2 left-2 w-2 h-2 bg-primary/40"></div>
                                <div className="absolute top-2 right-2 w-2 h-2 bg-white/20"></div>
                                
                                <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                                    <div className="text-6xl">🤖</div>
                                </div>
                                
                                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#050506] to-transparent">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                        <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Character</span>
                                    </div>
                                    <h4 className="font-bold text-white group-hover:text-primary transition-colors">Cyberpunk Hero</h4>
                                </div>
                            </div>
                            
                            {/* Template 2 */}
                            <div className="rounded-xl h-52 relative overflow-hidden group cursor-pointer bg-[#08080a] border border-white/5 hover:border-primary/30 transition-all">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent"></div>
                                <div className="absolute inset-0 pixel-grid opacity-20"></div>
                                
                                <div className="absolute top-2 left-2 w-2 h-2 bg-primary/40"></div>
                                <div className="absolute top-2 right-2 w-2 h-2 bg-white/20"></div>
                                
                                <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                                    <div className="text-6xl">🏰</div>
                                </div>
                                
                                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#050506] to-transparent">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                        <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Environment</span>
                                    </div>
                                    <h4 className="font-bold text-white group-hover:text-primary transition-colors">Fantasy Kingdom</h4>
                                </div>
                            </div>
                            
                            {/* Template 3 */}
                            <div className="rounded-xl h-52 relative overflow-hidden group cursor-pointer bg-[#08080a] border border-white/5 hover:border-primary/30 transition-all">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent"></div>
                                <div className="absolute inset-0 pixel-grid opacity-20"></div>
                                
                                <div className="absolute top-2 left-2 w-2 h-2 bg-primary/40"></div>
                                <div className="absolute top-2 right-2 w-2 h-2 bg-white/20"></div>
                                
                                <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                                    <div className="text-6xl">🚀</div>
                                </div>
                                
                                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#050506] to-transparent">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                        <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Sci-Fi</span>
                                    </div>
                                    <h4 className="font-bold text-white group-hover:text-primary transition-colors">Space Station</h4>
                                </div>
                            </div>
                            
                            {/* Template 4 */}
                            <div className="rounded-xl h-52 relative overflow-hidden group cursor-pointer bg-[#08080a] border border-white/5 hover:border-primary/30 transition-all">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent"></div>
                                <div className="absolute inset-0 pixel-grid opacity-20"></div>
                                
                                <div className="absolute top-2 left-2 w-2 h-2 bg-primary/40"></div>
                                <div className="absolute top-2 right-2 w-2 h-2 bg-white/20"></div>
                                
                                <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                                    <div className="text-6xl">👹</div>
                                </div>
                                
                                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#050506] to-transparent">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                        <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Boss</span>
                                    </div>
                                    <h4 className="font-bold text-white group-hover:text-primary transition-colors">Dungeon Lord</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Sessions Section */}
                    <RecentSessionsSection />

                </div>
            </main>

            {/* App Dock - Enhanced */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-auto max-w-[90vw]">
                <nav className="glass-dock px-2 py-2 rounded-full flex items-center gap-1.5 md:gap-2 border border-primary/10">

                    <Link
                        href="/home"
                        className="dock-item active h-11 px-6 rounded-full flex items-center gap-2 text-sm"
                    >
                        <Home className="w-4 h-4" />
                        <span>Home</span>
                    </Link>

                    <Link
                        href="/projects"
                        className="dock-item h-11 px-6 rounded-full flex items-center gap-2 text-text-muted text-sm hover:text-white"
                    >
                        <FolderOpen className="w-4 h-4" />
                        <span className="hidden md:inline">Projects</span>
                    </Link>

                    {/* Divider */}
                    <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

                    {/* User Profile (In Dock) */}
                    <UserProfileDock />

                </nav>
            </div>
        </div>
        </AuthGuard>
    );
}
