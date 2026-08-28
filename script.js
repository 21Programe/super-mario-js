"use strict";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency on base canvas

const GAME_WIDTH = 400; 
const GAME_HEIGHT = 240; 
const TILE_SIZE = 16;
const SCALE = 2;

let lastTime = 0;
let accumulator = 0;
const TIME_STEP = 1 / 60; // 60 FPS fixed physics step

// Game State
let gameState = 'START'; // START, PLAYING, GAMEOVER, VICTORY
let score = 0;
let coins = 0;
let cameraX = 0;

// Entities arrays
let blocks = [];
let enemies = [];
let particles = [];
let items = [];

// Input
const keys = { left: false, right: false, jump: false, jumpHeld: false };

/*
Color Palette:
0: Transparent
1: Red (#E52521)
2: Brown/Overalls (#8B4513)
3: Skin (#FFCC99)
4: Black (#000000)
5: White (#FFFFFF)
6: Brick Orange (#CC4E00)
7: Gold/Coin (#FBD000)
8: Pipe Green (#00A800)
9: Light Green (#48E800)
*/
const PALETTE = {
    '1': '#E52521', '2': '#8B4513', '3': '#FFCC99', 
    '4': '#000000', '5': '#FFFFFF', '6': '#CC4E00', 
    '7': '#FBD000', '8': '#00A800', '9': '#48E800'
};

const RAW_SPRITES = {
    mario_idle: [
        "000011111000",
        "000111111110",
        "000222334300",
        "002323334333",
        "002322333433",
        "002233334444",
        "000033333300",
        "000111111100",
        "001111111110",
        "011111111111",
        "033111111133",
        "033311111333",
        "003011111030",
        "000022022000",
        "000222022200",
        "002222022220"
    ],
    mario_run: [
        "000011111000",
        "000111111110",
        "000222334300",
        "002323334333",
        "002322333433",
        "002233334444",
        "000033333300",
        "000001110000",
        "000111111000",
        "001111111100",
        "011111111100",
        "033111111330",
        "033311111333",
        "003022000000",
        "000222200000",
        "000222200000"
    ],
    mario_jump: [
        "000011111000",
        "000111111110",
        "000222334300",
        "002323334333",
        "002322333433",
        "002233334444",
        "000033333300",
        "000111111100",
        "001111111110",
        "011111111111",
        "033111111133",
        "033311111333",
        "003011111030",
        "000022022000",
        "000222022200",
        "002222022220"
    ],
    goomba_walk1: [
        "0000002222000000",
        "0000022222200000",
        "0000222222220000",
        "0002222222222000",
        "0022222222222200",
        "0022442222442200",
        "0224542222454220",
        "0224442222444220",
        "0222224444222220",
        "0222224444222220",
        "0022222222222200",
        "0002220000222000",
        "0033330000333300",
        "0333333003333330",
        "0333333003333330",
        "0033330000333300"
    ],
    goomba_dead: [
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000002222000000",
        "0000022222200000",
        "0022222222222200",
        "0222454224542220",
        "0222444224442220",
        "0022224444222200",
        "0333300000033330",
        "3333330000333333",
        "0333300000033330"
    ],
    brick: [
        "6666666466666664",
        "6666666466666664",
        "6666666466666664",
        "4444444444444444",
        "6664666666646666",
        "6664666666646666",
        "6664666666646666",
        "4444444444444444",
        "6666666466666664",
        "6666666466666664",
        "6666666466666664",
        "4444444444444444",
        "6664666666646666",
        "6664666666646666",
        "6664666666646666",
        "4444444444444444"
    ],
    question: [
        "7777777777777777",
        "7777777777777777",
        "7744444444444477",
        "7747777777777477",
        "7747774444777477",
        "7747747777477477",
        "7747747777477477",
        "7747777774777477",
        "7747777747777477",
        "7747777477777477",
        "7747777477777477",
        "7747777777777477",
        "7747777477777477",
        "7747777777777477",
        "7744444444444477",
        "7777777777777777"
    ],
    question_empty: [
        "2222222222222222",
        "2222222222222222",
        "2244444444444422",
        "2242222222222422",
        "2242222222222422",
        "2242222222222422",
        "2242222222222422",
        "2242222222222422",
        "2242222222222422",
        "2242222222222422",
        "2242222222222422",
        "2242222222222422",
        "2242222222222422",
        "2242222222222422",
        "2244444444444422",
        "2222222222222222"
    ],
    ground: [
        "6666666666666666",
        "6666644446666666",
        "6666446644666666",
        "6664466664466666",
        "6664466664466666",
        "6664466664466666",
        "6666446644666666",
        "6666644446666666",
        "6666666666666666",
        "6666666666666666",
        "4444666666664444",
        "6644666666664466",
        "6644666666664466",
        "6644666666664466",
        "4444666666664444",
        "6666666666666666"
    ],
    pipe_top_left: [
        "4444444444444444",
        "4999999999999994",
        "4998888888888994",
        "4988888888888894",
        "4988888888888894",
        "4998888888888994",
        "4999999999999994",
        "4999999999999994",
        "4998888888888994",
        "4988888888888894",
        "4988888888888894",
        "4998888888888994",
        "4999999999999994",
        "4999999999999994",
        "4444444444444444",
        "0444444444444444"
    ],
    pipe_top_right: [
        "4444444444444444",
        "4999999999999994",
        "4998888888888994",
        "4988888888888894",
        "4988888888888894",
        "4998888888888994",
        "4999999999999994",
        "4999999999999994",
        "4998888888888994",
        "4988888888888894",
        "4988888888888894",
        "4998888888888994",
        "4999999999999994",
        "4999999999999994",
        "4444444444444444",
        "4444444444444440"
    ],
    pipe_body_left: [
        "0499999999999994",
        "0499888888888994",
        "0498888888888894",
        "0498888888888894",
        "0499888888888994",
        "0499999999999994",
        "0499999999999994",
        "0499888888888994",
        "0498888888888894",
        "0498888888888894",
        "0499888888888994",
        "0499999999999994",
        "0499999999999994",
        "0499888888888994",
        "0498888888888894",
        "0498888888888894"
    ],
    pipe_body_right: [
        "49999999999999940",
        "49988888888889940",
        "49888888888888940",
        "49888888888888940",
        "49988888888889940",
        "49999999999999940",
        "49999999999999940",
        "49988888888889940",
        "49888888888888940",
        "49888888888888940",
        "49988888888889940",
        "49999999999999940",
        "49999999999999940",
        "49988888888889940",
        "49888888888888940",
        "49888888888888940"
    ]
};

const PRE_RENDERED = {};

function createPixelSprite(rawArray) {
    const height = rawArray.length;
    const width = rawArray[0].length;
    const cvs = document.createElement('canvas');
    cvs.width = width;
    cvs.height = height;
    const cx = cvs.getContext('2d', {alpha: true});
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const char = rawArray[y][x];
            if (char !== '0' && PALETTE[char]) {
                cx.fillStyle = PALETTE[char];
                cx.fillRect(x, y, 1, 1);
            }
        }
    }
    return cvs;
}

function initSprites() {
    for (let key in RAW_SPRITES) {
        PRE_RENDERED[key] = createPixelSprite(RAW_SPRITES[key]);
    }
}

function resizeCanvas() {
    const wrapper = document.getElementById('game-wrapper');
    const wrapperRect = wrapper.getBoundingClientRect();
    
    // Maintain internal resolution of 400x240, scale up to fit wrapper
    const scaleX = wrapperRect.width / GAME_WIDTH;
    const scaleY = wrapperRect.height / GAME_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    
    ctx.imageSmoothingEnabled = false; // Sharp pixels
}

window.addEventListener('resize', resizeCanvas);

window.addEventListener('keydown', e => {
    if(e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if(e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if(e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if(!keys.jumpHeld) keys.jump = true;
        keys.jumpHeld = true;
        e.preventDefault();
    }
});

window.addEventListener('keyup', e => {
    if(e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if(e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if(e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        keys.jump = false;
        keys.jumpHeld = false;
    }
});

// Mobile touch controls
const touchBtn = (id, keyName) => {
    const btn = document.getElementById(id);
    if(btn) {
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[keyName] = true; if(keyName==='jump') keys.jumpHeld = true; });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[keyName] = false; if(keyName==='jump') keys.jumpHeld = false; });
    }
};
touchBtn('btn-left', 'left');
touchBtn('btn-right', 'right');
touchBtn('btn-jump', 'jump');

let audioCtx = null;
function initAudio() {
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
}

function playSound(type) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'jump') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.05); // E6
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'stomp') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'bump') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'die') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.5);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.start(now); osc.stop(now + 0.5);
    }
}

const LEVEL_MAP = [
    "                                                                                ",
    "                                                                                ",
    "                                                                                ",
    "                                                                                ",
    "                                                                                ",
    "                                                                                ",
    "                      ?                                                         ",
    "                                                                                ",
    "               ?   B?B?B      ?                                                 ",
    "                                                                                ",
    "                                       []          []                   |       ",
    "                                 E     ()          ()                   |       ",
    "    E                 E                ()    E     ()                   |       ",
    "GGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGG",
    "GGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGG"
];
// G: Ground, B: Brick, ?: Question, [: PipeTopL, ]: PipeTopR, (: PipeBodyL, ): PipeBodyR, E: Goomba, |: Goal

class Player {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.width = 12; this.height = 16;
        this.vx = 0; this.vy = 0;
        this.speed = 120; // pixels per second
        this.maxFallSpeed = 250;
        this.jumpForce = 220;
        this.gravity = 600;
        this.grounded = false;
        this.facingRight = true;
        this.dead = false;
        this.animTimer = 0;
    }

    update(dt) {
        if (this.dead) {
            this.vy += this.gravity * dt;
            this.y += this.vy * dt;
            return;
        }

        // X movement logic (Acceleration & Friction)
        let accel = 400 * dt;
        let friction = 0.8;
        
        if (keys.left) { this.vx -= accel; this.facingRight = false; }
        else if (keys.right) { this.vx += accel; this.facingRight = true; }
        else { this.vx *= friction; } // Apply friction when no key pressed

        // Cap X speed
        this.vx = clamp(this.vx, -this.speed, this.speed);
        if (Math.abs(this.vx) < 5) this.vx = 0; // Stop completely if very slow

        // Move X
        this.x += this.vx * dt;
        this.handleCollisions(true); // Resolve X

        // Prevent walking off left screen edge
        if (this.x < cameraX) { this.x = cameraX; this.vx = 0; }

        // Y movement logic (Gravity & Jump)
        this.vy += this.gravity * dt;
        
        // Variable Jump (Hold space to jump higher)
        if (keys.jumpHeld && this.vy < 0) {
            this.vy -= (this.gravity * 0.4) * dt; // reduce gravity pull while holding jump
        }

        if (keys.jump && this.grounded) {
            this.vy = -this.jumpForce;
            this.grounded = false;
            keys.jump = false; // consume key
            playSound('jump');
        }

        this.vy = Math.min(this.vy, this.maxFallSpeed);

        // Move Y
        this.y += this.vy * dt;
        this.grounded = false; // assume falling until collision says otherwise
        this.handleCollisions(false); // Resolve Y

        // Death by pit
        if (this.y > GAME_HEIGHT) this.die();

        // Animation Timer
        this.animTimer += dt * Math.abs(this.vx) * 0.1;
    }

    handleCollisions(isX) {
        const rect = { left: this.x, right: this.x + this.width, top: this.y, bottom: this.y + this.height };
        
        for (let block of blocks) {
            if (rect.right > block.x && rect.left < block.x + block.width &&
                rect.bottom > block.y && rect.top < block.y + block.height) {
                
                if (block.type === 'goal') {
                    triggerVictory();
                    return;
                }

                if (isX) {
                    if (this.vx > 0) { this.x = block.x - this.width; this.vx = 0; }
                    else if (this.vx < 0) { this.x = block.x + block.width; this.vx = 0; }
                } else {
                    if (this.vy > 0) { 
                        this.y = block.y - this.height; 
                        this.vy = 0; 
                        this.grounded = true; 
                    }
                    else if (this.vy < 0) { 
                        this.y = block.y + block.height; 
                        this.vy = 0; 
                        block.bump(); 
                    }
                }
            }
        }
    }

    die() {
        if(this.dead) return;
        this.dead = true;
        this.vy = -200; // Death hop
        playSound('die');
        setTimeout(() => { gameState = 'GAMEOVER'; document.getElementById('gameOverScreen').classList.remove('hidden'); document.getElementById('finalScoreText').textContent = "SCORE: " + score; }, 1500);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(Math.floor(this.x + this.width/2), Math.floor(this.y + this.height/2));
        if (!this.facingRight) ctx.scale(-1, 1);
        
        let sprite = PRE_RENDERED.mario_idle;
        if (this.dead) {
            sprite = PRE_RENDERED.mario_jump; // Simplify dead sprite
        } else if (!this.grounded) {
            sprite = PRE_RENDERED.mario_jump;
        } else if (Math.abs(this.vx) > 10) {
            // Toggle run animation
            sprite = Math.floor(this.animTimer) % 2 === 0 ? PRE_RENDERED.mario_run : PRE_RENDERED.mario_idle;
        }

        ctx.drawImage(sprite, -sprite.width/2, -sprite.height/2);
        ctx.restore();
    }
}

class Goomba {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.width = 16; this.height = 16;
        this.vx = -30; this.vy = 0;
        this.gravity = 600;
        this.dead = false;
        this.deadTimer = 0;
        this.animTimer = 0;
    }
    update(dt) {
        if (this.dead) {
            this.deadTimer -= dt;
            return;
        }

        this.vy += this.gravity * dt;
        this.x += this.vx * dt;
        this.handleCollisions(true);
        this.y += this.vy * dt;
        this.handleCollisions(false);

        // Fall off screen
        if (this.y > GAME_HEIGHT) this.dead = true;

        this.animTimer += dt * 5;
    }
    handleCollisions(isX) {
        const rect = { left: this.x, right: this.x + this.width, top: this.y, bottom: this.y + this.height };
        for (let block of blocks) {
            if (block.type === 'goal') continue;
            if (rect.right > block.x && rect.left < block.x + block.width &&
                rect.bottom > block.y && rect.top < block.y + block.height) {
                if (isX) {
                    this.vx *= -1; // Reverse direction on wall hit
                    if(this.vx > 0) this.x = block.x + block.width;
                    else this.x = block.x - this.width;
                } else {
                    if (this.vy > 0) { this.y = block.y - this.height; this.vy = 0; }
                }
            }
        }
    }
    draw(ctx) {
        if (this.dead && this.deadTimer <= 0) return;
        let sprite = PRE_RENDERED.goomba_walk1;
        if (this.dead) sprite = PRE_RENDERED.goomba_dead;
        else if (Math.floor(this.animTimer) % 2 === 0) sprite = PRE_RENDERED.goomba_walk1; 
        
        ctx.save();
        ctx.translate(Math.floor(this.x + this.width/2), Math.floor(this.y + this.height/2));
        if (!this.dead && Math.floor(this.animTimer) % 2 === 0) ctx.scale(-1, 1); 
        ctx.drawImage(sprite, -sprite.width/2, -sprite.height/2);
        ctx.restore();
    }
}

class Block {
    constructor(x, y, type) {
        this.baseX = x; this.baseY = y;
        this.x = x; this.y = y;
        this.width = TILE_SIZE; this.height = TILE_SIZE;
        this.type = type; 
        this.bumpOffsetY = 0;
        this.bumpVy = 0;
    }
    bump() {
        if (this.type === 'question') {
            this.type = 'question_empty';
            this.bumpVy = -60;
            addCoin(this.x, this.y);
        } else if (this.type === 'brick') {
            this.bumpVy = -60;
            playSound('bump');
            // Create breaking particles
            createParticles(this.x + 8, this.y + 8, '#CC4E00');
            // Remove block (destroy)
            blocks = blocks.filter(b => b !== this);
        } else if (this.type === 'question_empty' || this.type === 'pipe_top_left' || this.type === 'pipe_top_right') {
            playSound('bump');
        }
    }
    update(dt) {
        if (this.bumpVy !== 0 || this.bumpOffsetY !== 0) {
            this.bumpVy += 400 * dt; // gravity for bump
            this.bumpOffsetY += this.bumpVy * dt;
            if (this.bumpOffsetY > 0) {
                this.bumpOffsetY = 0;
                this.bumpVy = 0;
            }
            this.y = this.baseY + this.bumpOffsetY;
        }
    }
    draw(ctx) {
        if (this.type === 'goal') {
            ctx.fillStyle = '#FBD000';
            ctx.fillRect(this.x + 6, this.y, 4, this.height);
            return;
        }
        const sprite = PRE_RENDERED[this.type];
        if (sprite) ctx.drawImage(sprite, this.x, this.y);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y;
        this.vx = random(-100, 100);
        this.vy = random(-150, -50);
        this.color = color;
        this.life = 1.0;
    }
    update(dt) {
        this.vy += 600 * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(Math.floor(this.x), Math.floor(this.y), 4, 4);
    }
}

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function random(min, max) { return Math.random() * (max - min) + min; }

function addCoin(x, y) {
    playSound('coin');
    coins++;
    addScore(100, x, y);
    document.getElementById('coinDisplay').textContent = "x" + String(coins).padStart(2, '0');
    // Floating coin particle
    let p = new Particle(x + 8, y - 8, '#FBD000');
    p.vx = 0; p.vy = -120;
    particles.push(p);
}

function addScore(amount, x, y) {
    score += amount;
    document.getElementById('scoreDisplay').textContent = String(score).padStart(6, '0');
}

function createParticles(x, y, color) {
    for(let i=0; i<4; i++) particles.push(new Particle(x, y, color));
}

let player;

function loadLevel() {
    blocks = [];
    enemies = [];
    particles = [];
    cameraX = 0;

    for (let row = 0; row < LEVEL_MAP.length; row++) {
        for (let col = 0; col < LEVEL_MAP[row].length; col++) {
            const char = LEVEL_MAP[row][col];
            const x = col * TILE_SIZE;
            const y = row * TILE_SIZE;

            if (char === 'G') blocks.push(new Block(x, y, 'ground'));
            else if (char === 'B') blocks.push(new Block(x, y, 'brick'));
            else if (char === '?') blocks.push(new Block(x, y, 'question'));
            else if (char === '[') blocks.push(new Block(x, y, 'pipe_top_left'));
            else if (char === ']') blocks.push(new Block(x, y, 'pipe_top_right'));
            else if (char === '(') blocks.push(new Block(x, y, 'pipe_body_left'));
            else if (char === ')') blocks.push(new Block(x, y, 'pipe_body_right'));
            else if (char === '|') {
                let goal = new Block(x, y, 'goal');
                goal.height = TILE_SIZE * 5; // Tall flagpole
                blocks.push(goal);
            }
            else if (char === 'E') enemies.push(new Goomba(x, y));
        }
    }
    player = new Player(50, 50);
}

function triggerVictory() {
    if(gameState === 'VICTORY') return;
    gameState = 'VICTORY';
    document.getElementById('victoryScreen').classList.remove('hidden');
    document.getElementById('victoryScoreText').textContent = "FINAL SCORE: " + score;
}

function startGame() {
    initAudio();
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('victoryScreen').classList.add('hidden');
    score = 0; coins = 0;
    document.getElementById('scoreDisplay').textContent = "000000";
    document.getElementById('coinDisplay').textContent = "x00";
    loadLevel();
    gameState = 'PLAYING';
    lastTime = performance.now();
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);
document.getElementById('nextLevelBtn').addEventListener('click', startGame);

function checkEnemyCollisions() {
    if (player.dead) return;
    const pRect = { left: player.x, right: player.x + player.width, top: player.y, bottom: player.y + player.height };
    
    for (let e of enemies) {
        if (e.dead) continue;
        const eRect = { left: e.x, right: e.x + e.width, top: e.y, bottom: e.y + e.height };

        if (pRect.right > eRect.left && pRect.left < eRect.right &&
            pRect.bottom > eRect.top && pRect.top < eRect.bottom) {
            
            // Stomp detection (player falling and bottom is near enemy top)
            if (player.vy > 0 && pRect.bottom < eRect.top + 8) {
                e.dead = true;
                e.deadTimer = 0.5; // corpse stays for half a second
                player.vy = -150; // Bounce off enemy
                playSound('stomp');
                addScore(200, e.x, e.y);
            } else {
                player.die();
            }
        }
    }
}

function update(dt) {
    if (gameState !== 'PLAYING') {
        if (gameState === 'GAMEOVER' && player) player.update(dt); // allow death animation
        return;
    }

    player.update(dt);
    
    // Camera follow logic
    if (player.x > cameraX + GAME_WIDTH / 2.5) {
        cameraX = player.x - GAME_WIDTH / 2.5;
    }
    // Prevent backing up
    if (player.x < cameraX) player.x = cameraX;

    // Only update enemies near the camera to save performance and mimic original behavior
    for (let e of enemies) {
        if (e.x < cameraX + GAME_WIDTH + 64 && e.x > cameraX - 64) {
            e.update(dt);
        }
    }

    for (let b of blocks) b.update(dt);

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(dt);
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    checkEnemyCollisions();
}

function draw() {
    // Background color is handled by CSS on wrapper, but we clear canvas anyway
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'START') return;

    ctx.save();
    ctx.translate(Math.floor(-cameraX), 0);

    // Draw Clouds/Bushes (Simple procedural geometric shapes for retro feel)
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.8;
    for(let i=0; i<10; i++) {
        let cx = (i * 200) % (LEVEL_MAP[0].length * TILE_SIZE);
        ctx.fillRect(cx + 50, 40, 40, 16);
        ctx.fillRect(cx + 60, 30, 20, 10);
    }
    ctx.globalAlpha = 1.0;

    for (let b of blocks) {
        if (b.x > cameraX - TILE_SIZE && b.x < cameraX + GAME_WIDTH) {
            b.draw(ctx);
        }
    }

    for (let e of enemies) {
        if (e.x > cameraX - TILE_SIZE && e.x < cameraX + GAME_WIDTH) {
            e.draw(ctx);
        }
    }

    for (let p of particles) p.draw(ctx);

    if (player) player.draw(ctx);

    ctx.restore();
}

function gameLoop(timestamp) {
    let frameTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    // Prevent huge jumps if tab was inactive
    if (frameTime > 0.1) frameTime = 0.1;

    accumulator += frameTime;

    // Fixed time step for physics stability
    while (accumulator >= TIME_STEP) {
        update(TIME_STEP);
        accumulator -= TIME_STEP;
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize and Start
initSprites();
resizeCanvas();
requestAnimationFrame(gameLoop);