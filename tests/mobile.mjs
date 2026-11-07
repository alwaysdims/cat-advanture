import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';

const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
const page=await context.newPage(),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if (['error','warning'].includes(m.type())) errors.push(m.text());});
await mkdir('test-results',{recursive:true});
const state=()=>page.evaluate(()=>{const p=window.__CAT_GAME__.scene.getScene('Play').player;return {x:p.sprite.x,y:p.sprite.y,jumps:p.jumps,vy:p.sprite.body.velocity.y,touch:window.__CAT_GAME__.bridge.touch};});
async function fit() {
  const sizes=await page.evaluate(()=>{
    const canvas=document.querySelector('canvas').getBoundingClientRect();
    const controls=document.querySelector('.touch-controls').getBoundingClientRect();
    return {ratio:canvas.width/canvas.height,inside:canvas.left>=-1 && canvas.right<=innerWidth+1 && canvas.top>=-1 && canvas.bottom<=controls.top+1,overflow:document.documentElement.scrollWidth>innerWidth,
      buttons:[...document.querySelectorAll('.touch-controls button,.pause-button')].map(b=>{const r=b.getBoundingClientRect();return {w:r.width,h:r.height,inside:r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<=innerHeight};})};
  });
  assert.ok(Math.abs(sizes.ratio-16/9)<0.01);assert.ok(sizes.inside);assert.equal(sizes.overflow,false);
  for (const b of sizes.buttons) {assert.ok(b.w>=44 && b.h>=44);assert.ok(b.inside);}
}
async function pinch(cdp) {
  const points=spread=>[{x:422-spread,y:170,id:10},{x:422+spread,y:170,id:11}];
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(30)});
  for (const spread of [45,60,85,115,150,180]) {
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(spread)});
    await page.waitForTimeout(40);
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForTimeout(200);
}
try {
  await page.goto('http://127.0.0.1:5173/');
  await page.getByRole('button',{name:'Mulai Petualangan'}).waitFor();
  await page.screenshot({path:'test-results/mobile-menu.png'});
  await page.getByRole('button',{name:'Mulai Petualangan'}).tap();
  await page.getByRole('button',{name:'Mulai Bermain',exact:true}).tap();
  await page.waitForFunction(()=>window.__CAT_GAME__.scene.getScene('Play').player?.sprite.body.blocked.down);
  for (const [width,height] of [[320,568],[390,844],[844,390],[667,375],[768,1024],[1024,768]]) {
    await page.setViewportSize({width,height});await page.waitForTimeout(250);
    if (await page.getByRole('button',{name:'Lanjutkan',exact:true}).isVisible()) await page.getByRole('button',{name:'Lanjutkan',exact:true}).tap();
    await fit();
    await page.screenshot({path:`test-results/mobile-${width}x${height}.png`});
    checks.push(`Canvas 16:9, no overlap/overflow, touch targets >=44px: ${width}x${height}`);
  }
  await page.setViewportSize({width:844,height:390});await page.waitForTimeout(250);
  if (await page.getByRole('button',{name:'Lanjutkan',exact:true}).isVisible()) await page.getByRole('button',{name:'Lanjutkan',exact:true}).tap();
  const cdp=await context.newCDPSession(page);
  async function point(name,id) {const r=await page.getByRole('button',{name,exact:true}).boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2,id};}
  const right=await point('Bergerak ke kanan',1),jump=await point('Lompat',2);
  const touch=(type,touchPoints)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints});
  const before=await state();
  await touch('touchStart',[right]);await page.waitForTimeout(160);
  assert.ok((await state()).x>before.x+5);
  await touch('touchStart',[right,jump]);await page.waitForTimeout(100);
  const firstJump=await state();
  assert.equal(firstJump.jumps,1);assert.ok(firstJump.vy<0,JSON.stringify(firstJump));
  await touch('touchEnd',[jump]);await page.waitForTimeout(60);
  await touch('touchStart',[right,jump]);await page.waitForTimeout(80);
  const secondJump=await state();
  assert.equal(secondJump.jumps,2,JSON.stringify(secondJump));assert.ok(secondJump.vy<-150);
  await touch('touchEnd',[jump]);await page.waitForTimeout(60);
  await touch('touchStart',[right,jump]);await page.waitForTimeout(80);
  assert.equal((await state()).jumps,2);
  await touch('touchCancel',[]);await page.waitForTimeout(50);
  assert.deepEqual((await state()).touch,{left:false,right:false,jump:false});
  checks.push('Native CDP multitouch: hold right + jump + double jump, no third jump, touchcancel clears input');
  await touch('touchStart',[right]);await page.waitForTimeout(50);
  const pause=await point('Pause permainan',3);
  await touch('touchStart',[right,pause]);await touch('touchEnd',[pause]);
  await page.getByRole('dialog',{name:'Permainan dijeda'}).waitFor();
  await touch('touchEnd',[]);
  assert.ok(!Object.values((await state()).touch).some(Boolean));
  await page.getByRole('button',{name:'Lanjutkan',exact:true}).tap();await page.waitForTimeout(300);
  assert.ok(!Object.values((await state()).touch).some(Boolean));
  await page.evaluate(()=>window.dispatchEvent(new Event('orientationchange')));
  await page.getByRole('dialog',{name:'Permainan dijeda'}).waitFor();
  await page.getByRole('button',{name:'Lanjutkan',exact:true}).tap();
  checks.push('Pause while holding direction, resume and orientation reset touch input');
  const zoom=await page.evaluate(()=>{
    const keys=['+','=','-','_','0'];
    const canceled=keys.every(key=>!window.dispatchEvent(new KeyboardEvent('keydown',{key,ctrlKey:true,cancelable:true,bubbles:true})));
    const wheel=!window.dispatchEvent(new WheelEvent('wheel',{ctrlKey:true,deltaY:-100,cancelable:true}));
    const unrelated=window.dispatchEvent(new KeyboardEvent('keydown',{key:'f',ctrlKey:true,cancelable:true}));
    return {canceled,wheel,unrelated};
  });
  assert.deepEqual(zoom,{canceled:true,wheel:true,unrelated:true});
  const scale=await page.evaluate(()=>visualViewport.scale);
  await page.keyboard.press('Control++');await page.keyboard.press('Control+-');
  await page.keyboard.down('Control');await page.mouse.wheel(0,-200);await page.keyboard.up('Control');
  await pinch(cdp);
  assert.equal(await page.evaluate(()=>visualViewport.scale),scale);
  checks.push('Zoom key/wheel defaults blocked, Ctrl+F preserved, native pinch leaves viewport scale unchanged');
  for (let index=0;index<3;index++) {
    await page.evaluate(index=>{
      const g=window.__CAT_GAME__;g.scene.stop('Play');g.scene.start('Play',{index,run:{hearts:5,score:0,fish:0,coins:0}});
    },index);
    await page.waitForFunction(()=>window.__CAT_GAME__.scene.getScene('Play').player.sprite.body.blocked.down);
    const initial=await state();
    await touch('touchStart',[right,jump]);await page.waitForTimeout(100);
    const moving=await state();assert.ok(moving.x>initial.x && moving.y<initial.y);
    await touch('touchEnd',[]);
    const supported=await page.evaluate(()=>{
      const s=window.__CAT_GAME__.scene.getScene('Play');
      return s.children.list.filter(o=>/^(tree-|mushroom-|bush-|lantern$)/.test(o.texture?.key)).every(o=>s.level.ground.some(([x,y,w])=>o.x-o.displayWidth/2>=x && o.x+o.displayWidth/2<=x+w && o.y===y));
    });
    assert.ok(supported,`Level ${index+1} ground decorations`);
    // Fixture only selects a map/camera; movement/jumps above use real touch input.
    await page.evaluate(()=>window.__CAT_GAME__.scene.getScene('Play').cameras.main.stopFollow().setScroll(470,0));
    await page.screenshot({path:`test-results/grounded-level-${index+1}.png`});
  }
  checks.push('Runtime trees, mushrooms and lanterns fully supported on all three maps');
  await page.getByRole('button',{name:'Pause permainan'}).tap();
  await page.getByRole('button',{name:'Main Menu',exact:true}).tap();
  for (const [width,height] of [[320,568],[667,375],[768,1024]]) {
    await page.setViewportSize({width,height});await page.waitForTimeout(250);
    for (const label of ['Cara Bermain','Pengaturan']) {
      await page.getByRole('button',{name:label,exact:true}).tap();
      await page.getByRole('button',{name:label==='Cara Bermain'?'Siap Berpetualang':'Simpan & Kembali'}).tap();
    }
    await page.getByRole('button',{name:'Pilih Level'}).tap();
    await page.getByRole('button',{name:'Kembali ke Menu'}).tap();
  }
  checks.push('Touch navigation: help, settings, level select on small portrait, landscape and tablet');
  await page.setViewportSize({width:844,height:390});
  await page.goto('about:blank');
  await page.setContent('<meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;height:100vh;background:#fff3da}</style><p>Zoom-enabled control page</p>');
  await page.waitForTimeout(200);
  const controlScale=await page.evaluate(()=>visualViewport.scale);
  await pinch(cdp);
  assert.ok(await page.evaluate(initial=>visualViewport.scale>initial*1.1,controlScale),'same pinch must zoom the control page');
  checks.push('Identical multi-frame pinch increases scale on zoom-enabled control page');
  assert.deepEqual(errors,[]);
  await writeFile('test-results/mobile.json',JSON.stringify({result:'PASS',browser:await browser.version(),emulated:true,checks,errors},null,2));
  console.log(checks.join('\n'));console.log('MOBILE SUITE PASS');
} catch(error) {await page.screenshot({path:'test-results/mobile-failure.png'});throw error;}
finally {await browser.close();}
