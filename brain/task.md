# Task: Line-based Coverage Integration

- [x] Phase 6: Reliability Overhaul [Sovereign Standard]
    - [x] Kurulum: Vitest, JSDom ve Test Altyapısı
    - [x] ECS & Core: Entity, Scene ve Store testleri [DONE]
    - [x] Engine Systems: Render, Physics ve Script testleri [DONE]
    - [x] Editor UI: Hierarchy ve Inspector panel testleri [DONE]
    - [x] Unit Sweep: Animation, Audio, Camera, Collision, Particle, Rigidbody bileşenleri [DONE]
    - [x] Systems Sweep: AnimationSystem, AudioSystem, InputSystem, ParticleSystem [DONE]
    - [x] Utils & Bridge: ObjectPool, EventEmitter, Registry testleri [DONE]
    - [ ] Scoring v3.0: Adjust weights for structural depth
    - [ ] Final VRS Audit: Target 90+ (Sovereign 🏛️)

- [ ] install `@vitest/coverage-v8`
- [ ] Update `package.json` with `test:coverage` script
- [ ] Update `vitest.config.ts` with `json-summary` reporter
- [ ] Update `scripts/reliability_audit.py` scoring logic
- [ ] Run `npm run test:coverage` to generate data
- [ ] Run `python3 scripts/reliability_audit.py` to verify VRS improvement
- [ ] Update walkthrough
