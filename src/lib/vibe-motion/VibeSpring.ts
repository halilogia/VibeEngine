/**
 * VibeSpring - High-performance Spring Physics Solver
 * Based on the mass-spring-damper model.
 */

export interface SpringConfig {
    tension: number;  // Stiffness
    friction: number; // Damping
    mass: number;     // Inertia
    precision?: number; // Threshold to stop
}

export const DefaultSpring: SpringConfig = {
    tension: 170,
    friction: 26,
    mass: 1,
    precision: 0.01
};

export class VibeSpring {
    private position: number;
    private target: number;
    private velocity: number;
    private config: SpringConfig;

    constructor(initial: number, config = DefaultSpring) {
        this.position = initial;
        this.target = initial;
        this.velocity = 0;
        this.config = config;
    }

    setTarget(target: number) {
        this.target = target;
    }

    update(dt: number): number {
        // Clamp dt to avoid physics explosions at low frame rates
        const clampedDt = Math.min(dt, 0.032); 
        
        const force = -this.config.tension * (this.position - this.target);
        const damping = -this.config.friction * this.velocity;
        const acceleration = (force + damping) / this.config.mass;

        this.velocity += acceleration * clampedDt;
        this.position += this.velocity * clampedDt;

        // Equilibrium check
        if (Math.abs(this.velocity) < (this.config.precision || 0.01) && 
            Math.abs(this.position - this.target) < (this.config.precision || 0.01)) {
            this.position = this.target;
            this.velocity = 0;
        }

        return this.position;
    }

    reset(position: number) {
        this.position = position;
        this.target = position;
        this.velocity = 0;
    }

    get isAtRest(): boolean {
        return this.velocity === 0 && this.position === this.target;
    }

    get currentPosition(): number {
        return this.position;
    }
}
