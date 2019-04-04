import {
    Object3D,
    Vector3,
    BufferGeometry,
    BufferAttribute,
    ShaderMaterial,
    AdditiveBlending,
    DoubleSide,
    Points,
    Clock,
    RectAreaLight,
    RectAreaLightHelper,
} from "three";
import { getRange, degreesToRadians } from "../helpers";
import { putMeshOnGrid } from "../Mesh/Grid";

const clock = new Clock();

export class MysticPlace extends Object3D {
    private particles: Points;

    constructor(particlesNumber: number, position?: Vector3) {
        super();

        // When particlesNumber is multiply by 3, it's because it's an array of vector3 instead of simple floats
        const particlesGeo = new BufferGeometry();
        const particlesVertices = new Float32Array(particlesNumber * 3);
        const particlesDirection = new Float32Array(particlesNumber * 3);
        const particlesDelay = new Float32Array(particlesNumber);
        const particlesSpeed = new Float32Array(particlesNumber);
        const particlesAxisRotation = new Float32Array(particlesNumber * 3);
        const particlesAngle = new Float32Array(particlesNumber);
        const particlesSize = new Float32Array(particlesNumber);

        for (let i = 0; i < particlesVertices.length; i = i + 3) {
            // const element = particlesVertices[i];
            const directionRange = new Vector3(60.0, 40.0, 20.0);
            particlesDirection[i] = getRange(-directionRange.x, directionRange.x);
            particlesDirection[i + 1] = getRange(-directionRange.y, directionRange.y);
            particlesDirection[i + 2] = getRange(-directionRange.z, directionRange.z);

            particlesVertices[i] = 0.0;
            particlesVertices[i + 1] = 0.0;
            particlesVertices[i + 2] = 0.0;

            particlesDelay[i / 3] = getRange(0, 50);
            particlesSpeed[i / 3] = getRange(0.05, 0.2);

            particlesAxisRotation[i] = 0; // x
            particlesAxisRotation[i + 1] = 0; // y
            particlesAxisRotation[i + 2] = 1; // z

            particlesAngle[i / 3] = getRange(1, Math.PI);
            particlesSize[i / 3] = getRange(5.0, 15.0);
        }

        particlesGeo.addAttribute("position", new BufferAttribute(particlesVertices, 3));
        particlesGeo.addAttribute("direction", new BufferAttribute(particlesDirection, 3));
        particlesGeo.addAttribute("delay", new BufferAttribute(particlesDelay, 1));
        particlesGeo.addAttribute("speed", new BufferAttribute(particlesSpeed, 1));
        particlesGeo.addAttribute("axisRotation", new BufferAttribute(particlesAxisRotation, 3));
        particlesGeo.addAttribute("angle", new BufferAttribute(particlesAngle, 1));
        particlesGeo.addAttribute("size", new BufferAttribute(particlesSize, 1));

        const particlesMat = new ShaderMaterial({
            uniforms: {
                time: { type: "f", value: 0.0 },
                opacity: { type: "f", value: 0.5 },
                powerRotationGlobal: { type: "f", value: getRange(0, 10) },
                angleGlobal: { type: "f", value: getRange(1, Math.PI) },
            },
            vertexShader: VS,
            fragmentShader: FS,
            blending: AdditiveBlending,
            side: DoubleSide,
            transparent: true,
        });

        this.particles = new Points(particlesGeo, particlesMat);
        this.add(this.particles);

        const width = 100;
        const height = 150;
        const rectLight = new RectAreaLight( 0xffffff, undefined,  width, height );
        rectLight.intensity = 50000;
        rectLight.position.set(0, 10, 0);
        // rectLight.rotation.set(degreesToRadians(90), 0, degreesToRadians(180));
        this.add(rectLight);
        // const helper = new RectAreaLightHelper(rectLight);
        // rectLight.add(helper as any);

        putMeshOnGrid(this, new Vector3(1, 0, 0));
    }

    public render = () => {
        const delta = clock.getDelta();
        const particlesMat = this.particles.material as ShaderMaterial;
        particlesMat.uniforms.time.value += delta * 2;
    }
}

const VS = `
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
    float speed2 = speed*2.0;
    float updateTime;
    updateTime = (time-delay) * 0.05;
    updateTime = updateTime * speed2;
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
         float z = (r * (tanh(lz)+ 20.0)) * timePositionZModifier;

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

    vec4 mvPosition = modelViewMatrix * lastPosition;

    gl_PointSize =  (size - (lastPosition.y - dPosition.y) / 10.0 ) * ( 300.0 / -mvPosition.z );

    depth = lastPosition.z;
    vLastPosition = lastPosition;
    gl_Position = projectionMatrix * mvPosition;

}
`;

const FS = `
uniform float opacity;
varying float depth;
varying vec4 vLastPosition;


void main(){
    vec4 lastPosition = vLastPosition;
    vec2 position = gl_PointCoord - vec2(.5,.5);
    float r = sqrt(dot(position*2.0, position*2.0));
    float nDepth = abs(depth);
    r = 1.0-r;
    if (r > 0.0){
        gl_FragColor = vec4((vLastPosition.x / 500.0)+1.0,(vLastPosition.y / 500.0)+1.0,(vLastPosition.z / 500.0)+1.0,((r * (2.3 - nDepth/500.0))*opacity));


    } else {
        discard;
    }

    if(lastPosition.y < 0.0) {

        discard;

    }

}
`;
