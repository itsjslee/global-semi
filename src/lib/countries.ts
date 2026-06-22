import { feature } from 'topojson-client'

export interface CountryFeature {
  type: 'Feature'
  id?: string
  properties?: { name?: string }
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    // [lng, lat] rings (Polygon) or array of those (MultiPolygon)
    coordinates: number[][][] | number[][][][]
  }
}

/** World countries TopoJSON (110m → pleasantly low-poly coastlines). */
const TOPO_URL = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json'

let cache: Promise<CountryFeature[]> | null = null

/** Fetch + cache the country features once; shared by the globe and flat map. */
export function loadCountries(): Promise<CountryFeature[]> {
  if (cache) return cache
  cache = fetch(TOPO_URL)
    .then((r) => r.json())
    .then((topology: any) => {
      const fc = feature(topology, topology.objects.countries) as unknown as {
        features: CountryFeature[]
      }
      // Drop Antarctica — it bloats the silhouette and adds nothing here.
      return fc.features.filter(
        (f) => f?.id !== '010' && f?.properties?.name !== 'Antarctica',
      )
    })
    .catch((err) => {
      console.warn('[countries] failed to load:', err)
      cache = null // allow a retry on next call
      return []
    })
  return cache
}
