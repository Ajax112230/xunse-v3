/**
 * Galaxy — WebGL 星空背景 (零依赖 vanilla WebGL)
 * Shader 与 React OGL 版完全一致
 */
(function(global) {
'use strict';

// ── vertex shader (与 React 版一致) ──────────────────
const VERTEX = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}`;

// ── fragment shader (与 React 版完全一致) ──────────────
const FRAGMENT = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) { return abs(fract(x) * 2.0 - 1.0); }

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + offset;
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);

      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;

      col += star * size * color;
    }
  }
  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);

  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);
  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}`;

// ── minimal WebGL helpers ─────────────────────────────
function createShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn('Shader error:', gl.getShaderInfoLog(s));
  }
  return s;
}

function createProgram(gl, vsSrc, fsSrc) {
  const p = gl.createProgram();
  gl.attachShader(p, createShader(gl, gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(p, createShader(gl, gl.FRAGMENT_SHADER, fsSrc));
  // 绑定 attribute location，确保 position=0, uv=1
  gl.bindAttribLocation(p, 0, 'position');
  gl.bindAttribLocation(p, 1, 'uv');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.warn('Link error:', gl.getProgramInfoLog(p));
  }
  return p;
}

// full-screen triangle (covers clip space without a VBO)
// buffer 只在初始化时创建一次
var _screenBuf = null;
function drawFullScreenTriangle(gl, program) {
  if (!_screenBuf) {
    _screenBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, _screenBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  0, 0,
       3, -1,  2, 0,
      -1,  3,  0, 2,
    ]), gl.STATIC_DRAW);
  } else {
    gl.bindBuffer(gl.ARRAY_BUFFER, _screenBuf);
  }

  var posLoc = gl.getAttribLocation(program, 'position');
  var uvLoc  = gl.getAttribLocation(program, 'uv');
  var stride = 4 * 4;

  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(uvLoc);
  gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, stride, 8);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function getUniformLocation(gl, program, name) {
  return gl.getUniformLocation(program, name);
}

// ── Galaxy Init ──────────────────────────────────────
var DEFAULTS = {
  focal:            [0.5, 0.5],
  rotation:         [1.0, 0.0],
  starSpeed:        0.3,
  density:          0.8,
  hueShift:         45,
  speed:            0.6,
  mouseInteraction: true,
  glowIntensity:    0.35,
  saturation:       0.2,
  mouseRepulsion:   true,
  repulsionStrength: 2.5,
  twinkleIntensity: 0.3,
  rotationSpeed:    0.08,
  autoCenterRepulsion: 0,
  transparent:      true,
};

global.initGalaxy = function(container, opts) {
  var o = {};
  var keys = Object.keys(DEFAULTS);
  for (var k = 0; k < keys.length; k++) {
    o[keys[k]] = (opts && opts[keys[k]] !== undefined) ? opts[keys[k]] : DEFAULTS[keys[k]];
  }

  var canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  var gl = canvas.getContext('webgl2', { alpha: o.transparent, premultipliedAlpha: false }) ||
            canvas.getContext('webgl',   { alpha: o.transparent, premultipliedAlpha: false });

  if (!gl) { console.warn('WebGL not supported'); return function(){}; }

  if (o.transparent) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
  } else {
    gl.clearColor(0, 0, 0, 1);
  }

  var program = createProgram(gl, VERTEX, FRAGMENT);
  gl.useProgram(program);

  // Resolve all uniform locations once
  var u = {};
  var uniformNames = [
    'uTime', 'uResolution', 'uFocal', 'uRotation', 'uStarSpeed', 'uDensity',
    'uHueShift', 'uSpeed', 'uMouse', 'uGlowIntensity', 'uSaturation',
    'uMouseRepulsion', 'uTwinkleIntensity', 'uRotationSpeed',
    'uRepulsionStrength', 'uMouseActiveFactor', 'uAutoCenterRepulsion', 'uTransparent'
  ];
  for (var n = 0; n < uniformNames.length; n++) {
    u[uniformNames[n]] = getUniformLocation(gl, program, uniformNames[n]);
  }

  function resize() {
    var w = container.offsetWidth  || window.innerWidth;
    var h = container.offsetHeight || window.innerHeight;
    if (w === 0 || h === 0) { w = window.innerWidth; h = window.innerHeight; }
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform3f(u.uResolution, w, h, w / h);
  }
  window.addEventListener('resize', resize);
  // 延迟确保 layout 完成 + DOM ready
  setTimeout(resize, 50);
  setTimeout(resize, 300);

  // Set static uniforms
  gl.uniform2fv(u.uFocal, new Float32Array(o.focal));
  gl.uniform2fv(u.uRotation, new Float32Array(o.rotation));
  gl.uniform1f(u.uDensity, o.density);
  gl.uniform1f(u.uHueShift, o.hueShift);
  gl.uniform1f(u.uSpeed, o.speed);
  gl.uniform1f(u.uGlowIntensity, o.glowIntensity);
  gl.uniform1f(u.uSaturation, o.saturation);
  gl.uniform1i(u.uMouseRepulsion, o.mouseRepulsion ? 1 : 0);
  gl.uniform1f(u.uTwinkleIntensity, o.twinkleIntensity);
  gl.uniform1f(u.uRotationSpeed, o.rotationSpeed);
  gl.uniform1f(u.uRepulsionStrength, o.repulsionStrength);
  gl.uniform1f(u.uAutoCenterRepulsion, o.autoCenterRepulsion);
  gl.uniform1i(u.uTransparent, o.transparent ? 1 : 0);

  // Mouse tracking
  var targetMouse = { x: 0.5, y: 0.5 };
  var smoothMouse = { x: 0.5, y: 0.5 };
  var targetActive = 0.0;
  var smoothActive = 0.0;

  function onMove(e) {
    var rect = container.getBoundingClientRect();
    targetMouse.x = (e.clientX - rect.left) / rect.width;
    targetMouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
    targetActive = 1.0;
  }
  function onLeave() { targetActive = 0.0; }

  if (o.mouseInteraction) {
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('touchmove', function(e) {
      var t = e.touches[0];
      var rect = container.getBoundingClientRect();
      targetMouse.x = (t.clientX - rect.left) / rect.width;
      targetMouse.y = 1.0 - (t.clientY - rect.top) / rect.height;
      targetActive = 1.0;
    }, { passive: true });
    document.addEventListener('touchend', onLeave);
  }

  var animId;
  function update(ms) {
    animId = requestAnimationFrame(update);
    var t = ms * 0.001;
    gl.uniform1f(u.uTime, t);
    gl.uniform1f(u.uStarSpeed, (t * o.starSpeed) / 10.0);

    var lerp = 0.05;
    smoothMouse.x += (targetMouse.x - smoothMouse.x) * lerp;
    smoothMouse.y += (targetMouse.y - smoothMouse.y) * lerp;
    smoothActive   += (targetActive - smoothActive) * lerp;

    gl.uniform2f(u.uMouse, smoothMouse.x, smoothMouse.y);
    gl.uniform1f(u.uMouseActiveFactor, smoothActive);

    gl.clear(gl.COLOR_BUFFER_BIT);
    drawFullScreenTriangle(gl, program);
  }
  animId = requestAnimationFrame(update);

  return function destroy() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
    if (o.mouseInteraction) {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    }
    if (container.contains(canvas)) container.removeChild(canvas);
    var ext = gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
  };
};

})(window);
