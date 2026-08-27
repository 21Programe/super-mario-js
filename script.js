import { Game } from './engine.js';
import { state } from './state.js';
import { AssetLoader } from './asset-loader.js';

let game = null;
let loader = null;

function showScreen(){
  const screen=state.data.screen;
  const map={menu:'menu',pause:'pause',gameover:'gameOver',victory:'victory'};
  for(const [name,id] of Object.entries(map)){const el=document.getElementById(id);if(el)el.classList.toggle('hidden',screen!==name)}
  const loading=document.getElementById('loading');
  if(loading)loading.classList.toggle('hidden',screen!=='loading');
}

async function boot(){
  if(game)return game;
  const canvas=document.getElementById('gameCanvas');
  if(!canvas)throw new Error('Canvas #gameCanvas não encontrado.');
  loader=new AssetLoader((p,label)=>{
    const bar=document.getElementById('loadBar');
    const text=document.getElementById('loadLabel');
    if(bar)bar.style.width=`${Math.round(p*100)}%`;
    if(text)text.textContent=`CARREGANDO ${String(label||'ASSETS').toUpperCase()} ${Math.round(p*100)}%`;
  });
  await loader.load();
  game=new Game(canvas);
  game.renderer.setAssets(loader);
  window.SuperJSBros={game,state,assets:loader};
  return game;
}

async function startGame(){
  const button=document.getElementById('startBtn');
  try{
    if(button)button.disabled=true;
    state.data.screen='loading';showScreen();
    const g=await boot();
    g.start();
  }catch(error){
    console.error('[Super JS Bros] start error:',error);
    state.data.screen='menu';showScreen();
    const menu=document.getElementById('menu');
    if(menu){let msg=menu.querySelector('[data-error]');if(!msg){msg=document.createElement('div');msg.dataset.error='1';msg.style.cssText='margin-top:12px;color:#ff8080;font:700 12px monospace';menu.appendChild(msg)}msg.textContent='Erro ao iniciar: '+error.message}
  }finally{if(button)button.disabled=false}
}

document.addEventListener('DOMContentLoaded',async()=>{
  showScreen();
  const start=document.getElementById('startBtn');
  if(start){start.disabled=false;start.addEventListener('click',startGame)}
  document.getElementById('restartBtn')?.addEventListener('click',startGame);
  document.getElementById('resumeBtn')?.addEventListener('click',()=>game?.resume());
  document.getElementById('nextBtn')?.addEventListener('click',()=>{if(game){game.levelIndex=Math.min(game.levelIndex+1,2);game.start()}});
});

window.addEventListener('keydown',e=>{
  if(!game)return;
  if(e.code==='Escape'){
    if(state.data.screen==='playing')state.set({screen:'pause'});
    else if(state.data.screen==='pause')game.resume();
  }
  if(e.code==='KeyM'){
    state.data.muted=!state.data.muted;state.save();
    try{game.audio.setMuted(state.data.muted);if(!state.data.muted)game.audio.startMusic();else game.audio.stopMusic()}catch{}
  }
});

state.on(()=>{if(game)game.render();showScreen()});
