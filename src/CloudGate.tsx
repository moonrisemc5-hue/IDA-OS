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
function applyLocalState(state: CloudState) {
  const existing: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && isSyncKey(key)) existing.push(key)
  }
  existing.forEach(key => localStorage.removeItem(key))
  Object.entries(state.keys || {}).forEach(([key, value]) => localStorage.setItem(key, value))
}
function looksLikeIdaState(state: unknown): state is CloudState {
  return !!state && typeof state === 'object' && (state as any).version === 1 && !!(state as any).keys
}

const inputStyle: CSSProperties = { width:'100%',boxSizing:'border-box',padding:'13px 14px',borderRadius:12,border:'1px solid rgba(255,255,255,.12)',background:'rgba(0,0,0,.22)',color:'#fff',outline:'none',fontSize:15 }
const buttonStyle: CSSProperties = { width:'100%',marginTop:14,padding:'13px 14px',border:0,borderRadius:12,background:'#fff',color:'#111',fontWeight:700,cursor:'pointer' }
const switchStyle: CSSProperties = { width:'100%',marginTop:10,padding:10,border:0,background:'transparent',color:'#fff',opacity:.7,cursor:'pointer' }

function AuthScreen({ initialMessage = '' }: { initialMessage?: string }) {
  const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(initialMessage)
  const submit = async () => {
    setBusy(true); setMessage('')
    const result = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password })
    setBusy(false)
    if (result.error) setMessage(result.error.message)
    else if (mode === 'signup' && !result.data.session) setMessage('Account created. Check your email if confirmation is required, then sign in.')
  }
  return <div style={{position:'fixed',inset:0,display:'grid',placeItems:'center',background:'#07090e',color:'#fff',fontFamily:'system-ui,Segoe UI,sans-serif',zIndex:999999}}>
    <div style={{width:'min(420px,calc(100vw - 32px))',padding:32,borderRadius:24,background:'rgba(20,25,38,.94)',boxShadow:'0 24px 80px rgba(0,0,0,.5)',border:'1px solid rgba(255,255,255,.1)'}}>
      <div style={{textAlign:'center',marginBottom:24}}><div style={{fontSize:44,lineHeight:1,marginBottom:12}}>☾</div><div style={{fontSize:28,fontWeight:700}}>IDA</div><div style={{opacity:.65,marginTop:6}}>Sign in to your IDA desktop</div></div>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" autoComplete="email" style={inputStyle}/>
      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" autoComplete={mode==='signin'?'current-password':'new-password'} style={{...inputStyle,marginTop:10}} onKeyDown={e=>{if(e.key==='Enter')void submit()}}/>
      <button disabled={busy || !email || !password} onClick={()=>void submit()} style={{...buttonStyle,opacity:(busy || !email || !password) ? .5 : 1}}>{busy ? 'Please wait…' : mode==='signin' ? 'Sign in' : 'Create account'}</button>
      <button onClick={()=>{setMode(mode==='signin'?'signup':'signin');setMessage('')}} style={switchStyle}>{mode==='signin' ? 'Create a new IDA account' : 'I already have an account'}</button>
      {message && <div style={{marginTop:14,padding:12,borderRadius:12,background:'rgba(255,255,255,.06)',fontSize:13,lineHeight:1.45,opacity:.85}}>{message}</div>}
      <div style={{marginTop:18,fontSize:11,textAlign:'center',opacity:.45}}>Your IDA data is saved separately for your account.</div>
    </div>
  </div>
}

export function CloudGate() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const saveTimer = useRef<number | null>(null)
  const saving = useRef(false)
  const queued = useRef(false)
  const activeUser = useRef<string | null>(null)
  const originalMethods = useRef<{setItem: Storage['setItem']; removeItem: Storage['removeItem']; clear: Storage['clear']} | null>(null)

  const saveNow = async () => {
    const userId = activeUser.current
    if (!userId) return
    if (saving.current) { queued.current = true; return }
    saving.current = true
    try {
      const state = readLocalState()
      const { error: saveError } = await supabase.from('ida_state').upsert({user_id:userId,state,updated_at:new Date().toISOString()},{onConflict:'user_id'})
      if (saveError) setError(saveError.message)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save IDA data.') }
    finally { saving.current=false; if(queued.current){queued.current=false;void saveNow()} }
  }
  const scheduleSave = () => {
    if (!activeUser.current) return
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(()=>{saveTimer.current=null;void saveNow()},650)
  }
  const installStorageSync = () => {
    if (originalMethods.current) return
    const storage=window.localStorage
    const original={setItem:storage.setItem.bind(storage),removeItem:storage.removeItem.bind(storage),clear:storage.clear.bind(storage)}
    originalMethods.current=original
    storage.setItem=((key:string,value:string)=>{original.setItem(key,value);if(isSyncKey(key))scheduleSave()}) as Storage['setItem']
    storage.removeItem=((key:string)=>{original.removeItem(key);if(isSyncKey(key))scheduleSave()}) as Storage['removeItem']
    storage.clear=(()=>{original.clear();scheduleSave()}) as Storage['clear']
  }
  const removeStorageSync = () => {
    const original=originalMethods.current
    if(!original)return
    window.localStorage.setItem=original.setItem
    window.localStorage.removeItem=original.removeItem
    window.localStorage.clear=original.clear
    originalMethods.current=null
  }
  const loadUser = async (userId:string) => {
    setReady(false);setError('');activeUser.current=userId
    const localBeforeCloud=readLocalState()
    const {data,error:loadError}=await supabase.from('ida_state').select('state').eq('user_id',userId).maybeSingle()
    if(loadError){setError(loadError.message);installStorageSync();setReady(true);return}
    if(data?.state&&looksLikeIdaState(data.state)) applyLocalState(data.state)
    else if(Object.keys(localBeforeCloud.keys).length) await supabase.from('ida_state').upsert({user_id:userId,state:localBeforeCloud,updated_at:new Date().toISOString()},{onConflict:'user_id'})
    installStorageSync();setReady(true)
  }
  useEffect(()=>{
    let mounted=true
    supabase.auth.getSession().then(({data})=>{if(!mounted)return;setSession(data.session);if(data.session)void loadUser(data.session.user.id);else setReady(true)})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{if(!mounted)return;setSession(next);if(next)void loadUser(next.user.id);else{activeUser.current=null;removeStorageSync();setReady(false)}})
    return()=>{mounted=false;subscription.unsubscribe();removeStorageSync();if(saveTimer.current!==null)window.clearTimeout(saveTimer.current)}
  },[])
  const accountLabel=useMemo(()=>session?.user.email||'IDA account',[session])
  if(!session||!ready)return <AuthScreen initialMessage={error}/>
  return <><DaApps/><div style={{position:'fixed',right:10,top:10,zIndex:99998,display:'flex',alignItems:'center',gap:8,padding:'7px 9px 7px 11px',borderRadius:999,background:'rgba(8,11,18,.7)',backdropFilter:'blur(16px)',color:'#fff',font:'12px system-ui',boxShadow:'0 6px 24px rgba(0,0,0,.25)'}}><span style={{maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',opacity:.8}}>{accountLabel}</span><button onClick={()=>void supabase.auth.signOut()} style={{border:0,borderRadius:999,padding:'5px 9px',background:'rgba(255,255,255,.1)',color:'#fff',cursor:'pointer'}}>Sign out</button></div>{error&&<div style={{position:'fixed',right:10,bottom:60,zIndex:99998,padding:'8px 12px',borderRadius:10,background:'rgba(150,30,30,.85)',color:'#fff',font:'12px system-ui'}}>Cloud save error: {error}</div>}</>
}
