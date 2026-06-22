/**
 * The corporate nodes of the global semiconductor supply chain, placed at their
 * real-world headquarters / flagship-site coordinates and grouped by the seven
 * layers of the chain (design → materials → equipment → chip design → foundry →
 * packaging → integration).
 */

export type Category =
  | 'eda'
  | 'materials'
  | 'equipment'
  | 'design'
  | 'foundry'
  | 'osat'
  | 'integration'

export interface Company {
  id: string
  name: string
  /** Short site/location label shown under the name. */
  site: string
  category: Category
  lat: number
  lng: number
  /** One-liner shown in the detail panel. */
  blurb: string
  /** Corporate domain — used to resolve the logo for the marker. */
  domain: string
  /** Part of the "KEY" set (shown when the ALL/KEY filter is on KEY). */
  key?: boolean
}

export const CATEGORY_LABELS: Record<Category, string> = {
  eda: 'EDA & IP',
  materials: 'Raw Materials',
  equipment: 'Wafer Fab Equipment',
  design: 'Chip Design',
  foundry: 'Foundry',
  osat: 'OSAT · Packaging',
  integration: 'Integration & OEM',
}

/** Compact badge text rendered inside the 3D marker pill. */
export const CATEGORY_BADGE: Record<Category, string> = {
  eda: 'EDA',
  materials: 'MAT',
  equipment: 'WFE',
  design: 'DESIGN',
  foundry: 'FAB',
  osat: 'OSAT',
  integration: 'OEM',
}

/** Display order of the layers (used by the legend). */
export const CATEGORY_ORDER: Category[] = [
  'eda',
  'materials',
  'equipment',
  'design',
  'foundry',
  'osat',
  'integration',
]

const COMPANY_BASE: Omit<Company, 'domain'>[] = [
  // ── 1 · EDA & IP ─────────────────────────────────────────────────────────
  { id: 'synopsys', name: 'Synopsys', site: 'Sunnyvale, CA', category: 'eda', lat: 37.371, lng: -122.024, blurb: 'The #1 EDA toolchain and silicon IP — the software chips are designed in.', key: true },
  { id: 'cadence', name: 'Cadence', site: 'San Jose, CA', category: 'eda', lat: 37.336, lng: -121.913, blurb: 'EDA + IP rival to Synopsys; signoff, place-and-route, and verification.' },
  { id: 'siemens-eda', name: 'Siemens EDA', site: 'Plano, TX', category: 'eda', lat: 33.0137, lng: -96.6925, blurb: 'The former Mentor Graphics — the third pillar of the EDA toolchain.' },
  { id: 'arm', name: 'Arm', site: 'Cambridge, UK', category: 'eda', lat: 52.205, lng: 0.121, blurb: 'The CPU instruction-set architecture licensed into nearly every phone SoC.', key: true },

  // ── 2 · Raw Materials ────────────────────────────────────────────────────
  { id: 'shin-etsu', name: 'Shin-Etsu Chemical', site: 'Tokyo, JP', category: 'materials', lat: 35.6736, lng: 139.7415, blurb: 'World’s largest supplier of silicon wafers and photoresist.', key: true },
  { id: 'sumco', name: 'SUMCO', site: 'Tokyo, JP', category: 'materials', lat: 35.6797, lng: 139.7621, blurb: 'Second-largest silicon wafer maker after Shin-Etsu.' },
  { id: 'globalwafers', name: 'GlobalWafers', site: 'Hsinchu, TW', category: 'materials', lat: 24.8045, lng: 120.9715, blurb: 'Top-tier silicon wafer supplier; acquired SunEdison Semiconductor.' },
  { id: 'siltronic', name: 'Siltronic', site: 'Munich, DE', category: 'materials', lat: 48.1351, lng: 11.582, blurb: 'European silicon wafer manufacturer for the leading fabs.' },
  { id: 'air-liquide', name: 'Air Liquide', site: 'Paris, FR', category: 'materials', lat: 48.8767, lng: 2.301, blurb: 'Ultra-pure process and specialty gases for fabs.' },
  { id: 'linde', name: 'The Linde Group', site: 'Dublin, IE', category: 'materials', lat: 53.3498, lng: -6.2603, blurb: 'Industrial and electronic gases feeding semiconductor manufacturing.' },
  { id: 'merck', name: 'Merck / EMD', site: 'Darmstadt, DE', category: 'materials', lat: 49.8728, lng: 8.6512, blurb: 'Specialty chemicals, photoresists, and deposition materials.' },
  { id: 'tok', name: 'Tokyo Ohka Kogyo', site: 'Kawasaki, JP', category: 'materials', lat: 35.5308, lng: 139.7029, blurb: 'Leading photoresist maker, critical for EUV lithography.' },

  // ── 3 · Wafer Fab Equipment (WFE) ─────────────────────────────────────────
  { id: 'asml', name: 'ASML', site: 'Veldhoven, NL', category: 'equipment', lat: 51.419, lng: 5.388, blurb: 'Sole supplier of EUV lithography — the chokepoint of leading-edge fabs.', key: true },
  { id: 'applied-materials', name: 'Applied Materials', site: 'Santa Clara, CA', category: 'equipment', lat: 37.392, lng: -121.978, blurb: 'The largest semiconductor equipment maker — deposition, etch, and CMP.', key: true },
  { id: 'lam-research', name: 'Lam Research', site: 'Fremont, CA', category: 'equipment', lat: 37.51, lng: -121.943, blurb: 'Etch and deposition leader, especially for 3D NAND memory.', key: true },
  { id: 'tokyo-electron', name: 'Tokyo Electron', site: 'Tokyo, JP', category: 'equipment', lat: 35.681, lng: 139.767, blurb: 'Coat/develop, etch, and deposition tools; ASML’s key EUV track partner.', key: true },
  { id: 'kla', name: 'KLA', site: 'Milpitas, CA', category: 'equipment', lat: 37.432, lng: -121.905, blurb: 'Process control, inspection, and metrology — the fab’s eyes.' },
  { id: 'nikon', name: 'Nikon', site: 'Tokyo, JP', category: 'equipment', lat: 35.6906, lng: 139.7585, blurb: 'Lithography systems; a legacy DUV scanner supplier.' },
  { id: 'canon', name: 'Canon', site: 'Tokyo, JP', category: 'equipment', lat: 35.6256, lng: 139.7269, blurb: 'Lithography and nanoimprint (NIL) equipment maker.' },

  // ── 4 · Chip Design (Fabless & IDMs) ──────────────────────────────────────
  { id: 'nvidia', name: 'NVIDIA', site: 'Santa Clara, CA', category: 'design', lat: 37.37, lng: -121.965, blurb: 'GPUs and AI accelerators — the demand engine of the modern fab buildout.', key: true },
  { id: 'broadcom', name: 'Broadcom', site: 'Palo Alto, CA', category: 'design', lat: 37.4419, lng: -122.143, blurb: 'Networking, custom ASICs, and connectivity silicon at scale.', key: true },
  { id: 'amd', name: 'AMD', site: 'Santa Clara, CA', category: 'design', lat: 37.408, lng: -121.977, blurb: 'CPUs, GPUs, and chiplet packaging; a flagship TSMC customer.', key: true },
  { id: 'qualcomm', name: 'Qualcomm', site: 'San Diego, CA', category: 'design', lat: 32.895, lng: -117.196, blurb: 'Mobile SoCs and modems — Snapdragon and the bulk of the world’s basebands.', key: true },
  { id: 'apple', name: 'Apple', site: 'Cupertino, CA', category: 'design', lat: 37.3349, lng: -122.009, blurb: 'Apple Silicon (A/M-series); the launch customer for TSMC’s leading nodes.', key: true },
  { id: 'mediatek', name: 'MediaTek', site: 'Hsinchu, TW', category: 'design', lat: 24.7758, lng: 121.0203, blurb: 'High-volume mobile and connectivity SoCs.', key: true },
  { id: 'marvell', name: 'Marvell', site: 'Wilmington, DE', category: 'design', lat: 39.7447, lng: -75.5466, blurb: 'Data-infrastructure silicon — storage, networking, custom compute.' },
  { id: 'intel', name: 'Intel', site: 'Santa Clara, CA', category: 'design', lat: 37.388, lng: -121.963, blurb: 'IDM + Intel Foundry; CPUs and the push back to process leadership.', key: true },
  { id: 'samsung', name: 'Samsung Electronics', site: 'Suwon, KR', category: 'design', lat: 37.258, lng: 127.054, blurb: 'The broadest IDM — memory, logic foundry, and devices.', key: true },
  { id: 'sk-hynix', name: 'SK Hynix', site: 'Icheon, KR', category: 'design', lat: 37.224, lng: 127.485, blurb: 'DRAM + HBM leader feeding the AI accelerator stack.', key: true },
  { id: 'ti', name: 'Texas Instruments', site: 'Dallas, TX', category: 'design', lat: 32.9078, lng: -96.7517, blurb: 'Analog and embedded IDM with its own US fabs.' },
  { id: 'st', name: 'STMicroelectronics', site: 'Geneva, CH', category: 'design', lat: 46.169, lng: 6.108, blurb: 'European IDM — automotive, MCUs, and power devices.' },
  { id: 'infineon', name: 'Infineon', site: 'Munich, DE', category: 'design', lat: 48.0796, lng: 11.6386, blurb: 'Power semiconductors and automotive electronics leader.' },
  { id: 'nxp', name: 'NXP', site: 'Eindhoven, NL', category: 'design', lat: 51.4108, lng: 5.4509, blurb: 'Automotive, secure-ID, and edge processing silicon.' },
  { id: 'adi', name: 'Analog Devices', site: 'Wilmington, MA', category: 'design', lat: 42.564, lng: -71.167, blurb: 'High-performance analog, mixed-signal, and DSP.' },

  // ── 5 · Manufacturing (Foundries) ─────────────────────────────────────────
  { id: 'tsmc', name: 'TSMC', site: 'Hsinchu, TW', category: 'foundry', lat: 24.774, lng: 120.997, blurb: 'The world’s leading-edge foundry; HQ + Fab 12/18 in Hsinchu Science Park.', key: true },
  { id: 'globalfoundries', name: 'GlobalFoundries', site: 'Malta, NY', category: 'foundry', lat: 42.957, lng: -73.803, blurb: 'Fab 8 — specialty (non-leading-edge) foundry capacity in the US.', key: true },
  { id: 'umc', name: 'UMC', site: 'Hsinchu, TW', category: 'foundry', lat: 24.7682, lng: 120.9685, blurb: 'Taiwan’s #2 pure-play foundry for mature and specialty nodes.' },
  { id: 'smic', name: 'SMIC', site: 'Shanghai, CN', category: 'foundry', lat: 31.2989, lng: 121.587, blurb: 'China’s largest foundry; the center of its domestic capacity push.', key: true },
  { id: 'tower', name: 'Tower Semiconductor', site: 'Migdal HaEmek, IL', category: 'foundry', lat: 32.6716, lng: 35.2386, blurb: 'Specialty analog foundry (RF, power, sensors).' },

  // ── 6 · OSAT (Packaging) ──────────────────────────────────────────────────
  { id: 'ase', name: 'ASE Group', site: 'Kaohsiung, TW', category: 'osat', lat: 22.605, lng: 120.293, blurb: 'The world’s largest OSAT — assembly, test, and advanced packaging.', key: true },
  { id: 'amkor', name: 'Amkor', site: 'Tempe, AZ', category: 'osat', lat: 33.378, lng: -111.965, blurb: '#2 OSAT; advanced packaging anchor next to TSMC Arizona.', key: true },
  { id: 'jcet', name: 'JCET', site: 'Jiangyin, CN', category: 'osat', lat: 31.9209, lng: 120.2853, blurb: 'China’s largest OSAT and a global top-3 packager.' },
  { id: 'tfme', name: 'Tongfu (TFME)', site: 'Nantong, CN', category: 'osat', lat: 31.9802, lng: 120.8943, blurb: 'Major Chinese OSAT; key AMD packaging partner.' },

  // ── 7 · Integration & Infrastructure ──────────────────────────────────────
  { id: 'quanta', name: 'Quanta Computer', site: 'Taoyuan, TW', category: 'integration', lat: 25.0612, lng: 121.364, blurb: 'The world’s largest ODM — notebooks and AI servers.' },
  { id: 'supermicro', name: 'Supermicro', site: 'San Jose, CA', category: 'integration', lat: 37.3819, lng: -121.9261, blurb: 'High-performance server and AI systems integration.' },
  { id: 'foxconn', name: 'Foxconn', site: 'New Taipei, TW', category: 'integration', lat: 25.0123, lng: 121.376, blurb: 'The largest electronics contract manufacturer on earth.', key: true },
  { id: 'pegatron', name: 'Pegatron', site: 'Taipei, TW', category: 'integration', lat: 25.0608, lng: 121.4636, blurb: 'Major ODM/EMS spun out of ASUS.' },
]

/** Corporate domains, used to resolve each company's logo for the markers. */
const DOMAINS: Record<string, string> = {
  synopsys: 'synopsys.com',
  cadence: 'cadence.com',
  'siemens-eda': 'siemens.com',
  arm: 'arm.com',
  'shin-etsu': 'shinetsu.co.jp',
  sumco: 'sumcosi.com',
  globalwafers: 'globalwafers.com',
  siltronic: 'siltronic.com',
  'air-liquide': 'airliquide.com',
  linde: 'linde.com',
  merck: 'merckgroup.com',
  tok: 'tok.co.jp',
  asml: 'asml.com',
  'applied-materials': 'appliedmaterials.com',
  'lam-research': 'lamresearch.com',
  'tokyo-electron': 'tel.com',
  kla: 'kla.com',
  nikon: 'nikon.com',
  canon: 'canon.com',
  nvidia: 'nvidia.com',
  broadcom: 'broadcom.com',
  amd: 'amd.com',
  qualcomm: 'qualcomm.com',
  apple: 'apple.com',
  mediatek: 'mediatek.com',
  marvell: 'marvell.com',
  intel: 'intel.com',
  samsung: 'samsung.com',
  'sk-hynix': 'skhynix.com',
  ti: 'ti.com',
  st: 'st.com',
  infineon: 'infineon.com',
  nxp: 'nxp.com',
  adi: 'analog.com',
  tsmc: 'tsmc.com',
  globalfoundries: 'gf.com',
  umc: 'umc.com',
  smic: 'smics.com',
  tower: 'towersemi.com',
  ase: 'aseglobal.com',
  amkor: 'amkor.com',
  jcet: 'jcetglobal.com',
  tfme: 'tfme.com',
  quanta: 'quantatw.com',
  supermicro: 'supermicro.com',
  foxconn: 'foxconn.com',
  pegatron: 'pegatron.com',
}

export const COMPANIES: Company[] = COMPANY_BASE.map((c) => ({
  ...c,
  domain: DOMAINS[c.id] ?? '',
}))

export const COMPANY_BY_ID: Record<string, Company> = Object.fromEntries(
  COMPANIES.map((c) => [c.id, c]),
)
