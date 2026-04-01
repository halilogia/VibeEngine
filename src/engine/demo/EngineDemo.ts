/**
 * Engine Demo - Test the game engine
 * This file demonstrates basic engine usage.
 */

import * as THREE from 'three';
import {
    Application,
    Entity,
    TransformComponent,
    RenderComponent,
    ScriptComponent,
    Script,
    CollisionComponent,
    InputSystem,
    ScriptSystem,
    PhysicsSystem,
    RenderSystem,
    Prefab,
} from '..';

// ============ DEMO SCRIPTS ============

class RotatorScript extends Script {
    speed = 1;

    update(deltaTime: number): void {
        const transform = this.getComponent(TransformComponent);
        if (transform) {
            transform.rotate(0, this.speed * deltaTime, 0);
        }
    }

    onDestroy(): void {
        console.log('🔇 [RotatorScript] Cleanup');
    }
}

class PlayerMoveScript extends Script {
    speed = 5;

    update(deltaTime: number): void {
        const transform = this.getComponent(TransformComponent);
        const input = this.app?.getSystem(InputSystem);

        if (transform && input) {
            transform.translate(
                input.state.horizontal * this.speed * deltaTime,
                0,
                -input.state.vertical * this.speed * deltaTime
            );
        }
    }

    onDestroy(): void {
        console.log('🔇 [PlayerMoveScript] Cleanup');
    }
}

// ============ DEMO SETUP ============

export function runEngineDemo(canvas: HTMLCanvasElement): Application {
    console.log('🚀 Starting Engine Demo...');

    // Create application
    const app = new Application(canvas, {
        backgroundColor: 0x1a1a2e,
        antialias: true,
    });

    // Add systems
    app.addSystem(new InputSystem());
    app.addSystem(new ScriptSystem());
    app.addSystem(new PhysicsSystem());
    app.addSystem(new RenderSystem());

    // Create floor
    const floor = new Entity('Floor');
    floor.addComponent(new TransformComponent().setPosition(0, -0.5, 0));
    const floorGeometry = new THREE.BoxGeometry(20, 1, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x16213e });
    const floorRender = new RenderComponent(new THREE.Mesh(floorGeometry, floorMaterial));
    floorRender.receiveShadow = true;
    floor.addComponent(floorRender);
    app.scene.addEntity(floor);

    // Create rotating cube prefab
    const cubePrefab = new Prefab('RotatingCube')
        .addComponentFactory(() => new TransformComponent())
        .addComponentFactory(() => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: 0xe94560 });
            return new RenderComponent(new THREE.Mesh(geometry, material));
        })
        .addComponentFactory(() => {
            const script = new ScriptComponent();
            script.addScript(new RotatorScript());
            return script;
        })
        .addComponentFactory(() => new CollisionComponent({ type: 'box' }));

    // Spawn multiple cubes
    for (let i = 0; i < 5; i++) {
        const cube = cubePrefab.instantiate(app.scene);
        const transform = cube.getComponent(TransformComponent);
        if (transform) {
            transform.setPosition((i - 2) * 3, 0.5, -5);
        }
        // Vary rotation speed
        const script = cube.getComponent(ScriptComponent);
        const rotator = script?.getScript(RotatorScript);
        if (rotator) {
            rotator.speed = 0.5 + Math.random() * 2;
        }
    }

    // Create player (controllable sphere)
    const player = new Entity('Player');
    player.addComponent(new TransformComponent().setPosition(0, 0.5, 5));
    const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0f3460 });
    const playerRender = new RenderComponent(new THREE.Mesh(playerGeometry, playerMaterial));
    player.addComponent(playerRender);
    const playerScripts = new ScriptComponent();
    playerScripts.addScript(new PlayerMoveScript());
    player.addComponent(playerScripts);
    player.addComponent(new CollisionComponent({ type: 'sphere', radius: 0.5 }));
    player.tags.add('player');
    app.scene.addEntity(player);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    app.threeScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    app.threeScene.add(directionalLight);

    // Position camera
    app.camera.position.set(0, 10, 15);
    app.camera.lookAt(0, 0, 0);

    // Start game loop
    app.start();

    console.log('✅ Engine Demo running!');
    console.log('📊 Entities:', app.scene.entityCount);
    console.log('🎮 Use WASD to move the player');

    return app;
}
