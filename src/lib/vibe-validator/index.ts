import { z } from 'zod';

/**
 * 🏛️ VibeValidator: Sovereign Data Guardian
 * Powered by Zod for Elite stability and performance.
 * 
 * Your legacy code is archived at: archive/lib/vibe-validator
 */

export const VibeValidator = z;

// Re-export type inference helper for elite TypeScript workflows
export type VibeInfer<T extends z.ZodType<any, any, any>> = z.infer<T>;

export default VibeValidator;
