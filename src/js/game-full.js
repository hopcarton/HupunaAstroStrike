// --- IMAGE CONFIG ---
const BOT_IMAGES = [
  "../../image/bot.png",
  "../../image/bot1.png",
  "../../image/bot2.png",
  "../../image/bot3.png",
  "../../image/bot4.png",
];
const ENEMY_BULLET_IMG = "../../image/box.png";

// --- BOT STATS ---
const BOT_STATS = {
  0: { hp: 2, score: 50, scale: 0.8, speed: 2 },
  1: { hp: 5, score: 100, scale: 0.9, speed: 2.2 },
  2: { hp: 10, score: 200, scale: 1.0, speed: 2.5 },
  3: { hp: 20, score: 400, scale: 1.2, speed: 2.8 },
  4: { hp: 150, score: 5000, scale: 2.5, speed: 1.5 }, // Boss
};

// --- HEROES ---
const HEROES = {
  soldier: { name: "🚀 Soldier", imgSrc: "../../image/hero1.png" },
  pyromancer: { name: "🛸 Pyromancer", imgSrc: "../../image/hero2.png" },
  thunderlord: { name: "✈️ Thunderlord", imgSrc: "../../image/hero3.png" },
};

// --- WEAPONS ---
const WEAPONS = {
  red: { color: "#FF0000", bulletSpeed: 10, damage: 1, name: "Spread Fire" },
  green: { color: "#00FF00", bulletSpeed: 12, damage: 1.5, name: "Bio Blaster" },
  blue: { color: "#00FFFF", bulletSpeed: 25, damage: 0.8, pierce: 999, name: "Lightning" },
  purple: { color: "#D000FF", bulletSpeed: 8, damage: 1.2, pierce: 5, name: "Sonic Wave" },
  orange: { color: "#FF8C00", bulletSpeed: 14, damage: 3.0, name: "Plasma Orb" },
};

class Particle {
  constructor(x, y, color, speed = 5, type = "explosion") {
    this.x = x;
    this.y = y;
    this.color = color;
    this.type = type;

    if (type === "collection") {
      this.size = Math.random() * 4 + 2;
      this.speedX = (Math.random() - 0.5) * 4;
      this.speedY = (Math.random() - 0.5) * 4;
      this.life = 40;
    } else {
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * speed - speed / 2;
      this.speedY = Math.random() * speed - speed / 2;
      this.life = 60;
    }
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 2;
    this.size *= 0.9;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = Math.max(0, this.life / 100);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class EnemyBullet {
  constructor(x, y, vx, vy, size = 25, color = null) {
    this.x = x;
    this.y = y;
    this.vx = vx || 0;
    this.vy = vy || 4;
    this.width = size;
    this.height = size;
    this.color = color;
    this.image = new Image();
    this.image.src = ENEMY_BULLET_IMG;
    this.rotation = 0;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += 0.1;
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);

    if (this.color) {
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.arc(0, 0, this.width / 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      if (this.image.complete && this.image.naturalHeight !== 0) {
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
      } else {
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
      }
    }
    ctx.restore();
  }
  isOutOfBounds(height) {
    return (this.y > height + 50 || this.x < -100 || this.x > window.innerWidth + 100);
  }
}

class Chicken {
  constructor(startX, startY, targetX, targetY, typeIndex, difficultyMult = 1) {
    this.typeIndex = typeIndex;
    const config = BOT_STATS[typeIndex];

    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.anchorX = targetX;
    this.anchorY = targetY;

    this.state = "entering";

    this.width = 45 * config.scale;
    this.height = 45 * config.scale;
    this.health = config.hp * difficultyMult;
    this.maxHealth = this.health;
    this.scoreValue = config.score;

    this.image = new Image();
    this.image.src = BOT_IMAGES[typeIndex];

    this.swayPhase = Math.random() * Math.PI * 2;

    this.canShoot = Math.random() < 0.4 || typeIndex === 4;
    this.shootCooldown = Math.random() * 400 + 200;
    this.hitFlashTimer = 0;
    this.hasItem = false;
  }

  update(globalTime) {
    if (this.state === "entering") {
      // Use cubic easing for smooth entry
      this.x += (this.targetX - this.x) * 0.08;
      this.y += (this.targetY - this.y) * 0.08;
      if (Math.abs(this.x - this.targetX) < 0.2 && Math.abs(this.y - this.targetY) < 0.2) {
        this.x = this.targetX;
        this.y = this.targetY;
        this.state = "active";
      }
    } else if (this.state === "active") {
      // Smooth sway around anchor point, but interpolate anchorY for descent
      this.anchorY += ((this.targetY - this.anchorY) * 0.04);
      this.x = this.anchorX + Math.sin(globalTime * 0.02 + this.swayPhase) * 20;
      this.y = this.anchorY + Math.cos(globalTime * 0.03 + this.swayPhase) * 10;
      if (this.canShoot) this.shootCooldown--;
    }
    if (this.hitFlashTimer > 0) this.hitFlashTimer--;
  }

  tryShoot(playerX, playerY) {
    if (this.state !== "active" || this.y < 0 || !this.canShoot) return null;

    if (this.shootCooldown <= 0) {
      this.shootCooldown = Math.random() * 600 + 300;

      if (this.typeIndex === 4) {
        const bullets = [];
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height;
        bullets.push(new EnemyBullet(cx, cy, 0, 5, 40, "#FF0000"));
        const angle = Math.atan2(playerY - cy, playerX - cx);
        bullets.push(new EnemyBullet(cx, cy, Math.cos(angle) * 4, Math.sin(angle) * 4, 15, "#FF00FF"));
        return bullets;
      }

      if (Math.random() < 0.3) {
        const cx = this.x + this.width / 2;
        return [new EnemyBullet(cx - 12, this.y + this.height, 0, 3)];
      }
    }
    return null;
  }

  draw(ctx) {
    if (this.x < -100 || this.x > window.innerWidth + 100) return;

    ctx.save();
    if (this.hitFlashTimer > 0) ctx.filter = "brightness(500%) sepia(100%)";

    if (this.image.complete && this.image.naturalHeight !== 0) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    ctx.filter = "none";

    if (this.typeIndex === 4) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(this.x, this.y - 15, this.width, 8);
      ctx.fillStyle = "#0f0";
      ctx.fillRect(this.x, this.y - 15, this.width * (this.health / this.maxHealth), 8);
    }
    ctx.restore();
  }

  isOutOfBounds(height) {
    return this.y > height + 100;
  }

  takeDamage(dmg) {
    this.health -= dmg;
    this.hitFlashTimer = 4;
    return this.health <= 0;
  }
}

class Bullet {
  constructor(x, y, weaponType, angle = 0) {
    this.x = x;
    this.y = y;
    this.type = weaponType;
    this.config = WEAPONS[weaponType];

    this.speed = this.config.bulletSpeed;
    this.vx = Math.sin(angle) * this.speed;
    this.vy = -Math.cos(angle) * this.speed;

    this.damage = this.config.damage;
    this.pierce = this.config.pierce || 1;
    this.piercedCount = 0;
    this.timer = 0;

    this.width = 15;
    this.height = 15;

    if (this.type === "blue") {
      this.width = 20;
      this.height = 150;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.timer++;
  }

  draw(ctx) {
    ctx.save();

    if (this.type === "blue") {
      ctx.strokeStyle = this.timer % 4 < 2 ? "#00FFFF" : "#FFF";
      ctx.lineWidth = 4;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00FFFF";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      let segments = 6;
      let tailLen = this.height;
      for (let i = 1; i <= segments; i++) {
        let offX = (Math.random() - 0.5) * 10;
        ctx.lineTo(this.x + offX, this.y + i * (tailLen / segments));
      }
      ctx.stroke();
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === "purple") {
      ctx.strokeStyle = this.config.color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 5;
      ctx.shadowColor = this.config.color;
      for (let i = 0; i < 3; i++) {
        let offset = (this.timer + i * 5) % 15;
        ctx.globalAlpha = 1 - offset / 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10 + offset, Math.PI, 0);
        ctx.stroke();
      }
    } else if (this.type === "orange") {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.timer * 0.3);
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FF8C00";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.strokeStyle = "#FF4500";
      ctx.beginPath();
      ctx.arc(0, 0, 16, Math.PI, Math.PI * 0.5);
      ctx.stroke();
    } else {
      ctx.fillStyle = this.config.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.config.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  isOutOfBounds() {
    return this.y < -200 || this.x < -50 || this.x > window.innerWidth + 50;
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.vy = 2;
    this.vx = (Math.random() - 0.5) * 2;
    this.width = 30;
    this.height = 30;
  }
  update() {
    this.y += this.vy;
    this.x += this.vx;
    if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.shadowBlur = 15;

    if (this.type === "health") {
      ctx.shadowColor = "#FF0000";
      ctx.font = "24px Arial";
      ctx.fillText("🍖", -12, 10);
    } else {
      let color = "#FFF";
      if (this.type === "red") color = "#FF0000";
      else if (this.type === "green") color = "#00FF00";
      else if (this.type === "blue") color = "#00FFFF";
      else if (this.type === "purple") color = "#D000FF";
      else if (this.type === "orange") color = "#FF8C00";

      ctx.shadowColor = color;
      ctx.fillStyle = color;
      ctx.fillRect(-15, -15, 30, 30);
      ctx.strokeStyle = "#FFF";
      ctx.lineWidth = 2;
      ctx.strokeRect(-15, -15, 30, 30);
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚡", 0, 2);
    }
    ctx.restore();
  }
  isOutOfBounds(height) {
    return this.y > height;
  }
}

class Player {
  constructor(canvasWidth, canvasHeight, heroConfig) {
    this.width = 60;
    this.height = 60;
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = canvasHeight - 100;
    this.targetX = this.x;
    this.targetY = this.y;
    this.speed = 12; // Faster for mouse following
    this.canvasWidth = canvasWidth;
    this.image = new Image();
    this.image.src = heroConfig.imgSrc;
    this.weaponLevel = 1;
    this.currentWeapon = "red";
    this.autoShootDelay = 20;
    this.autoShootTimer = 0;
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.opacity = 1;
    this.glowIntensity = 0;
  }
  // Remove keyboard move, add mouse follow
  moveTo(x, y) {
    this.targetX = Math.max(0, Math.min(this.canvasWidth - this.width, x - this.width / 2));
    this.targetY = Math.max(0, Math.min(window.innerHeight - 70 - this.height, y - this.height / 2));
  }
  update() {
    // Smoothly follow mouse
    this.x += (this.targetX - this.x) * 0.25;
    this.y += (this.targetY - this.y) * 0.25;
    this.glowIntensity = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
    if (this.isInvincible) {
      this.invincibleTimer--;
      this.opacity = Math.floor(this.invincibleTimer / 5) % 2 === 0 ? 0.3 : 1;
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
        this.opacity = 1;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.globalAlpha = this.opacity;
    
    // Draw enhanced glow effect
    const weaponColor = WEAPONS[this.currentWeapon].color;
    
    // Outer glow layer
    ctx.shadowBlur = 30;
    ctx.shadowColor = weaponColor;
    ctx.fillStyle = weaponColor;
    ctx.globalAlpha = 0.3 * this.glowIntensity * this.opacity;
    ctx.beginPath();
    ctx.arc(0, 0, this.width * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset for shield/main render
    ctx.globalAlpha = this.opacity;
    ctx.shadowColor = weaponColor;
    ctx.shadowBlur = 15;
    
    if (this.isInvincible) {
      ctx.strokeStyle = weaponColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, this.width * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw player image with brightness boost
    if (this.image.complete && this.image.naturalHeight !== 0) {
      ctx.filter = "brightness(1.2)";
      ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
      ctx.filter = "none";
    } else {
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
    
    // Inner glowing border
    ctx.strokeStyle = weaponColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = this.glowIntensity * 0.6 * this.opacity;
    ctx.beginPath();
    ctx.arc(0, 0, this.width * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }

  shoot() {
    this.autoShootTimer++;
    if (this.autoShootTimer < this.autoShootDelay) return null;
    this.autoShootTimer = 0;

    const bullets = [];
    const cx = this.x + this.width / 2;
    const cy = this.y;
    const lvl = this.weaponLevel;

    if (this.currentWeapon === "red") {
      bullets.push(new Bullet(cx, cy, "red", 0));
      if (lvl >= 2) { bullets.push(new Bullet(cx, cy, "red", -0.15)); bullets.push(new Bullet(cx, cy, "red", 0.15)); }
      if (lvl >= 4) { bullets.push(new Bullet(cx, cy, "red", -0.3)); bullets.push(new Bullet(cx, cy, "red", 0.3)); }
      if (lvl >= 7) { bullets.push(new Bullet(cx, cy, "red", -0.45)); bullets.push(new Bullet(cx, cy, "red", 0.45)); }
      if (lvl >= 9) { bullets.push(new Bullet(cx, cy, "red", -0.6)); bullets.push(new Bullet(cx, cy, "red", 0.6)); }
    } else if (this.currentWeapon === "green") {
      bullets.push(new Bullet(cx, cy, "green", 0));
      if (lvl >= 3) { bullets.push(new Bullet(cx - 15, cy + 5, "green", -0.05)); bullets.push(new Bullet(cx + 15, cy + 5, "green", 0.05)); }
      if (lvl >= 6) { bullets.push(new Bullet(cx - 30, cy + 10, "green", -0.1)); bullets.push(new Bullet(cx + 30, cy + 10, "green", 0.1)); }
      if (lvl >= 9) { bullets.push(new Bullet(cx - 45, cy + 15, "green", -0.15)); bullets.push(new Bullet(cx + 45, cy + 15, "green", 0.15)); }
    } else if (this.currentWeapon === "blue") {
      const sp = 15;
      bullets.push(new Bullet(cx, cy, "blue", 0));
      if (lvl >= 3) { bullets.push(new Bullet(cx - sp, cy + 10, "blue", 0)); bullets.push(new Bullet(cx + sp, cy + 10, "blue", 0)); }
      if (lvl >= 6) { bullets.push(new Bullet(cx - sp * 2, cy + 20, "blue", 0)); bullets.push(new Bullet(cx + sp * 2, cy + 20, "blue", 0)); }
      if (lvl >= 9) { bullets.push(new Bullet(cx - sp * 3, cy + 30, "blue", 0)); bullets.push(new Bullet(cx + sp * 3, cy + 30, "blue", 0)); }
    } else if (this.currentWeapon === "purple") {
      bullets.push(new Bullet(cx, cy, "purple", 0));
      if (lvl >= 3) { bullets.push(new Bullet(cx, cy, "purple", -0.2)); bullets.push(new Bullet(cx, cy, "purple", 0.2)); }
      if (lvl >= 6) { bullets.push(new Bullet(cx, cy, "purple", -0.4)); bullets.push(new Bullet(cx, cy, "purple", 0.4)); }
      if (lvl >= 9) { bullets.push(new Bullet(cx, cy, "purple", -0.6)); bullets.push(new Bullet(cx, cy, "purple", 0.6)); }
    } else if (this.currentWeapon === "orange") {
      bullets.push(new Bullet(cx, cy, "orange", 0));
      if (lvl >= 4) { bullets.push(new Bullet(cx - 20, cy + 10, "orange", 0)); bullets.push(new Bullet(cx + 20, cy + 10, "orange", 0)); }
      if (lvl >= 8) { bullets.push(new Bullet(cx - 40, cy + 20, "orange", -0.05)); bullets.push(new Bullet(cx + 40, cy + 20, "orange", 0.05)); }
    }

    return bullets;
  }

  activateShield() {
    this.isInvincible = true;
    this.invincibleTimer = 180;
  }

  collectItem(type) {
    if (type === "health") return "heal";
    if (type === this.currentWeapon) {
      this.weaponLevel = Math.min(this.weaponLevel + 1, 10);
    } else {
      this.currentWeapon = type;
      this.weaponLevel = Math.max(1, this.weaponLevel - 2);
    }
    return "weapon";
  }
}

class ChickenInvadersGame {
  constructor(heroType = "soldier") {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    const heroConfig = HEROES[heroType] || HEROES["soldier"];
    this.player = new Player(this.width, this.height, heroConfig);
    this.chickens = [];
    this.formations = [];
    this.bullets = [];
    this.powerUps = [];
    this.enemyBullets = [];
    this.particles = [];
    this.score = 0;
    this.health = 5;
    this.wave = 0;
    this.gameRunning = false;
    this.gamePaused = false;
    this.keys = {};
    this.globalTime = 0;

    // Starfield setup
    this.stars = [];
    for (let i = 0; i < 120; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        r: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.7 + 0.3,
        color: ["#fff", "#b3e0ff", "#ffe0b3"][Math.floor(Math.random() * 3)]
      });
    }

    this.setupEventListeners();
    this.updateUI();
  }
  resizeCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight - 70;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
  setupEventListeners() {
    document.addEventListener("keydown", (e) => { this.keys[e.key] = true; });
    document.addEventListener("keyup", (e) => { this.keys[e.key] = false; });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.preventDefault(); if (this.gameRunning) this.togglePause(); } });
    window.addEventListener("resize", () => { this.resizeCanvas(); });
    document.getElementById("resumeBtn").addEventListener("click", () => this.togglePause());
    document.getElementById("exitBtn").addEventListener("click", () => this.exitToMenu());
    document.getElementById("restartBtn").addEventListener("click", () => this.restart());
    document.getElementById("menuBtn").addEventListener("click", () => this.exitToMenu());
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      this.player.moveTo(mouseX, mouseY);
    });
    setTimeout(() => this.start(), 500);
  }
  start() {
    if (!this.gameRunning) {
      this.gameRunning = true;
      this.gamePaused = false;
      this.nextWave();
      this.gameLoop();
    }
  }
  togglePause() {
    this.gamePaused = !this.gamePaused;
    document.getElementById("pauseMenu").classList.toggle("hidden");
  }
  restart() {
    this.chickens = [];
    this.bullets = [];
    this.powerUps = [];
    this.enemyBullets = [];
    this.particles = [];
    this.score = 0;
    this.health = 5;
    this.wave = 0;
    this.gameRunning = false;
    this.gamePaused = false;
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("pauseMenu").classList.add("hidden");
    const currentSkin = this.player.image.src;
    this.player = new Player(this.width, this.height, { imgSrc: currentSkin });
    this.start();
  }
  exitToMenu() { window.close(); }

  getWaveConfig(wave) {
    // Guarantee at least one bot for every wave
    const configs = [
      { pattern: "grid", cols: 8, rows: 3, type: [0,1,2] },
      { pattern: "diamond", cols: 5, rows: 5, type: [1,2] },
      { pattern: "vformation", cols: 10, rows: 2, type: [0,1,2,3] },
      { pattern: "diagonal", cols: 6, rows: 6, type: [0,1,2] },
      { pattern: "grid", cols: 10, rows: 4, type: [0,1,2,3] }, // was boss, now grid for visibility
      { pattern: "grid", cols: 12, rows: 4, type: [0,1,2,3] },
      { pattern: "diamond", cols: 7, rows: 7, type: [1,2,3] },
      { pattern: "vformation", cols: 12, rows: 3, type: [0,1,2,3] },
      { pattern: "diagonal", cols: 8, rows: 8, type: [0,1,2,3] },
      { pattern: "boss", cols: 1, rows: 1, type: [4] }
    ];
    // If boss, only show boss every 5th wave
    if (wave % 5 === 0) return { pattern: "boss", cols: 1, rows: 1, type: [4] };
    return configs[(wave-1) % configs.length];
  }

  nextWave() {
    this.wave++;
    this.enemyBullets = [];
    this.chickens = [];
    this.formations = [];
    // Get config for this wave
    const config = this.getWaveConfig(this.wave);
    this.spawnFormation(config.pattern, config.cols, config.rows, config.type);
  }

  spawnFormation(pattern, cols=8, rows=4, types=[0,1,2]) {
    const difficultyOffset = Math.min(this.wave * 10, 200);
    const targetStartY = 60 + difficultyOffset;
    const hpMulti = 1 + this.wave * 0.2;
    let waveBots = [];
    if (pattern === "grid") {
      const padding = 50;
      const startX = (this.width - cols * padding) / 2;
      const formation = { bots: [], cols, rows, x: startX, y: targetStartY, width: cols * padding, direction: 1, speed: 0.8 + this.wave * 0.03 };
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let type = types[r % types.length];
          const targetX = startX + c * padding;
          const targetY = targetStartY + r * padding;
          const spawnX = c < cols / 2 ? -100 : this.width + 100;
          let bot = new Chicken(spawnX, targetY, targetX, targetY, type, hpMulti);
          this.chickens.push(bot);
          waveBots.push(bot);
          formation.bots.push(bot);
        }
      }
      this.formations.push(formation);
    } else if (pattern === "diamond") {
      const centerX = this.width / 2;
      const centerY = targetStartY + 100;
      const formation = { bots: [], x: centerX, y: centerY, direction: 1, speed: 0.7 };
      const spacing = 50;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const offsetX = (c - (cols-1)/2) * spacing;
          const offsetY = (r - (rows-1)/2) * spacing;
          const dist = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
          if (dist <= spacing * Math.min(cols,rows)/1.5) {
            let type = types[(r+c) % types.length];
            let bot = new Chicken(centerX - 100, centerY, centerX + offsetX, centerY + offsetY, type, hpMulti);
            this.chickens.push(bot);
            waveBots.push(bot);
            formation.bots.push(bot);
          }
        }
      }
      this.formations.push(formation);
    } else if (pattern === "vformation") {
      const formation = { bots: [], x: this.width / 2, y: targetStartY, direction: 1, speed: 0.9 };
      const pointX = this.width / 2;
      const pointY = targetStartY;
      const spacing = 45;
      for (let i = 0; i < cols; i++) {
        let leftX = pointX - (i + 1) * spacing * 0.7;
        let rightX = pointX + (i + 1) * spacing * 0.7;
        let y = pointY + i * spacing;
        let type = types[i % types.length];
        let botL = new Chicken(leftX - 100, y, leftX, y, type, hpMulti);
        let botR = new Chicken(rightX + 100, y, rightX, y, type, hpMulti);
        this.chickens.push(botL, botR);
        waveBots.push(botL, botR);
        formation.bots.push(botL, botR);
      }
      this.formations.push(formation);
    } else if (pattern === "diagonal") {
      const formation = { bots: [], x: this.width / 2, y: targetStartY, direction: 1, speed: 0.8 };
      const spacing = 50;
      for (let line = 0; line < rows; line++) {
        for (let i = 0; i < cols; i++) {
          const x = this.width / 2 - 200 + line * spacing + i * spacing * 0.5;
          const y = targetStartY + i * spacing;
          let type = types[(line+i) % types.length];
          let bot = new Chicken(x - 100, y, x, y, type, hpMulti);
          this.chickens.push(bot);
          waveBots.push(bot);
          formation.bots.push(bot);
        }
      }
      this.formations.push(formation);
    } else if (pattern === "boss") {
      let boss = new Chicken(this.width / 2 - 70, -200, this.width / 2 - 70, targetStartY, 4, hpMulti);
      this.chickens.push(boss);
      waveBots.push(boss);
      for (let i = 0; i < 6; i++) {
        let tX = this.width / 2 - 250 + i * 80;
        let tY = targetStartY + 200;
        let sX = i < 3 ? -100 : this.width + 100;
        let bot1 = new Chicken(sX, tY, tX, tY, 2, hpMulti);
        this.chickens.push(bot1);
        let bot2 = new Chicken(sX, tY, tX, tY + 80, 1, hpMulti);
        this.chickens.push(bot2);
      }
    }
    // Reduce item drop rate: 10-20% of enemies
    if (waveBots.length > 0 && pattern !== "boss") {
      let itemsToAssign = Math.ceil(waveBots.length * (0.10 + Math.random() * 0.10));
      let assigned = 0;
      while (assigned < itemsToAssign && waveBots.length > 0) {
        let randIdx = Math.floor(Math.random() * waveBots.length);
        if (!waveBots[randIdx].hasItem) {
          waveBots[randIdx].hasItem = true;
          assigned++;
        }
      }
    }
  }

  spawnRandomItem(x, y, isBoss = false) {
    let count = isBoss ? 4 : 1;
    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let type = "red";
      // Adjusted probabilities to match Chicken Invaders more closely
      if (rand < 0.08) type = "health";
      else if (rand < 0.35) type = "red";
      else if (rand < 0.55) type = "green";
      else if (rand < 0.75) type = "blue";
      else if (rand < 0.90) type = "purple";
      else type = "orange";
      
      if (isBoss) { 
        if (i === 0) type = "orange"; 
        if (i === 1) type = "purple"; 
      }
      this.powerUps.push(new PowerUp(x + (Math.random() * 40 - 20), y, type));
    }
  }

  createCollectionEffect(x, y, color) { for (let i = 0; i < 10; i++) this.particles.push(new Particle(x, y, color, 0, "collection")); }
  createExplosion(x, y, color = "#FF4500", scale = 1) { let count = 15 * scale; for (let i = 0; i < count; i++) this.particles.push(new Particle(x, y, color, 5, "explosion")); }

  updateFormations() {
    if (!this.formations || this.formations.length === 0) return;
    for (let f of this.formations) {
      f.x += f.direction * f.speed;
      if (f.x < 20 || f.x + f.width > this.width - 20) {
        f.direction *= -1;
        for (let b of f.bots) b.targetY += 20; // Use targetY for descent
      }
      for (let idx = 0; idx < f.bots.length; idx++) {
        const col = idx % f.cols;
        const row = Math.floor(idx / f.cols);
        const padding = f.width / f.cols;
        const targetX = f.x + col * padding + padding / 2;
        const targetY = f.y + row * padding;
        const bot = f.bots[idx];
        if (bot) {
          bot.targetX = targetX;
          bot.targetY = targetY;
          bot.anchorX = targetX;
        }
      }
    }
    this.formations = this.formations.filter((f) => f.bots.some((b) => this.chickens.includes(b)));
  }

  update() {
    if (!this.gameRunning || this.gamePaused) return;
    this.globalTime++;
    this.updateFormations();
    this.player.update();
    const newBullets = this.player.shoot(); if (newBullets) this.bullets.push(...newBullets);
    // Fix wave progression: only start next wave if all chickens and powerUps are gone
    if (this.chickens.length === 0 && this.powerUps.length === 0 && !this.wavePending) {
      this.wavePending = true;
      setTimeout(() => {
        if (this.chickens.length === 0 && this.powerUps.length === 0) {
          this.nextWave();
        }
        this.wavePending = false;
      }, 1200);
    }

    this.chickens.forEach((chicken) => {
      chicken.update(this.globalTime);
      const newEnemyBullets = chicken.tryShoot(this.player.x + this.player.width / 2, this.player.y);
      if (newEnemyBullets) this.enemyBullets.push(...newEnemyBullets);
    });

    this.bullets.forEach((b) => b.update());
    this.enemyBullets.forEach((eb) => eb.update());
    this.powerUps.forEach((p) => p.update());
    this.particles = this.particles.filter((p) => { p.update(); return p.life > 0; });
    this.bullets = this.bullets.filter((b) => !b.isOutOfBounds());
    this.enemyBullets = this.enemyBullets.filter((eb) => !eb.isOutOfBounds(this.height));
    this.powerUps = this.powerUps.filter((p) => !p.isOutOfBounds(this.height));
    this.chickens = this.chickens.filter((c) => !c.isOutOfBounds(this.height + 200));
    this.checkCollisions();
    this.updateUI();
  }

  checkCollisions() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      let hit = false;
      for (let j = this.chickens.length - 1; j >= 0; j--) {
        const c = this.chickens[j];
        if (c.x > 0 && c.x < this.width && c.y > 0) {
          let isHit = false;
          if (b.type === "blue") {
            if (b.x < c.x + c.width && b.x + 20 > c.x && b.y < c.y + c.height && b.y + 150 > c.y) { isHit = true; }
          } else if (b.type === "purple") {
            if (b.x - 20 < c.x + c.width && b.x + 20 > c.x && b.y < c.y + c.height && b.y + b.height > c.y) { isHit = true; }
          } else {
            if (b.x > c.x && b.x < c.x + c.width && b.y > c.y && b.y < c.y + c.height) isHit = true;
          }
          if (isHit) {
            hit = true;
            this.createExplosion(b.x, b.y, b.config.color, 0.5);
            if (c.takeDamage(b.damage)) {
              this.createExplosion(c.x + c.width / 2, c.y + c.height / 2, "#FFFF00");
              this.chickens.splice(j, 1);
              this.score += c.scoreValue;
              if (c.typeIndex === 4) this.spawnRandomItem(c.x, c.y, true);
              else if (c.hasItem) this.spawnRandomItem(c.x, c.y, false);
            }
            b.piercedCount++;
            if (b.piercedCount >= b.pierce) hit = true; else hit = false;
            break;
          }
        }
      }
      if (hit && b.piercedCount >= b.pierce) this.bullets.splice(i, 1);
    }
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      if (p.x > this.player.x && p.x < this.player.x + this.player.width && p.y > this.player.y && p.y < this.player.y + this.player.height) {
        this.createCollectionEffect(this.player.x + this.player.width / 2, this.player.y, WEAPONS[p.type]?.color || "#FFF");
        const result = this.player.collectItem(p.type);
        if (result === "heal") this.health = Math.min(this.health + 1, 10);
        this.powerUps.splice(i, 1);
      }
    }
    if (!this.player.isInvincible) {
      for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
        const eb = this.enemyBullets[i];
        if (eb.x < this.player.x + this.player.width - 15 && eb.x + eb.width > this.player.x + 15 && eb.y < this.player.y + this.player.height - 15 && eb.y + eb.height > this.player.y + 15) {
          this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, "#FF0000");
          this.health--;
          this.enemyBullets.splice(i, 1);
          if (this.player.weaponLevel > 1) this.player.weaponLevel--;
          if (this.health > 0) this.player.activateShield(); else this.endGame();
        }
      }
    }
  }

  endGame() {
    this.gameRunning = false;
    document.getElementById("finalScore").textContent = this.score;
    document.getElementById("finalWave").textContent = this.wave;
    document.getElementById("gameOverScreen").classList.remove("hidden");
  }
  updateUI() {
    document.getElementById("uiScore").textContent = this.score;
    document.getElementById("uiWave").textContent = this.wave;
    document.getElementById("uiHealth").textContent = "❤️ " + this.health;
    document.getElementById("uiBullets").textContent = `Lv.${this.player.weaponLevel}`;
    document.getElementById("uiBullets").style.color = WEAPONS[this.player.currentWeapon].color;
  }
  draw() {
    // Galaxy background
    const grad = this.ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      this.width * 0.1,
      this.width / 2,
      this.height / 2,
      this.width * 0.7
    );
    grad.addColorStop(0, "#22223b");
    grad.addColorStop(0.3, "#3a3a6c");
    grad.addColorStop(0.6, "#1a1a2e");
    grad.addColorStop(1, "#0f3460");
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);
    // Animate stars moving downward slowly
    for (let star of this.stars) {
      star.y += star.speed;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
        star.r = Math.random() * 1.5 + 0.5;
        star.speed = Math.random() * 0.7 + 0.3;
        star.color = ["#fff", "#b3e0ff", "#ffe0b3"][Math.floor(Math.random() * 3)];
      }
      this.ctx.save();
      this.ctx.globalAlpha = 0.5;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      this.ctx.fillStyle = star.color;
      this.ctx.fill();
      this.ctx.restore();
    }
    this.player.draw(this.ctx);
    this.chickens.forEach((chicken) => chicken.draw(this.ctx));
    this.bullets.forEach((bullet) => bullet.draw(this.ctx));
    this.powerUps.forEach((powerUp) => powerUp.draw(this.ctx));
    this.enemyBullets.forEach((eb) => eb.draw(this.ctx));
    this.particles.forEach((p) => p.draw(this.ctx));
  }
  gameLoop() { this.update(); this.draw(); if (this.gameRunning) requestAnimationFrame(() => this.gameLoop()); }
}

window.addEventListener("DOMContentLoaded", () => { const urlParams = new URLSearchParams(window.location.search); const heroType = urlParams.get("hero") || "soldier"; new ChickenInvadersGame(heroType); });
