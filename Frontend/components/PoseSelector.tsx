"use client";

import { useState } from "react";
import { Check, Upload, X, Sparkles } from "lucide-react";
import nextDynamic from "next/dynamic";

// Lazy load 3D editor for advanced users
const PoseEditor = nextDynamic(() => import("@/components/pose-editor/PoseEditor"), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-text-muted">Loading 3D Editor...</div>
});

// Pose categories with pre-defined poses
const POSE_CATEGORIES = [
    {
        name: "Standing",
        poses: [
            { id: "idle", name: "Idle", keywords: "standing idle relaxed neutral pose" },
            { id: "heroic", name: "Heroic", keywords: "heroic confident standing power pose arms crossed" },
            { id: "casual", name: "Casual", keywords: "casual relaxed standing hand on hip" },
            { id: "alert", name: "Alert", keywords: "alert ready standing defensive pose" },
        ]
    },
    {
        name: "Action",
        poses: [
            { id: "running", name: "Running", keywords: "running sprinting fast movement action" },
            { id: "jumping", name: "Jumping", keywords: "jumping leaping mid-air action" },
            { id: "attacking", name: "Attacking", keywords: "attacking sword swing punch action combat" },
            { id: "blocking", name: "Blocking", keywords: "blocking defending shield guard pose" },
        ]
    },
    {
        name: "Combat",
        poses: [
            { id: "fighting", name: "Fighting Stance", keywords: "fighting stance combat ready martial arts" },
            { id: "casting", name: "Casting Spell", keywords: "casting magic spell wizard mage hands raised" },
            { id: "shooting", name: "Aiming", keywords: "aiming bow arrow gun shooting ranged" },
            { id: "crouching", name: "Crouching", keywords: "crouching sneaking stealth low pose" },
        ]
    },
    {
        name: "Movement",
        poses: [
            { id: "walking", name: "Walking", keywords: "walking strolling movement casual pace" },
            { id: "climbing", name: "Climbing", keywords: "climbing ladder wall reaching up" },
            { id: "falling", name: "Falling", keywords: "falling dropping mid-air arms spread" },
            { id: "rolling", name: "Rolling", keywords: "rolling dodge tumble acrobatic" },
        ]
    },
    {
        name: "Expressions",
        poses: [
            { id: "sitting", name: "Sitting", keywords: "sitting seated resting chair" },
            { id: "kneeling", name: "Kneeling", keywords: "kneeling praying one knee down" },
            { id: "waving", name: "Waving", keywords: "waving greeting hello hand raised" },
            { id: "pointing", name: "Pointing", keywords: "pointing directing finger extended" },
        ]
    },
];

interface PoseSelectorProps {
    selectedPose: string | null;
    onPoseSelect: (poseKeywords: string | null) => void;
    customPoseImage: string | null;
    onCustomPoseImage: (image: string | null) => void;
}

export function PoseSelector({ selectedPose, onPoseSelect, customPoseImage, onCustomPoseImage }: PoseSelectorProps) {
    const [activeCategory, setActiveCategory] = useState(0);
    const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
    const [uploadedReference, setUploadedReference] = useState<string | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setUploadedReference(result);
                onCustomPoseImage(result);
                onPoseSelect(null); // Clear preset selection
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePoseSelect = (pose: { id: string; keywords: string }) => {
        onPoseSelect(pose.keywords);
        setUploadedReference(null);
        onCustomPoseImage(null);
    };

    const clearSelection = () => {
        onPoseSelect(null);
        setUploadedReference(null);
        onCustomPoseImage(null);
    };

    // Show 3D editor fullscreen
    if (showAdvancedEditor) {
        return (
            <div className="fixed inset-0 z-50 bg-black">
                <PoseEditor
                    onSave={(dataUrl) => {
                        onCustomPoseImage(dataUrl);
                        onPoseSelect(null);
                        setShowAdvancedEditor(false);
                    }}
                    onCancel={() => setShowAdvancedEditor(false)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Selected Pose Preview */}
            {(selectedPose || customPoseImage || uploadedReference) && (
                <div className="relative p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary" />
                            <span className="text-xs font-medium text-primary">
                                {customPoseImage ? "Custom 3D Pose" : uploadedReference ? "Pose Image" : "Pose Selected"}
                            </span>
                        </div>
                        <button onClick={clearSelection} className="p-1 hover:bg-white/10 rounded transition-colors">
                            <X className="w-3.5 h-3.5 text-primary" />
                        </button>
                    </div>
                    {(customPoseImage || uploadedReference) && (
                        <div className="mt-2 relative aspect-square w-full max-w-[120px] mx-auto rounded-lg overflow-hidden border border-white/10">
                            <img src={customPoseImage || uploadedReference || ""} alt="Pose" className="w-full h-full object-contain bg-black/50" />
                        </div>
                    )}
                    {selectedPose && !customPoseImage && !uploadedReference && (
                        <p className="mt-2 text-[10px] text-primary/70 text-center">"{selectedPose}"</p>
                    )}
                </div>
            )}

            {/* Pose Categories */}
            <div className="space-y-3">
                {/* Category Tabs - Wrap to show all */}
                <div className="flex flex-wrap gap-1.5">
                    {POSE_CATEGORIES.map((cat, idx) => (
                        <button
                            key={cat.name}
                            onClick={() => setActiveCategory(idx)}
                            className={`px-2.5 py-1.5 text-[10px] font-medium rounded-lg transition-all ${
                                activeCategory === idx
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "bg-white/5 text-text-muted hover:text-white hover:bg-white/10 border border-transparent"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Pose Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {POSE_CATEGORIES[activeCategory].poses.map((pose) => (
                        <button
                            key={pose.id}
                            onClick={() => handlePoseSelect(pose)}
                            className={`relative p-3 rounded-xl text-left transition-all ${
                                selectedPose === pose.keywords
                                    ? "bg-primary/20 border-primary/40 border"
                                    : "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-medium ${selectedPose === pose.keywords ? "text-primary" : "text-white"}`}>
                                    {pose.name}
                                </span>
                                {selectedPose === pose.keywords && (
                                    <Check className="w-3.5 h-3.5 text-primary" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] text-text-dim uppercase">or</span>
                <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Custom Options */}
            <div className="grid grid-cols-2 gap-2">
                {/* Upload Pose Image */}
                <label className="relative p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer group">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                            <Upload className="w-4 h-4 text-text-muted group-hover:text-white" />
                        </div>
                        <span className="text-[10px] font-medium text-text-muted group-hover:text-white">Upload Pose</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                {/* 3D Editor */}
                <button
                    onClick={() => setShowAdvancedEditor(true)}
                    className="relative p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group"
                >
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="p-2 rounded-lg bg-accent-orange/10 group-hover:bg-accent-orange/20 transition-colors">
                            <Sparkles className="w-4 h-4 text-accent-orange" />
                        </div>
                        <span className="text-[10px] font-medium text-text-muted group-hover:text-white">3D Pose Editor</span>
                    </div>
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-accent-orange/20 rounded text-[8px] font-bold text-accent-orange">
                        PRO
                    </div>
                </button>
            </div>
        </div>
    );
}
