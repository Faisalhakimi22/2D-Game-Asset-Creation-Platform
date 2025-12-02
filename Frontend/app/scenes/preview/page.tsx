"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Download,
    Sparkles,
    Layers,
    Maximize,
    Check,
    Plus,
    Wand2,
    FileCode,
    MonitorPlay,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SpritePreviewLayout } from "@/components/sprite-preview/SpritePreviewLayout";

// Mock Data Types
type SceneVariant = {
    id: string;
    imageUrl: string;
    timestamp: string;
};

type SceneProject = {
    id: string;
    name: string;
    createdAt: string;
    resolution: string;
    style: string;
    viewpoint: string;
    variants: SceneVariant[];
};

export const dynamic = "force-dynamic";

export default function ScenePreviewPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get("projectId");

    // State
    const [project, setProject] = useState<SceneProject | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(360);

    // Mock Data Loading
    useEffect(() => {
        // Simulate fetching project data
        const mockProject: SceneProject = {
            id: projectId || "demo-123",
            name: "Mystic Forest Clearing",
            createdAt: new Date().toLocaleDateString(),
            resolution: "1024x1024",
            style: "Pixel Art",
            viewpoint: "Isometric",
            variants: [
                { id: "v1", imageUrl: `https://picsum.photos/seed/scene1/800/600`, timestamp: "10:23 AM" },
                { id: "v2", imageUrl: `https://picsum.photos/seed/scene2/800/600`, timestamp: "10:25 AM" },
                { id: "v3", imageUrl: `https://picsum.photos/seed/scene3/800/600`, timestamp: "10:28 AM" },
                { id: "v4", imageUrl: `https://picsum.photos/seed/scene4/800/600`, timestamp: "10:30 AM" },
            ],
        };

        setProject(mockProject);
        setSelectedVariantId(mockProject.variants[0].id);
    }, [projectId]);

    const selectedVariant = project?.variants.find((v) => v.id === selectedVariantId);

    const handleGenerateVariant = () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);

        // Simulate generation
        setTimeout(() => {
            const newVariant: SceneVariant = {
                id: `v${Date.now()}`,
                imageUrl: `https://picsum.photos/seed/${Math.random()}/800/600`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setProject((prev) => prev ? {
                ...prev,
                variants: [newVariant, ...prev.variants]
            } : null);
            setSelectedVariantId(newVariant.id);
            setIsGenerating(false);
            setPrompt("");
        }, 2000);
    };

    const handleExport = () => {
        // Mock export functionality
        alert("Exporting scene to Game Engine format...");
    };

    if (!project) return <div className="min-h-screen bg-background flex items-center justify-center text-text-muted">Loading Project...</div>;

    const headerActions = (
        <div className="flex items-center gap-3">
            <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-primary/20 hover:bg-surface-highlight hover:text-primary gap-2"
                onClick={() => router.push("/scenes")}
            >
                <Plus className="w-3.5 h-3.5" />
                New Project
            </Button>
            <Button
                size="sm"
                className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary-600 gap-2 shadow-lg shadow-primary/20"
                onClick={handleExport}
            >
                <Download className="w-3.5 h-3.5" />
                Export Scene
            </Button>
        </div>
    );

    return (
        <SpritePreviewLayout
            title={project.name}
            projectId={project.id}
            backLink={projectId ? "/projects" : "/scenes"}
            actions={headerActions}
        >
            <div className="flex-1 w-full flex overflow-hidden">
                {/* Left Panel - Metadata & Edit */}
                <div
                    style={{ width: `${sidebarWidth}px` }}
                    className="bg-surface border-r border-primary/15 flex flex-col overflow-hidden relative z-10"
                >
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">

                        {/* Metadata Section */}
                        <div className="space-y-4">
                            <Label className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono flex items-center gap-2">
                                <FileCode className="w-3 h-3" />
                                Project Metadata
                            </Label>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg bg-surface-highlight/30 border border-primary/10 space-y-1">
                                    <span className="text-[10px] text-text-muted block">Resolution</span>
                                    <span className="text-xs font-mono text-text">{project.resolution}</span>
                                </div>
                                <div className="p-3 rounded-lg bg-surface-highlight/30 border border-primary/10 space-y-1">
                                    <span className="text-[10px] text-text-muted block">Created</span>
                                    <span className="text-xs font-mono text-text">{project.createdAt}</span>
                                </div>
                                <div className="p-3 rounded-lg bg-surface-highlight/30 border border-primary/10 space-y-1">
                                    <span className="text-[10px] text-text-muted block">Style</span>
                                    <span className="text-xs font-medium text-text">{project.style}</span>
                                </div>
                                <div className="p-3 rounded-lg bg-surface-highlight/30 border border-primary/10 space-y-1">
                                    <span className="text-[10px] text-text-muted block">Viewpoint</span>
                                    <span className="text-xs font-medium text-text">{project.viewpoint}</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[1px] bg-primary/10" />

                        {/* Edit / Generate Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-primary" />
                                    Edit Scene
                                </Label>
                            </div>

                            <div className="space-y-3">
                                <div className="relative">
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe changes or new elements (e.g., 'Add a mystical glowing tree in the center')..."
                                        className="w-full h-32 p-3 text-xs bg-surface-highlight/50 border border-primary/25 rounded-lg resize-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-text-muted font-medium leading-relaxed"
                                    />
                                    <div className="absolute bottom-2 right-2 text-[10px] text-text-muted font-mono opacity-60">
                                        {prompt.length}/500
                                    </div>
                                </div>

                                <Button
                                    onClick={handleGenerateVariant}
                                    disabled={!prompt.trim() || isGenerating}
                                    className="w-full h-9 text-xs font-semibold bg-primary hover:bg-primary-600 text-primary-foreground shadow-lg shadow-primary/30 transition-all"
                                >
                                    {isGenerating ? (
                                        <span className="flex items-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5 animate-spin" />
                                            Generating Variant...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Wand2 className="w-3.5 h-3.5" />
                                            Generate Variant
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="h-[1px] bg-primary/10" />

                        {/* Export Options Info */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono flex items-center gap-2">
                                <MonitorPlay className="w-3 h-3" />
                                Export Settings
                            </Label>
                            <div className="p-3 rounded-lg bg-surface-highlight/30 border border-primary/10 text-xs text-text-muted">
                                Exports include PNG sequence and JSON metadata compatible with Unity and Godot.
                            </div>
                        </div>

                    </div>
                </div>

                {/* Center Panel - Main Preview */}
                <div className="flex-1 bg-background relative flex items-center justify-center overflow-hidden">
                    {/* Grid Background */}
                    <div className="absolute inset-0 bg-[#09090b]">
                        <div className="absolute inset-0 opacity-[0.03]"
                            style={{
                                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                                backgroundSize: '20px 20px'
                            }}
                        />
                    </div>

                    {selectedVariant ? (
                        <div className="relative z-10 max-w-full max-h-full p-8 group">
                            <img
                                src={selectedVariant.imageUrl}
                                alt="Scene Preview"
                                className="max-w-full max-h-full object-contain shadow-2xl shadow-black/50"
                            />
                            {/* Overlay Actions */}
                            <div className="absolute top-12 right-12 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg bg-black/50 backdrop-blur text-white hover:bg-black/70 border border-white/10">
                                    <Maximize className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10 text-text-muted text-sm">Select a variant to preview</div>
                    )}
                </div>

                {/* Right Panel - Variants */}
                <div className="w-80 border-l border-primary/10 bg-surface/30 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-primary/10">
                        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider flex items-center gap-2">
                            <Layers className="w-3 h-3" />
                            Variants ({project.variants.length})
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                        <div className="space-y-3">
                            {project.variants.map((variant) => (
                                <button
                                    key={variant.id}
                                    onClick={() => setSelectedVariantId(variant.id)}
                                    className={`relative w-full aspect-video rounded-lg overflow-hidden border-2 transition-all group ${selectedVariantId === variant.id
                                        ? "border-primary shadow-lg shadow-primary/20"
                                        : "border-transparent hover:border-primary/50 opacity-70 hover:opacity-100"
                                        }`}
                                >
                                    <img
                                        src={variant.imageUrl}
                                        alt={`Variant ${variant.id}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {selectedVariantId === variant.id && (
                                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                            <div className="bg-primary text-primary-foreground rounded-full p-1">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-[10px] text-white py-1.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Variant {variant.id}</span>
                                            <span className="text-white/70">{variant.timestamp}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </SpritePreviewLayout>
    );
}
