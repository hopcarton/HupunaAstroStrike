// --- IMAGE CONFIG ---
const IMAGE_BASE_PATH = "../../image/";
const BOT_IMAGE_PATHS = ["bot.png", "bot1.png", "bot2.png", "bot3.png", "bot4.png"];
const getBotImage = (typeIndex) => {
  // Regular bots (0-4) use their own images, bosses (5-8) reuse images 0-3
  const imageIndex = typeIndex < 5 ? typeIndex : (typeIndex - 5) % 4;
  return IMAGE_BASE_PATH + BOT_IMAGE_PATHS[imageIndex];
};
const ENEMY_BULLET_IMG = IMAGE_BASE_PATH + "box.png";

// --- SOUND SYSTEM ---
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.soundsEnabled = true;
    this.volume = 0.4; // Default volume (0-1)
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.soundsEnabled = false;
    }
  }

  playTone(frequency, duration, type = "sine", volume = null, startTime = null) {
    if (!this.soundsEnabled || !this.audioContext) return;
    
    const now = startTime !== null ? startTime : this.audioContext.currentTime;
    const vol = volume !== null ? volume : this.volume;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(vol, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
    
    return { oscillator, gainNode };
  }

  playComplexSound(frequencies, durations, types, volumes, delays = []) {
    if (!this.soundsEnabled || !this.audioContext) return;
    const now = this.audioContext.currentTime;
    
    frequencies.forEach((freq, i) => {
      const delay = delays[i] || 0;
      this.playTone(freq, durations[i] || 0.1, types[i] || "sine", volumes[i], now + delay);
    });
  }

  // Helper to create oscillator with gain
  createOscillatorWithGain(freq, type, startTime, duration, volume, freqRamp = null) {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.type = type;
    if (freqRamp) {
      osc.frequency.setValueAtTime(freqRamp.start, startTime);
      osc.frequency.exponentialRampToValueAtTime(freqRamp.end, startTime + duration);
    } else {
      osc.frequency.setValueAtTime(freq, startTime);
    }
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  playSound(type) {
    if (!this.soundsEnabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    switch (type) {
      case "shoot":
        // High-tech laser/plasma shot - "chiu chiu" sound
        this.createOscillatorWithGain(2000, "sine", now, 0.06, 0.25, { start: 2000, end: 800 });
        this.createOscillatorWithGain(1200, "square", now + 0.02, 0.1, 0.15, { start: 1200, end: 600 });
        this.createOscillatorWithGain(3000, "sine", now, 0.04, 0.12, { start: 3000, end: 1500 });
        break;
        
      case "hit":
        // Sharp impact with metallic ring
        this.playComplexSound(
          [600, 400, 300, 500],
          [0.05, 0.08, 0.1, 0.06],
          ["square", "sawtooth", "sine", "sine"],
          [0.2, 0.15, 0.1, 0.12],
          [0, 0.02, 0.04, 0.03]
        );
        break;
        
      case "explosion":
        // Powerful explosion with rumble
        this.playComplexSound(
          [150, 100, 80, 200, 120],
          [0.15, 0.2, 0.25, 0.1, 0.12],
          ["sawtooth", "sawtooth", "sawtooth", "square", "sine"],
          [0.35, 0.3, 0.25, 0.2, 0.15],
          [0, 0.03, 0.06, 0.01, 0.04]
        );
        break;
        
      case "playerHit":
        // Warning alarm with urgency
        this.playComplexSound(
          [400, 350, 300, 250, 200],
          [0.1, 0.1, 0.12, 0.12, 0.15],
          ["sawtooth", "sawtooth", "sawtooth", "sawtooth", "sawtooth"],
          [0.4, 0.35, 0.3, 0.25, 0.2],
          [0, 0.05, 0.1, 0.15, 0.2]
        );
        break;
        
      case "collect":
        // Pleasant collection chime
        this.playComplexSound(
          [523, 659, 784, 1047],
          [0.12, 0.12, 0.15, 0.18],
          ["sine", "sine", "sine", "sine"],
          [0.25, 0.25, 0.3, 0.25],
          [0, 0.05, 0.1, 0.15]
        );
        break;
        
      case "waveComplete":
        // Triumphant fanfare
        this.playComplexSound(
          [523, 659, 784, 1047, 1319],
          [0.2, 0.2, 0.25, 0.25, 0.3],
          ["sine", "sine", "sine", "sine", "sine"],
          [0.35, 0.35, 0.4, 0.35, 0.3],
          [0, 0.08, 0.16, 0.24, 0.32]
        );
        break;
        
      case "bossSpawn":
        // Dramatic boss entrance
        this.playComplexSound(
          [100, 80, 60, 120, 150, 200],
          [0.2, 0.25, 0.3, 0.15, 0.18, 0.12],
          ["sawtooth", "sawtooth", "sawtooth", "square", "square", "sine"],
          [0.45, 0.4, 0.35, 0.3, 0.25, 0.2],
          [0, 0.05, 0.1, 0.03, 0.08, 0.12]
        );
        break;
        
      case "powerUp":
        // Exciting power-up sequence
        this.playComplexSound(
          [440, 554, 659, 880, 1108],
          [0.1, 0.1, 0.12, 0.12, 0.15],
          ["sine", "sine", "sine", "sine", "sine"],
          [0.25, 0.28, 0.3, 0.28, 0.25],
          [0, 0.06, 0.12, 0.18, 0.24]
        );
        break;
    }
  }

  toggleSounds() {
    this.soundsEnabled = !this.soundsEnabled;
    return this.soundsEnabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }
}

// --- BACKGROUND MUSIC SYSTEM ---
class MusicManager {
  constructor() {
    this.audioContext = null;
    this.musicEnabled = true;
    this.volume = 0.25; // Lower volume for background music
    this.isPlaying = false;
    this.oscillators = [];
    this.gainNodes = [];
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.musicEnabled = false;
    }
  }

  playBackgroundMusic() {
    if (!this.musicEnabled || !this.audioContext || this.isPlaying) return;
    
    this.isPlaying = true;
    const now = this.audioContext.currentTime;
    
    // War/combat music - intense, driving rhythm
    const loopDuration = 3.2; // 3.2 seconds loop - faster, more intense
    
    // Helper to create and play note
    const createNote = (freq, type, startTime, duration, volume, freqRamp = null) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.type = type;
      if (freqRamp) {
        osc.frequency.setValueAtTime(freqRamp.start, startTime);
        osc.frequency.exponentialRampToValueAtTime(freqRamp.end, startTime + duration);
      } else {
        osc.frequency.value = freq;
      }
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    
    const playLoop = (startTime) => {
      // Deep war drum - heavy bass pulse
      const drumFreqs = [80, 100, 90, 110];
      const drumTimes = [0, 0.8, 1.6, 2.4];
      drumTimes.forEach((t, i) => {
        createNote(drumFreqs[i], "sawtooth", startTime + t, 0.15, this.volume * 0.4);
      });
      
      // Aggressive synth bass - driving rhythm
      const bassPattern = [
        { freq: 165, time: 0, duration: 0.15 },
        { freq: 196, time: 0.4, duration: 0.15 },
        { freq: 165, time: 0.8, duration: 0.15 },
        { freq: 220, time: 1.2, duration: 0.15 },
        { freq: 165, time: 1.6, duration: 0.15 },
        { freq: 196, time: 2.0, duration: 0.15 },
        { freq: 165, time: 2.4, duration: 0.15 },
        { freq: 247, time: 2.8, duration: 0.15 },
      ];
      
      bassPattern.forEach((note) => {
        createNote(note.freq, "square", startTime + note.time, note.duration, this.volume * 0.35);
      });
      
      // Tense melody - minor key, war-like
      const warMelody = [
        { freq: 392, time: 0.2, duration: 0.2 },  // G
        { freq: 330, time: 0.5, duration: 0.2 },   // E
        { freq: 294, time: 0.8, duration: 0.25 }, // D
        { freq: 330, time: 1.1, duration: 0.2 },  // E
        { freq: 392, time: 1.4, duration: 0.2 }, // G
        { freq: 440, time: 1.7, duration: 0.2 },  // A
        { freq: 392, time: 2.0, duration: 0.25 }, // G
        { freq: 330, time: 2.4, duration: 0.2 },  // E
        { freq: 294, time: 2.7, duration: 0.3 }, // D
      ];
      
      warMelody.forEach((note) => {
        createNote(note.freq, "sawtooth", startTime + note.time, note.duration, this.volume * 0.3);
      });
      
      // High tension layer - metallic, aggressive
      const tensionFreqs = [880, 784, 659, 880, 784, 659, 988, 880];
      const tensionTimes = [0.3, 0.6, 0.9, 1.5, 1.8, 2.1, 2.5, 2.8];
      
      tensionTimes.forEach((t, i) => {
        createNote(tensionFreqs[i], "square", startTime + t, 0.12, this.volume * 0.2);
      });
      
      // Schedule next loop
      if (this.isPlaying) {
        setTimeout(() => playLoop(startTime + loopDuration), loopDuration * 1000);
      }
    };
    
    // Start first loop
    playLoop(now);
  }

  stopBackgroundMusic() {
    this.isPlaying = false;
    // Oscillators will stop naturally when their duration ends
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      this.stopBackgroundMusic();
    } else if (!this.isPlaying) {
      this.playBackgroundMusic();
    }
    return this.musicEnabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }
}

// --- BOT STATS ---
const BOT_STATS = {
  0: { hp: 2, score: 50, scale: 0.8, speed: 2 },
  1: { hp: 5, score: 100, scale: 0.9, speed: 2.2 },
  2: { hp: 10, score: 200, scale: 1.0, speed: 2.5 },
  3: { hp: 20, score: 400, scale: 1.2, speed: 2.8 },
  // Boss types - different bosses for different waves
  4: { hp: 200, score: 5000, scale: 2.5, speed: 1.5 }, // Boss 1 - Basic boss
  5: { hp: 300, score: 6000, scale: 2.8, speed: 1.3 }, // Boss 2 - Tank boss
  6: { hp: 400, score: 7000, scale: 3.0, speed: 1.6 }, // Boss 3 - Fast boss
  7: { hp: 500, score: 8000, scale: 3.2, speed: 1.4 }, // Boss 4 - Heavy boss
  8: { hp: 600, score: 10000, scale: 3.5, speed: 1.2 }, // Boss 5 - Ultimate boss
};

// --- HEROES ---
const HEROES = {
  soldier: { name: "🚀 Soldier", imgSrc: IMAGE_BASE_PATH + "hero1.png" },
  pyromancer: { name: "🛸 Pyromancer", imgSrc: IMAGE_BASE_PATH + "hero2.png" },
  thunderlord: { name: "✈️ Thunderlord", imgSrc: IMAGE_BASE_PATH + "hero3.png" },
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
      this.size = Math.random() * 5 + 3; // Slightly larger for better visibility
      this.speedX = (Math.random() - 0.5) * 5;
      this.speedY = (Math.random() - 0.5) * 5;
      this.life = 50; // Longer life for better visibility
    } else if (type === "explosion") {
      this.size = Math.random() * 3 + 1.5; // Reduced from 4+2 to 3+1.5
      this.speedX = (Math.random() - 0.5) * speed * 1.2; // Reduced from 2 to 1.2
      this.speedY = (Math.random() - 0.5) * speed * 1.2; // Reduced from 2 to 1.2
      this.life = 60; // Reduced from 80 to 60
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.15; // Reduced from 0.2 to 0.15
    } else if (type === "spark") {
      this.size = Math.random() * 1.5 + 0.8; // Reduced from 2+1 to 1.5+0.8
      this.speedX = (Math.random() - 0.5) * speed * 1.0; // Reduced from 1.5 to 1.0
      this.speedY = (Math.random() - 0.5) * speed * 1.0; // Reduced from 1.5 to 1.0
      this.life = 40; // Reduced from 50 to 40
    } else if (type === "thrust") {
      // Thrust particles for hero exhaust
      this.size = Math.random() * 3 + 2; // Increased from 2+1 to 3+2
      this.speedX = (Math.random() - 0.5) * 1.5; // Small horizontal spread
      this.speedY = Math.random() * 2 + 1; // Always go down (behind hero)
      this.life = 35; // Slightly longer life
    } else {
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * speed - speed / 2;
      this.speedY = Math.random() * speed - speed / 2;
      this.life = 60;
    }
  }
  update(deltaTime = 1) {
    this.x += this.speedX * deltaTime;
    this.y += this.speedY * deltaTime;
    this.life -= 2 * deltaTime;
    this.size *= Math.pow(0.92, deltaTime);
    if (this.rotationSpeed) {
      this.rotation += this.rotationSpeed * deltaTime;
    }
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life / 100);
    
    if (this.type === "explosion") {
      // Draw with glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
    } else if (this.type === "thrust") {
      // Draw thrust particles with glow
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
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
  update(deltaTime = 1) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.rotation += 0.1 * deltaTime;
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

    // Initialize position - start at spawn position
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    // Set anchor to start position to prevent jerky movement on first frame
    this.anchorX = startX;
    this.anchorY = startY;

    this.state = "entering";

    this.width = 45 * config.scale;
    this.height = 45 * config.scale;
    this.health = config.hp * difficultyMult;
    this.maxHealth = this.health;
    this.scoreValue = config.score;

    this.image = new Image();
    this.image.src = getBotImage(typeIndex);

    this.swayPhase = Math.random() * Math.PI * 2;

    // Boss types (4-8) can shoot, regular enemies have 40% chance
    this.canShoot = Math.random() < 0.4 || (typeIndex >= 4 && typeIndex <= 8);
    // Boss shoots more frequently (50-150ms vs 200-600ms)
    this.shootCooldown = (typeIndex >= 4 && typeIndex <= 8) ? Math.random() * 100 + 50 : Math.random() * 400 + 200;
    this.hitFlashTimer = 0;
    this.hasItem = false;
    this.inFormation = true; // Track if bot is still in a formation
  }

  update(globalTime, deltaTime = 1) {
    if (this.state === "entering") {
      // Much slower entry speed for smoother appearance
      const lerpSpeed = 0.025 * deltaTime;
      // Update anchor position smoothly to target
      this.anchorX += (this.targetX - this.anchorX) * lerpSpeed;
      this.anchorY += (this.targetY - this.anchorY) * lerpSpeed;
      // Update actual position from anchor
      this.x = this.anchorX;
      this.y = this.anchorY;
      if (Math.abs(this.anchorX - this.targetX) < 0.2 && Math.abs(this.anchorY - this.targetY) < 0.2) {
        this.anchorX = this.targetX;
        this.anchorY = this.targetY;
        this.x = this.targetX;
        this.y = this.targetY;
        this.state = "active";
      }
    } else if (this.state === "active") {
      // Smooth movement - bots can overlap completely, no collision physics
      const distanceY = this.targetY - this.anchorY;
      const distanceX = this.targetX - this.anchorX;
      const lerpSpeed = 0.015 * deltaTime;
      const easeFactor = Math.min(Math.max(Math.abs(distanceY), Math.abs(distanceX)) / 50, 1) * 0.4 + 0.6;
      this.anchorY += distanceY * lerpSpeed * easeFactor;
      this.anchorX += distanceX * lerpSpeed * easeFactor;
      this.x = this.anchorX + Math.sin(globalTime * 0.02 + this.swayPhase) * 20;
      this.y = this.anchorY + Math.cos(globalTime * 0.03 + this.swayPhase) * 10;
      if (this.canShoot) this.shootCooldown -= deltaTime;
    }
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= deltaTime;
  }

  tryShoot(playerX, playerY, globalTime = 0) {
    if (this.state !== "active" || this.y < 0 || !this.canShoot) return null;

    if (this.shootCooldown <= 0) {
      this.shootCooldown = Math.random() * 600 + 300;

      if (this.typeIndex >= 4 && this.typeIndex <= 8) {
        // Boss with multiple attack patterns
        const bullets = [];
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height;
        const healthPercent = this.health / this.maxHealth;
        
        // Pattern based on health and random chance
        const pattern = Math.floor((1 - healthPercent) * 4) % 4; // More aggressive as health decreases
        const randPattern = Math.floor(Math.random() * 4);
        const usePattern = healthPercent < 0.5 ? pattern : randPattern;
        
        if (usePattern === 0) {
          // Pattern 1: Direct shot + homing
        bullets.push(new EnemyBullet(cx, cy, 0, 5, 40, "#FF0000"));
        const angle = Math.atan2(playerY - cy, playerX - cx);
        bullets.push(new EnemyBullet(cx, cy, Math.cos(angle) * 4, Math.sin(angle) * 4, 15, "#FF00FF"));
        } else if (usePattern === 1) {
          // Pattern 2: Spread shot (5 bullets)
          const angle = Math.atan2(playerY - cy, playerX - cx);
          for (let i = -2; i <= 2; i++) {
            const spreadAngle = angle + (i * 0.3);
            bullets.push(new EnemyBullet(cx, cy, Math.cos(spreadAngle) * 4, Math.sin(spreadAngle) * 4, 20, "#FF6600"));
          }
        } else if (usePattern === 2) {
          // Pattern 3: Spiral shot (8 bullets in circle)
          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i / 8) + (globalTime * 0.1);
            bullets.push(new EnemyBullet(cx, cy, Math.cos(angle) * 3, Math.sin(angle) * 3, 18, "#FF00FF"));
          }
        } else {
          // Pattern 4: Wave shot (3 waves of bullets)
          const angle = Math.atan2(playerY - cy, playerX - cx);
          for (let i = -1; i <= 1; i++) {
            const waveAngle = angle + (i * 0.4);
            const speed = 4 + Math.abs(i) * 0.5;
            bullets.push(new EnemyBullet(cx, cy, Math.cos(waveAngle) * speed, Math.sin(waveAngle) * speed, 22, "#00FFFF"));
          }
        }
        
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
    // Allow drawing enemies that are entering or slightly off-screen
    // Only skip if way off screen
    if (this.state === "entering") {
      // Always draw entering enemies (they're moving into position)
      // Only skip if extremely far off screen
      if (this.x < -400 || this.x > window.innerWidth + 400) return;
    } else {
      // For active enemies, use normal bounds check
      if (this.x < -200 || this.x > window.innerWidth + 200) return;
    }

    ctx.save();
    if (this.hitFlashTimer > 0) ctx.filter = "brightness(500%) sepia(100%)";

    if (this.image.complete && this.image.naturalHeight !== 0) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    ctx.filter = "none";

    if (this.typeIndex >= 4 && this.typeIndex <= 8) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(this.x, this.y - 15, this.width, 8);
      ctx.fillStyle = "#0f0";
      ctx.fillRect(this.x, this.y - 15, this.width * (this.health / this.maxHealth), 8);
    }
    ctx.restore();
  }

  isOutOfBounds(height) {
    // Only consider out of bounds if enemy is active and below screen
    // Don't filter enemies that are still entering (they might be off-screen initially)
    if (this.state === "entering") {
      return false; // Never filter entering enemies
    }
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

  update(deltaTime = 1) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.timer += deltaTime;
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
    this.rotation = 0;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.pulseScale = 1;
  }
  update(deltaTime = 1) {
    this.y += this.vy * deltaTime;
    this.x += this.vx * deltaTime;
    if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
    
    // Add rotation and pulsing animation for better visual
    if (!this.rotation) this.rotation = 0;
    this.rotation += 0.05 * deltaTime;
    this.bobOffset += 0.1 * deltaTime;
    this.pulseScale = 1 + Math.sin(this.bobOffset * 2) * 0.1;
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    
    // Only lightning effect with bright, thick glow - no rotation, pulsing, or bobbing

    if (this.type === "health") {
      // Multiple glow layers for ultra bright, thick border
      ctx.shadowColor = "#FF0000";
      ctx.font = "28px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Outermost glow layer - ultra bright
      ctx.shadowBlur = 70;
      ctx.globalAlpha = 0.8;
      ctx.fillText("🍖", 0, 0);
      // Outer glow layer
      ctx.shadowBlur = 55;
      ctx.globalAlpha = 0.85;
      ctx.fillText("🍖", 0, 0);
      // Middle glow layer
      ctx.shadowBlur = 40;
      ctx.globalAlpha = 0.9;
      ctx.fillText("🍖", 0, 0);
      // Main layer
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 30;
      ctx.fillText("🍖", 0, 0);
    } else {
      let color = "#FFF";
      if (this.type === "red") color = "#FF0000";
      else if (this.type === "green") color = "#00FF00";
      else if (this.type === "blue") color = "#00FFFF";
      else if (this.type === "purple") color = "#D000FF";
      else if (this.type === "orange") color = "#FF8C00";

      // Lightning icon with ultra bright, thick glow layers
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Outermost glow layer - ultra bright and very thick
      ctx.shadowColor = color;
      ctx.shadowBlur = 70;
      ctx.globalAlpha = 0.8;
      ctx.fillText("⚡", 0, 0);
      
      // Outer glow layer - bright and thick
      ctx.shadowBlur = 55;
      ctx.globalAlpha = 0.85;
      ctx.fillText("⚡", 0, 0);
      
      // Middle glow layer
      ctx.shadowBlur = 40;
      ctx.globalAlpha = 0.9;
      ctx.fillText("⚡", 0, 0);
      
      // Inner glow layer
      ctx.shadowBlur = 25;
      ctx.globalAlpha = 0.95;
      ctx.fillText("⚡", 0, 0);
      
      // Main icon - fully opaque
      ctx.shadowBlur = 15;
      ctx.globalAlpha = 1;
      ctx.fillText("⚡", 0, 0);
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
    this.canvasHeight = canvasHeight;
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
    this.state = "active"; // "active", "respawn"
    this.respawnY = canvasHeight + 100; // Start from below screen
    this.respawnSpeed = 5;
  }
  // Remove keyboard move, add mouse follow
  moveTo(x, y) {
    this.targetX = Math.max(0, Math.min(this.canvasWidth - this.width, x - this.width / 2));
    this.targetY = Math.max(0, Math.min(window.innerHeight - 70 - this.height, y - this.height / 2));
  }
  update(deltaTime = 1) {
    if (this.state === "respawn") {
      // Respawn animation: fly up from bottom
      this.y -= this.respawnSpeed * deltaTime;
      this.x = this.canvasWidth / 2 - this.width / 2; // Center horizontally
      this.targetX = this.x;
      this.targetY = this.canvasHeight - 100;
      
      // When reached target position, become active
      if (this.y <= this.targetY) {
        this.y = this.targetY;
        this.state = "active";
        this.isInvincible = true;
        this.invincibleTimer = 180; // 3 seconds invincibility after respawn
        // Set target to current position so mouse "jumps" to hero position
        this.targetX = this.x;
        this.targetY = this.y;
      }
    } else if (this.state === "active") {
      // Smoothly follow mouse with delta time
      const lerpSpeed = 0.25 * deltaTime;
      this.x += (this.targetX - this.x) * lerpSpeed;
      this.y += (this.targetY - this.y) * lerpSpeed;
    }
    
    this.glowIntensity = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
    if (this.isInvincible) {
      this.invincibleTimer -= deltaTime;
      this.opacity = Math.floor(this.invincibleTimer / 5) % 2 === 0 ? 0.3 : 1;
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
        this.opacity = 1;
      }
    }
  }
  
  respawn() {
    this.state = "respawn";
    this.y = this.canvasHeight + 100; // Start from below screen
    this.x = this.canvasWidth / 2 - this.width / 2;
    this.targetX = this.x;
    this.targetY = this.canvasHeight - 100;
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.opacity = 1;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.globalAlpha = this.opacity;
    
    // Draw glow effect around hero (no border circle)
    const weaponColor = WEAPONS[this.currentWeapon].color;
    
    // Glow shadow effect only
    ctx.shadowBlur = 20;
    ctx.shadowColor = weaponColor;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    if (this.isInvincible) {
      // Shield effect with glow
      ctx.shadowBlur = 25;
      ctx.shadowColor = weaponColor;
    }
    
    // Draw player image with brightness boost and glow
    if (this.image.complete && this.image.naturalHeight !== 0) {
      ctx.filter = "brightness(1.2)";
      ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
      ctx.filter = "none";
    } else {
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    
    ctx.restore();
  }

  shoot(deltaTime = 1) {
    this.autoShootTimer += deltaTime;
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
      // When changing weapon, reduce weapon level by 1
      if (this.weaponLevel > 1) this.weaponLevel--;
      this.currentWeapon = type;
    }
    return "weapon";
  }
}

class ChickenInvadersGame {
  constructor(heroType = "soldier") {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    
    // Cache DOM elements for better performance
    this.dom = {
      resumeBtn: document.getElementById("resumeBtn"),
      exitBtn: document.getElementById("exitBtn"),
      restartBtn: document.getElementById("restartBtn"),
      menuBtn: document.getElementById("menuBtn"),
      pauseMenu: document.getElementById("pauseMenu"),
      gameOverScreen: document.getElementById("gameOverScreen"),
      uiScore: document.getElementById("uiScore"),
      uiWave: document.getElementById("uiWave"),
      uiHealth: document.getElementById("uiHealth"),
      uiBullets: document.getElementById("uiBullets"),
      finalScore: document.getElementById("finalScore"),
      finalWave: document.getElementById("finalWave"),
      heroName: document.getElementById("heroName")
    };
    
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
    this.health = 3;
    this.wave = 0;
    this.gameRunning = false;
    this.gamePaused = false;
    this.keys = {};
    this.globalTime = 0;
    this.wavePending = false;
    this.waveTransitionDelay = 0;
    this.waveSpawnDelay = 0;
    
    // Staggered spawn for every 2 waves
    this.staggeredSpawnQueue = []; // Queue of bots to spawn one by one
    this.staggeredSpawnTimer = 0;
    this.staggeredSpawnDelay = 15; // Delay between each spawn (frames)
    
    // Sound system
    this.soundManager = new SoundManager();
    this.musicManager = new MusicManager();
    
    // Delta time for smooth animations
    this.lastTime = performance.now();
    this.deltaTime = 0;
    this.targetFPS = 60;
    this.frameTime = 1000 / this.targetFPS;

    // Starfield setup - optimized with Array.from
    const starColors = ["#fff", "#b3e0ff", "#ffe0b3"];
    this.stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      r: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.7 + 0.3,
      color: starColors[Math.floor(Math.random() * 3)]
    }));

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
    // Combine keydown handlers
    document.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
      if (e.key === "Escape") {
        e.preventDefault();
        if (this.gameRunning) this.togglePause();
      }
    });
    document.addEventListener("keyup", (e) => { this.keys[e.key] = false; });
    window.addEventListener("resize", () => { this.resizeCanvas(); });
    
    // Use cached DOM elements
    this.dom.resumeBtn?.addEventListener("click", () => this.togglePause());
    this.dom.exitBtn?.addEventListener("click", () => this.exitToMenu());
    this.dom.restartBtn?.addEventListener("click", () => this.restart());
    this.dom.menuBtn?.addEventListener("click", () => this.exitToMenu());
    
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.player.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });
    setTimeout(() => this.start(), 500);
  }
  start() {
    if (!this.gameRunning) {
      this.gameRunning = true;
      this.gamePaused = false;
      // Start background music
      this.musicManager.playBackgroundMusic();
      this.nextWave();
      this.gameLoop();
    }
  }
  togglePause() {
    this.gamePaused = !this.gamePaused;
    this.dom.pauseMenu?.classList.toggle("hidden");
  }
  restart() {
    this.chickens = [];
    this.bullets = [];
    this.powerUps = [];
    this.enemyBullets = [];
    this.particles = [];
    this.score = 0;
    this.health = 3;
    this.wave = 0;
    this.gameRunning = false;
    this.gamePaused = false;
    this.dom.gameOverScreen?.classList.add("hidden");
    this.dom.pauseMenu?.classList.add("hidden");
    const currentSkin = this.player.image.src;
    this.player = new Player(this.width, this.height, { imgSrc: currentSkin });
    this.start();
  }
  exitToMenu() { window.close(); }

  getWaveConfig(wave) {
    // Boss every 5th wave (wave 5, 10, 15, 20, 25, etc.)
    if (wave > 0 && wave % 5 === 0) {
      // Different boss for each boss wave
      const bossWaveIndex = Math.floor(wave / 5); // 1, 2, 3, 4, 5...
      const bossType = Math.min(4 + (bossWaveIndex - 1) % 5, 8); // Cycle through boss types 4-8
      return { pattern: "boss", cols: 1, rows: 1, type: [bossType], bossType: bossType };
    }
    
    // Chicken Invaders 4 style formations - simpler, more classic
    const baseCols = 8;
    const baseRows = 3;
    
    // Wave progression - more enemies as waves increase
    let cols = baseCols;
    let rows = baseRows;
    if (wave <= 3) {
      cols = 6;
      rows = 2;
    } else if (wave <= 6) {
      cols = 8;
      rows = 3;
    } else if (wave <= 10) {
      cols = 10;
      rows = 4;
    } else if (wave <= 15) {
      cols = 12;
      rows = 4;
    } else {
      cols = 14;
      rows = 5;
    }
    
    // Define available patterns - Chicken Invaders 4 style
    let availablePatterns = [];
    let availableTypes = [];
    
    if (wave <= 2) {
      // Wave 1-2: Simple grid only, type 0
      availablePatterns = ["grid"];
      availableTypes = [0];
    } else if (wave <= 4) {
      // Wave 3-4: Grid and V-formation, type 0-1
      availablePatterns = ["grid", "vformation"];
      availableTypes = [0, 1];
    } else if (wave <= 7) {
      // Wave 5-7: More patterns, type 0-2
      availablePatterns = ["grid", "vformation", "diamond", "sides"];
      availableTypes = [0, 1, 2];
    } else if (wave <= 12) {
      // Wave 8-12: All classic patterns, type 0-2
      availablePatterns = ["grid", "vformation", "diamond", "sides", "diagonal", "zigzag"];
      availableTypes = [0, 1, 2];
    } else {
      // Wave 13+: All patterns, all types
      availablePatterns = ["grid", "vformation", "diamond", "sides", "diagonal", "zigzag", "spiral", "circle", "wave"];
      availableTypes = [0, 1, 2, 3];
    }
    
    // Random pattern selection
    const pattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    
    // Adjust cols/rows for specific patterns
    if (pattern === "vformation") {
      cols = Math.min(cols, 10);
      rows = 2;
    } else if (pattern === "diamond") {
      cols = Math.min(cols, 5);
      rows = Math.min(rows, 5);
    } else if (pattern === "sides") {
      cols = Math.min(cols, 6);
      rows = Math.min(rows, 4);
    } else if (pattern === "diagonal") {
      cols = Math.min(cols, 6);
      rows = Math.min(rows, 4);
    } else if (pattern === "circle") {
      cols = Math.min(cols, 8);
      rows = 1;
    }
    
    return {
      pattern,
      cols,
      rows,
      type: availableTypes
    };
  }

  nextWave() {
    this.wave++;
    // Set pending flag BEFORE clearing to prevent immediate re-trigger
    this.wavePending = true;
    this.waveTransitionDelay = 0;
    this.waveSpawnDelay = 60; // Increased delay to ensure enemies spawn properly
    
    // Clear everything before next wave (like Chicken Invaders)
    this.enemyBullets = [];
    this.bullets = [];
    this.chickens = [];
    this.formations = [];
    this.powerUps = [];
    
    // Clear staggered spawn queue
    this.staggeredSpawnQueue = [];
    this.staggeredSpawnTimer = 0;
    
    // Get config for this wave
    const config = this.getWaveConfig(this.wave);
    
    // Check if this is a staggered spawn wave (every 2 waves: 2, 4, 6, 8...)
    const isStaggeredWave = this.wave > 0 && this.wave % 2 === 0 && config.pattern !== "boss";
    
    if (isStaggeredWave) {
      // Prepare staggered spawn - collect all bots to spawn one by one
      this.prepareStaggeredSpawn(config);
    } else {
      // Normal spawn - spawn all at once
      if (config.pattern === "boss" && config.bossType !== undefined) {
        this.spawnFormation(config.pattern, config.cols, config.rows, [config.bossType]);
      } else {
    this.spawnFormation(config.pattern, config.cols, config.rows, config.type);
      }
    }
    
    // Double check: if no enemies spawned and not in staggered mode, force spawn fallback grid
    if (this.chickens.length === 0 && !isStaggeredWave) {
      const fallbackCols = Math.min(config.cols || 5, 5);
      const fallbackRows = Math.min(config.rows || 3, 3);
      const spacing = 50;
      const startX = (this.width - fallbackCols * spacing) / 2;
      const startY = 100;
      
      for (let r = 0; r < fallbackRows; r++) {
        for (let c = 0; c < fallbackCols; c++) {
          const type = config.type[(r+c) % config.type.length] || 0;
          const targetX = startX + c * spacing;
          const targetY = startY + r * spacing;
          const spawnX = c < fallbackCols / 2 ? -100 : this.width + 100;
          const bot = new Chicken(spawnX, targetY, targetX, targetY, type, 1 + this.wave * 0.2);
          bot.state = "entering"; // Ensure entering state
          this.chickens.push(bot);
        }
      }
    }
  }

  prepareStaggeredSpawn(config) {
    // Calculate total number of enemies
    const totalEnemies = config.cols * config.rows;
    const maxTargetY = this.height * 0.5;
    const minX = 30;
    const maxX = this.width - 30;
    const minY = 60;
    const maxY = maxTargetY - 30;
    const hpMulti = 1 + this.wave * 0.2;
    
    // Create bots with random positions - ensure they start in "entering" state
    for (let i = 0; i < totalEnemies; i++) {
      // Random position
      const targetX = minX + Math.random() * (maxX - minX);
      const targetY = minY + Math.random() * (maxY - minY);
      
      // Random type from available types
      const type = config.type[Math.floor(Math.random() * config.type.length)];
      
      // Spawn from top at random X position
      const spawnX = minX + Math.random() * (maxX - minX);
      const spawnY = -50;
      
      const bot = new Chicken(spawnX, spawnY, targetX, targetY, type, hpMulti);
      // Bot already starts with anchor at spawn position, no need to override
      bot.inFormation = false;
      
      this.staggeredSpawnQueue.push({
        bot: bot,
        formation: null
      });
    }
  }

  spawnNextStaggeredBot() {
    if (this.staggeredSpawnQueue.length === 0) {
      this.staggeredSpawnTimer = 0;
      return;
    }
    
    const item = this.staggeredSpawnQueue.shift();
    const bot = item.bot;
    
    // Add bot to game (no formation for random spawn)
    this.chickens.push(bot);
  }

  spawnFormation(pattern, cols=8, rows=4, types=[0,1,2], isStaggeredPrep=false) {
    // Ensure enemies don't go below half screen (player area)
    const maxTargetY = this.height * 0.5; // Half screen max
    const minTargetY = 60;
    const targetStartY = Math.min(minTargetY + Math.min(this.wave * 5, 100), maxTargetY - rows * 20);
    const hpMulti = 1 + this.wave * 0.2;
    let waveBots = [];
    
    if (pattern === "grid") {
      // Chicken Invaders 4 style grid - classic rectangular formation
      const padding = 55; // Slightly larger spacing for better visibility
      const startX = (this.width - (cols - 1) * padding) / 2;
      const formation = { bots: [], cols, rows, x: startX, y: targetStartY, width: (cols - 1) * padding, direction: 1, speed: 0.7 + Math.min(this.wave * 0.02, 0.3) };
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Type distribution: stronger enemies in back rows
          let typeIndex = Math.floor((r / rows) * types.length);
          let type = types[Math.min(typeIndex, types.length - 1)];
          const targetX = startX + c * padding;
          const targetY = Math.min(targetStartY + r * padding, maxTargetY - 20);
          // Spawn from top, directly above target
          const spawnX = targetX;
          const spawnY = -50 - r * 5; // Slight stagger for visual effect
          let bot = new Chicken(spawnX, spawnY, targetX, targetY, type, hpMulti);
          // Don't override anchor - let it start from spawn position for smooth entry
          this.chickens.push(bot);
          waveBots.push(bot);
          formation.bots.push(bot);
        }
      }
      this.formations.push(formation);
    } else if (pattern === "diamond") {
      // Ensure width and height are valid numbers
      const safeWidth = this.width || window.innerWidth || 800;
      const safeHeight = this.height || window.innerHeight - 70 || 600;
      
      const centerX = safeWidth / 2;
      const centerY = Math.min(targetStartY + 50, maxTargetY - 50);
      const formation = { bots: [], x: centerX, y: centerY, direction: 1, speed: 0.7 };
      const spacing = 50;
      const actualCols = Math.min(cols || 5, 5);
      const actualRows = Math.min(rows || 5, 5);
      const startX = centerX - (actualCols - 1) * spacing / 2;
      const startY = Math.max(80, Math.min(centerY - (actualRows - 1) * spacing / 2, maxTargetY - actualRows * spacing));
      
      for (let r = 0; r < actualRows; r++) {
        for (let c = 0; c < actualCols; c++) {
          let type = types[(r+c) % types.length] || 0;
          const targetX = Math.max(50, Math.min(startX + c * spacing, safeWidth - 50));
          const targetY = Math.max(80, Math.min(startY + r * spacing, maxTargetY - 20));
          // Spawn from top
          const spawnX = targetX;
          const spawnY = -50;
          
          if (isNaN(targetX) || isNaN(targetY)) continue;
          
          let bot = new Chicken(spawnX, spawnY, targetX, targetY, type, hpMulti);
          // Don't override anchor - let it start from spawn position for smooth entry
            this.chickens.push(bot);
            waveBots.push(bot);
            formation.bots.push(bot);
          }
        }
      if (formation.bots.length > 0) {
      this.formations.push(formation);
      }
    } else if (pattern === "vformation") {
      const formation = { bots: [], x: this.width / 2, y: targetStartY, direction: 1, speed: 0.9 };
      const pointX = this.width / 2;
      const pointY = Math.min(targetStartY, maxTargetY - cols * 20);
      const spacing = 45;
      for (let i = 0; i < cols; i++) {
        let leftX = pointX - (i + 1) * spacing * 0.7;
        let rightX = pointX + (i + 1) * spacing * 0.7;
        let targetY = Math.min(pointY + i * spacing, maxTargetY - 20);
        let type = types[i % types.length];
        // Spawn from top, coming from sides
        let botL = new Chicken(leftX, -50, leftX, targetY, type, hpMulti);
        let botR = new Chicken(rightX, -50, rightX, targetY, type, hpMulti);
        // Don't override anchor - let it start from spawn position for smooth entry
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
          const targetX = this.width / 2 - 200 + line * spacing + i * spacing * 0.5;
          const targetY = Math.min(targetStartY + i * spacing, maxTargetY - 20);
          let type = types[(line+i) % types.length];
          // Spawn from top, zigzag pattern
          const spawnX = targetX;
          const spawnY = -50 - line * 10; // Stagger spawn for zigzag effect
          let bot = new Chicken(spawnX, spawnY, targetX, targetY, type, hpMulti);
          // Don't override anchor - let it start from spawn position for smooth entry
          this.chickens.push(bot);
          waveBots.push(bot);
          formation.bots.push(bot);
        }
      }
      this.formations.push(formation);
    } else if (pattern === "sides") {
      // Enemies come from both sides, converging to center
      const formation = { bots: [], x: this.width / 2, y: targetStartY, direction: 1, speed: 0.8 };
      const spacing = 50;
      const centerX = this.width / 2;
      const actualRows = Math.min(rows, 4);
      const actualCols = Math.min(cols, 6);
      
      for (let r = 0; r < actualRows; r++) {
        for (let c = 0; c < actualCols; c++) {
          const offsetX = (c - (actualCols - 1) / 2) * spacing;
          const targetX = centerX + offsetX;
          const targetY = Math.min(targetStartY + r * spacing, maxTargetY - 20);
          let type = types[(r+c) % types.length];
          // Spawn from top, coming from left or right side
          const spawnX = c < actualCols / 2 ? -50 : this.width + 50;
          const spawnY = -50 - r * 15; // Stagger spawn
          let bot = new Chicken(spawnX, spawnY, targetX, targetY, type, hpMulti);
          // Don't override anchor - let it start from spawn position for smooth entry
          this.chickens.push(bot);
          waveBots.push(bot);
          formation.bots.push(bot);
        }
      }
      this.formations.push(formation);
    } else if (pattern === "zigzag") {
      // Zigzag pattern: enemies spawn in alternating columns
      const formation = { bots: [], x: this.width / 2, y: targetStartY, direction: 1, speed: 0.8 };
      const spacing = 50;
      const actualCols = Math.min(cols, 8);
      const actualRows = Math.min(rows, 4);
      const startX = (this.width - actualCols * spacing) / 2;
      
      for (let r = 0; r < actualRows; r++) {
        for (let c = 0; c < actualCols; c++) {
          // Zigzag: alternate left-right offset
          const zigzagOffset = (r % 2 === 0 ? 0 : spacing / 2);
          const targetX = startX + c * spacing + zigzagOffset;
          const targetY = Math.min(targetStartY + r * spacing, maxTargetY - 20);
          let type = types[(r+c) % types.length];
          // Spawn from top with zigzag delay
          const spawnX = targetX;
          const spawnY = -50 - c * 8; // Stagger by column for zigzag effect
          let bot = new Chicken(spawnX, spawnY, targetX, targetY, type, hpMulti);
          // Don't override anchor - let it start from spawn position for smooth entry
          this.chickens.push(bot);
          waveBots.push(bot);
          formation.bots.push(bot);
        }
      }
      this.formations.push(formation);
    } else if (pattern === "spiral") {
      // Spiral pattern: enemies spawn in a spiral formation
      const formation = { bots: [], x: this.width / 2, y: targetStartY, direction: 1, speed: 0.8 };
      const centerX = this.width / 2;
      const centerY = Math.min(targetStartY + 50, maxTargetY - 100);
      const spacing = 60;
      const totalEnemies = Math.min(cols * rows, 20);
      
      for (let i = 0; i < totalEnemies; i++) {
        const angle = (Math.PI * 2 * i / totalEnemies) + (i * 0.3); // Spiral angle
        const radius = (i / totalEnemies) * spacing * 3;
        const targetX = centerX + Math.cos(angle) * radius;
        const targetY = Math.min(centerY + Math.sin(angle) * radius * 0.5, maxTargetY - 20);
        let type = types[i % types.length];
        const spawnX = targetX;
        const spawnY = -50 - i * 5; // Stagger spawn
        let bot = new Chicken(spawnX, spawnY, targetX, targetY, type, hpMulti);
        // Don't override anchor - let it start from spawn position for smooth entry
        this.chickens.push(bot);
        waveBots.push(bot);
        formation.bots.push(bot);
      }
      this.formations.push(formation);
    } else if (pattern === "circle") {
      // Circle pattern: enemies spawn in a circle
      const formation = { bots: [], x: this.width / 2, y: targetStartY, direction: 1, speed: 0.8 };
      const centerX = this.width / 2;
      const centerY = Math.min(targetStartY + 80, maxTargetY - 50);
      const radius = Math.min(150, this.width * 0.3);
      const totalEnemies = Math.min(cols, 12);
      
      for (let i = 0; i < totalEnemies; i++) {
        const angle = (Math.PI * 2 * i / totalEnemies);
        const targetX = centerX + Math.cos(angle) * radius;
        const targetY = centerY + Math.sin(angle) * radius * 0.6;
        let type = types[i % types.length];
        const spawnX = targetX;
        const spawnY = -50 - i * 3;
        let bot = new Chicken(spawnX, spawnY, targetX, targetY, type, hpMulti);
        // Don't override anchor - let it start from spawn position for smooth entry
        this.chickens.push(bot);
        waveBots.push(bot);
        formation.bots.push(bot);
      }
      this.formations.push(formation);
    } else if (pattern === "wave") {
      // Wave pattern: enemies spawn in wave formation
      const formation = { bots: [], x: this.width / 2, y: targetStartY, direction: 1, speed: 0.8 };
      const spacing = 50;
      const actualCols = Math.min(cols, 10);
      const actualRows = Math.min(rows, 3);
      const startX = (this.width - actualCols * spacing) / 2;
      
      for (let r = 0; r < actualRows; r++) {
        for (let c = 0; c < actualCols; c++) {
          // Wave: sine wave offset
          const waveOffset = Math.sin(c * 0.5) * 30;
          const targetX = startX + c * spacing;
          const targetY = Math.min(targetStartY + r * spacing + waveOffset, maxTargetY - 20);
          let type = types[(r+c) % types.length];
          const spawnX = targetX;
          const spawnY = -50 - c * 5;
          let bot = new Chicken(spawnX, spawnY, targetX, targetY, type, hpMulti);
          // Don't override anchor - let it start from spawn position for smooth entry
          this.chickens.push(bot);
          waveBots.push(bot);
          formation.bots.push(bot);
        }
      }
      this.formations.push(formation);
    } else if (pattern === "boss") {
      const bossTargetY = Math.min(targetStartY, maxTargetY - 100);
      // Get boss type from config (different boss for each wave)
      const bossType = types[0] || 4; // Default to type 4 if not specified
      const bossConfig = BOT_STATS[bossType];
      const bossCenterX = this.width / 2;
      
      // Play boss spawn sound
      this.soundManager.playSound("bossSpawn");
      
      // Spawn main boss
      let boss = new Chicken(bossCenterX - 70, -200, bossCenterX - 70, bossTargetY, bossType, hpMulti);
      boss.anchorX = bossCenterX - 70;
      boss.anchorY = bossTargetY;
      this.chickens.push(boss);
      waveBots.push(boss);
      
      // Spawn escort enemies around boss (number depends on wave)
      const escortCount = Math.min(4 + Math.floor(this.wave / 5), 8);
      const escortSpacing = 80;
      const escortStartX = bossCenterX - (escortCount / 2) * escortSpacing;
      
      for (let i = 0; i < escortCount; i++) {
        let escortX = escortStartX + i * escortSpacing;
        let escortY = Math.min(targetStartY + 100, maxTargetY - 50);
        // Use type 2 or 3 for escorts based on wave
        let escortType = this.wave <= 10 ? 2 : 3;
        let escort = new Chicken(escortX, -50, escortX, escortY, escortType, hpMulti);
        // Don't override anchor - let it start from spawn position for smooth entry
        this.chickens.push(escort);
        waveBots.push(escort);
      }
    }
    // Reduced item drop rate: 5-8% of enemies (was 10-20%)
    if (waveBots.length > 0 && pattern !== "boss") {
      let itemsToAssign = Math.ceil(waveBots.length * (0.05 + Math.random() * 0.03));
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

  createCollectionEffect(x, y, color, weaponLevel = 1) { 
    // Enhanced collection effect based on weapon level
    const baseCount = 6;
    const levelMultiplier = Math.min(weaponLevel / 2, 3); // Max 3x particles at high level
    const particleCount = Math.floor(baseCount * levelMultiplier);
    
    // Create main collection particles
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new Particle(x, y, color, 0, "collection")); 
    }
    
    // Add special effects for high levels (4+)
    if (weaponLevel >= 4) {
      // Add sparkle particles for level 4+
      for (let i = 0; i < 8; i++) {
        const sparkleX = x + (Math.random() - 0.5) * 40;
        const sparkleY = y + (Math.random() - 0.5) * 40;
        this.particles.push(new Particle(sparkleX, sparkleY, "#FFD700", 0, "spark")); 
      }
      
      // Add expanding ring for level 5+
      if (weaponLevel >= 5) {
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 * i) / 12;
          const ringX = x + Math.cos(angle) * 30;
          const ringY = y + Math.sin(angle) * 30;
          this.particles.push(new Particle(ringX, ringY, color, 0, "explosion")); 
        }
      }
      
      // Add burst effect for level 6+
      if (weaponLevel >= 6) {
        for (let i = 0; i < 15; i++) {
          const burstX = x + (Math.random() - 0.5) * 60;
          const burstY = y + (Math.random() - 0.5) * 60;
          this.particles.push(new Particle(burstX, burstY, color, 0, "explosion")); 
        }
      }
    }
  }
  
  createThrustEffect(x, y, color) {
    // Create thrust particles behind hero (2-3 particles per frame for better visibility)
    for (let i = 0; i < 3; i++) {
      this.particles.push(new Particle(x, y, color, 0, "thrust"));
    }
  }
  
  createExplosion(x, y, color = "#FF4500", scale = 1) { 
    // Much reduced explosion for bot hits and bot destruction
    const baseCount = Math.min(4 * scale, 8); // Further reduced from 6 to 4
    
    // Main explosion particles (reduced speed and count)
    for (let i = 0; i < baseCount; i++) {
      this.particles.push(new Particle(x, y, color, 4, "explosion")); // Reduced speed from 8 to 4
    }
    
    // Add sparks with different colors (much reduced)
    const sparkColors = [color, "#FFD700"];
    for (let i = 0; i < Math.floor(baseCount * 0.3); i++) { // Reduced from 0.5 to 0.3
      const sparkColor = sparkColors[Math.floor(Math.random() * sparkColors.length)];
      this.particles.push(new Particle(x, y, sparkColor, 3, "spark")); // Reduced speed from 6 to 3
    }
    
    // Remove outer ring particles completely to reduce spread
    
    // Limit total particles to prevent lag
    if (this.particles.length > 300) {
      this.particles = this.particles.slice(-200);
    }
  }
  
  createPlayerExplosion(x, y) {
    // Special explosion effect for player - bigger and more dramatic
    const centerX = x;
    const centerY = y;
    
    // Large main explosion particles (red/orange)
    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40;
      const speed = 10 + Math.random() * 8;
      const px = centerX + Math.cos(angle) * (10 + Math.random() * 20);
      const py = centerY + Math.sin(angle) * (10 + Math.random() * 20);
      const colors = ["#FF0000", "#FF4500", "#FF6B00", "#FF8C00"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push(new Particle(px, py, color, speed, "explosion"));
    }
    
    // Bright white/yellow core
    for (let i = 0; i < 20; i++) {
      const sparkColor = Math.random() > 0.5 ? "#FFFFFF" : "#FFD700";
      this.particles.push(new Particle(centerX, centerY, sparkColor, 12, "spark"));
    }
    
    // Outer expanding ring
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const dist = 30 + Math.random() * 40;
      const px = centerX + Math.cos(angle) * dist;
      const py = centerY + Math.sin(angle) * dist;
      const colors = ["#FF0000", "#FF4500", "#FFD700"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push(new Particle(px, py, color, 6, "explosion"));
    }
    
    // Smoke/debris particles (darker)
    for (let i = 0; i < 15; i++) {
      const px = centerX + (Math.random() - 0.5) * 60;
      const py = centerY + (Math.random() - 0.5) * 60;
      this.particles.push(new Particle(px, py, "#333333", 4, "explosion"));
    }
    
    // Limit total particles to prevent lag
    if (this.particles.length > 400) {
      this.particles = this.particles.slice(-250);
    }
  }

  updateFormations() {
    if (!this.formations || this.formations.length === 0) return;
    
    for (let f of this.formations) {
      // Only update grid formations (they have cols and width)
      if (!f.cols || !f.width) {
        continue;
      }
      
      f.x += f.direction * f.speed * this.deltaTime;
      if (f.x < 20 || f.x + f.width > this.width - 20) {
        f.direction *= -1;
        for (let b of f.bots) {
          if (b && this.chickens.includes(b)) {
            b.targetY += 12;
          }
        }
      }
      for (let idx = 0; idx < f.bots.length; idx++) {
        const bot = f.bots[idx];
        if (!bot || !this.chickens.includes(bot)) continue;
        
        const col = idx % f.cols;
        const row = Math.floor(idx / f.cols);
        const padding = f.width / f.cols;
        const targetX = f.x + col * padding + padding / 2;
        const targetY = f.y + row * padding;
        
        bot.inFormation = true;
          bot.targetX = targetX;
          bot.targetY = targetY;
        }
      }
    
    // Remove formations that have no valid bots
    this.formations = this.formations.filter((f) => f.bots.some((b) => this.chickens.includes(b)));
  }

  update() {
    if (!this.gameRunning || this.gamePaused) return;
    
    // Calculate delta time for smooth animations
    const currentTime = performance.now();
    this.deltaTime = Math.min((currentTime - this.lastTime) / this.frameTime, 2.0); // Cap at 2x for stability
    this.lastTime = currentTime;
    
    this.globalTime += this.deltaTime;
    
    // Handle wave spawn delay (prevent immediate wave check after spawning)
    if (this.waveSpawnDelay > 0) {
      this.waveSpawnDelay -= this.deltaTime;
      if (this.waveSpawnDelay <= 0) {
        this.wavePending = false; // Allow wave checking after enemies have spawned
      }
    }
    
    // Handle staggered spawn (every 2 waves)
    if (this.staggeredSpawnQueue.length > 0) {
      this.staggeredSpawnTimer += this.deltaTime;
      if (this.staggeredSpawnTimer >= this.staggeredSpawnDelay) {
        this.spawnNextStaggeredBot();
        this.staggeredSpawnTimer = 0;
      }
    }
    
    this.updateFormations();
    this.player.update(this.deltaTime);
    
    // Create thrust effect behind hero when active
    if (this.player.state === "active") {
      const weaponColor = WEAPONS[this.player.currentWeapon].color;
      // Add slight variation to thrust position
      const thrustX = this.player.x + this.player.width / 2 + (Math.random() - 0.5) * 10;
      const thrustY = this.player.y + this.player.height - 5; // Slightly above bottom
      // Mix weapon color with white/cyan for better visibility
      const thrustColors = [weaponColor, "#00FFFF", "#FFFFFF"];
      const thrustColor = thrustColors[Math.floor(Math.random() * thrustColors.length)];
      this.createThrustEffect(thrustX, thrustY, thrustColor);
    }
    
    const newBullets = this.player.shoot(this.deltaTime); 
    if (newBullets) {
      this.bullets.push(...newBullets);
      // Play shoot sound
      this.soundManager.playSound("shoot");
    }

    this.chickens.forEach((chicken) => {
      chicken.update(this.globalTime, this.deltaTime);
      const newEnemyBullets = chicken.tryShoot(this.player.x + this.player.width / 2, this.player.y, this.globalTime);
      if (newEnemyBullets) this.enemyBullets.push(...newEnemyBullets);
    });

    this.bullets.forEach((b) => b.update(this.deltaTime));
    this.enemyBullets.forEach((eb) => eb.update(this.deltaTime));
    this.powerUps.forEach((p) => p.update(this.deltaTime));
    this.particles = this.particles.filter((p) => { p.update(this.deltaTime); return p.life > 0; });
    this.bullets = this.bullets.filter((b) => !b.isOutOfBounds());
    this.enemyBullets = this.enemyBullets.filter((eb) => !eb.isOutOfBounds(this.height));
    this.powerUps = this.powerUps.filter((p) => !p.isOutOfBounds(this.height));
    // Remove enemies that are out of bounds (but don't count as wave completion)
    // Only filter active enemies that have gone below screen
    this.chickens = this.chickens.filter((c) => {
      // Don't filter enemies that are still entering
      if (c.state === "entering") {
        return true; // Keep all entering enemies
      }
      // Only filter active enemies that are below screen
      if (c.state === "active" && c.y > this.height + 200) {
        // Enemy escaped - player loses health (like Chicken Invaders)
        if (c.y > this.height) {
          this.health--;
          if (this.health <= 0) {
            this.endGame();
          } else {
            this.player.activateShield();
          }
        }
        return false;
      }
      return true;
    });
    
    // Check wave progression (like Chicken Invaders)
    // Wave completes when ALL enemies are destroyed and no power-ups remain
    // Only check if wave has started (wave > 0) and not currently transitioning
    if (this.wave > 0 && !this.wavePending && this.waveSpawnDelay <= 0) {
      const allEnemiesDead = this.chickens.length === 0;
      const noPowerUps = this.powerUps.length === 0;
      
      // Only proceed if ALL enemies are dead (including those entering)
      if (allEnemiesDead && noPowerUps) {
        // Start transition delay
        if (this.waveTransitionDelay === 0) {
          this.waveTransitionDelay = 90; // ~1.5 seconds at 60fps
        } else {
          this.waveTransitionDelay -= this.deltaTime;
          if (this.waveTransitionDelay <= 0) {
            // Final check - make sure nothing changed
            if (this.chickens.length === 0 && this.powerUps.length === 0 && !this.wavePending) {
              // Play wave complete sound
              this.soundManager.playSound("waveComplete");
              this.nextWave();
            } else {
              // Reset if enemies or power-ups appeared
              this.waveTransitionDelay = 0;
            }
          }
        }
      } else {
        // Reset delay if enemies or power-ups are present
        this.waveTransitionDelay = 0;
      }
    }
    
    this.checkCollisions();
    this.updateUI();
  }

  // Optimized collision detection helper
  checkBulletCollision(bullet, enemy) {
    if (enemy.x <= 0 || enemy.x >= this.width || enemy.y <= 0) return false;
    
    if (bullet.type === "blue") {
      return bullet.x < enemy.x + enemy.width && bullet.x + 20 > enemy.x && 
             bullet.y < enemy.y + enemy.height && bullet.y + 150 > enemy.y;
    } else if (bullet.type === "purple") {
      return bullet.x - 20 < enemy.x + enemy.width && bullet.x + 20 > enemy.x && 
             bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y;
    } else {
      return bullet.x > enemy.x && bullet.x < enemy.x + enemy.width && 
             bullet.y > enemy.y && bullet.y < enemy.y + enemy.height;
    }
  }

  checkCollisions() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      let hit = false;
      for (let j = this.chickens.length - 1; j >= 0; j--) {
        const c = this.chickens[j];
        if (this.checkBulletCollision(b, c)) {
          hit = true;
          this.createExplosion(b.x, b.y, b.config.color, 0.5);
          this.soundManager.playSound("hit");
          if (c.takeDamage(b.damage)) {
            this.createExplosion(c.x + c.width / 2, c.y + c.height / 2, "#FFFF00");
            this.soundManager.playSound("explosion");
            this.chickens.splice(j, 1);
            this.score += c.scoreValue;
            if (c.typeIndex >= 4 && c.typeIndex <= 8) this.spawnRandomItem(c.x, c.y, true);
            else if (c.hasItem) this.spawnRandomItem(c.x, c.y, false);
          }
          b.piercedCount++;
          if (b.piercedCount >= b.pierce) hit = true; else hit = false;
          break;
        }
      }
      if (hit && b.piercedCount >= b.pierce) this.bullets.splice(i, 1);
    }
    // Optimized power-up collision
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      const px = this.player.x, py = this.player.y, pw = this.player.width, ph = this.player.height;
      if (p.x > px && p.x < px + pw && p.y > py && p.y < py + ph) {
        const result = this.player.collectItem(p.type);
        // Pass weapon level to create enhanced collection effect
        this.createCollectionEffect(this.player.x + this.player.width / 2, this.player.y, WEAPONS[p.type]?.color || "#FFF", this.player.weaponLevel);
        // Play collect sound
        if (result === "weapon" && this.player.weaponLevel > 1) {
          this.soundManager.playSound("powerUp");
        } else {
          this.soundManager.playSound("collect");
        }
        if (result === "heal") this.health = Math.min(this.health + 1, 10);
        this.powerUps.splice(i, 1);
      }
    }
    if (!this.player.isInvincible && this.player.state === "active") {
      // Optimized player collision detection - cache player bounds
      const px = this.player.x, py = this.player.y, pw = this.player.width, ph = this.player.height;
      const padding = 10;
      const playerLeft = px + padding;
      const playerRight = px + pw - padding;
      const playerTop = py + padding;
      const playerBottom = py + ph - padding;
      
      // Check collision with enemy bullets
      for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
        const eb = this.enemyBullets[i];
        if (eb.x + eb.width > playerLeft && 
            eb.x < playerRight && 
            eb.y + eb.height > playerTop && 
            eb.y < playerBottom) {
          // Special player explosion effect
          this.createPlayerExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
          // Play player hit sound
          this.soundManager.playSound("playerHit");
          this.health--;
          this.enemyBullets.splice(i, 1);
          // Reduce weapon level by 1 when player dies
          if (this.player.weaponLevel > 1) this.player.weaponLevel--;
          if (this.health > 0) {
            this.player.respawn();
          } else {
            this.endGame();
          }
        }
      }
      
      // Check collision with enemies - optimized (reuse cached player bounds)
      const enemyPadding = 5;
      const pLeft = px + enemyPadding;
      const pRight = px + pw - enemyPadding;
      const pTop = py + enemyPadding;
      const pBottom = py + ph - enemyPadding;
      
      for (let i = this.chickens.length - 1; i >= 0; i--) {
        const c = this.chickens[i];
        if (pRight > c.x && pLeft < c.x + c.width && 
            pBottom > c.y && pTop < c.y + c.height) {
          // Special player explosion effect
          this.createPlayerExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
          // Play player hit sound
          this.soundManager.playSound("playerHit");
          this.health--;
          // Reduce weapon level by 1 when player dies
          if (this.player.weaponLevel > 1) this.player.weaponLevel--;
          if (this.health > 0) {
            this.player.respawn();
          } else {
            this.endGame();
          }
          // Break to avoid multiple hits in same frame
          break;
        }
      }
    }
  }

  endGame() {
    this.gameRunning = false;
    this.musicManager.stopBackgroundMusic();
    if (this.dom.finalScore) this.dom.finalScore.textContent = this.score;
    if (this.dom.finalWave) this.dom.finalWave.textContent = this.wave;
    this.dom.gameOverScreen?.classList.remove("hidden");
  }
  
  updateUI() {
    if (this.dom.uiScore) this.dom.uiScore.textContent = this.score;
    if (this.dom.uiWave) this.dom.uiWave.textContent = this.wave;
    if (this.dom.uiHealth) this.dom.uiHealth.textContent = "❤️ " + this.health;
    if (this.dom.uiBullets) {
      this.dom.uiBullets.textContent = `Lv.${this.player.weaponLevel}`;
      this.dom.uiBullets.style.color = WEAPONS[this.player.currentWeapon].color;
    }
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
    // Animate stars - optimized
    const starColors = ["#fff", "#b3e0ff", "#ffe0b3"];
    for (let star of this.stars) {
      star.y += star.speed * this.deltaTime;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
        star.r = Math.random() * 1.5 + 0.5;
        star.speed = Math.random() * 0.7 + 0.3;
        star.color = starColors[Math.floor(Math.random() * 3)];
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
  gameLoop() { 
    this.update(); 
    this.draw(); 
    if (this.gameRunning) {
      requestAnimationFrame(() => this.gameLoop()); 
    }
  }
}

window.addEventListener("DOMContentLoaded", () => { const urlParams = new URLSearchParams(window.location.search); const heroType = urlParams.get("hero") || "soldier"; new ChickenInvadersGame(heroType); });