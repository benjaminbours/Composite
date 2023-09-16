attribute vec3 direction;
attribute float delay;
attribute float angleRotation;
attribute float speed;
attribute float size;
attribute vec3 axisRotation;
uniform float time;
uniform float organicRatioShadow;
uniform float organicRatioLight;
varying vec4 color;

const float PI = 3.1415926535897932384626433832795;
const float particlesNumber = 1000.;
const float powerRotation = 10.;

mat4 rotationMatrix(vec3 axis,float angle)
{
    axis=normalize(axis);
    float s=sin(angle);
    float c=cos(angle);
    float oc=1.-c;
    return mat4(oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.,
        oc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.,
        oc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.,
    0.,0.,0.,1.);
}

vec2 getCircleCoordinates(float radius, float angle, vec2 origin) {
    return origin + vec2(radius * cos(angle), radius * sin(angle));
}

vec2 getShapeCoordinates(float indexNormalized, float time, float delay, float direction) {
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

vec3 getSphereCoordinates(float radius, float angle, float angle2, vec3 origin) {
    float x = radius * sin(angle) * cos(angle2);
    float y = radius * sin(angle) * sin(angle2);
    float z = radius * cos(angle);
    return origin + vec3(x, y, z);
}

void main() {
    float index = float(gl_VertexID);
    float halfParticlesNumber = particlesNumber / 2.;

    float computedTime = time * speed - delay;

    mat4 rotation = rotationMatrix(axisRotation, angleRotation * powerRotation * (computedTime / 20.));

    float angle = computedTime * PI;
    float angle2 = computedTime * PI / 3.;
    vec3 origin = vec3(0., 150., 0.);
    float radius = distance(direction, origin);
    vec3 coordinates = getSphereCoordinates(radius, angle, angle2, origin);
    vec4 dPosition = vec4(coordinates, 1.0);
    dPosition = (dPosition - vec4(origin, 1.)) * rotation;
    dPosition = dPosition + vec4(origin, 1.);

    if(index < halfParticlesNumber) {
        vec4 shapeCoordinates = vec4(getShapeCoordinates(index / halfParticlesNumber, time, delay, 1.), 0., 1.0);
        float dist = distance(dPosition, shapeCoordinates) * organicRatioShadow;
        // interpolation
        vec4 normalizedVector = normalize(shapeCoordinates - dPosition);
        dPosition = dPosition + dist * normalizedVector;
        color = vec4(0., 0., 0., 1.);
    } else {
        vec4 shapeCoordinates = vec4(getShapeCoordinates((index - halfParticlesNumber) / halfParticlesNumber, time, delay, -1.), 0., 1.0);
        float dist = distance(dPosition, shapeCoordinates) * organicRatioLight;
        // interpolation
        vec4 normalizedVector = normalize(shapeCoordinates - dPosition);
        dPosition = dPosition + dist * normalizedVector;
        color = vec4(1., 1., 1., 1.);
    }

    // assign values that will be useful in fragment shader
    gl_PointSize = size - abs(radius *  0.002);
    gl_Position = projectionMatrix * modelViewMatrix * dPosition;
}
