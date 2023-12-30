attribute float delay;
attribute float dist;

uniform float time;

void main() {
    vec3 displacement = normal * dist * 25. * mod(time+delay, 1.);
    vec3 vPosition = position + displacement;

    gl_PointSize = 8. - length(displacement) / 2.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
}
