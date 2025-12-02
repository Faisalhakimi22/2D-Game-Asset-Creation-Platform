import { useState, useRef, useEffect } from "react";
import { Download, Edit, Sparkles, FileImage, Film, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpriteActionsProps {
    onGenerate: () => void;
    onEdit: () => void;
    onExport: (format: 'png' | 'gif') => void;
}

export function SpriteActions({ onGenerate, onEdit, onExport }: SpriteActionsProps) {
    const [isExportOpen, setIsExportOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsExportOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col gap-3">
            <Button
                size="lg"
                onClick={onGenerate}
            >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Animation
            </Button>

            <div className="grid grid-cols-2 gap-3">
                <Button
                    variant="outline"
                    onClick={onEdit}
                    className="border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Sprite
                </Button>

                <div className="relative" ref={dropdownRef}>
                    <Button
                        variant="outline"
                        className="w-full border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all"
                        onClick={() => setIsExportOpen(!isExportOpen)}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                        <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
                    </Button>

                    {isExportOpen && (
                        <div className="absolute right-0 bottom-full mb-2 w-52 rounded-lg border border-primary/10 bg-surface shadow-xl z-50 overflow-hidden backdrop-blur-sm">
                            <div className="p-1">
                                <button
                                    className="flex w-full items-center px-3 py-2 text-sm text-text hover:bg-surface-highlight rounded-md transition-colors"
                                    onClick={() => {
                                        onExport('png');
                                        setIsExportOpen(false);
                                    }}
                                >
                                    <FileImage className="w-4 h-4 mr-2 text-primary" />
                                    Sprite Sheet (.png)
                                </button>
                                <button
                                    className="flex w-full items-center px-3 py-2 text-sm text-text hover:bg-surface-highlight rounded-md transition-colors"
                                    onClick={() => {
                                        onExport('gif');
                                        setIsExportOpen(false);
                                    }}
                                >
                                    <Film className="w-4 h-4 mr-2 text-primary" />
                                    Animation Preview (.gif)
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
