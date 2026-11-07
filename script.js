// ==========================================
// 🪔 MODI JI DIWALI DHAMAKA INTERACTIVE ENGINE
// ==========================================

const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
const igniteBtn = document.getElementById('igniteBtn');
const startScreen = document.getElementById('startScreen');
const rocket = document.getElementById('rocket');
const flashOverlay = document.getElementById('flashOverlay');
const shockwave = document.getElementById('shockwave');
const celebrationStage = document.getElementById('celebrationStage');
const diwaliAudio = document.getElementById('diwaliAudio');
const toggleAudioBtn = document.getElementById('toggleAudioBtn');
const replayBtn = document.getElementById('replayBtn');

let width, height;
let particles = [];
let rockets = [];
let isCelebrationActive = false;
let autoFireworksTimer = null;

// Resize canvas
function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ==========================================
// PARTICLE & FIREWORK PHYSICS ENGINE
// ==========================================

const COLORS = [
    '#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff',
    '#ff0055', '#ff9900', '#00f5d4', '#fee440', '#ffffff',
    '#ff4d4d', '#fffa65', '#32ff7e', '#7d5fff'
];

class Particle {
    constructor(x, y, color, velocity, isMega = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
        this.friction = 0.96;
        this.gravity = isMega ? 0.08 : 0.06;
        this.decay = Math.random() * (isMega ? 0.015 : 0.025) + 0.008;
        this.radius = Math.random() * (isMega ? 4 : 2.5) + 1.5;
        this.sparkle = Math.random() > 0.4;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.sparkle ? 15 : 8;
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

// Spawn Mega Nuclear Firework Blast
function createMegaBlast(x, y) {
    const particleCount = 450;
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Varied speeds for mushroom/spherical explosion
        const speed = Math.pow(Math.random(), 0.5) * 16 + 2;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        
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

// Spawn Regular Celebration Firework Burst
function createFirework(x, y) {
    const particleCount = 80;
    const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const secondaryColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 1;
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

// Canvas Render Loop
function render() {
    requestAnimationFrame(render);
    ctx.fillStyle = 'rgba(5, 0, 10, 0.22)';
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
render();

// ==========================================
// CINEMATIC LAUNCH SEQUENCE
// ==========================================

function triggerLaunchSequence() {
    // 1. Play Modi Ji Audio
    diwaliAudio.currentTime = 0;
    diwaliAudio.play().catch(e => console.log("Audio play error:", e));

    // 2. Hide Start Screen
    startScreen.classList.add('vanish');

    // 3. Launch the Rocket Upwards
    rocket.classList.add('launching');

    // 4. Detonate after 1.05 seconds (peak of rocket flight)
    setTimeout(() => {
        detonateNuclearBlast();
    }, 1050);
}

function detonateNuclearBlast() {
    // Hide Rocket element
    rocket.classList.remove('launching');

    // Center coordinates for explosion
    const blastX = width / 2;
    const blastY = height * 0.42;

    // Trigger Mega Canvas Blast
    createMegaBlast(blastX, blastY);

    // Trigger Screen Flash
    flashOverlay.classList.remove('active');
    void flashOverlay.offsetWidth; // Force reflow
    flashOverlay.classList.add('active');

    // Trigger Shockwave Ring
    shockwave.classList.remove('active');
    void shockwave.offsetWidth;
    shockwave.classList.add('active');

    // Trigger Screen Shake
    document.body.classList.remove('shake-screen');
    void document.body.offsetWidth;
    document.body.classList.add('shake-screen');

    // Reveal Celebration Stage
    setTimeout(() => {
        startScreen.style.display = 'none';
        celebrationStage.classList.remove('hidden');
        isCelebrationActive = true;

        // Start Continuous Fireworks
        startContinuousFireworks();
    }, 300);
}

// Continuous Ambient Fireworks
function startContinuousFireworks() {
    if (autoFireworksTimer) clearInterval(autoFireworksTimer);
    autoFireworksTimer = setInterval(() => {
        if (!isCelebrationActive) return;
        const randomX = Math.random() * (width * 0.8) + (width * 0.1);
        const randomY = Math.random() * (height * 0.45) + 50;
        createFirework(randomX, randomY);
    }, 1200);
}

// ==========================================
// EVENT LISTENERS & CONTROLS
// ==========================================

// Click Ignite Button
igniteBtn.addEventListener('click', () => {
    triggerLaunchSequence();
});

// Click Anywhere on Screen to Blast Fireworks
window.addEventListener('click', (e) => {
    if (!isCelebrationActive) return;
    // Don't trigger if clicked on control buttons
    if (e.target.closest('.footer-controls') || e.target.closest('.ignite-button')) return;

    createFirework(e.clientX, e.clientY);
});

// Touch support for mobile taps
window.addEventListener('touchstart', (e) => {
    if (!isCelebrationActive) return;
    if (e.target.closest('.footer-controls') || e.target.closest('.ignite-button')) return;

    const touch = e.touches[0];
    createFirework(touch.clientX, touch.clientY);
}, { passive: true });

// Toggle Audio Play/Pause
toggleAudioBtn.addEventListener('click', () => {
    if (diwaliAudio.paused) {
        diwaliAudio.play();
        toggleAudioBtn.textContent = '🔊 Playing Voice';
        toggleAudioBtn.style.background = 'rgba(255, 170, 0, 0.4)';
    } else {
        diwaliAudio.pause();
        toggleAudioBtn.textContent = '🔈 Voice Muted';
        toggleAudioBtn.style.background = 'rgba(255, 255, 255, 0.12)';
    }
});

// Replay Entire Sequence
replayBtn.addEventListener('click', () => {
    celebrationStage.classList.add('hidden');
    startScreen.style.display = 'flex';
    startScreen.classList.remove('vanish');
    isCelebrationActive = false;
    if (autoFireworksTimer) clearInterval(autoFireworksTimer);
    diwaliAudio.pause();
    diwaliAudio.currentTime = 0;
});
