"use client";

import React, { useState, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
    OrbitControls,
    TransformControls,
    Grid,
    useCursor,
    Html,
} from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save, X } from "lucide-react";

// --- OpenPose Colors & Style ---
// Standard OpenPose COCO colors (approximate for visual matching)
const COLORS = {
    nose: "#ff0000",
    neck: "#ff5500",
    r_shoulder: "#ffaa00",
    r_elbow: "#ffff00",
    r_wrist: "#aaff00",
    l_shoulder: "#55ff00",
    l_elbow: "#00ff00",
    l_wrist: "#00ff55",
    r_hip: "#00ffff",
    r_knee: "#00aaff",
    r_ankle: "#0055ff",
    l_hip: "#0000ff",
    l_knee: "#aa00ff",
    l_ankle: "#ff00ff",
    r_eye: "#ff00aa",
    l_eye: "#ff0055",
    r_ear: "#ff0000",
    l_ear: "#cc0000",
};

const LIMB_COLORS = {
    torso: "#ff5500", // Neck to Hip
    r_arm: "#ffaa00",
    r_forearm: "#ffff00",
    l_arm: "#55ff00",
    l_forearm: "#00ff00",
    r_thigh: "#00ffff",
    r_shin: "#00aaff",
    l_thigh: "#0000ff",
    l_shin: "#aa00ff",
};

// --- Components ---

const Joint = ({
    position,
    name,
    color,
    isSelected,
    onSelect,
    children,
    radius = 0.08,
}: {
    position: [number, number, number];
    name: string;
    color: string;
    isSelected: boolean;
    onSelect: (name: string, object: THREE.Object3D) => void;
    children?: React.ReactNode;
    radius?: number;
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    useCursor(hovered);

    return (
        <group ref={groupRef} position={position}>
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();
                    if (groupRef.current) onSelect(name, groupRef.current);
                }}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <sphereGeometry args={[radius, 16, 16]} />
                <meshBasicMaterial
                    color={isSelected ? "#ffffff" : color}
                    toneMapped={false}
                />
                {/* Selection Halo */}
                {isSelected && (
                    <mesh scale={[1.5, 1.5, 1.5]}>
                        <sphereGeometry args={[radius, 16, 16]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} toneMapped={false} />
                    </mesh>
                )}
            </mesh>
            {children}
        </group>
    );
};

const Limb = ({
    position,
    length,
    color,
    rotation = [0, 0, 0],
}: {
    position: [number, number, number];
    length: number;
    color: string;
    rotation?: [number, number, number];
}) => {
    return (
        <mesh position={position} rotation={new THREE.Euler(...rotation)}>
            <cylinderGeometry args={[0.04, 0.04, length, 8]} />
            <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
    );
};

// --- Scene Content ---

const SceneContent = ({
    onCapture,
}: {
    onCapture: (dataUrl: string) => void;
}) => {
    const { gl, scene, camera } = useThree();
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(
        null
    );

    // Refs for helpers we want to hide during capture
    const gridRef = useRef<any>(null);
    const controlsRef = useRef<any>(null);

    const handleSelect = (name: string, object: THREE.Object3D) => {
        setSelectedName(name);
        setSelectedObject(object);
    };

    useEffect(() => {
        // @ts-ignore
        window.capturePose = () => {
            // 1. Reset Camera to Front View (User Requirement)
            // Adjusted to fit full body (approx height 4-5 units)
            camera.position.set(0, 0, 7);
            camera.lookAt(0, -0.5, 0);
            camera.updateMatrixWorld();

            if (controlsRef.current) {
                controlsRef.current.target.set(0, -0.5, 0);
                controlsRef.current.update();
            }

            // 2. Hide helpers
            const originalGridVisible = gridRef.current?.visible;
            const originalControlsVisible = controlsRef.current?.visible;

            if (gridRef.current) gridRef.current.visible = false;
            if (controlsRef.current) controlsRef.current.visible = false;

            // Hack: force a render without the helpers
            gl.render(scene, camera);
            const dataUrl = gl.domElement.toDataURL("image/png");

            // 3. Restore helpers
            if (gridRef.current) gridRef.current.visible = originalGridVisible;
            if (controlsRef.current) controlsRef.current.visible = originalControlsVisible;

            onCapture(dataUrl);
        };
        return () => {
            // @ts-ignore
            delete window.capturePose;
        };
    }, [gl, scene, camera, onCapture]);

    return (
        <>
            <color attach="background" args={["#000000"]} />
            <ambientLight intensity={0.5} />

            <group ref={gridRef}>
                <Grid
                    position={[0, -2, 0]}
                    args={[10, 10]}
                    cellSize={0.5}
                    cellThickness={0.5}
                    cellColor="#333"
                    sectionSize={2}
                    sectionThickness={1}
                    sectionColor="#555"
                    fadeDistance={20}
                    fadeStrength={1}
                />
            </group>

            <OrbitControls ref={controlsRef} makeDefault />

            {selectedObject && (
                <TransformControls
                    object={selectedObject}
                    mode="rotate"
                    size={0.8}
                />
            )}

            {/* Root: Hips (Center) */}
            <Joint
                name="hips"
                position={[0, 0, 0]}
                color={COLORS.l_hip} // Using a central color
                isSelected={selectedName === "hips"}
                onSelect={handleSelect}
                radius={0.1}
            >
                {/* Spine/Torso Limb */}
                <Limb position={[0, 0.75, 0]} length={1.5} color={LIMB_COLORS.torso} />

                {/* Neck */}
                <Joint
                    name="neck"
                    position={[0, 1.5, 0]}
                    color={COLORS.neck}
                    isSelected={selectedName === "neck"}
                    onSelect={handleSelect}
                >
                    {/* Head/Nose */}
                    <mesh position={[0, 0.5, 0]}>
                        <sphereGeometry args={[0.12, 16, 16]} />
                        <meshBasicMaterial color={COLORS.nose} toneMapped={false} />
                    </mesh>
                    {/* Eyes (Visual only) */}
                    <mesh position={[0.1, 0.55, 0.1]}>
                        <sphereGeometry args={[0.03]} />
                        <meshBasicMaterial color={COLORS.r_eye} toneMapped={false} />
                    </mesh>
                    <mesh position={[-0.1, 0.55, 0.1]}>
                        <sphereGeometry args={[0.03]} />
                        <meshBasicMaterial color={COLORS.l_eye} toneMapped={false} />
                    </mesh>

                    {/* Shoulder Connectors */}
                    {/* Right Shoulder Connector */}
                    <mesh position={[-0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
                        <meshBasicMaterial color={COLORS.r_shoulder} toneMapped={false} />
                    </mesh>
                    {/* Left Shoulder Connector */}
                    <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
                        <meshBasicMaterial color={COLORS.l_shoulder} toneMapped={false} />
                    </mesh>

                    {/* Right Shoulder */}
                    <Joint
                        name="r_shoulder"
                        position={[-0.5, 0, 0]}
                        color={COLORS.r_shoulder}
                        isSelected={selectedName === "r_shoulder"}
                        onSelect={handleSelect}
                    >
                        <Limb position={[0, -0.4, 0]} length={0.8} color={LIMB_COLORS.r_arm} />
                        {/* Right Elbow */}
                        <Joint
                            name="r_elbow"
                            position={[0, -0.8, 0]}
                            color={COLORS.r_elbow}
                            isSelected={selectedName === "r_elbow"}
                            onSelect={handleSelect}
                        >
                            <Limb position={[0, -0.4, 0]} length={0.8} color={LIMB_COLORS.r_forearm} />
                            {/* Right Wrist */}
                            <Joint
                                name="r_wrist"
                                position={[0, -0.8, 0]}
                                color={COLORS.r_wrist}
                                isSelected={selectedName === "r_wrist"}
                                onSelect={handleSelect}
                            />
                        </Joint>
                    </Joint>

                    {/* Left Shoulder */}
                    <Joint
                        name="l_shoulder"
                        position={[0.5, 0, 0]}
                        color={COLORS.l_shoulder}
                        isSelected={selectedName === "l_shoulder"}
                        onSelect={handleSelect}
                    >
                        <Limb position={[0, -0.4, 0]} length={0.8} color={LIMB_COLORS.l_arm} />
                        {/* Left Elbow */}
                        <Joint
                            name="l_elbow"
                            position={[0, -0.8, 0]}
                            color={COLORS.l_elbow}
                            isSelected={selectedName === "l_elbow"}
                            onSelect={handleSelect}
                        >
                            <Limb position={[0, -0.4, 0]} length={0.8} color={LIMB_COLORS.l_forearm} />
                            {/* Left Wrist */}
                            <Joint
                                name="l_wrist"
                                position={[0, -0.8, 0]}
                                color={COLORS.l_wrist}
                                isSelected={selectedName === "l_wrist"}
                                onSelect={handleSelect}
                            />
                        </Joint>
                    </Joint>
                </Joint>

                {/* Right Hip */}
                <Joint
                    name="r_hip"
                    position={[-0.3, -0.1, 0]}
                    color={COLORS.r_hip}
                    isSelected={selectedName === "r_hip"}
                    onSelect={handleSelect}
                >
                    <Limb position={[0, -0.5, 0]} length={1.0} color={LIMB_COLORS.r_thigh} />
                    {/* Right Knee */}
                    <Joint
                        name="r_knee"
                        position={[0, -1.0, 0]}
                        color={COLORS.r_knee}
                        isSelected={selectedName === "r_knee"}
                        onSelect={handleSelect}
                    >
                        <Limb position={[0, -0.5, 0]} length={1.0} color={LIMB_COLORS.r_shin} />
                        {/* Right Ankle */}
                        <Joint
                            name="r_ankle"
                            position={[0, -1.0, 0]}
                            color={COLORS.r_ankle}
                            isSelected={selectedName === "r_ankle"}
                            onSelect={handleSelect}
                        >
                            <mesh position={[0, -0.1, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
                                <cylinderGeometry args={[0.04, 0.04, 0.4]} />
                                <meshBasicMaterial color={COLORS.r_ankle} toneMapped={false} />
                            </mesh>
                        </Joint>
                    </Joint>
                </Joint>

                {/* Left Hip */}
                <Joint
                    name="l_hip"
                    position={[0.3, -0.1, 0]}
                    color={COLORS.l_hip}
                    isSelected={selectedName === "l_hip"}
                    onSelect={handleSelect}
                >
                    <Limb position={[0, -0.5, 0]} length={1.0} color={LIMB_COLORS.l_thigh} />
                    {/* Left Knee */}
                    <Joint
                        name="l_knee"
                        position={[0, -1.0, 0]}
                        color={COLORS.l_knee}
                        isSelected={selectedName === "l_knee"}
                        onSelect={handleSelect}
                    >
                        <Limb position={[0, -0.5, 0]} length={1.0} color={LIMB_COLORS.l_shin} />
                        {/* Left Ankle */}
                        <Joint
                            name="l_ankle"
                            position={[0, -1.0, 0]}
                            color={COLORS.l_ankle}
                            isSelected={selectedName === "l_ankle"}
                            onSelect={handleSelect}
                        >
                            <mesh position={[0, -0.1, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
                                <cylinderGeometry args={[0.04, 0.04, 0.4]} />
                                <meshBasicMaterial color={COLORS.l_ankle} toneMapped={false} />
                            </mesh>
                        </Joint>
                    </Joint>
                </Joint>
            </Joint>
        </>
    );
};

// --- Main Component ---

export default function PoseEditor({
    onSave,
    onCancel,
}: {
    onSave: (dataUrl: string) => void;
    onCancel: () => void;
}) {
    const handleSave = () => {
        // Trigger the capture via the window global we set up
        // @ts-ignore
        if (window.capturePose) window.capturePose();
    };

    return (
        <div className="relative w-full h-full bg-[#111] overflow-hidden flex flex-col">
            {/* Header / Toolbar */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 flex items-center justify-between pointer-events-none">
                {/* Left: Close */}
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={onCancel}
                    className="pointer-events-auto bg-surface/80 backdrop-blur text-text-muted hover:text-text hover:bg-surface border border-white/10 shadow-sm"
                >
                    <X className="w-5 h-5" />
                </Button>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            // Reset logic (reload or reset state)
                            // For now, we can just re-mount or reset rotation if we had access to it.
                            // A simple way is to notify parent to reset, or just keep it as is for now.
                        }}
                        className="bg-surface/80 backdrop-blur text-text-muted hover:text-text hover:bg-surface border border-white/10 shadow-sm h-9"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleSave}
                        className="bg-primary text-primary-foreground hover:bg-primary-600 shadow-lg shadow-primary/20 h-9 px-4"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Pose
                    </Button>
                </div>
            </div>

            {/* 3D Canvas */}
            <div className="flex-1 relative w-full h-full">
                <Canvas
                    camera={{ position: [0, 2, 5], fov: 50 }}
                    gl={{ preserveDrawingBuffer: true }}
                    className="w-full h-full block"
                >
                    <SceneContent onCapture={onSave} />
                </Canvas>
            </div>

            {/* Bottom Hint */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                <div className="bg-surface/80 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-xs text-text-muted shadow-lg whitespace-nowrap">
                    Click joints to rotate • Drag background to move camera
                </div>
            </div>
        </div>
    );
}
