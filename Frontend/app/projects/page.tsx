"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Upload, Image as ImageIcon, Map, Pencil, Trash2, FolderOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AuthGuard } from "@/components/AuthGuard";
import { AppSidebar } from "@/components/AppSidebar";

type Project = {
    id: string;
    title: string;
    type: "sprite" | "scene";
    date: string;
    color: string;
};

const mockProjects: Project[] = [
    { id: "8842", title: "Cyberpunk City", type: "scene", date: "2024-03-10", color: "from-purple-500/20 to-purple-900/40" },
    { id: "9120", title: "Hero Idle Animation", type: "sprite", date: "2024-03-09", color: "from-blue-500/20 to-blue-900/40" },
    { id: "7731", title: "Forest Tileset", type: "sprite", date: "2024-03-08", color: "from-green-500/20 to-green-900/40" },
    { id: "6654", title: "Dungeon Level 1", type: "scene", date: "2024-03-05", color: "from-orange-500/20 to-orange-900/40" },
    { id: "5521", title: "NPC Merchant", type: "sprite", date: "2024-03-01", color: "from-pink-500/20 to-pink-900/40" },
    { id: "4419", title: "Space Background", type: "scene", date: "2024-02-28", color: "from-cyan-500/20 to-cyan-900/40" },
];

const projectColors = [
    "from-purple-500/20 to-purple-900/40",
    "from-blue-500/20 to-blue-900/40",
    "from-green-500/20 to-green-900/40",
    "from-orange-500/20 to-orange-900/40",
    "from-pink-500/20 to-pink-900/40",
    "from-cyan-500/20 to-cyan-900/40",
];

export default function ProjectsPage() {
    return (
        <AuthGuard>
            <ProjectsPageContent />
        </AuthGuard>
    );
}


function ProjectsPageContent() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>(mockProjects);
    const [currentFilter, setCurrentFilter] = useState<"all" | "sprite" | "scene">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<"sprite" | "scene">("sprite");
    const [newProjectName, setNewProjectName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredProjects = projects.filter((p) => {
        const matchesFilter = currentFilter === "all" || p.type === currentFilter;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const deleteProject = (id: string) => {
        setProjects(projects.filter((p) => p.id !== id));
    };

    const handleCreateProject = () => {
        if (!newProjectName.trim() || isCreating) return;
        setIsCreating(true);

        const newProject: Project = {
            id: Math.floor(Math.random() * 9000 + 1000).toString(),
            title: newProjectName.trim(),
            type: selectedType,
            date: new Date().toISOString().split("T")[0],
            color: projectColors[Math.floor(Math.random() * projectColors.length)],
        };

        setProjects([newProject, ...projects]);

        setTimeout(() => {
            setIsNewProjectOpen(false);
            setNewProjectName("");
            setSelectedType("sprite");
            setIsCreating(false);
            router.push(selectedType === "sprite" ? `/sprites?projectId=${newProject.id}` : `/scenes?projectId=${newProject.id}`);
        }, 300);
    };

    const handleImport = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        Array.from(files).forEach((file) => {
            const newProject: Project = {
                id: Math.floor(Math.random() * 9000 + 1000).toString(),
                title: file.name.replace(/\.[^/.]+$/, ""),
                type: "sprite",
                date: new Date().toISOString().split("T")[0],
                color: projectColors[Math.floor(Math.random() * projectColors.length)],
            };
            setProjects((prev) => [newProject, ...prev]);
        });

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="h-screen flex bg-[#050506] overflow-hidden">
            <AppSidebar />

            <main className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-[#050506]/95 backdrop-blur-sm border-b border-white/5">
                    <div className="px-6 py-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <FolderOpen className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">Projects</h1>
                                    <p className="text-xs text-text-muted">Manage your game assets</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <input ref={fileInputRef} type="file" accept="image/*,.png,.jpg,.jpeg,.gif" multiple onChange={handleFileChange} className="hidden" />
                                <Button variant="outline" size="sm" onClick={handleImport} className="bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20 text-text-muted hover:text-white">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import
                                </Button>
                                <Button size="sm" onClick={() => setIsNewProjectOpen(true)} className="bg-primary hover:bg-primary/90">
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Project
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Filters */}
                <div className="px-6 py-4 border-b border-white/5">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <Input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white/[0.02] border-white/10 focus:border-primary/50 focus:ring-primary/20"
                            />
                        </div>

                        <div className="flex gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-lg w-fit">
                            {[
                                { key: "all", label: "All" },
                                { key: "sprite", label: "Sprites" },
                                { key: "scene", label: "Scenes" },
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setCurrentFilter(key as "all" | "sprite" | "scene")}
                                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                                        currentFilter === key
                                            ? "bg-primary/20 text-primary border border-primary/30"
                                            : "text-text-muted hover:text-white hover:bg-white/[0.03]"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {filteredProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                                <ImageIcon className="w-10 h-10 text-primary/60" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">No projects found</h3>
                            <p className="text-sm text-text-muted mb-6 max-w-sm">
                                Try adjusting your filters or create a new project to get started
                            </p>
                            <Button onClick={() => setIsNewProjectOpen(true)} className="bg-primary hover:bg-primary/90">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Project
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {/* New Project Card */}
                            <button
                                onClick={() => setIsNewProjectOpen(true)}
                                className="group h-[200px] rounded-xl border-2 border-dashed border-white/10 hover:border-primary/40 bg-white/[0.01] hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/[0.03] group-hover:bg-primary/20 border border-white/5 group-hover:border-primary/30 flex items-center justify-center transition-all">
                                    <Plus className="w-6 h-6 text-text-muted group-hover:text-primary transition-colors" />
                                </div>
                                <div>
                                    <p className="font-medium text-text-muted group-hover:text-primary transition-colors">New Project</p>
                                    <p className="text-[10px] text-text-dim">Create sprite or scene</p>
                                </div>
                            </button>


                            {/* Project Cards */}
                            {filteredProjects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() => router.push(`/projects/${project.id}`)}
                                    className="group h-[200px] rounded-xl bg-gradient-to-br from-white/[0.02] to-transparent border border-white/5 hover:border-primary/30 overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/5"
                                >
                                    {/* Preview Area */}
                                    <div className={`h-[120px] bg-gradient-to-br ${project.color} relative`}>
                                        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {project.type === "sprite" ? (
                                                <ImageIcon className="w-10 h-10 text-white/40 group-hover:text-white/60 transition-colors" />
                                            ) : (
                                                <Map className="w-10 h-10 text-white/40 group-hover:text-white/60 transition-colors" />
                                            )}
                                        </div>
                                        
                                        {/* Hover Actions */}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); }}
                                                className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                                            >
                                                <Pencil className="w-3 h-3 text-white" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                                                className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3 text-white" />
                                            </button>
                                        </div>

                                        {/* Type Badge */}
                                        <div className="absolute bottom-2 left-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                                                project.type === "sprite" 
                                                    ? "bg-primary/20 text-primary border border-primary/30" 
                                                    : "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30"
                                            }`}>
                                                {project.type === "sprite" ? <Sparkles className="w-2.5 h-2.5" /> : <Map className="w-2.5 h-2.5" />}
                                                {project.type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-sm text-white truncate group-hover:text-primary transition-colors">
                                                {project.title}
                                            </h3>
                                            <span className="text-[10px] text-text-dim font-mono">#{project.id}</span>
                                        </div>
                                        <p className="text-[10px] text-text-muted mt-1">
                                            {new Date(project.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>


            {/* New Project Dialog */}
            <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
                <DialogContent className="bg-[#0a0a0c] border-white/10 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">Create New Project</DialogTitle>
                        <DialogDescription className="text-text-muted">
                            Choose the type of asset you want to create
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                        <div className="space-y-3">
                            <Label className="text-text-muted text-xs uppercase tracking-wider">Project Type</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setSelectedType("sprite")}
                                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                                        selectedType === "sprite"
                                            ? "bg-primary/10 border-primary/40 text-primary"
                                            : "bg-white/[0.02] border-white/10 text-text-muted hover:border-white/20 hover:text-white"
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedType === "sprite" ? "bg-primary/20" : "bg-white/[0.03]"}`}>
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium text-sm">Sprite</span>
                                    <span className="text-[10px] text-text-dim">Character or object</span>
                                </button>

                                <button
                                    onClick={() => setSelectedType("scene")}
                                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                                        selectedType === "scene"
                                            ? "bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan"
                                            : "bg-white/[0.02] border-white/10 text-text-muted hover:border-white/20 hover:text-white"
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedType === "scene" ? "bg-accent-cyan/20" : "bg-white/[0.03]"}`}>
                                        <Map className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium text-sm">Scene</span>
                                    <span className="text-[10px] text-text-dim">Environment or level</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="project-name" className="text-text-muted text-xs uppercase tracking-wider">Project Name</Label>
                            <Input
                                id="project-name"
                                placeholder="Enter project name..."
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                                className="bg-white/[0.02] border-white/10 focus:border-primary/50"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsNewProjectOpen(false)} disabled={isCreating} className="bg-white/[0.02] border-white/10 hover:bg-white/[0.05]">
                            Cancel
                        </Button>
                        <Button onClick={handleCreateProject} disabled={!newProjectName.trim() || isCreating} className="bg-primary hover:bg-primary/90">
                            {isCreating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    Creating...
                                </>
                            ) : (
                                "Create Project"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
