attribute vec3 direction;
attribute float delay;
attribute float speed;
attribute float size;
attribute float angle;
attribute vec3 axisRotation;
uniform float time;
uniform float uPowerRotationGlobal;
uniform float uAngleGlobal;
varying vec4 vLastPosition;
varying float depth;

float cosh(float x)
{
     return exp(x) + exp(-x) / 2.0;
}

float tanh(float x)
{
    return (exp(x) - exp(-x)) / exp(x) + exp(-x);
}
//    varying float vSelection;
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
    updateTime = (time-delay) * 0.05;
    updateTime = updateTime * timeModifier;
    float elapsedTime = updateTime;

    vec3 dPosition = position;
    //
    float sz = 15.0 / 2.0;
    float cxy = 100.0 / 2.0;
    float cz = cxy * sz;

    float hxy = PI / cxy;
    float hz = PI / cz;

    float r = 20.0;

    const float index = 1500.0 / 2.0;

    float delay2 = delay * 2.0;

    for (float i = -index; i < index ; i++) {

         float lxy = i * hxy;
         float lz = i * hz;
         float rxy = r / cosh(lz);
         float x = rxy * cos(lxy);
         float y = rxy * sin(lxy);
         float timePositionZModifier = mod((time + delay2 * 10.0 * (speed / 10.0)) * 0.1 ,1.0);
         float z = r * (tanh(lz)+20.0) * timePositionZModifier;
         dPosition = vec3(x, y, z);

    }


    dPosition = dPosition + direction;
    // rotation
    float powerRotation = 10.0;
    float angleRotation = angle * powerRotation * (updateTime * 1.5);
    mat4 rotation = rotationMatrix(axisRotation, angleRotation);

    // rotation curve
    vec3 axisRotationGlobal = vec3(-1.0,0.0,0.0);
    float powerRotationGlobal = 1.0;
    float angleRotationGlobal = (PI / 2.0) * powerRotationGlobal;
    mat4 rotationGlobal = rotationMatrix(axisRotationGlobal, angleRotationGlobal);

    vec4 lastPosition = (vec4(dPosition, 1.0) - vec4(position, 1.0)) * rotation;
    lastPosition = lastPosition + vec4(position, 1.0);
    lastPosition = lastPosition * rotationGlobal;

 //    if(lastPosition.y < 10.0) {
    //
 //         // dPosition.z = dPosition.z / timePositionZModifier;
 //         updateTime = 0.0;
    //
 //    } else {
 //
 //    }

    vec4 mvPosition = modelViewMatrix * lastPosition;

    gl_PointSize =  (size - (lastPosition.y - dPosition.y) / 10.0 ) * ( 300.0 / -mvPosition.z );
 //    gl_PointSize =  size;

    depth = lastPosition.z;
    vLastPosition = lastPosition;
    gl_Position = projectionMatrix * mvPosition;

}
