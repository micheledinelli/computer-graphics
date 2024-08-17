precision mediump float;

varying float v_brightness;
varying vec2 v_texCoord;

vec4 color = vec4(1.0, .0, .0, 1.0);

uniform sampler2D u_sampler;

void main() {
  // 40% ambient light, 60% diffuse light
  // gl_FragColor = (color * 0.4) + (color * v_brightness * 0.6);
  // gl_FragColor.a = 1.0;
  // vec4 texColor = texture2D(u_sampler, v_texCoord);
  // gl_FragColor.a = 1.0;
  vec4 texColor = texture2D(u_sampler, v_texCoord);
  // gl_FragColor = color;
  gl_FragColor = (texColor * 0.4) + (texColor * 0.6 * v_brightness);
  gl_FragColor.a = 1.0;
}