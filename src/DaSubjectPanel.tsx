import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, LockKeyhole, RadioTower, Users, Shield, Volume2, VolumeX, Monitor, Check, Copy, RefreshCw, Zap, ChevronRight, Eye, EyeOff } from 'lucide-react'

type Screen = 'menu' | 'play' | 'create' | 'join' | 'lobby' | 'credits' | 'settings'
type Character = 'Ivor' | 'Teno' | null
const PASS = 'Moha4ever'
const ACCESS_KEY = 'ida-dasubject-access-v1'
const ROOM_KEY = 'ida-dasubject-room-v1'

function makeCode() {
  return Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('')
}

export default function DaSubjectPanel() {
  const [unlocked, setUnlocked] = useState(() => { try { return localStorage.getItem(ACCESS_KEY) === 'yes' } catch { return false } })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [remember, setRemember] = useState(true)
  const [screen, setScreen] = useState<Screen>(() => {
    try { return localStorage.getItem(ACCESS_KEY) === 'yes' ? 'menu' : 'menu' } catch { return 'menu' }
  })
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [roomRole, setRoomRole] = useState<'host'|'guest'>('host')
  const [character, setCharacter] = useState<Character>(null)
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
    setUnlocked(true)
    setPasswordError('')
    if (remember) { try { localStorage.setItem(ACCESS_KEY, 'yes') } catch {} }
  }
  const createLobby = () => {
    const code = makeCode()
    setRoomCode(code)
    setJoinCode('')
    setRoomRole('host')
    setCharacter(null)
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
  const card = 'rounded-2xl border border-cyan-100/15 bg-slate-950/55 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,.32)]'
  const btn = 'group flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.045] px-5 py-4 text-left text-white transition duration-200 hover:border-cyan-300/60 hover:bg-cyan-300/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/70'
  const smallBtn = 'rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm text-slate-100 transition hover:border-cyan-300/60 hover:bg-cyan-300/10'
  const heading = 'text-2xl font-semibold tracking-[.12em] text-white'
  const panel = useMemo(() => ({ background: 'radial-gradient(ellipse at 72% 10%, rgba(8,145,178,.17), transparent 34%), linear-gradient(115deg,rgba(2,6,23,.97),rgba(8,20,38,.88) 52%,rgba(3,10,22,.96))' }), [])

  return <div className="relative h-full min-h-[560px] w-full overflow-hidden rounded-xl bg-slate-950 text-white" style={panel}>
    <style>{`
      @keyframes ds-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      @keyframes ds-pulse { 0%,100%{opacity:.25} 50%{opacity:.75} }
      @keyframes ds-scan { from{transform:translateY(-100%)} to{transform:translateY(650%)} }
      @keyframes ds-flicker { 0%,96%,100%{opacity:1} 97%{opacity:.82} 98%{opacity:.96} }
      .ds-grid { background-image:linear-gradient(rgba(34,211,238,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,.055) 1px,transparent 1px);background-size:42px 42px; }
      .ds-city { position:absolute;bottom:0;left:0;right:0;height:48%;opacity:.82;overflow:hidden; }
      .ds-building { position:absolute;bottom:0;border:1px solid rgba(103,232,249,.17);background:linear-gradient(90deg,rgba(5,20,37,.96),rgba(13,42,62,.84),rgba(2,12,27,.97));box-shadow:inset 0 0 26px rgba(34,211,238,.05); }
      .ds-windows { position:absolute;inset:10px 6px;background-image:repeating-linear-gradient(0deg,transparent 0 10px,rgba(34,211,238,.36) 10px 12px),repeating-linear-gradient(90deg,transparent 0 12px,rgba(251,146,60,.25) 12px 14px);mask-image:linear-gradient(to bottom,black,transparent); }
      .ds-scanline { position:absolute;left:0;right:0;height:35px;background:linear-gradient(transparent,rgba(34,211,238,.05),transparent);animation:ds-scan 10s linear infinite;pointer-events:none; }
    `}</style>
    <div className="ds-grid absolute inset-0 opacity-70" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,transparent_0%,rgba(2,6,23,.25)_48%,rgba(2,6,23,.9)_100%)]" />
    <div className="absolute -right-20 top-8 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
    <div className="absolute left-1/4 top-1/3 h-56 w-56 rounded-full bg-orange-500/[0.06] blur-3xl" />
    <div className="ds-city" aria-hidden="true">
      {Array.from({length:24},(_,i)=><div key={i} className="ds-building" style={{left:(i*4.4-1)+'%',width:(2.8+(i%4)*.45)+'%',height:(28+(i*37)%68)+'%'}}>
        <div className="ds-windows" style={{opacity:.3+(i%5)*.12}} />
        {i%5===0 && <div className="absolute -top-4 left-1/2 h-4 w-px bg-cyan-300/60"><div className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_12px_3px_rgba(34,211,238,.7)]" /></div>}
      </div>)}
      <div className="absolute bottom-[18%] left-0 right-0 h-px bg-cyan-300/30 shadow-[0_0_18px_3px_rgba(34,211,238,.16)]" />
      <div className="absolute bottom-[20%] left-[18%] h-2 w-24 skew-x-[-25deg] bg-orange-400/70 shadow-[0_0_18px_3px_rgba(251,146,60,.4)]" />
      <div className="absolute bottom-[28%] right-[15%] h-1 w-36 skew-x-[-25deg] bg-cyan-300/80 shadow-[0_0_18px_3px_rgba(34,211,238,.4)]" />
    </div>
    <div className="ds-scanline" />
    <div className="relative z-10 flex min-h-[560px] h-full flex-col">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/35 bg-cyan-300/10 text-cyan-200"><RadioTower size={19}/></div>
          <div><div className="text-[11px] font-semibold tracking-[.32em] text-cyan-200">IDA ORIGINAL</div><div className="text-[10px] tracking-[.2em] text-slate-500">CLASSIFIED BUILD // 2091</div></div>
        </div>
        <div className="hidden items-center gap-2 text-[10px] tracking-[.2em] text-slate-500 sm:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"/> CITY NETWORK ONLINE <span className="text-slate-700">/</span> BUILD 0.1</div>
      </header>

      {!unlocked ? <div className="relative flex flex-1 items-center justify-center px-5 py-10">
        <div className={card+' w-full max-w-md p-7 sm:p-9'}>
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200"><LockKeyhole size={26}/></div>
          <div className="mb-2 text-xs tracking-[.3em] text-cyan-200">RESTRICTED ACCESS</div>
          <h1 className="text-2xl font-semibold tracking-[.08em]">PROJECT DA SUBJECT</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">This build is classified. Enter your access key to enter the city.</p>
          <form className="mt-6 space-y-4" onSubmit={e=>{e.preventDefault();enter()}}>
            <label className="block text-xs tracking-wider text-slate-400">ACCESS PASSWORD</label>
            <div className="flex items-center rounded-xl border border-white/15 bg-black/35 focus-within:border-cyan-300/70">
              <input autoFocus type={showPassword?'text':'password'} value={password} onChange={e=>{setPassword(e.target.value);setPasswordError('')}} placeholder="Enter access password" className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-slate-600" />
              <button type="button" onClick={()=>setShowPassword(v=>!v)} className="px-3 text-slate-400 hover:text-white" aria-label="Show password">{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button>
            </div>
            {passwordError && <p className="text-xs text-rose-300">{passwordError}</p>}
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} className="accent-cyan-300"/> Remember access on this browser</label>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3.5 text-sm font-bold tracking-[.14em] text-slate-950 transition hover:bg-cyan-200">ENTER PROJECT <ArrowRight size={16}/></button>
          </form>
          <div className="mt-5 border-t border-white/10 pt-4 text-[10px] tracking-[.14em] text-slate-600">PRIVATE PREVIEW • UNAUTHORIZED ENTRY PROHIBITED</div>
        </div>
      </div> : <>
        <main className="flex flex-1 flex-col px-5 py-6 sm:px-8 sm:py-8">
          {screen==='menu' && <div className="flex flex-1 flex-col justify-center pb-24 sm:pb-28">
            <div className="mb-5 flex items-center gap-2 text-[10px] tracking-[.32em] text-cyan-200"><span className="h-px w-8 bg-cyan-300"/> YEAR 2091 <span className="text-slate-600">/</span> EARTH POPULATION: CRITICAL</div>
            <h1 className="max-w-3xl text-5xl font-black leading-[.92] tracking-[-.06em] sm:text-7xl" style={{animation:motion?'ds-flicker 8s infinite':undefined}}>DA <span className="text-cyan-300">SUBJECT</span><span className="text-orange-300">.</span></h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">A world with no room left to breathe. A secret that should not exist. Your story begins in the city of 2091.</p>
            <div className="mt-8 flex max-w-md flex-col gap-3">
              <button className="flex items-center justify-between rounded-xl bg-cyan-300 px-5 py-4 text-left font-bold tracking-[.18em] text-slate-950 transition hover:bg-cyan-200" onClick={()=>setScreen('play')}><span className="flex items-center gap-3"><Zap size={18}/> PLAY</span><ChevronRight size={19}/></button>
              <button className={btn} onClick={()=>setScreen('credits')}><span className="flex items-center gap-3"><Users size={18} className="text-cyan-200"/> CREDITS</span><ChevronRight size={18} className="text-slate-500 transition group-hover:translate-x-1"/></button>
              <button className={btn} onClick={()=>setScreen('settings')}><span className="flex items-center gap-3"><Monitor size={18} className="text-cyan-200"/> SETTINGS</span><ChevronRight size={18} className="text-slate-500 transition group-hover:translate-x-1"/></button>
            </div>
          </div>}

          {screen==='play' && <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center">
            <button onClick={back} className="mb-8 flex w-fit items-center gap-2 text-xs tracking-[.16em] text-slate-400 transition hover:text-cyan-200"><ArrowLeft size={15}/> BACK TO MENU</button>
            <div className="mb-2 text-xs tracking-[.3em] text-cyan-200">MULTIPLAYER / STORY MODE</div><h2 className={heading}>CONNECT YOUR CREW</h2>
            <p className="mb-7 mt-3 max-w-xl text-sm leading-6 text-slate-400">Two survivors. One impossible island. Bring a friend into the story.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <button className={card+' group p-6 text-left transition hover:border-cyan-300/60'} onClick={createLobby}><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200"><RadioTower size={23}/></div><h3 className="text-lg font-semibold">CREATE LOBBY</h3><p className="mt-2 text-sm leading-6 text-slate-400">Host a session and get a unique code for your partner.</p><div className="mt-5 flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-200">GENERATE ROOM CODE <ArrowRight size={14}/></div></button>
              <button className={card+' group p-6 text-left transition hover:border-orange-300/60'} onClick={()=>{setStatus('');setScreen('join')}}><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-300/10 text-orange-200"><Users size={23}/></div><h3 className="text-lg font-semibold">JOIN LOBBY</h3><p className="mt-2 text-sm leading-6 text-slate-400">Enter a friend's six-character room code to join them.</p><div className="mt-5 flex items-center gap-2 text-xs font-semibold tracking-wider text-orange-200">ENTER INVITE CODE <ArrowRight size={14}/></div></button>
            </div>
            <p className="mt-6 text-[11px] leading-5 text-slate-600">MULTIPLAYER CONNECTIVITY IS A PREVIEW PROTOTYPE. Cross-device synchronization will be wired up after the menu flow is approved.</p>
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
            <div className={card+' mt-5 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between'}>
              <div><div className="text-[10px] tracking-[.25em] text-slate-500">YOUR LOBBY CODE</div><div className="mt-1 font-mono text-3xl font-bold tracking-[.2em] text-cyan-200">{codeForDisplay}</div><p className="mt-1 text-xs text-slate-500">Share this with your friend to invite them.</p></div>
              <button className={smallBtn+' flex items-center justify-center gap-2'} onClick={()=>{navigator.clipboard?.writeText(codeForDisplay);setCopied(true);window.setTimeout(()=>setCopied(false),1400)}}><Copy size={15}/>{copied?'COPIED':'COPY CODE'}</button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(['Ivor','Teno'] as const).map((name,i)=><button key={name} onClick={()=>{setCharacter(name);setReady(false)}} className={card+' p-5 text-left transition '+(character===name?'border-cyan-300/70 bg-cyan-300/10':'hover:border-white/30')}>
                <div className="flex items-center justify-between"><span className="text-[10px] tracking-[.22em] text-slate-500">PLAYER {i+1} CANDIDATE</span>{character===name&&<Check size={17} className="text-cyan-200"/>}</div>
                <div className="mt-4 text-2xl font-bold tracking-wide">{name.toUpperCase()}</div><div className="mt-1 text-sm text-slate-400">{name==='Ivor'?'The exhausted worker. Player 1.':'The traveler from Tokyo. Player 2.'}</div>
                <div className="mt-4 text-xs tracking-wider text-cyan-200">{character===name?'SELECTED':'SELECT CHARACTER'} <ChevronRight size={13} className="inline"/></div>
              </button>)}
            </div>
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div><div className="font-medium">{character?character+' selected':'Choose your character'}</div><div className="mt-1 text-xs text-slate-500">{ready?'You are ready. Waiting for your partner...':'Both players must select a character and be ready.'}</div></div>
              <button disabled={!canReady} onClick={()=>setReady(v=>!v)} className={'rounded-xl px-6 py-3 text-sm font-bold tracking-wider transition disabled:cursor-not-allowed disabled:opacity-30 '+(ready?'border border-emerald-300/40 bg-emerald-300/10 text-emerald-200':'bg-cyan-300 text-slate-950 hover:bg-cyan-200')}>{ready?'✓ READY — CANCEL':'I AM READY'}</button>
            </div>
            {status && <p className="mt-3 text-xs text-orange-200">{status}</p>}
            <p className="mt-4 text-[10px] tracking-wide text-slate-600">PREVIEW LOBBY • ROOM MEMBERS AND READY STATUS ARE NOT YET SYNCHRONIZED BETWEEN DEVICES.</p>
          </div>}

          {screen==='credits' && <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
            <button onClick={back} className="mb-8 flex w-fit items-center gap-2 text-xs tracking-[.16em] text-slate-400 hover:text-cyan-200"><ArrowLeft size={15}/> BACK TO MENU</button><div className="mb-2 text-xs tracking-[.3em] text-cyan-200">THE PEOPLE BEHIND THE FILE</div><h2 className={heading}>CREDITS</h2>
            <div className={card+' mt-6 space-y-5 p-6'}><div><div className="text-[10px] tracking-[.22em] text-slate-500">CREATED BY</div><div className="mt-1 text-xl font-semibold">The IDA Studio</div></div><div><div className="text-[10px] tracking-[.22em] text-slate-500">STORY & GAME DESIGN</div><div className="mt-1 text-xl font-semibold">DaSubject Team</div></div><div><div className="text-[10px] tracking-[.22em] text-slate-500">SETTING</div><div className="mt-1 text-xl font-semibold">Earth, 2091 — a world out of room.</div></div></div>
          </div>}

          {screen==='settings' && <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
            <button onClick={back} className="mb-8 flex w-fit items-center gap-2 text-xs tracking-[.16em] text-slate-400 hover:text-cyan-200"><ArrowLeft size={15}/> BACK TO MENU</button><div className="mb-2 text-xs tracking-[.3em] text-cyan-200">CONFIGURATION</div><h2 className={heading}>SETTINGS</h2>
            <div className={card+' mt-6 divide-y divide-white/10 px-5'}>
              <button className="flex w-full items-center justify-between py-5 text-left" onClick={()=>setSound(v=>!v)}><span><span className="block font-medium">Interface sound</span><span className="mt-1 block text-xs text-slate-500">Menu and interaction audio</span></span><span className="flex items-center gap-2 text-sm text-cyan-200">{sound?<Volume2 size={18}/>:<VolumeX size={18}/>} {sound?'ON':'OFF'}</span></button>
              <button className="flex w-full items-center justify-between py-5 text-left" onClick={()=>setMotion(v=>!v)}><span><span className="block font-medium">Motion effects</span><span className="mt-1 block text-xs text-slate-500">Ambient scanline and title animation</span></span><span className="text-sm text-cyan-200">{motion?'ON':'OFF'}</span></button>
              <div className="py-5"><div className="font-medium">Access control</div><p className="mt-1 text-xs leading-5 text-slate-500">This preview uses a local password gate. It is meant to hide the game from casual visitors, not to secure a public deployment against someone inspecting the app code.</p><button className={smallBtn+' mt-3'} onClick={()=>{setUnlocked(false);setPassword('');try{localStorage.removeItem(ACCESS_KEY)}catch{}}}>LOCK PROJECT AGAIN</button></div>
            </div>
          </div>}
        </main>
        <footer className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-[9px] tracking-[.2em] text-slate-600 sm:px-8"><span>DA SUBJECT // INTERNAL PREVIEW</span><span className="flex items-center gap-2"><Shield size={12}/> ACCESS RESTRICTED</span><span>2091 © IDA</span></footer>
      </>}
    </div>
  </div>
}
