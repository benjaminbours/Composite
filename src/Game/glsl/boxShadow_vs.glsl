attribute float delay;
attribute float distance;

uniform float time;

varying vec2 vUv;

void main() {

    vec3 vPosition = position;
    vec3 displacement = vec3(0.);

    // if (selection == 1.) {
    displacement = normal * distance * 20. * mod(time+delay, 1.);
    // }

    vPosition += displacement;

    gl_PointSize = 8. - length(displacement) / 2.5;

    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );

}
