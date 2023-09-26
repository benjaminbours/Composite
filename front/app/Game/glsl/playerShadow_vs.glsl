attribute vec3 direction;
attribute float delay;
attribute float speed;
attribute float size;
attribute float angle;
attribute vec3 axisRotation;
// attribute vec3 spherePosition;
attribute float selection;

uniform float time;
uniform float uPowerRotationGlobal;
uniform float uAngleGlobal;
uniform vec3 shadowLastPosition;

varying vec4 vLastPosition;
varying float depth;
varying vec4 vColor;
varying float vSelection;
varying vec3 vPosition;

varying vec3 a;

mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

void main(){

    const float PI = 3.1415926535897932384626433832795;
    float timeModifier = speed;
    float updateTime;
    updateTime = (time+delay * 2.0) * 0.05;
    updateTime = updateTime * timeModifier;
    float elapsedTime = updateTime;

    vec3 dPosition;
    vSelection = selection;

    // vec3 sphere = position + spherePosition;

    float rangeSelection = 512.0;

    float amplitudeY;
    float amplitudeYNormalized;
    float amplitudeX;
    float moduloY;
    float cosX;

    if (selection > rangeSelection) {

        dPosition = position;

        amplitudeY = 20.0 * (.5+delay) * 1.2;
        moduloY = mod( (time + delay * 10.0 * speed) * 0.1 ,1.0);
        dPosition.y = amplitudeY * moduloY;

        amplitudeYNormalized = dPosition.y / amplitudeY ;
        amplitudeX = 5.0 * (1.5 - amplitudeYNormalized * .5) * speed * 1.2;

        cosX = cos(time + PI * 10.0 * delay);

         dPosition.x = amplitudeX * cosX;
         vPosition = dPosition;

    } else {
        dPosition = position;
    }

    vec3 axisRotationGlobal = vec3(1.0,1.0,1.0);


    // rotation
    float powerRotation = 10.0;
    float angleRotation = angle * powerRotation * (updateTime * 1.5);
    mat4 rotation = rotationMatrix(axisRotationGlobal, angleRotation);

    float powerRotationGlobal = 100.0;
    float angleRotationGlobal = (PI / 2.0) * powerRotationGlobal * (updateTime * 0.10);
    mat4 rotationGlobal = rotationMatrix(axisRotation, angleRotationGlobal);

    vec4 lastPosition;
    if (selection > rangeSelection) {
        lastPosition = vec4(dPosition, 1.0);
        lastPosition = lastPosition * rotationGlobal;

    } else {
        lastPosition = vec4(dPosition, 1.0) * rotation;
    }


    vec4 objectPosition = modelMatrix * vec4(0.,0.,0., 1.0);

    vec3 distance = objectPosition.xyz - shadowLastPosition;

    lastPosition = vec4(lastPosition.xyz - distance * length(lastPosition/10.) , 1.0);


    // vec4 mvPosition = modelViewMatrix * vec4(dPosition, 1.0);
    vec4 mvPosition = modelViewMatrix * lastPosition;


    if (selection > rangeSelection) {
        gl_PointSize = size * (1.0 - moduloY);

    } else {
        gl_PointSize =  size * ( 300.0 / -mvPosition.z );

    }

    depth = lastPosition.z;
    vLastPosition = lastPosition;
    gl_Position = projectionMatrix * mvPosition;

}
