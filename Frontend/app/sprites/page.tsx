"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    ChevronLeft,
    Upload,
    X,
    Check,
    Sparkles,
    Wand2,
    Grid3x3,
    ZoomIn,
    Maximize,
    Download,
    Eye,
    Plus,
    User,
    Box,
    Move,
    Trash2,
    ChevronUp,
    RotateCcw,
    RectangleHorizontal,
    RectangleVertical,
    Square,
    AlertCircle,
    Command,
    FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useSetCreditsLocally } from "@/hooks/useUserProfile";
import { AuthGuard } from "@/components/AuthGuard";
import { AppSidebar } from "@/components/AppSidebar";
import { auth } from "@/lib/firebase";
import { PoseSelector } from "@/components/PoseSelector";

type SpriteType = "character" | "object";
type Viewpoint = "front" | "back" | "side" | "top_down" | "isometric";
type Style = "2d_flat" | "pixel_art";
type AspectRatio = "2:3" | "1:1" | "9:16" | "4:3" | "3:2" | "16:9";

export const dynamic = "force-dynamic";

function GenerateSpritePageContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId");
    const { setCreditsLocally } = useSetCreditsLocally();

    // State
    const [spriteType, setSpriteType] = useState<SpriteType>("character");
    const [prompt, setPrompt] = useState("");
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [colors, setColors] = useState<string[]>([]);
    const [customColor, setCustomColor] = useState("");
    const [viewpoint, setViewpoint] = useState<Viewpoint>("front");
    const [style, setStyle] = useState<Style>("pixel_art");
    const [dimensions, setDimensions] = useState("64x64");
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>("2:3");
    const [imageQuantity, setImageQuantity] = useState(2);
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [selectedPreview, setSelectedPreview] = useState<number | null>(null);
    const [sidebarWidth, setSidebarWidth] = useState(340);
    const [isDragging, setIsDragging] = useState(false);
    const [poseImage, setPoseImage] = useState<string | null>(null);
    const [poseKeywords, setPoseKeywords] = useState<string | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [showGrid, setShowGrid] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    
    // Collapsible sections
    const [basicSettingsOpen, setBasicSettingsOpen] = useState(true);
    const [advancedConfigOpen, setAdvancedConfigOpen] = useState(false);
    const [poseSettingsOpen, setPoseSettingsOpen] = useState(true);
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    
    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !mainRef.current) return;
            const mainRect = mainRef.current.getBoundingClientRect();
            const newWidth = e.clientX - mainRect.left;
            const minWidth = 300;
            const maxWidth = 500;
            if (newWidth >= minWidth && newWidth <= maxWidth) {
                setSidebarWidth(newWidth);
            }
        };
        const handleMouseUp = () => setIsDragging(false);
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [isDragging]);

    const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setReferenceImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAddColor = () => {
        if (customColor && !colors.includes(customColor) && colors.length < 5) {
            setColors([...colors, customColor]);
            setCustomColor("");
        }
    };

    const handleRemoveColor = (index: number) => {
        setColors(colors.filter((_, i) => i !== index));
    };

    const handleGenerateSprite = async () => {
        if (!prompt.trim()) return;
        
        setIsGenerating(true);
        setGenerationError(null);
        setPreviewImages([]);
        setSelectedPreview(null);
        
        try {
            // Get Firebase auth token
            const user = auth.currentUser;
            if (!user) {
                throw new Error('Please sign in to generate sprites');
            }
            const idToken = await user.getIdToken();
            
            // Get user's BYOK API key if available
            const userApiKey = localStorage.getItem('replicate_api_key') || localStorage.getItem('gemini_api_key');
            const userProvider = localStorage.getItem('replicate_api_key') ? 'replicate' : 
                                 localStorage.getItem('gemini_api_key') ? 'gemini' : undefined;
            
            // Build prompt with pose keywords if selected
            let fullPrompt = `${spriteType === 'character' ? 'Character sprite: ' : 'Object sprite: '}${prompt}`;
            if (poseKeywords && spriteType === 'character') {
                fullPrompt += `, ${poseKeywords}`;
            }
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/generate/sprite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    style,
                    aspectRatio,
                    viewpoint,
                    colors,
                    dimensions,
                    quantity: imageQuantity,
                    referenceImage,
                    poseImage,
                    apiKey: userApiKey || undefined,
                    provider: userProvider,
                    saveToCloud: true
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 402) {
                    throw new Error(`Insufficient credits. You need ${data.required} credits but have ${data.available}.`);
                }
                throw new Error(data.error || 'Failed to generate sprite');
            }
            
            if (data.success && data.images?.length > 0) {
                setPreviewImages(data.images);
                // Update credits locally (backend already deducted)
                if (typeof data.remainingCredits === 'number') {
                    setCreditsLocally(data.remainingCredits);
                }
            } else {
                throw new Error('No images were generated');
            }
        } catch (error: any) {
            console.error('Generation error:', error);
            setGenerationError(error.message || 'Failed to generate sprite. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCreateProject = () => {
        if (selectedPreview !== null) {
            window.location.href = projectId ? `/projects` : "/projects";
        }
    };

    const handleDownload = async (imageUrl: string, index: number) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sprite-${index + 1}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleReset = () => {
        setPrompt("");
        setReferenceImage(null);
        setColors([]);
        setViewpoint("front");
        setStyle("pixel_art");
        setDimensions("64x64");
        setAspectRatio("2:3");
        setImageQuantity(2);
        setPoseImage(null);
        setPoseKeywords(null);
        setPreviewImages([]);
        setSelectedPreview(null);
        setGenerationError(null);
    };

    const getImageDimensions = () => {
        const ratioMap: Record<AspectRatio, string> = {
            "2:3": "688 x 1024",
            "1:1": "1024 x 1024",
            "9:16": "576 x 1024",
            "4:3": "1024 x 768",
            "3:2": "1024 x 688",
            "16:9": "1024 x 576",
        };
        return ratioMap[aspectRatio];
    };

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 25, 200));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 25, 50));
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const openImageZoom = (imageUrl: string) => {
        setZoomedImage(imageUrl);
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div className="h-screen flex bg-background text-text font-sans selection:bg-primary/30 overflow-hidden">
            <main className="flex-1 flex overflow-hidden" ref={mainRef}>
                {/* Left Sidebar - Navigation */}
                <AppSidebar />

                {/* Edit Panel - SeaArt-inspired Controls */}
                <div
                    style={{ width: panelCollapsed ? '0px' : `${sidebarWidth}px` }}
                    className={`bg-[#060608] border-r border-white/5 flex flex-col overflow-hidden transition-all duration-300 ease-in-out relative z-10 ${panelCollapsed ? 'opacity-0' : 'opacity-100'}`}
                >
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-4 space-y-4">

                            {/* Sprite Type Selector - Refined */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-primary to-primary/30" />
                                    <span className="text-xs font-semibold text-text uppercase tracking-wide">Sprite Type</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: "character", label: "Character", icon: User, desc: "Animated beings" },
                                        { value: "object", label: "Object", icon: Box, desc: "Items & props" },
                                    ].map(({ value, label, icon: Icon, desc }) => (
                                        <button
                                            key={value}
                                            onClick={() => setSpriteType(value as SpriteType)}
                                            className={`group relative flex flex-col items-center gap-2 py-4 px-3 rounded-xl text-xs font-medium transition-all duration-300 ${
                                                spriteType === value
                                                    ? "bg-gradient-to-b from-primary/20 to-primary/5 text-primary border border-primary/30 shadow-lg shadow-primary/10"
                                                    : "bg-white/[0.02] text-text-muted border border-white/5 hover:bg-white/[0.05] hover:border-white/10 hover:text-text"
                                            }`}
                                        >
                                            <div className={`p-2.5 rounded-lg transition-all ${spriteType === value ? 'bg-primary/20' : 'bg-white/[0.03] group-hover:bg-white/[0.06]'}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold">{label}</span>
                                            <span className={`text-[10px] ${spriteType === value ? 'text-primary/70' : 'text-text-dim'}`}>{desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Generation Settings - Collapsible */}
                            <div className="rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 overflow-hidden">
                                <button
                                    onClick={() => setBasicSettingsOpen(!basicSettingsOpen)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-primary to-primary/30" />
                                        <span className="text-xs font-semibold text-text uppercase tracking-wide">Generation</span>
                                    </div>
                                    <div className={`p-1 rounded-md bg-white/[0.03] transition-transform duration-200 ${basicSettingsOpen ? '' : 'rotate-180'}`}>
                                        <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
                                    </div>
                                </button>
                                
                                {basicSettingsOpen && (
                                    <div className="px-4 pb-4 space-y-5">
                                        {/* Prompt - Enhanced */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-medium text-text">Describe your sprite</span>
                                                <span className="text-[10px] text-text-dim font-mono px-2 py-0.5 rounded-full bg-white/[0.03]">{prompt.length}/500</span>
                                            </div>
                                            <div className="relative">
                                                <textarea
                                                    value={prompt}
                                                    onChange={(e) => setPrompt(e.target.value)}
                                                    placeholder={spriteType === "character" ? "A pixel art warrior with a sword, wearing golden armor..." : "A pixel art treasure chest with glowing gems..."}
                                                    className="w-full h-24 p-3 text-sm bg-black/30 border border-white/10 rounded-xl resize-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-black/40 transition-all placeholder:text-text-dim/50 text-text leading-relaxed"
                                                />
                                                <div className="absolute bottom-2 right-2">
                                                    <Wand2 className="w-4 h-4 text-text-dim/30" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Style Reference - Enhanced */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-text">Style Reference</span>
                                                <span className="text-[9px] text-text-dim">Optional</span>
                                            </div>
                                            {referenceImage ? (
                                                <div className="relative w-full h-20 rounded-xl border border-white/10 overflow-hidden group bg-black/30">
                                                    <img src={referenceImage} alt="Reference" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <button onClick={() => setReferenceImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-accent-coral text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center gap-2 w-full h-16 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/[0.02] hover:border-primary/30 transition-all group">
                                                    <div className="flex items-center gap-2">
                                                        <Upload className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
                                                        <span className="text-[10px] text-text-muted group-hover:text-primary transition-colors">Upload style inspiration</span>
                                                    </div>
                                                    <input type="file" onChange={handleReferenceImageUpload} accept="image/png,image/jpeg,image/webp" className="hidden" />
                                                </label>
                                            )}
                                        </div>

                                        {/* Divider */}
                                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                        {/* Style Selection - Enhanced */}
                                        <div className="space-y-3">
                                            <span className="text-xs font-medium text-text">Art Style</span>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { value: "pixel_art", label: "Pixel Art", icon: Grid3x3 },
                                                    { value: "2d_flat", label: "2D Flat", icon: Square },
                                                ].map(({ value, label, icon: Icon }) => (
                                                    <button
                                                        type="button"
                                                        key={value}
                                                        onClick={() => setStyle(value as Style)}
                                                        className={`flex items-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                                                            style === value
                                                                ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 shadow-sm shadow-primary/10"
                                                                : "bg-white/[0.02] text-text-muted border border-white/5 hover:bg-white/[0.04] hover:text-text"
                                                        }`}
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Aspect Ratio - Enhanced */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-text">Aspect Ratio</span>
                                                <span className="text-[10px] text-primary font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">{getImageDimensions()}</span>
                                            </div>
                                            <div className="grid grid-cols-5 gap-2">
                                                {[
                                                    { value: "2:3", icon: RectangleVertical },
                                                    { value: "1:1", icon: Square },
                                                    { value: "9:16", icon: RectangleVertical },
                                                    { value: "4:3", icon: RectangleHorizontal },
                                                    { value: "3:2", icon: RectangleHorizontal },
                                                ].map(({ value, icon: Icon }) => (
                                                    <button
                                                        key={value}
                                                        onClick={() => setAspectRatio(value as AspectRatio)}
                                                        className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-[10px] font-medium transition-all ${
                                                            aspectRatio === value
                                                                ? "bg-gradient-to-b from-primary/20 to-primary/5 text-primary border border-primary/30"
                                                                : "bg-white/[0.02] text-text-muted border border-white/5 hover:bg-white/[0.04] hover:text-text"
                                                        }`}
                                                    >
                                                        <Icon className={`w-4 h-4 ${aspectRatio === value ? 'text-primary' : ''}`} />
                                                        <span>{value}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Image Quantity - Enhanced */}
                                        <div className="space-y-3">
                                            <span className="text-xs font-medium text-text">Variations</span>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4].map((num) => (
                                                    <button
                                                        key={num}
                                                        onClick={() => setImageQuantity(num)}
                                                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                                            imageQuantity === num
                                                                ? "bg-gradient-to-b from-primary/20 to-primary/5 text-primary border border-primary/30"
                                                                : "bg-white/[0.02] text-text-muted border border-white/5 hover:bg-white/[0.04] hover:text-text"
                                                        }`}
                                                    >
                                                        {num}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Viewpoint - Enhanced */}
                                        <div className="space-y-3">
                                            <span className="text-xs font-medium text-text">Camera Angle</span>
                                            <div className="relative">
                                                <select
                                                    value={viewpoint}
                                                    onChange={(e) => setViewpoint(e.target.value as Viewpoint)}
                                                    className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-text focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all appearance-none cursor-pointer hover:bg-black/40"
                                                >
                                                    <option value="front">Front View</option>
                                                    <option value="back">Back View</option>
                                                    <option value="side">Side View</option>
                                                    <option value="top_down">Top Down</option>
                                                    <option value="isometric">Isometric</option>
                                                </select>
                                                <Eye className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Colors - Enhanced */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-medium text-text">Color Palette</span>
                                                <span className="text-[10px] text-text-dim">{colors.length}/5</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {colors.map((color, index) => (
                                                    <div key={index} className="group relative">
                                                        <div className="w-9 h-9 rounded-xl border-2 border-white/10 cursor-pointer hover:scale-110 transition-all shadow-lg" style={{ backgroundColor: color }} />
                                                        <button onClick={() => handleRemoveColor(index)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black/80 border border-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-accent-coral hover:border-accent-coral">
                                                            <X className="w-2.5 h-2.5 text-white" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {colors.length < 5 && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative w-9 h-9 rounded-xl border-2 border-dashed border-white/20 hover:border-primary/50 transition-all flex items-center justify-center cursor-pointer overflow-hidden group">
                                                            <input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer opacity-0" />
                                                            <div className="w-full h-full flex items-center justify-center rounded-xl" style={{ backgroundColor: customColor || 'transparent' }}>
                                                                {!customColor && <Plus className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />}
                                                            </div>
                                                        </div>
                                                        {customColor && (
                                                            <button onClick={handleAddColor} className="px-3 py-1.5 text-[10px] font-semibold bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors">
                                                                Add
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Advanced Config - Collapsible */}
                            <div className="rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 overflow-hidden">
                                <button
                                    onClick={() => setAdvancedConfigOpen(!advancedConfigOpen)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-accent-cyan to-accent-cyan/30" />
                                        <span className="text-xs font-semibold text-text uppercase tracking-wide">Advanced</span>
                                    </div>
                                    <div className={`p-1 rounded-md bg-white/[0.03] transition-transform duration-200 ${advancedConfigOpen ? '' : 'rotate-180'}`}>
                                        <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
                                    </div>
                                </button>
                                
                                {advancedConfigOpen && (
                                    <div className="px-4 pb-4 space-y-4">
                                        {/* Dimensions */}
                                        <div className="space-y-3">
                                            <span className="text-xs font-medium text-text">Output Size</span>
                                            <div className="grid grid-cols-4 gap-2">
                                                {["32x32", "64x64", "128x128", "256x256"].map((size) => (
                                                    <button
                                                        key={size}
                                                        onClick={() => setDimensions(size)}
                                                        className={`py-2 rounded-xl text-[10px] font-semibold transition-all ${
                                                            dimensions === size
                                                                ? "bg-gradient-to-b from-accent-cyan/20 to-accent-cyan/5 text-accent-cyan border border-accent-cyan/30"
                                                                : "bg-white/[0.02] text-text-muted border border-white/5 hover:bg-white/[0.04] hover:text-text"
                                                        }`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Summary Cards */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5">
                                                <span className="text-[10px] text-text-dim block mb-1">Art Style</span>
                                                <span className="text-xs font-medium text-text">{style === "pixel_art" ? "Pixel Art" : "2D Flat"}</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5">
                                                <span className="text-[10px] text-text-dim block mb-1">Sprite Type</span>
                                                <span className="text-xs font-medium text-text capitalize">{spriteType}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Character Pose - Collapsible */}
                            {spriteType === "character" && (
                                <div className="rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 overflow-hidden">
                                    <button
                                        onClick={() => setPoseSettingsOpen(!poseSettingsOpen)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-accent-orange to-accent-orange/30" />
                                            <span className="text-xs font-semibold text-text uppercase tracking-wide">Pose</span>
                                            <Move className="w-3.5 h-3.5 text-accent-orange" />
                                            {(poseKeywords || poseImage) && (
                                                <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-primary text-[9px] font-medium rounded">Selected</span>
                                            )}
                                        </div>
                                        <div className={`p-1 rounded-md bg-white/[0.03] transition-transform duration-200 ${poseSettingsOpen ? '' : 'rotate-180'}`}>
                                            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
                                        </div>
                                    </button>
                                    
                                    {poseSettingsOpen && (
                                        <div className="px-4 pb-4">
                                            <PoseSelector
                                                selectedPose={poseKeywords}
                                                onPoseSelect={setPoseKeywords}
                                                customPoseImage={poseImage}
                                                onCustomPoseImage={setPoseImage}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer - Generate Button */}
                    <div className="border-t border-white/5 bg-gradient-to-t from-[#060608] to-[#0a0a0f] p-4 space-y-3">
                        {/* Quick Actions */}
                        <div className="flex items-center justify-center">
                            <button type="button" onClick={handleReset} className="flex items-center gap-2 text-xs text-text-muted hover:text-text transition-colors group">
                                <div className="p-1.5 rounded-lg bg-white/[0.03] group-hover:bg-white/[0.06] transition-colors">
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </div>
                                <span>Reset All</span>
                            </button>
                        </div>
                        
                        {/* Generate Button - Premium Style */}
                        <Button
                            onClick={handleGenerateSprite}
                            disabled={!prompt.trim() || isGenerating}
                            className="w-full h-12 text-sm font-bold bg-gradient-to-r from-primary via-primary to-primary-500 hover:from-primary-500 hover:via-primary hover:to-primary text-primary-foreground shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 rounded-xl border border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 animate-spin" />
                                    Generating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Wand2 className="w-4 h-4" />
                                    Generate Sprite
                                </span>
                            )}
                        </Button>
                        
                        {/* Cost indicator */}
                        <p className="text-center text-[10px] text-text-dim">
                            <span className="text-primary font-medium">5 credits</span> per generation
                        </p>
                    </div>
                </div>

                {/* Collapse Button & Resize Handle */}
                <div className="relative z-20 flex items-stretch">
                    {/* Collapse Button */}
                    <button
                        onClick={() => setPanelCollapsed(!panelCollapsed)}
                        className="w-5 bg-[#0a0a0c] hover:bg-[#1a1a1f] border-r border-white/5 flex items-center justify-center transition-all duration-200 group"
                    >
                        <ChevronLeft className={`w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-all duration-300 ${panelCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Resize Handle */}
                    {!panelCollapsed && (
                        <div
                            onMouseDown={() => setIsDragging(true)}
                            className="w-px bg-white/5 hover:bg-primary/50 cursor-col-resize transition-colors active:bg-primary relative group"
                        >
                            <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-0.5 h-4 bg-primary/40 rounded-full" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel - Viewport */}
                <div className="flex-1 bg-background relative flex flex-col overflow-hidden">
                    {/* Viewport Header */}
                            <div className="h-12 border-b border-white/5 flex items-center justify-between px-5 bg-[#0a0a0c]">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-xs font-medium text-text">Preview</span>
                                    </div>
                                    <div className="h-4 w-px bg-white/10" />
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={handleZoomOut}
                                            disabled={zoomLevel <= 50}
                                            className="p-1 rounded hover:bg-white/[0.05] text-text-muted hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <span className="text-xs font-bold">−</span>
                                        </button>
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5 min-w-[70px] justify-center">
                                            <span className="text-[10px] font-mono text-primary font-semibold">{zoomLevel}%</span>
                                        </div>
                                        <button 
                                            onClick={handleZoomIn}
                                            disabled={zoomLevel >= 200}
                                            className="p-1 rounded hover:bg-white/[0.05] text-text-muted hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <span className="text-xs font-bold">+</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Tooltip content={showGrid ? "Hide grid" : "Show grid"} side="bottom">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => setShowGrid(!showGrid)}
                                            className={`w-8 h-8 rounded-lg hover:bg-white/[0.05] transition-colors ${showGrid ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-primary'}`}
                                        >
                                            <Grid3x3 className="w-4 h-4" />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content={isFullscreen ? "Exit fullscreen" : "Fullscreen"} side="bottom">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={toggleFullscreen}
                                            className={`w-8 h-8 rounded-lg hover:bg-white/[0.05] transition-colors ${isFullscreen ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-primary'}`}
                                        >
                                            <Maximize className="w-4 h-4" />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Canvas Area */}
                            <div className="flex-1 overflow-auto flex items-center justify-center relative bg-[#09090b]">
                                {showGrid && (
                                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                                )}

                                {/* Error Display */}
                                {generationError && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-md">
                                        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
                                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                            <p className="text-sm text-red-400">{generationError}</p>
                                            <button onClick={() => setGenerationError(null)} className="p-1 hover:bg-red-500/20 rounded-lg transition-colors">
                                                <X className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Loading State */}
                                {isGenerating && (
                                    <div className="text-center space-y-4">
                                        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto animate-pulse">
                                            <Sparkles className="w-8 h-8 text-primary animate-spin" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-text">Generating your sprite...</p>
                                            <p className="text-xs text-text-muted">This may take 10-30 seconds</p>
                                        </div>
                                    </div>
                                )}

                                {!isGenerating && previewImages.length === 0 && !generationError && (
                                    <div className="text-center space-y-4 max-w-xs opacity-50">
                                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mx-auto shadow-lg shadow-primary/10">
                                            <Command className="w-6 h-6 text-primary" />
                                        </div>
                                        <p className="text-sm text-text-muted font-medium">Configure settings and generate to see results</p>
                                    </div>
                                )}
                                
                                {!isGenerating && previewImages.length > 0 && (
                                    <div 
                                        className="grid grid-cols-2 gap-8 p-12 w-full max-w-4xl animate-in fade-in zoom-in duration-300 transition-transform origin-center"
                                        style={{ transform: `scale(${zoomLevel / 100})` }}
                                    >
                                        {previewImages.map((img, index) => (
                                            <div
                                                key={index}
                                                onClick={() => setSelectedPreview(index)}
                                                className={`group relative aspect-square bg-surface rounded-xl border transition-all duration-200 cursor-pointer ${
                                                    selectedPreview === index
                                                        ? 'border-primary shadow-lg shadow-primary/30'
                                                        : 'border-primary/15 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20'
                                                }`}
                                            >
                                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/30 rounded-tl-lg m-2" />
                                                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/30 rounded-tr-lg m-2" />
                                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/30 rounded-bl-lg m-2" />
                                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/30 rounded-br-lg m-2" />
                                                <div className="absolute inset-4 flex items-center justify-center">
                                                    <img src={img} alt="Generated Sprite" className="w-full h-full object-contain pixelated" style={{ imageRendering: 'pixelated' }} />
                                                </div>
                                                <div className={`absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center transition-all ${selectedPreview === index ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur rounded-lg p-1 border border-primary/20">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="w-6 h-6 rounded hover:bg-primary/20 text-primary transition-colors"
                                                        onClick={(e) => { e.stopPropagation(); setZoomedImage(img); }}
                                                    >
                                                        <ZoomIn className="w-3 h-3" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="w-6 h-6 rounded hover:bg-primary/20 text-primary transition-colors"
                                                        onClick={(e) => { e.stopPropagation(); handleDownload(img, index); }}
                                                    >
                                                        <Download className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Zoomed Image Modal */}
                                {zoomedImage && (
                                    <div 
                                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8"
                                        onClick={() => setZoomedImage(null)}
                                    >
                                        <button 
                                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                            onClick={() => setZoomedImage(null)}
                                        >
                                            <X className="w-6 h-6 text-white" />
                                        </button>
                                        <img 
                                            src={zoomedImage} 
                                            alt="Zoomed Sprite" 
                                            className="max-w-full max-h-full object-contain rounded-xl border border-white/10"
                                            style={{ imageRendering: 'pixelated' }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                )}
                            </div>

                    {/* Fixed Floating Action Button */}
                    {selectedPreview !== null && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-md border border-primary/15 rounded-full pl-4 pr-1.5 py-1.5 flex items-center gap-4 shadow-lg shadow-primary/20 animate-in slide-in-from-bottom-4 z-10">
                            <span className="text-xs font-medium text-text">Variant {selectedPreview + 1} selected</span>
                            <Button
                                onClick={handleCreateProject}
                                size="sm"
                                className="h-7 rounded-full bg-primary text-primary-foreground hover:bg-primary-600 font-semibold text-xs px-4 shadow-lg shadow-primary/30 flex items-center gap-1.5"
                            >
                                {projectId ? (
                                    <>
                                        <Plus className="w-3.5 h-3.5" />
                                        Add to Project
                                    </>
                                ) : (
                                    <>
                                        <FolderPlus className="w-3.5 h-3.5" />
                                        Create Project
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function GenerateSpritePage() {
    return (
        <AuthGuard>
            <Suspense fallback={<div className="h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>}>
                <GenerateSpritePageContent />
            </Suspense>
        </AuthGuard>
    );
}
