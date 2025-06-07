const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 32;
const rows = 10;
const cols = 20;
let pulseTime = 0;
let currentScene = 1;

const player = { x: 1, y: 1, color: '#4FA3D9' };

function resizeCanvas() {
    // Show touch controls if device supports touch
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.getElementById('touch-controls').style.display = 'flex';
  }
  
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas(); // run on load
  

// Maze map
const mazeMap = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,0,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],
  [1,1,1,0,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1],
  [1,1,1,0,0,0,1,1,1,1,0,0,0,1,1,1,1,1,1,1],
  [1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1],
  [1,1,1,1,1,0,0,0,0,0,0,1,0,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Push puzzle map
const puzzleMap = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
// Bridge scene
const bridgeMap = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

let blocks = [
  { x: 2, y: 2, placed: false },
  { x: 6, y: 2, placed: false },
  { x: 10, y: 2, placed: false },
  { x: 14, y: 2, placed: false }
];

const dialogue = [
  { x: 3, y: 2, text: "I wandered blind through silence and shadow..." },
  { x: 5, y: 3, text: "No path was clear—only doubt, only dark." },
  { x: 10, y: 4, text: "But something gentle shimmered in the black." },
  { x: 15, y: 8, text: "You were the light... even when I couldn't see." }
];

const goalDialogues = [
  "Even in pieces, I pushed forward.",
  "Each step closer, your light grew brighter.",
  "Your kindness kept guiding me silently.",
  "And now, I'm ready to tell you how I feel."
];

const bridgeDialogue = "I just needed the courage to cross...";

let currentDialogue = null;
dialogueTimer = 180; // ~3 seconds at 60fps
let shownGoalDialogueCount = 0;

const goals = [
  { x: 3, y: 7 },
  { x: 7, y: 7 },
  { x: 11, y: 7 },
  { x: 15, y: 7 }
];

function allBlocksInPlace() {
  return goals.every(g => blocks.some(b => b.x === g.x && b.y === g.y));
}

function drawMap(pulseRadius = 0) {
    const map = currentScene === 1 ? mazeMap : currentScene === 2 ? puzzleMap : bridgeMap;
    const mapRows = map.length;
    const mapCols = map[0].length;
  
    for (let y = 0; y < mapRows; y++) {
      for (let x = 0; x < mapCols; x++) {
        const tile = map[y][x];
        const dx = x - player.x, dy = y - player.y;
        const dist = Math.hypot(dx, dy) * TILE_SIZE;
  
        // Only show tiles within pulse or special tiles
        if (dist <= pulseRadius || tile === 2) {
          if (tile === 1) {
            ctx.fillStyle = '#1A1A2E';
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          } else if (tile === 2) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 12, 0, 2 * Math.PI);
            ctx.fill();
          } else {
            ctx.fillStyle = '#000';
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }
  
    // Only show blocks within pulse on scene 2
    if (currentScene === 2) {
      ctx.fillStyle = '#D98AFF';
      for (const b of blocks) {
        const dx = b.x - player.x, dy = b.y - player.y;
        const dist = Math.hypot(dx, dy) * TILE_SIZE;
        if (dist <= pulseRadius) {
          ctx.fillRect(b.x * TILE_SIZE + 4, b.y * TILE_SIZE + 4, 24, 24);
        }
      }
    }
  }
  
  

function drawPulseOverlay(pulseRadius) {
  const grad = ctx.createRadialGradient(player.x * TILE_SIZE + 16, player.y * TILE_SIZE + 16, 0, player.x * TILE_SIZE + 16, player.y * TILE_SIZE + 16, pulseRadius);
  grad.addColorStop(0, 'rgba(255,138,216,0.3)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x * TILE_SIZE + 16, player.y * TILE_SIZE + 16, 12, 0, 2 * Math.PI);
  ctx.fill();
}

function canMove(x, y) {
const map = currentScene === 1 ? mazeMap : currentScene === 2 ? puzzleMap : bridgeMap;
  if (x < 0 || y < 0 || x >= cols || y >= rows) return false;
  if (currentScene === 1) return map[y][x] !== 1;
  return map[y][x] !== 1 && !blocks.some(b => b.x === x && b.y === y);
}

function checkGoal() {
    if (currentScene === 1 && mazeMap[player.y][player.x] === 2) {
      currentScene = 2;
      player.x = 1;
      player.y = 1;
    } else if (currentScene === 2 && allBlocksInPlace()) {
      currentScene = 3;
      player.x = 1;
      player.y = 1;
    } else if (currentScene === 3 && player.x === 18 && player.y === 1) {
      currentScene = 4;
    }
  }

  function movePlayer(dx, dy) {
    const tx = player.x + dx;
    const ty = player.y + dy;
    if (currentScene === 2) {
      const b = blocks.find(b => b.x === tx && b.y === ty);
      if (b) {
        const nx = b.x + dx, ny = b.y + dy;
        if (canMove(nx, ny)) {
          b.x = nx; b.y = ny;
          if (goals.some(g => g.x === b.x && g.y === b.y) && !b.placed) {
            currentDialogue = goalDialogues[shownGoalDialogueCount];
            dialogueTimer = 100;
            b.placed = true;
            shownGoalDialogueCount++;
          }
        } else return;
      }
    }
    if (canMove(tx, ty)) {
      player.x = tx;
      player.y = ty;
      checkGoal();
      if (currentScene === 3 && player.x === 10 && player.y === 1) {
        currentDialogue = bridgeDialogue;
        dialogueTimer = 120;
      }
    }
  }

  function render() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    pulseTime += 0.05;
    const r = 64 + Math.sin(pulseTime) * 20;

      // Dynamic pulse radius by scene
  let pulseRadius;
  if (currentScene === 1) {
    pulseRadius = 64 + Math.sin(pulseTime) * 20;
  } else if (currentScene === 2 || currentScene === 3) {
    pulseRadius = 100 + Math.sin(pulseTime) * 40;
  }
  
    drawMap(r);
    drawPlayer();
    drawPulseOverlay(r);
  
    if (currentScene === 1) {
      const d = dialogue.find(d => d.x === player.x && d.y === player.y);
      if (d) {
        currentDialogue = d.text;
        dialogueTimer = 180;
      } else if (dialogueTimer > 0) {
        dialogueTimer--;
      }
    } else if (currentScene === 2 || currentScene === 3) {
      if (dialogueTimer > 0) dialogueTimer--;
    } else {
      ctx.fillStyle = '#FFD700';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("You cleared the path", canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillText("Elizabeth", canvas.width / 2, canvas.height / 2 + 10);
      ctx.fillText("I like you so... do you feel the same? 💛", canvas.width / 2, canvas.height / 2 + 50);
    }
  
    if (dialogueTimer > 0 && currentDialogue) {
        const boxWidth = canvas.width - 40;
        const boxHeight = 60;
        const boxX = 20;
        const boxY = 20;
      
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      
        // Text
        ctx.fillStyle = 'white';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(currentDialogue, canvas.width / 2, boxY + 36);
      }
      
  }  

function gameLoop() {
  render();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') movePlayer(0,-1);
  if (e.key === 'ArrowDown') movePlayer(0,1);
  if (e.key === 'ArrowLeft') movePlayer(-1,0);
  if (e.key === 'ArrowRight') movePlayer(1,0);
});

gameLoop();
