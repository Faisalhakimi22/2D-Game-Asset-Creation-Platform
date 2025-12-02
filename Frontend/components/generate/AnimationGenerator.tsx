import { useState } from "react";
import { Sparkles, Zap, Type, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AnimationGeneratorProps {
    sourceSpriteUrl: string;
    onGenerate: (type: 'preset' | 'custom', value: string) => void;
    isGenerating: boolean;
}

const PRESETS = [
    { id: "idle", label: "Idle", icon: "🧍" },
    { id: "walk", label: "Walk", icon: "🚶" },
    { id: "run", label: "Run", icon: "🏃" },
    { id: "jump", label: "Jump", icon: "⬆️" },
    { id: "attack", label: "Attack", icon: "⚔️" },
    { id: "hit", label: "Get Hit", icon: "💥" },
    { id: "death", label: "Death", icon: "💀" },
    { id: "climb", label: "Climb", icon: "🧗" },
];

export function AnimationGenerator({ sourceSpriteUrl, onGenerate, isGenerating }: AnimationGeneratorProps) {
    const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [customPrompt, setCustomPrompt] = useState("");

    const handleGenerate = () => {
        if (activeTab === 'preset' && selectedPreset) {
            onGenerate('preset', selectedPreset);
        } else if (activeTab === 'custom' && customPrompt) {
            onGenerate('custom', customPrompt);
        }
    };

    const isValid = (activeTab === 'preset' && selectedPreset) || (activeTab === 'custom' && customPrompt.length > 0);

    return (
        <div className="flex flex-col h-full bg-surface/30 border-r border-primary/10 w-full sm:w-80">
            <div className="p-4 sm:p-6 border-b border-primary/10">
                <h2 className="text-xs sm:text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 sm:mb-4">Source Sprite</h2>
                <div className="aspect-square w-full bg-surface-highlight rounded-lg border border-primary/10 overflow-hidden flex items-center justify-center p-3 sm:p-4">
                    <img
                        src={sourceSpriteUrl}
                        alt="Source"
                        className="max-w-full max-h-full object-contain image-pixelated"
                    />
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center p-1.5 sm:p-2 m-3 sm:m-4 bg-surface rounded-lg border border-primary/10">
                    <button
                        onClick={() => setActiveTab('preset')}
                        className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${activeTab === 'preset'
                                ? "bg-primary/10 text-primary shadow-sm"
                                : "text-text-muted hover:text-text hover:bg-surface-highlight"
                            }`}
                    >
                        <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Presets
                    </button>
                    <button
                        onClick={() => setActiveTab('custom')}
                        className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${activeTab === 'custom'
                                ? "bg-primary/10 text-primary shadow-sm"
                                : "text-text-muted hover:text-text hover:bg-surface-highlight"
                            }`}
                    >
                        <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Custom
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 custom-scrollbar">
                    {activeTab === 'preset' ? (
                        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                            {PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => setSelectedPreset(preset.id)}
                                    className={`flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-lg border transition-all ${selectedPreset === preset.id
                                            ? "bg-primary/10 border-primary text-primary ring-1 ring-primary/20"
                                            : "bg-surface border-primary/10 text-text hover:border-primary/30 hover:bg-surface-highlight"
                                        }`}
                                >
                                    <span className="text-xl sm:text-2xl">{preset.icon}</span>
                                    <span className="text-[10px] sm:text-xs font-medium">{preset.label}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] sm:text-xs text-text-muted">Animation Description</Label>
                                <textarea
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    placeholder="Describe the animation (e.g., 'A powerful sword slash with blue trails')..."
                                    className="w-full h-24 sm:h-32 p-2.5 sm:p-3 rounded-lg bg-surface border border-primary/20 text-xs sm:text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                            </div>
                            <div className="p-2.5 sm:p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] sm:text-xs text-blue-200">
                                <p className="flex items-center gap-1.5 sm:gap-2 mb-1 font-semibold">
                                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    Pro Tip
                                </p>
                                Be specific about the motion and effects you want to see.
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 sm:p-6 border-t border-primary/10 bg-surface/50">
                    <Button
                        className="w-full"
                        size="lg"
                        disabled={!isValid || isGenerating}
                        onClick={handleGenerate}
                    >
                        {isGenerating ? (
                            <>
                                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                                <span className="text-xs sm:text-sm">Generating...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                                <span className="text-xs sm:text-sm">Generate Animation</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
