import { ConvexReactClient } from "convex/react"
import { makeFunctionReference, type FunctionReference } from "convex/server"

// One catalog entry exactly as DaEconomy's convex/dapp.ts listItems returns it.
export type DaeconomyDappItem = {
  key: string
  title: string
  description: string
  price: number
  available: boolean
}

// DaEconomy production deployment URL. This is a public endpoint (the same one
// the DaEconomy site loads in every visitor's browser), not a secret. Override
// for dev with VITE_CONVEX_URL in a local, untracked .env.local file.
export const DAECONOMY_CONVEX_URL: string =
  (import.meta as any).env?.VITE_CONVEX_URL ??
  "https://oceanic-ant-591.eu-west-1.convex.cloud"

// Typed API references to the DaEconomy backend. IDA's repo has no Convex
// codegen, so the shapes are declared here to mirror convex/dapp.ts.
// Phase 1 is read-only: only the public listItems query is referenced.
// No mutation references exist here on purpose.
export const daeconomyApi = {
  dapp: {
    listItems: makeFunctionReference("dapp:listItems") as FunctionReference<
      "query",
      "public",
      Record<string, never>,
      DaeconomyDappItem[]
    >,
  },
}

let client: ConvexReactClient | null = null

// The client is created lazily, on first use from inside the DAPP Store, so
// loading IDA's desktop never opens a connection by itself.
export function getDaeconomyClient(): ConvexReactClient {
  if (!client) client = new ConvexReactClient(DAECONOMY_CONVEX_URL)
  return client
}
