import { Game } from './engine.js';
import { state } from './state.js';

let game = null;

function boot() {
  if (game) return game;
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) throw new Error('Canvas #gameCanvas não encontrado.');
  game = new Game(canvas);
  window.SuperJSBros = { game, state };
  return game;
}

function showScreen() {
  const map = { menu: 'menu', pause: 'pause', gameover: 'gameOver', victory: 'victory' };
  for (const [key, id] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', state.data.screen !== key);
  }
}

function startGame() {
  try {
    boot().start();
  } catch (error) {
    console.error('[Super JS Bros] start error:', error);
    const menu = document.getElementById('menu');
    if (menu) {
      menu.classList.remove('hidden');
      let msg = menu.querySelector('[data-error]');
      if (!msg) {
        msg = document.createElement('div');
        msg.dataset.error = '1';
        msg.style.cssText = 'margin-top:12px;color:#ff8080;font:700 12px monospace';
        menu.appendChild(msg);
      }
      msg.textContent = 'Erro ao iniciar. Pressione F12 e veja o Console.';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startBtn')?.addEventListener('click', startGame);
  document.getElementById('restartBtn')?.addEventListener('click', startGame);
  document.getElementById('resumeBtn')?.addEventListener('click', () => {
    const g = boot();
    if (!g.world) return g.start();
    state.set({ screen: 'playing' });
    g.running = true;
    g.last = performance.now();
    requestAnimationFrame(t => g.loop(t));
  });
  document.getElementById('nextBtn')?.addEventListener('click', () => {
    const g = boot();
    g.levelIndex = Math.min(g.levelIndex + 1, 2);
    g.start();
  });
  showScreen();
});

window.addEventListener('keydown', e => {
  if (!game) return;
  if (e.code === 'Escape') {
    if (state.data.screen === 'playing') state.set({ screen: 'pause' });
    else if (state.data.screen === 'pause') state.set({ screen: 'playing' });
  }
  if (e.code === 'KeyM') {
    state.data.muted = !state.data.muted;
    state.save();
    game.audio.setMuted(state.data.muted);
    if (!state.data.muted) game.audio.startMusic();
    else game.audio.stopMusic();
  }
});

state.on(() => {
  if (game) game.render();
  showScreen();
});
