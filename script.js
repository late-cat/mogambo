// ===================================================
// 🪔 IMMERSIVE DIWALI FIREWORKS & SKYROCKET ENGINE
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

let width, height, dpr;
let particles = [];
let rocketSparks = [];
let activeRockets = [];
let isCelebration = false;
let autoFireworksTimer = null;
let rocketAscentRaf = null;

// High-DPI Canvas Resizing for Crisp Mobile Rendering
function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
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
// PROCEDURAL AUDIO SYNTHESIZER
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

// 1. Screaming Rocket Whistle
function playRocketWhistle(duration = 1.25) {
    try {
        const ac = getAudioContext();
        const now = ac.currentTime;

        const osc = ac.createOscillator();
        const gain = ac.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(3200, now + duration);

        // Rocket flutter vibrato
        const mod = ac.createOscillator();
        const modGain = ac.createGain();
        mod.frequency.value = 40;
        modGain.gain.value = 55;
        mod.connect(osc.frequency);
        mod.start(now);
        mod.stop(now + duration);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + duration * 0.75);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ac.destination);

        osc.start(now);
        osc.stop(now + duration);
    } catch (e) {
        console.warn('Audio synthesis info:', e);
    }
}

// 2. High-Caliber Aerial Shell Detonation (Sharp Pop + Thunder Sub-Bass)
function playAerialShellBlast() {
    try {
        const ac = getAudioContext();
        const now = ac.currentTime;

        // A. Sharp Explosive Crack / Pop
        const popOsc = ac.createOscillator();
        const popGain = ac.createGain();
        popOsc.type = 'triangle';
        popOsc.frequency.setValueAtTime(1200, now);
        popOsc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        popGain.gain.setValueAtTime(0.85, now);
        popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        popOsc.connect(popGain);
        popGain.connect(ac.destination);
        popOsc.start(now);
        popOsc.stop(now + 0.1);

        // B. Thunderous Sub-Bass Boom
        const boomOsc = ac.createOscillator();
        const boomGain = ac.createGain();
        boomOsc.type = 'sine';
        boomOsc.frequency.setValueAtTime(160, now);
        boomOsc.frequency.exponentialRampToValueAtTime(26, now + 2.5);
        boomGain.gain.setValueAtTime(1.0, now);
        boomGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
        boomOsc.connect(boomGain);
        boomGain.connect(ac.destination);
        boomOsc.start(now);
        boomOsc.stop(now + 2.5);

        // C. Firework Crackle Body (White noise with low-pass envelope)
        const bufferSize = ac.sampleRate * 2.2;
        const noiseBuffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ac.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const filter = ac.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, now);
        filter.frequency.exponentialRampToValueAtTime(70, now + 2.2);

        const noiseGain = ac.createGain();
        noiseGain.gain.setValueAtTime(0.8, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

        whiteNoise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ac.destination);

        whiteNoise.start(now);
        whiteNoise.stop(now + 2.2);
    } catch (e) {
        console.warn('Audio blast info:', e);
    }
}

// 3. Mini Tap Pop Sound
function playMiniPop() {
    try {
        const ac = getAudioContext();
        const now = ac.currentTime;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400 + Math.random() * 250, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    } catch (e) {}
}

// ===================================================
// PARTICLE ENGINE: AERIAL SHELL & WILLOW TRAILS
// ===================================================

const FESTIVE_PALETTES = [
    ['#ffffff', '#fff275', '#ff9f1c', '#ff3838', '#ffd700'], // Gold & Fire
    ['#00f5d4', '#7b2cbf', '#ff007f', '#ffffff', '#ffd700'], // Electric Diwali
    ['#ff0055', '#ff5400', '#ffbd00', '#39ff14', '#00e5ff'], // Multicolored Carnival
    ['#ff99c8', '#fcf6bd', '#d0f4de', '#a9def9', '#e4c1f9']  // Pastel Glow
];

class ShellStar {
    constructor(x, y, color, velocity, isWillow = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
        this.friction = isWillow ? 0.965 : 0.95;
        this.gravity = isWillow ? 0.055 : 0.075;
        this.decay = Math.random() * (isWillow ? 0.009 : 0.018) + 0.006;
        this.radius = Math.random() * (isWillow ? 3.5 : 2.5) + 1.2;
        this.trail = [];
        this.maxTrail = isWillow ? 7 : 4;
        this.sparkle = Math.random() > 0.3;
    }

    draw() {
        // Draw trailing spark line
        if (this.trail.length > 1) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.radius * 0.8;
            ctx.lineCap = 'round';
            ctx.globalAlpha = this.alpha * 0.6;
            ctx.shadowBlur = this.sparkle ? 12 : 5;
            ctx.shadowColor = this.color;
            ctx.stroke();
            ctx.restore();
        }

        // Draw star head
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.sparkle ? 16 : 8;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) {
            this.trail.pop();
        }

        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
    }
}

// Rocket Thruster Spark Class
class ThrusterSpark {
    constructor(x, y) {
        this.x = x + (Math.random() - 0.5) * 8;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2.5;
        this.vy = Math.random() * 4 + 2; // Spews downward
        this.alpha = 1;
        this.decay = Math.random() * 0.04 + 0.03;
        this.radius = Math.random() * 2.5 + 1;
        this.color = Math.random() > 0.4 ? '#ffcc00' : '#ff4500';
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }
}

// Realistic Double-Shell Skyrocket Detonation
function detonateGrandSkyrocket(x, y) {
    const palette = FESTIVE_PALETTES[0]; // Radiant Gold & Amber Fire
    const willowCount = 280;
    const coreCount = 180;

    // 1. Golden Brocade Willow Stars (Outer graceful arching trails)
    for (let i = 0; i < willowCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.pow(Math.random(), 0.5) * 16 + 2.5;
        const color = Math.random() > 0.25 ? '#ffd700' : '#ffffff';

        particles.push(new ShellStar(
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

    // 2. High-Velocity Inner Fireball (Vibrant orange/ruby blast core)
    for (let i = 0; i < coreCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 11 + 1;
        const color = palette[Math.floor(Math.random() * palette.length)];

        particles.push(new ShellStar(
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

// Mini Tap / Ambient Fireworks Burst
function triggerFireworkBurst(x, y) {
    playMiniPop();
    const palette = FESTIVE_PALETTES[Math.floor(Math.random() * FESTIVE_PALETTES.length)];
    const count = Math.min(85, Math.floor(width / 6));

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 1.2;
        const color = palette[Math.floor(Math.random() * palette.length)];

        particles.push(new ShellStar(
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

// ===================================================
// CANVAS MAIN ANIMATION LOOP
// ===================================================
function animate() {
    requestAnimationFrame(animate);

    // Dark trails fade
    ctx.fillStyle = 'rgba(3, 0, 8, 0.22)';
    ctx.fillRect(0, 0, width, height);

    // Update & draw thruster sparks
    for (let i = rocketSparks.length - 1; i >= 0; i--) {
        const s = rocketSparks[i];
        s.draw();
        s.update();
        if (s.alpha <= 0) {
            rocketSparks.splice(i, 1);
        }
    }

    // Update & draw shell fireworks particles
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
// ROCKET FLIGHT & EMBER TRAIL EMITTER
// ===================================================
function emitRocketTrail() {
    if (!rocket.classList.contains('launching')) return;

    // Track the physical position of the rocket element on screen
    const rect = rocket.getBoundingClientRect();
    const thrusterX = rect.left + rect.width / 2;
    const thrusterY = rect.bottom - 45;

    // Spawn hot fire sparks trailing from thruster
    for (let i = 0; i < 4; i++) {
        rocketSparks.push(new ThrusterSpark(thrusterX, thrusterY));
    }

    rocketAscentRaf = requestAnimationFrame(emitRocketTrail);
}

// ===================================================
// LAUNCH SEQUENCE ENGINE
// ===================================================
function startLaunchSequence() {
    // 1. Hide Play Button
    landingScreen.classList.add('vanish');

    // 2. Play Screaming Rocket Whistle
    playRocketWhistle(1.25);

    // 3. Launch Rocket Projectile
    rocket.classList.add('launching');
    emitRocketTrail();

    // 4. Detonate at Rocket Apex (1.25 seconds)
    setTimeout(() => {
        detonateApexBlast();
    }, 1250);
}

function detonateApexBlast() {
    // Stop rocket animation and spark trail
    if (rocketAscentRaf) cancelAnimationFrame(rocketAscentRaf);
    rocket.classList.remove('launching');

    // Apex detonation coordinates: upper center
    const blastX = width / 2;
    const blastY = height * 0.50;

    // A. Sounds: Sharp Aerial Shell Crack + Thunder Sub-Bass
    playAerialShellBlast();

    // B. Start Modi Ji Audio Message
    try {
        diwaliAudio.currentTime = 0;
        diwaliAudio.play().catch(e => console.log('Audio autoplay info:', e));
    } catch (e) {}

    // C. 460+ Particle Aerial Shell & Brocade Willow Blast
    detonateGrandSkyrocket(blastX, blastY);

    // D. Blinding Flash & Expanding Shockwave
    flash.classList.remove('active');
    void flash.offsetWidth;
    flash.classList.add('active');

    shockwave.classList.remove('active');
    void shockwave.offsetWidth;
    shockwave.classList.add('active');

    // E. Screen Vibration
    document.body.classList.remove('nuclear-shake');
    void document.body.offsetWidth;
    document.body.classList.add('nuclear-shake');

    // F. Reveal "HAPPY DIWALI" + Living Dynamic Flame Diya
    setTimeout(() => {
        landingScreen.style.display = 'none';
        celebrationScreen.classList.remove('hidden');
        isCelebration = true;

        // Start Ambient Fireworks
        startAmbientFireworks();
    }, 280);
}

function startAmbientFireworks() {
    if (autoFireworksTimer) clearInterval(autoFireworksTimer);
    autoFireworksTimer = setInterval(() => {
        if (!isCelebration) return;
        const rx = Math.random() * (width * 0.78) + (width * 0.11);
        const ry = Math.random() * (height * 0.45) + 60;
        triggerFireworkBurst(rx, ry);
    }, 1400);
}

// ===================================================
// USER INTERACTIONS & TOUCH CONTROLS
// ===================================================

// Click / Tap Play Button
playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startLaunchSequence();
});

// Tap anywhere on screen to trigger tactile fireworks
function handleScreenTap(clientX, clientY) {
    if (!isCelebration) return;
    triggerFireworkBurst(clientX, clientY);
}

window.addEventListener('click', (e) => {
    if (e.target.closest('#replayBtn') || e.target.closest('#playBtn')) return;
    handleScreenTap(e.clientX, e.clientY);
});

// Multi-touch support for mobile devices
window.addEventListener('touchstart', (e) => {
    if (e.target.closest('#replayBtn') || e.target.closest('#playBtn')) return;
    for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        handleScreenTap(touch.clientX, touch.clientY);
    }
}, { passive: true });

// Replay Entire Sequence
replayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    celebrationScreen.classList.add('hidden');
    landingScreen.style.display = 'flex';
    landingScreen.classList.remove('vanish');
    isCelebration = false;

    if (autoFireworksTimer) clearInterval(autoFireworksTimer);
    if (rocketAscentRaf) cancelAnimationFrame(rocketAscentRaf);

    try {
        diwaliAudio.pause();
        diwaliAudio.currentTime = 0;
    } catch (e) {}
});
