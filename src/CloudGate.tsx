import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createClient, type Session } from '@supabase/supabase-js'
import { DaApps } from './App'

const SUPABASE_URL = 'https://roxnnwrmgbxnhmwjolep.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_-x-g50GLtgo3Ut9fcNbStA_OUz4eBjw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

const SYNC_PREFIXES = ['ida-', 'daapps-']
const isSyncKey = (key: string) => SYNC_PREFIXES.some(prefix => key.startsWith(prefix))
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
    <style>{\`
      @keyframes idaBootFade{0%{opacity:0;transform:translateY(7px)}35%{opacity:1;transform:none}75%{opacity:1}100%{opacity:0}}
      @keyframes idaSpinner{to{transform:rotate(360deg)}}
      .ida-boot-text{animation:idaBootFade 3s ease both}
    \`}</style>
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

function AccountSetup({ selectedApps, onCreated, onExisting }: { selectedApps:string[]; onCreated:(session:Session,displayName:string,apps:string[])=>void; onExisting:()=>void }) {
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [confirm,setConfirm]=useState('')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const submit=async()=>{
    if(password.length<8){setMessage('Use a password with at least 8 characters.');return}
    if(password!==confirm){setMessage('The passwords do not match.');return}
    setBusy(true);setMessage('')
    const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{display_name:name.trim()||'IDA User'},emailRedirectTo:window.location.href}})
    setBusy(false)
    if(error){setMessage(error.message);return}
    if(data.session){onCreated(data.session,name.trim()||'IDA User',selectedApps)}
    else setMessage('Your account is saved. Check your email to finish setup; IDA will continue automatically after confirmation.')
  }
  return <div style={{...bootStyle,background:'radial-gradient(circle at 50% 35%,rgba(55,65,88,.28),transparent 45%),#080b12'}}>
    <div style={{width:'min(410px,calc(100vw - 34px))',padding:'34px 36px 28px',borderRadius:18,background:'rgba(18,22,32,.94)',border:'1px solid rgba(255,255,255,.1)',boxShadow:'0 28px 90px rgba(0,0,0,.5)',backdropFilter:'blur(20px)'}}>
      <div style={{textAlign:'center',marginBottom:25}}><Hilal small/><div style={{fontSize:26,fontWeight:600,marginTop:18}}>Make your IDA account</div><div style={{fontSize:12,opacity:.55,marginTop:6}}>This is your personal IDA desktop.</div></div>
      <label style={{fontSize:11,opacity:.55}}>NAME</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={inputStyle}/>
      <label style={{display:'block',fontSize:11,opacity:.55,marginTop:14}}>EMAIL</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" style={inputStyle}/>
      <label style={{display:'block',fontSize:11,opacity:.55,marginTop:14}}>PASSWORD</label><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" type="password" autoComplete="new-password" style={inputStyle}/>
      <label style={{display:'block',fontSize:11,opacity:.55,marginTop:14}}>CONFIRM PASSWORD</label><input value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Enter it again" type="password" autoComplete="new-password" style={inputStyle} onKeyDown={e=>{if(e.key==='Enter')void submit()}}/>
      <button disabled={busy||!name||!email||!password||!confirm} onClick={()=>void submit()} style={{...buttonStyle,opacity:(busy||!name||!email||!password||!confirm) ? .5 : 1}}>{busy?'Creating your IDA…':'Create account'}</button>
      {message&&<div style={{marginTop:13,padding:12,borderRadius:10,background:'rgba(255,255,255,.055)',fontSize:12,lineHeight:1.5,opacity:.82}}>{message}</div>}
      <button onClick={onExisting} style={switchStyle}>I already have an IDA account</button>
    </div>
  </div>
}

function ExistingAccount({ onSignedIn }: { onSignedIn:(session:Session)=>void }) {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('')
  const submit=async()=>{setBusy(true);setMessage('');const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password});setBusy(false);if(error)setMessage(error.message);else if(data.session)onSignedIn(data.session)}
  return <div style={{...bootStyle,background:'#080b12'}}>
    <div style={{width:'min(390px,calc(100vw - 34px))',padding:'34px 36px',borderRadius:18,background:'rgba(18,22,32,.94)',border:'1px solid rgba(255,255,255,.1)',boxShadow:'0 28px 90px rgba(0,0,0,.5)'}}>
      <div style={{textAlign:'center',marginBottom:24}}><Hilal small/><div style={{fontSize:25,fontWeight:600,marginTop:17}}>Sign in to IDA</div></div>
      <label style={{fontSize:11,opacity:.55}}>EMAIL</label><input value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle}/>
      <label style={{display:'block',fontSize:11,opacity:.55,marginTop:14}}>PASSWORD</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" style={inputStyle} onKeyDown={e=>{if(e.key==='Enter')void submit()}}/>
      <button disabled={busy||!email||!password} onClick={()=>void submit()} style={{...buttonStyle,opacity:(busy||!email||!password) ? .5 : 1}}>{busy?'Signing in…':'Sign in'}</button>
      {message&&<div style={{marginTop:13,padding:12,borderRadius:10,background:'rgba(255,255,255,.055)',fontSize:12}}>{message}</div>}
    </div>
  </div>
}

function LockScreen({ session, onOpen }: { session:Session; onOpen:()=>void }) {
  const [now,setNow]=useState(new Date())
  useEffect(()=>{const t=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(t)},[])
  const name=(session.user.user_metadata?.display_name as string)||'IDA User'
  const time=now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})
  const date=now.toLocaleDateString([], {weekday:'long',month:'long',day:'numeric'})
  return <div onClick={onOpen} style={{position:'fixed',inset:0,zIndex:999999,overflow:'hidden',background:'#05070b',color:'#fff',fontFamily:'Segoe UI,system-ui,sans-serif',cursor:'default'}}>
    <div style={{position:'absolute',inset:0,backgroundImage:\`linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.5)),url("\${FIRSTBOOT_WALLPAPER}")\`,backgroundSize:'cover',backgroundPosition:'center',filter:'saturate(.85)'}}/>
    <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 50% 25%,transparent 0,rgba(0,0,0,.18) 45%,rgba(0,0,0,.6) 100%)'}}/>
    <div style={{position:'relative',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',paddingTop:'11vh',textShadow:'0 3px 18px rgba(0,0,0,.55)'}}>
      <div style={{fontSize:'clamp(72px,10vw,118px)',fontWeight:250,letterSpacing:'-.055em',lineHeight:1}}>{time}</div>
      <div style={{fontSize:18,opacity:.9,marginTop:12}}>{date}</div>
      <div style={{marginTop:'12vh',display:'flex',flexDirection:'column',alignItems:'center'}}>
        <div style={{width:76,height:76,borderRadius:'50%',background:'rgba(0,0,0,.38)',border:'1px solid rgba(255,255,255,.4)',display:'grid',placeItems:'center',backdropFilter:'blur(8px)'}}><Hilal small/></div>
        <div style={{fontSize:20,marginTop:14}}>{name}</div>
        <div style={{fontSize:13,opacity:.7,marginTop:6}}>Press anywhere to open IDA</div>
      </div>
    </div>
    <div style={{position:'absolute',left:22,bottom:20,fontSize:12,opacity:.75}}>IDA</div>
    <div style={{position:'absolute',right:22,bottom:20,fontSize:12,opacity:.8}}>◔  ▰  ▪</div>
  </div>
}

function AuthScreen({ initialMessage = '' }: { initialMessage?: string }) {
  return <ExistingAccount onSignedIn={()=>{}}/>
}

export function CloudGate() {
  const [session,setSession]=useState<Session|null>(null)
  const [ready,setReady]=useState(false)
  const [error,setError]=useState('')
  const [firstBoot,setFirstBoot]=useState(false)
  const [bootStage,setBootStage]=useState<'loading'|'hi'|'working'|'choices'|'install'|'account'|'existing'>('loading')
  const [selectedApps,setSelectedApps]=useState<string[]>(['DaMusic','DaEconomy','DaCourt'])
  const [desktopOpen,setDesktopOpen]=useState(false)
  const saveTimer=useRef<number|null>(null)
  const saving=useRef(false)
  const queued=useRef(false)
  const activeUser=useRef<string|null>(null)
  const originalMethods=useRef<{setItem:Storage['setItem'];removeItem:Storage['removeItem'];clear:Storage['clear']}|null>(null)

  const saveNow=async()=>{
    const userId=activeUser.current
    if(!userId)return
    if(saving.current){queued.current=true;return}
    saving.current=true
    try{
      const state=readLocalState()
      const {error:saveError}=await supabase.from('ida_state').upsert({user_id:userId,state,updated_at:new Date().toISOString()},{onConflict:'user_id'})
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

  const loadUser=async(userId:string)=>{
    setReady(false);setError('');activeUser.current=userId
    const localBeforeCloud=readLocalState()
    const {data,error:loadError}=await supabase.from('ida_state').select('state').eq('user_id',userId).maybeSingle()
    if(loadError){setError(loadError.message);installStorageSync();setReady(true);return}
    if(data?.state&&looksLikeIdaState(data.state))applyLocalState(data.state)
    else if(Object.keys(localBeforeCloud.keys).length)await supabase.from('ida_state').upsert({user_id:userId,state:localBeforeCloud,updated_at:new Date().toISOString()},{onConflict:'user_id'})
    installStorageSync();setReady(true)
  }

  const finishNewAccount=(nextSession:Session,name:string,apps:string[])=>{
    try{
      localStorage.setItem('ida-firstboot-complete-v2','1')
      localStorage.setItem('ida-desktop-apps',JSON.stringify(['DAPP','DaFile Explorer','DaSettings','DaTrash',...apps]))
    }catch{}
    setSession(nextSession)
    setDesktopOpen(false)
    setBootStage('loading')
  }

  const startInstall=()=>{
    setBootStage('install')
    window.setTimeout(()=>setBootStage('account'),5000)
  }

  useEffect(()=>{
    let mounted=true
    const hadFirstBoot=localStorage.getItem('ida-firstboot-complete-v2')==='1'
    setFirstBoot(!hadFirstBoot)
    supabase.auth.getSession().then(({data})=>{
      if(!mounted)return
      setSession(data.session)
      if(data.session)void loadUser(data.session.user.id)
      else{
        setReady(true)
        if(hadFirstBoot)setBootStage('existing')
        else{
          setBootStage('loading')
          window.setTimeout(()=>mounted&&setBootStage('hi'),5000)
        }
      }
    })
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{
      if(!mounted)return
      setSession(next)
      if(next)void loadUser(next.user.id)
      else{activeUser.current=null;removeStorageSync();clearLocalState();setReady(false);setDesktopOpen(false)}
    })
    return()=>{mounted=false;subscription.unsubscribe();removeStorageSync();if(saveTimer.current!==null)window.clearTimeout(saveTimer.current)}
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

  const accountLabel=useMemo(()=>session?.user.user_metadata?.display_name||session?.user.email||'IDA User',[session])
  if(!session){
    if(bootStage==='loading'||bootStage==='hi'||bootStage==='working'||bootStage==='install')return <BootScreen stage={bootStage}/>
    if(bootStage==='choices')return <AppChoiceScreen selected={selectedApps} setSelected={setSelectedApps} onContinue={startInstall}/>
    if(bootStage==='account')return <AccountSetup selectedApps={selectedApps} onCreated={finishNewAccount} onExisting={()=>setBootStage('existing')}/>
    return <ExistingAccount onSignedIn={next=>{try{localStorage.setItem('ida-firstboot-complete-v2','1')}catch{};setSession(next);setDesktopOpen(false)}}/>
  }
  if(!ready)return <BootScreen stage="install"/>
  if(!desktopOpen)return <LockScreen session={session} onOpen={()=>setDesktopOpen(true)}/>
  return <><DaApps/><div style={{position:'fixed',right:10,top:10,zIndex:99998,display:'flex',alignItems:'center',gap:8,padding:'7px 9px 7px 11px',borderRadius:999,background:'rgba(8,11,18,.7)',backdropFilter:'blur(16px)',color:'#fff',font:'12px system-ui',boxShadow:'0 6px 24px rgba(0,0,0,.25)'}}><span style={{maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',opacity:.8}}>{accountLabel}</span><button onClick={()=>void supabase.auth.signOut({scope:'local'})} style={{border:0,borderRadius:999,padding:'5px 9px',background:'rgba(255,255,255,.1)',color:'#fff',cursor:'pointer'}}>Sign out</button></div>{error&&<div style={{position:'fixed',right:10,bottom:60,zIndex:99998,padding:'8px 12px',borderRadius:10,background:'rgba(150,30,30,.85)',color:'#fff',font:'12px system-ui'}}>Cloud save error: {error}</div>}</>
}
