/* script.js */

// ===== UTILIDADES =====
function initWebGL(canvas) {
  const gl = canvas.getContext('webgl');
  if (!gl) {
    alert('WebGL não suportado! Use Chrome ou Firefox.');
    return null;
  }
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.05, 0.05, 0.1, 1);
  return gl;
}

function createProgram(gl, vs, fs) {
  const p = gl.createProgram();
  const load = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader Error:', gl.getShaderInfoLog(s));
      return null;
    }
    gl.attachShader(p, s);
  };
  load(gl.VERTEX_SHADER, vs);
  load(gl.FRAGMENT_SHADER, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error('Link Error:', gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

// ===== DADOS DO CUBO =====
const cube = {
  pos: new Float32Array([
    -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
    -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1,
    -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
    -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,
    1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,
    -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1
  ]),
  col: new Float32Array([
    1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1,
    0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1,
    0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
    1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1,
    1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1,
    1, 0.5, 0, 1, 1, 0.5, 0, 1, 1, 0.5, 0, 1, 1, 0.5, 0, 1
  ]),
  idx: new Uint16Array([
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
  ]),
  uv: new Float32Array([
    0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1,
    0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1
  ])
};

// ===== 1. CUBO BÁSICO =====
const c1 = document.getElementById('glCanvasCubo');
const gl1 = initWebGL(c1);
if (gl1) {
  const prog = createProgram(gl1,
    `attribute vec3 aPos; attribute vec4 aCol;
     uniform mat4 uMV; uniform mat4 uP;
     varying vec4 vCol;
     void main() {
         gl_Position = uP * uMV * vec4(aPos, 1.0);
         vCol = aCol;
     }`,
    `precision mediump float;
     varying vec4 vCol;
     void main() {
         gl_FragColor = vCol;
     }`
  );
  if (prog) {
    gl1.useProgram(prog);

    const bp = gl1.createBuffer();
    gl1.bindBuffer(gl1.ARRAY_BUFFER, bp);
    gl1.bufferData(gl1.ARRAY_BUFFER, cube.pos, gl1.STATIC_DRAW);

    const bc = gl1.createBuffer();
    gl1.bindBuffer(gl1.ARRAY_BUFFER, bc);
    gl1.bufferData(gl1.ARRAY_BUFFER, cube.col, gl1.STATIC_DRAW);

    const bi = gl1.createBuffer();
    gl1.bindBuffer(gl1.ELEMENT_ARRAY_BUFFER, bi);
    gl1.bufferData(gl1.ELEMENT_ARRAY_BUFFER, cube.idx, gl1.STATIC_DRAW);

    const aPos = gl1.getAttribLocation(prog, 'aPos');
    const aCol = gl1.getAttribLocation(prog, 'aCol');
    const uMV = gl1.getUniformLocation(prog, 'uMV');
    const uP = gl1.getUniformLocation(prog, 'uP');

    let angle = 0;
    const draw = () => {
      gl1.clear(gl1.COLOR_BUFFER_BIT | gl1.DEPTH_BUFFER_BIT);

      const p = glMatrix.mat4.create();
      glMatrix.mat4.perspective(p, Math.PI / 4, c1.width / c1.height, 0.1, 100);

      const mv = glMatrix.mat4.create();
      glMatrix.mat4.translate(mv, mv, [0, 0, -6]);
      glMatrix.mat4.rotate(mv, mv, angle, [1, 1, 0]);

      gl1.bindBuffer(gl1.ARRAY_BUFFER, bp);
      gl1.vertexAttribPointer(aPos, 3, gl1.FLOAT, false, 0, 0);
      gl1.enableVertexAttribArray(aPos);

      gl1.bindBuffer(gl1.ARRAY_BUFFER, bc);
      gl1.vertexAttribPointer(aCol, 4, gl1.FLOAT, false, 0, 0);
      gl1.enableVertexAttribArray(aCol);

      gl1.bindBuffer(gl1.ELEMENT_ARRAY_BUFFER, bi);

      gl1.uniformMatrix4fv(uP, false, p);
      gl1.uniformMatrix4fv(uMV, false, mv);
      gl1.drawElements(gl1.TRIANGLES, cube.idx.length, gl1.UNSIGNED_SHORT, 0);

      angle += 0.01;
      requestAnimationFrame(draw);
    };
    draw();

    document.getElementById('btnResetCubo').onclick = () => angle = 0;
  }
}

// ===== 2. ESFERA ILUMINADA =====
const c2 = document.getElementById('glCanvasEsfera');
const gl2 = initWebGL(c2);
if (gl2) {
  const prog = createProgram(gl2,
    `attribute vec3 aPos; attribute vec3 aNorm;
     uniform mat4 uMV; uniform mat4 uP; uniform mat4 uNM;
     uniform vec3 uLight;
     varying vec3 vNorm; varying vec3 vPos;
     void main() {
         vec4 pos = uMV * vec4(aPos, 1.0);
         gl_Position = uP * pos;
         vPos = pos.xyz;
         vNorm = normalize((uNM * vec4(aNorm, 0.0)).xyz);
     }`,
    `precision mediump float;
     varying vec3 vNorm; varying vec3 vPos;
     uniform vec3 uLight;
     void main() {
         vec3 lightDir = normalize(uLight - vPos);
         float diff = max(dot(vNorm, lightDir), 0.0);
         vec3 color = mix(vec3(0.1, 0.1, 0.3), vec3(0.3, 0.7, 1.0), diff);
         gl_FragColor = vec4(color, 1.0);
     }`
  );
  if (prog) {
    gl2.useProgram(prog);

    const sphere = (function () {
      const pos = [], norm = [], idx = [];
      const r = 1.5, lat = 30, lon = 30;
      for (let i = 0; i <= lat; i++) {
        const phi = i * Math.PI / lat;
        for (let j = 0; j <= lon; j++) {
          const theta = j * 2 * Math.PI / lon;
          const x = r * Math.sin(phi) * Math.cos(theta);
          const y = r * Math.cos(phi);
          const z = r * Math.sin(phi) * Math.sin(theta);
          pos.push(x, y, z);
          norm.push(x / r, y / r, z / r);
        }
      }
      for (let i = 0; i < lat; i++) {
        for (let j = 0; j < lon; j++) {
          const a = i * (lon + 1) + j;
          const b = a + lon + 1;
          idx.push(a, b, a + 1, a + 1, b, b + 1);
        }
      }
      return { pos: new Float32Array(pos), norm: new Float32Array(norm), idx: new Uint16Array(idx) };
    })();

    const bp = gl2.createBuffer(); gl2.bindBuffer(gl2.ARRAY_BUFFER, bp); gl2.bufferData(gl2.ARRAY_BUFFER, sphere.pos, gl2.STATIC_DRAW);
    const bn = gl2.createBuffer(); gl2.bindBuffer(gl2.ARRAY_BUFFER, bn); gl2.bufferData(gl2.ARRAY_BUFFER, sphere.norm, gl2.STATIC_DRAW);
    const bi = gl2.createBuffer(); gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, bi); gl2.bufferData(gl2.ELEMENT_ARRAY_BUFFER, sphere.idx, gl2.STATIC_DRAW);

    const aPos = gl2.getAttribLocation(prog, 'aPos');
    const aNorm = gl2.getAttribLocation(prog, 'aNorm');
    const uMV = gl2.getUniformLocation(prog, 'uMV');
    const uP = gl2.getUniformLocation(prog, 'uP');
    const uNM = gl2.getUniformLocation(prog, 'uNM');
    const uLight = gl2.getUniformLocation(prog, 'uLight');

    let light = [3, 5, 7];
    ['luzX', 'luzY', 'luzZ'].forEach((id, i) => {
      document.getElementById(id).oninput = e => light[i] = +e.target.value;
    });

    const draw = () => {
      gl2.clear(gl2.COLOR_BUFFER_BIT | gl2.DEPTH_BUFFER_BIT);

      const p = glMatrix.mat4.create();
      glMatrix.mat4.perspective(p, Math.PI / 4, c2.width / c2.height, 0.1, 100);

      const mv = glMatrix.mat4.create();
      glMatrix.mat4.translate(mv, mv, [0, 0, -6]);
      glMatrix.mat4.rotate(mv, mv, Date.now() / 3000, [0, 1, 0]);

      const nm = glMatrix.mat4.create();
      glMatrix.mat4.invert(nm, mv);
      glMatrix.mat4.transpose(nm, nm);

      gl2.bindBuffer(gl2.ARRAY_BUFFER, bp); gl2.vertexAttribPointer(aPos, 3, gl2.FLOAT, false, 0, 0); gl2.enableVertexAttribArray(aPos);
      gl2.bindBuffer(gl2.ARRAY_BUFFER, bn); gl2.vertexAttribPointer(aNorm, 3, gl2.FLOAT, false, 0, 0); gl2.enableVertexAttribArray(aNorm);
      gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, bi);

      gl2.uniformMatrix4fv(uP, false, p);
      gl2.uniformMatrix4fv(uMV, false, mv);
      gl2.uniformMatrix4fv(uNM, false, nm);
      gl2.uniform3fv(uLight, light);
      gl2.drawElements(gl2.TRIANGLES, sphere.idx.length, gl2.UNSIGNED_SHORT, 0);

      requestAnimationFrame(draw);
    };
    draw();
  }
}

// ===== 3. CUBO COM TEXTURA =====
const c3 = document.getElementById('glCanvasTextura');
const gl3 = initWebGL(c3);
if (gl3) {
  const prog = createProgram(gl3,
    `attribute vec3 aPos; attribute vec2 aUV;
     uniform mat4 uMV; uniform mat4 uP;
     varying vec2 vUV;
     void main() {
         gl_Position = uP * uMV * vec4(aPos, 1.0);
         vUV = aUV;
     }`,
    `precision mediump float;
     varying vec2 vUV;
     uniform sampler2D uTex;
     void main() {
         gl_FragColor = texture2D(uTex, vUV);
     }`
  );
  if (prog) {
    gl3.useProgram(prog);

    const size = 64;
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const x = i % size, y = (i / size) | 0;
      const n = Math.sin(x * 0.1) * Math.sin(y * 0.1) * 0.5 + 0.5;
      const w = 100 + n * 80;
      data[i * 4] = w; data[i * 4 + 1] = w * 0.7; data[i * 4 + 2] = w * 0.4; data[i * 4 + 3] = 255;
    }
    const tex = gl3.createTexture();
    gl3.bindTexture(gl3.TEXTURE_2D, tex);
    gl3.texImage2D(gl3.TEXTURE_2D, 0, gl3.RGBA, size, size, 0, gl3.RGBA, gl3.UNSIGNED_BYTE, data);
    gl3.generateMipmap(gl3.TEXTURE_2D);

    const bp = gl3.createBuffer(); gl3.bindBuffer(gl3.ARRAY_BUFFER, bp); gl3.bufferData(gl3.ARRAY_BUFFER, cube.pos, gl3.STATIC_DRAW);
    const buv = gl3.createBuffer(); gl3.bindBuffer(gl3.ARRAY_BUFFER, buv); gl3.bufferData(gl3.ARRAY_BUFFER, cube.uv, gl3.STATIC_DRAW);
    const bi = gl3.createBuffer(); gl3.bindBuffer(gl3.ELEMENT_ARRAY_BUFFER, bi); gl3.bufferData(gl3.ELEMENT_ARRAY_BUFFER, cube.idx, gl3.STATIC_DRAW);

    const aPos = gl3.getAttribLocation(prog, 'aPos');
    const aUV = gl3.getAttribLocation(prog, 'aUV');
    const uMV = gl3.getUniformLocation(prog, 'uMV');
    const uP = gl3.getUniformLocation(prog, 'uP');

    let angle = 0;
    const draw = () => {
      gl3.clear(gl3.COLOR_BUFFER_BIT | gl3.DEPTH_BUFFER_BIT);

      const p = glMatrix.mat4.create();
      glMatrix.mat4.perspective(p, Math.PI / 4, c3.width / c3.height, 0.1, 100);

      const mv = glMatrix.mat4.create();
      glMatrix.mat4.translate(mv, mv, [0, 0, -6]);
      glMatrix.mat4.rotate(mv, mv, angle, [1, 1, 0]);

      gl3.bindBuffer(gl3.ARRAY_BUFFER, bp); gl3.vertexAttribPointer(aPos, 3, gl3.FLOAT, false, 0, 0); gl3.enableVertexAttribArray(aPos);
      gl3.bindBuffer(gl3.ARRAY_BUFFER, buv); gl3.vertexAttribPointer(aUV, 2, gl3.FLOAT, false, 0, 0); gl3.enableVertexAttribArray(aUV);
      gl3.bindBuffer(gl3.ELEMENT_ARRAY_BUFFER, bi);

      gl3.uniformMatrix4fv(uP, false, p);
      gl3.uniformMatrix4fv(uMV, false, mv);
      gl3.drawElements(gl3.TRIANGLES, cube.idx.length, gl3.UNSIGNED_SHORT, 0);

      angle += 0.01;
      requestAnimationFrame(draw);
    };
    draw();
  }
}



// ===== 4. ANIMAÇÃO (CUBO COM LUZ PULSANTE) =====
const c4 = document.getElementById('glCanvasAnimacao');
const gl4 = initWebGL(c4);
if (gl4) {
  const prog = createProgram(gl4,
    `attribute vec3 aPos; attribute vec3 aNorm;
     uniform mat4 uMV; uniform mat4 uP; uniform mat4 uNM;
     uniform vec3 uLightPos;
     varying vec3 vPos; varying vec3 vNorm;
     void main() {
         vec4 pos = uMV * vec4(aPos, 1.0);
         gl_Position = uP * pos;
         vPos = pos.xyz;
         vNorm = normalize((uNM * vec4(aNorm, 0.0)).xyz);
     }`,
    `precision mediump float;
     varying vec3 vPos; varying vec3 vNorm;
     uniform vec3 uLightPos;
     uniform float uTime;  // <--- AQUI ESTAVA FALTANDO!
     void main() {
         vec3 lightDir = normalize(uLightPos - vPos);
         float diff = max(dot(vNorm, lightDir), 0.0);
         float pulse = 0.5 + 0.5 * sin(uTime * 3.0);
         vec3 baseColor = vec3(0.9, 0.3, 0.3);
         vec3 color = baseColor * (diff * pulse + 0.3);
         gl_FragColor = vec4(color, 1.0);
     }`
  );
  if (prog) {
    gl4.useProgram(prog);

    // === CALCULAR NORMAIS (por vértice, acumulando por face) ===
    const normals = new Float32Array(cube.pos.length);
    for (let i = 0; i < cube.idx.length; i += 3) {
      const i0 = cube.idx[i], i1 = cube.idx[i + 1], i2 = cube.idx[i + 2];
      const p0 = [cube.pos[i0 * 3], cube.pos[i0 * 3 + 1], cube.pos[i0 * 3 + 2]];
      const p1 = [cube.pos[i1 * 3], cube.pos[i1 * 3 + 1], cube.pos[i1 * 3 + 2]];
      const p2 = [cube.pos[i2 * 3], cube.pos[i2 * 3 + 1], cube.pos[i2 * 3 + 2]];
      const v1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
      const v2 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
      const n = [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
      ];
      const len = Math.hypot(n[0], n[1], n[2]) || 1;
      const normal = [n[0] / len, n[1] / len, n[2] / len];
      for (const idx of [i0, i1, i2]) {
        normals[idx * 3] += normal[0];
        normals[idx * 3 + 1] += normal[1];
        normals[idx * 3 + 2] += normal[2];
      }
    }
    // Normalizar
    for (let i = 0; i < normals.length; i += 3) {
      const len = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
      normals[i] /= len; normals[i + 1] /= len; normals[i + 2] /= len;
    }

    const bp = gl4.createBuffer(); gl4.bindBuffer(gl4.ARRAY_BUFFER, bp); gl4.bufferData(gl4.ARRAY_BUFFER, cube.pos, gl4.STATIC_DRAW);
    const bn = gl4.createBuffer(); gl4.bindBuffer(gl4.ARRAY_BUFFER, bn); gl4.bufferData(gl4.ARRAY_BUFFER, normals, gl4.STATIC_DRAW);
    const bi = gl4.createBuffer(); gl4.bindBuffer(gl4.ELEMENT_ARRAY_BUFFER, bi); gl4.bufferData(gl4.ELEMENT_ARRAY_BUFFER, cube.idx, gl4.STATIC_DRAW);

    const aPos = gl4.getAttribLocation(prog, 'aPos');
    const aNorm = gl4.getAttribLocation(prog, 'aNorm');
    const uMV = gl4.getUniformLocation(prog, 'uMV');
    const uP = gl4.getUniformLocation(prog, 'uP');
    const uNM = gl4.getUniformLocation(prog, 'uNM');
    const uLightPos = gl4.getUniformLocation(prog, 'uLightPos');
    const uTime = gl4.getUniformLocation(prog, 'uTime');

    let startTime = performance.now();
    let animPaused = false;  // <--- VARIÁVEL LOCAL

    document.getElementById('btnPausar').onclick = () => {
      animPaused = !animPaused;
      document.getElementById('btnPausar').textContent = animPaused ? 'Continuar' : 'Pausar';
      if (!animPaused) draw();
    };

    const draw = () => {
      if (animPaused) {
        requestAnimationFrame(draw);
        return;
      }

      gl4.clear(gl4.COLOR_BUFFER_BIT | gl4.DEPTH_BUFFER_BIT);

      const p = glMatrix.mat4.create();
      glMatrix.mat4.perspective(p, Math.PI / 4, c4.width / c4.height, 0.1, 100);

      const mv = glMatrix.mat4.create();
      glMatrix.mat4.translate(mv, mv, [0, 0, -6]);
      glMatrix.mat4.rotate(mv, mv, performance.now() / 2000, [1, 1, 0]);

      const nm = glMatrix.mat4.create();
      glMatrix.mat4.invert(nm, mv);
      glMatrix.mat4.transpose(nm, nm);

      gl4.bindBuffer(gl4.ARRAY_BUFFER, bp); gl4.vertexAttribPointer(aPos, 3, gl4.FLOAT, false, 0, 0); gl4.enableVertexAttribArray(aPos);
      gl4.bindBuffer(gl4.ARRAY_BUFFER, bn); gl4.vertexAttribPointer(aNorm, 3, gl4.FLOAT, false, 0, 0); gl4.enableVertexAttribArray(aNorm);
      gl4.bindBuffer(gl4.ELEMENT_ARRAY_BUFFER, bi);

      gl4.uniformMatrix4fv(uP, false, p);
      gl4.uniformMatrix4fv(uMV, false, mv);
      gl4.uniformMatrix4fv(uNM, false, nm);
      gl4.uniform3fv(uLightPos, [3, 3, 5]);
      gl4.uniform1f(uTime, (performance.now() - startTime) / 1000);

      gl4.drawElements(gl4.TRIANGLES, cube.idx.length, gl4.UNSIGNED_SHORT, 0);

      requestAnimationFrame(draw);
    };
    draw();
  }
}


// ===== 5. INTERATIVO (MOUSE) =====
const c5 = document.getElementById('glCanvasInterativo');
const gl5 = initWebGL(c5);
if (gl5) {
  let isDragging = false, lastX = 0, lastY = 0, rotX = 0, rotY = 0;
  let color = [1, 0.3, 0.7, 1];

  c5.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
  c5.addEventListener('mousemove', e => {
    if (isDragging) {
      rotY += (e.clientX - lastX) * 0.01;
      rotX += (e.clientY - lastY) * 0.01;
      lastX = e.clientX; lastY = e.clientY;
    }
  });
  c5.addEventListener('mouseup', () => isDragging = false);
  c5.addEventListener('mouseleave', () => isDragging = false);
  c5.addEventListener('click', () => color = [Math.random(), Math.random(), Math.random(), 1]);

  const prog = createProgram(gl5,
    `attribute vec3 aPos;
     uniform mat4 uMV; uniform mat4 uP;
     uniform vec4 uColor;
     void main() {
         gl_Position = uP * uMV * vec4(aPos, 1.0);
     }`,
    `precision mediump float;
     uniform vec4 uColor;
     void main() {
         gl_FragColor = uColor;
     }`
  );
  if (prog) {
    gl5.useProgram(prog);

    const bp = gl5.createBuffer(); gl5.bindBuffer(gl5.ARRAY_BUFFER, bp); gl5.bufferData(gl5.ARRAY_BUFFER, cube.pos, gl5.STATIC_DRAW);
    const bi = gl5.createBuffer(); gl5.bindBuffer(gl5.ELEMENT_ARRAY_BUFFER, bi); gl5.bufferData(gl5.ELEMENT_ARRAY_BUFFER, cube.idx, gl5.STATIC_DRAW);

    const aPos = gl5.getAttribLocation(prog, 'aPos');
    const uMV = gl5.getUniformLocation(prog, 'uMV');
    const uP = gl5.getUniformLocation(prog, 'uP');
    const uColor = gl5.getUniformLocation(prog, 'uColor');

    const draw = () => {
      gl5.clear(gl5.COLOR_BUFFER_BIT | gl5.DEPTH_BUFFER_BIT);

      const p = glMatrix.mat4.create();
      glMatrix.mat4.perspective(p, Math.PI / 4, c5.width / c5.height, 0.1, 100);

      const mv = glMatrix.mat4.create();
      glMatrix.mat4.translate(mv, mv, [0, 0, -6]);
      glMatrix.mat4.rotateX(mv, mv, rotX);
      glMatrix.mat4.rotateY(mv, mv, rotY);

      gl5.bindBuffer(gl5.ARRAY_BUFFER, bp); gl5.vertexAttribPointer(aPos, 3, gl5.FLOAT, false, 0, 0); gl5.enableVertexAttribArray(aPos);
      gl5.bindBuffer(gl5.ELEMENT_ARRAY_BUFFER, bi);

      gl5.uniformMatrix4fv(uP, false, p);
      gl5.uniformMatrix4fv(uMV, false, mv);
      gl5.uniform4fv(uColor, color);
      gl5.drawElements(gl5.TRIANGLES, cube.idx.length, gl5.UNSIGNED_SHORT, 0);

      requestAnimationFrame(draw);
    };
    draw();
  }
}

console.log("TODOS OS 5 EXEMPLOS FUNCIONANDO COM glMatrix.mat4!");



