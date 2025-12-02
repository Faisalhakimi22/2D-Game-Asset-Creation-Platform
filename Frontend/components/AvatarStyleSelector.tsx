"use client";

import { useState } from "react";
import { Avatar } from "./Avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AvatarStyleSelectorProps {
    currentSeed: string;
    onStyleSelect: (style: string) => void;
    selectedStyle?: string;
}

const AVATAR_STYLES = [
    { id: "avataaars", name: "Avataaars", description: "Cartoon-style avatars" },
    { id: "personas", name: "Personas", description: "Abstract human figures" },
    { id: "initials", name: "Initials", description: "Letter-based avatars" },
    { id: "bottts", name: "Bottts", description: "Robot-style avatars" },
];

export function AvatarStyleSelector({ 
    currentSeed, 
    onStyleSelect, 
    selectedStyle = "avataaars" 
}: AvatarStyleSelectorProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-text">Choose Avatar Style</h3>
            <div className="grid grid-cols-2 gap-3">
                {AVATAR_STYLES.map((style) => (
                    <Card 
                        key={style.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedStyle === style.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => onStyleSelect(style.id)}
                    >
                        <CardContent className="p-3 text-center">
                            <div className="flex justify-center mb-2">
                                <Avatar 
                                    src={null}
                                    size="md"
                                    fallbackSeed={currentSeed}
                                    avatarStyle={style.id as any}
                                    className="border-2 border-slate-600"
                                />
                            </div>
                            <div className="text-xs font-medium text-text">{style.name}</div>
                            <div className="text-[10px] text-text-muted mt-1">{style.description}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}