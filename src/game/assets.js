const THEMES = ['forest','mushroom','sunset'];
export function loadAssets(scene) {
  for (const name of ['fish','coin','heart','moving','spikes','flag','flag-on','sign','gate','home','lantern','leaf','spark']) {
    scene.load.image(name, `assets/${name}.png`);
  }
  for (const theme of THEMES) for (const name of ['ground','tree','bush','mushroom','sky','far','near']) {
    scene.load.image(`${name}-${theme}`, `assets/${name}-${theme}.png`);
  }
  scene.load.spritesheet('mochi','assets/mochi.png',{frameWidth:48,frameHeight:48});
  for (const name of ['hedgehog','bat','crow']) scene.load.spritesheet(name,`assets/${name}.png`,{frameWidth:32,frameHeight:32});
}
export function makeAnimations(scene) {
  const animations = [['idle',0,3,4],['run',4,9,12],['jump',10,10,1],['fall',11,11,1],['hurt',12,12,1],['victory',13,15,6]];
  for (const [key,start,end,frameRate] of animations) scene.anims.create({key,frames:scene.anims.generateFrameNumbers('mochi',{start,end}),frameRate,repeat:-1});
  for (const key of ['hedgehog','bat','crow']) scene.anims.create({key,frames:scene.anims.generateFrameNumbers(key,{start:0,end:3}),frameRate:key==='hedgehog'?6:9,repeat:-1});
}
