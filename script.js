// Minimal canvas game: "Save Your Money"
// Move left/right to avoid money-eaters. Keep your money safe!
// Controls: Left/Right arrow, A/D, touch left/right, click to start. Space to pause.

(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  let W = canvas.width,
    H = canvas.height;
  const deviceRatio = window.devicePixelRatio || 1;
  const gameWrap = document.getElementById("game-wrap");

  // scale canvas for crispness on retina
  function resizeCanvas() {
    // Get the parent container's size to properly resize canvas
    const wrapRect = gameWrap.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    W = Math.max(600, Math.round(canvasRect.width));
    H = Math.round(canvasRect.height || 360);

    canvas.width = Math.round(W * deviceRatio);
    canvas.height = Math.round(H * deviceRatio);
    canvas.style.width = "100%"; // Let CSS handle the width
    canvas.style.height = H + "px";
    ctx.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // game state
  const player = {
    x: W / 2,
    y: H - 48,
    w: 32,
    h: 32,
    speed: 6, // Increased from 5
    emoji: "💰",
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
  let best = localStorage.getItem("cb_best")
    ? +localStorage.getItem("cb_best")
    : 0;

  // Night sky elements
  let stars = [];
  let shootingStars = [];
  let shootingStarTimer = 0;
  let moonFloat = 0; // Moon floating animation

  // Initialize stars with relative positioning
  function initStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        xPercent: Math.random(), // 0-1 relative to canvas width
        yPercent: Math.random(), // 0-1 relative to canvas height
        size: Math.random() * 2 + 1,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        brightness: Math.random() * 0.8 + 0.2,
      });
    }
  }

  // Initialize shooting stars with relative positioning
  function createShootingStar() {
    return {
      xPercent: Math.random() + 1, // Start off-screen right (>1.0)
      yPercent: Math.random() * 0.5, // Top half of screen
      speed: Math.random() * 5 + 3,
      length: Math.random() * 80 + 40,
      life: 1.0,
      decay: Math.random() * 0.02 + 0.01,
    };
  }

  // UI elements
  const overlay = document.getElementById("overlay");
  const startBtn = document.getElementById("startBtn");
  const stateTitle = document.getElementById("stateTitle");
  const stateText = document.getElementById("stateText");
  const scoreInfo = document.getElementById("scoreInfo");
  const playerNameInput = document.getElementById("playerName");
  const nameInputDiv = document.getElementById("nameInput");
  const dayNightToggle = document.getElementById("dayNightToggle");

  let playerName = "";
  let isNightMode = true; // Start with night mode
  let sunFloat = 0; // For sun animation in day mode

  function resetGame() {
    obstacles = [];
    spawnTimer = 0;
    score = 0;
    player.x = W / 2;
    running = false;
    paused = false;
    stateTitle.textContent = "Welcome!";
    stateText.textContent = "Enter your name and click Start to begin";
    scoreInfo.textContent = `Best: $${best}`;
    nameInputDiv.style.display = "block"; // Show name input
    overlay.style.display = "flex";
    initStars(); // Initialize stars when game resets
  }

  function startGame() {
    // Get player name or use default
    playerName = playerNameInput.value.trim() || "Player";

    obstacles = [];
    spawnTimer = 0;
    score = 0; // Reset score to 0 on game start
    player.x = W / 2; // Reset player position
    lastTime = performance.now();
    running = true;
    paused = false;
    overlay.style.display = "none";
    nameInputDiv.style.display = "none"; // Hide name input during game
    stateTitle.textContent = "Playing";
    stateText.textContent = "";
    scoreInfo.textContent = "";
  }

  function gameOver() {
    running = false;
    overlay.style.display = "flex";
    const amountLost = Math.floor(score);

    stateTitle.textContent = `${playerName} Lost Money!`;
    stateText.textContent = `${playerName}, you lost $${amountLost}! Better luck next time.`;

    if (score > best) {
      best = Math.floor(score);
      localStorage.setItem("cb_best", best);
    }
    scoreInfo.textContent = `Best: $${best}`;
    nameInputDiv.style.display = "none"; // Hide name input on game over
  }

  function spawnObstacle() {
    const size = 24 + Math.random() * 16;

    // Target player position more often (70% of the time)
    let x;
    if (Math.random() < 0.7) {
      // Spawn closer to player position with some randomness
      const targetX = player.x + player.w / 2;
      const spread = 80; // How much to spread around player
      x = Math.max(
        20,
        Math.min(W - 40 - size, targetX + (Math.random() - 0.5) * spread)
      );
    } else {
      // Random spawn (30% of the time)
      x = 20 + Math.random() * (W - 40 - size);
    }

    // Mixed speed system - some objects start slow, some fast
    let baseSpeed, speedType, speedIncrease;
    const speedRoll = Math.random();

    if (speedRoll < 0.4) {
      // 40% - Slow starters that get faster
      speedType = "slow-accelerate";
      baseSpeed = 0.5 + Math.random() * 0.8; // Start very slow
      speedIncrease = Math.min(score / 150, 3.0); // Gets much faster
    } else if (speedRoll < 0.7) {
      // 30% - Medium speed that stays consistent
      speedType = "consistent";
      baseSpeed = 1.0 + Math.random() * 1.2; // Medium speed
      speedIncrease = Math.min(score / 400, 1.0); // Barely increases
    } else {
      // 30% - Fast from start, doesn't change much
      speedType = "fast-stable";
      baseSpeed = 1.8 + Math.random() * 1.5; // Start fast
      speedIncrease = Math.min(score / 600, 0.8); // Small increase
    }

    const finalSpeed = baseSpeed + speedIncrease;

    // Different types of money-eaters - just emojis
    const moneyEaters = [
      { emoji: "🏛️", type: "tax" }, // Government/taxes
      { emoji: "📄", type: "bill" }, // Bills
      { emoji: "💳", type: "debt" }, // Credit card debt
      { emoji: "🛒", type: "expense" }, // Shopping expenses
      { emoji: "🥷", type: "thief" }, // Thieves
      { emoji: "💸", type: "waste" }, // Money flying away
      { emoji: "🎰", type: "gamble" }, // Gambling
      { emoji: "🍕", type: "food" }, // Food expenses
      { emoji: "👮🏿‍♂️", type: "police" }, // Police
      { emoji: "🧜‍♀️", type: "mermaid" }, // Mermaid
      { emoji: "🐍", type: "snake" }, // Snake
      { emoji: "🐀", type: "rat" }, // Rat
      { emoji: "🍻", type: "drinks" }, // Drinks/alcohol
      { emoji: "🎱", type: "pool" }, // Pool/gambling
      { emoji: "🚓", type: "cop_car" }, // Police car
      { emoji: "🚑", type: "ambulance" }, // Ambulance
      { emoji: "💣", type: "bomb" }, // Bomb
      { emoji: "🪓", type: "axe" }, // Axe
      { emoji: "💊", type: "pills" }, // Pills
      { emoji: "🎁", type: "gift" }, // Gift (expensive)
      { emoji: "❤️", type: "heart" }, // Heart (love costs money)
      { emoji: "👩🏿‍❤️‍💋‍👨🏾", type: "couple" }, // Couple
      { emoji: "🤰🏼", type: "pregnant" }, // Pregnancy costs
      { emoji: "🧑🏼‍⚖️", type: "judge" }, // Judge/legal costs
      { emoji: "💋", type: "kiss" }, // Kiss
    ];

    const eater = moneyEaters[Math.floor(Math.random() * moneyEaters.length)];

    obstacles.push({
      x,
      y: -size - 10,
      w: size,
      h: size,
      speed: finalSpeed,
      emoji: eater.emoji,
      type: eater.type,
      speedType: speedType,
      horizontalSpeed: (Math.random() - 0.5) * 1.5, // Add horizontal movement
    });
  }

  function rectRectCollide(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
    return (
      r1x < r2x + r2w && r1x + r1w > r2x && r1y < r2y + r2h && r1y + r1h > r2y
    );
  }

  function update(dt) {
    // player input
    let move = 0;
    if (keys["ArrowLeft"] || keys["a"]) move -= 1;
    if (keys["ArrowRight"] || keys["d"]) move += 1;
    if (touches.left) move -= 1;
    if (touches.right) move += 1;
    player.x += move * player.speed;
    // clamp
    player.x = Math.max(10, Math.min(player.x, W - player.w - 10));

    // spawn obstacles
    spawnTimer += dt;
    const rate = Math.max(600, spawnRate - Math.floor(score) * 2.5); // Increased spawn rate
    if (spawnTimer > rate) {
      spawnTimer = 0;
      spawnObstacle();
    }

    // update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];

      // Vertical movement
      o.y += o.speed * dt * 0.1;

      // Horizontal tracking - gradually move toward player
      const playerCenterX = player.x + player.w / 2;
      const obstacleCenterX = o.x + o.w / 2;
      const distanceToPlayer = playerCenterX - obstacleCenterX;

      // Add horizontal movement that targets player position
      const trackingStrength = 0.02; // How aggressively they track the player
      o.x += o.horizontalSpeed * dt * 0.08; // Base horizontal movement
      o.x +=
        Math.sign(distanceToPlayer) *
        Math.min(Math.abs(distanceToPlayer), 50) *
        trackingStrength *
        dt *
        0.1; // Player tracking

      // Keep obstacles within screen bounds
      o.x = Math.max(0, Math.min(o.x, W - o.w));

      // Remove if off screen
      if (o.y > H + 60) obstacles.splice(i, 1);

      // collision
      if (
        rectRectCollide(
          player.x,
          player.y,
          player.w,
          player.h,
          o.x,
          o.y,
          o.w,
          o.h
        )
      ) {
        gameOver();
      }
    }

    // score by time alive
    score += dt * 0.01;
  }

  function draw() {
    // clear
    ctx.clearRect(0, 0, W, H);

    if (isNightMode) {
      // ORIGINAL NIGHT MODE - exactly as it was before
      // Night sky background gradient
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0c1445"); // Dark blue top
      g.addColorStop(1, "#1a1a2e"); // Darker blue bottom
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Draw stars with relative positioning
      ctx.save();
      for (const star of stars) {
        star.twinkle += star.twinkleSpeed;
        const alpha = star.brightness * (0.5 + 0.5 * Math.sin(star.twinkle));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(
          star.xPercent * W,
          star.yPercent * H,
          star.size,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.restore();

      // Update and draw shooting stars with relative positioning
      shootingStarTimer += 16; // Approximate delta time
      if (shootingStarTimer > 2000 + Math.random() * 3000) {
        // Random interval 2-5 seconds
        shootingStars.push(createShootingStar());
        shootingStarTimer = 0;
      }

      ctx.save();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        const speedPercent = star.speed * 0.001; // Convert speed to percentage
        star.xPercent -= speedPercent;
        star.yPercent += speedPercent * 0.3; // Slight downward movement
        star.life -= star.decay;

        const lengthPercent = star.length / W; // Convert length to percentage

        if (star.life <= 0 || star.xPercent < -lengthPercent) {
          shootingStars.splice(i, 1);
          continue;
        }

        // Draw shooting star trail with relative positioning
        const x = star.xPercent * W;
        const y = star.yPercent * H;
        const gradient = ctx.createLinearGradient(
          x,
          y,
          x + star.length,
          y - star.length * 0.3
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.life})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + star.length, y - star.length * 0.3);
        ctx.stroke();
      }
      ctx.restore();

      // Draw moon in top left with floating animation (relative positioning)
      ctx.save();
      moonFloat += 0.02; // Increment moon animation
      const moonBaseXPercent = 0.08; // 8% from left edge
      const moonBaseYPercent = 0.167; // About 60px from top at 360px height
      const moonXPercent = moonBaseXPercent + (Math.sin(moonFloat) * 8) / W; // Floating relative to width
      const moonYPercent =
        moonBaseYPercent + (Math.cos(moonFloat * 0.7) * 6) / H; // Floating relative to height
      const moonX = moonXPercent * W;
      const moonY = moonYPercent * H;
      const moonRadius = Math.min(W, H) * 0.07; // Moon size relative to smallest dimension

      // Moon glow
      const moonGlow = ctx.createRadialGradient(
        moonX,
        moonY,
        0,
        moonX,
        moonY,
        moonRadius * 2
      );
      moonGlow.addColorStop(0, "rgba(255, 255, 255, 0.3)");
      moonGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Moon body
      ctx.fillStyle = "#f4f4f4";
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Moon craters
      ctx.fillStyle = "#e0e0e0";
      ctx.beginPath();
      ctx.arc(moonX - 8, moonY - 5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(moonX + 6, moonY + 3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(moonX - 3, moonY + 8, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // NEW DAY MODE
      // Day mode background
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#87CEEB"); // Sky blue top
      g.addColorStop(1, "#E0F6FF"); // Light blue bottom
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Draw some clouds with relative positioning
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      for (let i = 0; i < 3; i++) {
        const cloudXPercent =
          0.05 + i * 0.25 + (Math.sin(moonFloat + i) * 20) / W;
        const cloudYPercent = 0.139 + (Math.cos(moonFloat * 0.5 + i) * 15) / H;
        const cloudX = cloudXPercent * W;
        const cloudY = cloudYPercent * H;
        const cloudScale = Math.min(W, H) * 0.07; // Scale clouds relative to canvas size

        // Simple cloud shape with relative sizing
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, cloudScale, 0, Math.PI * 2);
        ctx.arc(cloudX + cloudScale, cloudY, cloudScale * 1.4, 0, Math.PI * 2);
        ctx.arc(cloudX + cloudScale * 2, cloudY, cloudScale, 0, Math.PI * 2);
        ctx.arc(
          cloudX + cloudScale,
          cloudY - cloudScale,
          cloudScale,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.restore();

      // Draw sun in top right with relative positioning
      ctx.save();
      sunFloat += 0.02;
      const sunBaseXPercent = 0.92; // 92% from left (8% from right)
      const sunBaseYPercent = 0.167; // About 60px from top at 360px height
      const sunXPercent = sunBaseXPercent + (Math.sin(sunFloat) * 6) / W; // Floating relative to width
      const sunYPercent = sunBaseYPercent + (Math.cos(sunFloat * 0.8) * 4) / H; // Floating relative to height
      const sunX = sunXPercent * W;
      const sunY = sunYPercent * H;
      const sunRadius = Math.min(W, H) * 0.083; // Sun size relative to smallest dimension

      // Sun glow
      const sunGlow = ctx.createRadialGradient(
        sunX,
        sunY,
        0,
        sunX,
        sunY,
        sunRadius * 2
      );
      sunGlow.addColorStop(0, "rgba(255, 215, 0, 0.4)");
      sunGlow.addColorStop(1, "rgba(255, 215, 0, 0)");
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Sun body
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // Sun rays
      ctx.strokeStyle = "#FFA500";
      ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12 + sunFloat * 0.5;
        const rayStart = sunRadius + 5;
        const rayEnd = sunRadius + 15;
        ctx.beginPath();
        ctx.moveTo(
          sunX + Math.cos(angle) * rayStart,
          sunY + Math.sin(angle) * rayStart
        );
        ctx.lineTo(
          sunX + Math.cos(angle) * rayEnd,
          sunY + Math.sin(angle) * rayEnd
        );
        ctx.stroke();
      }
      ctx.restore();
    }

    // draw obstacles (money-eaters) - pure emojis
    for (const o of obstacles) {
      ctx.font = `${o.w}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(o.emoji, o.x + o.w / 2, o.y + o.h / 2);
    }

    // draw player (money) - pure emoji
    ctx.font = `${player.w}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      player.emoji,
      player.x + player.w / 2,
      player.y + player.h / 2
    );

    // HUD with no background - Position changes based on day/night mode
    ctx.save();

    // Position score text based on mode
    let textX, textY1, textY2, textAlign, textColor, shadowColor;

    if (isNightMode) {
      // Night mode: top right
      textX = W - 15; // 15px from right edge
      textY1 = 25; // First line
      textY2 = 45; // Second line
      textAlign = "right";
      textColor = "#ffffff"; // White text
      shadowColor = "rgba(0, 0, 0, 0.8)";
    } else {
      // Day mode: top left
      textX = 15; // 15px from left edge
      textY1 = 25; // First line
      textY2 = 45; // Second line
      textAlign = "left";
      textColor = "#2c3e50"; // Dark text for day mode
      shadowColor = "rgba(255, 255, 255, 0.8)";
    }

    // Score text styling
    ctx.fillStyle = textColor;
    ctx.font = "bold 16px Inter, Arial";
    ctx.textAlign = textAlign;

    // Add text shadow for better visibility
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Display player name with saved amount or default
    const displayName = playerName || "Money";
    ctx.fillText(`${displayName} Saved: $${Math.floor(score)}`, textX, textY1);
    ctx.fillText(`Best: $${best}`, textX, textY2);

    ctx.restore();
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
  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === " " && running) {
      // toggle pause
      paused = !paused;
      overlay.style.display = paused ? "flex" : "none";
      stateTitle.textContent = paused ? "Paused" : "Playing";
      stateText.textContent = paused ? "Press Space to resume" : "";
    }
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  // mouse / click
  canvas.addEventListener("click", (e) => {
    // Only handle movement clicks, not game start
    if (running) {
      // clicking left/right of canvas for movement
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      touches.left = x < rect.width / 2;
      touches.right = x >= rect.width / 2;
      setTimeout(() => {
        touches.left = false;
        touches.right = false;
      }, 120);
    }
  });

  // touch controls - improved for mobile
  canvas.addEventListener(
    "touchstart",
    (ev) => {
      ev.preventDefault();
      // Only handle touch movement when game is running
      if (running) {
        const rect = canvas.getBoundingClientRect();
        for (const t of ev.touches) {
          const x = t.clientX - rect.left;
          if (x < rect.width / 2) touches.left = true;
          else touches.right = true;
        }
      }
    },
    { passive: false }
  );

  // Better touch end handling
  canvas.addEventListener(
    "touchend",
    (ev) => {
      ev.preventDefault();
      touches.left = touches.right = false;
    },
    { passive: false }
  );

  // Handle touch move for continuous movement
  canvas.addEventListener(
    "touchmove",
    (ev) => {
      ev.preventDefault();
      if (!running) return;
      const rect = canvas.getBoundingClientRect();
      for (const t of ev.touches) {
        const x = t.clientX - rect.left;
        touches.left = x < rect.width / 2;
        touches.right = x >= rect.width / 2;
      }
    },
    { passive: false }
  );

  // start button and name input
  startBtn.addEventListener("click", () => startGame());

  // Day/Night toggle
  dayNightToggle.addEventListener("click", toggleDayNight);

  // Allow Enter key to start game from name input - but only through start button
  playerNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      // Focus the start button instead of auto-starting
      startBtn.focus();
    }
  });

  overlay.addEventListener("click", (e) => {
    // only handle direct overlay clicks (not button or input)
    if (e.target === overlay) {
      if (!running) {
        // If game is over, show name input again
        if (stateTitle.textContent.includes("Lost Money!")) {
          resetGame();
        }
        // Remove auto-start - player must click Start button
      }
    }
  });

  function toggleDayNight() {
    isNightMode = !isNightMode;
    if (isNightMode) {
      dayNightToggle.textContent = "☀️ Day Mode";
      dayNightToggle.classList.add("night-mode");
      dayNightToggle.classList.remove("day-mode");
      overlay.classList.remove("day-mode");
    } else {
      dayNightToggle.textContent = "🌙 Night Mode";
      dayNightToggle.classList.add("day-mode");
      dayNightToggle.classList.remove("night-mode");
      overlay.classList.add("day-mode");
    }
  }

  // initialize
  dayNightToggle.classList.add("night-mode"); // Start in night mode
  resetGame();
  requestAnimationFrame(loop);
})();
