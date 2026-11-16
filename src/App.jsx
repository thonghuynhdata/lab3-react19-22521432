import { useState } from 'react';
import DrumMachine from './homeworks/DrumMachine/DrumMachine.jsx';
import GrandPiano88 from './homeworks/GrandPiano88/GrandPiano88.jsx';
import KraftonPubgVnArena from './homeworks/KraftonPubgVnArena/KraftonPubgVnArena.jsx';
import SituationshipAnalyzer from './bonus/SituationshipAnalyzer.jsx';
const TABS=[{id:'drums',name:'01 / Drum Kit'},{id:'piano',name:'02 / Grand Piano'},{id:'arena',name:'03 / PUBG Arena'},{id:'bonus',name:'★ / Bonus FSM'}];
export default function App(){
 const [tab,setTab]=useState('drums');
 return <><header className="site-header"><section className="site-header-inner"><span className="brand"><span className="brand-mark">R19</span><span>UIT LAB 03 <small>ENGINEERING STUDIO</small></span></span><span className="pill">REACT 19 • FIBER HOOKS</span></section></header>
 <main className="layout"><section className="hero"><span className="eyebrow">FROM MINI-REACT TO PRODUCTION</span><h1>React 19 <em>Homeworks.</em></h1><p>Three engineering challenges. One practical studio. Accessibility, concurrent audio and resilient state by design.</p></section>
 <nav className="tab-nav" aria-label="Homework selector">{TABS.map(item=><button key={item.id} type="button" className={tab===item.id?'selected':''} aria-current={tab===item.id?'page':undefined} onClick={()=>setTab(item.id)}>{item.name}</button>)}</nav>
 {tab==='drums'&&<DrumMachine/>}{tab==='piano'&&<GrandPiano88/>}{tab==='arena'&&<KraftonPubgVnArena/>}{tab==='bonus'&&<SituationshipAnalyzer/>}
 <footer className="footer">LAB 03 • React 19 + Vite • Semantic HTML • Immutable state • Deterministic cleanup</footer></main></>;
}
