"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Upload,
    Play,
    Pause,
    Trash2,
    Plus,
    Download,
    GripVertical,
    Clock,
    Film,
    Layers,
    RotateCcw,
    ChevronLeft,
    Image as ImageIcon,
    Copy,
    ArrowLeft,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthGuard } from "@/components/AuthGuard";
import Link from "next/link";

interface AnimationFrame {
    id: string;
    imageUrl: string;
    duration: number; // ms
}

export default function AnimationCreatorPage() {
    const [frames, setFrames] = useState<AnimationFrame[]>([]);
    const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [globalDuration, setGlobalDuration] = useState(100);
    const [isExporting, setIsExporting] = useState(false);
    const [draggedFrameId, setDraggedFrameId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    // Generate unique ID
    const generateId = () => Math.random().toString(36).substring(2, 9);

    // Handle file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            if (file.type.startsWith("image/")) {
                const url = URL.createObjectURL(file);
                const newFrame: AnimationFrame = {
                    id: generateId(),
                    imageUrl: url,
                    duration: globalDuration,
                };
                setFrames((prev) => [...prev, newFrame]);
            }
        });

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Handle drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;

        Array.from(files).forEach((file) => {
            if (file.type.startsWith("image/")) {
                const url = URL.createObjectURL(file);
                const newFrame: AnimationFrame = {
                    id: generateId(),
                    imageUrl: url,
                    duration: globalDuration,
                };
                setFrames((prev) => [...prev, newFrame]);
            }
        });
    };

    // Delete frame
    const deleteFrame = (id: string) => {
        setFrames((prev) => {
            const frame = prev.find((f) => f.id === id);
            if (frame) URL.revokeObjectURL(frame.imageUrl);
            return prev.filter((f) => f.id !== id);
        });
        if (selectedFrameId === id) setSelectedFrameId(null);
    };

    // Duplicate frame
    const duplicateFrame = (id: string) => {
        const frame = frames.find((f) => f.id === id);
        if (!frame) return;
        const index = frames.findIndex((f) => f.id === id);
        const newFrame: AnimationFrame = {
            id: generateId(),
            imageUrl: frame.imageUrl,
            duration: frame.duration,
        };
        const newFrames = [...frames];
        newFrames.splice(index + 1, 0, newFrame);
        setFrames(newFrames);
    };

    // Move frame
    const moveFrame = (id: string, direction: "left" | "right") => {
        const index = frames.findIndex((f) => f.id === id);
        if (index === -1) return;
        const newIndex = direction === "left" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= frames.length) return;

        const newFrames = [...frames];
        [newFrames[index], newFrames[newIndex]] = [newFrames[newIndex], newFrames[index]];
        setFrames(newFrames);
    };

    // Update frame duration
    const updateFrameDuration = (id: string, duration: number) => {
        setFrames((prev) =>
            prev.map((f) => (f.id === id ? { ...f, duration } : f))
        );
    };

    // Apply global duration to all frames
    const applyGlobalDuration = () => {
        setFrames((prev) => prev.map((f) => ({ ...f, duration: globalDuration })));
    };

    // Clear all frames
    const clearAllFrames = () => {
        frames.forEach((f) => URL.revokeObjectURL(f.imageUrl));
        setFrames([]);
        setSelectedFrameId(null);
        setCurrentFrameIndex(0);
    };

    // Animation loop
    useEffect(() => {
        if (!isPlaying || frames.length < 2) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            return;
        }

        const animate = (time: number) => {
            const currentFrame = frames[currentFrameIndex];
            if (!currentFrame) return;

            if (time - lastTimeRef.current >= currentFrame.duration) {
                setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
                lastTimeRef.current = time;
            }
            animationRef.current = requestAnimationFrame(animate);
        };

        lastTimeRef.current = performance.now();
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, frames.length, currentFrameIndex, frames]);

    // Draw current frame on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || frames.length === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const frame = frames[currentFrameIndex];
        if (!frame) return;

        const img = new Image();
        img.src = frame.imageUrl;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0);
        };
    }, [currentFrameIndex, frames]);

    // Export as GIF
    const exportAsGif = async () => {
        if (frames.length === 0) return;
        setIsExporting(true);

        try {
            // Dynamic import gif.js
            const GIF = (await import("gif.js")).default;

            // Load all images first
            const loadedImages = await Promise.all(
                frames.map(
                    (frame) =>
                        new Promise<HTMLImageElement>((resolve) => {
                            const img = new Image();
                            img.crossOrigin = "anonymous";
                            img.onload = () => resolve(img);
                            img.src = frame.imageUrl;
                        })
                )
            );

            // Find max dimensions
            const maxWidth = Math.max(...loadedImages.map((img) => img.width));
            const maxHeight = Math.max(...loadedImages.map((img) => img.height));

            const gif = new GIF({
                workers: 2,
                quality: 10,
                width: maxWidth,
                height: maxHeight,
                workerScript: "/gif.worker.js",
            });

            // Create temp canvas
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = maxWidth;
            tempCanvas.height = maxHeight;
            const ctx = tempCanvas.getContext("2d");
            if (!ctx) throw new Error("Failed to get canvas context");

            // Add frames
            frames.forEach((frame, index) => {
                ctx.clearRect(0, 0, maxWidth, maxHeight);
                const img = loadedImages[index];
                // Center the image
                const x = Math.floor((maxWidth - img.width) / 2);
                const y = Math.floor((maxHeight - img.height) / 2);
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img, x, y);
                gif.addFrame(ctx, { copy: true, delay: frame.duration });
            });

            gif.on("finished", (blob: Blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `animation-${Date.now()}.gif`;
                a.click();
                URL.revokeObjectURL(url);
                setIsExporting(false);
            });

            gif.render();
        } catch (error) {
            console.error("Export failed:", error);
            setIsExporting(false);
            alert("Failed to export GIF. Please try again.");
        }
    };

    // Export as sprite sheet
    const exportAsSpriteSheet = async () => {
        if (frames.length === 0) return;

        // Load all images
        const loadedImages = await Promise.all(
            frames.map(
                (frame) =>
                    new Promise<HTMLImageElement>((resolve) => {
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.src = frame.imageUrl;
                    })
            )
        );

        // Find max dimensions
        const maxWidth = Math.max(...loadedImages.map((img) => img.width));
        const maxHeight = Math.max(...loadedImages.map((img) => img.height));

        // Create sprite sheet canvas
        const canvas = document.createElement("canvas");
        canvas.width = maxWidth * frames.length;
        canvas.height = maxHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.imageSmoothingEnabled = false;

        // Draw each frame
        loadedImages.forEach((img, index) => {
            const x = index * maxWidth + Math.floor((maxWidth - img.width) / 2);
            const y = Math.floor((maxHeight - img.height) / 2);
            ctx.drawImage(img, x, y);
        });

        // Download
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `spritesheet-${Date.now()}.png`;
        a.click();
    };

    // Drag and drop reordering
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedFrameId(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedFrameId || draggedFrameId === targetId) return;

        const draggedIndex = frames.findIndex((f) => f.id === draggedFrameId);
        const targetIndex = frames.findIndex((f) => f.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newFrames = [...frames];
        const [draggedFrame] = newFrames.splice(draggedIndex, 1);
        newFrames.splice(targetIndex, 0, draggedFrame);
        setFrames(newFrames);
    };

    const handleDragEnd = () => {
        setDraggedFrameId(null);
    };

    const selectedFrame = frames.find((f) => f.id === selectedFrameId);

    return (
        <AuthGuard>
            <div className="h-screen flex bg-[#050506] text-text font-sans overflow-hidden">
                <AppSidebar />

                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0c]">
                        <div className="flex items-center gap-4">
                            <Link href="/home">
                                <Button variant="ghost" size="sm" className="gap-2 text-text-muted hover:text-white">
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </Button>
                            </Link>
                            <div className="h-6 w-px bg-white/10" />
                            <div className="flex items-center gap-2">
                                <Film className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">Animation Creator</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportAsSpriteSheet}
                                disabled={frames.length === 0}
                                className="gap-2 text-xs"
                            >
                                <Layers className="w-3.5 h-3.5" />
                                Export Sprite Sheet
                            </Button>
                            <Button
                                size="sm"
                                onClick={exportAsGif}
                                disabled={frames.length === 0 || isExporting}
                                className="gap-2 text-xs bg-primary hover:bg-primary/90"
                            >
                                <Download className="w-3.5 h-3.5" />
                                {isExporting ? "Exporting..." : "Export GIF"}
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Preview Area */}
                        <div className="flex-1 flex flex-col">
                            {/* Canvas */}
                            <div className="flex-1 flex items-center justify-center bg-[#09090b] relative overflow-hidden">
                                <div
                                    className="absolute inset-0 opacity-[0.02]"
                                    style={{
                                        backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                                        backgroundSize: "20px 20px",
                                    }}
                                />

                                {frames.length === 0 ? (
                                    <div
                                        className="w-full max-w-md mx-4 p-8 border-2 border-dashed border-white/10 rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                        onDrop={handleDrop}
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        <div className="flex flex-col items-center gap-4 text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                <Upload className="w-7 h-7 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white mb-1">Add animation frames</p>
                                                <p className="text-xs text-text-muted">Drop images or click to browse</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <canvas
                                            ref={canvasRef}
                                            className="max-w-full max-h-[60vh] rounded-lg border border-white/10"
                                            style={{ imageRendering: "pixelated" }}
                                        />
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setIsPlaying(!isPlaying)}
                                            >
                                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            </Button>
                                            <span className="text-xs font-mono text-text-muted min-w-[60px] text-center">
                                                {currentFrameIndex + 1} / {frames.length}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Timeline */}
                            <div className="h-48 border-t border-white/5 bg-[#0a0a0c] flex flex-col">
                                <div className="h-10 border-b border-white/5 flex items-center justify-between px-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-text-muted">Frames</span>
                                        <span className="text-[10px] text-text-dim px-2 py-0.5 bg-white/5 rounded">{frames.length}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs gap-1.5"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Plus className="w-3 h-3" />
                                            Add
                                        </Button>
                                        {frames.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                onClick={clearAllFrames}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Frame thumbnails */}
                                <div className="flex-1 overflow-x-auto overflow-y-hidden p-3">
                                    <div className="flex gap-2 h-full">
                                        {frames.map((frame, index) => (
                                            <div
                                                key={frame.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, frame.id)}
                                                onDragOver={(e) => handleDragOver(e, frame.id)}
                                                onDragEnd={handleDragEnd}
                                                onClick={() => {
                                                    setSelectedFrameId(frame.id);
                                                    setCurrentFrameIndex(index);
                                                }}
                                                className={`relative flex-shrink-0 w-24 h-full rounded-lg border-2 cursor-pointer transition-all group ${
                                                    currentFrameIndex === index
                                                        ? "border-primary bg-primary/10"
                                                        : selectedFrameId === frame.id
                                                        ? "border-white/30 bg-white/5"
                                                        : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                                                }`}
                                            >
                                                <div className="absolute top-1 left-1 flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <GripVertical className="w-3 h-3 text-text-muted cursor-grab" />
                                                    <span className="text-[9px] font-mono text-text-muted">{index + 1}</span>
                                                </div>
                                                <img
                                                    src={frame.imageUrl}
                                                    alt={`Frame ${index + 1}`}
                                                    className="w-full h-full object-contain p-2"
                                                    style={{ imageRendering: "pixelated" }}
                                                />
                                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-text-dim">
                                                    {frame.duration}ms
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteFrame(frame.id);
                                                    }}
                                                    className="absolute top-1 right-1 p-1 bg-black/60 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                                                >
                                                    <Trash2 className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add frame button */}
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex-shrink-0 w-24 h-full rounded-lg border-2 border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/5 cursor-pointer flex items-center justify-center transition-all"
                                        >
                                            <Plus className="w-6 h-6 text-text-muted" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Settings */}
                        <div className="w-72 border-l border-white/5 bg-[#0a0a0c] flex flex-col">
                            <div className="p-4 border-b border-white/5">
                                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Settings</h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {/* Global Timing */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-xs font-medium">Global Timing</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-text-muted">Frame Duration</span>
                                            <span className="text-primary font-mono">{globalDuration}ms ({Math.round(1000 / globalDuration)} FPS)</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={20}
                                            max={500}
                                            step={10}
                                            value={globalDuration}
                                            onChange={(e) => setGlobalDuration(Number(e.target.value))}
                                            className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs h-8"
                                            onClick={applyGlobalDuration}
                                            disabled={frames.length === 0}
                                        >
                                            Apply to All Frames
                                        </Button>
                                    </div>
                                </div>

                                {/* Selected Frame */}
                                {selectedFrame && (
                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon className="w-3.5 h-3.5 text-primary" />
                                            <span className="text-xs font-medium">Selected Frame</span>
                                        </div>

                                        <div className="aspect-square w-full bg-black/30 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={selectedFrame.imageUrl}
                                                alt="Selected"
                                                className="max-w-full max-h-full object-contain"
                                                style={{ imageRendering: "pixelated" }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] text-text-muted">Duration (ms)</label>
                                            <input
                                                type="number"
                                                min={20}
                                                max={2000}
                                                value={selectedFrame.duration}
                                                onChange={(e) => updateFrameDuration(selectedFrame.id, Number(e.target.value))}
                                                className="w-full h-8 px-3 text-xs bg-black/30 border border-white/10 rounded-lg focus:border-primary/50 focus:outline-none"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-xs h-8 gap-1"
                                                onClick={() => moveFrame(selectedFrame.id, "left")}
                                            >
                                                <ArrowLeft className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-xs h-8 gap-1"
                                                onClick={() => duplicateFrame(selectedFrame.id)}
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-xs h-8 gap-1"
                                                onClick={() => moveFrame(selectedFrame.id, "right")}
                                            >
                                                <ArrowRight className="w-3 h-3" />
                                            </Button>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs h-8 gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20"
                                            onClick={() => deleteFrame(selectedFrame.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Delete Frame
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </main>
            </div>
        </AuthGuard>
    );
}
