"use client";

import { useState, useRef, useEffect, Suspense, useCallback } from "react";
import {
    Sparkles,
    Wand2,
    Download,
    Play,
    Pause,
    ChevronUp,
    ChevronLeft,
    RotateCcw,
    AlertCircle,
    X,
    Upload,
    ImageIcon,
    Trash2,
    Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSetCreditsLocally } from "@/hooks/useUserProfile";
import { AuthGuard } from "@/components/AuthGuard";
import { AppSidebar } from "@/components/AppSidebar";
import { auth } from "@/lib/firebase";
import { AnimationTypeSelector, type AnimationType } from "@/components/AnimationTypeSelector";

export const dynamic = "force-dynamic";

function AnimationPageContent() {
    const { setCreditsLocally } = useSetCreditsLocally();

    // State
    const [characterImage, setCharacterImage] = useState<string | null>(null);
    const [characterFile, setCharacterFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedAnimation, setSelectedAnimation] = useState<AnimationType | null>(null);
    const [selectedView, setSelectedView] = useState("isometric");
    const [selectedDirection, setSelectedDirection] = useState("right");
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generatedFrames, setGeneratedFrames] = useState<string[]>([]);
    const [generationError, setGenerationError] = useState<string | null>(null);
    
    // Animation preview
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    
    // UI state
    const [settingsOpen, setSettingsOpen] = useState(true);
    const [tipsOpen, setTipsOpen] = useState(false);
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(360);

    const animationRef = useRef<number | null>(null);

    // Animation loop
    useEffect(() => {
        if (!isPlaying || generatedFrames.length < 2) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            return;
        }

        let lastTime = 0;
        const frameDelay = 150; // ms per frame

        const animate = (time: number) => {
            if (time - lastTime >= frameDelay) {
                setCurrentFrame((prev) => (prev + 1) % generatedFrames.length);
                lastTime = time;
            }
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, generatedFrames.length]);

    // Image upload handlers
    const handleImageUpload = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) {
            setGenerationError("Please upload an image file");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setGenerationError("Image must be less than 10MB");
            return;
        }
        
        setCharacterFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setCharacterImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleImageUpload(file);
    }, [handleImageUpload]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleImageUpload(file);
    }, [handleImageUpload]);

    const handleRemoveImage = () => {
        setCharacterImage(null);
        setCharacterFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleGenerate = async () => {
        if (!characterImage || !selectedAnimation) return;

        setIsGenerating(true);
        setGenerationError(null);
        setGeneratedFrames([]);
        setGenerationProgress(0);
        setCurrentFrame(0);

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Please sign in to generate animations");
            const idToken = await user.getIdToken();
            const userApiKey = localStorage.getItem("replicate_api_key") || localStorage.getItem("gemini_api_key");
            const userProvider = localStorage.getItem("replicate_api_key") ? "replicate" : 
                                 localStorage.getItem("gemini_api_key") ? "gemini" : undefined;

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/generate/animation`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        characterImage,
                        viewType: selectedView,
                        direction: selectedDirection,
                        animationType: selectedAnimation.name,
                        frameDescriptions: selectedAnimation.frameDescriptions,
                        apiKey: userApiKey || undefined,
                        provider: userProvider,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 402) {
                    throw new Error(`Insufficient credits. Need ${data.required}, have ${data.available}.`);
                }
                throw new Error(data.error || "Failed to generate animation");
            }

            if (data.success && data.frames?.length > 0) {
                setGeneratedFrames(data.frames);
                if (typeof data.remainingCredits === "number") {
                    setCreditsLocally(data.remainingCredits);
                }
                setIsPlaying(true);
            } else {
                throw new Error("No frames were generated");
            }
        } catch (error: any) {
            console.error("Generation error:", error);
            setGenerationError(error.message || "Failed to generate animation.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadSpriteSheet = async () => {
        if (generatedFrames.length === 0) return;

        // Load all images
        const loadedImages = await Promise.all(
            generatedFrames.map(
                (src) =>
                    new Promise<HTMLImageElement>((resolve) => {
                        const img = new Image();
                        img.crossOrigin = "anonymous";
                        img.onload = () => resolve(img);
                        img.src = src;
                    })
            )
        );

        // Find max dimensions
        const maxWidth = Math.max(...loadedImages.map((img) => img.width));
        const maxHeight = Math.max(...loadedImages.map((img) => img.height));

        // Create sprite sheet
        const canvas = document.createElement("canvas");
        canvas.width = maxWidth * generatedFrames.length;
        canvas.height = maxHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.imageSmoothingEnabled = false;

        loadedImages.forEach((img, index) => {
            const x = index * maxWidth + Math.floor((maxWidth - img.width) / 2);
            const y = Math.floor((maxHeight - img.height) / 2);
            ctx.drawImage(img, x, y);
        });

        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedAnimation?.id || "animation"}-spritesheet.png`;
        a.click();
    };

    const handleReset = () => {
        setCharacterImage(null);
        setCharacterFile(null);
        setSelectedAnimation(null);
        setGeneratedFrames([]);
        setGenerationError(null);
        setIsPlaying(false);
        setCurrentFrame(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const creditsRequired = selectedAnimation ? selectedAnimation.frames * 3 : 0;

    return (
        <div className="h-screen flex bg-background text-text font-sans overflow-hidden">
            <main className="flex-1 flex overflow-hidden">
                <AppSidebar />

                {/* Edit Panel */}
                <div
                    style={{ width: panelCollapsed ? "0px" : `${sidebarWidth}px` }}
                    className={`bg-[#060608] border-r border-white/5 flex flex-col overflow-hidden transition-all duration-300 ${
                        panelCollapsed ? "opacity-0" : "opacity-100"
                    }`}
                >
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-4 space-y-4">
                            {/* Header */}
                            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">Animation Generator</span>
                            </div>

                            {/* Character Image Upload */}
                            <div className="space-y-2">
                                <span className="text-xs font-medium text-text">Character Image</span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                
                                {!characterImage ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        className={`relative w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                                            isDragging
                                                ? "border-primary bg-primary/10"
                                                : "border-white/20 bg-black/30 hover:border-primary/50 hover:bg-black/40"
                                        }`}
                                    >
                                        <Upload className={`w-6 h-6 ${isDragging ? "text-primary" : "text-text-muted"}`} />
                                        <div className="text-center">
                                            <p className="text-xs text-text-muted">
                                                {isDragging ? "Drop image here" : "Click or drag to upload"}
                                            </p>
                                            <p className="text-[10px] text-text-dim mt-1">PNG, JPG up to 10MB</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative w-full rounded-xl bg-black/30 border border-white/10 overflow-hidden">
                                        <div className="aspect-square max-h-40 mx-auto flex items-center justify-center p-2">
                                            <img
                                                src={characterImage}
                                                alt="Character"
                                                className="max-w-full max-h-full object-contain rounded-lg"
                                                style={{ imageRendering: "pixelated" }}
                                            />
                                        </div>
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-text-muted hover:text-text transition-colors"
                                                title="Change image"
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={handleRemoveImage}
                                                className="p-1.5 rounded-lg bg-black/60 hover:bg-red-500/50 text-text-muted hover:text-white transition-colors"
                                                title="Remove image"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        {characterFile && (
                                            <div className="px-3 py-2 border-t border-white/5 bg-black/20">
                                                <p className="text-[10px] text-text-dim truncate">{characterFile.name}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Animation Type Selector */}
                            <div className="rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 overflow-hidden">
                                <button
                                    onClick={() => setSettingsOpen(!settingsOpen)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-primary to-primary/30" />
                                        <span className="text-xs font-semibold text-text uppercase tracking-wide">Animation Settings</span>
                                    </div>
                                    <ChevronUp className={`w-3.5 h-3.5 text-text-muted transition-transform ${settingsOpen ? "" : "rotate-180"}`} />
                                </button>

                                {settingsOpen && (
                                    <div className="px-4 pb-4">
                                        <AnimationTypeSelector
                                            selectedAnimation={selectedAnimation}
                                            onAnimationSelect={setSelectedAnimation}
                                            selectedView={selectedView}
                                            onViewSelect={setSelectedView}
                                            selectedDirection={selectedDirection}
                                            onDirectionSelect={setSelectedDirection}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Tips & Guide */}
                            <div className="rounded-2xl bg-gradient-to-b from-amber-500/[0.05] to-transparent border border-amber-500/10 overflow-hidden">
                                <button
                                    onClick={() => setTipsOpen(!tipsOpen)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4 text-amber-400" />
                                        <span className="text-xs font-semibold text-text uppercase tracking-wide">Tips & Guide</span>
                                    </div>
                                    <ChevronUp className={`w-3.5 h-3.5 text-text-muted transition-transform ${tipsOpen ? "" : "rotate-180"}`} />
                                </button>

                                {tipsOpen && (
                                    <div className="px-4 pb-4 space-y-3">
                                        {/* Tip 1 */}
                                        <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-2">
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                                                    <span className="text-[10px] font-bold text-amber-400">1</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-medium text-text">Match the Starting Pose</p>
                                                    <p className="text-[10px] text-text-muted leading-relaxed">
                                                        Use an image matching the starting pose, view angle, and character direction of the selected action.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="ml-8 p-2 rounded-lg bg-black/30 border border-white/5">
                                                <p className="text-[9px] text-amber-400/80 mb-2">Example: Ideal starting pose for Walking</p>
                                                <img 
                                                    src="/int2.png" 
                                                    alt="Starting pose example" 
                                                    className="w-full max-w-[120px] h-auto rounded border border-white/10"
                                                    style={{ imageRendering: "pixelated" }}
                                                />
                                            </div>
                                        </div>

                                        {/* Tip 2 */}
                                        <div className="flex gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-amber-400">2</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-medium text-text">Iterate a Few Times</p>
                                                <p className="text-[10px] text-text-muted leading-relaxed">
                                                    AI may need a few retries for best results, especially for complex actions. Don't hesitate to regenerate.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Tip 3 */}
                                        <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-2">
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                                                    <span className="text-[10px] font-bold text-amber-400">3</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-medium text-text">Leave Space for Actions</p>
                                                    <p className="text-[10px] text-text-muted leading-relaxed">
                                                        Ensure enough space around your character for movements like jumping, punching, or casting spells.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="ml-8 p-2 rounded-lg bg-black/30 border border-white/5">
                                                <p className="text-[9px] text-amber-400/80 mb-2">Example: Character with action space</p>
                                                <img 
                                                    src="/int3.png" 
                                                    alt="Action space example" 
                                                    className="w-full max-w-[120px] h-auto rounded border border-white/10"
                                                    style={{ imageRendering: "pixelated" }}
                                                />
                                            </div>
                                        </div>

                                        {/* Tip 4 */}
                                        <div className="flex gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-amber-400">4</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-medium text-text">Size Matters</p>
                                                <p className="text-[10px] text-text-muted leading-relaxed">
                                                    If results look weird, your character might be too big or small. Match the size to example animations.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Tip 5 */}
                                        <div className="flex gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-amber-400">5</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-medium text-text">Weapon Animations</p>
                                                <p className="text-[10px] text-text-muted leading-relaxed">
                                                    Ensure the weapon is held on the same arm/hand and direction as the example animation.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-white/5 bg-gradient-to-t from-[#060608] to-[#0a0a0f] p-4 space-y-3">
                        <div className="flex items-center justify-center">
                            <button onClick={handleReset} className="flex items-center gap-2 text-xs text-text-muted hover:text-text transition-colors">
                                <RotateCcw className="w-3.5 h-3.5" />
                                Reset
                            </button>
                        </div>
                        <Button
                            onClick={handleGenerate}
                            disabled={!characterImage || !selectedAnimation || isGenerating}
                            className="w-full h-12 text-sm font-bold bg-gradient-to-r from-primary to-primary-500 hover:from-primary-500 hover:to-primary text-primary-foreground shadow-xl shadow-primary/25 rounded-xl disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 animate-spin" />
                                    Generating {selectedAnimation?.frames} frames...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Wand2 className="w-4 h-4" />
                                    Generate Animation
                                </span>
                            )}
                        </Button>
                        <p className="text-center text-[10px] text-text-dim">
                            <span className="text-primary font-medium">{creditsRequired} credits</span> ({selectedAnimation?.frames || 0} frames × 3)
                        </p>
                    </div>
                </div>

                {/* Collapse Button */}
                <div className="relative z-20 flex items-stretch">
                    <button
                        onClick={() => setPanelCollapsed(!panelCollapsed)}
                        className="w-5 bg-[#0a0a0c] hover:bg-[#1a1a1f] border-r border-white/5 flex items-center justify-center transition-all"
                    >
                        <ChevronLeft className={`w-3.5 h-3.5 text-text-muted transition-transform ${panelCollapsed ? "rotate-180" : ""}`} />
                    </button>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-background relative flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="h-12 border-b border-white/5 flex items-center justify-between px-5 bg-[#0a0a0c]">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-medium text-text">Animation Preview</span>
                            {generatedFrames.length > 0 && (
                                <>
                                    <div className="h-4 w-px bg-white/10" />
                                    <span className="text-[10px] font-mono text-text-muted">
                                        Frame {currentFrame + 1} / {generatedFrames.length}
                                    </span>
                                </>
                            )}
                        </div>
                        {generatedFrames.length > 0 && (
                            <Button variant="outline" size="sm" onClick={handleDownloadSpriteSheet} className="gap-2 text-xs">
                                <Download className="w-3.5 h-3.5" />
                                Download Sprite Sheet
                            </Button>
                        )}
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 overflow-auto flex items-center justify-center relative bg-[#09090b]">
                        <div
                            className="absolute inset-0 opacity-[0.03]"
                            style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
                        />

                        {/* Error */}
                        {generationError && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-md">
                                <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    <p className="text-sm text-red-400">{generationError}</p>
                                    <button onClick={() => setGenerationError(null)} className="p-1 hover:bg-red-500/20 rounded-lg">
                                        <X className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Loading */}
                        {isGenerating && (
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto animate-pulse">
                                    <Sparkles className="w-8 h-8 text-primary animate-spin" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-text">Generating animation frames...</p>
                                    <p className="text-xs text-text-muted">This may take 30-60 seconds for {selectedAnimation?.frames} frames</p>
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {!isGenerating && generatedFrames.length === 0 && !generationError && (
                            <div className="text-center space-y-4 max-w-xs opacity-50">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mx-auto">
                                    <ImageIcon className="w-6 h-6 text-primary" />
                                </div>
                                <p className="text-sm text-text-muted">Upload a character image and select an animation to generate</p>
                            </div>
                        )}

                        {/* Generated Animation Preview */}
                        {generatedFrames.length > 0 && !isGenerating && (
                            <div className="flex flex-col items-center gap-6">
                                {/* Main Preview */}
                                <div className="relative">
                                    <div className="w-64 h-64 rounded-2xl bg-black/50 border border-white/10 overflow-hidden flex items-center justify-center">
                                        <img
                                            src={generatedFrames[currentFrame]}
                                            alt={`Frame ${currentFrame + 1}`}
                                            className="max-w-full max-h-full object-contain"
                                            style={{ imageRendering: "pixelated" }}
                                        />
                                    </div>
                                    
                                    {/* Play/Pause Overlay */}
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors group"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isPlaying ? (
                                                <Pause className="w-6 h-6 text-white" />
                                            ) : (
                                                <Play className="w-6 h-6 text-white ml-1" />
                                            )}
                                        </div>
                                    </button>
                                </div>

                                {/* Playback Controls */}
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className={`p-3 rounded-xl transition-all ${
                                            isPlaying
                                                ? "bg-primary/20 text-primary border border-primary/30"
                                                : "bg-white/[0.05] text-text-muted border border-white/10 hover:bg-white/[0.08]"
                                        }`}
                                    >
                                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    </button>
                                    <span className="text-xs font-mono text-text-muted">
                                        {isPlaying ? "Playing" : "Paused"}
                                    </span>
                                </div>

                                {/* Frame Thumbnails */}
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-black/30 border border-white/5">
                                    {generatedFrames.map((frame, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setCurrentFrame(index);
                                                setIsPlaying(false);
                                            }}
                                            className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                                                currentFrame === index
                                                    ? "border-primary ring-2 ring-primary/30"
                                                    : "border-white/10 hover:border-white/30"
                                            }`}
                                        >
                                            <img
                                                src={frame}
                                                alt={`Frame ${index + 1}`}
                                                className="w-full h-full object-contain bg-black/50"
                                                style={{ imageRendering: "pixelated" }}
                                            />
                                            <span className="absolute bottom-0 left-0 right-0 text-[8px] font-mono text-center bg-black/70 text-white/70">
                                                {index + 1}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Frame Grid View */}
                                <div className="w-full max-w-2xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-medium text-text-muted">All Frames</span>
                                        <span className="text-[10px] text-text-dim">{generatedFrames.length} frames generated</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3 p-4 rounded-xl bg-black/20 border border-white/5">
                                        {generatedFrames.map((frame, index) => (
                                            <div
                                                key={index}
                                                className="aspect-square rounded-lg bg-black/30 border border-white/10 overflow-hidden flex items-center justify-center"
                                            >
                                                <img
                                                    src={frame}
                                                    alt={`Frame ${index + 1}`}
                                                    className="max-w-full max-h-full object-contain"
                                                    style={{ imageRendering: "pixelated" }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function AnimationPage() {
    return (
        <AuthGuard>
            <Suspense fallback={<div className="h-screen flex items-center justify-center bg-background"><Sparkles className="w-8 h-8 text-primary animate-spin" /></div>}>
                <AnimationPageContent />
            </Suspense>
        </AuthGuard>
    );
}
