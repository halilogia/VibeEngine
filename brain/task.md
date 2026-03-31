# Task: Line-based Coverage Integration

Transition the VRS (Vibe Reliability Score) to use actual statement coverage data from Vitest.

- [ ] install `@vitest/coverage-v8`
- [ ] Update `package.json` with `test:coverage` script
- [ ] Update `vitest.config.ts` with `json-summary` reporter
- [ ] Update `scripts/reliability_audit.py` scoring logic
- [ ] Run `npm run test:coverage` to generate data
- [ ] Run `python3 scripts/reliability_audit.py` to verify VRS improvement
- [ ] Update walkthrough
