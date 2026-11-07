import Phaser from 'phaser';
import { LEVELS } from './levels';
import { Player } from './Player';
import { scenery, terrain, burst, groundAt } from './scenery';
import { makeEnemies, updateEnemies } from './enemies';
import { makeCollectibles } from './collectibles';
import { makeCheckpoint } from './checkpoint';
import { completeLevel } from './state';
import { writeSave } from './save';

export class PlayScene extends Phaser.Scene {
  constructor() { super('Play'); }
  init({index=0,run}) {
    this.index=index; this.level=LEVELS[index]; this.run={...run}; this.entry={...run};
    this.spawn=[...this.level.spawn]; this.fish=0; this.coins=0; this.finished=false;
    this.invincibleUntil=0; this.toast=''; this.toastUntil=0; this.activeTime=0;
  }
  create() {
    const l=this.level;
    scenery(this,l.theme,l.width,false,l.ground);
    this.solids=terrain(this,l);
    this.player=new Player(this,...this.spawn);
    this.physics.add.collider(this.player.sprite,this.solids);
    this.moving=this.physics.add.group({allowGravity:false,immovable:true});
    for (const config of l.moving) {
      const p=this.moving.create(config.x,config.y,'moving').setOrigin(0,0).setDisplaySize(config.width,16).setDepth(3);
      p.body.setSize(96,12).setOffset(0,0);
      p.body.friction.set(1,0);
      p.motion={...config,direction:1};
    }
    this.physics.add.collider(this.player.sprite,this.moving);
    this.enemies=makeEnemies(this,l.enemies);
    this.physics.add.overlap(this.player.sprite,this.enemies,()=>this.damage('enemy'));
    this.hazards=this.physics.add.staticGroup();
    for (const [x,y,w] of l.spikes) {
      const hazard=this.add.tileSprite(x,y-14,w,14,'spikes').setOrigin(0).setDepth(3);
      this.hazards.add(hazard);hazard.body.setSize(w-4,10).setOffset(2,4);
    }
    this.physics.add.overlap(this.player.sprite,this.hazards,()=>this.damage('spike'));
    this.items=makeCollectibles(this);
    this.checkpoint=makeCheckpoint(this);
    for (const [x,y,label] of l.signs) {
      this.add.image(x,y,'sign').setOrigin(0.5,1).setScale(0.7).setDepth(1);
      this.add.text(x,y-51,label,{fontFamily:'Pixelify Sans',fontSize:'9px',color:'#563a45',backgroundColor:'#fff3da',padding:{x:5,y:3}}).setOrigin(0.5).setDepth(2);
    }
    const [ex,ey]=l.exit;
    this.add.image(ex,ey,this.index===2?'home':'gate').setOrigin(0.5,1).setDepth(2);
    this.exitLabel=this.add.text(ex,ey-(this.index===2?140:95),`${l.target} IKAN UNTUK PULANG`,{fontFamily:'Pixelify Sans',fontSize:'10px',color:'#563a45',backgroundColor:'#fff3da',padding:{x:7,y:4}}).setOrigin(0.5).setDepth(3);
    if (this.index===2) for (let x=2300;x<l.width;x+=400) {
      const ground=groundAt(l.ground,x,16);
      if (ground) this.add.image(x,ground[1],'lantern').setOrigin(0.5,1).setDepth(2);
    }
    this.cameras.main.setBounds(0,0,l.width,360).startFollow(this.player.sprite,true,0.12,0.12).setFollowOffset(-65,0).setRoundPixels(true);
    this.cameras.main.fadeIn(350,255,243,218);
    this.notify(`${l.name}  /  Kumpulkan ${l.target} ikan, lalu temukan ${this.index===2?'rumah':'gerbang'}.`,4000);
    this.publish();
  }
  notify(message,duration=2600) { this.toast=message; this.toastUntil=this.activeTime+duration; this.publish(); }
  publish(screen='playing') {
    this.game.bridge.emit({screen,index:this.index,run:{...this.run},fish:this.fish,coins:this.coins,target:this.level.target,toast:this.toast,checkpoint:this.checkpoint?.active??false});
  }
  damage(kind) {
    const now=this.activeTime;
    if (this.finished) return;
    if (now<this.invincibleUntil) {
      if (kind==='fall') this.player.reset(...this.spawn);
      return;
    }
    this.run.hearts--; this.invincibleUntil=now+1500;
    this.game.bridge.audio.play('damage');
    if (!this.game.bridge.save.reducedMotion) this.cameras.main.shake(130,0.004);
    if (this.run.hearts<=0) {
      this.finished=true; this.player.sprite.setVelocity(0).play('hurt');
      this.physics.pause();this.game.bridge.audio.play('gameover');
      this.saveProgress(false);this.publish('gameover');return;
    }
    // Respawn on solid, hazard-free ground. Inventory stays collected; no item farming.
    this.player.reset(...this.spawn); this.player.lockedUntil=now+220;
    this.notify(kind==='fall'?'Ups! Kembali ke tempat aman.':'Aduh! Hati berkurang satu.');
  }
  saveProgress(completed) {
    const bridge=this.game.bridge;
    bridge.save.highScore=Math.max(bridge.save.highScore,this.run.score);
    if (completed) bridge.save.unlocked=Math.max(bridge.save.unlocked,Math.min(3,this.index+2));
    bridge.storageOK=writeSave(bridge.save);
  }
  finish() {
    if (this.finished) return;
    this.finished=true;
    this.player.sprite.setVelocity(0).setAcceleration(0).setAlpha(1).play('victory');
    this.physics.pause(); completeLevel(this.run,this.index===2);this.saveProgress(true);
    this.game.bridge.audio.play(this.index===2?'victory':'complete');
    burst(this,this.player.sprite.x,this.player.sprite.y,0xffd270,20);
    this.time.delayedCall(950,()=>this.publish(this.index===2?'victory':'complete'));
  }
  update(_time,delta) {
    if (this.finished) return;
    // Only active scene updates spend gameplay time; pause preserves immunity and flight phase.
    const time=this.activeTime+=delta;
    this.player.update(time);
    updateEnemies(this.enemies,time);
    for (const p of this.moving.getChildren()) {
      const m=p.motion;
      if (p.x>=m.right) m.direction=-1;
      if (p.x<=m.left) m.direction=1;
      p.setVelocityX(m.direction*m.speed);
    }
    const s=this.player.sprite;
    s.setAlpha(time<this.invincibleUntil && Math.floor(time/90)%2===0?0.35:1);
    if (s.y>395) {
      this.damage('fall');
      if (this.finished) return;
    }
    this.checkpoint.update();
    this.parallax[0].tilePositionX=this.cameras.main.scrollX*0.18;
    this.parallax[1].tilePositionX=this.cameras.main.scrollX*0.42;
    this.exitLabel.setText(this.fish>=this.level.target?'SELAMAT DATANG, MOCHI!':`${Math.max(0,this.level.target-this.fish)} IKAN LAGI`);
    if (Math.abs(s.x-this.level.exit[0])<38 && Math.abs(s.body.bottom-this.level.exit[1])<45) {
      if (this.fish>=this.level.target) this.finish();
      else if (time>this.toastUntil) this.notify(`Butuh ${this.level.target-this.fish} ikan lagi. Jelajahi jalan di belakangmu!`);
    }
    if (this.toast && time>this.toastUntil) { this.toast='';this.publish(); }
  }
}
