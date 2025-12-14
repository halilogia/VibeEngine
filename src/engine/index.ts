/**
 * Game Engine - Main Entry Point
 * A PlayCanvas-inspired ECS game engine built with TypeScript and Three.js.
 * 
 * @example
 * import { Application, Entity, TransformComponent, RenderComponent } from './engine';
 * 
 * const app = new Application(canvas);
 * 
 * const cube = new Entity('Cube');
 * cube.addComponent(new TransformComponent());
 * cube.addComponent(new RenderComponent(mesh));
 * app.scene.addEntity(cube);
 * 
 * app.start();
 */

// Core
export {
    Application,
    Entity,
    Component,
    System,
    Scene,
    SceneManager,
    sceneManager,
    StorageManager,
    storage,
    type ComponentClass,
    type ApplicationOptions,
    type GameState,
    type StateConfig,
    type GameData,
    type GameSettings,
} from './core';

// Components
export {
    TransformComponent,
    RenderComponent,
    CameraComponent,
    CollisionComponent,
    ScriptComponent,
    Script,
    AudioComponent,
    AnimationComponent,
    RigidbodyComponent,
    type CameraComponentOptions,
    type ColliderType,
    type CollisionComponentOptions,
    type AudioClip,
    type AnimationClipInfo,
} from './components';

// Systems
export {
    InputSystem,
    ScriptSystem,
    PhysicsSystem,
    AnimationSystem,
    AudioSystem,
    RenderSystem,
    ParticleSystem,
    type InputState,
} from './systems';

// Utils
export {
    Prefab,
    AssetLoader,
    assetLoader,
    EventEmitter,
    globalEvents,
    Timer,
    Cooldown,
    Repeater,
    delay,
    ObjectPool,
    EntityPool,
    type LoadedModel,
    type PrefabFactory,
} from './utils';

// UI
export {
    UIManager,
    ui,
    type UIElementConfig,
    type UIElementStyle,
    type UIElementType,
} from './ui';

// Version
export const ENGINE_VERSION = '1.1.0';
