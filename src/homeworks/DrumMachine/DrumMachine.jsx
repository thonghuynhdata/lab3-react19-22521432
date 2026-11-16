import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
const PADS = [
  {id:'kick', label:'Kick', code:'KeyW', key:'W', freq:90, type:'sine'},
  {id:'snare',label:'Snare',code:'KeyA',key:'A',freq:220,type:'triangle'},
  {id:'hat',label:'Hi-hat',code:'KeyS',key:'S',freq:720,type:'square'},
  {id:'clap',label:'Clap',code:'KeyD',key:'D',freq:350,type:'sawtooth'},
  {id:'tom1',label:'Tom high',code:'KeyJ',key:'J',freq:270,type:'sine'},
  {id:'tom2',label:'Tom low',code:'KeyK',key:'K',freq:140,type:'sine'},
  {id:'ride',label:'Ride',code:'KeyL',key:'L',freq:620,type:'triangle'},
];
function useDrumKeyboard(padMap, onTriggerPad, onReleasePad, isEnabled=true) {
  useEffect(() => {
    if (!isEnabled) return undefined;
    const ignore = e => e.target instanceof Element && (e.target.closest('input,textarea,select,[contenteditable="true"]') || e.isComposing);
    const down = e => { if(e.repeat || ignore(e)) return; const pad=padMap.get(e.code); if(pad){e.preventDefault();onTriggerPad(pad.id);} };
    const up = e => { const pad=padMap.get(e.code); if(pad)onReleasePad(pad.id); };
    window.addEventListener('keydown',down); window.addEventListener('keyup',up);
    return () => {window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);};
  },[padMap,onTriggerPad,onReleasePad,isEnabled]);
}
export default function DrumMachine() {
  const volumeId = useId(); const context=useRef(null); const activeTimers=useRef(new Map());
  const [enabled,setEnabled]=useState(true); const [volume,setVolume]=useState(65);
  const [active,setActive]=useState([]); const [hits,setHits]=useState([]); const [level,setLevel]=useState(0);
  const pads=useMemo(()=>new Map(PADS.map(p=>[p.code,p])),[]);
  const trigger=useCallback(id=>{
    const pad=PADS.find(p=>p.id===id); if(!pad) return;
    try {
      if(!context.current) context.current = new window.AudioContext();
      const ctx=context.current; if(ctx.state==='suspended') void ctx.resume();
      const osc=ctx.createOscillator(), gain=ctx.createGain(), now=ctx.currentTime;
      osc.type=pad.type; osc.frequency.setValueAtTime(pad.freq,now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(45,pad.freq*0.6),now+0.14);
      gain.gain.setValueAtTime(Math.max(0.0001,volume/450),now);
      gain.gain.exponentialRampToValueAtTime(0.0001,now+0.23);
      osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(now+0.24);
      osc.onended=()=>{osc.disconnect();gain.disconnect();};
    } catch { /* Visual feedback remains accessible if AudioContext is unavailable. */ }
    setActive(prev=>prev.includes(id)?prev:[...prev,id]);
    setHits(prev=>[{id:crypto.randomUUID(),label:pad.label,time:new Date().toLocaleTimeString()},...prev].slice(0,8));
    setLevel(Math.min(100,Math.round(volume*(0.6+Math.random()*0.4))));
    window.clearTimeout(activeTimers.current.get(id));
    const timer=window.setTimeout(()=>{setActive(prev=>prev.filter(key=>key!==id));setLevel(0);activeTimers.current.delete(id);},190);
    activeTimers.current.set(id,timer);
  },[volume]);
  const release=useCallback(id=>{setActive(prev=>prev.filter(key=>key!==id));},[]);
  useDrumKeyboard(pads,trigger,release,enabled);
  useEffect(()=>()=>{for(const timer of activeTimers.current.values()) clearTimeout(timer);activeTimers.current.clear(); if(context.current)void context.current.close();},[]);
  return <section className="panel" aria-labelledby="drum-heading">
    <header className="section-head"><span className="eyebrow">HOMEWORK 01 / AUDIO STUDIO</span><h2 id="drum-heading">Production Drum Kit</h2><p>Seven playable drum pads. Click or use W A S D J K L. Physical key codes stay stable with Vietnamese keyboards.</p></header>
    <section className="toolbar" aria-label="Drum settings"><label htmlFor={volumeId}>Master volume: {volume}%</label><input id={volumeId} type="range" min="0" max="100" value={volume} onChange={e=>setVolume(e.target.valueAsNumber)}/><button type="button" className="ghost" aria-pressed={!enabled} onClick={()=>setEnabled(p=>!p)}>{enabled?'Keyboard enabled':'Keyboard disabled'}</button></section>
    <section className="drum-layout" aria-label="Drum pads">{PADS.map(p=><button type="button" className={`drum-pad ${active.includes(p.id)?'playing':''}`} key={p.id} aria-pressed={active.includes(p.id)} onPointerDown={()=>trigger(p.id)}><strong>{p.key}</strong><span>{p.label}</span></button>)}</section>
    <section className="two-column"><article className="subpanel"><h3>Visual decibel meter</h3><meter min="0" max="100" value={level} aria-label="Current hit intensity"/><p className="muted">Audio feedback is also represented visually.</p></article><article className="subpanel"><h3>Hit history</h3><output role="status" aria-live="polite">{hits[0]?`Last hit: ${hits[0].label}`:'No hits yet'}</output><ol className="hit-list">{hits.slice(0,5).map(h=><li key={h.id}>{h.label}<span>{h.time}</span></li>)}</ol></article></section>
  </section>;
}
