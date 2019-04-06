attribute vec3 direction;
attribute float delay;
attribute float speed;
attribute float size;
attribute float angle;
attribute vec3 axisRotation;
uniform float time;
varying vec4 vLastPosition;
varying float depth;

const float PI=3.1415926535897932384626433832795;
const float r=20.;
const float powerRotation=10.;
const float powerRotationGlobal=1.;// impact direction of the rotation
const vec3 axisRotationGlobal=vec3(-1.,0.,0.);
const float angleRotationGlobal=(PI/2.)*powerRotationGlobal;

// cosinus hyperbolic => check hyperbolic geometry, a non-Euclidean geometry
float cosh(float x)
{
    return exp(x)+exp(-x)/2.;
}

// tangente hyperbolic
float tanh(float x)
{
    return(exp(x)-exp(-x))/exp(x)+exp(-x);
}

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
void main()
{
    // float updateTime=((time-delay)*.05)*speed*2.;
    float updateTime=((time-delay))*speed;
    
    float sz=15./2.;
    float cxy=100./2.;
    float cz=cxy*sz;
    
    float hxy=PI/cxy;
    float hz=PI/cz;
    
    float rxy=r/cosh(hz);
    float x=rxy*cos(hxy);
    float y=rxy*sin(hxy);
    float timePositionZModifier=mod((time+(delay*2.)*speed)*.1,1.);
    // float timePositionZModifier=mod((time+(delay*2.)*10.*(speed/10.))*.1,1.);
    float z=(r*(tanh(hz)+40.))*timePositionZModifier;
    // float z=(r*(tanh(hz)+20.))*timePositionZModifier;
    
    vec3 dPosition=vec3(x,y,z)+direction;
    
    // rotation
    float angleRotation=angle*powerRotation*(updateTime/2.);
    mat4 rotation=rotationMatrix(axisRotation,angleRotation);
    
    // rotation curve
    mat4 rotationGlobal=rotationMatrix(axisRotationGlobal,angleRotationGlobal);
    
    // substract position before rotation to rotate from the center
    vec4 lastPosition=(vec4(dPosition,1.)-vec4(position,1.))*rotation;
    // add position to restores
    lastPosition=lastPosition+vec4(position,1.);
    lastPosition=lastPosition*rotationGlobal;
    
    vec4 mvPosition=modelViewMatrix*lastPosition;
    
    // gl_PointSize=10.;
    gl_PointSize=(size-(lastPosition.y-dPosition.y)/100.)*(300./-mvPosition.z);
    // float test = 20.;
    // gl_PointSize=size-lastPosition.y/20.;
    // gl_PointSize=(size)*(300./-mvPosition.z);
    
    depth=lastPosition.z;
    vLastPosition=lastPosition;
    gl_Position=projectionMatrix*mvPosition;
}
