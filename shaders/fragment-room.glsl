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

uniform float shininess;
uniform vec3 emissive;
uniform vec3 ambient;
uniform vec3 diffuse;
uniform vec3 specular;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float Ka;
uniform float Kd;
uniform float Ks;

uniform vec3 u_neonPosition;
uniform vec3 u_neonColor;
uniform float u_neonIntensity;
uniform float u_neonRadius;
uniform vec3 u_cameraPosition;

uniform int u_shadowMapEnabled;
uniform float u_bias;
uniform vec3 u_reverseLightDir;

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

    vec3 baseColor = vec4(emissive +
                        Ka * effectiveAmbient +
                        Kd * attenuatedDiffuse +
                        Ks * attenuatedSpecular, 1.0).rgb;

     // Calculate vector from fragment to neon
    vec3 fragToNeon = u_neonPosition - v_position;
    float distanceToNeon = length(fragToNeon);
    
    // Normalize vectors
    vec3 normalizedFragToNeon = normalize(fragToNeon);
    vec3 normalizedNormal = normalize(v_normal);
    
    // Determine if this is the front face of the wall
    vec3 viewDir = normalize(u_cameraPosition - v_position);
    float facingViewer = dot(normalizedNormal, viewDir);
    
    // Only apply neon effect if this is the front face and facing the neon
    if (facingViewer > 0.0 && dot(normalizedNormal, normalizedFragToNeon) > 0.0) {
        // Create a circular glow
        float glow = smoothstep(u_neonRadius, 0.0, distanceToNeon);
        glow = pow(glow, 2.0); // Sharpen the glow falloff
        
        // Add the glow to the base color
        vec3 neonContribution = u_neonColor * u_neonIntensity * glow;
        baseColor += neonContribution;
    }

    // Shadow mapping
    // Only apply shadow mapping if this is the front face and facing the light
    if (facingViewer > 0.0 && dot(normalizedNormal, L) > 0.0 && u_shadowMapEnabled == 1) {
        vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
        float currentDepth = projectedTexcoord.z + u_bias;

        bool inRange =
            projectedTexcoord.x >= 0.0 &&
            projectedTexcoord.x <= 1.0 &&
            projectedTexcoord.y >= 0.0 &&
            projectedTexcoord.y <= 1.0;

        float projectedDepth = texture2D(u_projectedTexture, projectedTexcoord.xy).r;
        float shadowLight = (inRange && projectedDepth <= currentDepth) ? 0.0 : 1.0;
        
        float light = max(dot(normal, u_reverseLightDir), 0.0);

        baseColor.rgb = mix(baseColor.rgb * light, baseColor.rgb, shadowLight);
    }

    gl_FragColor = vec4(baseColor, 1.0);
}