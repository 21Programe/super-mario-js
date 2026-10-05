# Super JS Bros — Ultra Edition

Um jogo de plataforma 2D desenvolvido em **JavaScript puro + HTML5 Canvas**, criado como estudo prático de arquitetura de engines, física, renderização e gerenciamento de estado no navegador.

## 🎮 Demo

Abra o projeto em um servidor HTTP local:

```bash
python -m http.server 8000
```

Depois acesse:

```
http://127.0.0.1:8000
```

> O projeto usa módulos ES e assets locais, então abrir `index.html` diretamente com `file://` pode causar limitações do navegador.

## O que este projeto demonstra

- Engine de jogo própria em JavaScript;
- loop de atualização com **timestep fixo de 60 Hz**;
- física 2D com colisão AABB;
- movimento com aceleração, atrito, gravidade e pulo variável;
- máquina de estados do jogador;
- câmera com acompanhamento suave e screen shake;
- sistema de partículas;
- IA simples de inimigos;
- fases declarativas em dados;
- carregamento assíncrono de assets;
- renderização pixel-art via Canvas;
- suporte a teclado, Gamepad e controles touch;
- Web Audio API para efeitos e música;
- persistência de score, vidas e configurações no Local Storage.

## Arquitetura

```text
Super JS Bros
│
├── engine.js        # Game loop, câmera, inimigos, colisões e regras
├── physics.js       # Física e AABB
├── render.js        # Canvas, câmera e sprites
├── input.js         # Teclado, Gamepad e touch
├── state.js         # Estado global e Local Storage
├── levels.js        # Dados e parser das fases
├── audio.js         # Web Audio API
├── asset-loader.js  # Carregamento dos sprites
├── script.js        # Bootstrap da aplicação
├── assets/
│   ├── player-sheet.svg
│   ├── enemy-sheet.svg
│   └── tiles-sheet.svg
└── ARCHITECTURE.md
```

## Física

A simulação usa um acumulador com passo fixo:

```text
renderização → variável
física       → 1/60 s
```

Isso reduz a dependência da lógica de jogo em relação à taxa de atualização do monitor.

O projeto também utiliza:

- aceleração no solo e no ar;
- velocidade máxima de caminhada/corrida;
- gravidade e limite de queda;
- pulo variável;
- colisão horizontal e vertical;
- subpixel através de valores de posição/velocidade em ponto flutuante.

## Estados do jogador

```text
Idle
Walk
Run
Jump
Fall
Crouch
Die
PowerUp
```

## Controles

| Ação | Teclado | Gamepad / Touch |
|---|---|---|
| Esquerda | ← / A | Analógico / botão |
| Direita | → / D | Analógico / botão |
| Pular | Espaço / W / ↑ | A / botão |
| Correr | Shift | Botão |
| Pausar | Esc | — |
| Mute | M | — |

## Estrutura das fases

As fases não são desenhadas manualmente no Canvas. Elas são descritas como matrizes de caracteres em `levels.js`.

Exemplo conceitual:

```text
. = vazio
# = bloco sólido
? = bloco interativo
E = inimigo
C = moeda
P = power-up
G = objetivo
```

Isso permite criar novas fases alterando dados, sem reescrever a engine.

## Decisões técnicas

### Por que JavaScript puro?

O objetivo é demonstrar domínio dos fundamentos da plataforma web sem esconder a lógica atrás de uma engine externa.

### Por que Canvas?

Canvas fornece controle direto sobre o pipeline de renderização e permite implementar câmera, sprites, partículas e pixel-art de forma explícita.

### Por que módulos ES?

A engine foi dividida em responsabilidades independentes para facilitar manutenção e evolução.

## Estado atual

**Funcionalidades implementadas:**

- [x] Engine modular
- [x] Física 2D
- [x] AABB
- [x] Câmera
- [x] Partículas
- [x] IA básica de inimigos
- [x] Power-ups
- [x] Moedas e pontuação
- [x] Múltiplas fases
- [x] Áudio
- [x] Gamepad
- [x] Touch
- [x] Persistência local
- [x] Asset loader

## Próximas evoluções

- testes automatizados para física e colisão;
- entidades/componentes para reduzir acoplamento da classe `Game`;
- sistema formal de eventos;
- pooling de partículas e projéteis;
- mais fases e inimigos;
- ferramentas para criação de níveis;
- build/minificação para distribuição;
- deploy da demo com GitHub Pages.

## Objetivo de portfólio

Este projeto representa uma etapa prática de estudo de:

**JavaScript → arquitetura → física → renderização → sistemas de jogos → engenharia de software.**

## Autor

**Diego Alves de Souza — 21Programe**

GitHub: https://github.com/21Programe
