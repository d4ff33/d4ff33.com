const vertexShaderSource = `
attribute vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform vec2 resolution;
uniform float time;

// Random function
vec2 random2(vec2 st) {
    st = vec2(dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)));
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

// Enhanced rainbow color function
vec3 rainbow(float t) {
    vec3 color = vec3(0.0);
    color.r = 0.5 + 0.5 * sin(3.14159 * 2.0 * (t + 0.0));
    color.g = 0.5 + 0.5 * sin(3.14159 * 2.0 * (t + 0.33));
    color.b = 0.5 + 0.5 * sin(3.14159 * 2.0 * (t + 0.67));
    color = pow(color, vec3(0.85));
    return color;
}

// Spiral function
float spiral(vec2 uv, float armCount, float rotation) {
    float r = length(uv);
    float theta = atan(uv.y, uv.x);
    
    // Create spiral arms
    float spiral = sin(theta * armCount + r * 10.0 - rotation);
    spiral = abs(spiral);
    spiral = 1.0 - pow(spiral, 0.3); // Sharpen spiral arms
    
    // Add distance falloff
    spiral *= exp(-r * 3.0);
    
    return spiral;
}

// Star glow
float star(vec2 uv, float size) {
    float d = length(uv);
    float brightness = exp(-d * d * 50.0 * size);
    return brightness;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
    vec3 color = vec3(0.0);
    
    // Spiral galaxy parameters
    float rotation = time * 0.2;
    float armCount = 3.0;
    
    // Create main spiral arms
    float mainSpiral = spiral(uv, armCount, rotation);
    vec3 spiralColor = rainbow(length(uv) - time * 0.1);
    color += mainSpiral * spiralColor;
    
    // Add stars
    for(float i = 0.0; i < 3.0; i++) {
        vec2 grid = fract(uv * (8.0 + i * 15.0)) - 0.5;
        vec2 id = floor(uv * (8.0 + i * 15.0));
        
        vec2 r = random2(id);
        float size = fract(r.x * 345.32);
        
        if(size > 0.97) {
            float twinkle = sin(time * (1.0 + r.y * 2.0)) * 0.5 + 0.5;
            float starBrightness = star(grid, 1.0 + i * 0.3) * size * twinkle;
            
            // Add spinning motion to stars
            vec2 spinUV = uv;
            float angle = time * 0.5;
            float dist = length(spinUV);
            float spin = atan(spinUV.y, spinUV.x) + angle * (1.0 - dist);
            spinUV = vec2(cos(spin), sin(spin)) * dist;
            
            vec3 starColor = rainbow(r.x + time * 0.1);
            color += starColor * starBrightness * 0.5;
        }
    }
    
    // Add center glow
    float centerGlow = star(uv, 0.5);
    color += centerGlow * rainbow(time * 0.1) * 2.0;
    
    // Color adjustments
    color = pow(color, vec3(0.8));
    color *= 1.2; // Brightness boost
    
    gl_FragColor = vec4(color, 1.0);
}
`;

class GalaxySpiral {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "fixed";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.zIndex = "-1";

    document.body.insertBefore(this.canvas, document.body.firstChild);

    this.gl = this.canvas.getContext("webgl", {
      antialias: true,
      alpha: false,
    });

    if (!this.gl) {
      console.error("WebGL not supported");
      return;
    }

    this.init();
  }

  init() {
    const vertexShader = this.createShader(
      this.gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.createShader(
      this.gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error(
        "Shader program error:",
        this.gl.getProgramInfoLog(this.program)
      );
      return;
    }

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    this.positionLocation = this.gl.getAttribLocation(this.program, "position");
    this.resolutionLocation = this.gl.getUniformLocation(
      this.program,
      "resolution"
    );
    this.timeLocation = this.gl.getUniformLocation(this.program, "time");

    this.startTime = Date.now();

    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.render();
  }

  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  resize() {
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;

    if (
      this.canvas.width !== displayWidth ||
      this.canvas.height !== displayHeight
    ) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  render() {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.useProgram(this.program);

    this.gl.uniform2f(
      this.resolutionLocation,
      this.canvas.width,
      this.canvas.height
    );
    this.gl.uniform1f(this.timeLocation, (Date.now() - this.startTime) / 1000);

    this.gl.enableVertexAttribArray(this.positionLocation);
    this.gl.vertexAttribPointer(
      this.positionLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(() => this.render());
  }
}

export default GalaxySpiral;
