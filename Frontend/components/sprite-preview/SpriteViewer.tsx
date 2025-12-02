import { useState } from "react";
import { Play, Pause, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface SpriteViewerProps {
    imageUrl: string;
    isPlaying: boolean;
    onTogglePlay: () => void;
    className?: string;
}

export function SpriteViewer({ imageUrl, isPlaying, onTogglePlay, className = "" }: SpriteViewerProps) {
    return (
        <div className={`relative w-full h-full bg-surface-highlight rounded-xl border border-primary/15 overflow-hidden group ${className}`}>
            <div className="absolute inset-0 grid-pattern opacity-50" />

            <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* Pixel art scaling */}
                    <img
                        src={imageUrl}
                        alt="Sprite Preview"
                        className="max-w-full max-h-full object-contain image-pixelated"
                        style={{ imageRendering: "pixelated" }}
                    />
                </div>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                    onClick={onTogglePlay}
                >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <div className="w-[1px] h-4 bg-white/20" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                >
                    <Maximize2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
