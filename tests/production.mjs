import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';

const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1366,height:768}});
const errors=[],failedRequests=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});
page.on('response',r=>{if(r.status()>=400)failedRequests.push(r.url());});
try {
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button',{name:'Mulai Petualangan'}).waitFor();
  assert.equal(await page.evaluate(()=>typeof window.__CAT_GAME__),'undefined');
  await page.getByRole('button',{name:'Mulai Petualangan'}).click();
  await page.getByRole('dialog',{name:'Sebelum Bermain'}).waitFor();
  await page.getByRole('button',{name:'Mulai Bermain',exact:true}).click();await page.waitForTimeout(600);
  await page.keyboard.down('d');await page.waitForTimeout(700);await page.keyboard.up('d');
  await page.waitForFunction(()=>document.querySelector('.score b')?.textContent==='00010');
  await page.keyboard.press('p');await page.getByRole('dialog',{name:'Permainan dijeda'}).waitFor();
  await page.getByRole('button',{name:'Main Menu',exact:true}).click();
  await page.getByRole('button',{name:'Mulai Petualangan'}).waitFor();
  assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);
  await mkdir('test-results',{recursive:true});
  await writeFile('test-results/production.json',JSON.stringify({result:'PASS',browser:await browser.version(),errors,failedRequests,debugHook:false},null,2));
  console.log('Production preview: assets, movement, pickup, pause, menu, no debug hook, clean console PASS');
} finally {await browser.close();}
