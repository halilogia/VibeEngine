# Implementation Plan: The Sovereign Realignment (Phase 4.5) 🧭🏛️⚛💎🚀

This plan addresses the current rigid constraints in the audit script and the fragmentation of design/UI files. The goal is to maximize developer agility while maintaining architectural integrity through a unified Design Layer.

## User Review Required

> [!IMPORTANT]
> **Consolidation of UI Structure:** We are moving all design-related files (atoms, molecules, editor components) under a single roof at [src/presentation/ui](file:///home/halile/Masaüstü/GitHub/Archive/engine-standalone/src/presentation/ui). This will break existing imports, but I will automatically fix all references across the project. 🛡️💍

> [!TIP]
> **Loosening Constraints:** The "Oversized File" threshold is being increased from 300 to **500 lines**. JSDoc documentation is now only strictly enforced for **Core ECS Files**, allowing more freedom in the presentation layer. 🏗️📐

---

## Proposed Changes

### 1. Audit Script Modernization (Agile Alignment)
#### [MODIFY] [reliability_audit.py](file:///home/halile/Masaüstü/GitHub/Archive/engine-standalone/scripts/reliability_audit.py)
- **Line Limit:** Increase the `300` threshold to `500` for `oversized_files`.
- **Doc Scoring:** Update the weight to focus heavily on Core Files:
    - `Core Doc Ratio` weight: **14** points.
    - `Other Doc Ratio` weight: **1** point.
    - This ensures that missing JSDoc in UI components doesn't tank the **VRS** score while protecting the engine's core architecture. 🏛️💍

### 2. Design Layer Consolidation (Sovereign UI House)
#### [MOVE] [src/presentation/components](file:///home/halile/Masaüstü/GitHub/Archive/engine-standalone/src/presentation/components) -> `src/presentation/ui/common`
#### [MOVE] [src/presentation/atomic](file:///home/halile/Masaüstü/GitHub/Archive/engine-standalone/src/presentation/atomic) -> `src/presentation/ui/atomic`
#### [MOVE] [src/editor/components](file:///home/halile/Masaüstü/GitHub/Archive/engine-standalone/src/editor/components) -> `src/presentation/ui/editor`
#### [MOVE] [src/presentation/themes](file:///home/halile/Masaüstü/GitHub/Archive/engine-standalone/src/presentation/themes) -> `src/presentation/ui/themes`

### 3. Path & Import Fixes
#### [MODIFY] [tsconfig.json](file:///home/halile/Masaüstü/GitHub/Archive/engine-standalone/tsconfig.json)
- Update paths to reflect the new structure:
    - `@themes/*` -> `src/presentation/ui/themes/*`
    - `@ui/*` -> `src/presentation/ui/*` (New alias)
- Automated refactor of all imports across the project.

---

## Open Questions
- Should `src/presentation/hooks` and `src/presentation/contexts` also move under `ui/`? 
    - **Initial Recommendation:** Keep them at the presentation root as they may contain logic beyond pure design (e.g., State Management, API hooks).

---

## Verification Plan

### Automated Tests
- `python3 scripts/reliability_audit.py` to confirm the new score stability.
- `npm run build` to ensure all import path refactors were successful.
- `npm run dev` to verify the HMR (Hot Module Replacement) after structure changes.

### Manual Verification
- Verify that the Visual Editor loads correctly with the consolidated UI structure.
- Check if JSDoc warnings in non-core files are indeed softened in the final report.
