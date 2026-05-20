---
name: webgl-creative-coding
description: WebGL2 and Three.js creative coding — GLSL shaders, noise, SDF, raymarching, GPGPU particles, and reactive visuals in Svelte 5 components.
metadata:
  type: skill
  triggers:
    - WebGL
    - WebGL2
    - GLSL
    - fragment shader
    - vertex shader
    - Three.js
    - ShaderMaterial
    - GPGPU
    - particle system
    - noise shader
    - SDF
    - raymarching
    - creative coding
    - canvas WebGL
    - flow field
    - reaction-diffusion
    - generative art
    - shader effect
    - mouse reactive
    - audio visualizer
---

# WebGL Creative Coding

Expert guidance for building interactive WebGL2 and Three.js visuals in Astro 5 + Svelte 5 projects. Covers raw WebGL, GLSL patterns, GPGPU techniques, and Svelte lifecycle integration.

## Raw WebGL2 Setup

### Minimal context initialization

```typescript
// src/lib/webgl/context.ts
export function createWebGLContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,   // handle manually with MSAA FBO
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  });

  if (!gl) throw new Error('WebGL2 not supported');
  return gl;
}
```

### Shader compilation

```typescript
export function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${log}`);
  }
  return shader;
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vertSrc: string,
  fragSrc: string
): WebGLProgram {
  const program = gl.createProgram()!;
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${log}`);
  }
  return program;
}
```

### VAO + VBO setup (fullscreen quad)

```typescript
export function createFullscreenQuad(gl: WebGL2RenderingContext) {
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);

  const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  const vbo = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);
  return { vao, vbo, count: 4 };
}
```

### Uniform setters

```typescript
export class UniformCache {
  private cache = new Map<string, WebGLUniformLocation>();

  constructor(private gl: WebGL2RenderingContext, private program: WebGLProgram) {}

  loc(name: string): WebGLUniformLocation | null {
    if (!this.cache.has(name)) {
      const loc = this.gl.getUniformLocation(this.program, name);
      if (loc !== null) this.cache.set(name, loc);
    }
    return this.cache.get(name) ?? null;
  }

  set1f(name: string, v: number) { this.gl.uniform1f(this.loc(name)!, v); }
  set2f(name: string, x: number, y: number) { this.gl.uniform2f(this.loc(name)!, x, y); }
  set3f(name: string, x: number, y: number, z: number) { this.gl.uniform3f(this.loc(name)!, x, y, z); }
  set1i(name: string, v: number) { this.gl.uniform1i(this.loc(name)!, v); }
}
```

## GLSL Patterns

### Noise functions

**Simplex noise 2D (value-based, no license issues):**

```glsl
// Hash-based smooth noise
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float simplex2(vec2 p) {
  const float K1 = 0.366025404; // (sqrt(3)-1)/2
  const float K2 = 0.211324865; // (3-sqrt(3))/6
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);
  vec3 n = h * h * h * h * vec3(
    dot(a, hash2(i + 0.0)),
    dot(b, hash2(i + o)),
    dot(c, hash2(i + 1.0))
  );
  return dot(n, vec3(70.0));
}

// Fractal Brownian Motion
float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < octaves; i++) {
    value += amplitude * simplex2(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
```

### SDF (Signed Distance Functions)

```glsl
// Primitive SDFs
float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}
float sdRoundBox(vec2 p, vec2 b, float r) { return sdBox(p, b - r) - r; }

// Combining SDFs
float opUnion(float a, float b)        { return min(a, b); }
float opSubtract(float a, float b)     { return max(a, -b); }
float opIntersect(float a, float b)    { return max(a, b); }
float opSmoothUnion(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Render SDF with anti-aliasing
float renderSDF(float d, float strokeWidth) {
  float fw = fwidth(d);
  // Fill
  float fill = 1.0 - smoothstep(-fw, fw, d);
  // Stroke
  float stroke = 1.0 - smoothstep(strokeWidth - fw, strokeWidth + fw, abs(d));
  return fill + stroke;
}
```

### Raymarching basics (2.5D / flat)

```glsl
// Simple 2D raymarching for metaballs
float scene(vec2 p, vec2[4] balls, float[4] radii) {
  float d = 1e10;
  for (int i = 0; i < 4; i++) {
    d = opSmoothUnion(d, sdCircle(p - balls[i], radii[i]), 0.15);
  }
  return d;
}

// 3D sphere raymarching
float sceneSDF(vec3 p) {
  return length(p) - 1.0; // unit sphere
}

vec3 calcNormal(vec3 p) {
  const vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    sceneSDF(p + e.xyy) - sceneSDF(p - e.xyy),
    sceneSDF(p + e.yxy) - sceneSDF(p - e.yxy),
    sceneSDF(p + e.yyx) - sceneSDF(p - e.yyx)
  ));
}

vec4 raymarch(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < 128; i++) {
    vec3 p = ro + rd * t;
    float d = sceneSDF(p);
    if (d < 0.001) {
      vec3 n = calcNormal(p);
      return vec4(n * 0.5 + 0.5, 1.0);
    }
    if (t > 20.0) break;
    t += d;
  }
  return vec4(0.0);
}
```

## Three.js with Custom ShaderMaterial

### Setup in Svelte 5

```svelte
<!-- src/components/ShaderScene.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let canvas: HTMLCanvasElement;

  const vertexShader = /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = /* glsl */`
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      vec2 mouse = uMouse / uResolution;
      float d = length(uv - mouse);
      float ripple = sin(d * 20.0 - uTime * 3.0) * 0.5 + 0.5;
      ripple *= smoothstep(0.5, 0.0, d);
      gl_FragColor = vec4(vec3(ripple), 1.0);
    }
  `;

  onMount(() => {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(canvas.offsetWidth, canvas.offsetHeight) },
    };

    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
    scene.add(new THREE.Mesh(geometry, material));

    const handleMouse = (e: MouseEvent) => {
      uniforms.uMouse.value.set(e.clientX, canvas.offsetHeight - e.clientY);
    };
    window.addEventListener('mousemove', handleMouse);

    const ro = new ResizeObserver(() => {
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false);
      uniforms.uResolution.value.set(canvas.offsetWidth, canvas.offsetHeight);
    });
    ro.observe(canvas);

    let animId: number;
    const tick = (t: number) => {
      uniforms.uTime.value = t * 0.001;
      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouse);
      ro.disconnect();
      renderer.dispose();
      material.dispose();
      geometry.dispose();
    };
  });
</script>

<canvas bind:this={canvas} style="width:100%;height:100%;display:block" />
```

## GPGPU / Ping-Pong for Particle Systems

Use two framebuffers alternately: read from one, write to the other.

```typescript
// src/lib/webgl/gpgpu.ts
export class PingPongBuffer {
  private fbos: WebGLFramebuffer[];
  private textures: WebGLTexture[];
  private current = 0;

  constructor(
    private gl: WebGL2RenderingContext,
    width: number,
    height: number
  ) {
    this.fbos = [gl.createFramebuffer()!, gl.createFramebuffer()!];
    this.textures = [
      this.createDataTexture(width, height),
      this.createDataTexture(width, height),
    ];
    this.fbos.forEach((fbo, i) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textures[i], 0);
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private createDataTexture(w: number, h: number): WebGLTexture {
    const { gl } = this;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, w, h, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }

  get readTexture() { return this.textures[this.current]; }
  get writeFBO() { return this.fbos[1 - this.current]; }
  swap() { this.current = 1 - this.current; }
}
```

## Reactive to Mouse, Scroll, Audio

### Mouse reactive uniform

```typescript
// Normalized device coordinates, smooth-tracked
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

window.addEventListener('mousemove', (e) => {
  mouse.targetX = (e.clientX / innerWidth) * 2 - 1;
  mouse.targetY = -(e.clientY / innerHeight) * 2 + 1;
});

// In animation loop — lerp for smooth follow
function tick() {
  mouse.x += (mouse.targetX - mouse.x) * 0.08;
  mouse.y += (mouse.targetY - mouse.y) * 0.08;
  uniforms.uMouse.value.set(mouse.x, mouse.y);
}
```

### Scroll-driven shader

```typescript
const scrollUniform = { value: 0 };

window.addEventListener('scroll', () => {
  const progress = scrollY / (document.body.scrollHeight - innerHeight);
  scrollUniform.value += (progress - scrollUniform.value) * 0.05;
}, { passive: true });
```

### Audio visualizer

```typescript
async function initAudio() {
  const ctx = new AudioContext();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);

  const data = new Uint8Array(analyser.frequencyBinCount);
  const texture = new THREE.DataTexture(data, analyser.frequencyBinCount, 1, THREE.RedFormat);

  return {
    update() {
      analyser.getByteFrequencyData(data);
      texture.needsUpdate = true;
    },
    texture,
  };
}
```

## Creative Coding Patterns

### Flow fields

```glsl
// In fragment shader
vec2 flowField(vec2 p, float t) {
  float angle = fbm(p * 2.0 + t * 0.1, 4) * 6.2831;
  return vec2(cos(angle), sin(angle));
}

// Trace particle position
vec2 pos = startPos;
for (int i = 0; i < 20; i++) {
  pos += flowField(pos, uTime) * 0.01;
  // accumulate into color buffer
}
```

### Voronoi

```glsl
vec2 voronoi(vec2 p) {
  vec2 n = floor(p);
  vec2 f = fract(p);
  float minDist = 8.0;
  vec2 minPoint = vec2(0.0);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = hash2(n + g); // random point in cell
      o = 0.5 + 0.5 * sin(uTime + 6.2831 * o);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < minDist) {
        minDist = d;
        minPoint = n + g + o;
      }
    }
  }
  return vec2(sqrt(minDist), minPoint.x + minPoint.y * 57.0);
}
```

### Reaction-diffusion (ping-pong GPGPU)

```glsl
// Update shader (runs on ping-pong FBO)
uniform sampler2D uPrevState; // RGBA: R=A concentration, G=B concentration
uniform vec2 uTexelSize;

void main() {
  vec2 uv = gl_FragCoord.xy * uTexelSize;
  vec4 center = texture(uPrevState, uv);

  // Laplacian
  vec4 lap =
    texture(uPrevState, uv + vec2( uTexelSize.x, 0)) +
    texture(uPrevState, uv + vec2(-uTexelSize.x, 0)) +
    texture(uPrevState, uv + vec2(0,  uTexelSize.y)) +
    texture(uPrevState, uv + vec2(0, -uTexelSize.y)) -
    4.0 * center;

  float A = center.r;
  float B = center.g;
  float feed = 0.055;
  float kill = 0.062;
  float dA = 1.0;
  float dB = 0.5;

  float reaction = A * B * B;
  float newA = A + (dA * lap.r - reaction + feed * (1.0 - A)) * 0.5;
  float newB = B + (dB * lap.g + reaction - (kill + feed) * B) * 0.5;

  fragColor = vec4(clamp(newA, 0.0, 1.0), clamp(newB, 0.0, 1.0), 0.0, 1.0);
}
```

## Performance Guidelines

### Draw call batching

```typescript
// Merge geometries where possible
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const merged = mergeGeometries(geometries);

// Use InstancedMesh for repeated objects
const mesh = new THREE.InstancedMesh(geometry, material, COUNT);
const matrix = new THREE.Matrix4();
for (let i = 0; i < COUNT; i++) {
  matrix.setPosition(positions[i]);
  mesh.setMatrixAt(i, matrix);
}
mesh.instanceMatrix.needsUpdate = true;
```

### Texture compression

```typescript
// Use KTX2 compressed textures
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
const loader = new KTX2Loader().setTranscoderPath('/basis/').detectSupport(renderer);
const texture = await loader.loadAsync('/textures/noise.ktx2');
```

### Pixel ratio cap

```typescript
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
```

### Dispose on unmount

```typescript
return () => {
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
  });
  renderer.dispose();
};
```

## Svelte 5 Integration

Always initialize WebGL inside `onMount` — never at module level (SSR safety):

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let { class: className = '' } = $props();

  onMount(() => {
    // WebGL setup here
    const cleanup = initWebGL(canvas);
    return cleanup; // Svelte calls this on component destroy
  });
</script>

<canvas bind:this={canvas} class={className} />
```

For Astro, use `client:only="svelte"` on WebGL components to avoid SSR:

```astro
<ShaderScene client:only="svelte" />
```
