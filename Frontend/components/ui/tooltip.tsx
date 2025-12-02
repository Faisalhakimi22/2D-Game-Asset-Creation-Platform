"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface TooltipProps {
    children: React.ReactNode;
    content: string;
    side?: "top" | "right" | "bottom" | "left";
    className?: string;
}

export function Tooltip({ children, content, side = "right", className }: TooltipProps) {
    const [isVisible, setIsVisible] = React.useState(false);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const triggerRef = React.useRef<HTMLDivElement>(null);

    const updatePosition = React.useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        
        let top = 0;
        let left = 0;
        
        switch (side) {
            case "right":
                top = rect.top + rect.height / 2;
                left = rect.right + 8;
                break;
            case "left":
                top = rect.top + rect.height / 2;
                left = rect.left - 8;
                break;
            case "top":
                top = rect.top - 8;
                left = rect.left + rect.width / 2;
                break;
            case "bottom":
                top = rect.bottom + 8;
                left = rect.left + rect.width / 2;
                break;
        }
        
        setPosition({ top, left });
    }, [side]);

    const handleMouseEnter = () => {
        updatePosition();
        setIsVisible(true);
    };

    const transformClasses = {
        top: "-translate-x-1/2 -translate-y-full",
        right: "-translate-y-1/2",
        bottom: "-translate-x-1/2",
        left: "-translate-x-full -translate-y-1/2",
    };

    return (
        <div 
            ref={triggerRef}
            className="relative inline-flex"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && typeof window !== "undefined" && createPortal(
                <div
                    style={{ top: position.top, left: position.left }}
                    className={cn(
                        "fixed z-[9999] px-2.5 py-1.5 text-xs font-medium text-white bg-[#1a1a24] border border-white/10 rounded-md shadow-lg whitespace-nowrap pointer-events-none",
                        transformClasses[side],
                        className
                    )}
                >
                    {content}
                </div>,
                document.body
            )}
        </div>
    );
}
