import type { HatPoint } from './hatPhysics';

// Six rest joints precede the position/normal/color/rig triangle stream.
const VERTEX = `
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_color;
attribute vec2 a_rig;
uniform vec2 u_rest[6];
uniform vec2 u_joints[6];
uniform float u_bend[6];
varying vec3 v_normal;
varying vec3 v_color;
void main() {
  vec3 p = a_position;
  vec3 normal = a_normal;
  if (a_rig.x >= 0.0) {
    int bone = int(a_rig.x);
    float t = a_rig.y;
    vec2 center = mix(u_rest[bone], u_rest[bone + 1], t);
    float angle = mix(u_bend[bone], u_bend[bone + 1], t);
    mat2 rotation = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
    p.xy = mix(u_joints[bone], u_joints[bone + 1], t) + rotation * (p.xy - center);
    normal.xy = rotation * normal.xy;
  }
  float x = p.x * 0.97 + p.z * 0.24;
  float z = -p.x * 0.24 + p.z * 0.97;
  gl_Position = vec4((x - 0.4) * 0.70, (p.y - 0.05) * 0.95, -z * 0.3, 1.0);
  v_normal = normalize(vec3(normal.x * 0.97 + normal.z * 0.24,
    normal.y, -normal.x * 0.24 + normal.z * 0.97));
  v_color = a_color;
}`;

const FRAGMENT = `
precision mediump float;
varying vec3 v_normal;
varying vec3 v_color;
void main() {
  vec3 n = normalize(v_normal);
  float key = max(dot(n, normalize(vec3(-0.5, 0.8, 1.0))), 0.0);
  float rim = pow(1.0 - abs(n.z), 2.0) * 0.12;
  vec3 lit = v_color * (0.42 + key * 0.72) + vec3(0.13, 0.17, 0.20) * rim;
  gl_FragColor = vec4(pow(lit, vec3(1.0 / 2.2)), 1.0);
}`;

export interface HatRenderer {
  rest: HatPoint[];
  draw: (joints: HatPoint[]) => void;
  dispose: () => void;
}

export function createHatRenderer(
  canvas: HTMLCanvasElement,
  data: ArrayBuffer
): HatRenderer | null {
  const content = new Float32Array(data);
  if (
    content[0] !== 2026 ||
    content[1] !== 2 ||
    content[2] !== 6 ||
    (content.length - 15) % 11 !== 0
  )
    return null;
  const rest = Array.from({ length: 6 }, (_, i) => ({
    x: content[3 + i * 2],
    y: content[4 + i * 2],
  }));
  const vertices = content.subarray(15);
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
  });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  if (!program || !buffer) return null;

  const dispose = () => {
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    shaders.forEach((shader) => gl.deleteShader(shader));
  };
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX],
    [gl.FRAGMENT_SHADER, FRAGMENT],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) {
      dispose();
      return null;
    }
    shaders.push(shader);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      dispose();
      return null;
    }
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    dispose();
    return null;
  }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  for (const [index, name] of ['a_position', 'a_normal', 'a_color', 'a_rig'].entries()) {
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, index === 3 ? 2 : 3, gl.FLOAT, false, 44, index * 12);
  }
  const restUniform = gl.getUniformLocation(program, 'u_rest[0]');
  const jointUniform = gl.getUniformLocation(program, 'u_joints[0]');
  const bendUniform = gl.getUniformLocation(program, 'u_bend[0]');
  gl.uniform2fv(restUniform, new Float32Array(rest.flatMap((p) => [p.x, p.y])));
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);

  return {
    rest,
    draw(joints) {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(canvas.clientWidth * ratio);
      const height = Math.round(canvas.clientHeight * ratio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2fv(jointUniform, new Float32Array(joints.flatMap((p) => [p.x, p.y])));
      const turns = joints.map((p, i) => {
        if (!i) return 0;
        const angle =
          Math.atan2(p.y - joints[i - 1].y, p.x - joints[i - 1].x) -
          Math.atan2(rest[i].y - rest[i - 1].y, rest[i].x - rest[i - 1].x);
        return Math.atan2(Math.sin(angle), Math.cos(angle));
      });
      const bends = turns.map((turn, i) =>
        i < 2 ? 0 : i === 5 ? turn : (turn + turns[i + 1]) / 2
      );
      gl.uniform1fv(bendUniform, new Float32Array(bends));
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 11);
    },
    dispose,
  };
}

export function projectHatPoint(point: HatPoint, width: number, height: number): HatPoint {
  return {
    x: (((point.x * 0.97 - 0.4) * 0.7 + 1) * width) / 2,
    y: ((1 - (point.y - 0.05) * 0.95) * height) / 2,
  };
}

export function unprojectHatPoint(point: HatPoint, width: number, height: number): HatPoint {
  return {
    x: (((point.x / width) * 2 - 1) / 0.7 + 0.4) / 0.97,
    y: (1 - (point.y / height) * 2) / 0.95 + 0.05,
  };
}
