import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { usePubgAirdropTimer } from '../../hooks/usePubgAirdropTimer.js';
const SQUADS=[
 {squadId:'te',squadName:'The Expendables',wwcdCount:5,placementPts:62,killPts:79},
 {squadId:'ces',squadName:'Cerberus Esports',wwcdCount:4,placementPts:68,killPts:71},
 {squadId:'ge',squadName:'Roy Esports',wwcdCount:3,placementPts:57,killPts:63},
 {squadId:'agg',squadName:'AGG',wwcdCount:2,placementPts:51,killPts:58},
];
const START=Date.now();
const INITIAL_DROPS=[
 {id:'ticket',title:'PVS Grand Finals VIP Pass',priceVnd:450000,remainingStock:5,dropEpochMs:START+12000},
 {id:'gcoin',title:'Contraband Crate + 5,000 G-Coin',priceVnd:250000,remainingStock:8,dropEpochMs:START+20000},
 {id:'gear',title:'Pro Squad Collector Bundle',priceVnd:125000,remainingStock:3,dropEpochMs:START+30000}
];
const money=v=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(v);
function formatTime(ms){let s=Math.ceil(ms/1000);return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s%3600/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
function simulateClaim({signal,remainingStock}) {return new Promise((resolve,reject)=>{
 if(signal.aborted){reject(new DOMException('Aborted','AbortError'));return;}
 const handler=()=>{clearTimeout(timer);reject(new DOMException('Aborted','AbortError'));};
 const timer=setTimeout(()=>{signal.removeEventListener('abort',handler);if(remainingStock<=0||Math.random()<0.2){const error=new Error('409 Conflict — Looted Out');error.status=409;reject(error);}else resolve({ok:true});},750);
 signal.addEventListener('abort',handler,{once:true});
});}
function DropCard({drop,onClaim,isPending,notice}){
 const {remainingMs,isLive}=usePubgAirdropTimer(drop.dropEpochMs);
 const phase=!isLive?'WARMUP':drop.remainingStock<=0?'LOOTED_OUT':'AIRDROP_LIVE';
 return <article className="drop-card"><span className={`phase ${phase==='AIRDROP_LIVE'?'live':''}`}>{phase.replaceAll('_',' ')}</span><h3>{drop.title}</h3><p className="price">{money(drop.priceVnd)}</p><dl className="kv"><dt>Stock</dt><dd>{drop.remainingStock} crates</dd><dt>Drop countdown</dt><dd className="mono">{isLive?'LIVE NOW':formatTime(remainingMs)}</dd></dl><button type="button" disabled={!isLive||drop.remainingStock<=0||isPending} onClick={()=>onClaim(drop.id)}>{isPending?'Claiming…':phase==='LOOTED_OUT'?'Looted out':isLive?'Claim airdrop':'Locked until drop'}</button>{notice&&<output className="notice" role="status" aria-live="polite">{notice}</output>}</article>;
}
export default function KraftonPubgVnArena(){
 const searchId=useId(),sortId=useId(),feedId=useId();
 const [drops,setDrops]=useState(INITIAL_DROPS); const [pending,setPending]=useState([]);const locks=useRef(new Set());const controllers=useRef(new Set());const [messages,setMessages]=useState({});
 const [search,setSearch]=useState(''),[sort,setSort]=useState('total'),[feedFilter,setFeedFilter]=useState('all');
 const [feed,setFeed]=useState([{id:'e1',squadId:'te',squad:'The Expendables',action:'eliminated',target:'Squad Alpha'},{id:'e2',squadId:'ces',squad:'Cerberus Esports',action:'secured',target:'the blue zone'},{id:'e3',squadId:'ge',squad:'Roy Esports',action:'eliminated',target:'Squad Bravo'},{id:'e4',squadId:'agg',squad:'AGG',action:'claimed',target:'a supply crate'}]);
 useEffect(()=>()=>{for(const controller of controllers.current)controller.abort();controllers.current.clear();},[]);
 const claim=async id=>{
  if(locks.current.has(id))return;
  const drop=drops.find(d=>d.id===id);if(!drop||drop.remainingStock<=0||Date.now()<drop.dropEpochMs)return;
  locks.current.add(id);setPending(prev=>[...prev,id]);setDrops(prev=>prev.map(d=>d.id===id?{...d,remainingStock:d.remainingStock-1}:d));setMessages(prev=>({...prev,[id]:'Reserved locally — verifying with server…'}));
  const controller=new AbortController();controllers.current.add(controller);
  try {await simulateClaim({signal:controller.signal,remainingStock:drop.remainingStock});setMessages(prev=>({...prev,[id]:'Claim confirmed (simulated server).'}));}
  catch(error){if(error.name!=='AbortError') {setDrops(prev=>prev.map(d=>d.id===id?{...d,remainingStock:d.remainingStock+1}:d));setMessages(prev=>({...prev,[id]:error.status===409?'409 Conflict: stock restored after rejection.':error.message}));}}
  finally{controllers.current.delete(controller);locks.current.delete(id);setPending(prev=>prev.filter(item=>item!==id));}
 };
 const rows=useMemo(()=>SQUADS.filter(s=>s.squadName.toLowerCase().includes(search.toLowerCase())).toSorted((a,b)=>{
  const score=s=>s.placementPts+s.killPts;
  return sort==='wwcd'?b.wwcdCount-a.wwcdCount:sort==='placement'?b.placementPts-a.placementPts:sort==='kills'?b.killPts-a.killPts:score(b)-score(a);
 }),[search,sort]);
 const visibleFeed=feed.filter(item=>feedFilter==='all'||item.squadId===feedFilter);
 return <section className="panel" aria-labelledby="arena-title">
  <header className="section-head"><span className="eyebrow">HOMEWORK 03 / ESPORTS ENGINEERING</span><h2 id="arena-title">PUBG Vietnam Airdrop Arena</h2><p>Simulated PVS Finals arena with an anti-drift countdown, optimistic claim + 409 rollback, and derived leaderboard. Not affiliated with KRAFTON.</p></header>
  <section aria-labelledby="drop-title"><h3 id="drop-title">Live airdrops <span className="muted small">Timers start when the demo is loaded</span></h3><section className="drop-grid">{drops.map(d=><DropCard key={d.id} drop={d} onClaim={claim} isPending={pending.includes(d.id)} notice={messages[d.id]}/>)}</section></section>
  <section className="two-column align-start"><article className="subpanel"><h3>Squad leaderboard</h3><form className="filter-row" role="search" onSubmit={e=>e.preventDefault()}><label htmlFor={searchId}>Find squad</label><input id={searchId} type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Vietnamese squad"/><label htmlFor={sortId}>Rank by</label><select id={sortId} value={sort} onChange={e=>setSort(e.target.value)}><option value="total">Total points</option><option value="wwcd">WWCD</option><option value="placement">Placement</option><option value="kills">Kill points</option></select></form><output role="status" aria-live="polite">{rows.length} squads found</output><section className="table-wrap"><table><thead><tr><th>Squad</th><th>WWCD</th><th>Place</th><th>Kills</th><th>Total</th></tr></thead><tbody>{rows.map(s=><tr key={s.squadId}><th scope="row">{s.squadName}</th><td>{s.wwcdCount}</td><td>{s.placementPts}</td><td>{s.killPts}</td><td>{s.placementPts+s.killPts}</td></tr>)}</tbody></table></section></article>
  <article className="subpanel"><h3>Kill-feed</h3><label htmlFor={feedId}>Filter activity by squad</label><select id={feedId} value={feedFilter} onChange={e=>setFeedFilter(e.target.value)}><option value="all">All squads</option>{SQUADS.map(s=><option key={s.squadId} value={s.squadId}>{s.squadName}</option>)}</select><ul className="feed">{visibleFeed.map(item=><li key={item.id}><strong>{item.squad}</strong> {item.action} {item.target}</li>)}</ul><button type="button" className="ghost" onClick={()=>setFeed(prev=>[{id:crypto.randomUUID(),squadId:'te',squad:'The Expendables',action:'eliminated',target:'another opponent'},...prev].slice(0,30))}>Simulate kill-feed event</button></article></section>
  <p className="muted small">Demo disclosure: squad points, prices, inventory, events and server responses are illustrative local fixtures, not real-time KRAFTON data, purchasable tickets or G-Coin.</p>
 </section>;
}
