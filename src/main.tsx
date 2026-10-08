import React from 'react';
import { createRoot } from 'react-dom/client';
import { CloudGate } from './CloudGate';
import './styles.css';

class IdaCrashBoundary extends React.Component<React.PropsWithChildren, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  componentDidCatch(error: unknown) {
    console.error('[IDA] React crash', error);
  }

  render() {
    if (this.state.error) {
      return <div style={{position:'fixed',inset:0,background:'#05070b',color:'#fff',display:'grid',placeItems:'center',padding:24,fontFamily:'Segoe UI,system-ui,sans-serif'}}>
        <div style={{width:'min(620px,100%)',padding:30,borderRadius:18,background:'#121620',border:'1px solid rgba(255,255,255,.12)',boxShadow:'0 30px 100px rgba(0,0,0,.55)'}}>
          <div style={{fontSize:24,fontWeight:600}}>IDA hit an error</div>
          <div style={{marginTop:8,fontSize:13,opacity:.65}}>The desktop crashed while opening. Your IDA data was not deleted.</div>
          <pre style={{marginTop:18,padding:14,borderRadius:10,background:'rgba(255,255,255,.055)',font:'12px ui-monospace,monospace',whiteSpace:'pre-wrap',overflow:'auto',maxHeight:180}}>{this.state.error.message}</pre>
          <button onClick={()=>window.location.reload()} style={{marginTop:18,padding:'11px 15px',border:0,borderRadius:10,background:'#fff',color:'#111',fontWeight:700,cursor:'pointer'}}>Reload IDA</button>
        </div>
      </div>;
    }
    return this.props.children;
  }
}

const root = document.getElementById('root');
if (!root) throw new Error('IDA root element is missing.');

createRoot(root).render(
  <IdaCrashBoundary>
    <React.StrictMode><CloudGate /></React.StrictMode>
  </IdaCrashBoundary>
);
