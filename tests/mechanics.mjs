import assert from 'node:assert/strict';
import { state } from './driver.mjs';

export async function mechanics(page,log) {
  await page.getByRole('button',{name:'Pilih Level'}).click();
  assert.equal(await page.locator('.level-card:disabled').count(),2);
  await page.getByRole('button',{name:'Kembali ke Menu'}).click();
  await page.getByRole('button',{name:'Cara Bermain',exact:true}).click();
  assert.equal(await page.evaluate(()=>document.activeElement.closest('dialog')!==null),true);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement===document.body || document.activeElement.closest('dialog')!==null),true);
  await page.getByRole('button',{name:'Siap Berpetualang'}).click();
  await page.getByRole('button',{name:'Pengaturan',exact:true}).click();
  await page.getByLabel('Efek suara').uncheck();
  await page.getByLabel('Kurangi efek gerak').check();
  await page.getByRole('button',{name:'Simpan & Kembali'}).click();
  await page.reload();await page.getByRole('button',{name:'Mulai Petualangan'}).waitFor();
  assert.deepEqual(await page.evaluate(()=>({muted:window.__CAT_GAME__.bridge.save.muted,motion:window.__CAT_GAME__.bridge.save.reducedMotion})),{muted:true,motion:true});
  await page.getByRole('button',{name:'Pengaturan',exact:true}).click();
  await page.getByLabel('Efek suara').check();await page.getByLabel('Kurangi efek gerak').uncheck();
  await page.getByRole('button',{name:'Simpan & Kembali'}).click();
  log.push('Menu, locked Level Select, help, native dialog focus, settings reload: PASS');
  await page.getByRole('button',{name:'Mulai Petualangan'}).click();
  await page.getByRole('dialog',{name:'Sebelum Bermain'}).waitFor();
  assert.equal(await page.evaluate(()=>window.__CAT_GAME__.scene.isActive('Play')),false);
  await page.screenshot({path:'test-results/before-playing.png'});
  await page.getByRole('button',{name:'Mulai Bermain',exact:true}).click();await page.waitForTimeout(550);
  assert.equal(await page.evaluate(()=>{const event=new KeyboardEvent('keydown',{key:' ',repeat:true,cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;}),true,'held gameplay keys must not scroll the page');
  assert.equal(await page.evaluate(()=>window.__CAT_GAME__.bridge.audio.context.state),'running');
  await page.keyboard.down('d');await page.waitForTimeout(690);await page.keyboard.up('d');await page.waitForTimeout(160);
  let s=await state(page);assert.ok(s.x>190);assert.equal(s.fish,1);assert.equal(s.score,10);
  await page.keyboard.down('Space');await page.waitForTimeout(170);await page.keyboard.up('Space');
  assert.equal((await state(page)).jumps,1);
  await page.waitForTimeout(60);await page.keyboard.down('Space');await page.waitForTimeout(80);
  s=await state(page);assert.equal(s.jumps,2);assert.ok(s.vy<0);
  await page.keyboard.up('Space');await page.waitForTimeout(35);const vy=(await state(page)).vy;
  await page.keyboard.down('Space');await page.waitForTimeout(35);
  assert.equal((await state(page)).jumps,2);assert.ok((await state(page)).vy>vy);
  await page.keyboard.up('Space');await page.waitForTimeout(650);
  await page.keyboard.press('p');await page.getByRole('dialog',{name:'Permainan dijeda'}).waitFor();
  const frozen=await state(page);await page.waitForTimeout(300);assert.deepEqual(await state(page),frozen);
  await page.keyboard.press('Escape');await page.waitForTimeout(100);
  assert.equal(await page.locator('dialog').count(),0);
  log.push('Movement, fish score, jump, double jump limit, pause/resume, unlocked Web Audio: PASS');

  // Fixtures below place the real player body; collision/controller still run in Phaser.
  await page.evaluate(()=>{const s=window.__CAT_GAME__.scene.getScene('Play');s.player.reset(560,300);});
  await page.waitForTimeout(80);await page.keyboard.down('d');
  await page.waitForFunction(()=>{const p=window.__CAT_GAME__.scene.getScene('Play').player;return p.sprite.x>583 && !p.sprite.body.blocked.down;});
  await page.keyboard.down('Space');await page.waitForTimeout(25);assert.equal((await state(page)).jumps,1);
  await page.keyboard.up('Space');await page.keyboard.up('d');
  await page.evaluate(()=>{const s=window.__CAT_GAME__.scene.getScene('Play');s.player.reset(200,260);s.player.sprite.setVelocityY(270);});
  await page.waitForTimeout(30);await page.keyboard.down('Space');
  await page.waitForTimeout(140);assert.ok((await state(page)).vy<0,'jump buffer launches on landing');
  await page.keyboard.up('Space');
  log.push('Coyote time and buffered landing jump using real physics fixtures: PASS');

  await page.evaluate(()=>{const s=window.__CAT_GAME__.scene.getScene('Play'),e=s.enemies.getChildren()[0];s.player.reset(e.x,e.y+12);});
  await page.waitForFunction(()=>window.__CAT_GAME__.scene.getScene('Play').run.hearts===4);
  s=await state(page);assert.ok(s.x<120);
  await page.keyboard.press('p');
  const remaining=await page.evaluate(()=>{const s=window.__CAT_GAME__.scene.getScene('Play');return s.invincibleUntil-s.activeTime;});
  await page.waitForTimeout(1700);await page.keyboard.press('p');await page.waitForTimeout(50);
  const remainingAfter=await page.evaluate(()=>{const s=window.__CAT_GAME__.scene.getScene('Play');return s.invincibleUntil-s.activeTime;});
  assert.ok(remainingAfter>remaining-180,'pause must not consume immunity');
  await page.evaluate(()=>{const s=window.__CAT_GAME__.scene.getScene('Play'),e=s.enemies.getChildren()[0];s.player.reset(e.x,e.y+12);});
  await page.waitForTimeout(250);assert.equal((await state(page)).hearts,4);
  await page.evaluate(()=>{const s=window.__CAT_GAME__.scene.getScene('Play');s.player.reset(...s.level.checkpoint);});
  await page.waitForFunction(()=>window.__CAT_GAME__.scene.getScene('Play').checkpoint.active);
  await page.waitForTimeout(1500);
  await page.evaluate(()=>window.__CAT_GAME__.scene.getScene('Play').player.sprite.body.reset(1250,420));
  await page.waitForFunction(()=>window.__CAT_GAME__.scene.getScene('Play').run.hearts===3);
  s=await state(page);assert.ok(Math.abs(s.x-1390)<2);assert.equal(s.fish,1);
  await page.evaluate(()=>{const s=window.__CAT_GAME__.scene.getScene('Play');s.player.reset(...s.level.exit);});
  await page.waitForTimeout(200);assert.equal((await state(page)).finished,false);
  log.push('Enemy contact, 1.5s immunity, checkpoint, pit respawn, retained items, locked exit: PASS');

  await page.keyboard.press('p');await page.getByRole('button',{name:'Ulangi Level'}).click();await page.waitForTimeout(500);
  s=await state(page);assert.equal(s.hearts,5);assert.equal(s.score,0);assert.equal(s.fish,0);assert.equal(s.checkpoint,false);
  for(let hearts=4;hearts>=0;hearts--){
    await page.evaluate(()=>{const s=window.__CAT_GAME__.scene.getScene('Play');s.invincibleUntil=0;s.toast='Expired message';s.toastUntil=s.activeTime-1;s.player.sprite.body.reset(600,420);});
    await page.waitForFunction(h=>window.__CAT_GAME__.scene.getScene('Play').run.hearts===h,hearts);
  }
  await page.getByRole('dialog',{name:'Game Over',exact:true}).waitFor();
  await page.screenshot({path:'test-results/game-over.png'});
  await page.getByRole('button',{name:'Retry / Coba Lagi'}).click();await page.waitForTimeout(500);
  assert.equal((await state(page)).hearts,5);assert.equal((await state(page)).score,0);
  assert.equal(await page.locator('canvas').count(),1);
  log.push('Restart snapshot, Game Over, Retry, one canvas after scene restarts: PASS');

  await page.evaluate(()=>{const g=window.__CAT_GAME__;g.scene.stop('Play');g.scene.start('Play',{index:1,run:{hearts:5,score:0,fish:0,coins:0}});});
  await page.waitForTimeout(500);
  await page.evaluate(()=>{const s=window.__CAT_GAME__.scene.getScene('Play'),p=s.moving.getChildren()[0];s.player.reset(p.x+p.displayWidth/2,p.y);});
  await page.waitForTimeout(250);const ride1=await state(page);
  await page.keyboard.press('p');
  const flightBefore=(await state(page)).enemies;
  await page.waitForTimeout(700);await page.keyboard.press('p');await page.waitForTimeout(30);
  const flightAfter=(await state(page)).enemies;
  assert.ok(flightAfter.every((e,i)=>Math.abs(e.y-flightBefore[i].y)<5),'flight phase resumes without a jump');
  await page.waitForTimeout(3800);const ride2=await state(page);
  assert.ok(Math.abs(ride1.x-ride1.moving[0].x-(ride2.x-ride2.moving[0].x))<3,'platform carries idle player through reversal');
  assert.ok(Math.abs(ride2.y+20-ride2.moving[0].y)<2);assert.equal(ride2.hearts,5);
  assert.equal(await page.evaluate(()=>window.__CAT_GAME__.scene.getScene('Play').enemies.getChildren().every(e=>e.patrol.type==='hedgehog'||Math.abs(e.y-e.patrol.y)<=16.01)),true,'bat flight stays in authored height band');
  await page.evaluate(()=>{const s=window.__CAT_GAME__.scene.getScene('Play');s.player.reset(940,300);});
  await page.waitForFunction(()=>window.__CAT_GAME__.scene.getScene('Play').run.hearts===4);
  log.push('Moving platform support + reversal and spike collision: PASS');
  await page.keyboard.press('p');await page.getByRole('button',{name:'Main Menu',exact:true}).click();
}
