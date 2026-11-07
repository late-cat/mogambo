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
const tapGuide = document.getElementById('tapGuide');

let width, height, dpr;
let particles = [];
let rockets = [];
let stars = [];
let isCelebration = false;
let autoFireworksTimer = null;
let autoCrackCount = 0;

// High-DPI Canvas Resizing
function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
    initStars();
}

// Subtle Twinkling Night Stars in the Sky
function initStars() {
    stars = [];
    const starCount = Math.floor(Math.min(width, height) / 10);
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * (height * 0.7),
            r: Math.random() * 1.1 + 0.3,
            baseAlpha: Math.random() * 0.5 + 0.15,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.02 + 0.008
        });
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ===================================================
// AUDIO ENGINE: BALANCED DIWALI SOUNDS
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

// Play Explosion Sound (WAV) - Kept balanced to never overpower Modi Ji's voice
function playExplosionSound(volume = 0.3) {
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
            whistleAudio.volume = 0.85;
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
// PARTICLE ENGINE: AESTHETIC TRADITIONAL WARM COLORS
// (No artificial AI cyan/neon blue - strictly authentic Diwali)
// ===================================================

const COLOR_PALETTES = [
    ['#ffffff', '#fff9d6', '#ffd700', '#fdbb2d', '#f46b45'], // Royal Gold & Saffron Flame
    ['#ffffff', '#ffe066', '#ff5722', '#e50914', '#ffd700'], // Radiant Crimson & Sunset Amber
    ['#ffffff', '#fff5cc', '#ffd700', '#00c853', '#69f0ae'], // Festive Emerald & Gold Brocade
    ['#ffffff', '#ffab00', '#ff3d00', '#d50000', '#ffc107']  // Shimmering Ruby & Gold
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
        this.friction = isBrocade ? 0.966 : 0.956;
        this.gravity = isBrocade ? 0.062 : 0.082;
        this.decay = Math.random() * (isBrocade ? 0.011 : 0.019) + 0.008;
        this.alpha = 1;
        this.size = Math.random() * (isBrocade ? 1.5 : 1.25) + 1.05; // Crisp, delicate streaks
        this.twinkle = Math.random() > 0.35;
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
            ctx.arc(this.x, this.y, this.size * 0.65, 0, Math.PI * 2);
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
                Math.random() * 3 + 2,
                false
            ));
        }

        if (this.y <= this.targetY) {
            this.isDead = true;
        }
    }

    draw() {
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
    const palette = COLOR_PALETTES[0]; // Radiant Gold & Saffron
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

// Crisp Firework Burst
function triggerCrispFirework(x, y, volume = 0.3) {
    // Play single explosion sound at a controlled volume that never overpowers speech
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

    // Fade trail background
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(3, 0, 6, 0.22)';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle celestial background stars
    for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.phase += s.speed;
        const currentAlpha = s.baseAlpha + Math.sin(s.phase) * 0.2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 248, 220, ${Math.max(0.08, currentAlpha)})`;
        ctx.fill();
    }

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

    // B. Play initial grand explosion sound (punchy opening)
    playExplosionSound(0.85);

    // C. Start Modi Ji Voice at full crisp volume
    try {
        diwaliAudio.volume = 1.0;
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

        // Start Paced Automatic Fireworks (Slows down after 4-5 cracks)
        autoCrackCount = 0;
        scheduleNextAutoFirework();
    }, 250);
}

// Background Automatic Fireworks: Paced comfortably, slows down after 4-5 cracks
// to give users space to click and enjoy without rapid repeated spam
function scheduleNextAutoFirework() {
    if (!isCelebration) return;

    // First 4 cracks: spaced at 2.4s. After 4 cracks: slows down to 6.0s - 7.5s!
    const delay = (autoCrackCount < 4) ? 2400 : (Math.random() * 1500 + 6000);

    autoFireworksTimer = setTimeout(() => {
        if (!isCelebration) return;
        autoCrackCount++;

        const rx = Math.random() * (width * 0.76) + (width * 0.12);
        const ry = Math.random() * (height * 0.42) + 50;

        // Subtle volume (0.16) so it never overpowers Modi Ji's speech
        triggerCrispFirework(rx, ry, 0.16);

        scheduleNextAutoFirework();
    }, delay);
}

// ===================================================
// USER INTERACTIONS
// ===================================================

// Click / Tap Play Button
playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startLaunch();
});

// Tap anywhere on screen to blast crisp fireworks
function handleTap(clientX, clientY) {
    if (!isCelebration) return;

    // Immediately hide the tap guide when user interacts
    if (tapGuide) {
        tapGuide.style.opacity = '0';
        tapGuide.style.pointerEvents = 'none';
    }

    // Tactile user blast (moderate volume 0.32 - crisp but doesn't overpower speech)
    triggerCrispFirework(clientX, clientY, 0.32);
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
    autoCrackCount = 0;

    if (autoFireworksTimer) clearTimeout(autoFireworksTimer);
    stopWhistleSound();

    try {
        diwaliAudio.pause();
        diwaliAudio.currentTime = 0;
    } catch (e) {}

    // Pause any active explosion sounds
    explosionPool.forEach(a => {
        try { a.pause(); a.currentTime = 0; } catch (e) {}
    });

    // Reset tap guide state for replay
    if (tapGuide) {
        tapGuide.style.opacity = '';
        tapGuide.style.pointerEvents = '';
    }
});
