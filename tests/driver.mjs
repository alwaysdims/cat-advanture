import assert from 'node:assert/strict';
export async function state(page) {
  return page.evaluate(()=>{
    const s=window.__CAT_GAME__.scene.getScene('Play'),p=s.player,b=p.sprite.body;
    return {x:p.sprite.x,y:p.sprite.y,vx:b.velocity.x,vy:b.velocity.y,ground:b.blocked.down||b.touching.down,jumps:p.jumps,
      fish:s.fish,coins:s.coins,score:s.run.score,hearts:s.run.hearts,finished:s.finished,index:s.index,checkpoint:s.checkpoint.active,
      moving:s.moving.getChildren().map(p=>({x:p.x,y:p.y,width:p.displayWidth,vx:p.body.velocity.x})),
      enemies:s.enemies.getChildren().map(e=>({x:e.x,y:e.y,type:e.patrol.type}))};
  });
}
export async function move(page,x) {
  const before=await state(page), key=before.x<x?'d':'a';
  await page.keyboard.down(key);
  try {
    await page.waitForFunction(({x,key,hearts})=>{
      const s=window.__CAT_GAME__.scene.getScene('Play');
      if(s.run.hearts!==hearts) throw Error(`Damage moving to ${x}`);
      return s.finished || (key==='d'?s.player.sprite.x>=x:s.player.sprite.x<=x);
    },{x,key,hearts:before.hearts},{polling:'raf',timeout:8000});
  } finally { await page.keyboard.up(key); }
  await page.waitForTimeout(150);
  assert.equal((await state(page)).hearts,before.hearts,`Damage braking at ${x}`);
}
export async function jump(page,x,{double=true,delay=280}={}) {
  const before=await state(page),key=before.x<x?'d':'a';
  await page.keyboard.down(key);await page.keyboard.down('Space');
  try {
    if(double){await page.waitForTimeout(delay);await page.keyboard.up('Space');await page.waitForTimeout(50);await page.keyboard.down('Space');}
    await page.waitForFunction(({x,key,hearts,start})=>{
      const s=window.__CAT_GAME__.scene.getScene('Play');
      if(s.run.hearts!==hearts) throw Error(`Damage jumping to ${x} from ${JSON.stringify(start)}`);
      return s.finished || (key==='d'?s.player.sprite.x>=x:s.player.sprite.x<=x);
    },{x,key,hearts:before.hearts,start:{x:before.x,y:before.y}},{polling:'raf',timeout:5000});
  } finally {await page.keyboard.up(key);await page.keyboard.up('Space');}
  // Let the released jump buffer expire before checking a settled landing.
  await page.waitForTimeout(150);
  await page.waitForFunction(()=>{const s=window.__CAT_GAME__.scene.getScene('Play'),b=s.player.sprite.body;return s.finished||((b.blocked.down||b.touching.down)&&b.velocity.y===0);},{},{timeout:2500});
  assert.equal((await state(page)).hearts,before.hearts,`Damage landing at ${x}`);
}
export async function level1(page) {
  await move(page,265);await jump(page,390);await move(page,530);await jump(page,710);
  await move(page,750);await jump(page,950);await jump(page,1170);await jump(page,1390);
  await move(page,1500);await jump(page,1620);await jump(page,1840);
  await move(page,1870);await jump(page,2080);await move(page,2150);await jump(page,2290);await jump(page,2490);await move(page,2600);
}
export async function level2(page) {
  await move(page,230);await jump(page,340);await move(page,460);await jump(page,650);
  await jump(page,790);await jump(page,1000);await move(page,1138);
  await page.waitForFunction(()=>{const p=window.__CAT_GAME__.scene.getScene('Play').moving.getChildren()[0];return p.x<1240 && p.body.velocity.x>0;});
  await jump(page,1310);
  await page.waitForFunction(()=>window.__CAT_GAME__.scene.getScene('Play').player.sprite.x>1390);
  await jump(page,1535);await move(page,1770);
  await jump(page,1910);
  await page.waitForFunction(()=>{const e=window.__CAT_GAME__.scene.getScene('Play').enemies.getChildren()[2];return e.x<1840 && e.body.velocity.x<0;});
  await jump(page,2070,{double:false});await jump(page,2250);
  await jump(page,2410);await jump(page,2650);await move(page,2700);await jump(page,2890);
  await move(page,3000);await move(page,3270);
}
export async function level3(page) {
  await move(page,230);await jump(page,320);await move(page,440);await jump(page,650);
  await jump(page,790);
  await page.waitForFunction(()=>{const e=window.__CAT_GAME__.scene.getScene('Play').enemies.getChildren().find(e=>e.patrol.type==='crow');return e.x>1125 && e.body.velocity.x>0;});
  await jump(page,1020);await move(page,1115);
  await page.waitForFunction(()=>{const p=window.__CAT_GAME__.scene.getScene('Play').moving.getChildren()[0];return p.x<1210 && p.body.velocity.x>0;});
  await jump(page,1290);
  await page.waitForFunction(()=>window.__CAT_GAME__.scene.getScene('Play').player.sprite.x>1390);
  await jump(page,1520);await move(page,1710);await jump(page,1840,{double:false});await move(page,1940);await jump(page,2070);
  await move(page,2180);await jump(page,2310);await jump(page,2525);await jump(page,2790);
  await move(page,2968);await jump(page,3100,{double:false});await move(page,3195);await jump(page,3390);
  await jump(page,3540);await move(page,3568);
  await page.waitForFunction(()=>{const e=window.__CAT_GAME__.scene.getScene('Play').enemies.getChildren().at(-1);return e.x>3810 && e.body.velocity.x>0;});
  await jump(page,3730,{double:false});await move(page,3900);await move(page,4000);
}
