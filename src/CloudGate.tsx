import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createClient } from '@supabase/supabase-js'
import { DaApps } from './App'

const SUPABASE_URL = 'https://roxnnwrmgbxnhmwjolep.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_-x-g50GLtgo3Ut9fcNbStA_OUz4eBjw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

const ACCOUNT_SESSION_KEY = 'ida-account-session-v1'
const SYNC_PREFIXES = ['ida-', 'daapps-']
const isSyncKey = (key: string) => key !== ACCOUNT_SESSION_KEY && key !== 'ida-firstboot-complete-v3' && SYNC_PREFIXES.some(prefix => key.startsWith(prefix))
type IdaSession = { accountId:string; sessionToken:string; displayName:string }
function readIdaSession(): IdaSession|null {
  try {
    const raw=localStorage.getItem(ACCOUNT_SESSION_KEY)
    if(!raw)return null
    const parsed=JSON.parse(raw)
    if(parsed?.accountId&&parsed?.sessionToken&&parsed?.displayName)return parsed as IdaSession
  } catch {}
  return null
}
function writeIdaSession(session:IdaSession|null) {
  try {
    if(session)localStorage.setItem(ACCOUNT_SESSION_KEY,JSON.stringify(session))
    else localStorage.removeItem(ACCOUNT_SESSION_KEY)
  } catch {}
}
type CloudState = { version: 1; keys: Record<string, string> }

function readLocalState(): CloudState {
  const keys: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !isSyncKey(key)) continue
    const value = localStorage.getItem(key)
    if (value !== null) keys[key] = value
  }
  return { version: 1, keys }
}
function clearLocalState() {
  const existing: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && isSyncKey(key)) existing.push(key)
  }
  existing.forEach(key => localStorage.removeItem(key))
}

function applyLocalState(state: CloudState) {
  clearLocalState()
  Object.entries(state.keys || {}).forEach(([key, value]) => localStorage.setItem(key, value))
}
function looksLikeIdaState(state: unknown): state is CloudState {
  return !!state && typeof state === 'object' && (state as any).version === 1 && !!(state as any).keys
}

const inputStyle: CSSProperties = { width:'100%',boxSizing:'border-box',padding:'14px 15px',borderRadius:10,border:'1px solid rgba(255,255,255,.16)',background:'rgba(255,255,255,.055)',color:'#fff',outline:'none',fontSize:15 }
const buttonStyle: CSSProperties = { width:'100%',marginTop:16,padding:'13px 14px',border:0,borderRadius:10,background:'#fff',color:'#111',fontWeight:700,cursor:'pointer',fontSize:14 }
const switchStyle: CSSProperties = { width:'100%',marginTop:12,padding:9,border:0,background:'transparent',color:'#fff',opacity:.68,cursor:'pointer',fontSize:13 }

const FIRSTBOOT_WALLPAPER = 'https://images.pexels.com/photos/7025657/pexels-photo-7025657.jpeg?cs=srgb&dl=pexels-nasimgs-7025657.jpg&fm=jpg'

function Hilal({ small=false }: { small?: boolean }) {
  const s=small?42:58
  return <div style={{position:'relative',width:s,height:s,margin:'0 auto'}}>
    <div style={{position:'absolute',inset:2,borderRadius:'50%',background:'#fff',boxShadow:'0 0 32px rgba(255,255,255,.16)'}}/>
    <div style={{position:'absolute',width:s-8,height:s-8,left:s*.28,top:-1,borderRadius:'50%',background:'#080b12'}}/>
  </div>
}

const bootStyle: CSSProperties = { position:'fixed',inset:0,zIndex:999999,background:'#000',color:'#fff',display:'grid',placeItems:'center',fontFamily:'Segoe UI,system-ui,sans-serif' }

function BootScreen({ stage }: { stage:'loading'|'hi'|'working'|'install' }) {
  const text = stage==='loading' ? 'This won’t take long' : stage==='hi' ? 'Hi.' : stage==='working' ? 'We are working on IDA' : 'Getting things ready'
  return <div style={bootStyle}>
    <style>{`
      @keyframes idaBootFade{0%{opacity:0;transform:translateY(7px)}35%{opacity:1;transform:none}75%{opacity:1}100%{opacity:0}}
      @keyframes idaSpinner{to{transform:rotate(360deg)}}
      .ida-boot-text{animation:idaBootFade 3s ease both}
    `}</style>
    <div style={{textAlign:'center',animation:stage==='working'?'none':'idaBootFade 3s ease both'}}>
      {stage==='hi' ? <div style={{fontSize:'clamp(58px,9vw,96px)',fontWeight:300,letterSpacing:'-.05em'}}>Hi.</div> :
       stage==='working' ? <><div style={{fontSize:'clamp(26px,4vw,40px)',fontWeight:350,letterSpacing:'-.02em'}}>We are working on IDA</div><div style={{margin:'28px auto 0',width:20,height:20,border:'2px solid rgba(255,255,255,.22)',borderTopColor:'#fff',borderRadius:'50%',animation:'idaSpinner 1s linear infinite'}}/></> :
       stage==='install' ? <><div style={{fontSize:24,fontWeight:350}}>{text}</div><div style={{margin:'26px auto 0',width:18,height:18,border:'2px solid rgba(255,255,255,.22)',borderTopColor:'#fff',borderRadius:'50%',animation:'idaSpinner 1s linear infinite'}}/></> :
       <div className="ida-boot-text" style={{fontSize:24,fontWeight:350}}>{text}</div>}
    </div>
  </div>
}

function AppChoiceScreen({ selected, setSelected, onContinue }: { selected:string[]; setSelected:(v:string[])=>void; onContinue:()=>void }) {
  const choices=[['DaMusic','Music'],['DaEconomy','DaEconomy'],['DaCourt','DaCourt']]
  const toggle=(name:string)=>setSelected(selected.includes(name)?selected.filter(x=>x!==name):[...selected,name])
  return <div style={{...bootStyle,background:'radial-gradient(circle at 50% 35%,rgba(55,65,88,.3),transparent 45%),#080b12'}}>
    <div style={{width:'min(560px,calc(100vw - 34px))',padding:'34px 36px',borderRadius:18,background:'rgba(18,22,32,.9)',border:'1px solid rgba(255,255,255,.1)',boxShadow:'0 28px 90px rgba(0,0,0,.5)',backdropFilter:'blur(20px)'}}>
      <Hilal small/>
      <div style={{textAlign:'center',marginTop:22}}>
        <div style={{fontSize:27,fontWeight:600}}>Choose your IDA apps</div>
        <div style={{marginTop:7,fontSize:13,opacity:.58}}>Would you like these apps ready on your desktop?</div>
      </div>
      <div style={{display:'grid',gap:10,marginTop:25}}>
        {choices.map(([id,label])=><button key={id} onClick={()=>toggle(id)} style={{display:'flex',alignItems:'center',gap:13,padding:'14px 15px',borderRadius:12,border:selected.includes(id)?'1px solid rgba(255,255,255,.5)':'1px solid rgba(255,255,255,.1)',background:selected.includes(id)?'rgba(255,255,255,.1)':'rgba(255,255,255,.035)',color:'#fff',cursor:'pointer',textAlign:'left'}}>
          <span style={{width:20,height:20,borderRadius:6,border:'1px solid rgba(255,255,255,.3)',background:selected.includes(id)?'#fff':'transparent',display:'grid',placeItems:'center',color:'#111',fontSize:13}}>{selected.includes(id)?'✓':''}</span>
          <span style={{fontSize:15}}>{label}</span>
        </button>)}
      </div>
      <button onClick={onContinue} style={{...buttonStyle,marginTop:22}}>Continue</button>
      <div style={{textAlign:'center',marginTop:12,fontSize:11,opacity:.38}}>You can change this later in IDA.</div>
    </div>
  </div>
}

function AccountSetup({ selectedApps, onCreated, onExisting, onSkip }: { selectedApps:string[]; onCreated:(session:IdaSession,displayName:string,apps:string[])=>void; onExisting:()=>void; onSkip:()=>void }) {
  const [name,setName]=useState('')
  const [password,setPassword]=useState('')
  const [confirm,setConfirm]=useState('')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const submit=async()=>{
    if(password.length<8){setMessage('Use a password with at least 8 characters.');return}
    if(password!==confirm){setMessage('The passwords do not match.');return}
    setBusy(true);setMessage('')
    const {data,error}=await supabase.rpc('ida_create_account',{p_name:name.trim(),p_password:password})
    setBusy(false)
    if(error){setMessage(error.message);return}
    const created=data as IdaSession
    if(created?.account_id&&created?.session_token){
      const next={accountId:created.account_id,sessionToken:created.session_token,displayName:created.display_name||name.trim()}
      writeIdaSession(next)
      onCreated(next,next.displayName,selectedApps)
    } else setMessage('Could not create the IDA account.')
  }
  return <div style={{...bootStyle,background:'radial-gradient(circle at 50% 35%,rgba(55,65,88,.28),transparent 45%),#080b12'}}>
    <div style={{width:'min(410px,calc(100vw - 34px))',padding:'34px 36px 28px',borderRadius:18,background:'rgba(18,22,32,.94)',border:'1px solid rgba(255,255,255,.1)',boxShadow:'0 28px 90px rgba(0,0,0,.5)',backdropFilter:'blur(20px)'}}>
      <div style={{textAlign:'center',marginBottom:25}}><Hilal small/><div style={{fontSize:26,fontWeight:600,marginTop:18}}>Make your IDA account</div><div style={{fontSize:12,opacity:.55,marginTop:6}}>This is your personal IDA desktop.</div></div>
      <label style={{fontSize:11,opacity:.55}}>NAME</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={inputStyle}/>
            <label style={{display:'block',fontSize:11,opacity:.55,marginTop:14}}>PASSWORD</label><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" type="password" autoComplete="new-password" style={inputStyle}/>
      <label style={{display:'block',fontSize:11,opacity:.55,marginTop:14}}>CONFIRM PASSWORD</label><input value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Enter it again" type="password" autoComplete="new-password" style={inputStyle} onKeyDown={e=>{if(e.key==='Enter')void submit()}}/>
      <button disabled={busy||!name||!password||!confirm} onClick={()=>void submit()} style={{...buttonStyle,opacity:(busy||!name||!password||!confirm) ? .5 : 1}}>{busy?'Creating your IDA…':'Create account'}</button>
      {message&&<div style={{marginTop:13,padding:12,borderRadius:10,background:'rgba(255,255,255,.055)',fontSize:12,lineHeight:1.5,opacity:.82}}>{message}</div>}
      <button onClick={onExisting} style={switchStyle}>I already have an IDA account</button>
      <button onClick={onSkip} style={{...switchStyle,marginTop:4}}>Skip for now</button>
    </div>
  </div>
}

function ExistingAccount({ onSignedIn, title='Sign in to IDA', initialName='', compact=false }: { onSignedIn:(session:IdaSession)=>void; title?:string; initialName?:string; compact?:boolean }) {
  const [name,setName]=useState(initialName); const [password,setPassword]=useState(''); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('')
  const submit=async()=>{setBusy(true);setMessage('');const {data,error}=await supabase.rpc('ida_sign_in',{p_name:name.trim(),p_password:password});setBusy(false);if(error)setMessage(error.message);else if(data?.account_id&&data?.session_token){const next={accountId:data.account_id,sessionToken:data.session_token,displayName:data.display_name||name.trim()};writeIdaSession(next);onSignedIn(next)}}
  return <div style={{width:'100%'}}>
    {!compact&&<div style={{textAlign:'center',marginBottom:24}}><Hilal small/><div style={{fontSize:25,fontWeight:600,marginTop:17}}>{title}</div></div>}
    {compact&&<div style={{fontSize:20,fontWeight:600,textAlign:'center',marginBottom:18}}>{title}</div>}
    <label style={{fontSize:11,opacity:.55}}>NAME</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your IDA name" style={inputStyle}/>
    <label style={{display:'block',fontSize:11,opacity:.55,marginTop:14}}>PASSWORD</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoFocus style={inputStyle} onKeyDown={e=>{if(e.key==='Enter')void submit()}}/>
    <button disabled={busy||!name||!password} onClick={()=>void submit()} style={{...buttonStyle,opacity:(busy||!name||!password) ? .5 : 1}}>{busy?'Checking…':'Continue'}</button>
    {message&&<div style={{marginTop:13,padding:12,borderRadius:10,background:'rgba(255,255,255,.055)',fontSize:12}}>{message}</div>}
  </div>
}
function LockScreen({ session, onUnlock, onSignOut }: { session:IdaSession; onUnlock:(next:IdaSession)=>void; onSignOut:()=>void }) {
  const [now,setNow]=useState(new Date())
  const [unlocking,setUnlocking]=useState(false)
  useEffect(()=>{const t=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(t)},[])
  const name=session.displayName||'IDA User'
  const time=now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})
  const date=now.toLocaleDateString([], {weekday:'long',month:'long',day:'numeric'})
  if(unlocking) return <div className="ida-unlock-screen"><style>{`
    @keyframes idaUnlockIn{from{opacity:0;transform:translateY(18px) scale(.98)}to{opacity:1;transform:none}}
    @keyframes idaUnlockBg{from{opacity:.4}to{opacity:1}}
    .ida-unlock-screen{position:fixed;inset:0;z-index:999999;background:#05070b;color:#fff;font-family:Segoe UI,system-ui,sans-serif;display:grid;place-items:center;overflow:hidden;animation:idaUnlockBg .45s ease both}
    .ida-unlock-bg{position:absolute;inset:0;background:linear-gradient(rgba(0,0,0,.28),rgba(0,0,0,.58)),url("${FIRSTBOOT_WALLPAPER}") center/cover;filter:saturate(.85)}
    .ida-unlock-card{position:relative;width:min(390px,calc(100vw - 34px));padding:30px 34px 26px;border-radius:18px;background:rgba(15,18,27,.82);border:1px solid rgba(255,255,255,.18);box-shadow:0 28px 90px rgba(0,0,0,.55);backdrop-filter:blur(24px);animation:idaUnlockIn .55s cubic-bezier(.2,.8,.2,1) both}
  `}</style><div className="ida-unlock-bg"/><div className="ida-unlock-card">
    <div style={{textAlign:'center',marginBottom:22}}><div style={{width:72,height:72,borderRadius:'50%',background:'rgba(0,0,0,.38)',border:'1px solid rgba(255,255,255,.4)',display:'grid',placeItems:'center',margin:'0 auto'}}><Hilal small/></div><div style={{fontSize:20,marginTop:13}}>{name}</div><div style={{fontSize:12,opacity:.58,marginTop:5}}>Enter your IDA password</div></div>
    <ExistingAccount title="Unlock IDA" initialName={name} compact onSignedIn={onUnlock}/>
  </div></div>
  return <div onClick={()=>setUnlocking(true)} style={{position:'fixed',inset:0,zIndex:999999,overflow:'hidden',background:'#05070b',color:'#fff',fontFamily:'Segoe UI,system-ui,sans-serif',cursor:'default'}}>
    <style>{`
      @keyframes idaLockIn{from{opacity:0;transform:scale(1.025)}to{opacity:1;transform:none}}
      @keyframes idaLockTime{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}
    `}</style>
    <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.5)),url("${FIRSTBOOT_WALLPAPER}")`,backgroundSize:'cover',backgroundPosition:'center',filter:'saturate(.85)',animation:'idaLockIn .7s ease both'}}/>
    <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 50% 25%,transparent 0,rgba(0,0,0,.18) 45%,rgba(0,0,0,.6) 100%)'}}/>
    <div style={{position:'relative',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',paddingTop:'11vh',textShadow:'0 3px 18px rgba(0,0,0,.55)'}}>
      <div style={{fontSize:'clamp(72px,10vw,118px)',fontWeight:250,letterSpacing:'-.055em',lineHeight:1,animation:'idaLockTime .7s ease both'}}>{time}</div>
      <div style={{fontSize:18,opacity:.9,marginTop:12}}>{date}</div>
      <div style={{marginTop:'12vh',display:'flex',flexDirection:'column',alignItems:'center'}}>
        <div style={{fontSize:20,marginTop:14}}>{name}</div>
        <div style={{fontSize:13,opacity:.7,marginTop:6}}>Press anywhere to open IDA</div>
      </div>
    </div>
    <button onClick={(e)=>{e.stopPropagation();onSignOut()}} style={{position:'absolute',left:20,bottom:18,display:'flex',alignItems:'center',gap:9,border:0,borderRadius:999,padding:'8px 12px',background:'rgba(0,0,0,.34)',backdropFilter:'blur(12px)',color:'#fff',font:'12px system-ui',cursor:'pointer'}}><Hilal small/><span>{name} · Sign out</span></button>
    <div style={{position:'absolute',right:22,bottom:20,fontSize:12,opacity:.8}}>◔  ▰  ▪</div>
  </div>
}
function AuthScreen() { return <ExistingAccount onSignedIn={()=>{}}/> }

export function CloudGate() {
  const [session,setSession]=useState<IdaSession|null>(null)
  const [ready,setReady]=useState(false)
  const [error,setError]=useState('')
  const [firstBoot,setFirstBoot]=useState(false)
  const [bootStage,setBootStage]=useState<'loading'|'hi'|'working'|'choices'|'install'|'account'|'existing'>('loading')
  const [selectedApps,setSelectedApps]=useState<string[]>(['DaMusic','DaEconomy','DaCourt'])
  const [desktopOpen,setDesktopOpen]=useState(false)
  const openDesktop=()=>{try{localStorage.setItem('ida-desktop-session-open-v1','1');localStorage.removeItem('ida-power-lock-v1')}catch{};setDesktopOpen(true)}
  const lockDesktop=()=>{try{localStorage.removeItem('ida-desktop-session-open-v1')}catch{};setDesktopOpen(false)}
  const saveTimer=useRef<number|null>(null)
  const saving=useRef(false)
  const queued=useRef(false)
  const activeUser=useRef<string|null>(null)
  const activeSessionToken=useRef<string|null>(null)
  const originalMethods=useRef<{setItem:Storage['setItem'];removeItem:Storage['removeItem'];clear:Storage['clear']}|null>(null)

  const saveNow=async()=>{
    const userId=activeUser.current
    if(!userId)return
    if(saving.current){queued.current=true;return}
    saving.current=true
    try{
      const state=readLocalState()
      const {error:saveError}=await supabase.rpc('ida_save_state',{p_account_id:userId,p_session_token:activeSessionToken.current,p_state:state})
      if(saveError)setError(saveError.message)
    }catch(e){setError(e instanceof Error?e.message:'Could not save IDA data.')}
    finally{saving.current=false;if(queued.current){queued.current=false;void saveNow()}}
  }
  const scheduleSave=()=>{
    if(!activeUser.current)return
    if(saveTimer.current!==null)window.clearTimeout(saveTimer.current)
    saveTimer.current=window.setTimeout(()=>{saveTimer.current=null;void saveNow()},650)
  }
  const installStorageSync=()=>{
    if(originalMethods.current)return
    const storage=window.localStorage
    const original={setItem:storage.setItem.bind(storage),removeItem:storage.removeItem.bind(storage),clear:storage.clear.bind(storage)}
    originalMethods.current=original
    storage.setItem=((key:string,value:string)=>{original.setItem(key,value);if(isSyncKey(key))scheduleSave()}) as Storage['setItem']
    storage.removeItem=((key:string)=>{original.removeItem(key);if(isSyncKey(key))scheduleSave()}) as Storage['removeItem']
    storage.clear=(()=>{original.clear();scheduleSave()}) as Storage['clear']
  }
  const removeStorageSync=()=>{
    const original=originalMethods.current
    if(!original)return
    window.localStorage.setItem=original.setItem
    window.localStorage.removeItem=original.removeItem
    window.localStorage.clear=original.clear
    originalMethods.current=null
  }

  const loadUser=async(nextSession:IdaSession)=>{
    setReady(false);setError('');activeUser.current=nextSession.accountId;activeSessionToken.current=nextSession.sessionToken
    const localBeforeCloud=readLocalState()
    const {data,error:loadError}=await supabase.rpc('ida_load_state',{p_account_id:nextSession.accountId,p_session_token:nextSession.sessionToken})
    if(loadError){setError(loadError.message);writeIdaSession(null);setSession(null);activeUser.current=null;activeSessionToken.current=null;setReady(false);return}
    if(data&&looksLikeIdaState(data))applyLocalState(data)
    else if(Object.keys(localBeforeCloud.keys).length)await supabase.rpc('ida_save_state',{p_account_id:nextSession.accountId,p_session_token:nextSession.sessionToken,p_state:localBeforeCloud})
    installStorageSync();setReady(true)
  }

  const finishNewAccount=(nextSession:IdaSession,name:string,apps:string[])=>{
    try{
      clearLocalState()
      localStorage.setItem('ida-firstboot-complete-v3','1')
      localStorage.setItem('ida-desktop-apps',JSON.stringify(['DAPP','DaFile Explorer','DaSettings','DaTrash',...apps]))
    }catch{}
    writeIdaSession(nextSession)
    setSession(nextSession)
    void loadUser(nextSession)
    lockDesktop()
    setBootStage('loading')
  }

  const startInstall=()=>{
    setBootStage('install')
    window.setTimeout(()=>setBootStage('account'),5000)
  }

  useEffect(()=>{
    let mounted=true
    const hadFirstBoot=localStorage.getItem('ida-firstboot-complete-v3')==='1'
    setFirstBoot(!hadFirstBoot)
    const stored=readIdaSession()
    if(stored){
      setSession(stored)
      const powerLock=localStorage.getItem('ida-power-lock-v1')==='1'
      setDesktopOpen(!powerLock && localStorage.getItem('ida-desktop-session-open-v1')==='1')
      void loadUser(stored)
    } else {
      setReady(true)
      if(hadFirstBoot)setBootStage('existing')
      else{
        setBootStage('loading')
        window.setTimeout(()=>mounted&&setBootStage('hi'),5000)
      }
    }
    return()=>{mounted=false;removeStorageSync();if(saveTimer.current!==null)window.clearTimeout(saveTimer.current)}
  },[])

  useEffect(()=>{
    if(!firstBoot||session)return
    if(bootStage==='hi'){
      const t=window.setTimeout(()=>setBootStage('working'),3000)
      return()=>window.clearTimeout(t)
    }
    if(bootStage==='working'){
      const t=window.setTimeout(()=>setBootStage('choices'),10000)
      return()=>window.clearTimeout(t)
    }
  },[bootStage,firstBoot,session])

  const accountLabel=useMemo(()=>session?.displayName||'IDA User',[session])
  if(!session){
    if(bootStage==='loading'||bootStage==='hi'||bootStage==='working'||bootStage==='install')return <BootScreen stage={bootStage}/>
    if(bootStage==='choices')return <AppChoiceScreen selected={selectedApps} setSelected={setSelectedApps} onContinue={startInstall}/>
    if(bootStage==='account')return <AccountSetup selectedApps={selectedApps} onCreated={finishNewAccount} onExisting={()=>setBootStage('existing')} onSkip={()=>setBootStage('existing')}/>
    return <ExistingAccount onSignedIn={next=>{try{localStorage.setItem('ida-firstboot-complete-v3','1')}catch{};writeIdaSession(next);setSession(next);void loadUser(next);lockDesktop()}}/>
  }
  if(!ready)return <BootScreen stage="install"/>
  if(!desktopOpen)return <LockScreen session={session} onUnlock={async next=>{writeIdaSession(next);await loadUser(next);setSession(next);openDesktop()}}/>
  return <><DaApps onRestartToLock={lockDesktop}/>{error&&<div style={{position:'fixed',right:10,bottom:60,zIndex:99998,padding:'8px 12px',borderRadius:10,background:'rgba(150,30,30,.85)',color:'#fff',font:'12px system-ui'}}>Cloud save error: {error}</div>}</>
}
