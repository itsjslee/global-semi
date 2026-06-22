import { useEffect } from 'react'
import { useAtlasStore } from '../store/useAtlasStore'

const YAW_STEP = 0.06
const PITCH_STEP = 0.05
const ZOOM_STEP = 0.06

/**
 * Arrow keys / WASD pan & rotate the active (tour-mode) view; +/- (or E/Q)
 * zoom; R resets; Esc clears the selection. In Explore mode OrbitControls
 * already own the pointer, so these nudges simply have no visible effect.
 */
export function useKeyboardNav() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
        return
      }

      const s = useAtlasStore.getState()
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          s.nudge({ yaw: -YAW_STEP })
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          s.nudge({ yaw: YAW_STEP })
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
          s.nudge({ pitch: PITCH_STEP })
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          s.nudge({ pitch: -PITCH_STEP })
          break
        case '=':
        case '+':
        case 'e':
        case 'E':
          s.nudge({ zoom: -ZOOM_STEP }) // zoom in → smaller offset
          break
        case '-':
        case '_':
        case 'q':
        case 'Q':
          s.nudge({ zoom: ZOOM_STEP })
          break
        case 'r':
        case 'R':
          s.resetManual()
          break
        case 'Escape':
          s.setActiveNode(null)
          break
        default:
          return
      }
      // Arrow keys would otherwise scroll the page (and hijack the waypoints).
      if (e.key.startsWith('Arrow')) e.preventDefault()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
