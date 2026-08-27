import { Game } from './engine.js';
import { state } from './state.js';
import { installEnhancements } from './enhancements.js';

// Bootstrap seguro: a Engine é criada uma única vez e a tela é atualizada
// somente depois que todos os módulos foram carregados.
installEnhancements(Game);

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);

// Garante que a tela inicial seja desenhada mesmo antes do primeiro clique.
game.render();

state.on(() => {
  try {
    game.render();
  } catch (error) {
    console.error('Falha ao renderizar o estado:', error);
  }
});

window.addEventListener('keydown', (e) => {
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

window.SuperJSBros = { game, state };
