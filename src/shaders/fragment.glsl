precision mediump float;

varying float vBrightness;

vec4 color = vec4(.0, .0, 1.0, 1.0);

void main() {
  // 40% ambient light, 60% diffuse light
  gl_FragColor = (color * 0.4) + (color * vBrightness * 0.6);
  gl_FragColor.a = 1.0;
}