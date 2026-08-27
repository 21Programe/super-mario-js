import { aabb } from './physics.js';

export function installEnhancements(Game) {
  const oldUpdate = Game.prototype.update;
  const oldBlock = Game.prototype.blockHits;
  const oldRender = Game.prototype.render;

  Game.prototype.update = function (dt) {
    oldUpdate.call(this, dt);
    if (!this.player || !this.world || !this.worldDef) return;

    if (this.player.body.x > this.worldDef.width * .5 && !this.checkpoint) {
      this.checkpoint = this.player.body.x;
      localStorage.setItem('jsbros.checkpoint', String(this.checkpoint));
    }

    if (this.player.power === 'star') {
      this.player.star = Math.max(0, (this.player.star || 8) - dt);
      if (this.player.star <= 0) this.player.power = 'small';
    }

    for (const e of this.world.enemies) {
      if (e.alive && this.player.power === 'star' && aabb(this.player.body, e)) {
        e.alive = false;
        this.particles.burst(e.x, e.y, 14, '#fbd000', 120);
        this.audio.sfx('star');
        this.camera.hit(5);
      }
    }

    for (const it of this.world.items) {
      if (it.type === 'star' && !it.hidden && aabb(this.player.body, it)) {
        it.hidden = true;
        this.player.power = 'star';
        this.player.star = 8;
        this.player.state = 'PowerUp';
        this.audio.sfx('star');
        this.particles.burst(it.x, it.y, 20, '#fbd000', 150);
      }
      if (it.type === 'goal' && !it.hidden && aabb(this.player.body, it)) this.win();
    }
  };

  Game.prototype.blockHits = function () {
    oldBlock.call(this);
    if (!this.world) return;
    for (const b of this.world.blocks) {
      if (b.type !== 'B' || !b.used) continue;
      const it = this.world.items.find(i => i.hidden && Math.abs(i.x - (b.x + 2)) < 2 && Math.abs(i.y - (b.y - 16)) < 2);
      if (it) { it.hidden = false; it.y = b.y - 16; }
    }
  };

  Game.prototype.render = function () {
    if (!this.world || !this.player || !this.worldDef) {
      // O menu continua visível até uma fase válida ser iniciada.
      return;
    }
    const x = this.camera.x, y = this.camera.y;
    if (this.camera.shake > 0) {
      this.camera.x += (Math.random() * 2 - 1) * this.camera.shake;
      this.camera.y += (Math.random() * 2 - 1) * this.camera.shake;
    }
    try { oldRender.call(this); }
    finally { this.camera.x = x; this.camera.y = y; }
  };
}
