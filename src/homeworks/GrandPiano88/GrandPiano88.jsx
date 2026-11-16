import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { PolyphonicSynth, midiToFrequency } from '../../audio/PolyphonicSynth.js';
const NOTES = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const KEYS = Array.from({length:88},(_,i)=>{
  const midi=i+21, pitch=midi%12, name=NOTES[pitch];
  return {midi, noteName:`${name}${Math.floor(midi/12)-1}`,isBlack:name.includes('♯')};
});
const sleep = (ms, signal) => new Promise((resolve,reject)=>{
  if (signal.aborted) return reject(new DOMException('Cancelled','AbortError'));
  const timer=setTimeout(()=>{signal.removeEventListener('abort',cancel);resolve();},Math.max(0,ms));
  function cancel(){clearTimeout(timer);reject(new DOMException('Cancelled','AbortError'));}
  signal.addEventListener('abort',cancel,{once:true});
});
const PianoKey=memo(function PianoKey({midi,noteName,isBlack,isPressed,onNoteOn,onNoteOff}) {
  return <button type="button" className={`piano-key ${isBlack?'black':'white'} ${isPressed?'pressed':''}`} aria-label={`${noteName} piano key`} aria-pressed={isPressed}
    onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);onNoteOn(midi);}}
    onPointerUp={()=>onNoteOff(midi)} onPointerCancel={()=>onNoteOff(midi)} onLostPointerCapture={()=>onNoteOff(midi)}
    onKeyDown={e=>{if((e.code==='Enter'||e.code==='Space')&&!e.repeat){e.preventDefault();onNoteOn(midi);}}}
    onKeyUp={e=>{if(e.code==='Enter'||e.code==='Space'){e.preventDefault();onNoteOff(midi);}}}>
    <span>{noteName}</span></button>;
});
export default function GrandPiano88(){
  const synth=useRef(null), held=useRef(new Map()), recording=useRef(false), recordStart=useRef(0), replay=useRef(null), pressedRef=useRef(new Set());
  const speedId=useId(), [pressed,setPressed]=useState(new Set()), [events,setEvents]=useState([]),[isRecording,setRecording]=useState(false),[isPlaying,setPlaying]=useState(false),[speed,setSpeed]=useState(1),[message,setMessage]=useState('Ready for 88 keys.');
  const noteOn=useCallback(async midi=>{
    if(!synth.current) synth.current=new PolyphonicSynth(8);
    try { await synth.current.ready(); } catch {setMessage('Audio output is not available.');return;}
    if(pressedRef.current.has(midi))return;
    pressedRef.current=new Set([...pressedRef.current,midi]); setPressed(pressedRef.current);
    synth.current.noteOn(midi,midiToFrequency(midi));
    if(recording.current)held.current.set(midi,performance.now());
  },[]);
  const noteOff=useCallback(midi=>{
    synth.current?.noteOff(midi);
    if(pressedRef.current.has(midi)) {const next=new Set(pressedRef.current);next.delete(midi);pressedRef.current=next;setPressed(next);}
    const start=held.current.get(midi);held.current.delete(midi);
    if(recording.current && start!==undefined) setEvents(prev=>[...prev,{id:crypto.randomUUID(),midi,freqHz:midiToFrequency(midi),deltaMs:Math.round(start-recordStart.current),durationMs:Math.max(40,Math.round(performance.now()-start))}]);
  },[]);
  const stopReplay=useCallback(()=>{
    replay.current?.abort(); replay.current=null; synth.current?.stopAll();pressedRef.current=new Set();setPressed(new Set());setPlaying(false);
  },[]);
  useEffect(()=>()=>{replay.current?.abort();if(synth.current)void synth.current.close();},[]);
  const startRecording=()=>{stopReplay();setEvents([]);held.current.clear();recordStart.current=performance.now();recording.current=true;setRecording(true);setMessage('Recording note events…');};
  const finishRecording=()=>{for(const midi of [...held.current.keys()])noteOff(midi);recording.current=false;setRecording(false);setMessage('Recording saved in memory.');};
  const play=async()=>{
    if(!events.length||isPlaying)return;
    const controller=new AbortController(); replay.current=controller;setPlaying(true);setMessage('Playing FIFO sequence…');
    const ordered=events.toSorted((a,b)=>a.deltaMs-b.deltaMs);
    const scheduled=[];
    try {
      if(!synth.current)synth.current=new PolyphonicSynth(8);
      await synth.current.ready();
      let cursor=0;
      // FIFO event start times are preserved; each note release is cancelable.
      for(const event of ordered){
        await sleep((event.deltaMs-cursor)/speed,controller.signal);
        cursor=event.deltaMs;
        if(controller.signal.aborted)break;
        synth.current.noteOn(event.midi,event.freqHz);
        pressedRef.current=new Set([...pressedRef.current,event.midi]);setPressed(pressedRef.current);
        const release=sleep(event.durationMs/speed,controller.signal).then(()=>{
          synth.current?.noteOff(event.midi);
          const next=new Set(pressedRef.current);next.delete(event.midi);pressedRef.current=next;setPressed(next);
        });
        scheduled.push(release);
      }
      await Promise.all(scheduled);
      if(!controller.signal.aborted)setMessage('Sequence complete.');
    }catch(error){if(error.name!=='AbortError')setMessage(`Playback error: ${error.message}`);}
    finally {if(replay.current===controller){replay.current=null;setPlaying(false);synth.current?.stopAll();pressedRef.current=new Set();setPressed(new Set());}}
  };
  return <section className="panel" aria-labelledby="piano-title">
    <header className="section-head"><span className="eyebrow">HOMEWORK 02 / CONCURRENT AUDIO</span><h2 id="piano-title">88-Key Grand Piano</h2><p>Algorithmically generated A0–C8 keyboard • 8-voice polyphony • FIFO voice stealing • cancelable recording and playback.</p></header>
    <section className="toolbar"><button type="button" onClick={isRecording?finishRecording:startRecording} disabled={isPlaying}>{isRecording?'■ Stop recording':'● Record'}</button><button type="button" onClick={play} disabled={!events.length||isPlaying||isRecording}>▶ Replay</button><button type="button" className="ghost" onClick={stopReplay}>■ Stop sequence</button><label htmlFor={speedId}>Playback speed</label><select id={speedId} value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value="0.5">0.5×</option><option value="1">1×</option><option value="2">2×</option></select></section>
    <section className="piano-scroll" aria-label="88-key piano: scroll horizontally to reach all notes"><section className="keyboard" aria-label="Piano keyboard">{KEYS.map(k=><PianoKey key={k.midi} {...k} isPressed={pressed.has(k.midi)} onNoteOn={noteOn} onNoteOff={noteOff}/>)}</section></section>
    <section className="two-column"><article className="subpanel"><h3>Voice pool</h3><p className="huge">{pressed.size} <span>/ 8</span></p><p className="muted">FIFO steals the oldest voice when over capacity.</p></article><article className="subpanel"><h3>Sequence monitor</h3><output role="status" aria-live="polite">{message}</output><p>{events.length} recorded notes</p><p className="muted">Recording stores MIDI, frequency, start offset and duration.</p></article></section>
  </section>;
}
