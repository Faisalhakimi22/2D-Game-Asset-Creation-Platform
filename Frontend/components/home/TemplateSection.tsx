"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sparkles, Layers } from "lucide-react";

const templates = [
    {
        id: "t1",
        title: "Cyberpunk Hero",
        category: "Character",
        emoji: "🤖",
        prompt: "Cyberpunk street samurai, neon armor, glowing katana, pixel art style",
        gradient: "from-fuchsia-600/40 via-purple-700/30 to-slate-900/90",
        accentColor: "fuchsia",
    },
    {
        id: "t2",
        title: "Fantasy Kingdom",
        category: "Environment",
        emoji: "🏰",
        prompt: "Magical forest clearing, ancient ruins, floating crystals, ethereal lighting",
        gradient: "from-emerald-600/40 via-teal-700/30 to-slate-900/90",
        accentColor: "emerald",
    },
    {
        id: "t3",
        title: "Space Station",
        category: "Sci-Fi",
        emoji: "🚀",
        prompt: "Sci-fi space station interior, metallic walls, control panels, holographic displays",
        gradient: "from-blue-600/40 via-indigo-700/30 to-slate-900/90",
        accentColor: "blue",
    },
    {
        id: "t4",
        title: "Dungeon Lord",
        category: "Boss",
        emoji: "👹",
        prompt: "Menacing dungeon boss, dark armor, flaming sword, red eyes, pixel art",
        gradient: "from-orange-600/40 via-red-700/30 to-slate-900/90",
        accentColor: "orange",
    },
];

const accentColors: Record<string, { dot: string; text: string; hover: string }> = {
    fuchsia: { dot: "bg-fuchsia-400", text: "text-fuchsia-300", hover: "group-hover:text-fuchsia-300" },
    emerald: { dot: "bg-emerald-400", text: "text-emerald-300", hover: "group-hover:text-emerald-300" },
    blue: { dot: "bg-blue-400", text: "text-blue-300", hover: "group-hover:text-blue-300" },
    orange: { dot: "bg-orange-400", text: "text-orange-300", hover: "group-hover:text-orange-300" },
};

export function TemplateSection() {
    return (
        <section className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-accent-orange to-accent-coral rounded-full"></div>
                <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-accent-orange" />
                    <h2 className="text-xl font-bold text-white">Quick Start Templates</h2>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-accent-orange/30 to-transparent"></div>
                <Button variant="ghost" className="text-slate-500 hover:text-primary flex items-center gap-1">
                    View All
                    <span className="text-lg">→</span>
                </Button>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.map((template) => {
                    const colors = accentColors[template.accentColor];
                    return (
                        <div
                            key={template.id}
                            className="template-pixel-card rounded-xl h-52 relative overflow-hidden group cursor-pointer"
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient}`}></div>
                            
                            {/* Pixel Grid Overlay */}
                            <div className="absolute inset-0 pixel-grid opacity-20"></div>
                            
                            {/* Decorative Pixel Corners */}
                            <div className={`absolute top-2 left-2 w-2 h-2 ${colors.dot}`}></div>
                            <div className={`absolute top-2 right-2 w-2 h-2 ${colors.dot} opacity-60`}></div>
                            
                            {/* Emoji Icon */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                                <div className="text-6xl">{template.emoji}</div>
                            </div>
                            
                            {/* Content Overlay */}
                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-slate-900/95 to-transparent">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-1.5 h-1.5 ${colors.dot} rounded-full`}></div>
                                    <span className={`text-[10px] ${colors.text} uppercase tracking-wider font-semibold`}>
                                        {template.category}
                                    </span>
                                </div>
                                <h3 className={`font-bold text-white ${colors.hover} transition-colors`}>
                                    {template.title}
                                </h3>
                                <p className="text-xs text-white/60 line-clamp-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {template.prompt}
                                </p>
                            </div>

                            {/* Hover Sparkle Effect */}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
