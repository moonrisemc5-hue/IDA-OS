import { useEffect, useState } from "react"
import {
  daeconomyApi,
  getDaeconomyClient,
  type DaeconomyDappItem,
} from "./client"

export type DaeconomyCatalogState =
  | { status: "disabled"; items: DaeconomyDappItem[] }
  | { status: "loading"; items: DaeconomyDappItem[] }
  | { status: "ready"; items: DaeconomyDappItem[] }
  | { status: "empty"; items: DaeconomyDappItem[] }
  | { status: "error"; items: DaeconomyDappItem[] }

// Read-only live catalog hook. It runs the public dapp:listItems query against
// the DaEconomy Convex deployment and nothing else: no sign-in, no mutations,
// no writes. Pass enabled=false (e.g. Wi-Fi off) to skip connecting entirely.
export function useDaeconomyCatalog(enabled: boolean): DaeconomyCatalogState {
  const [state, setState] = useState<DaeconomyCatalogState>({
    status: "disabled",
    items: [],
  })

  useEffect(() => {
    if (!enabled) {
      setState({ status: "disabled", items: [] })
      return
    }
    setState({ status: "loading", items: [] })
    let unsubscribe: () => void = () => {}
    try {
      const watch = getDaeconomyClient().watchQuery(
        daeconomyApi.dapp.listItems,
        {}
      )
      unsubscribe = watch.onUpdate(() => {
        try {
          const items = watch.localQueryResult() ?? []
          setState({ status: items.length > 0 ? "ready" : "empty", items })
        } catch {
          setState({ status: "error", items: [] })
        }
      })
    } catch {
      setState({ status: "error", items: [] })
    }
    return () => unsubscribe()
  }, [enabled])

  return state
}
