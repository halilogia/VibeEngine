import { Scene } from "./Scene";
import { Entity } from "./Entity";
import type { Application } from "./Application";

export class SceneManager {
    private app: Application;
    private scenes: Map<string, Scene> = new Map();
    private activeScene: Scene | null = null;
    private persistentEntities: Set<Entity> = new Set();

    constructor(app: Application) {
        this.app = app;
    }

    get active(): Scene | null {
        return this.activeScene;
    }

    createScene(name: string): Scene {
        const scene = new Scene(name);
        this.scenes.set(name, scene);
        return scene;
    }

    async loadScene(name: string): Promise<void> {
        console.log(`🎬 SceneManager: Loading Level [${name}]...`);
        
        // 1. Cleanup current scene
        if (this.activeScene) {
            // Option: Persistent entities move to global state
            this.activeScene.clear();
        }

        // 2. Fetch/Initialize new scene
        let scene = this.scenes.get(name);
        if (!scene) {
            scene = this.createScene(name);
        }

        this.activeScene = scene;
        
        // 3. Re-inject Persistent Entities (Elite DDOL)
        for (const entity of this.persistentEntities) {
            this.activeScene.addEntity(entity);
        }

        console.log(`✅ SceneManager: Active Level is now [${name}]`);
    }

    /**
     * Elite: Mark an entity as Persistent (Unity-Style DontDestroyOnLoad)
     */
    dontDestroyOnLoad(entity: Entity): void {
        this.persistentEntities.add(entity);
        console.log(`💎 SceneManager: Entity [${entity.name}] marked as Persistent`);
    }

    removePersistent(entity: Entity): void {
        this.persistentEntities.delete(entity);
    }
}
