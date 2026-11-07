export function makeEnemies(scene, configs) {
  const group=scene.physics.add.group({allowGravity:false,immovable:true});
  for (const config of configs) {
    const enemy=group.create(config.left,config.y,config.type).play(config.type).setDepth(5);
    enemy.body.setSize(config.type==='hedgehog'?26:24,config.type==='hedgehog'?17:18).setOffset(config.type==='hedgehog'?3:4,config.type==='hedgehog'?12:9);
    enemy.patrol={...config,direction:1};
  }
  return group;
}
export function updateEnemies(group, time) {
  for (const enemy of group.getChildren()) {
    const p=enemy.patrol;
    if (enemy.x>=p.right) p.direction=-1;
    else if (enemy.x<=p.left) p.direction=1;
    enemy.setVelocityX(p.speed*p.direction).setFlipX(p.direction>0);
    if (p.type!=='hedgehog') {
      const amplitude=p.type==='crow'?30:16;
      // Anchor the wave to its authored height; velocity integration drifts with initial phase.
      enemy.setY(p.y+Math.sin(time/(p.type==='crow'?380:600)+p.left)*amplitude);
      enemy.setVelocityY(0);
    }
  }
}
