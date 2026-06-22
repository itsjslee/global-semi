import { useMemo } from 'react'
import { COMPANIES } from '../data/companies'
import { useAtlasStore } from '../store/useAtlasStore'
import { FlatCompanyMarker } from './FlatCompanyMarker'

/** All supply-chain nodes on the flat map, filtered by the ALL / KEY toggle. */
export function MicroNodes() {
  const showAll = useAtlasStore((s) => s.showAll)
  const companies = useMemo(
    () => (showAll ? COMPANIES : COMPANIES.filter((c) => c.key)),
    [showAll],
  )

  return (
    <group>
      {companies.map((c) => (
        <FlatCompanyMarker key={c.id} company={c} />
      ))}
    </group>
  )
}
