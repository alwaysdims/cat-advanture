import Phaser from 'phaser';
import { scenery } from './scenery';
export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    scenery(this,'forest',800,true);
    this.add.tileSprite(0,314,640,46,'ground-forest').setOrigin(0);
    this.add.rectangle(0,330,640,30,0xb57671).setOrigin(0);
    for (let x=8;x<640;x+=27) this.add.rectangle(x,338+x%17,4,3,0x80566b);
    this.add.image(567,316,'tree-forest').setOrigin(0.5,1).setScale(1.4).setDepth(-5);
    this.add.image(435,316,'bush-forest').setOrigin(0.5,1).setDepth(2);
    this.add.image(610,319,'bush-forest').setOrigin(0.5,1).setDepth(2);
    this.add.image(401,315,'mushroom-forest').setOrigin(0.5,1).setScale(0.55);
    this.add.sprite(500,266,'mochi').setScale(2.5).setDepth(5).play('idle');
    const fish=this.add.image(550,205,'fish').setScale(1.35).setDepth(4);
    if (!this.game.bridge.save.reducedMotion) this.tweens.add({targets:fish,y:195,duration:1300,yoyo:true,repeat:-1});
    this.add.image(585,314,'sign').setOrigin(0.5,1).setScale(0.8).setDepth(4);
    this.game.bridge.emit({screen:'menu'});
  }
}
