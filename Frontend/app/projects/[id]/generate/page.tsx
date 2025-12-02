"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GenerateLayout } from "@/components/generate/GenerateLayout";
import { AnimationGenerator } from "@/components/generate/AnimationGenerator";
import { SpriteSheetConverter } from "@/components/generate/SpriteSheetConverter";

// Mock Data
const SOURCE_SPRITE_URL = "https://opengameart.org/sites/default/files/knight_idle_spritesheet_0.png";
// Using a different sprite sheet for the "generated" result to show change
const GENERATED_SPRITE_SHEET_URL = "/mock-ninja-jump.png";

export default function GeneratePage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [step, setStep] = useState<'generate' | 'convert'>('generate');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

    const handleGenerate = async (type: 'preset' | 'custom', value: string) => {
        setIsGenerating(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setGeneratedUrl(GENERATED_SPRITE_SHEET_URL);
        setStep('convert');
        setIsGenerating(false);
    };

    const handleSave = (gifUrl: string) => {
        // In a real app, we would save the asset here
        console.log("Saving animation:", gifUrl);
        router.push(`/projects/${projectId}`);
    };

    return (
        <GenerateLayout projectId={projectId}>
            {step === 'generate' ? (
                <div className="flex h-full">
                    <AnimationGenerator
                        sourceSpriteUrl={SOURCE_SPRITE_URL}
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                    />

                    {/* Placeholder for the "Result" area before generation */}
                    <div className="flex-1 flex items-center justify-center bg-surface/10 p-8">
                        <div className="text-center space-y-4 max-w-md">
                            <div className="w-16 h-16 bg-surface-highlight rounded-2xl border border-primary/10 flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">✨</span>
                            </div>
                            <h2 className="text-xl font-semibold text-text">Ready to Animate</h2>
                            <p className="text-text-muted">
                                Select a preset or describe the animation you want to generate.
                                Our AI will create a sprite sheet based on your source character.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <SpriteSheetConverter
                    spriteSheetUrl={generatedUrl!}
                    onSave={handleSave}
                />
            )}
        </GenerateLayout>
    );
}
