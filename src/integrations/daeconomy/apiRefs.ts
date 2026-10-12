import { makeFunctionReference } from "convex/server";

// Public function references for the DaEconomy deployment. These references
// contain no credentials; authorization is enforced by the backend functions.
export const dappListItems = makeFunctionReference<"query">("dapp:listItems");
export const myEntitlements = makeFunctionReference<"query">("dapp:myEntitlements");
export const hasPurchase = makeFunctionReference<"query">("dapp:hasPurchase");
