attribute float delay;
attribute float dist;

uniform float time;

void main() {
    vec3 displacement = normal * dist * 25. * mod(time + delay, 1.);
    vec3 vPosition = position + displacement;

    vec4 mvPosition = modelViewMatrix * vec4(vPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float depth = -mvPosition.z;
    float pointSize = 8. - length(displacement) / 2.5;
    gl_PointSize = (pointSize * 1000.) / depth;
}
