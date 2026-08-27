import { Game } from './engine.js';
import { state } from './state.js';
import { AssetLoader } from './asset-loader.js';

let game = null;
let assets = null;
let bootPromise = null;

function setLoading(percent, label) {
  const bar = document.getElementById('loadBar');
  const text = document.getElementById('loadLabel');
  if (bar) bar.style.width = `${Math.round(percent * 100)}%`;
  if (text) text.textContent = `${label || 'CARREGANDO'} ${Math.round(percent * 100)}%`;
}

function showScreen() {
  const map = { menu: 'menu', pause: 'pause', gameover: 'gameOver', victory: 'victory' };
  for (const [key, id] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', state.data.screen !== key);
  }
}

function hideLoading() {
  const el = document.getElementById('loading');
  if (el) el.classList.add('hidden');
}

async function boot() {
  if (game) return game;
  if (bootPromise) return bootPromise;
  bootPromise = (async () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) throw new Error('Canvas #gameCanvas não encontrado.');
    setLoading(0, 'PREPARANDO ASSETS');
    assets = await new AssetLoader(undefined, (p, label) => setLoading(p, `ASSET ${String(label).toUpperCase()}`)).load();
    game = new Game(canvas);
    if (typeof game.renderer.setAssets === 'function') game.renderer.setAssets(assets);
    window.SuperJSBros = { game, state, assets };
    hideLoading();
    const start = document.getElementById('startBtn');
    if (start) start.disabled = false;
    return game;
  })();
  try { return await bootPromise; }
  catch (error) {
    console.error('[Super JS Bros] boot error:', error);
    setLoading(1, 'FALHA AO CARREGAR');
    const label = document.getElementById('loadLabel');
    if (label) label.textContent = 'ASSETS OPCIONAIS INDISPONÍVEIS — RECARREGUE A PÁGINA';
    bootPromise = null;
    throw error;
  }
}

async function startGame() {
  try {
    const g = await boot();
    g.start();
  } catch (error) {
    console.error('[Super JS Bros] start error:', error);
    const menu = document.getElementById('menu');
    if (menu) {
      hideLoading();
      menu.classList.remove('hidden');
      let msg = menu.querySelector('[data-error]');
      if (!msg) {
        msg = document.createElement('div');
        msg.dataset.error = '1';
        msg.style.cssText = 'margin-top:12px;color:#ff8080;font:700 12px monospace';
        menu.appendChild(msg);
      }
      msg.textContent = 'Falha ao iniciar. Recarregue a página.';
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('startBtn')?.addEventListener('click', startGame);
  document.getElementById('restartBtn')?.addEventListener('click', startGame);
  document.getElementById('resumeBtn')?.addEventListener('click', async () => {
    const g = await boot();
    if (!g.world) return g.start();
    state.set({ screen: 'playing' });
    g.running = true;
    g.last = performance.now();
    requestAnimationFrame(t => g.loop(t));
  });
  document.getElementById('nextBtn')?.addEventListener('click', async () => {
    const g = await boot();
    g.levelIndex = Math.min(g.levelIndex + 1, 2);
    g.start();
  });
  try { await boot(); } catch (_) {}
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
