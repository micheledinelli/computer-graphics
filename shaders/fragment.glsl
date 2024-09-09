precision mediump float;

varying vec3 v_position;
varying vec2 v_texcoord;
varying vec3 v_normal; 
varying vec3 v_tangent;
varying vec4 v_color;
varying vec4 v_projectedTexcoord;

uniform sampler2D diffuseMap;
uniform sampler2D specularMap;
uniform sampler2D normalMap;

uniform vec3 u_lightPosition;
uniform float u_lightIntensity;
uniform float u_attenuationFactor; 
uniform sampler2D u_projectedTexture;

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
uniform int u_shadowMapEnabled; // Flag to enable shadow mapping
uniform float u_bias; // Shadow mapping bias
uniform vec3 u_reverseLightDir;

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

  vec4 finalColor = vec4(emissive +
                      Ka * ambientColor +
                      Kd * attenuatedDiffuse +
                      Ks * attenuatedSpecular, 1.0);

  // Shadow mapping
  if (u_shadowMapEnabled == 1) {
    vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
    float currentDepth = projectedTexcoord.z + u_bias;

    bool inRange =
        projectedTexcoord.x >= 0.0 &&
        projectedTexcoord.x <= 1.0 &&
        projectedTexcoord.y >= 0.0 &&
        projectedTexcoord.y <= 1.0;

    // the 'r' channel has the depth values
    float projectedDepth = texture2D(u_projectedTexture, projectedTexcoord.xy).r;
    float shadowLight = (inRange && projectedDepth <= currentDepth) ? 0.0 : 0.7;

    // Apply the light intensity to the shadow light
    float light = max(dot(normal, u_reverseLightDir), 0.0);
    // finalColor = vec4(finalColor.rgb * light * shadowLight, finalColor.a);    
    finalColor.rgb = mix(finalColor.rgb * light, finalColor.rgb, shadowLight);
  }

  gl_FragColor = finalColor;
}