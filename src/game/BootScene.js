import Phaser from 'phaser';
import { loadAssets, makeAnimations } from './assets';
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    this.failed=false;
    this.load.on('loaderror',file=>{
      this.failed=true;
      this.game.bridge.emit({screen:'error',error:`Aset gagal dimuat: ${file.key}. Muat ulang halaman.`});
    });
    loadAssets(this);
  }
  create() { if (!this.failed) { makeAnimations(this); this.scene.start('Menu'); } }
}
