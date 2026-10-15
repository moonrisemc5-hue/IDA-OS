import { useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'

type Props = { soundEnabled: boolean; onBack: () => void }
const lines = [
  'Another day of work.',
  'What is sleep nowadays?',
  'My life is just, work.',
  'The Earth is overpopulated.',
  'No one can find a job anymore.'
]
function blip() {
  try {
    const Audio = window.AudioContext || (window as any).webkitAudioContext
    if (!Audio) return
    const ctx = new Audio()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'square'
    oscillator.frequency.value = 155 + Math.random() * 75
    gain.gain.setValueAtTime(0.025, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.055)
    oscillator.connect(gain); gain.connect(ctx.destination)
    oscillator.start(); oscillator.stop(ctx.currentTime + 0.06)
    oscillator.onended = () => ctx.close()
  } catch {}
}
export default function DaSubjectIvorIntro({ soundEnabled, onBack }: Props) {
  const [loading, setLoading] = useState(true)
  const [line, setLine] = useState(0)
  const [pos, setPos] = useState({ x: 50, y: 68 })
  const [facing, setFacing] = useState('down')
  const [walking, setWalking] = useState(false)
  const held = useRef(new Set<string>())
  useEffect(() => { const t = window.setTimeout(() => setLoading(false), 1900); return () => window.clearTimeout(t) }, [])
  const advance = () => {
    if (line < lines.length) {
      setLine(v => v + 1)
      if (soundEnabled) blip()
    }
  }
  useEffect(() => {
    const down=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(loading)return;if(line<lines.length&&(k==='n'||e.key==='Enter')){e.preventDefault();setLine(v=>Math.min(lines.length,v+1));if(soundEnabled)blip();return}if(line>=lines.length&&['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){e.preventDefault();held.current.add(k)}}
    const up=(e:KeyboardEvent)=>held.current.delete(e.key.toLowerCase()),clear=()=>held.current.clear()
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear)
    let frame=0,last=0
    const tick=(now:number)=>{const dt=last?Math.min(32,now-last):16;last=now;if(!loading&&line>=lines.length){const k=held.current;let dx=Number(k.has('d')||k.has('arrowright'))-Number(k.has('a')||k.has('arrowleft')),dy=Number(k.has('s')||k.has('arrowdown'))-Number(k.has('w')||k.has('arrowup'));const moving=dx!==0||dy!==0;setWalking(moving);if(moving){if(Math.abs(dx)>=Math.abs(dy)&&dx!==0)setFacing(dx<0?'left':'right');else setFacing(dy<0?'up':'down');const m=Math.hypot(dx,dy)||1;dx=dx/m*.00028*dt*100;dy=dy/m*.00028*dt*100;setPos(p=>{const nx=Math.max(2.5,Math.min(97.5,p.x+dx)),ny=Math.max(23,Math.min(85,p.y+dy));const hit=Array.from({length:12},(_,i)=>({x:1+(i%6)*17,y:48+Math.floor(i/6)*23,w:15,h:7})).some(d=>nx>d.x-2&&nx<d.x+d.w+2&&ny>d.y-3&&ny<d.y+d.h+3);return hit?p:{x:nx,y:ny}})}}frame=requestAnimationFrame(tick)}
    frame=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(frame);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear)}
  },[loading,line,soundEnabled])
  return <section className="dsi-root">
    <style>{`
      .dsi-root{position:relative;min-height:570px;height:100%;overflow:hidden;background:#081522;border:3px solid #29465e;box-shadow:5px 5px 0 #0009;font-family:ui-monospace,monospace;isolation:isolate}
      .dsi-scene{position:absolute;inset:0;overflow:hidden;background:linear-gradient(#162b42 0 8%,#253c50 8% 10%,#24394a 10% 34%,#172a3b 34% 100%);image-rendering:pixelated;transform:scale(.92);transform-origin:center}
      .dsi-top{position:absolute;z-index:4;left:0;right:0;top:0;height:8%;display:flex;align-items:center;justify-content:space-between;padding:0 2%;background:#071321;border-bottom:4px solid #45657a;color:#9cebf5;font-size:clamp(7px,.8vw,10px);letter-spacing:.12em}
      .dsi-window{position:absolute;left:2%;right:2%;top:10%;height:25%;border:8px solid #203a51;background:linear-gradient(#182d50,#cb7a68);box-shadow:inset 0 0 0 3px #62839a}
      .dsi-city{position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:space-around;background:linear-gradient(#253a61,#d68c70)}
      .dsi-city i{display:block;width:7%;height:68%;border:2px solid #0a192b;background:repeating-linear-gradient(0deg,transparent 0 9px,#5fe4f2 10px 12px),repeating-linear-gradient(90deg,#0b1b2e 0 12px,#24415d 13px 17px)}
      .dsi-city i:nth-child(3n){height:95%}.dsi-city i:nth-child(4n){height:53%}.dsi-city i:nth-child(5n){height:80%}
      .dsi-window:after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 24%,#1b3047 24.3% 25.3%,transparent 25.6% 49%)}
      .dsi-ceiling-lights{position:absolute;left:0;right:0;top:8%;height:3%;background:repeating-linear-gradient(90deg,#526b7c 0 7%,#b5e4ed 7.5% 12%,#273c50 12.5% 20%)}
      .dsi-grid{position:absolute;inset:35% 0 0;background:linear-gradient(90deg,transparent 49.5%,#53697a 50%,transparent 50.5%),linear-gradient(0deg,transparent 49.5%,#53697a 50%,transparent 50.5%);background-size:90px 64px;opacity:.38}
      .dsi-worker{position:absolute;z-index:2;width:3.5%;height:10%;min-width:14px;image-rendering:pixelated}
      .dsi-worker b{position:absolute;left:24%;top:0;width:52%;height:29%;background:#c18b6b;border:2px solid #242d3a}.dsi-worker b:before{content:"";position:absolute;left:-10%;top:-22%;width:120%;height:45%;background:#282630}.dsi-worker b:after{content:"•  •";position:absolute;left:0;top:28%;white-space:pre;font-size:6px;letter-spacing:1px;color:#151923}
      .dsi-worker em{position:absolute;left:8%;top:27%;width:84%;height:52%;background:#475b70;border:2px solid #101e30}.dsi-worker em:after{content:"";position:absolute;left:40%;top:0;width:20%;height:65%;background:#e1e8ed;clip-path:polygon(0 0,100% 0,50% 100%)}
      .dsi-worker i{position:absolute;left:-25%;top:46%;width:38%;height:30%;background:#071b2b;border:2px solid #5b879c}
      .dsi-worker:nth-of-type(3n) b{background:#8f573d}.dsi-worker:nth-of-type(3n) em{background:#12627d}.dsi-worker:nth-of-type(4n) em{background:#65435b}.dsi-worker:nth-of-type(5n) em{background:#50644d}
      .dsi-desk{position:absolute;z-index:3;width:15%;height:5.5%;background:#79583d;border:3px solid #263443;box-shadow:0 7px #0a1420}
      .dsi-desk:before{content:'';position:absolute;left:30%;top:-100%;width:42%;height:100%;background:#0a1b2b;border:3px solid #55798d}
      .dsi-desk:after{content:'';position:absolute;left:12%;right:12%;top:100%;height:75%;border-left:3px solid #3b4651;border-right:3px solid #3b4651}
      .dsi-ivor{position:absolute;z-index:6;width:30px;transform:translate(-50%,-50%);filter:drop-shadow(2px 3px #0008);image-rendering:pixelated}.dsi-ivor svg{width:30px;height:42px;image-rendering:pixelated}.dsi-ivor.walking svg{animation:dsi-step .18s steps(2,end) infinite}@keyframes dsi-step{50%{translate:0 -2px}}
      .dsi-ivor svg{width:42px;height:54px;image-rendering:pixelated}.dsi-ivor small{display:block;text-align:center;color:#d8fbff;font-size:8px;text-shadow:1px 1px #000;letter-spacing:.12em}
      .dsi-bottom-label{position:absolute;z-index:5;left:2%;right:2%;bottom:2%;display:flex;justify-content:space-between;color:#9bb3c6;font-size:8px;letter-spacing:.12em;text-shadow:1px 1px #000}
      .dsi-dialogue{position:absolute;z-index:10;left:3%;right:3%;bottom:4%;width:94%;display:flex;align-items:center;gap:14px;padding:14px 17px;text-align:left;background:#07101f!important;color:#fff!important;border:3px solid #e1edf6!important;box-shadow:5px 5px 0 #000a!important}
      .dsi-face{display:grid;place-items:center;flex:none;width:50px;height:58px;border:2px solid #59d6e9;background:#11283b}.dsi-face svg{width:34px;height:46px;image-rendering:pixelated}
      .dsi-line{font-size:clamp(14px,2vw,20px);line-height:1.45;color:#fff}.dsi-hint{margin-top:10px;text-align:right;color:#91eafa;font-size:9px;letter-spacing:.16em;animation:dsi-blink 1.2s infinite}
      @keyframes dsi-blink{50%{opacity:.35}}
      .dsi-move-hint{position:absolute;z-index:10;left:3%;right:3%;bottom:3%;padding:13px 16px;background:#07101ff2;border:2px solid #52768b;color:#d0e1ec;font-size:10px;letter-spacing:.13em}
      .dsi-loading{position:absolute;z-index:20;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#030812;color:#a5f3fc}
      .dsi-load-mark{display:grid;place-items:center;width:68px;height:68px;border:3px solid #70e7f5;font-size:22px;font-weight:900;box-shadow:0 0 32px #22d3ee33;animation:dsi-blink 1s infinite}
      .dsi-back{position:absolute;z-index:30;top:12px;left:12px;padding:6px 9px;background:#06101fdd!important;border:1px solid #46677d!important;color:#bceefa!important;font-size:9px!important;letter-spacing:.12em}
      @media(max-width:640px){.dsi-root{min-height:520px}.dsi-worker{width:5%}.dsi-window{height:21%}.dsi-dialogue{padding:9px;gap:8px}.dsi-face{width:39px;height:48px}}
    `}</style>
    <div className="dsi-scene">
      <div className="dsi-top"><span>DEPARTMENT 07 / LABOR ALLOCATION</span><span>YEAR 2091 • SHIFT 06:00—02:00</span></div>
      <div className="dsi-ceiling-lights"/>
      <div className="dsi-window"><div className="dsi-city">{Array.from({length:16},(_,i)=><i key={i}/>)}</div></div>
      <div className="dsi-grid"/>
      {Array.from({length:30},(_,i)=><div key={i} className="dsi-worker" style={{left:(2+(i%10)*9.7)+'%',top:(37+Math.floor(i/10)*15)+'%'}}><b/><em/><i/></div>)}
      {Array.from({length:12},(_,i)=><div key={'desk'+i} className="dsi-desk" style={{left:(1+(i%6)*17)+'%',top:(48+Math.floor(i/6)*23)+'%'}}/>)}
      <div className={"dsi-ivor"+(walking?" walking":"")} style={{left:pos.x+'%',top:pos.y+'%'}}><svg viewBox="0 0 32 40" shapeRendering="crispEdges" style={{transform:facing==='left'?'scaleX(-1)':facing==='up'?'scaleY(-1)':'none'}}><rect x="10" y="2" width="12" height="3" fill="#282630"/><rect x="7" y="5" width="18" height="4" fill="#282630"/><rect x="6" y="9" width="20" height="10" fill="#e0ad86"/><rect x="8" y="7" width="5" height="3" fill="#282630"/><rect x="13" y="5" width="8" height="3" fill="#282630"/><rect x="22" y="8" width="4" height="5" fill="#282630"/><rect x="9" y="12" width="3" height="2" fill="#111827"/><rect x="20" y="12" width="3" height="2" fill="#111827"/><rect x="13" y="17" width="7" height="1" fill="#704334"/><rect x="13" y="19" width="6" height="3" fill="#e0ad86"/><rect x="9" y="22" width="14" height="11" fill="#26364a"/><path d="M11 22 L16 27 L21 22" fill="#edf2f7"/><path d="M15 24 L17 24 L16 30Z" fill="#9b2c3d"/><rect x="5" y="23" width="4" height="10" fill="#e0ad86"/><rect x="23" y="23" width="4" height="10" fill="#e0ad86"/><rect x="10" y="33" width="5" height="4" fill="#334155"/><rect x="18" y="33" width="5" height="4" fill="#334155"/><rect x="9" y="37" width="7" height="2" fill="#171923"/><rect x="17" y="37" width="7" height="2" fill="#171923"/></svg><small>IVOR</small></div>
      <div className="dsi-bottom-label"><span>OPEN OFFICE / FLOOR 38</span><span>WORKERS PRESENT: 684</span></div>
    </div>
    {loading && <div className="dsi-loading"><div className="dsi-load-mark">DS</div><div className="mt-5 text-xs tracking-[.3em]">LOADING OFFICE SIMULATION</div><div className="mt-4 h-2 w-56 overflow-hidden border border-cyan-900 bg-slate-950"><div className="h-full w-1/2 bg-cyan-300" style={{animation:'ds-loader 1.1s ease-in-out infinite'}}/></div><div className="mt-3 text-[9px] tracking-[.2em] text-slate-500">RECONSTRUCTING WORKPLACE // 2091</div></div>}
    {!loading && line < lines.length && <div className="dsi-dialogue"><span className="dsi-face"><svg viewBox="0 0 32 40" shapeRendering="crispEdges"><rect x="8" y="5" width="16" height="3" fill="#282630"/><rect x="6" y="8" width="20" height="16" fill="#e0ad86"/><rect x="7" y="5" width="5" height="5" fill="#282630"/><rect x="12" y="3" width="10" height="5" fill="#282630"/><rect x="22" y="7" width="4" height="8" fill="#282630"/><rect x="10" y="14" width="3" height="2" fill="#222"/><rect x="20" y="14" width="3" height="2" fill="#222"/><rect x="13" y="20" width="7" height="2" fill="#694637"/></svg></span><span className="flex-1"><span className="block text-[9px] tracking-[.3em] text-cyan-200">IVOR</span><span className="dsi-line block">{lines[line]}</span><span className="dsi-hint block">N / ENTER — NEXT ▸</span></span></div>}
    {!loading && line >= lines.length && <div className="dsi-move-hint"><b className="text-cyan-200">IVOR</b> &nbsp; MOVE WITH <b>W A S D</b> OR <b>ARROW KEYS</b> &nbsp; • &nbsp; EXPLORE THE OFFICE</div>}
    <button className="dsi-back" onClick={onBack}><ArrowLeft size={12} className="inline mr-1"/> EXIT TO MENU</button>
  </section>
}
