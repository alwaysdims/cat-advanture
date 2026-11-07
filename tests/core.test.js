import test from 'node:test';
import assert from 'node:assert/strict';
import { newRun, collect, completeLevel, retryRun } from '../src/game/state.js';
import { loadSave, writeSave } from '../src/game/save.js';
import { LEVELS } from '../src/game/levels.js';
import { Player } from '../src/game/Player.js';
import { scenery,groundAt } from '../src/game/scenery.js';

test('every tree and giant mushroom is supported across its full width on all maps',()=>{
  assert.equal(groundAt([[0,300,100]],95,10),undefined);
  for (const level of LEVELS) {
    const images=[];
    const make=(x,y,key)=>{
      const image={x,y,key,scale:1,setOrigin(){return this;},setScrollFactor(){return this;},setDepth(){return this;},setAlpha(){return this;},setScale(scale){this.scale=scale;return this;}};
      images.push(image);return image;
    };
    scenery({add:{image:make,tileSprite:()=>make(0,0,'background')},game:{bridge:{save:{reducedMotion:true}}}},level.theme,level.width,false,level.ground);
    const decorations=images.filter(i=>i.key.startsWith('tree-') || i.key.startsWith('mushroom-'));
    assert.ok(decorations.length>3);
    for (const image of decorations) {
      const support=groundAt(level.ground,image.x,(image.key.startsWith('tree-')?72:48)*image.scale);
      assert.ok(support,`${level.name}: ${image.key} at ${image.x} must not straddle a pit`);
      assert.equal(image.y,support[1]);
    }
  }
});

test('lowered boards keep collectibles aligned and leave walking clearance', () => {
  assert.equal(LEVELS[0].platforms[0][1],247);
  assert.equal(LEVELS[0].fish[1][1],219);
  assert.equal(LEVELS[1].moving[0].y,277);
  for (const level of LEVELS) for (const [px,py,pw] of level.platforms) {
    for (const [gx,gy,gw] of level.ground) {
      if (px<gx+gw && px+pw>gx) assert.ok(gy-py-18>=34,'room for the 31px player under the board');
    }
  }
});

test('campaign scores, hearts and inventory survive all three levels', () => {
  let run = newRun();
  run.hearts = 4;
  for (let level = 0; level < 3; level++) {
    for (let i = 0; i < LEVELS[level].target; i++) collect(run, 'fish');
    collect(run, 'coin');
    completeLevel(run, level === 2);
  }
  assert.deepEqual(run, { hearts: 4, score: 675, fish: 22, coins: 3 });
});

test('retry restores entry inventory without farming score, and refills hearts only after death', () => {
  const entry = { hearts: 2, score: 100, fish: 5, coins: 2 };
  assert.deepEqual(retryRun(entry, false), entry);
  assert.deepEqual(retryRun(entry, true), { ...entry, hearts: 5 });
  assert.notEqual(retryRun(entry, false), entry);
});

test('save handles malformed, hostile and unavailable storage', () => {
  const storage = value => ({ getItem: () => value, setItem() {} });
  assert.deepEqual(loadSave(storage('{')), { highScore: 0, unlocked: 1, muted: false, reducedMotion: false });
  assert.deepEqual(loadSave(storage('{"highScore":-10,"unlocked":99,"muted":"no"}')), loadSave(storage(null)));
  assert.equal(loadSave(storage('{"unlocked":3,"highScore":675,"muted":true}')).unlocked, 3);
  assert.equal(writeSave({ ...loadSave(storage(null)), highScore: 10 }, { setItem() { throw Error('quota'); } }), false);
});

test('all levels have sufficient reachable fish, safe checkpoints and bounded patrols', () => {
  assert.deepEqual(LEVELS.map(l => l.target), [5, 7, 10]);
  for (const level of LEVELS) {
    assert.ok(level.width > 640 * 3);
    assert.ok(level.fish.length >= level.target + 2);
    for (const [x, y] of level.fish) {
      assert.ok(level.ground.some(([gx, gy, w]) => x >= gx && x <= gx + w && gy - y >= 20 && gy - y <= 120)
        || level.platforms.some(([px, py, w]) => x >= px && x <= px + w && py - y > 0 && py - y < 100));
    }
    for (const point of [level.spawn, level.checkpoint, level.exit]) {
      assert.ok(level.ground.some(([x, y, w]) => point[0] > x + 20 && point[0] < x + w - 20 && point[1] === y));
      assert.ok(level.spikes.every(([x, , w]) => point[0] < x - 45 || point[0] > x + w + 45));
      assert.ok(level.enemies.every(e => e.type !== 'hedgehog' || point[0] < e.left - 45 || point[0] > e.right + 45));
    }
    for (const enemy of level.enemies.filter(e => e.type === 'hedgehog')) {
      assert.ok(level.ground.some(([x, y, w]) => enemy.left >= x + 15 && enemy.right <= x + w - 15 && enemy.y === y - 12));
    }
  }
});

test('render-only frames cannot replenish jumps from stale grounded flags', () => {
  let launches=0;
  const body={blocked:{down:true},touching:{down:false},velocity:{x:0,y:0},bottom:300};
  const sprite={x:90,body,setVelocityY(y){body.velocity.y=y;return this;},setAccelerationX(){return this;},setFlipX(){return this;},play(){return this;}};
  const player=Object.assign(Object.create(Player.prototype),{
    sprite,scene:{level:LEVELS[0],game:{bridge:{save:{reducedMotion:true},audio:{play(){launches++;}}}}},
    keys:Object.fromEntries(['A','D','W','SPACE','UP','LEFT','RIGHT'].map(k=>[k,{isDown:false}])),
    jumps:0,lastGround:-1000,buffer:-1000,grounded:false,jumpHeld:false,lockedUntil:0,
  });
  player.keys.SPACE.isDown=true;player.update(0);
  player.update(5); // 144 Hz can render again before the next 60 Hz physics step.
  assert.equal(player.jumps,1);
  player.keys.SPACE.isDown=false;player.update(8);
  player.keys.SPACE.isDown=true;player.update(12);
  player.keys.SPACE.isDown=false;player.update(15);
  player.keys.SPACE.isDown=true;player.update(18);
  assert.equal(player.jumps,2);assert.equal(launches,2);
});
