"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
    OrbitControls,
    TransformControls,
    Grid,
    useCursor,
    ContactShadows,
    PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import {
    RotateCcw, Save, X, FlipHorizontal, Undo2, Redo2,
    Zap, ChevronDown, Eye, EyeOff, Move3D, RotateCw,
    Camera, Sliders, ChevronLeft, ChevronRight, Users
} from "lucide-react";

declare global {
    interface Window { capturePose?: () => void; }
}

// ============ TYPES ============
interface JointRotation { x: number; y: number; z: number; }
interface PoseData { [jointName: string]: JointRotation; }
interface BodyProportions { height: number; armLength: number; legLength: number; shoulderWidth: number; hipWidth: number; headSize: number; }

// ============ CONSTANTS ============
const DEFAULT_PROPORTIONS: BodyProportions = { height: 1, armLength: 1, legLength: 1, shoulderWidth: 1, hipWidth: 1, headSize: 1 };

const JOINT_COLORS: Record<string, string> = {
    hips: "#8B5CF6", spine: "#A78BFA", chest: "#C4B5FD", neck: "#DDD6FE", head: "#EDE9FE",
    r_shoulder: "#F97316", r_elbow: "#FDBA74", r_wrist: "#FFEDD5", r_hand: "#FFF7ED",
    l_shoulder: "#06B6D4", l_elbow: "#67E8F9", l_wrist: "#CFFAFE", l_hand: "#ECFEFF",
    r_hip: "#EF4444", r_knee: "#FCA5A5", r_ankle: "#FEE2E2", r_foot: "#FEF2F2",
    l_hip: "#22C55E", l_knee: "#86EFAC", l_ankle: "#DCFCE7", l_foot: "#F0FDF4",
};

const CAMERA_PRESETS = {
    front: { position: [0, 1, 5] as [number,number,number], target: [0, 1, 0] as [number,number,number], name: "Front" },
    back: { position: [0, 1, -5] as [number,number,number], target: [0, 1, 0] as [number,number,number], name: "Back" },
    left: { position: [-5, 1, 0] as [number,number,number], target: [0, 1, 0] as [number,number,number], name: "Left" },
    right: { position: [5, 1, 0] as [number,number,number], target: [0, 1, 0] as [number,number,number], name: "Right" },
    threeQuarter: { position: [3, 2, 4] as [number,number,number], target: [0, 1, 0] as [number,number,number], name: "3/4 View" },
    isometric: { position: [4, 4, 4] as [number,number,number], target: [0, 1, 0] as [number,number,number], name: "Isometric" },
};

const PRESET_POSES: Record<string, { name: string; pose: PoseData }> = {
    idle: { name: "Idle", pose: { hips: {x:0,y:0,z:0}, spine: {x:0,y:0,z:0}, chest: {x:0,y:0,z:0}, neck: {x:0,y:0,z:0}, head: {x:0,y:0,z:0}, r_shoulder: {x:0,y:0,z:-0.1}, r_elbow: {x:0,y:0,z:-0.2}, r_wrist: {x:0,y:0,z:0}, l_shoulder: {x:0,y:0,z:0.1}, l_elbow: {x:0,y:0,z:0.2}, l_wrist: {x:0,y:0,z:0}, r_hip: {x:0,y:0,z:-0.05}, r_knee: {x:0,y:0,z:0}, r_ankle: {x:0,y:0,z:0}, l_hip: {x:0,y:0,z:0.05}, l_knee: {x:0,y:0,z:0}, l_ankle: {x:0,y:0,z:0} }},
    walking: { name: "Walking", pose: { hips: {x:0,y:0,z:0}, spine: {x:0,y:0,z:0}, chest: {x:0,y:0.1,z:0}, neck: {x:0,y:0,z:0}, head: {x:0,y:0,z:0}, r_shoulder: {x:0.4,y:0,z:0}, r_elbow: {x:0,y:0,z:-0.5}, r_wrist: {x:0,y:0,z:0}, l_shoulder: {x:-0.4,y:0,z:0}, l_elbow: {x:0,y:0,z:-0.3}, l_wrist: {x:0,y:0,z:0}, r_hip: {x:-0.5,y:0,z:0}, r_knee: {x:0.4,y:0,z:0}, r_ankle: {x:0.1,y:0,z:0}, l_hip: {x:0.5,y:0,z:0}, l_knee: {x:0.1,y:0,z:0}, l_ankle: {x:-0.1,y:0,z:0} }},
    running: { name: "Running", pose: { hips: {x:0,y:0,z:0}, spine: {x:-0.1,y:0,z:0}, chest: {x:-0.2,y:0,z:0}, neck: {x:0.1,y:0,z:0}, head: {x:0,y:0,z:0}, r_shoulder: {x:1,y:0,z:0}, r_elbow: {x:0,y:0,z:-1.5}, r_wrist: {x:0,y:0,z:0}, l_shoulder: {x:-0.8,y:0,z:0}, l_elbow: {x:0,y:0,z:-1}, l_wrist: {x:0,y:0,z:0}, r_hip: {x:-1,y:0,z:0}, r_knee: {x:1.5,y:0,z:0}, r_ankle: {x:0.3,y:0,z:0}, l_hip: {x:0.8,y:0,z:0}, l_knee: {x:0.3,y:0,z:0}, l_ankle: {x:-0.4,y:0,z:0} }},
    jumping: { name: "Jumping", pose: { hips: {x:0,y:0,z:0}, spine: {x:-0.1,y:0,z:0}, chest: {x:-0.1,y:0,z:0}, neck: {x:0,y:0,z:0}, head: {x:-0.1,y:0,z:0}, r_shoulder: {x:0,y:0,z:-2.8}, r_elbow: {x:0,y:0,z:0.4}, r_wrist: {x:0,y:0,z:0}, l_shoulder: {x:0,y:0,z:2.8}, l_elbow: {x:0,y:0,z:-0.4}, l_wrist: {x:0,y:0,z:0}, r_hip: {x:-0.4,y:0,z:-0.2}, r_knee: {x:1,y:0,z:0}, r_ankle: {x:0.5,y:0,z:0}, l_hip: {x:-0.4,y:0,z:0.2}, l_knee: {x:1,y:0,z:0}, l_ankle: {x:0.5,y:0,z:0} }},
    fighting: { name: "Fighting", pose: { hips: {x:0,y:0.3,z:0}, spine: {x:0,y:0.2,z:0}, chest: {x:0,y:0.2,z:0}, neck: {x:0,y:0,z:0}, head: {x:0,y:0,z:0}, r_shoulder: {x:0.6,y:0,z:-0.6}, r_elbow: {x:-1.8,y:0,z:0}, r_wrist: {x:0,y:0,z:0}, l_shoulder: {x:-0.4,y:0,z:0.4}, l_elbow: {x:-1.4,y:0,z:0}, l_wrist: {x:0,y:0,z:0}, r_hip: {x:0,y:0,z:-0.4}, r_knee: {x:0.3,y:0,z:0}, r_ankle: {x:0,y:0,z:0}, l_hip: {x:-0.3,y:0,z:0.6}, l_knee: {x:0.5,y:0,z:0}, l_ankle: {x:0,y:0,z:0} }},
    sitting: { name: "Sitting", pose: { hips: {x:0,y:0,z:0}, spine: {x:0,y:0,z:0}, chest: {x:0,y:0,z:0}, neck: {x:0,y:0,z:0}, head: {x:0,y:0,z:0}, r_shoulder: {x:0.3,y:0,z:0}, r_elbow: {x:0.6,y:0,z:-0.4}, r_wrist: {x:0,y:0,z:0}, l_shoulder: {x:0.3,y:0,z:0}, l_elbow: {x:0.6,y:0,z:0.4}, l_wrist: {x:0,y:0,z:0}, r_hip: {x:-1.57,y:0,z:-0.15}, r_knee: {x:1.57,y:0,z:0}, r_ankle: {x:0,y:0,z:0}, l_hip: {x:-1.57,y:0,z:0.15}, l_knee: {x:1.57,y:0,z:0}, l_ankle: {x:0,y:0,z:0} }},
    attack: { name: "Attack", pose: { hips: {x:0,y:0.5,z:0}, spine: {x:0,y:0.3,z:0}, chest: {x:-0.2,y:0.3,z:0}, neck: {x:0.1,y:0,z:0}, head: {x:0,y:0,z:0}, r_shoulder: {x:-0.5,y:0,z:-1.2}, r_elbow: {x:0,y:0,z:-0.3}, r_wrist: {x:0,y:0,z:0}, l_shoulder: {x:0.3,y:0,z:0.5}, l_elbow: {x:-0.8,y:0,z:0}, l_wrist: {x:0,y:0,z:0}, r_hip: {x:-0.2,y:0,z:-0.3}, r_knee: {x:0.4,y:0,z:0}, r_ankle: {x:0,y:0,z:0}, l_hip: {x:0.4,y:0,z:0.4}, l_knee: {x:0.2,y:0,z:0}, l_ankle: {x:0,y:0,z:0} }},
    crouch: { name: "Crouch", pose: { hips: {x:0,y:0,z:0}, spine: {x:0.2,y:0,z:0}, chest: {x:0.2,y:0,z:0}, neck: {x:-0.1,y:0,z:0}, head: {x:-0.1,y:0,z:0}, r_shoulder: {x:0.4,y:0,z:-0.2}, r_elbow: {x:-0.8,y:0,z:0}, r_wrist: {x:0,y:0,z:0}, l_shoulder: {x:0.4,y:0,z:0.2}, l_elbow: {x:-0.8,y:0,z:0}, l_wrist: {x:0,y:0,z:0}, r_hip: {x:-1.2,y:0,z:-0.1}, r_knee: {x:2,y:0,z:0}, r_ankle: {x:-0.3,y:0,z:0}, l_hip: {x:-1.2,y:0,z:0.1}, l_knee: {x:2,y:0,z:0}, l_ankle: {x:-0.3,y:0,z:0} }},
};

// ============ SKELETON STRUCTURE ============
const createSkeletonStructure = (proportions: BodyProportions) => ({
    hips: { position: [0, 1.0 * proportions.height, 0] as [number,number,number], parent: null, children: ["spine", "r_hip", "l_hip"] },
    spine: { position: [0, 0.15 * proportions.height, 0] as [number,number,number], parent: "hips", children: ["chest"] },
    chest: { position: [0, 0.2 * proportions.height, 0] as [number,number,number], parent: "spine", children: ["neck", "r_shoulder", "l_shoulder"] },
    neck: { position: [0, 0.15 * proportions.height, 0] as [number,number,number], parent: "chest", children: ["head"] },
    head: { position: [0, 0.12 * proportions.headSize, 0] as [number,number,number], parent: "neck", children: [] },
    r_shoulder: { position: [-0.18 * proportions.shoulderWidth, 0.1, 0] as [number,number,number], parent: "chest", children: ["r_elbow"] },
    r_elbow: { position: [0, -0.28 * proportions.armLength, 0] as [number,number,number], parent: "r_shoulder", children: ["r_wrist"] },
    r_wrist: { position: [0, -0.26 * proportions.armLength, 0] as [number,number,number], parent: "r_elbow", children: ["r_hand"] },
    r_hand: { position: [0, -0.08, 0] as [number,number,number], parent: "r_wrist", children: [] },
    l_shoulder: { position: [0.18 * proportions.shoulderWidth, 0.1, 0] as [number,number,number], parent: "chest", children: ["l_elbow"] },
    l_elbow: { position: [0, -0.28 * proportions.armLength, 0] as [number,number,number], parent: "l_shoulder", children: ["l_wrist"] },
    l_wrist: { position: [0, -0.26 * proportions.armLength, 0] as [number,number,number], parent: "l_elbow", children: ["l_hand"] },
    l_hand: { position: [0, -0.08, 0] as [number,number,number], parent: "l_wrist", children: [] },
    r_hip: { position: [-0.1 * proportions.hipWidth, -0.05, 0] as [number,number,number], parent: "hips", children: ["r_knee"] },
    r_knee: { position: [0, -0.42 * proportions.legLength, 0] as [number,number,number], parent: "r_hip", children: ["r_ankle"] },
    r_ankle: { position: [0, -0.4 * proportions.legLength, 0] as [number,number,number], parent: "r_knee", children: ["r_foot"] },
    r_foot: { position: [0, -0.05, 0.08] as [number,number,number], parent: "r_ankle", children: [] },
    l_hip: { position: [0.1 * proportions.hipWidth, -0.05, 0] as [number,number,number], parent: "hips", children: ["l_knee"] },
    l_knee: { position: [0, -0.42 * proportions.legLength, 0] as [number,number,number], parent: "l_hip", children: ["l_ankle"] },
    l_ankle: { position: [0, -0.4 * proportions.legLength, 0] as [number,number,number], parent: "l_knee", children: ["l_foot"] },
    l_foot: { position: [0, -0.05, 0.08] as [number,number,number], parent: "l_ankle", children: [] },
});

// ============ 3D COMPONENTS ============
const Joint = ({ name, position, rotation, color, isSelected, onSelect, children, jointRefs }: {
    name: string; position: [number,number,number]; rotation: JointRotation; color: string;
    isSelected: boolean; onSelect: (name: string, obj: THREE.Object3D) => void;
    children?: React.ReactNode; jointRefs: React.MutableRefObject<Record<string, THREE.Group | null>>;
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);
    useCursor(hovered);

    useEffect(() => { if (groupRef.current) jointRefs.current[name] = groupRef.current; }, [name, jointRefs]);

    const isEndJoint = ["head", "r_hand", "l_hand", "r_foot", "l_foot"].includes(name);
    const radius = isEndJoint ? 0.045 : 0.055;

    return (
        <group ref={groupRef} position={position} rotation={[rotation.x, rotation.y, rotation.z]}>
            <mesh onClick={(e) => { e.stopPropagation(); if (groupRef.current) onSelect(name, groupRef.current); }}
                onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
                <sphereGeometry args={[radius, 16, 16]} />
                <meshStandardMaterial color={isSelected ? "#fff" : hovered ? "#ffff00" : color}
                    emissive={isSelected ? "#fff" : hovered ? "#ffff00" : color}
                    emissiveIntensity={isSelected ? 0.6 : hovered ? 0.4 : 0.25} roughness={0.2} metalness={0.3} />
            </mesh>
            {isSelected && <mesh scale={[2, 2, 2]}><sphereGeometry args={[radius, 16, 16]} /><meshBasicMaterial color="#fff" transparent opacity={0.12} /></mesh>}
            {children}
        </group>
    );
};

// Body mesh with smooth limbs
const BodyMesh = ({ jointRefs, showBody, bodyColor }: { jointRefs: React.MutableRefObject<Record<string, THREE.Group | null>>; showBody: boolean; bodyColor: string }) => {
    const limbRefs = useRef<(THREE.Mesh | null)[]>([]);
    const torsoRef = useRef<THREE.Mesh>(null);
    const headRef = useRef<THREE.Mesh>(null);

    const limbs = useMemo(() => [
        ["hips", "spine"], ["spine", "chest"], ["chest", "neck"], ["neck", "head"],
        ["chest", "r_shoulder"], ["r_shoulder", "r_elbow"], ["r_elbow", "r_wrist"], ["r_wrist", "r_hand"],
        ["chest", "l_shoulder"], ["l_shoulder", "l_elbow"], ["l_elbow", "l_wrist"], ["l_wrist", "l_hand"],
        ["hips", "r_hip"], ["r_hip", "r_knee"], ["r_knee", "r_ankle"], ["r_ankle", "r_foot"],
        ["hips", "l_hip"], ["l_hip", "l_knee"], ["l_knee", "l_ankle"], ["l_ankle", "l_foot"],
    ], []);

    useFrame(() => {
        if (!showBody) return;
        limbs.forEach(([start, end], i) => {
            const startJoint = jointRefs.current[start];
            const endJoint = jointRefs.current[end];
            const mesh = limbRefs.current[i];
            if (startJoint && endJoint && mesh) {
                const startPos = new THREE.Vector3(); const endPos = new THREE.Vector3();
                startJoint.getWorldPosition(startPos); endJoint.getWorldPosition(endPos);
                const dir = new THREE.Vector3().subVectors(endPos, startPos);
                const len = dir.length();
                mesh.position.copy(new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5));
                mesh.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()));
                mesh.scale.y = Math.max(0.1, len * 10);
            }
        });
        const hips = jointRefs.current["hips"]; const chest = jointRefs.current["chest"];
        if (hips && chest && torsoRef.current) {
            const hp = new THREE.Vector3(); const cp = new THREE.Vector3();
            hips.getWorldPosition(hp); chest.getWorldPosition(cp);
            torsoRef.current.position.copy(new THREE.Vector3().addVectors(hp, cp).multiplyScalar(0.5));
        }
        const head = jointRefs.current["head"];
        if (head && headRef.current) { const headPos = new THREE.Vector3(); head.getWorldPosition(headPos); headRef.current.position.copy(headPos); }
    });

    if (!showBody) return null;
    return (
        <group>
            {limbs.map(([start], i) => {
                const thickness = start.includes("hip") || start.includes("shoulder") ? 0.04 : start.includes("knee") || start.includes("elbow") ? 0.032 : 0.025;
                return <mesh key={i} ref={(el) => { limbRefs.current[i] = el; }}><capsuleGeometry args={[thickness, 0.1, 4, 12]} /><meshStandardMaterial color={bodyColor} roughness={0.5} metalness={0.1} /></mesh>;
            })}
            <mesh ref={torsoRef}><capsuleGeometry args={[0.12, 0.15, 4, 12]} /><meshStandardMaterial color={bodyColor} roughness={0.5} metalness={0.1} /></mesh>
            <mesh ref={headRef}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.1} /></mesh>
        </group>
    );
};

// Recursive skeleton builder
const SkeletonJoint = ({ jointName, skeleton, pose, selectedName, onSelect, jointRefs }: {
    jointName: string; skeleton: ReturnType<typeof createSkeletonStructure>; pose: PoseData;
    selectedName: string | null; onSelect: (name: string, obj: THREE.Object3D) => void;
    jointRefs: React.MutableRefObject<Record<string, THREE.Group | null>>;
}) => {
    const joint = skeleton[jointName as keyof typeof skeleton];
    if (!joint) return null;
    const rotation = pose[jointName] || { x: 0, y: 0, z: 0 };
    return (
        <Joint name={jointName} position={joint.position} rotation={rotation} color={JOINT_COLORS[jointName] || "#888"}
            isSelected={selectedName === jointName} onSelect={onSelect} jointRefs={jointRefs}>
            {joint.children.map(childName => (
                <SkeletonJoint key={childName} jointName={childName} skeleton={skeleton} pose={pose}
                    selectedName={selectedName} onSelect={onSelect} jointRefs={jointRefs} />
            ))}
        </Joint>
    );
};

// Scene content
const SceneContent = ({ onCapture, pose, setPose, selectedName, setSelectedName, showBody, bodyColor, proportions, cameraPreset, setCameraPreset }: {
    onCapture: (dataUrl: string) => void; pose: PoseData; setPose: React.Dispatch<React.SetStateAction<PoseData>>;
    selectedName: string | null; setSelectedName: React.Dispatch<React.SetStateAction<string | null>>;
    showBody: boolean; bodyColor: string; proportions: BodyProportions; cameraPreset: string | null;
    setCameraPreset: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
    const { gl, scene, camera } = useThree();
    const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
    const controlsRef = useRef<any>(null);
    const transformRef = useRef<any>(null);
    const jointRefs = useRef<Record<string, THREE.Group | null>>({});
    const skeleton = useMemo(() => createSkeletonStructure(proportions), [proportions]);

    const handleSelect = useCallback((name: string, obj: THREE.Object3D) => {
        setSelectedName(name); setSelectedObject(obj);
    }, [setSelectedName]);

    // Camera preset handling
    useEffect(() => {
        if (cameraPreset && controlsRef.current) {
            const preset = CAMERA_PRESETS[cameraPreset as keyof typeof CAMERA_PRESETS];
            if (preset) {
                camera.position.set(...preset.position);
                controlsRef.current.target.set(...preset.target);
                controlsRef.current.update();
            }
            setCameraPreset(null);
        }
    }, [cameraPreset, camera, setCameraPreset]);

    // Transform controls change handler
    useEffect(() => {
        if (!transformRef.current || !selectedName) return;
        const controls = transformRef.current;
        const handleChange = () => {
            if (selectedObject) {
                const euler = new THREE.Euler().setFromQuaternion(selectedObject.quaternion);
                setPose(prev => ({ ...prev, [selectedName]: { x: euler.x, y: euler.y, z: euler.z } }));
            }
        };
        controls.addEventListener('change', handleChange);
        return () => controls.removeEventListener('change', handleChange);
    }, [selectedObject, selectedName, setPose]);

    // Capture function
    useEffect(() => {
        window.capturePose = () => {
            const originalPos = camera.position.clone();
            const originalTarget = controlsRef.current?.target.clone();
            camera.position.set(0, 1, 5); camera.lookAt(0, 1, 0); camera.updateMatrixWorld();
            if (controlsRef.current) { controlsRef.current.target.set(0, 1, 0); controlsRef.current.update(); }
            if (transformRef.current) transformRef.current.visible = false;
            gl.render(scene, camera);
            const dataUrl = gl.domElement.toDataURL("image/png");
            if (transformRef.current) transformRef.current.visible = true;
            camera.position.copy(originalPos);
            if (controlsRef.current && originalTarget) { controlsRef.current.target.copy(originalTarget); controlsRef.current.update(); }
            onCapture(dataUrl);
        };
        return () => { delete window.capturePose; };
    }, [gl, scene, camera, onCapture]);

    return (
        <>
            <color attach="background" args={["#0a0a0f"]} />
            <ambientLight intensity={0.35} />
            <directionalLight position={[5, 8, 5]} intensity={0.7} castShadow />
            <directionalLight position={[-3, 4, -3]} intensity={0.3} />
            <pointLight position={[0, 3, 2]} intensity={0.2} color="#8B5CF6" />
            <Grid position={[0, 0, 0]} args={[12, 12]} cellSize={0.25} cellThickness={0.5} cellColor="#1a1a2e"
                sectionSize={1} sectionThickness={1} sectionColor="#2a2a4e" fadeDistance={20} fadeStrength={1} />
            <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={12} blur={2.5} far={4} />
            <OrbitControls ref={controlsRef} makeDefault target={[0, 1, 0]} maxPolarAngle={Math.PI * 0.9} minDistance={2} maxDistance={15} />
            {selectedObject && <TransformControls ref={transformRef} object={selectedObject} mode="rotate" size={0.5} />}
            <group>
                <SkeletonJoint jointName="hips" skeleton={skeleton} pose={pose} selectedName={selectedName} onSelect={handleSelect} jointRefs={jointRefs} />
                <BodyMesh jointRefs={jointRefs} showBody={showBody} bodyColor={bodyColor} />
            </group>
        </>
    );
};

// ============ UI COMPONENTS ============
const PanelSection = ({ title, icon: Icon, children, defaultOpen = true }: { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-white/5">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                <span className="text-xs font-semibold text-white flex items-center gap-2"><Icon className="w-4 h-4 text-primary" />{title}</span>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="px-4 pb-4">{children}</div>}
        </div>
    );
};

const SliderControl = ({ label, value, onChange, min = 0.5, max = 1.5, step = 0.1 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) => (
    <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-text-muted w-24">{label}</span>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
        <span className="text-xs text-white font-mono w-10 text-right">{value.toFixed(1)}</span>
    </div>
);

// ============ MAIN COMPONENT ============
export default function PoseEditor({ onSave, onCancel }: { onSave: (dataUrl: string) => void; onCancel: () => void }) {
    const [pose, setPose] = useState<PoseData>({});
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [history, setHistory] = useState<PoseData[]>([{}]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [showBody, setShowBody] = useState(true);
    const [bodyColor, setBodyColor] = useState("#6366f1");
    const [symmetryMode, setSymmetryMode] = useState(false);
    const [proportions, setProportions] = useState<BodyProportions>(DEFAULT_PROPORTIONS);
    const [cameraPreset, setCameraPreset] = useState<string | null>(null);
    const [showLeftPanel, setShowLeftPanel] = useState(true);

    // History management
    const saveToHistory = useCallback((newPose: PoseData) => {
        setHistory(prev => [...prev.slice(0, historyIndex + 1), newPose]);
        setHistoryIndex(prev => prev + 1);
    }, [historyIndex]);

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) { setHistoryIndex(prev => prev - 1); setPose(history[historyIndex - 1]); }
    }, [historyIndex, history]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) { setHistoryIndex(prev => prev + 1); setPose(history[historyIndex + 1]); }
    }, [historyIndex, history]);

    // Symmetry mode
    const lastRotationRef = useRef<JointRotation | null>(null);
    useEffect(() => {
        if (!symmetryMode || !selectedName) return;
        const currentRot = pose[selectedName];
        if (!currentRot) return;
        if (lastRotationRef.current && lastRotationRef.current.x === currentRot.x && lastRotationRef.current.y === currentRot.y && lastRotationRef.current.z === currentRot.z) return;
        lastRotationRef.current = { ...currentRot };
        const mirrorMap: Record<string, string> = {
            r_shoulder: "l_shoulder", r_elbow: "l_elbow", r_wrist: "l_wrist", r_hand: "l_hand",
            r_hip: "l_hip", r_knee: "l_knee", r_ankle: "l_ankle", r_foot: "l_foot",
            l_shoulder: "r_shoulder", l_elbow: "r_elbow", l_wrist: "r_wrist", l_hand: "r_hand",
            l_hip: "r_hip", l_knee: "r_knee", l_ankle: "r_ankle", l_foot: "r_foot",
        };
        const mirrorJoint = mirrorMap[selectedName];
        if (mirrorJoint) setPose(prev => ({ ...prev, [mirrorJoint]: { x: currentRot.x, y: -currentRot.y, z: -currentRot.z } }));
    }, [selectedName ? pose[selectedName]?.x : null, selectedName ? pose[selectedName]?.y : null, selectedName ? pose[selectedName]?.z : null, selectedName, symmetryMode]);

    const applyPreset = useCallback((presetKey: string) => {
        const preset = PRESET_POSES[presetKey];
        if (preset) { setPose(preset.pose); saveToHistory(preset.pose); }
    }, [saveToHistory]);

    const mirrorPose = useCallback(() => {
        const mirrored: PoseData = {};
        Object.entries(pose).forEach(([name, rot]) => {
            let newName = name;
            if (name.startsWith("r_")) newName = "l_" + name.slice(2);
            else if (name.startsWith("l_")) newName = "r_" + name.slice(2);
            mirrored[newName] = { x: rot.x, y: -rot.y, z: -rot.z };
        });
        setPose(mirrored); saveToHistory(mirrored);
    }, [pose, saveToHistory]);

    const handleReset = useCallback(() => { setPose({}); setSelectedName(null); saveToHistory({}); }, [saveToHistory]);
    const handleSave = () => { if (window.capturePose) window.capturePose(); };

    return (
        <div className="relative w-full h-full bg-[#0a0a0f] overflow-hidden flex">
            {/* Left Panel */}
            <div className={`${showLeftPanel ? 'w-72' : 'w-0'} bg-[#0f0f15] border-r border-white/5 flex flex-col overflow-hidden transition-all duration-300`}>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Pose Presets */}
                    <PanelSection title="Pose Presets" icon={Zap}>
                        <div className="grid grid-cols-2 gap-1.5">
                            {Object.entries(PRESET_POSES).map(([key, { name }]) => (
                                <button key={key} onClick={() => applyPreset(key)}
                                    className="px-3 py-2.5 text-xs text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left border border-transparent hover:border-white/10">
                                    {name}
                                </button>
                            ))}
                        </div>
                    </PanelSection>

                    {/* Camera Views */}
                    <PanelSection title="Camera Views" icon={Camera}>
                        <div className="grid grid-cols-2 gap-1.5">
                            {Object.entries(CAMERA_PRESETS).map(([key, { name }]) => (
                                <button key={key} onClick={() => setCameraPreset(key)}
                                    className="px-3 py-2.5 text-xs text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left border border-transparent hover:border-white/10">
                                    {name}
                                </button>
                            ))}
                        </div>
                    </PanelSection>

                    {/* Body Proportions */}
                    <PanelSection title="Body Proportions" icon={Sliders} defaultOpen={false}>
                        <div className="space-y-3">
                            <SliderControl label="Height" value={proportions.height} onChange={(v) => setProportions(p => ({ ...p, height: v }))} />
                            <SliderControl label="Arm Length" value={proportions.armLength} onChange={(v) => setProportions(p => ({ ...p, armLength: v }))} />
                            <SliderControl label="Leg Length" value={proportions.legLength} onChange={(v) => setProportions(p => ({ ...p, legLength: v }))} />
                            <SliderControl label="Shoulders" value={proportions.shoulderWidth} onChange={(v) => setProportions(p => ({ ...p, shoulderWidth: v }))} />
                            <SliderControl label="Hips" value={proportions.hipWidth} onChange={(v) => setProportions(p => ({ ...p, hipWidth: v }))} />
                            <SliderControl label="Head Size" value={proportions.headSize} onChange={(v) => setProportions(p => ({ ...p, headSize: v }))} />
                            <button onClick={() => setProportions(DEFAULT_PROPORTIONS)}
                                className="w-full mt-2 px-3 py-2 text-xs text-text-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                Reset Proportions
                            </button>
                        </div>
                    </PanelSection>
                </div>
            </div>

            {/* Toggle Left Panel */}
            <button onClick={() => setShowLeftPanel(!showLeftPanel)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-50 p-1.5 bg-[#1a1a2e] border border-white/10 rounded-r-lg hover:bg-white/10 transition-colors"
                style={{ left: showLeftPanel ? '288px' : '0' }}>
                {showLeftPanel ? <ChevronLeft className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
            </button>

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col relative">
                {/* Top Toolbar */}
                <div className="absolute top-0 left-0 right-0 z-40 p-4 flex items-center justify-between pointer-events-none">
                    <Button variant="secondary" size="icon" onClick={onCancel}
                        className="pointer-events-auto bg-[#1a1a2e]/90 backdrop-blur text-text-muted hover:text-white hover:bg-[#2a2a4e] border border-white/10">
                        <X className="w-5 h-5" />
                    </Button>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        {/* Undo/Redo */}
                        <div className="flex items-center bg-[#1a1a2e]/90 backdrop-blur rounded-lg border border-white/10 overflow-hidden">
                            <button onClick={handleUndo} disabled={historyIndex <= 0}
                                className="p-2 hover:bg-white/10 disabled:opacity-30 transition-colors"><Undo2 className="w-4 h-4 text-text-muted" /></button>
                            <div className="w-px h-6 bg-white/10" />
                            <button onClick={handleRedo} disabled={historyIndex >= history.length - 1}
                                className="p-2 hover:bg-white/10 disabled:opacity-30 transition-colors"><Redo2 className="w-4 h-4 text-text-muted" /></button>
                        </div>

                        {/* Symmetry Mode */}
                        <button onClick={() => setSymmetryMode(!symmetryMode)} title="Symmetry Mode"
                            className={`p-2 rounded-lg border transition-colors ${symmetryMode ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-[#1a1a2e]/90 border-white/10 text-text-muted hover:bg-white/10'}`}>
                            <FlipHorizontal className="w-4 h-4" />
                        </button>

                        {/* Body Toggle */}
                        <button onClick={() => setShowBody(!showBody)} title="Toggle Body"
                            className={`p-2 rounded-lg border transition-colors ${showBody ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-[#1a1a2e]/90 border-white/10 text-text-muted hover:bg-white/10'}`}>
                            {showBody ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        {/* Mirror */}
                        <button onClick={mirrorPose} title="Mirror Pose" className="p-2 bg-[#1a1a2e]/90 backdrop-blur rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                            <Users className="w-4 h-4 text-text-muted" />
                        </button>

                        {/* Body Color */}
                        <input type="color" value={bodyColor} onChange={(e) => setBodyColor(e.target.value)} title="Body Color"
                            className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent" />

                        {/* Reset */}
                        <Button variant="secondary" size="sm" onClick={handleReset}
                            className="bg-[#1a1a2e]/90 backdrop-blur text-text-muted hover:text-white hover:bg-[#2a2a4e] border border-white/10 h-8">
                            <RotateCcw className="w-4 h-4 mr-1.5" />Reset
                        </Button>

                        {/* Save */}
                        <Button variant="default" size="sm" onClick={handleSave}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 h-8 px-4">
                            <Save className="w-4 h-4 mr-1.5" />Save Pose
                        </Button>
                    </div>
                </div>

                {/* 3D Canvas */}
                <div className="flex-1">
                    <Canvas gl={{ preserveDrawingBuffer: true, antialias: true }} shadows>
                        <PerspectiveCamera makeDefault position={[3, 2, 5]} fov={40} />
                        <SceneContent onCapture={onSave} pose={pose} setPose={setPose} selectedName={selectedName}
                            setSelectedName={setSelectedName} showBody={showBody} bodyColor={bodyColor}
                            proportions={proportions} cameraPreset={cameraPreset} setCameraPreset={setCameraPreset} />
                    </Canvas>
                </div>

                {/* Bottom Hint */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                    <div className="bg-[#1a1a2e]/80 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-xs text-text-muted flex items-center gap-3">
                        <span className="flex items-center gap-1.5"><Move3D className="w-3.5 h-3.5" />Drag to orbit</span>
                        <span className="w-px h-3 bg-white/20" />
                        <span className="flex items-center gap-1.5"><RotateCw className="w-3.5 h-3.5" />Click joint to rotate</span>
                        {symmetryMode && <><span className="w-px h-3 bg-white/20" /><span className="text-primary">Symmetry ON</span></>}
                    </div>
                </div>
            </div>

            {/* Right Panel - Joint Info */}
            {selectedName && (
                <div className="w-56 bg-[#0f0f15] border-l border-white/5 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: JOINT_COLORS[selectedName] }} />
                        <span className="text-sm font-semibold text-white capitalize">{selectedName.replace("_", " ")}</span>
                    </div>
                    <div className="space-y-3">
                        {(["x", "y", "z"] as const).map(axis => (
                            <div key={axis} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-text-muted uppercase">{axis} Rotation</span>
                                    <span className="text-white font-mono">{((pose[selectedName]?.[axis] || 0) * 180 / Math.PI).toFixed(1)}°</span>
                                </div>
                                <input type="range" min={-180} max={180} step={1}
                                    value={(pose[selectedName]?.[axis] || 0) * 180 / Math.PI}
                                    onChange={(e) => {
                                        const rad = parseFloat(e.target.value) * Math.PI / 180;
                                        setPose(prev => ({ ...prev, [selectedName]: { ...(prev[selectedName] || {x:0,y:0,z:0}), [axis]: rad } }));
                                    }}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
