import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { viewportStyles as styles } from './ViewportPanel.styles';

interface OrientationGizmoProps {
    camera: THREE.Camera;
}

export const OrientationGizmo: React.FC<OrientationGizmoProps> = ({ camera }) => {
    const [rotation, setRotation] = useState(new THREE.Euler());
    const requestRef = useRef<number>();

    const animate = () => {
        setRotation(camera.rotation.clone());
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [camera]);

    const size = 100;
    const center = size / 2;
    const length = 35;

    // Projection math
    const projectX = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).multiplyScalar(length);
    const projectY = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).multiplyScalar(length);
    const projectZ = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion).multiplyScalar(length);

    // Negative axes for dots
    const projectNegX = new THREE.Vector3(-1, 0, 0).applyQuaternion(camera.quaternion).multiplyScalar(length);
    const projectNegY = new THREE.Vector3(0, -1, 0).applyQuaternion(camera.quaternion).multiplyScalar(length);
    const projectNegZ = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).multiplyScalar(length);

    const Axis = ({ vec, color, label }: { vec: THREE.Vector3; color: string; label: string }) => {
        const isBehind = vec.z > 0;
        return (
            <g style={{ opacity: isBehind ? 0.3 : 1 }}>
                <line 
                    x1={center} y1={center} 
                    x2={center + vec.x} y2={center - vec.y} 
                    stroke={color} strokeWidth="2.5" strokeLinecap="round" 
                />
                <circle 
                    cx={center + vec.x} cy={center - vec.y} 
                    r="8" fill={color} 
                />
                <text 
                    x={center + vec.x} y={center - vec.y} 
                    fill="white" fontSize="9" fontWeight="800" textAnchor="middle" alignmentBaseline="central"
                >
                    {label}
                </text>
            </g>
        );
    };

    const Dot = ({ vec, color }: { vec: THREE.Vector3; color: string }) => {
        const isBehind = vec.z > 0;
        if (isBehind) return null;
        return (
            <circle 
                cx={center + vec.x} cy={center - vec.y} 
                r="3" fill="transparent" stroke={color} strokeWidth="1.5"
            />
        );
    };

    return (
        <div style={styles.orientationGizmo}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Reference circle */}
                <circle cx={center} cy={center} r={length + 10} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" />
                
                {/* Back dots */}
                <Dot vec={projectNegX} color="#f87171" />
                <Dot vec={projectNegY} color="#4ade80" />
                <Dot vec={projectNegZ} color="#60a5fa" />

                {/* Main Axes */}
                <Axis vec={projectZ} color="#60a5fa" label="Z" />
                <Axis vec={projectX} color="#f87171" label="X" />
                <Axis vec={projectY} color="#4ade80" label="Y" />

                {/* Center dot */}
                <circle cx={center} cy={center} r="3" fill="white" style={{ opacity: 0.5 }} />
            </svg>
        </div>
    );
};
