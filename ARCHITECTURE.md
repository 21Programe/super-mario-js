# Super JS Bros — Ultra Edition

Refatoração orientada a estado do jogo HTML5/Canvas.

## Arquitetura
- `engine.js`: Engine, câmera, IA, partículas, projéteis e loop fixo.
- `physics.js`: AABB sub-pixel, gravidade, aceleração, atrito e pulo variável.
- `render.js`: Renderização pixel-art com OffscreenCanvas + fallback.
- `input.js`: teclado, Gamepad/joystick e touch.
- `audio.js`: Web Audio polifônico, música em loop e SFX simultâneos.
- `state.js`: estado global e persistência Local Storage.
- `levels.js`: fases declarativas em matrizes de dados.
- `enhancements.js`: checkpoints, estrela, goal e screen shake.
- `script.js`: bootstrap mínimo.

## Controles
Setas/WASD, Shift para corrida, Espaço para pulo, Escape para pausa e M para mute. Em dispositivos compatíveis, Gamepad e controles touch funcionam em paralelo.

## Estado do jogador
`Idle`, `Walk`, `Run`, `Jump`, `Fall`, `Crouch`, `Die`, `PowerUp`.

## Garantias técnicas
A simulação usa timestep fixo de 1/60 s com acumulador e limite de frame para desacoplar a física da taxa de atualização do monitor. Isso torna a simulação consistente em 60/120/144 Hz; não significa que um navegador possa garantir renderização física de 60 FPS em qualquer hardware.

## Persistência
Score, vidas e mute são salvos em Local Storage. Checkpoint é salvo progressivamente durante a fase.
