import { useState, type FormEvent } from "react";
import { CheckCircle2, CircleAlert, Coins, LogIn, LogOut, ShieldCheck } from "lucide-react";
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
  const [feedbackKind, setFeedbackKind] = useState<"success" | "error" | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !username.trim() || !password) return;
    setBusy(true);
    setMessage("");
    setFeedbackKind(null);
    try {
      await signIn("password", {
        username: username.trim(),
        password,
        flow: "signIn",
      });
      setPassword("");
      setFeedbackKind("success");
      setMessage("Connected successfully. Your balance and owned apps are syncing.");
    } catch (error) {
      setFeedbackKind("error");
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
    <section className="de-account-card">
      <style>{`
        .de-account-card{position:relative;overflow:hidden;margin:12px 16px 0;padding:16px;border:1px solid #dce5f2;border-radius:18px;background:linear-gradient(135deg,#fff 0%,#f7faff 62%,#eef4ff 100%);color:#172033;box-shadow:0 5px 18px #223b6b0b;display:grid;gap:15px;font-size:13px;animation:deCardIn .35s cubic-bezier(.2,.8,.2,1) both}
        .de-account-card:before{content:"";position:absolute;inset:0 auto 0 0;width:3px;background:linear-gradient(#818cf8,#38bdf8)}
        .de-account-head{display:flex;align-items:center;gap:11px;min-width:0}
        .de-account-mark{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;flex:0 0 auto;color:#fff;background:linear-gradient(145deg,#4338ca,#2563eb);box-shadow:0 5px 12px #4f46e533}
        .de-account-title{font-size:14px;font-weight:800;letter-spacing:-.2px}
        .de-account-subtitle{display:block;color:#64748b;margin-top:3px;font-size:12px}
        .de-account-connected{margin-left:auto;display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:999px;background:#dcfce7;color:#166534;font-size:11px;font-weight:750;white-space:nowrap}
        .de-account-balance{display:flex;align-items:center;gap:12px;padding:12px 13px;border:1px solid #dbeafe;border-radius:14px;background:linear-gradient(115deg,#eff6ff,#fff 82%)}
        .de-account-coin{width:36px;height:36px;display:grid;place-items:center;border-radius:11px;background:#dbeafe;color:#1d4ed8;flex:0 0 auto}
        .de-account-balance-label{display:block;color:#64748b;font-size:11px;font-weight:700;letter-spacing:.35px;text-transform:uppercase}
        .de-account-balance-value{display:block;color:#172554;font-size:21px;line-height:1.3;font-weight:850;letter-spacing:-.6px;font-variant-numeric:tabular-nums}
        .de-account-owned{margin-left:auto;color:#64748b;text-align:right;font-size:11px;line-height:1.5}
        .de-account-owned strong{display:block;color:#334155;font-size:14px}
        .de-account-form{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
        .de-account-input{box-sizing:border-box;flex:1 1 140px;min-width:0;width:100%;border:1px solid #d5deeb;border-radius:11px;padding:11px 12px;background:#fff;color:#172033;outline:none;transition:border-color .18s,box-shadow .18s}
        .de-account-input:focus{border-color:#6366f1;box-shadow:0 0 0 3px #6366f122}
        .de-account-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:11px;background:linear-gradient(135deg,#3730a3,#2563eb);color:#fff;padding:11px 15px;cursor:pointer;font-weight:750;box-shadow:0 4px 10px #3730a322;transition:transform .18s,filter .18s,box-shadow .18s}
        .de-account-button:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.05);box-shadow:0 7px 16px #3730a333}
        .de-account-button:disabled{opacity:.65;cursor:wait}
        .de-account-button.secondary{background:#fff;color:#334155;border:1px solid #d5deeb;box-shadow:none}
        .de-account-feedback{display:flex;align-items:center;gap:9px;padding:10px 11px;border-radius:12px;font-size:12px;line-height:1.45;font-weight:650;animation:deFeedbackIn .32s ease-out both}
        .de-account-feedback.success{color:#166534;background:#f0fdf4;border:1px solid #bbf7d0}
        .de-account-feedback.error{color:#991b1b;background:#fef2f2;border:1px solid #fecaca}
        .de-account-feedback-icon{display:grid;place-items:center;width:27px;height:27px;border-radius:50%;flex:0 0 auto}
        .de-account-feedback.success .de-account-feedback-icon{background:#22c55e;color:#fff;animation:deCheckPop .48s cubic-bezier(.2,1.7,.4,1) both}
        .de-account-feedback.error .de-account-feedback-icon{background:#fee2e2;color:#b91c1c}
        .de-account-spinner{width:15px;height:15px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;display:inline-block;animation:deSpin .7s linear infinite}
        @keyframes deSpin{to{transform:rotate(360deg)}}@keyframes deCheckPop{0%{transform:scale(.3) rotate(-25deg)}65%{transform:scale(1.16) rotate(4deg)}100%{transform:scale(1) rotate(0)}}@keyframes deFeedbackIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes deCardIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:520px){.de-account-connected{margin-left:0}.de-account-head{flex-wrap:wrap}.de-account-form>*{flex-basis:100%}.de-account-owned{margin-left:auto}}
      `}</style>
      <div className="de-account-head">
        <span className="de-account-mark"><ShieldCheck size={22}/></span>
        <div style={{minWidth:0,flex:1}}>
          <strong className="de-account-title">DaEconomy account</strong>
          <span className="de-account-subtitle">{isLoading ? "Connecting securely…" : isAuthenticated ? "Your IDA store is linked to DaEconomy." : "Sign in with your existing DaEconomy account."}</span>
        </div>
        {isAuthenticated && <span className="de-account-connected"><CheckCircle2 size={14}/> Connected</span>}
      </div>
      {isAuthenticated ? (
        <>
          <div className="de-account-balance">
            <span className="de-account-coin"><Coins size={21}/></span>
            <div style={{minWidth:0,flex:1}}>
              <span className="de-account-balance-label">Your DaCoin balance</span>
              <strong className="de-account-balance-value">{balanceValue === null ? <><span className="de-account-spinner" style={{color:"#2563eb",marginRight:8}}/>Loading balance…</> : balanceValue.toLocaleString()}</strong>
            </div>
            <div className="de-account-owned"><strong>{entitlementRows ? entitlementRows.length : "—"}</strong>owned apps</div>
          </div>
          {feedbackKind && message && <div role="status" aria-live="polite" className={"de-account-feedback "+feedbackKind}><span className="de-account-feedback-icon">{feedbackKind==="success"?<CheckCircle2 size={18}/>:<CircleAlert size={18}/>}</span><span>{message}</span></div>}
          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <button type="button" className="de-account-button secondary" onClick={() => { setMessage(""); setFeedbackKind(null); void signOut(); }}><LogOut size={16}/> Sign out</button>
          </div>
        </>
      ) : (
        <>
          <form onSubmit={submit} className="de-account-form">
            <input className="de-account-input" aria-label="DaEconomy username" autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} placeholder="DaEconomy username" required />
            <input className="de-account-input" aria-label="DaEconomy password" autoComplete="current-password" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password" required />
            <button className="de-account-button" type="submit" disabled={busy || !username.trim() || !password}>{busy ? <><span className="de-account-spinner"/> Connecting…</> : <><LogIn size={16}/> Sign in</>}</button>
          </form>
          {feedbackKind && message && <div role="status" aria-live="polite" className={"de-account-feedback "+feedbackKind}><span className="de-account-feedback-icon">{feedbackKind==="success"?<CheckCircle2 size={18}/>:<CircleAlert size={18}/>}</span><span>{message}</span></div>}
        </>
      )}
    </section>ion>
  );
}
