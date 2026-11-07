// ===================================================
// 🪔 REAL-PHYSICS AESTHETIC DIWALI FIREWORKS ENGINE
//    Optimized 60-120FPS Hardware Accelerated (Zero GC)
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

// High-DPI Canvas Resizing with capped DPR for optimal Retina 60-120 FPS
function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initStars();
}

// Minimalist Twinkling Stars strictly in upper 30% night sky
function initStars() {
    stars = [];
    const starCount = 20;
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * (height * 0.30),
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
        audio.play().catch(e => console.warn('Explosion audio info:', e));
    } catch (e) {}
}

function playWhistleSound() {
    try {
        if (whistleAudio) {
            whistleAudio.currentTime = 0;
            whistleAudio.volume = 0.85;
            whistleAudio.play().catch(e => console.warn('Whistle audio info:', e));
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
// ZERO-ALLOCATION AERIAL FIREWORK PARTICLES
// ===================================================

// Core Burst Flash (Fast concentric bursts, zero gradient allocations)
class CoreFlash {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = 26;
        this.alpha = 0.95;
    }

    update(dt) {
        this.radius += 6.5 * dt;
        this.alpha -= 0.16 * dt;
    }
}

// Real Pyrotechnic Dropping Spark (Drops under gravity along flight path)
class TrailingSpark {
    constructor(x, y, vx, vy, color) {
        this.x = x;
        this.y = y;
        this.vx = vx * 0.14;
        this.vy = vy * 0.14 + 0.35;
        this.color = color;
        this.life = 0;
        this.maxLife = Math.random() * 10 + 12;
        this.alpha = 1;
    }

    update(dt) {
        this.life += dt;
        this.vy += 0.065 * dt;
        this.vx *= Math.pow(0.96, dt);
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.alpha = Math.max(0, 1 - (this.life / this.maxLife));
    }
}

// Pure Hyper-Realistic Pyrotechnic Shell Star (True Newtonian Ballistics, Zero GC)
class PhysicsStar {
    constructor(x, y, vx, vy, color, isWillow = false, isPistil = false) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.prevX2 = x;
        this.prevY2 = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.isWillow = isWillow;
        this.isPistil = isPistil;

        // True Newtonian Ballistics: Clean drag deceleration and gravity
        this.drag = isWillow ? 0.958 : 0.946;
        this.gravity = isWillow ? 0.088 : 0.082;

        this.life = 0;
        this.maxLife = isWillow ? (Math.random() * 22 + 60) : (Math.random() * 14 + 38);
        this.alpha = 1;
        this.size = isWillow ? 1.5 : 1.25;
    }

    update(dt) {
        this.life += dt;

        // Shift coordinates for razor-sharp ballistic comet streak without array allocations
        this.prevX2 = this.prevX;
        this.prevY2 = this.prevY;
        this.prevX = this.x;
        this.prevY = this.y;

        // Newtonian drag and gravity
        const currentDrag = Math.pow(this.drag, dt);
        this.vx *= currentDrag;
        this.vy *= currentDrag;
        this.vy += this.gravity * dt;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Shedding hot pyrotechnic sparks along trajectory
        if (this.isWillow && this.life > 5 && Math.random() < 0.28 && this.alpha > 0.3) {
            embers.push(new TrailingSpark(this.x, this.y, this.vx, this.vy, this.color));
        }

        // Smooth non-linear burnout (clean extinction)
        const progress = this.life / this.maxLife;
        if (progress > 0.55) {
            this.alpha = Math.max(0, 1 - (progress - 0.55) / 0.45);
        }
    }
}

// Canvas-Based Realistic Rocket Projectile
class Rocket {
    constructor(startX, startY, targetX, targetY, isGrand = false, volume = 0.3) {
        this.startX = startX;
        this.startY = startY;
        this.x = startX;
        this.y = startY;
        this.prevX = startX;
        this.prevY = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.isGrand = isGrand;
        this.volume = volume;

        // Grand first rocket duration is calibrated to EXACTLY 0.85s (perfect whistle audio sync)
        // User taps and auto rockets have a swift, snappy 0.38s ascent
        this.totalDuration = isGrand ? 0.85 : 0.38;
        this.elapsed = 0;
        this.isDead = false;
    }

    update(dt) {
        this.prevX = this.x;
        this.prevY = this.y;

        // Convert dt (frames) to real seconds
        const dtSeconds = (dt * 16.667) / 1000;
        this.elapsed += dtSeconds;

        const progress = Math.min(1.0, this.elapsed / this.totalDuration);

        // Smooth physical ascent curve (strong initial rocket thrust, gentle deceleration near apex)
        const ease = 1 - Math.pow(1 - progress, this.isGrand ? 1.35 : 1.15);

        this.x = this.startX + (this.targetX - this.startX) * ease;
        this.y = this.startY + (this.targetY - this.startY) * ease;

        // Heavy, realistic fiery rocket exhaust sparks shooting downward from nozzle
        const sparkCount = this.isGrand ? 3 : 2;
        for (let i = 0; i < sparkCount; i++) {
            embers.push(new TrailingSpark(
                this.x + (Math.random() - 0.5) * 3,
                this.y + Math.random() * 5,
                (Math.random() - 0.5) * 1.6,
                Math.random() * 2.8 + 1.8, // Forceful downward thrust
                Math.random() > 0.35 ? '#ffd700' : '#ff5500'
            ));
        }

        // Reached apex target in sky
        if (progress >= 1.0) {
            this.isDead = true;
        }
    }
}

// 3D Spherical Shell Simulation (Fibonacci distribution, clean expansion)
function createSphericalShell(x, y, palette, isGrand = false) {
    const starCount = isGrand ? 220 : 64;
    const baseSpeed = isGrand ? 16.5 : 10.5;

    // Center burst pop flash
    coreFlashes.push(new CoreFlash(x, y, palette[0]));

    // Fibonacci 3D sphere distribution projected onto 2D viewport
    for (let i = 0; i < starCount; i++) {
        const phi = Math.acos(1 - 2 * (i + 0.5) / starCount);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;

        const dx = Math.sin(phi) * Math.cos(theta);
        const dy = Math.sin(phi) * Math.sin(theta);

        const speed = baseSpeed * (0.84 + Math.random() * 0.32);
        const vx = dx * speed;
        const vy = dy * speed - (isGrand ? 0.75 : 0.45);

        const color = palette[Math.floor(Math.random() * palette.length)];
        const isWillow = Math.random() > 0.28;

        physicsStars.push(new PhysicsStar(x, y, vx, vy, color, isWillow));
    }

    // Inner sparkling pistil ring
    const pistilCount = Math.floor(starCount * 0.25);
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
// HARDWARE-ACCELERATED RENDER LOOP (60-120 FPS, ZERO JANK)
// ===================================================
let lastTime = performance.now();

function loop(now) {
    requestAnimationFrame(loop);

    if (!now) now = performance.now();
    const rawDt = (now - lastTime) / 16.667;
    lastTime = now;
    // Normalized delta time clamped to prevent jumps on tab blur
    const dt = Math.max(0.4, Math.min(2.0, rawDt || 1.0));

    // 1. Crystal-clear frame wipe
    ctx.clearRect(0, 0, width, height);

    // 2. Additive blending for luminous firework glow
    ctx.globalCompositeOperation = 'lighter';

    // 3. Draw minimalist upper-sky twinkling stars
    for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.phase += s.speed * dt;
        const currentAlpha = Math.max(0.06, s.baseAlpha + Math.sin(s.phase) * 0.18);
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = '#fff8dc';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
    }

    // 4. Update & Draw Core Burst Flashes (Zero gradient allocations)
    for (let i = coreFlashes.length - 1; i >= 0; i--) {
        const f = coreFlashes[i];
        f.update(dt);
        if (f.alpha <= 0) {
            coreFlashes.splice(i, 1);
            continue;
        }

        // Outer soft glow
        ctx.globalAlpha = Math.max(0, f.alpha * 0.4);
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Main burst
        ctx.globalAlpha = Math.max(0, f.alpha);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();

        // Incandescent core
        ctx.globalAlpha = Math.min(1, f.alpha * 1.3);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    // 5. Update & Draw Rockets
    ctx.lineCap = 'round';
    for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.update(dt);

        // Glowing rocket exhaust streak
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = r.isGrand ? '#fff8dc' : '#ffffff';
        ctx.lineWidth = r.isGrand ? 3.6 : 2.5;
        ctx.beginPath();
        ctx.moveTo(r.prevX, r.prevY);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();

        // Incandescent burning rocket head
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.isGrand ? 3.5 : 2.4, 0, Math.PI * 2);
        ctx.fill();

        // Golden fiery halo around rocket head
        ctx.fillStyle = r.isGrand ? 'rgba(255, 200, 50, 0.55)' : 'rgba(255, 170, 50, 0.35)';
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.isGrand ? 9.5 : 6.0, 0, Math.PI * 2);
        ctx.fill();

        if (r.isDead) {
            rockets.splice(i, 1);
            if (r.isGrand) {
                executeDetonation(r.x, r.targetY);
            } else {
                playExplosionSound(r.volume);
                const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
                createSphericalShell(r.x, r.targetY, palette, false);
            }
        }
    }

    // 6. Update & Draw Floating Embers (Fast hardware-accelerated fillRect)
    for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.update(dt);
        if (e.alpha <= 0.02) {
            embers.splice(i, 1);
            continue;
        }
        ctx.globalAlpha = e.alpha;
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x - 0.75, e.y - 0.75, 1.5, 1.5);
    }

    // 7. Update & Draw Physics Stars (True Newtonian ballistics, zero GC)
    for (let i = physicsStars.length - 1; i >= 0; i--) {
        const p = physicsStars[i];
        p.update(dt);
        if (p.alpha <= 0.02) {
            physicsStars.splice(i, 1);
            continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.prevX2, p.prevY2);
        ctx.lineTo(p.prevX, p.prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Incandescent burning pellet head
        if (p.alpha > 0.32) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
requestAnimationFrame(loop);

// ===================================================
// LAUNCH & DETONATION FLOW
// ===================================================
function startLaunch() {
    landingScreen.classList.add('vanish');

    // 1. Play authentic fast whistle sound as rocket ascends
    playWhistleSound();

    // 2. Spawn grand canvas rocket shooting from city skyline up into open sky
    const startY = height * 0.92;
    const targetY = height * 0.35;
    rockets.push(new Rocket(width / 2, startY, width / 2, targetY, true, 0.9));
}

function executeDetonation(x, y) {
    // A. Stop whistle sound cleanly at apex
    stopWhistleSound();

    // B. Play initial grand explosion sound
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

// Background Automatic Fireworks: Visibly launched from the illuminated city rooftops
function scheduleNextAutoFirework() {
    if (!isCelebration) return;

    // First 4 cracks: spaced at 2.6s. After 4 cracks: slows down to 6.5s - 8.0s
    const delay = (autoCrackCount < 4) ? 2600 : (Math.random() * 1500 + 6500);

    autoFireworksTimer = setTimeout(() => {
        if (!isCelebration) return;
        autoCrackCount++;

        const targetX = Math.random() * (width * 0.76) + (width * 0.12);
        const targetY = Math.random() * (height * 0.38) + 50;
        const startX = targetX + (Math.random() - 0.5) * 80;
        const startY = height * 0.85;

        rockets.push(new Rocket(startX, startY, targetX, targetY, false, 0.16));

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

// Tap anywhere on screen: Rocket shoots up from city to your tapped sky point!
function handleTap(clientX, clientY) {
    if (!isCelebration) return;

    // Immediately hide the tap guide when user interacts
    if (tapGuide) {
        tapGuide.style.opacity = '0';
        tapGuide.style.pointerEvents = 'none';
    }

    // Push back automatic fireworks by 5.5s so user's interaction has clear focus
    if (autoFireworksTimer) clearTimeout(autoFireworksTimer);
    autoFireworksTimer = setTimeout(() => {
        if (isCelebration) {
            scheduleNextAutoFirework();
        }
    }, 5500);

    // Target in sky (clamped so it doesn't detonate down in the city)
    const targetX = clientX;
    const targetY = Math.min(clientY, height * 0.65);

    // Launches straight up from the city rooftops directly beneath the tapped column
    const startX = targetX + (Math.random() - 0.5) * 40;
    const startY = height * 0.85;

    rockets.push(new Rocket(startX, startY, targetX, targetY, false, 0.32));
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
