// Minimal canvas game: "Dodge the Beats"
// Move left/right to avoid falling beats. Score increases over time.
// Controls: Left/Right arrow, A/D, touch left/right, click to start. Space to pause.

(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let W = canvas.width, H = canvas.height;
  const deviceRatio = window.devicePixelRatio || 1;

  // scale canvas for crispness on retina
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(600, Math.round(rect.width));
    H = Math.round(rect.height || 360);
    canvas.width = Math.round(W * deviceRatio);
    canvas.height = Math.round(H * deviceRatio);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // game state
  const player = {
    x: W / 2,
    y: H - 48,
    w: 44,
    h: 24,
    speed: 7,
    color: '#ffd166'
  };

  let keys = {};
  let touches = { left: false, right: false };
  let obstacles = [];
  let spawnTimer = 0;
  let spawnRate = 1000; // ms
  let lastTime = 0;
  let running = false;
  let paused = false;
  let score = 0;
  let best = localStorage.getItem('cb_best') ? +localStorage.getItem('cb_best') : 0;

  // UI elements
  const overlay = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');
  const stateTitle = document.getElementById('stateTitle');
  const stateText = document.getElementById('stateText');
  const scoreInfo = document.getElementById('scoreInfo');

  function resetGame() {
    obstacles = [];
    spawnTimer = 0;
    score = 0;
    player.x = W / 2;
    running = false;
    paused = false;
    stateTitle.textContent = 'Play';
    stateText.textContent = 'Press Space or Click to start';
    scoreInfo.textContent = `Best: ${best}`;
    overlay.style.display = 'flex';
  }

  function startGame() {
    obstacles = [];
    spawnTimer = 0;
    lastTime = performance.now();
    running = true;
    paused = false;
    overlay.style.display = 'none';
    stateTitle.textContent = 'Playing';
    stateText.textContent = '';
    scoreInfo.textContent = '';
  }

  function gameOver() {
    running = false;
    overlay.style.display = 'flex';
    stateTitle.textContent = 'Game Over';
    stateText.textContent = `Score: ${Math.floor(score)} — Click to retry`;
    if (score > best) {
      best = Math.floor(score);
      localStorage.setItem('cb_best', best);
    }
    scoreInfo.textContent = `Best: ${best}`;
  }

  function spawnObstacle() {
    const size = 18 + Math.random() * 40;
    const x = 20 + Math.random() * (W - 40 - size);
    const speed = 1.2 + Math.random() * 3 + Math.min(score / 100, 3);
    obstacles.push({
      x, y: -size - 10, r: size / 2, speed, color: `hsl(${Math.random()*60+180}, 80%, 60%)`
    });
  }

  function rectCircleCollide(rx, ry, rw, rh, cx, cy, cr) {
    // nearest point on rect
    const nx = Math.max(rx, Math.min(cx, rx + rw));
    const ny = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - nx;
    const dy = cy - ny;
    return dx * dx + dy * dy < cr * cr;
  }

  function update(dt) {
    // player input
    let move = 0;
    if (keys['ArrowLeft'] || keys['a']) move -= 1;
    if (keys['ArrowRight'] || keys['d']) move += 1;
    if (touches.left) move -= 1;
    if (touches.right) move += 1;
    player.x += move * player.speed;
    // clamp
    player.x = Math.max(10, Math.min(player.x, W - player.w - 10));

    // spawn obstacles
    spawnTimer += dt;
    const rate = Math.max(400, spawnRate - Math.floor(score) * 3);
    if (spawnTimer > rate) {
      spawnTimer = 0;
      spawnObstacle();
    }

    // update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      o.y += o.speed * dt * 0.12;
      if (o.y - o.r > H + 60) obstacles.splice(i, 1);
      // collision
      if (rectCircleCollide(player.x, player.y, player.w, player.h, o.x + o.r, o.y + o.r, o.r)) {
        gameOver();
      }
    }

    // score by time alive
    score += dt * 0.01;
  }

  function draw() {
    // clear
    ctx.clearRect(0, 0, W, H);

    // background gradients
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#07102a');
    g.addColorStop(1, '#05121b');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // draw grid/tones
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#ffffff';
    for (let x = 0; x < W; x += 30) {
      ctx.fillRect(x, H - 2 - (x % 90 === 0 ? 6 : 0), 2, 2);
    }
    ctx.restore();

    // draw obstacles (beats)
    for (const o of obstacles) {
      ctx.beginPath();
      ctx.fillStyle = o.color;
      ctx.shadowColor = o.color;
      ctx.shadowBlur = 12;
      ctx.arc(o.x + o.r, o.y + o.r, o.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // draw player
    ctx.save();
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.restore();

    // HUD
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px Inter, Arial';
    ctx.fillText(`Score: ${Math.floor(score)}`, 14, 22);
    ctx.fillText(`Best: ${best}`, 14, 40);
  }

  function loop(ts) {
    if (!lastTime) lastTime = ts;
    const dt = ts - lastTime;
    lastTime = ts;
    if (running && !paused) {
      update(dt);
    }
    draw();
    requestAnimationFrame(loop);
  }

  // Controls
  window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if ((e.key === ' ' || e.key === 'Spacebar') && !running) {
      startGame();
    } else if (e.key === ' ' && running) {
      // toggle pause
      paused = !paused;
      overlay.style.display = paused ? 'flex' : 'none';
      stateTitle.textContent = paused ? 'Paused' : 'Playing';
      stateText.textContent = paused ? 'Press Space to resume' : '';
    }
  });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; });

  // mouse / click
  canvas.addEventListener('click', (e) => {
    if (!running) startGame();
    // clicking left/right of canvas for movement
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    touches.left = x < rect.width / 2;
    touches.right = x >= rect.width / 2;
    setTimeout(()=>{ touches.left=false; touches.right=false }, 120);
  });

  // touch controls
  canvas.addEventListener('touchstart', (ev) => {
    ev.preventDefault();
    if (!running) startGame();
    const rect = canvas.getBoundingClientRect();
    for (const t of ev.touches) {
      const x = t.clientX - rect.left;
      if (x < rect.width / 2) touches.left = true;
      else touches.right = true;
    }
  }, { passive: false });
  canvas.addEventListener('touchend', () => { touches.left = touches.right = false; });

  // start button
  startBtn.addEventListener('click', () => startGame());
  overlay.addEventListener('click', (e) => {
    // only handle direct overlay clicks (not button)
    if (e.target === overlay) {
      if (!running) startGame();
    }
  });

  // initialize
  resetGame();
  requestAnimationFrame(loop);
})();
