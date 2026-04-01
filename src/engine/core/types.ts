/**
 * Core Engine types and interfaces
 */

export interface ApplicationOptions {
    /** Target FPS (default: 60) */
    targetFPS?: number;
    /** Use fixed timestep for physics (default: false) */
    useFixedTimestep?: boolean;
    /** Fixed timestep interval in seconds (default: 1/60) */
    fixedTimeStep?: number;
    /** Antialias (default: true) */
    antialias?: boolean;
    /** Background color (default: 0x000000) */
    backgroundColor?: number;
}
