import { useMemo } from 'react'
import { COMPANIES } from '../data/companies'
import { useAtlasStore } from '../store/useAtlasStore'
import { CompanyMarker } from './CompanyMarker'

/** All supply-chain nodes, filtered by the ALL / KEY toggle. */
export function CompanyNodes() {
  const showAll = useAtlasStore((s) => s.showAll)
  const companies = useMemo(
    () => (showAll ? COMPANIES : COMPANIES.filter((c) => c.key)),
    [showAll],
  )

  return (
    <group>
      {companies.map((c) => (
        <CompanyMarker key={c.id} company={c} />
      ))}
    </group>
  )
}
