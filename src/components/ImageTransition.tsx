import { useEffect, useRef } from 'react';

interface ImageTransitionProps {
  from: string;
  to: string;
  onComplete: () => void;
  onFallback: () => void;
}

const vertexShaderSource = `
  attribute vec2 aPosition;
  attribute vec2 aUv;
  varying vec2 vUv;
  void main() {
    vUv = aUv;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform vec2 uResolution;
  uniform float uFromAspect;
  uniform float uToAspect;
  uniform float uProgress;
  uniform float uTime;

  vec2 containUv(vec2 uv, float imageAspect, out float inside) {
    float viewportAspect = uResolution.x / uResolution.y;
    vec2 sampleUv = uv;
    if (imageAspect > viewportAspect) {
      float scale = viewportAspect / imageAspect;
      sampleUv.y = (uv.y - 0.5) / scale + 0.5;
    } else {
      float scale = imageAspect / viewportAspect;
      sampleUv.x = (uv.x - 0.5) / scale + 0.5;
    }
    inside = step(0.0, sampleUv.x) * step(sampleUv.x, 1.0) * step(0.0, sampleUv.y) * step(sampleUv.y, 1.0);
    return clamp(sampleUv, 0.0, 1.0);
  }

  void main() {
    float wave = sin(vUv.y * 10.0 + uTime) * 0.014 + sin(vUv.y * 28.0 - uTime * 1.5) * 0.004;
    float distortion = sin(3.14159 * uProgress) * 0.018;
    float fromInside;
    float toInside;
    vec2 fromUv = containUv(vUv + vec2(wave * distortion, 0.0), uFromAspect, fromInside);
    vec2 toUv = containUv(vUv - vec2(wave * distortion, 0.0), uToAspect, toInside);
    vec4 fromColor = texture2D(uFrom, fromUv);
    vec4 toColor = texture2D(uTo, toUv);
    fromColor.a *= fromInside;
    toColor.a *= toInside;
    float reveal = 1.0 - smoothstep(uProgress - 0.075, uProgress + 0.075, vUv.x + wave);
    vec4 color = mix(fromColor, toColor, reveal);
    float shadow = 1.0 - 0.2 * exp(-pow((vUv.x - uProgress - wave) * 45.0, 2.0)) * sin(3.14159 * uProgress);
    gl_FragColor = vec4(color.rgb * shadow, color.a);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Could not create transition shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'Shader compile failed';
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load transition image'));
    image.src = src;
  });
}

/** A brief liquid wipe for a single selected gallery change; callers own device fallbacks. */
export function ImageTransition({ from, to, onComplete, onFallback }: ImageTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let animationFrame = 0;
    let cancelled = false;
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    const textures: WebGLTexture[] = [];
    const shaders: WebGLShader[] = [];
    let gl: WebGLRenderingContext | null = null;

    const cleanup = () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      if (!gl) return;
      textures.forEach((texture) => gl?.deleteTexture(texture));
      shaders.forEach((shader) => gl?.deleteShader(shader));
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
    };

    const setup = async () => {
      try {
        const [fromImage, toImage] = await Promise.all([loadImage(from), loadImage(to)]);
        if (cancelled) return;
        gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' });
        if (!gl) throw new Error('WebGL is not available');

        const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        shaders.push(vertexShader);
        const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        shaders.push(fragmentShader);
        program = gl.createProgram();
        if (!program) throw new Error('Could not create transition program');
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        shaders.length = 0;
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'Program link failed');

        buffer = gl.createBuffer();
        if (!buffer) throw new Error('Could not create transition geometry');
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
          -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1,
          -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1, 1,
        ]), gl.STATIC_DRAW);

        const position = gl.getAttribLocation(program, 'aPosition');
        const uv = gl.getAttribLocation(program, 'aUv');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(uv);
        gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 16, 8);

        const createTexture = (image: HTMLImageElement) => {
          const texture = gl!.createTexture();
          if (!texture) throw new Error('Could not create transition texture');
          gl!.bindTexture(gl!.TEXTURE_2D, texture);
          gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, 1);
          gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
          gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
          gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
          gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
          gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, image);
          textures.push(texture);
          return texture;
        };
        const fromTexture = createTexture(fromImage);
        const toTexture = createTexture(toImage);

        const bounds = canvas.getBoundingClientRect();
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
        canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
        canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, fromTexture);
        gl.uniform1i(gl.getUniformLocation(program, 'uFrom'), 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, toTexture);
        gl.uniform1i(gl.getUniformLocation(program, 'uTo'), 1);
        gl.uniform2f(gl.getUniformLocation(program, 'uResolution'), canvas.width, canvas.height);
        gl.uniform1f(gl.getUniformLocation(program, 'uFromAspect'), fromImage.naturalWidth / fromImage.naturalHeight);
        gl.uniform1f(gl.getUniformLocation(program, 'uToAspect'), toImage.naturalWidth / toImage.naturalHeight);

        const startTime = performance.now();
        const duration = 920;
        const render = (time: number) => {
          if (cancelled || !gl || !program) return;
          const linearProgress = Math.min((time - startTime) / duration, 1);
          const progress = linearProgress * linearProgress * (3 - 2 * linearProgress);
          gl.uniform1f(gl.getUniformLocation(program, 'uProgress'), progress);
          gl.uniform1f(gl.getUniformLocation(program, 'uTime'), (time - startTime) * 0.001);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          if (linearProgress < 1) animationFrame = window.requestAnimationFrame(render);
          else onComplete();
        };
        animationFrame = window.requestAnimationFrame(render);
      } catch {
        if (!cancelled) onFallback();
      }
    };

    void setup();
    return cleanup;
  }, [from, onComplete, onFallback, to]);

  return <canvas ref={canvasRef} className="lightbox__transition-canvas" aria-hidden="true" />;
}
