# Project Context: Global Semiconductor Atlas

An interactive 3D map of the global semiconductor supply chain, heavily inspired by the Levels.fyi Atlas layout, typography, and visual polish.

## 🛠️ Technology Stack
- **Framework:** React / Next.js (or Vite)
- **3D Engine:** Three.js / React Three Fiber (R3F)
- **3D Utilities:** `@react-three/drei` (using `<Html>` components for map markers)
- **Animation:** GSAP (GreenSock) with ScrollTrigger for camera waypoints
- **State Management:** Zustand (for viewport state, active nodes, and view toggles)
- **Styling:** Tailwind CSS

## 🎯 Rigid Core Architectural Rules
1. **Perfect Globe Centering:** The 3D Canvas element wrapper must stay strictly locked and centered in the viewport grid layout. Under no circumstances should camera manipulation or keyboard rotation pan, translate, or offset the globe's target position away from `Vector3(0, 0, 0)`.
2. **Pointer Events & Click Pass-Through:** The HTML/Tailwind UI layers sitting on top of the 3D canvas must use `pointer-events: none` on full-screen containers to prevent blocking mouse clicks. Explicitly use `pointer-events: auto` and a high z-index (`z-50+`) on all sidebars, navigation panels, interactive buttons, and modals.
3. **Keyboard Event Hijacking Prevention:** Inside any window-level `keydown` listeners for arrow key navigation, never call `e.preventDefault()` globally. Only call it scoped inside individual arrow key `switch` cases to prevent freezing standard mouse click behavior.

## 🎨 Visual Identity & Palette
- **Aesthetic:** Low-poly, matte finish, toy-town style. Crisp directional shadows, no heavy reflections.
- **Ocean:** Deep slate/blue (`#1A3A54`)
- **Landmasses:** Warm desaturated cream/beige (`#E2D9C5`)
- **Preloader:** Solid matte cream (`#FDFCFA`) with bold serif typography matching the vintage tech aesthetic of the Levels.fyi onboarding sequence.
- **UI Panels:** Translucent glassmorphism (`backdrop-blur-md` or `backdrop-blur-xl`) with fine borders and minimal opacity.

## 📦 Global Supply Chain Taxonomy
When adding or altering data entries, always match them to these 7 precise supply chain buckets:
1. EDA & IP
2. Raw Materials & Chemicals
3. Wafer Fab Equipment (WFE)
4. Chip Design (Fabless & IDMs)
5. Manufacturing (Foundries)
6. OSAT (Packaging & Test)
7. Distribution & Systems Integration

## Cursor Cloud specific instructions

This is a single-service, client-only app: a Vite + React + TypeScript + Three.js (R3F) frontend. There is no backend, database, or env/secrets requirement.

- Run the dev server with `npm run dev` (Vite on http://localhost:5173). Use `--host` only if you need LAN exposure.
- Lint: there is no ESLint config; `npm run typecheck` (`tsc --noEmit`) is the static-check command. `npm run build` also runs `tsc --noEmit` before `vite build`.
- The app starts with a cream preloader/splash overlay; dismiss it (click through) before the 3D globe and UI become interactive.
- The production build emits a large (~2 MB) single JS chunk; the Vite "chunks larger than 500 kB" warning is expected and not an error.
