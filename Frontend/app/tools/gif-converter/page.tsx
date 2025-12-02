"use client";

import { useState, useRef } from "react";
import { Upload, ArrowLeft, Film, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SpriteSheetConverter } from "@/components/generate/SpriteSheetConverter";
import { AppSidebar } from "@/components/AppSidebar";

export default function GifConverterPage() {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setSelectedFile(url);
        }
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setSelectedFile(url);
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
    };

    return (
        <div className="h-screen flex bg-[#050506] text-text font-sans overflow-hidden">
            {/* Left Sidebar - Navigation */}
            <AppSidebar />

            <main className="flex-1 flex flex-col overflow-hidden relative">
                {!selectedFile ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#050506]">
                        {/* Background grid */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        
                        <div className="relative z-10 w-full max-w-lg space-y-8">
                            {/* Header */}
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                                    <Film className="w-3.5 h-3.5" />
                                    Animation Tool
                                </div>
                                <h1 className="text-3xl font-bold text-white">Sprite Sheet to GIF</h1>
                                <p className="text-text-muted text-sm max-w-sm mx-auto">
                                    Upload your sprite sheet and convert it into a smooth animated GIF
                                </p>
                            </div>

                            {/* Upload Card */}
                            <div
                                className="group relative rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/40 bg-white/[0.02] hover:bg-primary/5 transition-all cursor-pointer overflow-hidden"
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                            >
                                {/* Decorative corners */}
                                <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-primary/30 rounded-tl-lg" />
                                <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
                                <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-primary/30 rounded-bl-lg" />
                                <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-primary/30 rounded-br-lg" />
                                
                                <div className="flex flex-col items-center justify-center py-16 px-8 space-y-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Upload className="w-7 h-7 text-primary" />
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <p className="font-semibold text-white">Drop your sprite sheet here</p>
                                        <p className="text-xs text-text-muted">or click to browse • PNG, JPG up to 10MB</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-text-dim">
                                        <Sparkles className="w-3 h-3" />
                                        <span>Supports horizontal and vertical sprite sheets</span>
                                    </div>
                                </div>
                            </div>

                            {/* Back Link */}
                            <div className="flex justify-center">
                                <Link href="/home">
                                    <Button variant="ghost" size="sm" className="gap-2 text-text-muted hover:text-white hover:bg-white/[0.05]">
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Home
                                    </Button>
                                </Link>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 w-full h-full overflow-hidden bg-[#050506]">
                        <SpriteSheetConverter
                            spriteSheetUrl={selectedFile}
                            onSave={(gifUrl) => {
                                const link = document.createElement('a');
                                link.href = gifUrl;
                                link.download = 'animation.gif';
                                link.click();
                            }}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
