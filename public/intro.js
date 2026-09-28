/* 劳伦斯实验室 · 一念成宇宙
   5.8s Canvas 2D film: spark → neural sphere → lens passage → paper title.
   No network model, video, audio, or rendering dependencies. */
(function () {
  'use strict';
  var el = document.getElementById('paper-intro');
  var cv = document.getElementById('intro-cv');
  var ctx = cv && cv.getContext('2d');
  if (!el || !ctx) { if (window.__INTRO_FINISH) window.__INTRO_FINISH(false); return; }
  var freeze = (window.__INTRO_OPTS || {}).freeze;
  var DURATION = 5.8, TAU = Math.PI * 2;
  var w, h, dpr, radius, cx, cy, raf = 0, ended = false, start = performance.now();
  var title = el.querySelector('.intro-title-card');
  var caption = el.querySelector('.intro-caption');
  var phase = el.querySelector('.intro-phase');
  var bar = el.querySelector('.intro-progress span');
  var skip = el.querySelector('.intro-skip');
  var nodes = [], edges = [], dust = [], seed = 92826;
  // Warm gold remains dominant; jade and terracotta give moving signals depth.
  var particleColors = ['246,214,169', '236,181,108', '119,207,193', '240,155,119', '246,214,169'];
  function rgba(color, alpha) { return 'rgba(' + color + ',' + alpha + ')'; }
  var clamp = function (v) { return Math.max(0, Math.min(1, v)); };
  var ramp = function (t, a, b) { return clamp((t - a) / (b - a)); };
  var smooth = function (v) { return v * v * (3 - 2 * v); };
  var mix = function (a, b, v) { return a + (b - a) * v; };
  function rnd() { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; }
  for (var i = 0; i < 180; i++) {
    var y = 1 - 2 * (i + .5) / 180, rr = Math.sqrt(1 - y * y), a = i * 2.39996323;
    nodes.push({ x: Math.cos(a) * rr, y: y, z: Math.sin(a) * rr, phase: rnd() * TAU });
  }
  for (i = 0; i < nodes.length; i++) {
    for (var j = i + 1; j < nodes.length; j++) {
      var n = nodes[i], m = nodes[j];
      if (Math.hypot(n.x - m.x, n.y - m.y, n.z - m.z) < .32) edges.push([i, j]);
    }
  }
  for (i = 0; i < 90; i++) dust.push({ x: rnd(), y: rnd(), z: rnd(), p: rnd() * TAU });
  var grain = document.createElement('canvas'); grain.width = grain.height = 160;
  var gc = grain.getContext('2d'), pixels = gc.createImageData(160, 160);
  for (i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = rnd() > .5 ? 255 : 0;
    pixels.data[i + 3] = Math.floor(rnd() * 25);
  }
  gc.putImageData(pixels, 0, 0);
  var pattern = ctx.createPattern(grain, 'repeat');
  function resize() {
    w = innerWidth; h = innerHeight; dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    radius = Math.min(w * .285, h * .29, 265); cx = w * .5; cy = h * .47;
    if (freeze != null) render(freeze);
  }
  function line(x1, y1, x2, y2, color, width) {
    ctx.strokeStyle = color; ctx.lineWidth = width || 1;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  function dot(x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  function glow(x, y, r, strength, color) {
    color = color || '245,200,135';
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(color, strength));
    g.addColorStop(.12, rgba(color, strength * .55));
    g.addColorStop(1, rgba(color, 0)); ctx.fillStyle = g; ctx.fillRect(x-r,y-r,r*2,r*2);
  }
  function project(x, y, z, t, size) {
    var a = t * .33 - .8, b = -.27;
    var xx = x * Math.cos(a) + z * Math.sin(a), zz = -x * Math.sin(a) + z * Math.cos(a);
    var yy = y * Math.cos(b) - zz * Math.sin(b); zz = y * Math.sin(b) + zz * Math.cos(b);
    var perspective = 3.8 / (3.8 - zz);
    return { x: cx + xx * size * perspective, y: cy + yy * size * perspective, z: zz };
  }
  function sphere(t, opacity) {
    var growth = smooth(ramp(t, .45, 1.75)), zoom = smooth(ramp(t, 2.65, 3.8));
    var size = radius * (.15 + .85 * growth) * (1 + zoom * 5.5);
    ctx.save(); ctx.globalAlpha = opacity;
    glow(cx, cy, size * 1.5, .11);
    // Great-circle meridians and latitudes: the site's digital-earth motif.
    ctx.lineWidth = .65;
    for (var k = 0; k < 11; k++) {
      ctx.beginPath();
      for (var s = 0; s <= 96; s++) {
        var a = s / 96 * TAU, lon = k / 11 * Math.PI;
        var p = project(Math.cos(a) * Math.cos(lon), Math.sin(a), Math.cos(a) * Math.sin(lon), t, size);
        if (s === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = 'rgba(220,180,125,' + .11 * growth + ')'; ctx.stroke();
    }
    var points = nodes.map(function (n) {
      var p = project(n.x, n.y, n.z, t, size);
      var scatter = 1 - growth;
      p.x += Math.cos(n.phase) * radius * scatter * 2.6;
      p.y += Math.sin(n.phase) * radius * scatter * 1.8;
      return p;
    });
    edges.forEach(function (e, index) {
      var a = points[e[0]], b = points[e[1]], depth = (a.z + b.z + 2) / 4;
      var activation = ramp(t, .55 + (index % 17) * .038, 1.45 + (index % 17) * .038);
      var pulse = Math.pow(.5 + .5 * Math.sin(t * 3.4 - index * .43), 12);
      var color = particleColors[e[0] % particleColors.length];
      line(a.x, a.y, b.x, b.y, rgba(color, activation * (.04 + depth * .22 + pulse * .35)), .6 + pulse * .55);
      if (index % 9 === 0 && growth > .8) {
        var f = (t * .75 + index * .13) % 1;
        var px = mix(a.x, b.x, f), py = mix(a.y, b.y, f);
        glow(px, py, 8, depth * .23, color);
        dot(px, py, 1.6, rgba(color, depth * .95));
      }
    });
    points.forEach(function (p, index) {
      var front = (p.z + 1) / 2, pulse = .5 + .5 * Math.sin(t * 3 + nodes[index].phase);
      var color = particleColors[index % particleColors.length];
      dot(p.x, p.y, .6 + front * 1.5, rgba(color, (.14 + front * .75) * ramp(t, .4, 1.1)));
      if (index % 7 === 0 && front > .55) glow(p.x, p.y, 12 + pulse * 9, .28 * growth, color);
    });
    // Inclined orbital paths, drawn with depth-varying opacity.
    for (var ring = 0; ring < 3; ring++) {
      var tilt = [-.48, .6, 1.22][ring], orbitR = size * (1.3 + ring * .15), prev;
      for (var q = 0; q <= 140; q++) {
        var angle = q / 140 * TAU + t * .13;
        var ox = Math.cos(angle) * orbitR, oy = Math.sin(angle) * orbitR * .28;
        var pt = { x: cx + ox * Math.cos(tilt) - oy * Math.sin(tilt), y: cy + ox * Math.sin(tilt) + oy * Math.cos(tilt) };
        var orbitColor = ['224,172,98', '119,207,193', '240,155,119'][ring];
        if (prev) line(prev.x, prev.y, pt.x, pt.y, rgba(orbitColor, (.12 + .23 * (Math.sin(angle) + 1) / 2) * growth), ring === 0 ? 1.2 : .7);
        prev = pt;
      }
    }
    ctx.restore();
  }
  function render(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalAlpha = 1;
    var paper = smooth(ramp(t, 3.35, 4.12));
    ctx.fillStyle = 'rgb(' + Math.round(mix(14,246,paper)) + ',' + Math.round(mix(17,241,paper)) + ',' + Math.round(mix(19,229,paper)) + ')';
    ctx.fillRect(0,0,w,h);
    if (paper < 1) {
      ctx.save(); ctx.globalAlpha = 1 - paper;
      var nebula = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.65);
      nebula.addColorStop(0,'rgba(143,88,39,.13)'); nebula.addColorStop(.6,'rgba(74,69,47,.035)'); nebula.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = nebula; ctx.fillRect(0,0,w,h);
      dust.forEach(function (p, index) {
        var drift = t * (2 + p.z * 6), x = (p.x*w + drift) % w, y = p.y*h + Math.sin(t*.3+p.p)*5;
        dot(x,y,.4+p.z*.9,rgba(particleColors[index % particleColors.length], .10+p.z*.35));
      });
      var awaken = ramp(t,0,.35) * (1-ramp(t,.65,1.25));
      glow(cx,cy,80 + t*80,awaken*.75);
      var beam = ctx.createLinearGradient(cx-w*.4,0,cx+w*.4,0);
      beam.addColorStop(0,'rgba(235,182,104,0)'); beam.addColorStop(.5,'rgba(255,233,193,' + awaken*.8 + ')'); beam.addColorStop(1,'rgba(235,182,104,0)');
      ctx.fillStyle = beam; ctx.fillRect(cx-w*.4,cy,w*.8,1);
      sphere(t,ramp(t,.35,.9)*(1-ramp(t,3.1,3.85)));
      // Forward streaks come from the existing points as the lens enters the sphere.
      var rush = Math.sin(ramp(t,2.8,3.75)*Math.PI);
      if (rush > 0) dust.forEach(function (p, index) {
        var a = p.p, r = radius*(.6+p.z*2), len = rush*(30+p.z*180);
        line(cx+Math.cos(a)*r,cy+Math.sin(a)*r,cx+Math.cos(a)*(r+len),cy+Math.sin(a)*(r+len),rgba(particleColors[index % particleColors.length], rush*.3),.7);
      });
      ctx.restore();
    }
    if (paper > 0) {
      ctx.save(); ctx.globalAlpha = paper;
      // An expansive ink orbit remains as a faint imprint on the paper.
      ctx.strokeStyle = 'rgba(180,85,30,.09)'; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.ellipse(cx, h*.49, Math.min(w*.42,h*.44), Math.min(w*.42,h*.44), 0, 0, TAU); ctx.stroke();
      var imprint = Math.min(w*.42,h*.44);
      ctx.beginPath();ctx.arc(cx,h*.49,imprint+9,-.95,-.4);ctx.strokeStyle='rgba(180,85,30,.32)';ctx.stroke();
      var shade=ctx.createRadialGradient(cx,h*.45,h*.1,cx,h*.45,Math.max(w,h)*.75);
      shade.addColorStop(0,'rgba(160,119,63,0)');shade.addColorStop(1,'rgba(135,99,45,.1)');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
      ctx.restore();
    }
    // Grain is precomputed, keeping mobile frames light.
    ctx.save();ctx.globalAlpha=.36;ctx.translate((Math.floor(t*12)%4)*31,(Math.floor(t*9)%3)*27);
    ctx.fillStyle=pattern;ctx.fillRect(-100,-100,w+200,h+200);ctx.restore();
    var letterbox = Math.min(h*.08,64)*(1-smooth(ramp(t,3.55,4.2)));
    ctx.fillStyle='#0a0c0e';ctx.fillRect(0,0,w,letterbox);ctx.fillRect(0,h-letterbox,w,letterbox);
    var titleIn = smooth(ramp(t,3.75,4.35));
    title.style.opacity = titleIn; title.style.transform='translateY(' + (1-titleIn)*18 + 'px)';
    caption.style.opacity = ramp(t,.75,1.2)*(1-ramp(t,2.7,3.1));
    el.classList.toggle('on-paper',paper>.65);
    phase.textContent = t < 1.3 ? '01 / 灵感点亮' : t < 3.35 ? '02 / 万物相连' : '03 / 探索开始';
    bar.style.transform='scaleX(' + clamp(t/DURATION) + ')';
  }
  function finish() { if (window.__INTRO_FINISH) window.__INTRO_FINISH(true); }
  function cleanup() {
    if (ended) return; ended=true; cancelAnimationFrame(raf);
    removeEventListener('resize',resize); document.removeEventListener('visibilitychange',visibility);
    document.removeEventListener('keydown',keydown); skip.removeEventListener('click',finish);
    window.__INTRO_CLEANUP = null;
  }
  function keydown(e) { if (e.key === 'Escape') { e.preventDefault(); finish(); } }
  function visibility() { if (document.hidden && freeze == null) finish(); }
  function tick(now) {
    if (ended) return;
    var t = (now-start)/1000;
    if (t >= DURATION) { finish(); return; }
    render(t); raf=requestAnimationFrame(tick);
  }
  window.__INTRO_CLEANUP=cleanup;
  window.__INTRO_BOOTED=true;
  addEventListener('resize',resize); document.addEventListener('visibilitychange',visibility);
  document.addEventListener('keydown',keydown); skip.addEventListener('click',finish);
  // Font loading overlaps the film; it never delays entry to the website.
  if (document.fonts) document.fonts.load('64px MaShanZhengFilm','劳伦斯实验室').catch(function(){});
  resize();
  if (freeze != null) render(freeze); else { render(0); raf=requestAnimationFrame(tick); }
})();
