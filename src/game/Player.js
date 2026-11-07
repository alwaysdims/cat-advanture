import { burst } from './scenery.js';

export class Player {
  constructor(scene, x, groundY) {
    this.scene=scene;
    this.sprite=scene.physics.add.sprite(x,groundY-23,'mochi').setDepth(6);
    this.sprite.body.setSize(23,31).setOffset(13,13);
    this.sprite.setMaxVelocity(178,620).setDragX(1350);
    this.keys=scene.input.keyboard.addKeys('A,D,W,SPACE,UP,LEFT,RIGHT',false);
    this.jumps=0; this.lastGround=-1000; this.buffer=-1000; this.grounded=false;
    this.jumpHeld=false; this.lockedUntil=0;
  }
  reset(x, groundY) {
    this.sprite.body.reset(x,groundY-23);
    this.sprite.setVelocity(0,0).setAccelerationX(0);
    this.jumps=0; this.lastGround=-1000; this.buffer=-1000; this.jumpHeld=false; this.grounded=false;
  }
  update(now) {
    const s=this.sprite, b=s.body, k=this.keys;
    const touch=this.scene.game.bridge.touch ?? {};
    const grounded=(b.blocked.down || b.touching.down) && b.velocity.y>=0;
    if (grounded) {
      this.lastGround=now;
      if (!this.grounded) burst(this.scene,s.x,b.bottom,0xffe9bb,4);
      this.jumps=0;
    }
    const jump=k.SPACE.isDown || k.W.isDown || k.UP.isDown || touch.jump;
    if (jump && !this.jumpHeld) this.buffer=now;
    if (!jump && this.jumpHeld && b.velocity.y < -140) s.setVelocityY(b.velocity.y * 0.52);
    this.jumpHeld=jump;
    if (now >= this.lockedUntil) {
      const direction=Number(k.D.isDown || k.RIGHT.isDown || !!touch.right)-Number(k.A.isDown || k.LEFT.isDown || !!touch.left);
      s.setAccelerationX(direction*1300);
      if (direction) s.setFlipX(direction<0);
      if (now-this.buffer<=120) {
        const first=grounded || (this.jumps===0 && now-this.lastGround<=105);
        // Walking off a ledge spends the ground jump; only one air jump remains.
        if (first || this.jumps<2) {
          this.jumps=first?1:2;
          s.setVelocityY(first?-355:-330);
          this.buffer=-1000; this.lastGround=-1000;
          this.scene.game.bridge.audio.play(first?'jump':'double');
          burst(this.scene,s.x,b.bottom,first?0xffefb8:0xa4ddf4,first?5:10);
        }
      }
    }
    if (s.x<18) { s.x=18; s.setVelocityX(Math.max(0,b.velocity.x)); }
    if (s.x>this.scene.level.width-18) { s.x=this.scene.level.width-18; s.setVelocityX(Math.min(0,b.velocity.x)); }
    const animation=now<this.lockedUntil?'hurt':!grounded?(b.velocity.y<0?'jump':'fall'):Math.abs(b.velocity.x)>14?'run':'idle';
    s.play(animation,true);
    this.grounded=grounded;
  }
}
