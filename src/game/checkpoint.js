import { burst } from './scenery';
export function makeCheckpoint(scene) {
  const [x,y]=scene.level.checkpoint;
  const flag=scene.add.image(x,y,'flag').setOrigin(0.25,1).setDepth(3);
  return {
    active:false,
    update() {
      if (!this.active && Math.abs(scene.player.sprite.x-x)<28 && Math.abs(scene.player.sprite.body.bottom-y)<40) {
        this.active=true; flag.setTexture('flag-on'); scene.spawn=[x,y];
        scene.game.bridge.audio.play('checkpoint'); burst(scene,x+10,y-42,0xffdf85,14);
        scene.notify('Checkpoint aktif. Tempat aman untuk kembali.');
      }
    },
  };
}
