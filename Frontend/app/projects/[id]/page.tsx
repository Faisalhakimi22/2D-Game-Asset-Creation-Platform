"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    Plus, Download, Sparkles, ArrowLeft, Calendar, User, 
    Palette, Eye, Grid3x3, Layers, Clock, ImageIcon, Map,
    Play, Pause, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/AuthGuard";
import { AppSidebar } from "@/components/AppSidebar";
import { auth } from "@/lib/firebase";

interface Asset {
    id: string;
    name: string;
    asset_type: string;
    blob_url: string;
    created_at: { _seconds: number };
    metadata: {
        prompt?: string;
        style?: string;
        viewpoint?: string;
        dimensions?: string;
        colors?: string[];
        sprite_type?: string;
        scene_type?: string;
        animation_type?: string;
        direction?: string;
        frame_count?: number;
        user_name?: string;
        [key: string]: any;
    };
}

interface Project {
    id: string;
    title: string;
    type: "sprite" | "scene";
    description?: string;
    created_at: { _seconds: number };
    settings?: {
        style?: string;
        viewpoint?: string;
        [key: string]: any;
    };
}

export default function ProjectPage() {
    return (
        <AuthGuard>
            <ProjectPageContent />
        </AuthGuard>
    );
}

function ProjectPageContent() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch project and assets
    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;
                const idToken = await user.getIdToken();

                // Fetch project details
                const projectRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/projects/${projectId}`,
                    { headers: { Authorization: `Bearer ${idToken}` } }
                );
                
                if (projectRes.ok) {
                    const projectData = await projectRes.json();
                    setProject(projectData.project);
                }

                // Fetch assets for this project
                const assetsRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/generate/history?projectId=${projectId}`,
                    { headers: { Authorization: `Bearer ${idToken}` } }
                );
                
                if (assetsRes.ok) {
                    const assetsData = await assetsRes.json();
                    setAssets(assetsData.assets || []);
                    if (assetsData.assets?.length > 0) {
                        setSelectedAsset(assetsData.assets[0]);
                    }
                }
            } catch (err: any) {
                console.error("Failed to fetch project data:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [projectId]);

    const formatDate = (timestamp: { _seconds: number } | undefined) => {
        if (!timestamp) return "Unknown";
        return new Date(timestamp._seconds * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <div className="h-screen flex bg-[#050506]">
                <AppSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-[#050506] overflow-hidden">
            <AppSidebar />
            
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0c]">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.push("/projects")}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 text-text-muted" />
                        </button>
                        <div>
                            <h1 className="text-sm font-semibold text-white">
                                {project?.title || `Project #${projectId}`}
                            </h1>
                            <p className="text-[10px] text-text-muted">
                                {assets.length} assets • {project?.type || "sprite"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(project?.type === "scene" ? "/scenes" : "/sprites")}
                            className="gap-2 text-xs"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Asset
                        </Button>
                        <Button size="sm" className="gap-2 text-xs">
                            <Download className="w-3.5 h-3.5" />
                            Export All
                        </Button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Assets List Sidebar */}
                    <div className="w-64 border-r border-white/5 bg-[#060608] flex flex-col">
                        <div className="p-4 border-b border-white/5">
                            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Assets ({assets.length})
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {assets.length === 0 ? (
                                <div className="p-4 text-center">
                                    <ImageIcon className="w-8 h-8 text-text-dim mx-auto mb-2" />
                                    <p className="text-xs text-text-muted">No assets yet</p>
                                </div>
                            ) : (
                                assets.map((asset) => (
                                    <button
                                        key={asset.id}
                                        onClick={() => setSelectedAsset(asset)}
                                        className={`w-full p-2 rounded-lg flex items-center gap-3 transition-all ${
                                            selectedAsset?.id === asset.id
                                                ? "bg-primary/20 border border-primary/30"
                                                : "hover:bg-white/5 border border-transparent"
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-black/30 border border-white/10 overflow-hidden flex-shrink-0">
                                            <img
                                                src={asset.blob_url}
                                                alt={asset.name}
                                                className="w-full h-full object-cover"
                                                style={{ imageRendering: "pixelated" }}
                                            />
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className={`text-xs font-medium truncate ${
                                                selectedAsset?.id === asset.id ? "text-primary" : "text-text"
                                            }`}>
                                                {asset.name || asset.asset_type}
                                            </p>
                                            <p className="text-[10px] text-text-dim">
                                                {asset.asset_type}
                                            </p>
                                        </div>
                                        <ChevronRight className={`w-3 h-3 flex-shrink-0 ${
                                            selectedAsset?.id === asset.id ? "text-primary" : "text-text-dim"
                                        }`} />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Content - Asset Preview */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {selectedAsset ? (
                            <>
                                {/* Preview Area */}
                                <div className="flex-1 flex items-center justify-center p-8 bg-[#09090b]">
                                    <div className="relative max-w-lg max-h-full">
                                        <div className="rounded-2xl bg-black/50 border border-white/10 overflow-hidden p-4">
                                            <img
                                                src={selectedAsset.blob_url}
                                                alt={selectedAsset.name}
                                                className="max-w-full max-h-[400px] object-contain mx-auto"
                                                style={{ imageRendering: "pixelated" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <ImageIcon className="w-12 h-12 text-text-dim mx-auto mb-3" />
                                    <p className="text-sm text-text-muted">Select an asset to view details</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Details Panel */}
                    <div className="w-80 border-l border-white/5 bg-[#060608] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-white/5">
                            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Asset Details
                            </h2>
                        </div>
                        
                        {selectedAsset ? (
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                                {/* Basic Info */}
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
                                        Basic Info
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                                            <Layers className="w-3.5 h-3.5 text-primary" />
                                            <span className="text-[10px] text-text-muted">Type:</span>
                                            <span className="text-xs text-text ml-auto capitalize">
                                                {selectedAsset.asset_type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                                            <Calendar className="w-3.5 h-3.5 text-primary" />
                                            <span className="text-[10px] text-text-muted">Created:</span>
                                            <span className="text-xs text-text ml-auto">
                                                {formatDate(selectedAsset.created_at)}
                                            </span>
                                        </div>
                                        {selectedAsset.metadata?.user_name && (
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                                                <User className="w-3.5 h-3.5 text-primary" />
                                                <span className="text-[10px] text-text-muted">Creator:</span>
                                                <span className="text-xs text-text ml-auto truncate max-w-[120px]">
                                                    {selectedAsset.metadata.user_name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Generation Details */}
                                {selectedAsset.metadata?.prompt && (
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
                                            Prompt
                                        </h3>
                                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                            <p className="text-xs text-text-muted leading-relaxed">
                                                {selectedAsset.metadata.prompt}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Style Settings */}
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
                                        Settings
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedAsset.metadata?.style && (
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                                                <Grid3x3 className="w-3.5 h-3.5 text-accent-cyan" />
                                                <span className="text-[10px] text-text-muted">Style:</span>
                                                <span className="text-xs text-text ml-auto capitalize">
                                                    {selectedAsset.metadata.style.replace("_", " ")}
                                                </span>
                                            </div>
                                        )}
                                        {selectedAsset.metadata?.viewpoint && (
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                                                <Eye className="w-3.5 h-3.5 text-accent-cyan" />
                                                <span className="text-[10px] text-text-muted">View:</span>
                                                <span className="text-xs text-text ml-auto capitalize">
                                                    {selectedAsset.metadata.viewpoint.replace("_", " ")}
                                                </span>
                                            </div>
                                        )}
                                        {selectedAsset.metadata?.dimensions && (
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                                                <ImageIcon className="w-3.5 h-3.5 text-accent-cyan" />
                                                <span className="text-[10px] text-text-muted">Size:</span>
                                                <span className="text-xs text-text ml-auto">
                                                    {selectedAsset.metadata.dimensions}
                                                </span>
                                            </div>
                                        )}
                                        {selectedAsset.metadata?.direction && (
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                                                <ChevronRight className="w-3.5 h-3.5 text-accent-cyan" />
                                                <span className="text-[10px] text-text-muted">Direction:</span>
                                                <span className="text-xs text-text ml-auto capitalize">
                                                    {selectedAsset.metadata.direction.replace("_", " ")}
                                                </span>
                                            </div>
                                        )}
                                        {selectedAsset.metadata?.animation_type && (
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                                                <Play className="w-3.5 h-3.5 text-accent-cyan" />
                                                <span className="text-[10px] text-text-muted">Animation:</span>
                                                <span className="text-xs text-text ml-auto">
                                                    {selectedAsset.metadata.animation_type}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Colors */}
                                {selectedAsset.metadata?.colors && selectedAsset.metadata.colors.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
                                            Color Palette
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedAsset.metadata.colors.map((color, i) => (
                                                <div
                                                    key={i}
                                                    className="w-8 h-8 rounded-lg border border-white/10"
                                                    style={{ backgroundColor: color }}
                                                    title={color}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="pt-4 border-t border-white/5 space-y-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-2 text-xs"
                                        onClick={() => {
                                            const a = document.createElement("a");
                                            a.href = selectedAsset.blob_url;
                                            a.download = `${selectedAsset.name || "asset"}.png`;
                                            a.click();
                                        }}
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download Asset
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-4">
                                <p className="text-xs text-text-dim text-center">
                                    Select an asset to view its details
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
