attribute vec3 direction;
attribute float delay;
attribute float speed;
attribute float size;
uniform float time;
uniform float organicRatio;
varying vec3 color;

const float PI = 3.1415926535897932384626433832795;

/**
Archimedes spiral equation
r = a + b * θ

Polar coordinates are (r, θ)

parameters:
a moves the centerpoint of the spiral outward from the origin (positive a toward θ = 0 and negative a toward θ = π )
b control the distance between loops
θ the angle
**/

const float particlesNumber = 700.;

void main() {
    float halfParticlesNumber = particlesNumber / 2.;
    float index = float(gl_VertexID);
    float a = PI;
    float b = 5.;
    float angle = (time * speed - delay) * PI * -1.;
    angle = mod(angle, 19.);
    float radius = a + b * angle;

    // 2d coordinates
    float x = cos(angle) * radius;
    float y = sin(angle) * radius;

    // deformation to be less perfect / geometric
    x += direction.x * organicRatio;
    y += direction.y * organicRatio;

    // 3d coordinates
    float z = y;
    y = 100. - radius + direction.z * organicRatio;

    vec4 dPosition = vec4(x, y, z, 1.0);

    if(index < halfParticlesNumber) {
        color = vec3(0., 0., 0.);
    } else {
        color = vec3(1., 1., 1.);
    }

    vec4 mvPosition = modelViewMatrix * dPosition;
    gl_Position = projectionMatrix * mvPosition;

    float depth = -mvPosition.z;
    float pointSize = size - abs(dPosition.y * 60.);
    gl_PointSize = pointSize / depth;
}
