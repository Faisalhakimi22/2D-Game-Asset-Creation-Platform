import { Play, Image as ImageIcon } from "lucide-react";

interface AnimationItem {
    id: string;
    name: string;
    thumbnailUrl: string;
}

interface AnimationGalleryProps {
    animations: AnimationItem[];
    selectedId: string;
    onSelect: (id: string) => void;
    variant?: "grid" | "sidebar";
}

export function AnimationGallery({ animations, selectedId, onSelect, variant = "grid" }: AnimationGalleryProps) {
    if (variant === "sidebar") {
        return (
            <div className="flex flex-col gap-2 h-full">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-2 mb-2">Sprite & Animations</h3>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {animations.map((anim) => (
                        <button
                            key={anim.id}
                            onClick={() => onSelect(anim.id)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-all group ${selectedId === anim.id
                                    ? "bg-primary/10 border-primary/50"
                                    : "bg-surface border-transparent hover:bg-surface-highlight hover:border-primary/20"
                                }`}
                        >
                            <div className="relative w-10 h-10 shrink-0 rounded bg-surface-highlight border border-primary/10 overflow-hidden">
                                <div className="absolute inset-0 grid-pattern opacity-30" />
                                <div className="absolute inset-0 flex items-center justify-center p-1">
                                    <img
                                        src={anim.thumbnailUrl}
                                        alt={anim.name}
                                        className="max-w-full max-h-full object-contain image-pixelated"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 text-left min-w-0">
                                <p className={`text-sm font-medium truncate ${selectedId === anim.id ? "text-primary" : "text-text"}`}>
                                    {anim.name}
                                </p>
                                <p className="text-[10px] text-text-muted">
                                    {anim.id === "sprite" ? "Static" : "Animation"}
                                </p>
                            </div>

                            {anim.id === "sprite" ? (
                                <ImageIcon className={`w-4 h-4 ${selectedId === anim.id ? "text-primary" : "text-text-muted group-hover:text-text"}`} />
                            ) : (
                                <Play className={`w-4 h-4 ${selectedId === anim.id ? "text-primary" : "text-text-muted group-hover:text-text"}`} fill={selectedId === anim.id ? "currentColor" : "none"} />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Sprite & Animations</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {animations.map((anim) => (
                    <button
                        key={anim.id}
                        onClick={() => onSelect(anim.id)}
                        className={`group relative aspect-square rounded-lg overflow-hidden border transition-all ${selectedId === anim.id
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-primary/10 hover:border-primary/50"
                            }`}
                    >
                        <div className="absolute inset-0 bg-surface-highlight grid-pattern opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center p-2">
                            <img
                                src={anim.thumbnailUrl}
                                alt={anim.name}
                                className="max-w-full max-h-full object-contain image-pixelated"
                            />
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/60 backdrop-blur-sm">
                            <p className="text-[10px] font-medium text-white text-center truncate">
                                {anim.name}
                            </p>
                        </div>

                        {/* Hover Play Overlay - Only show for animations, not sprite */}
                        {anim.id !== "sprite" && (
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="w-6 h-6 text-white drop-shadow-md" fill="currentColor" />
                            </div>
                        )}

                        {/* Show image icon for sprite */}
                        {anim.id === "sprite" && (
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-white drop-shadow-md" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
