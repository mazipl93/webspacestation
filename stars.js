// --- SYSTEM GWIAZD (STARS.JS) ---
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let width, height, stars = [];

function initStars() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    stars = [];
    for(let i=0; i<250; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.2,
            speed: Math.random() * 0.3
        });
    }
}

function animateStars() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fff";
    stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        s.y -= s.speed;
        if(s.y < 0) s.y = height;
    });
    requestAnimationFrame(animateStars);
}

window.addEventListener('resize', initStars);
initStars();
animateStars();