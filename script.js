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

let width, height, dpr;
let particles = [];
let rockets = [];
let isCelebration = false;
let autoFireworksTimer = null;
let ambientAudioTimer = null;

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
// PROCEDURAL AUDIO ENGINE: REAL DIWALI SOUNDS
// ===================================================
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// 1. Realistic Skyrocket Whistle (Air rush + Screeching Gunpowder Jet)
function playAuthenticRocketWhistle(duration = 1.35) {
    try {
        const ac = getAudioContext();
        const now = ac.currentTime;

        // A. Resonant Air Rush Noise (Gunpowder venting through cardboard nozzle)
        const bufferSize = ac.sampleRate * duration;
        const noiseBuffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseSrc = ac.createBufferSource();
        noiseSrc.buffer = noiseBuffer;

        // High-Q Bandpass Filter sweeping upwards
        const bandpass = ac.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.Q.value = 8;
        bandpass.frequency.setValueAtTime(650, now);
        bandpass.frequency.exponentialRampToValueAtTime(3600, now + duration);

        const noiseGain = ac.createGain();
        noiseGain.gain.setValueAtTime(0.01, now);
        noiseGain.gain.linearRampToValueAtTime(0.28, now + duration * 0.7);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noiseSrc.connect(bandpass);
        bandpass.connect(noiseGain);
        noiseGain.connect(ac.destination);

        noiseSrc.start(now);
        noiseSrc.stop(now + duration);

        // B. Pure Shrill Whistle Overlap
        const whistleOsc = ac.createOscillator();
        const whistleGain = ac.createGain();
        whistleOsc.type = 'sawtooth';
        whistleOsc.frequency.setValueAtTime(700, now);
        whistleOsc.frequency.exponentialRampToValueAtTime(3200, now + duration);

        // Slight frequency jitter
        const jitter = ac.createOscillator();
        const jitterGain = ac.createGain();
        jitter.frequency.value = 35;
        jitterGain.gain.value = 45;
        jitter.connect(whistleOsc.frequency);
        jitter.start(now);
        jitter.stop(now + duration);

        whistleGain.gain.setValueAtTime(0.01, now);
        whistleGain.gain.linearRampToValueAtTime(0.18, now + duration * 0.75);
        whistleGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        whistleOsc.connect(whistleGain);
        whistleGain.connect(ac.destination);

        whistleOsc.start(now);
        whistleOsc.stop(now + duration);
    } catch (e) {
        console.warn('Audio synthesis note:', e);
    }
}

// 2. High-Caliber Aerial Shell Explosion (Sharp Crack + Thunderous Boom)
function playShellDetonation() {
    try {
        const ac = getAudioContext();
        const now = ac.currentTime;

        // A. Sharp Explosive Acoustic Crack (THWACK)
        const crackOsc = ac.createOscillator();
        const crackGain = ac.createGain();
        crackOsc.type = 'triangle';
        crackOsc.frequency.setValueAtTime(1400, now);
        crackOsc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
        crackGain.gain.setValueAtTime(0.9, now);
        crackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        crackOsc.connect(crackGain);
        crackGain.connect(ac.destination);
        crackOsc.start(now);
        crackOsc.stop(now + 0.08);

        // B. Thunderous Sub-Bass Punch (DHOOM)
        const boomOsc = ac.createOscillator();
        const boomGain = ac.createGain();
        boomOsc.type = 'sine';
        boomOsc.frequency.setValueAtTime(150, now);
        boomOsc.frequency.exponentialRampToValueAtTime(26, now + 2.2);
        boomGain.gain.setValueAtTime(1.0, now);
        boomGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
        boomOsc.connect(boomGain);
        boomGain.connect(ac.destination);
        boomOsc.start(now);
        boomOsc.stop(now + 2.2);

        // C. Firecracker Crackle Tail
        playFirecrackerCrackleGroup(now + 0.06, 12);
    } catch (e) {
        console.warn('Detonation audio note:', e);
    }
}

// 3. Firecracker Crackle Bursts (Ladi / Patakha Crackles)
function playFirecrackerCrackleGroup(startTime, count = 8) {
    try {
        const ac = getAudioContext();
        for (let i = 0; i < count; i++) {
            const time = startTime + (i * 0.04) + (Math.random() * 0.03);
            const osc = ac.createOscillator();
            const gain = ac.createGain();

            osc.type = Math.random() > 0.5 ? 'triangle' : 'sawtooth';
            osc.frequency.setValueAtTime(600 + Math.random() * 800, time);
            osc.frequency.exponentialRampToValueAtTime(80, time + 0.035);

            gain.gain.setValueAtTime(0.22 + Math.random() * 0.15, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(time);
            osc.stop(time + 0.035);
        }
    } catch (e) {}
}

// 4. Ambient Background Firecrackers (Boom-Boom-Boom & Ladis)
function playDistantFirecracker() {
    try {
        const ac = getAudioContext();
        const now = ac.currentTime;
        const isDeepBoom = Math.random() > 0.45;

        if (isDeepBoom) {
            // Muffled distant boom (dhum)
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(90 + Math.random() * 30, now);
            osc.frequency.exponentialRampToValueAtTime(25, now + 0.8);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.start(now);
            osc.stop(now + 0.8);
        } else {
            // Crisp distant crackle cluster
            playFirecrackerCrackleGroup(now, 5);
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
        // High-performance light streak (no shadowBlur lag)
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
        // Natural explosive velocity distribution
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

// Mini Tap / Ambient Burst
function triggerCrispFirework(x, y) {
    playFirecrackerCrackleGroup(getAudioContext().currentTime, 4);
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

    // 1. Authentic screaming rocket whistle
    playAuthenticRocketWhistle(1.25);

    // 2. Spawn canvas rocket shooting from bottom center
    const targetY = height * 0.44;
    rockets.push(new Rocket(width / 2, height + 10, width / 2, targetY));
}

function executeDetonation(x, y) {
    // A. Sounds: Acoustic Shell Crack + Sub-Bass + Crackles
    playShellDetonation();

    // B. Start Modi Ji Voice
    try {
        diwaliAudio.currentTime = 0;
        diwaliAudio.play().catch(e => console.log('Audio autoplay info:', e));
    } catch (e) {}

    // C. 380+ Crisp Fireworks Stars
    triggerGrandDetonation(x, y);

    // D. Visual Skyburst Flash
    flash.classList.remove('active');
    void flash.offsetWidth;
    flash.classList.add('active');

    // E. Screen Quake
    document.body.classList.remove('screen-quake');
    void document.body.offsetWidth;
    document.body.classList.add('screen-quake');

    // F. Reveal "HAPPY DIWALI" + Living Dynamic Flame Diya
    setTimeout(() => {
        landingScreen.style.display = 'none';
        celebrationScreen.classList.remove('hidden');
        isCelebration = true;

        // Start Ambient Sky Fireworks & Background Crackle Sounds
        startFestiveAmbience();
    }, 250);
}

// Background Firecrackers & Ambient Sky Fireworks
function startFestiveAmbience() {
    if (autoFireworksTimer) clearInterval(autoFireworksTimer);
    if (ambientAudioTimer) clearInterval(ambientAudioTimer);

    // Ambient Sky Fireworks Burst every 1.5s
    autoFireworksTimer = setInterval(() => {
        if (!isCelebration) return;
        const rx = Math.random() * (width * 0.76) + (width * 0.12);
        const ry = Math.random() * (height * 0.42) + 50;
        triggerCrispFirework(rx, ry);
    }, 1500);

    // Background festive firecracker sounds (boom-boom-boom & ladis) every 650ms
    ambientAudioTimer = setInterval(() => {
        if (!isCelebration) return;
        playDistantFirecracker();
    }, 650);
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
    triggerCrispFirework(clientX, clientY);
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
    if (ambientAudioTimer) clearInterval(ambientAudioTimer);

    try {
        diwaliAudio.pause();
        diwaliAudio.currentTime = 0;
    } catch (e) {}
});
