"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpritePreviewLayout } from "@/components/sprite-preview/SpritePreviewLayout";
import { SpriteViewer } from "@/components/sprite-preview/SpriteViewer";
import { SpriteMetadata } from "@/components/sprite-preview/SpriteMetadata";
import { AnimationGallery } from "@/components/sprite-preview/AnimationGallery";

// Mock Data - Base sprite URL
const MOCK_SPRITE_URL = "https://opengameart.org/sites/default/files/knight_idle_spritesheet_0.png";

const MOCK_ANIMATIONS = [
    { id: "sprite", name: "Sprite", thumbnailUrl: MOCK_SPRITE_URL },
    { id: "idle", name: "Idle", thumbnailUrl: "https://opengameart.org/sites/default/files/knight_idle_spritesheet_0.png" },
    { id: "walk", name: "Walk", thumbnailUrl: "https://opengameart.org/sites/default/files/knight_walk_spritesheet.png" },
    { id: "run", name: "Run", thumbnailUrl: "https://opengameart.org/sites/default/files/knight_run_spritesheet.png" },
    { id: "attack", name: "Attack", thumbnailUrl: "https://opengameart.org/sites/default/files/knight_attack_spritesheet.png" },
    { id: "jump", name: "Jump", thumbnailUrl: "https://opengameart.org/sites/default/files/knight_jump_spritesheet.png" },
    { id: "death", name: "Death", thumbnailUrl: "https://opengameart.org/sites/default/files/knight_death_spritesheet.png" },
];

// Mock project data to determine type
const MOCK_PROJECTS = [
    { id: "8842", title: "Cyberpunk City", type: "scene" },
    { id: "9120", title: "Hero Idle Animation", type: "sprite" },
    { id: "7731", title: "Forest Tileset", type: "sprite" },
    { id: "6654", title: "Dungeon Level 1", type: "scene" },
    { id: "5521", title: "NPC Merchant", type: "sprite" },
    { id: "4419", title: "Space Background", type: "scene" },
];

export default function ProjectPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [selectedAnimationId, setSelectedAnimationId] = useState("sprite");
    const [isPlaying, setIsPlaying] = useState(true);

    // Determine project type and redirect if it's a scene
    useEffect(() => {
        const project = MOCK_PROJECTS.find(p => p.id === projectId);
        if (project && project.type === "scene") {
            router.replace(`/scenes/preview?projectId=${projectId}`);
        }
    }, [projectId, router]);

    const currentAnimation = MOCK_ANIMATIONS.find(a => a.id === selectedAnimationId) || MOCK_ANIMATIONS[0];

    const handleGenerate = () => {
        router.push(`/projects/${projectId}/generate`);
    };

    const handleEdit = () => {
        console.log("Edit sprite clicked");
    };

    const handleExport = (format: 'png' | 'gif') => {
        console.log(`Export as ${format} clicked`);
    };

    const handleNewProject = () => {
        router.push("/sprites");
    };

    const headerActions = (
        <div className="flex items-center gap-3">
            <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-primary/20 hover:bg-surface-highlight hover:text-primary gap-2"
                onClick={handleNewProject}
            >
                <Plus className="w-3.5 h-3.5" />
                New Project
            </Button>
            <Button
                size="sm"
                className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary-600 gap-2 shadow-lg shadow-primary/20"
                onClick={() => handleExport('png')}
            >
                <Download className="w-3.5 h-3.5" />
                Export Sprite
            </Button>
        </div>
    );

    return (
        <SpritePreviewLayout title="Hero Character" projectId={projectId} actions={headerActions}>
            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                {/* Left Sidebar: Animations List - Hidden on mobile, shown on large screens */}
                <div className="hidden lg:flex lg:w-64 border-r border-primary/10 bg-surface/30 flex-col">
                    <div className="p-4 flex-1 overflow-hidden flex flex-col">
                        <AnimationGallery
                            animations={MOCK_ANIMATIONS}
                            selectedId={selectedAnimationId}
                            onSelect={setSelectedAnimationId}
                            variant="sidebar"
                        />
                    </div>
                </div>

                {/* Center: Main Preview Stage */}
                <div className="flex-1 p-4 lg:p-8 flex items-center justify-center min-w-0 bg-gradient-to-br from-background via-background to-surface/20 overflow-auto">
                    <div className="w-full max-w-4xl aspect-video">
                        <SpriteViewer
                            imageUrl={currentAnimation.thumbnailUrl}
                            isPlaying={isPlaying}
                            onTogglePlay={() => setIsPlaying(!isPlaying)}
                        />
                    </div>
                </div>

                {/* Right Sidebar: Inspector - Collapsible on mobile */}
                <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-primary/10 bg-surface/30 flex flex-col max-h-[40vh] lg:max-h-none">
                    <div className="p-4 lg:p-6 overflow-y-auto flex-1">
                        <div className="space-y-6 lg:space-y-8">
                            <div className="space-y-3 lg:space-y-4">
                                <h3 className="text-xs lg:text-sm font-semibold text-text-muted uppercase tracking-wider">Details</h3>
                                <div className="p-3 lg:p-4 rounded-xl bg-surface border border-primary/10 shadow-sm">
                                    <SpriteMetadata
                                        name="Hero Character"
                                        createdAt="2024-03-09"
                                        dimensions="32x32"
                                        frameCount={8}
                                        size="12 KB"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 lg:space-y-4">
                                <h3 className="text-xs lg:text-sm font-semibold text-text-muted uppercase tracking-wider">Actions</h3>
                                <div className="p-3 lg:p-4 rounded-xl bg-surface border border-primary/10 shadow-sm">
                                    <Button
                                        size="lg"
                                        onClick={handleGenerate}
                                        className="w-full"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate Animation
                                    </Button>
                                </div>
                            </div>

                            {/* Mobile Animation List */}
                            <div className="lg:hidden space-y-3">
                                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Animations</h3>
                                <AnimationGallery
                                    animations={MOCK_ANIMATIONS}
                                    selectedId={selectedAnimationId}
                                    onSelect={setSelectedAnimationId}
                                    variant="grid"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SpritePreviewLayout>
    );
}
