/**
 * Bridge Module Index
 */

export { EntityBridge, entityBridge } from './EntityBridge';
export {
    COMPONENT_REGISTRY,
    getComponentInfo,
    getAvailableComponents,
    type ComponentTypeInfo,
    type PropertyInfo
} from './ComponentRegistry';
export { CommandInterpreter, type AICommand, type AICommandType, syncAICopilot } from './AICopilot';
export { SceneContext, syncSceneContext } from './SceneContext';
