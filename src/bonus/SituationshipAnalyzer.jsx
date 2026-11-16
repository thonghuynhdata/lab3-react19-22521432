import { useEffect, useId, useState } from 'react';
const PHASES=['FRIENDS','DATING_NO_LOVE','OFFICIAL_LOVE','GHOSTED_EXIT'];
export default function SituationshipAnalyzer(){
 const myId=useId(),rivalId=useId();const [phase,setPhase]=useState('DATING_NO_LOVE'),[myTries,setMyTries]=useState(100),[rivalTries,setRivalTries]=useState(1),[logs,setLogs]=useState([]),[ping,setPing]=useState(0),[replied,setReplied]=useState(false);
 const myImpact=myTries*0.1,rivalImpact=rivalTries*50;
 const isRedFlag=phase==='DATING_NO_LOVE'&&myImpact<rivalImpact;
 useEffect(()=>{
  if(phase!=='DATING_NO_LOVE'||ping===0||replied)return undefined;
  const controller=new AbortController();
  const timeout=setTimeout(()=>{if(!controller.signal.aborted)setPhase('GHOSTED_EXIT');},5000);
  return ()=>{controller.abort();clearTimeout(timeout);};
 },[phase,ping,replied]);
 const record=(actor,steps,multiplier)=>setLogs(prev=>[...prev,{id:crypto.randomUUID(),actor,steps,multiplier}]);
 return <section className="panel" aria-labelledby="bonus-title"><header className="section-head"><span className="eyebrow">BONUS / FINITE STATE MACHINE</span><h2 id="bonus-title">Hẹn Hò Nhưng Không Yêu</h2><p>A deterministic relationship state machine, an asymmetric effort model, and leak-free ghosting timeout.</p></header>
 <section className="toolbar" aria-label="Relationship state">{PHASES.map(p=><button key={p} type="button" className={phase===p?'':'ghost'} aria-pressed={phase===p} onClick={()=>{setPhase(p);setReplied(false);setPing(0);}}>{p.replaceAll('_',' ')}</button>)}</section>
 <section className="two-column"><article className="subpanel"><h3>Effort signals</h3><label htmlFor={myId}>My effort: {myTries} attempts</label><input id={myId} type="range" min="0" max="200" value={myTries} onChange={e=>setMyTries(e.target.valueAsNumber)}/><label htmlFor={rivalId}>Someone else's effort: {rivalTries} attempts</label><input id={rivalId} type="range" min="0" max="20" value={rivalTries} onChange={e=>setRivalTries(e.target.valueAsNumber)}/><dl className="kv"><dt>My impact (×0.1)</dt><dd>{myImpact.toFixed(1)}</dd><dt>Rival impact (×50)</dt><dd>{rivalImpact.toFixed(1)}</dd></dl><button type="button" className="ghost" onClick={()=>{record('EM',myTries,0.1);record('AI_DO',rivalTries,50);}}>Log immutable signals</button><p>{logs.length} signals logged</p></article>
 <article className="subpanel"><h3>Status & ghosting</h3><output role="status" aria-live="polite" className={isRedFlag?'warning':''}>{isRedFlag?'⚠ Red flag: asymmetric effort.':`Current phase: ${phase}`}</output><p>Send a ping while dating; without a reply, the state becomes GHOSTED_EXIT after 5 seconds.</p><section className="toolbar"><button type="button" disabled={phase!=='DATING_NO_LOVE'} onClick={()=>{setReplied(false);setPing(p=>p+1);}}>Send message</button><button type="button" className="ghost" disabled={!ping} onClick={()=>{setReplied(true);setPhase('OFFICIAL_LOVE');}}>Receive reply</button><button type="button" className="ghost" onClick={()=>setPhase('GHOSTED_EXIT')}>Unbind & free memory</button></section></article></section></section>;
}
