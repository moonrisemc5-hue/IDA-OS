import { describe, expect, it, vi, beforeEach } from "vitest"

// Convex is fully mocked: tests never open a network connection and never
// touch production. watchQuery behavior is faked per test.
const updates: Array<() => void> = []
let queryResult: unknown[] = []
let throwOnResult = false

vi.mock("convex/react", () => {
  class MockConvexReactClient {
    watchQuery() {
      return {
        onUpdate(cb: () => void) {
          updates.push(cb)
          return () => {}
        },
        localQueryResult() {
          if (throwOnResult) throw new Error("backend error")
          return queryResult
        },
      }
    }
  }
  return { ConvexReactClient: MockConvexReactClient }
})
vi.mock("convex/server", () => ({
  makeFunctionReference: (name: string) => ({ name }),
}))

import { act, renderHook } from "@testing-library/react"
import { useDaeconomyCatalog } from "../useDaeconomyCatalog"

const flush = () => act(() => { updates.forEach((cb) => cb()) })

describe("useDaeconomyCatalog", () => {
  beforeEach(() => {
    updates.length = 0
    queryResult = []
    throwOnResult = false
  })

  it("stays disabled and never subscribes when disabled", () => {
    const { result } = renderHook(() => useDaeconomyCatalog(false))
    expect(result.current.status).toBe("disabled")
    expect(updates.length).toBe(0)
  })

  it("reports empty when the live catalog has no items", () => {
    queryResult = []
    const { result } = renderHook(() => useDaeconomyCatalog(true))
    expect(result.current.status).toBe("loading")
    flush()
    expect(result.current.status).toBe("empty")
    expect(result.current.items).toEqual([])
  })

  it("reports ready with live items when the catalog exists", () => {
    queryResult = [
      { key: "dascope", title: "DaScope", description: "Search", price: 1000, available: true },
    ]
    const { result } = renderHook(() => useDaeconomyCatalog(true))
    flush()
    expect(result.current.status).toBe("ready")
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].title).toBe("DaScope")
  })

  it("reports error when the query fails, without throwing", () => {
    throwOnResult = true
    const { result } = renderHook(() => useDaeconomyCatalog(true))
    flush()
    expect(result.current.status).toBe("error")
    expect(result.current.items).toEqual([])
  })
})
