"use client";

import Link from "next/link";

interface LogoProps {
    size?: "sm" | "md" | "lg" | "xl";
    showText?: boolean;
    linkTo?: string | null;
    className?: string;
    minimal?: boolean;
}

const sizeConfig = {
    sm: { icon: "w-8 h-8", svg: 20, text: "text-base", subtext: "text-[8px]" },
    md: { icon: "w-10 h-10", svg: 24, text: "text-lg", subtext: "text-[10px]" },
    lg: { icon: "w-14 h-14", svg: 32, text: "text-2xl", subtext: "text-xs" },
    xl: { icon: "w-[50px] h-[50px]", svg: 34, text: "text-3xl", subtext: "text-sm" },
};

export function Logo({ size = "md", showText = true, linkTo = "/home", className = "", minimal = false }: LogoProps) {
    const config = sizeConfig[size];

    const LogoContent = () => (
        <div className={`flex items-center gap-3 group logo-container cursor-pointer ${className}`}>
            {/* Custom Pixel Logo */}
            <div className={`${config.icon} ${minimal ? '' : 'bg-slate-800/50 rounded-lg border border-white/10 backdrop-blur-sm group-hover:border-primary/50'} flex items-center justify-center transition-colors`}>
                <svg width={config.svg} height={config.svg} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
                    {/* Stem */}
                    <path d="M6 4H10V20H6V4Z" className="fill-primary" />
                    {/* Top Bar */}
                    <path d="M10 4H18V8H10V4Z" className="fill-white" />
                    {/* Right Bar */}
                    <path d="M14 8H18V12H14V8Z" className="fill-primary/80" />
                    {/* Middle Bar */}
                    <path d="M10 12H18V16H10V12Z" className="fill-white" />
                </svg>
            </div>

            {showText && (
                <div className="flex flex-col">
                    <span className={`${config.text} font-bold text-white tracking-wide leading-none group-hover:text-primary transition-colors`}>Pixelar</span>
                    <span className={`${config.subtext} text-primary tracking-widest uppercase font-semibold mt-0.5`}>Studio</span>
                </div>
            )}
        </div>
    );

    if (linkTo) {
        return (
            <Link href={linkTo}>
                <LogoContent />
            </Link>
        );
    }

    return <LogoContent />;
}