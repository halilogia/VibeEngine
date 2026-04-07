export function generateHTMLTemplate(gameName: string, sceneData: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${gameName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow: hidden; background: #1a1a2e; font-family: system-ui, sans-serif; }
        canvas { display: block; width: 100vw; height: 100vh; }
        .loading { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: #1a1a2e; color: white; font-size: 24px; }
        .loading.hidden { display: none; }
    </style>
</head>
<body>
    <div id="loading" class="loading">Loading ${gameName}...</div>
    <canvas id="game"></canvas>
    <script type="importmap">
    {"imports": {"three": "https://unpkg.com/three@0.160.0/build/three.module.js", "three/examples/jsm/": "https://unpkg.com/three@0.160.0/examples/jsm/"}}
    </script>
    <script type="module">
        import * as THREE from 'three';
        import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
        const sceneData = ${sceneData};
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
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambient);
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(10, 20, 10);
        directional.castShadow = true;
        scene.add(directional);
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
        for (const entity of sceneData.entities) {
            const renderComp = entity.components.find(c => c.type === 'Render');
            const transformComp = entity.components.find(c => c.type === 'Transform');
            if (renderComp) {
                const mesh = createMesh(renderComp.data.meshType || 'cube', renderComp.data.color || '#6366f1');
                if (transformComp) {
                    const pos = transformComp.data.position || [0, 0, 0];
                    const rot = transformComp.data.rotation || [0, 0, 0];
                    const scl = transformComp.data.scale || [1, 1, 1];
                    mesh.position.set(pos[0], pos[1], pos[2]);
                    mesh.rotation.set(THREE.MathUtils.degToRad(rot[0]), THREE.MathUtils.degToRad(rot[1]), THREE.MathUtils.degToRad(rot[2]));
                    mesh.scale.set(scl[0], scl[1], scl[2]);
                }
                scene.add(mesh);
            }
        }
        loading.classList.add('hidden');
        function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
        animate();
        window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
        console.log('🎮 ${gameName} loaded!', sceneData.name);
    </script>
</body>
</html>`;
}

export function generateMobileRuntime(gameName: string, sceneData: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>${gameName} - Mobile</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { overflow: hidden; background: #000; color: #fff; font-family: sans-serif; }
        canvas { display: block; width: 100%; height: 100vh; }
        #ui { position: fixed; inset: 0; pointer-events: none; }
        .loading { position: fixed; inset: 0; background: #050508; display: flex; align-items: center; justify-content: center; z-index: 100; }
    </style>
</head>
<body>
    <div id="loading" class="loading">🚀 VibeEngine Loading...</div>
    <canvas id="game"></canvas>
    <script type="importmap">
    {"imports": {"three": "https://unpkg.com/three@0.160.0/build/three.module.js", "three/examples/jsm/": "https://unpkg.com/three@0.160.0/examples/jsm/"}}
    </script>
    <script type="module">
        import * as THREE from 'three';
        import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
        import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
        const sceneData = ${sceneData};
        const canvas = document.getElementById('game');
        const loader = new GLTFLoader();
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050508);
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
        camera.position.set(150, 150, 150);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambient);
        const sun = new THREE.DirectionalLight(0xffffff, 1.2);
        sun.position.set(100, 200, 100);
        scene.add(sun);
        const entities = new Map();
        sceneData.entities.forEach(ent => {
            const group = new THREE.Group();
            const render = ent.components.find(c => c.type === 'Render');
            const transform = ent.components.find(c => c.type === 'Transform');
            if (render && render.data.meshType === 'model' && render.data.modelPath) {
                loader.load(render.data.modelPath, (glb) => { group.add(glb.scene); });
            } else if (render) {
                const geom = new THREE.BoxGeometry(1, 1, 1);
                const mat = new THREE.MeshStandardMaterial({ color: render.data.color || 0x6366f1 });
                group.add(new THREE.Mesh(geom, mat));
            }
            if (transform) {
                const p = transform.data.position || [0,0,0], r = transform.data.rotation || [0,0,0], s = transform.data.scale || [1,1,1];
                group.position.set(p[0], p[1], p[2]);
                group.rotation.set(r[0] * Math.PI/180, r[1] * Math.PI/180, r[2] * Math.PI/180);
                group.scale.set(s[0], s[1], s[2]);
            }
            entities.set(ent.id, group);
        });
        sceneData.entities.forEach(ent => {
            const mesh = entities.get(ent.id);
            if (ent.parentId !== null) { const parent = entities.get(ent.parentId); if (parent) parent.add(mesh); }
            else { scene.add(mesh); }
        });
        document.getElementById('loading').style.display = 'none';
        function animate() { requestAnimationFrame(animate); renderer.render(scene, camera); }
        animate();
        window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
    </script>
</body>
</html>`;
}