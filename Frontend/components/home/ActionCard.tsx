"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface ActionCardProps {
    title: string;
    description: string;
    iconSrc: string;
    href: string;
    image: string;
    delay?: number;
    badge?: string;
    badgeColor?: "primary" | "cyan" | "pink" | "orange";
}

const badgeColors = {
    primary: "bg-primary text-slate-900",
    cyan: "bg-accent-cyan text-slate-900",
    pink: "bg-accent-pink text-slate-900",
    orange: "bg-accent-orange text-slate-900",
};

export function ActionCard({ 
    title, 
    description, 
    iconSrc, 
    href, 
    image, 
    delay = 0,
    badge,
    badgeColor = "primary"
}: ActionCardProps) {
    return (
        <Link
            href={href}
            className="pixel-card game-card-glow rounded-2xl p-1 cursor-pointer group flex flex-col h-[400px] relative overflow-hidden block"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Badge */}
            {badge && (
                <div className="absolute top-3 right-3 z-20">
                    <span className={cn(
                        "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider",
                        badgeColors[badgeColor]
                    )}>
                        {badge}
                    </span>
                </div>
            )}

            {/* Image Container */}
            <div className="flex-1 w-full flex items-center justify-center relative z-10 p-4">
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 flex items-center justify-center border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 pixel-grid opacity-30"></div>
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            </div>

            {/* Content Below Image */}
            <div className="p-5 relative">
                <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                
                <div className="flex items-center gap-3 mb-3 pt-2">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 group-hover:bg-primary group-hover:border-primary transition-all">
                        <div className="relative w-5 h-5">
                            {/* Default state */}
                            <Image
                                src={iconSrc}
                                alt={title}
                                width={20}
                                height={20}
                                className="absolute inset-0 transition-all duration-150 opacity-100 group-hover:opacity-0"
                                style={{
                                    filter: 'invert(84%) sepia(35%) saturate(1000%) hue-rotate(95deg) brightness(103%) contrast(96%)'
                                }}
                            />
                            {/* Hover state */}
                            <Image
                                src={iconSrc}
                                alt={title}
                                width={20}
                                height={20}
                                className="absolute inset-0 transition-all duration-150 opacity-0 group-hover:opacity-100 brightness-0"
                            />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                            {title}
                        </h3>
                        <p className="text-xs text-slate-500">AI-Powered</p>
                    </div>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                    {description}
                </p>

                {/* Hover Arrow */}
                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-5 h-5 text-primary" />
                </div>
            </div>
        </Link>
    );
}
