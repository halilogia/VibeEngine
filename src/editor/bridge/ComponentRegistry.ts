/**
 * ComponentRegistry - Registry of available component types for the editor
 */

export interface ComponentTypeInfo {
    type: string;
    label: string;
    icon: string;
    defaultData: Record<string, any>;
    properties: PropertyInfo[];
}

export interface PropertyInfo {
    name: string;
    label: string;
    type: 'number' | 'string' | 'boolean' | 'vector3' | 'color' | 'select';
    default: any;
    options?: { label: string; value: any }[];
    min?: number;
    max?: number;
    step?: number;
}

export const COMPONENT_REGISTRY: ComponentTypeInfo[] = [
    {
        type: 'Transform',
        label: 'Transform',
        icon: 'Move',
        defaultData: {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        properties: [
            { name: 'position', label: 'Position', type: 'vector3', default: [0, 0, 0] },
            { name: 'rotation', label: 'Rotation', type: 'vector3', default: [0, 0, 0] },
            { name: 'scale', label: 'Scale', type: 'vector3', default: [1, 1, 1] }
        ]
    },
    {
        type: 'Render',
        label: 'Render',
        icon: 'Box',
        defaultData: {
            meshType: 'cube',
            color: '#6366f1',
            castShadow: true,
            receiveShadow: true
        },
        properties: [
            {
                name: 'meshType',
                label: 'Mesh',
                type: 'select',
                default: 'cube',
                options: [
                    { label: 'Cube', value: 'cube' },
                    { label: 'Sphere', value: 'sphere' },
                    { label: 'Cylinder', value: 'cylinder' },
                    { label: 'Plane', value: 'plane' },
                    { label: 'Capsule', value: 'capsule' }
                ]
            },
            { name: 'color', label: 'Color', type: 'color', default: '#6366f1' },
            { name: 'castShadow', label: 'Cast Shadow', type: 'boolean', default: true },
            { name: 'receiveShadow', label: 'Receive Shadow', type: 'boolean', default: true }
        ]
    },
    {
        type: 'Collision',
        label: 'Collision',
        icon: 'Shield',
        defaultData: {
            colliderType: 'box',
            isTrigger: false
        },
        properties: [
            {
                name: 'colliderType',
                label: 'Type',
                type: 'select',
                default: 'box',
                options: [
                    { label: 'Box', value: 'box' },
                    { label: 'Sphere', value: 'sphere' },
                    { label: 'Capsule', value: 'capsule' }
                ]
            },
            { name: 'isTrigger', label: 'Is Trigger', type: 'boolean', default: false }
        ]
    },
    {
        type: 'Rigidbody',
        label: 'Rigidbody',
        icon: 'Magnet',
        defaultData: {
            mass: 1,
            useGravity: true,
            isKinematic: false
        },
        properties: [
            { name: 'mass', label: 'Mass', type: 'number', default: 1, min: 0, step: 0.1 },
            { name: 'useGravity', label: 'Use Gravity', type: 'boolean', default: true },
            { name: 'isKinematic', label: 'Is Kinematic', type: 'boolean', default: false }
        ]
    },
    {
        type: 'Script',
        label: 'Script',
        icon: 'Code',
        defaultData: {
            scriptName: ''
        },
        properties: [
            { name: 'scriptName', label: 'Script', type: 'string', default: '' }
        ]
    },
    {
        type: 'Camera',
        label: 'Camera',
        icon: 'Camera',
        defaultData: {
            fov: 75,
            near: 0.1,
            far: 1000,
            isActive: false
        },
        properties: [
            { name: 'fov', label: 'FOV', type: 'number', default: 75, min: 10, max: 120 },
            { name: 'near', label: 'Near', type: 'number', default: 0.1, min: 0.01, step: 0.01 },
            { name: 'far', label: 'Far', type: 'number', default: 1000, min: 1 },
            { name: 'isActive', label: 'Active', type: 'boolean', default: false }
        ]
    },
    {
        type: 'Light',
        label: 'Light',
        icon: 'Sun',
        defaultData: {
            lightType: 'directional',
            color: '#ffffff',
            intensity: 1,
            castShadow: true
        },
        properties: [
            {
                name: 'lightType',
                label: 'Type',
                type: 'select',
                default: 'directional',
                options: [
                    { label: 'Directional', value: 'directional' },
                    { label: 'Point', value: 'point' },
                    { label: 'Spot', value: 'spot' },
                    { label: 'Ambient', value: 'ambient' }
                ]
            },
            { name: 'color', label: 'Color', type: 'color', default: '#ffffff' },
            { name: 'intensity', label: 'Intensity', type: 'number', default: 1, min: 0, step: 0.1 },
            { name: 'castShadow', label: 'Cast Shadow', type: 'boolean', default: true }
        ]
    }
];

/**
 * Get component type info by type name
 */
export function getComponentInfo(type: string): ComponentTypeInfo | undefined {
    return COMPONENT_REGISTRY.find(c => c.type === type);
}

/**
 * Get all available component types
 */
export function getAvailableComponents(): ComponentTypeInfo[] {
    return COMPONENT_REGISTRY;
}
