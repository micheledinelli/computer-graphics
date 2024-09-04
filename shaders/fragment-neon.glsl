precision mediump float;

uniform vec3 u_neonColor;

void main() {
    // Normalize coordinates to [0, 1] range
    // Here it is assumed that the resolution is 1000x1000
    vec2 st = gl_FragCoord.xy / vec2(1000.0, 1000.0);
    
    vec2 center = vec2(0.5, 0.5);
    
    // Euclidean distance from center
    float dist = distance(st, center);
    
    // Create a soft circular glow, gradual falloff from center 0.0 to 0.5
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    
    vec3 color = u_neonColor * glow;
    
    // Add a brighter core, gradual falloff from center 0.1 to 0.0
    color += vec3(1.0, 0.8, 0.8) * smoothstep(0.1, 0.0, dist);

    gl_FragColor = vec4(color, 1.0);
}