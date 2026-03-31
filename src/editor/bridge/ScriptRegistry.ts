/**
 * ScriptRegistry - Registry of available scripts for the AI to attach
 */

export interface ScriptInfo {
    name: string;
    description: string;
    properties: { name: string; type: string; default: any }[];
}

export const SCRIPT_REGISTRY: ScriptInfo[] = [
    {
        name: 'RotatorScript',
        description: 'Rotates the entity continuously on its Y axis.',
        properties: [
            { name: 'speed', type: 'number', default: 1.0 }
        ]
    },
    {
        name: 'PlayerMoveScript',
        description: 'Enables WASD movement controls for the entity.',
        properties: [
            { name: 'speed', type: 'number', default: 5.0 }
        ]
    },
    {
        name: 'PulseScaleScript',
        description: 'Makes the entity pulse its scale up and down.',
        properties: [
            { name: 'speed', type: 'number', default: 2.0 },
            { name: 'amplitude', type: 'number', default: 0.2 }
        ]
    }
];

export function getAvailableScripts(): ScriptInfo[] {
    return SCRIPT_REGISTRY;
}
