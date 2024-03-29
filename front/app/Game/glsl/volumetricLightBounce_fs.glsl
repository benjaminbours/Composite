varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform vec2 lightPosition;
uniform float exposure;
uniform float decay;
uniform float density;
uniform float weight;
uniform int samples;
uniform float time;
uniform bool isInteractive;
const int MAX_SAMPLES = 100;

void main() {
    vec2 texCoord = vUv;
    vec2 deltaTextCoord = texCoord - lightPosition;
    float timeMod = 2. + cos(time * 2.) / 3.;
    deltaTextCoord *= 1. / float(samples) * density;

    if(isInteractive) {
        deltaTextCoord *= timeMod;
    }

    vec4 color = texture2D(tDiffuse, texCoord);
    float illuminationDecay = 1.0;

    for(int i = 0; i < MAX_SAMPLES; i++) {
        if(i == samples) {
            break;
        }
        texCoord -= deltaTextCoord;
        vec4 sampleFixed = texture2D(tDiffuse, texCoord);
        sampleFixed *= illuminationDecay * weight;
        if(isInteractive) {
            sampleFixed *= timeMod;
        }
        color += sampleFixed;
        illuminationDecay *= decay;
    }
    gl_FragColor = color * exposure;
}