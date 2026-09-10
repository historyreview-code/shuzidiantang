const canvas = document.querySelector('#kaleidoscope');
const ctx = canvas.getContext('2d', { alpha: false });
const texture = document.createElement('canvas');
const textureCtx = texture.getContext('2d');

const stage = document.querySelector('#stage');
const generateButton = document.querySelector('#generateButton');
const pauseButton = document.querySelector('#pauseButton');
const downloadButton = document.querySelector('#downloadButton');
const symmetryInput = document.querySelector('#symmetry');
const speedInput = document.querySelector('#speed');
const symmetryValue = document.querySelector('#symmetryValue');
const speedValue = document.querySelector('#speedValue');
const paletteOptions = document.querySelector('#paletteOptions');
const patternName = document.querySelector('#patternName');
const intro = document.querySelector('#intro');

const palettes = {
  ember: { name: '暮火', colors: ['#ff4829', '#ff9957', '#ffd596', '#851f38', '#2c1022'], accent: '#ff6542' },
  lagoon: { name: '深海', colors: ['#14c9c0', '#28a8c7', '#1450a0', '#f5df89', '#053741'], accent: '#25c8ba' },
  orchid: { name: '幽兰', colors: ['#f27db9', '#9e58d9', '#5432a9', '#ffc96b', '#331d59'], accent: '#e779b5' },
  mono: { name: '银白', colors: ['#ffffff', '#cdd0d8', '#727782', '#26282e', '#0d0e11'], accent: '#d9dce3' }
};

let activePalette = 'ember';
let symmetry = Number(symmetryInput.value);
let rotationSpeed = Number(speedInput.value) / 100;
let patternIndex = 1;
let rotation = 0;
let previousTime = performance.now();
let paused = false;
let geometry = [];
let pointer = { x: 0.68, y: 0.46 };

function mulberry32(seed) {
  return function random() {
    let value = seed += 0x6D2B79F5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function updateRange(input) {
  const percent = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty('--range-progress', `${percent}%`);
}

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = stage.getBoundingClientRect();
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  texture.width = canvas.width;
  texture.height = canvas.height;
  buildTexture();
}

let resizeFrame;

function scheduleResize() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(resize);
}

function buildGeometry(random) {
  const maxDimension = Math.max(texture.width, texture.height);
  const selected = palettes[activePalette].colors;
  geometry = Array.from({ length: 78 + Math.floor(random() * 32) }, () => {
    const kind = random() > 0.68 ? 'line' : random() > 0.4 ? 'petal' : 'orb';
    return {
      kind,
      x: (0.02 + Math.pow(random(), 1.35) * 0.82) * maxDimension,
      y: (random() - 0.5) * maxDimension * 0.58,
      size: (0.012 + random() * 0.085) * maxDimension,
      length: (0.025 + random() * 0.14) * maxDimension,
      angle: random() * Math.PI * 2,
      color: selected[Math.floor(random() * selected.length)],
      alpha: 0.18 + random() * 0.72,
      blur: random() * maxDimension * 0.018
    };
  });
}

function buildTexture() {
  if (!texture.width || !texture.height) return;
  const random = mulberry32(patternIndex * 1013 + symmetry * 41 + activePalette.length * 97);
  const selected = palettes[activePalette].colors;
  buildGeometry(random);
  textureCtx.clearRect(0, 0, texture.width, texture.height);
  const maxDimension = Math.max(texture.width, texture.height);
  const centerX = maxDimension * 0.08;
  const centerY = texture.height / 2;

  const background = textureCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxDimension);
  background.addColorStop(0, '#23131c');
  background.addColorStop(0.48, '#0c0b0f');
  background.addColorStop(1, '#050507');
  textureCtx.fillStyle = background;
  textureCtx.fillRect(0, 0, texture.width, texture.height);

  textureCtx.save();
  textureCtx.translate(centerX, centerY);
  textureCtx.globalCompositeOperation = 'screen';
  for (let index = 0; index < 14; index += 1) {
    const distance = maxDimension * (0.025 + index * 0.046);
    const size = maxDimension * (0.018 + (index % 4) * 0.006);
    const offset = Math.sin(index * 1.8 + patternIndex) * maxDimension * 0.035;
    textureCtx.save();
    textureCtx.translate(distance, offset);
    textureCtx.rotate((random() - 0.5) * 0.8);
    textureCtx.fillStyle = selected[index % selected.length];
    textureCtx.globalAlpha = 0.55 + random() * 0.35;
    textureCtx.shadowBlur = size * 0.8;
    textureCtx.shadowColor = selected[index % selected.length];
    textureCtx.beginPath();
    textureCtx.moveTo(-size * 0.35, 0);
    textureCtx.bezierCurveTo(0, -size, size * 1.9, -size * 0.72, size * 2.6, 0);
    textureCtx.bezierCurveTo(size * 1.9, size * 0.72, 0, size, -size * 0.35, 0);
    textureCtx.fill();
    textureCtx.restore();
  }
  textureCtx.restore();

  for (const shape of geometry) {
    textureCtx.save();
    textureCtx.translate(centerX + shape.x, centerY + shape.y);
    textureCtx.rotate(shape.angle);
    textureCtx.globalAlpha = shape.alpha;
    textureCtx.shadowBlur = shape.blur;
    textureCtx.shadowColor = shape.color;
    textureCtx.fillStyle = shape.color;
    textureCtx.strokeStyle = shape.color;
    textureCtx.lineWidth = Math.max(2, shape.size * 0.08);

    if (shape.kind === 'petal') {
      textureCtx.beginPath();
      textureCtx.moveTo(0, 0);
      textureCtx.bezierCurveTo(shape.size * 0.6, -shape.size, shape.length, -shape.size * 0.4, shape.length, 0);
      textureCtx.bezierCurveTo(shape.length, shape.size * 0.4, shape.size * 0.6, shape.size, 0, 0);
      textureCtx.fill();
    } else if (shape.kind === 'line') {
      textureCtx.beginPath();
      textureCtx.moveTo(0, -shape.size * 0.5);
      textureCtx.lineTo(shape.length, shape.size * 0.5);
      textureCtx.stroke();
    } else {
      textureCtx.beginPath();
      textureCtx.arc(0, 0, shape.size * 0.42, 0, Math.PI * 2);
      textureCtx.fill();
    }
    textureCtx.restore();
  }

  textureCtx.save();
  textureCtx.translate(centerX, centerY);
  textureCtx.globalCompositeOperation = 'screen';
  for (let ring = 1; ring <= 5; ring += 1) {
    textureCtx.beginPath();
    textureCtx.arc(0, 0, maxDimension * (0.055 + ring * 0.092), -0.42, 0.42);
    textureCtx.strokeStyle = selected[ring % selected.length];
    textureCtx.globalAlpha = 0.12 + ring * 0.025;
    textureCtx.lineWidth = Math.max(2, maxDimension * 0.004);
    textureCtx.stroke();
  }
  textureCtx.restore();
}

function draw(time) {
  const delta = Math.min(40, time - previousTime);
  previousTime = time;
  if (!paused) rotation += delta * rotationSpeed * 0.00022;

  const width = canvas.width;
  const height = canvas.height;
  const cx = width * pointer.x;
  const cy = height * pointer.y;
  const radius = Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy)) * 1.06;
  const wedge = (Math.PI * 2) / symmetry;

  ctx.fillStyle = '#07070a';
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  for (let i = 0; i < symmetry; i += 1) {
    ctx.save();
    ctx.rotate(i * wedge);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, -wedge / 2 - 0.002, wedge / 2 + 0.002);
    ctx.closePath();
    ctx.clip();
    if (i % 2 === 1) ctx.scale(1, -1);
    ctx.rotate(-rotation * 0.36);
    ctx.drawImage(texture, -texture.width * 0.08, -texture.height / 2, texture.width, texture.height);
    ctx.restore();
  }
  ctx.restore();

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.62);
  glow.addColorStop(0, 'rgba(255,255,255,0.08)');
  glow.addColorStop(0.28, 'rgba(255,255,255,0)');
  glow.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  requestAnimationFrame(draw);
}

function regenerate() {
  patternIndex += 1;
  buildTexture();
  patternName.textContent = `${palettes[activePalette].name} · ${String(patternIndex).padStart(3, '0')}`;
  intro.classList.add('is-subtle');
}

generateButton.addEventListener('click', (event) => {
  event.stopPropagation();
  regenerate();
});

stage.addEventListener('click', regenerate);
stage.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse') return;
  const rect = stage.getBoundingClientRect();
  pointer.x += ((event.clientX - rect.left) / rect.width * 0.22 + 0.56 - pointer.x) * 0.08;
  pointer.y += ((event.clientY - rect.top) / rect.height * 0.18 + 0.36 - pointer.y) * 0.08;
});

symmetryInput.addEventListener('input', () => {
  symmetry = Number(symmetryInput.value);
  symmetryValue.textContent = symmetry;
  updateRange(symmetryInput);
});

speedInput.addEventListener('input', () => {
  rotationSpeed = Number(speedInput.value) / 100;
  speedValue.textContent = `${rotationSpeed.toFixed(2)}×`;
  updateRange(speedInput);
});

paletteOptions.addEventListener('click', (event) => {
  const button = event.target.closest('[data-palette]');
  if (!button) return;
  activePalette = button.dataset.palette;
  document.documentElement.style.setProperty('--accent', palettes[activePalette].accent);
  paletteOptions.querySelectorAll('.swatch').forEach((swatch) => {
    const active = swatch === button;
    swatch.classList.toggle('is-active', active);
    swatch.setAttribute('aria-pressed', String(active));
  });
  regenerate();
});

pauseButton.addEventListener('click', () => {
  paused = !paused;
  pauseButton.classList.toggle('is-paused', paused);
  pauseButton.setAttribute('aria-label', paused ? '继续动画' : '暂停动画');
  pauseButton.title = paused ? '继续动画' : '暂停动画';
});

downloadButton.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `万象镜-${String(patternIndex).padStart(3, '0')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

window.addEventListener('resize', scheduleResize);
window.visualViewport?.addEventListener('resize', scheduleResize);
window.addEventListener('orientationchange', scheduleResize);
updateRange(symmetryInput);
updateRange(speedInput);
resize();
draw(performance.now());
