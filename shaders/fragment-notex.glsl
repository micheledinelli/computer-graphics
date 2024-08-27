precision mediump float;

varying vec3 v_position;
varying vec2 v_texcoord;
varying vec3 v_normal; 
varying vec3 v_tangent;
varying vec4 v_color;

uniform sampler2D diffuseMap;
uniform sampler2D specularMap;
uniform sampler2D normalMap;

uniform vec3 u_lightPosition;
uniform float u_lightIntensity;
uniform float u_attenuationFactor;

uniform float u_shininess;

uniform float shininess;
uniform vec3 emissive;
uniform vec3 ambient;
uniform vec3 diffuse;
uniform vec3 specular;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float Ka;   // Ambient reflection coefficient
uniform float Kd;   // Diffuse reflection coefficient
uniform float Ks;   // Specular reflection coefficient

void main() {
  vec3 normal = normalize(v_normal);
  vec3 lightDir = u_lightPosition - v_position;
  float distance = length(lightDir);
  vec3 L = normalize(lightDir);
  
  // Light attenuation
  float attenuation = 1.0 / (1.0 + u_attenuationFactor * distance * distance);

  // From http://www.cs.toronto.edu/~jacobson/phong-demo/ Phong shading
  // Lambert's cosine law
  float lambertian = max(dot(normal, L), 0.0);
  float specularExp = 0.0;
  if(lambertian > 0.0) {
    // Reflected light vector
    vec3 R = reflect(-L, normal); 
    
    // Vector to viewer
    vec3 V = normalize(-v_position); 
    
    // Compute the specular term
    float specAngle = max(dot(R, V), 0.0);

    specularExp = pow(specAngle, u_shininess);
  }
  
  vec3 effectiveDiffuse = diffuse * v_color.rgb * diffuseColor;
  vec3 effectiveAmbient = ambient * ambientColor;
  vec3 effectiveSpecular = (specularColor * specular) * specularExp;

  vec3 attenuatedDiffuse = lambertian * effectiveDiffuse * attenuation * u_lightIntensity;
  vec3 attenuatedSpecular = effectiveSpecular * attenuation * u_lightIntensity;

  gl_FragColor = vec4(emissive +
                      Ka * effectiveAmbient +
                      Kd * attenuatedDiffuse +
                      Ks * attenuatedSpecular, 1.0);
}