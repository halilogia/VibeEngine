import * as THREE from 'three';

export class MeshUtils {
    static createMesh(type: string, color: string | number = 0x6366f1): THREE.Object3D {
        let geometry: THREE.BufferGeometry;
        
        switch (type.toLowerCase()) {
            case 'sphere': geometry = new THREE.SphereGeometry(0.5, 32, 32); break;
            case 'cylinder': geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32); break;
            case 'plane': geometry = new THREE.PlaneGeometry(1, 1); break;
            case 'capsule': geometry = new THREE.CapsuleGeometry(0.3, 0.5, 4, 16); break;
            case 'cube':
            default: geometry = new THREE.BoxGeometry(1, 1, 1); break;
        }

        // Use MeshStandardMaterial for professional physically-based rendering
        const material = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(color),
            roughness: 0.5, // Less plastic
            metalness: 0.1
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    }
}
