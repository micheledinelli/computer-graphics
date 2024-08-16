precision mediump float;

varying float v_brightness;
varying vec2 v_texCoord;

vec4 color = vec4(.2, .2, .2, 1.0);

uniform sampler2D u_sampler;

void main() {
  // 40% ambient light, 60% diffuse light
  // gl_FragColor = (color * 0.4) + (color * v_brightness * 0.6);
  // gl_FragColor.a = 1.0;
  // gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
  gl_FragColor = texture2D(u_sampler, v_texCoord);
}