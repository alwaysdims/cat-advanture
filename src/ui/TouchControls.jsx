import { useEffect,useRef } from 'react';

export default function TouchControls({bridgeRef,active}) {
  const pointers=useRef(new Map());
  function sync() {
    const held=new Set(pointers.current.values());
    if (bridgeRef.current) bridgeRef.current.touch={left:held.has('left'),right:held.has('right'),jump:held.has('jump')};
  }
  function clear() { pointers.current.clear();sync(); }
  useEffect(()=>{
    clear();
    window.addEventListener('blur',clear);
    window.addEventListener('resize',clear);
    return ()=>{clear();window.removeEventListener('blur',clear);window.removeEventListener('resize',clear);};
  },[active]);
  function press(e,action) {
    if (!active || e.button!==0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId,action);sync();
  }
  function release(e) { pointers.current.delete(e.pointerId);sync(); }
  function button(action,label,text) {
    return <button type="button" aria-label={label} disabled={!active}
      onPointerDown={e=>press(e,action)} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
      onKeyDown={e=>{if (active && [' ','Enter'].includes(e.key)) {e.preventDefault();pointers.current.set(`key-${action}`,action);sync();}}}
      onKeyUp={e=>{if ([' ','Enter'].includes(e.key)) {e.preventDefault();pointers.current.delete(`key-${action}`);sync();}}}
      onBlur={()=>{pointers.current.delete(`key-${action}`);sync();}}
      onContextMenu={e=>e.preventDefault()}>{text}</button>;
  }
  return <nav className="touch-controls" aria-label="Kontrol sentuh">
    <div className="touch-directions">{button('left','Bergerak ke kiri','KIRI')}{button('right','Bergerak ke kanan','KANAN')}</div>
    <span className="touch-hint">Ketuk lagi<br/>untuk double jump</span>
    {button('jump','Lompat','LOMPAT')}
  </nav>;
}
