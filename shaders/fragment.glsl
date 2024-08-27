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

uniform float shininess; // Set by the parser 
uniform vec3 emissive; // Set by the parser
uniform vec3 ambient; // Set by the parser
uniform vec3 diffuse; // Set by the parser
uniform vec3 specular; // Set by the parser

uniform vec3 ambientColor; // Set as shared uniform
uniform vec3 diffuseColor; // Set as shared uniform
uniform vec3 specularColor; // Set as shared uniform
uniform float Ka;   // Ambient reflection coefficient
uniform float Kd;   // Diffuse reflection coefficient
uniform float Ks;   // Specular reflection coefficient

uniform int u_bumpEnabled; // Flag to enable bump mapping

void main() {
  vec3 normal = normalize(v_normal);
  vec3 lightDir = u_lightPosition - v_position;
  float distance = length(lightDir);
  vec3 L = normalize(lightDir);
  
  // Light attenuation
  float attenuation = 1.0 / (1.0 + u_attenuationFactor * distance * distance);

  // From https://webglfundamentals.org/webgl/lessons/webgl-load-obj-w-mtl.html
  if (u_bumpEnabled == 1) {
    vec3 tangent = normalize(v_tangent);
    vec3 bitangent = normalize(cross(normal, tangent));
    mat3 tbn = mat3(tangent, bitangent, normal);

    normal = texture2D(normalMap, v_texcoord).rgb * 2. - 1.;
    normal = normalize(tbn * normal);
  }

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

  vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord);
  vec3 effectiveDiffuse = diffuseColor * diffuseMapColor.rgb;
  
  vec4 specularMapColor = texture2D(specularMap, v_texcoord);
  vec3 effectiveSpecular = (specularColor * specularMapColor.rgb) * specularExp;

  // Apply attenuation to diffuse and specular components
  vec3 attenuatedDiffuse = lambertian * effectiveDiffuse * attenuation * u_lightIntensity;
  vec3 attenuatedSpecular = effectiveSpecular * attenuation * u_lightIntensity;

  gl_FragColor = vec4(emissive +
                      Ka * ambientColor +
                      Kd * attenuatedDiffuse +
                      Ks * attenuatedSpecular, 1.0);
}