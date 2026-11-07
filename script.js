// ===================================================
// 🪔 HARDWARE-ACCELERATED AESTHETIC DIWALI ENGINE
// ===================================================

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const landingScreen = document.getElementById('landingScreen');
const playBtn = document.getElementById('playBtn');
const flash = document.getElementById('flash');
const celebrationScreen = document.getElementById('celebrationScreen');
const replayBtn = document.getElementById('replayBtn');
const diwaliAudio = document.getElementById('diwaliAudio');
const whistleAudio = document.getElementById('whistleAudio');

let width, height, dpr;
let particles = [];
let rockets = [];
let isCelebration = false;
let autoFireworksTimer = null;

// High-DPI Canvas Resizing
function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for optimal 60fps performance
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ===================================================
// AUDIO ENGINE: AUTHENTIC FIREWORK SOUNDS
// ===================================================

// Pre-warmed audio pool for polyphonic zero-latency explosion playback
const EXPLOSION_SRC = 'mixkit-firework-rockets-exploding-in-the-sky-2993.wav';
const POOL_SIZE = 8;
const explosionPool = [];
for (let i = 0; i < POOL_SIZE; i++) {
    const a = new Audio(EXPLOSION_SRC);
    a.preload = 'auto';
    explosionPool.push(a);
}
let poolIndex = 0;

// Play Explosion Sound (WAV)
function playExplosionSound(volume = 1.0) {
    try {
        const audio = explosionPool[poolIndex];
        poolIndex = (poolIndex + 1) % POOL_SIZE;
        audio.currentTime = 0;
        audio.volume = Math.min(1.0, Math.max(0.0, volume));
        audio.play().catch(e => console.warn('Explosion playback note:', e));
    } catch (e) {}
}

// Play Whistle Sound (WAV)
function playWhistleSound() {
    try {
        if (whistleAudio) {
            whistleAudio.currentTime = 0;
            whistleAudio.volume = 1.0;
            whistleAudio.play().catch(e => console.warn('Whistle playback note:', e));
        }
    } catch (e) {}
}

// Stop Whistle Sound
function stopWhistleSound() {
    try {
        if (whistleAudio) {
            whistleAudio.pause();
            whistleAudio.currentTime = 0;
        }
    } catch (e) {}
}

// ===================================================
// PARTICLE ENGINE: CRISP, LUMINOUS FIREWORK STREAKS
// ===================================================

const COLOR_PALETTES = [
    ['#ffffff', '#fff275', '#ffd700', '#ff9f1c', '#ff3838'], // Golden Flame
    ['#00f5d4', '#7b2cbf', '#ff007f', '#ffffff', '#fee440'], // Electric Festive
    ['#ff0055', '#ff5400', '#ffd000', '#39ff14', '#00e5ff'], // Sparkling Carnival
    ['#ff99c8', '#fcf6bd', '#d0f4de', '#a9def9', '#ffffff']  // Diamond Glow
];

class Particle {
    constructor(x, y, color, vx, vy, isBrocade = false) {
        this.x = x;
        this.y = y;
        this.lastX = x;
        this.lastY = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.friction = isBrocade ? 0.965 : 0.955;
        this.gravity = isBrocade ? 0.065 : 0.085;
        this.decay = Math.random() * (isBrocade ? 0.012 : 0.02) + 0.009;
        this.alpha = 1;
        this.size = Math.random() * (isBrocade ? 1.6 : 1.3) + 1.1; // Crisp, needle-sharp
        this.twinkle = Math.random() > 0.4;
    }

    update() {
        this.lastX = this.x;
        this.lastY = this.y;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw() {
        // High-performance light streak (hardware accelerated)
        ctx.beginPath();
        ctx.moveTo(this.lastX, this.lastY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.stroke();

        // Incandescent spark head
        if (this.twinkle && this.alpha > 0.3) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }
    }
}

// Canvas-Based Realistic Rocket Projectile
class Rocket {
    constructor(startX, startY, targetX, targetY) {
        this.x = startX;
        this.y = startY;
        this.lastX = startX;
        this.lastY = startY;
        this.targetY = targetY;
        this.speed = 17;
        this.acceleration = 1.015;
        this.isDead = false;
    }

    update() {
        this.lastX = this.x;
        this.lastY = this.y;
        this.y -= this.speed;
        this.speed *= this.acceleration;

        // Emit realistic trailing sparks along flight path
        for (let i = 0; i < 3; i++) {
            particles.push(new Particle(
                this.x + (Math.random() - 0.5) * 4,
                this.y + Math.random() * 12,
                Math.random() > 0.4 ? '#ffd700' : '#ff4500',
                (Math.random() - 0.5) * 1.5,
                Math.random() * 3 + 2, // Falling downward
                false
            ));
        }

        if (this.y <= this.targetY) {
            this.isDead = true;
        }
    }

    draw() {
        // Crisp incandescent fiery head
        ctx.beginPath();
        ctx.moveTo(this.lastX, this.lastY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 1;
        ctx.stroke();
    }
}

// Grand Skyrocket Detonation
function triggerGrandDetonation(x, y) {
    const palette = COLOR_PALETTES[0]; // Radiant Gold & Amber Fire
    const starCount = 380; // High-density crisp stars

    for (let i = 0; i < starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.pow(Math.random(), 0.5) * 16 + 2;
        const color = palette[Math.floor(Math.random() * palette.length)];

        particles.push(new Particle(
            x,
            y,
            color,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            true
        ));
    }
}

// Crisp Firework Burst (Automatic & Taps)
function triggerCrispFirework(x, y, volume = 0.7) {
    // Play authentic single explosion sound for every blast
    playExplosionSound(volume);

    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    const count = 75;

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 9 + 1.2;
        const color = palette[Math.floor(Math.random() * palette.length)];

        particles.push(new Particle(
            x,
            y,
            color,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            false
        ));
    }
}

// ===================================================
// HARDWARE-ACCELERATED RENDER LOOP (60-120 FPS)
// ===================================================
function loop() {
    requestAnimationFrame(loop);

    // Trail persistence with subtle fade
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(3, 0, 6, 0.2)';
    ctx.fillRect(0, 0, width, height);

    // ADDITIVE BLENDING: Natural glowing fire without shadowBlur lag
    ctx.globalCompositeOperation = 'lighter';

    // 1. Update & Draw Rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.update();
        r.draw();
        if (r.isDead) {
            rockets.splice(i, 1);
            executeDetonation(r.x, r.targetY);
        }
    }

    // 2. Update & Draw Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}
loop();

// ===================================================
// LAUNCH & DETONATION FLOW
// ===================================================
function startLaunch() {
    landingScreen.classList.add('vanish');

    // 1. Play authentic fast whistle sound as rocket ascends
    playWhistleSound();

    // 2. Spawn canvas rocket shooting from bottom center
    const targetY = height * 0.44;
    rockets.push(new Rocket(width / 2, height + 10, width / 2, targetY));
}

function executeDetonation(x, y) {
    // A. Stop whistle sound cleanly at apex
    stopWhistleSound();

    // B. Play authentic single explosion sound for main detonation
    playExplosionSound(1.0);

    // C. Start Modi Ji Voice
    try {
        diwaliAudio.currentTime = 0;
        diwaliAudio.play().catch(e => console.log('Audio autoplay info:', e));
    } catch (e) {}

    // D. 380+ Crisp Fireworks Stars
    triggerGrandDetonation(x, y);

    // E. Visual Skyburst Flash
    flash.classList.remove('active');
    void flash.offsetWidth;
    flash.classList.add('active');

    // F. Screen Quake
    document.body.classList.remove('screen-quake');
    void document.body.offsetWidth;
    document.body.classList.add('screen-quake');

    // G. Reveal "HAPPY DIWALI" + Living Dynamic Flame Diya
    setTimeout(() => {
        landingScreen.style.display = 'none';
        celebrationScreen.classList.remove('hidden');
        isCelebration = true;

        // Start Ambient Sky Fireworks with explosion sound
        startAmbientFireworks();
    }, 250);
}

// Background Automatic Fireworks (Blasts with single explosion sound)
function startAmbientFireworks() {
    if (autoFireworksTimer) clearInterval(autoFireworksTimer);

    // Blasts automatically every 1.6s with explosion sound
    autoFireworksTimer = setInterval(() => {
        if (!isCelebration) return;
        const rx = Math.random() * (width * 0.76) + (width * 0.12);
        const ry = Math.random() * (height * 0.42) + 50;
        // Automatic blast with explosion sound
        triggerCrispFirework(rx, ry, 0.45);
    }, 1600);
}

// ===================================================
// USER INTERACTIONS
// ===================================================

// Click / Tap Play Button
playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startLaunch();
});

// Tap anywhere on screen to blast crisp fireworks with explosion sound
function handleTap(clientX, clientY) {
    if (!isCelebration) return;
    triggerCrispFirework(clientX, clientY, 0.75);
}

window.addEventListener('click', (e) => {
    if (e.target.closest('#replayBtn') || e.target.closest('#playBtn')) return;
    handleTap(e.clientX, e.clientY);
});

// Multi-touch for mobile
window.addEventListener('touchstart', (e) => {
    if (e.target.closest('#replayBtn') || e.target.closest('#playBtn')) return;
    for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        handleTap(t.clientX, t.clientY);
    }
}, { passive: true });

// Replay Button
replayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    celebrationScreen.classList.add('hidden');
    landingScreen.style.display = 'flex';
    landingScreen.classList.remove('vanish');
    isCelebration = false;

    if (autoFireworksTimer) clearInterval(autoFireworksTimer);
    stopWhistleSound();

    try {
        diwaliAudio.pause();
        diwaliAudio.currentTime = 0;
    } catch (e) {}

    // Pause any active explosion sounds
    explosionPool.forEach(a => {
        try { a.pause(); a.currentTime = 0; } catch (e) {}
    });
});
