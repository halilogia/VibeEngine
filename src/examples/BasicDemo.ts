/**
 * Basic Demo - Simple game with rotating cube
 */

import * as THREE from 'three';
import { Application, Scene, Entity, TransformComponent, RenderComponent } from '../engine';

// Create application
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const app = new Application({
    canvas,
    width: window.innerWidth,
    height: window.innerHeight
});

// Create scene
const scene = new Scene('Demo Scene');
app.loadScene(scene);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
app.scene?.threeScene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
app.scene?.threeScene.add(directionalLight);

// Create rotating cube
const cube = new Entity('Rotating Cube');
cube.addComponent(new TransformComponent());
cube.addComponent(new RenderComponent(
    new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshStandardMaterial({ color: 0x6366f1 })
    )
));
cube.getComponent(TransformComponent)?.setPosition(0, 1, 0);
scene.addEntity(cube);

// Create ground
const ground = new Entity('Ground');
ground.addComponent(new TransformComponent());
ground.addComponent(new RenderComponent(
    new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshStandardMaterial({ color: 0x333344 })
    )
));
const groundTransform = ground.getComponent(TransformComponent);
groundTransform?.setRotation(-Math.PI / 2, 0, 0);
(ground.getComponent(RenderComponent)?.object3D as THREE.Mesh).receiveShadow = true;
scene.addEntity(ground);

// Position camera
if (app.scene?.camera) {
    app.scene.camera.position.set(5, 5, 5);
    app.scene.camera.lookAt(0, 0, 0);
}

// Animation loop with cube rotation
const cubeTransform = cube.getComponent(TransformComponent);
const originalUpdate = app.update.bind(app);
app.update = (deltaTime: number) => {
    originalUpdate(deltaTime);
    if (cubeTransform) {
        cubeTransform.rotation.y += 0.5 * deltaTime;
    }
};

// Handle resize
window.addEventListener('resize', () => {
    app.renderer.setSize(window.innerWidth, window.innerHeight);
    if (app.scene?.camera) {
        app.scene.camera.aspect = window.innerWidth / window.innerHeight;
        app.scene.camera.updateProjectionMatrix();
    }
});

// Start
app.start();

console.log('🎮 Game Engine Demo Running!');
