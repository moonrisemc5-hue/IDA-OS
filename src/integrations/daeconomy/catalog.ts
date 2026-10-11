import type { DaeconomyDappItem } from "./client"

// Live catalog info overlaid onto IDA's built-in catalog by app name
// (the backend item title matches the IDA app name, e.g. "DaDrift").
export interface LiveAppInfo {
  title: string
  description: string
  price: number
  available: boolean
}

export function indexLiveCatalog(
  items: DaeconomyDappItem[] | null | undefined
): Record<string, LiveAppInfo> {
  const map: Record<string, LiveAppInfo> = {}
  for (const item of items ?? []) {
    map[item.title] = {
      title: item.title,
      description: item.description,
      price: item.price,
      available: item.available,
    }
  }
  return map
}

// Official price label. Price 0 means free on the backend.
export function formatDaCoinPrice(price: number): string {
  return price === 0 ? "Free" : `${price.toLocaleString("en-US")} DaCoins`
}
