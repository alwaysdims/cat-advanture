import { useEffect,useRef,useState } from 'react';
import { createGame } from '../game/createGame';
import { AudioManager } from '../game/audio';
import { loadSave,writeSave } from '../game/save';
import { newRun,retryRun } from '../game/state';
import { HUD,Icon } from './HUD';
import Overlays from './Overlays';
import TouchControls from './TouchControls';

export default function App() {
  const host=useRef(null),gameRef=useRef(null),bridgeRef=useRef(null),actionsRef=useRef(null);
  const [view,setView]=useState({screen:'loading'});
  const [save,setSave]=useState(loadSave);
  const [storageOK,setStorageOK]=useState(true);
  useEffect(()=>{
    const saved=loadSave();
    const bridge={save:saved,touch:{},audio:new AudioManager(saved.muted),storageOK:true,emit:next=>{
      setView(next);setSave({...bridge.save});setStorageOK(bridge.storageOK);
    }};
    bridgeRef.current=bridge;
    const game=createGame(host.current,bridge);gameRef.current=game;
    const resize=new ResizeObserver(()=>game.scale.refresh());
    resize.observe(host.current);
    // Development-only inspection for repeatable browser QA; absent in production builds.
    if (import.meta.env.DEV) window.__CAT_GAME__=game;
    const click=()=>bridge.audio.unlock();
    document.addEventListener('pointerdown',click);
    document.addEventListener('keydown',click);
    return ()=>{
      document.removeEventListener('pointerdown',click);document.removeEventListener('keydown',click);
      resize.disconnect();bridge.emit=()=>{};bridge.audio.destroy();game.destroy(true);
      if (import.meta.env.DEV) delete window.__CAT_GAME__;
    };
  },[]);
  useEffect(()=>{
    const key=e=>{if ((e.ctrlKey || e.metaKey) && ['+','=','-','_','0'].includes(e.key)) e.preventDefault();};
    const wheel=e=>{if (e.ctrlKey || e.metaKey) e.preventDefault();};
    const pinch=e=>{if (e.touches.length>1) e.preventDefault();};
    const gesture=e=>e.preventDefault();
    window.addEventListener('keydown',key,{capture:true});
    window.addEventListener('wheel',wheel,{passive:false});
    document.addEventListener('touchmove',pinch,{passive:false});
    document.addEventListener('gesturestart',gesture,{passive:false});
    document.addEventListener('gesturechange',gesture,{passive:false});
    return ()=>{
      window.removeEventListener('keydown',key,true);window.removeEventListener('wheel',wheel);
      document.removeEventListener('touchmove',pinch);document.removeEventListener('gesturestart',gesture);document.removeEventListener('gesturechange',gesture);
    };
  },[]);
  function persist(patch) {
    const bridge=bridgeRef.current;
    Object.assign(bridge.save,patch);bridge.audio.muted=bridge.save.muted;
    bridge.storageOK=writeSave(bridge.save);setStorageOK(bridge.storageOK);setSave({...bridge.save});
  }
  function start(index,run=newRun()) {
    const game=gameRef.current;
    if (!Number.isInteger(index) || index<0 || index>2 || index>=bridgeRef.current.save.unlocked) return;
    bridgeRef.current.audio.unlock();
    bridgeRef.current.touch={};
    game.scene.stop('Menu');game.scene.stop('Play');game.scene.start('Play',{index,run});
    document.activeElement?.blur();
  }
  const actions={
    start:index=>setView({screen:'intro',index}),
    begin:()=>start(view.index),
    menu:()=>{
      const game=gameRef.current;
      const scene=game.scene.getScene('Play');
      if (scene.run) scene.saveProgress(false);
      game.scene.stop('Play');game.scene.stop('Menu');game.scene.start('Menu');
    },
    pause:()=>{
      const scene=gameRef.current.scene.getScene('Play');
      if (view.screen!=='playing' || scene.finished) return;
      bridgeRef.current.touch={};scene.scene.pause();setView(v=>({...v,screen:'pause',toast:''}));
    },
    resume:()=>{
      const scene=gameRef.current.scene.getScene('Play');
      scene.input.keyboard.resetKeys();scene.player.jumpHeld=false;scene.player.buffer=-1000;
      scene.scene.resume();scene.publish();document.activeElement?.blur();
    },
    retry:dead=>{const scene=gameRef.current.scene.getScene('Play');start(scene.index,retryRun(scene.entry,dead));},
    next:()=>start(view.index+1,view.run),
    mute:()=>persist({muted:!bridgeRef.current.save.muted}),
    motion:()=>persist({reducedMotion:!bridgeRef.current.save.reducedMotion}),
  };
  actionsRef.current=actions;
  useEffect(()=>{
    const onKey=e=>{
      const key=e.key.toLowerCase();
      if (view.screen==='playing' && [' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key)) e.preventDefault();
      if (e.repeat || e.target instanceof HTMLInputElement) return;
      if (key==='m') actionsRef.current.mute();
      if (key==='escape' || key==='p') {
        if (view.screen==='playing') { e.preventDefault();actionsRef.current.pause(); }
        else if (view.screen==='pause') { e.preventDefault();actionsRef.current.resume(); }
      }
    };
    const onBlur=()=>{if (view.screen==='playing') actionsRef.current.pause();};
    const onVisibility=()=>{if (document.hidden) onBlur();};
    window.addEventListener('keydown',onKey);window.addEventListener('blur',onBlur);
    window.addEventListener('orientationchange',onBlur);document.addEventListener('visibilitychange',onVisibility);
    return ()=>{
      window.removeEventListener('keydown',onKey);window.removeEventListener('blur',onBlur);
      window.removeEventListener('orientationchange',onBlur);document.removeEventListener('visibilitychange',onVisibility);
    };
  },[view.screen]);
  const playing=['playing','pause','gameover','complete','victory'].includes(view.screen);
  return <main>
    <section className={`game-shell ${playing?'has-touch-controls':''}`} aria-label="Cat Adventure game">
      <div className="game-stage">
        <div ref={host} className="canvas-host" role="img" aria-label="Dunia platformer Mochi. Gunakan keyboard atau tombol sentuh; petunjuk tersedia pada menu Cara Bermain."/>
        {view.screen==='loading' && <div className="loading"><Icon name="leaf"/><p>Menyiapkan hutan...</p></div>}
        {view.screen==='menu' && <div className="main-menu">
          <div className="menu-copy"><p className="eyebrow"><span/> A COZY PIXEL ADVENTURE</p><h1><span>CAT</span> ADVENTURE</h1><p className="tagline">Kaki kecil. Petualangan besar.</p><p className="story">Tiga hutan, segenggam keberanian,<br/>dan satu jalan untuk pulang.</p>
            <div className="menu-buttons"><button className="primary play" onClick={()=>actions.start(0)}><span>Mulai Petualangan</span><span aria-hidden="true">▶</span></button><button onClick={()=>setView({screen:'levels'})}>Pilih Level <small>0{save.unlocked} / 03</small></button><div className="menu-secondary"><button onClick={()=>setView({screen:'help'})}>Cara Bermain</button><button onClick={()=>setView({screen:'settings'})}>Pengaturan</button></div></div>
          </div><div className="mochi-label"><span>INI MOCHI.</span><p>Kecil, penasaran,<br/>sedang mencari rumah.</p></div>
          <div className="menu-bottom"><span><Icon name="coin"/> HIGH SCORE <b>{String(save.highScore).padStart(5,'0')}</b></span><span>3 CHAPTERS · 1 LITTLE CAT</span></div>
        </div>}
        {playing && <HUD view={view} onPause={actions.pause}/>}
        {!playing && <button className="menu-sound" disabled={view.screen==='loading'} onClick={actions.mute} aria-label={save.muted?'Aktifkan suara':'Matikan suara'}>SUARA {save.muted?'OFF':'ON'}</button>}
        {view.screen==='playing' && view.toast && <div className="toast" role="status">{view.toast}</div>}
        {!storageOK && <p className="storage-warning" role="status">Penyimpanan browser tidak tersedia. Progres hanya bertahan selama sesi ini.</p>}
        <Overlays view={view} save={save} actions={actions}/>
      </div>
      {playing && <TouchControls bridgeRef={bridgeRef} active={view.screen==='playing'}/>}
    </section>
  </main>;
}
