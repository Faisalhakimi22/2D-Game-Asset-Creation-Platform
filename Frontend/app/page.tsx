import Link from "next/link";
import { ArrowRight, Sparkles, Gamepad2, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="bg-animation">
        <div className="grid-overlay"></div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <div className="text-center space-y-8 max-w-4xl relative z-10">
        {/* Logo with Glow Effect */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="relative">
              <Logo size="lg" linkTo={null} />
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="flex justify-center">
          <div className="retro-badge inline-flex items-center gap-2">
            <Gamepad2 className="w-3 h-3" />
            <span>Game Dev Tools</span>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Create <span className="text-primary glow-text">pixel-perfect</span>
            <br />2D game assets
          </h1>
          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            AI-powered tools to generate sprites, scenes, and animations for Unity, Godot, Unreal Engine, and more.
            Built for game developers and pixel artists.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface/50 border border-primary/20 text-sm text-slate-300">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>AI Generation</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface/50 border border-accent-cyan/20 text-sm text-slate-300">
            <Zap className="w-4 h-4 text-accent-cyan" />
            <span>Instant Export</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface/50 border border-accent-orange/20 text-sm text-slate-300">
            <Star className="w-4 h-4 text-accent-orange" />
            <span>Pro Quality</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link href="/login">
            <button className="pixel-btn w-full sm:w-auto flex items-center justify-center gap-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/projects">
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-slate-600 hover:border-primary hover:text-primary transition-all">
              View Demo
            </Button>
          </Link>
        </div>

        {/* Status Indicator */}
        <div className="pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            Demo pages available — Start creating now!
          </div>
        </div>

        {/* Preview Cards */}
        <div className="grid grid-cols-3 gap-4 pt-8 max-w-xl mx-auto">
          <div className="pixel-card rounded-xl p-3 aspect-square flex flex-col items-center justify-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
              <Sparkles className="w-5 h-5 text-primary group-hover:text-slate-900" />
            </div>
            <span className="text-xs text-slate-400 group-hover:text-white transition-colors">Sprites</span>
          </div>
          <div className="pixel-card rounded-xl p-3 aspect-square flex flex-col items-center justify-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-accent-cyan/20 rounded-lg flex items-center justify-center group-hover:bg-accent-cyan transition-colors">
              <svg className="w-5 h-5 text-accent-cyan group-hover:text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-white transition-colors">Scenes</span>
          </div>
          <div className="pixel-card rounded-xl p-3 aspect-square flex flex-col items-center justify-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-accent-pink/20 rounded-lg flex items-center justify-center group-hover:bg-accent-pink transition-colors">
              <svg className="w-5 h-5 text-accent-pink group-hover:text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-white transition-colors">Animations</span>
          </div>
        </div>
      </div>
    </main>
  );
}
