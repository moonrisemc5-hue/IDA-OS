import { describe, expect, it } from "vitest"
import { formatDaCoinPrice, indexLiveCatalog } from "../catalog"

describe("indexLiveCatalog", () => {
  it("indexes live items by their title", () => {
    const map = indexLiveCatalog([
      { key: "dadrift", title: "DaDrift", description: "Race", price: 500, available: true },
      { key: "danotes", title: "DaNotes", description: "Notes", price: 0, available: true },
    ])
    expect(map["DaDrift"]).toEqual({ title: "DaDrift", description: "Race", price: 500, available: true })
    expect(map["DaNotes"].price).toBe(0)
    expect(map["DaWord"]).toBeUndefined()
  })

  it("treats null/undefined/empty input as an empty catalog, never as live data", () => {
    expect(indexLiveCatalog(null)).toEqual({})
    expect(indexLiveCatalog(undefined)).toEqual({})
    expect(indexLiveCatalog([])).toEqual({})
  })
})

describe("formatDaCoinPrice", () => {
  it("labels free apps", () => expect(formatDaCoinPrice(0)).toBe("Free"))
  it("labels priced apps with DaCoins", () => {
    expect(formatDaCoinPrice(200)).toBe("200 DaCoins")
    expect(formatDaCoinPrice(1000)).toBe("1,000 DaCoins")
  })
})
