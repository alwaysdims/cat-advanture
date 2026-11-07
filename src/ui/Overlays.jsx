import { useEffect,useRef } from 'react';
import { LEVELS } from '../game/levels';
import { Icon } from './HUD';

function Dialog({children,onCancel,label,wide=false}) {
  const ref=useRef(null);
  useEffect(()=>{
    const node=ref.current;
    node.showModal();
    return ()=>node.close();
  },[label]);
  return <dialog ref={ref} aria-label={label} className={`panel ${wide?'wide':''}`} onCancel={e=>{e.preventDefault();onCancel?.();}}>
    {children}
  </dialog>;
}
function Stats({view,final=false}) {
  return <div className="stats">
    <div><small>TOTAL SCORE</small><strong>{String(view.run.score).padStart(5,'0')}</strong></div>
    <div className="stat-items"><span><Icon name="fish" />{final?view.run.fish:view.fish} ikan</span><span><Icon name="coin" />{final?view.run.coins:view.coins} koin</span><span><Icon name="heart" />{view.run.hearts} hati</span></div>
  </div>;
}
export default function Overlays({view,save,actions}) {
  const screen=view.screen;
  if (['loading','playing','menu'].includes(screen)) return null;
  if (screen==='levels') return <Dialog label="Pilih Level" wide onCancel={actions.menu}>
    <p className="eyebrow">PETA PERJALANAN</p><h2>Tiga tempat. Satu rumah.</h2><p className="panel-intro">Setiap langkah membawa Mochi lebih dekat.</p>
    <div className="level-cards">{LEVELS.map((level,i)=>{
      const unlocked=i<save.unlocked;
      return <button key={level.name} disabled={!unlocked} onClick={()=>actions.start(i)} className={`level-card theme-${level.theme}`}>
        <div className="level-art"><img src={`assets/sky-${level.theme}.png`} alt=""/><img src={`assets/near-${level.theme}.png`} alt=""/><img src={`assets/${i===1?'mushroom-mushroom':i===2?'home':'tree-forest'}.png`} alt="" className="landmark"/><span>0{i+1}</span></div>
        <span className="card-body"><strong>{level.name}</strong><small>{i===0?'AWAL PETUALANGAN':i===1?'SEDIKIT TANTANGAN':'JALAN PULANG'}</small><span>{unlocked?`${level.target} ikan / Mainkan`:`Terkunci / Selesaikan Level ${i}`}</span></span>
      </button>;
    })}</div><button className="text-button" onClick={actions.menu}>Kembali ke Menu</button>
  </Dialog>;
  if (screen==='help' || screen==='intro') return <Dialog label={screen==='intro'?'Sebelum Bermain':'Cara Bermain'} onCancel={actions.menu}>
    <p className="eyebrow">BUKU SAKU PETUALANG</p><h2>{screen==='intro'?'Sebelum Berpetualang':'Cara Bermain'}</h2>
    {screen==='intro' && <p className="panel-intro">{LEVELS[view.index].name} / Kumpulkan {LEVELS[view.index].target} ikan untuk membuka {view.index===2?'rumah Mochi':'gerbang'}.</p>}
    <div className="control-list">
      <p><span><kbd>A</kbd> <kbd>D</kbd> / <kbd>←</kbd> <kbd>→</kbd></span><b>Bergerak</b></p>
      <p><span><kbd>SPACE</kbd> / <kbd>W</kbd> / <kbd>↑</kbd></span><b>Lompat</b></p>
      <p><span><kbd>SPACE</kbd> lagi di udara</span><b>Double jump</b></p>
      <p><span><kbd>ESC</kbd> / <kbd>P</kbd></span><b>Pause</b></p>
      <p><span><kbd>M</kbd></span><b>Suara on/off</b></p>
    </div>
    <p className="tip">Ponsel / tablet: tahan KIRI atau KANAN, lalu tekan LOMPAT dengan jari lain. Lepas dan tekan LOMPAT lagi untuk double jump. Tombol II menjeda permainan.</p>
    <p className="tip"><Icon name="fish" />Kumpulkan ikan untuk membuka gerbang. Koin memberi bonus. Sentuh bendera untuk menyimpan tempat respawn.</p>
    <p className="fine-print">Tahan tombol lompat untuk lebih tinggi. Hindari musuh dan duri; lima hati untuk perjalanan ini. Tampilan mendatar memberi ruang pandang lebih besar di ponsel.</p>
    <button className="primary" onClick={screen==='intro'?actions.begin:actions.menu}>{screen==='intro'?'Mulai Bermain':'Siap Berpetualang'}</button>
    {screen==='intro' && <button className="text-button" onClick={actions.menu}>Kembali ke Menu</button>}
  </Dialog>;
  if (screen==='settings') return <Dialog label="Pengaturan" onCancel={actions.menu}>
    <p className="eyebrow">SESUAI SELERAMU</p><h2>Pengaturan</h2>
    <label className="setting"><span><b>Efek suara</b><small>Nada kecil untuk setiap langkah.</small></span><input type="checkbox" checked={!save.muted} onChange={actions.mute}/></label>
    <label className="setting"><span><b>Kurangi efek gerak</b><small>Matikan partikel, goyangan, dan item mengambang.</small></span><input type="checkbox" checked={save.reducedMotion} onChange={actions.motion}/></label>
    <p className="fine-print">Pengaturan tersimpan di browser ini. Efek gerak diterapkan saat masuk menu atau level berikutnya.</p>
    <button className="primary" onClick={actions.menu}>Simpan & Kembali</button>
  </Dialog>;
  if (screen==='pause') return <Dialog label="Permainan dijeda" onCancel={actions.resume}>
    <Icon name="leaf" className="panel-leaf"/><p className="eyebrow">TARIK NAPAS SEJENAK</p><h2>Istirahat dulu?</h2><p className="panel-intro">Hutannya masih di sini.</p>
    <div className="button-stack"><button className="primary" onClick={actions.resume}>Lanjutkan</button><button onClick={()=>actions.retry(false)}>Ulangi Level</button><button onClick={actions.mute}>Suara: {save.muted?'Off':'On'}</button><button className="text-button" onClick={actions.menu}>Main Menu</button></div>
    <p className="fine-print">Ulangi Level mengembalikan skor, koleksi, dan hati ke awal level.</p>
  </Dialog>;
  if (screen==='gameover') return <Dialog label="Game Over">
    <Icon name="mochi-idle" className="portrait"/><p className="eyebrow">TAK APA, COBA LAGI</p><h2>Game Over</h2><p className="panel-intro">Setiap kucing punya keberanian untuk kembali.</p><Stats view={view}/>
    <div className="button-stack"><button className="primary" onClick={()=>actions.retry(true)}>Retry / Coba Lagi</button><button onClick={()=>actions.start(0)}>Permainan Baru</button><button className="text-button" onClick={actions.menu}>Main Menu</button></div><p className="fine-print">Retry: lima hati baru, skor kembali ke awal level.</p>
  </Dialog>;
  if (screen==='complete') return <Dialog label="Level Completed">
    <Icon name="flag-on" className="flag-portrait"/><p className="eyebrow">SATU LANGKAH LEBIH DEKAT</p><h2>Level Completed!</h2><p className="panel-intro">{LEVELS[view.index].name} selesai. Bonus +100!</p><Stats view={view}/>
    <button className="primary" onClick={actions.next}>Next Level / Lanjutkan</button><button className="text-button" onClick={actions.menu}>Main Menu</button>
  </Dialog>;
  if (screen==='victory') return <Dialog label="Mochi Finally Found His Way Home!">
    <img src="assets/home.png" alt="Rumah hangat Mochi" className="home-portrait"/><p className="eyebrow">AKHIR PERJALANAN, AWAL CERITA</p><h2>Mochi Finally Found His Way Home!</h2><p className="panel-intro">Rumah terasa lebih hangat setelah petualangan panjang.</p><Stats view={view} final/>
    <p className="record">HIGH SCORE {String(save.highScore).padStart(5,'0')} <span>Bonus hati +{view.run.hearts*20} sudah termasuk</span></p>
    <div className="button-stack"><button className="primary" onClick={()=>actions.start(0)}>Main Lagi</button><button className="text-button" onClick={actions.menu}>Main Menu</button></div>
  </Dialog>;
  return <Dialog label="Kesalahan"><h2>Hutan belum siap</h2><p>{view.error}</p><button onClick={()=>window.location.reload()}>Muat Ulang</button></Dialog>;
}
