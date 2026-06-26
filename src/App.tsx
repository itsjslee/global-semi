import { useEffect } from 'react'
import { useScrollWaypoints, scrollToWaypoint } from './hooks/useScrollWaypoints'
import { useKeyboardNav } from './hooks/useKeyboardNav'
import { WAYPOINT_COUNT, useAtlasStore } from './store/useAtlasStore'
import { ViewStage } from './ui/ViewStage'
import { Preloader } from './ui/Preloader'
import { TopBar } from './ui/TopBar'
import { ViewToggle } from './ui/ViewToggle'
import { Sidebar } from './ui/Sidebar'
import { ScrollProgress } from './ui/ScrollProgress'
import { ModeControls } from './ui/ModeControls'
import { HubControls } from './ui/HubControls'
import { BrandHeader } from './ui/BrandHeader'
import { SplashCard } from './ui/SplashCard'
import { WhoamiModal } from './ui/WhoamiModal'
import { NodeDetails } from './ui/NodeDetails'
import { Legend } from './ui/Legend'
import { ScrollSpacer } from './ui/ScrollSpacer'
import { TransitionVeil } from './ui/TransitionVeil'

export default function App() {
  useScrollWaypoints()
  useKeyboardNav()

  // Deep-link the view via ?view=micro|macro (shareable links).
  useEffect(() => {
    const view = new URLSearchParams(window.location.search).get('view')
    if (view === 'micro' || view === 'macro') useAtlasStore.getState().setViewMode(view)
  }, [])

  // Deep-link to a waypoint via the URL hash (e.g. /#3 → East Asia Hub).
  useEffect(() => {
    const i = parseInt(window.location.hash.replace('#', ''), 10)
    if (Number.isNaN(i) || i < 0 || i >= WAYPOINT_COUNT) return
    // Wait for the ScrollSpacer to establish document height, then jump.
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToWaypoint(i, 'auto')))
  }, [])

  return (
    <>
      {/* Strictly fixed, centered 3D stage (globe or flat map). */}
      <ViewStage />

      {/* UI overlay — fixed layers arranged around the centered stage. */}
      <TopBar />
      <ViewToggle />
      <HubControls />
      <BrandHeader />
      <Sidebar />
      <ScrollProgress />
      <ModeControls />
      <NodeDetails />
      <Legend />
      <SplashCard />
      <WhoamiModal />

      {/* Drives native scroll → camera timeline (only element in normal flow). */}
      <ScrollSpacer />

      {/* Cream dissolve that masks the macro↔micro scene swap. */}
      <TransitionVeil />

      {/* Preloading overlay — sits above everything until assets are ready. */}
      <Preloader />
    </>
  )
}
