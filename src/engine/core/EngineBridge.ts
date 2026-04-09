import { Application } from "../core/Application";
import { Component, ComponentClass } from "../core/Component";
import { TransformComponent } from "../components/TransformComponent";

/**
 * 🚀 ENGINE-FIRST: EngineBridge
 */
class EngineBridge {
    private app: Application | null = null;

    registerApp(app: Application) {
        this.app = app;
    }

    getApp(): Application | null {
        return this.app;
    }

    /**
     * Direct update to an engine component.
     */
    updateComponentDirectly(entityId: number, componentType: string, data: Record<string, unknown>) {
        if (!this.app) return;

        const entity = this.app.scene.getEntityById(entityId);
        if (!entity) return;

        // Find the component in the engine
        const componentKeys = Array.from(entity.components.keys());
        const foundKey = componentKeys.find(c => (c as unknown as { TYPE: string }).TYPE === componentType);
        
        if (!foundKey) return;
        
        const component = entity.components.get(foundKey);

        if (component) {
            // Special handling for Transform (The most common real-time update)
            if (componentType === 'Transform' && component instanceof TransformComponent) {
                if (Array.isArray(data.position)) {
                    component.position.set(data.position[0], data.position[1], data.position[2]);
                }
                if (Array.isArray(data.rotation)) {
                    component.rotation.set(
                        THREE_TO_RAD(data.rotation[0] as number), 
                        THREE_TO_RAD(data.rotation[1] as number), 
                        THREE_TO_RAD(data.rotation[2] as number)
                    );
                }
                if (Array.isArray(data.scale)) {
                    component.scale.set(data.scale[0], data.scale[1], data.scale[2]);
                }
            } else {
                // Generic update for other components
                Object.assign(component, data);
            }
        }
    }
}

const THREE_TO_RAD = (deg: number) => deg * (Math.PI / 180);

export const engineBridge = new EngineBridge();
