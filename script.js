import {Game} from './engine.js';import {state} from './state.js';
const game=new Game(document.getElementById('gameCanvas'));
state.on(s=>{game.render()});
addEventListener('keydown',e=>{if(e.code==='Escape'){if(state.data.screen==='playing')state.set({screen:'pause'});else if(state.data.screen==='pause')state.set({screen:'playing'})}if(e.code==='KeyM'){state.data.muted=!state.data.muted;state.save();game.audio.setMuted(state.data.muted);if(!state.data.muted)game.audio.startMusic();else game.audio.stopMusic()}});
window.SuperJSBros={game,state};game.render();
