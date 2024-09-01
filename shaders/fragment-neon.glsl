precision mediump float;

uniform vec3 u_neonColor;
uniform vec3 u_reverseLightDir;
uniform float u_bias;
uniform int u_shadowMapEnabled;
uniform sampler2D u_projectedTexture;

varying vec4 v_projectedTexcoord;
varying vec3 v_normal;

void main() {
    // Normalize coordinates to [0, 1] range
    // Here it is assumed that the resolution is 1000x1000
    // TODO: Make it dynamic
    vec2 st = gl_FragCoord.xy / vec2(1000.0, 1000.0);
    
    vec2 center = vec2(0.5, 0.5);
    
    // Euclidean distance from center
    float dist = distance(st, center);
    
    // Create a soft circular glow, gradual falloff from center 0.0 to 0.5
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    
    vec3 color = u_neonColor * glow;
    
    // Add a brighter core, gradual falloff from center 0.1 to 0.0
    color += vec3(1.0, 0.8, 0.8) * smoothstep(0.1, 0.0, dist);

    // From https://webglfundamentals.org/webgl/lessons/webgl-shadows.html shadow mapping
    if (u_shadowMapEnabled == 1) {
        vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
        float currentDepth = projectedTexcoord.z + u_bias;

        bool inRange =
            projectedTexcoord.x >= 0.0 &&
            projectedTexcoord.x <= 1.0 &&
            projectedTexcoord.y >= 0.0 &&
            projectedTexcoord.y <= 1.0;

        float projectedDepth = texture2D(u_projectedTexture, projectedTexcoord.xy).r;
        float shadowLight = (inRange && projectedDepth <= currentDepth) ? 0.0 : 1.0;
        vec3 normal = normalize(v_normal);
        float light = max(dot(normal, u_reverseLightDir), 0.0);
        color = mix(color, color * light, shadowLight);
    }

    gl_FragColor = vec4(color, 1.0);
}