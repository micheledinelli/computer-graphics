precision mediump float;

varying vec3 v_position;
varying vec2 v_texCoord;
varying vec3 v_normal; 

uniform sampler2D u_sampler;

uniform vec3 lightPosition;

uniform float shininess;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float Ka;   // Ambient reflection coefficient
uniform float Kd;   // Diffuse reflection coefficient
uniform float Ks;   // Specular reflection coefficient

void main() {
  vec3 N = normalize(v_normal);
  vec3 L = normalize(lightPosition - v_position);

  // Lambert's cosine law
  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if(lambertian > 0.0) {
    // Reflected light vector
    vec3 R = reflect(-L, N); 
    
    // Vector to viewer
    vec3 V = normalize(-v_position); 
    
    // Compute the specular term
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, shininess);
  }

  vec4 texColor = texture2D(u_sampler, v_texCoord);
  vec3 effectiveDiffuse = diffuseColor * texColor.rgb;
  gl_FragColor = vec4(Ka * ambientColor +
                      Kd * lambertian * effectiveDiffuse +
                      Ks * specular * specularColor, 1.0);
}