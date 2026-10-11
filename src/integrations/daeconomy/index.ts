// DaEconomy <-> IDA DAPP integration (Phase 1: read-only live catalog).
// Everything Convex-related for IDA lives in this folder; the rest of the app
// keeps using its existing Supabase auth and local desktop state untouched.
export { DAECONOMY_CONVEX_URL, daeconomyApi, getDaeconomyClient } from "./client"
export type { DaeconomyDappItem } from "./client"
export { formatDaCoinPrice, indexLiveCatalog } from "./catalog"
export type { LiveAppInfo } from "./catalog"
export { useDaeconomyCatalog } from "./useDaeconomyCatalog"
export type { DaeconomyCatalogState } from "./useDaeconomyCatalog"
