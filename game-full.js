// --- CẤU HÌNH HÌNH ẢNH ---
const BOT_IMAGES = [
  "./image/bot.png",
  "./image/bot1.png",
  "./image/bot2.png",
  "./image/bot3.png",
  "./image/bot4.png",
];
const ENEMY_BULLET_IMG = "./image/box.png";

// --- CẤU HÌNH BOT ---
const BOT_STATS = {
  0: { hp: 2, score: 50, scale: 0.8, speed: 2 },
  1: { hp: 5, score: 100, scale: 0.9, speed: 2.2 },
  2: { hp: 10, score: 200, scale: 1.0, speed: 2.5 },
  3: { hp: 20, score: 400, scale: 1.2, speed: 2.8 },
  4: { hp: 150, score: 5000, scale: 2.5, speed: 1.5 }, // Boss
};

// --- CẤU HÌNH HERO ---
const HEROES = {
  soldier: { name: "🚀 Chiến Binh", imgSrc: "./image/hero1.png" },
  pyromancer: { name: "🛸 Phù Thủy", imgSrc: "./image/hero2.png" },
  thunderlord: { name: "✈️ Vua Sét", imgSrc: "./image/hero3.png" },
};

// --- CẤU HÌNH VŨ KHÍ ---
const WEAPONS = {
  red: { color: "#FF0000", bulletSpeed: 10, damage: 1, name: "Spread Fire" },
  green: {
    color: "#00FF00",
    bulletSpeed: 12,
    damage: 1.5,
    name: "Bio Blaster",
  },
  blue: {
    color: "#00FFFF",
    bulletSpeed: 25,
    damage: 0.8,
    pierce: 999,
    name: "Lightning",
  },
  purple: {
    color: "#D000FF",
    bulletSpeed: 8,
    damage: 1.2,
    pierce: 5,
    name: "Sonic Wave",
  },
  orange: {
    color: "#FF8C00",
    bulletSpeed: 14,
    damage: 3.0,
    name: "Plasma Orb",
  },
};

// --- CLASSES ---
class Particle {
  constructor(x, y, color, speed = 5, type = "explosion") {
    this.x = x;
    this.y = y;
    this.color = color;
    this.type = type; // 'explosion' hoặc 'collection'

    if (type === "collection") {
      // Hiệu ứng hút vào (bay ngược lên trên hoặc tỏa ra nhẹ)
      this.size = Math.random() * 4 + 2;
      this.speedX = (Math.random() - 0.5) * 4;
      this.speedY = (Math.random() - 0.5) * 4;
      this.life = 40;
    } else {
      // Hiệu ứng nổ (bay ra)
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
        ctx.drawImage(
          this.image,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      } else {
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      }
    }
    ctx.restore();
  }
  isOutOfBounds(height) {
    return (
      this.y > height + 50 || this.x < -100 || this.x > window.innerWidth + 100
    );
  }
}

// --- CLASS CHICKEN ---
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

    // FIX MOVEMENT: Mỗi con có một pha dao động riêng (ngẫu nhiên) nhưng cố định
    this.swayPhase = Math.random() * Math.PI * 2;

    this.canShoot = Math.random() < 0.4 || typeIndex === 4;
    this.shootCooldown = Math.random() * 400 + 200;
    this.hitFlashTimer = 0;
    this.hasItem = false;
  }

  update(globalTime) {
    if (this.state === "entering") {
      this.x += (this.targetX - this.x) * 0.05;
      this.y += (this.targetY - this.y) * 0.05;

      if (
        Math.abs(this.x - this.targetX) < 1 &&
        Math.abs(this.y - this.targetY) < 1
      ) {
        this.x = this.targetX;
        this.y = this.targetY;
        this.state = "active";
      }
    } else {
      // MOVEMENT FIX: Dao động xung quanh điểm neo (Anchor)
      // Dùng globalTime để mượt, dùng swayPhase để mỗi con một kiểu

      // Dao động ngang nhẹ (Sine wave)
      this.x = this.anchorX + Math.sin(globalTime * 0.02 + this.swayPhase) * 20;

      // Dao động dọc nhẹ (Cosine wave) + Trôi xuống cực chậm
      this.anchorY += 0.05;
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
        // BOSS
        const bullets = [];
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height;
        bullets.push(new EnemyBullet(cx, cy, 0, 5, 40, "#FF0000"));
        const angle = Math.atan2(playerY - cy, playerX - cx);
        bullets.push(
          new EnemyBullet(
            cx,
            cy,
            Math.cos(angle) * 4,
            Math.sin(angle) * 4,
            15,
            "#FF00FF"
          )
        );
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

    // Đã bỏ phần hiển thị hào quang (hasItem) để người chơi không biết

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
      ctx.fillRect(
        this.x,
        this.y - 15,
        this.width * (this.health / this.maxHealth),
        8
      );
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

// --- CLASS BULLET ---
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
    this.speed = 7;
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
  }
  move(direction) {
    if (direction === "left") this.x = Math.max(0, this.x - this.speed);
    else if (direction === "right")
      this.x = Math.min(this.canvasWidth - this.width, this.x + this.speed);
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

  activateShield() {
    this.isInvincible = true;
    this.invincibleTimer = 180;
  }

  update() {
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
    if (this.isInvincible) {
      ctx.strokeStyle = WEAPONS[this.currentWeapon].color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.width, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (this.image.complete && this.image.naturalHeight !== 0) {
      ctx.drawImage(
        this.image,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    } else {
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
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
      if (lvl >= 2) {
        bullets.push(new Bullet(cx, cy, "red", -0.15));
        bullets.push(new Bullet(cx, cy, "red", 0.15));
      }
      if (lvl >= 4) {
        bullets.push(new Bullet(cx, cy, "red", -0.3));
        bullets.push(new Bullet(cx, cy, "red", 0.3));
      }
      if (lvl >= 7) {
        bullets.push(new Bullet(cx, cy, "red", -0.45));
        bullets.push(new Bullet(cx, cy, "red", 0.45));
      }
      if (lvl >= 9) {
        bullets.push(new Bullet(cx, cy, "red", -0.6));
        bullets.push(new Bullet(cx, cy, "red", 0.6));
      }
    } else if (this.currentWeapon === "green") {
      bullets.push(new Bullet(cx, cy, "green", 0));
      if (lvl >= 3) {
        bullets.push(new Bullet(cx - 15, cy + 5, "green", -0.05));
        bullets.push(new Bullet(cx + 15, cy + 5, "green", 0.05));
      }
      if (lvl >= 6) {
        bullets.push(new Bullet(cx - 30, cy + 10, "green", -0.1));
        bullets.push(new Bullet(cx + 30, cy + 10, "green", 0.1));
      }
      if (lvl >= 9) {
        bullets.push(new Bullet(cx - 45, cy + 15, "green", -0.15));
        bullets.push(new Bullet(cx + 45, cy + 15, "green", 0.15));
      }
    } else if (this.currentWeapon === "blue") {
      const sp = 15;
      bullets.push(new Bullet(cx, cy, "blue", 0));
      if (lvl >= 3) {
        bullets.push(new Bullet(cx - sp, cy + 10, "blue", 0));
        bullets.push(new Bullet(cx + sp, cy + 10, "blue", 0));
      }
      if (lvl >= 6) {
        bullets.push(new Bullet(cx - sp * 2, cy + 20, "blue", 0));
        bullets.push(new Bullet(cx + sp * 2, cy + 20, "blue", 0));
      }
      if (lvl >= 9) {
        bullets.push(new Bullet(cx - sp * 3, cy + 30, "blue", 0));
        bullets.push(new Bullet(cx + sp * 3, cy + 30, "blue", 0));
      }
    } else if (this.currentWeapon === "purple") {
      bullets.push(new Bullet(cx, cy, "purple", 0));
      if (lvl >= 3) {
        bullets.push(new Bullet(cx, cy, "purple", -0.2));
        bullets.push(new Bullet(cx, cy, "purple", 0.2));
      }
      if (lvl >= 6) {
        bullets.push(new Bullet(cx, cy, "purple", -0.4));
        bullets.push(new Bullet(cx, cy, "purple", 0.4));
      }
      if (lvl >= 9) {
        bullets.push(new Bullet(cx, cy, "purple", -0.6));
        bullets.push(new Bullet(cx, cy, "purple", 0.6));
      }
    } else if (this.currentWeapon === "orange") {
      bullets.push(new Bullet(cx, cy, "orange", 0));
      if (lvl >= 4) {
        bullets.push(new Bullet(cx - 20, cy + 10, "orange", 0));
        bullets.push(new Bullet(cx + 20, cy + 10, "orange", 0));
      }
      if (lvl >= 8) {
        bullets.push(new Bullet(cx - 40, cy + 20, "orange", -0.05));
        bullets.push(new Bullet(cx + 40, cy + 20, "orange", 0.05));
      }
    }

    return bullets;
  }
}

// --- GAME LOGIC MAIN ---
class ChickenInvadersGame {
  constructor(heroType = "soldier") {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    const heroConfig = HEROES[heroType] || HEROES["soldier"];
    this.player = new Player(this.width, this.height, heroConfig);
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
    this.keys = {};
    this.globalTime = 0;
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
    document.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
    });
    document.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (this.gameRunning) this.togglePause();
      }
    });
    window.addEventListener("resize", () => {
      this.resizeCanvas();
    });
    document
      .getElementById("resumeBtn")
      .addEventListener("click", () => this.togglePause());
    document
      .getElementById("exitBtn")
      .addEventListener("click", () => this.exitToMenu());
    document
      .getElementById("restartBtn")
      .addEventListener("click", () => this.restart());
    document
      .getElementById("menuBtn")
      .addEventListener("click", () => this.exitToMenu());
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
  exitToMenu() {
    window.close();
  }

  spawnFormation(pattern) {
    const difficultyOffset = Math.min(this.wave * 10, 200);
    const targetStartY = 60 + difficultyOffset;
    const padding = 60;
    const hpMulti = 1 + this.wave * 0.2;

    let waveBots = [];

    if (pattern === "grid") {
      const cols = 8;
      const rows = 4;
      const startX = (this.width - cols * padding) / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let type = 0;
          if (r === 0) type = 2;
          else if (r === 1) type = 1;
          const targetX = startX + c * padding;
          const targetY = targetStartY + r * padding;
          const spawnX = c < cols / 2 ? -100 : this.width + 100;

          let bot = new Chicken(
            spawnX,
            targetY,
            targetX,
            targetY,
            type,
            hpMulti
          );
          this.chickens.push(bot);
          waveBots.push(bot);
        }
      }
    } else if (pattern === "boss") {
      let boss = new Chicken(
        this.width / 2 - 70,
        -200,
        this.width / 2 - 70,
        targetStartY,
        4,
        hpMulti
      );
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

    // RANDOM SỐ LƯỢNG ITEM (0 - 3)
    if (waveBots.length > 0 && pattern !== "boss") {
      let itemsCount = Math.floor(Math.random() * 4); // 0, 1, 2, hoặc 3 item
      let attempts = 0;
      // Chỉ gán tối đa số lượng item đã random
      while (attempts < itemsCount && waveBots.length > 0) {
        let randIdx = Math.floor(Math.random() * waveBots.length);
        if (!waveBots[randIdx].hasItem) {
          waveBots[randIdx].hasItem = true;
          attempts++;
        }
      }
    }
  }

  nextWave() {
    this.wave++;
    this.enemyBullets = [];
    if (this.wave % 5 === 0) this.spawnFormation("boss");
    else this.spawnFormation("grid");
  }

  spawnRandomItem(x, y, isBoss = false) {
    let count = isBoss ? 4 : 1;

    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let type = "red";

      if (rand < 0.05) type = "health";
      else if (rand < 0.45) type = "red";
      else if (rand < 0.7) type = "green";
      else if (rand < 0.9) type = "blue";
      else if (rand < 0.97) type = "purple";
      else type = "orange";

      if (isBoss) {
        if (i === 0) type = "orange";
        if (i === 1) type = "purple";
      }

      this.powerUps.push(new PowerUp(x + (Math.random() * 40 - 20), y, type));
    }
  }

  // HIỆU ỨNG ĂN ITEM (Collection)
  createCollectionEffect(x, y, color) {
    for (let i = 0; i < 10; i++) {
      this.particles.push(new Particle(x, y, color, 0, "collection"));
    }
  }

  createExplosion(x, y, color = "#FF4500", scale = 1) {
    let count = 15 * scale;
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color, 5, "explosion"));
    }
  }

  update() {
    if (!this.gameRunning || this.gamePaused) return;
    this.globalTime++;

    if (this.keys["ArrowLeft"] || this.keys["a"]) this.player.move("left");
    if (this.keys["ArrowRight"] || this.keys["d"]) this.player.move("right");
    this.player.update();
    const newBullets = this.player.shoot();
    if (newBullets) this.bullets.push(...newBullets);
    if (this.chickens.length === 0) {
      setTimeout(() => {
        if (this.chickens.length === 0) this.nextWave();
      }, 1500);
    }

    this.chickens.forEach((chicken) => {
      chicken.update(this.globalTime);
      const newEnemyBullets = chicken.tryShoot(
        this.player.x + this.player.width / 2,
        this.player.y
      );
      if (newEnemyBullets) this.enemyBullets.push(...newEnemyBullets);
    });

    this.bullets.forEach((b) => b.update());
    this.enemyBullets.forEach((eb) => eb.update());
    this.powerUps.forEach((p) => p.update());
    this.particles = this.particles.filter((p) => {
      p.update();
      return p.life > 0;
    });
    this.bullets = this.bullets.filter((b) => !b.isOutOfBounds());
    this.enemyBullets = this.enemyBullets.filter(
      (eb) => !eb.isOutOfBounds(this.height)
    );
    this.powerUps = this.powerUps.filter((p) => !p.isOutOfBounds(this.height));
    this.chickens = this.chickens.filter(
      (c) => !c.isOutOfBounds(this.height + 200)
    );
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
            // FIX HITBOX TIA SÉT (Toàn bộ đường thẳng)
            // Tia sét luôn vẽ từ b.y hướng lên trên (theo logic vẽ trong Bullet.draw)
            // Nhưng trong Bullet.update nó lại di chuyển lên (y giảm)
            // Đoạn này kiểm tra va chạm hình chữ nhật giữa Bot và Tia Sét
            // Tia sét: x = b.x, width = 20, y = b.y, height = 150 (dài xuống)

            // Logic vẽ cũ: vẽ lùi về sau (dưới).
            // Logic va chạm: coi tia sét là một hình chữ nhật tại vị trí viên đạn
            if (
              b.x < c.x + c.width &&
              b.x + 20 > c.x &&
              b.y < c.y + c.height &&
              b.y + 150 > c.y
            ) {
              isHit = true;
            }
          } else if (b.type === "purple") {
            if (
              b.x - 20 < c.x + c.width &&
              b.x + 20 > c.x &&
              b.y < c.y + c.height &&
              b.y + b.height > c.y
            ) {
              isHit = true;
            }
          } else {
            if (
              b.x > c.x &&
              b.x < c.x + c.width &&
              b.y > c.y &&
              b.y < c.y + c.height
            )
              isHit = true;
          }

          if (isHit) {
            hit = true;
            this.createExplosion(b.x, b.y, b.config.color, 0.5); // Nổ nhỏ trúng đạn

            if (c.takeDamage(b.damage)) {
              this.createExplosion(
                c.x + c.width / 2,
                c.y + c.height / 2,
                "#FFFF00"
              );
              this.chickens.splice(j, 1);
              this.score += c.scoreValue;

              if (c.typeIndex === 4) {
                this.spawnRandomItem(c.x, c.y, true);
              } else if (c.hasItem) {
                this.spawnRandomItem(c.x, c.y, false);
              }
            }
            b.piercedCount++;
            if (b.piercedCount >= b.pierce) hit = true;
            else hit = false;
            break;
          }
        }
      }
      if (hit && b.piercedCount >= b.pierce) this.bullets.splice(i, 1);
    }
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      if (
        p.x > this.player.x &&
        p.x < this.player.x + this.player.width &&
        p.y > this.player.y &&
        p.y < this.player.y + this.player.height
      ) {
        // HIỆU ỨNG ĂN ITEM
        this.createCollectionEffect(
          this.player.x + this.player.width / 2,
          this.player.y,
          WEAPONS[p.type]?.color || "#FFF"
        );

        const result = this.player.collectItem(p.type);
        if (result === "heal") this.health = Math.min(this.health + 1, 10);
        this.powerUps.splice(i, 1);
      }
    }
    if (!this.player.isInvincible) {
      for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
        const eb = this.enemyBullets[i];
        if (
          eb.x < this.player.x + this.player.width - 15 &&
          eb.x + eb.width > this.player.x + 15 &&
          eb.y < this.player.y + this.player.height - 15 &&
          eb.y + eb.height > this.player.y + 15
        ) {
          this.createExplosion(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            "#FF0000"
          );
          this.health--;
          this.enemyBullets.splice(i, 1);
          if (this.player.weaponLevel > 1) this.player.weaponLevel--;
          if (this.health > 0) this.player.activateShield();
          else this.endGame();
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
    document.getElementById(
      "uiBullets"
    ).textContent = `Lv.${this.player.weaponLevel}`;
    document.getElementById("uiBullets").style.color =
      WEAPONS[this.player.currentWeapon].color;
  }
  draw() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#0f3460");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "#FFF";
    this.ctx.globalAlpha = 0.5;
    for (let i = 0; i < 50; i++) {
      this.ctx.fillRect((i * 123) % this.width, (i * 87) % this.height, 2, 2);
    }
    this.ctx.globalAlpha = 1;
    this.player.draw(this.ctx);
    this.chickens.forEach((chicken) => chicken.draw(this.ctx));
    this.bullets.forEach((bullet) => bullet.draw(this.ctx));
    this.powerUps.forEach((powerUp) => powerUp.draw(this.ctx));
    this.enemyBullets.forEach((eb) => eb.draw(this.ctx));
    this.particles.forEach((p) => p.draw(this.ctx));
  }
  gameLoop() {
    this.update();
    this.draw();
    if (this.gameRunning) requestAnimationFrame(() => this.gameLoop());
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const heroType = urlParams.get("hero") || "soldier";
  new ChickenInvadersGame(heroType);
});
