attribute vec3 direction;
attribute float delay;
attribute float speed;
attribute float size;
uniform float time;
uniform float organicRatio;
varying vec4 color;

const float PI = 3.1415926535897932384626433832795;
const float particlesNumber = 1000.;

vec2 getCircleCoordinates(float radius, float angle, vec2 origin) {
    return origin + vec2(radius * cos(angle), radius * sin(angle));
}

vec2 getHalfCoordinates(float indexNormalized, float time, float delay, float direction) {
    // PI / 2 = 90 degrees on unit circle
    // PI = 180 degrees on unit circle
    // 3 * PI / 2 = 270 degrees on unit circle
    float timeModifier = time * 0.5 - delay;
    float gap = PI;
    float mainRadius = 100.;
    float halfRadius = 50.;
    float smallRadius = 12.5;
    vec2 mainOrigin = vec2(0., 150.);
    float maximum = 2. * PI;
    float angle = mod(timeModifier * PI, maximum) * direction;
    vec2 coordinates = getCircleCoordinates(mainRadius, angle, mainOrigin);

    if (indexNormalized < 0.1) {
        if (direction > 0.) {
            vec2 origin = vec2(0., -50.) + mainOrigin;
            coordinates = getCircleCoordinates(smallRadius, angle, origin);
        } else {
            vec2 origin = vec2(0., 50.) + mainOrigin;
            coordinates = getCircleCoordinates(smallRadius, angle, origin);

        }
    } else {
        // select the top left quadrant of the circle
        if (direction > 0. && angle > PI / 2. && angle < PI) {
            // add gap to flip by 180 degrees
            // multiply time modifier by 2 * PI to extend from quarter of circle to half circle
            // substract by PI / 2 to rotate
            angle = gap + mod((timeModifier * 2. * PI - PI / 2.) * -direction, maximum);
            vec2 origin = vec2(0., 50.) + mainOrigin;
            coordinates = getCircleCoordinates(halfRadius, angle, origin);
        // select the bottom left quadrant of the circle
        } else if (direction > 0. && angle > PI && angle < 3. * PI / 2.) {
            angle = gap + mod((timeModifier * 2. * PI - PI / 2.) * direction, maximum);
            vec2 origin = vec2(0., -50.) + mainOrigin;
            coordinates = getCircleCoordinates(halfRadius, angle, origin);
        // select the top right quadrant of the circle
        } else if (direction < 0. && -angle < PI / 2. && -angle > 0.) {
            angle = mod((timeModifier * 2. * PI - PI / 2.) * direction, maximum);
            vec2 origin = vec2(0., 50.) + mainOrigin;
            coordinates = getCircleCoordinates(halfRadius, angle, origin);
        // select the bottom right quadrant of the circle
        } else if (direction < 0. && -angle > 3. * PI / 2. && -angle < maximum) {
            angle = mod((timeModifier * 2. * PI - PI / 2.) * -direction, maximum);
            vec2 origin = vec2(0., -50.) + mainOrigin;
            coordinates = getCircleCoordinates(halfRadius, angle, origin);
        }

    }

    return coordinates;
}

void main() {
    float index = float(gl_VertexID);
    float halfParticlesNumber = particlesNumber / 2.;

    vec4 dPosition;
    if(index < halfParticlesNumber) {
        dPosition = vec4(getHalfCoordinates(index / halfParticlesNumber, time, delay, 1.), 0., 1.0);
        color = vec4(0., 0., 0., 1.);
    } else {
        dPosition = vec4(getHalfCoordinates((index - halfParticlesNumber) / halfParticlesNumber, time, delay, -1.), 0., 1.0);
        color = vec4(1., 1., 1., 1.);
    }

    // assign values that will be useful in fragment shader
    gl_PointSize = 10.;
    gl_Position = projectionMatrix * modelViewMatrix * dPosition;
}
