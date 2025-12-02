import { Calendar, FileDigit, Layers, Move } from "lucide-react";

interface SpriteMetadataProps {
    name: string;
    createdAt: string;
    dimensions: string;
    frameCount: number;
    size: string;
}

export function SpriteMetadata({ name, createdAt, dimensions, frameCount, size }: SpriteMetadataProps) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-text">{name}</h2>
                <p className="text-sm text-text-muted">Created on {createdAt}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-surface-highlight border border-primary/10">
                    <div className="flex items-center gap-2 text-text-muted mb-1">
                        <Move className="w-4 h-4" />
                        <span className="text-xs font-medium">Dimensions</span>
                    </div>
                    <div className="text-sm font-semibold text-text">{dimensions}</div>
                </div>

                <div className="p-3 rounded-lg bg-surface-highlight border border-primary/10">
                    <div className="flex items-center gap-2 text-text-muted mb-1">
                        <Layers className="w-4 h-4" />
                        <span className="text-xs font-medium">Frames</span>
                    </div>
                    <div className="text-sm font-semibold text-text">{frameCount} Frames</div>
                </div>

                <div className="p-3 rounded-lg bg-surface-highlight border border-primary/10">
                    <div className="flex items-center gap-2 text-text-muted mb-1">
                        <FileDigit className="w-4 h-4" />
                        <span className="text-xs font-medium">Size</span>
                    </div>
                    <div className="text-sm font-semibold text-text">{size}</div>
                </div>

                <div className="p-3 rounded-lg bg-surface-highlight border border-primary/10">
                    <div className="flex items-center gap-2 text-text-muted mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-medium">Updated</span>
                    </div>
                    <div className="text-sm font-semibold text-text">Just now</div>
                </div>
            </div>
        </div>
    );
}
