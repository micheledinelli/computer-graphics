attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_texcoord;
attribute vec3 a_tangent;
attribute vec3 a_color;

varying vec3 v_position;
varying vec3 v_normal;
varying vec2 v_texcoord;
varying vec3 v_tangent;
varying vec4 v_color;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_modelViewTranspose;

void main()
{
    vec4 v_position4 = u_view * u_model * a_position;
    v_position = vec3(v_position4) / v_position4.w;
    
    // v_normal = vec3(u_modelViewTranspose * vec4(a_normal, 0.0));
    
    mat3 normalMat = mat3(u_modelViewTranspose);
    v_normal = normalize(normalMat * a_normal);
    v_tangent = normalize(normalMat * a_tangent);
    v_texcoord = a_texcoord;
    v_color = vec4(a_color, 1.0);

    gl_Position = u_projection * u_view * u_model * a_position;
}