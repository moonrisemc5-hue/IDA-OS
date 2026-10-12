import { useState, type FormEvent } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { myBalance, myEntitlements } from "./apiRefs";

export function DaEconomyAuthControls() {
  const { signIn, signOut } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const entitlements = useQuery(myEntitlements as any, isAuthenticated ? {} : "skip") as any;
  const balance = useQuery(myBalance as any, isAuthenticated ? {} : "skip") as any;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !username.trim() || !password) return;
    setBusy(true);
    setMessage("");
    try {
      await signIn("password", {
        username: username.trim(),
        password,
        flow: "signIn",
      });
      setPassword("");
      setMessage("DaEconomy sign-in request completed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in. Check your DaEconomy username and password.");
    } finally {
      setBusy(false);
    }
  };

  const entitlementRows = Array.isArray(entitlements)
    ? entitlements
    : Array.isArray(entitlements?.value)
      ? entitlements.value
      : null;
  const balanceValue = typeof balance?.balance === "number" ? balance.balance : null;

  return (
    <section style={{ margin: "12px 16px 0", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 14, background: "#ffffff", color: "#172033", display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", fontSize: 13 }}>
      <div style={{ minWidth: 150 }}>
        <strong style={{ display: "block", fontSize: 13 }}>DaEconomy account</strong>
        <span style={{ color: "#64748b" }}>
          {isLoading ? "Connecting…" : isAuthenticated
            ? "Signed in to DaEconomy"
            : "Use your existing DaEconomy username and password."}
        </span>
        {isAuthenticated && (
          <span style={{ display: "block", color: "#172033", marginTop: 5, fontWeight: 700 }}>
            DaCoin balance: {balanceValue === null ? "Loading…" : `${balanceValue.toLocaleString()} DaCoins`}
          </span>
        )}
        {isAuthenticated && entitlementRows && (
          <span style={{ display: "block", color: "#64748b", marginTop: 3 }}>
            {entitlementRows.length} owned apps
          </span>
        )}
        {message && <span role="status" style={{ display: "block", marginTop: 4, color: message.toLowerCase().includes("could not") || message.toLowerCase().includes("invalid") ? "#b91c1c" : "#475569" }}>{message}</span>}
      </div>
      {isAuthenticated ? (
        <button type="button" onClick={() => { setMessage(""); void signOut(); }} style={{ border: "1px solid #cbd5e1", borderRadius: 9, background: "#f8fafc", padding: "8px 12px", cursor: "pointer", color: "#172033" }}>Sign out of DaEconomy</button>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input aria-label="DaEconomy username" autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} placeholder="DaEconomy username" required style={{ width: 155, minWidth: 120, border: "1px solid #cbd5e1", borderRadius: 9, padding: "8px 10px", background: "#fff", color: "#172033" }} />
          <input aria-label="DaEconomy password" autoComplete="current-password" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password" required style={{ width: 130, minWidth: 100, border: "1px solid #cbd5e1", borderRadius: 9, padding: "8px 10px", background: "#fff", color: "#172033" }} />
          <button type="submit" disabled={busy || !username.trim() || !password} style={{ border: 0, borderRadius: 9, background: busy ? "#94a3b8" : "#263d82", color: "#fff", padding: "9px 13px", cursor: busy ? "wait" : "pointer", fontWeight: 600 }}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
      )}
    </section>
  );
}
