export function groundAt(ground, x, halfWidth = 0) {
  return ground.find(([left,,width]) => x-halfWidth>=left && x+halfWidth<=left+width);
}

export function scenery(scene, theme, width, menu = false, ground = [[0,314,width]]) {
  scene.add.image(0,0,`sky-${theme}`).setOrigin(0).setScrollFactor(0).setDepth(-40);
  scene.parallax = [
    scene.add.tileSprite(0,0,640,360,`far-${theme}`).setOrigin(0).setScrollFactor(0).setDepth(-30),
    scene.add.tileSprite(0,0,640,360,`near-${theme}`).setOrigin(0).setScrollFactor(0).setDepth(-20),
  ];
  for (let x=60; x<width; x+=235) {
    const scale = 0.8 + (x%3)*0.12;
    const treeGround=groundAt(ground,x,72*scale);
    if (treeGround) scene.add.image(x,treeGround[1],`tree-${theme}`).setOrigin(0.5,1).setScale(scale).setDepth(-15).setAlpha(0.85);
    const mushroomScale=1+(x%4)*0.1;
    const mushroomGround=groundAt(ground,x+105,48*mushroomScale);
    if (theme === 'mushroom' && mushroomGround) scene.add.image(x+105,mushroomGround[1],`mushroom-${theme}`).setOrigin(0.5,98/104).setScale(mushroomScale).setDepth(-10);
  }
  if (!scene.game.bridge.save.reducedMotion) {
    scene.add.particles(0,0,theme==='mushroom'?'spark':'leaf',{
      x:{min:0,max:640},y:-10,quantity:1,frequency:menu?400:700,
      lifespan:10000,speedX:{min:-12,max:-5},speedY:{min:20,max:35},
      rotate:{min:0,max:160},scale:theme==='mushroom'?{start:0.8,end:0.2}:1,
      alpha:{start:0.8,end:0.15},
    }).setScrollFactor(0).setDepth(12);
  }
}
export function terrain(scene, level) {
  const solids=scene.physics.add.staticGroup();
  for (const [x,y,w] of level.ground) {
    const ground = scene.add.tileSprite(x,y,w,360-y+32,`ground-${level.theme}`).setOrigin(0);
    solids.add(ground);
    // Grass is not repeated down the soil: a separate dark body covers the lower tile seams.
    scene.add.rectangle(x,y+16,w,360-y+16,level.theme==='forest'?0xb57671:level.theme==='mushroom'?0x82617d:0x97607c).setOrigin(0).setDepth(1);
    for (let dx=8; dx<w; dx+=27) {
      scene.add.rectangle(x+dx,y+25+(dx%23),4,3,0x80566b).setDepth(2);
      if (dx%3===0 && dx>=18 && dx<=w-18) scene.add.image(x+dx,y,`bush-${level.theme}`).setScale(0.45).setOrigin(0.5,1).setDepth(-1);
    }
  }
  for (const [x,y,w] of level.platforms) {
    const platform = scene.add.tileSprite(x,y,w,18,`ground-${level.theme}`).setOrigin(0);
    solids.add(platform);
  }
  return solids;
}
export function burst(scene, x, y, tint = 0xffefb8, count = 7) {
  if (scene.game.bridge.save.reducedMotion) return;
  const emitter = scene.add.particles(x,y,'spark',{
    speed:{min:25,max:85},angle:{min:200,max:340},gravityY:150,
    lifespan:450,scale:{start:1,end:0},tint,emitting:false,
  }).setDepth(15);
  emitter.explode(count);
  scene.time.delayedCall(550,()=>emitter.destroy());
}
