attribute vec3 direction;
attribute float delay;
attribute float speed;
attribute float size;
attribute float angle;
attribute vec3 axisRotation;
uniform float time;
varying vec4 vLastPosition;

const float PI = 3.1415926535897932384626433832795;
const float r = 20.;
const float powerRotation = 10.;
const float powerRotationGlobal = 1.;// impact direction of the rotation
const vec3 axisRotationGlobal = vec3(-1., 0., 0.);
const float angleRotationGlobal = (PI / 2.) * powerRotationGlobal;

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

// z axis is the height
void main() {
    float updateTime= (time-delay) * speed;
    
    float sz = 15./2.;
    float cxy = 100./2.;
    float cz = cxy * sz;
    
    float hxy = PI / cxy;
    float hz = PI / cz;
    
    float rxy = r / cos(hz);
    float x = rxy * cos(hxy);
    float y = rxy * sin(hxy);
    // mod stand for modulo
    float cyclePosition = mod((time + (delay * 2.0) * speed) * 0.1, 1.0);
    float z = (r * (tan(hz) + 20.)) * cyclePosition;
    
    vec3 dPosition = vec3(x,y,z) + direction;
    
    // rotation
    float angleRotation = angle * powerRotation * (updateTime / 2.);
    mat4 rotation = rotationMatrix(axisRotation, angleRotation);
    
    // TODO: Code could be done vertically directly no? Why this rotation
    // this rotation make the flux of particles vertical instead of horizontal
    mat4 rotationGlobal = rotationMatrix(axisRotationGlobal, angleRotationGlobal);
    
    vec4 lastPosition = vec4(dPosition, 1.);
    // substract position before rotation to rotate from the center
    lastPosition = (lastPosition - vec4(position, 1.)) * rotation;
    // // restore position
    lastPosition = lastPosition + vec4(position, 1.);
    lastPosition = lastPosition * rotationGlobal;
    
    vec4 mvPosition = modelViewMatrix * lastPosition;
    
    // assign values that will be useful in fragment shader
    vLastPosition = lastPosition;
    gl_PointSize = size - lastPosition.y * 0.02;
    gl_Position = projectionMatrix * mvPosition;
}
