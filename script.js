// ===================================================
// 🪔 REAL-PHYSICS AESTHETIC DIWALI FIREWORKS ENGINE
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
let stars = [];
let rockets = [];
let physicsStars = [];
let embers = [];
let coreFlashes = [];
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

// Minimalist, Subtle Twinkling Stars strictly in the upper night sky
function initStars() {
    stars = [];
    const starCount = 20; // Minimalist (strictly in upper sky)
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * (height * 0.30), // Strictly top 30% of screen
            r: Math.random() * 0.85 + 0.3,
            baseAlpha: Math.random() * 0.35 + 0.15,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.015 + 0.005
        });
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ===================================================
// AUDIO ENGINE: BALANCED DIWALI SOUNDS
// ===================================================

const EXPLOSION_SRC = 'mixkit-firework-rockets-exploding-in-the-sky-2993.wav';
const POOL_SIZE = 8;
const explosionPool = [];
for (let i = 0; i < POOL_SIZE; i++) {
    const a = new Audio(EXPLOSION_SRC);
    a.preload = 'auto';
    explosionPool.push(a);
}
let poolIndex = 0;

function playExplosionSound(volume = 0.3) {
    try {
        const audio = explosionPool[poolIndex];
        poolIndex = (poolIndex + 1) % POOL_SIZE;
        audio.currentTime = 0;
        audio.volume = Math.min(1.0, Math.max(0.0, volume));
        audio.play().catch(e => console.warn('Explosion playback note:', e));
    } catch (e) {}
}

function playWhistleSound() {
    try {
        if (whistleAudio) {
            whistleAudio.currentTime = 0;
            whistleAudio.volume = 0.85;
            whistleAudio.play().catch(e => console.warn('Whistle playback note:', e));
        }
    } catch (e) {}
}

function stopWhistleSound() {
    try {
        if (whistleAudio) {
            whistleAudio.pause();
            whistleAudio.currentTime = 0;
        }
    } catch (e) {}
}

// ===================================================
// AUTHENTIC DIWALI COLOR PALETTES
// ===================================================

const COLOR_PALETTES = [
    ['#ffffff', '#fff8db', '#ffd700', '#fdbb2d', '#f46b45'], // Royal Gold & Saffron Flame
    ['#ffffff', '#ffe066', '#ff5722', '#e50914', '#ffd700'], // Radiant Crimson & Sunset Amber
    ['#ffffff', '#fff5cc', '#ffd700', '#00c853', '#69f0ae'], // Festive Emerald & Gold Brocade
    ['#ffffff', '#ffab00', '#ff3d00', '#d50000', '#ffc107']  // Shimmering Ruby & Gold
];

// ===================================================
// REAL-PHYSICS AERIAL FIREWORK PARTICLES
// ===================================================

// Core Burst Flash
class CoreFlash {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = 24;
        this.alpha = 0.95;
    }

    update() {
        this.radius += 5;
        this.alpha -= 0.14;
    }

    draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, this.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Real Pyrotechnic Dropping Spark (Drops straight down under gravity along the flight path)
class TrailingSpark {
    constructor(x, y, vx, vy, color) {
        this.x = x;
        this.y = y;
        this.vx = vx * 0.15;
        this.vy = vy * 0.15 + 0.4;
        this.color = color;
        this.life = 0;
        this.maxLife = Math.random() * 12 + 15;
        this.alpha = 1;
    }

    update() {
        this.life++;
        this.vy += 0.07; // Natural gravity drop
        this.vx *= 0.95; // Aerodynamic drag
        this.x += this.vx;
        this.y += this.vy;
        this.alpha = Math.max(0, 1 - (this.life / this.maxLife));
    }

    draw() {
        if (this.alpha <= 0.03) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 0.85, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

// Pure Hyper-Realistic Pyrotechnic Shell Star (True Newtonian Ballistics)
class PhysicsStar {
    constructor(x, y, vx, vy, color, isWillow = false, isPistil = false) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.isWillow = isWillow;
        this.isPistil = isPistil;

        // True Newtonian Ballistics: Clean drag deceleration and gravity
        this.drag = isWillow ? 0.958 : 0.946;
        this.gravity = isWillow ? 0.088 : 0.082;

        this.life = 0;
        this.maxLife = isWillow ? (Math.random() * 24 + 65) : (Math.random() * 16 + 42);
        this.alpha = 1;

        // Clean ballistic trail
        this.trail = [{ x, y }];
        this.maxTrail = isWillow ? 6 : 4;
        this.size = isWillow ? 1.45 : 1.2;
    }

    update() {
        this.life++;

        // Save trail position
        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) {
            this.trail.pop();
        }

        // Pure physical ballistics: drag and gravity ONLY (Zero wobble)
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.vy += this.gravity;

        this.x += this.vx;
        this.y += this.vy;

        // Shedding hot pyrotechnic sparks directly along the trajectory
        if (this.isWillow && this.life > 6 && Math.random() < 0.35 && this.alpha > 0.3) {
            embers.push(new TrailingSpark(this.x, this.y, this.vx, this.vy, this.color));
        }

        // Smooth non-linear burnout (clean extinction)
        const progress = this.life / this.maxLife;
        if (progress > 0.55) {
            this.alpha = Math.max(0, 1 - (progress - 0.55) / 0.45);
        }
    }

    draw() {
        if (this.alpha <= 0.02 || this.trail.length < 2) return;

        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);

        // Razor-sharp ballistic comet streak
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Incandescent glowing burning pellet head
        if (this.alpha > 0.28) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.75, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }

        ctx.restore();
    }
}
        ctx.stroke();

        // Incandescent glowing star head
        if (this.alpha > 0.3) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.75, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }

        ctx.restore();
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
        this.speed = 17.5;
        this.acceleration = 1.015;
        this.isDead = false;
    }

    update() {
        this.lastX = this.x;
        this.lastY = this.y;
        this.y -= this.speed;
        this.speed *= this.acceleration;

        // Trailing sparks along rocket flight path
        for (let i = 0; i < 3; i++) {
            embers.push(new FloatingEmber(
                this.x + (Math.random() - 0.5) * 4,
                this.y + Math.random() * 10,
                Math.random() > 0.4 ? '#ffd700' : '#ff4500'
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

// 3D Spherical Shell Simulation (Expands symmetrically like real fireworks)
function createSphericalShell(x, y, palette, isGrand = false) {
    const starCount = isGrand ? 240 : 68;
    const baseSpeed = isGrand ? 16.5 : 10.5;

    // Center burst pop flash
    coreFlashes.push(new CoreFlash(x, y, palette[0]));

    // Fibonacci 3D sphere distribution projected onto 2D viewport
    for (let i = 0; i < starCount; i++) {
        const phi = Math.acos(1 - 2 * (i + 0.5) / starCount);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;

        // 3D unit vector
        const dx = Math.sin(phi) * Math.cos(theta);
        const dy = Math.sin(phi) * Math.sin(theta);

        // Projected velocities with natural physical variance
        const speed = baseSpeed * (0.84 + Math.random() * 0.32);
        const vx = dx * speed;
        // Viewers look up towards the sky, so upward arc looks natural
        const vy = dy * speed - (isGrand ? 0.75 : 0.45);

        const color = palette[Math.floor(Math.random() * palette.length)];
        const isWillow = Math.random() > 0.28;

        physicsStars.push(new PhysicsStar(x, y, vx, vy, color, isWillow));
    }

    // Inner sparkling pistil ring (center core flower)
    const pistilCount = Math.floor(starCount * 0.28);
    for (let i = 0; i < pistilCount; i++) {
        const angle = (i / pistilCount) * Math.PI * 2 + Math.random() * 0.2;
        const speed = baseSpeed * 0.42 * (0.8 + Math.random() * 0.4);
        physicsStars.push(new PhysicsStar(
            x,
            y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed - 0.4,
            '#ffffff',
            false,
            true
        ));
    }
}

// Grand Skyrocket Detonation
function triggerGrandDetonation(x, y) {
    const palette = COLOR_PALETTES[0]; // Radiant Gold & Saffron
    createSphericalShell(x, y, palette, true);
}

// Crisp Firework Burst
function triggerCrispFirework(x, y, volume = 0.3) {
    playExplosionSound(volume);
    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    createSphericalShell(x, y, palette, false);
}

// ===================================================
// HARDWARE-ACCELERATED RENDER LOOP (60-120 FPS)
// ===================================================
function loop() {
    requestAnimationFrame(loop);

    // 1. Crystal-clear frame wipe (zero ghosting, transparent over city backdrop)
    ctx.clearRect(0, 0, width, height);

    // 2. Additive blending for luminous firework glow
    ctx.globalCompositeOperation = 'lighter';

    // 3. Draw minimalist upper-sky twinkling stars (strictly top 30%)
    for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.phase += s.speed;
        const currentAlpha = s.baseAlpha + Math.sin(s.phase) * 0.18;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 248, 220, ${Math.max(0.08, currentAlpha)})`;
        ctx.fill();
    }

    // 4. Update & Draw Core Burst Flashes
    for (let i = coreFlashes.length - 1; i >= 0; i--) {
        const f = coreFlashes[i];
        f.update();
        f.draw();
        if (f.alpha <= 0) {
            coreFlashes.splice(i, 1);
        }
    }

    // 5. Update & Draw Rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.update();
        r.draw();
        if (r.isDead) {
            rockets.splice(i, 1);
            executeDetonation(r.x, r.targetY);
        }
    }

    // 6. Update & Draw Floating Embers (Dancing glitter dust)
    for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.update();
        e.draw();
        if (e.alpha <= 0) {
            embers.splice(i, 1);
        }
    }

    // 7. Update & Draw Physics Stars (Weeping & Dancing Arches)
    for (let i = physicsStars.length - 1; i >= 0; i--) {
        const p = physicsStars[i];
        p.update();
        p.draw();
        if (p.alpha <= 0) {
            physicsStars.splice(i, 1);
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

    // D. Grand 3D Spherical Detonation
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

        // Start Paced Automatic Fireworks (Slows down after 4 cracks)
        autoCrackCount = 0;
        scheduleNextAutoFirework();
    }, 250);
}

// Background Automatic Fireworks: Paced comfortably, slows down after 4 cracks
function scheduleNextAutoFirework() {
    if (!isCelebration) return;

    // First 4 cracks: spaced at 2.4s. After 4 cracks: slows down to 6.0s - 7.5s
    const delay = (autoCrackCount < 4) ? 2400 : (Math.random() * 1500 + 6000);

    autoFireworksTimer = setTimeout(() => {
        if (!isCelebration) return;
        autoCrackCount++;

        const rx = Math.random() * (width * 0.76) + (width * 0.12);
        const ry = Math.random() * (height * 0.40) + 50;

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

    // Clear particle arrays
    physicsStars = [];
    embers = [];
    coreFlashes = [];
    rockets = [];

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
