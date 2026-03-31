/**
 * Game Exporter - Export scene as standalone HTML/Electron app
 */

import { serializeScene } from './SceneSerializer';

/**
 * Generate standalone HTML game file
 */
export function exportToHTML(gameName: string = 'MyGame'): void {
    const sceneData = serializeScene();

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${gameName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            overflow: hidden; 
            background: #1a1a2e; 
            font-family: system-ui, sans-serif;
        }
        canvas { display: block; width: 100vw; height: 100vh; }
        .loading {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #1a1a2e;
            color: white;
            font-size: 24px;
        }
        .loading.hidden { display: none; }
    </style>
</head>
<body>
    <div id="loading" class="loading">Loading ${gameName}...</div>
    <canvas id="game"></canvas>

    <script type="importmap">
    {
        "imports": {
            "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
            "three/examples/jsm/": "https://unpkg.com/three@0.160.0/examples/jsm/"
        }
    }
    </script>
    
    <script type="module">
        import * as THREE from 'three';
        import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
        
        // Scene data embedded
        const sceneData = ${sceneData};
        
        // Setup
        const canvas = document.getElementById('game');
        const loading = document.getElementById('loading');
        
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 0, 0);
        
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        
        const controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;
        
        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambient);
        
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(10, 20, 10);
        directional.castShadow = true;
        scene.add(directional);
        
        // Create entities from scene data
        function createMesh(meshType, color) {
            let geometry;
            switch (meshType) {
                case 'sphere': geometry = new THREE.SphereGeometry(0.5, 16, 16); break;
                case 'cylinder': geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16); break;
                case 'plane': geometry = new THREE.PlaneGeometry(1, 1); break;
                case 'capsule': geometry = new THREE.CapsuleGeometry(0.3, 0.5, 4, 8); break;
                default: geometry = new THREE.BoxGeometry(1, 1, 1);
            }
            const material = new THREE.MeshStandardMaterial({ color });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        }
        
        // Load entities
        for (const entity of sceneData.entities) {
            const renderComp = entity.components.find(c => c.type === 'Render');
            const transformComp = entity.components.find(c => c.type === 'Transform');
            
            if (renderComp) {
                const mesh = createMesh(
                    renderComp.data.meshType || 'cube',
                    renderComp.data.color || '#6366f1'
                );
                
                if (transformComp) {
                    const pos = transformComp.data.position || [0, 0, 0];
                    const rot = transformComp.data.rotation || [0, 0, 0];
                    const scl = transformComp.data.scale || [1, 1, 1];
                    
                    mesh.position.set(pos[0], pos[1], pos[2]);
                    mesh.rotation.set(
                        THREE.MathUtils.degToRad(rot[0]),
                        THREE.MathUtils.degToRad(rot[1]),
                        THREE.MathUtils.degToRad(rot[2])
                    );
                    mesh.scale.set(scl[0], scl[1], scl[2]);
                }
                
                scene.add(mesh);
            }
        }
        
        // Hide loading
        loading.classList.add('hidden');
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
        
        // Handle resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        console.log('🎮 ${gameName} loaded!', sceneData.name);
    </script>
</body>
</html>`;

    // Download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${gameName.replace(/\\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('📦 Game exported as HTML!');
}

/**
 * Get export options for the menu
 */
export function getExportFormats(): { label: string; action: () => void }[] {
    return [
        { label: 'Export as HTML', action: () => exportToHTML('MyGame') },
        { label: 'Export as ZIP', action: () => alert('ZIP export coming soon!') },
    ];
}
