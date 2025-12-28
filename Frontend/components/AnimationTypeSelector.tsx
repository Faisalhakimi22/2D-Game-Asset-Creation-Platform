"use client";

import { useState } from "react";
import { Check, ChevronUp } from "lucide-react";

// Comprehensive animation types based on GodModeAI actions
export const ANIMATION_TYPES = {
    "Basic Movement": [
        {
            id: "walking",
            name: "Walking",
            frames: 4,
            frameDescriptions: [
                "standing with left foot forward, right arm forward",
                "mid-stride with feet together, arms at sides",
                "standing with right foot forward, left arm forward",
                "mid-stride with feet together, arms at sides"
            ]
        },
        {
            id: "walking_v3",
            name: "Walking V3",
            frames: 6,
            frameDescriptions: [
                "contact pose, left heel strikes ground, right arm forward",
                "passing pose, weight on left leg, right leg swings forward",
                "contact pose, right heel strikes ground, left arm forward",
                "passing pose, weight on right leg, left leg swings forward",
                "left foot pushing off, body moving forward",
                "right foot pushing off, body moving forward"
            ]
        },
        {
            id: "walking_looping_v4",
            name: "Walking Looping V4",
            frames: 8,
            frameDescriptions: [
                "left foot contact, heel down, right arm forward",
                "left foot flat, weight transferring",
                "left foot push off, right leg swinging",
                "right foot passing, both feet close",
                "right foot contact, heel down, left arm forward",
                "right foot flat, weight transferring",
                "right foot push off, left leg swinging",
                "left foot passing, both feet close"
            ]
        },
        {
            id: "running_looping_v4",
            name: "Running Looping V4",
            frames: 8,
            frameDescriptions: [
                "left foot contact, body leaning forward, right arm forward",
                "left leg driving, right leg lifting high",
                "flight phase, both feet off ground",
                "right leg extending forward",
                "right foot contact, body leaning forward, left arm forward",
                "right leg driving, left leg lifting high",
                "flight phase, both feet off ground",
                "left leg extending forward"
            ]
        },
        {
            id: "jump",
            name: "Jump",
            frames: 4,
            frameDescriptions: [
                "crouching down preparing to jump, knees bent",
                "pushing off ground, legs extending",
                "at peak of jump, arms raised, legs tucked",
                "landing with bent knees, arms out for balance"
            ]
        },
        {
            id: "jumping_v3",
            name: "Jumping V3",
            frames: 5,
            frameDescriptions: [
                "anticipation crouch, knees deeply bent, arms back",
                "explosive takeoff, legs extending powerfully",
                "ascending, body stretched upward",
                "peak of jump, arms raised high",
                "descending, preparing for landing"
            ]
        },
        {
            id: "jumping_v4",
            name: "Jumping V4",
            frames: 6,
            frameDescriptions: [
                "deep crouch anticipation, arms pulled back",
                "explosive push off, legs straightening",
                "leaving ground, body extending upward",
                "peak height, fully extended",
                "beginning descent, legs tucking",
                "landing impact, knees bending to absorb"
            ]
        },
        {
            id: "running_v3",
            name: "Running V3",
            frames: 6,
            frameDescriptions: [
                "left leg forward contact, right arm forward",
                "left leg drive phase, pushing off",
                "flight phase, both feet airborne",
                "right leg forward contact, left arm forward",
                "right leg drive phase, pushing off",
                "flight phase, opposite position"
            ]
        },
        {
            id: "running_v4",
            name: "Running V4",
            frames: 8,
            frameDescriptions: [
                "left foot strike, aggressive forward lean",
                "left leg support, right knee driving up",
                "left toe off, maximum knee drive",
                "flight phase, legs scissoring",
                "right foot strike, aggressive forward lean",
                "right leg support, left knee driving up",
                "right toe off, maximum knee drive",
                "flight phase, legs scissoring opposite"
            ]
        },
        {
            id: "idle",
            name: "Idle",
            frames: 4,
            frameDescriptions: [
                "standing relaxed, arms at sides",
                "slight breathing motion, chest expanded",
                "standing relaxed, slight weight shift",
                "slight breathing motion, chest contracted"
            ]
        },
        {
            id: "idle_v4",
            name: "Idle V4",
            frames: 6,
            frameDescriptions: [
                "neutral stance, weight centered",
                "subtle weight shift to left",
                "breathing in, chest expanding slightly",
                "subtle weight shift to right",
                "breathing out, chest contracting",
                "returning to neutral stance"
            ]
        },
        {
            id: "running_jump_v4",
            name: "Running Jump V4",
            frames: 6,
            frameDescriptions: [
                "running approach, left foot planting",
                "explosive takeoff from run, body launching",
                "ascending with forward momentum",
                "peak of jump, body stretched forward",
                "descending, legs preparing for landing",
                "landing from run, rolling through"
            ]
        },
        {
            id: "crouch_and_stand_v4",
            name: "Crouch and Stand V4",
            frames: 4,
            frameDescriptions: [
                "standing upright, beginning to lower",
                "mid-crouch, knees bending",
                "fully crouched, low position",
                "rising back to standing"
            ]
        },
        {
            id: "fast_run_v4",
            name: "Fast Run V4",
            frames: 6,
            frameDescriptions: [
                "sprinting contact, extreme forward lean",
                "powerful drive phase, knee high",
                "explosive toe off",
                "flight phase, maximum stride",
                "opposite contact, maintaining speed",
                "opposite drive phase"
            ]
        },
        {
            id: "roll_to_run",
            name: "Roll to Run",
            frames: 6,
            frameDescriptions: [
                "initiating forward roll, tucking",
                "mid-roll, body curled",
                "completing roll, feet touching down",
                "transitioning to run stance",
                "first running step",
                "full running stride"
            ]
        },
        {
            id: "running",
            name: "Running",
            frames: 6,
            frameDescriptions: [
                "running pose with left leg extended back, right arm forward",
                "both feet off ground, arms pumping",
                "right leg extended forward, left arm forward",
                "landing on right foot, left leg lifting",
                "both feet off ground, opposite arm position",
                "landing on left foot, right leg lifting"
            ]
        },
        {
            id: "crouched_walking",
            name: "Crouched Walking",
            frames: 4,
            frameDescriptions: [
                "crouched with left foot forward, staying low",
                "crouched mid-stride, weight shifting",
                "crouched with right foot forward, staying low",
                "crouched mid-stride, returning"
            ]
        },
        {
            id: "stealth_walk",
            name: "Stealth Walk",
            frames: 6,
            frameDescriptions: [
                "careful step, left foot testing ground",
                "weight transferring slowly to left",
                "right foot lifting carefully",
                "right foot extending forward cautiously",
                "right foot testing ground",
                "weight transferring slowly to right"
            ]
        },
        {
            id: "fast_run",
            name: "Fast Run",
            frames: 6,
            frameDescriptions: [
                "sprinting left foot contact",
                "powerful left leg drive",
                "airborne sprint phase",
                "sprinting right foot contact",
                "powerful right leg drive",
                "airborne sprint phase opposite"
            ]
        },
        {
            id: "prep_walking",
            name: "Prep Walking",
            frames: 4,
            frameDescriptions: [
                "ready stance, about to walk",
                "initiating first step",
                "completing first step",
                "transitioning to walk cycle"
            ]
        },
        {
            id: "running_jump",
            name: "Running Jump",
            frames: 5,
            frameDescriptions: [
                "running approach",
                "planting foot for takeoff",
                "launching into air",
                "peak of running jump",
                "preparing to land"
            ]
        },
    ],
    "Combat - Unarmed": [
        {
            id: "cross_punch",
            name: "Cross Punch",
            frames: 4,
            frameDescriptions: [
                "fighting stance, rear hand chambered",
                "rotating hips, rear hand extending",
                "full extension, cross punch landing",
                "retracting hand, returning to stance"
            ]
        },
        {
            id: "cross_punch_v3",
            name: "Cross Punch V3",
            frames: 5,
            frameDescriptions: [
                "orthodox stance, weight on back foot",
                "hip rotation initiating, shoulder turning",
                "arm extending with body rotation",
                "full extension, fist at target",
                "quick retraction to guard"
            ]
        },
        {
            id: "cross_punch_v4",
            name: "Cross Punch V4",
            frames: 6,
            frameDescriptions: [
                "fighting stance, hands up",
                "weight shifting, hip starting rotation",
                "shoulder driving forward, arm extending",
                "maximum extension, full body behind punch",
                "impact moment, fist connecting",
                "recovering to fighting stance"
            ]
        },
        {
            id: "roundhouse_kick",
            name: "Roundhouse Kick",
            frames: 5,
            frameDescriptions: [
                "fighting stance, preparing kick",
                "lifting knee, pivoting on support foot",
                "extending leg in circular motion",
                "full extension, kick at target height",
                "retracting leg, returning to stance"
            ]
        },
        {
            id: "spin_kick",
            name: "Spin Kick",
            frames: 6,
            frameDescriptions: [
                "fighting stance, initiating spin",
                "turning body, back to target",
                "continuing rotation, leg chambering",
                "leg extending during spin",
                "full extension at target",
                "completing rotation, landing stance"
            ]
        },
        {
            id: "spin_kick_v4",
            name: "Spin Kick V4",
            frames: 8,
            frameDescriptions: [
                "fighting stance, weight shifting",
                "initiating 360 spin, head turning",
                "back facing target, leg loading",
                "mid-spin, knee driving up",
                "leg extending through rotation",
                "maximum extension, kick connecting",
                "follow through, completing spin",
                "landing in fighting stance"
            ]
        },
        {
            id: "shoryuken_v4",
            name: "Shoryuken V4",
            frames: 6,
            frameDescriptions: [
                "crouching low, fist chambered down",
                "explosive upward launch, fist rising",
                "ascending with uppercut, body spiraling",
                "peak height, fist fully extended up",
                "beginning descent",
                "landing in ready stance"
            ]
        },
        {
            id: "roundhouse_kick_v4",
            name: "Roundhouse Kick V4",
            frames: 6,
            frameDescriptions: [
                "fighting stance, weight on front foot",
                "rear leg chambering, knee up",
                "hip rotating, leg extending",
                "full extension, shin/foot at target",
                "impact and follow through",
                "leg retracting, returning to stance"
            ]
        },
        {
            id: "run_and_slide_v4",
            name: "Run and Slide V4",
            frames: 6,
            frameDescriptions: [
                "running approach at speed",
                "initiating slide, dropping low",
                "sliding on ground, leg extended",
                "mid-slide, body low",
                "slide ending, beginning to rise",
                "recovering to standing"
            ]
        },
        {
            id: "light_punch_v4",
            name: "Light Punch V4",
            frames: 4,
            frameDescriptions: [
                "fighting stance, lead hand ready",
                "quick jab extending",
                "full extension, light punch",
                "snapping back to guard"
            ]
        },
        {
            id: "light_kick_v4",
            name: "Light Kick V4",
            frames: 4,
            frameDescriptions: [
                "fighting stance, weight balanced",
                "front leg lifting quickly",
                "quick snap kick extending",
                "leg retracting to stance"
            ]
        },
        {
            id: "flying_kick_v4",
            name: "Flying Kick V4",
            frames: 6,
            frameDescriptions: [
                "running approach, preparing jump",
                "launching into air",
                "airborne, leg chambering",
                "extending kick while flying",
                "full extension in air, kick at target",
                "landing after flying kick"
            ]
        },
        {
            id: "jump_spin_kick_v4",
            name: "Jump Spin Kick V4",
            frames: 8,
            frameDescriptions: [
                "preparing to jump, crouching",
                "launching upward with spin",
                "airborne, beginning rotation",
                "mid-spin in air, leg loading",
                "extending kick during aerial spin",
                "full extension, kick connecting",
                "completing rotation in air",
                "landing from spin kick"
            ]
        },
        {
            id: "crescent_kick",
            name: "Crescent Kick",
            frames: 5,
            frameDescriptions: [
                "fighting stance, preparing kick",
                "leg swinging up in arc",
                "leg at peak of crescent motion",
                "leg sweeping down through arc",
                "returning to fighting stance"
            ]
        },
    ],
    "Combat - Melee Weapons": [
        {
            id: "great_sword_slash_v4",
            name: "Great Sword Slash V4",
            frames: 6,
            frameDescriptions: [
                "two-handed grip, sword raised high",
                "beginning powerful downward swing",
                "mid-swing, sword descending",
                "full swing, sword at lowest point",
                "follow through, sword continuing arc",
                "recovering to ready stance"
            ]
        },
        {
            id: "outward_slash_v4",
            name: "Outward Slash V4",
            frames: 5,
            frameDescriptions: [
                "sword held across body",
                "initiating outward slash",
                "sword sweeping outward horizontally",
                "full extension of outward slash",
                "returning to guard position"
            ]
        },
        {
            id: "jump_and_slash_v4",
            name: "Jump and Slash V4",
            frames: 6,
            frameDescriptions: [
                "crouching, preparing to jump with sword",
                "launching upward, sword raised",
                "peak of jump, sword overhead",
                "descending with downward slash",
                "slash connecting at landing",
                "landing in ready stance"
            ]
        },
        {
            id: "downward_slash_v4",
            name: "Downward Slash V4",
            frames: 5,
            frameDescriptions: [
                "sword raised overhead",
                "beginning downward motion",
                "sword descending with force",
                "slash at lowest point",
                "recovering stance"
            ]
        },
        {
            id: "jump_high_slash_v4",
            name: "Jump High Slash V4",
            frames: 6,
            frameDescriptions: [
                "preparing high jump",
                "launching high into air",
                "at peak, sword raised",
                "beginning aerial slash",
                "powerful downward slash while falling",
                "landing with slash complete"
            ]
        },
        {
            id: "stab_v4",
            name: "Stab V4",
            frames: 4,
            frameDescriptions: [
                "sword pulled back, ready to thrust",
                "lunging forward, sword extending",
                "full thrust, sword at maximum reach",
                "retracting sword, returning to stance"
            ]
        },
        {
            id: "sheath_sword",
            name: "Sheath Sword",
            frames: 4,
            frameDescriptions: [
                "sword held ready, approaching sheath",
                "guiding sword to sheath opening",
                "sliding sword into sheath",
                "sword fully sheathed, hand releasing"
            ]
        },
        {
            id: "double_hand_weapon_wielding",
            name: "Double Hand Weapon Wielding",
            frames: 4,
            frameDescriptions: [
                "two-handed grip, weapon at ready",
                "shifting to offensive stance",
                "weapon raised for strike",
                "returning to ready position"
            ]
        },
        {
            id: "single_hand_weapon_wielding",
            name: "Single Hand Weapon Wielding",
            frames: 4,
            frameDescriptions: [
                "one-handed grip, weapon at side",
                "raising weapon to guard",
                "weapon in attack position",
                "returning to relaxed hold"
            ]
        },
        {
            id: "jumping_weapon_slash",
            name: "Jumping Weapon Slash",
            frames: 5,
            frameDescriptions: [
                "jumping with weapon raised",
                "at peak of jump, weapon overhead",
                "beginning downward slash in air",
                "slash extending while descending",
                "landing with slash complete"
            ]
        },
        {
            id: "downward_slash",
            name: "Downward Slash",
            frames: 4,
            frameDescriptions: [
                "weapon raised high overhead",
                "powerful downward swing beginning",
                "weapon at mid-swing",
                "slash complete, weapon low"
            ]
        },
        {
            id: "jump_high_slash",
            name: "Jump High Slash",
            frames: 5,
            frameDescriptions: [
                "crouching for high jump",
                "launching high, weapon ready",
                "peak height, weapon raised",
                "descending with powerful slash",
                "landing after aerial attack"
            ]
        },
    ],
};

export const VIEW_TYPES = [
    { id: "isometric", name: "Isometric", description: "45-degree angled view" },
];

export const DIRECTIONS = [
    { id: "right", label: "→", angle: 0 },
    { id: "up_right", label: "↗", angle: 45 },
    { id: "up", label: "↑", angle: 90 },
    { id: "up_left", label: "↖", angle: 135 },
    { id: "left", label: "←", angle: 180 },
    { id: "down_left", label: "↙", angle: 225 },
    { id: "down", label: "↓", angle: 270 },
    { id: "down_right", label: "↘", angle: 315 },
];

export type AnimationType = {
    id: string;
    name: string;
    frames: number;
    frameDescriptions: string[];
};

interface AnimationTypeSelectorProps {
    selectedAnimation: AnimationType | null;
    onAnimationSelect: (animation: AnimationType | null) => void;
    selectedView: string;
    onViewSelect: (view: string) => void;
    selectedDirection: string;
    onDirectionSelect: (direction: string) => void;
}

export function AnimationTypeSelector({
    selectedAnimation,
    onAnimationSelect,
    selectedView,
    onViewSelect,
    selectedDirection,
    onDirectionSelect,
}: AnimationTypeSelectorProps) {
    const [expandedCategory, setExpandedCategory] = useState<string | null>("Basic Movement");

    // Count actions per category
    const getCategoryCount = (category: string) => {
        return ANIMATION_TYPES[category as keyof typeof ANIMATION_TYPES]?.length || 0;
    };

    return (
        <div className="space-y-4">
            {/* View Type */}
            <div className="space-y-2">
                <span className="text-xs font-medium text-text">View Type</span>
                <div className="grid grid-cols-3 gap-2">
                    {VIEW_TYPES.map((view) => (
                        <button
                            key={view.id}
                            onClick={() => onViewSelect(view.id)}
                            className={`p-2 rounded-lg text-[10px] font-medium transition-all ${
                                selectedView === view.id
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "bg-white/[0.03] text-text-muted border border-white/5 hover:bg-white/[0.06]"
                            }`}
                        >
                            {view.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Direction */}
            <div className="space-y-2">
                <span className="text-xs font-medium text-text">Direction</span>
                <div className="grid grid-cols-4 gap-1.5">
                    {DIRECTIONS.slice(0, 4).map((dir) => (
                        <button
                            key={dir.id}
                            onClick={() => onDirectionSelect(dir.id)}
                            className={`p-2 rounded-lg text-sm transition-all ${
                                selectedDirection === dir.id
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "bg-white/[0.03] text-text-muted border border-white/5 hover:bg-white/[0.06]"
                            }`}
                        >
                            {dir.label}
                        </button>
                    ))}
                    {DIRECTIONS.slice(4).map((dir) => (
                        <button
                            key={dir.id}
                            onClick={() => onDirectionSelect(dir.id)}
                            className={`p-2 rounded-lg text-sm transition-all ${
                                selectedDirection === dir.id
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "bg-white/[0.03] text-text-muted border border-white/5 hover:bg-white/[0.06]"
                            }`}
                        >
                            {dir.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Animation Types - Collapsible Categories */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-text">Select Character Actions</span>
                    <span className="text-[10px] text-text-dim">
                        {Object.values(ANIMATION_TYPES).flat().length} total actions
                    </span>
                </div>
                <div className="space-y-2">
                    {Object.entries(ANIMATION_TYPES).map(([category, animations]) => (
                        <div key={category} className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
                            <button
                                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                                className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-medium text-text">{category}</span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-text-muted">
                                        {getCategoryCount(category)} actions
                                    </span>
                                </div>
                                <ChevronUp className={`w-3.5 h-3.5 text-text-muted transition-transform ${expandedCategory === category ? "" : "rotate-180"}`} />
                            </button>
                            
                            {expandedCategory === category && (
                                <div className="px-2 pb-2 grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                                    {animations.map((anim) => (
                                        <button
                                            key={anim.id}
                                            onClick={() => onAnimationSelect(selectedAnimation?.id === anim.id ? null : anim)}
                                            className={`p-2 rounded-lg text-left transition-all ${
                                                selectedAnimation?.id === anim.id
                                                    ? "bg-primary/20 border border-primary/30"
                                                    : "bg-white/[0.03] border border-transparent hover:bg-white/[0.06]"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`text-[10px] font-medium truncate ${selectedAnimation?.id === anim.id ? "text-primary" : "text-text"}`}>
                                                    {anim.name}
                                                </span>
                                                {selectedAnimation?.id === anim.id && <Check className="w-3 h-3 text-primary flex-shrink-0" />}
                                            </div>
                                            <span className="text-[9px] text-text-dim">{anim.frames} frames</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Animation Info */}
            {selectedAnimation && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-primary">{selectedAnimation.name}</span>
                        <span className="text-[10px] text-primary/70">{selectedAnimation.frames} frames</span>
                    </div>
                    <p className="text-[9px] text-primary/60">
                        Will generate {selectedAnimation.frames} animation frames as a sprite sheet
                    </p>
                </div>
            )}
        </div>
    );
}
