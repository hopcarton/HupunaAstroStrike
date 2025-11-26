// Chicken Invaders Style Game

class Chicken {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 35;
        this.vx = 2;
        this.vy = 1;
        this.health = 1;
        this.moveDirection = 1;
        this.animationFrame = 0;
    }

    update() {
        this.x += this.vx * this.moveDirection;
        this.y += this.vy;
        this.animationFrame++;

        // Bounce at edges
        if (this.x < 0 || this.x > 400 - this.width) {
            this.moveDirection *= -1;
            this.x = Math.max(0, Math.min(400 - this.width, this.x));
        }
    }

    draw(ctx) {
        // Draw chicken body
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        // Body (yellow)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(0, 5, 18, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#FFE747';
        ctx.beginPath();
        ctx.arc(0, -8, 12, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-4, -10, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, -10, 2, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(8, -5);
        ctx.lineTo(0, -4);
        ctx.closePath();
        ctx.fill();

        // Wings (animated)
        const wingFlap = Math.sin(this.animationFrame * 0.1) * 5;
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.ellipse(-12, 3, 6, 12, -0.3 + wingFlap * 0.02, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(12, 3, 6, 12, 0.3 - wingFlap * 0.02, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.strokeStyle = '#FF6B35';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, 18);
        ctx.lineTo(-5, 25);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(5, 18);
        ctx.lineTo(5, 25);
        ctx.stroke();

        ctx.restore();
    }

    isOutOfBounds(height) {
        return this.y > height;
    }

    takeDamage() {
        this.health--;
        return this.health <= 0;
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 3;
        this.speed = 12;
    }

    update() {
        this.y -= this.speed;
    }

    draw(ctx) {
        // Bullet glow
        ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
        ctx.fill();

        // Main bullet
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x - 1, this.y - 1, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    isOutOfBounds() {
        return this.y < 0;
    }
}

class Player {
    constructor(canvasWidth, canvasHeight) {
        this.width = 50;
        this.height = 40;
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight - 50;
        this.speed = 8;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.shootCooldown = 0;
    }

    move(direction) {
        if (direction === 'left') {
            this.x = Math.max(0, this.x - this.speed);
        } else if (direction === 'right') {
            this.x = Math.min(this.canvasWidth - this.width, this.x + this.speed);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        // Gun barrel base
        ctx.fillStyle = '#555';
        ctx.fillRect(-this.width / 2, this.height / 2 - 8, this.width, 12);

        // Gun barrel (triangle)
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(-5, -this.height / 2 + 5);
        ctx.lineTo(5, -this.height / 2 + 5);
        ctx.lineTo(0, -this.height / 2 - 15);
        ctx.closePath();
        ctx.fill();

        // Barrel
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2 + 5);
        ctx.lineTo(0, -this.height / 2 - 15);
        ctx.stroke();

        // Body
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(-this.width / 2 + 5, -5, this.width - 10, 10);

        // Glow effect
        ctx.strokeStyle = 'rgba(76, 175, 80, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2 + 3, -7, this.width - 6, 14);

        ctx.restore();
    }

    canShoot() {
        if (this.shootCooldown <= 0) {
            this.shootCooldown = 8;
            return true;
        }
        this.shootCooldown--;
        return false;
    }
}

class ChickenInvadersGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.player = new Player(this.width, this.height);
        this.chickens = [];
        this.bullets = [];

        this.score = 0;
        this.health = 3;
        this.wave = 1;
        this.chickenCount = 0;
        this.maxChickensPerWave = 5;

        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;

        this.keys = {};
        this.spawnCounter = 0;
        this.waveCounter = 0;

        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            if (e.key === ' ') {
                e.preventDefault();
                this.shoot();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    }

    start() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            document.getElementById('startBtn').disabled = true;
            document.getElementById('pauseBtn').disabled = false;
            this.gameLoop();
        }
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').textContent = this.gamePaused ? 'Tiếp Tục' : 'Tạm Dừng';
    }

    reset() {
        this.chickens = [];
        this.bullets = [];
        this.score = 0;
        this.health = 3;
        this.wave = 1;
        this.chickenCount = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.spawnCounter = 0;
        this.waveCounter = 0;

        this.player.x = this.width / 2 - this.player.width / 2;

        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = 'Tạm Dừng';

        this.updateUI();
        this.draw();
    }

    shoot() {
        if (this.gameRunning && !this.gamePaused && this.player.canShoot()) {
            const bullet = new Bullet(
                this.player.x + this.player.width / 2,
                this.player.y
            );
            this.bullets.push(bullet);
        }
    }

    spawnEnemies() {
        // Spawn chickens in waves
        if (this.chickenCount < this.maxChickensPerWave) {
            if (this.spawnCounter++ > 80) {
                const x = Math.random() * (this.width - 50);
                this.chickens.push(new Chicken(x, -40));
                this.chickenCount++;
                this.spawnCounter = 0;
            }
        }

        // Check if wave complete
        if (this.chickenCount >= this.maxChickensPerWave && this.chickens.length === 0) {
            this.nextWave();
        }
    }

    nextWave() {
        this.wave++;
        this.chickenCount = 0;
        this.maxChickensPerWave = Math.min(3 + this.wave, 15);
        this.spawnCounter = 0;
    }

    update() {
        if (!this.gameRunning || this.gamePaused) return;

        // Player movement
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.move('left');
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.move('right');
        }

        // Spawn chickens
        this.spawnEnemies();

        // Update chickens
        this.chickens.forEach(chicken => chicken.update());

        // Update bullets
        this.bullets.forEach(bullet => bullet.update());

        // Remove out of bounds chickens
        this.chickens = this.chickens.filter(chicken => {
            if (chicken.isOutOfBounds(this.height)) {
                this.health--;
                if (this.health <= 0) {
                    this.endGame();
                }
                return false;
            }
            return true;
        });

        // Remove out of bounds bullets
        this.bullets = this.bullets.filter(b => !b.isOutOfBounds());

        // Check collisions
        this.checkCollisions();

        this.updateUI();
    }

    checkCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            let bulletHit = false;

            for (let j = this.chickens.length - 1; j >= 0; j--) {
                const chicken = this.chickens[j];

                // Collision detection
                if (bullet.x > chicken.x &&
                    bullet.x < chicken.x + chicken.width &&
                    bullet.y > chicken.y &&
                    bullet.y < chicken.y + chicken.height) {

                    bulletHit = true;
                    if (chicken.takeDamage()) {
                        this.chickens.splice(j, 1);
                        this.score += 100;
                    }
                    break;
                }
            }

            if (bulletHit) {
                this.bullets.splice(i, 1);
            }
        }
    }

    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
    }

    draw() {
        // Draw background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw stars
        this.ctx.fillStyle = '#FFF';
        this.ctx.globalAlpha = 0.5;
        for (let i = 0; i < 50; i++) {
            const x = (i * 73) % this.width;
            const y = (i * 97) % this.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
        this.ctx.globalAlpha = 1;

        // Draw ground
        this.ctx.fillStyle = 'rgba(0, 100, 0, 0.3)';
        this.ctx.fillRect(0, this.height - 60, this.width, 60);

        // Draw game objects
        this.player.draw(this.ctx);

        this.chickens.forEach(chicken => chicken.draw(this.ctx));
        this.bullets.forEach(bullet => bullet.draw(this.ctx));

        // Draw game over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.width, this.height);

            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 44px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 50);

            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Điểm: ${this.score}`, this.width / 2, this.height / 2 + 10);
            this.ctx.fillText(`Wave: ${this.wave}`, this.width / 2, this.height / 2 + 40);
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('health').textContent = this.health;
    }

    gameLoop() {
        this.update();
        this.draw();

        if (this.gameRunning) {
            requestAnimationFrame(() => this.gameLoop());
        } else if (this.gameOver) {
            setTimeout(() => {
                document.getElementById('startBtn').disabled = false;
                document.getElementById('pauseBtn').disabled = true;
                this.reset();
            }, 2500);
        }
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    const game = new ChickenInvadersGame('gameCanvas');
});
