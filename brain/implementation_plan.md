# Line-based Coverage Integration Plan

We are transitioning the reliability audit scoring from a simple "file exists" check to a professional "statement coverage" analysis using Vitest's built-in coverage engine.

## User Review Required

> [!IMPORTANT]
> The audit will now require a coverage report. If `npm run test -- --coverage` hasn't been run, the audit script will provide a warning and use the last available results or fallback to zero.

## Proposed Changes

### [Engine Core]

#### [MODIFY] [package.json](file:///home/halile/Masaüstü/GitHub/Archive/engine-standalone/package.json)
- Add `@vitest/coverage-v8` to devDependencies.
- Add `test:coverage` script for easy access.

#### [MODIFY] [vitest.config.ts](file:///home/halile/Masaüstü/GitHub/Archive/engine-standalone/vitest.config.ts)
- Configure `test.coverage` to use `v8` provider and generate `json-summary` reports.

### [Audit Tools]

#### [MODIFY] [reliability_audit.py](file:///home/halile/Masaüstü/GitHub/Archive/engine-standalone/scripts/reliability_audit.py)
- Refactor `audit_project` to attempt reading `coverage/coverage-summary.json`.
- Extract `statements.pct` from the coverage data.
- Update `coverage_score` calculation: `(pct / 100) * 40`.
- Added a fallback/check to ensure users run the coverage command if files are missing.

## Open Questions

- Should I automatically run the coverage test *during* the audit, or keep them separate? 
    - *Suggestion*: Separate them to keep the audit fast, as running 119+ tests with coverage can take 10-15 seconds.

## Verification Plan

### Automated Tests
1. Run `npm run test -- --coverage`.
2. Run `python3 scripts/reliability_audit.py`.
3. Verify that the "Test Coverage Score" reflects the actual statement percentage (e.g., if Vitest says 45% coverage, the score should be `0.45 * 40 = 18.0`).
