import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
import { mechanics } from './mechanics.mjs';
import { level1,level2,level3,state } from './driver.mjs';

const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1366,height:768}});
const errors=[];
const warnings=[],log=[],levels=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error') errors.push(m.text());if(m.type()==='warning') warnings.push(m.text());});
await mkdir('test-results',{recursive:true});
try {
  await page.goto('http://127.0.0.1:5173/');
  await page.getByRole('button',{name:'Mulai Petualangan'}).waitFor();
  await page.waitForTimeout(400);
  await page.screenshot({path:'test-results/menu.png'});
  for (const [width,height] of [[1920,1080],[1366,768],[1024,600],[390,844]]) {
    await page.setViewportSize({width,height});await page.waitForTimeout(150);
    const fit=await page.evaluate(()=>{
      const c=document.querySelector('canvas').getBoundingClientRect(),stage=document.querySelector('.game-stage').getBoundingClientRect();
      const shell=document.querySelector('.game-shell').getBoundingClientRect();
      return {ratio:c.width/c.height,overflow:document.documentElement.scrollWidth>innerWidth,inside:c.left>=stage.left-1 && c.right<=stage.right+1,width:shell.width,height:shell.height,left:shell.left,top:shell.top};
    });
    assert.ok(Math.abs(fit.ratio-16/9)<0.01);assert.equal(fit.overflow,false);assert.equal(fit.inside,true);
    assert.equal(fit.width,width);assert.equal(fit.height,height);assert.equal(fit.left,0);assert.equal(fit.top,0);
    assert.equal(await page.locator('.site-header,.below-game,.game-toolbar,.mobile-note').count(),0);
    await page.screenshot({path:`test-results/menu-${width}.png`});
  }
  log.push('Responsive 1920x1080, 1366x768, 1024x600, 390x844; 16:9, no horizontal overflow: PASS');
  await page.setViewportSize({width:1366,height:768});
  await mechanics(page,log);
  console.log(log.join('\n'));
  await page.getByRole('button',{name:'Mulai Petualangan'}).click();
  await page.getByRole('button',{name:'Mulai Bermain',exact:true}).click();
  await page.waitForFunction(()=>window.__CAT_GAME__?.scene.getScene('Play').player?.sprite.body.blocked.down);
  for (const [index,route] of [level1,level2,level3].entries()) {
    await page.waitForTimeout(550);
    const entry=await state(page);
    await page.screenshot({path:`test-results/level-${index+1}.png`});
    await route(page);
    await page.getByRole('dialog',{name:index===2?'Mochi Finally Found His Way Home!':'Level Completed',exact:true}).waitFor();
    const end=await state(page);
    assert.ok(end.fish>=[5,7,10][index]);assert.equal(end.hearts,entry.hearts);assert.equal(end.finished,true);
    levels.push({level:index+1,fish:end.fish,coins:end.coins,score:end.score,hearts:end.hearts,checkpoint:end.checkpoint});
    log.push(`Level ${index+1} full keyboard route, no teleport/inventory edits: PASS`);
    console.log(log.at(-1),JSON.stringify(levels.at(-1)));
    await page.screenshot({path:`test-results/complete-${index+1}.png`});
    if(index<2){await page.getByRole('button',{name:'Next Level / Lanjutkan'}).click();await page.waitForTimeout(400);const next=await state(page);assert.equal(next.score,end.score);assert.equal(next.hearts,end.hearts);assert.equal(next.fish,0);}
  }
  const high=await page.evaluate(()=>window.__CAT_GAME__.bridge.save.highScore);
  assert.equal(high,levels[2].score);
  await page.getByRole('button',{name:'Main Menu',exact:true}).click();
  await page.reload();await page.getByRole('button',{name:'Mulai Petualangan'}).waitFor();
  assert.equal(await page.evaluate(()=>window.__CAT_GAME__.bridge.save.highScore),high);
  await page.getByRole('button',{name:'Pilih Level'}).click();assert.equal(await page.locator('.level-card:disabled').count(),0);
  await page.getByRole('button',{name:/Way Back Home/}).click();
  await page.getByRole('dialog',{name:'Sebelum Bermain'}).waitFor();
  await page.getByRole('button',{name:'Mulai Bermain',exact:true}).click();await page.waitForTimeout(400);
  let s=await state(page);assert.equal(s.index,2);assert.equal(s.score,0);assert.equal(s.hearts,5);
  const frameTimes=await page.evaluate(()=>new Promise(resolve=>{const times=[];let last=performance.now();const frame=now=>{times.push(now-last);last=now;if(times.length<90)requestAnimationFrame(frame);else resolve(times.slice(1));};requestAnimationFrame(frame);}));
  log.push(`High score + unlock persisted after reload, Level Select starts fresh: PASS; observed mean frame ${(frameTimes.reduce((a,b)=>a+b,0)/frameTimes.length).toFixed(2)} ms`);
  const blocked=await browser.newPage();
  await blocked.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Storage unavailable','QuotaExceededError');};});
  await blocked.goto('http://127.0.0.1:5173/');await blocked.getByRole('button',{name:'Mulai Petualangan'}).waitFor();
  await blocked.getByRole('button',{name:'Matikan suara'}).click();
  await blocked.getByText('Penyimpanan browser tidak tersedia.',{exact:false}).waitFor();
  await blocked.close();log.push('Blocked storage handled without crash and visible warning: PASS');
  const failedAsset=await browser.newPage();
  await failedAsset.route('**/assets/sky-forest.png',route=>route.abort());
  await failedAsset.goto('http://127.0.0.1:5173/');
  await failedAsset.getByRole('dialog',{name:'Kesalahan',exact:true}).waitFor();
  await failedAsset.waitForTimeout(500);
  assert.equal(await failedAsset.getByRole('button',{name:'Mulai Petualangan'}).count(),0);
  await failedAsset.unroute('**/assets/sky-forest.png');
  await failedAsset.getByRole('button',{name:'Muat Ulang'}).click();
  await failedAsset.getByRole('button',{name:'Mulai Petualangan'}).waitFor();await failedAsset.close();
  log.push('Failed required asset keeps recovery dialog; reload recovers: PASS');
  assert.deepEqual(errors,[]);
  assert.deepEqual(warnings,[]);
  console.log('BROWSER SUITE PASS',JSON.stringify({levels,errors,warnings}));
} catch(e) {
  await page.screenshot({path:'test-results/failure.png'});throw e;
} finally { await writeFile('test-results/results.json',JSON.stringify({log,levels,errors,warnings},null,2));await browser.close(); }
