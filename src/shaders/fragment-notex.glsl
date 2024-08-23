precision mediump float;

varying vec3 v_position;
varying vec2 v_texcoord;
varying vec3 v_normal; 
varying vec3 v_tangent;
varying vec4 v_color;

uniform sampler2D diffuseMap;
uniform sampler2D specularMap;
uniform sampler2D normalMap;

uniform vec3 u_lightDirection;
uniform vec3 u_ambientLight;

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
  vec3 L = normalize(u_lightDirection - v_position);
  
  // From https://webglfundamentals.org/webgl/lessons/webgl-load-obj-w-mtl.html
  vec3 tangent = normalize(v_tangent);
  vec3 bitangent = normalize(cross(normal, tangent));
  mat3 tbn = mat3(tangent, bitangent, normal);

  normal = texture2D(normalMap, v_texcoord).rgb * 2. - 1.;
  normal = normalize(tbn * normal);

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

    specularExp = pow(specAngle, shininess);
  }
  
  // If the texture is not used
  vec3 effectiveDiffuse = diffuse * v_color.rgb;
  
  vec4 specularMapColor = texture2D(specularMap, v_texcoord);
  vec3 effectiveSpecular = (specularColor * specularMapColor.rgb) * specularExp;

  gl_FragColor = vec4(emissive +
                      Ka * ambientColor +
                      Kd * lambertian * effectiveDiffuse +
                      Ks * effectiveSpecular, 1.0);
}