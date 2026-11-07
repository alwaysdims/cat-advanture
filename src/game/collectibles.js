import { collect } from './state';
import { burst } from './scenery';
export function makeCollectibles(scene) {
  const group=scene.physics.add.staticGroup();
  for (const kind of ['fish','coin']) for (const [x,y] of scene.level[kind==='fish'?'fish':'coins']) {
    const item=group.create(x,y,kind).setDepth(4);
    item.kind=kind;
    item.body.setSize(kind==='fish'?23:20,22);
    if (!scene.game.bridge.save.reducedMotion) scene.tweens.add({targets:item,y:y-4,duration:850,yoyo:true,repeat:-1,delay:x%350});
  }
  scene.physics.add.overlap(scene.player.sprite,group,(_,item)=>{
    if (scene.finished || !item.active) return;
    collect(scene.run,item.kind);
    if (item.kind==='fish') scene.fish++;
    else scene.coins++;
    scene.game.bridge.audio.play(item.kind);
    burst(scene,item.x,item.y,item.kind==='fish'?0xbceeff:0xffd270,9);
    scene.tweens.killTweensOf(item);
    item.disableBody(true,true);
    scene.publish();
  });
  return group;
}
