import { ConvexReactClient } from "convex/react";

// SAFETY ISOLATION TEST: IDA must not contact DaEconomy while the projects are separated.
// This reserved .invalid domain cannot resolve to a real service. This changes IDA only;
// it does not modify or delete anything in DaEconomy or its Convex database.
// The DAPP account/purchase and Bad-Time reward integrations will remain unavailable
// until they are deliberately redesigned or re-enabled after the backend is accessible.
export const DAECONOMY_CONVEX_URL = "https://ida-disconnected.invalid";

export const daEconomyConvex = new ConvexReactClient(DAECONOMY_CONVEX_URL);
