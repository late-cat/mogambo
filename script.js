// ===================================================
// 💥 MINIMAL MEME DIWALI DHAMAKA ENGINE
// ===================================================

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const landingScreen = document.getElementById('landingScreen');
const playBtn = document.getElementById('playBtn');
const rocket = document.getElementById('rocket');
const flash = document.getElementById('flash');
const shockwave = document.getElementById('shockwave');
const celebrationScreen = document.getElementById('celebrationScreen');
const replayBtn = document.getElementById('replayBtn');
const diwaliAudio = document.getElementById('diwaliAudio');

let width, height;
let particles = [];
let isCelebration = false;
let autoFireworksTimer = null;

// Resize canvas
function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ===================================================
// PROCEDURAL AUDIO SYNTHESIZER (Whistle + Pop + Blast)
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

// 1. Screaming Firecracker Rocket Whistle
function playRocketWhistle(duration = 1.15) {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // Primary screaming oscillator
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        // Rising whistle from 500Hz to 2900Hz
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(2900, now + duration);

        // High frequency jitter modulation for rocket sound
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        mod.frequency.value = 45;
        modGain.gain.value = 65;
        mod.connect(osc.frequency);
        mod.start(now);
        mod.stop(now + duration);

        // Volume envelope
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.28, now + duration * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
    } catch (e) {
        console.warn('Audio synthesis note:', e);
    }
}

// 2. Sharp Pop & Heavy Nuclear Blast Boom
function playNuclearDetonationSound() {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // A. Sharp Pop / Crack (Explosive ignition)
        const popOsc = ctx.createOscillator();
        const popGain = ctx.createGain();
        popOsc.type = 'triangle';
        popOsc.frequency.setValueAtTime(950, now);
        popOsc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
        popGain.gain.setValueAtTime(0.7, now);
        popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        popOsc.connect(popGain);
        popGain.connect(ctx.destination);
        popOsc.start(now);
        popOsc.stop(now + 0.12);

        // B. Deep Atomic Shockwave Rumble (Sub-bass)
        const boomOsc = ctx.createOscillator();
        const boomGain = ctx.createGain();
        boomOsc.type = 'sine';
        boomOsc.frequency.setValueAtTime(140, now);
        boomOsc.frequency.exponentialRampToValueAtTime(28, now + 2.2);
        boomGain.gain.setValueAtTime(0.9, now);
        boomGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
        boomOsc.connect(boomGain);
        boomGain.connect(ctx.destination);
        boomOsc.start(now);
        boomOsc.stop(now + 2.2);

        // C. Filtered White Noise (Atomic Blast explosion hiss & body)
        const bufferSize = ctx.sampleRate * 2.0;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(60, now + 2.0);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.75, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

        whiteNoise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        whiteNoise.start(now);
        whiteNoise.stop(now + 2.0);
    } catch (e) {
        console.warn('Audio synthesis note:', e);
    }
}

// ===================================================
// PARTICLE ENGINE: HIGH-VELOCITY PLASMA & FIREWORKS
// ===================================================

const PLASMA_COLORS = [
    '#ffffff', '#fff7bd', '#ffd700', '#ff9900', '#ff4d00',
    '#ff0055', '#cc00ff', '#00f2fe', '#4facfe', '#00ffcc'
];

class Particle {
    constructor(x, y, color, velocity, isMega = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
        this.friction = isMega ? 0.955 : 0.94;
        this.gravity = isMega ? 0.08 : 0.07;
        this.decay = Math.random() * (isMega ? 0.012 : 0.022) + 0.008;
        this.radius = Math.random() * (isMega ? 4.5 : 2.6) + 1.2;
        this.sparkle = Math.random() > 0.35;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.sparkle ? 18 : 8;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
    }
}

// Mega Nuclear Plasma Explosion
function createNuclearPlasmaBlast(x, y) {
    const totalCount = 550;
    for (let i = 0; i < totalCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Exponential distribution for high-density core + wide shockwave
        const speed = Math.pow(Math.random(), 0.45) * 19 + 2;
        const color = PLASMA_COLORS[Math.floor(Math.random() * PLASMA_COLORS.length)];

        particles.push(new Particle(
            x,
            y,
            color,
            {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            },
            true
        ));
    }
}

// Regular Firework Burst (Ambient & Taps)
function createFirework(x, y) {
    const count = 75;
    const baseColor = PLASMA_COLORS[Math.floor(Math.random() * PLASMA_COLORS.length)];
    const secondaryColor = PLASMA_COLORS[Math.floor(Math.random() * PLASMA_COLORS.length)];

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 1.5;
        const color = Math.random() > 0.3 ? baseColor : secondaryColor;

        particles.push(new Particle(
            x,
            y,
            color,
            {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            },
            false
        ));
    }
}

// Canvas Loop
function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(5, 1, 9, 0.2)';
    ctx.fillRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.draw();
        p.update();
        if (p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}
animate();

// ===================================================
// LAUNCH & NUCLEAR DETONATION SEQUENCE
// ===================================================

function startSequence() {
    // Hide Play Button Screen
    landingScreen.classList.add('vanish');

    // 1. Play screaming rocket whistle
    playRocketWhistle(1.15);

    // 2. Launch Rocket Upwards
    rocket.classList.add('launching');

    // 3. Detonate at rocket peak (1.15s)
    setTimeout(() => {
        detonateBlast();
    }, 1150);
}

function detonateBlast() {
    // Hide Rocket
    rocket.classList.remove('launching');

    // Explosion center: upper middle
    const blastX = width / 2;
    const blastY = height * 0.48;

    // A. Sounds: Sharp Pop + Heavy Nuclear Rumble
    playNuclearDetonationSound();

    // B. Start Modi Ji Diwali voice message immediately
    try {
        diwaliAudio.currentTime = 0;
        diwaliAudio.play().catch(e => console.log('Audio autoplay info:', e));
    } catch (e) {}

    // C. Canvas Plasma Explosion (550+ particles)
    createNuclearPlasmaBlast(blastX, blastY);

    // D. White-hot Blinding Flash
    flash.classList.remove('active');
    void flash.offsetWidth;
    flash.classList.add('active');

    // E. Plasma Shockwave
    shockwave.classList.remove('active');
    void shockwave.offsetWidth;
    shockwave.classList.add('active');

    // F. Nuclear Screen Shake
    document.body.classList.remove('nuclear-shake');
    void document.body.offsetWidth;
    document.body.classList.add('nuclear-shake');

    // G. Reveal Stylish "HAPPY DIWALI" text
    setTimeout(() => {
        landingScreen.style.display = 'none';
        celebrationScreen.classList.remove('hidden');
        isCelebration = true;

        // Continuous Ambient Fireworks
        startAmbientFireworks();
    }, 280);
}

function startAmbientFireworks() {
    if (autoFireworksTimer) clearInterval(autoFireworksTimer);
    autoFireworksTimer = setInterval(() => {
        if (!isCelebration) return;
        const rx = Math.random() * (width * 0.8) + (width * 0.1);
        const ry = Math.random() * (height * 0.5) + 60;
        createFirework(rx, ry);
    }, 1300);
}

// ===================================================
// EVENT LISTENERS
// ===================================================

// Click Play Button
playBtn.addEventListener('click', () => {
    startSequence();
});

// Click anywhere on screen to blast fireworks
window.addEventListener('click', (e) => {
    if (!isCelebration) return;
    if (e.target.closest('#replayBtn') || e.target.closest('#playBtn')) return;
    createFirework(e.clientX, e.clientY);
});

// Touch support for mobile taps
window.addEventListener('touchstart', (e) => {
    if (!isCelebration) return;
    if (e.target.closest('#replayBtn') || e.target.closest('#playBtn')) return;
    const t = e.touches[0];
    createFirework(t.clientX, t.clientY);
}, { passive: true });

// Replay Button
replayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    celebrationScreen.classList.add('hidden');
    landingScreen.style.display = 'flex';
    landingScreen.classList.remove('vanish');
    isCelebration = false;
    if (autoFireworksTimer) clearInterval(autoFireworksTimer);
    try {
        diwaliAudio.pause();
        diwaliAudio.currentTime = 0;
    } catch (e) {}
});
