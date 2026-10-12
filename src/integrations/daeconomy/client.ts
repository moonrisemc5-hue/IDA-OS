import { ConvexReactClient } from "convex/react";

// This URL identifies a public Convex deployment; it is not a secret.
// Keep a build-time override for local testing, with the production URL as
// the GitHub Pages-safe default (GitHub Pages does not read .env.local).
export const DAECONOMY_CONVEX_URL =
  (import.meta.env.VITE_CONVEX_URL as string | undefined)?.trim() ||
  "https://oceanic-ant-591.eu-west-1.convex.cloud";

export const daEconomyConvex = new ConvexReactClient(DAECONOMY_CONVEX_URL);
