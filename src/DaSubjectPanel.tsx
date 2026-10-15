import officeBackground from './dasubject-office.svg'\nimport DaSubjectIvorIntro from './DaSubjectIvorIntro'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, LockKeyhole, RadioTower, Users, Shield, Volume2, VolumeX, Monitor, Check, Copy, RefreshCw, Zap, ChevronRight, Eye, EyeOff } from 'lucide-react'

type Screen = 'menu' | 'play' | 'create' | 'join' | 'lobby' | 'credits' | 'settings' | 'ivor'
type Character = 'Ivor' | 'Teno' | null
const PASS = 'Moha4ever'
const ACCESS_KEY = 'ida-dasubject-access-v1'
const ROOM_KEY = 'ida-dasubject-room-v1'
const CHARACTER_KEY = 'ida-dasubject-character-v1'

function makeCode() {
  return Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('')
}

export default function DaSubjectPanel() {
  const [unlocked, setUnlocked] = useState(false)
  const [intro, setIntro] = useState<'loading'|'password'|'entering'|'ready'>('loading')
  useEffect(() => { const timer = window.setTimeout(() => setIntro('password'), 2400); return () => window.clearTimeout(timer) }, [])
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [remember, setRemember] = useState(true)
  const [screen, setScreen] = useState<Screen>('menu')
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [roomRole, setRoomRole] = useState<'host'|'guest'>('host')
  const [character, setCharacter] = useState<Character>(() => { try { const saved=localStorage.getItem(CHARACTER_KEY); return saved==='Ivor'||saved==='Teno'?saved:null } catch { return null } })
  const [ready, setReady] = useState(false)
  const [sound, setSound] = useState(true)
  const [motion, setMotion] = useState(true)
  const [status, setStatus] = useState('')
  const [copied, setCopied] = useState(false)
  const title = 'DA SUBJECT'
  const codeForDisplay = roomCode || joinCode.toUpperCase()
  const canReady = !!character
  const enter = () => {
    if (password !== PASS) { setPasswordError('ACCESS DENIED — this project is still classified.'); return }
    setPasswordError('')
    setIntro('entering')
    window.setTimeout(() => { setUnlocked(true); setIntro('ready'); if (remember) { try { localStorage.setItem(ACCESS_KEY, 'yes') } catch {} } }, 1500)
  }
  const createLobby = () => {
    const code = makeCode()
    setRoomCode(code)
    setJoinCode('')
    setRoomRole('host')
    setCharacter(null)
    try { localStorage.removeItem(CHARACTER_KEY) } catch {}
    setReady(false)
    setStatus('Lobby created. Share this code with your second player.')
    try { localStorage.setItem(ROOM_KEY, JSON.stringify({ code, hostReady: false, guestReady: false, createdAt: Date.now() })) } catch {}
    setScreen('lobby')
  }
  const joinLobby = () => {
    const code = joinCode.trim().toUpperCase()
    if (code.length < 4) { setStatus('Enter the full lobby code first.'); return }
    setRoomCode(code)
    setRoomRole('guest')
    setCharacter(null)
    setReady(false)
    setStatus('Demo lobby opened. Real cross-device lobby syncing will be connected in a later step.')
    setScreen('lobby')
  }
  const back = () => { setStatus(''); setScreen(screen === 'lobby' ? 'play' : screen === 'create' || screen === 'join' ? 'play' : 'menu') }
  const card = 'rounded-2xl border border-white/10 bg-slate-950/65 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,.48)]'
  const btn = 'group flex w-full items-center justify-between rounded-xl border border-white/[0.09] bg-slate-950/45 px-5 py-4 text-left text-white transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200/50 hover:bg-cyan-200/[0.07] focus:outline-none focus:ring-2 focus:ring-cyan-300/70'
  const smallBtn = 'ds-pixel-button rounded-sm border border-cyan-300/40 bg-slate-950 px-3 py-2 text-xs text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-950'
  const heading = 'text-2xl font-semibold tracking-[.12em] text-white'
  const panel = useMemo(() => ({ background: 'radial-gradient(ellipse at 78% 30%, rgba(8,145,178,.22), transparent 38%), radial-gradient(ellipse at 12% 82%, rgba(249,115,22,.09), transparent 35%), linear-gradient(125deg,#02040b 0%,#071321 52%,#020611 100%)' }), [])

  return <div className="ds-shell relative h-full min-h-[560px] w-full overflow-hidden rounded-xl bg-slate-950 text-white" style={panel}>
    <style>{`
      @keyframes ds-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      @keyframes ds-pulse { 0%,100%{opacity:.25} 50%{opacity:.75} }
      @keyframes ds-scan { from{transform:translateY(-100%)} to{transform:translateY(650%)} }
      @keyframes ds-flicker { 0%,96%,100%{opacity:1} 97%{opacity:.82} 98%{opacity:.96} }
      @keyframes ds-rise { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      @keyframes ds-reveal { from{opacity:0;filter:blur(12px);transform:scale(1.035)} to{opacity:1;filter:blur(0);transform:scale(1)} }
      @keyframes ds-loader { 0%{transform:translateX(-110%)} 100%{transform:translateX(300%)} }
      @keyframes ds-orbit { to{transform:rotate(360deg)} }

      /* Explicit component styles: keep the embedded DAPP polished even if Tailwind utilities are purged. */
      .ds-shell { font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace;color:#f8fafc; }
      .ds-shell * { box-sizing:border-box; }
      .ds-shell header { min-height:66px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 28px;border-bottom:1px solid rgba(255,255,255,.1); }
      .ds-brand { display:flex;align-items:center;gap:12px; }
      .ds-brand-mark { display:grid;place-items:center;width:38px;height:38px;border:1px solid rgba(103,232,249,.35);border-radius:10px;background:rgba(34,211,238,.09);color:#a5f3fc; }
      .ds-brand-title { font-size:11px;font-weight:700;letter-spacing:.3em;color:#a5f3fc; }
      .ds-brand-sub { margin-top:4px;font-size:10px;letter-spacing:.18em;color:#64748b; }
      .ds-network { display:flex;align-items:center;gap:8px;font-size:10px;letter-spacing:.16em;color:#64748b; }
      .ds-shell main { flex:1;min-height:0;padding:28px;display:flex;flex-direction:column; }
      .ds-shell footer { display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 28px;border-top:1px solid rgba(255,255,255,.1);font-size:9px;letter-spacing:.14em;color:#64748b; }
      .ds-shell h1,.ds-shell h2,.ds-shell h3,.ds-shell p { margin-top:0; }
      .ds-shell button { font:inherit;cursor:pointer; }
      .ds-shell button:disabled { cursor:not-allowed; }
      .ds-pixel-button{background:#071323!important;color:#d9faff!important;border:2px solid #31536b!important;border-radius:2px!important;box-shadow:3px 3px 0 #0008!important;padding:9px 12px!important;font-size:11px!important;font-weight:800!important;letter-spacing:.08em!important}
      .ds-character-card{background:#071323!important;color:#f8fafc!important;border:2px solid #29445e!important;border-radius:3px!important;box-shadow:4px 4px 0 rgba(0,0,0,.45)!important}
      .ds-character-card .ds-character-meta{background:#071323!important;color:#f8fafc!important}
      .ds-character-card.selected{border-color:#67e8f9!important;background:#0c2938!important}
      .ds-lobby-panel{background:rgba(3,12,25,.96)!important;color:#f8fafc!important;border:2px solid #29445e!important;border-radius:3px!important;box-shadow:4px 4px 0 rgba(0,0,0,.35)!important}
      .ds-character-card .ds-avatar-stage{height:160px!important;background:#081625!important}.ds-character-card .ds-character-meta{background:#071323!important;color:#f8fafc!important}.ds-character-card .ds-character-meta .text-sm{color:#94a3b8!important}.ds-character-card .ds-character-name{font-size:15px!important}
      .ds-character-card .ds-avatar-stage svg{width:86px!important;height:126px!important;image-rendering:pixelated;shape-rendering:crispEdges}
      .ds-shell input:not([type=checkbox]) { font:inherit;color:#f8fafc; }
      .ds-shell input::placeholder { color:#64748b; }
      .ds-menu-layout { display:grid;grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr);align-items:center;gap:clamp(28px,5vw,72px);flex:1;padding:22px 0 60px; }
      .ds-menu-copy { position:relative;z-index:2;min-width:0; }
      .ds-menu-title { margin:0;font-size:clamp(54px,7.5vw,100px);font-weight:900;line-height:.86;letter-spacing:-.075em; }
      .ds-menu-description { max-width:440px;margin:24px 0 0;border-left:1px solid rgba(103,232,249,.45);padding-left:16px;font-size:15px;line-height:1.85;color:#cbd5e1; }
      .ds-menu-actions { display:flex;flex-direction:column;gap:10px;width:min(100%,370px);margin-top:30px; }
      .ds-action-primary { display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 20px;border:1px solid rgba(165,243,252,.4);border-radius:8px;background:#a5f3fc;color:#04111c;font-weight:800;letter-spacing:.16em;text-align:left;box-shadow:0 0 34px rgba(34,211,238,.12);transition:transform .22s,background .22s; }
      .ds-action-primary:hover { transform:translateY(-2px);background:#cffafe; }
      .ds-action-row { display:grid;grid-template-columns:1fr 1fr;gap:10px; }
      .ds-action-secondary { display:flex;align-items:center;justify-content:space-between;gap:8px;padding:13px 14px;border:1px solid rgba(255,255,255,.11);border-radius:8px;background:rgba(2,6,23,.6);color:#e2e8f0;font-size:12px;letter-spacing:.08em;text-align:left;transition:border-color .2s,background .2s; }
      .ds-action-secondary:hover { border-color:rgba(103,232,249,.5);background:rgba(34,211,238,.08); }
      .ds-dossier { position:relative;z-index:1;width:100%;max-width:430px;justify-self:end;border-top:1px solid rgba(103,232,249,.28);border-bottom:1px solid rgba(103,232,249,.2);padding:24px 0; }
      .ds-dossier-top { display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:22px;font-size:10px;letter-spacing:.22em;color:#a5f3fc; }
      .ds-classified { padding:6px 9px;border:1px solid rgba(253,186,116,.35);border-radius:3px;color:#fdba74;font-size:9px;letter-spacing:.16em; }
      .ds-dossier-heading { font-size:clamp(27px,3vw,40px);font-weight:300;line-height:1.15;letter-spacing:-.04em; }
      .ds-dossier-rule { height:1px;margin:20px 0;background:linear-gradient(90deg,rgba(103,232,249,.65),rgba(255,255,255,.08),transparent); }
      .ds-subjects { display:grid;grid-template-columns:1fr 1fr;gap:18px; }
      .ds-subject-label { font-size:10px;letter-spacing:.2em;color:#67e8f9; }
      .ds-subject-name { margin-top:5px;font-size:19px;font-weight:700;letter-spacing:.06em; }
      .ds-subject-desc { margin-top:6px;font-size:12px;line-height:1.7;color:#94a3b8; }
      .ds-dossier-foot { display:flex;justify-content:space-between;gap:8px;margin-top:24px;font-size:9px;letter-spacing:.12em;color:#64748b; }


      .ds-office-bg{position:absolute;inset:0;z-index:0;background-color:#030914;background-image:linear-gradient(90deg,rgba(2,7,17,.48) 0%,rgba(2,7,17,.22) 42%,rgba(2,7,17,.06) 72%,rgba(2,7,17,.24) 100%),linear-gradient(0deg,rgba(2,6,15,.55),transparent 38%,rgba(2,6,15,.04)),url('${officeBackground}');background-size:cover;background-position:center center;transform:scale(1.01);animation:ds-city-reveal 1.8s ease-out both;pointer-events:none}

      @keyframes ds-city-reveal{from{transform:scale(1.09);filter:brightness(.55)}to{transform:scale(1.02);filter:brightness(1)}}
      .ds-play-wrap{width:100%;max-width:850px;margin:auto;position:relative;z-index:2}.ds-page-title{margin:12px 0 8px;font-size:clamp(32px,5vw,54px);font-weight:900;line-height:1;letter-spacing:-.055em}.ds-page-copy{margin:0 0 26px;font-size:13px;line-height:1.8;color:#a5b4c7}.ds-choice-card{display:flex;min-height:128px;flex-direction:column;justify-content:space-between;padding:14px;border:2px solid #29445e;border-radius:3px;background:#071323;text-align:left;box-shadow:4px 4px 0 rgba(0,0,0,.42);transition:transform .12s,border-color .12s}.ds-choice-card:hover{transform:translate(-1px,-1px);border-color:#8cecff}.ds-choice-title{margin-top:10px;font-size:13px}.ds-choice-copy{margin-top:6px;font-size:10px;line-height:1.7;color:#a7b5c8}.ds-choice-title{margin-top:20px;font-size:17px;font-weight:800;letter-spacing:.08em}.ds-choice-copy{margin-top:8px;font-size:12px;line-height:1.7;color:#94a3b8}.ds-character-card{display:block!important;width:100%;min-width:0;overflow:hidden;border:1px solid rgba(103,232,249,.24)!important;border-radius:12px!important;background:linear-gradient(145deg,rgba(6,20,35,.98),rgba(2,7,17,.98))!important;color:#f8fafc!important;text-align:left;box-shadow:0 14px 36px rgba(0,0,0,.25);transition:border-color .2s,transform .2s,background .2s}.ds-character-card:hover{transform:translateY(-2px);border-color:rgba(103,232,249,.6)!important}.ds-character-card.selected{border-color:#67e8f9!important;background:linear-gradient(145deg,rgba(8,47,63,.98),rgba(2,12,25,.98))!important;box-shadow:0 0 0 1px #67e8f955,0 12px 32px #22d3ee18}.ds-character-card.taken{opacity:.42;filter:grayscale(.7)}.ds-avatar-stage{position:relative;display:grid;place-items:center;height:174px;overflow:hidden;background:radial-gradient(ellipse at 50% 22%,#164e6380,transparent 65%),linear-gradient(#0b2034,#060b17);border-bottom:1px solid #164e63}.ds-avatar-stage svg{display:block!important;width:104px!important;height:148px!important;max-width:104px!important;max-height:148px!important;overflow:visible}.ds-character-meta{padding:12px 14px}.ds-character-name{font-size:17px;font-weight:900;letter-spacing:.08em;color:#f8fafc}.ds-character-role{margin-top:5px;font-size:11px;line-height:1.6;color:#a7b5c8}.ds-lobby-panel{border:1px solid rgba(103,232,249,.2);border-radius:12px;background:rgba(2,10,23,.9);padding:12px}.ds-choice-card{min-height:142px!important;padding:16px!important;border-radius:11px!important;background:linear-gradient(145deg,rgba(6,20,35,.96),rgba(2,7,17,.96))!important;color:#f8fafc!important}.ds-choice-title{margin-top:12px;font-size:14px}.ds-choice-copy{font-size:11px}.ds-action-primary{padding:12px 15px!important;font-size:12px!important;border-radius:7px!important}.ds-action-secondary{padding:10px 11px!important;font-size:10px!important;border-radius:7px!important}.ds-lobby-panel{border:1px solid rgba(103,232,249,.2);border-radius:15px;background:rgba(2,10,23,.9);padding:16px}
      .ds-settings-wrap{width:100%;max-width:620px;margin:auto;position:relative;z-index:2}
      .ds-settings-kicker{font-size:10px;letter-spacing:.34em;color:#67e8f9}
      .ds-settings-title{margin:9px 0 6px;font-size:clamp(38px,5vw,58px);font-weight:900;line-height:1;letter-spacing:-.06em}
      .ds-settings-subtitle{font-size:13px;line-height:1.7;color:#94a3b8}
      .ds-settings-card{margin-top:25px;overflow:hidden;border:1px solid rgba(103,232,249,.22);border-radius:15px;background:linear-gradient(145deg,rgba(3,14,29,.92),rgba(2,7,17,.88));box-shadow:0 22px 80px rgba(0,0,0,.4);backdrop-filter:blur(20px)}
      .ds-setting-row{display:flex;width:100%;align-items:center;justify-content:space-between;gap:18px;padding:20px 22px;text-align:left;border-bottom:1px solid rgba(255,255,255,.08);background:transparent;color:#f1f5f9;transition:background .2s}
      .ds-setting-row:hover{background:rgba(34,211,238,.06)}
      .ds-setting-icon{display:grid;place-items:center;width:40px;height:40px;flex-shrink:0;border:1px solid rgba(103,232,249,.22);border-radius:10px;background:rgba(34,211,238,.08);color:#a5f3fc}
      .ds-setting-name{font-size:13px;font-weight:650}
      .ds-setting-description{margin-top:5px;font-size:11px;line-height:1.5;color:#8494aa}
      .ds-toggle{position:relative;width:42px;height:24px;flex-shrink:0;border:1px solid rgba(148,163,184,.35);border-radius:99px;background:#1e293b;transition:background .2s}
      .ds-toggle:after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#94a3b8;transition:transform .2s,background .2s}
      .ds-toggle.on{background:#0891b2;border-color:#67e8f9}.ds-toggle.on:after{transform:translateX(18px);background:#ecfeff}
      .ds-settings-back{display:flex;align-items:center;gap:9px;margin-bottom:30px;border:0;background:transparent;color:#9caec2;font-size:10px;font-weight:700;letter-spacing:.2em}
      .ds-settings-back:hover{color:#a5f3fc}
      .ds-danger-button{margin-top:12px;padding:10px 13px;border:1px solid rgba(251,146,60,.3);border-radius:7px;background:rgba(249,115,22,.07);color:#fdba74;font-size:10px;font-weight:700;letter-spacing:.1em}

      .ds-access-screen{position:relative;z-index:3;display:flex;flex:1;align-items:center;justify-content:center;padding:32px 24px}
      .ds-access-card{width:100%;max-width:430px;padding:34px;border:1px solid rgba(103,232,249,.22);border-radius:18px;background:linear-gradient(145deg,rgba(5,17,31,.96),rgba(2,7,18,.94));box-shadow:0 25px 100px rgba(0,0,0,.58),inset 0 1px rgba(255,255,255,.04);backdrop-filter:blur(24px)}
      .ds-lock-icon{display:grid;place-items:center;width:54px;height:54px;margin-bottom:24px;border:1px solid rgba(103,232,249,.3);border-radius:14px;background:rgba(34,211,238,.09);color:#a5f3fc}
      .ds-access-kicker{margin-bottom:9px;font-size:10px;font-weight:700;letter-spacing:.3em;color:#a5f3fc}
      .ds-access-title{margin:0;font-size:clamp(23px,3vw,31px);font-weight:800;letter-spacing:-.035em;color:#f8fafc}
      .ds-access-copy{margin:13px 0 25px;font-size:13px;line-height:1.8;color:#94a3b8}
      .ds-access-label{display:block;margin-bottom:9px;font-size:10px;letter-spacing:.17em;color:#cbd5e1}
      .ds-access-field{display:flex;align-items:center;border:1px solid rgba(148,163,184,.22);border-radius:9px;background:rgba(0,0,0,.35);overflow:hidden}
      .ds-access-field:focus-within{border-color:rgba(103,232,249,.7);box-shadow:0 0 0 3px rgba(34,211,238,.07)}
      .ds-access-field input{min-width:0;flex:1;width:100%;padding:14px 13px;border:0!important;outline:0;background:transparent!important;color:#f8fafc!important;font-size:13px!important;box-shadow:none!important}
      .ds-eye-button{display:grid;place-items:center;width:44px;align-self:stretch;border:0;background:transparent;color:#94a3b8}
      .ds-eye-button:hover{color:#a5f3fc}
      .ds-remember{display:flex;align-items:center;gap:9px;margin:14px 0 18px;font-size:11px;color:#94a3b8}
      .ds-remember input{accent-color:#67e8f9}
      .ds-submit{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px 16px;border:1px solid rgba(165,243,252,.35);border-radius:9px;background:linear-gradient(100deg,#a5f3fc,#67e8f9);color:#04111c;font-size:11px;font-weight:900;letter-spacing:.15em;box-shadow:0 8px 28px rgba(34,211,238,.12);transition:filter .2s,transform .2s}
      .ds-submit:hover{filter:brightness(1.08);transform:translateY(-1px)}
      .ds-access-foot{margin-top:22px;padding-top:15px;border-top:1px solid rgba(255,255,255,.08);font-size:9px;letter-spacing:.12em;color:#64748b}
      .ds-city-haze{position:absolute;left:0;right:0;bottom:0;height:58%;background:linear-gradient(to top,rgba(3,8,19,.12),rgba(3,8,19,.18) 35%,transparent);pointer-events:none}
      .ds-city-glow{position:absolute;bottom:17%;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(34,211,238,.55),rgba(251,146,60,.5),rgba(34,211,238,.45),transparent);box-shadow:0 0 35px rgba(34,211,238,.25)}
      .ds-skyline-label{position:absolute;right:7%;bottom:32%;padding:7px 10px;border:1px solid rgba(103,232,249,.22);background:rgba(2,10,23,.7);font-size:8px;letter-spacing:.24em;color:rgba(165,243,252,.85);transform:skewY(-5deg)}
      @media(max-width:760px){.ds-access-card{padding:25px 20px}}

      .ds-glass-card { border:1px solid rgba(255,255,255,.11);border-radius:15px;background:rgba(2,6,23,.68);box-shadow:0 24px 80px rgba(0,0,0,.42);backdrop-filter:blur(18px); }
      @media(max-width:760px) { .ds-shell header,.ds-shell main { padding-left:18px;padding-right:18px; } .ds-menu-layout { grid-template-columns:1fr;gap:28px;padding-top:26px; } .ds-menu-title { font-size:clamp(54px,13vw,82px); } .ds-dossier { display:none; } .ds-shell footer { padding:10px 18px;font-size:8px; } .ds-network { display:none; } }

      .ds-enter { animation:ds-rise .8s cubic-bezier(.2,.75,.25,1) both; }
      .ds-reveal { animation:ds-reveal 1.1s cubic-bezier(.2,.7,.2,1) both; }
      .ds-grid { background-image:linear-gradient(rgba(34,211,238,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,.055) 1px,transparent 1px);background-size:42px 42px; }
      .ds-city { position:absolute;bottom:0;left:0;right:0;height:58%;opacity:.68;overflow:hidden;mask-image:linear-gradient(to top,black 0%,black 52%,transparent 100%); }
      .ds-building { position:absolute;bottom:0;border:1px solid rgba(103,232,249,.14);background:linear-gradient(90deg,rgba(3,10,23,.98),rgba(10,31,49,.9),rgba(2,7,18,.99));box-shadow:inset 0 0 36px rgba(34,211,238,.06),0 0 24px rgba(0,0,0,.5); }
      .ds-windows { position:absolute;inset:10px 6px;background-image:repeating-linear-gradient(0deg,transparent 0 10px,rgba(34,211,238,.36) 10px 12px),repeating-linear-gradient(90deg,transparent 0 12px,rgba(251,146,60,.25) 12px 14px);mask-image:linear-gradient(to bottom,black,transparent); }
      .ds-scanline { position:absolute;left:0;right:0;height:35px;background:linear-gradient(transparent,rgba(34,211,238,.035),transparent);animation:ds-scan 14s linear infinite;pointer-events:none; }
      .ds-grain { position:absolute;inset:0;opacity:.07;pointer-events:none;background-image:url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\");mix-blend-mode:screen;}
      .ds-kicker { font-size:10px; letter-spacing:.28em; text-transform:uppercase; color:rgba(165,243,252,.8); }
      @media (prefers-reduced-motion: reduce) { .ds-scanline { animation:none; } }
    `}</style>
    <div className="ds-office-bg" aria-hidden="true"/><div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_50%_20%,transparent_0%,rgba(2,6,23,.05)_48%,rgba(2,6,23,.5)_100%)] pointer-events-none"/>
    <div className="ds-scanline" />
    {intro !== 'ready' && <div className="absolute inset-0 z-30 flex min-h-[560px] items-center justify-center bg-[#020611]/95 px-6 backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(8,145,178,.17),transparent_48%)]"/>
      {intro === 'loading' ? <div className="relative w-full max-w-sm text-center ds-enter">
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center"><div className="absolute inset-0 rounded-full border border-cyan-200/20"/><div className="absolute inset-1 rounded-full border-t border-cyan-200" style={{animation:'ds-orbit 1.5s linear infinite'}}/><div className="absolute inset-4 rounded-full border border-orange-300/30"/><RadioTower size={30} className="text-cyan-200"/></div>
        <div className="text-[10px] tracking-[.48em] text-cyan-200">IDA ORIGINAL PRESENTS</div><h1 className="mt-4 text-4xl font-black tracking-[.12em]">DA SUBJECT</h1><p className="mt-3 text-xs tracking-[.2em] text-slate-500">INITIALIZING CLASSIFIED BUILD // 2091</p>
        <div className="mx-auto mt-8 h-[2px] w-64 max-w-full overflow-hidden bg-white/10"><div className="h-full w-1/3 bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,.8)]" style={{animation:'ds-loader 1.2s ease-in-out infinite'}}/></div><div className="mt-3 text-[9px] tracking-[.28em] text-slate-600">LOADING CITY SIMULATION</div>
      </div> : intro === 'entering' ? <div className="relative text-center ds-reveal"><div className="text-[10px] tracking-[.5em] text-cyan-200">IDENTITY VERIFIED</div><div className="mt-4 text-4xl font-black tracking-[.14em]">WELCOME TO <span className="text-cyan-300">2091</span></div><div className="mx-auto mt-6 h-px w-48 bg-gradient-to-r from-transparent via-cyan-200 to-transparent"/></div> : null}
    </div>}
    <div className={'relative z-10 flex min-h-[560px] h-full flex-col '+(intro==='ready'?'ds-reveal':'')}>
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/35 bg-cyan-300/10 text-cyan-200"><RadioTower size={19}/></div>
          <div><div className="text-[11px] font-semibold tracking-[.32em] text-cyan-200">IDA ORIGINAL</div><div className="text-[10px] tracking-[.2em] text-slate-500">CLASSIFIED BUILD // 2091</div></div>
        </div>
        <div className="hidden items-center gap-2 text-[10px] tracking-[.2em] text-slate-500 sm:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"/> CITY NETWORK ONLINE <span className="text-slate-700">/</span> BUILD 0.1</div>
      </header>

      {!unlocked ? <div className={'relative flex flex-1 items-center justify-center px-5 py-10 '+(intro==='password'?'ds-enter':'opacity-0 pointer-events-none')}>
        <div className="ds-access-card">
          <div className="ds-lock-icon"><LockKeyhole size={26}/></div>
          <div className="ds-access-kicker">RESTRICTED ACCESS</div>
          <h1 className="ds-access-title">PROJECT DA SUBJECT</h1>
          <p className="ds-access-copy">This build is classified. Enter your access key to enter the city.</p>
          <form className="mt-6 space-y-4" onSubmit={e=>{e.preventDefault();enter()}}>
            <label className="ds-access-label">ACCESS PASSWORD</label>
            <div className="ds-access-field">
              <input autoFocus type={showPassword?'text':'password'} value={password} onChange={e=>{setPassword(e.target.value);setPasswordError('')}} placeholder="Enter access password"  />
              <button type="button" onClick={()=>setShowPassword(v=>!v)} className="ds-eye-button" aria-label="Show password">{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button>
            </div>
            {passwordError && <p className="text-xs text-rose-300">{passwordError}</p>}
            <label className="ds-remember"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} className="accent-cyan-300"/> Remember access on this browser</label>
            <button className="ds-submit">ENTER PROJECT <ArrowRight size={16}/></button>
          </form>
          <div className="ds-access-foot">PRIVATE PREVIEW • UNAUTHORIZED ENTRY PROHIBITED</div>
        </div>
      </div> : <>
        <main>
          {screen==='menu' && <div className="ds-menu-layout">
            <section className="ds-menu-copy">
              <div className="mb-6 flex items-center gap-3"><span className="h-px w-9 bg-cyan-300"/><span className="ds-kicker">YEAR 2091</span><span className="text-slate-700">/</span><span className="text-[10px] tracking-[.18em] text-slate-500">EARTH POPULATION: CRITICAL</span></div>
              <div className="mb-3 text-[10px] font-medium tracking-[.48em] text-slate-500">A STORY ABOUT SURVIVAL</div>
              <h1 className="ds-menu-title" style={{animation:motion?'ds-flicker 10s infinite':undefined}}>DA<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-cyan-400 to-cyan-700">SUBJECT</span><span className="text-orange-300">.</span></h1>
              <p className="ds-menu-description">A world with no room left to breathe. A secret that should not exist. Your story begins in the city of 2091.</p>
              <div className="ds-menu-actions">
                <button className="ds-action-primary" onClick={()=>setScreen('ivor')}><span className="flex items-center gap-3"><Zap size={18}/> BEGIN STORY</span><ArrowRight size={19}/></button>
                <div className="ds-action-row"><button className="ds-action-secondary" onClick={()=>setScreen('credits')}><span className="flex items-center gap-2"><Users size={16} className="text-cyan-200"/> CREDITS</span><ChevronRight size={16}/></button><button className="ds-action-secondary" onClick={()=>setScreen('settings')}><span className="flex items-center gap-2"><Monitor size={16} className="text-cyan-200"/> SETTINGS</span><ChevronRight size={16}/></button></div>
              </div>
            </section>
            <aside className="ds-dossier" style={{animation:motion?'ds-rise 1s .2s both':undefined}}>
              <div className="ds-dossier-top"><span>CLASSIFIED DOSSIER</span><span className="ds-classified">EYES ONLY</span></div>
              <div className="ds-dossier-heading">TWO LIVES<span className="text-cyan-300">.</span><br/>ONE SECRET<span className="text-cyan-300">.</span></div>
              <div className="ds-dossier-rule"/>
              <div className="ds-subjects"><div><div className="ds-subject-label">SUBJECT 01</div><div className="ds-subject-name">IVOR</div><div className="ds-subject-desc">An exhausted worker with nothing left.</div></div><div><div className="ds-subject-label">SUBJECT 02</div><div className="ds-subject-name">TENO</div><div className="ds-subject-desc">A traveler who never reached America.</div></div></div>
              <div className="ds-dossier-foot"><span>FILE: DS-2091-02</span><span>STATUS: REDACTED</span></div>
            </aside>
          </div>}

          {screen==='ivor' && <DaSubjectIvorIntro soundEnabled={sound} onBack={()=>setScreen('menu')}/> }\n          {screen==='play' && <div className="ds-play-wrap ds-enter">
            <button onClick={back} className="ds-settings-back"><ArrowLeft size={15}/> BACK TO MENU</button>
            <div className="ds-kicker">MULTIPLAYER / STORY MODE</div><h2 className="ds-page-title">FIND YOUR PARTNER<span className="text-cyan-300">.</span></h2>
            <p className="ds-page-copy">Create a private session for a friend, or enter an invite code to join theirs.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <button className="ds-choice-card" onClick={createLobby}><span className="ds-brand-mark"><RadioTower size={22}/></span><span><span className="ds-choice-title block">CREATE LOBBY</span><span className="ds-choice-copy block">Host a session and generate a code to share with your partner.</span></span><span className="mt-6 flex items-center gap-2 text-xs font-bold tracking-widest text-cyan-200">CREATE SESSION <ArrowRight size={15}/></span></button>
              <button className="ds-choice-card" onClick={()=>{setStatus('');setScreen('join')}}><span className="ds-brand-mark"><Users size={22}/></span><span><span className="ds-choice-title block">JOIN LOBBY</span><span className="ds-choice-copy block">Have a code already? Enter it to join your friend's session.</span></span><span className="mt-6 flex items-center gap-2 text-xs font-bold tracking-widest text-orange-200">ENTER INVITE CODE <ArrowRight size={15}/></span></button>
            </div>
          </div>}
          {screen==='join' && <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center">
            <button onClick={back} className="mb-8 flex w-fit items-center gap-2 text-xs tracking-[.16em] text-slate-400 hover:text-cyan-200"><ArrowLeft size={15}/> BACK</button>
            <div className="mb-2 text-xs tracking-[.3em] text-orange-200">PLAYER TWO / JOIN SESSION</div><h2 className={heading}>ENTER LOBBY CODE</h2><p className="mt-3 text-sm text-slate-400">Ask the host for the six-character code.</p>
            <form className="mt-7 space-y-4" onSubmit={e=>{e.preventDefault();joinLobby()}}>
              <input autoFocus maxLength={6} value={joinCode} onChange={e=>{setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,''));setStatus('')}} placeholder="E.G. 7KQ9XP" className="w-full rounded-xl border border-white/15 bg-black/35 px-4 py-4 text-center font-mono text-2xl tracking-[.35em] outline-none placeholder:text-slate-700 focus:border-cyan-300/70"/>
              {status && <p className="text-xs text-orange-200">{status}</p>}
              <button className="w-full rounded-xl bg-cyan-300 px-4 py-4 text-sm font-bold tracking-[.15em] text-slate-950 hover:bg-cyan-200">JOIN SESSION <ArrowRight size={16} className="ml-2 inline"/></button>
            </form>
          </div>}

          {screen==='lobby' && <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">
            <button onClick={back} className="mb-6 flex w-fit items-center gap-2 text-xs tracking-[.16em] text-slate-400 hover:text-cyan-200"><ArrowLeft size={15}/> LOBBY OPTIONS</button>
            <div className="mb-2 text-xs tracking-[.3em] text-cyan-200">SESSION // {roomRole==='host'?'HOST':'GUEST'}</div><h2 className={heading}>SQUAD ASSEMBLY</h2>
            <div className="ds-lobby-panel mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><div className="text-[10px] tracking-[.25em] text-slate-500">YOUR LOBBY CODE</div><div className="mt-1 font-mono text-3xl font-bold tracking-[.2em] text-cyan-200">{codeForDisplay}</div><p className="mt-1 text-xs text-slate-500">Share this with your friend to invite them.</p></div>
              <button className={smallBtn+' flex items-center justify-center gap-2'} onClick={()=>{navigator.clipboard?.writeText(codeForDisplay);setCopied(true);window.setTimeout(()=>setCopied(false),1400)}}><Copy size={15}/>{copied?'COPIED':'COPY CODE'}</button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(['Ivor','Teno'] as const).map((name,i)=>{const unavailable=character!==null&&character!==name;return <button key={name} disabled={unavailable} onClick={()=>{setCharacter(name);try{localStorage.setItem(CHARACTER_KEY,name)}catch{};setReady(false)}} className={'ds-character-card '+(character===name?'selected ':'')+(unavailable?'taken ':'')+'overflow-hidden text-left transition'}>
                <div className="ds-avatar-stage">
                  <span className="absolute left-3 top-3 text-[9px] tracking-[.2em] text-cyan-200">SUBJECT 0{i+1} / PORTRAIT</span>
                  <svg viewBox="0 0 32 40" aria-label={name+' pixel-art full-body sprite'} role="img" style={{imageRendering:'pixelated',shapeRendering:'crispEdges'}}><g shapeRendering="crispEdges"><rect x="10" y="2" width="12" height="2" fill={i===0?'#34343b':'#101827'}/><rect x="7" y="4" width="18" height="2" fill={i===0?'#34343b':'#101827'}/><rect x="6" y="6" width="20" height="2" fill={i===0?'#34343b':'#101827'}/><rect x="5" y="8" width="5" height="6" fill={i===0?'#34343b':'#101827'}/><rect x="22" y="8" width="5" height="6" fill={i===0?'#34343b':'#101827'}/><rect x="7" y="8" width="18" height="13" fill={i===0?'#e0ad86':'#8d563b'}/><rect x="8" y="7" width="16" height="2" fill={i===0?'#34343b':'#101827'}/>{i===0?<><rect x="8" y="6" width="4" height="2" fill="#34343b"/><rect x="12" y="4" width="9" height="2" fill="#34343b"/><rect x="21" y="6" width="3" height="2" fill="#34343b"/></>:<><rect x="8" y="4" width="3" height="4" fill="#101827"/><rect x="12" y="3" width="3" height="4" fill="#101827"/><rect x="17" y="3" width="4" height="4" fill="#101827"/><rect x="21" y="5" width="4" height="4" fill="#101827"/><rect x="6" y="5" width="3" height="4" fill="#101827"/><rect x="23" y="7" width="3" height="5" fill="#101827"/></>}<rect x="9" y="12" width="3" height="2" fill="#2b1c1a"/><rect x="20" y="12" width="3" height="2" fill="#2b1c1a"/><rect x="14" y="16" width="5" height="1" fill="#704334"/><rect x="13" y="20" width="6" height="3" fill={i===0?'#e0ad86':'#8d563b'}/><rect x="10" y="22" width="12" height="3" fill={i===0?'#cbd5e1':'#dbeafe'}/><rect x="8" y="24" width="16" height="9" fill={i===0?'#334155':'#075985'}/><rect x="5" y="25" width="4" height="8" fill={i===0?'#e0ad86':'#8d563b'}/><rect x="23" y="25" width="4" height="8" fill={i===0?'#e0ad86':'#8d563b'}/><rect x="10" y="33" width="5" height="4" fill={i===0?'#334155':'#075985'}/><rect x="18" y="33" width="5" height="4" fill={i===0?'#334155':'#075985'}/><rect x="9" y="37" width="7" height="2" fill="#171923"/><rect x="17" y="37" width="7" height="2" fill="#171923"/><rect x="12" y="25" width="8" height="2" fill={i===0?'#475569':'#0e7490'}/><rect x="14" y="28" width="4" height="2" fill={i===0?'#64748b':'#0891b2'}/></g></svg>
                  {unavailable&&<span className="absolute bottom-2 right-2 text-[9px] font-bold tracking-widest text-orange-200">TAKEN</span>}
                </div><div className="ds-character-meta p-4"><div className="text-[9px] tracking-[.22em] text-cyan-200">SUBJECT 0{i+1}</div><div className="mt-2 text-2xl font-bold tracking-wide">{name.toUpperCase()}</div><div className="mt-1 text-sm text-slate-400">{i===0?'PLAYER 01':'PLAYER 02'}</div><div className="mt-4 text-xs tracking-wider text-cyan-200">{character===name?'SELECTED':unavailable?'ALREADY TAKEN':'SELECT CHARACTER'} <ChevronRight size={13} className="inline"/></div></div>
              </button>})}
            </div>
            <div className="ds-lobby-panel mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><div className="font-medium">{character?character+' selected':'Choose your character'}</div><div className="mt-1 text-xs text-slate-500">{ready?'You are ready. Waiting for your partner...':'Both players must select a character and be ready.'}</div></div>
              <button disabled={!canReady} onClick={()=>setReady(v=>!v)} className={'ds-pixel-button rounded-sm px-4 py-2 text-xs font-bold tracking-wider transition disabled:cursor-not-allowed disabled:opacity-30 '+(ready?'border-emerald-300/40 text-emerald-200':'text-cyan-100')}>{ready?'✓ READY — CANCEL':'I AM READY'}</button>
            </div>
            {status && <p className="mt-3 text-xs text-orange-200">{status}</p>}
            <p className="mt-4 text-[10px] tracking-wide text-slate-600">PREVIEW LOBBY • ROOM MEMBERS AND READY STATUS ARE NOT YET SYNCHRONIZED BETWEEN DEVICES.</p>
          </div>}

          {screen==='credits' && <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
            <button onClick={back} className="mb-8 flex w-fit items-center gap-2 text-xs tracking-[.16em] text-slate-400 hover:text-cyan-200"><ArrowLeft size={15}/> BACK TO MENU</button><div className="mb-2 text-xs tracking-[.3em] text-cyan-200">THE PEOPLE BEHIND THE FILE</div><h2 className={heading}>CREDITS</h2>
            <div className={card+' mt-6 space-y-5 p-6'}><div><div className="text-[10px] tracking-[.22em] text-slate-500">CREATED BY</div><div className="mt-1 text-xl font-semibold">The IDA Studio</div></div><div><div className="text-[10px] tracking-[.22em] text-slate-500">STORY & GAME DESIGN</div><div className="mt-1 text-xl font-semibold">DaSubject Team</div></div><div><div className="text-[10px] tracking-[.22em] text-slate-500">SETTING</div><div className="mt-1 text-xl font-semibold">Earth, 2091 — a world out of room.</div></div></div>
          </div>}

          {screen==='settings' && <div className="ds-settings-wrap ds-enter">
            <button onClick={back} className="ds-settings-back"><ArrowLeft size={15}/> BACK TO MENU</button>
            <div className="ds-settings-kicker">SYSTEM CONFIGURATION // 01</div><h2 className="ds-settings-title">SETTINGS<span className="text-cyan-300">.</span></h2><p className="ds-settings-subtitle">Tune the experience to your preference.</p>
            <div className="ds-settings-card">
              <button className="ds-setting-row" onClick={()=>setSound(v=>!v)}><span className="flex items-center gap-4"><span className="ds-setting-icon">{sound?<Volume2 size={19}/>:<VolumeX size={19}/>}</span><span><span className="ds-setting-name block">Interface sound</span><span className="ds-setting-description block">Menu and interaction audio</span></span></span><span className={'ds-toggle '+(sound?'on':'')}/></button>
              <button className="ds-setting-row" onClick={()=>setMotion(v=>!v)}><span className="flex items-center gap-4"><span className="ds-setting-icon"><Monitor size={19}/></span><span><span className="ds-setting-name block">Motion effects</span><span className="ds-setting-description block">Animated transitions and ambient effects</span></span></span><span className={'ds-toggle '+(motion?'on':'')}/></button>
              <div className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className="ds-setting-icon"><Shield size={19}/></span><span><span className="ds-setting-name block">Access control</span><span className="ds-setting-description block">Lock the private preview again on this browser.</span></span></div><button className="ds-danger-button" onClick={()=>{setUnlocked(false);setPassword('');setIntro('password');try{localStorage.removeItem(ACCESS_KEY)}catch{}}}>LOCK PROJECT AGAIN</button></div>
            </div>
          </div>}
        </main>
        <footer className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-[9px] tracking-[.2em] text-slate-600 sm:px-8"><span>DA SUBJECT // INTERNAL PREVIEW</span><span className="flex items-center gap-2"><Shield size={12}/> ACCESS RESTRICTED</span><span>2091 © IDA</span></footer>
      </>}
    </div>
  </div>
}
