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
uniform vec3 u_ambientLight;

uniform float shininess;

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

void main() {
  vec3 normal = normalize(v_normal);
  vec3 L = normalize(u_lightPosition - v_position);
  
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

  // If the texture is used
  vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord);
  vec3 effectiveDiffuse = diffuseColor * diffuseMapColor.rgb;
  
  // If the texture is not used
  // vec3 effectiveDiffuse = diffuse * v_color.rgb;
  
  vec4 specularMapColor = texture2D(specularMap, v_texcoord);
  vec3 effectiveSpecular = (specularColor * specularMapColor.rgb) * specularExp;

  // More appealing but fake 
  // float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
  // gl_FragColor = vec4(emissive + 
  //                     ambientColor * u_ambientLight +
  //                     effectiveDiffuse * fakeLight +
  //                     effectiveSpecular * specular,
  //                     1.0);

  gl_FragColor = vec4(emissive +
                      Ka * ambientColor +
                      Kd * lambertian * effectiveDiffuse +
                      Ks * effectiveSpecular, 1.0);
}