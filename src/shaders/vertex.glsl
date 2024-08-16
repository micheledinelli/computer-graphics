attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;

varying float v_brightness;
varying vec2 v_texCoord;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_inverseTranspose;

uniform vec3 u_lightDirection;

void main()
{
    v_brightness = max(dot(u_lightDirection, normalize(mat3(u_inverseTranspose) * a_normal)), 0.0);
    gl_Position = u_projection * u_view * u_model * a_position;

    v_texCoord = a_texCoord;
}