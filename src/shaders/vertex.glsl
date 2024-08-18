attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;

varying vec3 v_position;
varying vec3 v_normal;
varying vec2 v_texCoord;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_modelViewTranspose;

void main()
{
    vec4 v_position4 = u_view * u_model * a_position;
    v_position = vec3(v_position4) / v_position4.w;
    
    v_normal = vec3(u_modelViewTranspose * vec4(a_normal, 0.0));
    v_texCoord = a_texCoord;

    gl_Position = u_projection * u_view * u_model * a_position;
}