import type { ReactNode } from "react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { daEconomyConvex } from "./client";

export function DaEconomyProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider client={daEconomyConvex}>
      {children}
    </ConvexAuthProvider>
  );
}
