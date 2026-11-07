import Phaser from 'phaser';
import { BootScene } from './BootScene';
import { MenuScene } from './MenuScene';
import { PlayScene } from './PlayScene';

export function createGame(parent,bridge) {
  const game=new Phaser.Game({
    type:Phaser.AUTO, parent, width:640,height:360,backgroundColor:'#fff3da',
    pixelArt:true,roundPixels:true,antialias:false,
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
    physics:{default:'arcade',arcade:{gravity:{y:1000},debug:false,fixedStep:true,fps:60}},
    input:{keyboard:{capture:[]}},
    scene:[BootScene,MenuScene,PlayScene],
    callbacks:{preBoot:g=>{g.bridge=bridge;}},
    audio:{noAudio:true},
  });
  return game;
}
