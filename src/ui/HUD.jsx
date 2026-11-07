export function Icon({name, ...props}) { return <img src={`assets/${name}.png`} alt="" {...props} />; }
export function HUD({view,onPause}) {
  return <div className="hud">
    <div className="hearts" aria-label={`${view.run.hearts} dari 5 hati`}>
      {Array.from({length:5},(_,i)=><Icon key={i} name="heart" className={i<view.run.hearts?'':'empty'} />)}
      <span>MOCHI</span>
    </div>
    <div className="level-label"><span>CHAPTER 0{view.index+1}</span><strong>{['Lost Forest','Mushroom Valley','Way Back Home'][view.index]}</strong></div>
    <div className="counters">
      <span className="score">SCORE <b>{String(view.run.score).padStart(5,'0')}</b></span>
      <span><Icon name="fish" /><b>{view.fish}/{view.target}</b><Icon name="coin" /><b>{view.coins}</b></span>
    </div>
    <button className="pause-button" onClick={onPause} onPointerUp={e=>{if (e.pointerType==='touch') onPause();}} aria-label="Pause permainan">II</button>
  </div>;
}
